import json
import logging
from pydantic import ValidationError

from exceptions import AnalysisError, InvalidLLMResponseError
from models import LiteratureReviewResponse
from providers.base import LLMProvider
from services.retrieval_service import RetrievalService

logger = logging.getLogger(__name__)

LITERATURE_REVIEW_SYSTEM_PROMPT = """
You are a senior AI research reviewer and academic writer with deep expertise in computer science literature critique. Your goal is to write a comprehensive, coherent literature review that synthesizes multiple research papers.

The output must read like the "Related Work" section of a top-tier computer science conference paper. It must synthesize ideas across papers thematically rather than presenting separate summaries of each document.

You must cover these dimensions in your review:
1. Overview of the research area
2. Major themes
3. Methodology trends
4. Strengths across the literature
5. Limitations across the literature
6. Research trends
7. Open challenges
8. Future directions

Respond ONLY in this exact JSON format with no extra text outside the JSON:
{
  "overview": "string",
  "major_themes": "string",
  "methodology_trends": "string",
  "strengths": "string",
  "limitations": "string",
  "research_trends": "string",
  "open_challenges": "string",
  "future_directions": "string",
  "generated_literature_review": "string"
}

Instructions for JSON values:
- "overview": Introduction to the research area, defining the field, subfield, and main thematic paradigms.
- "major_themes": Synthesized list and explanation of major research themes and priorities.
- "methodology_trends": Identify technical trends in model designs, pipelines, training strategies, and architectures across the papers.
- "strengths": Synthesized technical strengths and advantages across the collective literature.
- "limitations": Synthesized weaknesses, constraints, and assumptions across the collective literature.
- "research_trends": Evolution and trends observed in problem formulations, methods, and evaluation practices over time.
- "open_challenges": Unresolved research problems, gaps, or difficulties.
- "future_directions": Future research directions for the field.
- "generated_literature_review": A fully written, cohesive "Related Work" review section. Group papers by theme, merge similar concepts, highlight trade-offs and complementary approaches, and write in a formal academic tone. Do NOT list or discuss papers separately in isolation; integrate them into a synthesized narrative.

Be factual and grounded strictly in the provided paper context. Avoid making unsupported assertions.
"""


class LiteratureReviewService:
    def __init__(self, retrieval_service: RetrievalService, llm_provider: LLMProvider) -> None:
        self._retrieval_service = retrieval_service
        self._llm_provider = llm_provider

    def generate_review(self, document_ids: list[str]) -> LiteratureReviewResponse:
        logger.info("Starting literature review generation for %d documents", len(document_ids))

        # 1. Validation
        if not document_ids or len(document_ids) < 2:
            logger.warning("Literature review request rejected: requires at least two documents, got %d", len(document_ids))
            raise ValueError("Literature review generation requires at least two documents.")

        # 2. Retrieve relevant chunks for each document independently
        # Cover review dimensions in query_text
        query_text = "research domain methodology model architecture datasets key contributions strengths weaknesses future work trends challenges"

        compiled_contexts = []
        for doc_id in document_ids:
            logger.info("Retrieving literature review chunks for document %s", doc_id)
            chunks = self._retrieval_service.retrieve(
                query_text=query_text,
                top_k=5,
                document_id=doc_id,
            )

            if not chunks:
                logger.warning("Document with ID %s has no chunks or does not exist.", doc_id)
                raise ValueError(f"Document with ID {doc_id} has no chunks or does not exist.")

            doc_context_parts = []
            for chunk in chunks:
                section = chunk.metadata.get("section") or "Unknown"
                page = chunk.metadata.get("page_number") or chunk.page_start
                doc_context_parts.append(
                    f"[Document: {doc_id}] [Section: {section}] [Page: {page}]\n{chunk.text}"
                )

            compiled_contexts.append(
                f"--- BEGIN CONTEXT FOR DOCUMENT: {doc_id} ---\n"
                + "\n\n".join(doc_context_parts)
                + f"\n--- END CONTEXT FOR DOCUMENT: {doc_id} ---"
            )

        combined_context = "\n\n=========================================\n\n".join(compiled_contexts)

        # 3. Call LLM Provider
        try:
            response_text = self._llm_provider.generate(LITERATURE_REVIEW_SYSTEM_PROMPT, combined_context)
        except Exception as exc:
            logger.error("LLM literature review generation failed: %s", str(exc), exc_info=True)
            raise AnalysisError("Failed to generate literature review critique.") from exc

        # 4. Parse LLM JSON Response
        try:
            data = json.loads(response_text)
            return LiteratureReviewResponse(**data)
        except (json.JSONDecodeError, ValidationError) as exc:
            logger.error("LLM returned an invalid response structure for literature review: %s", str(exc), exc_info=True)
            raise InvalidLLMResponseError("The LLM returned a malformed or invalid literature review critique.") from exc

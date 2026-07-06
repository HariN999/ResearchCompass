import json
import logging
from pydantic import ValidationError

from exceptions import AnalysisError, InvalidLLMResponseError
from models import ComparisonResponse
from providers.base import LLMProvider
from services.retrieval_service import RetrievalService

logger = logging.getLogger(__name__)

COMPARISON_SYSTEM_PROMPT = """
You are a senior AI research reviewer with deep expertise in computer science, NLP, machine learning, and interdisciplinary research. You critically evaluate and compare multiple academic papers.

Your objective is to produce a structured, comparative analysis of the provided research papers using the retrieved context blocks. Do NOT simply concatenate separate reviews. Instead, synthesize their relationships, similarities, and differences.

You must compare the papers across these core dimensions:
1. Research domain and subfield
2. Core problem statement
3. Methodology and models
4. Datasets and benchmarks
5. Evaluation metrics
6. Key contributions
7. Strengths
8. Weaknesses
9. Future work

Respond ONLY in this exact JSON format with no extra text outside the JSON:
{
  "executive_comparison": "string",
  "similarities": "string",
  "differences": "string",
  "methodology_comparison": "string",
  "dataset_comparison": "string",
  "strength_comparison": "string",
  "weakness_comparison": "string",
  "overall_recommendation": "string"
}

Instructions for JSON values:
- "executive_comparison": A high-level synthesis (3-4 sentences) summarizing the main thematic connections and goals.
- "similarities": Outline common research goals, shared assumptions, and overlapping technical approaches.
- "differences": Contrast distinct approaches, architectural choices, trade-offs, and highlight what sets each paper apart.
- "methodology_comparison": Deep comparison of model designs, pipelines, training strategies, and complementary methodologies.
- "dataset_comparison": Compare benchmarks, dataset limits, and evaluation metrics used to measure performance.
- "strength_comparison": Constructively summarize and contrast the technical strengths of each paper.
- "weakness_comparison": Constructively summarize and contrast the key weaknesses and limitations of each paper.
- "overall_recommendation": Recommend which paper or approach is best suited for specific research scenarios, deployments, or resource limits.

Be factual and grounded strictly in the provided paper context. Avoid making unsupported assertions.
"""


class ComparisonService:
    def __init__(self, retrieval_service: RetrievalService, llm_provider: LLMProvider) -> None:
        self._retrieval_service = retrieval_service
        self._llm_provider = llm_provider

    def compare_papers(self, document_ids: list[str]) -> ComparisonResponse:
        logger.info("Starting research paper comparison for %d documents", len(document_ids))

        # 1. Validation
        if not document_ids or len(document_ids) < 2:
            logger.warning("Comparison request rejected: requires at least two documents, got %d", len(document_ids))
            raise ValueError("Comparison requires at least two documents.")

        # 2. Retrieve relevant chunks for each document independently
        # Cover all requested comparison dimensions in query_text
        query_text = "research domain problem statement methodology datasets evaluation metrics key contributions strengths weaknesses future work"

        compiled_contexts = []
        for doc_id in document_ids:
            logger.info("Retrieving comparison chunks for document %s", doc_id)
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
            response_text = self._llm_provider.generate(COMPARISON_SYSTEM_PROMPT, combined_context)
        except Exception as exc:
            logger.error("LLM comparison generation failed: %s", str(exc), exc_info=True)
            raise AnalysisError("Failed to generate research paper comparison critique.") from exc

        # 4. Parse LLM JSON Response
        try:
            data = json.loads(response_text)
            return ComparisonResponse(**data)
        except (json.JSONDecodeError, ValidationError) as exc:
            logger.error("LLM returned an invalid response structure for comparison: %s", str(exc), exc_info=True)
            raise InvalidLLMResponseError("The LLM returned a malformed or invalid comparison critique.") from exc

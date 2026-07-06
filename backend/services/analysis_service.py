import json
import logging
from pydantic import ValidationError

from exceptions import AnalysisError, InvalidLLMResponseError, LLMProviderError
from models import AnalysisResponse
from providers.base import LLMProvider

logger = logging.getLogger(__name__)


SYSTEM_PROMPT = """
You are a senior AI research reviewer with deep expertise in computer science, NLP, machine learning, and interdisciplinary research. You critically and constructively evaluate academic research papers.

Given the provided text from a research paper, you must perform a complete analysis:

1. Identify the research domain and subfield precisely
2. Write a detailed executive summary (3-4 sentences)
3. Extract and articulate the core problem statement
4. Analyze the methodology deeply: datasets used, model architecture, training procedure, evaluation metrics, experimental design, baselines compared against
5. Assess novelty: what makes this work different from prior art, is the novelty incremental or significant
6. List all key contributions the paper claims or demonstrates
7. Identify specific research gaps — what the paper missed, ignored, oversimplified, or failed to address that future work should tackle
8. List technical strengths with reasoning
9. List technical weaknesses with reasoning
10. Suggest concrete implementation and code-level improvements a developer could actually make
11. Recommend specific future research directions with enough detail to act on
12. Generate exactly 5 tough viva/thesis defense questions a PhD committee would ask
13. Give a publication readiness score from 0 to 100 with detailed justification

Be specific, technical, and actionable. Never write vague generic statements. Think and respond like a PhD supervisor reviewing a student submission.

Respond ONLY in this exact JSON format with no extra text outside the JSON:
{
  "research_domain": "string",
  "executive_summary": "string",
  "problem_statement": "string",
  "methodology": "string",
  "key_contributions": ["string", "string"],
  "strengths": ["string", "string"],
  "weaknesses": ["string", "string"],
  "research_gaps": ["string", "string"],
  "novelty_assessment": "string",
  "implementation_improvements": ["string", "string"],
  "future_work": ["string", "string"],
  "viva_questions": ["string", "string", "string", "string", "string"],
  "publication_readiness_score": 72,
  "publication_readiness_justification": "string"
}
"""


class AnalysisService:
    def __init__(self, llm_provider: LLMProvider) -> None:
        self._llm_provider = llm_provider

    def analyze_paper(self, paper_text: str) -> AnalysisResponse:
        logger.info("Starting academic manuscript analysis (size: %d chars)", len(paper_text))
        try:
            response_text = self._llm_provider.generate(SYSTEM_PROMPT, paper_text)
        except LLMProviderError:
            # Let LLM provider errors propagate directly
            raise
        except Exception as exc:
            logger.error("LLM generation failed: %s", str(exc), exc_info=True)
            raise AnalysisError(f"Failed to analyze research paper: {exc}") from exc

        try:
            parsed = json.loads(response_text)
        except json.JSONDecodeError as exc:
            logger.error("LLM response is not valid JSON. Response received: %s", response_text, exc_info=True)
            raise InvalidLLMResponseError("Failed to analyze research paper: LLM response was not valid JSON.") from exc

        try:
            response_model = AnalysisResponse(**parsed)
            logger.info("Manuscript analysis successfully completed.")
            return response_model
        except ValidationError as exc:
            logger.error("LLM response failed schema validation. Parsed object: %s", str(parsed), exc_info=True)
            raise InvalidLLMResponseError("Failed to analyze research paper: LLM response did not pass schema validation.") from exc
        except Exception as exc:
            logger.error("Unexpected error parsing LLM response model: %s", str(exc), exc_info=True)
            raise AnalysisError(f"Failed to analyze research paper: {exc}") from exc


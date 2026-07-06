import json
import unittest

from providers.base import LLMProvider
from services.analysis_service import AnalysisService


VALID_ANALYSIS = {
    "research_domain": "Artificial Intelligence",
    "executive_summary": "Summary",
    "problem_statement": "Problem",
    "methodology": "Methodology",
    "key_contributions": ["Contribution"],
    "strengths": ["Strength"],
    "weaknesses": ["Weakness"],
    "research_gaps": ["Gap"],
    "novelty_assessment": "Novelty",
    "implementation_improvements": ["Improvement"],
    "future_work": ["Future work"],
    "viva_questions": ["Q1", "Q2", "Q3", "Q4", "Q5"],
    "publication_readiness_score": 72,
    "publication_readiness_justification": "Justification",
}


class FakeProvider(LLMProvider):
    def __init__(self, response_text: str) -> None:
        self.response_text = response_text
        self.system_prompt = ""
        self.user_prompt = ""

    def generate(self, system_prompt: str, user_prompt: str) -> str:
        self.system_prompt = system_prompt
        self.user_prompt = user_prompt
        return self.response_text


class AnalysisServiceTests(unittest.TestCase):
    def test_analysis_is_independent_of_provider_implementation(self) -> None:
        provider = FakeProvider(json.dumps(VALID_ANALYSIS))
        service = AnalysisService(provider)

        result = service.analyze_paper("paper text")

        self.assertEqual(result.research_domain, "Artificial Intelligence")
        self.assertEqual(result.publication_readiness_score, 72)
        self.assertEqual(provider.user_prompt, "paper text")
        self.assertIn("senior AI research reviewer", provider.system_prompt)

    def test_invalid_provider_response_has_stable_service_error(self) -> None:
        service = AnalysisService(FakeProvider("not json"))

        with self.assertRaisesRegex(ValueError, "Failed to analyze research paper"):
            service.analyze_paper("paper text")


if __name__ == "__main__":
    unittest.main()

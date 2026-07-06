import unittest
from unittest.mock import MagicMock

from exceptions import InvalidLLMResponseError
from models import RetrievedChunk
from services.literature_review_service import LiteratureReviewService


class LiteratureReviewServiceTests(unittest.TestCase):
    def setUp(self) -> None:
        self.mock_retrieval = MagicMock()
        self.mock_llm = MagicMock()
        self.review_service = LiteratureReviewService(
            retrieval_service=self.mock_retrieval,
            llm_provider=self.mock_llm,
        )

    def test_review_less_than_two_papers_raises_value_error(self) -> None:
        with self.assertRaisesRegex(ValueError, "requires at least two documents"):
            self.review_service.generate_review([])

        with self.assertRaisesRegex(ValueError, "requires at least two documents"):
            self.review_service.generate_review(["doc-1"])

    def test_review_missing_document_raises_value_error(self) -> None:
        def side_effect(query_text, top_k, document_id):
            if document_id == "doc-1":
                return [
                    RetrievedChunk(
                        chunk_id="chunk-1",
                        document_id="doc-1",
                        text="Some text",
                        score=0.9,
                        page_start=1,
                        page_end=1,
                        page_numbers=[1],
                        metadata={"section": "Abstract"},
                    )
                ]
            return []

        self.mock_retrieval.retrieve.side_effect = side_effect

        with self.assertRaisesRegex(ValueError, "has no chunks or does not exist"):
            self.review_service.generate_review(["doc-1", "doc-2"])

    def test_review_two_papers_success(self) -> None:
        def side_effect(query_text, top_k, document_id):
            return [
                RetrievedChunk(
                    chunk_id=f"chunk-{document_id}",
                    document_id=document_id,
                    text=f"Text for {document_id}",
                    score=0.9,
                    page_start=1,
                    page_end=1,
                    page_numbers=[1],
                    metadata={"section": "Abstract"},
                )
            ]

        self.mock_retrieval.retrieve.side_effect = side_effect
        self.mock_llm.generate.return_value = """{
            "overview": "Overview text",
            "major_themes": "Themes text",
            "methodology_trends": "Methodology trends",
            "strengths": "Strengths text",
            "limitations": "Limitations text",
            "research_trends": "Research trends text",
            "open_challenges": "Challenges text",
            "future_directions": "Future directions",
            "generated_literature_review": "Full Related Work section"
        }"""

        response = self.review_service.generate_review(["doc-1", "doc-2"])

        self.assertEqual(response.overview, "Overview text")
        self.assertEqual(response.generated_literature_review, "Full Related Work section")
        self.mock_llm.generate.assert_called_once()

    def test_review_three_papers_success(self) -> None:
        def side_effect(query_text, top_k, document_id):
            return [
                RetrievedChunk(
                    chunk_id=f"chunk-{document_id}",
                    document_id=document_id,
                    text=f"Text for {document_id}",
                    score=0.9,
                    page_start=1,
                    page_end=1,
                    page_numbers=[1],
                    metadata={"section": "Abstract"},
                )
            ]

        self.mock_retrieval.retrieve.side_effect = side_effect
        self.mock_llm.generate.return_value = """{
            "overview": "Overview text 3",
            "major_themes": "Themes text 3",
            "methodology_trends": "Methodology trends 3",
            "strengths": "Strengths text 3",
            "limitations": "Limitations text 3",
            "research_trends": "Research trends text 3",
            "open_challenges": "Challenges text 3",
            "future_directions": "Future directions 3",
            "generated_literature_review": "Full Related Work section 3"
        }"""

        response = self.review_service.generate_review(["doc-1", "doc-2", "doc-3"])

        self.assertEqual(response.overview, "Overview text 3")
        self.assertEqual(response.generated_literature_review, "Full Related Work section 3")
        self.assertEqual(self.mock_retrieval.retrieve.call_count, 3)


if __name__ == "__main__":
    unittest.main()

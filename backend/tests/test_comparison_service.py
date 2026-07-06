import unittest
from unittest.mock import MagicMock

from exceptions import InvalidLLMResponseError
from models import RetrievedChunk
from services.comparison_service import ComparisonService


class ComparisonServiceTests(unittest.TestCase):
    def setUp(self) -> None:
        self.mock_retrieval = MagicMock()
        self.mock_llm = MagicMock()
        self.comparison_service = ComparisonService(
            retrieval_service=self.mock_retrieval,
            llm_provider=self.mock_llm,
        )

    def test_compare_less_than_two_papers_raises_value_error(self) -> None:
        with self.assertRaisesRegex(ValueError, "requires at least two documents"):
            self.comparison_service.compare_papers([])

        with self.assertRaisesRegex(ValueError, "requires at least two documents"):
            self.comparison_service.compare_papers(["doc-1"])

    def test_compare_missing_document_raises_value_error(self) -> None:
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
            self.comparison_service.compare_papers(["doc-1", "doc-2"])

    def test_compare_two_papers_success(self) -> None:
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
            "executive_comparison": "Exec summary",
            "similarities": "Similarity text",
            "differences": "Differences text",
            "methodology_comparison": "Method comparison",
            "dataset_comparison": "Dataset comparison",
            "strength_comparison": "Strength comparison",
            "weakness_comparison": "Weakness comparison",
            "overall_recommendation": "Overall recommendation"
        }"""

        response = self.comparison_service.compare_papers(["doc-1", "doc-2"])

        self.assertEqual(response.executive_comparison, "Exec summary")
        self.assertEqual(response.similarities, "Similarity text")
        self.mock_llm.generate.assert_called_once()

    def test_compare_three_papers_success(self) -> None:
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
            "executive_comparison": "Exec summary 3",
            "similarities": "Similarity text 3",
            "differences": "Differences text 3",
            "methodology_comparison": "Method comparison 3",
            "dataset_comparison": "Dataset comparison 3",
            "strength_comparison": "Strength comparison 3",
            "weakness_comparison": "Weakness comparison 3",
            "overall_recommendation": "Overall recommendation 3"
        }"""

        response = self.comparison_service.compare_papers(["doc-1", "doc-2", "doc-3"])

        self.assertEqual(response.executive_comparison, "Exec summary 3")
        self.assertEqual(response.similarities, "Similarity text 3")
        self.assertEqual(self.mock_retrieval.retrieve.call_count, 3)


if __name__ == "__main__":
    unittest.main()

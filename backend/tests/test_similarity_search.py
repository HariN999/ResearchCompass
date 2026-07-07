import unittest
from unittest.mock import MagicMock

from models import RetrievedChunk
from services.retrieval_service import RetrievalService
from services.vector_store_service import VectorStoreService


class SimilaritySearchTests(unittest.TestCase):
    def setUp(self) -> None:
        self.mock_vector_store = MagicMock(spec=VectorStoreService)
        self.retrieval_service = RetrievalService(
            vector_store_service=self.mock_vector_store,
            top_k=5,
        )

    def test_search_successful_retrieval(self) -> None:
        expected_chunks = [
            RetrievedChunk(
                chunk_id="chunk-1",
                document_id="doc-1",
                text="Seminal transformer paper details.",
                score=0.9,
                page_start=1,
                page_end=1,
                page_numbers=[1],
                section="Introduction",
                page_number=1,
            )
        ]
        self.mock_vector_store.query.return_value = expected_chunks

        results = self.retrieval_service.search(query="transformer", top_k=3)

        self.assertEqual(len(results), 1)
        self.assertEqual(results[0].chunk_id, "chunk-1")
        self.assertEqual(results[0].section, "Introduction")
        self.assertEqual(results[0].page_number, 1)
        self.mock_vector_store.query.assert_called_once_with(
            query_text="transformer",
            top_k=3,
            document_id=None,
            document_ids=None,
        )

    def test_search_rejects_empty_query(self) -> None:
        with self.assertRaisesRegex(ValueError, "Query string cannot be empty"):
            self.retrieval_service.search(query="")

        with self.assertRaisesRegex(ValueError, "Query string cannot be empty"):
            self.retrieval_service.search(query="   ")

    def test_search_rejects_invalid_top_k(self) -> None:
        with self.assertRaisesRegex(ValueError, "top_k must be a positive integer"):
            self.retrieval_service.search(query="transformer", top_k=0)

        with self.assertRaisesRegex(ValueError, "top_k must be a positive integer"):
            self.retrieval_service.search(query="transformer", top_k=-2)

    def test_search_no_matching_results(self) -> None:
        self.mock_vector_store.query.return_value = []

        results = self.retrieval_service.search(query="nonexistent term")

        self.assertEqual(results, [])
        self.mock_vector_store.query.assert_called_once_with(
            query_text="nonexistent term",
            top_k=5,
            document_id=None,
            document_ids=None,
        )


if __name__ == "__main__":
    unittest.main()

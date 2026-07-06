import unittest
from unittest.mock import MagicMock

from models import RetrievedChunk
from routes import _assemble_rag_context


class RetrievalDrivenPromptingTests(unittest.TestCase):
    def test_assemble_rag_context_sorting_and_deduplication(self) -> None:
        # Create retrieved chunks with varying index and duplicate check
        chunks = [
            RetrievedChunk(
                chunk_id="chunk-2",
                document_id="doc-123",
                text="Second text.",
                score=0.9,
                page_start=2,
                page_end=2,
                page_numbers=[2],
                metadata={"chunk_index": 2, "section": "Introduction"},
            ),
            RetrievedChunk(
                chunk_id="chunk-1",
                document_id="doc-123",
                text="First text.",
                score=0.95,
                page_start=1,
                page_end=1,
                page_numbers=[1],
                metadata={"chunk_index": 1, "section": "Abstract"},
            ),
            # Duplicate of chunk-2 (should be removed)
            RetrievedChunk(
                chunk_id="chunk-2",
                document_id="doc-123",
                text="Second text duplicate.",
                score=0.88,
                page_start=2,
                page_end=2,
                page_numbers=[2],
                metadata={"chunk_index": 2, "section": "Introduction"},
            ),
        ]

        context = _assemble_rag_context(chunks)

        # Abstract (chunk_index: 1) should be first, and duplicate Introduction chunk should be removed
        expected_substrings = [
            "[Section: Abstract] [Pages: 1]\nFirst text.",
            "[Section: Introduction] [Pages: 2]\nSecond text.",
        ]
        
        self.assertIn(expected_substrings[0], context)
        self.assertIn(expected_substrings[1], context)
        
        # Verify logical order (Abstract is before Introduction)
        idx_abstract = context.find("Abstract")
        idx_intro = context.find("Introduction")
        self.assertLess(idx_abstract, idx_intro)

    def test_assemble_rag_context_respects_max_chars(self) -> None:
        chunks = [
            RetrievedChunk(
                chunk_id="chunk-1",
                document_id="doc-123",
                text="First text content.",
                score=0.95,
                page_start=1,
                page_end=1,
                page_numbers=[1],
                metadata={"chunk_index": 1, "section": "Abstract"},
            ),
            RetrievedChunk(
                chunk_id="chunk-2",
                document_id="doc-123",
                text="Second text content.",
                score=0.9,
                page_start=2,
                page_end=2,
                page_numbers=[2],
                metadata={"chunk_index": 2, "section": "Introduction"},
            ),
        ]

        # max_chars set very small so only the first block fits
        context = _assemble_rag_context(chunks, max_chars=40)
        self.assertIn("Abstract", context)
        self.assertNotIn("Second text content", context)


if __name__ == "__main__":
    unittest.main()

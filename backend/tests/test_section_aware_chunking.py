import unittest

from models import DocumentPage
from services.chunking_service import ChunkingService


class SectionAwareChunkingTests(unittest.TestCase):
    def test_section_detection_variations(self) -> None:
        service = ChunkingService(max_chunk_chars=1000)
        # Test distinct variations of headings
        self.assertEqual(service._detect_section("Abstract\nThis is abstract text."), "Abstract")
        self.assertEqual(service._detect_section("1. Introduction\nIntro text."), "Introduction")
        self.assertEqual(service._detect_section("## 2.3. Methodology\nSome methods."), "Methodology")
        self.assertEqual(service._detect_section("**Conclusion**\nConcluding text."), "Conclusion")
        self.assertEqual(service._detect_section("References:"), "References")
        self.assertEqual(service._detect_section("Not a section heading\nText here."), None)

    def test_flushes_at_section_boundary(self) -> None:
        service = ChunkingService(max_chunk_chars=1000)
        pages = [
            DocumentPage(
                page_number=1,
                text="Abstract\nThis is the abstract paragraph.",
                char_count=35,
                word_count=5,
            ),
            DocumentPage(
                page_number=1,
                text="1. Introduction\nWe introduce our research here.",
                char_count=45,
                word_count=6,
            ),
        ]
        result = service.chunk_pages(pages, document_id="doc-123")

        # There should be exactly 2 chunks because the section heading forced a flush
        self.assertEqual(len(result), 2)
        self.assertEqual(result[0].detected_section, "Abstract")
        self.assertEqual(result[0].document_id, "doc-123")
        self.assertEqual(result[0].page_number, 1)

        self.assertEqual(result[1].detected_section, "Introduction")
        self.assertEqual(result[1].document_id, "doc-123")
        self.assertEqual(result[1].page_number, 1)

    def test_preserves_sentence_boundaries_when_possible(self) -> None:
        # max_chunk_chars is 40.
        # Sentences:
        # S1: "First sentence." (15 chars)
        # S2: "Second sentence." (16 chars)
        # S3: "Third sentence." (15 chars)
        # S1 + S2 = 32 chars (fits). S1 + S2 + S3 = 48 chars (exceeds).
        # Section boundary is not crossed.
        service = ChunkingService(max_chunk_chars=40, chunk_overlap_chars=0)
        pages = [
            DocumentPage(
                page_number=1,
                text="First sentence. Second sentence. Third sentence.",
                char_count=48,
                word_count=6,
            )
        ]
        result = service.chunk_pages(pages)

        # Chunk 0 should have "First sentence. Second sentence." (32 chars)
        # Chunk 1 should have "Third sentence."
        self.assertEqual(len(result), 2)
        self.assertEqual(result[0].text, "First sentence. Second sentence.")
        self.assertEqual(result[1].text, "Third sentence.")

    def test_unknown_section_defaults(self) -> None:
        service = ChunkingService(max_chunk_chars=1000)
        pages = [
            DocumentPage(
                page_number=1,
                text="Hello world. This text has no headings whatsoever.",
                char_count=50,
                word_count=8,
            )
        ]
        result = service.chunk_pages(pages)
        self.assertEqual(len(result), 1)
        self.assertEqual(result[0].detected_section, "Unknown")


if __name__ == "__main__":
    unittest.main()

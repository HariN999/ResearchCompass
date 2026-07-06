import unittest

import fitz
from fastapi import HTTPException

from models import DocumentPage
from services.chunking_service import ChunkingService
from services.document_ingestion_service import DocumentIngestionService


def _build_pdf(pages: list[str], *, metadata: dict[str, str] | None = None) -> bytes:
    document = fitz.open()
    for page_text in pages:
        page = document.new_page()
        if page_text:
            page.insert_text((72, 72), page_text)
    if metadata:
        document.set_metadata(metadata)
    return document.tobytes()


class DocumentIngestionServiceTests(unittest.TestCase):
    def test_ingestion_returns_pages_metadata_and_chunks(self) -> None:
        pdf_bytes = _build_pdf(
            [
                "Abstract\n\nThis is page one.",
                "Method\n\nThis is page two.",
            ],
            metadata={"title": "Test Paper", "author": "Researcher"},
        )
        service = DocumentIngestionService(ChunkingService(max_chunk_chars=120, chunk_overlap_chars=20))

        result = service.ingest_pdf(
            file_name="paper.pdf",
            content_type="application/pdf",
            file_bytes=pdf_bytes,
        )

        self.assertTrue(result.metadata.document_id)
        self.assertEqual(result.metadata.file_name, "paper.pdf")
        self.assertEqual(result.metadata.page_count, 2)
        self.assertEqual(result.metadata.title, "Test Paper")
        self.assertEqual(result.metadata.author, "Researcher")
        self.assertEqual(len(result.pages), 2)
        self.assertEqual(result.pages[0].page_number, 1)
        self.assertIn("This is page one.", result.pages[0].text)
        self.assertGreaterEqual(len(result.chunks), 1)
        self.assertEqual(result.metadata.chunk_count, len(result.chunks))
        self.assertIn("[Page 1]", result.to_analysis_input())
        self.assertIn("[Page 2]", result.to_analysis_input())

    def test_non_pdf_signature_is_rejected(self) -> None:
        service = DocumentIngestionService()

        with self.assertRaises(HTTPException) as context:
            service.ingest_pdf(
                file_name="paper.pdf",
                content_type="application/pdf",
                file_bytes=b"not-a-real-pdf",
            )

        self.assertEqual(context.exception.status_code, 400)

    def test_pdf_without_extractable_text_is_rejected(self) -> None:
        pdf_bytes = _build_pdf([""])
        service = DocumentIngestionService()

        with self.assertRaisesRegex(ValueError, "did not contain extractable text"):
            service.ingest_pdf(
                file_name="paper.pdf",
                content_type="application/pdf",
                file_bytes=pdf_bytes,
            )


class ChunkingServiceTests(unittest.TestCase):
    def test_chunking_is_page_aware(self) -> None:
        service = ChunkingService(max_chunk_chars=60, chunk_overlap_chars=10)
        result = service.chunk_pages(
            [
                DocumentPage(
                    page_number=1,
                    text="Intro paragraph.\n\nMore content here.",
                    char_count=35,
                    word_count=5,
                ),
                DocumentPage(
                    page_number=2,
                    text="Second page paragraph.",
                    char_count=22,
                    word_count=3,
                ),
            ]
        )

        self.assertGreaterEqual(len(result), 1)
        self.assertEqual(result[0].page_start, 1)
        self.assertIn(1, result[0].page_numbers)


if __name__ == "__main__":
    unittest.main()

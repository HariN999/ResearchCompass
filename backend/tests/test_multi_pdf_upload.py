import unittest
from unittest.mock import MagicMock, patch
import fitz
from fastapi.testclient import TestClient

from app import app


def _build_pdf(pages: list[str], *, metadata: dict[str, str] | None = None) -> bytes:
    document = fitz.open()
    for page_text in pages:
        page = document.new_page()
        if page_text:
            page.insert_text((72, 72), page_text)
    if metadata:
        document.set_metadata(metadata)
    return document.tobytes()


class MultiPDFUploadTests(unittest.TestCase):
    def setUp(self) -> None:
        self.client = TestClient(app)

    @patch("services.vector_store_service.VectorStoreService.index_document")
    def test_single_document_upload(self, mock_index: MagicMock) -> None:
        pdf_bytes = _build_pdf(["This is document one text."])
        files = [
            ("files", ("doc1.pdf", pdf_bytes, "application/pdf")),
        ]
        response = self.client.post("/api/ingest", files=files)

        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(len(data["results"]), 1)
        self.assertEqual(data["results"][0]["file_name"], "doc1.pdf")
        self.assertEqual(data["results"][0]["status"], "success")
        self.assertIsNotNone(data["results"][0]["document_id"])
        mock_index.assert_called_once()

    @patch("services.vector_store_service.VectorStoreService.index_document")
    def test_multiple_documents_upload(self, mock_index: MagicMock) -> None:
        pdf_bytes_1 = _build_pdf(["Document 1 content."])
        pdf_bytes_2 = _build_pdf(["Document 2 content."])
        files = [
            ("files", ("doc1.pdf", pdf_bytes_1, "application/pdf")),
            ("files", ("doc2.pdf", pdf_bytes_2, "application/pdf")),
        ]
        response = self.client.post("/api/ingest", files=files)

        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(len(data["results"]), 2)
        self.assertEqual(data["results"][0]["file_name"], "doc1.pdf")
        self.assertEqual(data["results"][0]["status"], "success")
        self.assertEqual(data["results"][1]["file_name"], "doc2.pdf")
        self.assertEqual(data["results"][1]["status"], "success")
        self.assertEqual(mock_index.call_count, 2)

    @patch("services.vector_store_service.VectorStoreService.index_document")
    def test_partially_invalid_uploads(self, mock_index: MagicMock) -> None:
        pdf_bytes_valid = _build_pdf(["Valid document content."])
        pdf_bytes_invalid = b"not-a-real-pdf"

        files = [
            ("files", ("valid.pdf", pdf_bytes_valid, "application/pdf")),
            ("files", ("invalid.pdf", pdf_bytes_invalid, "application/pdf")),
        ]
        response = self.client.post("/api/ingest", files=files)

        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(len(data["results"]), 2)

        # Check first document succeeded
        self.assertEqual(data["results"][0]["file_name"], "valid.pdf")
        self.assertEqual(data["results"][0]["status"], "success")
        self.assertIsNotNone(data["results"][0]["document_id"])

        # Check second document failed
        self.assertEqual(data["results"][1]["file_name"], "invalid.pdf")
        self.assertEqual(data["results"][1]["status"], "failed")
        self.assertIn("does not appear to be a valid PDF", data["results"][1]["error"])

        # index_document should have only been called once
        mock_index.assert_called_once()

    @patch("services.vector_store_service.VectorStoreService.index_document")
    def test_duplicate_filenames_upload(self, mock_index: MagicMock) -> None:
        pdf_bytes_1 = _build_pdf(["Content of first duplicate."])
        pdf_bytes_2 = _build_pdf(["Content of second duplicate."])

        files = [
            ("files", ("doc.pdf", pdf_bytes_1, "application/pdf")),
            ("files", ("doc.pdf", pdf_bytes_2, "application/pdf")),
        ]
        response = self.client.post("/api/ingest", files=files)

        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(len(data["results"]), 2)
        self.assertEqual(data["results"][0]["file_name"], "doc.pdf")
        self.assertEqual(data["results"][0]["status"], "success")
        self.assertEqual(data["results"][1]["file_name"], "doc.pdf")
        self.assertEqual(data["results"][1]["status"], "success")
        # Ensure separate document IDs were generated
        self.assertNotEqual(data["results"][0]["document_id"], data["results"][1]["document_id"])
        self.assertEqual(mock_index.call_count, 2)


if __name__ == "__main__":
    unittest.main()

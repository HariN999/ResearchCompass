from __future__ import annotations

from uuid import uuid4

from models import DocumentIngestionResult
from services.chunking_service import ChunkingService
from services.pdf_service import (
    build_document_metadata,
    extract_pages_from_pdf,
    validate_pdf_upload,
)


class DocumentIngestionService:
    def __init__(self, chunking_service: ChunkingService | None = None) -> None:
        self._chunking_service = chunking_service or ChunkingService()

    def ingest_pdf(
        self,
        *,
        file_name: str,
        content_type: str | None,
        file_bytes: bytes,
    ) -> DocumentIngestionResult:
        validate_pdf_upload(
            file_name=file_name,
            content_type=content_type,
            file_bytes=file_bytes,
        )

        pages, pdf_metadata = extract_pages_from_pdf(file_bytes)

        if not pdf_metadata["has_text_content"]:
            raise ValueError("The uploaded PDF did not contain extractable text.")

        chunks = self._chunking_service.chunk_pages(pages)
        document_id = str(uuid4())
        metadata = build_document_metadata(
            document_id=document_id,
            file_name=file_name,
            content_type=content_type or "application/pdf",
            file_size_bytes=len(file_bytes),
            chunk_count=len(chunks),
            pdf_metadata=pdf_metadata,
        )

        return DocumentIngestionResult(metadata=metadata, pages=pages, chunks=chunks)

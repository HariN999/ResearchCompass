from __future__ import annotations

import logging
from uuid import uuid4

from exceptions import EmptyDocumentError
from models import DocumentIngestionResult
from services.chunking_service import ChunkingService
from services.pdf_service import (
    build_document_metadata,
    extract_pages_from_pdf,
    validate_pdf_upload,
)

logger = logging.getLogger(__name__)


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
        logger.info("Starting document ingestion for file: %s", file_name)
        try:
            validate_pdf_upload(
                file_name=file_name,
                content_type=content_type,
                file_bytes=file_bytes,
            )

            pages, pdf_metadata = extract_pages_from_pdf(file_bytes)

            if not pdf_metadata["has_text_content"]:
                logger.warning("Ingestion failed: File %s has no extractable text content.", file_name)
                raise EmptyDocumentError("The uploaded PDF did not contain extractable text.")

            document_id = str(uuid4())
            chunks = self._chunking_service.chunk_pages(pages, document_id=document_id)

            from datetime import datetime, timezone
            created_at_str = datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")
            title = pdf_metadata.get("title") or file_name
            author = pdf_metadata.get("author") or "Unknown"

            for chunk in chunks:
                chunk.document_title = title
                chunk.authors = author
                chunk.created_at = created_at_str

            metadata = build_document_metadata(
                document_id=document_id,
                file_name=file_name,
                content_type=content_type or "application/pdf",
                file_size_bytes=len(file_bytes),
                chunk_count=len(chunks),
                pdf_metadata=pdf_metadata,
            )

            logger.info(
                "Successfully ingested document %s (pages: %d, chunks: %d, size: %d bytes)",
                file_name,
                len(pages),
                len(chunks),
                len(file_bytes),
            )
            return DocumentIngestionResult(metadata=metadata, pages=pages, chunks=chunks)
        except Exception as exc:
            logger.error("Failed to ingest PDF document %s: %s", file_name, str(exc), exc_info=True)
            raise

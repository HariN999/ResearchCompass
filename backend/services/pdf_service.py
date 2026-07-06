from __future__ import annotations

import re
from datetime import datetime, timezone

import fitz
from fastapi import HTTPException

from models import DocumentMetadata, DocumentPage

MAX_PDF_SIZE_BYTES = 20 * 1024 * 1024
MAX_PDF_PAGE_COUNT = 200
SUPPORTED_PDF_CONTENT_TYPES = {
    "application/pdf",
    "application/x-pdf",
    "application/acrobat",
}


def validate_pdf_upload(
    *,
    file_name: str,
    content_type: str | None,
    file_bytes: bytes,
) -> None:
    if not file_bytes:
        raise HTTPException(status_code=400, detail="The uploaded file is empty.")

    if len(file_bytes) > MAX_PDF_SIZE_BYTES:
        raise HTTPException(
            status_code=413,
            detail=f"PDF files must be smaller than {MAX_PDF_SIZE_BYTES // (1024 * 1024)} MB.",
        )

    if content_type not in SUPPORTED_PDF_CONTENT_TYPES:
        raise HTTPException(
            status_code=400,
            detail="Only PDF files are supported.",
        )

    if not file_name.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=400,
            detail="The uploaded file must use a .pdf extension.",
        )

    if not file_bytes.startswith(b"%PDF-"):
        raise HTTPException(
            status_code=400,
            detail="The uploaded file does not appear to be a valid PDF.",
        )


def extract_pages_from_pdf(file_bytes: bytes) -> tuple[list[DocumentPage], dict[str, object]]:
    try:
        with fitz.open(stream=file_bytes, filetype="pdf") as document:
            if document.needs_pass:
                raise HTTPException(
                    status_code=422,
                    detail="Password-protected PDFs are not supported.",
                )

            if document.page_count == 0:
                raise HTTPException(status_code=422, detail="The PDF has no pages.")

            if document.page_count > MAX_PDF_PAGE_COUNT:
                raise HTTPException(
                    status_code=413,
                    detail=f"PDF files must have at most {MAX_PDF_PAGE_COUNT} pages.",
                )

            pages: list[DocumentPage] = []
            total_char_count = 0
            total_word_count = 0

            for page_number, page in enumerate(document, start=1):
                text = _normalize_page_text(page.get_text("text"))
                char_count = len(text)
                word_count = len(text.split()) if text else 0

                total_char_count += char_count
                total_word_count += word_count
                pages.append(
                    DocumentPage(
                        page_number=page_number,
                        text=text,
                        char_count=char_count,
                        word_count=word_count,
                    )
                )

            metadata = document.metadata or {}
            extracted_metadata: dict[str, object] = {
                "page_count": document.page_count,
                "total_char_count": total_char_count,
                "total_word_count": total_word_count,
                "has_text_content": any(page.text for page in pages),
                "title": _normalize_optional_text(metadata.get("title")),
                "author": _normalize_optional_text(metadata.get("author")),
                "subject": _normalize_optional_text(metadata.get("subject")),
                "keywords": _normalize_optional_text(metadata.get("keywords")),
                "creator": _normalize_optional_text(metadata.get("creator")),
                "producer": _normalize_optional_text(metadata.get("producer")),
                "creation_date": _parse_pdf_datetime(metadata.get("creationDate")),
                "modification_date": _parse_pdf_datetime(metadata.get("modDate")),
            }
            return pages, extracted_metadata
    except HTTPException:
        raise
    except fitz.FileDataError as exc:
        raise HTTPException(
            status_code=400,
            detail="The uploaded file could not be parsed as a PDF.",
        ) from exc
    except RuntimeError as exc:
        raise HTTPException(
            status_code=400,
            detail="The uploaded PDF is corrupted or unreadable.",
        ) from exc


def build_document_metadata(
    *,
    document_id: str,
    file_name: str,
    content_type: str,
    file_size_bytes: int,
    chunk_count: int,
    pdf_metadata: dict[str, object],
) -> DocumentMetadata:
    return DocumentMetadata(
        document_id=document_id,
        file_name=file_name,
        content_type=content_type,
        file_size_bytes=file_size_bytes,
        page_count=pdf_metadata["page_count"],
        total_char_count=pdf_metadata["total_char_count"],
        total_word_count=pdf_metadata["total_word_count"],
        chunk_count=chunk_count,
        has_text_content=pdf_metadata["has_text_content"],
        title=pdf_metadata.get("title"),
        author=pdf_metadata.get("author"),
        subject=pdf_metadata.get("subject"),
        keywords=pdf_metadata.get("keywords"),
        creator=pdf_metadata.get("creator"),
        producer=pdf_metadata.get("producer"),
        creation_date=pdf_metadata.get("creation_date"),
        modification_date=pdf_metadata.get("modification_date"),
    )


def _normalize_page_text(text: str) -> str:
    lines = [line.strip() for line in text.splitlines()]
    collapsed_lines: list[str] = []
    previous_blank = False

    for line in lines:
        if not line:
            if not previous_blank:
                collapsed_lines.append("")
            previous_blank = True
            continue

        normalized_line = re.sub(r"\s+", " ", line)
        collapsed_lines.append(normalized_line)
        previous_blank = False

    return "\n".join(collapsed_lines).strip()


def _normalize_optional_text(value: object) -> str | None:
    if not isinstance(value, str):
        return None
    normalized = value.strip()
    return normalized or None


def _parse_pdf_datetime(value: object) -> datetime | None:
    if not isinstance(value, str) or not value.startswith("D:"):
        return None

    normalized = value[2:]
    match = re.match(
        r"(?P<year>\d{4})(?P<month>\d{2})?(?P<day>\d{2})?"
        r"(?P<hour>\d{2})?(?P<minute>\d{2})?(?P<second>\d{2})?",
        normalized,
    )
    if not match:
        return None

    parts = match.groupdict()
    try:
        return datetime(
            year=int(parts["year"]),
            month=int(parts["month"] or 1),
            day=int(parts["day"] or 1),
            hour=int(parts["hour"] or 0),
            minute=int(parts["minute"] or 0),
            second=int(parts["second"] or 0),
            tzinfo=timezone.utc,
        )
    except ValueError:
        return None

from __future__ import annotations

from models import DocumentChunk, DocumentPage


class ChunkingService:
    """Creates page-aware chunks that can later be embedded and indexed."""

    def __init__(self, max_chunk_chars: int = 1800, chunk_overlap_chars: int = 250) -> None:
        if max_chunk_chars <= 0:
            raise ValueError("max_chunk_chars must be positive")
        if chunk_overlap_chars < 0:
            raise ValueError("chunk_overlap_chars cannot be negative")
        if chunk_overlap_chars >= max_chunk_chars:
            raise ValueError("chunk_overlap_chars must be smaller than max_chunk_chars")

        self._max_chunk_chars = max_chunk_chars
        self._chunk_overlap_chars = chunk_overlap_chars

    def chunk_pages(self, pages: list[DocumentPage]) -> list[DocumentChunk]:
        chunks: list[DocumentChunk] = []
        chunk_fragments: list[str] = []
        chunk_pages: list[int] = []
        chunk_index = 0

        for page in pages:
            if not page.text:
                continue

            for paragraph in self._split_page_into_paragraphs(page.text):
                chunk_fragments, chunk_pages, chunk_index = self._append_paragraph(
                    paragraph=paragraph,
                    page_number=page.page_number,
                    chunks=chunks,
                    chunk_fragments=chunk_fragments,
                    chunk_pages=chunk_pages,
                    chunk_index=chunk_index,
                )

        if chunk_fragments:
            chunks.append(
                self._build_chunk(
                    chunk_index=chunk_index,
                    text="\n\n".join(chunk_fragments),
                    page_numbers=chunk_pages,
                )
            )

        return chunks

    def _append_paragraph(
        self,
        *,
        paragraph: str,
        page_number: int,
        chunks: list[DocumentChunk],
        chunk_fragments: list[str],
        chunk_pages: list[int],
        chunk_index: int,
    ) -> tuple[list[str], list[int], int]:
        paragraph_parts = self._split_large_paragraph(paragraph)

        for part in paragraph_parts:
            candidate_fragments = [*chunk_fragments, part]
            candidate_text = "\n\n".join(candidate_fragments)
            if len(candidate_text) <= self._max_chunk_chars:
                chunk_fragments = candidate_fragments
                chunk_pages = self._append_page_number(chunk_pages, page_number)
                continue

            if chunk_fragments:
                chunks.append(
                    self._build_chunk(
                        chunk_index=chunk_index,
                        text="\n\n".join(chunk_fragments),
                        page_numbers=chunk_pages,
                    )
                )
                chunk_index += 1

            overlap_text = self._tail_overlap("\n\n".join(chunk_fragments))
            chunk_fragments = [text for text in [overlap_text, part] if text]
            chunk_pages = self._append_page_number([], page_number)

        return chunk_fragments, chunk_pages, chunk_index

    def _build_chunk(
        self,
        *,
        chunk_index: int,
        text: str,
        page_numbers: list[int],
    ) -> DocumentChunk:
        normalized_text = text.strip()
        return DocumentChunk(
            chunk_id=f"chunk-{chunk_index:04d}",
            chunk_index=chunk_index,
            text=normalized_text,
            char_count=len(normalized_text),
            word_count=len(normalized_text.split()) if normalized_text else 0,
            page_start=min(page_numbers),
            page_end=max(page_numbers),
            page_numbers=page_numbers,
        )

    def _split_page_into_paragraphs(self, text: str) -> list[str]:
        return [paragraph.strip() for paragraph in text.split("\n\n") if paragraph.strip()]

    def _split_large_paragraph(self, paragraph: str) -> list[str]:
        if len(paragraph) <= self._max_chunk_chars:
            return [paragraph]

        words = paragraph.split()
        parts: list[str] = []
        current_words: list[str] = []

        for word in words:
            candidate = " ".join([*current_words, word]).strip()
            if candidate and len(candidate) > self._max_chunk_chars and current_words:
                parts.append(" ".join(current_words))
                current_words = [word]
            else:
                current_words.append(word)

        if current_words:
            parts.append(" ".join(current_words))

        return parts

    def _tail_overlap(self, text: str) -> str:
        if not text or self._chunk_overlap_chars == 0:
            return ""
        return text[-self._chunk_overlap_chars :].strip()

    def _append_page_number(self, page_numbers: list[int], page_number: int) -> list[int]:
        if page_numbers and page_numbers[-1] == page_number:
            return page_numbers
        return [*page_numbers, page_number]

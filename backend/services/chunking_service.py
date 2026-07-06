from __future__ import annotations

import re
from models import DocumentChunk, DocumentPage

SECTION_PATTERNS = {
    "Abstract": re.compile(r"^\s*(?:[IVX\d\.\-\+]+\s+)?abstract\b", re.IGNORECASE),
    "Introduction": re.compile(r"^\s*(?:[IVX\d\.\-\+]+\s+)?introduction\b", re.IGNORECASE),
    "Related Work": re.compile(r"^\s*(?:[IVX\d\.\-\+]+\s+)?(?:related\s+work|literature\s+review)\b", re.IGNORECASE),
    "Background": re.compile(r"^\s*(?:[IVX\d\.\-\+]+\s+)?background\b", re.IGNORECASE),
    "Methodology": re.compile(r"^\s*(?:[IVX\d\.\-\+]+\s+)?methodology\b", re.IGNORECASE),
    "Methods": re.compile(r"^\s*(?:[IVX\d\.\-\+]+\s+)?methods\b", re.IGNORECASE),
    "Experiments": re.compile(r"^\s*(?:[IVX\d\.\-\+]+\s+)?(?:experiments|experimental\s+setup|evaluation)\b", re.IGNORECASE),
    "Results": re.compile(r"^\s*(?:[IVX\d\.\-\+]+\s+)?(?:results|findings)\b", re.IGNORECASE),
    "Discussion": re.compile(r"^\s*(?:[IVX\d\.\-\+]+\s+)?discussion\b", re.IGNORECASE),
    "Conclusion": re.compile(r"^\s*(?:[IVX\d\.\-\+]+\s+)?(?:conclusion|conclusions|concluding\s+remarks)\b", re.IGNORECASE),
    "Future Work": re.compile(r"^\s*(?:[IVX\d\.\-\+]+\s+)?(?:future\s+work|future\s+directions)\b", re.IGNORECASE),
    "References": re.compile(r"^\s*(?:[IVX\d\.\-\+]+\s+)?(?:references|bibliography)\b", re.IGNORECASE),
}


class ChunkingService:
    """Creates page-aware, section-aware chunks that can later be embedded and indexed."""

    def __init__(self, max_chunk_chars: int = 1800, chunk_overlap_chars: int = 250) -> None:
        if max_chunk_chars <= 0:
            raise ValueError("max_chunk_chars must be positive")
        if chunk_overlap_chars < 0:
            raise ValueError("chunk_overlap_chars cannot be negative")
        if chunk_overlap_chars >= max_chunk_chars:
            raise ValueError("chunk_overlap_chars must be smaller than max_chunk_chars")

        self._max_chunk_chars = max_chunk_chars
        self._chunk_overlap_chars = chunk_overlap_chars

    def chunk_pages(self, pages: list[DocumentPage], document_id: str = "") -> list[DocumentChunk]:
        chunks: list[DocumentChunk] = []
        current_section = "Unknown"
        chunk_index = 0

        accumulated_sentences: list[str] = []
        accumulated_len = 0
        chunk_page_numbers: list[int] = []

        for page in pages:
            if not page.text:
                continue

            for paragraph in self._split_page_into_paragraphs(page.text):
                detected = self._detect_section(paragraph)
                if detected is not None:
                    # Flush current chunk before starting the new section
                    if accumulated_sentences:
                        chunks.append(
                            self._build_chunk(
                                chunk_index=chunk_index,
                                text=" ".join(accumulated_sentences),
                                page_numbers=chunk_page_numbers,
                                document_id=document_id,
                                detected_section=current_section,
                            )
                        )
                        chunk_index += 1
                        accumulated_sentences = []
                        accumulated_len = 0
                        chunk_page_numbers = []
                    
                    current_section = detected

                sentences = self._split_into_sentences(paragraph)
                for sentence in sentences:
                    sentence_parts = [sentence]
                    if len(sentence) > self._max_chunk_chars:
                        sentence_parts = self._split_large_sentence_by_words(sentence)

                    for part in sentence_parts:
                        sep_len = 1 if accumulated_sentences else 0
                        if accumulated_len + sep_len + len(part) <= self._max_chunk_chars:
                            accumulated_sentences.append(part)
                            accumulated_len += sep_len + len(part)
                            chunk_page_numbers = self._append_page_number(chunk_page_numbers, page.page_number)
                        else:
                            if accumulated_sentences:
                                chunks.append(
                                    self._build_chunk(
                                        chunk_index=chunk_index,
                                        text=" ".join(accumulated_sentences),
                                        page_numbers=chunk_page_numbers,
                                        document_id=document_id,
                                        detected_section=current_section,
                                    )
                                )
                                chunk_index += 1

                            overlap_text = self._tail_overlap(" ".join(accumulated_sentences))
                            accumulated_sentences = [t for t in [overlap_text, part] if t]
                            accumulated_len = sum(len(t) for t in accumulated_sentences) + (1 if overlap_text else 0)
                            chunk_page_numbers = self._append_page_number([], page.page_number)

        if accumulated_sentences:
            chunks.append(
                self._build_chunk(
                    chunk_index=chunk_index,
                    text=" ".join(accumulated_sentences),
                    page_numbers=chunk_page_numbers,
                    document_id=document_id,
                    detected_section=current_section,
                )
            )

        return chunks

    def _detect_section(self, paragraph: str) -> str | None:
        first_line = paragraph.strip().split("\n")[0].strip()
        cleaned_line = re.sub(r"[\*\#\:\-\_]", "", first_line).strip()

        for section, pattern in SECTION_PATTERNS.items():
            if pattern.match(cleaned_line):
                return section
        return None

    def _split_into_sentences(self, text: str) -> list[str]:
        # Split on sentence-ending punctuation followed by whitespace (standard lookbehind)
        sentence_end = re.compile(r'(?<=[.!?])\s+')
        sentences = sentence_end.split(text)
        return [s.strip() for s in sentences if s.strip()]

    def _split_large_sentence_by_words(self, sentence: str) -> list[str]:
        words = sentence.split()
        parts: list[str] = []
        current_words: list[str] = []
        current_len = 0

        for word in words:
            sep_len = 1 if current_words else 0
            if current_len + sep_len + len(word) > self._max_chunk_chars:
                if current_words:
                    parts.append(" ".join(current_words))
                current_words = [word]
                current_len = len(word)
            else:
                current_words.append(word)
                current_len += sep_len + len(word)

        if current_words:
            parts.append(" ".join(current_words))

        return parts

    def _build_chunk(
        self,
        *,
        chunk_index: int,
        text: str,
        page_numbers: list[int],
        document_id: str = "",
        detected_section: str = "Unknown",
    ) -> DocumentChunk:
        normalized_text = text.strip()
        primary_page = page_numbers[0] if page_numbers else 1
        return DocumentChunk(
            chunk_id=f"chunk-{chunk_index:04d}",
            chunk_index=chunk_index,
            text=normalized_text,
            char_count=len(normalized_text),
            word_count=len(normalized_text.split()) if normalized_text else 0,
            page_start=min(page_numbers) if page_numbers else 1,
            page_end=max(page_numbers) if page_numbers else 1,
            page_numbers=page_numbers,
            document_id=document_id,
            page_number=primary_page,
            detected_section=detected_section,
        )

    def _split_page_into_paragraphs(self, text: str) -> list[str]:
        return [paragraph.strip() for paragraph in text.split("\n\n") if paragraph.strip()]

    def _tail_overlap(self, text: str) -> str:
        if not text or self._chunk_overlap_chars == 0:
            return ""
        return text[-self._chunk_overlap_chars :].strip()

    def _append_page_number(self, page_numbers: list[int], page_number: int) -> list[int]:
        if page_numbers and page_numbers[-1] == page_number:
            return page_numbers
        return [*page_numbers, page_number]

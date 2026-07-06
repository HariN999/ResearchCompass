from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, Field


class AnalysisResponse(BaseModel):
    research_domain: str
    executive_summary: str
    problem_statement: str
    methodology: str
    key_contributions: list[str]
    strengths: list[str]
    weaknesses: list[str]
    research_gaps: list[str]
    novelty_assessment: str
    implementation_improvements: list[str]
    future_work: list[str]
    viva_questions: list[str]
    publication_readiness_score: int
    publication_readiness_justification: str


class DocumentPage(BaseModel):
    page_number: int = Field(ge=1)
    text: str
    char_count: int = Field(ge=0)
    word_count: int = Field(ge=0)


class DocumentChunk(BaseModel):
    chunk_id: str
    chunk_index: int = Field(ge=0)
    text: str
    char_count: int = Field(ge=0)
    word_count: int = Field(ge=0)
    page_start: int = Field(ge=1)
    page_end: int = Field(ge=1)
    page_numbers: list[int]


class DocumentMetadata(BaseModel):
    document_id: str
    file_name: str
    content_type: str
    file_size_bytes: int = Field(ge=1)
    page_count: int = Field(ge=1)
    total_char_count: int = Field(ge=0)
    total_word_count: int = Field(ge=0)
    chunk_count: int = Field(ge=0)
    has_text_content: bool
    title: str | None = None
    author: str | None = None
    subject: str | None = None
    keywords: str | None = None
    creator: str | None = None
    producer: str | None = None
    creation_date: datetime | None = None
    modification_date: datetime | None = None


class DocumentIngestionResult(BaseModel):
    metadata: DocumentMetadata
    pages: list[DocumentPage]
    chunks: list[DocumentChunk]

    def to_analysis_input(self, max_chars: int = 16000) -> str:
        sections: list[str] = []

        for page in self.pages:
            if not page.text:
                continue
            sections.append(f"[Page {page.page_number}]\n{page.text}")

        return "\n\n".join(sections).strip()[:max_chars]


class RetrievedChunk(BaseModel):
    chunk_id: str
    document_id: str
    text: str
    score: float
    page_start: int = Field(ge=1)
    page_end: int = Field(ge=1)
    page_numbers: list[int]
    metadata: dict[str, str | int | float | bool | None] = Field(default_factory=dict)

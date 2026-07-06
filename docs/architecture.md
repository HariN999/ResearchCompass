# ResearchCompass — Current Architecture

## Request flow

```text
User Browser → Next.js Frontend → FastAPI Backend → PyMuPDF → Groq → Pydantic → Frontend Dashboard
```

## Component breakdown

### Frontend

The Next.js frontend provides PDF selection, loading and error states, theme management, and a structured results dashboard. It sends the selected file as `multipart/form-data` to `POST /api/analyze` and renders the returned analysis contract.

The frontend uses local React state because the current workflow is limited to one upload and one result. `NEXT_PUBLIC_API_URL` configures the backend origin and defaults to `http://localhost:8000` for local development.

### FastAPI API

The FastAPI backend registers the `/api/analyze` route, checks that the upload declares a PDF content type, extracts its text, and rejects documents with no extractable content. The root route exposes basic application status.

The API currently handles analysis in the request lifecycle. There is no background job queue, persistence layer, authentication system, or rate limiting.

### PDF extraction

PyMuPDF opens the uploaded bytes in memory and extracts plain text from each page. The combined text is trimmed to the first 12,000 characters before analysis.

This keeps model input bounded, but it can omit later sections of long papers. The current extractor does not perform OCR, semantic section detection, table extraction, or layout reconstruction.

### Groq analysis

The analysis service sends the extracted text to `llama-3.3-70b-versatile` through Groq. A system prompt requests a structured academic review and JSON response. The response is decoded and validated against the backend `AnalysisResponse` Pydantic model before it is returned to the frontend.

The workflow is a single LLM call. It is not an autonomous agent and does not currently use tools, vector search, retrieval-augmented generation, external literature, or citations.

## Response contract

The API returns fields for:

- Research domain
- Executive summary
- Problem statement
- Methodology
- Contributions, strengths, and weaknesses
- Research gaps and novelty assessment
- Implementation improvements and future work
- Viva questions
- Publication-readiness score and justification

The same contract is represented by a TypeScript interface in the frontend.

## Configuration

Backend:

```env
GROQ_API_KEY=your_groq_api_key_here
```

Frontend:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Current boundaries

This document describes the Phase 1 architecture only. Later phases will introduce chunking, sentence-transformer embeddings, ChromaDB, retrieval, provider abstraction, and evidence-backed citations. Those capabilities are intentionally not part of the current implementation.

## Error Handling and Logging

### Custom Exceptions
To ensure clean separation of concerns, the core services (business logic layer) raise custom Python exceptions subclassed from `ResearchCompassError` (which subclasses `ValueError` for backward compatibility):
*   `DocumentIngestionError` (Base for PDF validation/parsing failures)
    *   `InvalidPDFError`
    *   `PasswordProtectedPDFError`
    *   `EmptyDocumentError`
    *   `DocumentSizeLimitError`
    *   `DocumentPageLimitError`
*   `EmbeddingError` (Failed embedding loading or generation)
*   `VectorStoreError` (ChromaDB collection mapping, querying, or indexing failures)
*   `LLMProviderError` (Provider communication, timeout, or HTTP status failures)
*   `ProviderConfigError` (Missing env vars or invalid timeout configurations)
*   `AnalysisError` (Base for review execution errors)
    *   `InvalidLLMResponseError` (Malformed JSON or failed schema validation)

### Route Translation
The API routes intercept these domain-specific exceptions and map them to clean FastAPI `HTTPException` responses with safe, user-friendly messages. 
For instance, `EmptyDocumentError` resolves to HTTP 400 Bad Request, while `LLMProviderError` maps to HTTP 502 Bad Gateway. Internal errors return a generic HTTP 500 without disclosing system details.

### Logging Instrumentation
Key backend milestones are instrumented with the Python standard `logging` library using appropriate levels (`INFO`, `WARNING`, `ERROR`, `CRITICAL`):
*   `INFO`: Tracks request startup, successful ingestion/chunking/indexing, and LLM query timings.
*   `WARNING`: Indicates user-side input issues (empty uploads, oversized pages, password blocks).
*   `ERROR` / `CRITICAL`: Logs complete exception tracebacks for network timeouts, schema validation failures, or database issues. No sensitive secrets or raw keys are ever printed or exposed to API clients.


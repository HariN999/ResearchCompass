# ResearchCompass — Architecture Reference

This document describes the modular architecture, component responsibilities, request lifecycles, and design decisions of **ResearchCompass** (an open-source AI Research Intelligence Platform).

---

## 1. Request Flow

When an academic manuscript is analyzed, the process flows sequentially through the frontend, API gateway, document ingestion pipeline, database indexing services, and LLM providers:

```text
 1. File Upload          2. API Route           3. Ingestion & Extraction
[Next.js Client] ───► [FastAPI app.py] ───► [DocumentIngestionService]
      ▲                                                  │ (Extract text using PyMuPDF)
      │                                                  ▼
      │                                       ┌──────────────────────────┐
      │                                       ▼ (For Vector Indexing)    ▼ (For LLM Analysis)
      │                              [ChunkingService]          [to_analysis_input()]
      │                               (Split text)               (First 16,000 chars)
      │                                       │                          │
      │                                       ▼                          ▼
      │                              [EmbeddingService]         [AnalysisService]
      │                           (Generate local vectors)               │
      │                                       │                          ▼
      │                                       ▼                  [Provider Layer]
      │                             [VectorStoreService]        (Groq/OpenRouter/Ollama)
      │                            (Upsert to ChromaDB)                  │
      │                                                                  ▼
      │                                                         [Pydantic Validation]
      │ 8. Render Results Dashboard                                      │ (AnalysisResponse)
      └──────────────────────────────────────────────────────────────────┘
```

---

## 2. Component Breakdown

ResearchCompass is structured into distinct modules to separate concerns and support modular extensions.

### A. Frontend Web Interface
*   **Next.js App Shell**: Located in [frontend/app/page.tsx](file:///Users/harshavardhan/Desktop/Microsoft-Hackathon/frontend/app/page.tsx). It governs local page state, theme settings (light/dark mode toggle), and file upload interactions.
*   **Progress Stepper**: Managed in [frontend/components/AnalysisWorkflow.tsx](file:///Users/harshavardhan/Desktop/Microsoft-Hackathon/frontend/components/AnalysisWorkflow.tsx). It tracks the asynchronous pipeline state and provides animated feedback during the analysis steps.
*   **Dashboard Layout**: Implemented in [frontend/components/ResultsDashboard.tsx](file:///Users/harshavardhan/Desktop/Microsoft-Hackathon/frontend/components/ResultsDashboard.tsx) and associated subcomponents like [ScoreCard.tsx](file:///Users/harshavardhan/Desktop/Microsoft-Hackathon/frontend/components/ScoreCard.tsx), displaying structured metrics, weaknesses, future improvements, and thesis defense questions.

### B. FastAPI Router & Dependency Injection
*   **API Router**: Defined in [backend/routes.py](file:///Users/harshavardhan/Desktop/Microsoft-Hackathon/backend/routes.py). It declares the `POST /api/analyze` endpoint which receives uploads as multipart form data.
*   **Dependency Injection**: Defined in [backend/dependencies.py](file:///Users/harshavardhan/Desktop/Microsoft-Hackathon/backend/dependencies.py). It uses `@lru_cache` to instantiate and reuse singleton services, clean separation of configuration boundaries, and dependency mapping.
*   **Pydantic Contracts**: Declared in [backend/models.py](file:///Users/harshavardhan/Desktop/Microsoft-Hackathon/backend/models.py). It enforces the input/output schemas (e.g. `AnalysisResponse`, `DocumentMetadata`, `DocumentPage`, `DocumentChunk`) ensuring type safety across boundaries.

### C. Document Ingestion Engine
*   **Ingestion Coordinator**: [DocumentIngestionService](file:///Users/harshavardhan/Desktop/Microsoft-Hackathon/backend/services/document_ingestion_service.py) coordinates the validation of the uploaded file bytes, coordinates raw text extraction, runs the chunking parser, compiles document metadata, and structures the ingested output.
*   **PDF Processing**: [pdf_service.py](file:///Users/harshavardhan/Desktop/Microsoft-Hackathon/backend/services/pdf_service.py) uses PyMuPDF (`fitz`) to validate document dimensions, size limits (up to 20MB), page lengths (up to 200 pages), and password restrictions. It extracts clean, normalized textual lines from each page.

### D. Chunking & Local Embeddings
*   **Text Splitter**: [ChunkingService](file:///Users/harshavardhan/Desktop/Microsoft-Hackathon/backend/services/chunking_service.py) splits extracted text into overlapping segments (default: 1800 character limit, 250 character tail overlap) keeping page start/end offsets intact. Large paragraphs are split cleanly at word boundaries.
*   **Embedding Generator**: [EmbeddingService](file:///Users/harshavardhan/Desktop/Microsoft-Hackathon/backend/services/embedding_service.py) loads SentenceTransformer model `BAAI/bge-small-en-v1.5` locally to generate normalized vector arrays for each document chunk.

### E. Retrieval Foundation Layer
*   **Vector Store Manager**: [VectorStoreService](file:///Users/harshavardhan/Desktop/Microsoft-Hackathon/backend/services/vector_store_service.py) initializes a persistent client for ChromaDB (`chromadb`), establishes collection schemas, generates unique composite IDs, and indexes chunk texts alongside metadata filters.
*   **Semantic Router**: [RetrievalService](file:///Users/harshavardhan/Desktop/Microsoft-Hackathon/backend/services/retrieval_service.py) acts as a query manager for looking up top-K matching documents by vector cosine similarity scores.

### F. Provider Layer & Inference
*   **Base Abstract Class**: [LLMProvider](file:///Users/harshavardhan/Desktop/Microsoft-Hackathon/backend/providers/base.py) defines the contract for text completion models.
*   **Provider Implementations**: 
    *   [GroqProvider](file:///Users/harshavardhan/Desktop/Microsoft-Hackathon/backend/providers/groq.py): Interfaces with the Groq API (defaulting to Llama 3.3 70B).
    *   [OpenRouterProvider](file:///Users/harshavardhan/Desktop/Microsoft-Hackathon/backend/providers/openrouter.py): Integrates with OpenRouter endpoints.
    *   [OllamaProvider](file:///Users/harshavardhan/Desktop/Microsoft-Hackathon/backend/providers/ollama.py): Targets local LLM services running via Ollama.
*   **Provider Factory**: [factory.py](file:///Users/harshavardhan/Desktop/Microsoft-Hackathon/backend/providers/factory.py) maps the environment variable `LLM_PROVIDER` to the requested class.

---

## 3. Retrieval Foundation Separation

It is critical to distinguish current capabilities from planned retrieval functions:

> [!IMPORTANT]
> **Active Ingestion vs. Passive Retrieval**
> *   **Current Capability**: Every document analyzed goes through the ingestion pipeline, is chunked, embedded, and indexed into the ChromaDB collection. This establishes a **Retrieval Foundation**.
> *   **Prompt Execution**: In the current phase, the actual prompt context is constructed by taking the first 16,000 characters of page text directly using `DocumentIngestionResult.to_analysis_input()`. It does **not** perform a similarity search query to construct the context window.
> *   **Rationale**: Composing context directly from consecutive pages ensures that context flows logically (ideal for structured peer reviews of a single document), while the ChromaDB storage lays the infrastructure for multi-document comparisons and grounded gap detection in future phases.

---

## 4. Technical Design Decisions

*   **PyMuPDF (`fitz`)**: Selected for high processing speed and robust extraction of multi-column layout flows standard in computer science conferences.
*   **Local SentenceTransformers**: By choosing `BAAI/bge-small-en-v1.5`, ResearchCompass can index large manuscripts without generating recurring external API costs or disclosing document data to third-party embedding platforms.
*   **JSON Mode & Pydantic**: Structured academic reviews require deterministic structure to be rendered correctly in a web UI. Rather than parsing unstructured text using regular expressions, the LLM is requested in JSON mode and verified against the backend Pydantic schema `AnalysisResponse`. This ensures data conforms to type restrictions before reaching the client interface.
*   **Dependency Injection Isolation**: Decoupled service construction makes testing modules individually (e.g. testing `ChunkingService` without loading `EmbeddingService`) clean and robust.

---

## 5. Extensions & Future Scope

*   **True RAG for Literature Grounding**: Integrate vector index retrieval during critique generation. Instead of evaluating novelty based on LLM weights, the system can fetch related abstract vectors from an index of prior works and append them to the context.
*   **External Citation Resolvers**: Read citations from bibliography blocks, cross-reference them via public bibliographic repositories (Crossref/Semantic Scholar), and analyze references for citation depth, missing seminal works, and publication dates.
*   **Draft Synthesis**: Compare and highlight differences, improvements, or regressions between multiple drafts of the same research manuscript.

---

## 6. Error Handling and Logging

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


# ResearchCompass

> An open-source AI Research Intelligence Platform for structured academic paper review.

[![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=flat&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![Next.js](https://img.shields.io/badge/Next.js%2015-000000?style=flat&logo=nextdotjs&logoColor=white)](https://nextjs.org)
[![Groq](https://img.shields.io/badge/LLM_Providers-Groq_|_OpenRouter_|_Ollama-F55036?style=flat)](#configuration)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

**ResearchCompass** parses academic manuscripts in PDF format, extracts page text, structures document chunks, generates local embeddings, indexes them into a vector database, and uses a pluggable LLM provider to perform a PhD-level structured critique. It evaluates research domains, methodology, novelty, gaps, strengths, weaknesses, implementation improvements, viva defense questions, and calculates a publication-readiness score.

The platform is designed to be provider-neutral and highly modular, establishing a robust foundation for future retrieval-augmented generation (RAG) and multi-document synthesis.

---

## Architecture & Request Flow

ResearchCompass employs a modular architecture featuring decoupled ingestion, vector-indexing, and inference components.

```text
                                  [ User Browser ]
                                         │
                         Uploads PDF     │  Renders Dashboard
                         (multipart)     ▼  (AnalysisResponse)
                              [ Next.js Frontend ]
                                         │
                                         ▼ (POST /api/analyze)
                              [ FastAPI Backend Router ]
                                         │
                                         ▼
                           [ DocumentIngestionService ]
                            ├── Validate upload format & size
                            └── Extract raw pages using PyMuPDF (fitz)
                                         │
                                         ├──────────────────────────┐
                                         ▼                          ▼
                                 [ ChunkingService ]     [ to_analysis_input() ]
                                 (Paragraph-aware)        (First 16,000 chars)
                                         │                          │
                                         ▼                          ▼
                               [ EmbeddingService ]        [ AnalysisService ]
                            (bge-small-en-v1.5 local)       └── Prompt Engineering
                                         │                          │
                                         ▼                          │
                              [ VectorStoreService ]                ▼
                            (ChromaDB persist store)         [ Provider Layer ]
                                         │               (Groq / OpenRouter / Ollama)
                                         ▼                          │
                              [ Retrieval Foundation ]              ▼
                              (Indexed ChromaDB Index)      [ Pydantic Validation ]
                                                            (AnalysisResponse)
                                                                    │
                                                                    ▼
                                                            Returned to Frontend
```

### Retrieval Foundation Clarification
*   **Vector Storage**: Uploaded manuscripts are chunked, embedded using local SentenceTransformers, and stored in a local ChromaDB collection during every analyze request.
*   **Prompt Pipeline**: Currently, the **AnalysisService** feeds the first 16,000 characters of formatted paper text directly into the selected LLM provider. The vector database serves as an indexed **Retrieval Foundation**; dynamic chunk retrieval is not yet injected into the active prompt pipeline.

---

## Current Capabilities

*   **Document Ingestion**: Streamlined validation (checking headers, size limits, passwords, and page count) and text extraction using PyMuPDF.
*   **Retrieval Foundation**: Paragraph-aware text chunking with custom overlaps, local sentence-transformer embedding generation (`BAAI/bge-small-en-v1.5`), and persistent vector storage in ChromaDB.
*   **Provider Layer**: A pluggable, provider-neutral adapter layer supporting Groq (e.g., Llama 3.3 70B), OpenRouter, and Ollama (local models).
*   **Structured Critique**: Multi-point PhD-supervisor style manuscript evaluation including publication-readiness scorecards.
*   **Data Validation**: Strict Pydantic models validate LLM JSON outputs on the backend before return, matching TypeScript definitions on the frontend.
*   **Premium Interface**: A responsive Next.js web application featuring light/dark theme toggles, glassmorphic layout, and interactive dashboard results.

---

## Project Structure

```text
ResearchCompass/
├── backend/
│   ├── providers/              # Provider Layer abstraction
│   │   ├── base.py             # LLMProvider base class interface
│   │   ├── factory.py          # LLM Provider factory router
│   │   ├── groq.py             # Groq provider implementation
│   │   ├── ollama.py           # Ollama provider implementation
│   │   └── openrouter.py       # OpenRouter provider implementation
│   ├── services/               # Core services
│   │   ├── analysis_service.py # Prompt engineering & LLM review execution
│   │   ├── chunking_service.py # Page/paragraph splitting logic
│   │   ├── document_ingestion_service.py # Ingestion coordination
│   │   ├── embedding_service.py # SentenceTransformers wrapper
│   │   ├── pdf_service.py      # PyMuPDF text & metadata extraction
│   │   ├── retrieval_service.py # Query interface for semantic retrieval
│   │   └── vector_store_service.py # ChromaDB index & upsert operations
│   ├── app.py                  # FastAPI initialization
│   ├── dependencies.py         # Dependency injection container
│   ├── models.py               # Pydantic schemas & response contracts
│   ├── routes.py               # FastAPI route handlers
│   └── requirements.txt        # Python package dependencies
├── frontend/
│   ├── app/                    # Next.js pages (layout, dashboard shell)
│   ├── components/             # Reusable UI widgets (ScoreCard, UploadSection, etc.)
│   ├── lib/                    # API client helper logic
│   └── types/                  # TypeScript interface contracts
├── docs/
│   ├── architecture.md         # Detailed architectural documentation
│   └── screenshots/            # Visual layout references
└── LICENSE
```

---

## Local Setup

### Backend Setup

1. Navigate to the backend folder and prepare the environment:
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows use: venv\Scripts\activate
   pip install -r requirements.txt
   ```

2. Optional: If running local embeddings and vector storage, ensure `sentence-transformers` and `chromadb` are installed:
   ```bash
   pip install sentence-transformers chromadb
   ```

3. Create your configuration environment file:
   ```bash
   cp .env.example .env
   ```

4. Configure your `.env` file depending on your choice of LLM provider:
   ```env
   LLM_PROVIDER=groq                     # choices: groq, openrouter, ollama
   GROQ_API_KEY=your_groq_key_here
   
   # Optional configurations:
   # EMBEDDING_MODEL_NAME=BAAI/bge-small-en-v1.5
   # CHROMA_PERSIST_DIRECTORY=./chroma
   # LLM_TIMEOUT_SECONDS=120
   ```

5. Launch the FastAPI backend:
   ```bash
   uvicorn app:app --reload --port 8000
   ```

### Frontend Setup

1. Navigate to the frontend folder and install dependencies:
   ```bash
   cd frontend
   npm install
   ```

2. Configure local environment settings:
   ```bash
   cp .env.example .env.local
   ```
   *(Ensure `NEXT_PUBLIC_API_URL` points to your backend instance: `http://localhost:8000`)*

3. Launch the development server:
   ```bash
   npm run dev
   ```

4. Access the web dashboard at `http://localhost:3000`.

---

## API Reference

### `POST /api/analyze`
Accepts a PDF file upload (via `multipart/form-data` in the `file` field) and returns a validated JSON critique.

**Sample Response**:
```json
{
  "research_domain": "Natural Language Processing",
  "executive_summary": "This paper presents a novel approach...",
  "problem_statement": "Existing models struggle with context limits...",
  "methodology": "The authors propose an overlapping attention mechanism...",
  "key_contributions": ["Proposed dynamic attention", "Reduced complexity"],
  "strengths": ["Clear methodology", "Extensive baselines"],
  "weaknesses": ["High hardware requirements"],
  "research_gaps": ["Evaluation on low-resource languages is missing"],
  "novelty_assessment": "Significant improvement over standard attention...",
  "implementation_improvements": ["Optimize tensor tiling in GPU memory"],
  "future_work": ["Extend to multi-modal encoders"],
  "viva_questions": ["How does the complexity scale?", "..."],
  "publication_readiness_score": 82,
  "publication_readiness_justification": "Strong methodology and clear results..."
}
```

### `GET /`
Exposes basic status and version checks of the active API.

---

## Scope & Limitations

*   **Text Extraction**: Scanned documents or image-only PDFs require OCR, which is not currently supported.
*   **Context Ceiling**: The LLM prompt input context utilizes the first 16,000 characters from the document ingestion step.
*   **Literature Grounding**: Evaluation metrics and novelty critiques are judgments made by the LLM based on its internal knowledge rather than active retrieval searches across external search engines or literature databases.

---

## Planned Direction

Future development phases will link the **Retrieval Foundation** directly to the prompting pipeline (enabling actual RAG for paper reviews), support multi-document comparison synthesis, implement layout-aware extraction algorithms, and resolve live metadata attributes using Google Scholar or Crossref APIs.

---

## License

Available under the [MIT License](LICENSE).
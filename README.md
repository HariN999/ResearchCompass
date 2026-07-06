# ResearchCompass

> An open-source AI research intelligence platform for structured academic paper review.

[![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=flat&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![Next.js](https://img.shields.io/badge/Next.js%2015-000000?style=flat&logo=nextdotjs&logoColor=white)](https://nextjs.org)
[![Groq](https://img.shields.io/badge/Groq-Llama%203.3-F55036?style=flat)](https://groq.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

ResearchCompass accepts an academic PDF, extracts its text, and produces a structured AI review covering the research domain, problem statement, methodology, contributions, strengths, weaknesses, research gaps, suggested improvements, viva questions, and publication readiness.

The repository is being evolved from a hackathon prototype into a provider-neutral research intelligence platform. The current version uses Groq for inference. Retrieval-augmented generation, vector search, and evidence citations are planned for later phases and are not part of the current implementation.

## Current capabilities

- PDF upload through a responsive web interface
- Text extraction with PyMuPDF
- Structured academic review using Groq and Llama 3.3
- Pydantic-validated API responses
- Publication-readiness scoring
- Light and dark themes
- Responsive results dashboard

## Current architecture

```text
User Browser
    ↓
Next.js Frontend
    ↓ multipart/form-data
FastAPI Backend
    ↓
PyMuPDF Text Extraction
    ↓ first 12,000 characters
Groq Chat Completion
    ↓ structured JSON
Pydantic Validation
    ↓
Frontend Results Dashboard
```

The current workflow is a single-document, single-model analysis pipeline. It does not yet use a vector database, external literature retrieval, or source citations.

See [docs/architecture.md](docs/architecture.md) for more detail.

## Interface

![ResearchCompass analysis dashboard](docs/screenshots/results.png)

## Technology stack

| Layer | Technology |
| --- | --- |
| Frontend | Next.js 15, React 18, TypeScript, Tailwind CSS |
| Backend | FastAPI, Python 3.11+, Pydantic |
| PDF processing | PyMuPDF |
| AI inference | Groq, Llama 3.3 70B Versatile |

## Local setup

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
```

Set your Groq API key in `backend/.env`:

```env
GROQ_API_KEY=your_groq_api_key_here
```

Start the API:

```bash
uvicorn app:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

The frontend uses this configuration:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Open `http://localhost:3000`.

## API

### `POST /api/analyze`

Accepts one PDF in a multipart field named `file` and returns a structured manuscript review.

### `GET /`

Returns basic API status and version information.

Interactive API documentation is available at `http://localhost:8000/docs` while the backend is running.

## Project structure

```text
ResearchCompass/
├── backend/
│   ├── services/
│   │   ├── groq_service.py
│   │   └── pdf_service.py
│   ├── app.py
│   ├── models.py
│   ├── routes.py
│   └── requirements.txt
├── frontend/
│   ├── app/
│   ├── components/
│   ├── lib/
│   └── types/
├── docs/
│   ├── architecture.md
│   └── screenshots/
└── LICENSE
```

## Scope and limitations

- Only PDFs with extractable text are supported; scanned documents require OCR, which is not currently implemented.
- Extracted text is limited to the first 12,000 characters.
- Reviews are generated from the uploaded manuscript alone.
- Research-gap and novelty assessments are model judgments, not literature-grounded conclusions.
- The application currently requires a Groq API key.

## Planned direction

Future phases will introduce modular service boundaries, local sentence-transformer embeddings, ChromaDB, retrieval, provider adapters for OpenRouter/Groq/Ollama, and structured citations.

## License

ResearchCompass is available under the [MIT License](LICENSE).

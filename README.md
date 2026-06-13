# ResearchCompass

![Python FastAPI](https://img.shields.io/badge/Python-FastAPI-009688)
![Next.js](https://img.shields.io/badge/Next.js-15-black)
![Groq](https://img.shields.io/badge/Groq-LLM-orange)
![License MIT](https://img.shields.io/badge/License-MIT-blue)

ResearchCompass is an AI-powered research reasoning agent for evaluating academic papers. It extracts text from uploaded PDFs, sends the paper content through a structured review workflow, and returns actionable feedback on methodology, novelty, research gaps, implementation improvements, future work, viva questions, and publication readiness.

Instead of acting as a simple PDF summarizer, ResearchCompass behaves like a research advisor. It helps students, researchers, and project teams understand what has already been done, what is missing, how a paper compares to existing approaches, and what would make the work stronger before submission or defense.

## Features

- Research domain and subfield identification
- Executive summary
- Problem statement analysis
- Methodology evaluation
- Key contribution extraction
- Technical strengths and weaknesses
- Research gap discovery
- Novelty assessment
- Implementation improvement suggestions
- Future research directions
- Viva and thesis defense questions
- Publication readiness scoring
- Clean light and dark frontend interface

## Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | Next.js 15, React, TypeScript, Tailwind CSS |
| Backend | FastAPI, Python, Pydantic, PyMuPDF |
| AI | Groq-hosted LLM with JSON response mode |

## Quick Start

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Add your GROQ_API_KEY to .env
uvicorn app:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Open http://localhost:3000.

## API Reference

### `POST /api/analyze`

Accepts `multipart/form-data` with a `file` field containing a PDF. Returns an `AnalysisResponse` JSON object with the full structured review.

## Environment Variables

### Backend

```env
GROQ_API_KEY=your_groq_api_key_here
```

### Frontend

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Project Structure

```text
.
├── README.md
├── backend
│   ├── .env.example
│   ├── app.py
│   ├── models.py
│   ├── requirements.txt
│   ├── routes.py
│   └── services
│       ├── __init__.py
│       ├── groq_service.py
│       └── pdf_service.py
├── docs
│   └── architecture.md
└── frontend
    ├── .env.example
    ├── app
    │   ├── globals.css
    │   ├── layout.tsx
    │   └── page.tsx
    ├── components
    │   ├── ResultsDashboard.tsx
    │   ├── ScoreCard.tsx
    │   ├── SectionBlock.tsx
    │   └── UploadSection.tsx
    ├── lib
    │   └── api.ts
    ├── next.config.ts
    ├── package.json
    ├── postcss.config.js
    ├── tailwind.config.ts
    ├── tsconfig.json
    └── types
        └── analysis.ts
```

## Security Notes

- Real `.env` files are ignored by git.
- Commit only `.env.example` files with placeholder values.
- Do not commit virtual environments, dependency folders, build outputs, or generated caches.
- Rotate any key that was ever pasted into a local file before the first public push.

## License

MIT

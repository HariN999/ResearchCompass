# ResearchCompass — Architecture

## Request Flow

```text
User Browser → Next.js Frontend → FastAPI Backend → PyMuPDF → Groq LLM → JSON Response → Frontend Dashboard
```

## Component Breakdown

The Next.js frontend provides the upload interface, error state, loading state, and structured results dashboard. It sends the selected PDF as multipart form data to the backend and renders the returned `AnalysisResponse` fields into focused review sections.

The FastAPI backend exposes the `/api/analyze` endpoint, validates that uploads are PDFs, extracts text with PyMuPDF, and rejects files with no extractable text. It centralizes CORS and routing so the frontend can run locally on port 3000 while the API runs on port 8000.

The PDF extraction layer uses PyMuPDF to read bytes directly from the upload stream and collect page text. It trims the combined content to 12,000 characters so requests remain bounded while preserving the paper's highest-value front matter, methodology, experiments, and references when available.

The Groq analysis layer sends the extracted paper text to a hosted LLM with a strict reviewer prompt and JSON response mode. The returned JSON is parsed into a Pydantic model before it is sent to the frontend, giving the app a stable typed contract across the stack.

## Why PyMuPDF

`fitz` is faster and more accurate than pdfplumber for academic PDFs with complex layouts. It handles multi-column papers, equations, and figures gracefully.

## Prompt Engineering

The prompt follows a chain-of-thought-like review structure without asking the model to reveal hidden reasoning: domain → problem → methodology → novelty → gaps → viva. This sequence mirrors how senior reviewers evaluate papers, moving from classification and comprehension into technical critique, concrete improvements, and defense-level questioning.

JSON mode was used over function calling because the application needs one complete structured review object rather than tool orchestration or multiple callable actions. JSON mode keeps the response compact, predictable, and easy to validate with Pydantic while still allowing long-form technical strings inside each field.

## Extending the System

### Vector Search for Gap Detection

Add FAISS and sentence-transformers to index a corpus of related papers by abstract, introduction, methods, and conclusion sections. During analysis, embed the uploaded paper, retrieve the closest prior work, and pass the retrieved summaries into the analysis prompt so gap detection is grounded in comparable literature instead of only the uploaded text.

### Citation Analysis

Extract the references section with layout heuristics, parse titles/authors/venues, and resolve metadata through Crossref or Semantic Scholar. Store citation edges in a graph database or adjacency list so the system can detect missing seminal works, over-reliance on narrow venues, and weak positioning against recent papers.

### Multi-paper Comparison

Allow batch uploads and run the same extraction pipeline for each paper. Then add a comparison endpoint that aligns domains, methods, datasets, metrics, claims, limitations, and future work across papers to identify shared blind spots and unique contributions.

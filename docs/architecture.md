# ResearchCompass architecture

This document summarizes the current implementation structure of ResearchCompass without introducing new architecture.

## Overview

ResearchCompass is organized into three layers:

1. Frontend: a Next.js application that handles the upload flow, workflow state, and results UI.
2. Backend: a FastAPI service that accepts uploads, ingests PDFs, indexes chunks, and runs analysis.
3. Local data layer: a ChromaDB vector store backed by local files and SQLite.

## Request flow

A typical analysis request follows this path:

```text
User upload
  ↓
Next.js frontend
  ↓
FastAPI route /api/analyze
  ↓
Document ingestion service
  ↓
PDF extraction and chunking
  ↓
Embedding generation
  ↓
ChromaDB indexing
  ↓
Retrieval context assembly
  ↓
LLM provider response
  ↓
Structured results page
```

## Main modules

### Frontend
- frontend/app/page.tsx: page-level state and workspace selection
- frontend/components/: UI modules for upload, workflow, results, and library views
- frontend/lib/api.ts: frontend API wrapper for backend calls

### Backend
- backend/app.py: app initialization and CORS setup
- backend/routes.py: REST endpoints for analyze, ingest, compare, literature review, and semantic search
- backend/dependencies.py: service wiring and singleton access
- backend/models.py: Pydantic schemas for API payloads
- backend/services/: ingestion, retrieval, comparison, literature review, and analysis services
- backend/providers/: provider implementations for Groq, OpenRouter, and Ollama

### Data and configuration
- backend/config.py: environment-based settings
- backend/chroma/: local ChromaDB persistence directory

## Runtime notes

- The backend uses local embedding models and a local vector store, so it can run without a separate database service.
- The frontend expects the backend on the URL defined by NEXT_PUBLIC_API_URL.
- The current implementation relies on environment variables for provider selection and API keys.

## Error handling

The backend maps domain-specific exceptions to HTTP errors so invalid uploads, provider failures, and indexing problems produce clear responses for the client.

import logging
from typing import Annotated

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile

from dependencies import (
    get_analysis_service,
    get_document_ingestion_service,
    get_retrieval_service,
)
from exceptions import (
    AnalysisError,
    DocumentPageLimitError,
    DocumentSizeLimitError,
    EmbeddingError,
    EmptyDocumentError,
    InvalidLLMResponseError,
    InvalidPDFError,
    LLMProviderError,
    PasswordProtectedPDFError,
    ProviderConfigError,
    VectorStoreError,
)
from models import AnalysisResponse, RetrievedChunk
from services.analysis_service import AnalysisService
from services.document_ingestion_service import DocumentIngestionService
from services.retrieval_service import RetrievalService
import time

def _assemble_rag_context(chunks: list[RetrievedChunk], max_chars: int = 16000) -> str:
    seen_ids = set()
    unique_chunks = []
    for chunk in chunks:
        if chunk.chunk_id not in seen_ids:
            seen_ids.add(chunk.chunk_id)
            unique_chunks.append(chunk)

    def get_chunk_index(c: RetrievedChunk) -> int:
        idx = c.metadata.get("chunk_index")
        try:
            return int(idx) if idx is not None else 0
        except (TypeError, ValueError):
            return 0

    unique_chunks.sort(key=get_chunk_index)

    context_parts = []
    current_char_count = 0
    for chunk in unique_chunks:
        section = chunk.metadata.get("section") or "Unknown"
        page_numbers = chunk.metadata.get("page_numbers") or ",".join(str(p) for p in chunk.page_numbers)
        block = f"[Section: {section}] [Pages: {page_numbers}]\n{chunk.text}\n"

        if current_char_count + len(block) > max_chars:
            if not context_parts:
                context_parts.append(block[:max_chars])
            break

        context_parts.append(block)
        current_char_count += len(block)

    return "\n---\n".join(context_parts)

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/analyze", response_model=AnalysisResponse)
async def analyze(
    analysis_service: Annotated[AnalysisService, Depends(get_analysis_service)],
    ingestion_service: Annotated[
        DocumentIngestionService, Depends(get_document_ingestion_service)
    ],
    retrieval_service: Annotated[RetrievalService, Depends(get_retrieval_service)],
    file: UploadFile = File(...),
) -> AnalysisResponse:
    filename = file.filename or "uploaded-document.pdf"
    logger.info("API request received: POST /api/analyze for file %s", filename)
    try:
        file_bytes = await file.read()
        ingestion_result = ingestion_service.ingest_pdf(
            file_name=filename,
            content_type=file.content_type,
            file_bytes=file_bytes,
        )
        retrieval_service.index_document(ingestion_result)

        retrieval_start = time.perf_counter()
        document_id = ingestion_result.metadata.document_id
        try:
            query_text = "abstract introduction methodology experiments results discussion conclusion"
            chunks = retrieval_service.retrieve(
                query_text=query_text,
                top_k=5,
                document_id=document_id,
            )
            retrieval_duration = time.perf_counter() - retrieval_start

            if not chunks:
                logger.warning("Retrieval returned 0 chunks for document %s. Using fallback.", document_id)
                logger.info("Retrieval metrics - duration: %.4f seconds, count: 0, fallback: True", retrieval_duration)
                analysis_input = ingestion_result.to_analysis_input()
            else:
                logger.info(
                    "Retrieval metrics - duration: %.4f seconds, count: %d, fallback: False",
                    retrieval_duration,
                    len(chunks),
                )
                analysis_input = _assemble_rag_context(chunks)
        except Exception as exc:
            retrieval_duration = time.perf_counter() - retrieval_start
            logger.error(
                "Retrieval failed for document %s. Using fallback. Exception: %s",
                document_id,
                str(exc),
                exc_info=True,
            )
            logger.info("Retrieval metrics - duration: %.4f seconds, count: 0, fallback: True", retrieval_duration)
            analysis_input = ingestion_result.to_analysis_input()

        response = analysis_service.analyze_paper(analysis_input)
        logger.info("API request successfully completed: POST /api/analyze for file %s", filename)
        return response
    except EmptyDocumentError as exc:
        logger.warning("Empty document or no extractable text for file %s: %s", filename, str(exc))
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except InvalidPDFError as exc:
        logger.warning("Invalid PDF upload for file %s: %s", filename, str(exc))
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except PasswordProtectedPDFError as exc:
        logger.warning("Password protected PDF upload for file %s: %s", filename, str(exc))
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    except DocumentSizeLimitError as exc:
        logger.warning("File size limit exceeded for file %s: %s", filename, str(exc))
        raise HTTPException(status_code=413, detail=str(exc)) from exc
    except DocumentPageLimitError as exc:
        logger.warning("File page limit exceeded for file %s: %s", filename, str(exc))
        raise HTTPException(status_code=413, detail=str(exc)) from exc
    except ProviderConfigError as exc:
        logger.error("LLM Provider configuration error for file %s: %s", filename, str(exc), exc_info=True)
        raise HTTPException(status_code=500, detail="The server is misconfigured for LLM analysis.") from exc
    except LLMProviderError as exc:
        logger.error("LLM Provider failed to generate critique for file %s: %s", filename, str(exc), exc_info=True)
        raise HTTPException(status_code=502, detail="The LLM provider failed to generate a response.") from exc
    except InvalidLLMResponseError as exc:
        logger.error("LLM returned an invalid response structure for file %s: %s", filename, str(exc), exc_info=True)
        raise HTTPException(status_code=502, detail="The LLM returned a malformed or invalid critique.") from exc
    except EmbeddingError as exc:
        logger.error("Embedding generation failed for file %s: %s", filename, str(exc), exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to process document embeddings.") from exc
    except VectorStoreError as exc:
        logger.error("Vector store indexing failed for file %s: %s", filename, str(exc), exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to index document in the vector store.") from exc
    except AnalysisError as exc:
        logger.error("Analysis service error for file %s: %s", filename, str(exc), exc_info=True)
        raise HTTPException(status_code=500, detail="An error occurred during manuscript analysis.") from exc
    except Exception as exc:
        logger.critical("Unexpected unhandled exception during analyze request for file %s: %s", filename, str(exc), exc_info=True)
        raise HTTPException(status_code=500, detail="An unexpected internal server error occurred.") from exc


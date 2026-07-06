import logging
from typing import Annotated

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile

from dependencies import (
    get_analysis_service,
    get_document_ingestion_service,
    get_retrieval_service,
    get_comparison_service,
    get_literature_review_service,
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
from models import (
    AnalysisResponse,
    RetrievedChunk,
    DocumentIngestionStatus,
    BatchIngestionResponse,
    ComparisonRequest,
    ComparisonResponse,
    LiteratureReviewRequest,
    LiteratureReviewResponse,
)
from services.analysis_service import AnalysisService
from services.comparison_service import ComparisonService
from services.literature_review_service import LiteratureReviewService
from services.document_ingestion_service import DocumentIngestionService
from services.retrieval_service import RetrievalService
import time

def _assemble_rag_context(chunks: list[RetrievedChunk], max_chars: int = 16000) -> tuple[str, list[str]]:
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
    used_chunk_ids = []
    current_char_count = 0
    for chunk in unique_chunks:
        section = chunk.metadata.get("section") or "Unknown"
        page_numbers = chunk.metadata.get("page_numbers") or ",".join(str(p) for p in chunk.page_numbers)
        block = f"[Chunk ID: {chunk.chunk_id}] [Section: {section}] [Pages: {page_numbers}]\n{chunk.text}\n"

        if current_char_count + len(block) > max_chars:
            if not context_parts:
                context_parts.append(block[:max_chars])
                used_chunk_ids.append(chunk.chunk_id)
            break

        context_parts.append(block)
        used_chunk_ids.append(chunk.chunk_id)
        current_char_count += len(block)

    return "\n---\n".join(context_parts), used_chunk_ids

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
                logger.info("Retrieval metrics - duration: %.4f seconds, count: 0, fallback: True, evidence used: []", retrieval_duration)
                analysis_input = ingestion_result.to_analysis_input()
            else:
                analysis_input, used_chunk_ids = _assemble_rag_context(chunks)
                logger.info(
                    "Retrieval metrics - duration: %.4f seconds, count: %d, fallback: False, evidence used: %s",
                    retrieval_duration,
                    len(chunks),
                    str(used_chunk_ids),
                )
        except Exception as exc:
            retrieval_duration = time.perf_counter() - retrieval_start
            logger.error(
                "Retrieval failed for document %s. Using fallback. Exception: %s",
                document_id,
                str(exc),
                exc_info=True,
            )
            logger.info("Retrieval metrics - duration: %.4f seconds, count: 0, fallback: True, evidence used: []", retrieval_duration)
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


@router.post("/ingest", response_model=BatchIngestionResponse)
async def ingest(
    ingestion_service: Annotated[DocumentIngestionService, Depends(get_document_ingestion_service)],
    retrieval_service: Annotated[RetrievalService, Depends(get_retrieval_service)],
    files: list[UploadFile] = File(...),
) -> BatchIngestionResponse:
    results: list[DocumentIngestionStatus] = []
    logger.info("Batch ingestion request received for %d files.", len(files))

    for file in files:
        filename = file.filename or "uploaded-document.pdf"
        logger.info("Processing batch upload file: %s", filename)
        try:
            file_bytes = await file.read()
            ingestion_result = ingestion_service.ingest_pdf(
                file_name=filename,
                content_type=file.content_type,
                file_bytes=file_bytes,
            )
            retrieval_service.index_document(ingestion_result)
            results.append(
                DocumentIngestionStatus(
                    file_name=filename,
                    status="success",
                    document_id=ingestion_result.metadata.document_id,
                )
            )
            logger.info("Successfully ingested and indexed file %s in batch.", filename)
        except Exception as exc:
            logger.error("Failed to ingest file %s in batch: %s", filename, str(exc), exc_info=True)
            results.append(
                DocumentIngestionStatus(
                    file_name=filename,
                    status="failed",
                    error=str(exc),
                )
            )

    return BatchIngestionResponse(results=results)


@router.post("/compare", response_model=ComparisonResponse)
async def compare_documents(
    request: ComparisonRequest,
    comparison_service: Annotated[ComparisonService, Depends(get_comparison_service)],
) -> ComparisonResponse:
    logger.info("API request received: POST /api/compare for %d documents", len(request.document_ids))
    try:
        response = comparison_service.compare_papers(request.document_ids)
        logger.info("API request successfully completed: POST /api/compare")
        return response
    except ValueError as exc:
        logger.warning("Validation failure in compare endpoint: %s", str(exc))
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except (AnalysisError, LLMProviderError, InvalidLLMResponseError) as exc:
        logger.error("Comparison execution failed: %s", str(exc), exc_info=True)
        raise HTTPException(status_code=502, detail=str(exc)) from exc
    except Exception as exc:
        logger.critical("Unexpected unhandled exception during compare request: %s", str(exc), exc_info=True)
        raise HTTPException(status_code=500, detail="An unexpected internal server error occurred.") from exc


@router.post("/literature-review", response_model=LiteratureReviewResponse)
async def generate_literature_review(
    request: LiteratureReviewRequest,
    review_service: Annotated[LiteratureReviewService, Depends(get_literature_review_service)],
) -> LiteratureReviewResponse:
    logger.info("API request received: POST /api/literature-review for %d documents", len(request.document_ids))
    try:
        response = review_service.generate_review(request.document_ids)
        logger.info("API request successfully completed: POST /api/literature-review")
        return response
    except ValueError as exc:
        logger.warning("Validation failure in literature-review endpoint: %s", str(exc))
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except (AnalysisError, LLMProviderError, InvalidLLMResponseError) as exc:
        logger.error("Literature review generation failed: %s", str(exc), exc_info=True)
        raise HTTPException(status_code=502, detail=str(exc)) from exc
    except Exception as exc:
        logger.critical("Unexpected unhandled exception during literature-review request: %s", str(exc), exc_info=True)
        raise HTTPException(status_code=500, detail="An unexpected internal server error occurred.") from exc


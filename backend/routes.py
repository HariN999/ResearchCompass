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
from models import AnalysisResponse
from services.analysis_service import AnalysisService
from services.document_ingestion_service import DocumentIngestionService
from services.retrieval_service import RetrievalService

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
        response = analysis_service.analyze_paper(ingestion_result.to_analysis_input())
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


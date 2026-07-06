from typing import Annotated

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile

from dependencies import (
    get_analysis_service,
    get_document_ingestion_service,
    get_retrieval_service,
)
from models import AnalysisResponse
from services.analysis_service import AnalysisService
from services.document_ingestion_service import DocumentIngestionService
from services.retrieval_service import RetrievalService

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
    try:
        file_bytes = await file.read()
        ingestion_result = ingestion_service.ingest_pdf(
            file_name=file.filename or "uploaded-document.pdf",
            content_type=file.content_type,
            file_bytes=file_bytes,
        )
        retrieval_service.index_document(ingestion_result)
        return analysis_service.analyze_paper(ingestion_result.to_analysis_input())
    except HTTPException:
        raise
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail="An unexpected error occurred while processing the PDF.",
        ) from exc

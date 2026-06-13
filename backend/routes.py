from fastapi import APIRouter, File, HTTPException, UploadFile

from models import AnalysisResponse
from services.foundry_service import analyze_paper
from services.pdf_service import extract_text_from_pdf

router = APIRouter()


@router.post("/analyze", response_model=AnalysisResponse)
async def analyze(file: UploadFile = File(...)) -> AnalysisResponse:
    if file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")

    try:
        file_bytes = await file.read()
        paper_text = extract_text_from_pdf(file_bytes)

        if not paper_text:
            raise HTTPException(
                status_code=422,
                detail="The uploaded PDF did not contain extractable text.",
            )

        return analyze_paper(paper_text)
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc

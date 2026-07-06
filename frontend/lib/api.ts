import type { AnalysisResult, LibraryDocument, LiteratureReviewResponse } from "../types/analysis";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ?? "http://localhost:8000";

export async function analyzeResearchPaper(file: File): Promise<AnalysisResult> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_BASE_URL}/api/analyze`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null) as { detail?: string } | null;
    throw new Error(errorBody?.detail ?? "Failed to analyze the research paper.");
  }

  return response.json() as Promise<AnalysisResult>;
}

export async function getIndexedDocuments(): Promise<LibraryDocument[]> {
  const response = await fetch(`${API_BASE_URL}/api/documents`);

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null) as { detail?: string } | null;
    throw new Error(errorBody?.detail ?? "Failed to load indexed documents.");
  }

  return response.json() as Promise<LibraryDocument[]>;
}

export async function generateLiteratureReview(documentIds: string[]): Promise<LiteratureReviewResponse> {
  const response = await fetch(`${API_BASE_URL}/api/literature-review`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ document_ids: documentIds }),
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null) as { detail?: string } | null;
    throw new Error(errorBody?.detail ?? "Failed to generate the literature review.");
  }

  return response.json() as Promise<LiteratureReviewResponse>;
}

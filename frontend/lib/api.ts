import type { AnalysisResponse, ComparisonResponse, LiteratureReviewResponse } from "../types/analysis";

export async function analyzeResearchPaper(file: File): Promise<AnalysisResponse> {
  const formData = new FormData();
  formData.append("file", file);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

  const response = await fetch(`${apiUrl.replace(/\/$/, "")}/api/analyze`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null) as { detail?: string } | null;
    throw new Error(errorBody?.detail ?? "Failed to analyze the research paper.");
  }

  return response.json() as Promise<AnalysisResponse>;
}

export interface DocumentIngestionStatus {
  file_name: string;
  status: "success" | "failed";
  document_id?: string;
  error?: string;
}

export interface BatchIngestionResponse {
  results: DocumentIngestionStatus[];
}

export async function ingestDocuments(files: File[]): Promise<BatchIngestionResponse> {
  const formData = new FormData();
  for (const file of files) {
    formData.append("files", file);
  }

  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

  const response = await fetch(`${apiUrl.replace(/\/$/, "")}/api/ingest`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null) as { detail?: string } | null;
    throw new Error(errorBody?.detail ?? "Failed to ingest documents.");
  }

  return response.json() as Promise<BatchIngestionResponse>;
}

export async function compareDocuments(documentIds: string[]): Promise<ComparisonResponse> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

  const response = await fetch(`${apiUrl.replace(/\/$/, "")}/api/compare`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ document_ids: documentIds }),
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null) as { detail?: string } | null;
    throw new Error(errorBody?.detail ?? "Failed to compare the selected papers.");
  }

  return response.json() as Promise<ComparisonResponse>;
}

export async function generateLiteratureReview(documentIds: string[]): Promise<LiteratureReviewResponse> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

  const response = await fetch(`${apiUrl.replace(/\/$/, "")}/api/literature-review`, {
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

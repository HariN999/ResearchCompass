import type { AnalysisResult, LibraryDocument, LiteratureReviewResponse, ComparisonResponse } from "../types/analysis";

// Trigger Vercel rebuild for updated Hugging Face API URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ?? "http://localhost:8000";

export async function analyzeResearchPaper(file: File, retryCount = 1): Promise<AnalysisResult> {
  const formData = new FormData();
  formData.append("file", file);

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}/api/v1/analyze`, {
      method: "POST",
      body: formData,
    });
  } catch {
    if (retryCount > 0) {
      await new Promise((resolve) => setTimeout(resolve, 3000));
      return analyzeResearchPaper(file, retryCount - 1);
    }
    throw new Error("Unable to connect to the backend server. Please check your network and try again.");
  }

  if (!response.ok) {
    if ((response.status === 502 || response.status === 503) && retryCount > 0) {
      // Backend was sleeping / waking up on Hugging Face ZeroGPU. Wait 3s and retry once automatically.
      await new Promise((resolve) => setTimeout(resolve, 3000));
      return analyzeResearchPaper(file, retryCount - 1);
    }

    if (response.status === 502 || response.status === 503 || response.status === 504) {
      throw new Error("The AI backend was warming up from idle state. Please try submitting again in a few seconds.");
    }

    const errorBody = await response.json().catch(() => null) as { detail?: string } | null;
    throw new Error(errorBody?.detail ?? "Failed to analyze the research paper.");
  }

  return response.json() as Promise<AnalysisResult>;
}

export async function getIndexedDocuments(): Promise<LibraryDocument[]> {
  const response = await fetch(`${API_BASE_URL}/api/v1/documents`, {
    method: "POST"
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null) as { detail?: string } | null;
    throw new Error(errorBody?.detail ?? "Failed to load indexed documents.");
  }

  return response.json() as Promise<LibraryDocument[]>;
}

export async function generateLiteratureReview(documentIds: string[]): Promise<LiteratureReviewResponse> {
  const response = await fetch(`${API_BASE_URL}/api/v1/literature-review`, {
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

export async function compareResearchPapers(documentIds: string[]): Promise<ComparisonResponse> {
  const response = await fetch(`${API_BASE_URL}/api/v1/compare`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ document_ids: documentIds }),
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null) as { detail?: string } | null;
    throw new Error(errorBody?.detail ?? "Failed to compare the research papers.");
  }

  return response.json() as Promise<ComparisonResponse>;
}

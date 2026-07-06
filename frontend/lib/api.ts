import type { AnalysisResponse } from "../types/analysis";

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

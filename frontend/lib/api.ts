import type { AnalysisResult } from "../types/analysis";

export async function analyzeResearchPaper(file: File): Promise<AnalysisResult> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("http://localhost:8000/api/analyze", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null) as { detail?: string } | null;
    throw new Error(errorBody?.detail ?? "Failed to analyze the research paper.");
  }

  return response.json() as Promise<AnalysisResult>;
}

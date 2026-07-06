export interface AnalysisResult {
  research_domain: string;
  executive_summary: string;
  problem_statement: string;
  methodology: string;
  key_contributions: string[];
  strengths: string[];
  weaknesses: string[];
  research_gaps: string[];
  novelty_assessment: string;
  implementation_improvements: string[];
  future_work: string[];
  viva_questions: string[];
  publication_readiness_score: number;
  publication_readiness_justification: string;
}

export interface LibraryDocument {
  id: string;
  title: string;
  authors: string;
  domain: string;
  year: number | null;
  uploadDate: string;
  pageCount: number;
  wordCount: number;
  chunkCount: number;
  status: string;
  tags: string[];
  fileName: string;
  fileSizeBytes: number;
}

export interface LiteratureReviewResponse {
  overview: string;
  major_themes: string;
  methodology_trends: string;
  strengths: string;
  limitations: string;
  research_trends: string;
  open_challenges: string;
  future_directions: string;
  generated_literature_review: string;
}

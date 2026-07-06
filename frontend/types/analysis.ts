export interface AnalysisResponse {
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

export interface ComparisonResponse {
  executive_comparison: string;
  similarities: string;
  differences: string;
  methodology_comparison: string;
  dataset_comparison: string;
  strength_comparison: string;
  weakness_comparison: string;
  overall_recommendation: string;
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

export interface SemanticSearchResult {
  id: string;
  document_id: string;
  document_title: string;
  authors: string;
  section: string;
  page_number: number | null;
  score: number;
  text: string;
  metadata?: Record<string, string | number | boolean | null | undefined>;
}

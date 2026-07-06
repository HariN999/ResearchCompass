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

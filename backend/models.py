from pydantic import BaseModel


class AnalysisResponse(BaseModel):
    research_domain: str
    executive_summary: str
    problem_statement: str
    methodology: str
    key_contributions: list[str]
    strengths: list[str]
    weaknesses: list[str]
    research_gaps: list[str]
    novelty_assessment: str
    implementation_improvements: list[str]
    future_work: list[str]
    viva_questions: list[str]
    publication_readiness_score: int
    publication_readiness_justification: str

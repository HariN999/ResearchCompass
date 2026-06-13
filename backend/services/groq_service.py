import json
import os

from groq import Groq

from models import AnalysisResponse


SYSTEM_PROMPT = """
You are a senior AI research reviewer with deep expertise in computer science, NLP, machine learning, and interdisciplinary research. You critically and constructively evaluate academic research papers.

Given the full text of a research paper, you must perform a complete analysis:

1. Identify the research domain and subfield precisely
2. Write a detailed executive summary (3-4 sentences)
3. Extract and articulate the core problem statement
4. Analyze the methodology deeply: datasets used, model architecture, training procedure, evaluation metrics, experimental design, baselines compared against
5. Assess novelty: what makes this work different from prior art, is the novelty incremental or significant
6. List all key contributions the paper claims or demonstrates
7. Identify specific research gaps — what the paper missed, ignored, oversimplified, or failed to address that future work should tackle
8. List technical strengths with reasoning
9. List technical weaknesses with reasoning
10. Suggest concrete implementation and code-level improvements a developer could actually make
11. Recommend specific future research directions with enough detail to act on
12. Generate exactly 5 tough viva/thesis defense questions a PhD committee would ask
13. Give a publication readiness score from 0 to 100 with detailed justification

Be specific, technical, and actionable. Never write vague generic statements. Think and respond like a PhD supervisor reviewing a student submission.

Respond ONLY in this exact JSON format with no extra text outside the JSON:
{
  "research_domain": "string",
  "executive_summary": "string",
  "problem_statement": "string",
  "methodology": "string",
  "key_contributions": ["string", "string"],
  "strengths": ["string", "string"],
  "weaknesses": ["string", "string"],
  "research_gaps": ["string", "string"],
  "novelty_assessment": "string",
  "implementation_improvements": ["string", "string"],
  "future_work": ["string", "string"],
  "viva_questions": ["string", "string", "string", "string", "string"],
  "publication_readiness_score": 72,
  "publication_readiness_justification": "string"
}
"""


def analyze_paper(paper_text: str) -> AnalysisResponse:
    client = Groq(api_key=os.environ["GROQ_API_KEY"])

    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": paper_text},
            ],
            response_format={"type": "json_object"},
            temperature=0.3,
        )

        response_text = response.choices[0].message.content
        if not response_text:
            raise ValueError("Groq returned an empty response.")

        parsed = json.loads(response_text)
        return AnalysisResponse(**parsed)

    except Exception as exc:
        raise ValueError(f"Failed to analyze research paper: {exc}") from exc
import json
import os
import re
from openai import OpenAI

from models import AnalysisResponse


SYSTEM_PROMPT = """
You are a senior AI research reviewer with deep expertise in computer science, NLP, machine learning, and interdisciplinary research.

Given the full text of a research paper, perform a complete analysis.

Publication readiness score must be an integer between 0 and 100. Follow this guidance:
- 0 = unsuitable for publication
- 50 = average workshop-quality work
- 70 = solid conference-quality work
- 90 = strong publication-ready work
- 100 = exceptional publication-ready work

Return ONLY valid JSON.

{
  "research_domain": "string",
  "executive_summary": "string",
  "problem_statement": "string",
  "methodology": "string",
  "key_contributions": ["string"],
  "strengths": ["string"],
  "weaknesses": ["string"],
  "research_gaps": ["string"],
  "novelty_assessment": "string",
  "implementation_improvements": ["string"],
  "future_work": ["string"],
  "viva_questions": ["string", "string", "string", "string", "string"],
  "publication_readiness_score": 70,
  "publication_readiness_justification": "string"
}
"""

_client = None


def _get_client() -> OpenAI:
    global _client
    if _client is None:
        endpoint = os.getenv("AZURE_OPENAI_ENDPOINT")
        api_key = os.getenv("AZURE_OPENAI_API_KEY")
        if not endpoint or not api_key:
            raise ValueError(
                "Missing Azure OpenAI configuration. "
                "Ensure AZURE_OPENAI_ENDPOINT and AZURE_OPENAI_API_KEY are set in the environment."
            )
        _client = OpenAI(
            base_url=endpoint,
            api_key=api_key,
        )
    return _client


def extract_json_block(text: str) -> dict:
    if not text:
        raise ValueError("Azure Foundry returned an empty response.")

    # Try direct parse first
    try:
        return json.loads(text.strip(), strict=False)
    except json.JSONDecodeError:
        pass

    # Search for ```json ... ``` code blocks
    json_block_match = re.search(r'```json\s*(.*?)\s*```', text, re.DOTALL | re.IGNORECASE)
    if json_block_match:
        try:
            return json.loads(json_block_match.group(1).strip(), strict=False)
        except json.JSONDecodeError:
            pass

    # Search for ``` ... ``` code blocks
    generic_block_match = re.search(r'```\s*(.*?)\s*```', text, re.DOTALL)
    if generic_block_match:
        try:
            return json.loads(generic_block_match.group(1).strip(), strict=False)
        except json.JSONDecodeError:
            pass

    # Find first '{' and last '}'
    start = text.find("{")
    end = text.rfind("}")
    if start != -1 and end != -1 and end > start:
        json_substring = text[start:end+1]
        try:
            return json.loads(json_substring.strip(), strict=False)
        except json.JSONDecodeError:
            # Try minor cleaning: remove trailing commas before closing braces/brackets
            cleaned_json = re.sub(r',\s*}', '}', json_substring)
            cleaned_json = re.sub(r',\s*\]', ']', cleaned_json)
            try:
                return json.loads(cleaned_json.strip(), strict=False)
            except json.JSONDecodeError as err:
                raise ValueError(
                    f"Model response contained malformed JSON inside braces. Error: {err}. "
                    f"Excerpt: {json_substring[:200]}..."
                )

    raise ValueError(
        f"No JSON object could be extracted from the model response. "
        f"Raw response starts with: {text[:200]}..."
    )


def normalize_keys(raw_dict: dict) -> dict:
    normalized = {}
    for k, v in raw_dict.items():
        # Convert camelCase to snake_case
        norm_k = str(k).strip()
        norm_k = re.sub(r'(?<!^)(?=[A-Z])', '_', norm_k)
        # Replace spaces, dashes, dots with underscores
        norm_k = re.sub(r'[\s\-\.]+', '_', norm_k)
        norm_k = re.sub(r'_+', '_', norm_k)
        norm_k = norm_k.lower()
        normalized[norm_k] = v
    return normalized


def coerce_to_string_list(val) -> list[str]:
    if val is None:
        return []
    if isinstance(val, list):
        return [str(item).strip() for item in val if item is not None]
    if isinstance(val, str):
        cleaned = val.strip()
        if not cleaned:
            return []
        # Split by newlines, cleaning up bullet points
        lines = [line.strip().lstrip("*-•").strip() for line in cleaned.split("\n") if line.strip()]
        if len(lines) > 1:
            return lines
        # Split by semicolons if no newlines
        if ";" in cleaned:
            return [part.strip() for part in cleaned.split(";") if part.strip()]
        return [cleaned]
    return [str(val).strip()]


def coerce_to_string(val) -> str:
    if val is None:
        return ""
    if isinstance(val, list):
        return "\n".join([str(item).strip() for item in val if item is not None])
    return str(val).strip()


def coerce_to_int(val) -> int:
    if val is None:
        return 0
    
    score = 0
    if isinstance(val, (int, float)):
        score = int(val)
    else:
        try:
            # Extract the first digit sequence
            match = re.search(r'\d+', str(val))
            if match:
                score = int(match.group())
            else:
                score = int(float(str(val).strip()))
        except (ValueError, TypeError):
            score = 0

    # Defensive normalization: auto-scale 1-10 scores to 10-100 percentages
    if 0 < score <= 10:
        score = score * 10
        
    return score


def coerce_and_validate_analysis_response(parsed_dict: dict) -> dict:
    normalized = normalize_keys(parsed_dict)
    coerced = {}

    # String fields:
    string_fields = [
        "research_domain",
        "executive_summary",
        "problem_statement",
        "methodology",
        "novelty_assessment",
        "publication_readiness_justification"
    ]
    for field in string_fields:
        coerced[field] = coerce_to_string(normalized.get(field))

    # List fields:
    list_fields = [
        "key_contributions",
        "strengths",
        "weaknesses",
        "research_gaps",
        "implementation_improvements",
        "future_work",
        "viva_questions"
    ]
    for field in list_fields:
        coerced[field] = coerce_to_string_list(normalized.get(field))

    # Integer field:
    coerced["publication_readiness_score"] = coerce_to_int(normalized.get("publication_readiness_score"))

    return coerced


def analyze_paper(paper_text: str) -> AnalysisResponse:
    deployment = os.getenv("AZURE_OPENAI_DEPLOYMENT")
    if not deployment:
        raise ValueError("AZURE_OPENAI_DEPLOYMENT environment variable is not set.")

    client = _get_client()

    try:
        response = client.chat.completions.create(
            model=deployment,
            messages=[
                {
                    "role": "system",
                    "content": SYSTEM_PROMPT,
                },
                {
                    "role": "user",
                    "content": paper_text[:12000],
                },
            ],
            max_completion_tokens=4000,
        )

        response_text = response.choices[0].message.content

        if not response_text:
            raise ValueError("Azure Foundry returned an empty response.")

        parsed_dict = extract_json_block(response_text)
        coerced_dict = coerce_and_validate_analysis_response(parsed_dict)

        return AnalysisResponse(**coerced_dict)

    except Exception as exc:
        raise ValueError(
            f"Failed to analyze research paper: {exc}"
        ) from exc
import sys
import os

# Adjust path to import from backend/
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from services.foundry_service import (
    extract_json_block,
    normalize_keys,
    coerce_to_string_list,
    coerce_to_string,
    coerce_to_int,
    coerce_and_validate_analysis_response,
)


def test_extract_json_block():
    print("Testing extract_json_block...")
    
    # 1. Direct JSON
    assert extract_json_block('{"a": 1}') == {"a": 1}
    
    # 2. Markdown JSON code block
    markdown_json = """
Here is the result:
```json
{
  "key": "value"
}
```
Have a good day!
"""
    assert extract_json_block(markdown_json) == {"key": "value"}

    # 3. Generic code block
    generic_code = """
```
{"key": "value"}
```
"""
    assert extract_json_block(generic_code) == {"key": "value"}

    # 4. JSON with leading/trailing text without backticks
    text_json = "random text { \"foo\": \"bar\" } other text"
    assert extract_json_block(text_json) == {"foo": "bar"}

    # 5. JSON with trailing commas
    trailing_comma_json = '{"list": [1, 2, ], "val": 3, }'
    assert extract_json_block(trailing_comma_json) == {"list": [1, 2], "val": 3}

    print("✓ extract_json_block passed")


def test_normalize_keys():
    print("Testing normalize_keys...")
    raw = {
        "publicationReadinessScore": 85,
        "research-domain": "CS",
        "Key.Contributions": ["one"],
        "future work": "tomorrow",
        "normal_key": "val"
    }
    normalized = normalize_keys(raw)
    assert normalized["publication_readiness_score"] == 85
    assert normalized["research_domain"] == "CS"
    assert normalized["key_contributions"] == ["one"]
    assert normalized["future_work"] == "tomorrow"
    assert normalized["normal_key"] == "val"
    
    print("✓ normalize_keys passed")


def test_coerce_to_string_list():
    print("Testing coerce_to_string_list...")
    # List of strings stays list of strings
    assert coerce_to_string_list(["a", "b"]) == ["a", "b"]
    # Coerces float/int elements to str
    assert coerce_to_string_list([1, 2.5, None]) == ["1", "2.5"]
    
    # Multi-line bullet points split into list
    bullet_str = """
* First contribution
- Second contribution
• Third contribution
"""
    assert coerce_to_string_list(bullet_str) == [
        "First contribution",
        "Second contribution",
        "Third contribution"
    ]
    
    # Semicolon separated values
    semi_str = "One; Two; Three"
    assert coerce_to_string_list(semi_str) == ["One", "Two", "Three"]
    
    # Single item fallback
    assert coerce_to_string_list("Single string") == ["Single string"]
    assert coerce_to_string_list("") == []
    assert coerce_to_string_list(None) == []

    print("✓ coerce_to_string_list passed")


def test_coerce_to_string():
    print("Testing coerce_to_string...")
    assert coerce_to_string("hello") == "hello"
    assert coerce_to_string(123) == "123"
    assert coerce_to_string(["hello", "world"]) == "hello\nworld"
    assert coerce_to_string(None) == ""

    print("✓ coerce_to_string passed")


def test_coerce_to_int():
    print("Testing coerce_to_int...")
    assert coerce_to_int(85) == 85
    assert coerce_to_int(72.6) == 72
    assert coerce_to_int("85%") == 85
    assert coerce_to_int("Score: 92 out of 100") == 92
    assert coerce_to_int("none") == 0
    assert coerce_to_int(None) == 0

    print("✓ coerce_to_int passed")


def test_coerce_and_validate_analysis_response():
    print("Testing coerce_and_validate_analysis_response...")
    
    # Missing everything
    empty_res = coerce_and_validate_analysis_response({})
    assert empty_res["research_domain"] == ""
    assert empty_res["publication_readiness_score"] == 0
    assert empty_res["strengths"] == []
    
    # Mixed fields with incorrect types/naming formats
    mixed_input = {
        "ResearchDomain": "Deep Learning",
        "executive-summary": ["Summary line 1", "Summary line 2"],
        "strengths": "Strength 1\n* Strength 2",
        "publicationReadinessScore": "95/100",
        # leave other fields missing
    }
    coerced = coerce_and_validate_analysis_response(mixed_input)
    
    assert coerced["research_domain"] == "Deep Learning"
    assert coerced["executive_summary"] == "Summary line 1\nSummary line 2"
    assert coerced["strengths"] == ["Strength 1", "Strength 2"]
    assert coerced["publication_readiness_score"] == 95
    # Ensure missing fields are populated with defaults
    assert coerced["viva_questions"] == []
    assert coerced["publication_readiness_justification"] == ""

    print("✓ coerce_and_validate_analysis_response passed")


if __name__ == "__main__":
    print("Running backend parsing and validation unit tests...")
    print("=" * 60)
    try:
        test_extract_json_block()
        test_normalize_keys()
        test_coerce_to_string_list()
        test_coerce_to_string()
        test_coerce_to_int()
        test_coerce_and_validate_analysis_response()
        print("=" * 60)
        print("ALL TESTS PASSED SUCCESSFULLY!")
        sys.exit(0)
    except AssertionError as e:
        print("=" * 60)
        print("TEST FAILURE:", e)
        import traceback
        traceback.print_exc()
        sys.exit(1)

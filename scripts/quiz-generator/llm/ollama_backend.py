"""Ollama backend for LLM-powered question generation.

Uses the local Ollama API to generate questions without requiring
an external API key.
"""

import json
import logging

from tenacity import retry, stop_after_attempt, wait_exponential

from models.question import GeneratedQuestion

logger = logging.getLogger(__name__)


@retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=2, max=10))
def _call_ollama(model: str, system_prompt: str, user_prompt: str) -> str:
    """Call Ollama API with retry logic."""
    import ollama

    response = ollama.chat(
        model=model,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        options={"temperature": 0.7, "num_predict": 512},
    )
    return response["message"]["content"]


def generate_question_ollama(
    model: str, system_prompt: str, user_prompt: str,
    chapter_id: str, source_file: str, source_type: str = "llm_scenario",
) -> GeneratedQuestion | None:
    """Generate a single question using Ollama.

    Args:
        model: Ollama model name (e.g., "qwen3:8b").
        system_prompt: System prompt from llm.prompts.
        user_prompt: User prompt with procedure content.
        chapter_id: Chapter ID for the question.
        source_file: Source section file.
        source_type: Source type label.

    Returns:
        GeneratedQuestion or None if generation fails.
    """
    try:
        raw_response = _call_ollama(model, system_prompt, user_prompt)
    except Exception as e:
        logger.error(f"Ollama API call failed: {e}")
        return None

    return _parse_llm_response(raw_response, chapter_id, source_file, source_type)


def _parse_llm_response(
    raw: str, chapter_id: str, source_file: str, source_type: str
) -> GeneratedQuestion | None:
    """Parse LLM response into a GeneratedQuestion.

    The LLM should return JSON. This function tries to extract JSON
    from the response and validate it.
    """
    # Try to extract JSON from the response (may be wrapped in ```json ... ```)
    json_str = raw.strip()
    if "```json" in json_str:
        json_str = json_str.split("```json")[1].split("```")[0].strip()
    elif "```" in json_str:
        json_str = json_str.split("```")[1].split("```")[0].strip()

    try:
        data = json.loads(json_str)
    except json.JSONDecodeError:
        logger.warning(f"Failed to parse LLM response as JSON: {raw[:200]}")
        return None

    # Validate required fields
    required = {"text", "options", "answer", "explanation"}
    if not required.issubset(data.keys()):
        logger.warning(f"LLM response missing required fields: {set(data.keys())}")
        return None

    options = data["options"]
    if not isinstance(options, list) or len(options) != 4:
        logger.warning(f"LLM response has wrong number of options: {len(options)}")
        return None

    answer = data["answer"].upper()
    if answer not in {"A", "B", "C", "D"}:
        logger.warning(f"LLM response has invalid answer: {answer}")
        return None

    # Verify answer matches an option
    answer_idx = ord(answer) - ord("A")
    if answer_idx >= len(options):
        logger.warning(f"LLM answer index out of range: {answer}")
        return None

    difficulty = data.get("difficulty", "medium")
    if difficulty not in {"easy", "medium", "hard"}:
        difficulty = "medium"

    # Generate a question ID
    import hashlib

    q_hash = hashlib.md5(data["text"].encode()).hexdigest()[:6]

    return GeneratedQuestion(
        question_id=f"{chapter_id.split('-')[0]}-llm-{q_hash}",
        chapter_id=chapter_id,
        source_type=source_type,
        source_file=source_file,
        text=data["text"],
        options=tuple(str(o) for o in options),
        answer=answer,
        explanation=data["explanation"],
        difficulty=difficulty,
    )
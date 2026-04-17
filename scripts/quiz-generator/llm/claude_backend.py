"""Claude API backend for LLM-powered question generation.

Uses the Anthropic Python SDK to generate questions via the Claude API.
Requires ANTHROPIC_API_KEY environment variable.
"""

import json
import logging
import os

from tenacity import retry, stop_after_attempt, wait_exponential

from models.question import GeneratedQuestion

logger = logging.getLogger(__name__)

DEFAULT_MODEL = "claude-sonnet-4-6-20250514"


@retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=2, max=10))
def _call_claude(model: str, system_prompt: str, user_prompt: str) -> str:
    """Call Claude API with retry logic."""
    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        raise KeyError("ANTHROPIC_API_KEY environment variable is required for Claude backend")

    import anthropic

    client = anthropic.Anthropic(api_key=api_key)
    message = client.messages.create(
        model=model,
        max_tokens=512,
        system=system_prompt,
        messages=[{"role": "user", "content": user_prompt}],
        temperature=0.7,
    )
    return message.content[0].text


def generate_question_claude(
    model: str, system_prompt: str, user_prompt: str,
    chapter_id: str, source_file: str, source_type: str = "llm_scenario",
) -> GeneratedQuestion | None:
    """Generate a single question using the Claude API.

    Args:
        model: Claude model name (e.g., "claude-sonnet-4-6-20250514").
        system_prompt: System prompt from llm.prompts.
        user_prompt: User prompt with procedure content.
        chapter_id: Chapter ID for the question.
        source_file: Source section file.
        source_type: Source type label.

    Returns:
        GeneratedQuestion or None if generation fails.
    """
    try:
        raw_response = _call_claude(model, system_prompt, user_prompt)
    except Exception as e:
        logger.error(f"Claude API call failed: {e}")
        return None

    # Reuse the same parser as Ollama (both return JSON)
    from llm.ollama_backend import _parse_llm_response

    return _parse_llm_response(raw_response, chapter_id, source_file, source_type)
"""LLM-powered scenario question generator.

Orchestrates question generation using Ollama or Claude backends.
Generates scenario-based, comparison, and EXCEPT questions.
"""

import logging
from pathlib import Path

from llm.claude_backend import generate_question_claude
from llm.ollama_backend import generate_question_ollama
from llm.prompts import (
    COMPARISON_SYSTEM_PROMPT,
    COMPARISON_USER_TEMPLATE,
    EXCEPT_SYSTEM_PROMPT,
    EXCEPT_USER_TEMPLATE,
    SCENARIO_SYSTEM_PROMPT,
    SCENARIO_USER_TEMPLATE,
)
from models.callout import ExistingQuestion
from models.question import GeneratedQuestion

logger = logging.getLogger(__name__)

DEFAULT_OLLAMA_MODEL = "qwen3:8b"
DEFAULT_CLAUDE_MODEL = "claude-sonnet-4-6-20250514"


def _load_section_content(chapters_dir: Path, chapter_id: str) -> dict[str, str]:
    """Load all section file contents for a chapter."""
    chapter_dir = chapters_dir / chapter_id
    sections: dict[str, str] = {}
    if not chapter_dir.is_dir():
        return sections

    for section_file in sorted(chapter_dir.glob("section-*.md")):
        content = section_file.read_text(encoding="utf-8")
        # Truncate to ~2000 chars to fit in prompts
        if len(content) > 2000:
            content = content[:2000] + "..."
        sections[section_file.name] = content

    return sections


def _format_existing_questions(questions: list[ExistingQuestion]) -> str:
    """Format existing questions as text to include in LLM prompt."""
    if not questions:
        return "(No existing questions for this chapter)"
    return "\n".join(f"Q: {q.text[:100]}" for q in questions[:10])


def generate_llm_questions(
    chapters_dir: Path,
    chapter_id: str,
    existing_questions: list[ExistingQuestion],
    llm_backend: str = "ollama",
    max_questions: int = 5,
) -> list[GeneratedQuestion]:
    """Generate LLM-powered questions for a chapter.

    Args:
        chapters_dir: Path to chapters/ directory.
        chapter_id: Chapter to generate questions for.
        existing_questions: Existing questions for dedup context.
        llm_backend: "ollama" or "claude".
        max_questions: Maximum questions to generate.

    Returns:
        List of GeneratedQuestion objects.
    """
    sections = _load_section_content(chapters_dir, chapter_id)
    if not sections:
        logger.warning(f"No section files found for chapter {chapter_id}")
        return []

    existing_text = _format_existing_questions(existing_questions)
    questions: list[GeneratedQuestion] = []
    generated = 0

    for filename, content in sections.items():
        if generated >= max_questions:
            break

        # Extract procedure number from content
        import re

        proc_match = re.search(r"##\s+((?:P\.G\.|A\.G\.)\s+\d+-\d+)", content)
        procedure = proc_match.group(1) if proc_match else "Unknown"

        # Generate a scenario question
        scenario_prompt = SCENARIO_USER_TEMPLATE.format(
            procedure=procedure,
            content=content,
            existing_questions=existing_text,
        )

        if llm_backend == "ollama":
            q = generate_question_ollama(
                model=DEFAULT_OLLAMA_MODEL,
                system_prompt=SCENARIO_SYSTEM_PROMPT,
                user_prompt=scenario_prompt,
                chapter_id=chapter_id,
                source_file=filename,
                source_type="llm_scenario",
            )
        else:
            q = generate_question_claude(
                model=DEFAULT_CLAUDE_MODEL,
                system_prompt=SCENARIO_SYSTEM_PROMPT,
                user_prompt=scenario_prompt,
                chapter_id=chapter_id,
                source_file=filename,
                source_type="llm_scenario",
            )

        if q:
            questions.append(q)
            generated += 1

        # Generate an EXCEPT question for the next section
        if generated >= max_questions:
            break

        except_prompt = EXCEPT_USER_TEMPLATE.format(
            procedure=procedure,
            content=content,
        )

        if llm_backend == "ollama":
            q = generate_question_ollama(
                model=DEFAULT_OLLAMA_MODEL,
                system_prompt=EXCEPT_SYSTEM_PROMPT,
                user_prompt=except_prompt,
                chapter_id=chapter_id,
                source_file=filename,
                source_type="llm_except",
            )
        else:
            q = generate_question_claude(
                model=DEFAULT_CLAUDE_MODEL,
                system_prompt=EXCEPT_SYSTEM_PROMPT,
                user_prompt=except_prompt,
                chapter_id=chapter_id,
                source_file=filename,
                source_type="llm_except",
            )

        if q:
            questions.append(q)
            generated += 1

    return questions
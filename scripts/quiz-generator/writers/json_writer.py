"""Write generated questions as JSON for the Flutter data pipeline."""

import json
from pathlib import Path

from models.question import GeneratedQuestion


def questions_to_dict(questions: list[GeneratedQuestion]) -> list[dict]:
    """Convert GeneratedQuestion objects to JSON-serializable dicts."""
    return [
        {
            "question_id": q.question_id,
            "chapter_id": q.chapter_id,
            "source_type": q.source_type,
            "source_file": q.source_file,
            "text": q.text,
            "options": list(q.options),
            "answer": q.answer,
            "explanation": q.explanation,
            "difficulty": q.difficulty,
        }
        for q in questions
    ]


def write_questions_json(
    questions: list[GeneratedQuestion],
    output_path: Path,
) -> None:
    """Write all questions as a single JSON file.

    Args:
        questions: Questions to write.
        output_path: Path to the output JSON file.
    """
    output_path.parent.mkdir(parents=True, exist_ok=True)

    # Group by chapter
    chapters: dict[str, list[dict]] = {}
    for q_dict in questions_to_dict(questions):
        chapter_id = q_dict["chapter_id"]
        chapters.setdefault(chapter_id, []).append(q_dict)

    data = {
        "version": "1.0.0",
        "total_questions": len(questions),
        "chapters": {
            chapter_id: {
                "questions": chapter_questions,
            }
            for chapter_id, chapter_questions in chapters.items()
        },
    }

    output_path.write_text(json.dumps(data, indent=2, ensure_ascii=False), encoding="utf-8")
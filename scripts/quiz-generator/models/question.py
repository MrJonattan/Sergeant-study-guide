"""Frozen dataclass for generated questions."""

from dataclasses import dataclass


@dataclass(frozen=True)
class GeneratedQuestion:
    """A generated multiple-choice question."""

    question_id: str
    chapter_id: str
    source_type: str  # "exam_alert" | "sergeant_focus" | "key_term" | "numeric" | "llm_scenario"
    source_file: str
    text: str
    options: tuple[str, ...]  # ("A) ...", "B) ...", "C) ...", "D) ...")
    answer: str  # "A" | "B" | "C" | "D"
    explanation: str
    difficulty: str  # "easy" | "medium" | "hard"
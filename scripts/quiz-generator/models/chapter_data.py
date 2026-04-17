"""Frozen dataclass for parsed chapter content."""

from dataclasses import dataclass

from models.callout import ExamAlert, KeyTerm, NumericFact, SergeantFocus
from models.question import GeneratedQuestion


@dataclass(frozen=True)
class ParsedChapter:
    """All parsed content for a single chapter."""

    chapter_id: str
    exam_alerts: tuple[ExamAlert, ...]
    sergeant_focus: tuple[SergeantFocus, ...]
    key_terms: tuple[KeyTerm, ...]
    numeric_facts: tuple[NumericFact, ...]
    existing_questions: tuple  # tuple[ExistingQuestion, ...]
"""Frozen dataclasses for parsed callouts and content."""

from dataclasses import dataclass


@dataclass(frozen=True)
class ExamAlert:
    """An Exam Alert callout extracted from a section file."""

    chapter_id: str
    section_file: str
    procedure: str
    text: str
    line_number: int


@dataclass(frozen=True)
class SergeantFocus:
    """A Sergeant Focus callout extracted from a section file."""

    chapter_id: str
    section_file: str
    procedure: str
    text: str
    line_number: int


@dataclass(frozen=True)
class MemoryAid:
    """A Memory Aid callout extracted from a section file."""

    chapter_id: str
    section_file: str
    procedure: str
    label: str
    text: str
    line_number: int


@dataclass(frozen=True)
class NumericFact:
    """A critical number/timeframe extracted from section content."""

    chapter_id: str
    section_file: str
    procedure: str
    value: str
    context: str
    line_number: int


@dataclass(frozen=True)
class KeyTerm:
    """A key term extracted from a key-terms.md table."""

    chapter_id: str
    term: str
    definition: str
    source: str


@dataclass(frozen=True)
class ExistingQuestion:
    """An existing question parsed from review-questions.md."""

    chapter_id: str
    number: int
    text: str
    options: tuple[str, ...]
    answer: str
    explanation: str
"""Parse key-terms.md markdown tables into KeyTerm dataclasses.

Handles the format: | **Term** | Definition | Source |
"""

import re
from pathlib import Path

from models.callout import KeyTerm

TABLE_ROW_PATTERN = re.compile(
    r"^\|\s*\*\*(.+?)\*\*\s*\|\s*(.+?)\s*\|\s*(.+?)\s*\|", re.MULTILINE
)


def parse_key_terms(content: str, chapter_id: str) -> list[KeyTerm]:
    """Parse key-terms.md content into a list of KeyTerm objects.

    Skips header rows and separator rows (containing only dashes).
    """
    terms: list[KeyTerm] = []

    for match in TABLE_ROW_PATTERN.finditer(content):
        term_text = match.group(1).strip()
        definition = match.group(2).strip()
        source = match.group(3).strip()

        # Skip header row
        if term_text.lower() == "term" and definition.lower() == "definition":
            continue

        # Skip separator rows (shouldn't match the bold pattern, but just in case)
        if re.match(r"^[-:]+$", term_text):
            continue

        terms.append(KeyTerm(
            chapter_id=chapter_id,
            term=term_text,
            definition=definition,
            source=source,
        ))

    return terms


def extract_all_key_terms(
    chapters_dir: Path, chapter_ids: tuple[str, ...] = ()
) -> list[KeyTerm]:
    """Extract key terms from all or specified chapters."""
    all_terms: list[KeyTerm] = []

    chapter_dirs = sorted(chapters_dir.iterdir()) if chapters_dir.is_dir() else []

    for chapter_dir in chapter_dirs:
        if not chapter_dir.is_dir():
            continue

        chapter_id = chapter_dir.name
        if chapter_ids and chapter_id not in chapter_ids:
            continue

        key_terms_file = chapter_dir / "key-terms.md"
        if key_terms_file.exists():
            content = key_terms_file.read_text(encoding="utf-8")
            terms = parse_key_terms(content, chapter_id)
            all_terms.extend(terms)

    return all_terms
"""Extract critical numbers and timeframes from section content.

Patterns matched:
  - Bold numbers: **90 days**, **24 hours**, **TWO MOS**
  - Duration patterns: N days/hours/minutes/years/weeks
  - Bold standalone numbers in callouts: **three** hair samples, **six** exceptions
"""

import re
from pathlib import Path

from models.callout import NumericFact

# Duration patterns: "90 days", "24 hours", "18 months", "3 years", "12-18 months"
DURATION_PATTERN = re.compile(
    r"\*{0,2}(\d+(?:-\d+)?(?:\s+to\s+\d+)?)\s+"
    r"(days?|hours?|minutes?|months?|years?|weeks?|tours?)\*{0,2}",
    re.IGNORECASE,
)

# Bold standalone numbers: **three**, **TWO MOS**, **12-18 months**
BOLD_NUMBER_PATTERN = re.compile(
    r"\*\*((?:ONE|TWO|THREE|FOUR|FIVE|SIX|SEVEN|EIGHT|NINE|TEN|"
    r"ELEVEN|TWELVE|FIFTEEN|TWENTY|THIRTY|FIFTY|HUNDRED|"
    r"\d+(?:-\d+)?(?:\s+to\s+\d+)?"
    r")(?:\s+(?:MOS|years?|days?|hours?|months?|weeks?|minutes?))?)\*\*",
    re.IGNORECASE,
)


def _extract_procedure(content: str, filename: str) -> str:
    """Extract procedure number from content or filename."""
    match = re.search(r"##\s+((?:P\.G\.|A\.G\.)\s+\d+-\d+)", content)
    if match:
        return match.group(1)
    proc_match = re.search(r"section-(\d+-\d+)", filename)
    if proc_match:
        num = proc_match.group(1)
        guide = "A.G." if int(num.split("-")[0]) >= 300 else "P.G."
        return f"{guide} {num}"
    return "Unknown"


def extract_numeric_facts(
    content: str, chapter_id: str, filename: str
) -> list[NumericFact]:
    """Extract critical numbers/timeframes from section content."""
    procedure = _extract_procedure(content, filename)
    facts: list[NumericFact] = []
    seen: set[str] = set()

    for match in DURATION_PATTERN.finditer(content):
        value = f"{match.group(1)} {match.group(2)}"
        if value.lower() in seen:
            continue
        seen.add(value.lower())

        # Get surrounding context (up to 150 chars before the match)
        start = max(0, match.start() - 150)
        context = content[start:match.end()].strip()
        # Clean up context — remove newlines and extra spaces
        context = re.sub(r"\s+", " ", context)

        line_number = content[: match.start()].count("\n") + 1

        facts.append(NumericFact(
            chapter_id=chapter_id,
            section_file=filename,
            procedure=procedure,
            value=value,
            context=context,
            line_number=line_number,
        ))

    for match in BOLD_NUMBER_PATTERN.finditer(content):
        value = match.group(1)
        if value.lower() in seen:
            continue
        seen.add(value.lower())

        start = max(0, match.start() - 150)
        context = content[start:match.end()].strip()
        context = re.sub(r"\s+", " ", context)

        line_number = content[: match.start()].count("\n") + 1

        facts.append(NumericFact(
            chapter_id=chapter_id,
            section_file=filename,
            procedure=procedure,
            value=value,
            context=context,
            line_number=line_number,
        ))

    return facts


def extract_all_numeric_facts(
    chapters_dir: Path, chapter_ids: tuple[str, ...] = ()
) -> list[NumericFact]:
    """Extract numeric facts from all or specified chapters."""
    all_facts: list[NumericFact] = []

    chapter_dirs = sorted(chapters_dir.iterdir()) if chapters_dir.is_dir() else []

    for chapter_dir in chapter_dirs:
        if not chapter_dir.is_dir():
            continue

        chapter_id = chapter_dir.name
        if chapter_ids and chapter_id not in chapter_ids:
            continue

        for section_file in sorted(chapter_dir.glob("section-*.md")):
            content = section_file.read_text(encoding="utf-8")
            filename = section_file.name
            facts = extract_numeric_facts(content, chapter_id, filename)
            all_facts.extend(facts)

    return all_facts
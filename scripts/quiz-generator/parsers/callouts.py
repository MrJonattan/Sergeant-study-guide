"""Extract Exam Alert, Sergeant Focus, and other callouts from section markdown files.

Parses multi-line blockquote callouts like:
    > **Exam Alert:** Text here...
    > continuation line

Supports: Exam Alert, Sergeant Focus, Memory Aid, Prior Test, PG Conflict, See Also.
"""

import re
from pathlib import Path

from models.callout import ExamAlert, MemoryAid, SergeantFocus

# Matches a blockquote callout: > **LABEL:** followed by text on the same line
# and any continuation blockquote lines (> text) that don't start a new callout.
CALLOUT_BLOCK_PATTERN = re.compile(
    r"(^>\s+\*\*(Exam Alert|Sergeant Focus|Memory Aid(?:\s+--\s+\w+)?|"
    r"Prior Test|PG Conflict|See Also):\*\*\s*.+)"
    r"((?:\n>\s+(?!\*\*)(?:.+:)*\s*.+)*)",
    re.MULTILINE,
)

CALLOUT_TYPES = {
    "Exam Alert": "exam_alert",
    "Sergeant Focus": "sergeant_focus",
    "Memory Aid": "memory_aid",
    "Prior Test": "prior_test",
    "PG Conflict": "pg_conflict",
    "See Also": "see_also",
}


def extract_callout_procedure(content: str, filename: str) -> str:
    """Extract the procedure number (e.g., 'P.G. 208-01') from section file content."""
    # Match ## A.G. 332-05 or ## P.G. 208-01 patterns
    match = re.search(r"##\s+((?:P\.G\.|A\.G\.)\s+\d+-\d+)", content)
    if match:
        return match.group(1)

    # Fallback: extract from filename like section-208-03.md -> P.G. 208-03
    proc_match = re.search(r"section-(\d+-\d+)", filename)
    if proc_match:
        num = proc_match.group(1)
        guide = "A.G." if int(num.split("-")[0]) >= 300 else "P.G."
        return f"{guide} {num}"

    return "Unknown"


def _join_blockquote_lines(first_line: str, continuation_match: re.Match | None) -> str:
    """Join the first callout line with any continuation blockquote lines."""
    parts = [first_line.strip()]
    if continuation_match:
        # The regex captures continuation lines as separate groups
        full_match = continuation_match.group(0)
        for line in full_match.split("\n"):
            if line.startswith(">") and not re.match(r"^>\s+\*\*", line):
                text = re.sub(r"^>\s+", "", line).strip()
                if text:
                    parts.append(text)
    return " ".join(parts)


def extract_callouts(
    content: str, chapter_id: str, filename: str
) -> tuple[list[ExamAlert], list[SergeantFocus], list[MemoryAid]]:
    """Extract all callouts from a section file's content.

    Returns (exam_alerts, sergeant_focuses, memory_aids).
    """
    procedure = extract_callout_procedure(content, filename)
    exam_alerts: list[ExamAlert] = []
    sergeant_focuses: list[SergeantFocus] = []
    memory_aids: list[MemoryAid] = []

    for match in CALLOUT_BLOCK_PATTERN.finditer(content):
        label = match.group(2).strip()

        # Get the full blockquote text including continuation lines
        full_block = match.group(1) + match.group(3)
        text_parts: list[str] = []
        for line in full_block.split("\n"):
            line = line.strip()
            if not line.startswith(">"):
                continue
            # Strip the "> " prefix
            text = re.sub(r"^>\s+", "", line).strip()
            if not text:
                continue
            # Strip the **LABEL:** prefix from the first line
            if text.startswith("**") and ":**" in text:
                prefix_end = text.index(":**") + 3
                text = text[prefix_end:].strip()
            if text:
                text_parts.append(text)
        text = " ".join(text_parts)

        line_number = content[: match.start()].count("\n") + 1
        callout_type = None
        for key, ctype in CALLOUT_TYPES.items():
            if label.startswith(key):
                callout_type = ctype
                break

        if callout_type == "exam_alert":
            exam_alerts.append(ExamAlert(
                chapter_id=chapter_id,
                section_file=filename,
                procedure=procedure,
                text=text,
                line_number=line_number,
            ))
        elif callout_type == "sergeant_focus":
            sergeant_focuses.append(SergeantFocus(
                chapter_id=chapter_id,
                section_file=filename,
                procedure=procedure,
                text=text,
                line_number=line_number,
            ))
        elif callout_type == "memory_aid":
            memory_aid_label = label.replace("Memory Aid", "").strip().lstrip("--").strip()
            memory_aids.append(MemoryAid(
                chapter_id=chapter_id,
                section_file=filename,
                procedure=procedure,
                label=memory_aid_label or "General",
                text=text,
                line_number=line_number,
            ))

    return exam_alerts, sergeant_focuses, memory_aids


def extract_all_callouts(
    chapters_dir: Path, chapter_ids: tuple[str, ...] = ()
) -> tuple[list[ExamAlert], list[SergeantFocus], list[MemoryAid]]:
    """Extract callouts from all or specified chapters.

    Args:
        chapters_dir: Path to the chapters/ directory.
        chapter_ids: Specific chapter IDs to process. Empty tuple = all chapters.

    Returns:
        (all_exam_alerts, all_sergeant_focuses, all_memory_aids)
    """
    all_exam_alerts: list[ExamAlert] = []
    all_sergeant_focuses: list[SergeantFocus] = []
    all_memory_aids: list[MemoryAid] = []

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
            alerts, focuses, aids = extract_callouts(content, chapter_id, filename)
            all_exam_alerts.extend(alerts)
            all_sergeant_focuses.extend(focuses)
            all_memory_aids.extend(aids)

    return all_exam_alerts, all_sergeant_focuses, all_memory_aids
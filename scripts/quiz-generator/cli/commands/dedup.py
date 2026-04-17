"""CLI command: nypd-quiz dedup — check for duplicate questions."""

import difflib
import json
import logging
from pathlib import Path

from models.callout import ExistingQuestion
from parsers.review_questions import extract_all_existing_questions

logger = logging.getLogger(__name__)


def run_dedup(chapters_dir: Path, chapter_ids: tuple[str, ...], threshold: float) -> None:
    """Check generated questions for duplicates against existing questions.

    Uses fuzzy matching with difflib.SequenceMatcher.
    """
    from rich.console import Console

    console = Console()
    from config import OUTPUT_DIR

    # Load generated questions
    json_path = OUTPUT_DIR / "generated-questions.json"
    if not json_path.exists():
        console.print("[yellow]No generated questions found. Run 'nypd-quiz generate' first.[/]")
        return

    data = json.loads(json_path.read_text(encoding="utf-8"))
    generated: list[dict] = []
    for chapter_data in data.get("chapters", {}).values():
        generated.extend(chapter_data.get("questions", []))

    if not generated:
        console.print("[yellow]No questions found in generated file.[/]")
        return

    # Load existing questions
    existing = extract_all_existing_questions(chapters_dir, chapter_ids)
    console.print(f"Comparing {len(generated)} generated against {len(existing)} existing questions (threshold={threshold})")

    duplicates: list[tuple[dict, ExistingQuestion, float]] = []

    for gen_q in generated:
        gen_text = gen_q.get("text", "").lower()
        for ex_q in existing:
            ex_text = ex_q.text.lower()
            ratio = difflib.SequenceMatcher(None, gen_text, ex_text).ratio()
            if ratio >= threshold:
                duplicates.append((gen_q, ex_q, ratio))

    if duplicates:
        console.print(f"\n[red]Found {len(duplicates)} potential duplicates:[/]")
        for gen_q, ex_q, ratio in duplicates[:20]:
            console.print(
                f"  [yellow]{ratio:.0%}[/] match: "
                f"[dim]{gen_q.get('question_id', '?')}[/] <-> "
                f"[dim]existing Q{ex_q.number} in {ex_q.chapter_id}[/]"
            )
        if len(duplicates) > 20:
            console.print(f"  ... and {len(duplicates) - 20} more")
    else:
        console.print(f"\n[green]No duplicates found! All {len(generated)} generated questions are unique.[/]")
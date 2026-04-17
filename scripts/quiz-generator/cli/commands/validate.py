"""CLI command: nypd-quiz validate — check generated questions for correctness."""

import json
import logging
from pathlib import Path

from models.question import GeneratedQuestion

logger = logging.getLogger(__name__)


def run_validate(chapters_dir: Path, chapter_ids: tuple[str, ...]) -> None:
    """Validate generated questions.

    Checks:
      - Answer letter matches one of the options
      - All four options A-D are present
      - Question text is not empty
      - Explanation is not empty
      - No duplicate question IDs
    """
    from rich.console import Console

    console = Console()
    from config import OUTPUT_DIR

    json_path = OUTPUT_DIR / "generated-questions.json"
    if not json_path.exists():
        console.print("[yellow]No generated questions found. Run 'nypd-quiz generate' first.[/]")
        return

    data = json.loads(json_path.read_text(encoding="utf-8"))
    all_questions: list[dict] = []
    for chapter_data in data.get("chapters", {}).values():
        all_questions.extend(chapter_data.get("questions", []))

    if not all_questions:
        console.print("[yellow]No questions found in generated file.[/]")
        return

    errors: list[str] = []
    seen_ids: set[str] = set()

    for q in all_questions:
        qid = q.get("question_id", "unknown")

        # Duplicate ID check
        if qid in seen_ids:
            errors.append(f"{qid}: Duplicate question ID")
        seen_ids.add(qid)

        # Empty text check
        if not q.get("text", "").strip():
            errors.append(f"{qid}: Empty question text")

        # Options check
        options = q.get("options", [])
        if len(options) != 4:
            errors.append(f"{qid}: Expected 4 options, got {len(options)}")
        else:
            letters = set()
            for opt in options:
                if not opt.strip():
                    errors.append(f"{qid}: Empty option")
                if opt and len(opt) >= 2:
                    letters.add(opt[0].upper())
            if letters != {"A", "B", "C", "D"}:
                errors.append(f"{qid}: Options don't cover A-D, got {letters}")

        # Answer check
        answer = q.get("answer", "")
        if answer not in {"A", "B", "C", "D"}:
            errors.append(f"{qid}: Invalid answer '{answer}'")

        # Explanation check
        if not q.get("explanation", "").strip():
            errors.append(f"{qid}: Empty explanation")

    if errors:
        console.print(f"[red]Found {len(errors)} validation errors:[/]")
        for err in errors[:20]:
            console.print(f"  [red]✗[/] {err}")
        if len(errors) > 20:
            console.print(f"  ... and {len(errors) - 20} more")
    else:
        console.print(f"[green]All {len(all_questions)} questions passed validation.[/]")
"""CLI command: nypd-quiz generate — generate exam-style questions."""

import logging
import sys
from pathlib import Path

from generators.exam_alert import generate_exam_alert_questions
from generators.key_term_questions import generate_key_term_questions
from generators.llm_scenarios import generate_llm_questions
from generators.numeric_recall import generate_numeric_recall_questions
from generators.sergeant_focus import generate_sergeant_focus_questions
from models.callout import ExistingQuestion
from parsers.callouts import extract_all_callouts
from parsers.key_terms import extract_all_key_terms
from parsers.numbers import extract_all_numeric_facts
from parsers.review_questions import extract_all_existing_questions
from writers.json_writer import write_questions_json
from writers.markdown_writer import append_questions_to_file, write_questions_to_file

logger = logging.getLogger(__name__)


def run_generate(
    chapters_dir: Path,
    mode: str,
    llm_backend: str,
    chapter_ids: tuple[str, ...],
    output_mode: str,
    dry_run: bool,
    max_per_chapter: int,
) -> None:
    """Execute the generate command."""
    from rich.console import Console
    from rich.table import Table

    console = Console()

    # Extract all content
    console.print("[bold blue]Extracting content from chapters...[/]")
    exam_alerts, sergeant_focuses, memory_aids = extract_all_callouts(
        chapters_dir, chapter_ids
    )
    key_terms = extract_all_key_terms(chapters_dir, chapter_ids)
    numeric_facts = extract_all_numeric_facts(chapters_dir, chapter_ids)
    existing_questions = extract_all_existing_questions(chapters_dir, chapter_ids)

    console.print(
        f"  Found: {len(exam_alerts)} Exam Alerts, "
        f"{len(sergeant_focuses)} Sergeant Focus, "
        f"{len(key_terms)} Key Terms, "
        f"{len(numeric_facts)} Numeric Facts, "
        f"{len(existing_questions)} Existing Questions"
    )

    # Group by chapter for generation
    chapters_to_process = chapter_ids if chapter_ids else _get_all_chapter_ids(chapters_dir)

    all_generated: list = []
    for chapter_id in sorted(chapters_to_process):
        chapter_alerts = [a for a in exam_alerts if a.chapter_id == chapter_id]
        chapter_focuses = [f for f in sergeant_focuses if f.chapter_id == chapter_id]
        chapter_terms = [t for t in key_terms if t.chapter_id == chapter_id]
        chapter_nums = [n for n in numeric_facts if n.chapter_id == chapter_id]
        chapter_existing = [q for q in existing_questions if q.chapter_id == chapter_id]

        chapter_questions = []

        if mode in ("rule-based", "all"):
            # Distribute max_per_chapter across generators
            per_type = max(2, max_per_chapter // 4)

            chapter_questions.extend(
                generate_exam_alert_questions(chapter_alerts, chapter_id, per_type)
            )
            chapter_questions.extend(
                generate_sergeant_focus_questions(chapter_focuses, chapter_id, per_type)
            )
            chapter_questions.extend(
                generate_key_term_questions(chapter_terms, chapter_id, per_type)
            )
            chapter_questions.extend(
                generate_numeric_recall_questions(
                    chapter_nums, chapter_id, per_type, numeric_facts
                )
            )

        if mode in ("llm", "all"):
            llm_max = max(3, max_per_chapter // 2) if mode == "all" else max_per_chapter
            chapter_questions.extend(
                generate_llm_questions(
                    chapters_dir, chapter_id, chapter_existing,
                    llm_backend=llm_backend, max_questions=llm_max,
                )
            )

        # Limit total per chapter
        chapter_questions = chapter_questions[:max_per_chapter]
        all_generated.extend(chapter_questions)

        if chapter_questions:
            console.print(
                f"  [green]{chapter_id}[/]: {len(chapter_questions)} questions generated"
            )

    if not all_generated:
        console.print("[yellow]No questions were generated.[/]")
        return

    # Summary table
    table = Table(title="Generation Summary")
    table.add_column("Type", style="cyan")
    table.add_column("Count", justify="right")
    source_counts: dict[str, int] = {}
    for q in all_generated:
        source_counts[q.source_type] = source_counts.get(q.source_type, 0) + 1
    for source_type, count in sorted(source_counts.items()):
        table.add_row(source_type, str(count))
    table.add_row("[bold]Total[/]", f"[bold]{len(all_generated)}[/]")
    console.print(table)

    if dry_run:
        console.print(f"\n[yellow]Dry run — {len(all_generated)} questions generated but not written.[/]")
        for q in all_generated[:5]:
            console.print(f"  {q.question_id}: {q.text[:80]}...")
        if len(all_generated) > 5:
            console.print(f"  ... and {len(all_generated) - 5} more")
        return

    # Write output
    from config import OUTPUT_DIR

    # Write JSON
    json_path = OUTPUT_DIR / "generated-questions.json"
    write_questions_json(all_generated, json_path)
    console.print(f"\nJSON output: {json_path}")

    # Write markdown per chapter
    from models.question import GeneratedQuestion

    chapters_with_questions: dict[str, list] = {}
    for q in all_generated:
        chapters_with_questions.setdefault(q.chapter_id, []).append(q)

    for cid, questions in chapters_with_questions.items():
        if output_mode == "separate":
            md_path = chapters_dir / cid / "generated-questions.md"
            header = f"# Generated Questions — {cid}\n\nAuto-generated by nypd-quiz-generator. Review before merging."
            write_questions_to_file(questions, md_path, header)
            console.print(f"Markdown: {md_path}")
        else:
            # Append to existing review-questions.md
            review_path = chapters_dir / cid / "review-questions.md"
            existing_for_chapter = [q for q in existing_questions if q.chapter_id == cid]
            start_num = len(existing_for_chapter) + 1
            append_questions_to_file(questions, review_path, start_num)
            console.print(f"Appended to: {review_path}")

    console.print(f"\n[bold green]Done! {len(all_generated)} questions written.[/]")


def _get_all_chapter_ids(chapters_dir: Path) -> list[str]:
    """Get all chapter directory names."""
    if not chapters_dir.is_dir():
        return []
    return sorted(
        d.name for d in chapters_dir.iterdir()
        if d.is_dir() and not d.name.startswith(".")
    )
"""NYPD Sergeant Quiz Generator CLI."""

import click


@click.group()
@click.option("--chapters-dir", envvar="NYPD_CHAPTERS_DIR", default=None,
              help="Path to chapters/ directory (default: auto-detect from project root)")
@click.option("--log-level", type=click.Choice(["DEBUG", "INFO", "WARNING", "ERROR"]),
              default="INFO", help="Logging level")
@click.pass_context
def cli(ctx: click.Context, chapters_dir: str | None, log_level: str) -> None:
    """NYPD Sergeant Quiz Generator — generate exam-style questions from Patrol Guide content."""
    ctx.ensure_object(dict)
    ctx.obj["log_level"] = log_level

    if chapters_dir:
        from config import CHAPTERS_DIR as _default

        from pathlib import Path

        ctx.obj["chapters_dir"] = Path(chapters_dir)
    else:
        from config import CHAPTERS_DIR

        ctx.obj["chapters_dir"] = CHAPTERS_DIR


# Lazy-load commands to keep startup fast
@cli.command()
@click.option("--mode", type=click.Choice(["rule-based", "llm", "all"]),
              default="rule-based", help="Generation mode")
@click.option("--llm-backend", type=click.Choice(["ollama", "claude"]),
              default="ollama", help="LLM backend for AI-generated questions")
@click.option("--chapters", "-c", multiple=True,
              help="Specific chapter IDs (default: all chapters)")
@click.option("--output", type=click.Choice(["append", "separate"]),
              default="separate", help="Append to review-questions.md or create generated-questions.md")
@click.option("--dry-run", is_flag=True, help="Print questions without writing files")
@click.option("--max-per-chapter", default=10, help="Max questions to generate per chapter")
@click.pass_context
def generate(ctx: click.Context, mode: str, llm_backend: str, chapters: tuple[str, ...],
             output: str, dry_run: bool, max_per_chapter: int) -> None:
    """Generate exam-style questions from chapter content."""
    from cli.commands.generate import run_generate

    run_generate(
        chapters_dir=ctx.obj["chapters_dir"],
        mode=mode,
        llm_backend=llm_backend,
        chapter_ids=chapters,
        output_mode=output,
        dry_run=dry_run,
        max_per_chapter=max_per_chapter,
    )


@cli.command()
@click.option("--chapters", "-c", multiple=True,
              help="Specific chapter IDs (default: all chapters)")
@click.pass_context
def validate(ctx: click.Context, chapters: tuple[str, ...]) -> None:
    """Validate generated questions for correctness."""
    from cli.commands.validate import run_validate

    run_validate(
        chapters_dir=ctx.obj["chapters_dir"],
        chapter_ids=chapters,
    )


@cli.command()
@click.option("--chapters", "-c", multiple=True,
              help="Specific chapter IDs (default: all chapters)")
@click.option("--threshold", default=0.8, type=float,
              help="Similarity threshold for fuzzy dedup (0.0-1.0)")
@click.pass_context
def dedup(ctx: click.Context, chapters: tuple[str, ...], threshold: float) -> None:
    """Check for duplicate questions against existing review-questions.md."""
    from cli.commands.dedup import run_dedup

    run_dedup(
        chapters_dir=ctx.obj["chapters_dir"],
        chapter_ids=chapters,
        threshold=threshold,
    )


if __name__ == "__main__":
    cli()
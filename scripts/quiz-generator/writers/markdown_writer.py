"""Write generated questions in the review-questions.md format.

Output format matches what build-web.js parseReviewQuestions() parses:
    ### Question N
    **Question text?**

    A. Option
    B. Option
    C. Option
    D. Option

    <details>
    <summary>Answer</summary>

    **B.** Explanation...
    </details>
"""

from pathlib import Path

from models.question import GeneratedQuestion


def format_question(question: GeneratedQuestion, number: int) -> str:
    """Format a single GeneratedQuestion as markdown matching the review-questions.md format."""
    # Extract letter and text from options like "A) Option text"
    option_lines: list[str] = []
    for option in question.options:
        # Convert "A) text" to "A. text" for review-questions.md format
        option_lines.append(option.replace(")", ".", 1))

    # Format the answer line
    answer_idx = ord(question.answer) - ord("A")
    answer_text = question.options[answer_idx].split(") ", 1)[1] if ") " in question.options[answer_idx] else ""
    answer_line = f"**{question.answer}.** {question.explanation}"

    return (
        f"### Question {number}\n"
        f"**{question.text}**\n\n"
        f"{chr(10).join(option_lines)}\n\n"
        f"<details>\n"
        f"<summary>Answer</summary>\n\n"
        f"{answer_line}\n"
        f"</details>"
    )


def write_questions_to_file(
    questions: list[GeneratedQuestion],
    output_path: Path,
    header: str = "",
) -> None:
    """Write questions to a markdown file.

    Args:
        questions: Questions to write.
        output_path: Path to the output file.
        header: Optional header to prepend (e.g., "# Generated Questions").
    """
    output_path.parent.mkdir(parents=True, exist_ok=True)

    lines: list[str] = []
    if header:
        lines.append(header)
        lines.append("")

    for i, question in enumerate(questions, start=1):
        lines.append(format_question(question, i))
        lines.append("")
        lines.append("---")
        lines.append("")

    output_path.write_text("\n".join(lines), encoding="utf-8")


def append_questions_to_file(
    questions: list[GeneratedQuestion],
    existing_path: Path,
    start_number: int = 1,
) -> None:
    """Append questions to an existing review-questions.md file.

    Args:
        questions: Questions to append.
        existing_path: Path to the existing review-questions.md.
        start_number: Starting question number (should continue after existing questions).
    """
    existing_content = ""
    if existing_path.exists():
        existing_content = existing_path.read_text(encoding="utf-8")

    lines: list[str] = []
    if existing_content and not existing_content.endswith("\n"):
        lines.append("")
    lines.append("---")
    lines.append("")

    for i, question in enumerate(questions, start=start_number):
        lines.append(format_question(question, i))
        lines.append("")
        lines.append("---")
        lines.append("")

    with open(existing_path, "a", encoding="utf-8") as f:
        f.write("\n".join(lines))
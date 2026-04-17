"""Parse existing review-questions.md files for deduplication.

Handles the 3 format variants matching build-web.js parseReviewQuestions():
  Format A: ### Question N\n**Bold text?**
  Format B: **N. text?**
  Format C: **N.** text?

Options: A. ... / B. ... / C. ... / D. ... or - A) ... / A) ...
Answers: extracted from <details><summary>Answer</summary>**B.** ...</details>
"""

import re
from pathlib import Path

from models.callout import ExistingQuestion

# Split questions by --- separator or ### Question N heading
QUESTION_SPLIT = re.compile(r"\n---\n|(?=\n##?\s+Question\s+\d+)")

# Question text formats
FMT_A = re.compile(r"###\s+Question\s+\d+\s*\n+\*\*(.+?)\*\*")
FMT_B = re.compile(r"\*\*(\d+)\.\s+(.+?)\*\*")
FMT_C = re.compile(r"\*\*(\d+)\.\*\*\s+(.+)")

# Option formats
OPTION_PATTERN = re.compile(r"^[\s-]*([A-D])[.)]\s*(.+)", re.MULTILINE)

# Answer from <details> block
ANSWER_PATTERN = re.compile(
    r"<details>\s*<summary>\s*Answer\s*</summary>\s*\n*\s*\*\*([A-D])[.)]\*\*\s*(.*?)(?=</details>)",
    re.DOTALL,
)


def parse_review_questions(content: str, chapter_id: str) -> list[ExistingQuestion]:
    """Parse a review-questions.md file into ExistingQuestion objects."""
    questions: list[ExistingQuestion] = []

    blocks = QUESTION_SPLIT.split(content)
    q_num = 0

    for block in blocks:
        block = block.strip()
        if not block:
            continue

        # Try to extract question text
        question_text = ""
        match = FMT_A.search(block)
        if match:
            question_text = match.group(1).strip()
        else:
            match = FMT_B.search(block)
            if match:
                question_text = match.group(2).strip()
            else:
                match = FMT_C.search(block)
                if match:
                    question_text = match.group(2).strip()

        if not question_text:
            continue

        q_num += 1

        # Extract options
        options: list[str] = []
        for opt_match in OPTION_PATTERN.finditer(block):
            letter = opt_match.group(1)
            text = opt_match.group(2).strip()
            options.append(f"{letter}) {text}")

        if len(options) != 4:
            continue

        # Extract answer
        answer_match = ANSWER_PATTERN.search(block)
        if not answer_match:
            continue

        answer_letter = answer_match.group(1)
        explanation = answer_match.group(2).strip()

        questions.append(ExistingQuestion(
            chapter_id=chapter_id,
            number=q_num,
            text=question_text,
            options=tuple(options),
            answer=answer_letter,
            explanation=explanation,
        ))

    return questions


def extract_all_existing_questions(
    chapters_dir: Path, chapter_ids: tuple[str, ...] = ()
) -> list[ExistingQuestion]:
    """Extract existing questions from all or specified chapters."""
    all_questions: list[ExistingQuestion] = []

    chapter_dirs = sorted(chapters_dir.iterdir()) if chapters_dir.is_dir() else []

    for chapter_dir in chapter_dirs:
        if not chapter_dir.is_dir():
            continue

        chapter_id = chapter_dir.name
        if chapter_ids and chapter_id not in chapter_ids:
            continue

        review_file = chapter_dir / "review-questions.md"
        if review_file.exists():
            content = review_file.read_text(encoding="utf-8")
            questions = parse_review_questions(content, chapter_id)
            all_questions.extend(questions)

    return all_questions
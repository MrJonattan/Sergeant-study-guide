"""Rule-based generator: key-terms → definition-matching questions.

Generates definition-matching questions from key-terms tables.
Skips terms where the definition would be truncated.
"""

import random
import re

from generators.distractor import generate_sibling_distractors
from models.callout import KeyTerm
from models.question import GeneratedQuestion


def _is_truncated(text: str) -> bool:
    """Check if text appears truncated (mid-word break or trailing ellipsis)."""
    if text.endswith("..."):
        return True
    if text.rstrip().endswith("-"):
        return True
    if re.search(r"\b[a-zA-Z]\s*$", text):
        return True
    return False


def generate_key_term_questions(
    key_terms: list[KeyTerm], chapter_id: str, max_questions: int = 10
) -> list[GeneratedQuestion]:
    """Generate definition-matching questions from key-terms tables.

    Args:
        key_terms: KeyTerm objects for a chapter.
        chapter_id: The chapter ID.
        max_questions: Maximum questions to generate.

    Returns:
        List of GeneratedQuestion objects.
    """
    if not key_terms:
        return []

    questions: list[GeneratedQuestion] = []
    question_num = 0

    for term in key_terms:
        if question_num >= max_questions:
            break

        # Skip terms with very short definitions (not useful for questions)
        if len(term.definition) < 10:
            continue

        # Skip if definition would be truncated
        if _is_truncated(term.definition):
            continue

        # Use "best described as" format with full definition
        question_text = f"{term.term} is best described as:"
        correct = term.definition
        siblings = generate_sibling_distractors(term.term, key_terms, count=3)
        # Extract just the definition part from "Term: Definition" format
        distractor_terms = [s.split(":")[1].strip() if ":" in s else s for s in siblings]
        # Skip truncated distractors
        distractor_terms = [d for d in distractor_terms if not _is_truncated(d)]

        # Pad distractors if needed
        while len(distractor_terms) < 3:
            distractor_terms.append("None of the above")

        options = [correct] + distractor_terms[:3]
        correct_letter = "A"

        shuffled = list(zip(["A", "B", "C", "D"], options))
        random.shuffle(shuffled)
        for letter, option in shuffled:
            if option == correct:
                correct_letter = letter
                break

        formatted_options = tuple(f"{letter}) {option}" for letter, option in shuffled)

        question_num += 1
        questions.append(GeneratedQuestion(
            question_id=f"{chapter_id.split('-')[0]}-kt-{question_num:03d}",
            chapter_id=chapter_id,
            source_type="key_term",
            source_file="key-terms.md",
            text=question_text,
            options=formatted_options,
            answer=correct_letter,
            explanation=f"Source: {term.source}",
            difficulty="easy",
        ))

    return questions
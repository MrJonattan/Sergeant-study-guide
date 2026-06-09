"""Rule-based generator: critical numbers → numeric recall questions.

Generates questions that test recall of specific timeframes, quantities,
and thresholds mentioned in procedures.
Skips facts where the context would be truncated.
"""

import random
import re

from generators.distractor import generate_numeric_distractors
from models.callout import NumericFact
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


def _extract_action_context(fact: NumericFact) -> str:
    """Extract a short description of the action requiring the numeric value."""
    context = fact.context
    # Remove the numeric value itself from the context
    cleaned = re.sub(r"\*{0,2}" + re.escape(fact.value) + r"\*{0,2}", "___", context, flags=re.IGNORECASE)
    # Skip if context would be truncated
    if len(cleaned) > 120:
        return None
    if _is_truncated(cleaned):
        return None
    return cleaned


def generate_numeric_recall_questions(
    facts: list[NumericFact], chapter_id: str, max_questions: int = 10,
    all_numeric_facts: list[NumericFact] | None = None,
) -> list[GeneratedQuestion]:
    """Generate numeric recall questions from extracted critical numbers.

    Args:
        facts: NumericFact objects for a chapter.
        chapter_id: The chapter ID.
        max_questions: Maximum questions to generate.
        all_numeric_facts: All numeric facts (for cross-chapter distractors).

    Returns:
        List of GeneratedQuestion objects.
    """
    if not facts:
        return []

    if all_numeric_facts is None:
        all_numeric_facts = facts

    questions: list[GeneratedQuestion] = []
    question_num = 0
    seen_topics: set[str] = set()

    for fact in facts:
        if question_num >= max_questions:
            break

        # Skip duplicate topics
        topic_key = f"{fact.procedure}:{fact.value}".lower()
        if topic_key in seen_topics:
            continue
        seen_topics.add(topic_key)

        context = _extract_action_context(fact)
        # Skip if context would be truncated
        if context is None:
            continue

        question_text = f"Per {fact.procedure}, within what time period must the following be completed: {context}?"

        correct = fact.value
        distractors = generate_numeric_distractors(correct, all_numeric_facts, count=3)

        options = [correct] + distractors[:3]
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
            question_id=f"{chapter_id.split('-')[0]}-nr-{question_num:03d}",
            chapter_id=chapter_id,
            source_type="numeric",
            source_file=fact.section_file,
            text=question_text,
            options=formatted_options,
            answer=correct_letter,
            explanation=f"Per {fact.procedure}: {fact.context}",
            difficulty="medium",
        ))

    return questions
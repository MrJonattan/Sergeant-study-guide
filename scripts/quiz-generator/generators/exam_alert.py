"""Rule-based generator: Exam Alert → multiple-choice questions.

Generates questions from Exam Alert callouts using the alert text as the correct answer
and sibling alerts as distractors. Skips alerts that are too long or would produce
truncated options.
"""

import random
import re

from generators.distractor import generate_callout_distractors
from models.callout import ExamAlert
from models.question import GeneratedQuestion


def _is_truncated(text: str) -> bool:
    """Check if text appears truncated (mid-word break or trailing ellipsis)."""
    if text.endswith("..."):
        return True
    # Check for mid-word truncation (hyphen at end followed by space/newline in original)
    if text.rstrip().endswith("-"):
        return True
    # Check for incomplete words (single letter followed by space, like "a " or "I ")
    if re.search(r"\b[a-zA-Z]\s*$", text):
        return True
    return False


def _extract_topic(alert: ExamAlert) -> str:
    """Extract a short topic from an Exam Alert's procedure number."""
    return alert.procedure


def generate_exam_alert_questions(
    alerts: list[ExamAlert], chapter_id: str, max_questions: int = 10
) -> list[GeneratedQuestion]:
    """Generate multiple-choice questions from Exam Alert callouts.

    Question format: "According to {procedure}, which of the following is required?"
    Correct answer: The alert text (if not truncated)
    Distractors: Sibling alert texts from the same section file

    Args:
        alerts: Exam Alert callouts for a chapter.
        chapter_id: The chapter ID (e.g., "208-arrests").
        max_questions: Maximum questions to generate.

    Returns:
        List of GeneratedQuestion objects.
    """
    if not alerts:
        return []

    questions: list[GeneratedQuestion] = []
    question_num = 0

    # Group alerts by section file for sibling distractor generation
    alerts_by_file: dict[str, list[ExamAlert]] = {}
    for alert in alerts:
        alerts_by_file.setdefault(alert.section_file, []).append(alert)

    for alert in alerts:
        if question_num >= max_questions:
            break

        # Skip if alert text would be truncated
        if _is_truncated(alert.text):
            continue

        topic = _extract_topic(alert)
        siblings = [a for a in alerts_by_file.get(alert.section_file, [])
                    if a is not alert and not _is_truncated(a.text)]

        # Generate distractors from siblings
        correct = alert.text
        distractors = generate_callout_distractors(correct, siblings, count=3)

        # Skip if we couldn't generate enough valid distractors
        if len(distractors) < 3:
            continue

        # Verify no distractors are truncated
        valid_distractors = [d for d in distractors if not _is_truncated(d)]
        if len(valid_distractors) < 3:
            continue

        options = [correct] + valid_distractors[:3]

        # Shuffle options and track correct answer position
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
            question_id=f"{chapter_id.split('-')[0]}-ea-{question_num:03d}",
            chapter_id=chapter_id,
            source_type="exam_alert",
            source_file=alert.section_file,
            text=f"According to {topic}, which of the following is required?",
            options=formatted_options,
            answer=correct_letter,
            explanation=f"Per {alert.procedure}: {alert.text}",
            difficulty="medium",
        ))

    return questions
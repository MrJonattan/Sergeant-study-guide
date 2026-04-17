"""Rule-based generator: Exam Alert → multiple-choice questions.

Generates two question types from Exam Alert callouts:
  1. "Which of the following is TRUE regarding [topic]?"
  2. "All of the following are true regarding [topic] EXCEPT:"
"""

import random

from generators.distractor import generate_callout_distractors
from models.callout import ExamAlert
from models.question import GeneratedQuestion


def _extract_topic(alert: ExamAlert) -> str:
    """Extract a short topic from an Exam Alert's procedure number."""
    return alert.procedure


def generate_exam_alert_questions(
    alerts: list[ExamAlert], chapter_id: str, max_questions: int = 10
) -> list[GeneratedQuestion]:
    """Generate multiple-choice questions from Exam Alert callouts.

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

        topic = _extract_topic(alert)
        siblings = [a for a in alerts_by_file.get(alert.section_file, [])
                    if a is not alert]

        # Alternate between TRUE and EXCEPT question types
        if question_num % 2 == 0:
            # "Which of the following is TRUE regarding [topic]?"
            question_text = f"Which of the following is TRUE regarding {topic}?"
            correct = alert.text
            if len(correct) > 150:
                correct = correct[:147] + "..."
            distractors = generate_callout_distractors(correct, siblings, count=3)

            # Make sure we have 3 distractors
            while len(distractors) < 3:
                distractors.append("None of the above")

            options = [correct] + distractors[:3]
        else:
            # "All of the following are true regarding [topic] EXCEPT:"
            question_text = f"All of the following are true regarding {topic} EXCEPT:"
            # Create a false statement as the correct answer
            from generators.distractor import generate_negated_distractor

            false_stmt = generate_negated_distractor(alert.text)
            if not false_stmt:
                # Skip if we can't generate a negation
                continue

            correct = false_stmt
            # Use true statements from sibling alerts as distractors
            true_stmts = [a.text[:147] + ("..." if len(a.text) > 150 else "")
                         for a in siblings[:3]]
            while len(true_stmts) < 3:
                true_stmts.append(alert.text[:147] + ("..." if len(alert.text) > 150 else ""))

            options = [correct] + true_stmts[:3]

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
            text=question_text,
            options=formatted_options,
            answer=correct_letter,
            explanation=f"Per {alert.procedure}: {alert.text[:200]}",
            difficulty="medium",
        ))

    return questions
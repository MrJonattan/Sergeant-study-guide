"""Rule-based generator: Sergeant Focus → supervisor-scenario questions.

Generates questions framed from a sergeant's supervisory perspective:
  "A sergeant is handling [situation]. What should the sergeant do?"
"""

import random

from models.callout import SergeantFocus
from models.question import GeneratedQuestion


# Templates for sergeant scenario questions
SCENARIO_TEMPLATES = [
    "A sergeant is supervising a situation involving {topic}. The sergeant should:",
    "A sergeant responding to a call involving {topic} should FIRST:",
    "As a supervisor handling {topic}, the sergeant's primary responsibility is to:",
    "A sergeant learns that {topic}. Which action is most appropriate?",
]


def _extract_topic(focus: SergeantFocus) -> str:
    """Extract a short topic description from the Sergeant Focus callout."""
    text = focus.text
    # Take first sentence or first 80 chars
    if ". " in text:
        first_sentence = text.split(". ")[0]
        return first_sentence[:80] + ("..." if len(first_sentence) > 80 else "")
    return text[:80] + ("..." if len(text) > 80 else "")


def _generate_correct_option(focus: SergeantFocus) -> str:
    """Generate the correct option from a Sergeant Focus callout."""
    text = focus.text
    if len(text) > 150:
        return text[:147] + "..."
    return text


def _generate_distractors(focus: SergeantFocus) -> list[str]:
    """Generate plausible wrong answers for a sergeant scenario question."""
    distractors: list[str] = []

    # Common incorrect supervisor behaviors
    incorrect_actions = [
        "Take personal action without notifying the commanding officer",
        "Document the incident but take no immediate supervisory action",
        "Refer the matter directly to Internal Affairs without following chain of command",
        "Delegate the entire matter to a subordinate without oversight",
        "Contact the affected member's family without the member's consent",
        "File formal charges without first attempting counseling or warning",
        "Ignore the matter unless a formal complaint is filed",
        "Suspend the member without following the procedures in A.G. 318-06",
    ]

    random.shuffle(incorrect_actions)
    for action in incorrect_actions:
        if len(distractors) >= 3:
            break
        if action.lower() not in focus.text.lower():
            distractors.append(action)

    # Pad if needed
    while len(distractors) < 3:
        distractors.append("None of the above — no supervisory action is required")

    return distractors[:3]


def generate_sergeant_focus_questions(
    focuses: list[SergeantFocus], chapter_id: str, max_questions: int = 10
) -> list[GeneratedQuestion]:
    """Generate supervisor-scenario questions from Sergeant Focus callouts.

    Args:
        focuses: Sergeant Focus callouts for a chapter.
        chapter_id: The chapter ID.
        max_questions: Maximum questions to generate.

    Returns:
        List of GeneratedQuestion objects.
    """
    if not focuses:
        return []

    questions: list[GeneratedQuestion] = []
    question_num = 0

    for focus in focuses:
        if question_num >= max_questions:
            break

        topic = _extract_topic(focus)
        template = random.choice(SCENARIO_TEMPLATES)
        question_text = template.format(topic=topic)

        correct = _generate_correct_option(focus)
        distractors = _generate_distractors(focus)

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
            question_id=f"{chapter_id.split('-')[0]}-sf-{question_num:03d}",
            chapter_id=chapter_id,
            source_type="sergeant_focus",
            source_file=focus.section_file,
            text=question_text,
            options=formatted_options,
            answer=correct_letter,
            explanation=f"Per {focus.procedure} — Sergeant Focus: {focus.text[:200]}",
            difficulty="hard",
        ))

    return questions
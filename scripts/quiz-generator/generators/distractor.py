"""Generate plausible distractors for multiple-choice questions.

Strategies:
  - Sibling key-terms from the same chapter
  - Negated correct answer (swap shall/should, all/any, must/may)
  - Numeric transforms (double, half, shift by common increments)
"""

import re

from models.callout import ExamAlert, KeyTerm, NumericFact

# Negation pairs for answer modification
NEGATION_SWAPS: list[tuple[str, str]] = [
    ("shall", "may"),
    ("must", "may"),
    ("must", "should"),
    ("all", "any"),
    ("every", "some"),
    ("always", "sometimes"),
    ("never", "sometimes"),
    ("will", "can"),
    ("is", "is NOT"),
    ("are", "are NOT"),
    ("has", "does NOT have"),
    ("requires", "does NOT require"),
    ("prohibited", "permitted"),
    ("mandatory", "discretionary"),
    ("automatic", "discretionary"),
    ("immediately", "within a reasonable time"),
]

# Common numeric offsets for distractor generation
NUMERIC_OFFSETS = {
    "days": [7, 14, 30, 60, 90, 180, 365],
    "hours": [1, 2, 4, 8, 12, 24, 48, 72],
    "minutes": [5, 10, 15, 30, 45, 60],
    "months": [1, 3, 6, 9, 12, 18, 24],
    "years": [1, 2, 3, 5, 10],
}

# Multipliers for numeric distractors
NUMERIC_MULTIPLIERS = [0.5, 2, 3]


def generate_negated_distractor(correct_text: str) -> str | None:
    """Generate a distractor by negating the correct answer.

    Returns None if no applicable negation swap is found.
    """
    lower = correct_text.lower()
    for original, replacement in NEGATION_SWAPS:
        if original in lower:
            # Replace only the first occurrence (case-insensitive)
            pattern = re.compile(re.escape(original), re.IGNORECASE)
            result = pattern.sub(replacement, correct_text, count=1)
            if result != correct_text:
                return result.capitalize() if correct_text[0].isupper() else result
    return None


def generate_sibling_distractors(
    correct_term: str, key_terms: list[KeyTerm], count: int = 3
) -> list[str]:
    """Generate distractors from sibling key terms in the same chapter.

    Picks terms that are NOT the correct term, preferring terms of similar length.
    """
    candidates = [
        f"{kt.term}: {kt.definition}"
        for kt in key_terms
        if kt.term.lower() != correct_term.lower()
    ]

    # Sort by similarity of length to correct term for plausibility
    correct_len = len(correct_term)
    candidates.sort(key=lambda c: abs(len(c) - correct_len))

    return candidates[:count]


def generate_numeric_distractors(
    correct_value: str, numeric_facts: list[NumericFact], count: int = 3
) -> list[str]:
    """Generate numeric distractors by applying transforms.

    Strategies:
      - Apply offsets from NUMERIC_OFFSETS
      - Apply multipliers (half, double)
      - Pick other numeric facts from the same procedure
    """
    distractors: list[str] = []
    seen: set[str] = {correct_value.lower()}

    # Try to parse the number and unit from the correct value
    num_match = re.match(r"(\d+(?:-\d+)?)\s+(days?|hours?|minutes?|months?|years?|weeks?)",
                        correct_value, re.IGNORECASE)

    if num_match:
        try:
            base_num = int(num_match.group(1).split("-")[0])
            unit = num_match.group(2).lower()

            # Apply multipliers
            for mult in NUMERIC_MULTIPLIERS:
                new_val = int(base_num * mult)
                if new_val < 1:
                    continue
                candidate = f"{new_val} {unit}"
                if candidate.lower() not in seen:
                    seen.add(candidate.lower())
                    distractors.append(candidate)
                    if len(distractors) >= count:
                        return distractors

            # Apply offsets
            for offset in NUMERIC_OFFSETS.get(unit, []):
                for direction in [1, -1]:
                    new_val = base_num + (offset * direction)
                    if new_val < 1:
                        continue
                    candidate = f"{new_val} {unit}"
                    if candidate.lower() not in seen:
                        seen.add(candidate.lower())
                        distractors.append(candidate)
                        if len(distractors) >= count:
                            return distractors
        except (ValueError, IndexError):
            pass

    # Fallback: use other numeric facts from the same chapter
    for fact in numeric_facts:
        if fact.value.lower() not in seen:
            seen.add(fact.value.lower())
            distractors.append(fact.value)
            if len(distractors) >= count:
                break

    # Pad with generic distractors if needed
    generic_defaults = ["30 days", "60 days", "90 days"]
    for default in generic_defaults:
        if default.lower() not in seen and len(distractors) < count:
            seen.add(default.lower())
            distractors.append(default)

    return distractors[:count]


def generate_callout_distractors(
    correct_text: str, sibling_callouts: list[ExamAlert], count: int = 3
) -> list[str]:
    """Generate distractors from sibling Exam Alert callouts.

    Picks callouts that contradict or differ from the correct answer.
    """
    distractors: list[str] = []
    seen: set[str] = {correct_text.lower()}

    # Try negation first
    negated = generate_negated_distractor(correct_text)
    if negated and negated.lower() not in seen:
        seen.add(negated.lower())
        distractors.append(negated)

    # Add shortened versions of sibling callouts
    for alert in sibling_callouts:
        text = alert.text
        # Truncate to ~100 chars for option length
        if len(text) > 100:
            text = text[:97] + "..."
        if text.lower() not in seen:
            seen.add(text.lower())
            distractors.append(text)
            if len(distractors) >= count:
                break

    return distractors[:count]
"""LLM prompt templates for question generation.

Three prompt types:
  1. Scenario — tests application of knowledge in a supervisory situation
  2. Comparison — tests how two procedures differ
  3. EXCEPT — "All of the following are true EXCEPT"
"""

SCENARIO_SYSTEM_PROMPT = """You are an expert at writing multiple-choice questions for the NYPD Sergeant Promotional Exam. Generate questions that test a sergeant's ability to APPLY procedural knowledge in real supervisory situations. Questions must have exactly 4 options (A-D) with one correct answer. Output must be valid JSON."""

SCENARIO_USER_TEMPLATE = """Given the following procedure content from {procedure}, generate a scenario-based multiple-choice question that tests a sergeant's ability to apply this knowledge in a real supervisory situation.

PROCEDURE CONTENT:
{content}

EXISTING QUESTIONS (do NOT duplicate these):
{existing_questions}

Generate ONE question in this exact JSON format:
{{
  "text": "A sergeant is handling [situation]. [Question about what to do?]",
  "options": ["A) ...", "B) ...", "C) ...", "D) ..."],
  "answer": "B",
  "explanation": "Per {procedure}, [explanation referencing the procedure]",
  "difficulty": "medium"
}}"""

COMPARISON_SYSTEM_PROMPT = """You are an expert at writing multiple-choice questions for the NYPD Sergeant Promotional Exam. Generate questions that test how two related procedures DIFFER. Questions must have exactly 4 options (A-D) with one correct answer. Output must be valid JSON."""

COMPARISON_USER_TEMPLATE = """Given the following two related procedures, generate a question that tests how they DIFFER in {aspect}.

PROCEDURE 1 ({proc_a}):
{content_a}

PROCEDURE 2 ({proc_b}):
{content_b}

Generate ONE question in this exact JSON format:
{{
  "text": "[Question about how these procedures differ]",
  "options": ["A) ...", "B) ...", "C) ...", "D) ..."],
  "answer": "B",
  "explanation": "[Explanation citing both procedures]",
  "difficulty": "hard"
}}"""

EXCEPT_SYSTEM_PROMPT = """You are an expert at writing multiple-choice questions for the NYPD Sergeant Promotional Exam. Generate "All of the following are true EXCEPT" style questions. Questions must have exactly 4 options (A-D) with one correct answer (the FALSE statement). Output must be valid JSON."""

EXCEPT_USER_TEMPLATE = """Given the following procedure content from {procedure}, generate an "All of the following are true regarding [topic] EXCEPT:" style question. The correct answer must be the FALSE statement.

PROCEDURE CONTENT:
{content}

Generate ONE question in this exact JSON format:
{{
  "text": "All of the following are true regarding [topic] EXCEPT:",
  "options": ["A) [true statement]", "B) [true statement]", "C) [true statement]", "D) [FALSE statement]"],
  "answer": "D",
  "explanation": "Per {procedure}, [why D is false and the others are true]",
  "difficulty": "medium"
}}"""
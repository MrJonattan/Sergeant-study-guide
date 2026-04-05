# Design: Integrate "The Key" Preseason Materials into Study Guide

**Date:** 2026-03-28
**Status:** Draft
**Source:** 24 lesson PDFs from The Key Police Promotional School (2025-2026 Pre-Season Review Course)
**Location:** `~/Documents/The Key Preseason Sgt Study Guide/`

---

## Goal

Enrich the existing NYPD Sergeant Promotional Exam study guide with exam-focused content from The Key Police Promotional School's Pre-Season Review Course. The Key materials contain mnemonics, exam alerts, prior test question callouts, PG conflict notes, role comparison tables, and cross-references that the raw Patrol Guide does not provide.

## Approach

**Section-by-section deep merge (inline enrichment).** For each of the 24 Key lessons, extract exam-strategy content and surgically insert it into the existing markdown section files at the precise location where the related concept is discussed.

No separate "exam strategy" files. Everything integrated inline for maximum study value.

## Content Types to Extract & Integrate

Six distinct content types, each with a standardized callout format:

| Content Type | Markdown Format | Purpose |
|---|---|---|
| Mnemonics | `> **Memory Aid — NAME:** explanation` | Memory aids for lists, definitions, procedures |
| Exam Alerts | `> **Exam Alert:** tip` | Test-taking strategy, qualifier warnings, trick answer flags |
| Prior Test Questions | `> **Prior Test:** scenario` | Known questions from previous sergeant exams |
| Conflict Notes | `> **PG Conflict:** explanation` | Where PG/AG sections contradict each other |
| Role Comparisons | Standard markdown table | Side-by-side duty breakdowns (D.O. vs P/S vs LPC) |
| Cross-References | `> **See Also:** PG XXX-XX (topic)` | Links between related procedures across sections |

### Placement Rules

- **Mnemonics:** Immediately after the definition or list they help memorize
- **Exam Alerts:** Immediately after the bullet point they warn about
- **Prior Test Questions:** Immediately after the concept being tested
- **Conflict Notes:** At the point where the contradiction is relevant
- **Role Comparisons:** After the section covering the roles being compared
- **Cross-References:** Inline where the related procedure is mentioned

## Lesson-to-File Mapping

### 200-Series (Operations)

| Lesson | PG/AG Section | Target Chapter | Target File(s) |
|---|---|---|---|
| 1 | PG 202 | `202-duties-responsibilities/` | `section-202-supervisors.md`, `section-202-officers.md` |
| 7 | PG 207 Pt 1 | `207-complaints/` | Existing section files |
| 8 | PG 207 Pt 2 | `207-complaints/` | Existing section files |
| 9 | PG 208 Pt 1 | `208-arrests/` | Existing section files |
| 10 | PG 208 Pt 2 | `208-arrests/` | Existing section files |
| 11 | PG 209 | `209-summonses/` | Existing section files |
| 12 | PG 210 | `210-prisoners/` | Existing section files |
| 13 | PG 212 Pt 1 | `212-command-operations/` | Existing section files |
| 14 | PG 212 Pt 2 | `212-command-operations/` | Existing section files |
| 15 | PG 212 Pt 3 | `212-command-operations/` | Existing section files |
| 16 | PG 213 | `213-mobilization-emergency/` | Existing section files |
| 17 | PG 214 | `214-quality-of-life/` | Existing section files |
| 18 | PG 215 | `215-juvenile-matters/` | Existing section files |
| 19 | PG 216 | `216-aided-cases/` | Existing section files |
| 20 | PG 217 | `217-vehicle-collisions/` | Existing section files |
| 21 | PG 218 Pt 1 | `218-property-general/` | Existing section files |
| 22 | PG 218 Pt 2 | `218-property-general/` | Existing section files |
| 23 | PG 219 | `219-department-property/` | Existing section files |
| 24 | PG 220 | `220-citywide-incident-mgmt/` | Existing section files |

### 300-Series (Personnel & Administration)

| Lesson | PG/AG Section | Target Chapter | Target File(s) |
|---|---|---|---|
| 2 | AG 304 | `304-general-regulations/` | `section-304-fitness-for-duty.md`, new files for courtesies, prohibited conduct, personal appearance |
| 3 | AG 305 | `305-uniforms-equipment/` | Existing section files |
| 4 | PG 324 & 330 | `324-leave-payroll-timekeeping/`, `330-medical-health-wellness/` | Existing section files |
| 5 | AG 332 | `332-employee-rights/` | Existing section files |
| 6 | AG 318 | `318-disciplinary-matters/` | Existing section files |

## New File Creation

When The Key covers procedures not represented by an existing section file, create new files following the naming convention `section-XXX-topic.md`. Known cases:

- `304-general-regulations/section-304-courtesies.md` (304-02)
- `304-general-regulations/section-304-compliance-with-orders.md` (304-03)
- `304-general-regulations/section-304-prohibited-conduct.md` (304-06)
- `304-general-regulations/section-304-personal-appearance.md` (304-07)

Additional new files will be identified during processing when a Key lesson covers procedures without a matching existing file.

## Integration Workflow Per Lesson

1. **Extract** — Read the full Key lesson PDF. Catalog every mnemonic, exam alert, prior test question, conflict note, role comparison, and cross-reference.
2. **Match** — Map each extracted item to the specific location in the existing `.md` file where the related procedure/concept is discussed. If no matching file exists, create one following the `section-XXX-topic.md` naming convention.
3. **Merge** — Insert callout blocks at the precise location where the concept appears in the existing content.
4. **New Questions** — Add practice questions to the chapter's `review-questions.md` based on prior test question callouts from The Key.
5. **Key Terms** — Update `key-terms.md` with any new acronyms or definitions (e.g., CAT PAC, CHILD-ERS, I.A.D.I.E.).

## Execution Strategy

Use parallel agents to process lessons concurrently. Each agent:
- Reads one Key lesson PDF (or a pair for multi-part lessons)
- Reads the corresponding existing chapter files
- Performs the extract-match-merge workflow
- Creates new section files if needed
- Updates review questions and key terms

Batch into groups to avoid overwhelming the system:
- **Batch 1:** Lessons 1-6 (PG 202, AG 304, AG 305, PG 324/330, AG 332, AG 318)
- **Batch 2:** Lessons 7-12 (PG 207x2, PG 208x2, PG 209, PG 210)
- **Batch 3:** Lessons 13-18 (PG 212x3, PG 213, PG 214, PG 215)
- **Batch 4:** Lessons 19-24 (PG 216, PG 217, PG 218x2, PG 219, PG 220)

## Quality Rules

- Never remove or modify existing study content — only add new callout blocks
- Every callout must cite the specific PG/AG procedure number
- Mnemonics must include what each letter stands for
- Conflict notes must cite both conflicting procedure numbers
- Prior test questions must describe the scenario and correct answer
- Cross-references must include the procedure number and a brief topic description
- Ads, testimonials, and promotional content from The Key PDFs are ignored

## Success Criteria

- All 24 lessons processed and merged
- Every mnemonic, exam alert, prior test question, conflict note, and cross-reference from The Key is captured
- No existing content removed or altered
- New section files created where needed
- Review questions updated with prior test content
- Key terms updated with new acronyms
- Web app data file (`web/data.js`) regenerated to include enriched content

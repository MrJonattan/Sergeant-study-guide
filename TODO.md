# Study Guide Completion Checklist

> **Status:** 100% complete as of 2026-04-14
> **Goal:** Comprehensive NYPD Sergeant Promotional Exam study guide covering all testable material

---

## What's Already Done

- [x] All 200-series chapters built from Patrol Guide (PG 200–221)
- [x] All 300-series chapters enriched with exam content
- [x] The Key integration — all 29 chapters enriched (1,009 Exam Alerts, 83 Memory Aids, 37 Prior Tests, 19 PG Conflicts, 113 See Also)
- [x] All 24 The Key lesson PDFs converted to markdown (`build/the-key/`)
- [x] Missing review-questions.md created for 319, 324, 329
- [x] Missing key-terms.md created for 319, 324, 329
- [x] 569 chapter review questions + 140 master exam questions
- [x] Cheat sheet rebuilt with all 25+ new mnemonics, 20 PG conflicts, role comparisons, PERF/probationary tables
- [x] Master exam expanded with 20 Prior Test scenario questions (121-140)
- [x] Web app PWA with offline support (docs/index.html, docs/data.js)
- [x] Combined study guide in build/study-guide-combined.md
- [x] renderMd() callout rendering fixed and pushed to GitHub Pages
- [x] All HTML output files deployed to docs/ (cheat sheet, master exam, study guide)
- [x] Process standalone NYPD-Sergeant-Study-Guide.pdf (160 MC questions + 35 essay)
- [x] Expand chapters 303 and 324 with missing AG procedures (303-06 through 303-10, 324-01 through 324-06)
- [x] Add Sergeant Focus view to web app (compiled supervisor job-aid, 202 callouts across 15 categories)
- [x] Verify all 112 See Also: cross-references (all valid)
- [x] Swap source PDFs to updated OCR'd versions
- [x] Expand chapters 320, 331, 332 with AG procedures (14 new section files across 3 chapters)
- [x] Verify A.G. 303-04 Borough Adjutant — already complete in section-303-borough-command.md
- [x] Verify A.G. 320 — confirmed only 3 procedures exist (320-01 through 320-03), all complete
- [x] Extract and add P.G. 221-15 Vehicle Pursuits from source PDF (2026-04-14)
- [x] Extract and add A.G. 304-10 False/Misleading Statements (2026-04-14)
- [x] Extract and add A.G. 304-13 Parades/Funerals (2026-04-14)
- [x] Extract and add A.G. 304-14 Gifts & Compensation (2026-04-14)
- [x] README status tables fixed for chapters 215, 221, 318 (2026-04-14)

## Remaining Minor Gaps

*None — all content gaps filled.*

## Future Improvements

*None — all planned improvements complete.*

## Study Proficiency Tools (Added 2026-04-12)

- [x] Anki flashcard export system (scripts/export-anki.js)
  - [x] 525 chapter questions → anki-chapter-questions.csv
  - [x] 140 master exam questions → anki-master-exam.csv
  - [x] 1,759 key terms → anki-key-terms.csv
  - [x] 199 Sergeant Focus callouts → anki-sergeant-focus.csv
  - [x] 56 notes → anki-notes.csv
  - [x] 2,014 consolidated cards → anki-flashcards-consolidated.csv (PG/AG organized)
  - [x] flashcard-index.json (28 procedures indexed)
- [x] Study schedule generator (scripts/generate-study-schedule.js)
  - [x] 12-week plan with priority-based ordering
  - [x] Built-in review weeks and practice exams
  - [x] Daily study template
- [x] Flashcards view in web app
  - [x] Browse by P.G. / A.G. procedure number
  - [x] Filter: All | Patrol Guide | Admin Guide
  - [x] Search across all flashcards
  - [x] Flip cards for answers
  - [x] Color-coded: Key Terms (green), Sergeant Focus (gold), Notes (blue)
- [x] STUDY-GUIDE.md — Comprehensive study workflow documentation
- [x] npm scripts: `export:anki`, `schedule`, `study`

## Exam Coverage Summary

| Metric | Count |
|--------|-------|
| Total chapters | 28 |
| Chapter review questions | 569 |
| Master exam questions | 140 |
| Sergeant Focus callouts | 202 |
| The Key lesson PDFs converted | 24 |
| Memory Aids (mnemonics) | 83 |
| Prior Test scenarios | 37 |
| PG Conflicts documented | 19 |
| **Flashcards (total)** | **4,693** |
| ─ Key terms | 1,759 |
| ─ Chapter questions | 525 |
| ─ Master exam | 140 |
| ─ Sergeant Focus | 202 |
| ─ Notes | 56 |
| ─ Consolidated (PG/AG) | 2,014 |

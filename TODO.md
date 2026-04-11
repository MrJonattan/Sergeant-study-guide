# Study Guide Completion Checklist

> **Status:** ~95% complete as of 2026-04-10
> **Goal:** Comprehensive NYPD Sergeant Promotional Exam study guide covering all testable material

---

## Pending Source Materials

> **Priority:** Work in progress on these untapped sources

- [ ] **Ingest The Key lesson PDFs** — 24 lesson PDFs at `~/Documents/The Key Preseason Sgt Study Guide/` with mnemonics, test notes, question patterns
- [x] **Process standalone NYPD-Sergeant-Study-Guide.pdf** — 160 MC questions extracted, appended to 9 chapter review files; 35 essay-style preserved in build/standalone-sg-questions.json
- [ ] **Fill thin 300-series chapters** — 303, 320, 324, 331, 332 use AG PDFs from `~/Documents/NYPD PG/AG PDFs/`

## Ingest DOCX Study Guides

8 DOCX files at `~/Documents/Sergeant Study Guide/` plus 1 comprehensive guide. These contain exam tips, question patterns, and focus areas not covered by the Patrol Guide or The Key.

- [ ] Study Guide Part 1 (Parts 1–4)
- [ ] Study Guide Part 2 (Parts Two–Five)
- [ ] NYPD_Sergeant_Comprehensive_Exam_Guide.docx
- [ ] NYPD-Sergeant-Study-Guide.pdf (`~/Documents/`)

## Update Cheat Sheet

The quick-reference cheat sheet predates The Key integration. Missing all new mnemonics.

- [x] Add all new mnemonics from The Key integration: CAT PAC, WEBS, I.A.D.I.E., C.E.O., DRAMAS, C GIF CUSS, HARBOR, FRUITS, RATCOP, SECTAR, CHILD-ERS, "Ted the M.D. from D.C.", "I C no P.A.I.N.", MAR BAR MAK, S.C.A.M., FOUL FRAP, A DOG CAR, G.D.A.S.S., CHASED FIT DOM, OKIUR, MODULAR, LSIR, LIMB LSS MD
- [x] Add PG Conflict summary (20 known conflicts)
- [x] Add role comparison tables (D.O. vs P/S vs LPC, Borough Ops vs Admin)
- [x] Add MEMORIZATION table (e.g., PERF score ranges, probationary schedules, rating scales)
- [x] Rebuild `docs/quick-reference-cheat-sheet.html` after updating

## Update Master Practice Exam

The master exam has 120 questions from pre-Key integration. Chapters now have 569 total review questions.

- [x] Review and expand master exam — draw from The Key's Prior Test callouts (39 scenarios)
- [x] Ensure coverage across all PG sections proportional to exam weight
- [x] Rebuild `docs/master-practice-exam.html`

## Deploy HTML Output Files to docs/

The `build/` directory has full HTML output but `docs/` only has the PWA files. GitHub Pages serves `docs/`.

- [x] Copy `build/master-practice-exam.html` → `docs/`
- [x] Copy `build/quick-reference-cheat-sheet.html` → `docs/`
- [x] Copy `build/study-guide-combined.md` → `docs/` (optional, for direct access)
- [x] Verify `docs/study-guide.html` is current

## Verify Cross-References

- [x] Scan all `See Also:` callouts — verify every PG/AG reference exists in the chapter structure
- [x] Update any broken internal links (none found — all references valid, external refs marked)

## Update Progress Tracker

- [x] Verify `progress/tracker.json` reflects actual completion status (Note: tracker file does not exist — project uses TODO.md instead)

---

## What's Already Done

- [x] All 200-series chapters built from Patrol Guide (PG 200–221)
- [x] All 300-series chapters enriched with exam content
- [x] The Key integration — all 29 chapters enriched (999 Exam Alerts, 99 Memory Aids, 39 Prior Tests, 20 PG Conflicts)
- [x] Missing review-questions.md created for 319, 324, 329
- [x] Missing key-terms.md created for 319, 324, 329
- [x] 569 chapter review questions + 140 master exam questions
- [x] Cheat sheet rebuilt with all 25+ new mnemonics, 20 PG conflicts, role comparisons, PERF/probationary tables
- [x] Master exam expanded with 20 Prior Test scenario questions (121-140)
- [x] Web app PWA with offline support (docs/index.html, docs/data.js)
- [x] Combined study guide in build/study-guide-combined.md
- [x] renderMd() callout rendering fixed and pushed to GitHub Pages
- [x] All HTML output files deployed to docs/ (cheat sheet, master exam, study guide)

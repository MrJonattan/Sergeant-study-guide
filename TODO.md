# Study Guide Completion Checklist

> **Status:** ~90% complete as of 2026-04-09
> **Goal:** Comprehensive NYPD Sergeant Promotional Exam study guide covering all testable material

---

## Ingest DOCX Study Guides

8 DOCX files at `~/Documents/Sergeant Study Guide/` plus 1 comprehensive guide. These contain exam tips, question patterns, and focus areas not covered by the Patrol Guide or The Key.

- [ ] Study Guide Part 1 (Parts 1–4)
- [ ] Study Guide Part 2 (Parts Two–Five)
- [ ] NYPD_Sergeant_Comprehensive_Exam_Guide.docx
- [ ] NYPD-Sergeant-Study-Guide.pdf (`~/Documents/`)

## Update Cheat Sheet

The quick-reference cheat sheet predates The Key integration. Missing all new mnemonics.

- [ ] Add all new mnemonics from The Key integration: CAT PAC, WEBS, I.A.D.I.E., C.E.O., DRAMAS, C GIF CUSS, HARBOR, FRUITS, RATCOP, SECTAR, CHILD-ERS, "Ted the M.D. from D.C.", "I C no P.A.I.N.", MAR BAR MAK, S.C.A.M., FOUL FRAP, A DOG CAR, G.D.A.S.S., CHASED FIT DOM, OKIUR, MODULAR, LSIR, LIMB LSS MD
- [ ] Add PG Conflict summary (20 known conflicts)
- [ ] Add role comparison tables (D.O. vs P/S vs LPC, Borough Ops vs Admin)
- [ ] Add MEMORIZATION table (e.g., PERF score ranges, probationary schedules, rating scales)
- [ ] Rebuild `docs/quick-reference-cheat-sheet.html` after updating

## Update Master Practice Exam

The master exam has 120 questions from pre-Key integration. Chapters now have 569 total review questions.

- [ ] Review and expand master exam — draw from The Key's Prior Test callouts (39 scenarios)
- [ ] Ensure coverage across all PG sections proportional to exam weight
- [ ] Rebuild `docs/master-practice-exam.html`

## Deploy HTML Output Files to docs/

The `build/` directory has full HTML output but `docs/` only has the PWA files. GitHub Pages serves `docs/`.

- [ ] Copy `build/master-practice-exam.html` → `docs/`
- [ ] Copy `build/quick-reference-cheat-sheet.html` → `docs/`
- [ ] Copy `build/study-guide-combined.md` → `docs/` (optional, for direct access)
- [ ] Verify `docs/study-guide.html` is current

## Verify Cross-References

- [ ] Scan all `See Also:` callouts — verify every PG/AG reference exists in the chapter structure
- [ ] Update any broken internal links

## Update Progress Tracker

- [ ] Verify `progress/tracker.json` reflects actual completion status

---

## What's Already Done

- [x] All 200-series chapters built from Patrol Guide (PG 200–221)
- [x] All 300-series chapters enriched with exam content
- [x] The Key integration — all 29 chapters enriched (999 Exam Alerts, 99 Memory Aids, 39 Prior Tests, 20 PG Conflicts)
- [x] Missing review-questions.md created for 319, 324, 329
- [x] Missing key-terms.md created for 319, 324, 329
- [x] 569 chapter review questions + 120 master exam questions
- [x] Web app PWA with offline support (docs/index.html, docs/data.js)
- [x] Combined study guide in build/study-guide-combined.md
- [x] renderMd() callout rendering fixed and pushed to GitHub Pages

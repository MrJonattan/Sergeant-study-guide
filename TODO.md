# Study Guide Completion Checklist

> **Status:** ~80% complete as of 2026-04-05
> **Goal:** Comprehensive NYPD Sergeant Promotional Exam study guide covering all testable material

---

## 1. Empty Chapters — Build from Patrol Guide

These chapters have a README but zero section files. Content needs to be extracted from `pguide4-ocr.pdf`.

- [ ] **303 — Duties & Responsibilities (Admin)** — AG 303 supervisor/CO duties, distinct from PG 202
- [ ] **320 — Personnel Matters (General)** — transfers, assignments, outside employment, personnel orders
- [ ] **331 — Evaluations** — performance evaluation procedures, annual reviews, probationary evaluations

## 2. Thin Chapters — Expand from Patrol Guide + AG PDFs

These chapters have only 1 section file. Flesh out with remaining procedures from source PDFs.

- [ ] **319 — Civilian Personnel** (1 section) — expand with civilian hiring, discipline, grievance procedures
- [ ] **324 — Leave, Payroll & Timekeeping** (1 section) — add annual leave, compensatory time, chart days, overtime rules
- [ ] **329 — Career Development** (1 section) — add promotion procedures, transfer requests, specialized assignments

## 3. Ingest Administrative Guide PDFs

12 AG PDFs at `~/Documents/NYPD PG/AG PDFs/` not yet incorporated:

- [ ] A.G. 304-04 — Fitness For Duty
- [ ] A.G. 305-05 — Lost Or Damaged Uniform
- [ ] A.G. 305-07 — Firearms General Regulations
- [ ] A.G. 318-10 — Removal Of Firearms From Intoxicated MOS
- [ ] A.G. 318-11 — Interrogation Of Members Of The Service
- [ ] A.G. 319-08 — Civilian Member Injury
- [ ] A.G. 325-35 — Department Computer Use Policy & Monitoring
- [ ] A.G. 329-06 — Discontinuance Of Police Service (Retirement/Vested)
- [ ] A.G. 329-07 — Discontinuance Of Police Service (Resignation)
- [ ] A.G. 330-03 — Line Of Duty Injury Or Death
- [ ] A.G. 330-07 — Trauma Counseling Program
- [ ] A.G. 330-09 — Exposure To Infectious Diseases / Hazardous Materials

## 4. Ingest DOCX Study Guides

8 DOCX files at `~/Documents/Sergeant Study Guide/` plus 1 comprehensive guide. These likely contain exam tips, question patterns, and focus areas beyond what the Patrol Guide and The Key provide.

- [ ] Study Guide Part 1 (Parts 1–4)
- [ ] Study Guide Part 2 (Parts Two–Five)
- [ ] NYPD_Sergeant_Comprehensive_Exam_Guide.docx
- [ ] NYPD-Sergeant-Study-Guide.pdf (`~/Documents/`)

## 5. Update Master Practice Exam

The master exam has 120 questions (pre-Key integration). Chapters now have 513 total review questions.

- [ ] Expand master exam to 200+ questions drawing from all enriched chapters
- [ ] Ensure coverage across all PG sections proportional to exam weight
- [ ] Add questions targeting The Key's prior test callouts (29 known exam scenarios)

## 6. Update Cheat Sheet with Key Mnemonics

The quick-reference cheat sheet (177 lines) predates The Key integration. Missing all new mnemonics.

- [ ] Add all mnemonics: CAT PAC, WEBS, I.A.D.I.E., C.E.O., DRAMAS, C GIF CUSS, HARBOR, FRUITS, RATCOP, SECTAR, CHILD-ERS, TED the M.D. from D.C., I C no P.A.I.N., MAR BAR MAK, S.C.A.M., FOUL FRAP, A DOG CAR, G.D.A.S.S., CHASED FIT DOM, OKIUR, MODULAR, LSIR, LIMB LSS MD, and others
- [ ] Add PG Conflict summary table (16 known conflicts)
- [ ] Add role comparison quick-reference tables (D.O. vs P/S vs LPC, etc.)

## 7. Regenerate Output Files

After completing any of the above, rebuild:

- [ ] `web/data.js` — run `node scripts/build-web.js`
- [ ] `output/study-guide-combined.md` + HTML — run `bash scripts/build-pdf.sh`

## 8. Final Polish

- [ ] Proofread new section files for formatting consistency
- [ ] Verify all cross-references (`See Also` links) point to valid section numbers
- [ ] Check that `progress/tracker.json` reflects current completion status
- [ ] Deploy updated web app to GitHub Pages (`docs/` directory)

---

## What's Already Done

- [x] All 200-series chapters built from Patrol Guide (PG 200–221)
- [x] All 300-series chapters scaffolded with READMEs
- [x] The Key integration — all 24 lessons merged (1,119 callouts across 20 chapters)
- [x] 513 chapter review questions + 120 master exam questions
- [x] Web app (PWA with offline support) built and tested
- [x] Combined study guide (36,763 lines)
- [x] PDF-ready HTML output

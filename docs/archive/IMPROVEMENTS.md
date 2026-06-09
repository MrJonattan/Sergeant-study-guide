# IMPROVEMENTS.md — NYPD Sergeant Study Guide

> **Last revised:** 2026-05-23 (Fresh audit)
> **Scope:** Roadmap of improvements, grounded in actual repo state.
>
> **Key findings from fresh audit:**
> - CI deploy **already shipped** (`.github/workflows/deploy.yml` exists, deploys on push to main)
> - Touch detection **partially shipped** (`components.css` has `@media (hover: none) and (pointer: coarse)`)
> - Theme persistence **shipped** with `'light' | 'dark' | 'system'` support
> - 28 chapters confirmed (9 missing chapters from MISSING_PROCEDURES.md still need creation)
> - 140 exam questions (target: 200+)
> - 59 missing procedures documented in MISSING_PROCEDURES.md
> - Diagnostic test, resume card, Quick Quiz tab, schedule view, export/import **NOT implemented**
>
> Each item below is a **paste-ready prompt** for Claude Code.

---

## ⚠️ Resolve first — conflicting sources of truth

Fresh audit (2026-05-23) confirmed a contradiction that must be settled:

- **TODO.md** says the content is **100% complete** as of 2026-04-14.
- **MISSING_PROCEDURES.md** lists **9 missing chapters and 59 missing
  procedures.**

Audit findings:
- **28 chapters exist** — confirms 9 are missing (37 expected)
- **140 exam questions** — target is 200+
- **source-materials/extracted/** has 17 MD5-named .md files (converted PDFs)

Run this prompt before P0 content work:

```
Reconcile TODO.md and MISSING_PROCEDURES.md.

1. Read both files in full.
2. Check git log: `git log --follow -- TODO.md` and same for MISSING_PROCEDURES.md.
3. For each "missing" item in MISSING_PROCEDURES.md, verify whether it
   actually exists in chapters/. (Audit confirmed 9 chapters missing.)
4. Produce reconciled MISSING_PROCEDURES.md with verified gaps only.
5. Update TODO.md to remove "100% complete" claim.

Show me the diff before committing.
```

P0 content items below assume MISSING_PROCEDURES.md wins. If TODO.md wins
(i.e., "missing" items are actually covered), skip items 1, 2, and 5.

---

## Reusable Claude Code preamble

Prepend this to **any** prompt in this doc when running it:

```
Context: This is the NYPD Sergeant exam study guide repo. The web app is a
TypeScript monorepo: apps/web/ for the web app, packages/core/ for shared
parsing/build logic, mobile/ for the Flutter app, chapters/ for study
content as markdown. Read CLAUDE.md, PROJECT-STRUCTURE.md, and TODO.md
before making changes. Build with `npm run build:web`. Test with `npm test`
(unit) and `npm run test:e2e` (Playwright). After functional changes that
should ship: `npm run deploy`. Do not break existing tests.

Actual localStorage keys (verified 2026-05-23 audit):
  - nypd_progress  → { chapters: ChapterProgress[], streak, totalStudyTimeSeconds, lastStudyDate }
  - nypd_flashcards → { cards: Record<string, FlashcardProgress> }  (Leitner 5-box)
  - nypd_theme     → 'light' | 'dark'  (system detected via prefers-color-scheme)

Keys NOT YET implemented (do not use):
  - nypd_exam_date
  - nypd_diagnostic_completed_at
  - nypd_anthropic_key
  - nypd_progress.chapters[].lastSectionId
  - nypd_progress.chapters[].lastScrollPosition
```

---

## Disposition of prior IMPROVEMENTS.md items

What happened to each item from the original 10-item roadmap, based on fresh audit:

| # | Original item | Status now | Note |
| - | ------------- | ---------- | ---- |
| 1 | Quick UI fixes (0h 0m, empty CTA, Ctrl+K on touch) | **Still open** — P0 | Confirmed: stat shows "0h 0m", no CTA when empty, touch hint not conditional |
| 2 | Resume-last-session card | **Not shipped** — P1 | `lastSectionId`/`lastScrollPosition` not tracked; no resume card in home.ts |
| 3 | Spaced repetition (SM-2) | **Already shipped** as 5-box Leitner | See `state/progress.ts:141–218` |
| 4 | Diagnostic test | **Not shipped** — P1 | No `nypd_diagnostic_completed_at` key; no diagnostic view |
| 5 | Sergeant Focus quiz mode | **Not shipped** — P1 | View renders callouts only; no quiz mode |
| 6 | Study plan generator | **CLI only** — P2 | `scripts/generate-study-schedule.js` exists; no in-app view, no `nypd_exam_date` key |
| 7 | Finish Admin Guide PDFs | **Partially done** — P0 | 3 procedures buildable (217-18, 318-16, 318-29); 51 cross-ref only; 8 chapters need source acquisition |
| 8 | AI tutor drawer | **Not shipped** — P3 | No `nypd_anthropic_key` storage |
| 9 | Home screen widget (iOS) | **Deferred** — P3 | Blocks on Flutter parity |
| 10 | CI deploy on push | **Already shipped** | `.github/workflows/deploy.yml` deploys on push to main |

---

## P0 — Critical (content gaps + visible bugs)

### 1. Create 9 missing chapters

**Status:** Partially done — 1 complete, 8 DEFERRED · **Estimate:** TBD on source acquisition · **Files:** `chapters/{205,313,316,321,322,325,327,328}-*/`

Per MISSING_PROCEDURES.md (2026-05-24 audit):
- **Chapter 203 (ethics-and-conduct):** ✅ DONE 2026-05-24 — source available via A.G. 304-XX
- **Chapters 205, 313, 316, 321, 322, 325, 327, 328:** DEFERRED — source PDFs not available in extracted materials. Build only if user supplies standalone PDFs from Department systems.

- [ ] Done (for remaining 8 chapters, pending source acquisition)

```
For each of these PG/AG sections, create a chapter directory under chapters/:
205, 313, 316, 321, 322, 325, 327, 328.

Process ONE chapter at a time. After each, run `npm run build:web && npm test`
and commit before moving to the next. Do not batch.

For each chapter:

1. Determine the correct topic name from the source PDF. Use the existing
   chapter directory naming pattern: `{NNN}-{topic-slug}/`.

2. Extract content from the matching source PDF in source-materials/ (use
   the same OCR/text-extraction approach already used for 200-series PG
   chapters — check existing chapters for the pattern).

3. Create these files following the conventions in chapters/208-arrests/:
   - README.md  → `# Section NNN — {Title}`, source PDF reference,
     learning objectives, table of section files
   - section-NNN-XX.md (one per procedure) → procedure summary, bold
     "shall/should/may" distinctions, callouts as blockquotes
     (`> **Exam Alert:**`, `> **Memory Aid — XXX:**`, `> **Sergeant Focus:**`)
   - key-terms.md → markdown table `| Term | Definition | Reference |`
   - review-questions.md → 10–15 MC questions in the existing format
     (`**N. text**` + options + `<details>` answer)

4. After the chapter directory is built, run `npm run build:web && npm test`.
   Fix any test failures (chapter count assertions will need updating in
   scripts/test-app.js).

5. Commit with message: `feat(chapters): add NNN — {topic}`.

Acceptance: 9 new chapter directories, all tests pass, total chapter count
rises from 28 to 37.
```

---

### 2. Add missing procedures to existing chapters

**Status:** Partially done — 3 buildable, 51 DEFERRED · **Estimate:** 2–3 hr for buildable; TBD for remainder · **Files:** various `chapters/*/`

Per MISSING_PROCEDURES.md (2026-05-24 audit):
- **3 procedures have standalone source content:**
  - P.G. 217-18 (Vehicle Collision - Pedestrian/Bicyclist Right of Way) — ✅ DONE
  - A.G. 318-16 (Orders of Protection Prohibiting Off-Duty Firearms Possession) — pending
  - A.G. 318-29 (Conducting Ordered Breath Testing) — pending
- **51 procedures are cross-reference only** — appear as brief mentions (1-5 occurrences) in other procedures with no standalone content. Require source acquisition from Department systems.

- [ ] Done (for 3 buildable procedures)
- [ ] Deferred (for 51 cross-reference only procedures)

```
MISSING_PROCEDURES.md lists procedures missing from existing chapters.
2026-05-24 audit found only 3 procedures with standalone source content:
  - P.G. 217-18: source-materials/extracted/0e689fa61d88bff31935b15e3872b44f.md
  - A.G. 318-16: source-materials/extracted/9ac1e3157347850a473058e7979debea.md
  - A.G. 318-29: source-materials/extracted/9ac1e3157347850a473058e7979debea.md

Remaining 51 procedures appear only as cross-references — require source acquisition.

Process in batches of 5, one chapter at a time. After each batch:
  npm run build:web && npm test
  git commit -m "feat(chapters): add {chapter} procedures NNN-XX, NNN-YY..."

For each missing procedure:

1. Locate the source content in source-materials/extracted/ for the
   corresponding PG or AG section (files are MD5-named .md files).
2. Either append a new section-NNN-XX.md file to the chapter directory,
   or expand an existing section file if the procedure logically belongs
   there.
3. Match the existing tone and structure: bold "shall/should/may"
   distinctions, blockquote callouts where the source merits them.
4. Add ≥2 review questions per new procedure to that chapter's
   review-questions.md.
5. Extract new terms into the chapter's key-terms.md.

Acceptance: All missing procedures present, `npm test` passes, no broken
cross-references in "See Also" callouts.
```

---

### 3. Fix three home-screen UI bugs

**Status:** Confirmed open · **Estimate:** 1 hr
**Files:** `apps/web/src/views/home.ts`, `apps/web/src/styles/components.css`

**Audit findings:**
- Stat card shows `"⏱️ ${hours}h ${minutes}m"` — "0h 0m" can look like "oh om"
- No CTA when progress is empty (all zeros)
- Touch detection exists in CSS but search hint not conditional

- [ ] Done

```
Three fixes on the home view:

1. Format study time to avoid "0h 0m" reading as "oh om":
   - Change from "${hours}h ${minutes}m" to "${hours} hr ${minutes} min"
   - Or use tabular nums font variant

2. When streak=0, completed=0, studyTime=0 (fresh user), show primary CTA:
   - Card: "Start with Chapter 200 — General"
   - Navigates to #chapter/200-general
   - Hide once any progress exists

3. Search card shows "Press Ctrl+K" unconditionally. Add conditional:
   const isTouch = matchMedia('(pointer: coarse)').matches;
   Show "Tap to search" on touch, "Press Ctrl+K" otherwise.

Run npm test && npm run test:e2e after. Add e2e test for empty-state CTA.
```

---

## P1 — High exam-score impact

### 4. Add a diagnostic test

**Status:** Not started · **Estimate:** 4–6 hr · **Files:** `apps/web/src/views/diagnostic.ts` (new), `apps/web/src/main.ts`, `apps/web/src/state/progress.ts`

The Leitner system is shipped but ships with all cards in box 1. A diagnostic
seeds box assignments and Weak Areas from day one.

- [ ] Done

```
Add a one-time diagnostic test that seeds Leitner box assignments and
Weak Areas data on day one.

Requirements:
- New view at `#diagnostic`. Add it to the routes table in main.ts.
- 30 questions, pulled proportionally from all chapters based on each
  chapter's question count (more from heavier chapters). Use the
  existing question bank from appState.data, not exam questions.
- Auto-prompt the first time a user opens the app when nypd_progress has
  no quizHistory entries. Provide a "Skip for now" option.
- Also accessible from the menu as "Take diagnostic".
- After completion:
    - For each correctly answered question, place its flashcard in box 2.
    - For each wrong answer, place it in box 1 with next-review = tomorrow.
    - Write per-chapter accuracy into nypd_progress.chapters[].quizHistory
      as a special attempt type ("diagnostic").
- Set a flag `nypd_diagnostic_completed_at` so the auto-prompt fires
  exactly once.

Add unit tests for: proportional question selection, box assignment on
correct/wrong, single-fire of the auto-prompt.
```

---

### 5. Add missing AG procedures (300-series)

**Status:** Merged into Item 2 · **Estimate:** See Item 2

Subset of item #2. The 3 buildable procedures include 2 from 300-series:
- A.G. 318-16 (Orders of Protection Prohibiting Off-Duty Firearms Possession)
- A.G. 318-29 (Conducting Ordered Breath Testing)

Remaining 300-series AG procedures (318-22, 318-24, 330-xx, 332-06, etc.) are cross-reference only — require source acquisition.

- [ ] Merged into Item 2

---

### 6. Resume-where-you-left-off card on home

**Status:** Confirmed not shipped · **Estimate:** 2 hr
**Files:** `apps/web/src/views/home.ts`, `apps/web/src/state/progress.ts`, `apps/web/src/views/chapter.ts`

**Audit findings:**
- `lastSectionId` and `lastScrollPosition` not tracked in `ChapterProgress`
- No resume card rendered in home.ts

- [ ] Done

```
Add a "Continue where you left off" card at the top of the home view.

1. Extend ChapterProgress in state/progress.ts:
   lastSectionId?: string
   lastScrollPosition?: number

2. Track these in chapter.ts when user navigates/scrolls.

3. In home.ts, if any chapter has recent (<30 days) lastStudiedAt +
   lastSectionId, render: "Resume: Ch {NNN} §{X} — {Section Title}"
   Continue button → #chapter/{id}, scroll to saved position.

4. Resume card is visually dominant when present; hidden otherwise.

Test: e2e flow that visits chapter, scrolls, goes home, clicks Resume,
verifies position restored.
```

---

### 7. Expand practice exam to 200+ questions

**Status:** Not started · **Estimate:** 5–7 hr
**Files:** `assets/master-practice-exam.md`, `packages/core/src/parser.ts`

**Audit findings:**
- Current exam has exactly 140 questions (grep confirmed)
- Target: 200+ questions (+60 new)

- [ ] Done

```
Expand assets/master-practice-exam.md from 140 to 200 questions (+60).

Add questions targeting high-yield areas under-represented in the
current exam:

1. Read master-practice-exam.md and count questions per PG section.
2. Compare against chapters/*/review-questions.md counts.
3. Identify 5 most under-represented sections.
4. Write 12 new questions per under-represented section.

Use existing 4-column answer key format:
| N | A | source | explanation |

Reference exact PG/AG section numbers in source column. Explanations
must cite the procedure, not just restate the answer.

After:
  npm run build:web
  npm test  (assert examQuestions.length >= 200)
```

---

### 8. Verify Sergeant Focus quiz mode

**Status:** Partially shipped — needs verification · **Estimate:** 1–3 hr
**Files:** `apps/web/src/views/sergeant-focus.ts`, `packages/core/src/parser.ts`

The `#sergeant` route renders Sergeant Focus content, but the audit didn't
confirm whether it includes a quiz mode or just shows callouts.

- [ ] Done

```
Audit and (if needed) extend the Sergeant Focus view.

1. Read apps/web/src/views/sergeant-focus.ts and tell me what it currently
   does: just renders callouts, or also offers a quiz mode?

2. If quiz mode exists: verify it pulls only from Sergeant Focus tagged
   questions and works on mobile. Stop.

3. If quiz mode does NOT exist: add it.
   - Tab bar in #sergeant: "Browse" (current) + "Quiz" (new)
   - Quiz pulls 15 random questions from chapters with Sergeant Focus
     callouts, weighted toward those callouts where possible.
   - Scoring writes to nypd_progress.chapters[].quizHistory tagged with
     attemptType: "sergeant-focus".

Add a test verifying that the Sergeant Focus extraction count matches the
202 documented in README.md (will require updating parser.ts test or
adding a new one).
```

---

## P2 — Quality of life

### 8A. Content source acquisition

**Status:** New — P2 · **Estimate:** TBD (depends on Department access)

Per 2026-05-24 meta-audit, **51 procedures and 8 chapters** could become buildable if user pulls standalone PDFs from NYPD internal Patrol Guide / Admin Guide systems.

**Missing chapters requiring standalone PDFs:**
- P.G. 205 (Off Duty Employment)
- A.G. 313-04, 313-05
- A.G. 316-06, 316-18
- A.G. 321-26
- A.G. 322-25, 322-31, 322-39, 322-42
- A.G. 325-14, 325-15, 325-25, 325-47
- A.G. 327-03
- A.G. 328-02

**Missing procedures (cross-reference only) requiring standalone PDFs:**
- P.G.: 205-40, 209-25, 211-01, 212-13, 212-18, 212-72, 214-05, 214-15, 215-21, 217-17, 218-10, 218-24, 221-12, 221-19, 221-20, 332-06
- A.G.: 304-15, 313-04, 313-05, 316-06, 316-18, 318-22, 318-24, 319-04, 319-06, 319-10, 320-38, 321-26, 322-25, 322-31, 322-39, 322-42, 324-09, 324-11, 324-12, 324-14, 324-23, 324-28, 325-14, 325-15, 325-25, 325-47, 327-03, 328-02, 330-01, 330-02, 330-04, 330-05, 330-08, 330-11, 332-06

**Action:** User to extract standalone PDFs from Department systems and provide for extraction.

---

### 9. In-app Study Schedule view

**Status:** CLI exists; no in-app view · **Estimate:** 5–7 hr
**Files:** `apps/web/src/views/schedule.ts` (new), `apps/web/src/main.ts`

- [ ] Done

```
Expose scripts/generate-study-schedule.js as an in-app view at `#schedule`.

1. Read scripts/generate-study-schedule.js to understand the schedule
   generation logic.
2. Port that logic into a new module at packages/core/src/scheduler.ts
   so both the CLI and the web app can call it (shared source of truth).
3. Add apps/web/src/views/schedule.ts that:
   - Prompts for exam date (date picker), stores in
     localStorage key `nypd_exam_date`.
   - Renders today's plan as the primary card on the home view (above
     the Resume card from item #6).
   - Full schedule accessible at `#schedule` route.
4. Plan composition (port from CLI if not already there):
   - Default: (uncompleted chapters / days remaining, rounded up) new
     chapters + all Leitner cards due today + 10-question review of
     weakest chapter.
   - < 14 days out: cram mode (no new chapters; all due cards;
     30-question mixed practice; Sergeant Focus drill).
   - Sundays: weekly review (50-question mixed exam of week's chapters).
5. Streak in nypd_progress should only tick when a day's plan is fully
   completed, not just on app open.

Tests: plan composition at 60d, 14d, and exam day. Sunday override.
Streak only increments on full-plan completion.
```

---

### 10. Quick Quiz tab inside chapter view

**Status:** Not started · **Estimate:** 2–3 hr
**Files:** `apps/web/src/views/chapter.ts`, reuse quiz logic from `views/quiz.ts`

**Audit findings:**
- Chapter view has 3 tabs: Study, Quiz, Key Terms (line 45-47)
- Quiz tab is sequential through all questions, not random 10
- No Flashcards tab in chapter view (flashcards are separate route)

- [ ] Done

```
Add a 4th tab to chapter view: "Quick Quiz" (after Quiz tab).

Tab bar becomes: Study | Quiz | Quick Quiz | Key Terms

Quick Quiz tab:
- 10 random questions from current chapter's question bank
- Reuse rendering/scoring from views/quiz.ts
- Score saves to nypd_progress.chapters[].quizHistory with
  attemptType: "quick-quiz-chapter"
- "Take again" button reshuffles

Existing "Quiz" tab (sequential through all questions) unchanged.
```

---

### 11. Export / import progress

**Status:** Not started · **Estimate:** 2–3 hr
**Files:** `apps/web/src/components/settings.ts` (new), `apps/web/src/views/home.ts`

- [ ] Done

```
Add Export and Import buttons for user progress.

Export:
- Bundles nypd_progress, nypd_flashcards, nypd_theme, nypd_exam_date,
  nypd_diagnostic_completed_at (if present) into a single JSON object.
- Triggers download as `sergeant-progress-{ISO-date}.json`.

Import:
- File picker accepts JSON.
- Validates shape (presence of expected keys, types of fields).
- Shows a confirm dialog: "Replace all current progress?" with current
  vs imported counts side by side.
- On confirm, writes all keys to localStorage and reloads.

Place buttons in a new Settings sheet accessible from the topbar.
```

---

## P3 — Polish / deferred

### 12. AI tutor drawer

**Status:** Not started · **Estimate:** 1 day
**Files:** `apps/web/src/components/tutor-drawer.ts` (new)

- [ ] Done

```
Add an AI tutor drawer accessible from chapter and section views.

- Floating button bottom-right opens a side drawer with a chat input.
- Sends questions to the Anthropic Messages API (Claude Sonnet) with the
  current chapter or section markdown as system context.
- Capabilities: "explain this differently", "give me 3 more questions on
  this", "why is the answer X?"
- API key stored in nypd_anthropic_key (localStorage). Never committed.
- Show session token usage so cost is visible.
- If no key set, the button opens a setup CTA instead of failing.

Document setup in README under a new "AI Tutor (optional)" section.
Direct browser → Anthropic calls only; no backend.
```

---

### 13. CI deploy on push

**Status:** ✅ Already shipped · **Estimate:** N/A
**Files:** `.github/workflows/deploy.yml`

**Audit findings:**
- Workflow exists at `.github/workflows/deploy.yml`
- Triggers on push to main + workflow_dispatch
- Runs: pnpm install, pnpm run build:web, deploys to GitHub Pages
- Uses upload-pages-artifact@v3 + deploy-pages@v4

**No action needed** — CI is operational.

---

### 14. Flutter mobile app parity

**Status:** In progress in `mobile/` · **Estimate:** ongoing
**Files:** `mobile/`

Deferred. Track separately. Items 4 (diagnostic), 6 (resume), 9 (schedule),
and 11 (export/import) should ship in Flutter as well — note this in each
PR description so it's not forgotten.

Once the Flutter app is close to parity, the iOS home-screen widget
(original Item 9) becomes worth building.

---

## Rollout sequence

Don't tackle more than one P0/P1 item in parallel — they all touch
`apps/web/src/views/home.ts`, `state/progress.ts`, or chapter data, and
interleaving causes merge pain.

**Week 0** — Resolve source of truth
- [ ] Run the reconciliation prompt at the top of this doc

**Week 1** — Visible bugs and resume
- [ ] Item 3: UI fixes (0h 0m format, empty CTA, touch hint)
- [ ] Item 6: Resume card

**Weeks 2–4** — Content gaps (COLLAPSED per meta-audit)
- [x] Chapter 203: DONE 2026-05-24
- [x] P.G. 217-18: DONE 2026-05-24
- [ ] A.G. 318-16, 318-29: ~half day of work
- [ ] Remaining 51 procedures + 8 chapters: DEFERRED pending source acquisition from Department systems

**Week 5** — Retention features
- [ ] Item 4: Diagnostic test (30 questions, seeds Leitner boxes)
- [ ] Item 8: Sergeant Focus quiz mode audit/extend
- [ ] Item 7: Expand exam to 200 questions (currently 140)

**Week 6** — Daily-use lift
- [ ] Item 9: Study schedule view + `nypd_exam_date` key
- [ ] Item 10: Quick Quiz tab in chapter view
- [ ] Item 11: Export/import progress

**Later** — Optional power features
- [ ] Item 12: AI tutor drawer + `nypd_anthropic_key` storage
- [ ] Item 14: Flutter parity + iOS widget

---

## Appendix — Actual implementation details

Verified ground truth as of 2026-05-23 audit. Use these for prompts above.

### localStorage keys (confirmed)

| Key | Shape | Defined in | Status |
| --- | ----- | ---------- | ------ |
| `nypd_progress` | `{ chapters: ChapterProgress[], streak, totalStudyTimeSeconds, lastStudyDate }` | `apps/web/src/state/progress.ts:5` | ✅ Shipped |
| `nypd_flashcards` | `{ cards: Record<string, FlashcardProgress> }` (Leitner 5-box) | `apps/web/src/state/progress.ts:157` | ✅ Shipped |
| `nypd_theme` | `'light' \| 'dark'` (system via prefers-color-scheme) | `apps/web/src/utils/theme.ts:5-25` | ✅ Shipped |
| `nypd_exam_date` | `number` (timestamp) | — | ❌ Not implemented |
| `nypd_diagnostic_completed_at` | `number` (timestamp) | — | ❌ Not implemented |
| `nypd_anthropic_key` | `string` | — | ❌ Not implemented |

### ChapterProgress (actual, from `apps/web/src/state/progress.ts:13-22`)

```typescript
interface ChapterProgress {
  chapterId: string;
  status: 'not_started' | 'in_progress' | 'review' | 'completed';
  quizScore?: number;
  quizHistory?: QuizAttempt[];  // { correctAnswers, totalQuestions, timestamp }
  questionsAnswered: number;
  timeSpentSeconds: number;
  lastStudiedAt?: string;
  completedAt?: string;
  // NOT YET IMPLEMENTED: lastSectionId, lastScrollPosition (needed for resume card)
}
```

### Build pipeline

```
chapters/**/*.md
       │
       ▼
packages/core/src/builder.ts  (buildChapter, parseReviewQuestions, extractSergeantFocus)
       │
       ▼
build/data.js → build/data.json
       │
       ├──► apps/web/public/data.js   (dev)
       ├──► docs/data.js              (deploy)
       └──► mobile/assets/data/study_data.json  (via `npm run sync:mobile`)
```

### View routes (confirmed)

| Route | Component | File |
| ----- | --------- | ---- |
| `#home` | renderHome | `apps/web/src/views/home.ts` |
| `#chapter/:id` | renderChapter | `apps/web/src/views/chapter.ts` |
| `#quiz` | renderQuiz | `apps/web/src/views/quiz.ts` |
| `#exam` | renderExam | `apps/web/src/views/exam.ts` |
| `#flashcards` | renderFlashcards | `apps/web/src/views/flashcards.ts` |
| `#cheatsheet` | renderCheatSheet | `apps/web/src/views/cheat-sheet.ts` |
| `#sergeant` | renderSergeantFocus | `apps/web/src/views/sergeant-focus.ts` |
| `#weak` | renderWeakAreas | `apps/web/src/views/weak-areas.ts` |
| `#search` | renderSearch | `apps/web/src/views/search.ts` |

### View routes (need implementation)

| Route | Component | File | Status |
| ----- | --------- | ---- | ------ |
| `#diagnostic` | renderDiagnostic | `apps/web/src/views/diagnostic.ts` | ❌ Not implemented |
| `#schedule` | renderSchedule | `apps/web/src/views/schedule.ts` | ❌ Not implemented |

### Sergeant Focus extraction

```typescript
// packages/core/src/parser.ts:156-173
export function extractSergeantFocus(content: string, filename: string): SergeantFocus[] {
  const callouts: SergeantFocus[] = [];
  const matches = content.match(/^>\s+\*\*Sergeant Focus:\*\*\s*(.+)/gm) || [];
  for (const match of matches) {
    const text = match.replace(/^>\s+\*\*Sergeant Focus:\*\*\s*/, '').trim();
    if (text.length >= 20) callouts.push({ filename, text });
  }
  return callouts;
}
```

### Test commands

```bash
npm run test:unit       # 23 unit tests via scripts/test-app.js
npm run test:e2e        # Playwright
npm run test:coverage   # Coverage audit
```

---

**End of IMPROVEMENTS.md**

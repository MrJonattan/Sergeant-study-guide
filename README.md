# Sergeant Promotional Exam — Study Guide

A comprehensive study guide for the NYPD Sergeant Promotional Exam, built from the official NYPD Public Patrol Guide and enriched with exam-focused content from The Key Police Promotional School's 24-lesson preseason course.

## Live App

**[https://mrjonattan.github.io/sergeant-study-guide/](https://mrjonattan.github.io/sergeant-study-guide/)**

Works offline on iPhone and Android (PWA). Add to home screen for a native app experience.

---

## Table of Contents

1. [What This Project Is](#what-this-project-is)
2. [Source Materials](#source-materials)
3. [How It Was Built](#how-it-was-built)
4. [Project Structure](#project-structure)
5. [Chapter Coverage](#chapter-coverage)
6. [The Key Integration](#the-key-integration)
7. [Web App Features](#web-app-features)
8. [Build System](#build-system)
9. [Testing](#testing)
10. [Deployment](#deployment)
11. [What's Still To Do](#whats-still-to-do)

---

## What This Project Is

This project converts the NYPD's 1,600-page Patrol Guide into a structured, searchable, mobile-friendly study guide specifically designed for the Sergeant Promotional Exam. Every chapter is organized by PG section number, broken into focused study sections, and enhanced with exam-specific callouts, mnemonics, and practice questions.

### By the Numbers

| Metric | Count |
|--------|-------|
| Chapters | 28 (PG sections 200-332) |
| Section files | 132 |
| Chapter review questions | 532 |
| Master practice exam questions | 120 (with explanations) |
| Exam callouts (alerts, mnemonics, prior test notes) | 1,331 |
| Combined study guide | 38,220 lines |
| Key terms files | 25 |

---

## Source Materials

All study content was derived from these official sources:

### Patrol Guide PDFs (Primary Source)

| File | Sections Covered | Pages | Notes |
|------|-----------------|-------|-------|
| `public-pguide1.pdf` | 200 General, 202 Duties, 207 Complaints, 208 Arrests, 209 Summonses | 441 | OCR'd version used for text extraction |
| `public-pguide2.pdf` | 210 Prisoners, 211 Court, 212 Command Ops, 213 Mobilization | 452 | Text-selectable |
| `public-pguide3.pdf` | 214 Quality of Life, 215 Juvenile, 216 Aided, 217 Collisions | 289 | Text-selectable |
| `public-pguide4.pdf` | 218-221 Property/Tactical, 303-332 Personnel/Admin | 412 | OCR'd version used for text extraction |

### The Key Police Promotional School (Enrichment Source)

24 lesson PDFs from The Key's preseason course were integrated as a second pass over all chapters. These added:

- **Exam Alert** callouts — highlighting what's been tested and how questions are typically framed
- **Memory Aid** mnemonics — acronyms like CAT PAC, WEBS, FOUL FRAP, MODULAR, CHASED, HARBOR
- **Prior Test** notes — specific scenarios that appeared on previous sergeant exams
- **PG Conflict** warnings — where The Key's material contradicts the Patrol Guide (always follow the PG)
- **See Also** cross-references — linking related procedures across chapters
- **Sergeant Focus** callouts — supervisor-specific responsibilities

---

## How It Was Built

This project was built in phases using Claude Code as the primary development tool. Here is the step-by-step roadmap of how it went from raw PDFs to a deployed study app.

### Phase 1: PDF Extraction and Chapter Scaffolding

1. **Set up project structure** — Created 28 chapter directories matching PG section numbers (200-series for Operations, 300-series for Personnel/Admin)
2. **Extract text from PDFs** — Used OCR'd versions of pguide1 and pguide4 (scanned images). Pguide2 and pguide3 were already text-selectable
3. **Build chapter READMEs** — Each chapter got a README.md with title, source PDF reference, learning objectives, and links to section files
4. **Create section files** — Broke each PG section into focused study topics. For example, Chapter 208 (Arrests) became 9 section files covering law/processing, DAT, domestic violence, search guidelines, special arrests, etc.
5. **Write key terms** — Created key-terms.md for each chapter with vocabulary, definitions, and acronyms in table format
6. **Write review questions** — Created review-questions.md with multiple-choice questions using `<details>` tags for collapsible answers

### Phase 2: The Key Integration (24 Lessons)

Each of the 24 Key lessons was integrated one at a time into the matching chapter:

1. **Read the lesson PDF** — Extract exam alerts, mnemonics, prior test references, and PG conflicts
2. **Enrich existing section files** — Insert callouts at the relevant location in each section using blockquote format (`> **Exam Alert:**`, `> **Memory Aid —**`, etc.)
3. **Add new content** — Where The Key covered procedures not yet in the study guide, create new sections or expand existing ones
4. **Update review questions** — Add questions targeting The Key's exam focus areas
5. **Update key terms** — Add new mnemonics and acronyms to the terms table

This process was repeated for all 24 lessons across 20 chapters, producing 1,331 callouts total.

### Phase 3: Build System and Web App

1. **Build `build-web.js`** — Node.js script that reads all chapter directories, parses review questions from markdown, and generates a single `data.js` file containing all study content as JSON
2. **Build `build-pdf.sh`** — Bash script that concatenates all markdown files in chapter order and runs Pandoc to generate a combined study guide HTML with table of contents
3. **Create the web app** — Single-page application in `src/index.html` (HTML + CSS + JS, no framework) with:
   - Custom markdown-to-HTML renderer with callout detection
   - Chapter navigation with sidebar
   - Quiz engine with scoring and progress tracking
   - 120-question practice exam with timed mode
   - Flashcard viewer for key terms
   - Search across all content
   - Dark mode, adjustable font size
   - Service worker for offline access
4. **Create `package.json`** — Added npm scripts for `build`, `build:web`, `build:pdf`, `test`, and `deploy`

### Phase 4: Master Practice Exam

1. **Write 120 questions** — Multiple-choice questions covering all PG sections, weighted by exam importance
2. **Create answer key** — 4-column table with question number, correct answer, PG/AG source reference, and explanation
3. **Update parser** — Extended `parsePracticeExam()` in build-web.js to extract explanations from the 4-column format
4. **Build exam UI** — Timed exam mode with question navigation, answer selection, submission, and detailed results with per-question explanations

### Phase 5: Styling and iPhone Optimization

1. **Color-coded callouts** — Each callout type gets a distinct color:
   - Exam Alert: yellow/amber
   - Memory Aid: green
   - Prior Test: blue
   - PG Conflict: red
   - See Also: purple
   - Sergeant Focus: inverted black/white
2. **Typography** — Playfair Display for headings, Source Serif 4 for body, JetBrains Mono for UI elements
3. **Dark mode** — Full dark theme with adjusted contrast ratios
4. **Table striping** — Alternating row backgrounds for readability
5. **iPhone PWA optimization**:
   - `apple-mobile-web-app-capable` for fullscreen home screen mode
   - Safe area insets for notch and home indicator
   - 44px minimum touch targets (Apple HIG compliance)
   - Horizontal table scroll on mobile
   - Disabled tap highlight for native feel

### Phase 6: Testing and Polish

1. **Built test suite** (`scripts/test-app.js`) — 23 automated tests covering:
   - Data structure validation (chapters, sections, questions)
   - Question integrity (valid answers, no duplicates)
   - HTML structure (matched tags, required elements)
   - Enrichment verification (callouts present in expected chapters)
   - Mnemonic verification (key mnemonics present in data)
2. **Cross-reference audit** — Verified all "See Also" references point to valid PG sections
3. **Formatting consistency** — Standardized all README headings to `# Section NNN — Title`
4. **Removed generated files from git** — Added `build/` and `progress/` to .gitignore
5. **Project reorganization** — Moved web source to `src/`, renamed `output/` to `build/`, cleaned up dead files

### Phase 7: Deployment

1. **GitHub Pages** — Configured to serve from `docs/` directory on main branch
2. **Deploy script** — `npm run deploy` copies `src/` and `build/data.js` into `docs/`
3. **Service worker** — Caches index.html, data.js, and manifest.json for offline use
4. **PWA manifest** — Enables "Add to Home Screen" on mobile devices

---

## Project Structure

```
nypd-sergeant-study-guide/
├── chapters/                    # Study content (28 chapter directories)
│   ├── 200-general/
│   │   ├── README.md            # Chapter overview and learning objectives
│   │   ├── section-200-02.md    # Individual procedure study notes
│   │   ├── key-terms.md         # Vocabulary and acronyms
│   │   └── review-questions.md  # Multiple-choice practice questions
│   ├── 202-duties-responsibilities/
│   ├── 207-complaints/
│   │   ... (28 total)
│   └── 332-employee-rights/
├── src/                         # Web app source
│   ├── index.html               # Single-page app (HTML + CSS + JS)
│   ├── manifest.json            # PWA manifest
│   └── sw.js                    # Service worker for offline support
├── scripts/                     # Build and test scripts
│   ├── build-web.js             # Generates data.js from chapter markdown
│   ├── build-pdf.sh             # Generates combined markdown + HTML via Pandoc
│   └── test-app.js              # 23-test automated test suite
├── build/                       # Generated output (gitignored)
│   ├── data.js                  # All study data as JSON
│   ├── study-guide-combined.md  # 38K-line combined markdown
│   ├── study-guide.html         # HTML with table of contents
│   ├── master-practice-exam.md  # 120 questions + answer key
│   └── quick-reference-cheat-sheet.md
├── docs/                        # GitHub Pages deployment
│   ├── index.html
│   ├── data.js
│   ├── manifest.json
│   └── sw.js
├── package.json                 # npm build/test/deploy scripts
├── CLAUDE.md                    # AI assistant project instructions
├── TODO.md                      # Remaining work checklist
└── .gitignore
```

### Chapter Directory Naming

Chapters use the pattern `{PG-section}-{topic}`:
- `208-arrests` = Patrol Guide Section 208
- `318-disciplinary-matters` = Administrative Guide Section 318
- 200-series = Operations chapters
- 300-series = Personnel & Administration chapters

### Content File Formats

**Section files** (`section-NNN-topic.md`):
- Markdown with PG procedure numbers as headings
- Blockquote callouts for exam content (`> **Exam Alert:**`)
- Tables for role comparisons and procedure summaries
- Bold/italic for emphasis on testable distinctions ("shall" vs "should" vs "may")

**Review questions** (`review-questions.md`):
- Questions with `**N. question text**` format
- Options as `- A) option text`
- Answers in collapsible `<details><summary>Answer</summary>` blocks

**Key terms** (`key-terms.md`):
- Markdown table format: `| Term | Definition | Reference |`

---

## Chapter Coverage

### 200-Series — Operations (17 chapters)

| PG Section | Topic | Sections | Questions | Enriched |
|------------|-------|----------|-----------|----------|
| 200 | General | 1 | 10 | - |
| 202 | Duties & Responsibilities | 2 | 25 | Yes |
| 207 | Complaints | 6 | 20 | Yes |
| 208 | Arrests | 9 | 25 | Yes |
| 209 | Summonses | 6 | 20 | Yes |
| 210 | Prisoners | 4 | 15 | Yes |
| 211 | Court Appearances | 6 | 15 | - |
| 212 | Command Operations | 12 | 35 | Yes |
| 213 | Mobilization/Emergency | 7 | 20 | Yes |
| 214 | Quality of Life | 6 | 15 | Yes |
| 215 | Juvenile Matters | 4 | 20 | Yes |
| 216 | Aided Cases | 6 | 20 | Yes |
| 217 | Vehicle Collisions | 5 | 13 | Yes |
| 218 | Property General | 6 | 11 | Yes |
| 219 | Department Property | 5 | 12 | Yes |
| 220 | Citywide Incident Mgmt | 6 | 10 | Yes |
| 221 | Tactical Operations | 6 | 25 | Yes |

### 300-Series — Personnel & Administration (11 chapters)

| PG Section | Topic | Sections | Questions | Enriched |
|------------|-------|----------|-----------|----------|
| 303 | Duties & Responsibilities (Admin) | 0 | 0 | - |
| 304 | General Regulations | 6 | 16 | Yes |
| 305 | Uniforms & Equipment | 7 | 17 | Yes |
| 318 | Disciplinary Matters | 8 | 20 | Yes |
| 319 | Civilian Personnel | 1 | 4 | Yes |
| 320 | Personnel Matters | 0 | 0 | - |
| 324 | Leave, Payroll & Timekeeping | 1 | 7 | - |
| 329 | Career Development | 1 | 12 | - |
| 330 | Medical, Health & Wellness | 7 | 25 | Yes |
| 331 | Evaluations | 0 | 0 | - |
| 332 | Employee Rights | 4 | 12 | Yes |

**"Enriched"** = Content enhanced with The Key exam callouts, mnemonics, and prior test references.

---

## The Key Integration

The Key Police Promotional School's 24-lesson preseason course was integrated across 20 chapters. Each lesson maps to specific PG sections:

| Lessons | Topic | Target Chapter(s) |
|---------|-------|-------------------|
| 1-2 | Duties & Responsibilities | 202 |
| 3 | General Regulations | 304 |
| 4 | Uniforms & Equipment | 305 |
| 5 | Employee Rights | 332 |
| 6 | Disciplinary Matters | 318 |
| 7-8 | Complaints | 207 |
| 9-10 | Arrests | 208 |
| 11 | Summonses | 209 |
| 12 | Prisoners | 210 |
| 13-15 | Command Operations | 212 |
| 16 | Mobilization/Emergency | 213 |
| 17 | Quality of Life | 214 |
| 18 | Juvenile Matters | 215 |
| 19 | Aided Cases | 216 |
| 20 | Vehicle Collisions | 217 |
| 21 | Property General | 218 |
| 22 | Department Property | 219 |
| 23 | Citywide Incident Mgmt | 220 |
| 24 | Tactical Operations | 221 |

### Callout Types

| Callout | Color | Purpose |
|---------|-------|---------|
| **Exam Alert** | Yellow | What's been tested and how questions are framed |
| **Memory Aid** | Green | Mnemonics and memory tricks (e.g., CAT PAC, FOUL FRAP) |
| **Prior Test** | Blue | Specific scenarios from previous exams |
| **PG Conflict** | Red | Where The Key contradicts the Patrol Guide |
| **See Also** | Purple | Cross-references to related procedures |
| **Sergeant Focus** | Black/White | Supervisor-specific responsibilities |

### Key Mnemonics Added

| Mnemonic | Chapter | What It Covers |
|----------|---------|----------------|
| CAT PAC | 202 | Patrol supervisor field duties |
| WEBS | 202 | Desk officer responsibilities |
| I.A.D.I.E. | 202 | SOL problem-solving model |
| HARBOR | 212 | Command operations checklist |
| FRUITS | 213 | Mobilization readiness |
| RATCOP | 213 | Rapid mobilization steps |
| CHILD-ERS | 216 | Child abuse indicators |
| MAR BAR MAK | 215 | Juvenile arrest procedures |
| OKIUR | 217 | Vehicle collision investigation |
| CHASED FIT DOM | 218 | Property invoicing categories |
| MODULAR | 220 | CIMS structure |
| LSIR | 220 | Incident priorities |
| FOUL FRAP | 318 | Disciplinary offenses |
| S.C.A.M. | 215 | School safety procedures |

---

## Web App Features

The web app is a single HTML file (`src/index.html`, ~1,660 lines) with no external dependencies beyond Google Fonts. It includes:

- **Chapter browser** — Navigate 28 chapters with sidebar, tabs for Study/Key Terms/Quiz/Flashcards
- **Custom markdown renderer** — Converts chapter markdown to styled HTML with callout detection
- **Quiz engine** — Per-chapter multiple-choice quizzes with immediate feedback, scoring, and shuffle mode
- **Practice exam** — Full 120-question timed exam simulating test conditions, with results breakdown
- **Flashcard viewer** — Key terms displayed as flippable flashcards with shuffle
- **Search** — Full-text search across all chapters, terms, and questions (Ctrl+K or bottom nav)
- **Progress tracking** — Chapters marked as read, quiz scores saved, study streaks tracked
- **Weak areas** — Identifies chapters where quiz performance is lowest
- **Dark mode** — Full dark theme with toggle
- **Font scaling** — Adjustable text size (A-/A+)
- **Bookmarks** — Mark questions for review
- **Data export/import** — Backup and restore all progress data
- **Offline support** — Service worker caches all assets for use without internet
- **PWA** — Add to home screen on iPhone/Android for native app experience

---

## Build System

### Prerequisites

- **Node.js** (v18+)
- **Pandoc** (for PDF/HTML generation only)

### Commands

```bash
npm run build        # Generate all output (data.js + combined markdown + HTML)
npm run build:web    # Generate data.js only (fast, for web app updates)
npm run build:pdf    # Generate combined study guide + cheat sheet + exam HTML
npm run test         # Run 23-test automated suite
npm run deploy       # Copy build output to docs/ for GitHub Pages
```

### Build Pipeline

```
chapters/**/*.md ──> build-web.js ──> build/data.js ──> docs/data.js
                 ──> build-pdf.sh ──> build/study-guide-combined.md
                                  ──> build/study-guide.html
                                  ──> build/master-practice-exam.html
                                  ──> build/quick-reference-cheat-sheet.html
```

`build-web.js` does the heavy lifting:
1. Reads all 28 chapter directories in PG section order
2. Parses README, section files, key terms, and review questions
3. Extracts multiple-choice questions from markdown (supports 3 different question formats)
4. Parses the master practice exam with 4-column answer key (answer, source, explanation)
5. Outputs everything as `window.STUDY_DATA = {...}` in data.js

---

## Testing

The test suite (`scripts/test-app.js`) runs 23 automated tests:

```bash
npm run test
```

### Test Categories

**Data structure** — Validates chapters array, required fields, section content, question format

**Question integrity** — Checks for valid answer letters, no duplicate question numbers, options present

**Enrichment verification** — Confirms exam callouts are present in all enriched chapters

**Mnemonic verification** — Checks that key mnemonics (CAT PAC, MODULAR, FOUL FRAP, etc.) exist in the correct chapters

**HTML validation** — Verifies DOCTYPE, script/style tag balance, service worker registration, manifest reference

**Exam questions** — Validates all 120 exam questions have text, answer, options, and explanations

---

## Deployment

The app is deployed to GitHub Pages from the `docs/` directory on the main branch.

### Deploy Process

```bash
npm run build        # Generate fresh data.js
npm run test         # Verify everything passes
npm run deploy       # Copy src/ + build/data.js to docs/
git add docs/
git commit -m "deploy: update study guide"
git push
```

GitHub Pages automatically picks up changes to `docs/` on push. Updates are live within 1-2 minutes.

### iPhone Setup

1. Open the URL in Safari
2. Tap the Share button (box with arrow)
3. Tap "Add to Home Screen"
4. The app launches fullscreen with offline support

---

## What's Still To Do

See [TODO.md](TODO.md) for the full checklist. Major remaining items:

- **3 empty chapters** (303, 320, 331) — Need content extracted from Patrol Guide
- **3 thin chapters** (319, 324, 329) — Only 1 section each, need expansion
- **12 Administrative Guide PDFs** — Not yet ingested (firearms regs, fitness for duty, etc.)
- **8 DOCX study guides** — External exam prep materials not yet incorporated
- **Expand practice exam** — Currently 120 questions, target 200+
- **Update cheat sheet** — Missing all Key mnemonics and PG conflict summary

---

## Tools Used

| Tool | Purpose |
|------|---------|
| Claude Code | AI-assisted content extraction, enrichment, web app development, and testing |
| Node.js | Build scripts and test runner |
| Pandoc | Markdown to HTML conversion for PDF output |
| GitHub Pages | Static site hosting |
| Git | Version control (35 commits) |

---

## License

This project contains study notes derived from publicly available NYPD Patrol Guide documents. It is intended for personal exam preparation use only.

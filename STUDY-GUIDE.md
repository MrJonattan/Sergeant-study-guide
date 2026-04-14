# NYPD Sergeant Exam — Proficient Study Guide

> **Generated:** 2026-04-14 | **Version:** 2.1

This guide shows you how to study **more proficiently** using all available tools and features.

---

## Quick Start

```bash
cd ~/Projects/nypd-sergeant-study-guide

# 1. Build everything
npm run build

# 2. Export Anki flashcards + generate study schedule
npm run study

# 3. Open web app
open docs/index.html
```

---

## 📊 What You Have

| Resource | Count | Location |
|----------|-------|----------|
| **Chapters** | 28 | `chapters/` |
| **Chapter Questions** | 569 | Web app Quiz mode |
| **Master Exam Questions** | 140 | Web app Exam mode |
| **Key Terms** | 1,759 | Anki export |
| **Sergeant Focus Callouts** | 202 | Web app + Anki |
| **Notes (Critical Details)** | 56 | Web app + Anki |
| **Total Flashcards** | 4,693+ | `build/anki-*.csv` |

---

## 🎯 Study Workflow (Recommended)

### Phase 1: Foundation (Weeks 1-6)

**Daily routine (60-90 minutes):**

1. **Read** one chapter section (15 min)
2. **Key Terms** — Review vocabulary (10 min)
3. **Quiz Mode** — Answer 15-20 questions (20 min)
4. **Sergeant Focus** — Memorize supervisor duties (10 min)
5. **Anki** — Review spaced repetition cards (15 min)

**Weekly goals:**
- Complete 3-4 chapters
- Take one practice quiz (50+ questions)
- Review all bookmarked questions

---

### Phase 2: Practice (Weeks 7-10)

**Daily routine (90-120 minutes):**

1. **Anki reviews** — Due cards first (20 min)
2. **Weak Areas** — Focus on low-scoring categories (30 min)
3. **Chapter deep-dive** — Re-read difficult sections (30 min)
4. **Quiz Mode** — Timed practice (30 min)

**Weekly goals:**
- One full 140-question practice exam (timed)
- Review all incorrect answers
- Update study schedule based on weak areas

---

### Phase 3: Exam Simulation (Weeks 11-12)

**Daily routine (2-3 hours):**

1. **Full practice exam** — Every other day (90 min)
2. **Review mistakes** — Deep analysis (30 min)
3. **Sergeant Focus** — Rapid review (15 min)
4. **Cheat Sheet** — Memorize mnemonics (15 min)

**Final week:**
- No new material
- Review bookmarked questions only
- Light Anki reviews
- Rest before exam day

---

## 📱 Web App Features

Open: `docs/index.html`

### Dashboard (Home)
- **Readiness Score** — Overall preparation level (0-100%)
- **Study Streak** — Consecutive days studied
- **Daily Goal** — Questions answered today vs. target
- **Recent Chapters** — Quick resume
- **Score Trend** — Visual progress chart
- **Exam History** — All past practice exams

### Chapters View
- **Study Tab** — Full chapter content with callouts
- **Key Terms Tab** — Vocabulary tables
- **Flashcards Tab** — Auto-generated from key terms
- **Quiz Tab** — Chapter-specific questions
- **Review Tab** — Open-ended questions

### Practice Exam
- **Full Exam** — 140 questions (simulates real exam)
- **Custom Exam** — Select specific categories
- **Timer** — Track pacing
- **Score History** — Track improvement over time

### Sergeant Focus
- **202 supervisor-specific callouts**
- Organized by 15 job categories:
  - Prisoner Management
  - Arrest Processing
  - Supervisor Response
  - Documentation & Reports
  - Property & Evidence
  - Court & Legal
  - Use of Force
  - Juvenile Procedures
  - Personnel & Leave
  - Equipment & Uniforms
  - Command Operations
  - Quality of Life
  - Mobilization & Emergency
  - Disciplinary Matters
  - Complaints & Investigations
  - General Regulations
  - Medical & Wellness

### Notes View
- **56 critical details** extracted from procedures
- Organized by procedure number
- Export to flashcards

### Cheat Sheet
- **25+ mnemonics** for memorization
- **20 PG conflicts** documented
- Force incident levels
- Critical timeframes
- Approval authorities
- Less lethal weapons reference

### Weak Areas
- Automatically identifies lowest-scoring categories
- Prioritized study recommendations
- Click to jump to specific topics

---

## 🗂️ Anki Flashcard Exports

**Location:** `build/anki-*.csv`

| File | Cards | Use For |
|------|-------|---------|
| `anki-chapter-questions.csv` | 525 | Chapter quiz practice |
| `anki-master-exam.csv` | 140 | Full exam simulation |
| `anki-key-terms.csv` | 1,759 | Vocabulary memorization |
| `anki-sergeant-focus.csv` | 202 | Supervisor duties |
| `anki-notes.csv` | 56 | Critical details |

### Import to Anki

1. Open Anki → File → Import
2. Select CSV file
3. Map fields: **Front → Front**, **Back → Back**
4. **Enable "Allow HTML in fields"**
5. Choose deck (create "NYPD Sergeant Exam" deck)
6. Import

### Recommended Anki Settings

```
New cards/day: 20-30
Review cards/day: 200
Easy bonus: 120%
Interval modifier: 100%
Maximum interval: 365 days
```

---

## 📅 Study Schedule

**Location:** `build/study-schedule.md`

The schedule generator creates a **week-by-week plan** based on:
- **Priority** — High-priority chapters first (most tested)
- **Time estimate** — Realistic hours per chapter
- **Review weeks** — Built-in retention time
- **Practice exams** — Scheduled throughout

### Default Schedule (12 weeks, 8 hrs/week)

| Week | Focus | Chapters |
|------|-------|----------|
| 1-2 | High Priority | 200-General, 202-Duties, 207-Complaints, 208-Arrests |
| 3-4 | High Priority | 210-Prisoners, 212-Command, 213-Mobilization, 215-Juvenile |
| 5-6 | Medium Priority | 209-Summonses, 211-Court, 214-QOL, 216-Aided, 217-Collisions |
| 7-8 | 300-Series | 303-Duties, 304-Regs, 318-Disciplinary, 320-Personnel |
| 9-10 | 300-Series | 319-Civilian, 324-Leave, 329-Career, 330-Wellness, 331-Eval, 332-Rights |
| 11 | Review | Full practice exams |
| 12 | Final Review | Weak areas only |

---

## ⌨️ Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Ctrl+K` or `/` | Open search |
| `Esc` | Close search / Go home |
| `1-4` | Select answer A-D |
| `N` | Next chapter |
| `P` | Previous chapter |
| `?` | Show shortcuts help |

---

## 📈 Progress Tracking

The web app tracks:

| Metric | Storage | Description |
|--------|---------|-------------|
| **Chapters Read** | localStorage | Which chapters you've completed |
| **Quiz Scores** | localStorage | Per-chapter quiz performance |
| **Bookmarks** | localStorage | Flagged difficult questions |
| **Exam History** | localStorage | All practice exam results |
| **Study Streak** | localStorage | Consecutive days studied |
| **Time Spent** | localStorage | Per-chapter study time |
| **Spaced Repetition** | localStorage | Anki-style box system |

### Reset Progress (if needed)

```javascript
// Open browser console (F12) and run:
localStorage.clear();
location.reload();
```

---

## 📄 PDF Export

For offline study:

```bash
# Open HTML files in browser
open build/study-guide.html
open build/quick-reference-cheat-sheet.html
open build/master-practice-exam.html

# Then: File → Print → Save as PDF
```

---

## 🎯 Exam Tips

### What's Most Tested

1. **Supervisor Responsibilities** — Sergeant-specific duties
2. **Use of Force** — Levels 1-4, reporting requirements
3. **Prisoner Management** — Safety, processing, rights
4. **Arrest Procedures** — DOM, notifications, special cases
5. **Disciplinary Matters** — IAB procedures, penalties
6. **Aided Cases** — EDP, medical emergencies, deaths
7. **Court Appearances** — Subpoenas, testimony, evidence

### Memorize These

- **Force Levels:** Hands → Hits → Heavy → Fatal (1-4)
- **Critical Timeframes:** 48hr firearms report, 6hr SCOC, 24-48hr welfare
- **Approval Chains:** Who approves what (Sgt vs Lt vs Captain vs Chief)
- **Mnemonics:** See Cheat Sheet for all 25+ memory aids

---

## 🔧 Commands Reference

```bash
# Build everything
npm run build

# Export Anki flashcards
npm run export:anki

# Generate study schedule
npm run schedule

# Both + open schedule
npm run study

# Open web app
open docs/index.html

# Open study schedule
open build/study-schedule.md

# Open Anki exports
ls build/anki-*.csv
```

---

## 📞 Support

| Issue | Solution |
|-------|----------|
| Flashcards not importing | Enable "Allow HTML in fields" in Anki |
| Progress not saving | Check browser localStorage is enabled |
| Dark mode not working | Toggle manually, then auto-detects |
| Search not finding | Use exact terms, try singular/plural |

---

## 📚 Source Material

All content derived from:

- **4 Patrol Guide PDFs** (pguide1-4)
- **2 Administrative Guides**
- **12 Individual AG Procedures**
- **24 The Key Lesson PDFs**

**Location:** `~/Documents/NYPD PG/`

---

**Good luck on your exam! 🍀**

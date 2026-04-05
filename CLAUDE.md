# NYPD Sergeant Promotional Exam Study Guide

## Overview

A PDF study guide for the NYPD Sergeant Promotional Exam, organized by chapters and sections with built-in progress tracking. All content is sourced exclusively from the NYPD Public Patrol Guide.

## Source Material

All content must be derived from these documents only:

| File | Sections Covered | Pages | Notes |
|------|-----------------|-------|-------|
| `~/Documents/NYPD PG/public-pguide1.pdf` | 200 General, 202 Duties & Responsibilities, 207 Complaints, 208 Arrests, 209 Summonses | 441 | Original (scanned images) |
| `~/Documents/NYPD PG/ocr/public-pguide1-ocr.pdf` | _(same as above)_ | 441 | OCR'd version — use this for text extraction |
| `~/Documents/NYPD PG/public-pguide2.pdf` | 210 Prisoners, 211 Court & Agency Appearances, 212 Command Operations, 213 Mobilization/Emergency Incidents | 452 | Text-selectable |
| `~/Documents/NYPD PG/public-pguide3.pdf` | 214 Quality of Life, 215 Juvenile Matters, 216 Aided Cases, 217 Vehicle Collisions | 289 | Text-selectable |
| `~/Documents/NYPD PG/public-pguide4.pdf` | 218 Property General, 219 Dept Property, 220 Citywide Incident Mgmt, 221 Tactical Operations, 303-332 (Personnel/Admin) | 412 | Original (scanned images) |
| `~/Documents/NYPD PG/ocr/public-pguide4-ocr.pdf` | _(same as above)_ | 412 | OCR'd version — use this for text extraction |
| `~/Documents/NYPD PG/Table of content.pdf` | Full Table of Contents | 2 | Text-selectable |

**Important:** Do NOT use external sources. If information is needed beyond these documents, ask the user to provide updated materials.

## Project Structure

```
nypd-sergeant-study-guide/
├── CLAUDE.md
├── chapters/                # Study content organized by PG section
│   ├── 200-general/
│   ├── 202-duties-responsibilities/
│   ├── 207-complaints/
│   ├── 208-arrests/
│   ├── 209-summonses/
│   ├── 210-prisoners/
│   ├── 211-court-appearances/
│   ├── 212-command-operations/
│   ├── 213-mobilization-emergency/
│   ├── 214-quality-of-life/
│   ├── 215-juvenile-matters/
│   ├── 216-aided-cases/
│   ├── 217-vehicle-collisions/
│   ├── 218-property-general/
│   ├── 219-department-property/
│   ├── 220-citywide-incident-mgmt/
│   ├── 221-tactical-operations/
│   ├── 303-duties-responsibilities/
│   ├── 304-general-regulations/
│   ├── 305-uniforms-equipment/
│   ├── 318-disciplinary-matters/
│   ├── 319-civilian-personnel/
│   ├── 320-personnel-matters/
│   ├── 324-leave-payroll-timekeeping/
│   ├── 329-career-development/
│   ├── 330-medical-health-wellness/
│   ├── 331-evaluations/
│   └── 332-employee-rights/
├── src/                     # Web app source
│   ├── index.html
│   ├── manifest.json
│   └── sw.js
├── scripts/                 # Build and tracking scripts
│   ├── build-web.js
│   ├── build-pdf.sh
│   └── test-app.js
├── build/                   # Generated output (gitignored)
├── docs/                    # GitHub Pages deployment
├── package.json             # Build commands
└── README.md
```

## Content Organization

Each chapter directory contains:
- `README.md` — Chapter overview, learning objectives, and source reference (PG procedure numbers)
- `section-XX.md` — Individual procedures within the chapter
- `review-questions.md` — Multiple-choice practice questions sourced from the chapter
- `key-terms.md` — Vocabulary, definitions, and acronyms

## Chapters by Patrol Guide Section

### 200-Series (Operations)

| PG Section | Topic | Source PDF | Priority |
|------------|-------|-----------|----------|
| 200 | General | pguide1 | High |
| 202 | Duties & Responsibilities | pguide1 | High |
| 207 | Complaints | pguide1 | High |
| 208 | Arrests | pguide1 | High |
| 209 | Summonses | pguide1 | Medium |
| 210 | Prisoners | pguide2 | High |
| 211 | Court & Agency Appearances | pguide2 | Medium |
| 212 | Command Operations | pguide2 | High |
| 213 | Mobilization/Emergency Incidents | pguide2 | High |
| 214 | Quality of Life Matters | pguide3 | Medium |
| 215 | Juvenile Matters | pguide3 | High |
| 216 | Aided Cases | pguide3 | High |
| 217 | Vehicle Collisions | pguide3 | Medium |
| 218 | Property – General | pguide4 | Medium |
| 219 | Department Property | pguide4 | Low |
| 220 | Citywide Incident Management | pguide4 | High |
| 221 | Tactical Operations | pguide4 | Medium |

### 300-Series (Personnel & Administration)

| PG Section | Topic | Source PDF | Priority |
|------------|-------|-----------|----------|
| 303 | Duties & Responsibilities | pguide4 | High |
| 304 | General Regulations | pguide4 | High |
| 305 | Uniforms & Equipment | pguide4 | Low |
| 318 | Disciplinary Matters | pguide4 | High |
| 319 | Civilian Personnel | pguide4 | Low |
| 320 | Personnel Matters – General | pguide4 | Medium |
| 324 | Leave, Payroll & Timekeeping | pguide4 | Medium |
| 329 | Career Development | pguide4 | Low |
| 330 | Medical, Health & Wellness | pguide4 | Medium |
| 331 | Evaluations | pguide4 | Medium |
| 332 | Employee Rights/Responsibilities | pguide4 | High |

## Progress Tracking

- Track completion status per chapter and section in `progress/tracker.json`
- Statuses: `not_started`, `in_progress`, `review`, `completed`
- Track practice question scores per chapter
- Generate progress summary reports

## PDF Generation

- Content authored in Markdown
- Compiled to PDF with table of contents, chapters, sections, and page numbers
- Tool: Pandoc with LaTeX or WeasyPrint

## Conventions

- All study content written in Markdown
- Always cite the specific Patrol Guide procedure number (e.g., P.G. 210-01)
- Use clear, concise language appropriate for exam preparation
- Review questions should mirror the exam's multiple-choice format
- Flag supervisor-specific responsibilities (critical for Sergeant exam)
- Highlight "shall" vs "should" vs "may" distinctions in procedures

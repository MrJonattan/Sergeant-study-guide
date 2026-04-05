# NYPD Sergeant Promotional Exam — Study Guide

A comprehensive study guide for the NYPD Sergeant Promotional Exam, covering all testable Patrol Guide sections (200-series Operations, 300-series Personnel & Administration).

## Live App

**[Open Study Guide](https://mrjonattan.github.io/nypd-sergeant-study-guide/)**

Works offline on mobile (PWA). Add to home screen on iPhone for app-like experience.

## Features

- 28 chapters covering PG sections 200-332
- 530+ review questions with answers and explanations
- 120-question master practice exam
- Quick-reference cheat sheet
- Color-coded exam callouts (Exam Alert, Memory Aid, Prior Test, PG Conflict)
- Dark mode, adjustable font size, search
- Offline support (works without internet)

## Build

Requires: Node.js, Pandoc

```bash
npm run build        # generate all output
npm run build:web    # generate data.js only
npm run build:pdf    # generate combined markdown + HTML
npm run test         # run test suite
npm run deploy       # copy to docs/ for GitHub Pages
```

## Project Structure

```
chapters/    — Study content (28 chapter directories)
src/         — Web app source (HTML, manifest, service worker)
scripts/     — Build scripts
build/       — Generated output (gitignored)
docs/        — GitHub Pages deployment
```

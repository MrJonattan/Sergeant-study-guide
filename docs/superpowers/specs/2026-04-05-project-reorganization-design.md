# Project Reorganization Design

**Goal:** Professionally organize the NYPD Sergeant Study Guide project with a clean directory structure and a proper build system via package.json.

**Approach:** Minimal Rename — move generated output into `build/`, web app source into `src/`, add `package.json` with build commands. Keep chapter naming and `docs/` deployment unchanged.

---

## New Directory Structure

```
nypd-sergeant-study-guide/
├── chapters/                    # Study content (28 chapter dirs, unchanged)
│   ├── 200-general/
│   ├── 202-duties-responsibilities/
│   └── ...
├── src/                         # Web app source (moved from web/)
│   ├── index.html
│   ├── manifest.json
│   └── sw.js
├── scripts/                     # Build scripts (cleaned up)
│   ├── build-web.js
│   ├── build-pdf.sh
│   └── test-app.js
├── build/                       # All generated output (gitignored)
│   ├── data.js
│   ├── study-guide-combined.md
│   ├── study-guide.html
│   ├── master-practice-exam.md
│   ├── master-practice-exam.html
│   ├── quick-reference-cheat-sheet.md
│   └── quick-reference-cheat-sheet.html
├── docs/                        # GitHub Pages deployment
│   ├── index.html
│   ├── data.js
│   ├── manifest.json
│   └── sw.js
├── package.json                 # Build commands
├── README.md                    # Public-facing project README
├── TODO.md
├── CLAUDE.md
└── .gitignore
```

## File Moves

| From | To | Notes |
|------|----|-------|
| `web/index.html` | `src/index.html` | Web app source |
| `web/manifest.json` | `src/manifest.json` | PWA manifest |
| `web/sw.js` | `src/sw.js` | Service worker |
| `output/*` | `build/*` | All generated output |
| `/tmp/test-app.js` | `scripts/test-app.js` | Test suite into project |

## Deletions

| Path | Reason |
|------|--------|
| `web/` folder | Replaced by `src/` |
| `scripts/build-pdf.py` | Unused, replaced by build-pdf.sh |
| `progress/` | Local tracker state, not needed |

## package.json

```json
{
  "name": "nypd-sergeant-study-guide",
  "version": "1.0.0",
  "description": "NYPD Sergeant Promotional Exam study guide with web app and PDF output",
  "private": true,
  "scripts": {
    "build": "npm run build:web && npm run build:pdf",
    "build:web": "node scripts/build-web.js",
    "build:pdf": "bash scripts/build-pdf.sh",
    "test": "node scripts/test-app.js build/data.js src/index.html",
    "deploy": "cp src/index.html src/manifest.json src/sw.js build/data.js docs/ && git add docs/ && echo 'docs/ updated — commit and push when ready'"
  }
}
```

## Build Script Updates

- `scripts/build-web.js`: Change `OUTPUT_DIR` from `web/` to `build/`
- `scripts/build-pdf.sh`: Change `OUTPUT_DIR` from `output/` to `build/`

## .gitignore

```
.DS_Store
node_modules/
*.pyc
__pycache__/

# Generated files (rebuild with npm run build)
build/
progress/
```

## README.md

Public-facing README with:
- Link to live app on GitHub Pages
- Feature list
- Build commands
- Project structure overview

## CLAUDE.md Updates

Update file path references:
- `web/` → `src/`
- `output/` → `build/`
- Remove `scripts/build-pdf.py` and `progress/` from structure listing
- Add `package.json` and `README.md`

## What Does NOT Change

- `chapters/` — all 28 directories, naming convention, internal structure
- `docs/` — GitHub Pages deployment folder and contents
- `CLAUDE.md` — content sections (chapters, source material, conventions) unchanged
- Study content, questions, callouts — zero changes

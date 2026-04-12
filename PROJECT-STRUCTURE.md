# Project Structure

## Directory Layout

```
nypd-sergeant-study-guide/
├── chapters/              # Source markdown files (28 chapters)
│   ├── 200-general/
│   ├── 202-duties-responsibilities/
│   └── ... (26 more)
│
├── assets/                # Static reference files (committed to git)
│   ├── quick-reference-cheat-sheet.md
│   └── master-practice-exam.md
│
├── src/                   # Web app source code (committed to git)
│   ├── index.html         # Main application (single-file SPA)
│   ├── manifest.json      # PWA manifest
│   └── sw.js              # Service worker
│
├── docs/                  # Deployed files (committed to git)
│   ├── index.html         # Deployed from src/
│   ├── data.js            # Generated from chapters/
│   ├── manifest.json      # Deployed from src/
│   ├── sw.js              # Deployed from src/
│   └── *.html             # PDF-ready HTML from pandoc
│
├── build/                 # Generated output (gitignored)
│   ├── data.js            # Web app data bundle
│   ├── study-guide-combined.md
│   └── *.html             # PDF-ready HTML files
│
├── scripts/               # Build and utility scripts
│   ├── build-web.js       # Web app build (chapters → data.js)
│   ├── build-pdf.sh       # PDF build (pandoc HTML generation)
│   ├── validate-data.js   # Data validation tests
│   ├── test-app.js        # Application tests
│   └── e2e-test.js        # End-to-end tests
│
├── .gitignore             # Ignores build/, progress/, node_modules/
├── package.json           # npm scripts and dependencies
└── CLAUDE.md              # AI assistant instructions
```

## Build Pipeline

### Web App Build (`npm run build:web`)

1. **build-web.js** reads all chapter markdown files
2. Extracts:
   - Chapter content (README.md + section-*.md files)
   - Review questions (parseReviewQuestions)
   - Sergeant Focus callouts
   - NOTE markers (extractNotes)
3. Loads static assets from `assets/`:
   - quick-reference-cheat-sheet.md
   - master-practice-exam.md
4. Outputs `build/data.js` → copied to `docs/data.js`

### PDF Build (`npm run build:pdf`)

1. **build-pdf.sh** combines all chapters into `build/study-guide-combined.md`
2. Runs pandoc to generate HTML with table of contents
3. Generates HTML for cheat sheet and practice exam from `assets/`
4. Output HTML files can be printed to PDF from browser

### Deploy (`npm run deploy`)

1. Runs `build:web` to regenerate data.js
2. Copies src/* files to docs/
3. Stages docs/ for commit

## File Sources Summary

| File | Source | Destination |
|------|--------|-------------|
| `chapters/*/README.md` | Source | `build/data.js` → `docs/data.js` |
| `chapters/*/section-*.md` | Source | `build/data.js` → `docs/data.js` |
| `assets/quick-reference-cheat-sheet.md` | Source | `build/data.js` → `docs/data.js` |
| `assets/master-practice-exam.md` | Source | `build/data.js` → `docs/data.js` |
| `src/index.html` | Source | `docs/index.html` |
| `src/manifest.json` | Source | `docs/manifest.json` |
| `src/sw.js` | Source | `docs/sw.js` |

## Key Rules

1. **Never edit files in `build/` or `docs/` directly** - they are generated
2. **Edit source files only**:
   - Chapter content: `chapters/*/`
   - Web app: `src/`
   - Static assets: `assets/`
3. **Always run `npm run deploy`** before committing changes
4. **Run `npm test`** to validate build output

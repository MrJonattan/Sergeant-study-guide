# Command Reference

<!-- AUTO-GENERATED from package.json -->

All commands are run from the project root directory.

## Build Commands

| Command | Description |
|---------|-------------|
| `npm run build` | Generate all output: web app (data.js) + PDF study guide + HTML outputs |
| `npm run build:web` | Generate `data.js` only — fast rebuild for web app updates |
| `npm run build:pdf` | Generate combined study guide, cheat sheet, and practice exam HTML via Pandoc |
| `npm run build:flutter` | Convert data.js format for Flutter mobile app |

## Test & Validate

| Command | Description |
|---------|-------------|
| `npm test` | Run automated test suite (23 tests: data validation, HTML structure, enrichment checks) |

## Deploy

| Command | Description |
|---------|-------------|
| `npm run deploy` | Build web output, copy to `docs/`, stage for commit to GitHub Pages |

## Study Tools

| Command | Description |
|---------|-------------|
| `npm run export:anki` | Export flashcards to Anki format for spaced repetition |
| `npm run generate-quiz` | Generate practice quiz questions from chapter content |
| `npm run generate-quiz:validate` | Validate generated quiz questions for format/duplicates |
| `npm run generate-quiz:dedup` | Deduplicate quiz question bank |
| `npm run schedule` | Generate personalized study schedule based on exam date |
| `npm run study` | Full study workflow: export Anki cards + generate schedule + open schedule |

## Typical Workflows

### Quick rebuild after editing chapter markdown

```bash
npm run build:web    # Regenerates data.js in ~1-2 seconds
npm test             # Verify data integrity
```

### Deploy to GitHub Pages

```bash
npm run build        # Full rebuild
npm test             # Verify all tests pass
npm run deploy       # Copy to docs/
git add docs/
git commit -m "deploy: update study guide"
git push
```

### Generate study materials

```bash
npm run study        # Export Anki cards + generate schedule
```

### Add new practice questions

```bash
npm run generate-quiz        # Generate new questions
npm run generate-quiz:validate  # Check format
npm run generate-quiz:dedup     # Remove duplicates
```

## Prerequisites

- **Node.js** v18+ (required for all commands)
- **Pandoc** (required for `npm run build:pdf` only)
- **Python 3 + venv** (required for `npm run generate-quiz*` commands)

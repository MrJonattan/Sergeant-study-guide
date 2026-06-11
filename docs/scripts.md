# Available Scripts Reference

<!-- AUTO-GENERATED: This file is generated from package.json. Do not edit manually. -->

| Command | Description |
|---------|-------------|
| `pnpm run build` | Full build: core + web bundle + mobile sync + PDF generation |
| `pnpm run build:core` | Build the core package (TypeScript compilation) |
| `pnpm run sync:mobile` | Sync build output to mobile assets directory |
| `pnpm run build:web:bundle` | Build web app bundle and copy data files to docs and web public |
| `pnpm run build:web:dev` | Start web app development server (Vite) |
| `pnpm run build:web` | Build web app for production (core + bundle + web build + mobile sync) |
| `pnpm run build:pdf` | Generate PDF study guide using Pandoc |
| `pnpm run build:flutter` | Convert data for Flutter mobile app |
| `pnpm run test` | Run data validation script |
| `pnpm run test:unit` | Run unit tests on built data and web app |
| `pnpm run test:e2e` | Run Playwright end-to-end tests |
| `pnpm run test:coverage` | Run coverage audit on study guide content |
| `pnpm run test:all` | Run all test suites (unit + e2e + coverage) |
| `pnpm run test:e2e:ui` | Run Playwright tests with UI mode |
| `pnpm run test:e2e:debug` | Run Playwright tests in debug mode |
| `pnpm run deploy` | Build web app and prepare GitHub Pages deployment |
| `pnpm run export:anki` | Export study cards to Anki format |
| `pnpm run generate-quiz` | Generate practice quiz questions |
| `pnpm run generate-quiz:validate` | Validate generated quiz questions |
| `pnpm run generate-quiz:dedup` | Deduplicate quiz questions |
| `pnpm run schedule` | Generate study schedule |
| `pnpm run study` | Export Anki cards, generate schedule, and open schedule |
| `pnpm run clean` | Clean build artifacts |
| `pnpm run typecheck` | Run TypeScript type checking (via core build) |
| `pnpm run lint` | Run ESLint on web app |
| `pnpm run prepare` | Initialize Husky git hooks |
| `pnpm run lint-staged` | Run lint-staged on staged files |

## Core Package Scripts

| Command | Description |
|---------|-------------|
| `pnpm run --filter @nypd-sergeant/core build` | Build core package |
| `pnpm run --filter @nypd-sergeant/core clean` | Clean core build artifacts |

## Web App Scripts

| Command | Description |
|---------|-------------|
| `pnpm run --filter @nypd-sergeant/web dev` | Start web dev server |
| `pnpm run --filter @nypd-sergeant/web build` | Build web app for production |
| `pnpm run --filter @nypd-sergeant/web lint` | Lint web app source |

## Quiz Generator Scripts

| Command | Description |
|---------|-------------|
| `cd scripts/quiz-generator && PYTHONPATH=. .venv/bin/python -m cli.app generate` | Generate quiz questions |
| `cd scripts/quiz-generator && PYTHONPATH=. .venv/bin/python -m cli.app validate` | Validate quiz questions |
| `cd scripts/quiz-generator && PYTHONPATH=. .venv/bin/python -m cli.app dedup` | Deduplicate quiz questions |
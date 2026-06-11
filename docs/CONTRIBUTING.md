# Contributing Guide

<!-- AUTO-GENERATED: This file is generated from project configuration. Manual sections preserved below. -->

## Development Environment Setup

### Prerequisites

- **Node.js** v20+ (managed via nvm)
- **pnpm** v10+ (core package manager)
- **Python** 3.11+ (for quiz generator scripts)
- **Pandoc** (for PDF generation)
- **Git** with Husky hooks

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/nypd-sergeant-study-guide.git
cd nypd-sergeant-study-guide

# Install Node.js dependencies
pnpm install

# Install Python dependencies for quiz generator
cd scripts/quiz-generator
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cd ../..

# Verify setup
pnpm run test
```

### Environment Configuration

Copy `.env.example` to `.env` and configure as needed:

```bash
cp .env.example .env
# Edit .env with your settings
```

See [Environment Variables](env.md) for all available options.

## Available Scripts

See [Scripts Reference](scripts.md) for complete command documentation.

### Common Workflows

**Full build and test:**
```bash
pnpm run build && pnpm run test:all
```

**Development web server:**
```bash
pnpm run build:web:dev
```

**Generate PDF study guide:**
```bash
pnpm run build:pdf
```

**Deploy to GitHub Pages:**
```bash
pnpm run deploy
# Then: git commit -am "Deploy update" && git push
```

## Testing Procedures

### Running Tests

| Test Type | Command | Purpose |
|-----------|---------|---------|
| Data Validation | `pnpm run test` | Validate study guide data integrity |
| Unit Tests | `pnpm run test:unit` | Test data parsing and web app components |
| E2E Tests | `pnpm run test:e2e` | Playwright browser automation tests |
| Coverage Audit | `pnpm run test:coverage` | Verify content coverage against source PDFs |
| All Tests | `pnpm run test:all` | Run complete test suite |

### Writing New Tests

1. **Data validation tests**: Add to `scripts/validate-data.js`
2. **Unit tests**: Add `.test.ts` files in `packages/**/src/`
3. **E2E tests**: Add `.spec.ts` files in `tests/e2e/`
4. **Coverage tests**: Update `scripts/audit-coverage.js`

### Test Requirements

- All new features must include tests
- Maintain minimum 80% code coverage
- E2E tests should cover critical user flows (navigation, search, quiz, offline mode)

## Code Style Enforcement

### Linting & Formatting

- **ESLint** with TypeScript ESLint plugin
- **Prettier** for code formatting
- **lint-staged** runs on pre-commit

### Configuration Files

| File | Purpose |
|------|---------|
| `eslint.config.js` | ESLint flat config |
| `.prettierrc` | Prettier formatting rules |
| `tsconfig.json` | TypeScript configuration |
| `.husky/pre-commit` | Pre-commit hook |

### Running Linting

```bash
# Lint all packages
pnpm run lint

# Auto-fix linting issues
pnpm run lint -- --fix

# Format with Prettier
npx prettier --write .
```

### Pre-commit Hooks

Husky runs `lint-staged` on staged files before each commit:
- TypeScript files: ESLint + Prettier
- CSS files: Prettier
- JSON files: Prettier

## PR Submission Checklist

Before submitting a pull request, ensure:

- [ ] All tests pass (`pnpm run test:all`)
- [ ] Code follows style guidelines (`pnpm run lint`)
- [ ] TypeScript compiles without errors (`pnpm run typecheck`)
- [ ] Build completes successfully (`pnpm run build`)
- [ ] Documentation updated if needed
- [ ] Commit messages follow conventional format:
  - `feat:` new feature
  - `fix:` bug fix
  - `docs:` documentation only
  - `refactor:` code restructuring
  - `test:` adding tests
  - `chore:` maintenance tasks

### Conventional Commits

```
<type>: <description>

<optional body>

<optional footer>
```

Examples:
```
feat: add chapter 221 tactical operations content
fix: correct procedure reference in chapter 210
docs: update contributing guide with new test commands
refactor: extract quiz generation logic to separate module
```

## Project Structure

```
nypd-sergeant-study-guide/
├── apps/web/           # Vite + React PWA
├── packages/
│   ├── core/           # Shared TypeScript library
│   └── state/          # State management
├── chapters/           # Study guide content (Markdown)
├── scripts/            # Build and utility scripts
├── build/              # Generated output (gitignored)
├── docs/               # GitHub Pages deployment + documentation
├── mobile/             # Flutter mobile app
└── tests/              # E2E test specifications
```

## Source Material Guidelines

All content must be derived exclusively from:
- NYPD Patrol Guide PDFs (200-series)
- NYPD Administrative Guide PDFs (300-series)
- Individual AG Procedure PDFs
- The Key Preseason Sgt Study Guide

**Do NOT use external sources.** If information is needed beyond these documents, request updated materials from the project maintainer.

## Questions?

Refer to [CLAUDE.md](../CLAUDE.md) for project overview and architecture details, or open an issue for clarification.
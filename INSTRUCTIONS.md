# NYPD Sergeant Study Guide — Complete Instructions

Everything you need to set up, build, run, and use all parts of this project.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Web App](#web-app)
3. [Python Quiz Generator](#python-quiz-generator)
4. [Flutter Mobile App](#flutter-mobile-app)
5. [Data Pipeline](#data-pipeline)
6. [Project Structure](#project-structure)
7. [Troubleshooting](#troubleshooting)

---

## Prerequisites

| Tool | Version | Purpose | Install |
|------|---------|---------|---------|
| Node.js | v18+ | Build scripts, web app | `nvm install 18` |
| Python | 3.11+ | Quiz generator | `brew install python` |
| Flutter | 3.10+ | Mobile app | `brew install flutter` |
| Pandoc | 2.19+ | PDF generation (optional) | `brew install pandoc` |
| Xcode | 15+ | iOS build (optional) | Mac App Store |
| Android Studio | Latest | Android build (optional) | [developer.android.com](https://developer.android.com/studio) |
| Ollama | Latest | LLM quiz generation (optional) | [ollama.ai](https://ollama.ai) |
| Anthropic API key | — | Claude quiz generation (optional) | [console.anthropic.com](https://console.anthropic.com) |

---

## Web App

The live web app is at [https://mrjonattan.github.io/Sergeant-study-guide/](https://mrjonattan.github.io/Sergeant-study-guide/).

### Build the Web App

```bash
# Full build (data.js + PDF outputs)
npm run build

# Web data only (fast, for content updates)
npm run build:web

# PDF/HTML outputs only
npm run build:pdf
```

### Run the Test Suite

```bash
npm run test
```

Runs 23 automated tests validating data structure, question integrity, enrichment verification, mnemonic checks, and HTML validation.

### Deploy to GitHub Pages

```bash
npm run deploy
git add docs/
git commit -m "deploy: update study guide"
git push
```

GitHub Pages auto-deploys from the `docs/` directory on the main branch. Changes are live within 1-2 minutes.

### Add to iPhone Home Screen

1. Open the URL in Safari
2. Tap the Share button (box with arrow)
3. Tap "Add to Home Screen"
4. The app launches fullscreen with offline support

### Web App Features

- **Chapter browser** — 28 chapters with sidebar navigation
- **Study/Key Terms/Quiz/Flashcards tabs** per chapter
- **Custom markdown renderer** — Detects Exam Alert, Sergeant Focus, Memory Aid, Prior Test, PG Conflict, and See Also callouts with color-coded styling
- **Quiz engine** — Per-chapter multiple-choice quizzes with scoring and shuffle
- **Practice exam** — 140-question timed exam simulating test conditions
- **Flashcard viewer** — Key terms as flippable cards organized by procedure
- **Quick Quiz** — 10 random questions for fast practice
- **Search** — Full-text search across all content (Ctrl+K)
- **Progress tracking** — Read status, quiz scores, study streaks
- **Weak areas** — Identifies lowest-scoring chapters
- **Dark mode** — Full dark theme toggle
- **Font scaling** — Adjustable text size (A-/A+)
- **Bookmarks** — Mark questions for review
- **Data export/import** — Backup and restore progress
- **Offline** — Service worker caches all assets

---

## Python Quiz Generator

Generates exam-style questions from existing callouts, key terms, and numeric facts in the study guide content. Supports rule-based generation (no API needed) and LLM-powered generation (Ollama or Claude).

### Setup

```bash
cd scripts/quiz-generator

# Create virtual environment
python3 -m venv .venv
source .venv/bin/activate   # macOS/Linux

# Install dependencies
pip install -e .

# Verify installation
nypd-quiz generate --help
```

### Generate Questions

```bash
# Rule-based only (no API keys needed)
nypd-quiz generate --mode rule-based --chapters 208-arrests --max-per-chapter 5

# LLM-powered via Ollama (requires Ollama running locally)
ollama pull qwen3:8b   # or any model
nypd-quiz generate --mode llm --llm-backend ollama --chapters 208-arrests --max-per-chapter 5

# LLM-powered via Claude API (requires ANTHROPIC_API_KEY env var)
export ANTHROPIC_API_KEY=sk-...
nypd-quiz generate --mode llm --llm-backend claude --chapters 208-arrests --max-per-chapter 5

# Generate all modes for multiple chapters
nypd-quiz generate --mode all --chapters 208-arrests 210-prisoners 332-employee-rights --max-per-chapter 10

# Dry run (print to stdout, don't write files)
nypd-quiz generate --mode rule-based --chapters 208-arrests --dry-run

# Output to separate files instead of appending to review-questions.md
nypd-quiz generate --mode rule-based --chapters 208-arrests --output separate
```

### Validate Generated Questions

```bash
# Check all generated-questions.md files for format errors
nypd-quiz validate
```

### Deduplicate Against Existing Questions

```bash
# Find and flag questions similar to existing ones (fuzzy match, threshold 0.8)
nypd-quiz dedup
```

### Quality Gate

Generated questions are written to `generated-questions.md` in each chapter directory first — never directly to `review-questions.md`. After validating and deduplicating:

1. Review `chapters/XXX-topic/generated-questions.md` manually
2. Run `nypd-quiz validate` to confirm format
3. Run `nypd-quiz dedup` to check for duplicates
4. When satisfied, manually merge into `review-questions.md`

### What Gets Generated

| Generator | Source | Question Types |
|-----------|--------|---------------|
| `exam_alert.py` | Exam Alert callouts | "Which is TRUE regarding X?", "All EXCEPT" |
| `sergeant_focus.py` | Sergeant Focus callouts | "A sergeant handling X. FIRST priority?" |
| `key_term_questions.py` | Key-terms tables | "Which term is defined as X?", "X is best described as" |
| `numeric_recall.py` | Numeric facts (days, hours, etc.) | "Within what time must X be completed?" |
| `llm_scenarios.py` | Full chapter content | Scenario, comparison, EXCEPT questions |

### NPM Shortcuts

```bash
npm run generate-quiz              # Rule-based generation
npm run generate-quiz:validate     # Validate generated questions
npm run generate-quiz:dedup       # Deduplicate against existing
```

---

## Flutter Mobile App

A native cross-platform study app for iPhone, Android, macOS, and web with offline support, haptic feedback, and push notifications.

### Setup

```bash
cd mobile

# Install dependencies
flutter pub get

# Generate freezed/json_serializable code
flutter pub run build_runner build --delete-conflicting-outputs

# Verify no analysis errors
flutter analyze
```

### Run the App

```bash
cd mobile

# Chrome (easiest, no emulator needed)
flutter run -d chrome

# iPhone simulator (requires Xcode)
flutter run -d iphone

# Android emulator (requires Android Studio)
flutter run -d android

# macOS desktop
flutter run -d macos
```

### Build Release

```bash
# Web (works on any machine)
flutter build web --release
# Output: mobile/build/web/

# iOS (requires Xcode + Apple Developer account)
flutter build ios --release

# Android (requires Android Studio + signing config)
flutter build apk --release

# macOS (requires Xcode)
flutter build macos --release
```

### Regenerate Data

After updating chapter content, regenerate the Flutter data bundle:

```bash
# From project root
npm run build:flutter
```

This runs `scripts/convert-data-flutter.js` which:
1. Extracts JSON from `build/data.js`
2. Strips large unused fields (raw markdown sections)
3. Writes `mobile/assets/data/study_data.json` (~500 KB)
4. Copies section markdown files to `mobile/assets/data/chapters/`

**Important:** You must run `npm run build:web` first to generate `build/data.js`, then `npm run build:flutter`.

### App Features

| Screen | What It Does |
|--------|-------------|
| **Home** | Dashboard with study streak, daily goal progress, quick actions |
| **Chapters** | Browse all 28 chapters, see completion status |
| **Chapter Detail** | Tabs: Study (markdown with callouts), Key Terms, Quiz |
| **Quiz** | Sequential MC questions with haptic feedback, timer, progress bar |
| **Flashcards** | Swipeable flip cards, 5-box Leitner spaced repetition |
| **Exam** | Full 140-question timed exam (3h30m), jump grid, results breakdown |
| **Sergeant Focus** | Supervisor-specific callouts organized by category |
| **Key Terms** | Searchable glossary of all vocabulary and acronyms |
| **Weak Areas** | Chapters where quiz accuracy is below 70% |
| **Settings** | Theme (light/dark/system), daily goal, font size, study reminders |

### Flutter Project Structure

```
mobile/
├── pubspec.yaml                        # Dependencies and assets
├── lib/
│   ├── main.dart                       # Entry point (Hive init, ProviderScope)
│   ├── app.dart                        # MaterialApp.router with GoRouter
│   ├── config/
│   │   ├── theme.dart                  # Light/dark themes matching web CSS
│   │   ├── routes.dart                 # 10 routes with bottom nav ShellRoute
│   │   └── constants.dart              # App constants (passing score, Leitner intervals)
│   ├── data/
│   │   ├── models/                     # Freezed + json_serializable models
│   │   │   ├── chapter.dart            # Chapter, ChapterReadme
│   │   │   ├── question.dart            # Question, QuestionType, QuizAnswer
│   │   │   ├── key_term.dart            # KeyTerm
│   │   │   ├── sergeant_focus.dart      # SergeantFocus, SergeantFocusCategory
│   │   │   ├── study_progress.dart      # ChapterProgress, FlashcardState, DailyStudyLog
│   │   │   └── exam_result.dart         # ExamResult
│   │   └── repositories/
│   │       ├── chapter_repository.dart  # Loads study_data.json from assets
│   │       └── progress_repository.dart # Hive-based local persistence
│   ├── providers/
│   │   ├── chapter_provider.dart        # Chapter list and detail providers
│   │   ├── quiz_provider.dart           # Quiz state machine (idle → active → complete)
│   │   ├── flashcard_provider.dart      # 5-box Leitner flashcard system
│   │   ├── progress_provider.dart       # Study progress, streaks, daily logs
│   │   └── theme_provider.dart         # Light/dark/system theme persistence
│   ├── features/
│   │   ├── home/home_screen.dart        # Dashboard with streak and stats
│   │   ├── chapter_list/               # Chapter browser
│   │   ├── chapter_detail/             # Study/KeyTerms/Quiz tabs
│   │   ├── flashcards/                  # Swipeable flip cards
│   │   ├── quiz/quiz_screen.dart        # Sequential MC with timer
│   │   ├── exam/
│   │   │   ├── exam_setup_screen.dart   # Exam configuration (mode, chapters)
│   │   │   └── exam_screen.dart         # Timed exam with jump grid
│   │   ├── sergeant_focus/              # Supervisor callouts by category
│   │   ├── key_terms/                  # Searchable glossary
│   │   ├── settings/                    # Theme, goals, reminders
│   │   └── weak_areas/                  # Low-accuracy chapters
│   └── shared/
│       ├── widgets/
│       │   ├── markdown_renderer.dart   # flutter_markdown + callout styles
│       │   └── callout_banner.dart      # Colored banner for 5 callout types
│       └── utils/
│           ├── haptic_feedback.dart     # Haptic patterns (selection, correct, wrong)
│           └── notification_helper.dart # Daily study reminder scheduling
├── assets/
│   └── data/
│       ├── study_data.json              # Converted from build/data.js
│       └── chapters/                     # Section markdown files
└── test/
    └── widget_test.dart                 # Basic widget smoke test
```

### Key Dependencies

| Package | Purpose |
|---------|---------|
| `flutter_riverpod` | State management (providers, consumers) |
| `go_router` | Declarative routing with ShellRoute |
| `freezed` + `json_serializable` | Immutable data models with code generation |
| `flutter_markdown` | Markdown rendering with callout detection |
| `hive` + `hive_flutter` | Local NoSQL database for progress persistence |
| `flutter_local_notifications` | Daily study reminder push notifications |
| `flutter_card_swiper` | Swipeable flashcard interaction |
| `shared_preferences` | Key-value storage for settings |
| `timezone` | Timezone-aware notification scheduling |

### Modifying Data Models

If you change any model in `lib/data/models/`, regenerate the freezed and json_serializable code:

```bash
cd mobile
flutter pub run build_runner build --delete-conflicting-outputs
```

This updates the `.freezed.dart` and `.g.dart` files that are gitignored.

---

## Data Pipeline

The data flows through the project in this order:

```
1. Source content (chapters/**/*.md)
       │
       ▼
2. npm run build:web
   (scripts/build-web.js parses all markdown)
       │
       ▼
3. build/data.js
   (window.STUDY_DATA = {...} — full JSON with sections, markdown)
       │
       ├──► docs/data.js ──► Web app (GitHub Pages)
       │
       └──► npm run build:flutter
           (scripts/convert-data-flutter.js)
                │
                ▼
           mobile/assets/data/study_data.json  (slim JSON, ~500 KB)
           mobile/assets/data/chapters/          (section markdown)
                │
                ▼
           Flutter app loads from bundled assets
```

### Full Rebuild After Content Changes

```bash
# 1. Update chapter content
vim chapters/208-arrests/section-208-03.md

# 2. Rebuild web data
npm run build:web

# 3. Rebuild Flutter data
npm run build:flutter

# 4. Rebuild generated code (if models changed)
cd mobile && flutter pub run build_runner build --delete-conflicting-outputs

# 5. Test
npm run test                    # Web app test suite
flutter analyze                 # Flutter static analysis
flutter run -d chrome           # Run Flutter app
```

### Quiz Generator Data Flow

```
chapters/**/*.md
       │
       ▼
parsers/callouts.py ──► ExamAlert, SergeantFocus, MemoryAid, etc.
parsers/key_terms.py ──► KeyTerm (term, definition, source)
parsers/review_questions.py ──► Existing questions (for dedup)
parsers/numbers.py ──► Numeric facts (days, hours, etc.)
       │
       ▼
generators/exam_alert.py ──► MC questions from Exam Alerts
generators/sergeant_focus.py ──► Scenario questions from Sergeant Focus
generators/key_term_questions.py ──► Definition-matching questions
generators/numeric_recall.py ──► Timeframe recall questions
generators/distractor.py ──► Shared wrong-answer generation
generators/llm_scenarios.py ──► LLM-powered scenario questions
       │
       ▼
writers/markdown_writer.py ──► chapters/XXX/generated-questions.md
writers/json_writer.py ──► build/generated-questions/questions.json
```

---

## Project Structure

```
nypd-sergeant-study-guide/
├── chapters/                          # 28 chapter directories
│   └── 208-arrests/
│       ├── README.md                  # Chapter overview
│       ├── section-208-01.md          # Study sections
│       ├── key-terms.md               # Vocabulary table
│       ├── review-questions.md        # MC practice questions
│       └── generated-questions.md     # AI-generated questions (gitignored)
├── src/                               # Web app source
│   ├── index.html                     # Single-page app (HTML+CSS+JS)
│   ├── manifest.json                  # PWA manifest
│   └── sw.js                          # Service worker
├── scripts/
│   ├── build-web.js                   # Generates build/data.js from markdown
│   ├── build-pdf.sh                   # Pandoc PDF generation
│   ├── convert-data-flutter.js        # Web data → Flutter JSON bundle
│   └── quiz-generator/                # Python quiz generation CLI
│       ├── pyproject.toml             # Python project config
│       ├── cli/app.py                 # Click CLI (generate/validate/dedup)
│       ├── parsers/                   # Markdown content extractors
│       ├── generators/                # Question generators (rule-based + LLM)
│       ├── models/                    # Frozen dataclasses
│       ├── writers/                   # Markdown + JSON output
│       ├── llm/                       # Ollama + Claude backends
│       └── tests/                     # pytest test suite
├── mobile/                            # Flutter app
│   ├── pubspec.yaml                   # Dependencies and assets
│   ├── lib/                           # Dart source code
│   ├── assets/data/                   # Bundled study data
│   ├── ios/                           # iOS project
│   ├── android/                       # Android project
│   ├── macos/                         # macOS project
│   └── web/                           # Web project
├── build/                             # Generated output (gitignored)
│   ├── data.js                        # All study data as JSON
│   └── generated-questions/           # Quiz generator JSON output
├── docs/                              # GitHub Pages deployment
├── package.json                       # npm scripts
├── CLAUDE.md                          # AI assistant project context
├── INSTRUCTIONS.md                   # This file
└── .gitignore
```

---

## Troubleshooting

### Flutter: `flutter analyze` shows errors

```bash
cd mobile
flutter pub get                                    # Re-fetch dependencies
flutter pub run build_runner build --delete-conflicting-outputs  # Regenerate models
flutter analyze                                    # Re-check
```

### Flutter: `flutter run` fails on iOS

1. Install Xcode from the Mac App Store
2. Run: `sudo xcode-select --switch /Applications/Xcode.app/Contents/Developer`
3. Run: `sudo xcodebuild -runFirstLaunch`
4. Install CocoaPods: `brew install cocoapods`
5. Then: `cd mobile/ios && pod install && cd ..`
6. Try: `flutter run -d iphone`

### Flutter: `flutter run` fails on Android

1. Install Android Studio from [developer.android.com](https://developer.android.com/studio)
2. Open Android Studio → More Actions → Virtual Device Manager → Create Device
3. Start an emulator
4. Run: `flutter run -d android`

### Python: `pip install -e .` fails with flat-layout error

The `pyproject.toml` includes `[tool.setuptools.packages.find]` with explicit package includes. If it still fails:

```bash
cd scripts/quiz-generator
pip install -e .
```

### Python: `nypd-quiz generate` says no questions generated

- Make sure you've run `npm run build:web` first (the quiz generator reads chapter markdown files)
- Use `--chapters` flag to specify which chapters to process
- Check that the chapter directory has Exam Alert or Sergeant Focus callouts in its section files
- Use `--dry-run` to see what's being extracted before writing

### Web: `npm run build:web` fails

- Ensure `chapters/` directory exists with at least one chapter
- Check that `chapters/*/README.md`, `chapters/*/section-*.md`, and `chapters/*/review-questions.md` exist
- Verify `chapters/*/key-terms.md` uses the correct table format: `| Term | Definition | Source |`

### Web: Service worker caches old data

After deploying updates, users may need to:
1. Close all browser tabs with the app open
2. Reopen the app — the service worker will update on next load
3. Or clear browser cache manually

### Data not loading in Flutter app

1. Ensure `npm run build:web` has been run (generates `build/data.js`)
2. Ensure `npm run build:flutter` has been run (generates `mobile/assets/data/study_data.json`)
3. Check that `pubspec.yaml` lists `assets/data/study_data.json` and `assets/data/chapters/`
4. After adding new assets, run `flutter clean && flutter pub get`

---

## Quick Reference: All Commands

```bash
# === Web App ===
npm run build                    # Full build (data.js + PDF)
npm run build:web                # Generate data.js only
npm run build:pdf                # Generate PDF outputs
npm run test                     # Run 23 automated tests
npm run deploy                   # Copy to docs/ for GitHub Pages

# === Python Quiz Generator ===
cd scripts/quiz-generator
pip install -e .                 # Install CLI
nypd-quiz generate --help        # Show all options
nypd-quiz generate --mode rule-based --chapters 208-arrests --dry-run
nypd-quiz validate               # Check generated question format
nypd-quiz dedup                  # Fuzzy dedup against existing questions

# === Flutter App ===
cd mobile
flutter pub get                  # Install dependencies
flutter pub run build_runner build --delete-conflicting-outputs  # Generate models
flutter analyze                  # Static analysis
flutter run -d chrome            # Run in browser
flutter run -d iphone            # Run on iOS simulator
flutter run -d android           # Run on Android emulator
flutter build web --release      # Build for web deployment
flutter build ios --release       # Build for iOS App Store
flutter build apk --release      # Build for Android Play Store

# === Data Pipeline (full rebuild) ===
npm run build:web && npm run build:flutter
```
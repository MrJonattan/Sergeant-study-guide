# NYPD Sergeant Study Guide — Flutter App

Cross-platform study app for the NYPD Sergeant Promotional Exam. Built with Flutter + Riverpod.

See [../INSTRUCTIONS.md](../INSTRUCTIONS.md) for full setup and usage instructions.

## Quick Start

```bash
# 1. Generate study data (from project root)
cd .. && npm run build:web && npm run build:flutter && cd mobile

# 2. Install dependencies
flutter pub get

# 3. Generate model code
flutter pub run build_runner build --delete-conflicting-outputs

# 4. Run
flutter run -d chrome    # Browser
flutter run -d iphone     # iOS simulator (requires Xcode)
flutter run -d android    # Android emulator (requires Android Studio)
```

## Features

- 28 chapters with callout-enhanced study content
- Per-chapter quizzes with haptic feedback
- Full 140-question timed practice exam
- 5-box Leitner spaced-repetition flashcards
- Sergeant Focus callouts by category
- Searchable key terms glossary
- Weak areas analysis (below 70% accuracy)
- Dark/light/system theme
- Daily study reminders (push notifications)
- Offline-first (all data bundled)
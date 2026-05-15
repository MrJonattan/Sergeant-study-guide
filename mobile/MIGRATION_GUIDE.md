# Mobile App Migration to @nypd-sergeant/state

## Overview

This guide describes how to migrate the Flutter mobile app from direct Hive implementation to the shared `@nypd-sergeant/state` package.

## Current Architecture

```
mobile/lib/
├── data/
│   ├── models/          # Freezed data classes
│   └── repositories/
│       ├── chapter_repository.dart    # Loads from assets
│       └── progress_repository.dart   # Direct Hive implementation
└── providers/           # Riverpod state management
```

## Target Architecture

```
mobile/lib/
├── data/
│   ├── models/          # Migrate to core package types
│   └── repositories/
│       ├── chapter_repository.dart    # Use core package JSON
│       └── progress_repository.dart   # Wrap @nypd-sergeant/state HiveAdapter
└── state/
    └── adapters/
        └── flutter_hive_adapter.dart  # Bridges JS interop
```

## Migration Steps

### Step 1: Add @nypd-sergeant/state as dependency

The state package needs to be published or referenced via path:

```yaml
# mobile/pubspec.yaml
dependencies:
  @nypd-sergeant/state:
    path: ../packages/state
```

**Note:** TypeScript packages cannot be directly imported in Dart/Flutter. You have two options:

**Option A: Generate shared JSON schema** (Recommended)
- Keep data models in sync between TS and Dart
- Use the core package to generate `data.json`
- Mobile reads from assets, web reads from build output

**Option B: Create a Dart port of the state package**
- Duplicate the state interfaces in Dart
- Implement Hive adapter following the TS pattern
- Keep both implementations in sync manually

### Step 2: Update Progress Repository

Replace direct Hive box operations with the shared adapter:

```dart
// BEFORE
class ProgressRepository {
  static Box<String>? _progressBox;
  
  static Future<void> initialize() async {
    _progressBox = await Hive.openBox<String>(AppConstants.progressBoxName);
  }
  
  ChapterProgress getChapterProgress(String chapterId) {
    final json = _progressBox!.get(chapterId);
    return ChapterProgress.fromJson(jsonDecode(json));
  }
}

// AFTER (using shared adapter pattern)
class ProgressRepository {
  final StateAdapter _adapter;
  
  ProgressRepository(this._adapter);
  
  Future<ChapterProgress> getChapterProgress(String chapterId) async {
    final progress = await _adapter.loadProgress();
    return progress.chapters[chapterId] ?? ChapterProgress(chapterId: chapterId);
  }
}
```

### Step 3: Update Riverpod Providers

```dart
// providers/state_provider.dart
final stateAdapterProvider = Provider<StateAdapter>((ref) {
  return HiveAdapter(); // or LocalStorageAdapter for web
});

final progressRepositoryProvider = Provider<ProgressRepository>((ref) {
  return ProgressRepository(ref.watch(stateAdapterProvider));
});
```

### Step 4: Data Model Synchronization

Ensure Dart models match TypeScript schemas:

```dart
// mobile/lib/models/chapter.dart
import 'package:freezed_annotation/freezed_annotation.dart';

part 'chapter.freezed.dart';
part 'chapter.g.dart';

@freezed
class Chapter with _$Chapter {
  const factory Chapter({
    required String id,
    required String sectionNum,
    required String title,
    required String readme,
    @Default([]) List<Section> sections,
    @Default('') String keyTerms,
    @Default('') String reviewQuestions,
    @Default([]) List<Question> questions,
    @Default([]) List<SergeantFocus> sergeantFocus,
  }) = _Chapter;

  factory Chapter.fromJson(Map<String, dynamic> json) => _$ChapterFromJson(json);
}
```

Compare with TypeScript:
```typescript
// packages/core/src/types.ts
export const ChapterSchema = z.object({
  id: z.string(),
  sectionNum: z.string(),
  title: z.string(),
  readme: z.string(),
  sections: z.array(SectionSchema),
  keyTerms: z.string(),
  reviewQuestions: z.string(),
  questions: z.array(QuestionSchema),
  sergeantFocus: z.array(SergeantFocusSchema),
});
```

### Step 5: Build Integration

Update the build script to generate mobile assets:

```bash
# In root package.json
"build:mobile": "node scripts/convert-data-flutter.js"
```

Ensure the core package outputs to `mobile/assets/data/`:

```typescript
// packages/core/src/builder.ts
export function build(options: BuildOptions): StudyData {
  // ...
  const mobileOutputPath = path.join(projectRoot, 'mobile/assets/data/data.json');
  fs.writeFileSync(mobileOutputPath, JSON.stringify(studyData, null, 2));
  // ...
}
```

## Verification Checklist

- [ ] Hive boxes open successfully
- [ ] Chapter data loads from assets
- [ ] Progress persists after app restart
- [ ] Quiz state saves correctly
- [ ] Dark mode preference persists
- [ ] Study streak calculates correctly
- [ ] Exam history displays properly

## Rollback Plan

If migration issues occur:
1. Keep old repository files as `.bak`
2. Revert pubspec.yaml changes
3. Restore original Hive initialization in main.dart

## Notes

- The TypeScript state package uses `localStorage` for web and expects Hive for mobile
- Flutter's Hive implementation uses boxes (key-value stores)
- The adapter pattern allows swapping storage backends without changing business logic
- Consider using `flutter_secure_storage` for sensitive data (if any)

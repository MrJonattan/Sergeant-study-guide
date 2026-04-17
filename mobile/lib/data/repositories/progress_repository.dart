import 'dart:convert';

import 'package:flutter/foundation.dart';
import 'package:hive/hive.dart';

import '../models/study_progress.dart';
import '../models/exam_result.dart';
import '../../config/constants.dart';

class ProgressRepository {
  ProgressRepository._();
  static final Instance = ProgressRepository._();

  static Box<String>? _progressBox;
  static Box<String>? _examHistoryBox;
  static Box<String>? _flashcardStateBox;
  static Box<String>? _dailyLogBox;

  /// Opens all Hive boxes. Must be called during app initialization.
  static Future<void> initialize() async {
    try {
      _progressBox = await Hive.openBox<String>(AppConstants.progressBoxName);
      _examHistoryBox = await Hive.openBox<String>(AppConstants.examHistoryBoxName);
      _flashcardStateBox = await Hive.openBox<String>(AppConstants.flashcardStateBoxName);
      _dailyLogBox = await Hive.openBox<String>(AppConstants.dailyLogBoxName);
    } catch (e) {
      debugPrint('Failed to initialize Hive boxes: $e');
      rethrow;
    }
  }

  // ── Chapter Progress ───────────────────────────────────────────────

  /// Gets progress for a specific chapter.
  ChapterProgress getChapterProgress(String chapterId) {
    final box = _progressBox;
    if (box == null) {
      throw StorageException('Progress storage not initialized');
    }

    try {
      final json = box.get(chapterId);
      if (json == null) {
        return ChapterProgress(chapterId: chapterId);
      }
      return ChapterProgress.fromJson(
        jsonDecode(json) as Map<String, dynamic>,
      );
    } on FormatException catch (e) {
      debugPrint('Invalid progress data for chapter $chapterId: $e');
      return ChapterProgress(chapterId: chapterId);
    }
  }

  /// Saves progress for a specific chapter.
  Future<void> saveChapterProgress(ChapterProgress progress) async {
    final box = _progressBox;
    if (box == null) {
      throw StorageException('Progress storage not initialized');
    }

    try {
      await box.put(progress.chapterId, jsonEncode(progress.toJson()));
    } catch (e) {
      throw StorageException('Failed to save progress: $e');
    }
  }

  /// Gets progress for all chapters.
  Map<String, ChapterProgress> getAllChapterProgress() {
    final box = _progressBox;
    if (box == null) {
      throw StorageException('Progress storage not initialized');
    }

    final result = <String, ChapterProgress>{};
    try {
      for (final key in box.keys) {
        final json = box.get(key as String);
        if (json != null) {
          final progress = ChapterProgress.fromJson(
            jsonDecode(json) as Map<String, dynamic>,
          );
          result[key as String] = progress;
        }
      }
    } catch (e) {
      debugPrint('Error loading all progress: $e');
    }
    return result;
  }

  // ── Exam History ───────────────────────────────────────────────────

  /// Saves an exam result to history.
  Future<void> saveExamResult(ExamResult result) async {
    final box = _examHistoryBox;
    if (box == null) {
      throw StorageException('Exam history storage not initialized');
    }

    try {
      final key = result.date.toIso8601String();
      await box.put(key, jsonEncode(result.toJson()));
    } catch (e) {
      throw StorageException('Failed to save exam result: $e');
    }
  }

  /// Gets all exam results, sorted by date (newest first).
  List<ExamResult> getExamHistory() {
    final box = _examHistoryBox;
    if (box == null) {
      throw StorageException('Exam history storage not initialized');
    }

    final results = <ExamResult>[];
    try {
      for (final key in box.keys) {
        final json = box.get(key as String);
        if (json != null) {
          results.add(ExamResult.fromJson(
            jsonDecode(json) as Map<String, dynamic>,
          ));
        }
      }
      results.sort((a, b) => b.date.compareTo(a.date));
    } catch (e) {
      debugPrint('Error loading exam history: $e');
    }
    return results;
  }

  // ── Flashcard Leitner State ────────────────────────────────────────

  /// Gets the Leitner state for a flashcard.
  FlashcardState getFlashcardState(String cardId) {
    final box = _flashcardStateBox;
    if (box == null) {
      throw StorageException('Flashcard storage not initialized');
    }

    try {
      final json = box.get(cardId);
      if (json == null) {
        return FlashcardState(
          cardId: cardId,
          nextReview: DateTime.now(),
        );
      }
      return FlashcardState.fromJson(
        jsonDecode(json) as Map<String, dynamic>,
      );
    } on FormatException catch (e) {
      debugPrint('Invalid flashcard state for $cardId: $e');
      return FlashcardState(cardId: cardId, nextReview: DateTime.now());
    }
  }

  /// Saves the Leitner state for a flashcard.
  Future<void> saveFlashcardState(FlashcardState state) async {
    final box = _flashcardStateBox;
    if (box == null) {
      throw StorageException('Flashcard storage not initialized');
    }

    try {
      await box.put(state.cardId, jsonEncode(state.toJson()));
    } catch (e) {
      throw StorageException('Failed to save flashcard state: $e');
    }
  }

  /// Gets all flashcard states.
  List<FlashcardState> getAllFlashcardStates() {
    final box = _flashcardStateBox;
    if (box == null) {
      throw StorageException('Flashcard storage not initialized');
    }

    final states = <FlashcardState>[];
    try {
      for (final key in box.keys) {
        final json = box.get(key as String);
        if (json != null) {
          states.add(FlashcardState.fromJson(
            jsonDecode(json) as Map<String, dynamic>,
          ));
        }
      }
    } catch (e) {
      debugPrint('Error loading flashcard states: $e');
    }
    return states;
  }

  // ── Daily Study Log ────────────────────────────────────────────────

  /// Gets or creates the daily log for a specific date.
  DailyStudyLog getDailyLog(DateTime date) {
    final box = _dailyLogBox;
    if (box == null) {
      throw StorageException('Daily log storage not initialized');
    }

    final key = _dateKey(date);
    try {
      final json = box.get(key);
      if (json == null) {
        return DailyStudyLog(date: date);
      }
      return DailyStudyLog.fromJson(
        jsonDecode(json) as Map<String, dynamic>,
      );
    } on FormatException catch (e) {
      debugPrint('Invalid daily log for $key: $e');
      return DailyStudyLog(date: date);
    }
  }

  /// Saves a daily study log.
  Future<void> saveDailyLog(DailyStudyLog log) async {
    final box = _dailyLogBox;
    if (box == null) {
      throw StorageException('Daily log storage not initialized');
    }

    try {
      final key = _dateKey(log.date);
      await box.put(key, jsonEncode(log.toJson()));
    } catch (e) {
      throw StorageException('Failed to save daily log: $e');
    }
  }

  /// Gets recent daily logs (last N days).
  List<DailyStudyLog> getRecentLogs({int days = 30}) {
    final box = _dailyLogBox;
    if (box == null) {
      throw StorageException('Daily log storage not initialized');
    }

    final now = DateTime.now();
    final cutoff = now.subtract(Duration(days: days));
    final logs = <DailyStudyLog>[];

    try {
      for (final key in box.keys) {
        final json = box.get(key as String);
        if (json != null) {
          final log = DailyStudyLog.fromJson(
            jsonDecode(json) as Map<String, dynamic>,
          );
          if (log.date.isAfter(cutoff)) {
            logs.add(log);
          }
        }
      }
      logs.sort((a, b) => b.date.compareTo(a.date));
    } catch (e) {
      debugPrint('Error loading recent logs: $e');
    }
    return logs;
  }

  /// Counts consecutive study days ending today (streak).
  int calculateStreak() {
    final box = _dailyLogBox;
    if (box == null) return 0;

    int streak = 0;
    var checkDate = DateTime.now();

    for (int i = 0; i < 365; i++) {
      final key = _dateKey(checkDate);
      final json = box.get(key);
      if (json != null) {
        try {
          final log = DailyStudyLog.fromJson(
            jsonDecode(json) as Map<String, dynamic>,
          );
          if (log.totalActivities > 0) {
            streak++;
            checkDate = checkDate.subtract(const Duration(days: 1));
          } else {
            break;
          }
        } catch (_) {
          break;
        }
      } else if (i > 0) {
        break;
      } else {
        checkDate = checkDate.subtract(const Duration(days: 1));
      }
    }

    return streak;
  }

  String _dateKey(DateTime date) {
    return '${date.year}-${date.month.toString().padLeft(2, '0')}-${date.day.toString().padLeft(2, '0')}';
  }
}

class StorageException implements Exception {
  final String message;
  StorageException(this.message);

  @override
  String toString() => 'StorageException: $message';
}
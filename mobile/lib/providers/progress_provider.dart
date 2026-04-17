import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../config/constants.dart';
import '../data/models/study_progress.dart';
import '../data/models/exam_result.dart';
import '../data/repositories/progress_repository.dart';

/// Provides the ProgressRepository singleton.
final progressRepositoryProvider = Provider<ProgressRepository>((ref) {
  return ProgressRepository.Instance;
});

/// Current study streak (consecutive days with activity).
final streakProvider = Provider<int>((ref) {
  final repository = ref.watch(progressRepositoryProvider);
  try {
    return repository.calculateStreak();
  } catch (e) {
    return 0;
  }
});

/// Today's daily study log.
final todayLogProvider = Provider<DailyStudyLog>((ref) {
  final repository = ref.watch(progressRepositoryProvider);
  try {
    return repository.getDailyLog(DateTime.now());
  } catch (e) {
    return DailyStudyLog(date: DateTime.now());
  }
});

/// Daily goal progress as a fraction (0.0 - 1.0+).
final dailyGoalProgressProvider = Provider<double>((ref) {
  final todayLog = ref.watch(todayLogProvider);
  final totalActivities = todayLog.totalActivities;
  return totalActivities / AppConstants.dailyGoalDefault;
});

/// Whether today's daily goal has been met.
final dailyGoalMetProvider = Provider<bool>((ref) {
  return ref.watch(dailyGoalProgressProvider) >= 1.0;
});

/// Today's total activity count (questions + flashcards).
final todayActivityCountProvider = Provider<int>((ref) {
  final todayLog = ref.watch(todayLogProvider);
  return todayLog.totalActivities;
});

/// Progress for all chapters.
final allChapterProgressProvider = Provider<Map<String, ChapterProgress>>((ref) {
  final repository = ref.watch(progressRepositoryProvider);
  try {
    return repository.getAllChapterProgress();
  } catch (e) {
    return {};
  }
});

/// Progress for a specific chapter.
final chapterProgressProvider =
    Provider.family<ChapterProgress, String>((ref, chapterId) {
  final repository = ref.watch(progressRepositoryProvider);
  try {
    return repository.getChapterProgress(chapterId);
  } catch (e) {
    return ChapterProgress(chapterId: chapterId);
  }
});

/// Overall accuracy across all chapters.
final overallAccuracyProvider = Provider<double>((ref) {
  final allProgress = ref.watch(allChapterProgressProvider);
  int totalAnswered = 0;
  int totalCorrect = 0;

  for (final progress in allProgress.values) {
    totalAnswered += progress.questionsAnswered;
    totalCorrect += progress.correctAnswers;
  }

  if (totalAnswered == 0) return 0.0;
  return (totalCorrect / totalAnswered) * 100;
});

/// Number of chapters completed (read AND >= 70% accuracy).
final completedChaptersCountProvider = Provider<int>((ref) {
  final allProgress = ref.watch(allChapterProgressProvider);
  return allProgress.values.where((p) => p.isCompleted).length;
});

/// Exam history, sorted newest first.
final examHistoryProvider = Provider<List<ExamResult>>((ref) {
  final repository = ref.watch(progressRepositoryProvider);
  try {
    return repository.getExamHistory();
  } catch (e) {
    return [];
  }
});

/// Best exam score percentage.
final bestExamScoreProvider = Provider<double>((ref) {
  final history = ref.watch(examHistoryProvider);
  if (history.isEmpty) return 0.0;
  return history.map((r) => r.scorePercent).reduce((a, b) => a > b ? a : b);
});

/// Recent daily study logs for charting.
final recentLogsProvider = Provider.family<List<DailyStudyLog>, int>((ref, days) {
  final repository = ref.watch(progressRepositoryProvider);
  try {
    return repository.getRecentLogs(days: days);
  } catch (e) {
    return [];
  }
});
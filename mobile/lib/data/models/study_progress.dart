import 'package:freezed_annotation/freezed_annotation.dart';

part 'study_progress.freezed.dart';
part 'study_progress.g.dart';

@freezed
class ChapterProgress with _$ChapterProgress {
  const factory ChapterProgress({
    required String chapterId,
    @Default(0) int questionsAnswered,
    @Default(0) int correctAnswers,
    DateTime? lastStudied,
    @Default(false) bool isRead,
  }) = _ChapterProgress;

  const ChapterProgress._();

  factory ChapterProgress.fromJson(Map<String, dynamic> json) =>
      _$ChapterProgressFromJson(json);

  /// Accuracy percentage (0-100). Returns 0 if no questions answered.
  double get accuracyPercent {
    if (questionsAnswered == 0) return 0.0;
    return (correctAnswers / questionsAnswered) * 100;
  }

  /// Whether the chapter has been started.
  bool get isStarted => questionsAnswered > 0 || isRead;

  /// Whether the chapter is completed (read AND accuracy >= 70%).
  bool get isCompleted => isRead && accuracyPercent >= 70.0;
}

@freezed
class FlashcardState with _$FlashcardState {
  const factory FlashcardState({
    required String cardId,
    @Default(0) int leitnerBox,
    required DateTime nextReview,
    @Default(0) int consecutiveCorrect,
  }) = _FlashcardState;

  const FlashcardState._();

  factory FlashcardState.fromJson(Map<String, dynamic> json) =>
      _$FlashcardStateFromJson(json);

  /// Whether this card is due for review.
  bool get isDue => !DateTime.now().isBefore(nextReview);
}

@freezed
class DailyStudyLog with _$DailyStudyLog {
  const factory DailyStudyLog({
    required DateTime date,
    @Default(0) int questionsAnswered,
    @Default(0) int flashcardsReviewed,
    @Default(0) int minutesStudied,
  }) = _DailyStudyLog;

  const DailyStudyLog._();

  factory DailyStudyLog.fromJson(Map<String, dynamic> json) =>
      _$DailyStudyLogFromJson(json);

  /// Total study activities for the day.
  int get totalActivities => questionsAnswered + flashcardsReviewed;
}
import 'package:freezed_annotation/freezed_annotation.dart';

part 'exam_result.freezed.dart';
part 'exam_result.g.dart';

enum ExamType {
  @JsonValue('practice')
  practice,
  @JsonValue('full')
  full,
  @JsonValue('chapter')
  chapter,
  @JsonValue('timed')
  timed,
}

@freezed
class ExamResult with _$ExamResult {
  const factory ExamResult({
    required DateTime date,
    required int score,
    required int total,
    required int correct,
    required int minutes,
    required ExamType type,
  }) = _ExamResult;

  const ExamResult._();

  factory ExamResult.fromJson(Map<String, dynamic> json) =>
      _$ExamResultFromJson(json);

  /// Score as a percentage (0-100).
  double get scorePercent => total > 0 ? (correct / total) * 100 : 0.0;

  /// Whether the exam was passed (>= 70%).
  bool get isPassing => scorePercent >= 70.0;

  /// Number of incorrect answers.
  int get incorrect => total - correct;

  /// Human-readable type label.
  String get typeLabel {
    switch (type) {
      case ExamType.practice:
        return 'Practice';
      case ExamType.full:
        return 'Full Exam';
      case ExamType.chapter:
        return 'Chapter Quiz';
      case ExamType.timed:
        return 'Timed Drill';
    }
  }
}
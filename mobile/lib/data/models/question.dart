import 'package:freezed_annotation/freezed_annotation.dart';

part 'question.freezed.dart';
part 'question.g.dart';

enum QuestionType {
  @JsonValue('multiple_choice')
  multipleChoice,
  @JsonValue('true_false')
  trueFalse,
  @JsonValue('scenario')
  scenario,
}

enum SourceType {
  @JsonValue('patrol_guide')
  patrolGuide,
  @JsonValue('admin_guide')
  adminGuide,
  @JsonValue('penal_law')
  penalLaw,
  @JsonValue('criminal_procedure')
  criminalProcedure,
}

@freezed
class Question with _$Question {
  const factory Question({
    required int number,
    required String text,
    required List<String> options,
    required int answer,
    required String explanation,
    @Default(QuestionType.multipleChoice) QuestionType type,
    @Default(SourceType.patrolGuide) SourceType sourceType,
  }) = _Question;

  const Question._();

  factory Question.fromJson(Map<String, dynamic> json) => _$QuestionFromJson(json);

  /// Returns the correct answer text from options.
  String get correctAnswerText {
    if (answer < 0 || answer >= options.length) {
      return 'Invalid answer index';
    }
    return options[answer];
  }

  /// Whether this is a scenario-based question.
  bool get isScenario => type == QuestionType.scenario;
}
import 'package:freezed_annotation/freezed_annotation.dart';

import 'key_term.dart';
import 'question.dart';
import 'sergeant_focus.dart';

part 'chapter.freezed.dart';
part 'chapter.g.dart';

@freezed
class Chapter with _$Chapter {
  const factory Chapter({
    required String id,
    required String sectionNum,
    required String title,
    required String readme,
    required List<KeyTerm> keyTerms,
    required List<Question> questions,
    required List<SergeantFocusItem> sergeantFocus,
  }) = _Chapter;

  const Chapter._();

  factory Chapter.fromJson(Map<String, dynamic> json) => _$ChapterFromJson(json);

  /// Display label combining section number and title.
  String get displayLabel => '$sectionNum - $title';

  /// Total number of questions in this chapter.
  int get questionCount => questions.length;

  /// Whether this chapter has sergeant-specific focus items.
  bool get hasSergeantFocus => sergeantFocus.isNotEmpty;
}
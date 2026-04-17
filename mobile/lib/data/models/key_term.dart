import 'package:freezed_annotation/freezed_annotation.dart';

part 'key_term.freezed.dart';
part 'key_term.g.dart';

@freezed
class KeyTerm with _$KeyTerm {
  const factory KeyTerm({
    required String term,
    required String definition,
    required String source,
  }) = _KeyTerm;

  const KeyTerm._();

  factory KeyTerm.fromJson(Map<String, dynamic> json) => _$KeyTermFromJson(json);

  /// Short display: term with source reference in parentheses.
  String get displayWithSource => '$term ($source)';
}
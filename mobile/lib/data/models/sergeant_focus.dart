import 'package:freezed_annotation/freezed_annotation.dart';

part 'sergeant_focus.freezed.dart';
part 'sergeant_focus.g.dart';

@freezed
class SergeantFocusItem with _$SergeantFocusItem {
  const factory SergeantFocusItem({
    required String filename,
    required String text,
  }) = _SergeantFocusItem;

  const SergeantFocusItem._();

  factory SergeantFocusItem.fromJson(Map<String, dynamic> json) =>
      _$SergeantFocusItemFromJson(json);

  /// Extracts the procedure number from the filename (e.g., "pg_210-01" from "pg_210-01_sergeant.md").
  String get procedureNumber {
    final parts = filename.split('_');
    if (parts.length >= 2) {
      return '${parts[0]}_${parts[1]}'.toUpperCase();
    }
    return filename;
  }
}
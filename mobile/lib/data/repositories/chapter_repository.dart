import 'dart:convert';

import 'package:flutter/services.dart';

import '../models/chapter.dart';
import '../../config/constants.dart';

class ChapterRepository {
  ChapterRepository._();
  static final Instance = ChapterRepository._();

  List<Chapter>? _cachedChapters;

  /// Loads study_data.json from assets and parses all chapters.
  Future<List<Chapter>> getAllChapters() async {
    if (_cachedChapters != null) return _cachedChapters!;

    try {
      final jsonString = await rootBundle.loadString(
        AppConstants.studyDataAssetPath,
      );
      final decoded = jsonDecode(jsonString) as Map<String, dynamic>;
      final chaptersList = decoded['chapters'] as List<dynamic>;

      _cachedChapters = chaptersList
          .map((json) => Chapter.fromJson(json as Map<String, dynamic>))
          .toList();

      return _cachedChapters!;
    } on FormatException catch (e) {
      throw DataLoadException(
        'Study data file contains invalid JSON: ${e.message}',
      );
    } on MissingPluginException {
      throw DataLoadException(
        'Study data file not found. Please ensure assets are included in pubspec.yaml.',
      );
    } catch (e) {
      throw DataLoadException('Failed to load study data: $e');
    }
  }

  /// Returns a single chapter by its ID, or null if not found.
  Future<Chapter?> getChapterById(String id) async {
    try {
      final chapters = await getAllChapters();
      return chapters.firstWhere(
        (c) => c.id == id,
      );
    } on StateError {
      return null;
    }
  }

  /// Returns a single chapter by section number (e.g., "210"), or null.
  Future<Chapter?> getChapterBySectionNum(String sectionNum) async {
    try {
      final chapters = await getAllChapters();
      return chapters.firstWhere(
        (c) => c.sectionNum == sectionNum,
      );
    } on StateError {
      return null;
    }
  }

  /// Loads the Markdown content for a specific section within a chapter.
  Future<String> getSectionContent(String chapterId, String filename) async {
    try {
      final path = '${AppConstants.chaptersAssetPrefix}/$chapterId/$filename';
      return await rootBundle.loadString(path);
    } on MissingPluginException {
      throw DataLoadException(
        'Section file not found: $chapterId/$filename',
      );
    } catch (e) {
      throw DataLoadException(
        'Failed to load section content for $chapterId/$filename: $e',
      );
    }
  }

  /// Returns all key terms across all chapters.
  Future<List<MapEntry<String, List<dynamic>>>> getAllKeyTerms() async {
    try {
      final chapters = await getAllChapters();
      return chapters
          .where((c) => c.keyTerms.isNotEmpty)
          .map((c) => MapEntry(c.displayLabel, c.keyTerms))
          .toList();
    } catch (e) {
      throw DataLoadException('Failed to load key terms: $e');
    }
  }

  /// Returns all sergeant focus items across all chapters.
  Future<List<MapEntry<String, List<dynamic>>>> getAllSergeantFocus() async {
    try {
      final chapters = await getAllChapters();
      return chapters
          .where((c) => c.hasSergeantFocus)
          .map((c) => MapEntry(c.displayLabel, c.sergeantFocus))
          .toList();
    } catch (e) {
      throw DataLoadException('Failed to load sergeant focus items: $e');
    }
  }

  /// Clears the in-memory cache, forcing a reload on next access.
  void clearCache() {
    _cachedChapters = null;
  }
}

class DataLoadException implements Exception {
  final String message;
  DataLoadException(this.message);

  @override
  String toString() => 'DataLoadException: $message';
}
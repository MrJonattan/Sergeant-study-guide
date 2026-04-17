import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../data/models/chapter.dart';
import '../data/repositories/chapter_repository.dart';

/// Provides the ChapterRepository singleton.
final chapterRepositoryProvider = Provider<ChapterRepository>((ref) {
  return ChapterRepository.Instance;
});

/// Loads all chapters from assets. Caches the result.
final chaptersProvider = FutureProvider<List<Chapter>>((ref) async {
  final repository = ref.watch(chapterRepositoryProvider);
  try {
    return await repository.getAllChapters();
  } catch (e) {
    throw ChapterLoadException('Unable to load study chapters. Please restart the app. Error: $e');
  }
});

/// Looks up a single chapter by ID.
final chapterByIdProvider = FutureProvider.family<Chapter?, String>((ref, id) async {
  final repository = ref.watch(chapterRepositoryProvider);
  try {
    return await repository.getChapterById(id);
  } catch (e) {
    throw ChapterLoadException('Chapter not found: $id');
  }
});

/// Returns section markdown content for a specific file in a chapter.
final sectionContentProvider = FutureProvider.family<String, SectionContentArgs>((ref, args) async {
  final repository = ref.watch(chapterRepositoryProvider);
  try {
    return await repository.getSectionContent(args.chapterId, args.filename);
  } catch (e) {
    throw ChapterLoadException('Section not found: ${args.chapterId}/${args.filename}');
  }
});

/// All key terms across all chapters.
final allKeyTermsProvider = FutureProvider<List<MapEntry<String, List<dynamic>>>>((ref) async {
  final repository = ref.watch(chapterRepositoryProvider);
  try {
    return await repository.getAllKeyTerms();
  } catch (e) {
    throw ChapterLoadException('Unable to load key terms: $e');
  }
});

/// All sergeant focus items across all chapters.
final allSergeantFocusProvider = FutureProvider<List<MapEntry<String, List<dynamic>>>>((ref) async {
  final repository = ref.watch(chapterRepositoryProvider);
  try {
    return await repository.getAllSergeantFocus();
  } catch (e) {
    throw ChapterLoadException('Unable to load sergeant focus items: $e');
  }
});

class SectionContentArgs {
  final String chapterId;
  final String filename;

  const SectionContentArgs({required this.chapterId, required this.filename});

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is SectionContentArgs &&
          chapterId == other.chapterId &&
          filename == other.filename;

  @override
  int get hashCode => Object.hash(chapterId, filename);
}

class ChapterLoadException implements Exception {
  final String message;
  ChapterLoadException(this.message);

  @override
  String toString() => 'ChapterLoadException: $message';
}
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../config/theme.dart';
import '../../data/models/chapter.dart';
import '../../providers/chapter_provider.dart';
import '../../providers/progress_provider.dart';

/// Scrollable list of all chapters with section number, title, and progress.
class ChapterListScreen extends ConsumerWidget {
  const ChapterListScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final chaptersAsync = ref.watch(chaptersProvider);
    final allProgress = ref.watch(allChapterProgressProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('Chapters')),
      body: chaptersAsync.when(
        data: (chapters) {
          if (chapters.isEmpty) {
            return const Center(child: Text('No chapters available'));
          }
          return RefreshIndicator(
            onRefresh: () async {
              ref.invalidate(chaptersProvider);
            },
            child: ListView.builder(
              padding: const EdgeInsets.only(bottom: 80),
              itemCount: chapters.length,
              itemBuilder: (context, index) {
                final chapter = chapters[index];
                final progress = allProgress[chapter.id];
                return _ChapterListTile(
                  chapter: chapter,
                  progress: progress,
                );
              },
            ),
          );
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (error, _) => _ErrorView(
          message: error.toString(),
          onRetry: () => ref.invalidate(chaptersProvider),
        ),
      ),
    );
  }
}

/// Individual chapter tile in the list.
class _ChapterListTile extends StatelessWidget {
  final Chapter chapter;
  final dynamic progress;

  const _ChapterListTile({
    required this.chapter,
    this.progress,
  });

  @override
  Widget build(BuildContext context) {
    final isCompleted = progress?.isCompleted ?? false;
    final isStarted = progress?.isStarted ?? false;
    final accuracy = progress?.accuracyPercent ?? 0.0;

    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
      child: InkWell(
        onTap: () => context.push('/chapters/${chapter.id}'),
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
          child: Row(
            children: [
              _SectionBadge(sectionNum: chapter.sectionNum),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      chapter.title,
                      style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                            fontWeight: FontWeight.w500,
                          ),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 4),
                    Row(
                      children: [
                        Text(
                          '${chapter.questionCount} questions',
                          style: Theme.of(context).textTheme.bodySmall,
                        ),
                        if (chapter.hasSergeantFocus) ...[
                          const SizedBox(width: 8),
                          Icon(
                            Icons.star_rounded,
                            size: 14,
                            color: AppTheme.sergeant,
                          ),
                          const SizedBox(width: 2),
                          Text(
                            'Sgt. Focus',
                            style: Theme.of(context).textTheme.bodySmall?.copyWith(
                                  color: AppTheme.sergeant,
                                ),
                          ),
                        ],
                      ],
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 8),
              _ProgressChip(
                isCompleted: isCompleted,
                isStarted: isStarted,
                accuracy: accuracy,
              ),
              const SizedBox(width: 4),
              const Icon(Icons.chevron_right, size: 20),
            ],
          ),
        ),
      ),
    );
  }
}

/// Section number badge (e.g., "210") displayed at the start of each tile.
class _SectionBadge extends StatelessWidget {
  final String sectionNum;

  const _SectionBadge({required this.sectionNum});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 48,
      height: 48,
      decoration: BoxDecoration(
        color: AppTheme.primary.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Center(
        child: Text(
          sectionNum,
          style: TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.bold,
            color: AppTheme.primary,
          ),
        ),
      ),
    );
  }
}

/// Small chip showing progress status (Not Started / In Progress / % Done).
class _ProgressChip extends StatelessWidget {
  final bool isCompleted;
  final bool isStarted;
  final double accuracy;

  const _ProgressChip({
    required this.isCompleted,
    required this.isStarted,
    required this.accuracy,
  });

  @override
  Widget build(BuildContext context) {
    if (isCompleted) {
      return Container(
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
        decoration: BoxDecoration(
          color: Colors.green.withValues(alpha: 0.1),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: Colors.green, width: 1),
        ),
        child: const Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.check_circle, size: 14, color: Colors.green),
            SizedBox(width: 4),
            Text(
              'Done',
              style: TextStyle(fontSize: 11, color: Colors.green, fontWeight: FontWeight.w600),
            ),
          ],
        ),
      );
    }

    if (isStarted) {
      return Container(
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
        decoration: BoxDecoration(
          color: AppTheme.accent.withValues(alpha: 0.1),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: AppTheme.accent, width: 1),
        ),
        child: Text(
          '${accuracy.round()}%',
          style: const TextStyle(fontSize: 11, color: AppTheme.accent, fontWeight: FontWeight.w600),
        ),
      );
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: Colors.grey.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.grey, width: 1),
      ),
      child: const Text(
        'New',
        style: TextStyle(fontSize: 11, color: Colors.grey, fontWeight: FontWeight.w600),
      ),
    );
  }
}

/// Error view with retry button.
class _ErrorView extends StatelessWidget {
  final String message;
  final VoidCallback onRetry;

  const _ErrorView({required this.message, required this.onRetry});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.error_outline, size: 64, color: AppTheme.examAlert),
            const SizedBox(height: 16),
            Text(
              'Failed to load chapters',
              style: Theme.of(context).textTheme.titleMedium,
            ),
            const SizedBox(height: 8),
            Text(
              message,
              style: Theme.of(context).textTheme.bodySmall,
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 24),
            FilledButton.icon(
              onPressed: onRetry,
              icon: const Icon(Icons.refresh),
              label: const Text('Retry'),
            ),
          ],
        ),
      ),
    );
  }
}
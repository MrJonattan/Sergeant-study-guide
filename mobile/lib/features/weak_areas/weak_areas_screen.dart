import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../config/constants.dart';
import '../../config/theme.dart';
import '../../data/models/chapter.dart';
import '../../providers/chapter_provider.dart';
import '../../providers/progress_provider.dart';

/// Chapters sorted by lowest quiz scores, with recommendations.
class WeakAreasScreen extends ConsumerWidget {
  const WeakAreasScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final chaptersAsync = ref.watch(chaptersProvider);
    final allProgress = ref.watch(allChapterProgressProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('Weak Areas')),
      body: chaptersAsync.when(
        data: (chapters) {
          final weakChapters = _getWeakChapters(chapters, allProgress);
          if (weakChapters.isEmpty) {
            return const Center(child: Text('No weak areas identified yet. Start studying!'));
          }
          return RefreshIndicator(
            onRefresh: () async {
              ref.invalidate(chaptersProvider);
              ref.invalidate(allChapterProgressProvider);
            },
            child: ListView.builder(
              padding: const EdgeInsets.only(bottom: 80),
              itemCount: weakChapters.length,
              itemBuilder: (context, index) {
                final item = weakChapters[index];
                return _WeakChapterCard(item: item);
              },
            ),
          );
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (error, _) => _ErrorView(
          message: error.toString(),
          onRetry: () {
            ref.invalidate(chaptersProvider);
            ref.invalidate(allChapterProgressProvider);
          },
        ),
      ),
    );
  }

  /// Sorts chapters by accuracy (lowest first), excluding unstarted chapters.
  List<_WeakChapterInfo> _getWeakChapters(
    List<Chapter> chapters,
    Map<String, ChapterProgress> progress,
  ) {
    final weakChapters = <_WeakChapterInfo>[];

    for (final chapter in chapters) {
      final chapterProgress = progress[chapter.id];
      if (chapterProgress == null || !chapterProgress.isStarted) continue;

      final accuracy = chapterProgress.accuracyPercent;
      // Only include chapters below passing score or with low accuracy
      if (accuracy < AppConstants.passingScorePercent) {
        weakChapters.add(_WeakChapterInfo(
          chapter: chapter,
          progress: chapterProgress,
          recommendation: _getRecommendation(accuracy),
        ));
      }
    }

    // Sort by accuracy (lowest first)
    weakChapters.sort((a, b) => a.progress.accuracyPercent.compareTo(b.progress.accuracyPercent));
    return weakChapters;
  }

  /// Generates a recommendation based on accuracy level.
  String _getRecommendation(double accuracy) {
    if (accuracy < 30) {
      return 'Review this chapter from the beginning. Focus on understanding core concepts before attempting quizzes.';
    } else if (accuracy < 50) {
      return 'Re-read key sections and use flashcards to reinforce weak areas before retaking the quiz.';
    } else {
      return 'Almost passing! Review the specific questions you got wrong and focus on those topics.';
    }
  }
}

/// Info about a weak chapter for display.
class _WeakChapterInfo {
  final Chapter chapter;
  final ChapterProgress progress;
  final String recommendation;

  const _WeakChapterInfo({
    required this.chapter,
    required this.progress,
    required this.recommendation,
  });
}

/// Card displaying a weak chapter with accuracy, progress, and recommendation.
class _WeakChapterCard extends StatelessWidget {
  final _WeakChapterInfo item;

  const _WeakChapterCard({required this.item});

  @override
  Widget build(BuildContext context) {
    final accuracy = item.progress.accuracyPercent;
    final severity = _getSeverity(accuracy);

    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
      child: InkWell(
        onTap: () => context.push('/chapters/${item.chapter.id}'),
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  _SeverityIndicator(severity: severity),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          '${item.chapter.sectionNum} - ${item.chapter.title}',
                          style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                                fontWeight: FontWeight.w600,
                              ),
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                        ),
                        const SizedBox(height: 4),
                        Text(
                          '${item.progress.questionsAnswered} questions answered',
                          style: Theme.of(context).textTheme.bodySmall,
                        ),
                      ],
                    ),
                  ),
                  _AccuracyCircle(accuracy: accuracy, severity: severity),
                ],
              ),
              const SizedBox(height: 12),
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: severity.color.withValues(alpha: 0.08),
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: severity.color.withValues(alpha: 0.3)),
                ),
                child: Row(
                  children: [
                    Icon(Icons.lightbulb_outline, size: 16, color: severity.color),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        item.recommendation,
                        style: Theme.of(context).textTheme.bodySmall?.copyWith(height: 1.4),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 12),
              Row(
                mainAxisAlignment: MainAxisAlignment.end,
                children: [
                  OutlinedButton.icon(
                    onPressed: () => context.push('/chapters/${item.chapter.id}'),
                    icon: const Icon(Icons.menu_book_outlined, size: 18),
                    label: const Text('Study'),
                    style: OutlinedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(horizontal: 12),
                    ),
                  ),
                  const SizedBox(width: 8),
                  FilledButton.icon(
                    onPressed: () => context.push('/chapters/${item.chapter.id}/quiz'),
                    icon: const Icon(Icons.quiz_outlined, size: 18),
                    label: const Text('Quiz'),
                    style: FilledButton.styleFrom(
                      padding: const EdgeInsets.symmetric(horizontal: 12),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  _Severity _getSeverity(double accuracy) {
    if (accuracy < 30) return _Severity.critical;
    if (accuracy < 50) return _Severity.struggling;
    return _Severity.improving;
  }
}

enum _Severity { critical, struggling, improving }

extension on _Severity {
  Color get color => switch (this) {
        _Severity.critical => const Color(0xFFDC2626),
        _Severity.struggling => const Color(0xFFCA8A04),
        _Severity.improving => const Color(0xFF3B82F6),
      };

  String get label => switch (this) {
        _Severity.critical => 'Critical',
        _Severity.struggling => 'Struggling',
        _Severity.improving => 'Improving',
      };

  IconData get icon => switch (this) {
        _Severity.critical => Icons.error,
        _Severity.struggling => Icons.warning,
        _Severity.improving => Icons.trending_up,
      };
}

/// Severity indicator badge.
class _SeverityIndicator extends StatelessWidget {
  final _Severity severity;

  const _SeverityIndicator({required this.severity});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: severity.color.withValues(alpha: 0.15),
        borderRadius: BorderRadius.circular(6),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(severity.icon, size: 14, color: severity.color),
          const SizedBox(width: 4),
          Text(
            severity.label,
            style: TextStyle(
              fontSize: 11,
              fontWeight: FontWeight.w600,
              color: severity.color,
            ),
          ),
        ],
      ),
    );
  }
}

/// Circular accuracy display with color coding.
class _AccuracyCircle extends StatelessWidget {
  final double accuracy;
  final _Severity severity;

  const _AccuracyCircle({required this.accuracy, required this.severity});

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: 52,
      height: 52,
      child: Stack(
        fit: StackFit.expand,
        children: [
          CircularProgressIndicator(
            value: (accuracy / 100).clamp(0.0, 1.0),
            strokeWidth: 4,
            backgroundColor: Theme.of(context).colorScheme.surface,
            valueColor: AlwaysStoppedAnimation<Color>(severity.color),
          ),
          Center(
            child: Text(
              '${accuracy.round()}%',
              style: TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.bold,
                color: severity.color,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

/// Error view with retry.
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
            Text('Failed to load progress data', style: Theme.of(context).textTheme.titleMedium),
            const SizedBox(height: 8),
            Text(message, style: Theme.of(context).textTheme.bodySmall, textAlign: TextAlign.center),
            const SizedBox(height: 24),
            FilledButton.icon(onPressed: onRetry, icon: const Icon(Icons.refresh), label: const Text('Retry')),
          ],
        ),
      ),
    );
  }
}
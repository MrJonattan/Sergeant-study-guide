import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../config/constants.dart';
import '../../config/theme.dart';
import '../../data/models/chapter.dart';
import '../../providers/chapter_provider.dart';
import '../../providers/progress_provider.dart';

/// Dashboard screen showing study streak, daily progress, and quick actions.
class HomeScreen extends ConsumerWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final chaptersAsync = ref.watch(chaptersProvider);
    final streak = ref.watch(streakProvider);
    final todayActivity = ref.watch(todayActivityCountProvider);
    final dailyProgress = ref.watch(dailyGoalProgressProvider);
    final dailyGoalMet = ref.watch(dailyGoalMetProvider);
    final completedCount = ref.watch(completedChaptersCountProvider);
    final overallAccuracy = ref.watch(overallAccuracyProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text(AppConstants.appName),
        actions: [
          IconButton(
            icon: const Icon(Icons.settings_outlined),
            onPressed: () => context.push('/settings'),
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: () async {
          ref.invalidate(chaptersProvider);
          ref.invalidate(streakProvider);
          ref.invalidate(todayLogProvider);
        },
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _StreakCard(streak: streak),
              const SizedBox(height: 16),
              _ProgressRing(
                progress: dailyProgress.clamp(0.0, 1.0),
                activityCount: todayActivity,
                goalTarget: AppConstants.dailyGoalDefault,
                isGoalMet: dailyGoalMet,
              ),
              const SizedBox(height: 24),
              _StatsRow(completedCount: completedCount, accuracy: overallAccuracy),
              const SizedBox(height: 24),
              Text('Quick Actions', style: Theme.of(context).textTheme.titleLarge),
              const SizedBox(height: 12),
              _QuickActions(),
              const SizedBox(height: 24),
              Text('Recent Chapters', style: Theme.of(context).textTheme.titleLarge),
              const SizedBox(height: 12),
              chaptersAsync.when(
                data: (chapters) => _RecentChapters(chapters: chapters),
                loading: () => const Center(child: CircularProgressIndicator()),
                error: (error, _) => Center(child: Text(error.toString())),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _StreakCard extends StatelessWidget {
  final int streak;
  const _StreakCard({required this.streak});

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Row(
          children: [
            Icon(Icons.local_fire_department, size: 40, color: streak > 0 ? AppTheme.examAlert : Colors.grey),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('$streak day${streak == 1 ? '' : 's'}', style: Theme.of(context).textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.bold)),
                  Text('Current streak', style: Theme.of(context).textTheme.bodySmall),
                ],
              ),
            ),
            if (streak >= 7) const Icon(Icons.emoji_events, color: AppTheme.sergeant),
          ],
        ),
      ),
    );
  }
}

class _ProgressRing extends StatelessWidget {
  final double progress;
  final int activityCount;
  final int goalTarget;
  final bool isGoalMet;
  const _ProgressRing({required this.progress, required this.activityCount, required this.goalTarget, required this.isGoalMet});

  @override
  Widget build(BuildContext context) {
    final percentDisplay = (progress * 100).round();
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Row(
          children: [
            SizedBox(
              width: 80, height: 80,
              child: Stack(
                fit: StackFit.expand,
                children: [
                  CircularProgressIndicator(value: progress.clamp(0.0, 1.0), strokeWidth: 6, backgroundColor: Theme.of(context).colorScheme.surface, valueColor: AlwaysStoppedAnimation<Color>(isGoalMet ? Colors.green : AppTheme.accent)),
                  Center(child: Text('$percentDisplay%', style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold))),
                ],
              ),
            ),
            const SizedBox(width: 20),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text("Today's Goal", style: Theme.of(context).textTheme.titleMedium),
                  const SizedBox(height: 4),
                  Text('$activityCount / $goalTarget activities', style: Theme.of(context).textTheme.bodyMedium),
                  if (isGoalMet) Padding(padding: const EdgeInsets.only(top: 4), child: Text('Goal met!', style: Theme.of(context).textTheme.bodySmall?.copyWith(color: Colors.green, fontWeight: FontWeight.w600))),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _StatsRow extends StatelessWidget {
  final int completedCount;
  final double accuracy;
  const _StatsRow({required this.completedCount, required this.accuracy});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Expanded(child: _StatCard(value: '$completedCount', label: 'Chapters Done', color: AppTheme.accent)),
        const SizedBox(width: 12),
        Expanded(child: _StatCard(value: '${accuracy.round()}%', label: 'Accuracy', color: accuracy >= AppConstants.passingScorePercent ? Colors.green : AppTheme.examAlert)),
      ],
    );
  }
}

class _StatCard extends StatelessWidget {
  final String value;
  final String label;
  final Color color;
  const _StatCard({required this.value, required this.label, required this.color});

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            Text(value, style: Theme.of(context).textTheme.headlineSmall?.copyWith(color: color, fontWeight: FontWeight.bold)),
            const SizedBox(height: 4),
            Text(label, style: Theme.of(context).textTheme.bodySmall),
          ],
        ),
      ),
    );
  }
}

class _QuickActions extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Expanded(child: _ActionCard(icon: Icons.quiz_outlined, label: 'Quick Quiz', color: AppTheme.accent, onTap: () => context.push('/chapters'))),
        const SizedBox(width: 8),
        Expanded(child: _ActionCard(icon: Icons.assignment_outlined, label: 'Practice Exam', color: AppTheme.sergeant, onTap: () => context.push('/exam'))),
        const SizedBox(width: 8),
        Expanded(child: _ActionCard(icon: Icons.style_outlined, label: 'Flashcards', color: Colors.green, onTap: () => context.push('/flashcards'))),
      ],
    );
  }
}

class _ActionCard extends StatelessWidget {
  final IconData icon;
  final String label;
  final Color color;
  final VoidCallback onTap;
  const _ActionCard({required this.icon, required this.label, required this.color, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return Card(
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 8),
          child: Column(children: [Icon(icon, size: 32, color: color), const SizedBox(height: 8), Text(label, style: Theme.of(context).textTheme.bodySmall?.copyWith(fontWeight: FontWeight.w600), textAlign: TextAlign.center)]),
        ),
      ),
    );
  }
}

class _RecentChapters extends ConsumerWidget {
  final List<Chapter> chapters;
  const _RecentChapters({required this.chapters});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    if (chapters.isEmpty) return const Card(child: Padding(padding: EdgeInsets.all(24), child: Center(child: Text('No chapters available'))));
    final recent = chapters.take(5).toList();
    return Column(
      children: recent.map((chapter) {
        final progress = ref.watch(chapterProgressProvider(chapter.id));
        return Card(
          margin: const EdgeInsets.symmetric(vertical: 4),
          child: ListTile(
            leading: CircleAvatar(backgroundColor: AppTheme.primary.withValues(alpha: 0.1), child: Text(chapter.sectionNum, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold))),
            title: Text(chapter.title, style: Theme.of(context).textTheme.bodyMedium?.copyWith(fontWeight: FontWeight.w500), maxLines: 1, overflow: TextOverflow.ellipsis),
            subtitle: Text('${chapter.questionCount} questions', style: Theme.of(context).textTheme.bodySmall),
            trailing: Icon(progress.isCompleted ? Icons.check_circle : Icons.circle_outlined, size: 20, color: progress.isCompleted ? Colors.green : AppTheme.accent),
            onTap: () => context.push('/chapters/${chapter.id}'),
          ),
        );
      }).toList(),
    );
  }
}
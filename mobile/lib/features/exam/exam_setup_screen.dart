import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../config/constants.dart';
import '../../config/theme.dart';
import '../../data/models/question.dart';
import '../../providers/chapter_provider.dart';
import '../../providers/quiz_provider.dart';

/// Exam setup screen: choose full exam (140 Qs) or custom mini-exam.
class ExamSetupScreen extends ConsumerStatefulWidget {
  const ExamSetupScreen({super.key});

  @override
  ConsumerState<ExamSetupScreen> createState() => _ExamSetupScreenState();
}

class _ExamSetupScreenState extends ConsumerState<ExamSetupScreen> {
  _ExamMode _mode = _ExamMode.full;
  int _questionCount = 25;
  final Set<String> _selectedChapters = {};

  @override
  Widget build(BuildContext context) {
    final chaptersAsync = ref.watch(chaptersProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('Practice Exam')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _ExamModeSelector(
              selectedMode: _mode,
              onModeChanged: (mode) => setState(() => _mode = mode),
            ),
            const SizedBox(height: 24),
            if (_mode == _ExamMode.custom) ...[
              _QuestionCountSelector(
                selectedCount: _questionCount,
                onCountChanged: (count) => setState(() => _questionCount = count),
              ),
              const SizedBox(height: 24),
              Text(
                'Select Chapters',
                style: Theme.of(context).textTheme.titleMedium?.copyWith(
                      fontWeight: FontWeight.w600,
                    ),
              ),
              const SizedBox(height: 8),
              chaptersAsync.when(
                data: (chapters) => _ChapterSelectionList(
                  chapters: chapters,
                  selectedChapters: _selectedChapters,
                  onChapterToggled: (id) => setState(() {
                    if (_selectedChapters.contains(id)) {
                      _selectedChapters.remove(id);
                    } else {
                      _selectedChapters.add(id);
                    }
                  }),
                  onSelectAll: () => setState(() {
                    _selectedChapters.addAll(chapters.map((c) => c.id));
                  }),
                  onDeselectAll: () => setState(() => _selectedChapters.clear()),
                ),
                loading: () => const Center(child: CircularProgressIndicator()),
                error: (error, _) => Text('Error loading chapters: $error'),
              ),
            ],
            const SizedBox(height: 32),
            _StartExamButton(
              mode: _mode,
              questionCount: _questionCount,
              selectedChapters: _selectedChapters,
            ),
          ],
        ),
      ),
    );
  }
}

enum _ExamMode { full, custom }

/// Toggle between full exam and custom mini-exam.
class _ExamModeSelector extends StatelessWidget {
  final _ExamMode selectedMode;
  final ValueChanged<_ExamMode> onModeChanged;

  const _ExamModeSelector({
    required this.selectedMode,
    required this.onModeChanged,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Exam Type',
          style: Theme.of(context).textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.w600,
              ),
        ),
        const SizedBox(height: 12),
        Row(
          children: [
            Expanded(
              child: _ModeCard(
                icon: Icons.assignment_outlined,
                title: 'Full Exam',
                subtitle: '${AppConstants.examQuestionCount} questions',
                isSelected: selectedMode == _ExamMode.full,
                onTap: () => onModeChanged(_ExamMode.full),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: _ModeCard(
                icon: Icons.tune,
                title: 'Custom',
                subtitle: 'Choose chapters & count',
                isSelected: selectedMode == _ExamMode.custom,
                onTap: () => onModeChanged(_ExamMode.custom),
              ),
            ),
          ],
        ),
      ],
    );
  }
}

class _ModeCard extends StatelessWidget {
  final IconData icon;
  final String title;
  final String subtitle;
  final bool isSelected;
  final VoidCallback onTap;

  const _ModeCard({
    required this.icon,
    required this.title,
    required this.subtitle,
    required this.isSelected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: isSelected ? AppTheme.accent.withValues(alpha: 0.1) : Theme.of(context).cardColor,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: isSelected ? AppTheme.accent : Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.2),
            width: isSelected ? 2 : 1,
          ),
        ),
        child: Column(
          children: [
            Icon(icon, size: 32, color: isSelected ? AppTheme.accent : Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.5)),
            const SizedBox(height: 8),
            Text(
              title,
              style: Theme.of(context).textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.w600,
                    color: isSelected ? AppTheme.accent : null,
                  ),
            ),
            const SizedBox(height: 4),
            Text(
              subtitle,
              style: Theme.of(context).textTheme.bodySmall,
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }
}

/// Question count selector for custom exams.
class _QuestionCountSelector extends StatelessWidget {
  final int selectedCount;
  final ValueChanged<int> onCountChanged;

  static const _options = [10, 25, 50];

  const _QuestionCountSelector({
    required this.selectedCount,
    required this.onCountChanged,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Number of Questions',
          style: Theme.of(context).textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.w600,
              ),
        ),
        const SizedBox(height: 12),
        Row(
          children: _options.map((count) {
            final isSelected = count == selectedCount;
            return Expanded(
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 4),
                child: ChoiceChip(
                  label: Text('$count Qs'),
                  selected: isSelected,
                  onSelected: (_) => onCountChanged(count),
                ),
              ),
            );
          }).toList(),
        ),
      ],
    );
  }
}

/// Chapter selection list for custom exams.
class _ChapterSelectionList extends StatelessWidget {
  final List<dynamic> chapters;
  final Set<String> selectedChapters;
  final ValueChanged<String> onChapterToggled;
  final VoidCallback onSelectAll;
  final VoidCallback onDeselectAll;

  const _ChapterSelectionList({
    required this.chapters,
    required this.selectedChapters,
    required this.onChapterToggled,
    required this.onSelectAll,
    required this.onDeselectAll,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.end,
          children: [
            TextButton(onPressed: onSelectAll, child: const Text('Select All')),
            TextButton(onPressed: onDeselectAll, child: const Text('Deselect All')),
          ],
        ),
        Container(
          constraints: const BoxConstraints(maxHeight: 300),
          decoration: BoxDecoration(
            border: Border.all(color: Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.2)),
            borderRadius: BorderRadius.circular(8),
          ),
          child: ListView.builder(
            shrinkWrap: true,
            itemCount: chapters.length,
            itemBuilder: (context, index) {
              final chapter = chapters[index];
              final isSelected = selectedChapters.contains(chapter.id);
              return CheckboxListTile(
                value: isSelected,
                onChanged: (_) => onChapterToggled(chapter.id),
                title: Text(chapter.title, style: Theme.of(context).textTheme.bodyMedium),
                subtitle: Text(chapter.sectionNum, style: Theme.of(context).textTheme.bodySmall),
                dense: true,
                controlAffinity: ListTileControlAffinity.leading,
              );
            },
          ),
        ),
      ],
    );
  }
}

/// Start exam button with validation.
class _StartExamButton extends ConsumerWidget {
  final _ExamMode mode;
  final int questionCount;
  final Set<String> selectedChapters;

  const _StartExamButton({
    required this.mode,
    required this.questionCount,
    required this.selectedChapters,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final canStart = mode == _ExamMode.full || selectedChapters.isNotEmpty;

    return SizedBox(
      width: double.infinity,
      child: FilledButton.icon(
        onPressed: canStart ? () => _startExam(context, ref) : null,
        icon: const Icon(Icons.play_arrow),
        label: Text(mode == _ExamMode.full ? 'Start Full Exam' : 'Start Custom Exam'),
        style: FilledButton.styleFrom(
          padding: const EdgeInsets.symmetric(vertical: 16),
        ),
      ),
    );
  }

  void _startExam(BuildContext context, WidgetRef ref) async {
    final chaptersAsync = ref.read(chaptersProvider);
    final chapters = chaptersAsync.valueOrNull;

    if (chapters == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Unable to load chapters. Please try again.')),
      );
      return;
    }

    List<Question> questions;

    if (mode == _ExamMode.full) {
      // Full exam: all questions, shuffled
      questions = chapters
          .expand((c) => c.questions)
          .toList()
        ..shuffle();
      questions = questions.take(AppConstants.examQuestionCount).toList();
    } else {
      // Custom: selected chapters, shuffled, limited by count
      questions = chapters
          .where((c) => selectedChapters.contains(c.id))
          .expand((c) => c.questions)
          .toList()
        ..shuffle();
      questions = questions.take(questionCount).toList();
    }

    if (questions.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('No questions found for the selected chapters.')),
      );
      return;
    }

    ref.read(quizProvider.notifier).startQuiz(questions);
    context.push('/exam/active');
  }
}
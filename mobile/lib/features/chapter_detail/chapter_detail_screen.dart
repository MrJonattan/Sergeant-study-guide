import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../config/constants.dart';
import '../../config/theme.dart';
import '../../data/models/chapter.dart';
import '../../data/models/key_term.dart';
import '../../data/models/question.dart';
import '../../providers/chapter_provider.dart';
import '../../providers/progress_provider.dart';
import '../../providers/quiz_provider.dart';
import '../../shared/widgets/markdown_renderer.dart';

/// Chapter detail screen with 3 tabs: Study, Key Terms, Quiz.
class ChapterDetailScreen extends ConsumerWidget {
  final String chapterId;
  const ChapterDetailScreen({super.key, required this.chapterId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final chapterAsync = ref.watch(chapterByIdProvider(chapterId));

    return chapterAsync.when(
      data: (chapter) {
        if (chapter == null) {
          return Scaffold(appBar: AppBar(title: const Text('Not Found')), body: const Center(child: Text('Chapter not found')));
        }
        return _ChapterDetailContent(chapter: chapter);
      },
      loading: () => Scaffold(appBar: AppBar(title: const Text('Loading...')), body: const Center(child: CircularProgressIndicator())),
      error: (error, _) => Scaffold(
        appBar: AppBar(title: const Text('Error')),
        body: Center(child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
          Text('Failed to load: $error'),
          const SizedBox(height: 16),
          FilledButton(onPressed: () => ref.invalidate(chapterByIdProvider(chapterId)), child: const Text('Retry')),
        ])),
      ),
    );
  }
}

class _ChapterDetailContent extends StatelessWidget {
  final Chapter chapter;
  const _ChapterDetailContent({required this.chapter});

  @override
  Widget build(BuildContext context) {
    return DefaultTabController(
      length: 3,
      child: Scaffold(
        appBar: AppBar(
          title: Text('${chapter.sectionNum} - ${chapter.title}', style: const TextStyle(fontSize: 16)),
          bottom: const TabBar(tabs: [
            Tab(icon: Icon(Icons.menu_book_outlined), text: 'Study'),
            Tab(icon: Icon(Icons.spellcheck_outlined), text: 'Key Terms'),
            Tab(icon: Icon(Icons.quiz_outlined), text: 'Quiz'),
          ]),
        ),
        body: TabBarView(children: [
          _StudyTab(chapter: chapter),
          _KeyTermsTab(chapter: chapter),
          _QuizTab(chapter: chapter),
        ]),
      ),
    );
  }
}

/// Study tab: renders chapter markdown content with callout styles.
class _StudyTab extends ConsumerWidget {
  final Chapter chapter;
  const _StudyTab({required this.chapter});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final contentAsync = ref.watch(sectionContentProvider(SectionContentArgs(chapterId: chapter.id, filename: chapter.readme)));
    return contentAsync.when(
      data: (content) {
        if (content.isEmpty) return const Center(child: Text('No study content available'));
        return SingleChildScrollView(padding: const EdgeInsets.symmetric(vertical: 16), child: MarkdownRenderer(data: content));
      },
      loading: () => const Center(child: CircularProgressIndicator()),
      error: (error, _) => Center(child: Padding(padding: const EdgeInsets.all(24), child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
        const Icon(Icons.error_outline, size: 48, color: AppTheme.examAlert),
        const SizedBox(height: 12),
        Text('Failed to load content', style: Theme.of(context).textTheme.titleMedium),
        const SizedBox(height: 16),
        FilledButton(onPressed: () => ref.invalidate(sectionContentProvider(SectionContentArgs(chapterId: chapter.id, filename: chapter.readme))), child: const Text('Retry')),
      ]))),
    );
  }
}

/// Key Terms tab: displays a list of terms and definitions.
class _KeyTermsTab extends StatelessWidget {
  final Chapter chapter;
  const _KeyTermsTab({required this.chapter});

  @override
  Widget build(BuildContext context) {
    if (chapter.keyTerms.isEmpty) return const Center(child: Text('No key terms for this chapter'));
    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: chapter.keyTerms.length,
      itemBuilder: (context, index) => _KeyTermCard(term: chapter.keyTerms[index]),
    );
  }
}

class _KeyTermCard extends StatelessWidget {
  final KeyTerm term;
  const _KeyTermCard({required this.term});

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.symmetric(vertical: 4),
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Row(children: [
            Expanded(child: Text(term.term, style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w600))),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
              decoration: BoxDecoration(color: AppTheme.accent.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(4)),
              child: Text(term.source, style: Theme.of(context).textTheme.bodySmall?.copyWith(color: AppTheme.accent, fontWeight: FontWeight.w500)),
            ),
          ]),
          const SizedBox(height: 6),
          Text(term.definition, style: Theme.of(context).textTheme.bodyMedium),
        ]),
      ),
    );
  }
}

/// Quiz tab: start a chapter quiz with all chapter questions.
class _QuizTab extends ConsumerStatefulWidget {
  final Chapter chapter;
  const _QuizTab({required this.chapter});

  @override
  ConsumerState<_QuizTab> createState() => _QuizTabState();
}

class _QuizTabState extends ConsumerState<_QuizTab> {
  @override
  Widget build(BuildContext context) {
    final quizState = ref.watch(quizProvider);
    if (quizState.status == QuizStatus.active || quizState.status == QuizStatus.completed) {
      return _QuizInProgress(chapter: widget.chapter);
    }
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
          Icon(Icons.quiz_outlined, size: 64, color: AppTheme.accent.withValues(alpha: 0.5)),
          const SizedBox(height: 16),
          Text('Chapter Quiz', style: Theme.of(context).textTheme.headlineSmall),
          const SizedBox(height: 8),
          Text('${widget.chapter.questionCount} questions about ${widget.chapter.title}', style: Theme.of(context).textTheme.bodyMedium, textAlign: TextAlign.center),
          const SizedBox(height: 8),
          Text('${AppConstants.quizTimePerQuestionSeconds}s per question', style: Theme.of(context).textTheme.bodySmall),
          const SizedBox(height: 32),
          FilledButton.icon(
            onPressed: () {
              ref.read(quizProvider.notifier).startQuiz(widget.chapter.questions);
              context.push('/chapters/${widget.chapter.id}/quiz');
            },
            icon: const Icon(Icons.play_arrow),
            label: const Text('Start Quiz'),
            style: FilledButton.styleFrom(padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 16)),
          ),
        ]),
      ),
    );
  }
}

/// Shows the active quiz questions during a quiz session.
class _QuizInProgress extends ConsumerWidget {
  final Chapter chapter;
  const _QuizInProgress({required this.chapter});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final quizState = ref.watch(quizProvider);
    if (quizState.isComplete) return _QuizResults(quizState: quizState, chapterId: chapter.id);
    if (quizState.questions.isEmpty) return const Center(child: Text('No questions available'));

    final question = quizState.currentQuestion;
    final progress = (quizState.currentIndex + 1) / quizState.questions.length;

    return Column(children: [
      LinearProgressIndicator(value: progress),
      Padding(padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8), child: Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
        Text('Question ${quizState.currentIndex + 1} of ${quizState.questions.length}', style: Theme.of(context).textTheme.bodySmall),
        Text('Score: ${quizState.score}', style: Theme.of(context).textTheme.bodySmall?.copyWith(fontWeight: FontWeight.w600)),
      ])),
      Expanded(child: SingleChildScrollView(padding: const EdgeInsets.all(16), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Text(question.text, style: Theme.of(context).textTheme.bodyLarge),
        const SizedBox(height: 20),
        ...List.generate(question.options.length, (i) => Padding(padding: const EdgeInsets.only(bottom: 8), child: _OptionButton(
          label: String.fromCharCode(65 + i), text: question.options[i],
          isSelected: quizState.selectedAnswer == i,
          onTap: () => ref.read(quizProvider.notifier).selectAnswer(i),
        ))),
      ]))),
      Padding(padding: const EdgeInsets.all(16), child: FilledButton(
        onPressed: quizState.selectedAnswer >= 0 ? () => ref.read(quizProvider.notifier).submitAnswer() : null,
        child: const Text('Submit Answer'),
      )),
    ]);
  }
}

class _OptionButton extends StatelessWidget {
  final String label;
  final String text;
  final bool isSelected;
  final VoidCallback onTap;
  const _OptionButton({required this.label, required this.text, required this.isSelected, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap, borderRadius: BorderRadius.circular(8),
      child: Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          border: Border.all(color: isSelected ? AppTheme.accent : Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.2), width: isSelected ? 2 : 1),
          borderRadius: BorderRadius.circular(8),
          color: isSelected ? AppTheme.accent.withValues(alpha: 0.1) : Colors.transparent,
        ),
        child: Row(children: [
          Container(width: 28, height: 28, decoration: BoxDecoration(shape: BoxShape.circle, color: isSelected ? AppTheme.accent : Colors.transparent, border: Border.all(color: isSelected ? AppTheme.accent : Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.3), width: 2)),
            child: Center(child: Text(label, style: TextStyle(fontWeight: FontWeight.w600, color: isSelected ? Colors.white : Theme.of(context).colorScheme.onSurface, fontSize: 12)))),
          const SizedBox(width: 12),
          Expanded(child: Text(text, style: Theme.of(context).textTheme.bodyMedium)),
        ]),
      ),
    );
  }
}

/// Quiz results shown after completion.
class _QuizResults extends ConsumerWidget {
  final QuizState quizState;
  final String chapterId;
  const _QuizResults({required this.quizState, required this.chapterId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final isPassing = quizState.accuracyPercent >= AppConstants.passingScorePercent;
    return Center(child: Padding(padding: const EdgeInsets.all(32), child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
      Icon(isPassing ? Icons.check_circle : Icons.cancel, size: 72, color: isPassing ? Colors.green : AppTheme.examAlert),
      const SizedBox(height: 16),
      Text(isPassing ? 'Passed!' : 'Keep Practicing', style: Theme.of(context).textTheme.headlineMedium?.copyWith(fontWeight: FontWeight.bold, color: isPassing ? Colors.green : AppTheme.examAlert)),
      const SizedBox(height: 24),
      Text('${quizState.correctCount} / ${quizState.questions.length}', style: Theme.of(context).textTheme.headlineSmall),
      const SizedBox(height: 8),
      Text('${quizState.accuracyPercent.round()}% accuracy', style: Theme.of(context).textTheme.titleMedium),
      const SizedBox(height: 32),
      Row(mainAxisAlignment: MainAxisAlignment.center, children: [
        OutlinedButton(onPressed: () => context.pop(), child: const Text('Back to Chapter')),
        const SizedBox(width: 12),
        FilledButton(onPressed: () {
          final chapter = ref.read(chapterByIdProvider(chapterId)).valueOrNull;
          if (chapter != null) ref.read(quizProvider.notifier).startQuiz(chapter.questions);
        }, child: const Text('Retake Quiz')),
      ]),
    ])));
  }
}
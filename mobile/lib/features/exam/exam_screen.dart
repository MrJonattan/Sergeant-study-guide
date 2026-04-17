import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../config/constants.dart';
import '../../config/theme.dart';
import '../../data/models/question.dart';
import '../../providers/quiz_provider.dart';
import '../../shared/utils/haptic_feedback.dart' as haptics;

/// Timed exam: countdown timer, question scroll, jump grid, submit confirmation.
class ExamScreen extends ConsumerStatefulWidget {
  const ExamScreen({super.key});

  @override
  ConsumerState<ExamScreen> createState() => _ExamScreenState();
}

class _ExamScreenState extends ConsumerState<ExamScreen> {
  Timer? _displayTimer;
  int _remainingSeconds = AppConstants.examTimeLimitMinutes * 60;
  bool _showJumpGrid = false;

  @override
  void initState() { super.initState(); _startTimer(); }
  @override
  void dispose() { _displayTimer?.cancel(); super.dispose(); }

  void _startTimer() {
    _displayTimer?.cancel();
    _displayTimer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (!mounted) { timer.cancel(); return; }
      setState(() => _remainingSeconds--);
      if (_remainingSeconds <= 0) { timer.cancel(); _autoSubmit(); }
      if (_remainingSeconds == 300) haptics.StudyHaptics.heavyImpact();
    });
  }

  void _autoSubmit() {
    ref.read(quizProvider.notifier).submitAnswer();
    if (mounted) ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Time is up! Exam auto-submitted.')));
  }

  // _formatTime is now the top-level formatExamTime function

  @override
  Widget build(BuildContext context) {
    final quizState = ref.watch(quizProvider);

    if (quizState.status == QuizStatus.idle) return Scaffold(appBar: AppBar(title: const Text('No Active Exam')), body: const Center(child: Text('No exam in progress.')));
    if (quizState.isComplete) { _displayTimer?.cancel(); return _ExamResults(quizState: quizState, timeUsed: formatExamTime((AppConstants.examTimeLimitMinutes * 60) - _remainingSeconds)); }
    if (quizState.questions.isEmpty) return Scaffold(appBar: AppBar(title: const Text('Error')), body: const Center(child: Text('No questions loaded.')));

    final currentQuestion = quizState.currentQuestion;

    return PopScope(canPop: false, onPopInvokedWithResult: (didPop, _) { if (!didPop) _showExitConfirm(context); },
      child: Scaffold(
        appBar: AppBar(title: Text('Question ${quizState.currentIndex + 1} / ${quizState.questions.length}'),
          actions: [_TimerBadge(remainingSeconds: _remainingSeconds), IconButton(icon: const Icon(Icons.grid_view), tooltip: 'Jump to question', onPressed: () => setState(() => _showJumpGrid = !_showJumpGrid))]),
        body: Column(children: [
          LinearProgressIndicator(value: (quizState.currentIndex + 1) / quizState.questions.length),
          if (_showJumpGrid) _JumpGrid(answers: quizState.answers, currentIndex: quizState.currentIndex, total: quizState.questions.length,
            onDismiss: () => setState(() => _showJumpGrid = false)),
          Expanded(child: SingleChildScrollView(padding: const EdgeInsets.all(16), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text(currentQuestion.text, style: Theme.of(context).textTheme.bodyLarge?.copyWith(height: 1.5)),
            const SizedBox(height: 20),
            ...List.generate(currentQuestion.options.length, (i) => Padding(padding: const EdgeInsets.only(bottom: 10),
              child: _ExamOption(label: String.fromCharCode(65 + i), text: currentQuestion.options[i],
                isSelected: quizState.selectedAnswer == i, onTap: () => ref.read(quizProvider.notifier).selectAnswer(i)))),
          ]))),
          _BottomBar(hasSelection: quizState.selectedAnswer >= 0,
            onSubmit: () { haptics.StudyHaptics.selection(); ref.read(quizProvider.notifier).submitAnswer(); },
            onSkip: () => ref.read(quizProvider.notifier).skipQuestion(),
            onEndExam: () => _showSubmitConfirm(context)),
        ]),
      ),
    );
  }

  void _showExitConfirm(BuildContext context) => showDialog(context: context, builder: (ctx) => AlertDialog(
    title: const Text('Exit Exam?'), content: const Text('Your progress will be lost.'),
    actions: [TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Stay')),
      TextButton(onPressed: () { Navigator.pop(ctx); ref.read(quizProvider.notifier).resetQuiz(); context.go('/'); }, child: const Text('Exit'))],
  ));

  void _showSubmitConfirm(BuildContext context) {
    final qs = ref.read(quizProvider);
    final answered = qs.answers.length, total = qs.questions.length, unanswered = total - answered;
    showDialog(context: context, builder: (ctx) => AlertDialog(
      title: const Text('Submit Exam?'),
      content: Column(mainAxisSize: MainAxisSize.min, crossAxisAlignment: CrossAxisAlignment.start, children: [
        Text('You have answered $answered out of $total questions.'),
        if (unanswered > 0) Padding(padding: const EdgeInsets.only(top: 8), child: Text('Warning: $unanswered question${unanswered == 1 ? '' : 's'} will be marked incorrect.', style: const TextStyle(color: AppTheme.examAlert))),
      ]),
      actions: [TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancel')),
        FilledButton(onPressed: () { Navigator.pop(ctx); for (var i = qs.currentIndex; i < total; i++) { if (i >= qs.answers.length) ref.read(quizProvider.notifier).skipQuestion(); } }, child: const Text('Submit'))],
    ));
  }
}

class _TimerBadge extends StatelessWidget {
  final int remainingSeconds;
  const _TimerBadge({required this.remainingSeconds});

  @override
  Widget build(BuildContext context) {
    final isUrgent = remainingSeconds < 600;
    return Padding(padding: const EdgeInsets.only(right: 8), child: Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(color: isUrgent ? AppTheme.examAlert.withValues(alpha: 0.15) : Colors.transparent, borderRadius: BorderRadius.circular(8),
        border: isUrgent ? Border.all(color: AppTheme.examAlert, width: 1) : null),
      child: Row(mainAxisSize: MainAxisSize.min, children: [
        Icon(Icons.timer_outlined, size: 16, color: isUrgent ? AppTheme.examAlert : Colors.white),
        const SizedBox(width: 4),
        Text(formatExamTime(remainingSeconds), style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: isUrgent ? AppTheme.examAlert : Colors.white, fontFamily: 'monospace')),
      ]),
    ));
  }
}

/// Formats seconds into HH:MM:SS display string.
String formatExamTime(int totalSeconds) {
  final h = totalSeconds ~/ 3600;
  final m = (totalSeconds % 3600) ~/ 60;
  final s = totalSeconds % 60;
  return '${h.toString().padLeft(2, '0')}:${m.toString().padLeft(2, '0')}:${s.toString().padLeft(2, '0')}';
}

class _JumpGrid extends StatelessWidget {
  final List<QuizAnswer> answers; final int currentIndex; final int total; final VoidCallback onDismiss;
  const _JumpGrid({required this.answers, required this.currentIndex, required this.total, required this.onDismiss});

  @override
  Widget build(BuildContext context) {
    return Container(constraints: const BoxConstraints(maxHeight: 200), padding: const EdgeInsets.all(8),
      decoration: BoxDecoration(color: Theme.of(context).cardColor, border: Border(bottom: BorderSide(color: Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.1)))),
      child: Column(children: [
        Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [Text('Jump to Question', style: Theme.of(context).textTheme.titleSmall), IconButton(icon: const Icon(Icons.close, size: 20), onPressed: onDismiss, padding: EdgeInsets.zero, constraints: const BoxConstraints())]),
        Expanded(child: GridView.builder(gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(crossAxisCount: 8, mainAxisSpacing: 4, crossAxisSpacing: 4), itemCount: total,
          itemBuilder: (context, i) {
            final isAnswered = i < answers.length, isCurrent = i == currentIndex;
            final bgColor = isCurrent ? AppTheme.accent : isAnswered ? Colors.green.withValues(alpha: 0.2) : Theme.of(context).colorScheme.surface;
            final textColor = isCurrent ? Colors.white : isAnswered ? Colors.green : Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.5);
            return Container(decoration: BoxDecoration(color: bgColor, borderRadius: BorderRadius.circular(4), border: Border.all(color: isCurrent ? AppTheme.accent : Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.2))),
              child: Center(child: Text('${i + 1}', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: textColor))));
          })),
      ]),
    );
  }
}

class _ExamOption extends StatelessWidget {
  final String label; final String text; final bool isSelected; final VoidCallback onTap;
  const _ExamOption({required this.label, required this.text, required this.isSelected, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return InkWell(onTap: onTap, borderRadius: BorderRadius.circular(8), child: Container(padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(border: Border.all(color: isSelected ? AppTheme.accent : Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.2), width: isSelected ? 2 : 1),
        borderRadius: BorderRadius.circular(8), color: isSelected ? AppTheme.accent.withValues(alpha: 0.1) : Colors.transparent),
      child: Row(children: [
        Container(width: 28, height: 28, decoration: BoxDecoration(shape: BoxShape.circle, color: isSelected ? AppTheme.accent : Colors.transparent,
          border: Border.all(color: isSelected ? AppTheme.accent : Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.3), width: 2)),
          child: Center(child: Text(label, style: TextStyle(fontWeight: FontWeight.w600, fontSize: 12, color: isSelected ? Colors.white : Theme.of(context).colorScheme.onSurface)))),
        const SizedBox(width: 12), Expanded(child: Text(text, style: Theme.of(context).textTheme.bodyMedium)),
      ]),
    ));
  }
}

class _BottomBar extends StatelessWidget {
  final bool hasSelection; final VoidCallback onSubmit; final VoidCallback onSkip; final VoidCallback onEndExam;
  const _BottomBar({required this.hasSelection, required this.onSubmit, required this.onSkip, required this.onEndExam});

  @override
  Widget build(BuildContext context) {
    return Container(padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(color: Theme.of(context).cardColor, border: Border(top: BorderSide(color: Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.1)))),
      child: Row(children: [
        Expanded(child: OutlinedButton(onPressed: onSkip, child: const Text('Skip'))),
        const SizedBox(width: 12),
        Expanded(flex: 2, child: FilledButton(onPressed: hasSelection ? onSubmit : null, child: const Text('Submit'))),
        const SizedBox(width: 12),
        Expanded(child: OutlinedButton(onPressed: onEndExam, style: OutlinedButton.styleFrom(foregroundColor: AppTheme.examAlert), child: const Text('End'))),
      ]),
    );
  }
}

class _ExamResults extends StatelessWidget {
  final QuizState quizState; final String timeUsed;
  const _ExamResults({required this.quizState, required this.timeUsed});

  @override
  Widget build(BuildContext context) {
    final isPassing = quizState.accuracyPercent >= AppConstants.passingScorePercent;
    return Scaffold(appBar: AppBar(title: const Text('Exam Results')),
      body: Center(child: Padding(padding: const EdgeInsets.all(32), child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
        Icon(isPassing ? Icons.emoji_events : Icons.refresh, size: 72, color: isPassing ? Colors.green : AppTheme.examAlert),
        const SizedBox(height: 16),
        Text(isPassing ? 'Passed!' : 'Not Yet', style: Theme.of(context).textTheme.headlineMedium?.copyWith(fontWeight: FontWeight.bold, color: isPassing ? Colors.green : AppTheme.examAlert)),
        const SizedBox(height: 32),
        _Row(label: 'Score', value: '${quizState.correctCount} / ${quizState.questions.length}'),
        _Row(label: 'Accuracy', value: '${quizState.accuracyPercent.round()}%'),
        _Row(label: 'Time Used', value: timeUsed),
        _Row(label: 'Correct', value: '${quizState.correctCount}'),
        _Row(label: 'Incorrect', value: '${quizState.incorrectCount}'),
        const SizedBox(height: 40),
        FilledButton.icon(onPressed: () { ref.read(quizProvider.notifier).resetQuiz(); context.go('/'); }, icon: const Icon(Icons.home), label: const Text('Return Home')),
      ]))));
  }
}

class _Row extends StatelessWidget {
  final String label; final String value;
  const _Row({required this.label, required this.value});
  @override
  Widget build(BuildContext context) => Padding(padding: const EdgeInsets.symmetric(vertical: 4), child: Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
    Text(label, style: Theme.of(context).textTheme.bodyMedium),
    Text(value, style: Theme.of(context).textTheme.bodyMedium?.copyWith(fontWeight: FontWeight.w600)),
  ]));
}
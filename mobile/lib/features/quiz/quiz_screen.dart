import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../config/constants.dart';
import '../../config/theme.dart';
import '../../data/models/question.dart';
import '../../providers/quiz_provider.dart';
import '../../shared/utils/haptic_feedback.dart' as haptics;

/// Sequential MC question display with haptic feedback and progress bar.
class QuizScreen extends ConsumerStatefulWidget {
  const QuizScreen({super.key});

  @override
  ConsumerState<QuizScreen> createState() => _QuizScreenState();
}

class _QuizScreenState extends ConsumerState<QuizScreen> {
  bool _answerSubmitted = false;

  @override
  Widget build(BuildContext context) {
    final quizState = ref.watch(quizProvider);

    if (quizState.status == QuizStatus.idle) return const _IdleView();
    if (quizState.isComplete) return _ResultsView(quizState: quizState);
    if (quizState.errorMessage != null) return _ErrorView(message: quizState.errorMessage!);
    if (quizState.questions.isEmpty) return const Center(child: Text('No questions loaded.'));

    final question = quizState.currentQuestion;
    final progress = (quizState.currentIndex + 1) / quizState.questions.length;

    return Scaffold(
      appBar: AppBar(
        title: Text('Question ${quizState.currentIndex + 1} of ${quizState.questions.length}'),
        actions: [TextButton(onPressed: () => _showSkipConfirm(context), child: const Text('Skip'))],
      ),
      body: Column(children: [
        LinearProgressIndicator(value: progress),
        _TimerDisplay(timeRemaining: quizState.timeRemaining),
        const SizedBox(height: 8),
        Expanded(child: SingleChildScrollView(padding: const EdgeInsets.all(16), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          _TypeBadge(type: question.type),
          const SizedBox(height: 12),
          Text(question.text, style: Theme.of(context).textTheme.bodyLarge?.copyWith(height: 1.5)),
          const SizedBox(height: 24),
          ...List.generate(question.options.length, (i) => Padding(padding: const EdgeInsets.only(bottom: 10),
            child: _AnswerOption(label: String.fromCharCode(65 + i), text: question.options[i],
              isSelected: quizState.selectedAnswer == i, isCorrect: _answerSubmitted && i == question.answer,
              isWrong: _answerSubmitted && quizState.selectedAnswer == i && i != question.answer,
              answerSubmitted: _answerSubmitted, onTap: () { if (!_answerSubmitted) { haptics.StudyHaptics.selection(); ref.read(quizProvider.notifier).selectAnswer(i); }}))),
        ]))),
        _ActionButton(answerSubmitted: _answerSubmitted, selectedAnswer: quizState.selectedAnswer,
          onSubmitted: () { haptics.StudyHaptics.heavyImpact(); setState(() => _answerSubmitted = true); ref.read(quizProvider.notifier).submitAnswer(); },
          onNext: () { setState(() => _answerSubmitted = false); },
          isLastQuestion: quizState.currentIndex >= quizState.questions.length - 1),
      ]),
    );
  }

  void _showSkipConfirm(BuildContext context) {
    showDialog(context: context, builder: (ctx) => AlertDialog(
      title: const Text('Skip Question?'), content: const Text('This will count as an incorrect answer.'),
      actions: [TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancel')),
        TextButton(onPressed: () { Navigator.pop(ctx); ref.read(quizProvider.notifier).skipQuestion(); setState(() => _answerSubmitted = false); }, child: const Text('Skip'))],
    ));
  }
}

class _TimerDisplay extends StatelessWidget {
  final int timeRemaining;
  const _TimerDisplay({required this.timeRemaining});

  @override
  Widget build(BuildContext context) {
    final mins = timeRemaining ~/ 60, secs = timeRemaining % 60, isLow = timeRemaining <= 15;
    return Padding(padding: const EdgeInsets.symmetric(horizontal: 16), child: Row(mainAxisAlignment: MainAxisAlignment.end, children: [
      Icon(Icons.timer_outlined, size: 16, color: isLow ? AppTheme.examAlert : Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.5)),
      const SizedBox(width: 4),
      Text('${mins.toString().padLeft(2, '0')}:${secs.toString().padLeft(2, '0')}', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600, fontFamily: 'monospace', color: isLow ? AppTheme.examAlert : Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.5))),
    ]));
  }
}

class _TypeBadge extends StatelessWidget {
  final QuestionType type;
  const _TypeBadge({required this.type});

  @override
  Widget build(BuildContext context) {
    final (label, color) = switch (type) {
      QuestionType.multipleChoice => ('MC', AppTheme.accent),
      QuestionType.trueFalse => ('T/F', AppTheme.sergeant),
      QuestionType.scenario => ('Scenario', AppTheme.examAlert),
    };
    return Container(padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(color: color.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(4), border: Border.all(color: color, width: 1)),
      child: Text(label, style: TextStyle(fontSize: 11, fontWeight: FontWeight.w600, letterSpacing: 0.5, color: color)));
  }
}

class _AnswerOption extends StatelessWidget {
  final String label; final String text; final bool isSelected; final bool isCorrect; final bool isWrong; final bool answerSubmitted; final VoidCallback onTap;
  const _AnswerOption({required this.label, required this.text, required this.isSelected, required this.isCorrect, required this.isWrong, required this.answerSubmitted, required this.onTap});

  @override
  Widget build(BuildContext context) {
    Color borderColor, bgColor, textColor;
    IconData? icon;
    if (isCorrect && answerSubmitted) { borderColor = Colors.green; bgColor = Colors.green.withValues(alpha: 0.1); textColor = Colors.green; icon = Icons.check_circle; }
    else if (isWrong) { borderColor = AppTheme.examAlert; bgColor = AppTheme.examAlert.withValues(alpha: 0.1); textColor = AppTheme.examAlert; icon = Icons.cancel; }
    else if (isSelected && !answerSubmitted) { borderColor = AppTheme.accent; bgColor = AppTheme.accent.withValues(alpha: 0.1); textColor = AppTheme.accent; }
    else { borderColor = Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.2); bgColor = Colors.transparent; textColor = Theme.of(context).colorScheme.onSurface; }

    return Padding(padding: const EdgeInsets.only(bottom: 10), child: InkWell(onTap: onTap, borderRadius: BorderRadius.circular(10),
      child: AnimatedContainer(duration: const Duration(milliseconds: 300), padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
        decoration: BoxDecoration(border: Border.all(color: borderColor, width: isSelected || answerSubmitted ? 2 : 1), borderRadius: BorderRadius.circular(10), color: bgColor),
        child: Row(children: [
          Container(width: 30, height: 30, decoration: BoxDecoration(shape: BoxShape.circle, color: isSelected && !answerSubmitted ? AppTheme.accent : Colors.transparent,
            border: Border.all(color: isSelected && !answerSubmitted ? AppTheme.accent : borderColor, width: 2)),
            child: Center(child: Text(label, style: TextStyle(fontWeight: FontWeight.w600, fontSize: 13, color: isSelected && !answerSubmitted ? Colors.white : textColor)))),
          const SizedBox(width: 12),
          Expanded(child: Text(text, style: Theme.of(context).textTheme.bodyMedium?.copyWith(color: answerSubmitted ? textColor : null))),
          if (icon != null) Icon(icon, size: 18, color: textColor),
        ])));
  }
}

class _ActionButton extends StatelessWidget {
  final bool answerSubmitted; final int selectedAnswer; final VoidCallback onSubmitted; final VoidCallback onNext; final bool isLastQuestion;
  const _ActionButton({required this.answerSubmitted, required this.selectedAnswer, required this.onSubmitted, required this.onNext, required this.isLastQuestion});

  @override
  Widget build(BuildContext context) {
    if (!answerSubmitted) return Padding(padding: const EdgeInsets.all(16), child: FilledButton(onPressed: selectedAnswer >= 0 ? onSubmitted : null, child: const Text('Submit Answer')));
    return Padding(padding: const EdgeInsets.all(16), child: FilledButton(onPressed: onNext, child: Text(isLastQuestion ? 'View Results' : 'Next Question')));
  }
}

class _IdleView extends StatelessWidget {
  const _IdleView();
  @override
  Widget build(BuildContext context) => Center(child: Padding(padding: const EdgeInsets.all(32), child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
    Icon(Icons.quiz_outlined, size: 72, color: AppTheme.accent.withValues(alpha: 0.5)),
    const SizedBox(height: 16), Text('No Active Quiz', style: Theme.of(context).textTheme.headlineSmall),
    const SizedBox(height: 8), Text('Start a quiz from a chapter or exam screen.', style: Theme.of(context).textTheme.bodyMedium, textAlign: TextAlign.center),
  ])));
}

class _ResultsView extends StatelessWidget {
  final QuizState quizState;
  const _ResultsView({required this.quizState});

  @override
  Widget build(BuildContext context) {
    final isPassing = quizState.accuracyPercent >= AppConstants.passingScorePercent;
    return Center(child: Padding(padding: const EdgeInsets.all(32), child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
      Icon(isPassing ? Icons.emoji_events : Icons.refresh, size: 72, color: isPassing ? Colors.green : AppTheme.examAlert),
      const SizedBox(height: 16),
      Text(isPassing ? 'Passed!' : 'Keep Practicing', style: Theme.of(context).textTheme.headlineMedium?.copyWith(fontWeight: FontWeight.bold, color: isPassing ? Colors.green : AppTheme.examAlert)),
      const SizedBox(height: 24),
      _Row(label: 'Score', value: '${quizState.correctCount} / ${quizState.questions.length}'),
      _Row(label: 'Accuracy', value: '${quizState.accuracyPercent.round()}%'),
      _Row(label: 'Correct', value: '${quizState.correctCount}'),
      _Row(label: 'Incorrect', value: '${quizState.incorrectCount}'),
      const SizedBox(height: 32),
      FilledButton(onPressed: () => ref.read(quizProvider.notifier).resetQuiz(), child: const Text('Done')),
    ])));
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

class _ErrorView extends StatelessWidget {
  final String message;
  const _ErrorView({required this.message});
  @override
  Widget build(BuildContext context) => Center(child: Padding(padding: const EdgeInsets.all(32), child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
    const Icon(Icons.error_outline, size: 64, color: AppTheme.examAlert),
    const SizedBox(height: 16), Text(message, style: Theme.of(context).textTheme.bodyLarge, textAlign: TextAlign.center),
    const SizedBox(height: 16), FilledButton(onPressed: () => ref.read(quizProvider.notifier).resetQuiz(), child: const Text('Try Again')),
  ])));
}
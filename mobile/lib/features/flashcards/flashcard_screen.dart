import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../config/theme.dart';
import '../../providers/flashcard_provider.dart';
import '../../shared/utils/haptic_feedback.dart' as haptics;

/// Swipeable flashcard interface with Leitner system tracking.
/// Tap to flip, swipe right = correct, swipe left = incorrect.
class FlashcardScreen extends ConsumerStatefulWidget {
  const FlashcardScreen({super.key});

  @override
  ConsumerState<FlashcardScreen> createState() => _FlashcardScreenState();
}

class _FlashcardScreenState extends ConsumerState<FlashcardScreen> {
  bool _showAnswer = false;
  String _searchQuery = '';
  String _filter = 'All';

  @override
  Widget build(BuildContext context) {
    final flashcardState = ref.watch(flashcardProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('Flashcards')),
      body: Column(children: [
        _SearchAndFilter(searchQuery: _searchQuery, onSearchChanged: (v) => setState(() => _searchQuery = v), filter: _filter, onFilterChanged: (v) => setState(() => _filter = v)),
        Expanded(child: flashcardState.isLoading
            ? const Center(child: CircularProgressIndicator())
            : flashcardState.errorMessage != null
                ? _ErrorView(message: flashcardState.errorMessage!, onRetry: () => ref.read(flashcardProvider.notifier).refresh())
                : flashcardState.isSessionComplete
                    ? _SessionComplete(onRefresh: () => ref.read(flashcardProvider.notifier).refresh())
                    : _FlashcardCard(card: flashcardState.currentCard!, showAnswer: _showAnswer, onFlip: _flipCard, onSwipeCorrect: _markCorrect, onSwipeIncorrect: _markIncorrect, progress: flashcardState.sessionProgress, remaining: flashcardState.remainingCount)),
      ]),
    );
  }

  void _flipCard() { haptics.StudyHaptics.cardFlip(); setState(() => _showAnswer = !_showAnswer); }
  Future<void> _markCorrect() async { haptics.StudyHaptics.correctAnswer(); setState(() => _showAnswer = false); await ref.read(flashcardProvider.notifier).markCorrect(); }
  Future<void> _markIncorrect() async { haptics.StudyHaptics.incorrectAnswer(); setState(() => _showAnswer = false); await ref.read(flashcardProvider.notifier).markIncorrect(); }
}

class _SearchAndFilter extends StatelessWidget {
  final String searchQuery;
  final ValueChanged<String> onSearchChanged;
  final String filter;
  final ValueChanged<String> onFilterChanged;
  const _SearchAndFilter({required this.searchQuery, required this.onSearchChanged, required this.filter, required this.onFilterChanged});

  @override
  Widget build(BuildContext context) {
    return Padding(padding: const EdgeInsets.fromLTRB(16, 8, 16, 4), child: Column(children: [
      TextField(value: searchQuery, onChanged: onSearchChanged,
        decoration: InputDecoration(hintText: 'Search flashcards...', prefixIcon: const Icon(Icons.search, size: 20),
          suffixIcon: searchQuery.isNotEmpty ? IconButton(icon: const Icon(Icons.clear, size: 20), onPressed: () => onSearchChanged('')) : null,
          isDense: true, contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8), border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)))),
      const SizedBox(height: 8),
      Row(children: [
        _FilterChip(label: 'All', selected: filter == 'All', onTap: () => onFilterChanged('All')),
        const SizedBox(width: 6),
        _FilterChip(label: 'P.G.', selected: filter == 'P.G.', onTap: () => onFilterChanged('P.G.')),
        const SizedBox(width: 6),
        _FilterChip(label: 'A.G.', selected: filter == 'A.G.', onTap: () => onFilterChanged('A.G.')),
      ]),
    ]));
  }
}

class _FilterChip extends StatelessWidget {
  final String label;
  final bool selected;
  final VoidCallback onTap;
  const _FilterChip({required this.label, required this.selected, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(onTap: onTap, child: Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
      decoration: BoxDecoration(color: selected ? AppTheme.accent : Theme.of(context).colorScheme.surface, borderRadius: BorderRadius.circular(16),
        border: Border.all(color: selected ? AppTheme.accent : Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.2))),
      child: Text(label, style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: selected ? Colors.white : Theme.of(context).colorScheme.onSurface, letterSpacing: 0.5)),
    ));
  }
}

class _FlashcardCard extends StatelessWidget {
  final CardReviewItem card;
  final bool showAnswer;
  final VoidCallback onFlip;
  final VoidCallback onSwipeCorrect;
  final VoidCallback onSwipeIncorrect;
  final double progress;
  final int remaining;
  const _FlashcardCard({required this.card, required this.showAnswer, required this.onFlip, required this.onSwipeCorrect, required this.onSwipeIncorrect, required this.progress, required this.remaining});

  @override
  Widget build(BuildContext context) {
    return Column(children: [
      LinearProgressIndicator(value: progress),
      Padding(padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4), child: Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
        Text('$remaining remaining', style: Theme.of(context).textTheme.bodySmall),
        Text(card.boxLabel, style: Theme.of(context).textTheme.bodySmall?.copyWith(fontWeight: FontWeight.w600, color: AppTheme.sergeant)),
      ])),
      const SizedBox(height: 8),
      Expanded(child: Padding(padding: const EdgeInsets.symmetric(horizontal: 24), child: Dismissible(
        key: ValueKey(card.cardId),
        direction: DismissDirection.horizontal,
        confirmDismiss: (direction) async { if (direction == DismissDirection.endToStart) onSwipeIncorrect(); else onSwipeCorrect(); return false; },
        onDismissed: (_) {},
        background: Container(alignment: Alignment.centerLeft, padding: const EdgeInsets.only(left: 24), decoration: BoxDecoration(color: Colors.green.withValues(alpha: 0.2), borderRadius: BorderRadius.circular(16)),
          child: const Column(mainAxisAlignment: MainAxisAlignment.center, children: [Icon(Icons.check_circle, color: Colors.green, size: 36), SizedBox(height: 4), Text('Correct', style: TextStyle(color: Colors.green, fontWeight: FontWeight.w600))])),
        secondaryBackground: Container(alignment: Alignment.centerRight, padding: const EdgeInsets.only(right: 24), decoration: BoxDecoration(color: AppTheme.examAlert.withValues(alpha: 0.2), borderRadius: BorderRadius.circular(16)),
          child: const Column(mainAxisAlignment: MainAxisAlignment.center, children: [Icon(Icons.cancel, color: AppTheme.examAlert, size: 36), SizedBox(height: 4), Text('Incorrect', style: TextStyle(color: AppTheme.examAlert, fontWeight: FontWeight.w600))])),
        child: GestureDetector(onTap: onFlip, child: _FlashcardFace(card: card, showAnswer: showAnswer)),
      ))),
      Padding(padding: const EdgeInsets.symmetric(vertical: 16), child: Text(showAnswer ? 'Swipe right = correct, left = incorrect' : 'Tap to reveal answer',
        style: Theme.of(context).textTheme.bodySmall?.copyWith(color: Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.5)))),
    ]);
  }
}

class _FlashcardFace extends StatelessWidget {
  final CardReviewItem card;
  final bool showAnswer;
  const _FlashcardFace({required this.card, required this.showAnswer});

  @override
  Widget build(BuildContext context) {
    return AnimatedSwitcher(duration: const Duration(milliseconds: 300), child: Container(
      key: ValueKey(showAnswer),
      width: double.infinity, padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(color: Theme.of(context).cardColor, borderRadius: BorderRadius.circular(16),
        border: Border.all(color: showAnswer ? AppTheme.accent.withValues(alpha: 0.5) : AppTheme.sergeant.withValues(alpha: 0.5), width: 2),
        boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.1), blurRadius: 8, offset: const Offset(0, 4))]),
      child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
        Text(showAnswer ? 'DEFINITION' : 'TERM', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w600, letterSpacing: 1.5, color: showAnswer ? AppTheme.accent : AppTheme.sergeant)),
        const SizedBox(height: 16),
        Text(showAnswer ? card.definition : card.term, style: Theme.of(context).textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.w500), textAlign: TextAlign.center),
      ]),
    ));
  }
}

class _SessionComplete extends StatelessWidget {
  final VoidCallback onRefresh;
  const _SessionComplete({required this.onRefresh});

  @override
  Widget build(BuildContext context) {
    return Center(child: Padding(padding: const EdgeInsets.all(32), child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
      const Icon(Icons.check_circle, size: 72, color: Colors.green),
      const SizedBox(height: 16),
      Text('Session Complete!', style: Theme.of(context).textTheme.headlineMedium?.copyWith(fontWeight: FontWeight.bold)),
      const SizedBox(height: 8),
      Text('You\'ve reviewed all due flashcards.', style: Theme.of(context).textTheme.bodyLarge, textAlign: TextAlign.center),
      const SizedBox(height: 24),
      FilledButton.icon(onPressed: onRefresh, icon: const Icon(Icons.refresh), label: const Text('Review Again')),
    ])));
  }
}

class _ErrorView extends StatelessWidget {
  final String message;
  final VoidCallback onRetry;
  const _ErrorView({required this.message, required this.onRetry});

  @override
  Widget build(BuildContext context) {
    return Center(child: Padding(padding: const EdgeInsets.all(32), child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
      const Icon(Icons.error_outline, size: 48, color: AppTheme.examAlert),
      const SizedBox(height: 16),
      Text(message, style: Theme.of(context).textTheme.bodyMedium, textAlign: TextAlign.center),
      const SizedBox(height: 16),
      FilledButton(onPressed: onRetry, child: const Text('Retry')),
    ])));
  }
}
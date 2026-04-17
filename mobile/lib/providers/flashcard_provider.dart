import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../config/constants.dart';
import '../data/models/study_progress.dart' as models;
import '../data/repositories/progress_repository.dart';

class CardReviewItem {
  final String cardId;
  final String term;
  final String definition;
  final int leitnerBox;
  final DateTime nextReview;

  const CardReviewItem({
    required this.cardId,
    required this.term,
    required this.definition,
    required this.leitnerBox,
    required this.nextReview,
  });

  /// Human-readable box label (1-indexed for display).
  String get boxLabel => 'Box ${leitnerBox + 1}';
}

class FlashcardReviewState {
  final List<CardReviewItem> dueCards;
  final List<CardReviewItem> allCards;
  final int currentIndex;
  final bool isLoading;
  final bool showAnswer;
  final String? errorMessage;

  const FlashcardReviewState({
    this.dueCards = const [],
    this.allCards = const [],
    this.currentIndex = 0,
    this.isLoading = false,
    this.showAnswer = false,
    this.errorMessage,
  });

  /// Current card being reviewed, or null if no cards remain.
  CardReviewItem? get currentCard {
    if (dueCards.isEmpty || currentIndex >= dueCards.length) return null;
    return dueCards[currentIndex];
  }

  /// Progress through the current review session (0.0 - 1.0).
  double get sessionProgress {
    if (dueCards.isEmpty) return 0.0;
    return currentIndex / dueCards.length;
  }

  /// Number of cards remaining in this session.
  int get remainingCount => dueCards.length - currentIndex;

  /// Whether all due cards have been reviewed.
  bool get isSessionComplete => currentIndex >= dueCards.length;

  FlashcardReviewState copyWith({
    List<CardReviewItem>? dueCards,
    List<CardReviewItem>? allCards,
    int? currentIndex,
    bool? isLoading,
    bool? showAnswer,
    String? errorMessage,
  }) {
    return FlashcardReviewState(
      dueCards: dueCards ?? this.dueCards,
      allCards: allCards ?? this.allCards,
      currentIndex: currentIndex ?? this.currentIndex,
      isLoading: isLoading ?? this.isLoading,
      showAnswer: showAnswer ?? this.showAnswer,
      errorMessage: errorMessage,
    );
  }
}

class FlashcardNotifier extends StateNotifier<FlashcardReviewState> {
  final ProgressRepository _repository;

  FlashcardNotifier(this._repository) : super(const FlashcardReviewState()) {
    _loadCards();
  }

  /// Loads all flashcard states and filters for due cards.
  Future<void> _loadCards() async {
    state = state.copyWith(isLoading: true, errorMessage: null);

    try {
      final allStates = _repository.getAllFlashcardStates();
      final dueItems = <CardReviewItem>[];

      for (final cardState in allStates) {
        if (cardState.isDue) {
          dueItems.add(CardReviewItem(
            cardId: cardState.cardId,
            term: cardState.cardId,
            definition: '',
            leitnerBox: cardState.leitnerBox,
            nextReview: cardState.nextReview,
          ));
        }
      }

      // Sort by box (lower boxes first = more urgent reviews)
      dueItems.sort((a, b) => a.leitnerBox.compareTo(b.leitnerBox));

      state = state.copyWith(
        dueCards: dueItems,
        isLoading: false,
      );
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        errorMessage: 'Failed to load flashcards. Please try again.',
      );
    }
  }

  /// Marks the current card as correctly answered (move up a box).
  Future<void> markCorrect() async {
    final card = state.currentCard;
    if (card == null) return;

    try {
      final current = _repository.getFlashcardState(card.cardId);
      final newBox = (current.leitnerBox + 1).clamp(
        0,
        AppConstants.leitnerBoxCount - 1,
      );
      final intervalDays = AppConstants.leitnerBoxIntervals[newBox];
      final nextReview = DateTime.now().add(Duration(days: intervalDays));

      final updated = models.FlashcardState(
        cardId: card.cardId,
        leitnerBox: newBox,
        nextReview: nextReview,
        consecutiveCorrect: current.consecutiveCorrect + 1,
      );

      await _repository.saveFlashcardState(updated);
      _advanceToNextCard();
    } catch (e) {
      state = state.copyWith(
        errorMessage: 'Failed to save progress. Your answer was not recorded.',
      );
    }
  }

  /// Marks the current card as incorrectly answered (reset to box 0).
  Future<void> markIncorrect() async {
    final card = state.currentCard;
    if (card == null) return;

    try {
      final current = _repository.getFlashcardState(card.cardId);
      final nextReview = DateTime.now(); // Due immediately

      final updated = models.FlashcardState(
        cardId: card.cardId,
        leitnerBox: 0,
        nextReview: nextReview,
        consecutiveCorrect: 0,
      );

      await _repository.saveFlashcardState(updated);
      _advanceToNextCard();
    } catch (e) {
      state = state.copyWith(
        errorMessage: 'Failed to save progress. Your answer was not recorded.',
      );
    }
  }

  /// Toggles showing the answer side of the flashcard.
  void toggleAnswer() {
    state = state.copyWith(showAnswer: !state.showAnswer);
  }

  /// Skips the current card without affecting its Leitner state.
  void skipCard() {
    _advanceToNextCard();
  }

  /// Reloads all cards from storage.
  Future<void> refresh() async {
    await _loadCards();
  }

  void _advanceToNextCard() {
    final nextIndex = state.currentIndex + 1;
    if (nextIndex >= state.dueCards.length) {
      state = state.copyWith(
        currentIndex: state.dueCards.length,
        showAnswer: false,
      );
    } else {
      state = state.copyWith(
        currentIndex: nextIndex,
        showAnswer: false,
      );
    }
  }
}

final flashcardProvider =
    StateNotifierProvider<FlashcardNotifier, FlashcardReviewState>((ref) {
  return FlashcardNotifier(ProgressRepository.Instance);
});
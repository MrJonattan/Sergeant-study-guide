import 'dart:async';

import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../config/constants.dart';
import '../data/models/question.dart';

enum QuizStatus {
  idle,
  active,
  completed,
}

class QuizAnswer {
  final int questionIndex;
  final int selectedAnswer;
  final bool isCorrect;

  const QuizAnswer({
    required this.questionIndex,
    required this.selectedAnswer,
    required this.isCorrect,
  });

  QuizAnswer copyWith({
    int? questionIndex,
    int? selectedAnswer,
    bool? isCorrect,
  }) {
    return QuizAnswer(
      questionIndex: questionIndex ?? this.questionIndex,
      selectedAnswer: selectedAnswer ?? this.selectedAnswer,
      isCorrect: isCorrect ?? this.isCorrect,
    );
  }
}

class QuizState {
  final QuizStatus status;
  final List<Question> questions;
  final int currentIndex;
  final int selectedAnswer;
  final int score;
  final int correctCount;
  final int incorrectCount;
  final int timeRemaining;
  final DateTime? startTime;
  final List<QuizAnswer> answers;
  final String? errorMessage;

  const QuizState({
    this.status = QuizStatus.idle,
    this.questions = const [],
    this.currentIndex = 0,
    this.selectedAnswer = -1,
    this.score = 0,
    this.correctCount = 0,
    this.incorrectCount = 0,
    this.timeRemaining = AppConstants.quizTimePerQuestionSeconds,
    this.startTime,
    this.answers = const [],
    this.errorMessage,
  });

  /// The current question, or throws if no questions available.
  Question get currentQuestion => questions[currentIndex];

  /// Accuracy percentage for completed quiz.
  double get accuracyPercent {
    if (questions.isEmpty) return 0.0;
    return (correctCount / questions.length) * 100;
  }

  /// Whether the quiz is finished.
  bool get isComplete => status == QuizStatus.completed;

  QuizState copyWith({
    QuizStatus? status,
    List<Question>? questions,
    int? currentIndex,
    int? selectedAnswer,
    int? score,
    int? correctCount,
    int? incorrectCount,
    int? timeRemaining,
    DateTime? startTime,
    List<QuizAnswer>? answers,
    String? errorMessage,
  }) {
    return QuizState(
      status: status ?? this.status,
      questions: questions ?? this.questions,
      currentIndex: currentIndex ?? this.currentIndex,
      selectedAnswer: selectedAnswer ?? this.selectedAnswer,
      score: score ?? this.score,
      correctCount: correctCount ?? this.correctCount,
      incorrectCount: incorrectCount ?? this.incorrectCount,
      timeRemaining: timeRemaining ?? this.timeRemaining,
      startTime: startTime ?? this.startTime,
      answers: answers ?? this.answers,
      errorMessage: errorMessage,
    );
  }
}

class QuizNotifier extends StateNotifier<QuizState> {
  Timer? _timer;

  QuizNotifier() : super(const QuizState());

  /// Starts a new quiz with the given questions.
  void startQuiz(List<Question> questions) {
    _timer?.cancel();

    if (questions.isEmpty) {
      state = const QuizState(
        status: QuizStatus.idle,
        errorMessage: 'No questions available for this quiz.',
      );
      return;
    }

    state = QuizState(
      status: QuizStatus.active,
      questions: questions,
      startTime: DateTime.now(),
      timeRemaining: AppConstants.quizTimePerQuestionSeconds,
    );

    _startTimer();
  }

  /// Selects an answer for the current question.
  void selectAnswer(int answerIndex) {
    if (state.status != QuizStatus.active) return;
    if (answerIndex < 0 || answerIndex >= state.currentQuestion.options.length) return;

    state = state.copyWith(selectedAnswer: answerIndex);
  }

  /// Confirms the selected answer and advances to the next question.
  void submitAnswer() {
    if (state.status != QuizStatus.active || state.selectedAnswer < 0) return;

    final currentQuestion = state.currentQuestion;
    final isCorrect = state.selectedAnswer == currentQuestion.answer;
    final newScore = isCorrect ? state.score + 1 : state.score;
    final newCorrect = isCorrect ? state.correctCount + 1 : state.correctCount;
    final newIncorrect = isCorrect ? state.incorrectCount : state.incorrectCount + 1;

    final answer = QuizAnswer(
      questionIndex: state.currentIndex,
      selectedAnswer: state.selectedAnswer,
      isCorrect: isCorrect,
    );

    final newAnswers = [...state.answers, answer];
    final isLastQuestion = state.currentIndex >= state.questions.length - 1;

    if (isLastQuestion) {
      _timer?.cancel();
      state = state.copyWith(
        status: QuizStatus.completed,
        score: newScore,
        correctCount: newCorrect,
        incorrectCount: newIncorrect,
        answers: newAnswers,
        selectedAnswer: -1,
      );
    } else {
      state = state.copyWith(
        currentIndex: state.currentIndex + 1,
        score: newScore,
        correctCount: newCorrect,
        incorrectCount: newIncorrect,
        answers: newAnswers,
        selectedAnswer: -1,
        timeRemaining: AppConstants.quizTimePerQuestionSeconds,
      );
    }
  }

  /// Skips the current question (counts as incorrect).
  void skipQuestion() {
    if (state.status != QuizStatus.active) return;

    final answer = QuizAnswer(
      questionIndex: state.currentIndex,
      selectedAnswer: -1,
      isCorrect: false,
    );

    final newAnswers = [...state.answers, answer];
    final newIncorrect = state.incorrectCount + 1;
    final isLastQuestion = state.currentIndex >= state.questions.length - 1;

    if (isLastQuestion) {
      _timer?.cancel();
      state = state.copyWith(
        status: QuizStatus.completed,
        incorrectCount: newIncorrect,
        answers: newAnswers,
        selectedAnswer: -1,
      );
    } else {
      state = state.copyWith(
        currentIndex: state.currentIndex + 1,
        incorrectCount: newIncorrect,
        answers: newAnswers,
        selectedAnswer: -1,
        timeRemaining: AppConstants.quizTimePerQuestionSeconds,
      );
    }
  }

  /// Resets the quiz to idle state.
  void resetQuiz() {
    _timer?.cancel();
    state = const QuizState();
  }

  /// Pauses the timer.
  void pauseTimer() {
    _timer?.cancel();
  }

  /// Resumes the timer after a pause.
  void resumeTimer() {
    if (state.status == QuizStatus.active) {
      _startTimer();
    }
  }

  void _startTimer() {
    _timer?.cancel();
    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (state.timeRemaining <= 1) {
        timer.cancel();
        skipQuestion();
        if (state.status == QuizStatus.active) {
          _startTimer();
        }
      } else {
        state = state.copyWith(timeRemaining: state.timeRemaining - 1);
      }
    });
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }
}

final quizProvider = StateNotifierProvider<QuizNotifier, QuizState>((ref) {
  return QuizNotifier();
});
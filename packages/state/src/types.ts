/**
 * Shared state types for progress tracking, quiz state, and flashcard system.
 * These types are used by both web (localStorage) and mobile (Hive) adapters.
 */

export interface ChapterProgress {
  chapterId: string;
  status: 'not_started' | 'in_progress' | 'review' | 'completed';
  sectionsCompleted: number;
  totalSections: number;
  quizScores: QuizScore[];
  lastStudied?: string;
}

export interface QuizScore {
  date: string;
  score: number;
  totalQuestions: number;
  category: 'chapter' | 'practice_exam' | 'quick_quiz';
}

export interface Progress {
  chapters: Record<string, ChapterProgress>;
  streak: Streak;
  totalQuestionsAnswered: number;
  lastActivity: string;
}

export interface Streak {
  current: number;
  longest: number;
  lastStudyDate: string;
}

export interface QuizState {
  currentQuestionIndex: number;
  selectedAnswer?: string;
  isAnswerRevealed: boolean;
  correctCount: number;
  incorrectCount: number;
  skippedCount: number;
  questionOrder: number[];
}

export interface FlashcardState {
  cardIndex: number;
  isFlipped: boolean;
  deckOrder: string[];
  knownCards: Set<string>;
  learningCards: Set<string>;
  newCards: Set<string>;
}

export interface StudySettings {
  darkMode: boolean;
  fontSize: 'small' | 'medium' | 'large';
  dailyGoal: number;
  notificationsEnabled: boolean;
}

export interface StateAdapter {
  loadProgress(): Promise<Progress>;
  saveProgress(progress: Progress): Promise<void>;
  loadQuizState(quizId: string): Promise<QuizState | null>;
  saveQuizState(quizId: string, state: QuizState): Promise<void>;
  loadSettings(): Promise<StudySettings>;
  saveSettings(settings: StudySettings): Promise<void>;
  resetAll(): Promise<void>;
}

/**
 * Progress state management - localStorage adapter
 */

const PROGRESS_KEY = 'nypd_progress';

interface QuizAttempt {
  correctAnswers: number;
  totalQuestions: number;
  timestamp: string;
}

interface ChapterProgress {
  chapterId: string;
  status: 'not_started' | 'in_progress' | 'review' | 'completed';
  quizScore?: number;
  quizHistory?: QuizAttempt[];
  questionsAnswered: number;
  timeSpentSeconds: number;
  lastStudiedAt?: string;
  completedAt?: string;
}

interface ProgressData {
  chapters: ChapterProgress[];
  streak: number;
  totalStudyTimeSeconds: number;
  lastStudyDate?: string;
}

function loadProgress(): ProgressData {
  const saved = localStorage.getItem(PROGRESS_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      // Invalid data, return default
    }
  }

  return {
    chapters: [],
    streak: 0,
    totalStudyTimeSeconds: 0,
  };
}

function saveProgress(data: ProgressData) {
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(data));
}

export function getProgress(chapterId: string): ChapterProgress | undefined {
  const data = loadProgress();
  if (!data || !Array.isArray(data.chapters)) {
    return undefined;
  }
  return data.chapters.find(c => c.chapterId === chapterId);
}

export function markChapterComplete(chapterId: string) {
  const data = loadProgress();
  if (!data || !Array.isArray(data.chapters)) {
    return;
  }
  let chapter = data.chapters.find(c => c.chapterId === chapterId);

  if (chapter) {
    chapter.status = 'completed';
    chapter.completedAt = new Date().toISOString();
  } else {
    chapter = {
      chapterId,
      status: 'completed',
      questionsAnswered: 0,
      timeSpentSeconds: 0,
      completedAt: new Date().toISOString(),
    };
    data.chapters.push(chapter);
  }

  saveProgress(data);
}

export function updateQuizScore(chapterId: string, score: number, totalQuestions: number) {
  const data = loadProgress();
  if (!data || !Array.isArray(data.chapters)) {
    return;
  }
  let chapter = data.chapters.find(c => c.chapterId === chapterId);

  const correctAnswers = Math.round((score / 100) * totalQuestions);

  if (chapter) {
    chapter.quizScore = score;
    chapter.status = score >= 80 ? 'completed' : 'review';
    chapter.quizHistory = chapter.quizHistory || [];
    chapter.quizHistory.push({
      correctAnswers,
      totalQuestions,
      timestamp: new Date().toISOString(),
    });
  } else {
    chapter = {
      chapterId,
      status: score >= 80 ? 'completed' : 'review',
      quizScore: score,
      quizHistory: [
        {
          correctAnswers,
          totalQuestions,
          timestamp: new Date().toISOString(),
        },
      ],
      questionsAnswered: 0,
      timeSpentSeconds: 0,
    };
    data.chapters.push(chapter);
  }

  saveProgress(data);
}

export function getStreak(): number {
  const data = loadProgress();
  return data?.streak || 0;
}

export function getTotalStudyTime(): number {
  const data = loadProgress();
  return data?.totalStudyTimeSeconds || 0;
}

export function getCompletedChapters(): number {
  const data = loadProgress();
  if (!data || !Array.isArray(data.chapters)) {
    return 0;
  }
  return data.chapters.filter(c => c.status === 'completed').length;
}

// ─────────────────────────────────────────────
// Flashcard Progress (Leitner System)
// ─────────────────────────────────────────────

interface FlashcardProgress {
  stage: number; // 1-5 (1 = new, 5 = mastered)
  nextReview?: number; // Timestamp for next review
  lastReview?: number; // Timestamp of last review
  correctCount: number;
  totalAttempts: number;
}

interface FlashcardProgressData {
  cards: Record<string, FlashcardProgress>;
}

const FLASHCARD_KEY = 'nypd_flashcards';

// Leitner intervals in milliseconds
const LEITNER_INTERVALS: Record<number, number> = {
  1: 0, // Review immediately (or same day)
  2: 1 * 24 * 60 * 60 * 1000, // 1 day
  3: 3 * 24 * 60 * 60 * 1000, // 3 days
  4: 7 * 24 * 60 * 60 * 1000, // 1 week
  5: 30 * 24 * 60 * 60 * 1000, // 1 month (mastered)
};

function loadFlashcardProgress(): FlashcardProgressData {
  const saved = localStorage.getItem(FLASHCARD_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      // Invalid data, return default
    }
  }

  return { cards: {} };
}

function saveFlashcardProgress(data: FlashcardProgressData) {
  localStorage.setItem(FLASHCARD_KEY, JSON.stringify(data));
}

export function getFlashcardProgress(cardId: string): FlashcardProgress {
  const data = loadFlashcardProgress();
  return (
    data.cards[cardId] || {
      stage: 1,
      correctCount: 0,
      totalAttempts: 0,
    }
  );
}

export function updateFlashcardProgress(cardId: string, stage: number) {
  const data = loadFlashcardProgress();

  const existing = data.cards[cardId] || {
    stage: 1,
    correctCount: 0,
    totalAttempts: 0,
  };

  const newStage = Math.max(1, Math.min(5, stage));
  const interval = LEITNER_INTERVALS[newStage];

  data.cards[cardId] = {
    stage: newStage,
    nextReview: interval > 0 ? Date.now() + interval : undefined,
    lastReview: Date.now(),
    correctCount: existing.correctCount + (newStage > existing.stage ? 1 : 0),
    totalAttempts: existing.totalAttempts + 1,
  };

  saveFlashcardProgress(data);
}

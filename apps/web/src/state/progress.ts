/**
 * Progress state management - localStorage adapter
 */

const PROGRESS_KEY = 'nypd_progress';

interface ChapterProgress {
  chapterId: string;
  status: 'not_started' | 'in_progress' | 'review' | 'completed';
  quizScore?: number;
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
  return data.chapters.find(c => c.chapterId === chapterId);
}

export function markChapterComplete(chapterId: string) {
  const data = loadProgress();
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

export function updateQuizScore(chapterId: string, score: number) {
  const data = loadProgress();
  let chapter = data.chapters.find(c => c.chapterId === chapterId);

  if (chapter) {
    chapter.quizScore = score;
    chapter.status = score >= 80 ? 'completed' : 'review';
  } else {
    chapter = {
      chapterId,
      status: score >= 80 ? 'completed' : 'review',
      quizScore: score,
      questionsAnswered: 0,
      timeSpentSeconds: 0,
    };
    data.chapters.push(chapter);
  }

  saveProgress(data);
}

export function getStreak(): number {
  const data = loadProgress();
  return data.streak;
}

export function getTotalStudyTime(): number {
  const data = loadProgress();
  return data.totalStudyTimeSeconds;
}

export function getCompletedChapters(): number {
  const data = loadProgress();
  return data.chapters.filter(c => c.status === 'completed').length;
}

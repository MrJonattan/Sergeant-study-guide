import type {
  StateAdapter,
  Progress,
  QuizState,
  StudySettings,
} from '../types';

const STORAGE_KEYS = {
  PROGRESS: 'nypd_study_progress',
  QUIZ_STATE: 'nypd_study_quiz_',
  SETTINGS: 'nypd_study_settings',
} as const;

function getDefaultProgress(): Progress {
  return {
    chapters: {},
    streak: {
      current: 0,
      longest: 0,
      lastStudyDate: new Date().toISOString().split('T')[0],
    },
    totalQuestionsAnswered: 0,
    lastActivity: new Date().toISOString(),
  };
}

function getDefaultSettings(): StudySettings {
  return {
    darkMode: false,
    fontSize: 'medium',
    dailyGoal: 20,
    notificationsEnabled: true,
  };
}

export class LocalStorageAdapter implements StateAdapter {
  async loadProgress(): Promise<Progress> {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.PROGRESS);
      if (!stored) {
        return getDefaultProgress();
      }
      return JSON.parse(stored) as Progress;
    } catch (error) {
      console.error('Failed to load progress:', error);
      return getDefaultProgress();
    }
  }

  async saveProgress(progress: Progress): Promise<void> {
    try {
      localStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(progress));
    } catch (error) {
      console.error('Failed to save progress:', error);
      throw new Error('Failed to save study progress');
    }
  }

  async loadQuizState(quizId: string): Promise<QuizState | null> {
    try {
      const key = `${STORAGE_KEYS.QUIZ_STATE}${quizId}`;
      const stored = localStorage.getItem(key);
      if (!stored) {
        return null;
      }
      return JSON.parse(stored) as QuizState;
    } catch (error) {
      console.error('Failed to load quiz state:', error);
      return null;
    }
  }

  async saveQuizState(quizId: string, state: QuizState): Promise<void> {
    try {
      const key = `${STORAGE_KEYS.QUIZ_STATE}${quizId}`;
      localStorage.setItem(key, JSON.stringify(state));
    } catch (error) {
      console.error('Failed to save quiz state:', error);
      throw new Error('Failed to save quiz state');
    }
  }

  async loadSettings(): Promise<StudySettings> {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (!stored) {
        return getDefaultSettings();
      }
      return JSON.parse(stored) as StudySettings;
    } catch (error) {
      console.error('Failed to load settings:', error);
      return getDefaultSettings();
    }
  }

  async saveSettings(settings: StudySettings): Promise<void> {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (error) {
      console.error('Failed to save settings:', error);
      throw new Error('Failed to save settings');
    }
  }

  async resetAll(): Promise<void> {
    try {
      localStorage.removeItem(STORAGE_KEYS.PROGRESS);
      localStorage.removeItem(STORAGE_KEYS.SETTINGS);

      const keys = Object.keys(localStorage);
      keys
        .filter(key => key.startsWith(STORAGE_KEYS.QUIZ_STATE))
        .forEach(key => localStorage.removeItem(key));
    } catch (error) {
      console.error('Failed to reset state:', error);
      throw new Error('Failed to reset study data');
    }
  }
}

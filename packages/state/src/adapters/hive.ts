import type {
  StateAdapter,
  Progress,
  QuizState,
  StudySettings,
} from '../types';

/**
 * Hive adapter for Flutter mobile app.
 *
 * This adapter uses Hive NoSQL database to persist state on mobile.
 * The Flutter app must initialize Hive boxes before using this adapter.
 *
 * Example Flutter initialization:
 * ```dart
 * await Hive.initFlutter();
 * await Hive.openBox('progress');
 * await Hive.openBox('quiz_states');
 * await Hive.openBox('settings');
 * ```
 */

// Box names - must match Flutter Hive box names
const BOX_NAMES = {
  PROGRESS: 'progress',
  QUIZ_STATES: 'quiz_states',
  SETTINGS: 'settings',
} as const;

// Keys within boxes
const BOX_KEYS = {
  PROGRESS_DATA: 'progress_data',
  SETTINGS_DATA: 'settings_data',
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

// Hive box accessor - injected by Flutter app
// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const HiveBox: any;

export class HiveAdapter implements StateAdapter {
  private getProgressBox() {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return HiveBox(BOX_NAMES.PROGRESS);
  }

  private getQuizStatesBox() {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return HiveBox(BOX_NAMES.QUIZ_STATES);
  }

  private getSettingsBox() {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return HiveBox(BOX_NAMES.SETTINGS);
  }

  async loadProgress(): Promise<Progress> {
    try {
      const box = this.getProgressBox();
      const data = await box.get(BOX_KEYS.PROGRESS_DATA);
      if (!data) {
        return getDefaultProgress();
      }
      return data as Progress;
    } catch (error) {
      console.error('Failed to load progress:', error);
      return getDefaultProgress();
    }
  }

  async saveProgress(progress: Progress): Promise<void> {
    try {
      const box = this.getProgressBox();
      await box.put(BOX_KEYS.PROGRESS_DATA, progress);
    } catch (error) {
      console.error('Failed to save progress:', error);
      throw new Error('Failed to save study progress');
    }
  }

  async loadQuizState(quizId: string): Promise<QuizState | null> {
    try {
      const box = this.getQuizStatesBox();
      const data = await box.get(quizId);
      if (!data) {
        return null;
      }
      return data as QuizState;
    } catch (error) {
      console.error('Failed to load quiz state:', error);
      return null;
    }
  }

  async saveQuizState(quizId: string, state: QuizState): Promise<void> {
    try {
      const box = this.getQuizStatesBox();
      await box.put(quizId, state);
    } catch (error) {
      console.error('Failed to save quiz state:', error);
      throw new Error('Failed to save quiz state');
    }
  }

  async loadSettings(): Promise<StudySettings> {
    try {
      const box = this.getSettingsBox();
      const data = await box.get(BOX_KEYS.SETTINGS_DATA);
      if (!data) {
        return getDefaultSettings();
      }
      return data as StudySettings;
    } catch (error) {
      console.error('Failed to load settings:', error);
      return getDefaultSettings();
    }
  }

  async saveSettings(settings: StudySettings): Promise<void> {
    try {
      const box = this.getSettingsBox();
      await box.put(BOX_KEYS.SETTINGS_DATA, settings);
    } catch (error) {
      console.error('Failed to save settings:', error);
      throw new Error('Failed to save settings');
    }
  }

  async resetAll(): Promise<void> {
    try {
      const progressBox = this.getProgressBox();
      const quizBox = this.getQuizStatesBox();
      const settingsBox = this.getSettingsBox();

      await progressBox.clear();
      await quizBox.clear();
      await settingsBox.clear();

      // Restore defaults
      await this.saveProgress(getDefaultProgress());
      await this.saveSettings(getDefaultSettings());
    } catch (error) {
      console.error('Failed to reset state:', error);
      throw new Error('Failed to reset study data');
    }
  }
}

import type { StateAdapter, Progress, QuizState, StudySettings } from '../types';
export declare class LocalStorageAdapter implements StateAdapter {
    loadProgress(): Promise<Progress>;
    saveProgress(progress: Progress): Promise<void>;
    loadQuizState(quizId: string): Promise<QuizState | null>;
    saveQuizState(quizId: string, state: QuizState): Promise<void>;
    loadSettings(): Promise<StudySettings>;
    saveSettings(settings: StudySettings): Promise<void>;
    resetAll(): Promise<void>;
}

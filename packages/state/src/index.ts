/**
 * @nypd-sergeant/state
 *
 * Shared state management for NYPD Sergeant Study Guide.
 * Provides unified interfaces for progress tracking, quiz state, and settings
 * across web (localStorage) and mobile (Hive) platforms.
 */

export { LocalStorageAdapter } from './adapters/localstorage';
export { HiveAdapter } from './adapters/hive';

export type {
  StateAdapter,
  Progress,
  ChapterProgress,
  QuizScore,
  Streak,
  QuizState,
  FlashcardState,
  StudySettings,
} from './types';

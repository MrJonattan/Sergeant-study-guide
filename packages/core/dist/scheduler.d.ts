/**
 * Study Schedule Generator
 * Ported from scripts/generate-study-schedule.js
 *
 * Generates daily study plans based on exam date and chapter priority
 */
export interface ScheduleChapter {
    id: string;
    priority: 'high' | 'medium' | 'low';
    estHours: number;
}
export interface DailyPlan {
    date: string;
    newChapters: string[];
    dueFlashcardCount: number;
    reviewQuiz?: {
        chapterId: string;
        questionCount: number;
    };
    isSundayReview: boolean;
    isReviewWeek: boolean;
    focus: string;
}
export interface WeeklyPlan {
    weekNumber: number;
    startDate: string;
    endDate: string;
    dailyPlans: DailyPlan[];
    focus: string;
    isReviewWeek: boolean;
}
export interface StudySchedule {
    examDate: number;
    createdAt: number;
    weeklyPlans: WeeklyPlan[];
    totalWeeks: number;
    reviewWeeks: number;
}
/**
 * Sort chapters by priority (high first), then by estimated hours (longer first)
 */
export declare function getSortedChapters(): ScheduleChapter[];
/**
 * Check if we're in cram mode (less than 14 days until exam)
 */
export declare function isCramMode(examDate: number): boolean;
/**
 * Get the number of days until exam
 */
export declare function getDaysUntilExam(examDate: number): number;
/**
 * Generate a full study schedule from now until exam date
 */
export declare function generateSchedule(examDate: number): StudySchedule;
/**
 * Get the plan for a specific date
 */
export declare function getDailyPlan(schedule: StudySchedule, date?: string): DailyPlan | null;
/**
 * Get all remaining plans from a given date
 */
export declare function getRemainingPlans(schedule: StudySchedule, fromDate?: string): DailyPlan[];
/**
 * Get chapter info by ID
 */
export declare function getChapterInfo(chapterId: string): ScheduleChapter | undefined;
/**
 * Get all chapter data
 */
export declare function getAllChapters(): ScheduleChapter[];

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
  date: string; // ISO date (YYYY-MM-DD)
  newChapters: string[]; // Chapter IDs to study
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
  examDate: number; // Timestamp
  createdAt: number; // Timestamp
  weeklyPlans: WeeklyPlan[];
  totalWeeks: number;
  reviewWeeks: number;
}

const CHAPTER_DATA: ScheduleChapter[] = [
  { id: '200-general', priority: 'high', estHours: 2 },
  { id: '202-duties-responsibilities', priority: 'high', estHours: 2 },
  { id: '207-complaints', priority: 'high', estHours: 2.5 },
  { id: '208-arrests', priority: 'high', estHours: 3 },
  { id: '209-summonses', priority: 'medium', estHours: 1.5 },
  { id: '210-prisoners', priority: 'high', estHours: 3 },
  { id: '211-court-appearances', priority: 'medium', estHours: 2 },
  { id: '212-command-operations', priority: 'high', estHours: 2.5 },
  { id: '213-mobilization-emergency', priority: 'high', estHours: 2.5 },
  { id: '214-quality-of-life', priority: 'medium', estHours: 2 },
  { id: '215-juvenile-matters', priority: 'high', estHours: 2.5 },
  { id: '216-aided-cases', priority: 'high', estHours: 3 },
  { id: '217-vehicle-collisions', priority: 'medium', estHours: 2 },
  { id: '218-property-general', priority: 'medium', estHours: 1.5 },
  { id: '219-department-property', priority: 'low', estHours: 1.5 },
  { id: '220-citywide-incident-mgmt', priority: 'high', estHours: 2 },
  { id: '221-tactical-operations', priority: 'medium', estHours: 2.5 },
  { id: '303-duties-responsibilities', priority: 'high', estHours: 2 },
  { id: '304-general-regulations', priority: 'high', estHours: 2.5 },
  { id: '305-uniforms-equipment', priority: 'low', estHours: 1 },
  { id: '318-disciplinary-matters', priority: 'high', estHours: 3 },
  { id: '319-civilian-personnel', priority: 'low', estHours: 1.5 },
  { id: '320-personnel-matters', priority: 'medium', estHours: 2 },
  { id: '324-leave-payroll-timekeeping', priority: 'medium', estHours: 2 },
  { id: '329-career-development', priority: 'low', estHours: 1.5 },
  { id: '330-medical-health-wellness', priority: 'medium', estHours: 2.5 },
  { id: '331-evaluations', priority: 'medium', estHours: 2 },
  { id: '332-employee-rights', priority: 'high', estHours: 2.5 },
];

const PRIORITY_ORDER = { high: 0, medium: 1, low: 2 };
const CRAM_MODE_THRESHOLD_DAYS = 14;
const DEFAULT_HOURS_PER_WEEK = 8;
const DEFAULT_CHAPTERS_PER_DAY = 1;

/**
 * Sort chapters by priority (high first), then by estimated hours (longer first)
 */
export function getSortedChapters(): ScheduleChapter[] {
  return [...CHAPTER_DATA].sort((a, b) => {
    const priorityDiff = PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
    if (priorityDiff !== 0) return priorityDiff;
    return b.estHours - a.estHours;
  });
}

/**
 * Check if we're in cram mode (less than 14 days until exam)
 */
export function isCramMode(examDate: number): boolean {
  const now = Date.now();
  const daysUntilExam = Math.ceil((examDate - now) / (1000 * 60 * 60 * 24));
  return daysUntilExam <= CRAM_MODE_THRESHOLD_DAYS;
}

/**
 * Get the number of days until exam
 */
export function getDaysUntilExam(examDate: number): number {
  const now = Date.now();
  return Math.ceil((examDate - now) / (1000 * 60 * 60 * 24));
}

/**
 * Generate a full study schedule from now until exam date
 */
export function generateSchedule(examDate: number): StudySchedule {
  const now = new Date();
  const exam = new Date(examDate);

  // Calculate total weeks available
  const daysUntilExam = Math.ceil((examDate - now.getTime()) / (1000 * 60 * 60 * 24));
  const totalWeeks = Math.ceil(daysUntilExam / 7);

  // Calculate review weeks (20% of total, minimum 1)
  const reviewWeeks = Math.max(1, Math.floor(totalWeeks * 0.2));
  const contentWeeks = totalWeeks - reviewWeeks;

  const sortedChapters = getSortedChapters();
  const weeklyPlans: WeeklyPlan[] = [];

  let weekNum = 1;
  let chapterIndex = 0;

  // Generate content weeks
  while (weekNum <= contentWeeks && chapterIndex < sortedChapters.length) {
    const weekStart = new Date(now);
    weekStart.setDate(weekStart.getDate() + (weekNum - 1) * 7);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);

    const dailyPlans: DailyPlan[] = [];
    const chaptersThisWeek: ScheduleChapter[] = [];

    // Distribute chapters across 7 days
    const chaptersPerDay = Math.ceil((sortedChapters.length - chapterIndex) / ((contentWeeks - weekNum + 1) * 7));

    for (let day = 0; day < 7; day++) {
      const currentDate = new Date(weekStart);
      currentDate.setDate(weekStart.getDate() + day);
      const dateStr = currentDate.toISOString().split('T')[0];
      const isSunday = currentDate.getDay() === 0;

      const newChapters: string[] = [];

      // Add chapters for this day (skip Sunday - review day)
      if (!isSunday && chapterIndex < sortedChapters.length) {
        const chaptersToday = Math.min(chaptersPerDay, sortedChapters.length - chapterIndex);
        for (let i = 0; i < chaptersToday; i++) {
          if (chapterIndex < sortedChapters.length) {
            newChapters.push(sortedChapters[chapterIndex].id);
            chaptersThisWeek.push(sortedChapters[chapterIndex]);
            chapterIndex++;
          }
        }
      }

      // Sunday is review day
      if (isSunday) {
        dailyPlans.push({
          date: dateStr,
          newChapters: [],
          dueFlashcardCount: 0,
          isSundayReview: true,
          isReviewWeek: false,
          focus: 'Weekly Review',
        });
      } else {
        dailyPlans.push({
          date: dateStr,
          newChapters,
          dueFlashcardCount: 0, // Will be calculated at runtime from flashcard state
          reviewQuiz: newChapters.length > 0 ? {
            chapterId: newChapters[0],
            questionCount: 10,
          } : undefined,
          isSundayReview: false,
          isReviewWeek: false,
          focus: newChapters.length > 0 ? getWeekFocus(chaptersThisWeek) : 'Catch-up',
        });
      }
    }

    const highPriorityCount = chaptersThisWeek.filter(c => c.priority === 'high').length;

    weeklyPlans.push({
      weekNumber: weekNum,
      startDate: weekStart.toISOString().split('T')[0],
      endDate: weekEnd.toISOString().split('T')[0],
      dailyPlans,
      focus: highPriorityCount > 1 ? 'HIGH PRIORITY' : 'Standard',
      isReviewWeek: false,
    });

    weekNum++;
  }

  // Generate review weeks
  for (let i = 0; i < reviewWeeks; i++) {
    const weekStart = new Date(exam);
    weekStart.setDate(exam.getDate() - (reviewWeeks - i) * 7);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);

    const dailyPlans: DailyPlan[] = [];

    for (let day = 0; day < 7; day++) {
      const currentDate = new Date(weekStart);
      currentDate.setDate(weekStart.getDate() + day);
      const dateStr = currentDate.toISOString().split('T')[0];

      dailyPlans.push({
        date: dateStr,
        newChapters: [],
        dueFlashcardCount: 0,
        isSundayReview: currentDate.getDay() === 0,
        isReviewWeek: true,
        focus: i === reviewWeeks - 1 ? 'FULL PRACTICE EXAM' : 'WEAK AREAS REVIEW',
      });
    }

    weeklyPlans.push({
      weekNumber: weekNum,
      startDate: weekStart.toISOString().split('T')[0],
      endDate: weekEnd.toISOString().split('T')[0],
      dailyPlans,
      focus: i === reviewWeeks - 1 ? 'FULL PRACTICE EXAM' : 'WEAK AREAS REVIEW',
      isReviewWeek: true,
    });

    weekNum++;
  }

  return {
    examDate,
    createdAt: Date.now(),
    weeklyPlans,
    totalWeeks,
    reviewWeeks,
  };
}

/**
 * Get the plan for a specific date
 */
export function getDailyPlan(schedule: StudySchedule, date?: string): DailyPlan | null {
  const targetDate = date || new Date().toISOString().split('T')[0];

  for (const week of schedule.weeklyPlans) {
    for (const day of week.dailyPlans) {
      if (day.date === targetDate) {
        return day;
      }
    }
  }

  return null;
}

/**
 * Get all remaining plans from a given date
 */
export function getRemainingPlans(schedule: StudySchedule, fromDate?: string): DailyPlan[] {
  const start = fromDate || new Date().toISOString().split('T')[0];
  const plans: DailyPlan[] = [];

  for (const week of schedule.weeklyPlans) {
    for (const day of week.dailyPlans) {
      if (day.date >= start) {
        plans.push(day);
      }
    }
  }

  return plans;
}

/**
 * Determine week focus based on chapter priorities
 */
function getWeekFocus(chapters: ScheduleChapter[]): string {
  const highCount = chapters.filter(c => c.priority === 'high').length;
  if (highCount > 1) return 'HIGH PRIORITY';
  return 'Standard';
}

/**
 * Get chapter info by ID
 */
export function getChapterInfo(chapterId: string): ScheduleChapter | undefined {
  return CHAPTER_DATA.find(c => c.id === chapterId);
}

/**
 * Get all chapter data
 */
export function getAllChapters(): ScheduleChapter[] {
  return [...CHAPTER_DATA];
}

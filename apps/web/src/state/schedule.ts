/**
 * Study Schedule State Management - localStorage adapter
 */

import { StudySchedule, DailyPlan, generateSchedule, getDailyPlan as getPlanFromSchedule } from '../utils/scheduler';

const EXAM_DATE_KEY = 'nypd_exam_date';
const SCHEDULE_KEY = 'nypd_schedule';
const DAILY_PLAN_COMPLETION_KEY = 'nypd_daily_plan_completion';

/**
 * Get the stored exam date timestamp
 */
export function getExamDate(): number | null {
  const saved = localStorage.getItem(EXAM_DATE_KEY);
  return saved ? Number(saved) : null;
}

/**
 * Set the exam date and generate a new schedule
 */
export function setExamDate(timestamp: number) {
  localStorage.setItem(EXAM_DATE_KEY, timestamp.toString());
  // Auto-generate schedule when exam date is set
  const schedule = generateSchedule(timestamp);
  saveSchedule(schedule);
}

/**
 * Clear the exam date and schedule
 */
export function clearExamDate() {
  localStorage.removeItem(EXAM_DATE_KEY);
  localStorage.removeItem(SCHEDULE_KEY);
}

/**
 * Check if exam date is set
 */
export function hasExamDate(): boolean {
  return getExamDate() !== null;
}

/**
 * Get the stored schedule
 */
export function getSchedule(): StudySchedule | null {
  const saved = localStorage.getItem(SCHEDULE_KEY);
  if (saved) {
    try {
      return JSON.parse(saved) as StudySchedule;
    } catch {
      return null;
    }
  }
  return null;
}

/**
 * Save the schedule
 */
export function saveSchedule(schedule: StudySchedule) {
  localStorage.setItem(SCHEDULE_KEY, JSON.stringify(schedule));
}

/**
 * Get or create schedule based on exam date
 */
export function getOrCreateSchedule(): StudySchedule | null {
  const examDate = getExamDate();
  if (!examDate) return null;

  let schedule = getSchedule();

  // If no schedule exists or exam date changed, generate new one
  if (!schedule || schedule.examDate !== examDate) {
    schedule = generateSchedule(examDate);
    saveSchedule(schedule);
  }

  return schedule;
}

/**
 * Get the daily plan for a specific date (defaults to today)
 */
export function getDailyPlan(date?: string): DailyPlan | null {
  const schedule = getOrCreateSchedule();
  if (!schedule) return null;

  return getPlanFromSchedule(schedule, date);
}

/**
 * Get today's daily plan
 */
export function getTodayPlan(): DailyPlan | null {
  const today = new Date().toISOString().split('T')[0];
  return getDailyPlan(today);
}

/**
 * Mark a daily plan as complete
 */
export function markDailyPlanComplete(date: string) {
  const completions = getDailyPlanCompletions();
  if (!completions.includes(date)) {
    completions.push(date);
    localStorage.setItem(DAILY_PLAN_COMPLETION_KEY, JSON.stringify(completions));
  }
}

/**
 * Check if a daily plan is complete
 */
export function isDailyPlanComplete(date: string): boolean {
  const completions = getDailyPlanCompletions();
  return completions.includes(date);
}

/**
 * Get all daily plan completion dates
 */
export function getDailyPlanCompletions(): string[] {
  const saved = localStorage.getItem(DAILY_PLAN_COMPLETION_KEY);
  if (saved) {
    try {
      return JSON.parse(saved) as string[];
    } catch {
      return [];
    }
  }
  return [];
}

/**
 * Get completion count for streak calculation
 */
export function getCompletionCount(): number {
  return getDailyPlanCompletions().length;
}

/**
 * Get the current streak based on daily plan completions
 */
export function getStreak(): number {
  const completions = getDailyPlanCompletions();
  if (completions.length === 0) return 0;

  // Sort completions in descending order
  const sorted = [...completions].sort((a, b) => b.localeCompare(a));

  let streak = 0;
  let currentDate = new Date();

  // Check if yesterday or today was completed (start streak)
  const today = currentDate.toISOString().split('T')[0];
  const yesterday = new Date(currentDate);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  // If neither today nor yesterday is completed, streak is broken
  if (!sorted.includes(today) && !sorted.includes(yesterdayStr)) {
    return 0;
  }

  // Count consecutive days
  for (let i = 0; i < 365; i++) {
    const dateStr = currentDate.toISOString().split('T')[0];
    if (sorted.includes(dateStr)) {
      streak++;
    } else if (i > 0) {
      // Allow today to be incomplete if we're checking mid-day
      break;
    }
    currentDate.setDate(currentDate.getDate() - 1);
  }

  return streak;
}

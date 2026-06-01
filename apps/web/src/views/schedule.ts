/**
 * Study Schedule View
 * Shows exam date picker, weekly schedule, and today's plan
 */

import { updateBreadcrumbs } from '../components/topbar';
import {
  getExamDate,
  setExamDate,
  getSchedule,
  getTodayPlan,
  isDailyPlanComplete,
  markDailyPlanComplete,
} from '../state/schedule';
import { getChapterInfo, getDaysUntilExam, isCramMode } from '../utils/scheduler';

export function renderSchedule() {
  updateBreadcrumbs([{ label: 'Home', route: 'home' }, { label: 'Study Schedule' }]);

  const content = document.getElementById('content');
  if (!content) return;

  const examDate = getExamDate();
  const schedule = getSchedule();

  content.innerHTML = `
    <div class="schedule-container">
      <div class="schedule-header">
        <h1>Study Schedule</h1>
        <p class="schedule-subtitle">
          ${examDate ? 'Your personalized study plan based on exam date' : 'Set your exam date to generate a study plan'}
        </p>
      </div>

      ${!examDate ? renderExamDateSetup() : renderScheduleContent(examDate, schedule)}
    </div>
  `;

  attachScheduleListeners();
}

function renderExamDateSetup(): string {
  const today = new Date().toISOString().split('T')[0];
  // Default to 12 weeks from now
  const defaultDate = new Date();
  defaultDate.setDate(defaultDate.getDate() + 84);
  const defaultValue = defaultDate.toISOString().split('T')[0];

  return `
    <div class="schedule-setup-card">
      <h2>Set Your Exam Date</h2>
      <p>
        Enter your expected exam date to generate a personalized study schedule.
        The plan will adjust based on how much time you have available.
      </p>

      <div class="date-input-group">
        <label for="exam-date-input">Exam Date</label>
        <input
          type="date"
          id="exam-date-input"
          value="${defaultValue}"
          min="${today}"
        />
        <button class="schedule-btn schedule-btn-primary" id="save-exam-date">
          Generate Schedule
        </button>
      </div>

      <div class="schedule-info-cards">
        <div class="info-card">
          <h3>📅 Daily Plans</h3>
          <p>Each day shows which chapters to study, flashcards to review, and practice questions.</p>
        </div>
        <div class="info-card">
          <h3>🔥 Streak Tracking</h3>
          <p>Complete your daily plan to build and maintain your study streak.</p>
        </div>
        <div class="info-card">
          <h3>📚 Smart Pacing</h3>
          <p>High-priority chapters scheduled first. Review weeks built in before exam.</p>
        </div>
      </div>
    </div>
  `;
}

function renderScheduleContent(examDate: number, schedule: ReturnType<typeof getSchedule>): string {
  if (!schedule) return '';

  const daysUntil = getDaysUntilExam(examDate);
  const cramMode = isCramMode(examDate);
  const todayPlan = getTodayPlan();
  const today = new Date().toISOString().split('T')[0];
  const todayComplete = isDailyPlanComplete(today);

  return `
    <div class="schedule-status-bar">
      <div class="status-item">
        <span class="status-label">Exam Date</span>
        <span class="status-value">${new Date(examDate).toLocaleDateString()}</span>
      </div>
      <div class="status-item">
        <span class="status-label">Days Until Exam</span>
        <span class="status-value ${cramMode ? 'cram-mode' : ''}">${daysUntil}</span>
      </div>
      <div class="status-item">
        <span class="status-label">Mode</span>
        <span class="status-value mode-badge ${cramMode ? 'cram' : 'normal'}">
          ${cramMode ? '🔥 CRAM' : '📚 STANDARD'}
        </span>
      </div>
      <button class="schedule-btn schedule-btn-outline" id="change-exam-date">
        Change Date
      </button>
    </div>

    ${todayPlan ? renderTodayPlanCard(todayPlan, todayComplete) : ''}

    <div class="schedule-weeks-container">
      <h2>Weekly Schedule</h2>
      ${schedule.weeklyPlans.map(week => renderWeekCard(week)).join('')}
    </div>
  `;
}

function renderTodayPlanCard(plan: ReturnType<typeof getTodayPlan>, isComplete: boolean): string {
  const chapterInfos =
    plan?.newChapters
      .map(id => getChapterInfo(id))
      .filter((c): c is NonNullable<ReturnType<typeof getChapterInfo>> => Boolean(c)) || [];

  return `
    <div class="daily-plan-card ${isComplete ? 'complete' : ''}">
      <div class="plan-header">
        <div>
          <h3>📋 Today's Plan — ${new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}</h3>
          <p class="plan-focus">${plan?.focus || 'Study Day'}</p>
        </div>
        ${isComplete ? '<span class="plan-complete-badge">✓ Complete</span>' : ''}
      </div>

      <div class="plan-tasks">
        ${
          chapterInfos.length > 0
            ? `
          <div class="plan-task">
            <span class="task-icon">📖</span>
            <div class="task-content">
              <strong>New Chapters</strong>
              <p>${chapterInfos.map(c => c.id.replace('-', ' ').toUpperCase()).join(', ')}</p>
              <span class="task-time">${chapterInfos.reduce((sum, c) => sum + c.estHours, 0)} hours estimated</span>
            </div>
          </div>
        `
            : ''
        }

        ${
          plan?.reviewQuiz
            ? `
          <div class="plan-task">
            <span class="task-icon">📝</span>
            <div class="task-content">
              <strong>Review Quiz</strong>
              <p>${plan.reviewQuiz.questionCount} questions on ${plan.reviewQuiz.chapterId.replace('-', ' ').toUpperCase()}</p>
            </div>
          </div>
        `
            : ''
        }

        ${
          plan?.isSundayReview
            ? `
          <div class="plan-task">
            <span class="task-icon">🔄</span>
            <div class="task-content">
              <strong>Weekly Review</strong>
              <p>Catch up on missed material and review weak areas</p>
            </div>
          </div>
        `
            : ''
        }

        ${
          !plan?.newChapters.length && !plan?.reviewQuiz && !plan?.isSundayReview
            ? `
          <div class="plan-task">
            <span class="task-icon">⏸</span>
            <div class="task-content">
              <strong>Rest Day</strong>
              <p>Use this time to rest or catch up if needed</p>
            </div>
          </div>
        `
            : ''
        }
      </div>

      ${
        !isComplete
          ? `
        <button class="schedule-btn schedule-btn-primary plan-complete-btn" data-today="${new Date().toISOString().split('T')[0]}">
          ✓ Mark Today's Plan Complete
        </button>
      `
          : ''
      }
    </div>
  `;
}

function renderWeekCard(
  week: NonNullable<ReturnType<typeof getSchedule>>['weeklyPlans'][0]
): string {
  return `
    <div class="schedule-week ${week.isReviewWeek ? 'review-week' : ''}">
      <div class="week-header">
        <div>
          <h3>Week ${week.weekNumber}: ${week.focus}</h3>
          <p class="week-dates">
            ${new Date(week.startDate).toLocaleDateString()} — ${new Date(week.endDate).toLocaleDateString()}
          </p>
        </div>
        <span class="week-badge">${week.isReviewWeek ? 'REVIEW' : 'CONTENT'}</span>
      </div>

      <div class="week-days">
        ${week.dailyPlans.map(day => renderDayCard(day)).join('')}
      </div>
    </div>
  `;
}

function renderDayCard(day: {
  date: string;
  newChapters: string[];
  isSundayReview: boolean;
}): string {
  const isToday = day.date === new Date().toISOString().split('T')[0];
  const chapterInfos = day.newChapters
    .map((id: string) => getChapterInfo(id))
    .filter((c): c is NonNullable<ReturnType<typeof getChapterInfo>> => Boolean(c));
  const date = new Date(day.date);
  const dateStr = date.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  return `
    <div class="schedule-day ${isToday ? 'today' : ''}">
      <div class="day-header">
        <span class="day-date">${dateStr}</span>
        ${isToday ? '<span class="today-badge">Today</span>' : ''}
      </div>
      <div class="day-content">
        ${
          chapterInfos.length > 0
            ? chapterInfos
                .map(c => `<span class="chapter-tag">${c.id.split('-')[0]}</span>`)
                .join('')
            : day.isSundayReview
              ? '<span class="review-tag">🔄 Review</span>'
              : '<span class="free-tag">Free</span>'
        }
      </div>
    </div>
  `;
}

function attachScheduleListeners() {
  // Save exam date button
  const saveBtn = document.getElementById('save-exam-date');
  if (saveBtn) {
    saveBtn.addEventListener('click', () => {
      const input = document.getElementById('exam-date-input') as HTMLInputElement;
      if (input?.value) {
        const timestamp = new Date(input.value).getTime();
        setExamDate(timestamp);
        renderSchedule(); // Re-render with new schedule
      }
    });
  }

  // Change exam date button
  const changeBtn = document.getElementById('change-exam-date');
  if (changeBtn) {
    changeBtn.addEventListener('click', () => {
      renderSchedule(); // Re-render to show date picker
    });
  }

  // Mark today complete button
  const completeBtn = document.querySelector('.plan-complete-btn');
  if (completeBtn) {
    completeBtn.addEventListener('click', () => {
      const today = new Date().toISOString().split('T')[0];
      markDailyPlanComplete(today);
      renderSchedule(); // Re-render to show complete state
    });
  }
}

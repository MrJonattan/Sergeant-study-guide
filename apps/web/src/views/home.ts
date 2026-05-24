/**
 * Home view - Dashboard with stats and progress
 */

import { getStreak, getTotalStudyTime, getCompletedChapters } from '../state/progress';
import { updateBreadcrumbs } from '../components/topbar';

// Detect touch devices using CSS media query
const isTouchDevice = () => window.matchMedia('(pointer: coarse)').matches;

export function renderHome() {
  updateBreadcrumbs([{ label: 'Home' }]);

  const content = document.getElementById('content');
  if (!content) return;

  const streak = getStreak();
  const totalTime = getTotalStudyTime();
  const completed = getCompletedChapters();
  const totalChapters = 28;

  const hours = Math.floor(totalTime / 3600);
  const minutes = Math.floor((totalTime % 3600) / 60);

  // Check if dashboard is empty (no progress yet)
  const isEmptyDashboard = streak === 0 && completed === 0 && totalTime === 0;

  content.innerHTML = `
    ${isEmptyDashboard ? renderEmptyStateCTA() : renderStatsGrid(streak, completed, totalChapters, hours, minutes)}

    <div class="card search-quick-card" style="cursor: pointer;" data-navigate="search">
      <div class="card-header">🔍 Search</div>
      <div class="card-body">Find chapters, key terms, and questions</div>
      ${renderSearchHint()}
    </div>

    <h2>Quick Actions</h2>
    <div class="card" style="cursor: pointer;" data-navigate="quiz">
      <div class="card-header">⚡ Quick Quiz</div>
      <div class="card-body">10 random questions for fast practice</div>
    </div>

    <div class="card" style="cursor: pointer;" data-navigate="exam">
      <div class="card-header">📝 Practice Exam</div>
      <div class="card-body">Full 140-question timed exam</div>
    </div>

    <div class="card" style="cursor: pointer;" data-navigate="weak">
      <div class="card-header">📊 Weak Areas</div>
      <div class="card-body">Review chapters where you scored lowest</div>
    </div>

    <h2>Recent Activity</h2>
    <p style="opacity: 0.6; font-style: italic;">Start studying to see your activity here.</p>
  `;

  // Add click handlers for cards
  content.querySelectorAll('.card[data-navigate]').forEach(card => {
    card.addEventListener('click', () => {
      const route = card.getAttribute('data-navigate');
      if (route) {
        window.location.hash = route;
      }
    });
  });

  // Add handler for CTA button if present
  const ctaBtn = content.querySelector('#start-chapter-cta');
  if (ctaBtn) {
    ctaBtn.addEventListener('click', () => {
      window.location.hash = 'chapter/200-general';
    });
  }
}

function renderEmptyStateCTA(): string {
  return `
    <div class="empty-state-card" style="text-align: center; padding: 3rem 1.5rem; border: var(--rule); border-radius: 12px; background: var(--bg); margin: 1.5rem 0;">
      <div style="font-size: 3rem; margin-bottom: 1rem;">📚</div>
      <h2 style="font-family: var(--font-display); font-size: 1.5rem; margin-bottom: 0.5rem;">Welcome to Your Study Guide</h2>
      <p style="font-family: var(--font-body); font-size: 1rem; opacity: 0.8; margin-bottom: 1.5rem; line-height: 1.6;">
        Start your preparation with Chapter 200 — General Principles. Build your knowledge step by step.
      </p>
      <button id="start-chapter-cta" class="cta-primary-btn" style="font-family: var(--font-mono); font-size: 0.85rem; font-weight: 600; padding: 0.875rem 2rem; border: var(--rule-thin); border-radius: 8px; background: var(--fg); color: var(--bg); cursor: pointer; text-transform: uppercase; letter-spacing: 0.05em; min-height: 48px;">
        Start Chapter 200
      </button>
    </div>
  `;
}

function renderStatsGrid(
  streak: number,
  completed: number,
  totalChapters: number,
  hours: number,
  minutes: number
): string {
  return `
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-value">🔥 ${streak}</div>
        <div class="stat-label">Day Streak</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">📚 ${completed}/${totalChapters}</div>
        <div class="stat-label">Chapters Done</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">⏱️ ${hours} hr ${minutes} min</div>
        <div class="stat-label">Study Time</div>
      </div>
    </div>
  `;
}

function renderSearchHint(): string {
  // Hide keyboard hint on touch devices
  if (isTouchDevice()) {
    return '';
  }
  return '<div class="search-shortcut-hint">Press Ctrl+K</div>';
}

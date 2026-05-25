/**
 * Home view - Dashboard with stats and progress
 */

import { appState } from '../main';
import {
  getStreak,
  getTotalStudyTime,
  getCompletedChapters,
  getRecentResumeChapter,
  hasCompletedDiagnostic,
} from '../state/progress';
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

  // Find chapter to resume (takes precedence over everything)
  const resumeChapter = getRecentResumeChapter();
  const resumeCard = resumeChapter ? renderResumeCard(resumeChapter) : '';

  // Diagnostic prompt (shown if no resume card and diagnostic not completed)
  const diagnosticPrompt = !resumeCard && !hasCompletedDiagnostic() ? renderDiagnosticPrompt() : '';

  // Check if dashboard is empty (no progress yet) - only if no resume card and no diagnostic prompt
  const isEmptyDashboard =
    !resumeCard && !diagnosticPrompt && streak === 0 && completed === 0 && totalTime === 0;

  content.innerHTML = `
    ${resumeCard}
    ${diagnosticPrompt}
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

  // Add handler for Resume Continue button if present
  const resumeBtn = content.querySelector('#resume-chapter-btn');
  if (resumeBtn) {
    resumeBtn.addEventListener('click', () => {
      if (resumeChapter) {
        window.location.hash = `chapter/${resumeChapter.chapterId}`;
      }
    });
  }

  // Add handler for Diagnostic buttons if present
  const diagnosticTakeBtn = content.querySelector('#diagnostic-take-btn');
  if (diagnosticTakeBtn) {
    diagnosticTakeBtn.addEventListener('click', () => {
      window.location.hash = 'diagnostic';
    });
  }

  const diagnosticSkipBtn = content.querySelector('#diagnostic-skip-btn');
  if (diagnosticSkipBtn) {
    diagnosticSkipBtn.addEventListener('click', () => {
      import('../state/progress').then(({ skipDiagnostic }) => {
        skipDiagnostic();
        renderHome();
      });
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

function renderResumeCard(chapterProgress: ReturnType<typeof getRecentResumeChapter>): string {
  if (!chapterProgress || !chapterProgress.lastSectionId) {
    return '';
  }

  // Find chapter title from appState
  const chapter = appState.data?.chapters.find(
    (c: { id: string }) => c.id === chapterProgress.chapterId
  );
  if (!chapter) {
    return '';
  }

  // Extract section number from chapter.sectionNum (e.g., "208" from "208-arrests")
  const chapterNum = chapter.sectionNum || chapterProgress.chapterId.replace(/\D/g, '').slice(0, 3);

  // Format section display (e.g., "§01" from lastSectionId)
  const sectionDisplay = chapterProgress.lastSectionId
    ? `§${chapterProgress.lastSectionId.slice(-2)}`
    : '';

  return `
    <div class="resume-card" style="border: 2px solid var(--fg); border-radius: 12px; padding: 1.5rem 2rem; background: linear-gradient(135deg, var(--bg) 0%, var(--bg-muted) 100%); margin: 1.5rem 0; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
      <div style="display: flex; align-items: center; justify-content: space-between; gap: 1.5rem; flex-wrap: wrap;">
        <div style="flex: 1; min-width: 200px;">
          <div style="font-family: var(--font-mono); font-size: 0.65rem; text-transform: uppercase; letter-spacing: 0.1em; opacity: 0.7; margin-bottom: 0.5rem;">Continue Where You Left Off</div>
          <h2 style="font-family: var(--font-display); font-size: 1.25rem; margin: 0 0 0.25rem 0;">Resume: Ch ${chapterNum} ${sectionDisplay} — ${chapter.title}</h2>
          <p style="font-family: var(--font-body); font-size: 0.9rem; opacity: 0.8; margin: 0;">Pick up from your last study session</p>
        </div>
        <button id="resume-chapter-btn" class="resume-continue-btn" style="font-family: var(--font-mono); font-size: 0.85rem; font-weight: 600; padding: 0.875rem 2rem; border: var(--rule-thin); border-radius: 8px; background: var(--fg); color: var(--bg); cursor: pointer; text-transform: uppercase; letter-spacing: 0.05em; min-height: 48px; white-space: nowrap;">
          Continue
        </button>
      </div>
    </div>
  `;
}

function renderDiagnosticPrompt(): string {
  return `
    <div class="diagnostic-prompt-card" style="border: 2px solid var(--fg); border-radius: 12px; padding: 1.5rem 2rem; background: var(--bg-muted); margin: 1.5rem 0;">
      <div style="display: flex; align-items: center; justify-content: space-between; gap: 1.5rem; flex-wrap: wrap;">
        <div style="flex: 1; min-width: 200px;">
          <div style="font-family: var(--font-mono); font-size: 0.65rem; text-transform: uppercase; letter-spacing: 0.1em; opacity: 0.7; margin-bottom: 0.5rem;">Baseline Assessment</div>
          <h2 style="font-family: var(--font-display); font-size: 1.25rem; margin: 0 0 0.25rem 0;">Take Diagnostic Test</h2>
          <p style="font-family: var(--font-body); font-size: 0.9rem; opacity: 0.8; margin: 0;">30 questions to identify your strengths and weaknesses</p>
        </div>
        <div style="display: flex; gap: 0.75rem; flex-wrap: wrap;">
          <button id="diagnostic-take-btn" class="cta-primary-btn" style="font-family: var(--font-mono); font-size: 0.85rem; font-weight: 600; padding: 0.875rem 2rem; border: var(--rule-thin); border-radius: 8px; background: var(--fg); color: var(--bg); cursor: pointer; text-transform: uppercase; letter-spacing: 0.05em; min-height: 48px;">
            Take Test
          </button>
          <button id="diagnostic-skip-btn" class="cta-secondary-btn" style="font-family: var(--font-mono); font-size: 0.85rem; font-weight: 600; padding: 0.875rem 2rem; border: var(--rule-thin); border-radius: 8px; background: transparent; color: var(--fg); cursor: pointer; text-transform: uppercase; letter-spacing: 0.05em; min-height: 48px;">
            Skip
          </button>
        </div>
      </div>
    </div>
  `;
}

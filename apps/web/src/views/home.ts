/**
 * Home view - Dashboard with stats and progress
 */

import { getStreak, getTotalStudyTime, getCompletedChapters } from '../state/progress';
import { updateBreadcrumbs } from '../components/topbar';

interface AppState {
  data: {
    chapters: Array<{ id: string; title: string; questions: unknown[] }>;
    examQuestions: unknown[];
  };
}

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

  content.innerHTML = `
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
        <div class="stat-value">⏱️ ${hours}h ${minutes}m</div>
        <div class="stat-label">Study Time</div>
      </div>
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
}

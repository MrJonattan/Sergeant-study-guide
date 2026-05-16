/**
 * Weak Areas view - Chapters with lowest quiz scores
 */

import { updateBreadcrumbs } from '../components/topbar';
import { appState } from '../main';
import { getProgress } from '../state/progress';

interface ChapterScore {
  chapterId: string;
  chapterTitle: string;
  sectionNum: string;
  correctAnswers: number;
  totalQuestions: number;
  percentage: number;
  quizAttempts: number;
}

export function renderWeakAreas() {
  updateBreadcrumbs([{ label: 'Home', route: 'home' }, { label: 'Weak Areas' }]);

  const content = document.getElementById('content');
  if (!content || !appState.data) return;

  const scores = calculateChapterScores();
  const sortedScores = scores.sort((a, b) => a.percentage - b.percentage);

  content.innerHTML = `
    <div class="weak-areas-container">
      <div class="weak-areas-header">
        <h1>Weak Areas</h1>
        <p class="weak-areas-subtitle">Focus on chapters where you need more practice</p>
      </div>

      ${
        sortedScores.length === 0
          ? `
        <div class="empty-state">
          <h2>No Quiz Data Yet</h2>
          <p>Take some quizzes to see your weak areas highlighted here.</p>
          <button class="fc-btn fc-btn-primary" onclick="window.location.hash='quiz'">
            Take a Quiz
          </button>
        </div>
      `
          : `
        <div class="weak-areas-stats">
          <div class="wa-stat">
            <div class="wa-stat-value">${sortedScores.filter(s => s.percentage >= 70).length}</div>
            <div class="wa-stat-label">Mastered (≥70%)</div>
          </div>
          <div class="wa-stat">
            <div class="wa-stat-value">${sortedScores.filter(s => s.percentage < 70 && s.percentage >= 50).length}</div>
            <div class="wa-stat-label">Needs Review</div>
          </div>
          <div class="wa-stat">
            <div class="wa-stat-value">${sortedScores.filter(s => s.percentage < 50).length}</div>
            <div class="wa-stat-label">Critical (<50%)</div>
          </div>
        </div>

        <div class="weak-areas-list">
          ${sortedScores
            .map(
              score => `
            <div class="wa-chapter-card ${score.percentage < 50 ? 'critical' : score.percentage < 70 ? 'warning' : 'good'}">
              <div class="wa-chapter-header">
                <div class="wa-chapter-info">
                  <span class="wa-chapter-num">${score.sectionNum}</span>
                  <span class="wa-chapter-title">${score.chapterTitle}</span>
                </div>
                <div class="wa-chapter-score">
                  <span class="wa-score-value">${score.percentage}%</span>
                  <span class="wa-score-label">${getScoreLabel(score.percentage)}</span>
                </div>
              </div>
              <div class="wa-progress-bar">
                <div class="wa-progress-fill" style="width: ${score.percentage}%"></div>
              </div>
              <div class="wa-chapter-stats">
                <span class="wa-stat-item">${score.correctAnswers}/${score.totalQuestions} correct</span>
                <span class="wa-stat-item">${score.quizAttempts} quiz${score.quizAttempts !== 1 ? 'zes' : 'z'} taken</span>
              </div>
              <div class="wa-chapter-actions">
                <button class="wa-btn" data-chapter="${score.chapterId}">
                  Study Chapter
                </button>
                <button class="wa-btn wa-btn-outline" data-chapter-quiz="${score.chapterId}">
                  Practice Quiz
                </button>
              </div>
            </div>
          `
            )
            .join('')}
        </div>
      `
      }
    </div>
  `;

  // Add event listeners
  content.querySelectorAll('[data-chapter]').forEach(btn => {
    btn.addEventListener('click', () => {
      const chapterId = btn.getAttribute('data-chapter');
      window.location.hash = `chapter/${chapterId}`;
    });
  });

  content.querySelectorAll('[data-chapter-quiz]').forEach(btn => {
    btn.addEventListener('click', () => {
      // Could filter quiz to specific chapter
      window.location.hash = 'quiz';
    });
  });
}

function calculateChapterScores(): ChapterScore[] {
  if (!appState.data) return [];

  const scores: ChapterScore[] = [];

  appState.data.chapters.forEach(chapter => {
    const chapterProgress = getProgress(chapter.id);
    const quizHistory = chapterProgress?.quizHistory || [];

    // Calculate average score from quiz history
    let correctAnswers = 0;
    let totalQuestions = 0;
    let attempts = quizHistory.length;

    if (attempts > 0) {
      quizHistory.forEach(quiz => {
        correctAnswers += quiz.correctAnswers;
        totalQuestions += quiz.totalQuestions;
      });
    } else {
      // No quiz history - use chapter questions directly
      totalQuestions = chapter.questions?.length || 0;
      correctAnswers = 0;
      attempts = 0;
    }

    const percentage = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;

    scores.push({
      chapterId: chapter.id,
      chapterTitle: chapter.title,
      sectionNum: chapter.sectionNum,
      correctAnswers,
      totalQuestions,
      percentage,
      quizAttempts: attempts,
    });
  });

  // Filter out chapters with no quiz attempts and no questions
  return scores.filter(s => s.quizAttempts > 0 || s.totalQuestions > 0);
}

function getScoreLabel(percentage: number): string {
  if (percentage >= 90) return 'Excellent';
  if (percentage >= 80) return 'Good';
  if (percentage >= 70) return 'Passing';
  if (percentage >= 50) return 'Review';
  return 'Critical';
}

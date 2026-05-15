/**
 * Quick Quiz view - 10 random questions
 */

import { updateBreadcrumbs } from '../components/topbar';

export function renderQuiz() {
  updateBreadcrumbs([
    { label: 'Home', route: 'home' },
    { label: 'Quick Quiz' },
  ]);

  const content = document.getElementById('content');
  if (!content) return;

  content.innerHTML = `
    <h1>Quick Quiz</h1>
    <p>10 random questions for fast practice drill.</p>
    <div id="quiz-container">
      <p>Quiz functionality coming soon...</p>
    </div>
  `;
}

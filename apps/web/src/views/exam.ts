/**
 * Practice Exam view - Full 140-question timed exam
 */

import { updateBreadcrumbs } from '../components/topbar';

export function renderExam() {
  updateBreadcrumbs([
    { label: 'Home', route: 'home' },
    { label: 'Practice Exam' },
  ]);

  const content = document.getElementById('content');
  if (!content) return;

  content.innerHTML = `
    <h1>Practice Exam</h1>
    <p>Full 140-question timed exam simulating test conditions.</p>
    <div id="exam-container">
      <p>Exam functionality coming soon...</p>
    </div>
  `;
}

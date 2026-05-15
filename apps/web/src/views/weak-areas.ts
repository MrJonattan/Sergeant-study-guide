/**
 * Weak Areas view - Chapters with lowest scores
 */

import { updateBreadcrumbs } from '../components/topbar';

export function renderWeakAreas() {
  updateBreadcrumbs([
    { label: 'Home', route: 'home' },
    { label: 'Weak Areas' },
  ]);

  const content = document.getElementById('content');
  if (!content) return;

  content.innerHTML = `
    <h1>Weak Areas</h1>
    <p>Review chapters where you scored lowest.</p>
    <div id="weak-areas-container">
      <p>Weak areas analysis coming soon...</p>
    </div>
  `;
}

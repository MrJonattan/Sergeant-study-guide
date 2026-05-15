/**
 * Cheat Sheet view - Sergeant Focus categories
 */

import { updateBreadcrumbs } from '../components/topbar';

export function renderCheatSheet() {
  updateBreadcrumbs([
    { label: 'Home', route: 'home' },
    { label: 'Cheat Sheet' },
  ]);

  const content = document.getElementById('content');
  if (!content) return;

  content.innerHTML = `
    <h1>Cheat Sheet</h1>
    <p>Quick reference for Sergeant Focus topics.</p>
    <div id="cheatsheet-container">
      <p>Cheat sheet content coming soon...</p>
    </div>
  `;
}

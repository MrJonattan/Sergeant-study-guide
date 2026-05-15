/**
 * Sergeant Focus view - All supervisor callouts
 */

import { updateBreadcrumbs } from '../components/topbar';

export function renderSergeantFocus() {
  updateBreadcrumbs([
    { label: 'Home', route: 'home' },
    { label: 'Sergeant Focus' },
  ]);

  const content = document.getElementById('content');
  if (!content) return;

  content.innerHTML = `
    <h1>Sergeant Focus</h1>
    <p>Supervisor-specific responsibilities across all chapters.</p>
    <div id="sergeant-container">
      <p>Sergeant Focus content coming soon...</p>
    </div>
  `;
}

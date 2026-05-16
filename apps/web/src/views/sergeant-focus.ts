/**
 * Sergeant Focus view - All supervisor callouts with source references
 */

import { updateBreadcrumbs } from '../components/topbar';
import { appState } from '../main';

interface SergeantFocus {
  filename: string;
  text: string;
  category?: string;
}

interface Chapter {
  id: string;
  sectionNum: string;
  title: string;
  sergeantFocus: SergeantFocus[];
}

export function renderSergeantFocus() {
  updateBreadcrumbs([{ label: 'Home', route: 'home' }, { label: 'Sergeant Focus' }]);

  const content = document.getElementById('content');
  if (!content || !appState.data) return;

  // Collect all sergeant focus callouts grouped by chapter
  const chaptersWithCallouts = appState.data.chapters.filter(
    (c: Chapter) => c.sergeantFocus && c.sergeantFocus.length > 0
  );

  content.innerHTML = `
    <div class="sergeant-focus-container">
      <div class="sergeant-focus-header">
        <h1>Sergeant Focus</h1>
        <p class="sergeant-focus-subtitle">Supervisor-specific responsibilities and key considerations across all chapters</p>
      </div>

      <div class="sergeant-focus-stats">
        <div class="stat-card">
          <div class="stat-value">${chaptersWithCallouts.length}</div>
          <div class="stat-label">Chapters</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${chaptersWithCallouts.reduce((sum: number, c: Chapter) => sum + c.sergeantFocus.length, 0)}</div>
          <div class="stat-label">Callouts</div>
        </div>
      </div>

      <div class="sergeant-focus-controls">
        <button class="expand-collapse-btn" id="expand-all">Expand All</button>
        <button class="expand-collapse-btn" id="collapse-all">Collapse All</button>
      </div>

      <div class="sergeant-focus-content">
        ${chaptersWithCallouts.map((chapter: Chapter, index: number) => renderChapter(chapter, index)).join('')}
      </div>
    </div>
  `;

  // Add event listeners for expand/collapse buttons
  const expandAllBtn = document.getElementById('expand-all');
  const collapseAllBtn = document.getElementById('collapse-all');

  expandAllBtn?.addEventListener('click', () => {
    document.querySelectorAll('.sergeant-focus-details').forEach(details => {
      (details as HTMLDetailsElement).open = true;
    });
  });

  collapseAllBtn?.addEventListener('click', () => {
    document.querySelectorAll('.sergeant-focus-details').forEach(details => {
      (details as HTMLDetailsElement).open = false;
    });
  });
}

/**
 * Extract section number from filename (e.g., "section-208-01.md" → "208-01")
 * and format as P.G. or A.G. reference based on section number
 */
function getSourceReference(
  filename: string,
  chapterSectionNum: string
): {
  displayName: string;
  sourceType: 'PG' | 'AG';
} {
  // Extract section number from filename like "section-208-01.md" or "section-208-dat.md"
  const match = filename.match(/section-(\d{3})-(?:0?(\d+)|([a-z0-9-]+))\.md/);

  if (!match) {
    return {
      displayName: `P.G. ${chapterSectionNum}`,
      sourceType: 'PG',
    };
  }

  const sectionNum = match[1]; // e.g., "208"
  const subsection = match[2] || match[3]; // e.g., "01" or "dat"

  // 200-series = Patrol Guide, 300-series = Administrative Guide
  const sourceType: 'PG' | 'AG' = sectionNum.startsWith('2') ? 'PG' : 'AG';
  const guideName = sourceType === 'PG' ? 'P.G.' : 'A.G.';

  // Format: P.G. 208-01 or A.G. 330-03
  const displayName = `${guideName} ${sectionNum}-${subsection}`;

  return { displayName, sourceType };
}

function renderChapter(chapter: Chapter, index: number): string {
  const isExpanded = index < 3; // Expand first 3 chapters by default

  return `
    <section class="sergeant-focus-chapter">
      <details class="sergeant-focus-details" ${isExpanded ? 'open' : ''}>
        <summary class="sergeant-focus-summary">
          <span class="chapter-num">${chapter.sectionNum}</span>
          <span class="chapter-title">${chapter.title}</span>
          <span class="callout-count">${chapter.sergeantFocus.length} callout${chapter.sergeantFocus.length !== 1 ? 's' : ''}</span>
          <span class="expand-icon">+</span>
        </summary>
        <div class="sergeant-focus-callouts">
          ${chapter.sergeantFocus
            .map(callout => {
              const source = getSourceReference(callout.filename, chapter.sectionNum);
              return `
              <div class="callout callout-sergeant">
                <div class="sergeant-focus-header-row">
                  <div class="callout-title">Sergeant Focus</div>
                  <span class="source-badge source-${source.sourceType.toLowerCase()}">${source.displayName}</span>
                </div>
                <p>${callout.text}</p>
              </div>
            `;
            })
            .join('')}
        </div>
      </details>
    </section>
  `;
}

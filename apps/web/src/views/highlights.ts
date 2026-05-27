/**
 * Highlights view - Lists all highlights grouped by chapter
 */

import { getAllHighlights, removeHighlight } from '../state/highlights';
import { navigateTo } from '../utils/router';

export function renderHighlights() {
  const content = document.getElementById('content');
  if (!content) return;

  const highlights = getAllHighlights();

  // Group highlights by chapter
  const byChapter = new Map<string, typeof highlights>();
  for (const highlight of highlights) {
    const existing = byChapter.get(highlight.chapterId) || [];
    existing.push(highlight);
    byChapter.set(highlight.chapterId, existing);
  }

  // Sort highlights within each chapter by createdAt descending
  for (const [, chapterHighlights] of byChapter) {
    chapterHighlights.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    byChapter.set(chapterId, chapterHighlights);
  }

  content.innerHTML = `
    <h1>Highlights</h1>
    <p class="highlights-intro">
      Highlight text while reading to mark important passages. Click on any highlight to remove it.
    </p>
    ${renderHighlightsList(byChapter)}
  `;

  // Attach event listeners
  attachHighlightsListeners();
}

function renderHighlightsList(byChapter: Map<string, ReturnType<typeof getAllHighlights>>) {
  if (byChapter.size === 0) {
    return `
      <div class="highlights-empty">
        <div class="empty-icon">🖍️</div>
        <h2>No highlights yet</h2>
        <p>
          While reading a chapter, select any text to show the highlight toolbar.
          Tap the yellow highlight button to mark the text.
        </p>
      </div>
    `;
  }

  let html = '<div class="highlights-list">';

  for (const [, chapterHighlights] of byChapter) {
    const chapterTitle = chapterHighlights[0]?.chapterId.split('-').pop()?.toUpperCase() || '';
    const chapterNum = chapterHighlights[0]?.chapterId.split('-').pop()?.toUpperCase() || '';

    html += `
      <div class="highlights-chapter-group">
        <h2 class="highlights-chapter-title">${chapterNum} — ${chapterTitle}</h2>
        <ul class="highlights-items">
          ${chapterHighlights.map(highlight => renderHighlightItem(highlight)).join('')}
        </ul>
      </div>
    `;
  }

  html += '</div>';
  return html;
}

function renderHighlightItem(highlight: ReturnType<typeof getAllHighlights>[0]) {
  const daysAgo = getRelativeTime(highlight.createdAt);

  return `
    <li class="highlight-item" data-highlight-id="${escapeHtml(highlight.id)}">
      <div class="highlight-content" data-chapter-id="${escapeHtml(highlight.chapterId)}">
        <div class="highlight-header">
          <span class="highlight-section-title">${escapeHtml(highlight.sectionFilename.replace('section-', '').replace('.md', ''))}</span>
          <span class="highlight-time">${daysAgo}</span>
        </div>
        <blockquote class="highlight-text">
          ${highlight.contextBefore && highlight.contextBefore.length > 0 ? `<span class="highlight-context-before">…${escapeHtml(highlight.contextBefore)}</span>` : ''}
          <mark class="hl-yellow">${escapeHtml(highlight.text)}</mark>
          ${highlight.contextAfter && highlight.contextAfter.length > 0 ? `<span class="highlight-context-after">${escapeHtml(highlight.contextAfter)}…</span>` : ''}
        </blockquote>
      </div>
      <button class="highlight-remove-btn" data-highlight-id="${escapeHtml(highlight.id)}" aria-label="Remove highlight">
        ✕
      </button>
    </li>
  `;
}

function getRelativeTime(isoString: string): string {
  const now = Date.now();
  const then = new Date(isoString).getTime();
  const diffMs = now - then;
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSeconds < 60) {
    return 'Just now';
  } else if (diffMinutes < 60) {
    return `${diffMinutes}m ago`;
  } else if (diffHours < 24) {
    return `${diffHours}h ago`;
  } else if (diffDays < 7) {
    return `${diffDays}d ago`;
  } else {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function attachHighlightsListeners() {
  // Remove button handlers
  document.querySelectorAll('.highlight-remove-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const id = btn.getAttribute('data-highlight-id');
      if (id) {
        removeHighlight(id);
        renderHighlights(); // Re-render to show updated list
      }
    });
  });

  // Click to navigate handlers
  document.querySelectorAll('.highlight-content').forEach(item => {
    item.addEventListener('click', () => {
      const chapterId = item.getAttribute('data-chapter-id');
      if (chapterId) {
        navigateTo(`chapter/${chapterId}`);

        // Scroll to highlight after render
        setTimeout(() => {
          const highlightId = item.getAttribute('data-highlight-id');
          if (highlightId) {
            const markEl = document.querySelector(`[data-highlight-id="${highlightId}"]`);
            if (markEl) {
              markEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
          }
        }, 500);
      }
    });
  });
}

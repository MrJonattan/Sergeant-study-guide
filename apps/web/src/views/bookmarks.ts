/**
 * Bookmarks view - Lists all bookmarks grouped by chapter
 */

import { getAllBookmarks, removeBookmark } from '../state/bookmarks';
import { navigateTo } from '../utils/router';

export function renderBookmarks() {
  const content = document.getElementById('content');
  if (!content) return;

  const bookmarks = getAllBookmarks();

  // Group bookmarks by chapter
  const byChapter = new Map<string, typeof bookmarks>();
  for (const bookmark of bookmarks) {
    const existing = byChapter.get(bookmark.chapterId) || [];
    existing.push(bookmark);
    byChapter.set(bookmark.chapterId, existing);
  }

  // Sort bookmarks within each chapter by addedAt descending
  for (const [, chapterBookmarks] of byChapter) {
    chapterBookmarks.sort((a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime());
    byChapter.set(chapterId, chapterBookmarks);
  }

  content.innerHTML = `
    <h1>Bookmarks</h1>
    <p class="bookmarks-intro">
      Bookmark sections and callouts while studying to quickly return to them later.
    </p>
    ${renderBookmarksList(byChapter)}
  `;

  // Attach event listeners
  attachBookmarksListeners();
}

function renderBookmarksList(byChapter: Map<string, ReturnType<typeof getAllBookmarks>>) {
  if (byChapter.size === 0) {
    return `
      <div class="bookmarks-empty">
        <div class="empty-icon">☆</div>
        <h2>No bookmarks yet</h2>
        <p>
          While reading a chapter, click the star icon (☆) next to section headings
          or callout blocks to bookmark them for quick access later.
        </p>
      </div>
    `;
  }

  let html = '<div class="bookmarks-list">';

  for (const [, chapterBookmarks] of byChapter) {
    const chapterTitle = chapterBookmarks[0]?.chapterTitle || 'Unknown Chapter';
    const chapterNum = chapterBookmarks[0]?.chapterId.split('-').pop()?.toUpperCase() || '';

    html += `
      <div class="bookmarks-chapter-group">
        <h2 class="bookmarks-chapter-title">${chapterNum} — ${chapterTitle}</h2>
        <ul class="bookmarks-items">
          ${chapterBookmarks.map(bookmark => renderBookmarkItem(bookmark)).join('')}
        </ul>
      </div>
    `;
  }

  html += '</div>';
  return html;
}

function renderBookmarkItem(bookmark: ReturnType<typeof getAllBookmarks>[0]) {
  const daysAgo = getRelativeTime(bookmark.addedAt);
  const calloutSnippet = bookmark.calloutText
    ? `<p class="bookmark-callout-snippet">${escapeHtml(bookmark.calloutText)}</p>`
    : '';

  return `
    <li class="bookmark-item" data-bookmark-id="${escapeHtml(bookmark.id)}">
      <div class="bookmark-content" data-chapter-id="${escapeHtml(bookmark.chapterId)}">
        <div class="bookmark-header">
          <span class="bookmark-section-title">${escapeHtml(bookmark.sectionTitle)}</span>
          <span class="bookmark-time">${daysAgo}</span>
        </div>
        ${calloutSnippet}
      </div>
      <button class="bookmark-remove-btn" data-bookmark-id="${escapeHtml(bookmark.id)}" aria-label="Remove bookmark">
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

function attachBookmarksListeners() {
  // Remove button handlers
  document.querySelectorAll('.bookmark-remove-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const id = btn.getAttribute('data-bookmark-id');
      if (id) {
        removeBookmark(id);
        renderBookmarks(); // Re-render to show updated list
      }
    });
  });

  // Click to navigate handlers
  document.querySelectorAll('.bookmark-content').forEach(item => {
    item.addEventListener('click', () => {
      const chapterId = item.getAttribute('data-chapter-id');
      if (chapterId) {
        navigateTo(`chapter/${chapterId}`);
      }
    });
  });
}

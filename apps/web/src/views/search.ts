/**
 * Search view - Search across chapters, sections, and key terms
 */

import { updateBreadcrumbs } from '../components/topbar';
import { appState } from '../main';

interface SearchResult {
  type: 'chapter' | 'section' | 'keyterm' | 'question';
  title: string;
  chapterId: string;
  chapterTitle: string;
  snippet?: string;
  matchCount: number;
}

export function renderSearch() {
  updateBreadcrumbs([{ label: 'Home', route: 'home' }, { label: 'Search' }]);

  const content = document.getElementById('content');
  if (!content || !appState.data) return;

  content.innerHTML = `
    <div class="search-container">
      <div class="search-header">
        <h1>Search</h1>
        <p class="search-subtitle">Search across all chapters, sections, and key terms</p>
      </div>

      <div class="search-box-wrapper">
        <div class="search-box">
          <svg class="search-icon" width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M14.5 14.5L19 19M17 8.5C17 12.6421 13.6421 16 9.5 16C5.35786 16 2 12.6421 2 8.5C2 4.35786 5.35786 1 9.5 1C13.6421 1 17 4.35786 17 8.5Z" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
          <input
            type="text"
            id="search-input"
            placeholder="Search chapters, key terms, questions..."
            autocomplete="off"
          />
          <kbd>Esc</kbd>
        </div>
      </div>

      <div class="search-stats" id="search-stats" style="display: none;">
        <span id="results-count">0 results</span>
      </div>

      <div id="search-results" class="search-results"></div>
    </div>
  `;

  initSearchListeners();
}

function initSearchListeners() {
  const input = document.getElementById('search-input');
  if (!input) return;

  input.addEventListener('input', e => {
    const query = (e.target as HTMLInputElement).value.trim();
    if (query.length < 2) {
      clearResults();
      return;
    }
    performSearch(query);
  });

  // Keyboard shortcuts
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      const inputEl = document.getElementById('search-input') as HTMLInputElement;
      if (inputEl) {
        inputEl.value = '';
        clearResults();
        inputEl.blur();
      }
    }
  });
}

function performSearch(query: string) {
  if (!appState.data) return;

  const results: SearchResult[] = [];
  const lowerQuery = query.toLowerCase();

  // Search chapters
  appState.data.chapters.forEach(chapter => {
    // Search chapter title
    if (chapter.title.toLowerCase().includes(lowerQuery)) {
      results.push({
        type: 'chapter',
        title: chapter.title,
        chapterId: chapter.id,
        chapterTitle: chapter.title,
        matchCount: 1,
      });
    }

    // Search section content
    chapter.sections?.forEach(section => {
      if (section.content.toLowerCase().includes(lowerQuery)) {
        const snippet = extractSnippet(section.content, lowerQuery);
        results.push({
          type: 'section',
          title: `${chapter.title} - ${section.filename}`,
          chapterId: chapter.id,
          chapterTitle: chapter.title,
          snippet,
          matchCount: countMatches(section.content, lowerQuery),
        });
      }
    });

    // Search key terms
    if (chapter.keyTerms) {
      const terms = parseKeyTerms(chapter.keyTerms);
      terms.forEach(term => {
        if (
          term.name.toLowerCase().includes(lowerQuery) ||
          term.definition.toLowerCase().includes(lowerQuery)
        ) {
          results.push({
            type: 'keyterm',
            title: term.name,
            chapterId: chapter.id,
            chapterTitle: chapter.title,
            snippet: term.definition,
            matchCount: 1,
          });
        }
      });
    }

    // Search questions
    chapter.questions?.forEach(q => {
      if (q.text.toLowerCase().includes(lowerQuery)) {
        results.push({
          type: 'question',
          title: `Question ${q.number}`,
          chapterId: chapter.id,
          chapterTitle: chapter.title,
          snippet: q.text,
          matchCount: 1,
        });
      }
    });
  });

  // Sort by match count
  results.sort((a, b) => b.matchCount - a.matchCount);

  renderResults(results.slice(0, 50)); // Limit to 50 results
}

function extractSnippet(content: string, query: string, length: number = 150): string {
  const lowerContent = content.toLowerCase();
  const idx = lowerContent.indexOf(query);
  if (idx === -1) return content.slice(0, length) + '...';

  const start = Math.max(0, idx - 50);
  const end = Math.min(content.length, idx + length);
  const prefix = start > 0 ? '...' : '';
  const suffix = end < content.length ? '...' : '';

  return prefix + content.slice(start, end).trim() + suffix;
}

function countMatches(content: string, query: string): number {
  const regex = new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
  const matches = content.match(regex);
  return matches ? matches.length : 0;
}

function parseKeyTerms(markdown: string): Array<{ name: string; definition: string }> {
  const terms: Array<{ name: string; definition: string }> = [];
  const lines = markdown.split('\n');

  for (const line of lines) {
    const match = line.match(/\|\s*\*\*([^*]+)\*\*\s*\|\s*([^|]+)\|/);
    if (match) {
      terms.push({
        name: match[1].trim(),
        definition: match[2].trim(),
      });
    }
  }

  return terms;
}

function renderResults(results: SearchResult[]) {
  const resultsEl = document.getElementById('search-results');
  const statsEl = document.getElementById('search-stats');
  const countEl = document.getElementById('results-count');

  if (!resultsEl || !statsEl || !countEl) return;

  statsEl.style.display = 'block';
  countEl.textContent = `${results.length} result${results.length !== 1 ? 's' : ''}`;

  if (results.length === 0) {
    resultsEl.innerHTML = `
      <div class="empty-state">
        <h2>No Results Found</h2>
        <p>Try different keywords or check your spelling.</p>
      </div>
    `;
    return;
  }

  resultsEl.innerHTML = results
    .map(
      result => `
    <div class="search-result-item ${result.type}" data-chapter="${result.chapterId}">
      <div class="result-header">
        <span class="result-type-badge">${result.type}</span>
        <span class="result-chapter">${result.chapterTitle}</span>
      </div>
      <h3 class="result-title">${highlightMatch(result.title)}</h3>
      ${result.snippet ? `<p class="result-snippet">${highlightMatch(escapeHtml(result.snippet))}</p>` : ''}
    </div>
  `
    )
    .join('');

  // Add click handlers
  resultsEl.querySelectorAll('.search-result-item').forEach(item => {
    item.addEventListener('click', () => {
      const chapterId = item.getAttribute('data-chapter');
      window.location.hash = `chapter/${chapterId}`;
    });
  });
}

function highlightMatch(text: string): string {
  const input = document.getElementById('search-input') as HTMLInputElement;
  if (!input || !input.value) return text;

  const query = input.value.trim();
  const regex = new RegExp(`(${escapeRegex(query)})`, 'gi');
  return text.replace(regex, '<mark>$1</mark>');
}

function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function escapeRegex(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function clearResults() {
  const resultsEl = document.getElementById('search-results');
  const statsEl = document.getElementById('search-stats');

  if (resultsEl) resultsEl.innerHTML = '';
  if (statsEl) statsEl.style.display = 'none';
}

/**
 * Main entry point for the web app
 * Initializes the application, routing, and event listeners
 */

import { initRouter, navigateTo } from './utils/router';
import { initTheme } from './utils/theme';
import { initFontScale } from './utils/font-scale';
import { initSidebar } from './components/sidebar';
import { initTopbar } from './components/topbar';
import { renderHome } from './views/home';
import { renderChapter } from './views/chapter';
import { renderQuiz } from './views/quiz';
import { renderExam } from './views/exam';
import { renderFlashcards } from './views/flashcards';
import { renderCheatSheet } from './views/cheat-sheet';
import { renderSergeantFocus } from './views/sergeant-focus';
import { renderWeakAreas } from './views/weak-areas';
import { renderSearch } from './views/search';
import { loadStudyData } from './utils/data-loader';

// ─────────────────────────────────────────────
// Route Definitions
// ─────────────────────────────────────────────

const routes = {
  home: renderHome,
  'chapter/:id': renderChapter,
  quiz: renderQuiz,
  exam: renderExam,
  flashcards: renderFlashcards,
  cheatsheet: renderCheatSheet,
  sergeant: renderSergeantFocus,
  weak: renderWeakAreas,
  search: renderSearch,
};

// ─────────────────────────────────────────────
// Application State
// ─────────────────────────────────────────────

export const appState = {
  currentRoute: 'home',
  currentChapter: null,
  data: null,
};

// ─────────────────────────────────────────────
// Initialize App
// ─────────────────────────────────────────────

export async function initApp() {
  const content = document.getElementById('content');

  // Show loading state
  if (content) {
    content.innerHTML = `
      <div class="loading-container">
        <div class="loading-spinner"></div>
        <p class="loading-text" id="loading-status">Loading study data...</p>
        <button class="retry-btn" id="retry-btn" style="display:none;">Retry</button>
      </div>
    `;
  }

  const retryBtn = document.getElementById('retry-btn');
  retryBtn?.addEventListener('click', () => initApp());

  try {
    appState.data = await loadStudyData({
      maxRetries: 3,
      retryDelayMs: 1000,
      onProgress: status => {
        const statusEl = document.getElementById('loading-status');
        if (statusEl) statusEl.textContent = status;
      },
    });

    // Initialize components
    initTheme();
    initFontScale();
    initSidebar(appState.data.chapters);
    initTopbar();

    // Initialize router
    initRouter(routes, (route, params) => {
      appState.currentRoute = route;
      appState.currentChapter = params?.id || null;
    });

    // Handle keyboard shortcuts
    initKeyboardShortcuts();

    // Navigate to initial route
    const hash = window.location.hash.slice(1) || 'home';
    navigateTo(hash);
  } catch (err) {
    const statusEl = document.getElementById('loading-status');
    if (statusEl) {
      statusEl.textContent = 'Failed to load study data';
    }
    if (retryBtn) {
      retryBtn.style.display = 'inline-block';
    }
    console.error('Failed to initialize app:', err);
  }
}

// ─────────────────────────────────────────────
// Keyboard Shortcuts
// ─────────────────────────────────────────────

function initKeyboardShortcuts() {
  document.addEventListener('keydown', e => {
    // Ctrl+K or Cmd+K - Open search
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      window.location.hash = 'search';
      return;
    }

    // Number keys 1-4 for quiz answers
    if (e.target.tagName !== 'INPUT' && /^[1-4]$/.test(e.key)) {
      const event = new CustomEvent('quiz-keypress', { detail: { key: e.key } });
      document.dispatchEvent(event);
    }

    // N/P for next/previous chapter
    if (e.target.tagName !== 'INPUT' && (e.key === 'n' || e.key === 'p')) {
      const event = new CustomEvent('nav-keypress', { detail: { key: e.key } });
      document.dispatchEvent(event);
    }
  });
}

// ─────────────────────────────────────────────
// Start App on DOM Ready
// ─────────────────────────────────────────────

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}

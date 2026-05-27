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
import { renderDiagnostic } from './views/diagnostic';
import { renderSchedule } from './views/schedule';
import { renderBookmarks } from './views/bookmarks';
import { renderHighlights } from './views/highlights';
import { loadStudyData } from './utils/data-loader';
import {
  renderErrorRecovery,
  attachErrorRecoveryListeners,
  initOnlineListener,
  type ErrorState,
} from './components/error-recovery';
import { showSettingsSheet, attachSettingsListeners } from './components/settings';

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
  diagnostic: renderDiagnostic,
  schedule: renderSchedule,
  bookmarks: renderBookmarks,
  highlights: renderHighlights,
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
      </div>
    `;
  }

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
    initSettings();
    initOnlineListener();

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
    const error = err as Error;
    const errorState = determineErrorType(error);
    showErrorRecovery(errorState);
  }
}

function determineErrorType(error: Error): ErrorState {
  const message = error.message.toLowerCase();

  if (message.includes('fetch') || message.includes('network') || message.includes('http')) {
    return { type: 'network', message: error.message };
  }

  if (message.includes('parse') || message.includes('json') || message.includes('invalid')) {
    return { type: 'parse', message: error.message };
  }

  if (message.includes('storage') || message.includes('quota')) {
    return { type: 'storage', message: error.message };
  }

  return { type: 'unknown', message: error.message };
}

function showErrorRecovery(error: ErrorState) {
  const content = document.getElementById('content');
  if (!content) return;

  content.innerHTML = renderErrorRecovery(error, () => initApp());
  attachErrorRecoveryListeners(() => initApp());
}

// ─────────────────────────────────────────────
// Settings
// ─────────────────────────────────────────────

function initSettings() {
  const settingsBtn = document.getElementById('settings-toggle');
  if (settingsBtn) {
    settingsBtn.addEventListener('click', () => {
      showSettingsSheet();
      // Attach listeners after dialog is shown
      setTimeout(() => attachSettingsListeners(), 50);
    });
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

    // Desktop: Arrow keys for flashcard navigation
    if (e.target.tagName !== 'INPUT' && window.location.hash === '#flashcards') {
      if (e.key === 'ArrowLeft') {
        const prevBtn = document.getElementById('prev-card');
        prevBtn?.click();
      } else if (e.key === 'ArrowRight') {
        const nextBtn = document.getElementById('next-card');
        nextBtn?.click();
      }
    }

    // Desktop: Escape to close sidebar on mobile view
    if (e.key === 'Escape') {
      const sidebar = document.getElementById('sidebar');
      if (sidebar?.classList.contains('open')) {
        sidebar.classList.remove('open');
      }
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

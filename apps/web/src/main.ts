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

// ─────────────────────────────────────────────
// Route Definitions
// ─────────────────────────────────────────────

const routes = {
  'home': renderHome,
  'chapter/:id': renderChapter,
  'quiz': renderQuiz,
  'exam': renderExam,
  'flashcards': renderFlashcards,
  'cheatsheet': renderCheatSheet,
  'sergeant': renderSergeantFocus,
  'weak': renderWeakAreas,
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
  console.log('Initializing NYPD Sergeant Study Guide...');
  console.log('window.STUDY_DATA exists:', typeof window.STUDY_DATA !== 'undefined');
  console.log('window.STUDY_DATA value:', window.STUDY_DATA);

  // Load data - try global first, then fetch as fallback
  if (typeof window.STUDY_DATA !== 'undefined' && window.STUDY_DATA && window.STUDY_DATA.chapters) {
    appState.data = window.STUDY_DATA;
    console.log(`Loaded ${appState.data.chapters.length} chapters from global`);
  } else {
    // Fallback: fetch data.js and parse
    try {
      console.log('Fetching data.js...');
      const response = await fetch('/data.js');
      const script = await response.text();
      console.log('data.js fetched, length:', script.length);

      // Extract JSON: find "window.STUDY_DATA = " and extract just that object
      const prefix = 'window.STUDY_DATA = ';
      const startIdx = script.indexOf(prefix);
      if (startIdx === -1) {
        throw new Error('Could not find window.STUDY_DATA prefix');
      }

      // Get everything after the prefix
      let jsonStr = script.substring(startIdx + prefix.length).trim();

      // Find matching closing brace by counting braces
      let braceCount = 0;
      let inString = false;
      let escape = false;
      let endIdx = -1;

      for (let i = 0; i < jsonStr.length; i++) {
        const char = jsonStr[i];
        if (escape) {
          escape = false;
          continue;
        }
        if (char === '\\') {
          escape = true;
          continue;
        }
        if (char === '"' && !escape) {
          inString = !inString;
          continue;
        }
        if (!inString) {
          if (char === '{') braceCount++;
          if (char === '}') {
            braceCount--;
            if (braceCount === 0) {
              endIdx = i + 1;
              break;
            }
          }
        }
      }

      if (endIdx === -1) {
        throw new Error('Could not find matching closing brace');
      }

      jsonStr = jsonStr.substring(0, endIdx);
      console.log('JSON string length:', jsonStr.length);
      console.log('First 50 chars:', jsonStr.substring(0, 50));
      console.log('Last 50 chars:', jsonStr.substring(jsonStr.length - 50));
      appState.data = JSON.parse(jsonStr);
      console.log(`Loaded ${appState.data.chapters.length} chapters from fetch`);
    } catch (err) {
      console.error('Failed to load study data:', err);
      document.getElementById('content')!.innerHTML = `<div class="error" style="padding:20px;color:red;">Failed to load study data: ${err}. Please refresh.</div>`;
      return;
    }
  }

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

  console.log('App initialized successfully');
}

// ─────────────────────────────────────────────
// Keyboard Shortcuts
// ─────────────────────────────────────────────

function initKeyboardShortcuts() {
  document.addEventListener('keydown', (e) => {
    // Ctrl+K or Cmd+K - Search (future enhancement)
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      // TODO: Open search
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

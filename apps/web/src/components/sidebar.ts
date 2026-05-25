/**
 * Sidebar component - chapter navigation and tools
 */

import { navigateTo } from '../utils/router';
import { getProgress, markChapterComplete } from '../state/progress';
import { getFontScale, setFontScale } from '../utils/font-scale';
import { toggleTheme } from '../utils/theme';

interface Chapter {
  id: string;
  sectionNum: string;
  title: string;
  questions: Array<{ number: number }>;
}

export function initSidebar(chapters: Chapter[]) {
  if (!chapters || chapters.length === 0) {
    console.error('initSidebar: No chapters provided');
    return;
  }
  renderChapterNav(chapters);
  renderToolsNav();
  initMobileMenu();
}

function renderChapterNav(chapters: Chapter[]) {
  const nav = document.getElementById('nav-chapters');
  if (!nav) return;

  const html = `
    <div class="nav-section-title">Chapters</div>
    ${chapters
      .map(chapter => {
        const progress = getProgress(chapter.id);
        const isComplete = progress?.status === 'completed';
        const questionCount = chapter.questions?.length || 0;

        return `
        <div class="nav-item" data-chapter="${chapter.id}">
          <span class="ch-check ${isComplete ? 'done' : ''}">${isComplete ? '✓' : '○'}</span>
          <span class="nav-num">${chapter.sectionNum}</span>
          <span class="nav-title">${chapter.title}</span>
          <span class="q-badge">${questionCount}q</span>
        </div>
      `;
      })
      .join('')}
  `;

  nav.innerHTML = html;

  // Add click handlers
  nav.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', () => {
      const chapterId = item.getAttribute('data-chapter');
      if (chapterId) {
        navigateTo(`chapter/${chapterId}`);
        markChapterComplete(chapterId);
        updateSidebarActive(chapterId);
      }
    });
  });
}

function renderToolsNav() {
  const nav = document.getElementById('nav-tools');
  if (!nav) return;

  const tools = [
    { id: 'home', label: 'Home', icon: '🏠' },
    { id: 'schedule', label: 'Study Schedule', icon: '📅' },
    { id: 'cheatsheet', label: 'Cheat Sheet', icon: '📋' },
    { id: 'sergeant', label: 'Sergeant Focus', icon: '👮' },
    { id: 'diagnostic', label: 'Diagnostic', icon: '📈' },
    { id: 'flashcards', label: 'Flashcards', icon: '🃏' },
    { id: 'quiz', label: 'Quick Quiz', icon: '⚡' },
    { id: 'exam', label: 'Practice Exam', icon: '📝' },
    { id: 'weak', label: 'Weak Areas', icon: '📊' },
  ];

  nav.innerHTML = `
    <div class="nav-section-title">Tools</div>
    ${tools
      .map(
        tool => `
      <div class="nav-item" data-tool="${tool.id}">
        <span class="nav-num">${tool.icon}</span>
        <span class="nav-title">${tool.label}</span>
      </div>
    `
      )
      .join('')}
  `;

  // Add click handlers
  nav.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', () => {
      const toolId = item.getAttribute('data-tool');
      if (toolId) {
        navigateTo(toolId);
        updateSidebarActive(toolId);
      }
    });
  });

  // Add Display section (mobile only - hidden on desktop via CSS)
  renderDisplaySection();
}

function renderDisplaySection() {
  const nav = document.getElementById('nav-tools');
  if (!nav) return;

  const displaySection = document.createElement('div');
  displaySection.className = 'nav-section display-section';
  displaySection.innerHTML = `
    <div class="nav-section-title">Display</div>
    <div class="nav-item display-controls">
      <button class="icon-btn" id="sidebar-font-decrease" aria-label="Decrease font">A-</button>
      <button class="icon-btn" id="sidebar-font-increase" aria-label="Increase font">A+</button>
      <button class="icon-btn" id="sidebar-theme-toggle" aria-label="Toggle dark mode">◑</button>
    </div>
  `;
  nav.appendChild(displaySection);

  // Attach handlers for font/theme controls
  const fontDecreaseBtn = document.getElementById('sidebar-font-decrease');
  const fontIncreaseBtn = document.getElementById('sidebar-font-increase');
  const themeToggleBtn = document.getElementById('sidebar-theme-toggle');

  if (fontDecreaseBtn) {
    fontDecreaseBtn.addEventListener('click', () => {
      const currentScale = getFontScale();
      const newScale = Math.max(0.8, currentScale - 0.1);
      setFontScale(newScale);
    });
  }

  if (fontIncreaseBtn) {
    fontIncreaseBtn.addEventListener('click', () => {
      const currentScale = getFontScale();
      const newScale = Math.min(1.4, currentScale + 0.1);
      setFontScale(newScale);
    });
  }

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      toggleTheme();
    });
  }
}

function updateSidebarActive(activeId: string) {
  document.querySelectorAll('.nav-item').forEach(item => {
    const chapterId = item.getAttribute('data-chapter');
    const toolId = item.getAttribute('data-tool');

    if (chapterId === activeId || toolId === activeId) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });
}

function initMobileMenu() {
  const menuToggle = document.getElementById('menu-toggle');
  const sidebar = document.getElementById('sidebar');

  if (menuToggle && sidebar) {
    menuToggle.addEventListener('click', () => {
      sidebar.classList.toggle('open');
    });

    // Close sidebar when clicking outside on mobile
    document.addEventListener('click', e => {
      if (window.innerWidth <= 768) {
        const isClickInsideSidebar = sidebar.contains(e.target as Node);
        const isClickOnToggle = menuToggle.contains(e.target as Node);

        if (!isClickInsideSidebar && !isClickOnToggle) {
          sidebar.classList.remove('open');
        }
      }
    });
  }
}

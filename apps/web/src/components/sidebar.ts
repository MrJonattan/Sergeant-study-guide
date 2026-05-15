/**
 * Sidebar component - chapter navigation and tools
 */

import { navigateTo } from '../utils/router';
import { getProgress, markChapterComplete } from '../state/progress';

interface Chapter {
  id: string;
  sectionNum: string;
  title: string;
  questions: Array<{ number: number }>;
}

export function initSidebar(chapters: Chapter[]) {
  renderChapterNav(chapters);
  renderToolsNav();
  initMobileMenu();
}

function renderChapterNav(chapters: Chapter[]) {
  const nav = document.getElementById('nav-chapters');
  if (!nav) return;

  const html = `
    <div class="nav-section-title">Chapters</div>
    ${chapters.map(chapter => {
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
    }).join('')}
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
    { id: 'cheatsheet', label: 'Cheat Sheet', icon: '📋' },
    { id: 'sergeant', label: 'Sergeant Focus', icon: '👮' },
    { id: 'flashcards', label: 'Flashcards', icon: '🃏' },
    { id: 'quiz', label: 'Quick Quiz', icon: '⚡' },
    { id: 'exam', label: 'Practice Exam', icon: '📝' },
    { id: 'weak', label: 'Weak Areas', icon: '📊' },
  ];

  nav.innerHTML = `
    <div class="nav-section-title">Tools</div>
    ${tools.map(tool => `
      <div class="nav-item" data-tool="${tool.id}">
        <span class="nav-num">${tool.icon}</span>
        <span class="nav-title">${tool.label}</span>
      </div>
    `).join('')}
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
    document.addEventListener('click', (e) => {
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

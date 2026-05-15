/**
 * Chapter detail view - Renders chapter content with tabs
 */

import { appState } from '../main';
import { updateBreadcrumbs } from '../components/topbar';
import { renderMarkdown } from '../utils/markdown';

interface Chapter {
  id: string;
  sectionNum: string;
  title: string;
  readme: string;
  sections: Array<{ filename: string; content: string }>;
  questions: Array<{ number: number; text: string; options?: string[]; answer?: string }>;
}

let currentTab = 'study';

export function renderChapter(params?: { id: string }) {
  const chapterId = params?.id;
  if (!chapterId || !appState.data) {
    window.location.hash = 'home';
    return;
  }

  const chapter = appState.data.chapters.find((c: Chapter) => c.id === chapterId);
  if (!chapter) {
    window.location.hash = 'home';
    return;
  }

  updateBreadcrumbs([
    { label: 'Home', route: 'home' },
    { label: `${chapter.sectionNum} — ${chapter.title}` },
  ]);

  const content = document.getElementById('content');
  if (!content) return;

  content.innerHTML = `
    <h1>${chapter.sectionNum} — ${chapter.title}</h1>

    <div class="tab-bar">
      <div class="tab ${currentTab === 'study' ? 'active' : ''}" data-tab="study">Study</div>
      <div class="tab ${currentTab === 'quiz' ? 'active' : ''}" data-tab="quiz">Quiz</div>
      <div class="tab ${currentTab === 'terms' ? 'active' : ''}" data-tab="terms">Key Terms</div>
    </div>

    <div id="chapter-body" style="margin-top: 1.5rem;"></div>
  `;

  // Tab handlers
  content.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
      currentTab = tab.getAttribute('data-tab') || 'study';
      renderChapter(params);
    });
  });

  // Render tab content
  const chapterBody = document.getElementById('chapter-body');
  if (chapterBody) {
    switch (currentTab) {
      case 'study':
        renderStudyTab(chapter, chapterBody);
        break;
      case 'quiz':
        renderQuizTab(chapter, chapterBody);
        break;
      case 'terms':
        renderTermsTab(chapter, chapterBody);
        break;
    }
  }
}

function renderStudyTab(chapter: Chapter, container: HTMLElement) {
  // Render README content
  container.innerHTML = renderMarkdown(chapter.readme);

  // Render section files
  const sectionsHtml = chapter.sections
    .map(section => renderMarkdown(section.content))
    .join('<hr style="margin: 2rem 0; border: none; border-top: var(--rule);">');

  container.innerHTML += sectionsHtml;
}

function renderQuizTab(chapter: Chapter, container: HTMLElement) {
  if (!chapter.questions || chapter.questions.length === 0) {
    container.innerHTML = '<p>No practice questions available for this chapter.</p>';
    return;
  }

  container.innerHTML = `
    <h2>Chapter Quiz</h2>
    <p style="opacity: 0.6; margin-bottom: 1rem;">${chapter.questions.length} questions</p>
    <div id="quiz-container"></div>
  `;

  const quizContainer = document.getElementById('quiz-container');
  if (quizContainer) {
    // TODO: Implement quiz rendering
    quizContainer.innerHTML = '<p>Quiz functionality coming soon...</p>';
  }
}

function renderTermsTab(chapter: Chapter, container: HTMLElement) {
  container.innerHTML = `
    <h2>Key Terms</h2>
    ${renderMarkdown(chapter.keyTerms || '_No key terms for this chapter._')}
  `;
}

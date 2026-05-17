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

interface ChapterQuizState {
  questions: Chapter['questions'];
  currentIndex: number;
  answers: (number | null)[];
  selectedAnswer: number | null;
  showResults: boolean;
  score: number;
  chapterId: string;
  chapterTitle: string;
}

let quizState: ChapterQuizState | null = null;

function renderQuizTab(chapter: Chapter, container: HTMLElement) {
  if (!chapter.questions || chapter.questions.length === 0) {
    container.innerHTML = '<p>No practice questions available for this chapter.</p>';
    return;
  }

  // Initialize quiz state
  quizState = {
    questions: chapter.questions,
    currentIndex: 0,
    answers: [],
    selectedAnswer: null,
    showResults: false,
    score: 0,
    chapterId: chapter.id,
    chapterTitle: chapter.title,
  };

  container.innerHTML = `
    <div class="quiz-container">
      <div class="quiz-header">
        <h2>${chapter.title} - Quiz</h2>
        <p class="quiz-subtitle">${chapter.questions.length} questions</p>
      </div>

      <div class="quiz-progress">
        <div class="quiz-progress-bar">
          <div class="quiz-progress-fill" style="width: ${100 / chapter.questions.length}%"></div>
        </div>
        <span class="quiz-progress-text">Question 1 of ${chapter.questions.length}</span>
      </div>

      <div id="chapter-quiz-body"></div>
    </div>
  `;

  renderChapterQuestion();
}

function renderChapterQuestion() {
  const quizBody = document.getElementById('chapter-quiz-body');
  if (!quizBody || !quizState) return;

  const question = quizState.questions[quizState.currentIndex];
  const progress = ((quizState.currentIndex + 1) / quizState.questions.length) * 100;

  // Update progress bar
  const progressFill = document.querySelector('.quiz-progress-fill') as HTMLElement;
  const progressText = document.querySelector('.quiz-progress-text') as HTMLElement;
  if (progressFill) progressFill.style.width = `${progress}%`;
  if (progressText)
    progressText.textContent = `Question ${quizState.currentIndex + 1} of ${quizState.questions.length}`;

  quizBody.innerHTML = `
    <div class="quiz-question-card">
      <div class="question-number">Question ${quizState.currentIndex + 1}</div>
      <p class="question-text">${question.text}</p>

      <div class="quiz-options">
        ${
          question.options
            ?.map(
              (option, idx) => `
          <button
            class="quiz-option ${quizState!.selectedAnswer === idx ? 'selected' : ''}"
            data-index="${idx}"
          >
            <span class="quiz-option-letter">${String.fromCharCode(65 + idx)}</span>
            <span class="quiz-option-text">${option}</span>
          </button>
        `
            )
            .join('') || '<p>No options available</p>'
        }
      </div>

      <div class="quiz-actions">
        <button
          class="quiz-btn quiz-btn-submit"
          id="submit-answer"
          ${quizState.selectedAnswer === null ? 'disabled' : ''}
        >
          Submit Answer
        </button>
      </div>
    </div>
  `;

  // Add event listeners
  quizBody.querySelectorAll('.quiz-option').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.getAttribute('data-index') || '0');
      quizState!.selectedAnswer = idx;
      renderChapterQuestion();
    });
  });

  const submitBtn = document.getElementById('submit-answer');
  submitBtn?.addEventListener('click', submitChapterAnswer);
}

function submitChapterAnswer() {
  if (!quizState || quizState.selectedAnswer === null) return;

  const question = quizState.questions[quizState.currentIndex];
  // Convert letter answer ("A", "B", "C", "D") to index (0, 1, 2, 3)
  const correctIndex = question.answer ? question.answer.charCodeAt(0) - 65 : -1;
  const isCorrect = quizState.selectedAnswer === correctIndex;

  quizState.answers.push(quizState.selectedAnswer);

  if (isCorrect) {
    quizState.score++;
  }

  // Mark chapter as studied if correct
  if (isCorrect) {
    import('../state/progress').then(({ markChapterComplete }) => {
      markChapterComplete(quizState!.chapterId);
    });
  }

  // Move to next question or show results
  quizState.currentIndex++;
  quizState.selectedAnswer = null;

  if (quizState.currentIndex >= quizState.questions.length) {
    showChapterResults();
  } else {
    renderChapterQuestion();
  }
}

function showChapterResults() {
  const quizBody = document.getElementById('chapter-quiz-body');
  if (!quizBody || !quizState) return;

  const percentage = Math.round((quizState.score / quizState.questions.length) * 100);
  const passed = percentage >= 70;

  quizBody.innerHTML = `
    <div class="quiz-results-card">
      <div class="results-header ${passed ? 'passed' : 'failed'}">
        <div class="results-icon">${passed ? '✓' : '!'}</div>
        <h2>${passed ? 'Great Job!' : 'Keep Studying'}</h2>
      </div>

      <div class="results-stats">
        <div class="result-stat">
          <div class="stat-value">${quizState.score}/${quizState.questions.length}</div>
          <div class="stat-label">Correct Answers</div>
        </div>
        <div class="result-stat">
          <div class="stat-value">${percentage}%</div>
          <div class="stat-label">Score</div>
        </div>
      </div>

      <div class="results-review">
        <h3>Review Answers</h3>
        ${quizState.questions
          .map((q, idx) => {
            const userAnswer = quizState!.answers[idx];
            const correctIndex = q.answer ? q.answer.charCodeAt(0) - 65 : -1;
            const isCorrect = userAnswer === correctIndex;
            return `
            <div class="review-item ${isCorrect ? 'correct' : 'incorrect'}">
              <div class="review-indicator">${isCorrect ? '✓' : '✗'}</div>
              <div class="review-content">
                <p class="review-question">${q.text}</p>
                <p class="review-answer">
                  Your answer: <strong>${userAnswer !== null && q.options ? q.options[userAnswer] : 'No answer'}</strong>
                  ${!isCorrect ? `<br>Correct answer: <strong>${q.options ? q.options[correctIndex] : 'N/A'}</strong>` : ''}
                </p>
              </div>
            </div>
          `;
          })
          .join('')}
      </div>

      <div class="quiz-actions">
        <button class="quiz-btn quiz-btn-primary" id="retry-quiz">
          Retry Quiz
        </button>
        <button class="quiz-btn" id="back-study">
          Back to Study
        </button>
      </div>
    </div>
  `;

  // Save quiz score for progress tracking
  import('../state/progress').then(({ updateQuizScore }) => {
    updateQuizScore(quizState.chapterId, percentage, quizState.questions.length);
  });

  // Add event listeners
  document.getElementById('retry-quiz')?.addEventListener('click', () => {
    quizState = null;
    renderQuizTab(
      { ...quizState!, questions: quizState!.questions },
      document.getElementById('chapter-body')!
    );
  });

  document.getElementById('back-study')?.addEventListener('click', () => {
    currentTab = 'study';
    const chapter = appState.data?.chapters.find((c: Chapter) => c.id === quizState?.chapterId);
    if (chapter) {
      renderChapter({ id: chapter.id });
    }
  });
}

function renderTermsTab(chapter: Chapter, container: HTMLElement) {
  container.innerHTML = `
    <h2>Key Terms</h2>
    ${renderMarkdown(chapter.keyTerms || '_No key terms for this chapter._')}
  `;
}

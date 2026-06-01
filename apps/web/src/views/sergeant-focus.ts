/**
 * Sergeant Focus view - All supervisor callouts with source references and quiz
 */

import { updateBreadcrumbs } from '../components/topbar';
import { appState } from '../main';
import { updateQuizScore } from '../state/progress';

interface SergeantFocus {
  filename: string;
  text: string;
  category?: string;
}

interface Chapter {
  id: string;
  sectionNum: string;
  title: string;
  sergeantFocus: SergeantFocus[];
  questions?: Array<{
    number: number;
    text: string;
    options?: string[];
    answer?: string;
    type?: 'mc' | 'open';
  }>;
}

interface Question {
  number: number;
  text: string;
  options: string[];
  answer?: string;
  answerFull?: string;
  explanation?: string;
  type?: 'mc' | 'open';
  chapterId?: string;
}

interface QuizState {
  questions: Question[];
  currentIndex: number;
  answers: (number | null)[];
  selectedAnswer: number | null;
  showResults: boolean;
  score: number;
}

let currentTab = 'browse';
let quizState: QuizState | null = null;

export function renderSergeantFocus() {
  updateBreadcrumbs([{ label: 'Home', route: 'home' }, { label: 'Sergeant Focus' }]);

  const content = document.getElementById('content');
  if (!content || !appState.data) return;

  // Collect all sergeant focus callouts grouped by chapter
  const chaptersWithCallouts = appState.data.chapters.filter(
    (c: Chapter) => c.sergeantFocus && c.sergeantFocus.length > 0
  );

  const totalCallouts = chaptersWithCallouts.reduce(
    (sum: number, c: Chapter) => sum + c.sergeantFocus.length,
    0
  );

  content.innerHTML = `
    <div class="sergeant-focus-container">
      <div class="sergeant-focus-header">
        <h1>Sergeant Focus</h1>
        <p class="sergeant-focus-subtitle">Supervisor-specific responsibilities and key considerations across all chapters</p>
      </div>

      <div class="sergeant-focus-stats">
        <div class="stat-card">
          <div class="stat-value">${chaptersWithCallouts.length}</div>
          <div class="stat-label">Chapters</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${totalCallouts}</div>
          <div class="stat-label">Callouts</div>
        </div>
      </div>

      <div class="tab-bar">
        <div class="tab ${currentTab === 'browse' ? 'active' : ''}" data-tab="browse">Browse</div>
        <div class="tab ${currentTab === 'quiz' ? 'active' : ''}" data-tab="quiz">Quiz</div>
      </div>

      <div id="sergeant-body" style="margin-top: 1.5rem;"></div>
    </div>
  `;

  // Tab handlers
  content.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
      currentTab = tab.getAttribute('data-tab') || 'browse';
      renderSergeantFocus();
    });
  });

  // Render tab content
  const sergeantBody = document.getElementById('sergeant-body');
  if (sergeantBody) {
    if (currentTab === 'quiz') {
      renderQuizTab(sergeantBody);
    } else {
      renderBrowseTab(sergeantBody, chaptersWithCallouts);
    }
  }
}

/**
 * Extract section number from filename (e.g., "section-208-01.md" → "208-01")
 * and format as P.G. or A.G. reference based on section number
 */
function getSourceReference(
  filename: string,
  chapterSectionNum: string
): {
  displayName: string;
  sourceType: 'PG' | 'AG';
} {
  // Extract section number from filename like "section-208-01.md" or "section-208-dat.md"
  const match = filename.match(/section-(\d{3})-(?:0?(\d+)|([a-z0-9-]+))\.md/);

  if (!match) {
    return {
      displayName: `P.G. ${chapterSectionNum}`,
      sourceType: 'PG',
    };
  }

  const sectionNum = match[1]; // e.g., "208"
  const subsection = match[2] || match[3]; // e.g., "01" or "dat"

  // 200-series = Patrol Guide, 300-series = Administrative Guide
  const sourceType: 'PG' | 'AG' = sectionNum.startsWith('2') ? 'PG' : 'AG';
  const guideName = sourceType === 'PG' ? 'P.G.' : 'A.G.';

  // Format: P.G. 208-01 or A.G. 330-03
  const displayName = `${guideName} ${sectionNum}-${subsection}`;

  return { displayName, sourceType };
}

function renderBrowseTab(container: HTMLElement, chaptersWithCallouts: Chapter[]) {
  // Add expand/collapse controls
  const controlsHtml = `
    <div class="sergeant-focus-controls">
      <button class="expand-collapse-btn" id="expand-all">Expand All</button>
      <button class="expand-collapse-btn" id="collapse-all">Collapse All</button>
    </div>

    <div class="sergeant-focus-content">
      ${chaptersWithCallouts.map((chapter: Chapter, index: number) => renderChapter(chapter, index)).join('')}
    </div>
  `;
  container.innerHTML = controlsHtml;

  // Add event listeners for expand/collapse buttons
  const expandAllBtn = document.getElementById('expand-all');
  const collapseAllBtn = document.getElementById('collapse-all');

  expandAllBtn?.addEventListener('click', () => {
    document.querySelectorAll('.sergeant-focus-details').forEach(details => {
      (details as HTMLDetailsElement).open = true;
    });
  });

  collapseAllBtn?.addEventListener('click', () => {
    document.querySelectorAll('.sergeant-focus-details').forEach(details => {
      (details as HTMLDetailsElement).open = false;
    });
  });
}

/**
 * Get chapters with Sergeant Focus callouts
 */
function getSergeantFocusChapters(): Chapter[] {
  if (!appState.data) return [];
  return appState.data.chapters.filter(
    (c: Chapter) => c.sergeantFocus && c.sergeantFocus.length > 0
  );
}

/**
 * Get 15 random questions from chapters with Sergeant Focus callouts
 * Only includes multiple-choice questions with options
 */
function getSergeantFocusQuestions(count: number): Question[] {
  const chapters = getSergeantFocusChapters();
  const allQuestions: Question[] = [];

  chapters.forEach(chapter => {
    chapter.questions?.forEach(q => {
      // Only include multiple-choice questions with options
      if (q.type === 'mc' && q.options && q.options.length > 0 && q.answer) {
        allQuestions.push({
          number: q.number,
          text: q.text,
          options: q.options,
          answer: q.answer,
          type: q.type,
          chapterId: chapter.id,
        });
      }
    });
  });

  // Shuffle and pick random questions
  const shuffled = allQuestions.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

function renderQuizTab(container: HTMLElement) {
  if (!quizState) {
    // Initialize quiz with 15 questions from Sergeant Focus chapters
    quizState = {
      questions: getSergeantFocusQuestions(15),
      currentIndex: 0,
      answers: [],
      selectedAnswer: null,
      showResults: false,
      score: 0,
    };
  }

  if (quizState.questions.length === 0) {
    container.innerHTML = '<p>No questions available for Sergeant Focus chapters.</p>';
    return;
  }

  const progress = ((quizState.currentIndex + 1) / quizState.questions.length) * 100;

  container.innerHTML = `
    <div class="quiz-container">
      <div class="quiz-header">
        <h2>Sergeant Focus Quiz</h2>
        <p class="quiz-subtitle">${quizState.questions.length} questions from supervisor callout chapters</p>
      </div>

      <div class="quiz-progress">
        <div class="quiz-progress-bar">
          <div class="quiz-progress-fill" style="width: ${progress}%"></div>
        </div>
        <span class="quiz-progress-text">Question ${quizState.currentIndex + 1} of ${quizState.questions.length}</span>
      </div>

      <div id="sergeant-quiz-body"></div>
    </div>
  `;

  renderQuizQuestion();
}

function renderQuizQuestion() {
  const quizBody = document.getElementById('sergeant-quiz-body');
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
      renderQuizQuestion();
    });
  });

  const submitBtn = document.getElementById('submit-answer');
  submitBtn?.addEventListener('click', submitQuizAnswer);
}

function submitQuizAnswer() {
  if (!quizState || quizState.selectedAnswer === null) return;

  const question = quizState.questions[quizState.currentIndex];
  const correctIndex = question.answer ? question.answer.charCodeAt(0) - 65 : -1;
  const isCorrect = quizState.selectedAnswer === correctIndex;

  quizState.answers.push(quizState.selectedAnswer);

  if (isCorrect) {
    quizState.score++;
  }

  // Move to next question or show results
  quizState.currentIndex++;
  quizState.selectedAnswer = null;

  if (quizState.currentIndex >= quizState.questions.length) {
    showQuizResults();
  } else {
    renderQuizQuestion();
  }
}

function showQuizResults() {
  const quizBody = document.getElementById('sergeant-quiz-body');
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
                  ${!isCorrect ? `<br>Correct answer: <strong>${q.options[correctIndex]}</strong>` : ''}
                </p>
              </div>
            </div>
          `;
          })
          .join('')}
      </div>

      <div class="quiz-actions">
        <button class="quiz-btn quiz-btn-primary" id="retry-quiz">
          Take Again
        </button>
        <button class="quiz-btn" id="back-browse">
          Back to Browse
        </button>
      </div>
    </div>
  `;

  // Save quiz score with attemptType: sergeant-focus
  const chapterIds = new Set(quizState.questions.filter(q => q.chapterId).map(q => q.chapterId!));
  chapterIds.forEach(chapterId => {
    updateQuizScore(chapterId, percentage, quizState!.questions.length, 'sergeant-focus');
  });

  // Add event listeners
  document.getElementById('retry-quiz')?.addEventListener('click', () => {
    quizState = null;
    renderQuizTab(document.getElementById('sergeant-body')!);
  });

  document.getElementById('back-browse')?.addEventListener('click', () => {
    currentTab = 'browse';
    renderSergeantFocus();
  });
}

function renderChapter(chapter: Chapter, index: number): string {
  const isExpanded = index < 3; // Expand first 3 chapters by default

  return `
    <section class="sergeant-focus-chapter">
      <details class="sergeant-focus-details" ${isExpanded ? 'open' : ''}>
        <summary class="sergeant-focus-summary">
          <span class="chapter-num">${chapter.sectionNum}</span>
          <span class="chapter-title">${chapter.title}</span>
          <span class="callout-count">${chapter.sergeantFocus.length} callout${chapter.sergeantFocus.length !== 1 ? 's' : ''}</span>
          <span class="expand-icon">+</span>
        </summary>
        <div class="sergeant-focus-callouts">
          ${chapter.sergeantFocus
            .map(callout => {
              const source = getSourceReference(callout.filename, chapter.sectionNum);
              return `
              <div class="callout callout-sergeant">
                <div class="sergeant-focus-header-row">
                  <div class="callout-title">Sergeant Focus</div>
                  <span class="source-badge source-${source.sourceType.toLowerCase()}">${source.displayName}</span>
                </div>
                <p>${callout.text}</p>
              </div>
            `;
            })
            .join('')}
        </div>
      </details>
    </section>
  `;
}

/**
 * Diagnostic Test view - 30-question baseline assessment
 */

import { updateBreadcrumbs } from '../components/topbar';
import { appState } from '../main';
import {
  updateQuizScore,
  setDiagnosticCompleted,
  placeFlashcardFromDiagnostic,
} from '../state/progress';

interface Question {
  number: number;
  text: string;
  options: string[];
  answer?: string;
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

let quizState: QuizState | null = null;

export function renderDiagnostic() {
  updateBreadcrumbs([{ label: 'Home', route: 'home' }, { label: 'Diagnostic Test' }]);

  const content = document.getElementById('content');
  if (!content || !appState.data) return;

  content.innerHTML = `
    <div class="diagnostic-container">
      <div class="diagnostic-header">
        <h1>Diagnostic Test</h1>
        <p class="diagnostic-subtitle">30-question baseline assessment to identify your strengths and weaknesses</p>
      </div>

      <div class="diagnostic-info">
        <p>This test covers all 29 chapters. Your results will:</p>
        <ul>
          <li>Identify areas where you need more study</li>
          <li>Set up your flashcard review schedule</li>
          <li>Establish a baseline for tracking progress</li>
        </ul>
      </div>

      <div id="diagnostic-body"></div>
    </div>
  `;

  // Initialize quiz with 30 questions
  quizState = {
    questions: getDiagnosticQuestions(30),
    currentIndex: 0,
    answers: [],
    selectedAnswer: null,
    showResults: false,
    score: 0,
  };

  if (quizState.questions.length === 0) {
    const body = document.getElementById('diagnostic-body');
    if (body) {
      body.innerHTML = '<p>No questions available for diagnostic test.</p>';
    }
    return;
  }

  renderQuestion();
}

/**
 * Get 30 questions with proportional weighting by chapter
 */
function getDiagnosticQuestions(count: number): Question[] {
  if (!appState.data) return [];

  const allQuestions: Question[] = [];

  // Collect all MC questions from all chapters
  appState.data.chapters.forEach(chapter => {
    chapter.questions?.forEach(q => {
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

  // Proportional selection by chapter weight
  const totalQuestions = allQuestions.length;
  const selected: Question[] = [];
  const remaining = [...allQuestions];

  // Calculate questions per chapter based on weight
  const chapterWeights = new Map<string, number>();
  allQuestions.forEach(q => {
    if (q.chapterId) {
      chapterWeights.set(q.chapterId, (chapterWeights.get(q.chapterId) || 0) + 1);
    }
  });

  // Select questions proportionally
  const questionsPerChapter = new Map<string, number>();
  let allocated = 0;

  chapterWeights.forEach((weight, chapterId) => {
    const proportion = Math.round((weight / totalQuestions) * count);
    questionsPerChapter.set(chapterId, proportion);
    allocated += proportion;
  });

  // Adjust if we're over or under
  const adjustment = count - allocated;
  if (adjustment !== 0) {
    const chapterIds = Array.from(chapterWeights.keys());
    for (let i = 0; i < Math.abs(adjustment); i++) {
      const idx = i % chapterIds.length;
      const current = questionsPerChapter.get(chapterIds[idx]) || 0;
      questionsPerChapter.set(
        chapterIds[idx],
        adjustment > 0 ? current + 1 : Math.max(0, current - 1)
      );
    }
  }

  // Select questions for each chapter
  chapterWeights.forEach((_, chapterId) => {
    const chapterQuestions = remaining.filter(q => q.chapterId === chapterId);
    const chapterCount = questionsPerChapter.get(chapterId) || 0;

    // Shuffle and pick
    const shuffled = chapterQuestions.sort(() => Math.random() - 0.5);
    selected.push(...shuffled.slice(0, chapterCount));

    // Remove selected from remaining
    const remainingIdx = remaining.findIndex(q => q.chapterId === chapterId);
    if (remainingIdx >= 0) {
      remaining.splice(remainingIdx, chapterCount);
    }
  });

  // If we still need more questions, add random ones
  if (selected.length < count) {
    const extra = remaining.sort(() => Math.random() - 0.5).slice(0, count - selected.length);
    selected.push(...extra);
  }

  // Final shuffle
  return selected.sort(() => Math.random() - 0.5);
}

function renderQuestion() {
  const quizBody = document.getElementById('diagnostic-body');
  if (!quizBody || !quizState) return;

  const progress = ((quizState.currentIndex + 1) / quizState.questions.length) * 100;

  quizBody.innerHTML = `
    <div class="quiz-container">
      <div class="quiz-progress">
        <div class="quiz-progress-bar">
          <div class="quiz-progress-fill" style="width: ${progress}%"></div>
        </div>
        <span class="quiz-progress-text">Question ${quizState.currentIndex + 1} of ${quizState.questions.length}</span>
      </div>

      <div id="diagnostic-quiz-body"></div>
    </div>
  `;

  renderQuizQuestion();
}

function renderQuizQuestion() {
  const quizBody = document.getElementById('diagnostic-quiz-body');
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

  // Place flashcard in Leitner box based on performance
  if (question.chapterId) {
    const cardId = `diagnostic-${question.chapterId}-${question.number}`;
    placeFlashcardFromDiagnostic(cardId, isCorrect);
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
  const quizBody = document.getElementById('diagnostic-quiz-body');
  if (!quizBody || !quizState) return;

  const percentage = Math.round((quizState.score / quizState.questions.length) * 100);
  const passed = percentage >= 70;

  quizBody.innerHTML = `
    <div class="quiz-results-card">
      <div class="results-header ${passed ? 'passed' : 'failed'}">
        <div class="results-icon">${passed ? '✓' : '!'}</div>
        <h2>${passed ? 'Good Start!' : 'Baseline Established'}</h2>
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
        <button class="quiz-btn quiz-btn-primary" id="back-home">
          Back to Home
        </button>
      </div>
    </div>
  `;

  // Save quiz score with attemptType: diagnostic
  const chapterIds = new Set(quizState.questions.filter(q => q.chapterId).map(q => q.chapterId!));
  chapterIds.forEach(chapterId => {
    updateQuizScore(chapterId, percentage, quizState!.questions.length, 'diagnostic');
  });

  // Mark diagnostic as completed
  setDiagnosticCompleted();

  // Add event listeners
  document.getElementById('back-home')?.addEventListener('click', () => {
    window.location.hash = 'home';
  });
}

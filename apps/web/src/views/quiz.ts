/**
 * Quick Quiz view - 10 random questions with scoring
 */

import { updateBreadcrumbs } from '../components/topbar';
import { appState } from '../main';
import { markChapterComplete, updateQuizScore } from '../state/progress';

interface Question {
  number: number;
  text: string;
  options: string[];
  answer?: string; // Letter answer ("A", "B", "C", "D") from parser
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

let state: QuizState | null = null;

export function renderQuiz() {
  updateBreadcrumbs([{ label: 'Home', route: 'home' }, { label: 'Quick Quiz' }]);

  const content = document.getElementById('content');
  if (!content || !appState.data) return;

  // Initialize quiz state
  state = {
    questions: getRandomQuestions(10),
    currentIndex: 0,
    answers: [],
    selectedAnswer: null,
    showResults: false,
    score: 0,
  };

  content.innerHTML = `
    <div class="quiz-container">
      <div class="quiz-header">
        <h1>Quick Quiz</h1>
        <p class="quiz-subtitle">10 random questions for fast practice</p>
      </div>

      <div class="quiz-progress">
        <div class="quiz-progress-bar">
          <div class="quiz-progress-fill" style="width: 10%"></div>
        </div>
        <span class="quiz-progress-text">Question 1 of 10</span>
      </div>

      <div id="quiz-body"></div>
    </div>
  `;

  renderQuestion();
}

function getRandomQuestions(count: number): Question[] {
  if (!appState.data) return [];

  const allQuestions: Question[] = [];

  // Collect all questions from chapters
  appState.data.chapters.forEach(chapter => {
    chapter.questions?.forEach(q => {
      if (q.options && q.options.length > 0) {
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

function renderQuestion() {
  const quizBody = document.getElementById('quiz-body');
  if (!quizBody || !state) return;

  const currentState = state;
  const question = currentState.questions[currentState.currentIndex];
  const progress = ((currentState.currentIndex + 1) / currentState.questions.length) * 100;

  // Update progress bar
  const progressFill = document.querySelector('.quiz-progress-fill') as HTMLElement;
  const progressText = document.querySelector('.quiz-progress-text') as HTMLElement;
  if (progressFill) progressFill.style.width = `${progress}%`;
  if (progressText)
    progressText.textContent = `Question ${currentState.currentIndex + 1} of ${currentState.questions.length}`;

  quizBody.innerHTML = `
    <div class="quiz-question-card">
      <div class="question-number">Question ${currentState.currentIndex + 1}</div>
      <p class="question-text">${question.text}</p>

      <div class="quiz-options">
        ${question.options
          .map(
            (option, idx) => `
          <button
            class="quiz-option ${currentState.selectedAnswer === idx ? 'selected' : ''}"
            data-index="${idx}"
          >
            <span class="quiz-option-letter">${String.fromCharCode(65 + idx)}</span>
            <span class="quiz-option-text">${option}</span>
          </button>
        `
          )
          .join('')}
      </div>

      <div class="quiz-actions">
        <button
          class="quiz-btn quiz-btn-submit"
          id="submit-answer"
          ${currentState.selectedAnswer === null ? 'disabled' : ''}
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
      if (state) {
        state.selectedAnswer = idx;
        renderQuestion();
      }
    });
  });

  const submitBtn = document.getElementById('submit-answer');
  submitBtn?.addEventListener('click', submitAnswer);
}

function submitAnswer() {
  if (!state || state.selectedAnswer === null) return;

  const question = state.questions[state.currentIndex];
  // Convert letter answer ("A", "B", "C", "D") to index (0, 1, 2, 3)
  const correctIndex = question.answer ? question.answer.charCodeAt(0) - 65 : -1;
  const isCorrect = state.selectedAnswer === correctIndex;

  state.answers.push(state.selectedAnswer);

  if (isCorrect) {
    state.score++;
  }

  // Mark chapter as studied if correct
  if (isCorrect && question.chapterId) {
    markChapterComplete(question.chapterId);
  }

  // Move to next question or show results
  state.currentIndex++;
  state.selectedAnswer = null;

  if (state.currentIndex >= state.questions.length) {
    showResults();
  } else {
    renderQuestion();
  }
}

function showResults() {
  const quizBody = document.getElementById('quiz-body');
  if (!quizBody || !state) return;

  const currentState = state;
  const percentage = Math.round((currentState.score / currentState.questions.length) * 100);
  const passed = percentage >= 70;

  quizBody.innerHTML = `
    <div class="quiz-results-card">
      <div class="results-header ${passed ? 'passed' : 'failed'}">
        <div class="results-icon">${passed ? '✓' : '!'}</div>
        <h2>${passed ? 'Great Job!' : 'Keep Studying'}</h2>
      </div>

      <div class="results-stats">
        <div class="result-stat">
          <div class="stat-value">${currentState.score}/${currentState.questions.length}</div>
          <div class="stat-label">Correct Answers</div>
        </div>
        <div class="result-stat">
          <div class="stat-value">${percentage}%</div>
          <div class="stat-label">Score</div>
        </div>
      </div>

      <div class="results-review">
        <h3>Review Answers</h3>
        ${currentState.questions
          .map((q, idx) => {
            const userAnswer = currentState.answers[idx];
            // Convert letter answer to index
            const correctIndex = q.answer ? q.answer.charCodeAt(0) - 65 : -1;
            const isCorrect = userAnswer === correctIndex;
            return `
            <div class="review-item ${isCorrect ? 'correct' : 'incorrect'}">
              <div class="review-indicator">${isCorrect ? '✓' : '✗'}</div>
              <div class="review-content">
                <p class="review-question">${q.text}</p>
                <p class="review-answer">
                  Your answer: <strong>${userAnswer !== null ? q.options[userAnswer] : 'No answer'}</strong>
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
          Retry Quiz
        </button>
        <button class="quiz-btn" id="back-home">
          Back to Home
        </button>
      </div>
    </div>
  `;

  // Save quiz score for weak areas tracking
  const chapterIds = new Set(
    currentState.questions.filter(q => q.chapterId).map(q => q.chapterId!)
  );
  chapterIds.forEach(chapterId => {
    updateQuizScore(chapterId, percentage, currentState.questions.length);
  });

  // Add event listeners
  document.getElementById('retry-quiz')?.addEventListener('click', () => {
    renderQuiz();
  });

  document.getElementById('back-home')?.addEventListener('click', () => {
    window.location.hash = 'home';
  });
}

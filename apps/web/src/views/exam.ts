/**
 * Practice Exam view - Full 140-question timed exam
 */

import { updateBreadcrumbs } from '../components/topbar';
import { appState } from '../main';

interface Question {
  number: number;
  text: string;
  options: string[];
  answer?: string; // Letter answer ("A", "B", "C", "D") from parser
  chapterId?: string;
}

interface ExamState {
  questions: Question[];
  answers: (number | null)[];
  currentIndex: number;
  startTime: number | null;
  endTime: number | null;
  showResults: boolean;
  flagged: number[];
}

let state: ExamState | null = null;
let timerInterval: number | null = null;

const EXAM_DURATION_MS = 3 * 60 * 60 * 1000; // 3 hours

export function renderExam() {
  updateBreadcrumbs([{ label: 'Home', route: 'home' }, { label: 'Practice Exam' }]);

  const content = document.getElementById('content');
  if (!content || !appState.data) return;

  // Initialize exam state
  state = {
    questions: getAllQuestions(),
    answers: [],
    currentIndex: 0,
    startTime: null,
    endTime: null,
    showResults: false,
    flagged: [],
  };

  content.innerHTML = `
    <div class="exam-container">
      <div class="exam-header">
        <h1>Practice Exam</h1>
        <div class="exam-timer" id="exam-timer">
          <span class="timer-label">Time Remaining:</span>
          <span class="timer-value" id="timer-display">3:00:00</span>
        </div>
      </div>

      <div class="exam-info">
        <span class="exam-question-count">Question <span id="current-q-num">1</span> of ${state.questions.length}</span>
        <span class="exam-answered">Answered: <span id="answered-count">0</span></span>
        <span class="exam-flagged">Flagged: <span id="flagged-count">0</span></span>
      </div>

      <div id="exam-body"></div>

      <div class="exam-navigation">
        <button class="exam-btn" id="prev-question" disabled>← Previous</button>
        <button class="exam-btn exam-btn-flag" id="flag-question">⚑ Flag</button>
        <button class="exam-btn exam-btn-primary" id="next-question">Next →</button>
      </div>

      <div class="exam-question-palette">
        <h3>Question Map</h3>
        <div class="palette-grid" id="question-palette"></div>
      </div>

      <div class="exam-actions">
        <button class="exam-btn exam-btn-submit" id="submit-exam">Submit Exam</button>
      </div>
    </div>
  `;

  initExamListeners();
  renderQuestion();
  renderPalette();
  startTimer();
}

function getAllQuestions(): Question[] {
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
          chapterId: chapter.id,
        });
      }
    });
  });

  // Add exam questions
  appState.data.examQuestions?.forEach(q => {
    allQuestions.push({
      number: allQuestions.length + 1,
      text: q.text,
      options: q.options,
      answer: q.answer,
    });
  });

  // Shuffle questions
  return allQuestions.sort(() => Math.random() - 0.5);
}

function initExamListeners() {
  const prevBtn = document.getElementById('prev-question');
  const nextBtn = document.getElementById('next-question');
  const flagBtn = document.getElementById('flag-question');
  const submitBtn = document.getElementById('submit-exam');

  prevBtn?.addEventListener('click', () => navigateQuestion(-1));
  nextBtn?.addEventListener('click', () => navigateQuestion(1));

  flagBtn?.addEventListener('click', () => {
    if (!state) return;
    const idx = state.currentIndex;
    const flagIdx = state.flagged.indexOf(idx);
    if (flagIdx === -1) {
      state.flagged.push(idx);
    } else {
      state.flagged.splice(flagIdx, 1);
    }
    renderQuestion();
    renderPalette();
    updateInfo();
  });

  submitBtn?.addEventListener('click', confirmSubmit);

  // Keyboard shortcuts
  document.addEventListener('keydown', e => {
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

    if (e.key === 'ArrowLeft') {
      navigateQuestion(-1);
    } else if (e.key === 'ArrowRight') {
      navigateQuestion(1);
    } else if (e.key === 'f') {
      flagBtn?.click();
    } else if (e.key >= '1' && e.key <= '4') {
      selectAnswer(parseInt(e.key) - 1);
    }
  });
}

function startTimer() {
  if (!state) return;
  state.startTime = Date.now();

  timerInterval = window.setInterval(() => {
    if (!state || !state.startTime) return;

    const elapsed = Date.now() - state.startTime;
    const remaining = EXAM_DURATION_MS - elapsed;

    if (remaining <= 0) {
      stopTimer();
      autoSubmit();
      return;
    }

    updateTimerDisplay(remaining);
  }, 1000);
}

function stopTimer() {
  if (timerInterval !== null) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
}

function updateTimerDisplay(remainingMs: number) {
  const display = document.getElementById('timer-display');
  if (!display) return;

  const totalSeconds = Math.floor(remainingMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  display.textContent = `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  // Warning colors
  if (remainingMs < 5 * 60 * 1000) {
    display.style.color = 'var(--error)';
  } else if (remainingMs < 15 * 60 * 1000) {
    display.style.color = 'var(--warning)';
  }
}

function renderQuestion() {
  const examBody = document.getElementById('exam-body');
  if (!examBody || !state) return;

  const question = state.questions[state.currentIndex];
  const currentAnswer = state.answers[state.currentIndex] ?? null;
  const isFlagged = state.flagged.includes(state.currentIndex);

  examBody.innerHTML = `
    <div class="exam-question-card">
      <div class="question-header">
        <span class="question-number">Question ${state.currentIndex + 1}</span>
        ${isFlagged ? '<span class="flag-badge">⚑ Flagged</span>' : ''}
      </div>
      <p class="question-text">${question.text}</p>

      <div class="exam-options">
        ${question.options
          .map(
            (option, idx) => `
          <button
            class="exam-option ${currentAnswer === idx ? 'selected' : ''}"
            data-index="${idx}"
          >
            <span class="option-letter">${String.fromCharCode(65 + idx)}</span>
            <span class="option-text">${option}</span>
          </button>
        `
          )
          .join('')}
      </div>
    </div>
  `;

  // Add event listeners
  examBody.querySelectorAll('.exam-option').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.getAttribute('data-index') || '0');
      selectAnswer(idx);
    });
  });

  updateNavigation();
  updateInfo();
}

function selectAnswer(idx: number) {
  if (!state) return;
  state.answers[state.currentIndex] = idx;
  renderQuestion();
  renderPalette();
}

function navigateQuestion(delta: number) {
  if (!state) return;

  const newIndex = state.currentIndex + delta;
  if (newIndex >= 0 && newIndex < state.questions.length) {
    state.currentIndex = newIndex;
    renderQuestion();
  }
}

function updateNavigation() {
  if (!state) return;

  const prevBtn = document.getElementById('prev-question') as HTMLButtonElement;
  const nextBtn = document.getElementById('next-question') as HTMLButtonElement;

  if (prevBtn) {
    prevBtn.disabled = state.currentIndex === 0;
  }

  if (nextBtn) {
    const isLast = state.currentIndex === state.questions.length - 1;
    nextBtn.textContent = isLast ? 'Finish →' : 'Next →';
  }
}

function updateInfo() {
  if (!state) return;

  const currentNum = document.getElementById('current-q-num');
  const answeredCount = document.getElementById('answered-count');
  const flaggedCount = document.getElementById('flagged-count');

  if (currentNum) currentNum.textContent = (state.currentIndex + 1).toString();
  if (answeredCount)
    answeredCount.textContent = state.answers
      .filter((a): a is number | null => a !== null && a !== undefined)
      .length.toString();
  if (flaggedCount) flaggedCount.textContent = state.flagged.length.toString();
}

function renderPalette() {
  const palette = document.getElementById('question-palette');
  if (!palette || !state) return;

  const currentState = state;

  palette.innerHTML = currentState.questions
    .map((_, idx) => {
      const answered =
        currentState.answers[idx] !== null && currentState.answers[idx] !== undefined;
      const flagged = currentState.flagged.includes(idx);
      const current = idx === currentState.currentIndex;

      let classes = 'palette-item';
      if (current) classes += ' current';
      if (answered) classes += ' answered';
      if (flagged) classes += ' flagged';

      return `<button class="${classes}" data-index="${idx}">${idx + 1}</button>`;
    })
    .join('');

  palette.querySelectorAll('.palette-item').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.getAttribute('data-index') || '0');
      if (state) {
        state.currentIndex = idx;
        renderQuestion();
      }
    });
  });
}

function confirmSubmit() {
  if (!state) return;

  const answered = state.answers.filter(a => a !== null && a !== undefined).length;
  const total = state.questions.length;
  const unanswered = total - answered;

  if (unanswered > 0) {
    const confirmed = confirm(
      `You have ${unanswered} unanswered question(s).\n\n` +
        `Score: ${answered}/${total} (${Math.round((answered / total) * 100)}%)\n\n` +
        `Are you sure you want to submit?`
    );
    if (!confirmed) return;
  } else {
    const confirmed = confirm(`Submit exam with all ${total} questions answered?`);
    if (!confirmed) return;
  }

  submitExam();
}

function autoSubmit() {
  alert('Time is up! Submitting your exam...');
  submitExam();
}

function submitExam() {
  if (!state) return;

  const currentState = state;

  stopTimer();
  currentState.endTime = Date.now();
  currentState.showResults = true;

  // Calculate score
  let score = 0;
  const results: Array<{
    question: Question;
    userAnswer: number | null;
    correct: boolean;
  }> = [];

  currentState.questions.forEach((q, idx) => {
    const userAnswer = currentState.answers[idx] ?? null;
    // Convert letter answer to index
    const correctIndex = q.answer ? q.answer.charCodeAt(0) - 65 : -1;
    const isCorrect = userAnswer === correctIndex;
    if (isCorrect) score++;
    results.push({ question: q, userAnswer, correct: isCorrect });
  });

  showResults(score, results);
}

function showResults(
  score: number,
  results: Array<{
    question: Question;
    userAnswer: number | null;
    correct: boolean;
  }>
) {
  const examBody = document.getElementById('exam-body');
  if (!examBody || !state) return;

  const percentage = Math.round((score / state.questions.length) * 100);
  const passed = percentage >= 70;
  const duration =
    state.endTime && state.startTime ? Math.floor((state.endTime - state.startTime) / 1000) : 0;
  const hours = Math.floor(duration / 3600);
  const minutes = Math.floor((duration % 3600) / 60);

  examBody.innerHTML = `
    <div class="exam-results-card">
      <div class="results-header ${passed ? 'passed' : 'failed'}">
        <div class="results-icon">${passed ? '✓' : '!'}</div>
        <h2>${passed ? 'Congratulations!' : 'Keep Studying'}</h2>
        <p class="results-subtitle">${passed ? 'You passed the practice exam' : 'You need 70% to pass'}</p>
      </div>

      <div class="results-stats">
        <div class="result-stat">
          <div class="stat-value">${score}/${state.questions.length}</div>
          <div class="stat-label">Correct Answers</div>
        </div>
        <div class="result-stat">
          <div class="stat-value">${percentage}%</div>
          <div class="stat-label">Score</div>
        </div>
        <div class="result-stat">
          <div class="stat-value">${hours}h ${minutes}m</div>
          <div class="stat-label">Time Taken</div>
        </div>
      </div>

      <div class="results-review">
        <h3>Review Answers</h3>
        ${results
          .map((r, idx) => {
            const userAnswerText =
              r.userAnswer !== null ? r.question.options[r.userAnswer] : 'No answer';
            // Convert letter answer to index
            const correctIndex = r.question.answer ? r.question.answer.charCodeAt(0) - 65 : -1;
            const correctAnswerText = r.question.options[correctIndex];

            return `
            <div class="review-item ${r.correct ? 'correct' : 'incorrect'}">
              <div class="review-indicator">${r.correct ? '✓' : '✗'}</div>
              <div class="review-content">
                <p class="review-question">${idx + 1}. ${r.question.text}</p>
                <p class="review-answer">
                  Your answer: <strong>${userAnswerText}</strong>
                  ${!r.correct ? `<br>Correct answer: <strong>${correctAnswerText}</strong>` : ''}
                </p>
              </div>
            </div>
          `;
          })
          .join('')}
      </div>

      <div class="exam-actions">
        <button class="exam-btn exam-btn-primary" id="retry-exam">
          Retry Exam
        </button>
        <button class="exam-btn" id="back-home-exam">
          Back to Home
        </button>
      </div>
    </div>
  `;

  document.getElementById('retry-exam')?.addEventListener('click', () => {
    renderExam();
  });

  document.getElementById('back-home-exam')?.addEventListener('click', () => {
    window.location.hash = 'home';
  });
}

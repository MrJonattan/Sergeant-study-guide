/**
 * Flashcards view - Leitner-style flashcards with spaced repetition
 */

import { updateBreadcrumbs } from '../components/topbar';
import { appState } from '../main';

interface Flashcard {
  term: string;
  definition: string;
  chapterId: string;
  chapterTitle: string;
}

interface FlashcardState {
  cards: Flashcard[];
  currentIndex: number;
  flipped: boolean;
  known: number[];
  learning: number[];
}

let state: FlashcardState | null = null;

export function renderFlashcards() {
  updateBreadcrumbs([{ label: 'Home', route: 'home' }, { label: 'Flashcards' }]);

  const content = document.getElementById('content');
  if (!content || !appState.data) return;

  // Build flashcards from key terms
  const cards: Flashcard[] = [];
  appState.data.chapters.forEach(chapter => {
    if (chapter.keyTerms) {
      const terms = parseKeyTerms(chapter.keyTerms);
      terms.forEach(term => {
        cards.push({
          term: term.name,
          definition: term.definition,
          chapterId: chapter.id,
          chapterTitle: chapter.title,
        });
      });
    }
  });

  if (cards.length === 0) {
    content.innerHTML = `
      <div class="empty-state">
        <h1>No Flashcards Available</h1>
        <p>Flashcards will be generated from key terms in your chapters.</p>
      </div>
    `;
    return;
  }

  // Initialize state
  state = {
    cards,
    currentIndex: 0,
    flipped: false,
    known: [],
    learning: [],
  };

  content.innerHTML = `
    <div class="flashcards-container">
      <div class="flashcards-header">
        <h1>Flashcards</h1>
        <p class="flashcards-subtitle">Leitner-style spaced repetition learning</p>
      </div>

      <div class="flashcards-stats">
        <div class="fc-stat">
          <div class="fc-stat-value">${cards.length}</div>
          <div class="fc-stat-label">Total Cards</div>
        </div>
        <div class="fc-stat">
          <div class="fc-stat-value" id="known-count">0</div>
          <div class="fc-stat-label">Mastered</div>
        </div>
        <div class="fc-stat">
          <div class="fc-stat-value" id="learning-count">0</div>
          <div class="fc-stat-label">Learning</div>
        </div>
      </div>

      <div class="flashcard-wrapper">
        <div class="flashcard" id="flashcard">
          <div class="flashcard-inner">
            <div class="flashcard-front">
              <div class="flashcard-chapter" id="card-chapter"></div>
              <div class="flashcard-term" id="card-term"></div>
              <div class="flashcard-hint">Tap or press Space to flip</div>
            </div>
            <div class="flashcard-back">
              <div class="flashcard-label">Definition</div>
              <div class="flashcard-definition" id="card-definition"></div>
            </div>
          </div>
        </div>
      </div>

      <div class="flashcard-controls">
        <button class="fc-btn" id="prev-card">← Previous</button>
        <button class="fc-btn fc-btn-primary" id="flip-card">Flip</button>
        <button class="fc-btn" id="next-card">Next →</button>
      </div>

      <div class="flashcard-actions">
        <button class="fc-btn fc-btn-outline" id="know-btn">
          ✓ I Know This
        </button>
        <button class="fc-btn fc-btn-outline" id="learning-btn">
          ⏳ Still Learning
        </button>
      </div>

      <div class="flashcard-progress">
        <span id="card-counter">1 / ${cards.length}</span>
      </div>
    </div>
  `;

  initFlashcardListeners();
  renderCard();
}

function parseKeyTerms(markdown: string): Array<{ name: string; definition: string }> {
  const terms: Array<{ name: string; definition: string }> = [];
  const lines = markdown.split('\n');

  for (const line of lines) {
    // Match table rows: | **Term** | Definition |
    const match = line.match(/\|\s*\*\*([^*]+)\*\*\s*\|\s*([^|]+)\|/);
    if (match) {
      terms.push({
        name: match[1].trim(),
        definition: match[2].trim(),
      });
    }
  }

  return terms;
}

function initFlashcardListeners() {
  const card = document.getElementById('flashcard');
  const flipBtn = document.getElementById('flip-card');
  const prevBtn = document.getElementById('prev-card');
  const nextBtn = document.getElementById('next-card');
  const knowBtn = document.getElementById('know-btn');
  const learningBtn = document.getElementById('learning-btn');

  // Flip on card click
  card?.addEventListener('click', () => {
    state!.flipped = !state!.flipped;
    updateCardFlip();
  });

  // Flip button
  flipBtn?.addEventListener('click', () => {
    state!.flipped = !state!.flipped;
    updateCardFlip();
  });

  // Navigation
  prevBtn?.addEventListener('click', () => {
    if (state && state.currentIndex > 0) {
      state.currentIndex--;
      state.flipped = false;
      renderCard();
    }
  });

  nextBtn?.addEventListener('click', () => {
    if (state && state.currentIndex < state.cards.length - 1) {
      state.currentIndex++;
      state.flipped = false;
      renderCard();
    }
  });

  // Mark as known
  knowBtn?.addEventListener('click', () => {
    if (state && !state.known.includes(state.currentIndex)) {
      state.known.push(state.currentIndex);
      updateStats();
      nextCard();
    }
  });

  // Mark as learning
  learningBtn?.addEventListener('click', () => {
    if (state && !state.learning.includes(state.currentIndex)) {
      state.learning.push(state.currentIndex);
      updateStats();
      nextCard();
    }
  });

  // Keyboard shortcuts
  document.addEventListener('keydown', e => {
    if (e.target instanceof HTMLInputElement) return;

    switch (e.key) {
      case ' ':
      case 'Enter':
        e.preventDefault();
        state!.flipped = !state!.flipped;
        updateCardFlip();
        break;
      case 'ArrowLeft':
        if (state && state.currentIndex > 0) {
          state.currentIndex--;
          state.flipped = false;
          renderCard();
        }
        break;
      case 'ArrowRight':
        if (state && state.currentIndex < state.cards.length - 1) {
          state.currentIndex++;
          state.flipped = false;
          renderCard();
        }
        break;
      case 'k':
        knowBtn?.click();
        break;
      case 'l':
        learningBtn?.click();
        break;
    }
  });
}

function renderCard() {
  if (!state) return;

  const card = state.cards[state.currentIndex];
  const chapterEl = document.getElementById('card-chapter');
  const termEl = document.getElementById('card-term');
  const definitionEl = document.getElementById('card-definition');
  const counterEl = document.getElementById('card-counter');

  if (chapterEl) chapterEl.textContent = card.chapterTitle;
  if (termEl) termEl.textContent = card.term;
  if (definitionEl) definitionEl.textContent = card.definition;
  if (counterEl) counterEl.textContent = `${state.currentIndex + 1} / ${state.cards.length}`;

  updateCardFlip();
  updateStats();
}

function updateCardFlip() {
  const card = document.getElementById('flashcard');
  if (!card || !state) return;

  if (state.flipped) {
    card.classList.add('flipped');
  } else {
    card.classList.remove('flipped');
  }
}

function updateStats() {
  if (!state) return;

  const knownEl = document.getElementById('known-count');
  const learningEl = document.getElementById('learning-count');

  if (knownEl) knownEl.textContent = state.known.length.toString();
  if (learningEl) learningEl.textContent = state.learning.length.toString();
}

function nextCard() {
  if (!state) return;

  if (state.currentIndex < state.cards.length - 1) {
    state.currentIndex++;
    state.flipped = false;
    renderCard();
  } else {
    showSummary();
  }
}

function showSummary() {
  const content = document.getElementById('content');
  if (!content || !state) return;

  const total = state.cards.length;
  const known = state.known.length;
  const percentage = Math.round((known / total) * 100);

  content.innerHTML = `
    <div class="flashcards-summary">
      <h1>Session Complete!</h1>
      <p class="summary-subtitle">Great practice session</p>

      <div class="summary-stats">
        <div class="summary-stat">
          <div class="summary-value">${known}/${total}</div>
          <div class="summary-label">Cards Mastered</div>
        </div>
        <div class="summary-stat">
          <div class="summary-value">${percentage}%</div>
          <div class="summary-label">Mastery Rate</div>
        </div>
      </div>

      <div class="summary-actions">
        <button class="fc-btn fc-btn-primary" id="restart-cards">
          Study Again
        </button>
        <button class="fc-btn" id="back-home-fc">
          Back to Home
        </button>
      </div>
    </div>
  `;

  document.getElementById('restart-cards')?.addEventListener('click', renderFlashcards);
  document.getElementById('back-home-fc')?.addEventListener('click', () => {
    window.location.hash = 'home';
  });
}

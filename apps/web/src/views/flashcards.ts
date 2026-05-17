/**
 * Flashcards view - Leitner-style flashcards with spaced repetition
 */

import { updateBreadcrumbs } from '../components/topbar';
import { appState } from '../main';
import { getFlashcardProgress, updateFlashcardProgress } from '../state/progress';

interface Flashcard {
  id: string;
  term: string;
  definition: string;
  chapterId: string;
  chapterTitle: string;
  stage: number; // Leitner stage 1-5
  nextReview?: number; // Timestamp for next review
}

type FlashcardFilter = 'all' | 'pg' | 'ag';

interface FlashcardState {
  cards: Flashcard[];
  sessionCards: number[]; // Indices of cards due for review
  currentIndex: number;
  flipped: boolean;
  known: number[];
  learning: number[];
  sessionStart: number;
  sessionCorrect: number;
  filter: FlashcardFilter;
}

let state: FlashcardState | null = null;

export function renderFlashcards() {
  updateBreadcrumbs([{ label: 'Home', route: 'home' }, { label: 'Flashcards' }]);

  const content = document.getElementById('content');
  if (!content || !appState.data) return;

  // Build flashcards from key terms with spaced repetition data
  const cards: Flashcard[] = [];
  appState.data.chapters.forEach(chapter => {
    if (chapter.keyTerms) {
      const terms = parseKeyTerms(chapter.keyTerms);
      terms.forEach((term, idx) => {
        const cardId = `${chapter.id}-${idx}`;
        const progress = getFlashcardProgress(cardId);
        cards.push({
          id: cardId,
          term: term.name,
          definition: term.definition,
          chapterId: chapter.id,
          chapterTitle: chapter.title,
          stage: progress.stage,
          nextReview: progress.nextReview,
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

  // Filter cards due for review (Leitner system)
  const now = Date.now();
  const getDueCards = (filter: FlashcardFilter = 'all') => {
    return cards
      .map((card, idx) => ({ card, idx }))
      .filter(({ card }) => {
        // Apply source filter
        if (filter === 'pg' && !card.chapterId.startsWith('2')) return false;
        if (filter === 'ag' && !card.chapterId.startsWith('3')) return false;
        // Apply due date filter
        return !card.nextReview || card.nextReview <= now;
      })
      .map(({ idx }) => idx);
  };

  const dueCards = getDueCards('all');

  // If no cards due, show all but indicate they're mastered
  const sessionCards = dueCards.length > 0 ? dueCards : cards.map((_, i) => i);

  // Count cards by source
  const pgCards = cards.filter(c => c.chapterId.startsWith('2')).length;
  const agCards = cards.filter(c => c.chapterId.startsWith('3')).length;

  // Initialize state
  state = {
    cards,
    sessionCards,
    currentIndex: 0,
    flipped: false,
    known: [],
    learning: [],
    sessionStart: sessionCards.length,
    sessionCorrect: 0,
    filter: 'all',
  };

  const totalCards = cards.length;
  const dueCount = sessionCards.length;

  content.innerHTML = `
    <div class="flashcards-container">
      <div class="flashcards-header">
        <h1>Flashcards</h1>
        <p class="flashcards-subtitle">Leitner spaced repetition system</p>
      </div>

      <div class="flashcards-filter">
        <button class="fc-filter-btn ${state.filter === 'all' ? 'active' : ''}" data-filter="all">
          All (${totalCards})
        </button>
        <button class="fc-filter-btn ${state.filter === 'pg' ? 'active' : ''}" data-filter="pg">
          P.G. Procedures (${pgCards})
        </button>
        <button class="fc-filter-btn ${state.filter === 'ag' ? 'active' : ''}" data-filter="ag">
          A.G. Procedures (${agCards})
        </button>
      </div>

      <div class="flashcards-stats">
        <div class="fc-stat">
          <div class="fc-stat-value">${totalCards}</div>
          <div class="fc-stat-label">Total Cards</div>
        </div>
        <div class="fc-stat">
          <div class="fc-stat-value" id="due-count">${dueCount}</div>
          <div class="fc-stat-label">Due Now</div>
        </div>
        <div class="fc-stat">
          <div class="fc-stat-value" id="mastered-count">0</div>
          <div class="fc-stat-label">Mastered (Stage 5)</div>
        </div>
      </div>

      <div class="flashcards-session" ${dueCount === 0 ? 'style="opacity:0.5"' : ''}>
        <p class="session-info">
          ${
            dueCount > 0
              ? `📚 ${dueCount} cards due for review`
              : `✓ All cards reviewed! Showing full deck.`
          }
        </p>
      </div>

      <div class="flashcard-wrapper">
        <div class="flashcard" id="flashcard">
          <div class="flashcard-inner">
            <div class="flashcard-front">
              <div class="flashcard-chapter" id="card-chapter"></div>
              <div class="flashcard-term" id="card-term"></div>
              <div class="flashcard-stage" id="card-stage"></div>
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
        <button class="fc-btn fc-btn-outline" id="know-btn" title="Move to next stage">
          ✓ Know It
        </button>
        <button class="fc-btn fc-btn-outline" id="learning-btn" title="Reset to stage 1">
          ⏳ Learning
        </button>
      </div>

      <div class="flashcard-progress">
        <span id="card-counter">1 / ${sessionCards.length}</span>
        <span id="session-progress">Session: 0 correct</span>
      </div>
    </div>
  `;

  initFlashcardListeners();
  attachFilterListeners();
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
    if (state && state.currentIndex < state.sessionCards.length - 1) {
      state.currentIndex++;
      state.flipped = false;
      renderCard();
    }
  });

  // Mark as known - advance to next Leitner stage
  knowBtn?.addEventListener('click', () => {
    if (!state) return;
    const sessionIdx = state.sessionCards[state.currentIndex];
    const card = state.cards[sessionIdx];

    // Advance stage (max 5)
    const newStage = Math.min(card.stage + 1, 5);
    updateFlashcardProgress(card.id, newStage);

    state.sessionCorrect++;
    state.known.push(state.currentIndex);
    updateStats();
    nextCard();
  });

  // Mark as learning - reset to stage 1
  learningBtn?.addEventListener('click', () => {
    if (!state) return;
    const sessionIdx = state.sessionCards[state.currentIndex];
    const card = state.cards[sessionIdx];

    // Reset to stage 1
    updateFlashcardProgress(card.id, 1);

    state.learning.push(state.currentIndex);
    updateStats();
    nextCard();
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
        if (state && state.currentIndex < state.sessionCards.length - 1) {
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

function attachFilterListeners() {
  document.querySelectorAll('.fc-filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const filter = btn.getAttribute('data-filter') as FlashcardFilter;
      if (!state || !filter) return;

      state.filter = filter;

      // Update active state on buttons
      document.querySelectorAll('.fc-filter-btn').forEach(b => b.classList.remove('active'));
      (btn as HTMLElement).classList.add('active');

      // Recalculate session cards with new filter
      const now = Date.now();
      const filteredCards = state.cards
        .map((card, idx) => ({ card, idx }))
        .filter(({ card }) => {
          if (filter === 'pg' && !card.chapterId.startsWith('2')) return false;
          if (filter === 'ag' && !card.chapterId.startsWith('3')) return false;
          return !card.nextReview || card.nextReview <= now;
        })
        .map(({ idx }) => idx);

      state.sessionCards =
        filteredCards.length > 0
          ? filteredCards
          : state.cards
              .map((_, idx) => idx)
              .filter(idx => {
                const card = state!.cards[idx];
                if (filter === 'pg' && !card.chapterId.startsWith('2')) return false;
                if (filter === 'ag' && !card.chapterId.startsWith('3')) return false;
                return true;
              });

      state.currentIndex = 0;
      state.flipped = false;

      // Re-render
      renderFlashcards();
    });
  });
}

function renderCard() {
  if (!state) return;

  const sessionIdx = state.sessionCards[state.currentIndex];
  const card = state.cards[sessionIdx];
  const chapterEl = document.getElementById('card-chapter');
  const termEl = document.getElementById('card-term');
  const definitionEl = document.getElementById('card-definition');
  const stageEl = document.getElementById('card-stage');
  const counterEl = document.getElementById('card-counter');
  const progressEl = document.getElementById('session-progress');

  if (chapterEl) chapterEl.textContent = card.chapterTitle;
  if (termEl) termEl.textContent = card.term;
  if (definitionEl) definitionEl.textContent = card.definition;
  if (stageEl) stageEl.textContent = `Stage ${card.stage}/5`;
  if (counterEl) counterEl.textContent = `${state.currentIndex + 1} / ${state.sessionCards.length}`;
  if (progressEl) progressEl.textContent = `Session: ${state.sessionCorrect} correct`;

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

  const masteredEl = document.getElementById('mastered-count');
  const dueEl = document.getElementById('due-count');

  // Count mastered cards (stage 5)
  const masteredCount = state.cards.filter(c => c.stage >= 5).length;
  // Count due cards
  const now = Date.now();
  const dueCount = state.cards.filter(c => !c.nextReview || c.nextReview <= now).length;

  if (masteredEl) masteredEl.textContent = masteredCount.toString();
  if (dueEl) dueEl.textContent = dueCount.toString();
}

function nextCard() {
  if (!state) return;

  if (state.currentIndex < state.sessionCards.length - 1) {
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

  const total = state.sessionCards.length;
  const known = state.sessionCorrect;
  const percentage = total > 0 ? Math.round((known / total) * 100) : 0;

  content.innerHTML = `
    <div class="flashcards-summary">
      <h1>Session Complete!</h1>
      <p class="summary-subtitle">Great practice session</p>

      <div class="summary-stats">
        <div class="summary-stat">
          <div class="summary-value">${known}/${total}</div>
          <div class="summary-label">Cards Reviewed</div>
        </div>
        <div class="summary-stat">
          <div class="summary-value">${percentage}%</div>
          <div class="summary-label">Accuracy</div>
        </div>
        <div class="summary-stat">
          <div class="summary-value" id="summary-mastered">0</div>
          <div class="summary-label">Total Mastered</div>
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

  // Update mastered count
  const masteredEl = document.getElementById('summary-mastered');
  if (masteredEl) {
    masteredEl.textContent = state.cards.filter(c => c.stage >= 5).length.toString();
  }

  document.getElementById('restart-cards')?.addEventListener('click', renderFlashcards);
  document.getElementById('back-home-fc')?.addEventListener('click', () => {
    window.location.hash = 'home';
  });
}

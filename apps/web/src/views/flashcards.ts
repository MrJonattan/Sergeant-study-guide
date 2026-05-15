/**
 * Flashcards view - Leitner-style flashcards
 */

import { updateBreadcrumbs } from '../components/topbar';

export function renderFlashcards() {
  updateBreadcrumbs([
    { label: 'Home', route: 'home' },
    { label: 'Flashcards' },
  ]);

  const content = document.getElementById('content');
  if (!content) return;

  content.innerHTML = `
    <h1>Flashcards</h1>
    <p>Leitner-style flashcards for spaced repetition learning.</p>
    <div class="flashcard">
      <div class="flashcard-inner">
        <div class="flashcard-front">
          <div class="flashcard-label">Key Term</div>
          <div class="flashcard-text">Category I Vehicle</div>
        </div>
        <div class="flashcard-back">
          <div class="flashcard-label">Definition</div>
          <div class="flashcard-text">A vehicle owned or leased by the NYPD.</div>
        </div>
      </div>
    </div>
    <p style="text-align: center; opacity: 0.6; margin-top: 1rem;">Tap card to flip</p>
  `;

  // Add flip functionality
  const flashcard = content.querySelector('.flashcard');
  if (flashcard) {
    flashcard.addEventListener('click', () => {
      flashcard.classList.toggle('flipped');
    });
  }
}

/**
 * Chapter detail view - Renders chapter content with tabs
 */

import { appState } from '../main';
import { updateBreadcrumbs } from '../components/topbar';
import { renderMarkdown } from '../utils/markdown';
import { getProgress, updateChapterPosition } from '../state/progress';
import { addBookmark, removeBookmark, isBookmarked } from '../state/bookmarks';
import {
  getHighlightsForChapter,
  addHighlight,
  removeHighlight,
  type Highlight,
} from '../state/highlights';

interface Chapter {
  id: string;
  sectionNum: string;
  title: string;
  readme: string;
  sections: Array<{ filename: string; content: string }>;
  questions: Array<{ number: number; text: string; options?: string[]; answer?: string }>;
}

let currentTab = 'study';
let scrollDebounceTimer: ReturnType<typeof setTimeout> | null = null;

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

  // Reset toolbar state on new chapter render
  isToolbarVisible = false;
  pendingHighlightText = '';

  // Clear any pending selection timeout
  if (selectionTimeout) {
    clearTimeout(selectionTimeout);
    selectionTimeout = null;
  }

  // Dismiss any existing toolbar
  dismissToolbar();

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
      <div class="tab ${currentTab === 'quick-quiz' ? 'active' : ''}" data-tab="quick-quiz">Quick Quiz</div>
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
      case 'quick-quiz':
        renderQuickQuizTab(chapter, chapterBody);
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

  // Add bookmark buttons to headings and callouts
  addBookmarkButtons(chapter, container);

  // Restore scroll position if available
  const progress = getProgress(chapter.id);
  if (progress?.lastScrollPosition && progress.lastScrollPosition > 0) {
    // Wait for images and content to fully load, then restore scroll
    window.addEventListener(
      'load',
      () => {
        window.scrollTo({ top: progress.lastScrollPosition!, behavior: 'auto' });
      },
      { once: true }
    );

    // Fallback in case load event already fired
    setTimeout(() => {
      window.scrollTo({ top: progress.lastScrollPosition!, behavior: 'auto' });
    }, 200);
  }

  // Set up scroll tracking with debounce
  setupScrollTracking(chapter.id, container);
}

function addBookmarkButtons(chapter: Chapter, container: HTMLElement) {
  // Add bookmark buttons to H2 and H3 headings
  const headings = container.querySelectorAll('h2, h3');
  headings.forEach(heading => {
    // Skip if already has bookmark button
    if (heading.querySelector('.bookmark-btn')) return;

    const slug =
      heading.textContent
        ?.toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '') || '';

    // Find the section filename from the chapter sections
    const sectionFilename = findSectionFilename(chapter, heading.textContent || '');

    const bookmarkId = `${chapter.id}-${sectionFilename}-${slug}`;
    const bookmarked = isBookmarked(bookmarkId);

    const btn = document.createElement('button');
    btn.className = `bookmark-btn ${bookmarked ? 'bookmarked' : ''}`;
    btn.innerHTML = bookmarked ? '★' : '☆';
    btn.setAttribute('aria-label', bookmarked ? 'Remove bookmark' : 'Add bookmark');
    btn.dataset.bookmarkId = bookmarkId;
    btn.dataset.chapterId = chapter.id;
    btn.dataset.chapterTitle = chapter.title;
    btn.dataset.sectionFilename = sectionFilename;
    btn.dataset.sectionTitle = heading.textContent || '';

    // Position button at top-right of heading
    heading.style.position = 'relative';
    heading.appendChild(btn);

    btn.addEventListener('click', e => {
      e.stopPropagation();
      toggleBookmark(btn);
    });
  });

  // Set up text selection handling for highlights
  setupHighlightSelection(chapter, container);

  // Render highlights after content is in place
  renderHighlightsForChapter(chapter, container);

  // Add bookmark buttons to callout blocks
  const callouts = container.querySelectorAll('.callout');
  callouts.forEach(callout => {
    // Skip if already has bookmark button
    if (callout.querySelector('.bookmark-btn')) return;

    const calloutTitleEl = callout.querySelector('.callout-title');
    const calloutType = calloutTitleEl?.textContent || 'callout';

    // Find the closest preceding heading to get section context
    let precedingHeading: Element | null = callout;
    while (precedingHeading && !precedingHeading.matches('h2, h3')) {
      precedingHeading = precedingHeading.previousElementSibling;
    }

    const sectionTitle = precedingHeading?.textContent || 'Unknown Section';
    const sectionFilename = findSectionFilename(chapter, sectionTitle);
    const slug = `${calloutType.toLowerCase().replace(/\s+/g, '-')}`;

    const bookmarkId = `${chapter.id}-${sectionFilename}-${slug}`;
    const bookmarked = isBookmarked(bookmarkId);

    // Get callout text content (paragraph inside callout)
    const calloutTextEl = callout.querySelector('p');
    const calloutText = calloutTextEl?.textContent || '';

    const btn = document.createElement('button');
    btn.className = `bookmark-btn callout-bookmark-btn ${bookmarked ? 'bookmarked' : ''}`;
    btn.innerHTML = bookmarked ? '★' : '☆';
    btn.setAttribute('aria-label', bookmarked ? 'Remove bookmark' : 'Add bookmark');
    btn.dataset.bookmarkId = bookmarkId;
    btn.dataset.chapterId = chapter.id;
    btn.dataset.chapterTitle = chapter.title;
    btn.dataset.sectionFilename = sectionFilename;
    btn.dataset.sectionTitle = sectionTitle;
    btn.dataset.calloutText = calloutText;

    callout.appendChild(btn);

    btn.addEventListener('click', e => {
      e.stopPropagation();
      toggleBookmark(btn);
    });
  });
}

function findSectionFilename(chapter: Chapter, headingText: string): string {
  // Try to match heading text to a section filename
  const normalizedHeading = headingText
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');

  for (const section of chapter.sections) {
    const filename = section.filename.replace('section-', '').replace('.md', '');
    if (filename.includes(normalizedHeading) || normalizedHeading.includes(filename)) {
      return section.filename;
    }
  }

  // Fallback: use first section or chapter id
  return chapter.sections[0]?.filename || `${chapter.id}.md`;
}

function toggleBookmark(btn: HTMLButtonElement) {
  const bookmarkId = btn.dataset.bookmarkId;
  const chapterId = btn.dataset.chapterId;
  const chapterTitle = btn.dataset.chapterTitle;
  const sectionFilename = btn.dataset.sectionFilename;
  const sectionTitle = btn.dataset.sectionTitle;
  const calloutText = btn.dataset.calloutText;

  if (!bookmarkId || !chapterId || !chapterTitle || !sectionFilename || !sectionTitle) {
    return;
  }

  const isCurrentlyBookmarked = btn.classList.contains('bookmarked');

  if (isCurrentlyBookmarked) {
    removeBookmark(bookmarkId);
    btn.classList.remove('bookmarked');
    btn.innerHTML = '☆';
    btn.setAttribute('aria-label', 'Add bookmark');
  } else {
    addBookmark({
      id: bookmarkId,
      chapterId,
      chapterTitle,
      sectionFilename,
      sectionTitle,
      calloutText: calloutText || undefined,
    });
    btn.classList.add('bookmarked');
    btn.innerHTML = '★';
    btn.setAttribute('aria-label', 'Remove bookmark');
  }
}

function setupScrollTracking(chapterId: string, container: HTMLElement) {
  // Track section navigation - find all section headings and add click handlers
  const sectionHeadings = container.querySelectorAll('h1, h2');
  sectionHeadings.forEach(heading => {
    heading.addEventListener('click', () => {
      const sectionId =
        heading.id ||
        heading.textContent
          ?.toLowerCase()
          .replace(/\s+/g, '-')
          .replace(/[^a-z0-9-]/g, '');
      if (sectionId) {
        updateChapterPosition(chapterId, sectionId, window.scrollY);
      }
    });
  });

  // Debounced scroll position tracking
  const handleScroll = () => {
    if (scrollDebounceTimer) {
      clearTimeout(scrollDebounceTimer);
    }
    scrollDebounceTimer = setTimeout(() => {
      updateChapterPosition(chapterId, undefined, window.scrollY);
    }, 250);
  };

  window.addEventListener('scroll', handleScroll, { passive: true });

  // Save position on page unload (before navigating away)
  window.addEventListener('beforeunload', () => {
    if (scrollDebounceTimer) {
      clearTimeout(scrollDebounceTimer);
    }
    updateChapterPosition(chapterId, undefined, window.scrollY);
  });

  // Clean up on navigation (handled by innerHTML replacement)
}

// ─────────────────────────────────────────────
// Text Highlighting
// ─────────────────────────────────────────────

let cleanupToolbar: (() => void) | null = null;
let isToolbarVisible = false;
let pendingHighlightText = '';
let selectionChangeHandler: (() => void) | null = null;
let selectionTimeout: ReturnType<typeof setTimeout> | null = null;

// Expose reset function for testing
if (typeof window !== 'undefined') {
  (window as any).__resetHighlightState = () => {
    isToolbarVisible = false;
    pendingHighlightText = '';
    if (selectionTimeout) {
      clearTimeout(selectionTimeout);
      selectionTimeout = null;
    }
    if (selectionChangeHandler) {
      document.removeEventListener('selectionchange', selectionChangeHandler);
      selectionChangeHandler = null;
    }
    if (cleanupToolbar) {
      cleanupToolbar();
    }
  };
}

function setupHighlightSelection(chapter: Chapter) {
  const chapterBody = document.getElementById('chapter-body');
  if (!chapterBody) return;

  // Remove previous handlers to prevent duplicates
  if (selectionChangeHandler) {
    document.removeEventListener('selectionchange', selectionChangeHandler);
  }
  if (selectionTimeout) {
    clearTimeout(selectionTimeout);
    selectionTimeout = null;
  }

  // Reset toolbar state on new chapter setup
  isToolbarVisible = false;
  pendingHighlightText = '';

  // Desktop: mouseup event
  const mouseupHandler = () => {
    if (!isToolbarVisible) {
      handleTextSelection(chapter);
    }
  };
  chapterBody.addEventListener('mouseup', mouseupHandler);

  // Mobile + programmatic: selectionchange event (with debounce)
  selectionChangeHandler = () => {
    if (selectionTimeout) {
      clearTimeout(selectionTimeout);
    }
    selectionTimeout = setTimeout(() => {
      const selection = document.getSelection();
      if (!selection?.toString().trim()) {
        // Selection was cleared - reset toolbar flag
        isToolbarVisible = false;
      } else if (!isToolbarVisible) {
        handleTextSelection(chapter);
      }
    }, 50);
  };
  document.addEventListener('selectionchange', selectionChangeHandler);

  // Dismiss toolbar on click elsewhere - use capture phase to ensure it runs first
  document.addEventListener(
    'click',
    e => {
      const target = e.target as HTMLElement;
      // Don't dismiss if clicking on toolbar or highlight
      if (
        !target.closest('.highlight-toolbar') &&
        !target.closest('.highlight-popover') &&
        !target.closest('.hl-yellow')
      ) {
        dismissToolbar();
      }
    },
    true
  );
}

function handleTextSelection(chapter: Chapter) {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return;

  const range = selection.getRangeAt(0);

  // Ensure selection is within chapter body
  const chapterBody = document.getElementById('chapter-body');
  if (!chapterBody || !chapterBody.contains(range.commonAncestorContainer)) {
    dismissToolbar();
    return;
  }

  // Find the text node at the start of the selection
  let startNode: Node | null = range.startContainer;
  if (startNode.nodeType !== Node.TEXT_NODE) {
    // If startContainer is an element, find its first text node
    while (startNode && startNode.nodeType !== Node.TEXT_NODE) {
      startNode = startNode.firstChild;
    }
  }

  if (!startNode) return;

  // Extract selected text from the text node using offsets
  // This handles the case where the paragraph has nested elements
  const selectedText =
    startNode.textContent?.substring(range.startOffset, range.endOffset)?.trim() || '';

  if (!selectedText) {
    dismissToolbar();
    return;
  }

  // Get the parent element to find section context
  let parentElement = range.startContainer;
  while (parentElement && parentElement.nodeType !== Node.ELEMENT_NODE) {
    parentElement = parentElement.parentNode;
  }

  if (!parentElement) return;

  // Find the section filename
  let sectionFilename = 'unknown';

  // Find preceding heading to determine section
  let precedingHeading: Element | null = parentElement as Element;
  while (precedingHeading && !precedingHeading.matches('h1, h2')) {
    precedingHeading = precedingHeading.previousElementSibling;
  }

  if (precedingHeading) {
    sectionFilename = findSectionFilename(chapter, precedingHeading.textContent || '');
  }

  // Compute context (40 chars before and after) from the start node
  const textContent = startNode.textContent || '';
  const startOffset = range.startOffset;
  const endOffset = range.endOffset;

  const contextBefore = textContent.substring(Math.max(0, startOffset - 40), startOffset);
  const contextAfter = textContent.substring(
    endOffset,
    Math.min(textContent.length, endOffset + 40)
  );

  // Store pending text in module-level variable
  pendingHighlightText = selectedText;

  // Show toolbar
  showHighlightToolbar(range, () => {
    const highlight = addHighlight({
      id: generateUuid(),
      chapterId: chapter.id,
      sectionFilename,
      text: pendingHighlightText,
      contextBefore,
      contextAfter,
      color: 'yellow',
    });

    dismissToolbar();
    selection.removeAllRanges();

    // Re-render highlights
    renderHighlightsForChapter(chapter, container);

    // Scroll to the new highlight
    const markEl = container.querySelector(`[data-highlight-id="${highlight.id}"]`);
    if (markEl) {
      markEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  });
}

function showHighlightToolbar(range: Range, onHighlight: () => void) {
  // Remove existing toolbar
  dismissToolbar();

  const toolbar = document.createElement('div');
  toolbar.className = 'highlight-toolbar';
  toolbar.innerHTML = `
    <button class="highlight-toolbar-btn">
      <span class="highlight-color-swatch"></span>
      Highlight
    </button>
  `;

  // Position toolbar above selection
  const rect = range.getBoundingClientRect();
  toolbar.style.left = `${rect.left + rect.width / 2 - 50}px`;
  toolbar.style.top = `${rect.top - 45}px`;

  document.body.appendChild(toolbar);
  currentToolbar = toolbar;

  // Set flag to prevent re-entry
  isToolbarVisible = true;

  // Add click handler
  toolbar.querySelector('.highlight-toolbar-btn')?.addEventListener('click', e => {
    e.preventDefault();
    e.stopPropagation();
    onHighlight();
  });

  // Cleanup function
  cleanupToolbar = () => {
    if (toolbar && toolbar.parentNode) {
      toolbar.remove();
    }
    currentToolbar = null;
    cleanupToolbar = null;
  };
}

function dismissToolbar() {
  if (cleanupToolbar) {
    cleanupToolbar();
  }
  // Clear flag
  isToolbarVisible = false;
}

function renderHighlightsForChapter(chapter: Chapter, container: HTMLElement) {
  const highlights = getHighlightsForChapter(chapter.id);

  if (highlights.length === 0) return;

  // Get all text nodes in the container
  const textNodes: Array<{ node: Node; text: string; parent: Element }> = [];

  function collectTextNodes(node: Node, parent: Element) {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent || '';
      if (text.trim()) {
        textNodes.push({ node, text, parent });
      }
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node as Element;
      // Skip existing mark elements and bookmark buttons
      if (el.matches('mark, .bookmark-btn, .highlight-toolbar, .highlight-popover')) return;
      for (const child of el.childNodes) {
        collectTextNodes(child, el);
      }
    }
  }

  collectTextNodes(container, container);

  // For each highlight, find and wrap the text
  for (const highlight of highlights) {
    wrapHighlightText(textNodes, highlight);
  }
}

function wrapHighlightText(
  textNodes: Array<{ node: Node; text: string; parent: Element }>,
  highlight: Highlight
) {
  // First try to find exact match with context
  const searchPattern = highlight.contextBefore + highlight.text + highlight.contextAfter;

  for (const { node, text } of textNodes) {
    const index = text.indexOf(searchPattern);
    if (index === -1) continue;

    const textStart = index + highlight.contextBefore.length;
    const textEnd = textStart + highlight.text.length;

    // Validate offsets against the stored text
    if (textStart < 0 || textEnd > text.length || textStart >= textEnd) continue;

    // Validate offsets against the actual node length
    const nodeLength = node.textContent?.length || 0;
    if (textEnd > nodeLength) continue;

    const range = document.createRange();
    range.setStart(node, textStart);
    range.setEnd(node, textEnd);

    if (node.parentNode?.matches('mark.hl-yellow')) {
      return; // Already wrapped, exit early
    }

    const mark = document.createElement('mark');
    mark.className = 'hl-yellow';
    mark.dataset.highlightId = highlight.id;

    try {
      range.surroundContents(mark);
      mark.addEventListener('click', e => {
        e.stopPropagation();
        showHighlightPopover(mark, highlight);
      });
      return; // Success - exit function
    } catch (err) {
      console.warn('Failed to wrap highlight (context match):', err);
      // Continue to fallback
    }
  }

  // Fallback: search by text alone
  for (const { node, text } of textNodes) {
    const textIndex = text.indexOf(highlight.text);
    if (textIndex === -1) continue;

    // Validate offsets against the stored text
    if (textIndex < 0 || textIndex + highlight.text.length > text.length) continue;

    // Validate offsets against the actual node length
    const nodeLength = node.textContent?.length || 0;
    if (textIndex + highlight.text.length > nodeLength) continue;

    if (node.parentNode?.matches('mark.hl-yellow')) {
      return; // Already wrapped, exit early
    }

    const range = document.createRange();
    try {
      range.setStart(node, textIndex);
      range.setEnd(node, textIndex + highlight.text.length);

      const mark = document.createElement('mark');
      mark.className = 'hl-yellow';
      mark.dataset.highlightId = highlight.id;

      range.surroundContents(mark);
      mark.addEventListener('click', e => {
        e.stopPropagation();
        showHighlightPopover(mark, highlight);
      });
      return; // Success - exit function
    } catch (err) {
      console.warn('Failed to wrap highlight (text match):', err);
      // Continue to next node
    }
  }
}

function showHighlightPopover(markEl: HTMLElement, highlight: Highlight) {
  // Remove existing popover
  const existingPopover = document.querySelector('.highlight-popover');
  if (existingPopover) {
    existingPopover.remove();
  }

  const popover = document.createElement('div');
  popover.className = 'highlight-popover';
  popover.innerHTML = `
    <button class="highlight-popover-btn">Remove highlight</button>
  `;

  // Position popover near the highlight
  const rect = markEl.getBoundingClientRect();
  popover.style.left = `${rect.left}px`;
  popover.style.top = `${rect.bottom + 5}px`;

  document.body.appendChild(popover);

  // Add click handler
  popover.querySelector('.highlight-popover-btn')?.addEventListener('click', e => {
    e.preventDefault();
    e.stopPropagation();

    // Remove the highlight
    removeHighlight(highlight.id);

    // Remove the mark element
    markEl.replaceWith(markEl.textContent);

    // Remove popover
    popover.remove();

    // Re-render to update any other instances
    const chapterBody = document.getElementById('chapter-body');
    if (chapterBody && appState.data) {
      const chapter = appState.data.chapters.find((c: any) => c.id === highlight.chapterId);
      if (chapter) {
        renderHighlightsForChapter(chapter, chapterBody);
      }
    }
  });

  // Dismiss on click elsewhere
  const dismissHandler = (e: Event) => {
    const target = e.target as Node;
    if (!popover.contains(target) && target !== markEl) {
      popover.remove();
      document.removeEventListener('click', dismissHandler);
    }
  };

  // Use setTimeout to avoid immediate dismissal
  setTimeout(() => {
    document.addEventListener('click', dismissHandler);
  }, 0);
}

function generateUuid(): string {
  // Simple UUID v4 generator
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
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

/**
 * Get 10 random MC questions from the chapter
 * Only includes multiple-choice questions with options and answer
 */
function getQuickQuizQuestions(chapter: Chapter, count: number): Chapter['questions'] {
  const mcQuestions = chapter.questions.filter(
    q => q.type === 'mc' && q.options && q.options.length > 0 && q.answer
  );

  // If fewer than count questions, use all available
  const actualCount = Math.min(count, mcQuestions.length);
  const shuffled = mcQuestions.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, actualCount);
}

let quickQuizState: ChapterQuizState | null = null;

function renderQuickQuizTab(chapter: Chapter, container: HTMLElement) {
  if (!chapter.questions || chapter.questions.length === 0) {
    container.innerHTML = '<p>No practice questions available for this chapter.</p>';
    return;
  }

  const mcQuestions = chapter.questions.filter(
    q => q.type === 'mc' && q.options && q.options.length > 0 && q.answer
  );

  if (mcQuestions.length === 0) {
    container.innerHTML = '<p>No multiple-choice questions available for this chapter.</p>';
    return;
  }

  if (!quickQuizState) {
    // Initialize quiz with 10 random questions
    const questions = getQuickQuizQuestions(chapter, 10);
    quickQuizState = {
      questions,
      currentIndex: 0,
      answers: [],
      selectedAnswer: null,
      showResults: false,
      score: 0,
      chapterId: chapter.id,
      chapterTitle: chapter.title,
    };
  }

  const questionCount = quickQuizState.questions.length;
  const subtitle =
    questionCount < 10
      ? `${questionCount} questions (all available MC questions)`
      : `${questionCount} questions`;

  container.innerHTML = `
    <div class="quiz-container">
      <div class="quiz-header">
        <h2>${chapter.title} - Quick Quiz</h2>
        <p class="quiz-subtitle">${subtitle}</p>
      </div>

      <div class="quiz-progress">
        <div class="quiz-progress-bar">
          <div class="quiz-progress-fill" style="width: ${100 / questionCount}%"></div>
        </div>
        <span class="quiz-progress-text">Question 1 of ${questionCount}</span>
      </div>

      <div id="chapter-quick-quiz-body"></div>
    </div>
  `;

  renderQuickQuizQuestion();
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

// ─────────────────────────────────────────────
// Quick Quiz Tab Functions
// ─────────────────────────────────────────────

function renderQuickQuizQuestion() {
  const quizBody = document.getElementById('chapter-quick-quiz-body');
  if (!quizBody || !quickQuizState) return;

  const question = quickQuizState.questions[quickQuizState.currentIndex];
  const progress = ((quickQuizState.currentIndex + 1) / quickQuizState.questions.length) * 100;

  // Update progress bar
  const progressFill = document.querySelector('.quiz-progress-fill') as HTMLElement;
  const progressText = document.querySelector('.quiz-progress-text') as HTMLElement;
  if (progressFill) progressFill.style.width = `${progress}%`;
  if (progressText)
    progressText.textContent = `Question ${quickQuizState.currentIndex + 1} of ${quickQuizState.questions.length}`;

  quizBody.innerHTML = `
    <div class="quiz-question-card">
      <div class="question-number">Question ${quickQuizState.currentIndex + 1}</div>
      <p class="question-text">${question.text}</p>

      <div class="quiz-options">
        ${
          question.options
            ?.map(
              (option, idx) => `
          <button
            class="quiz-option ${quickQuizState!.selectedAnswer === idx ? 'selected' : ''}"
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
          id="submit-quick-quiz-answer"
          ${quickQuizState.selectedAnswer === null ? 'disabled' : ''}
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
      quickQuizState!.selectedAnswer = idx;
      renderQuickQuizQuestion();
    });
  });

  const submitBtn = document.getElementById('submit-quick-quiz-answer');
  submitBtn?.addEventListener('click', submitQuickQuizAnswer);
}

function submitQuickQuizAnswer() {
  if (!quickQuizState || quickQuizState.selectedAnswer === null) return;

  const question = quickQuizState.questions[quickQuizState.currentIndex];
  const correctIndex = question.answer ? question.answer.charCodeAt(0) - 65 : -1;
  const isCorrect = quickQuizState.selectedAnswer === correctIndex;

  quickQuizState.answers.push(quickQuizState.selectedAnswer);

  if (isCorrect) {
    quickQuizState.score++;
  }

  // Move to next question or show results
  quickQuizState.currentIndex++;
  quickQuizState.selectedAnswer = null;

  if (quickQuizState.currentIndex >= quickQuizState.questions.length) {
    showQuickQuizResults();
  } else {
    renderQuickQuizQuestion();
  }
}

function showQuickQuizResults() {
  const quizBody = document.getElementById('chapter-quick-quiz-body');
  if (!quizBody || !quickQuizState) return;

  const percentage = Math.round((quickQuizState.score / quickQuizState.questions.length) * 100);
  const passed = percentage >= 70;

  quizBody.innerHTML = `
    <div class="quiz-results-card">
      <div class="results-header ${passed ? 'passed' : 'failed'}">
        <div class="results-icon">${passed ? '✓' : '!'}</div>
        <h2>${passed ? 'Great Job!' : 'Keep Studying'}</h2>
      </div>

      <div class="results-stats">
        <div class="result-stat">
          <div class="stat-value">${quickQuizState.score}/${quickQuizState.questions.length}</div>
          <div class="stat-label">Correct Answers</div>
        </div>
        <div class="result-stat">
          <div class="stat-value">${percentage}%</div>
          <div class="stat-label">Score</div>
        </div>
      </div>

      <div class="results-review">
        <h3>Review Answers</h3>
        ${quickQuizState.questions
          .map((q, idx) => {
            const userAnswer = quickQuizState!.answers[idx];
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
        <button class="quiz-btn quiz-btn-primary" id="retry-quick-quiz">
          Take Again
        </button>
        <button class="quiz-btn" id="back-study-quick">
          Back to Study
        </button>
      </div>
    </div>
  `;

  // Save quiz score with attemptType: quick-quiz-chapter
  import('../state/progress').then(({ updateQuizScore }) => {
    updateQuizScore(
      quickQuizState.chapterId,
      percentage,
      quickQuizState.questions.length,
      'quick-quiz-chapter'
    );
  });

  // Add event listeners
  document.getElementById('retry-quick-quiz')?.addEventListener('click', () => {
    const chapterId = quickQuizState?.chapterId;
    quickQuizState = null;
    const chapter = appState.data?.chapters.find((c: Chapter) => c.id === chapterId);
    if (chapter) {
      renderQuickQuizTab(chapter, document.getElementById('chapter-body')!);
    }
  });

  document.getElementById('back-study-quick')?.addEventListener('click', () => {
    currentTab = 'study';
    const chapter = appState.data?.chapters.find(
      (c: Chapter) => c.id === quickQuizState?.chapterId
    );
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

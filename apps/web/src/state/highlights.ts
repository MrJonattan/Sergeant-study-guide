/**
 * Highlight state management - localStorage adapter
 */

const HIGHLIGHTS_KEY = 'nypd_highlights';

export interface Highlight {
  id: string; // uuid v4
  chapterId: string;
  sectionFilename: string;
  text: string; // the highlighted text content
  contextBefore: string; // ~40 chars before, for relocation
  contextAfter: string; // ~40 chars after, for relocation
  color: 'yellow'; // single color v1 - leave room to expand
  createdAt: string; // ISO timestamp
}

function loadHighlights(): Highlight[] {
  const saved = localStorage.getItem(HIGHLIGHTS_KEY);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      // Invalid data, return empty array
    }
  }
  return [];
}

function saveHighlights(highlights: Highlight[]) {
  localStorage.setItem(HIGHLIGHTS_KEY, JSON.stringify(highlights));
}

export function getAllHighlights(): Highlight[] {
  return loadHighlights();
}

export function getHighlightsForChapter(chapterId: string): Highlight[] {
  const highlights = loadHighlights();
  return highlights.filter(h => h.chapterId === chapterId);
}

export function addHighlight(item: Omit<Highlight, 'createdAt'>): Highlight {
  const highlights = loadHighlights();

  const newHighlight: Highlight = {
    ...item,
    createdAt: new Date().toISOString(),
  };

  highlights.push(newHighlight);
  saveHighlights(highlights);
  return newHighlight;
}

export function removeHighlight(id: string): boolean {
  const highlights = loadHighlights();
  const filtered = highlights.filter(h => h.id !== id);

  if (filtered.length === highlights.length) {
    return false; // Not found
  }

  saveHighlights(filtered);
  return true;
}

// Exported for settings component
export function loadHighlightsForExport(): Highlight[] {
  return loadHighlights();
}

export function saveHighlightsForImport(highlights: Highlight[]) {
  saveHighlights(highlights);
}

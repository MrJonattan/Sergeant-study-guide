/**
 * Unit tests for highlights state management
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  getAllHighlights,
  getHighlightsForChapter,
  addHighlight,
  removeHighlight,
  loadHighlightsForExport,
  saveHighlightsForImport,
  type Highlight,
} from '../../apps/web/src/state/highlights';

const HIGHLIGHTS_KEY = 'nypd_highlights';

describe('Highlights State', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('getAllHighlights', () => {
    it('should return empty array when no highlights exist', () => {
      const highlights = getAllHighlights();
      expect(highlights).toEqual([]);
    });

    it('should return all highlights when they exist', () => {
      const mockHighlights: Highlight[] = [
        {
          id: 'test-id-1',
          chapterId: 'chapter-200',
          sectionFilename: 'section-01.md',
          text: 'Test highlight 1',
          contextBefore: 'before ',
          contextAfter: ' after',
          color: 'yellow',
          createdAt: '2026-05-26T10:00:00.000Z',
        },
        {
          id: 'test-id-2',
          chapterId: 'chapter-202',
          sectionFilename: 'section-02.md',
          text: 'Test highlight 2',
          contextBefore: 'before ',
          contextAfter: ' after',
          color: 'yellow',
          createdAt: '2026-05-26T11:00:00.000Z',
        },
      ];

      localStorage.setItem(HIGHLIGHTS_KEY, JSON.stringify(mockHighlights));

      const highlights = getAllHighlights();
      expect(highlights).toHaveLength(2);
      expect(highlights[0].id).toBe('test-id-1');
      expect(highlights[1].id).toBe('test-id-2');
    });

    it('should return empty array for invalid JSON', () => {
      localStorage.setItem(HIGHLIGHTS_KEY, 'invalid json');
      const highlights = getAllHighlights();
      expect(highlights).toEqual([]);
    });

    it('should return empty array for non-array data', () => {
      localStorage.setItem(HIGHLIGHTS_KEY, JSON.stringify({ not: 'an array' }));
      const highlights = getAllHighlights();
      expect(highlights).toEqual([]);
    });
  });

  describe('getHighlightsForChapter', () => {
    it('should return empty array when no highlights exist for chapter', () => {
      const highlights = getHighlightsForChapter('chapter-200');
      expect(highlights).toEqual([]);
    });

    it('should return only highlights for specified chapter', () => {
      const mockHighlights: Highlight[] = [
        {
          id: 'test-id-1',
          chapterId: 'chapter-200',
          sectionFilename: 'section-01.md',
          text: 'Highlight for chapter 200',
          contextBefore: 'before ',
          contextAfter: ' after',
          color: 'yellow',
          createdAt: '2026-05-26T10:00:00.000Z',
        },
        {
          id: 'test-id-2',
          chapterId: 'chapter-202',
          sectionFilename: 'section-02.md',
          text: 'Highlight for chapter 202',
          contextBefore: 'before ',
          contextAfter: ' after',
          color: 'yellow',
          createdAt: '2026-05-26T11:00:00.000Z',
        },
        {
          id: 'test-id-3',
          chapterId: 'chapter-200',
          sectionFilename: 'section-03.md',
          text: 'Another highlight for chapter 200',
          contextBefore: 'before ',
          contextAfter: ' after',
          color: 'yellow',
          createdAt: '2026-05-26T12:00:00.000Z',
        },
      ];

      localStorage.setItem(HIGHLIGHTS_KEY, JSON.stringify(mockHighlights));

      const highlights = getHighlightsForChapter('chapter-200');
      expect(highlights).toHaveLength(2);
      expect(highlights.every(h => h.chapterId === 'chapter-200')).toBe(true);
    });
  });

  describe('addHighlight', () => {
    it('should add a new highlight and return it with createdAt', () => {
      const newHighlight = addHighlight({
        id: 'new-id',
        chapterId: 'chapter-200',
        sectionFilename: 'section-01.md',
        text: 'New highlight',
        contextBefore: 'before ',
        contextAfter: ' after',
        color: 'yellow',
      });

      expect(newHighlight.id).toBe('new-id');
      expect(newHighlight.createdAt).toBeDefined();
      expect(newHighlight.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/);

      // Verify it was persisted
      const highlights = getAllHighlights();
      expect(highlights).toHaveLength(1);
      expect(highlights[0].id).toBe('new-id');
    });

    it('should append to existing highlights', () => {
      const existing: Highlight[] = [
        {
          id: 'existing-id',
          chapterId: 'chapter-200',
          sectionFilename: 'section-01.md',
          text: 'Existing highlight',
          contextBefore: 'before ',
          contextAfter: ' after',
          color: 'yellow',
          createdAt: '2026-05-26T10:00:00.000Z',
        },
      ];
      localStorage.setItem(HIGHLIGHTS_KEY, JSON.stringify(existing));

      addHighlight({
        id: 'new-id',
        chapterId: 'chapter-202',
        sectionFilename: 'section-02.md',
        text: 'New highlight',
        contextBefore: 'before ',
        contextAfter: ' after',
        color: 'yellow',
      });

      const highlights = getAllHighlights();
      expect(highlights).toHaveLength(2);
      expect(highlights[1].id).toBe('new-id');
    });
  });

  describe('removeHighlight', () => {
    it('should remove highlight by id and return true', () => {
      const existing: Highlight[] = [
        {
          id: 'to-remove',
          chapterId: 'chapter-200',
          sectionFilename: 'section-01.md',
          text: 'To be removed',
          contextBefore: 'before ',
          contextAfter: ' after',
          color: 'yellow',
          createdAt: '2026-05-26T10:00:00.000Z',
        },
        {
          id: 'to-keep',
          chapterId: 'chapter-202',
          sectionFilename: 'section-02.md',
          text: 'To keep',
          contextBefore: 'before ',
          contextAfter: ' after',
          color: 'yellow',
          createdAt: '2026-05-26T11:00:00.000Z',
        },
      ];
      localStorage.setItem(HIGHLIGHTS_KEY, JSON.stringify(existing));

      const result = removeHighlight('to-remove');
      expect(result).toBe(true);

      const highlights = getAllHighlights();
      expect(highlights).toHaveLength(1);
      expect(highlights[0].id).toBe('to-keep');
    });

    it('should return false when highlight not found', () => {
      const existing: Highlight[] = [
        {
          id: 'existing-id',
          chapterId: 'chapter-200',
          sectionFilename: 'section-01.md',
          text: 'Existing',
          contextBefore: 'before ',
          contextAfter: ' after',
          color: 'yellow',
          createdAt: '2026-05-26T10:00:00.000Z',
        },
      ];
      localStorage.setItem(HIGHLIGHTS_KEY, JSON.stringify(existing));

      const result = removeHighlight('non-existent-id');
      expect(result).toBe(false);

      // Should not modify existing data
      const highlights = getAllHighlights();
      expect(highlights).toHaveLength(1);
    });
  });

  describe('loadHighlightsForExport', () => {
    it('should return all highlights for export', () => {
      const mockHighlights: Highlight[] = [
        {
          id: 'export-id-1',
          chapterId: 'chapter-200',
          sectionFilename: 'section-01.md',
          text: 'Export test 1',
          contextBefore: 'before ',
          contextAfter: ' after',
          color: 'yellow',
          createdAt: '2026-05-26T10:00:00.000Z',
        },
      ];
      localStorage.setItem(HIGHLIGHTS_KEY, JSON.stringify(mockHighlights));

      const exported = loadHighlightsForExport();
      expect(exported).toHaveLength(1);
      expect(exported[0].id).toBe('export-id-1');
    });
  });

  describe('saveHighlightsForImport', () => {
    it('should save highlights from import', () => {
      const importedHighlights: Highlight[] = [
        {
          id: 'imported-id',
          chapterId: 'chapter-200',
          sectionFilename: 'section-01.md',
          text: 'Imported highlight',
          contextBefore: 'before ',
          contextAfter: ' after',
          color: 'yellow',
          createdAt: '2026-05-26T10:00:00.000Z',
        },
      ];

      saveHighlightsForImport(importedHighlights);

      const highlights = getAllHighlights();
      expect(highlights).toHaveLength(1);
      expect(highlights[0].id).toBe('imported-id');
    });

    it('should replace existing highlights on import', () => {
      // First add some existing highlights
      const existing: Highlight[] = [
        {
          id: 'old-id',
          chapterId: 'chapter-200',
          sectionFilename: 'section-01.md',
          text: 'Old highlight',
          contextBefore: 'before ',
          contextAfter: ' after',
          color: 'yellow',
          createdAt: '2026-05-26T10:00:00.000Z',
        },
      ];
      localStorage.setItem(HIGHLIGHTS_KEY, JSON.stringify(existing));

      // Now import new highlights
      const importedHighlights: Highlight[] = [
        {
          id: 'new-imported-id',
          chapterId: 'chapter-202',
          sectionFilename: 'section-02.md',
          text: 'New imported highlight',
          contextBefore: 'before ',
          contextAfter: ' after',
          color: 'yellow',
          createdAt: '2026-05-26T11:00:00.000Z',
        },
      ];
      saveHighlightsForImport(importedHighlights);

      const highlights = getAllHighlights();
      expect(highlights).toHaveLength(1);
      expect(highlights[0].id).toBe('new-imported-id');
      expect(highlights.some(h => h.id === 'old-id')).toBe(false);
    });
  });
});

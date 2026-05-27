/**
 * Bookmark state management - localStorage adapter
 */

const BOOKMARKS_KEY = 'nypd_bookmarks';

export interface Bookmark {
  id: string; // chapterId + sectionFilename + headingSlug
  chapterId: string;
  chapterTitle: string;
  sectionFilename: string;
  sectionTitle: string;
  calloutText?: string; // when bookmarking a specific callout
  addedAt: string; // ISO timestamp
}

function loadBookmarks(): Bookmark[] {
  const saved = localStorage.getItem(BOOKMARKS_KEY);
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

function saveBookmarks(bookmarks: Bookmark[]) {
  localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bookmarks));
}

export function getAllBookmarks(): Bookmark[] {
  return loadBookmarks();
}

export function addBookmark(item: Omit<Bookmark, 'addedAt'>): Bookmark | null {
  const bookmarks = loadBookmarks();

  // Prevent duplicates - if same id exists, don't add again
  if (bookmarks.some(b => b.id === item.id)) {
    return null;
  }

  const newBookmark: Bookmark = {
    ...item,
    addedAt: new Date().toISOString(),
  };

  bookmarks.push(newBookmark);
  saveBookmarks(bookmarks);
  return newBookmark;
}

export function removeBookmark(id: string): boolean {
  const bookmarks = loadBookmarks();
  const filtered = bookmarks.filter(b => b.id !== id);

  if (filtered.length === bookmarks.length) {
    return false; // Not found
  }

  saveBookmarks(filtered);
  return true;
}

export function isBookmarked(id: string): boolean {
  const bookmarks = loadBookmarks();
  return bookmarks.some(b => b.id === id);
}

// Exported for settings component
export function loadBookmarksForExport(): Bookmark[] {
  return loadBookmarks();
}

export function saveBookmarksForImport(bookmarks: Bookmark[]) {
  saveBookmarks(bookmarks);
}

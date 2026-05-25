/**
 * Settings component - Export/Import progress data
 */

import { loadProgressForExport, saveProgressForImport } from '../state/progress';
import { loadFlashcardProgressForExport, saveFlashcardProgressForImport } from '../state/progress';
import { getTheme } from '../utils/theme';
import { getFontScale } from '../utils/font-scale';

const PROGRESS_KEY = 'nypd_progress';
const FLASHCARD_KEY = 'nypd_flashcards';
const THEME_KEY = 'nypd_theme';
const FONT_SCALE_KEY = 'nypd_font_scale';
const DIAGNOSTIC_KEY = 'nypd_diagnostic_completed_at';

export interface ExportData {
  version: string;
  exportedAt: string;
  nypd_progress: object;
  nypd_flashcards: object;
  nypd_theme: string;
  nypd_font_scale: number;
  nypd_diagnostic_completed_at?: string;
}

export interface ImportPreview {
  current: {
    chaptersWithProgress: number;
    streak: number;
    flashcardsReviewed: number;
    theme: string;
  };
  imported: {
    chaptersWithProgress: number;
    streak: number;
    flashcardsReviewed: number;
    theme: string;
  };
}

export function showSettingsSheet() {
  // Close any existing dialog first
  const existing = document.querySelector('.settings-dialog');
  if (existing) {
    existing.remove();
  }

  const dialog = document.createElement('dialog');
  dialog.className = 'settings-dialog';
  dialog.innerHTML = `
    <div class="settings-content">
      <div class="settings-header">
        <h2>Settings</h2>
        <button class="settings-close" aria-label="Close">&times;</button>
      </div>

      <div class="settings-section">
        <h3>Backup & Restore</h3>
        <p class="settings-description">
          Export your progress as a backup file, or import a previously exported file.
        </p>

        <div class="settings-actions">
          <button class="settings-btn settings-btn-primary" id="settings-export">
            ⬇ Export Progress
          </button>
          <button class="settings-btn" id="settings-import">
            ⬆ Import Progress
          </button>
        </div>
      </div>

      <div class="settings-section">
        <h3>Data</h3>
        <p class="settings-description">
          Clear all locally stored progress data. This cannot be undone.
        </p>

        <button class="settings-btn settings-btn-danger" id="settings-clear">
          🗑 Clear All Data
        </button>
      </div>
    </div>
  `;

  dialog.querySelector('.settings-close')?.addEventListener('click', () => {
    dialog.close();
    dialog.remove();
  });

  dialog.addEventListener('click', (e) => {
    if (e.target === dialog) {
      dialog.close();
      dialog.remove();
    }
  });

  document.body.appendChild(dialog);
  dialog.showModal();
}

export function attachSettingsListeners() {
  const exportBtn = document.getElementById('settings-export');
  const importBtn = document.getElementById('settings-import');
  const clearBtn = document.getElementById('settings-clear');

  exportBtn?.addEventListener('click', () => {
    exportProgress();
  });

  importBtn?.addEventListener('click', () => {
    showImportDialog();
  });

  clearBtn?.addEventListener('click', () => {
    const confirmed = confirm(
      'Are you sure you want to clear all progress data? This cannot be undone.'
    );
    if (confirmed) {
      localStorage.clear();
      sessionStorage.clear();
      window.location.reload();
    }
  });
}

export function exportProgress() {
  const progress = loadProgressForExport();
  const flashcards = loadFlashcardProgressForExport();
  const theme = getTheme();
  const fontScale = getFontScale();
  const diagnosticCompleted = localStorage.getItem(DIAGNOSTIC_KEY);

  const exportData: ExportData = {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    nypd_progress: progress,
    nypd_flashcards: flashcards,
    nypd_theme: theme,
    nypd_font_scale: fontScale,
  };

  if (diagnosticCompleted) {
    exportData.nypd_diagnostic_completed_at = diagnosticCompleted;
  }

  const json = JSON.stringify(exportData, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  a.href = url;
  a.download = `sergeant-progress-${timestamp}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function showImportDialog() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json,application/json';

  input.addEventListener('change', (e) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        const validation = validateImportData(data);

        if (!validation.valid) {
          alert(`Invalid import file: ${validation.error}`);
          return;
        }

        const preview = buildImportPreview(data);
        showConfirmDialog(data, preview);
      } catch (err) {
        alert('Failed to parse JSON file. Please ensure it is a valid export file.');
      }
    };
    reader.onerror = () => {
      alert('Failed to read file.');
    };
    reader.readAsText(file);
  });

  input.click();
}

function validateImportData(data: Partial<ExportData>): { valid: boolean; error?: string } {
  if (!data.version) {
    return { valid: false, error: 'Missing version field' };
  }

  if (!data.exportedAt) {
    return { valid: false, error: 'Missing exportedAt field' };
  }

  if (!data.nypd_progress && !data.nypd_flashcards) {
    return { valid: false, error: 'No progress or flashcard data found' };
  }

  if (data.nypd_theme && data.nypd_theme !== 'light' && data.nypd_theme !== 'dark') {
    return { valid: false, error: 'Invalid theme value' };
  }

  if (data.nypd_font_scale) {
    const scale = Number(data.nypd_font_scale);
    if (isNaN(scale) || scale < 0.8 || scale > 1.4) {
      return { valid: false, error: 'Font scale must be between 0.8 and 1.4' };
    }
  }

  return { valid: true };
}

function buildImportPreview(data: ExportData): ImportPreview {
  const currentProgress = loadProgressForExport();
  const currentFlashcards = loadFlashcardProgressForExport();

  const importedProgress = data.nypd_progress as Partial<typeof currentProgress> | undefined;
  const importedFlashcards = data.nypd_flashcards as typeof currentFlashcards | undefined;

  return {
    current: {
      chaptersWithProgress: currentProgress.chapters?.length || 0,
      streak: currentProgress.streak || 0,
      flashcardsReviewed: Object.keys(currentFlashcards.cards || {}).length,
      theme: getTheme(),
    },
    imported: {
      chaptersWithProgress: importedProgress?.chapters?.length || 0,
      streak: importedProgress?.streak || 0,
      flashcardsReviewed: Object.keys(importedFlashcards?.cards || {}).length,
      theme: data.nypd_theme || getTheme(),
    },
  };
}

function showConfirmDialog(data: ExportData, preview: ImportPreview) {
  const dialog = document.createElement('dialog');
  dialog.className = 'settings-dialog import-confirm-dialog';
  dialog.innerHTML = `
    <div class="settings-content">
      <div class="settings-header">
        <h2>Confirm Import</h2>
        <button class="settings-close" aria-label="Close">&times;</button>
      </div>

      <p class="settings-description">
        This will replace all current progress with the imported data. Continue?
      </p>

      <div class="import-preview">
        <table>
          <thead>
            <tr>
              <th>Data Type</th>
              <th>Current</th>
              <th>Imported</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Chapters with progress</td>
              <td>${preview.current.chaptersWithProgress}</td>
              <td>${preview.imported.chaptersWithProgress}</td>
            </tr>
            <tr>
              <td>Study streak</td>
              <td>${preview.current.streak} days</td>
              <td>${preview.imported.streak} days</td>
            </tr>
            <tr>
              <td>Flashcards reviewed</td>
              <td>${preview.current.flashcardsReviewed}</td>
              <td>${preview.imported.flashcardsReviewed}</td>
            </tr>
            <tr>
              <td>Theme</td>
              <td>${preview.current.theme}</td>
              <td>${preview.imported.theme}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="settings-actions">
        <button class="settings-btn" id="import-cancel">Cancel</button>
        <button class="settings-btn settings-btn-primary" id="import-confirm">Import Data</button>
      </div>
    </div>
  `;

  dialog.querySelector('.settings-close')?.addEventListener('click', () => {
    dialog.close();
    dialog.remove();
  });

  dialog.querySelector('#import-cancel')?.addEventListener('click', () => {
    dialog.close();
    dialog.remove();
  });

  dialog.querySelector('#import-confirm')?.addEventListener('click', () => {
    performImport(data);
    dialog.close();
    dialog.remove();
  });

  document.body.appendChild(dialog);
  dialog.showModal();
}

function performImport(data: ExportData) {
  if (data.nypd_progress) {
    saveProgressForImport(data.nypd_progress as any);
  }

  if (data.nypd_flashcards) {
    saveFlashcardProgressForImport(data.nypd_flashcards as any);
  }

  if (data.nypd_theme) {
    localStorage.setItem(THEME_KEY, data.nypd_theme);
    if (data.nypd_theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }

  if (data.nypd_font_scale) {
    localStorage.setItem(FONT_SCALE_KEY, String(data.nypd_font_scale));
    document.documentElement.style.setProperty('--font-scale', String(data.nypd_font_scale));
  }

  if (data.nypd_diagnostic_completed_at) {
    localStorage.setItem(DIAGNOSTIC_KEY, data.nypd_diagnostic_completed_at);
  }

  alert('Progress imported successfully!');
  window.location.reload();
}

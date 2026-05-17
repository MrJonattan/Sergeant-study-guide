/**
 * Error Recovery UI - Handles various error states with recovery options
 */

export type ErrorType = 'network' | 'parse' | 'storage' | 'unknown';

export interface ErrorState {
  type: ErrorType;
  message: string;
  details?: string;
}

const ERROR_MESSAGES: Record<ErrorType, { title: string; suggestion: string }> = {
  network: {
    title: 'Failed to Load Study Data',
    suggestion: 'Check your internet connection and try again.',
  },
  parse: {
    title: 'Invalid Data Format',
    suggestion: 'The study data file appears to be corrupted.',
  },
  storage: {
    title: 'Storage Error',
    suggestion: 'Unable to access local storage. Clear browser data and try again.',
  },
  unknown: {
    title: 'Unexpected Error',
    suggestion: 'Something went wrong. Try refreshing the page.',
  },
};

export function renderErrorRecovery(error: ErrorState, _onRetry?: () => void) {
  const errorConfig = ERROR_MESSAGES[error.type] || ERROR_MESSAGES.unknown;

  return `
    <div class="error-recovery-container">
      <div class="error-card">
        <div class="error-icon">⚠️</div>

        <h1 class="error-title">${errorConfig.title}</h1>

        <p class="error-message">${errorConfig.suggestion}</p>

        ${error.details ? `<pre class="error-details">${escapeHtml(error.details)}</pre>` : ''}

        <div class="error-actions">
          <button class="error-btn error-btn-primary" id="error-retry">
            ↻ Try Again
          </button>
          <button class="error-btn" id="error-clear-cache">
            🗑 Clear Cache & Reload
          </button>
          <button class="error-btn" id="error-home">
            🏠 Home
          </button>
        </div>

        <details class="error-tech-details">
          <summary>Technical Details</summary>
          <div class="tech-details-content">
            <p><strong>Error Type:</strong> ${error.type}</p>
            <p><strong>Message:</strong> ${escapeHtml(error.message)}</p>
            <p><strong>Timestamp:</strong> ${new Date().toLocaleString()}</p>
            <p><strong>User Agent:</strong> ${navigator.userAgent}</p>
          </div>
        </details>
      </div>
    </div>
  `;
}

function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

export function attachErrorRecoveryListeners(onRetry: () => void) {
  const retryBtn = document.getElementById('error-retry');
  const clearCacheBtn = document.getElementById('error-clear-cache');
  const homeBtn = document.getElementById('error-home');

  retryBtn?.addEventListener('click', () => {
    onRetry();
  });

  clearCacheBtn?.addEventListener('click', () => {
    // Clear all localStorage and reload
    localStorage.clear();
    sessionStorage.clear();

    // Clear service worker cache if it exists
    if ('caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => caches.delete(name));
      });
    }

    // Hard reload
    window.location.reload();
  });

  homeBtn?.addEventListener('click', () => {
    window.location.hash = 'home';
    onRetry();
  });
}

export function renderOfflineIndicator() {
  if (!navigator.onLine) {
    const indicator = document.createElement('div');
    indicator.className = 'offline-indicator';
    indicator.innerHTML = '⚠️ You are offline. Some features may be unavailable.';

    const topbar = document.getElementById('topbar');
    if (topbar) {
      topbar.appendChild(indicator);
    }
  }
}

export function initOnlineListener() {
  window.addEventListener('online', () => {
    const indicator = document.querySelector('.offline-indicator');
    if (indicator) {
      indicator.remove();
    }
  });

  window.addEventListener('offline', () => {
    renderOfflineIndicator();
  });
}

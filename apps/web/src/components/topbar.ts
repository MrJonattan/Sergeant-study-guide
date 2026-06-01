/**
 * Topbar component - single compact row with hamburger, breadcrumbs, settings
 */

import { navigateTo } from '../utils/router';
import { toggleTheme } from '../utils/theme';
import { getFontScale, setFontScale } from '../utils/font-scale';

const MOBILE_BREAKPOINT = 768;

function isMobileViewport(): boolean {
  return window.innerWidth < MOBILE_BREAKPOINT;
}

function renderTopbarControls() {
  const controls = document.querySelector('.topbar-controls');
  if (!controls) return;

  const isMobile = isMobileViewport();

  if (isMobile) {
    controls.innerHTML = `
      <button class="icon-btn" id="settings-toggle" aria-label="Settings">⚙</button>
    `;
  } else {
    controls.innerHTML = `
      <button class="icon-btn" id="font-decrease" aria-label="Decrease font">A-</button>
      <button class="icon-btn" id="font-increase" aria-label="Increase font">A+</button>
      <button class="icon-btn" id="theme-toggle" aria-label="Toggle dark mode">◑</button>
      <button class="icon-btn" id="settings-toggle" aria-label="Settings">⚙</button>
    `;

    const fontDecreaseBtn = document.getElementById('font-decrease');
    const fontIncreaseBtn = document.getElementById('font-increase');
    const themeToggleBtn = document.getElementById('theme-toggle');

    if (fontDecreaseBtn) {
      fontDecreaseBtn.addEventListener('click', () => {
        const currentScale = getFontScale();
        const newScale = Math.max(0.8, currentScale - 0.1);
        setFontScale(newScale);
      });
    }

    if (fontIncreaseBtn) {
      fontIncreaseBtn.addEventListener('click', () => {
        const currentScale = getFontScale();
        const newScale = Math.min(1.4, currentScale + 0.1);
        setFontScale(newScale);
      });
    }

    if (themeToggleBtn) {
      themeToggleBtn.addEventListener('click', () => {
        toggleTheme();
      });
    }
  }
}

export function initTopbar() {
  const breadcrumbs = document.getElementById('breadcrumbs');
  if (breadcrumbs) {
    breadcrumbs.addEventListener('click', e => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'SPAN') {
        const route = target.getAttribute('data-route');
        if (route) {
          navigateTo(route);
        }
      }
    });
  }

  renderTopbarControls();

  let resizeTimeout: ReturnType<typeof setTimeout>;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(renderTopbarControls, 150);
  });
}

export function updateBreadcrumbs(items: Array<{ label: string; route?: string }>) {
  const breadcrumbs = document.getElementById('breadcrumbs');
  if (!breadcrumbs) return;

  breadcrumbs.innerHTML = items
    .map(item => {
      if (item.route) {
        return `<span data-route="${item.route}">${item.label}</span>`;
      }
      return `<span>${item.label}</span>`;
    })
    .join(' / ');
}

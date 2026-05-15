/**
 * Topbar component - breadcrumbs and controls
 */

import { navigateTo } from '../utils/router';
import { appState } from '../main';

export function initTopbar() {
  // Breadcrumbs click handler
  const breadcrumbs = document.getElementById('breadcrumbs');
  if (breadcrumbs) {
    breadcrumbs.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'SPAN') {
        const route = target.getAttribute('data-route');
        if (route) {
          navigateTo(route);
        }
      }
    });
  }
}

export function updateBreadcrumbs(items: Array<{ label: string; route?: string }>) {
  const breadcrumbs = document.getElementById('breadcrumbs');
  if (!breadcrumbs) return;

  breadcrumbs.innerHTML = items
    .map((item, index) => {
      if (item.route) {
        return `<span data-route="${item.route}">${item.label}</span>`;
      }
      return `<span>${item.label}</span>`;
    })
    .join(' / ');
}

export function updateTopbarTitle(title: string) {
  // Could add a title element to topbar if needed
  console.log('Topbar title:', title);
}

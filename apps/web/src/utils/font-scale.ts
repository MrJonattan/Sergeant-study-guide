/**
 * Font scale management
 */

const FONT_SCALE_KEY = 'nypd_font_scale';
const MIN_SCALE = 0.8;
const MAX_SCALE = 1.4;
const STEP = 0.1;

export function initFontScale() {
  const savedScale = localStorage.getItem(FONT_SCALE_KEY);
  let scale = savedScale ? parseFloat(savedScale) : 1.0;
  scale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, scale));

  applyFontScale(scale);

  // Add event listeners to font buttons
  const decreaseBtn = document.getElementById('font-decrease');
  const increaseBtn = document.getElementById('font-increase');

  if (decreaseBtn) {
    decreaseBtn.addEventListener('click', () => adjustFontScale(-STEP));
  }

  if (increaseBtn) {
    increaseBtn.addEventListener('click', () => adjustFontScale(STEP));
  }
}

function applyFontScale(scale: number) {
  document.documentElement.style.setProperty('--font-scale', scale.toString());
  localStorage.setItem(FONT_SCALE_KEY, scale.toString());
}

function adjustFontScale(delta: number) {
  const currentScale = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--font-scale')) || 1.0;
  const newScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, currentScale + delta));
  applyFontScale(newScale);
}

export function getFontScale(): number {
  const scale = localStorage.getItem(FONT_SCALE_KEY);
  return scale ? parseFloat(scale) : 1.0;
}

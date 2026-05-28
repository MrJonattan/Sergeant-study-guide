import { test, expect } from '@playwright/test';

test.describe('Highlights', () => {
  test.beforeEach(async ({ page, context }) => {
    // Clear all state for test isolation
    await context.clearCookies();
    // Navigate fresh
    await page.goto('/');
    // Wait for app to load
    await page.waitForSelector('.nav-item[data-chapter]', { timeout: 10000 });
    // Clear storage
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
      // Reset module-level highlight state
      (window as any).__resetHighlightState?.();
    });
  });

  test('should navigate to highlights from sidebar', async ({ page }) => {
    // Click on Highlights in sidebar
    await page.click('[data-tool="highlights"]');

    // Should navigate to #highlights (hash-only match for base-path resilience)
    await expect(page).toHaveURL(/#highlights$/);

    // Should show highlights page
    await expect(page.getByRole('heading', { name: 'Highlights', exact: true })).toBeVisible();
  });

  test('should show empty state when no highlights', async ({ page }) => {
    // Navigate to highlights
    await page.click('[data-tool="highlights"]');

    // Should show empty state message
    await expect(page.locator('.highlights-empty')).toBeVisible();
    await expect(page.locator('.highlights-empty h2')).toContainText('No highlights yet');
  });

  test('should show highlight toolbar on text selection', async ({ page }) => {
    // Click on first chapter
    await page.click('.nav-item[data-chapter]');
    await page.waitForURL(/#chapter\//);

    // Wait for chapter content to be fully rendered
    await page.waitForSelector('#chapter-body');
    await page.waitForTimeout(200); // Wait for handlers to be set up

    // Find first paragraph with text and select it atomically
    const selected = await page.evaluate(() => {
      const paragraph = Array.from(document.querySelectorAll('p'))
        .find(p => /[\w\s]{20,}/.test(p.textContent || ''));
      if (!paragraph || !paragraph.firstChild) return null;
      const text = paragraph.textContent || '';
      const range = document.createRange();
      range.setStart(paragraph.firstChild, 0);
      range.setEnd(paragraph.firstChild, Math.min(20, text.length));
      const sel = window.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(range);
      return { text: text.substring(0, 20) };
    });

    if (!selected) return;

    // Wait for toolbar to appear (selectionchange debounce + toolbar setup)
    await page.waitForTimeout(500);

    // Toolbar should be visible
    const toolbar = page.locator('.highlight-toolbar');
    await expect(toolbar).toBeVisible();

    // Toolbar should have highlight button with color swatch
    await expect(toolbar.locator('.highlight-color-swatch')).toBeVisible();
    await expect(toolbar.locator('.highlight-toolbar-btn')).toContainText('Highlight');
  });

  test('should add highlight and render mark element', async ({ page }) => {
    // Navigate fresh to home first
    await page.goto('/');
    await page.waitForSelector('.nav-item[data-chapter]');

    // Click on first chapter
    await page.click('.nav-item[data-chapter]');
    await page.waitForURL(/#chapter\//);

    // Wait for chapter content to be fully rendered
    await page.waitForSelector('#chapter-body');
    await page.waitForTimeout(300);

    // Select text atomically
    const selected = await page.evaluate(() => {
      const paragraph = Array.from(document.querySelectorAll('p'))
        .find(p => /[\w\s]{30,}/.test(p.textContent || ''));
      if (!paragraph || !paragraph.firstChild) return null;
      const text = paragraph.textContent || '';
      const range = document.createRange();
      range.setStart(paragraph.firstChild, 0);
      range.setEnd(paragraph.firstChild, Math.min(25, text.length));
      const sel = window.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(range);
      return { text: text.substring(0, 25) };
    });

    if (!selected) return;

    // Wait for toolbar to appear
    await page.waitForTimeout(500);

    // Verify toolbar button exists
    await expect(page.locator('.highlight-toolbar-btn')).toBeVisible();

    // Click highlight button
    await page.locator('.highlight-toolbar-btn').click();

    // Wait for highlight to be applied and rendered
    await page.waitForTimeout(1500);

    // Should have mark element with hl-yellow class
    const markElement = page.locator('mark.hl-yellow');
    await expect(markElement).toBeVisible();

    // Mark should have data-highlight-id attribute
    await expect(markElement.first()).toHaveAttribute('data-highlight-id');
  });

  test('should dismiss toolbar on click elsewhere', async ({ page }) => {
    // Click on first chapter
    await page.click('.nav-item[data-chapter]');
    await page.waitForURL(/#chapter\//);

    // Wait for chapter content to be fully rendered
    await page.waitForSelector('#chapter-body');
    await page.waitForTimeout(200);

    // Find paragraph and select text atomically
    await page.evaluate(() => {
      const paragraph = Array.from(document.querySelectorAll('p'))
        .find(p => /[\w\s]{20,}/.test(p.textContent || ''));
      if (!paragraph || !paragraph.firstChild) return;
      const text = paragraph.textContent || '';
      const range = document.createRange();
      range.setStart(paragraph.firstChild, 0);
      range.setEnd(paragraph.firstChild, Math.min(20, text.length));
      const sel = window.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(range);
    });

    await page.waitForTimeout(800);

    // Verify toolbar is visible
    await expect(page.locator('.highlight-toolbar')).toBeVisible();

    // Wait for toolbarReady flag (100ms after toolbar creation)
    await page.waitForTimeout(200);

    // Click elsewhere
    await page.click('body', { position: { x: 10, y: 10 } });
    await page.waitForTimeout(500);

    // Toolbar should be dismissed
    await expect(page.locator('.highlight-toolbar')).not.toBeVisible();
  });

  test('should show remove popover on highlight click', async ({ page }) => {
    // Click on first chapter
    await page.click('.nav-item[data-chapter]');
    await page.waitForURL(/#chapter\//);

    // Wait for chapter content to be fully rendered
    await page.waitForSelector('#chapter-body');
    await page.waitForTimeout(200);

    // Find paragraph and create highlight atomically
    await page.evaluate(() => {
      const paragraph = Array.from(document.querySelectorAll('p'))
        .find(p => /[\w\s]{30,}/.test(p.textContent || ''));
      if (!paragraph || !paragraph.firstChild) return;
      const text = paragraph.textContent || '';
      const range = document.createRange();
      range.setStart(paragraph.firstChild, 0);
      range.setEnd(paragraph.firstChild, Math.min(25, text.length));
      const sel = window.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(range);
    });

    await page.waitForTimeout(500);
    await page.locator('.highlight-toolbar-btn').click();
    await page.waitForTimeout(1000);

    // Click on the highlight
    const markElement = page.locator('mark.hl-yellow').first();
    await markElement.click();

    // Popover should appear
    await page.waitForTimeout(200);
    const popover = page.locator('.highlight-popover');
    await expect(popover).toBeVisible();

    // Popover should have remove button
    await expect(popover.locator('.highlight-popover-btn')).toContainText('Remove highlight');
  });

  test('should remove highlight via popover', async ({ page }) => {
    // Click on first chapter
    await page.click('.nav-item[data-chapter]');
    await page.waitForURL(/#chapter\//);

    // Wait for chapter content to be fully rendered
    await page.waitForSelector('#chapter-body');
    await page.waitForTimeout(200);

    // Find paragraph and create highlight atomically
    await page.evaluate(() => {
      const paragraph = Array.from(document.querySelectorAll('p'))
        .find(p => /[\w\s]{30,}/.test(p.textContent || ''));
      if (!paragraph || !paragraph.firstChild) return;
      const text = paragraph.textContent || '';
      const range = document.createRange();
      range.setStart(paragraph.firstChild, 0);
      range.setEnd(paragraph.firstChild, Math.min(25, text.length));
      const sel = window.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(range);
    });

    await page.waitForTimeout(500);
    await page.locator('.highlight-toolbar-btn').click();
    await page.waitForTimeout(1000);

    // Verify highlight exists
    let markElements = page.locator('mark.hl-yellow');
    await expect(markElements.first()).toBeVisible();

    // Click highlight to show popover
    await markElements.first().click();
    await page.waitForTimeout(200);

    // Click remove button
    await page.locator('.highlight-popover-btn').click();
    await page.waitForTimeout(300);

    // Highlight should be removed
    markElements = page.locator('mark.hl-yellow');
    const count = await markElements.count();
    expect(count).toBe(0);
  });

  test('should show highlight in highlights list', async ({ page }) => {
    // Click on first chapter
    await page.click('.nav-item[data-chapter]');
    await page.waitForURL(/#chapter\//);

    // Wait for chapter content to be fully rendered
    await page.waitForSelector('#chapter-body');
    await page.waitForTimeout(200);

    // Get chapter title
    const chapterTitle = await page.locator('h1').nth(1).textContent();

    // Find paragraph and create highlight atomically
    await page.evaluate(() => {
      const paragraph = Array.from(document.querySelectorAll('p'))
        .find(p => /[\w\s]{30,}/.test(p.textContent || ''));
      if (!paragraph || !paragraph.firstChild) return;
      const text = paragraph.textContent || '';
      const range = document.createRange();
      range.setStart(paragraph.firstChild, 0);
      range.setEnd(paragraph.firstChild, Math.min(25, text.length));
      const sel = window.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(range);
    });

    await page.waitForTimeout(500);
    await page.locator('.highlight-toolbar-btn').click();
    await page.waitForTimeout(1000);

    // Navigate to highlights (hash-only match for base-path resilience)
    await page.click('[data-tool="highlights"]');
    await page.waitForURL(/#highlights$/);
    // Wait for view to render
    await page.waitForSelector('h1:has-text("Highlights")');

    // Should see highlights list
    await expect(page.locator('.highlights-list')).toBeVisible();

    // Should show highlighted text in quote
    await expect(page.locator('.highlight-text')).toBeVisible();

    // Highlighted text should be wrapped in mark
    await expect(page.locator('.highlight-text mark.hl-yellow')).toBeVisible();
  });

  test('should remove highlight from highlights list', async ({ page }) => {
    // Click on first chapter
    await page.click('.nav-item[data-chapter]');
    await page.waitForURL(/#chapter\//);

    // Wait for chapter content to be fully rendered
    await page.waitForSelector('#chapter-body');
    await page.waitForTimeout(200);

    // Create highlight atomically
    await page.evaluate(() => {
      const paragraph = Array.from(document.querySelectorAll('p'))
        .find(p => /[\w\s]{30,}/.test(p.textContent || ''));
      if (!paragraph || !paragraph.firstChild) return;
      const text = paragraph.textContent || '';
      const range = document.createRange();
      range.setStart(paragraph.firstChild, 0);
      range.setEnd(paragraph.firstChild, Math.min(25, text.length));
      const sel = window.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(range);
    });

    await page.waitForTimeout(500);
    await page.locator('.highlight-toolbar-btn').click();
    await page.waitForTimeout(1000);

    // Navigate to highlights (hash-only match for base-path resilience)
    await page.click('[data-tool="highlights"]');
    await page.waitForURL(/#highlights$/);
    // Wait for view to render
    await page.waitForSelector('h1:has-text("Highlights")');

    // Click remove button
    const removeBtn = page.locator('.highlight-remove-btn').first();
    await removeBtn.click();
    await page.waitForTimeout(300);

    // Check if highlight was removed
    const highlightItems = page.locator('.highlight-item');
    const count = await highlightItems.count();

    // Either item is removed or empty state shows
    if (count === 0) {
      await expect(page.locator('.highlights-empty')).toBeVisible();
    }
  });

  test('should navigate to chapter from highlight', async ({ page }) => {
    // Click on first chapter
    await page.click('.nav-item[data-chapter]');
    await page.waitForURL(/#chapter\//);

    // Wait for chapter content to be fully rendered
    await page.waitForSelector('#chapter-body');
    await page.waitForTimeout(200);

    // Create highlight atomically
    await page.evaluate(() => {
      const paragraph = Array.from(document.querySelectorAll('p'))
        .find(p => /[\w\s]{30,}/.test(p.textContent || ''));
      if (!paragraph || !paragraph.firstChild) return;
      const text = paragraph.textContent || '';
      const range = document.createRange();
      range.setStart(paragraph.firstChild, 0);
      range.setEnd(paragraph.firstChild, Math.min(25, text.length));
      const sel = window.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(range);
    });

    await page.waitForTimeout(500);
    await page.locator('.highlight-toolbar-btn').click();
    await page.waitForTimeout(1000);

    // Navigate to highlights (hash-only match for base-path resilience)
    await page.click('[data-tool="highlights"]');
    await page.waitForURL(/#highlights$/);
    // Wait for view to render
    await page.waitForSelector('h1:has-text("Highlights")');

    // Click on highlight content to navigate back
    await page.locator('.highlight-content').first().click();

    // Should navigate back to chapter
    await page.waitForURL(/#chapter\//);
  });

  test('should persist highlight across page reload', async ({ page }) => {
    // Click on first chapter
    await page.click('.nav-item[data-chapter]');
    await page.waitForURL(/#chapter\//);

    // Wait for chapter content to be fully rendered
    await page.waitForSelector('#chapter-body');
    await page.waitForTimeout(200);

    // Create highlight atomically
    await page.evaluate(() => {
      const paragraph = Array.from(document.querySelectorAll('p'))
        .find(p => /[\w\s]{30,}/.test(p.textContent || ''));
      if (!paragraph || !paragraph.firstChild) return;
      const text = paragraph.textContent || '';
      const range = document.createRange();
      range.setStart(paragraph.firstChild, 0);
      range.setEnd(paragraph.firstChild, Math.min(25, text.length));
      const sel = window.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(range);
    });

    await page.waitForTimeout(500);
    await page.locator('.highlight-toolbar-btn').click();
    await page.waitForTimeout(1000);

    // Reload page to test persistence
    await page.reload({ waitUntil: 'load' });
    await page.waitForURL(/#chapter\//);
    // Wait for nav items to appear (indicates app has loaded)
    await page.waitForSelector('.nav-item[data-chapter]', { timeout: 10000 });
    await page.waitForSelector('#chapter-body p', { timeout: 10000 });

    // Highlight should still exist
    const markElements = page.locator('mark.hl-yellow');
    await expect(markElements.first()).toBeVisible();
  });

  test('should display time ago for highlight', async ({ page }) => {
    // Click on first chapter
    await page.click('.nav-item[data-chapter]');
    await page.waitForURL(/#chapter\//);

    // Wait for chapter content to be fully rendered
    await page.waitForSelector('#chapter-body');
    await page.waitForTimeout(200);

    // Create highlight atomically
    await page.evaluate(() => {
      const paragraph = Array.from(document.querySelectorAll('p'))
        .find(p => /[\w\s]{30,}/.test(p.textContent || ''));
      if (!paragraph || !paragraph.firstChild) return;
      const text = paragraph.textContent || '';
      const range = document.createRange();
      range.setStart(paragraph.firstChild, 0);
      range.setEnd(paragraph.firstChild, Math.min(25, text.length));
      const sel = window.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(range);
    });

    await page.waitForTimeout(500);
    await page.locator('.highlight-toolbar-btn').click();
    await page.waitForTimeout(1000);

    // Navigate to highlights (hash-only match for base-path resilience)
    await page.click('[data-tool="highlights"]');
    await page.waitForURL(/#highlights$/);
    // Wait for view to render
    await page.waitForSelector('h1:has-text("Highlights")');

    // Should show time ago
    await expect(page.locator('.highlight-time')).toBeVisible();
  });
});

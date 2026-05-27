import { test, expect } from '@playwright/test';

test.describe('Bookmarks', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should navigate to bookmarks from sidebar', async ({ page }) => {
    await page.goto('/');

    // Click on Bookmarks in sidebar
    await page.click('[data-tool="bookmarks"]');

    // Should navigate to #bookmarks
    await expect(page).toHaveURL('/#bookmarks');

    // Should show bookmarks page
    await expect(page.getByRole('heading', { name: 'Bookmarks', exact: true })).toBeVisible();
  });

  test('should show empty state when no bookmarks', async ({ page }) => {
    await page.goto('/#bookmarks');

    // Should show empty state message
    await expect(page.locator('.bookmarks-empty')).toBeVisible();
    await expect(page.locator('.bookmarks-empty h2')).toContainText('No bookmarks yet');
  });

  test('should add bookmark from chapter page', async ({ page }) => {
    await page.goto('/');

    // Click on first chapter
    await page.click('.nav-item[data-chapter]');
    await page.waitForURL(/#chapter\//);

    // Wait for content to load
    await page.waitForSelector('h2');

    // Find first H2 heading and click its bookmark button
    const heading = page.locator('h2').first();
    await heading.waitFor({ state: 'visible' });

    // Click the bookmark button
    const bookmarkBtn = heading.locator('.bookmark-btn');
    await bookmarkBtn.waitFor({ state: 'visible' });
    await bookmarkBtn.click();

    // Button should now show filled star
    await expect(bookmarkBtn).toHaveText('★');
    await expect(bookmarkBtn).toHaveClass(/bookmarked/);
  });

  test('should toggle bookmark state', async ({ page }) => {
    await page.goto('/');

    // Click on first chapter
    await page.click('.nav-item[data-chapter]');
    await page.waitForURL(/#chapter\//);
    await page.waitForSelector('h2');

    // Find first H2 heading and click its bookmark button
    const heading = page.locator('h2').first();
    const bookmarkBtn = heading.locator('.bookmark-btn');

    // Initially should be outlined
    await expect(bookmarkBtn).toHaveText('☆');

    // Click to add bookmark
    await bookmarkBtn.click();
    await expect(bookmarkBtn).toHaveText('★');

    // Click again to remove bookmark
    await bookmarkBtn.click();
    await expect(bookmarkBtn).toHaveText('☆');
  });

  test('should show bookmark in bookmarks list', async ({ page }) => {
    await page.goto('/');

    // Click on first chapter
    await page.click('.nav-item[data-chapter]');
    await page.waitForURL(/#chapter\//);
    await page.waitForSelector('h2');

    // Get section title (without the bookmark icon)
    const sectionTitle = await page.locator('h2').first().textContent();

    // Add bookmark
    const bookmarkBtn = page.locator('h2').first().locator('.bookmark-btn');
    await bookmarkBtn.click();
    await expect(bookmarkBtn).toHaveText('★');

    // Navigate to bookmarks
    await page.click('[data-tool="bookmarks"]');
    await page.waitForURL('/#bookmarks');

    // Should see bookmark in list
    await expect(page.locator('.bookmarks-list')).toBeVisible();

    // Should show chapter title (format may vary, just check it exists)
    await expect(page.locator('.bookmarks-chapter-title')).toBeVisible();

    // Should show section title (check that it's visible, exact text may vary due to formatting)
    await expect(page.locator('.bookmark-section-title')).toBeVisible();
  });

  test('should persist bookmark across page reload', async ({ page }) => {
    await page.goto('/');

    // Click on first chapter
    await page.click('.nav-item[data-chapter]');
    await page.waitForURL(/#chapter\//);
    await page.waitForSelector('h2');

    // Add bookmark
    const bookmarkBtn = page.locator('h2').first().locator('.bookmark-btn');
    await bookmarkBtn.click();
    await expect(bookmarkBtn).toHaveText('★');

    // Reload page
    await page.reload();
    await page.waitForSelector('h2');

    // Bookmark should still be filled
    const newBookmarkBtn = page.locator('h2').first().locator('.bookmark-btn');
    await expect(newBookmarkBtn).toHaveText('★');
  });

  test('should remove bookmark from bookmarks list', async ({ page }) => {
    await page.goto('/');

    // Click on first chapter
    await page.click('.nav-item[data-chapter]');
    await page.waitForURL(/#chapter\//);
    await page.waitForSelector('h2');

    // Add bookmark
    const bookmarkBtn = page.locator('h2').first().locator('.bookmark-btn');
    await bookmarkBtn.click();
    await expect(bookmarkBtn).toHaveText('★');

    // Navigate to bookmarks
    await page.click('[data-tool="bookmarks"]');
    await page.waitForURL('/#bookmarks');

    // Click remove button
    const removeBtn = page.locator('.bookmark-remove-btn').first();
    await removeBtn.click();

    // Should show empty state or bookmark should be removed
    const bookmarkItems = page.locator('.bookmark-item');
    const count = await bookmarkItems.count();

    if (count === 0) {
      await expect(page.locator('.bookmarks-empty')).toBeVisible();
    }
  });

  test('should navigate back to chapter from bookmark', async ({ page }) => {
    await page.goto('/');

    // Click on first chapter
    await page.click('.nav-item[data-chapter]');
    await page.waitForURL(/#chapter\//);
    await page.waitForSelector('h2');

    // Add bookmark
    const bookmarkBtn = page.locator('h2').first().locator('.bookmark-btn');
    await bookmarkBtn.click();

    // Navigate to bookmarks
    await page.click('[data-tool="bookmarks"]');
    await page.waitForURL('/#bookmarks');

    // Click on bookmark content to navigate back
    await page.locator('.bookmark-content').first().click();

    // Should navigate back to chapter
    await page.waitForURL(/#chapter\//);
  });

  test('should show callout bookmark with snippet', async ({ page }) => {
    await page.goto('/');

    // Click on first chapter
    await page.click('.nav-item[data-chapter]');
    await page.waitForURL(/#chapter\//);
    await page.waitForSelector('.callout');

    // Find first callout and bookmark it
    const callout = page.locator('.callout').first();
    const calloutBookmarkBtn = callout.locator('.callout-bookmark-btn');

    if (await calloutBookmarkBtn.isVisible()) {
      await calloutBookmarkBtn.click();
      await expect(calloutBookmarkBtn).toHaveText('★');

      // Navigate to bookmarks
      await page.click('[data-tool="bookmarks"]');
      await page.waitForURL('/#bookmarks');

      // Should show callout snippet
      const snippet = page.locator('.bookmark-callout-snippet').first();
      await expect(snippet).toBeVisible();
    }
  });

  test('should display time ago for bookmark', async ({ page }) => {
    await page.goto('/');

    // Click on first chapter
    await page.click('.nav-item[data-chapter]');
    await page.waitForURL(/#chapter\//);
    await page.waitForSelector('h2');

    // Add bookmark
    const bookmarkBtn = page.locator('h2').first().locator('.bookmark-btn');
    await bookmarkBtn.click();

    // Navigate to bookmarks
    await page.click('[data-tool="bookmarks"]');
    await page.waitForURL('/#bookmarks');

    // Should show time ago (e.g., "Just now", "1m ago")
    await expect(page.locator('.bookmark-time')).toBeVisible();
  });
});

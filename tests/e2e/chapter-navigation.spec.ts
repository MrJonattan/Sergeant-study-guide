import { test, expect } from '@playwright/test';

test.describe('Chapter Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display all chapters in sidebar', async ({ page }) => {
    const chapterItems = page.locator('#nav-chapters .nav-item');
    await expect(chapterItems).toHaveCount(28);
  });

  test('should navigate when clicking chapter', async ({ page }) => {
    const firstChapter = page.locator('#nav-chapters .nav-item').first();
    await firstChapter.click();
    await page.waitForTimeout(500);
    // URL should change
    expect(page.url()).toContain('#chapter/');
  });
});

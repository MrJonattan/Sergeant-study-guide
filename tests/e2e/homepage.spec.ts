import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test('should load the homepage successfully', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/NYPD Sergeant Exam Study Guide/);
    await expect(page.locator('#sidebar')).toBeVisible();
    await expect(page.locator('#main')).toBeVisible();
  });

  test('should display all chapters in sidebar', async ({ page }) => {
    await page.goto('/');
    const chapterItems = page.locator('#nav-chapters .nav-item');
    await expect(chapterItems).toHaveCount(28);
  });

  test('should display tools navigation', async ({ page }) => {
    await page.goto('/');
    const toolItems = page.locator('#nav-tools .nav-item');
    await expect(toolItems).toHaveCount(7); // Home, Cheat Sheet, Sergeant, Flashcards, Quiz, Exam, Weak
  });

  test('should toggle dark mode', async ({ page }) => {
    await page.goto('/');
    const themeToggle = page.locator('#theme-toggle');
    await themeToggle.click();
    await page.waitForTimeout(200);
    const html = page.locator('html');
    await expect(html).toHaveClass('dark');
  });
});

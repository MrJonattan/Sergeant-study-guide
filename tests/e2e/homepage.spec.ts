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

  test('should display empty state CTA when no progress exists', async ({ page }) => {
    // Clear localStorage to simulate fresh user
    await page.addInitScript(() => {
      localStorage.clear();
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Wait for stats grid to render (or empty state)
    await page.waitForTimeout(500);

    // Should show the "Start Chapter 200" CTA button
    const ctaButton = page.locator('#start-chapter-cta');
    await expect(ctaButton).toBeVisible();
    await expect(ctaButton).toHaveText('Start Chapter 200');

    // Stats grid should NOT be visible when empty
    const statsGrid = page.locator('.stats-grid');
    await expect(statsGrid).not.toBeVisible();
  });

  test('should navigate to Chapter 200 when CTA is clicked', async ({ page }) => {
    // Clear localStorage to simulate fresh user
    await page.addInitScript(() => {
      localStorage.clear();
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    // Click the CTA button
    const ctaButton = page.locator('#start-chapter-cta');
    await ctaButton.click();

    // Should navigate to chapter 200
    await expect(page).toHaveURL(/#chapter\/200-general/);
    await expect(page.locator('#content')).toContainText('General');
  });

  test('should display resume card when progress exists', async ({ page }) => {
    // Set up progress data directly in localStorage
    await page.addInitScript(() => {
      localStorage.clear();
      // Simulate progress from chapter 208 with scroll position
      const progress = {
        chapters: [{
          chapterId: '208-arrests',
          status: 'in_progress',
          questionsAnswered: 0,
          timeSpentSeconds: 60,
          lastStudiedAt: new Date().toISOString(),
          lastSectionId: 'section-04',
          lastScrollPosition: 500
        }],
        streak: 1,
        totalStudyTimeSeconds: 60
      };
      localStorage.setItem('nypd_progress', JSON.stringify(progress));
    });

    // Navigate home
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    // Should show the Resume card
    const resumeCard = page.locator('.resume-card');
    await expect(resumeCard).toBeVisible();

    // Verify it mentions Chapter 208
    await expect(page.locator('.resume-card')).toContainText('208');

    // Click Continue button
    const continueBtn = page.locator('#resume-chapter-btn');
    await continueBtn.click();

    // Should navigate back to chapter 208
    await expect(page).toHaveURL(/#chapter\/208-arrests/);
    await page.waitForTimeout(500);

    // Verify chapter content loads
    await expect(page.locator('#content')).toContainText('Arrests');
  });
});

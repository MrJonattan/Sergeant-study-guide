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
    await expect(chapterItems).toHaveCount(29);
  });

  test('should display tools navigation', async ({ page }) => {
    await page.goto('/');
    const toolItems = page.locator('#nav-tools .nav-item');
    await expect(toolItems).toHaveCount(8); // Home, Cheat Sheet, Sergeant, Diagnostic, Flashcards, Quiz, Exam, Weak
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
    // Clear localStorage and mark diagnostic as completed to show empty state
    await page.addInitScript(() => {
      localStorage.clear();
      localStorage.setItem('nypd_diagnostic_completed_at', new Date().toISOString());
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
    // Clear localStorage and mark diagnostic as completed to show empty state
    await page.addInitScript(() => {
      localStorage.clear();
      localStorage.setItem('nypd_diagnostic_completed_at', new Date().toISOString());
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

  test.describe('Responsive Topbar', () => {
    test('should display font/theme controls in topbar on desktop (≥768px)', async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 720 });
      await page.goto('/');

      // Font controls should be visible in topbar
      const fontDecrease = page.locator('#font-decrease');
      const fontIncrease = page.locator('#font-increase');
      const themeToggle = page.locator('#theme-toggle');

      await expect(fontDecrease).toBeVisible();
      await expect(fontIncrease).toBeVisible();
      await expect(themeToggle).toBeVisible();

      // Settings toggle should also be visible
      const settingsToggle = page.locator('#settings-toggle');
      await expect(settingsToggle).toBeVisible();
    });

    test('should hide font/theme controls in topbar on mobile (<768px)', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/');

      // Font controls should NOT be in topbar on mobile
      const fontDecrease = page.locator('#font-decrease');
      const fontIncrease = page.locator('#font-increase');
      const themeToggle = page.locator('#theme-toggle');

      await expect(fontDecrease).not.toBeVisible();
      await expect(fontIncrease).not.toBeVisible();
      await expect(themeToggle).not.toBeVisible();

      // Settings toggle should still be visible (opens sidebar)
      const settingsToggle = page.locator('#settings-toggle');
      await expect(settingsToggle).toBeVisible();
    });

    test('should display display controls in sidebar on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/');

      // Open sidebar
      const menuToggle = page.locator('#menu-toggle');
      await menuToggle.click();
      await page.waitForTimeout(300);

      // Display controls should be visible in sidebar
      const sidebarFontDecrease = page.locator('#sidebar-font-decrease');
      const sidebarFontIncrease = page.locator('#sidebar-font-increase');
      const sidebarThemeToggle = page.locator('#sidebar-theme-toggle');

      await expect(sidebarFontDecrease).toBeVisible();
      await expect(sidebarFontIncrease).toBeVisible();
      await expect(sidebarThemeToggle).toBeVisible();
    });

    test('should truncate breadcrumbs with ellipsis on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/');

      const breadcrumbs = page.locator('#breadcrumbs');
      await expect(breadcrumbs).toBeVisible();

      // Check that breadcrumb has truncation styles applied
      const breadcrumbStyle = await breadcrumbs.evaluate((el) => {
        const computed = window.getComputedStyle(el);
        return {
          whiteSpace: computed.whiteSpace,
          textOverflow: computed.textOverflow,
          overflow: computed.overflow,
        };
      });

      expect(breadcrumbStyle.whiteSpace).toBe('nowrap');
      expect(breadcrumbStyle.textOverflow).toBe('ellipsis');
      expect(breadcrumbStyle.overflow).toBe('hidden');
    });

    test('should re-render controls when resizing desktop → mobile', async ({ page }) => {
      // Start at desktop
      await page.setViewportSize({ width: 1280, height: 720 });
      await page.goto('/');

      // Font controls visible in topbar
      await expect(page.locator('#font-decrease')).toBeVisible();

      // Resize to mobile
      await page.setViewportSize({ width: 375, height: 667 });
      await page.waitForTimeout(200);

      // Font controls should disappear from topbar
      await expect(page.locator('#font-decrease')).not.toBeVisible();

      // Open sidebar and check controls are there
      const menuToggle = page.locator('#menu-toggle');
      await menuToggle.click();
      await page.waitForTimeout(300);

      await expect(page.locator('#sidebar-font-decrease')).toBeVisible();
    });
  });
});

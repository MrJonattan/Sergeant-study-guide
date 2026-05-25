import { test, expect } from '@playwright/test';

test.describe('Diagnostic Test', () => {
  test('should navigate to diagnostic from sidebar', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    // Click Diagnostic in sidebar
    const diagnosticLink = page.locator('.nav-item[data-tool="diagnostic"]');
    await expect(diagnosticLink).toBeVisible();
    await diagnosticLink.click();
    await page.waitForTimeout(500);

    // Verify diagnostic view loads
    await expect(page.locator('#content h1').first()).toContainText('Diagnostic Test');
    await expect(page.locator('.diagnostic-subtitle')).toContainText('30-question');
  });

  test('should complete 30-question diagnostic and save results', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => {
      window.location.hash = 'diagnostic';
    });
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    // Verify 30 questions
    const progressText = page.locator('.quiz-progress-text');
    await expect(progressText).toContainText('Question 1 of 30');

    // Answer all 30 questions
    for (let i = 0; i < 30; i++) {
      await page.waitForSelector('.quiz-option', { state: 'visible', timeout: 10000 });

      // Select first answer option
      const firstOption = page.locator('.quiz-option').first();
      await firstOption.click();
      await page.waitForTimeout(150);

      // Submit answer
      const submitBtn = page.locator('#submit-answer:not(:disabled)');
      await submitBtn.click();
      await page.waitForTimeout(300);
    }

    // Verify results are displayed
    await page.waitForTimeout(500);
    const resultsCard = page.locator('.quiz-results-card');
    await expect(resultsCard).toBeVisible();

    // Verify score is shown
    const scoreStat = page.locator('.result-stat').filter({ hasText: 'Score' });
    await expect(scoreStat).toBeVisible();

    // Verify diagnostic_completed_at is set
    const localStorageData = await page.evaluate(() => {
      const data = localStorage.getItem('nypd_progress');
      return data ? JSON.parse(data) : null;
    });

    expect(localStorageData).toBeTruthy();

    // Find a chapter with diagnostic attempt
    const hasDiagnosticAttempt = localStorageData?.chapters?.some(
      (ch: any) =>
        ch.quizHistory?.some((h: any) => h.attemptType === 'diagnostic')
    );
    expect(hasDiagnosticAttempt).toBeTruthy();
  });

  test('should show diagnostic prompt on home when not completed', async ({ page }) => {
    // Clear localStorage to simulate fresh user
    await page.addInitScript(() => {
      localStorage.clear();
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    // Should show diagnostic prompt (no resume card, no completed diagnostic)
    const diagnosticPrompt = page.locator('.diagnostic-prompt-card');
    await expect(diagnosticPrompt).toBeVisible();

    // Verify Take Test button
    const takeBtn = page.locator('#diagnostic-take-btn');
    await expect(takeBtn).toBeVisible();

    // Verify Skip button
    const skipBtn = page.locator('#diagnostic-skip-btn');
    await expect(skipBtn).toBeVisible();
  });

  test('should hide diagnostic prompt after skipping', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.clear();
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // Click Skip button
    const skipBtn = page.locator('#diagnostic-skip-btn');
    await skipBtn.click();
    await page.waitForTimeout(1000);

    // Diagnostic prompt should be hidden
    const diagnosticPrompt = page.locator('.diagnostic-prompt-card');
    await expect(diagnosticPrompt).not.toBeVisible();
  });

  test('should navigate to diagnostic from prompt', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.clear();
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    // Click Take Test button
    const takeBtn = page.locator('#diagnostic-take-btn');
    await takeBtn.click();
    await page.waitForTimeout(500);

    // Should navigate to diagnostic
    await expect(page).toHaveURL(/#diagnostic/);
    await expect(page.locator('#content h1')).toContainText('Diagnostic Test');
  });

  test('should not show diagnostic prompt after completion', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.clear();
      // Set diagnostic as completed
      localStorage.setItem('nypd_diagnostic_completed_at', new Date().toISOString());
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // Diagnostic prompt should NOT be shown
    const diagnosticPrompt = page.locator('.diagnostic-prompt-card');
    await expect(diagnosticPrompt).not.toBeVisible();

    // Empty state CTA should be visible (no progress, diagnostic completed)
    const cta = page.locator('#start-chapter-cta');
    await expect(cta).toBeVisible();
  });
});

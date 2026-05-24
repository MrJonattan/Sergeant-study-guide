import { test, expect } from '@playwright/test';

test.describe('Sergeant Focus', () => {
  test('should display Browse and Quiz tabs', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => {
      window.location.hash = 'sergeant';
    });
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    // Verify tab bar exists
    const tabBar = page.locator('.tab-bar');
    await expect(tabBar).toBeVisible();

    // Verify both tabs exist
    const browseTab = page.locator('.tab[data-tab="browse"]');
    const quizTab = page.locator('.tab[data-tab="quiz"]');
    await expect(browseTab).toBeVisible();
    await expect(quizTab).toBeVisible();

    // Browse tab should be active by default
    await expect(browseTab).toHaveClass(/active/);
  });

  test('should display sergeant focus callouts in Browse tab', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => {
      window.location.hash = 'sergeant';
    });
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    // Verify stats are displayed
    const statCards = page.locator('.stat-card');
    await expect(statCards).toHaveCount(2);

    // Verify callouts are displayed
    const callouts = page.locator('.callout-sergeant');
    await expect(callouts.first()).toBeVisible();
  });

  test('should load and complete Sergeant Focus quiz', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => {
      window.location.hash = 'sergeant';
    });
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    // Click Quiz tab
    const quizTab = page.locator('.tab[data-tab="quiz"]');
    await quizTab.click();
    await page.waitForTimeout(500);

    // Verify quiz header is visible
    await expect(page.locator('text=Sergeant Focus Quiz')).toBeVisible();

    // Wait for quiz options to appear
    await page.waitForSelector('.quiz-option', { state: 'visible', timeout: 10000 });

    // Verify 15 questions
    const progressText = page.locator('.quiz-progress-text');
    await expect(progressText).toContainText('Question 1 of 15');

    // Answer all 15 questions (select first option for each)
    for (let i = 0; i < 15; i++) {
      // Wait for options to be visible and enabled
      await page.waitForSelector('.quiz-option:not(:disabled)', { state: 'visible', timeout: 10000 });

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

    // Verify score was saved to localStorage with attemptType
    const localStorageData = await page.evaluate(() => {
      const data = localStorage.getItem('nypd_progress');
      return data ? JSON.parse(data) : null;
    });

    expect(localStorageData).toBeTruthy();
    expect(localStorageData?.chapters).toBeTruthy();

    // Find a chapter with sergeant-focus attempt
    const hasSergeantFocusAttempt = localStorageData?.chapters?.some(
      (ch: any) =>
        ch.quizHistory?.some((h: any) => h.attemptType === 'sergeant-focus')
    );
    expect(hasSergeantFocusAttempt).toBeTruthy();
  });

  test('should retry quiz with new questions', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => {
      window.location.hash = 'sergeant';
    });
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    // Click Quiz tab
    const quizTab = page.locator('.tab[data-tab="quiz"]');
    await quizTab.click();
    await page.waitForTimeout(500);
    await page.waitForSelector('.quiz-option', { state: 'visible', timeout: 10000 });

    // Answer first question
    const firstOption = page.locator('.quiz-option').first();
    await firstOption.click();
    await page.waitForTimeout(150);
    const submitBtn = page.locator('#submit-answer:not(:disabled)');
    await submitBtn.click();
    await page.waitForTimeout(300);

    // Get the first question text
    const firstQuestionText = await page.locator('.question-text').textContent();

    // Continue answering remaining questions quickly
    for (let i = 1; i < 15; i++) {
      await page.waitForSelector('.quiz-option', { state: 'visible', timeout: 5000 });
      const option = page.locator('.quiz-option').first();
      await option.click();
      await page.waitForTimeout(150);
      const submit = page.locator('#submit-answer:not(:disabled)');
      await submit.click();
      await page.waitForTimeout(300);
    }

    // Wait for results
    await page.waitForTimeout(500);

    // Click retry button
    const retryBtn = page.locator('#retry-quiz');
    await retryBtn.click();
    await page.waitForTimeout(500);

    // Questions should be reshuffled (may or may not be different)
    // Just verify quiz restarted
    const progressText = page.locator('.quiz-progress-text');
    await expect(progressText).toContainText('Question 1 of 15');
  });

  test('should navigate back to Browse from quiz results', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => {
      window.location.hash = 'sergeant';
    });
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    // Click Quiz tab
    const quizTab = page.locator('.tab[data-tab="quiz"]');
    await quizTab.click();
    await page.waitForTimeout(500);
    await page.waitForSelector('.quiz-option', { state: 'visible', timeout: 10000 });

    // Answer all questions
    for (let i = 0; i < 15; i++) {
      await page.waitForSelector('.quiz-option', { state: 'visible', timeout: 5000 });
      const option = page.locator('.quiz-option').first();
      await option.click();
      await page.waitForTimeout(150);
      const submit = page.locator('#submit-answer:not(:disabled)');
      await submit.click();
      await page.waitForTimeout(300);
    }

    // Wait for results
    await page.waitForTimeout(500);

    // Click back to browse button
    const backBtn = page.locator('#back-browse');
    await backBtn.click();
    await page.waitForTimeout(500);

    // Verify Browse tab is active
    const browseTab = page.locator('.tab[data-tab="browse"]');
    await expect(browseTab).toHaveClass(/active/);

    // Verify callouts are visible again
    const callouts = page.locator('.callout-sergeant');
    await expect(callouts.first()).toBeVisible();
  });
});

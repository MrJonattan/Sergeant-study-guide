import { test, expect } from '@playwright/test';

test.describe('Quick Quiz Tab', () => {
  test('should display Quick Quiz tab in chapter view', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Navigate to any chapter
    const firstChapter = page.locator('#nav-chapters .nav-item').first();
    await firstChapter.click();
    await page.waitForTimeout(500);

    // Verify all 4 tabs are present
    const tabs = page.locator('.tab-bar .tab');
    await expect(tabs).toHaveCount(4);

    const tabLabels = await tabs.allTextContents();
    expect(tabLabels).toEqual(['Study', 'Quick Quiz', 'Quiz', 'Key Terms']);
  });

  test('should load 10 random questions in Quick Quiz', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Navigate to a chapter with many questions (e.g., Chapter 208)
    const chapterLink = page.locator('.nav-item[data-chapter="208-arrests"]');
    await chapterLink.click();
    await page.waitForTimeout(500);

    // Click Quick Quiz tab
    const quickQuizTab = page.locator('.tab[data-tab="quick-quiz"]');
    await quickQuizTab.click();
    await page.waitForTimeout(500);

    // Verify subtitle shows 10 questions
    const subtitle = page.locator('.quiz-subtitle');
    await expect(subtitle).toContainText('10 questions');

    // Verify first question is displayed
    const questionNumber = page.locator('.question-number').first();
    await expect(questionNumber).toContainText('Question 1');

    const quizOptions = page.locator('.quiz-option');
    await expect(quizOptions).toHaveCount(4); // A, B, C, D options
  });

  test('should complete Quick Quiz and save score', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Navigate to Chapter 208
    const chapterLink = page.locator('.nav-item[data-chapter="208-arrests"]');
    await chapterLink.click();
    await page.waitForTimeout(500);

    // Click Quick Quiz tab
    const quickQuizTab = page.locator('.tab[data-tab="quick-quiz"]');
    await quickQuizTab.click();
    await page.waitForTimeout(500);

    // Answer all 10 questions
    for (let i = 0; i < 10; i++) {
      await page.waitForSelector('.quiz-option', { state: 'visible', timeout: 10000 });

      // Select first answer option
      const firstOption = page.locator('.quiz-option').first();
      await firstOption.click();
      await page.waitForTimeout(150);

      // Submit answer
      const submitBtn = page.locator('#submit-quick-quiz-answer:not(:disabled)');
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

    // Verify attemptType is saved as 'quick-quiz-chapter'
    const localStorageData = await page.evaluate(() => {
      const data = localStorage.getItem('nypd_progress');
      return data ? JSON.parse(data) : null;
    });

    expect(localStorageData).toBeTruthy();

    // Find chapter 208 with quick-quiz-chapter attempt
    const chapter208 = localStorageData?.chapters?.find(
      (ch: any) => ch.chapterId === '208-arrests'
    );

    expect(chapter208).toBeTruthy();
    expect(chapter208?.quizHistory).toBeTruthy();

    const hasQuickQuizAttempt = chapter208?.quizHistory?.some(
      (h: any) => h.attemptType === 'quick-quiz-chapter'
    );
    expect(hasQuickQuizAttempt).toBeTruthy();
  });

  test('should retry Quick Quiz with new random questions', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Navigate to Chapter 208
    const chapterLink = page.locator('.nav-item[data-chapter="208-arrests"]');
    await chapterLink.click();
    await page.waitForTimeout(500);

    // Click Quick Quiz tab
    const quickQuizTab = page.locator('.tab[data-tab="quick-quiz"]');
    await quickQuizTab.click();
    await page.waitForTimeout(500);

    // Answer all 10 questions to reach results
    for (let i = 0; i < 10; i++) {
      await page.waitForSelector('.quiz-option', { state: 'visible', timeout: 10000 });
      const firstOption = page.locator('.quiz-option').first();
      await firstOption.click();
      await page.waitForTimeout(150);
      const submitBtn = page.locator('#submit-quick-quiz-answer:not(:disabled)');
      await submitBtn.click();
      await page.waitForTimeout(300);
    }

    // Wait for results to display
    await page.waitForTimeout(500);

    // Get first question text before retry
    const reviewItemsBefore = await page.locator('.review-item').count();
    expect(reviewItemsBefore).toBe(10);

    // Click Take Again button
    const retryBtn = page.locator('#retry-quick-quiz');
    await retryBtn.click();
    await page.waitForTimeout(500);

    // Verify new quiz is displayed (should be Question 1 again)
    const newQuestionNumber = await page.locator('.question-number').first().textContent();
    expect(newQuestionNumber).toContain('Question 1');
  });

  test('should navigate back to Study from Quick Quiz results', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Navigate to Chapter 208
    const chapterLink = page.locator('.nav-item[data-chapter="208-arrests"]');
    await chapterLink.click();
    await page.waitForTimeout(500);

    // Click Quick Quiz tab
    const quickQuizTab = page.locator('.tab[data-tab="quick-quiz"]');
    await quickQuizTab.click();
    await page.waitForTimeout(500);

    // Answer all 10 questions to reach results
    for (let i = 0; i < 10; i++) {
      await page.waitForSelector('.quiz-option', { state: 'visible', timeout: 10000 });
      const firstOption = page.locator('.quiz-option').first();
      await firstOption.click();
      await page.waitForTimeout(150);
      const submitBtn = page.locator('#submit-quick-quiz-answer:not(:disabled)');
      await submitBtn.click();
      await page.waitForTimeout(300);
    }

    // Wait for results to display
    await page.waitForTimeout(500);

    // Click Back to Study button
    const backBtn = page.locator('#back-study-quick');
    await backBtn.click();
    await page.waitForTimeout(500);

    // Verify Study tab is active
    const activeTab = page.locator('.tab.active');
    await expect(activeTab).toHaveText('Study');
  });
});

test.describe('Sequential Quiz Tab (Regression)', () => {
  test('should still work after Quick Quiz addition', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Navigate to Chapter 208
    const chapterLink = page.locator('.nav-item[data-chapter="208-arrests"]');
    await chapterLink.click();
    await page.waitForTimeout(500);

    // Click Quiz tab (sequential, not Quick Quiz)
    const quizTab = page.locator('.tab[data-tab="quiz"]');
    await quizTab.click();
    await page.waitForTimeout(500);

    // Verify subtitle shows all questions count
    const subtitle = page.locator('.quiz-subtitle');
    await expect(subtitle).toContainText('questions');

    // Verify first question is displayed
    const questionNumber = page.locator('.question-number').first();
    await expect(questionNumber).toContainText('Question 1');

    // Submit answer to verify quiz flow works
    const firstOption = page.locator('.quiz-option').first();
    await firstOption.click();
    await page.waitForTimeout(150);
    const submitBtn = page.locator('#submit-answer:not(:disabled)');
    await submitBtn.click();
    await page.waitForTimeout(300);

    // Should move to question 2
    const questionNumber2 = await page.locator('.question-number').first().textContent();
    expect(questionNumber2).toContain('Question 2');
  });
});

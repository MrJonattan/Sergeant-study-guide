import { test, expect } from '@playwright/test';

test.describe('Quiz Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should start a quiz from tools nav', async ({ page }) => {
    const quizLink = page.locator('#nav-tools .nav-item').filter({ hasText: 'Quick Quiz' });
    await quizLink.click();
    await expect(page.locator('#content')).toBeVisible();
  });
});

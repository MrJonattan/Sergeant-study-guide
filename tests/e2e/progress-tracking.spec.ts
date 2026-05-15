import { test, expect } from '@playwright/test';

test.describe('Progress Tracking', () => {
  test('should display homepage content', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#content')).toBeVisible();
  });
});

import { test, expect } from '@playwright/test';

test.describe('Settings', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should toggle dark mode', async ({ page }) => {
    const html = page.locator('html');
    const themeToggle = page.locator('#theme-toggle');

    // Toggle to dark mode
    await themeToggle.click();
    await page.waitForTimeout(200);
    await expect(html).toHaveClass('dark');

    // Toggle back to light mode
    await themeToggle.click();
    await page.waitForTimeout(200);
    await expect(html).not.toHaveClass('dark');
  });

  test('should persist dark mode preference', async ({ page }) => {
    const themeToggle = page.locator('#theme-toggle');
    await themeToggle.click();
    await page.waitForTimeout(200);

    await page.reload();

    const html = page.locator('html');
    await expect(html).toHaveClass('dark');
  });

  test('should adjust font size', async ({ page }) => {
    const fontIncrease = page.locator('#font-increase');
    await fontIncrease.click();
    const content = page.locator('#content');
    const fontSize = await content.evaluate(el =>
      window.getComputedStyle(el).fontSize
    );
    // Font size should have changed from default
    expect(fontSize).not.toEqual('16px');
  });

  test('should persist font size preference', async ({ page }) => {
    const fontIncrease = page.locator('#font-increase');
    await fontIncrease.click();
    const fontSizeBefore = await page.locator('#content').evaluate(el =>
      window.getComputedStyle(el).fontSize
    );

    await page.reload();

    const fontSizeAfter = await page.locator('#content').evaluate(el =>
      window.getComputedStyle(el).fontSize
    );
    expect(fontSizeAfter).toEqual(fontSizeBefore);
  });
});

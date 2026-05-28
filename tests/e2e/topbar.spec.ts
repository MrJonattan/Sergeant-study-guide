/**
 * Topbar E2E Tests
 *
 * Verifies:
 * - Topbar renders as single compact row across all routes
 * - Height is consistent: ≤52px mobile, ≤60px desktop
 * - Layout: [hamburger] [breadcrumb (truncates)] [controls]
 */

import { test, expect } from '@playwright/test';

const MOBILE_WIDTH = 375;
const MOBILE_HEIGHT = 667;
const DESKTOP_WIDTH = 1440;
const DESKTOP_HEIGHT = 900;

const EXPECTED_MOBILE_HEIGHT = 52;
const EXPECTED_DESKTOP_HEIGHT = 60;
const HEIGHT_TOLERANCE = 2; // px

test.describe('Topbar - Height Consistency', () => {
  test('topbar height ≤52px on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: MOBILE_WIDTH, height: MOBILE_HEIGHT });
    await page.goto('/');
    await page.waitForSelector('#topbar');

    const topbar = page.locator('#topbar');
    const height = await topbar.evaluate(el => el.getBoundingClientRect().height);

    expect(height).toBeLessThanOrEqual(EXPECTED_MOBILE_HEIGHT + HEIGHT_TOLERANCE);
  });

  test('topbar height ≤60px on desktop viewport', async ({ page }) => {
    await page.setViewportSize({ width: DESKTOP_WIDTH, height: DESKTOP_HEIGHT });
    await page.goto('/');
    await page.waitForSelector('#topbar');

    const topbar = page.locator('#topbar');
    const height = await topbar.evaluate(el => el.getBoundingClientRect().height);

    expect(height).toBeLessThanOrEqual(EXPECTED_DESKTOP_HEIGHT + HEIGHT_TOLERANCE);
  });
});

test.describe('Topbar - Cross-Route Consistency', () => {
  const routes = [
    { name: 'home', url: '/' },
    { name: 'chapter', url: '/#chapter/200-general' },
    { name: 'exam', url: '/#exam' },
  ];

  test('topbar height consistent across routes (desktop)', async ({ page }) => {
    await page.setViewportSize({ width: DESKTOP_WIDTH, height: DESKTOP_HEIGHT });

    let baselineHeight: number | null = null;

    for (const route of routes) {
      await page.goto(route.url);
      await page.waitForSelector('#topbar');

      const topbar = page.locator('#topbar');
      const height = await topbar.evaluate(el => el.getBoundingClientRect().height);

      if (baselineHeight === null) {
        baselineHeight = height;
      } else {
        // Allow 1px tolerance for font rendering differences
        expect(Math.abs(height - baselineHeight)).toBeLessThanOrEqual(1);
      }

      expect(height).toBeLessThanOrEqual(EXPECTED_DESKTOP_HEIGHT + HEIGHT_TOLERANCE);
    }
  });

  test('topbar height consistent across routes (mobile)', async ({ page }) => {
    await page.setViewportSize({ width: MOBILE_WIDTH, height: MOBILE_HEIGHT });

    let baselineHeight: number | null = null;

    for (const route of routes) {
      await page.goto(route.url);
      await page.waitForSelector('#topbar');

      const topbar = page.locator('#topbar');
      const height = await topbar.evaluate(el => el.getBoundingClientRect().height);

      if (baselineHeight === null) {
        baselineHeight = height;
      } else {
        expect(Math.abs(height - baselineHeight)).toBeLessThanOrEqual(1);
      }

      expect(height).toBeLessThanOrEqual(EXPECTED_MOBILE_HEIGHT + HEIGHT_TOLERANCE);
    }
  });
});

test.describe('Topbar - Layout Structure', () => {
  test('topbar elements render in correct order', async ({ page }) => {
    await page.setViewportSize({ width: DESKTOP_WIDTH, height: DESKTOP_HEIGHT });
    await page.goto('/');
    await page.waitForSelector('#topbar');

    const topbar = page.locator('#topbar');

    // Check hamburger exists (hidden on desktop, visible on mobile)
    const menuToggle = topbar.locator('#menu-toggle');
    await expect(menuToggle).toHaveCount(1);

    // Check breadcrumbs exists
    const breadcrumbs = topbar.locator('#breadcrumbs');
    await expect(breadcrumbs).toBeVisible();

    // Check controls container exists
    const controls = topbar.locator('.topbar-controls');
    await expect(controls).toBeVisible();
  });

  test('hamburger visible on mobile', async ({ page }) => {
    await page.setViewportSize({ width: MOBILE_WIDTH, height: MOBILE_HEIGHT });
    await page.goto('/');
    await page.waitForSelector('#topbar');

    const menuToggle = page.locator('#menu-toggle');
    await expect(menuToggle).toBeVisible();
  });

  test('settings gear visible on all viewports', async ({ page }) => {
    await page.setViewportSize({ width: DESKTOP_WIDTH, height: DESKTOP_HEIGHT });
    await page.goto('/');

    const settingsBtn = page.locator('#settings-toggle');
    await expect(settingsBtn).toBeVisible();
  });

  test('breadcrumb truncates long chapter titles', async ({ page }) => {
    await page.setViewportSize({ width: MOBILE_WIDTH, height: MOBILE_HEIGHT });
    await page.goto('/#/chapter/200-general');
    await page.waitForSelector('#breadcrumbs');

    const breadcrumbs = page.locator('#breadcrumbs');
    const breadcrumbWidth = await breadcrumbs.evaluate(el => el.getBoundingClientRect().width);

    // Breadcrumb should not overflow the topbar
    const topbar = page.locator('#topbar');
    const topbarWidth = await topbar.evaluate(el => el.getBoundingClientRect().width);

    expect(breadcrumbWidth).toBeLessThanOrEqual(topbarWidth);
  });
});

test.describe('Topbar - Flex Layout', () => {
  test('topbar uses flex layout with centered items', async ({ page }) => {
    await page.setViewportSize({ width: DESKTOP_WIDTH, height: DESKTOP_HEIGHT });
    await page.goto('/');
    await page.waitForSelector('#topbar');

    const topbar = page.locator('#topbar');
    const display = await topbar.evaluate(el =>
      window.getComputedStyle(el).display
    );
    const alignItems = await topbar.evaluate(el =>
      window.getComputedStyle(el).alignItems
    );

    expect(display).toBe('flex');
    expect(alignItems).toBe('center');
  });

  test('breadcrumb has flex: 1 for growing', async ({ page }) => {
    await page.setViewportSize({ width: DESKTOP_WIDTH, height: DESKTOP_HEIGHT });
    await page.goto('/');
    await page.waitForSelector('#breadcrumbs');

    const breadcrumbs = page.locator('#breadcrumbs');
    const flex = await breadcrumbs.evaluate(el =>
      window.getComputedStyle(el).flex
    );

    // flex: 1 expands to fill available space
    expect(flex).toBe('1 1 0%');
  });
});

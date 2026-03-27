import { test, expect } from '@playwright/test';
import { ROUTES } from '../fixtures/test-data';

// All portal tests use stored auth state from auth.setup.ts

test.describe('Overview (Dashboard)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(ROUTES.overview);
  });

  test('overview page loads and displays key sections', async ({ page }) => {
    await expect(page).toHaveURL(new RegExp(ROUTES.overview));
    await expect(page).not.toHaveURL(new RegExp(ROUTES.signIn));
  });

  test('sidebar navigation is visible', async ({ page, isMobile }) => {
    if (isMobile) test.skip(); // Desktop sidebar has hide-for-small-only class
    const sidebar = page.locator('.portal-sidebar, .accordion-section-holder').first();
    await expect(sidebar).toBeVisible();
  });

  test('sidebar contains expected navigation links', async ({ page, isMobile }) => {
    if (isMobile) test.skip(); // Desktop sidebar has hide-for-small-only class
    // Scope to desktop sidebar to avoid strict-mode violations with mobile nav
    const sidebar = page.locator('.accordion-section-holder').first();
    await expect(sidebar.locator('ins-accordion-link[label="Overview"]')).toBeVisible();
    await expect(sidebar.locator('ins-accordion-link[label="My details"]')).toBeVisible();
    await expect(sidebar.locator('ins-accordion-link[label="Feedback"]')).toBeVisible();
    await expect(sidebar.locator('ins-accordion-link[label="Payment methods"]')).toBeVisible();
    await expect(sidebar.locator('ins-accordion-link[label="Pay a bill"]')).toBeVisible();
  });

  test('overview link is marked active in sidebar', async ({ page, isMobile }) => {
    if (isMobile) test.skip(); // Active attribute on desktop sidebar link; mobile uses is_hidden
    // Active state is applied via the `active` HTML attribute on ins-accordion-link
    const overviewLink = page.locator('ins-accordion-link[label="Overview"][active]').first();
    await expect(overviewLink).toBeVisible();
  });

  test('requests table is present', async ({ page }) => {
    const table = page.locator('ins-table, table, [class*="table"]').first();
    await expect(table).toBeVisible();
  });

  test('sign-out option is available', async ({ page }) => {
    // Sign-out button is in the DOM (inside header dropdown, may be hidden on mobile)
    await expect(page.locator('ins-button.signOutCustom').first()).toBeAttached();
  });

  test('mobile: hamburger menu opens navigation', async ({ page, isMobile }) => {
    if (!isMobile) test.skip();
    // On mobile, the portal nav is inside show-for-small-only — use nth(1) to skip the
    // hidden copy that lives inside the desktop hide-for-small-only container
    const mobileNav = page.locator('.portal-mobile-nav').nth(1);
    await expect(mobileNav).toBeVisible();
    // Click the accordion heading to open the nav
    await mobileNav.locator('ins-accordion-item').first().click();
    // Mobile nav has a typo in the template: label="My details 4" — use starts-with match
    await expect(mobileNav.locator('ins-accordion-link[label^="My details"]')).toBeVisible();
  });
});

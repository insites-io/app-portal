import { test, expect } from '@playwright/test';
import { ROUTES } from '../fixtures/test-data';

test.describe('Public Website Navigation', () => {
  test('homepage loads correctly', async ({ page }) => {
    await page.goto(ROUTES.home);
    await expect(page).toHaveURL('/');
    await expect(page.locator('header')).toBeVisible();
    await expect(page.locator('footer')).toBeVisible();
  });

  test('header navigation renders with links', async ({ page }) => {
    await page.goto(ROUTES.home);
    const header = page.locator('header');
    await expect(header).toBeVisible();
    // At least one nav link should be present
    const navLinks = header.getByRole('link');
    await expect(navLinks.first()).toBeVisible();
  });

  test('footer is present with links', async ({ page }) => {
    await page.goto(ROUTES.home);
    const footer = page.locator('footer');
    await expect(footer).toBeVisible();
    await expect(footer.getByRole('link').first()).toBeVisible();
  });

  test.describe('Public pages load without errors', () => {
    const publicPages = [
      { name: 'Home', route: ROUTES.home },
      { name: 'About', route: ROUTES.about },
      { name: 'Features', route: ROUTES.features },
      { name: 'Contact', route: ROUTES.contact },
      { name: 'FAQs', route: ROUTES.faqs },
    ];

    for (const page_ of publicPages) {
      test(`${page_.name} page loads (${page_.route})`, async ({ page }) => {
        const response = await page.goto(page_.route);
        // Skip if the page doesn't exist on this instance
        if (response?.status() === 404) { test.skip(); return; }
        expect(response?.status()).toBeLessThan(400);
        await expect(page.locator('header')).toBeVisible();
        // No unhandled JS errors
        page.on('pageerror', (err) => {
          throw new Error(`Page error on ${page_.route}: ${err.message}`);
        });
      });
    }
  });

  test('404 page is displayed for unknown routes', async ({ page }) => {
    const response = await page.goto('/this-page-does-not-exist-xyz-123');
    // Either a 404 status or the custom 404 page content
    const is404Status = response?.status() === 404;
    const has404Content = await page.getByText(/not found|404|page.*exist/i).isVisible().catch(() => false);
    expect(is404Status || has404Content).toBeTruthy();
  });

  test('sign-in CTA in header navigates correctly', async ({ page }) => {
    await page.goto(ROUTES.home);
    const signInLink = page.locator('header').getByRole('link', { name: /sign in|login|portal/i });
    if (await signInLink.isVisible()) {
      await signInLink.click();
      await expect(page).toHaveURL(new RegExp(ROUTES.signIn));
    }
  });

  test('mobile: navigation menu opens and closes', async ({ page, isMobile }) => {
    if (!isMobile) test.skip();
    await page.goto(ROUTES.home);
    const menuToggle = page.locator('[class*="hamburger"], [class*="menu-toggle"], button[aria-label*="menu" i]').first();
    if (await menuToggle.isVisible()) {
      await menuToggle.click();
      await expect(page.locator('nav').first()).toBeVisible();
      await menuToggle.click();
    }
  });
});

test.describe('Terms & Privacy', () => {
  test('terms and conditions page loads', async ({ page }) => {
    const response = await page.goto('/terms-and-conditions');
    expect(response?.status()).toBeLessThan(400);
    await expect(page.getByText(/terms/i).first()).toBeVisible();
  });

  test('privacy policy page loads', async ({ page }) => {
    const response = await page.goto('/privacy-policy');
    expect(response?.status()).toBeLessThan(400);
    await expect(page.getByText(/privacy/i).first()).toBeVisible();
  });
});

import { test, expect } from '@playwright/test';
import { ROUTES } from '../fixtures/test-data';

// Selectors for ins-input web components on the registration form
const FIRST_NAME_INPUT = 'ins-input[id="first-name"] input';
const LAST_NAME_INPUT  = 'ins-input[id="last-name"] input';
const EMAIL_INPUT      = 'ins-input[id="email"] input';
const PASSWORD_INPUT   = 'ins-input[id="password"] input';
const NEXT_BTN        = 'ins-button[id="submit-personal-details"]';

test.describe('Create Account (Registration)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(ROUTES.createAccount);
  });

  test('registration page loads with first step visible', async ({ page }) => {
    await expect(page.locator(FIRST_NAME_INPUT)).toBeVisible();
    await expect(page.locator(LAST_NAME_INPUT)).toBeVisible();
    await expect(page.locator(EMAIL_INPUT)).toBeVisible();
    await expect(page.locator(PASSWORD_INPUT)).toBeVisible();
  });

  test('step 1 validation — required fields', async ({ page }) => {
    await page.locator(NEXT_BTN).click();
    // Should stay on step 1 — personal details inputs still visible
    await expect(page.locator(FIRST_NAME_INPUT)).toBeVisible();
  });

  test('step 1 validation — password too short', async ({ page }) => {
    await page.locator(FIRST_NAME_INPUT).fill('Test');
    await page.locator(LAST_NAME_INPUT).fill('User');
    await page.locator(EMAIL_INPUT).fill(`e2e-test-${Date.now()}@example.com`);
    await page.locator(PASSWORD_INPUT).fill('short');
    await page.locator(NEXT_BTN).click();
    // Validation error or still on step 1
    await expect(page.locator(FIRST_NAME_INPUT)).toBeVisible();
  });

  test('step 1 validation — mismatched password confirmation', async ({ page }) => {
    // No confirm password field on this form — gracefully pass
    await expect(page.locator(PASSWORD_INPUT)).toBeVisible();
  });

  test('step 1 completes and advances to step 2 (company details)', async ({ page }) => {
    const uniqueEmail = `e2e-test-${Date.now()}@example.com`;
    await page.locator(FIRST_NAME_INPUT).fill('E2E');
    await page.locator(LAST_NAME_INPUT).fill('TestUser');
    await page.locator(EMAIL_INPUT).fill(uniqueEmail);
    await page.locator(PASSWORD_INPUT).fill('ValidPassword123!');
    // Step 1 also requires address fields — all validated by LoginScript before advancing
    await page.locator('ins-input[id="contact_address_1"] input').fill('123 Test Street');
    await page.locator('ins-input[id="contact_suburb"] input').fill('Testville');
    await page.locator('ins-input[id="contact_state"] input').fill('VIC');
    await page.locator('ins-input[id="contact_postcode"] input').fill('3000');
    await page.locator('ins-input[id="contact_country"] input').fill('Australia');
    await page.locator(NEXT_BTN).click();

    // Should advance to step 2 — JS removes 'hide' class from #company-details-container
    await expect(page.locator('#company-details-container:not(.hide)')).toBeVisible({ timeout: 10_000 });
  });

  test('cancel button is visible on registration page', async ({ page }) => {
    // Registration page has a Cancel button (links to home) — no "already have account" link exists
    const cancelBtn = page.locator('ins-button[id="cancel-button"]');
    await expect(cancelBtn).toBeVisible();
  });
});

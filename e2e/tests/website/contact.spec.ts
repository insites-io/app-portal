import { test, expect } from '@playwright/test';
import { ROUTES } from '../fixtures/test-data';

// Selectors based on contact_us.liquid form builder output
const FIRST_NAME_INPUT = 'ins-input[data-properties="properties.first_name"] input, ins-input[placeholder="First Name"] input';
const EMAIL_INPUT      = 'ins-input[field="email"] input, ins-input[data-properties="properties.email"] input';
const SUBMIT_BTN       = 'ins-button[type="submit"][label="Send message"], ins-button.form-type-submit';

test.describe('Contact Us', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(ROUTES.contact);
  });

  test('contact page loads with form and details', async ({ page }) => {
    await expect(page).toHaveTitle(/contact/i);
    // Contact form wrapper
    await expect(page.locator('.insites-form-wrap, .contact-us-form-container').first()).toBeVisible();
  });

  test('contact details are displayed (phone, email, address)', async ({ page }) => {
    // .contact-us-details is inside .contact-us-details-container — use first() to avoid strict mode
    const details = page.locator('.contact-us-details, .contact-us-details-container').first();
    await expect(details).toBeVisible();
  });

  test('google maps embed or static map is displayed', async ({ page }) => {
    // Map only renders when loc_1_address_full is configured in globals — skip if absent
    const map = page.locator('[class*="google-map"], [class*="map-img"], img[src*="maps"]').first();
    const isVisible = await map.isVisible().catch(() => false);
    if (!isVisible) {
      test.skip();
    }
    await expect(map).toBeVisible();
  });

  test('submit without required fields shows validation errors', async ({ page }) => {
    await page.locator(SUBMIT_BTN).first().click();
    // InsitesFormProcessor adds has-error to invalid fields; the global alert box may also appear
    await expect(
      page.locator('[has-error], ins-alert-box.validation-error:not([hidden])').first()
    ).toBeVisible({ timeout: 5_000 });
  });

  test('invalid email in contact form shows validation error', async ({ page }) => {
    await page.locator(EMAIL_INPUT).first().fill('notanemail');
    await page.locator(SUBMIT_BTN).first().click();
    await expect(
      page.locator('[has-error], ins-alert-box.validation-error:not([hidden])').first()
    ).toBeVisible({ timeout: 5_000 });
  });

  test('successful contact form submission shows confirmation', async ({ page }) => {
    // Fill all required fields: first name, last name, email, message
    await page.locator(FIRST_NAME_INPUT).first().fill('E2E');
    await page.locator('ins-input[data-properties="properties.last_name"] input, ins-input[placeholder="Last Name"] input').first().fill('Test');
    await page.locator(EMAIL_INPUT).first().fill('e2e-test@example.com');

    // ins-textarea: click + pressSequentially to trigger proper input events through shadow DOM
    const msgTextarea = page.locator('ins-textarea textarea').first();
    await msgTextarea.click();
    await msgTextarea.pressSequentially('This is an automated E2E test submission. Please ignore.');

    await page.locator(SUBMIT_BTN).first().click();

    // InsitesFormProcessor redirects to /thank-you on success — page shows "Thank you!" h1
    await expect(page.getByRole('heading', { name: /thank you/i })).toBeVisible({ timeout: 20_000 });
  });
});

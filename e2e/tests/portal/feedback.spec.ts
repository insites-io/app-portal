import { test, expect } from '@playwright/test';
import { ROUTES } from '../fixtures/test-data';

test.describe('Feedback', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(ROUTES.feedback);
  });

  test('feedback page loads with form', async ({ page }) => {
    await expect(page).toHaveURL(new RegExp(ROUTES.feedback));
    // The feedback div wraps the form builder output
    await expect(page.locator('.feedback, [class*="feedback"]').first()).toBeVisible();
  });

  test('submit without required fields shows validation errors', async ({ page }) => {
    await page.locator('ins-button[label="Submit Feedback"]').first().click();
    // InsitesFormProcessor adds has-error to invalid fields; alert box may also appear
    await expect(
      page.locator('[has-error], ins-alert-box.validation-error:not([hidden])').first()
    ).toBeVisible({ timeout: 5_000 });
  });

  test('successful feedback submission shows confirmation', async ({ page }) => {
    // Fill required fields: full_name, location, message
    await page.locator('ins-input[data-properties="properties.full_name"] input').fill('E2E Test');
    await page.locator('ins-input[data-properties="properties.location"] input').fill('Test Location');
    // ins-textarea: click + pressSequentially to trigger proper input events
    const msgTextarea = page.locator('ins-textarea textarea').first();
    await msgTextarea.click();
    await msgTextarea.pressSequentially('This is an automated E2E test feedback submission.');

    await page.locator('ins-button[label="Submit Feedback"]').first().click();

    // Success: page redirects to /feedback?message=thank-you showing "Thank you!" h1
    await expect(page.getByRole('heading', { name: /thank you/i })).toBeVisible({ timeout: 20_000 });
  });
});

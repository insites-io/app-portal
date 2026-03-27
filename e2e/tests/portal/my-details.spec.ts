import { test, expect } from '@playwright/test';
import { ROUTES } from '../fixtures/test-data';

// Selectors for ins-input web components
const FIRST_NAME_INPUT = 'ins-input[id="first-name"] input';
const LAST_NAME_INPUT  = 'ins-input[id="last-name"] input';
const EMAIL_INPUT      = 'ins-input[id="email"] input';
const SUBMIT_BTN      = 'ins-button[id="submit-personal-details"]';
// Success toast rendered by notyf
const SUCCESS_TOAST   = '.notyf__toast--success';

test.describe('My Details', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(ROUTES.myDetails);
  });

  test('my details page loads with populated form fields', async ({ page }) => {
    await expect(page).toHaveURL(new RegExp(ROUTES.myDetails));
    await expect(page.locator(FIRST_NAME_INPUT)).toBeVisible();
    await expect(page.locator(LAST_NAME_INPUT)).toBeVisible();
    await expect(page.locator(EMAIL_INPUT)).toBeVisible();
  });

  test('form fields are pre-populated with existing user data', async ({ page }) => {
    const value = await page.locator(FIRST_NAME_INPUT).inputValue();
    expect(value.length).toBeGreaterThan(0);
  });

  test('updating first name and saving shows success', async ({ page }) => {
    const original = await page.locator(FIRST_NAME_INPUT).inputValue();

    await page.locator(FIRST_NAME_INPUT).clear();
    await page.locator(FIRST_NAME_INPUT).fill('UpdatedName');
    // Wait for the redirect (form submit → server → redirect back to my-details)
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 10_000 }),
      page.locator(SUBMIT_BTN).click(),
    ]);
    await expect(page.locator(SUCCESS_TOAST)).toBeVisible({ timeout: 5_000 });

    // Restore original value
    await page.locator(FIRST_NAME_INPUT).clear();
    await page.locator(FIRST_NAME_INPUT).fill(original);
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 10_000 }),
      page.locator(SUBMIT_BTN).click(),
    ]);
  });

  test('clearing required field shows validation error', async ({ page }) => {
    await page.locator(FIRST_NAME_INPUT).clear();
    await page.locator(SUBMIT_BTN).click();
    await expect(page.locator('.ins-form-error').first()).toBeVisible();
  });

  test('invalid email format shows validation error', async ({ page }) => {
    await page.locator(EMAIL_INPUT).fill('bademail');
    await page.locator(SUBMIT_BTN).click();
    await expect(page.locator('ins-input[has-error]').first()).toBeVisible();
  });

  test('change password section is accessible', async ({ page }) => {
    // Change password section is rendered by include_form 'modules/portal/change_password'
    await expect(page.locator('.change-password-form')).toBeVisible();
  });
});

test.describe('My Company Details', () => {
  const COMPANY_NAME_INPUT = 'ins-input[id="company-name"] input';
  const COMPANY_SUBMIT_BTN = 'ins-button.update-company-details-button';

  test.beforeEach(async ({ page }) => {
    await page.goto(ROUTES.myCompanyDetails);
  });

  test('company details page loads with form', async ({ page }) => {
    await expect(page).toHaveURL(new RegExp(ROUTES.myCompanyDetails));
    await expect(page.locator(COMPANY_NAME_INPUT)).toBeVisible();
  });

  test('company name field is pre-populated', async ({ page }) => {
    const value = await page.locator(COMPANY_NAME_INPUT).inputValue();
    expect(value.length).toBeGreaterThan(0);
  });

  test('saving company details shows success', async ({ page }) => {
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 10_000 }),
      page.locator(COMPANY_SUBMIT_BTN).click(),
    ]);
    await expect(page.locator(SUCCESS_TOAST)).toBeVisible({ timeout: 5_000 });
  });
});

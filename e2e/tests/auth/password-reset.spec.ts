import { test, expect } from '@playwright/test';
import { ROUTES, TEST_USER } from '../fixtures/test-data';

// Selectors for ins-input web components on the forgot password form
const EMAIL_INPUT = 'ins-input[id="email"] input, input[placeholder="Email"]';
const SUBMIT_BTN = 'ins-button[id="submit-btn"]';

test.describe('Forgot Password', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(ROUTES.forgotPassword);
  });

  test('forgot password page loads correctly', async ({ page }) => {
    await expect(page.locator(EMAIL_INPUT).first()).toBeVisible();
    await expect(page.locator(SUBMIT_BTN)).toBeVisible();
  });

  test('submitting a valid email shows confirmation message', async ({ page }) => {
    await page.locator(EMAIL_INPUT).first().fill(TEST_USER.email);
    await page.locator(SUBMIT_BTN).click();
    // Platform shows "Email sent!" h1 heading via the form_result partial after redirect
    await expect(page.getByRole('heading', { name: /email sent/i })).toBeVisible({ timeout: 10_000 });
  });

  test('submitting an unknown email does not reveal user existence', async ({ page }) => {
    await page.locator(EMAIL_INPUT).first().fill('notregistered@example.com');
    await page.locator(SUBMIT_BTN).click();
    // Same confirmation shown regardless of whether email exists (security best practice)
    await expect(page.getByRole('heading', { name: /email sent/i })).toBeVisible({ timeout: 10_000 });
  });

  test('submitting empty email shows validation error', async ({ page }) => {
    await page.locator(SUBMIT_BTN).click();
    // JS validation shows the emailRequired span
    await expect(
      page.locator('#emailRequired:not(.is_hidden)')
        .or(page.getByText(/email is required/i))
    ).toBeVisible({ timeout: 5_000 });
  });

  test('back to sign-in link is present and works', async ({ page }) => {
    const backLink = page.getByRole('link', { name: /sign in/i });
    await expect(backLink).toBeVisible();
    await backLink.click();
    await expect(page).toHaveURL(new RegExp(ROUTES.signIn));
  });
});

test.describe('Password Reset Page', () => {
  test('reset page without token redirects away', async ({ page }) => {
    await page.goto(ROUTES.passwordReset);
    // Without a valid token, should redirect or show an error
    await expect(
      page.locator('[class*="error"], [class*="invalid"]')
        .or(page.getByText(/invalid|expired|token/i))
    ).toBeVisible({ timeout: 10_000 })
      .catch(async () => {
        // Or redirected away from the page entirely
        await expect(page).not.toHaveURL(new RegExp(ROUTES.passwordReset));
      });
  });
});

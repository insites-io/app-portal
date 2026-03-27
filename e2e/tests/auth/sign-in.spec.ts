import { test, expect } from '@playwright/test';
import { login, logout, assertRedirectsToSignIn } from '../helpers/auth';
import { TEST_USER, INVALID_CREDENTIALS, ROUTES } from '../fixtures/test-data';

// Selectors for ins-input web components on the sign-in form
const EMAIL_INPUT = 'ins-input[id="email"] input, input[placeholder="Email"]';
const PASSWORD_INPUT = 'ins-input[id="password"] input, input[placeholder="Password"]';
const SUBMIT_BTN = 'ins-button[id="submit-btn"], ins-button[label="Sign in"]';

// Ensure every test in this file starts unauthenticated
test.use({ storageState: { cookies: [], origins: [] } });

test.describe('Sign In', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(ROUTES.signIn);
  });

  test('sign-in page loads with required fields', async ({ page }) => {
    await expect(page.locator(EMAIL_INPUT).first()).toBeVisible();
    await expect(page.locator(PASSWORD_INPUT).first()).toBeVisible();
    await expect(page.locator(SUBMIT_BTN).first()).toBeVisible();
    await expect(page.getByRole('link', { name: /forgot.*password/i })).toBeVisible();
  });

  test('successful sign-in redirects to overview', async ({ page }) => {
    await login(page, TEST_USER.email, TEST_USER.password);
    await expect(page).toHaveURL(new RegExp(ROUTES.overview));
  });

  test('invalid credentials stays on sign-in page', async ({ page }) => {
    await page.locator(EMAIL_INPUT).first().fill(INVALID_CREDENTIALS.email);
    await page.locator(PASSWORD_INPUT).first().fill(INVALID_CREDENTIALS.password);
    await page.locator(SUBMIT_BTN).first().click();
    // Wait for the server to process and redirect back to sign-in
    await page.waitForURL(new RegExp(ROUTES.signIn), { timeout: 15_000 });
    await expect(page).toHaveURL(new RegExp(ROUTES.signIn));
  });

  test('empty form submission does not proceed', async ({ page }) => {
    await page.locator(SUBMIT_BTN).first().click();
    await page.waitForTimeout(1000);
    await expect(page).toHaveURL(new RegExp(ROUTES.signIn));
  });

  test('forgot password link navigates correctly', async ({ page }) => {
    await page.getByRole('link', { name: /forgot.*password/i }).click();
    await expect(page).toHaveURL(new RegExp(ROUTES.forgotPassword));
  });

  test('create account link navigates correctly', async ({ page }) => {
    await page.getByRole('link', { name: /create an account/i }).click();
    await expect(page).toHaveURL(new RegExp(ROUTES.createAccount));
  });

  test('unauthenticated access to portal routes redirects to sign-in', async ({ page }) => {
    await assertRedirectsToSignIn(page, ROUTES.overview);
    await assertRedirectsToSignIn(page, ROUTES.myDetails);
    await assertRedirectsToSignIn(page, ROUTES.payBills);
  });

  test('sign-out navigates to sign-out page', async ({ page }) => {
    await login(page, TEST_USER.email, TEST_USER.password);
    await logout(page);
    // Verify the sign-out page was reached (session destruction is server-side)
    await expect(page).toHaveURL(new RegExp(ROUTES.signOut));
    await expect(page.getByRole('heading', { name: /sign out success/i })).toBeVisible();
  });
});

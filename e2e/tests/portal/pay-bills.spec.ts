import { test, expect } from '@playwright/test';
import { ROUTES } from '../fixtures/test-data';

test.describe('Pay Bills', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(ROUTES.payBills);
  });

  test('pay bills page loads correctly', async ({ page }) => {
    await expect(page).toHaveURL(new RegExp(ROUTES.payBills));
    await expect(page).not.toHaveURL(new RegExp(ROUTES.signIn));
  });

  test('payment summary section is visible', async ({ page }) => {
    // Either a bill to pay or an empty/no-bills state should be present
    const summaryOrEmpty = page.locator('[class*="payment-summary"], [class*="pay-bill"], [class*="no-bill"], [class*="empty"]')
      .or(page.getByText(/no bill|nothing.*due|up to date|payment summary/i));
    await expect(summaryOrEmpty).toBeVisible({ timeout: 10_000 });
  });

  test('payment summary shows correct line items when a bill exists', async ({ page }) => {
    const hasBill = await page.locator('[class*="payment-summary"]').isVisible().catch(() => false);
    if (!hasBill) {
      test.skip(); // No bill to pay on this account
    }

    // Verify key line items are displayed
    await expect(page.getByText(/subtotal|amount/i)).toBeVisible();
    await expect(page.getByText(/tax|gst/i)).toBeVisible();
    await expect(page.getByText(/total/i)).toBeVisible();
  });

  test('pay button is present when a bill exists', async ({ page }) => {
    const hasBill = await page.locator('[class*="payment-summary"]').isVisible().catch(() => false);
    if (!hasBill) test.skip();

    const payBtn = page.getByRole('button', { name: /pay|proceed|checkout/i });
    await expect(payBtn).toBeVisible();
  });

  test('processing fee information is displayed', async ({ page }) => {
    const hasBill = await page.locator('[class*="payment-summary"]').isVisible().catch(() => false);
    if (!hasBill) test.skip();

    await expect(page.getByText(/processing fee|transaction fee/i)).toBeVisible();
  });
});

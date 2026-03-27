import { test, expect } from '@playwright/test';
import { ROUTES, STRIPE_CARDS } from '../fixtures/test-data';

/**
 * Payment method tests use Stripe test card numbers.
 * These are safe to use on staging — no real charges occur.
 * See: https://stripe.com/docs/testing#cards
 */

// Add card button: ins-button[id="add-credit-card"] — appears in both the button holder and #no-card empty state
const ADD_CARD_BTN = 'ins-button[id="add-credit-card"]';
// Stripe modal: ins-modal[id="stripe-modal"] — opened programmatically when add card is clicked
const STRIPE_MODAL = 'ins-modal[id="stripe-modal"]';
// Submit button inside the stripe modal
const STRIPE_SUBMIT = 'ins-button.card-form-submit';

test.describe('Payment Methods', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(ROUTES.paymentMethods);
  });

  test('payment methods page loads correctly', async ({ page }) => {
    await expect(page).toHaveURL(new RegExp(ROUTES.paymentMethods));
    await expect(page).not.toHaveURL(new RegExp(ROUTES.signIn));
  });

  test('add card button or empty state is visible', async ({ page }) => {
    // Either a card list with add button OR the #no-card empty state should be visible
    const addCardBtn = page.locator(ADD_CARD_BTN).first();
    const noCard = page.locator('#no-card');
    await expect(addCardBtn.or(noCard)).toBeVisible();
  });

  test('add a valid Stripe test card', async ({ page }) => {
    const addBtn = page.locator(ADD_CARD_BTN).first();
    // Skip if Stripe is not configured on this instance (button won't render)
    if (!await addBtn.isVisible().catch(() => false)) { test.skip(); return; }
    await expect(addBtn).toBeVisible();
    await addBtn.click();

    // Stripe modal opens
    const modal = page.locator(STRIPE_MODAL);
    await expect(modal).toBeVisible({ timeout: 5_000 });

    // Stripe mounts an iframe inside #card-element
    const stripeFrame = page.frameLocator('#card-element iframe').first();

    // Wait for Stripe iframe to load
    await stripeFrame.locator('[placeholder*="Card number"], [name="cardnumber"]')
      .fill(STRIPE_CARDS.visa.number);
    await stripeFrame.locator('[placeholder*="MM / YY"], [name="exp-date"]')
      .fill(STRIPE_CARDS.visa.expiry);
    await stripeFrame.locator('[placeholder*="CVC"], [name="cvc"]')
      .fill(STRIPE_CARDS.visa.cvc);

    const postcodeField = stripeFrame.locator('[placeholder*="ZIP"], [placeholder*="Postcode"], [name="postal"]');
    if (await postcodeField.isVisible()) {
      await postcodeField.fill(STRIPE_CARDS.visa.postcode);
    }

    // Click the Add button (desktop: id="add-cc-button", mobile: class="card-form-submit")
    await page.locator(`${STRIPE_SUBMIT}, ins-button[id="add-cc-button"]`).first().click();

    // After successful add, modal closes and card appears in the list
    await expect(
      page.locator('#card-options-list ins-credit-card')
        .or(page.locator('.notyf__toast--success'))
        .or(page.getByText(/card added|visa.*4242/i))
    ).toBeVisible({ timeout: 20_000 });
  });

  test('declined card shows error message', async ({ page }) => {
    const addBtn = page.locator(ADD_CARD_BTN).first();
    if (!await addBtn.isVisible()) test.skip();
    await addBtn.click();

    const modal = page.locator(STRIPE_MODAL);
    await expect(modal).toBeVisible({ timeout: 5_000 });

    const stripeFrame = page.frameLocator('#card-element iframe').first();
    await stripeFrame.locator('[placeholder*="Card number"], [name="cardnumber"]')
      .fill(STRIPE_CARDS.visaDeclined.number);
    await stripeFrame.locator('[placeholder*="MM / YY"], [name="exp-date"]')
      .fill(STRIPE_CARDS.visaDeclined.expiry);
    await stripeFrame.locator('[placeholder*="CVC"], [name="cvc"]')
      .fill(STRIPE_CARDS.visaDeclined.cvc);

    await page.locator(`${STRIPE_SUBMIT}, ins-button[id="add-cc-button"]`).first().click();

    // Error appears in #card-errors or as a notyf error
    await expect(
      page.locator('#card-errors:not(:empty)')
        .or(page.locator('.notyf__toast--error'))
        .or(page.getByText(/declined|card was declined/i))
    ).toBeVisible({ timeout: 15_000 });
  });

  test('existing saved cards are displayed or empty state shown', async ({ page }) => {
    // Either a card list with ins-credit-card items or the #no-card empty state is visible
    const cardList = page.locator('#card-options-list');
    const emptyState = page.locator('#no-card:not(.hide)');
    await expect(cardList.or(emptyState)).toBeVisible();
  });
});

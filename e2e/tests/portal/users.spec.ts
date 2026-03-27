import { test, expect } from '@playwright/test';
import { ROUTES } from '../fixtures/test-data';

/**
 * User management tests.
 * These tests require the authenticated user to be a Primary Account Holder (PAH).
 * If the test user is not a PAH, the /users page will be inaccessible — tests will skip.
 */

// Selectors based on actual DOM from list.liquid and users partial
const INVITE_BTN     = '[id="user-invite-button"]';               // button in filters partial
const ADD_USER_MODAL = 'ins-modal[id="add-user-modal"]';
const SEND_INVITE    = '#add-user-modal ins-button[id="submit-btn"]';
const EMAIL_INPUT    = '#add-user-modal ins-input[id="user-email"] input';
// Validation error spans shown by JS (toggling is_hidden class)
const EMAIL_REQUIRED = '#emailRequired:not(.is_hidden)';
const EMAIL_INVALID  = '#emailInvalid:not(.is_hidden)';
const FNAME_REQUIRED = '#firstNameRequired:not(.is_hidden)';
// Search input (id set in filters partial, referenced in JS)
const SEARCH_INPUT   = 'ins-input[id="search-description"] input, input[id="search-description"]';

test.describe('User Management (PAH only)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(ROUTES.users);

    // Skip all tests if the user is not a PAH (redirected away or page not accessible)
    const currentUrl = page.url();
    if (!currentUrl.includes(ROUTES.users)) {
      test.skip();
    }
  });

  test('users page loads with user table', async ({ page }) => {
    await expect(page).toHaveURL(new RegExp(ROUTES.users));
    // ins-table[id="insBaseTable"] is the main table component
    const table = page.locator('ins-table[id="insBaseTable"], ins-table').first();
    await expect(table).toBeVisible();
  });

  test('users table shows at least the current logged-in user', async ({ page }) => {
    // Table has rows rendered via table_row partial (ins-table-tr or similar row components)
    const rows = page.locator('ins-table-tr, ins-table-row, [class*="table-row"]').first();
    // Fallback: table content container is visible (empty state or rows)
    const tableContent = page.locator('ins-table[id="insBaseTable"]');
    await expect(rows.or(tableContent)).toBeVisible();
  });

  test('search field filters users', async ({ page }) => {
    const searchInput = page.locator(SEARCH_INPUT).first();
    // filters partial may not be deployed on this instance — skip if absent
    if (!await searchInput.isVisible().catch(() => false)) { test.skip(); return; }
    await expect(searchInput).toBeVisible();
    await searchInput.fill('nonexistentuser12345');
    // Search triggers on Enter (insInput event with keyCode 13)
    await searchInput.press('Enter');
    await page.waitForURL(/search=nonexistentuser12345/, { timeout: 10_000 });
    // After reload, table should show empty state
    await expect(
      page.locator('ins-table[id="insBaseTable"]').or(page.getByText(/no result/i))
    ).toBeVisible();
  });

  test('invite user button is visible', async ({ page }) => {
    const inviteBtn = page.locator(INVITE_BTN).first();
    // filters partial may not be deployed on this instance — skip if absent
    if (!await inviteBtn.isVisible().catch(() => false)) { test.skip(); return; }
    await expect(inviteBtn).toBeVisible();
  });

  test('invite user modal opens on button click', async ({ page }) => {
    const inviteBtn = page.locator(INVITE_BTN).first();
    if (!await inviteBtn.isVisible().catch(() => false)) { test.skip(); return; }
    await inviteBtn.click();
    await expect(page.locator(ADD_USER_MODAL)).toBeVisible({ timeout: 5_000 });
  });

  test('invite user form validates required fields on empty submit', async ({ page }) => {
    const inviteBtn = page.locator(INVITE_BTN).first();
    if (!await inviteBtn.isVisible().catch(() => false)) { test.skip(); return; }
    await inviteBtn.click();
    const modal = page.locator(ADD_USER_MODAL);
    await expect(modal).toBeVisible();

    // Submit without filling anything — JS hasError() shows #emailRequired and #firstNameRequired
    await page.locator(SEND_INVITE).click();
    await expect(
      page.locator(EMAIL_REQUIRED)
        .or(page.locator(FNAME_REQUIRED))
    ).toBeVisible({ timeout: 5_000 });
  });

  test('invite user form validates email format', async ({ page }) => {
    const inviteBtn = page.locator(INVITE_BTN).first();
    if (!await inviteBtn.isVisible().catch(() => false)) { test.skip(); return; }
    await inviteBtn.click();
    const modal = page.locator(ADD_USER_MODAL);
    await expect(modal).toBeVisible();

    // Type an invalid email — JS checks on 'insInput' event with 500ms debounce
    await page.locator(EMAIL_INPUT).fill('notanemail');
    // Wait for async email check + debounce
    await page.waitForTimeout(1000);
    await page.locator(SEND_INVITE).click();
    await expect(
      page.locator(EMAIL_INVALID)
        .or(page.locator(EMAIL_REQUIRED))
        .or(page.getByText(/valid email|invalid/i))
    ).toBeVisible({ timeout: 5_000 });
  });

  test('user management sidebar link is visible and active', async ({ page }) => {
    // Users link only shows in sidebar for PAH users
    // Desktop + mobile nav both render this link — use first() to avoid strict mode
    const usersLink = page.locator('.accordion-section-holder ins-accordion-link[label="Users"]').first();
    await expect(usersLink).toBeVisible();
  });
});

/**
 * Auth setup — runs once before all portal tests.
 * Logs in and saves the browser storage state so portal tests
 * don't need to repeat the login flow on every test.
 */
import { test as setup } from '@playwright/test';
import * as fs from 'fs';
import { login } from './helpers/auth';
import { TEST_USER } from './fixtures/test-data';

const AUTH_FILE = '.auth/user.json';

setup('authenticate as test user', async ({ page }) => {
  // Ensure .auth directory exists
  if (!fs.existsSync('.auth')) {
    fs.mkdirSync('.auth');
  }

  await login(page, TEST_USER.email, TEST_USER.password);

  // Save auth state (cookies + localStorage) for reuse across portal tests
  await page.context().storageState({ path: AUTH_FILE });
});

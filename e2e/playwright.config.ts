import { defineConfig, devices } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

// Load .env file — Playwright v1.44 does not auto-load .env
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf-8').split('\n')) {
    const m = line.match(/^([^#=][^=]*)=(.*)$/);
    if (m) process.env[m[1].trim()] ??= m[2].trim();
  }
}

export default defineConfig({
  testDir: './tests',
  fullyParallel: false, // portal tests depend on shared state; keep sequential
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : 2,
  reporter: [['html', { outputFolder: 'playwright-report' }], ['list']],

  use: {
    baseURL: process.env.E2E_BASE_URL || 'https://insites-client-portal-v130.staging.oregon.platform-os.com',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
  },

  projects: [
    // Auth setup — runs once before all portal tests to store logged-in state
    {
      name: 'setup',
      testMatch: '**/auth.setup.ts',
    },

    // Website (public pages — no auth required)
    {
      name: 'website',
      testMatch: 'tests/website/**/*.spec.ts',
      use: { ...devices['Desktop Chrome'] },
    },

    // Auth flows (sign-in, registration, password reset — no stored auth)
    {
      name: 'auth',
      testMatch: 'tests/auth/**/*.spec.ts',
      use: { ...devices['Desktop Chrome'] },
    },

    // Portal (authenticated — depends on setup project)
    {
      name: 'portal',
      testMatch: 'tests/portal/**/*.spec.ts',
      dependencies: ['setup'],
      use: {
        ...devices['Desktop Chrome'],
        storageState: '.auth/user.json',
      },
    },

    // Mobile — run critical flows on mobile viewport
    {
      name: 'mobile',
      testMatch: ['tests/portal/overview.spec.ts', 'tests/website/contact.spec.ts'],
      dependencies: ['setup'],
      use: {
        ...devices['Pixel 5'],
        storageState: '.auth/user.json',
      },
    },
  ],
});

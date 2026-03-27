# E2E Tests — Insites Client Portal

Playwright-based end-to-end tests for all critical user flows.

## Setup

```bash
cd e2e
npm install
npm run setup        # install Playwright browsers
```

## Environment Variables

Create a `.env` file in the project root with:

```
E2E_BASE_URL=https://insites-client-portal-v130.staging.oregon.platform-os.com
E2E_USER_EMAIL=testuser@example.com
E2E_USER_PASSWORD=YourTestPassword
E2E_PAH_EMAIL=pah@example.com
E2E_PAH_PASSWORD=YourPAHPassword
```

The test user must exist on the target staging instance.

## Running Tests

```bash
# All tests
npm test

# With browser visible
npm run test:headed

# Interactive UI mode
npm run test:ui

# By group
npm run test:auth
npm run test:portal
npm run test:website

# View last report
npm run test:report
```

## Test Structure

```
e2e/
├── playwright.config.ts       # Playwright config, projects, base URL
├── tests/
│   ├── auth.setup.ts          # Runs once — logs in, saves session to .auth/user.json
│   ├── fixtures/
│   │   └── test-data.ts       # Routes, credentials, Stripe test cards
│   ├── helpers/
│   │   └── auth.ts            # login(), logout(), assertRedirectsToSignIn()
│   ├── auth/
│   │   ├── sign-in.spec.ts    # Login, logout, invalid credentials, redirect guards
│   │   ├── registration.spec.ts  # Multi-step registration flow + validation
│   │   └── password-reset.spec.ts  # Forgot password, reset page token guard
│   ├── portal/                # All require auth (uses .auth/user.json)
│   │   ├── overview.spec.ts   # Dashboard, sidebar, sign-out
│   │   ├── my-details.spec.ts # Profile update, company details, validation
│   │   ├── users.spec.ts      # User list, search, invite modal (PAH only)
│   │   ├── feedback.spec.ts   # Feedback form submission
│   │   ├── payment-methods.spec.ts  # Add card (Stripe), declined card
│   │   └── pay-bills.spec.ts  # Payment summary, line items, pay button
│   └── website/
│       ├── contact.spec.ts    # Contact form, validation, submission
│       └── navigation.spec.ts # Public pages, 404, header, footer, mobile menu
```

## Auth Strategy

Portal tests use Playwright's `storageState` to reuse a logged-in session:

1. `auth.setup.ts` runs first — logs in and saves session to `.auth/user.json`
2. All `portal/` tests load `.auth/user.json` as their browser state
3. Auth tests (`auth/`) always start without stored state (fresh browser)

This means portal tests never need to log in individually, making the suite fast.

## Stripe Test Cards

Payment tests use Stripe test card numbers (safe on staging — no charges):

| Card | Number | Use |
|------|--------|-----|
| Visa (success) | `4242 4242 4242 4242` | Add card, pay bill |
| Visa (declined) | `4000 0000 0000 0002` | Test declined state |
| Insufficient funds | `4000 0000 0000 9995` | Test failure state |

Expiry: any future date. CVC: any 3 digits.

## CI Integration

Set `CI=true` in your CI environment. This enables:
- 2 retries on failure
- Single worker (sequential execution)
- Trace on first retry for debugging

/**
 * Test data constants.
 * Credentials are read from environment variables — never hardcode real passwords here.
 * Set these in your .env file or CI secrets:
 *
 *   E2E_BASE_URL          — staging URL (default: insites-client-portal-v130.staging...)
 *   E2E_USER_EMAIL        — test user email (must exist on the staging instance)
 *   E2E_USER_PASSWORD     — test user password
 *   E2E_PAH_EMAIL         — primary account holder email (for user management tests)
 *   E2E_PAH_PASSWORD      — primary account holder password
 */

export const TEST_USER = {
  email: process.env.E2E_USER_EMAIL || 'testuser@example.com',
  password: process.env.E2E_USER_PASSWORD || 'TestPassword123!',
  firstName: 'Test',
  lastName: 'User',
};

export const PAH_USER = {
  email: process.env.E2E_PAH_EMAIL || 'pah@example.com',
  password: process.env.E2E_PAH_PASSWORD || 'TestPassword123!',
};

export const INVALID_CREDENTIALS = {
  email: 'notauser@example.com',
  password: 'WrongPassword999!',
};

export const ROUTES = {
  // Public
  home: '/',
  about: '/about',
  features: '/features',
  contact: '/contact-us',
  faqs: '/faqs',
  // Auth
  signIn: '/sign-in',
  signOut: '/sign-out',
  createAccount: '/create-account',
  forgotPassword: '/forgot-password',
  passwordReset: '/password-reset',
  // Portal
  overview: '/overview',
  myDetails: '/my-details',
  myCompanyDetails: '/my-company-details',
  users: '/users',
  paymentMethods: '/payment-methods',
  payBills: '/pay-bills',
  feedback: '/feedback',
};

/** Stripe test card numbers — safe to use on staging */
export const STRIPE_CARDS = {
  visa: {
    number: '4242424242424242',
    expiry: '12/26',
    cvc: '123',
    postcode: '10001',
  },
  visaDeclined: {
    number: '4000000000000002',
    expiry: '12/26',
    cvc: '123',
    postcode: '10001',
  },
  insufficientFunds: {
    number: '4000000000009995',
    expiry: '12/26',
    cvc: '123',
    postcode: '10001',
  },
};

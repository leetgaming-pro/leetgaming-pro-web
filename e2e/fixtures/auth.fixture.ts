/**
 * Auth Fixture for E2E Tests
 * Provides authenticated session setup for tests that require login
 * Following DRY principle - reusable auth setup across tests
 */

import { test as base, Page } from '@playwright/test';

// User credentials for testing
export const TEST_USER = {
  email: 'test@leetgaming.gg',
  password: 'testPassword123!',
};

// Auth storage path
const AUTH_STORAGE = 'e2e/.auth/user.json';

/**
 * Performs login action on the page
 * Reusable function to avoid duplication
 */
async function performLogin(page: Page): Promise<void> {
  await page.goto('/login');

  // Wait for login form
  await page.waitForSelector('form');

  // Fill credentials
  await page.fill('input[type="email"]', TEST_USER.email);
  await page.fill('input[type="password"]', TEST_USER.password);

  // Submit form
  await page.click('button[type="submit"]');

  // Wait for redirect after login
  await page.waitForURL('**/dashboard/**', { timeout: 10000 });
}

/**
 * Extended test with authenticated user
 */
export const authenticatedTest = base.extend<{ authenticatedPage: Page }>({
  authenticatedPage: async ({ page }, use) => {
    // Setup: Login
    await performLogin(page);

    // Use the authenticated page
    await use(page);

    // Teardown: Optional logout
    // await page.goto('/api/auth/signout');
  },
});

/**
 * Test fixture with mock API responses
 * Useful for testing payment flows without real API calls
 */
export const mockedApiTest = base.extend<{ mockedPage: Page }>({
  mockedPage: async ({ page }, use) => {
    // Setup mock API routes
    await page.route('**/api/payments/**', async (route) => {
      const method = route.request().method();

      if (method === 'POST') {
        // Mock create payment intent
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: {
              payment_id: 'pay_mock_' + Date.now(),
              client_secret: 'cs_mock_secret',
              status: 'processing',
            },
          }),
        });
      } else if (method === 'GET') {
        // Mock get payments
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: [
              {
                id: 'pay_mock_1',
                amount: 1000,
                currency: 'usd',
                status: 'succeeded',
                created_at: new Date().toISOString(),
              },
            ],
          }),
        });
      } else {
        await route.continue();
      }
    });

    await use(page);
  },
});

export { base as test };

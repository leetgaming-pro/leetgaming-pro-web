/**
 * Real Authentication Fixtures for E2E Tests
 *
 * Uses actual backend auth flow (POST /auth/login) via the signin page.
 * Requires seed data in email_users collection with bcrypt-hashed passwords.
 *
 * Users:
 *   - PRO_USER: savelis.pedro@gmail.com (Elite subscription, wallet with balance)
 *   - FREE_USER: e2e.test@leetgaming.gg (Free tier, empty wallet)
 */

import { test as base, Page, expect } from '@playwright/test';

export const PRO_USER = {
  email: 'savelis.pedro@gmail.com',
  password: 'LeetGaming2026!',
  displayName: 'Pedro Savelis',
  userId: '55555555-5555-5555-5555-555555555555',
} as const;

export const FREE_USER = {
  email: 'e2e.test@leetgaming.gg',
  password: 'TestPassword123!',
  displayName: 'E2E Test',
  userId: '11111111-1111-1111-1111-111111111111',
} as const;

interface UserCredentials {
  email: string;
  password: string;
  displayName: string;
  userId: string;
}

/**
 * Perform real login via the signin page.
 * Fills the email/password form and submits to trigger NextAuth → backend auth flow.
 * Waits for session to be established.
 */
async function performRealLogin(page: Page, user: UserCredentials): Promise<void> {
  await page.goto('/signin', { waitUntil: 'domcontentloaded' });

  // Wait for the Loading... state to resolve
  const loadingText = page.getByText('Loading...');
  const isLoading = await loadingText.isVisible({ timeout: 3000 }).catch(() => false);
  if (isLoading) {
    await loadingText.waitFor({ state: 'hidden', timeout: 20000 }).catch(() => {});
  }

  // Wait for the login form to appear
  const emailInput = page.locator('input[name="email"]');
  await emailInput.waitFor({ state: 'visible', timeout: 15000 });

  // Fill credentials
  await emailInput.fill(user.email);
  await page.locator('input[name="password"]').fill(user.password);

  // Submit form (button text: "ENTER THE ARENA")
  const submitButton = page.getByRole('button', { name: /enter the arena|sign in/i });
  await submitButton.click();

  // Wait for redirect away from signin page (goes to /match-making by default)
  await page.waitForURL((url) => !url.pathname.includes('/signin'), { timeout: 30000 });

  // Wait for session to be fully established
  // Poll the session endpoint until it returns a valid session with user data
  let retries = 0;
  const maxRetries = 10;
  while (retries < maxRetries) {
    const sessionResponse = await page.evaluate(async () => {
      const res = await fetch('/api/auth/session');
      return res.json();
    });

    if (sessionResponse?.user?.email) {
      break;
    }

    await page.waitForTimeout(1000);
    retries++;
  }
}

/**
 * Wait for RID token to be synced to cookies by the AuthSync component.
 * The RID token is set as an httpOnly cookie after NextAuth session is established.
 */
async function waitForRIDSync(page: Page, timeoutMs = 15000): Promise<boolean> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const cookies = await page.context().cookies();
    const ridMetadata = cookies.find((c) => c.name === 'rid_metadata');
    if (ridMetadata) {
      return true;
    }
    await page.waitForTimeout(500);
  }
  return false;
}

/**
 * Fixture: Pro user with Elite subscription and wallet balance.
 * Provides an authenticated page for savelis.pedro@gmail.com.
 */
export const proUserTest = base.extend<{ proPage: Page }>({
  proPage: async ({ page }, use) => {
    await performRealLogin(page, PRO_USER);
    await waitForRIDSync(page, 10000);
    await use(page);
  },
});

/**
 * Fixture: Free tier user with basic access.
 * Provides an authenticated page for e2e.test@leetgaming.gg.
 */
export const freeUserTest = base.extend<{ freePage: Page }>({
  freePage: async ({ page }, use) => {
    await performRealLogin(page, FREE_USER);
    await waitForRIDSync(page, 10000);
    await use(page);
  },
});

export { performRealLogin, waitForRIDSync };

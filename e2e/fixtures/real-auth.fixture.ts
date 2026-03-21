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

export const MATCHMAKING_TEST_USERS = [
  PRO_USER,
  FREE_USER,
  {
    email: 'mm.player1@leetgaming.gg',
    password: 'LeetGaming2026!',
    displayName: 'Matchmaking Player 1',
    userId: '66666666-6666-6666-6666-666666666601',
  },
  {
    email: 'mm.player2@leetgaming.gg',
    password: 'LeetGaming2026!',
    displayName: 'Matchmaking Player 2',
    userId: '66666666-6666-6666-6666-666666666602',
  },
  {
    email: 'mm.player3@leetgaming.gg',
    password: 'LeetGaming2026!',
    displayName: 'Matchmaking Player 3',
    userId: '66666666-6666-6666-6666-666666666603',
  },
  {
    email: 'mm.player4@leetgaming.gg',
    password: 'LeetGaming2026!',
    displayName: 'Matchmaking Player 4',
    userId: '66666666-6666-6666-6666-666666666604',
  },
  {
    email: 'mm.player5@leetgaming.gg',
    password: 'LeetGaming2026!',
    displayName: 'Matchmaking Player 5',
    userId: '66666666-6666-6666-6666-666666666605',
  },
  {
    email: 'mm.player6@leetgaming.gg',
    password: 'LeetGaming2026!',
    displayName: 'Matchmaking Player 6',
    userId: '66666666-6666-6666-6666-666666666606',
  },
  {
    email: 'mm.player7@leetgaming.gg',
    password: 'LeetGaming2026!',
    displayName: 'Matchmaking Player 7',
    userId: '66666666-6666-6666-6666-666666666607',
  },
  {
    email: 'mm.player8@leetgaming.gg',
    password: 'LeetGaming2026!',
    displayName: 'Matchmaking Player 8',
    userId: '66666666-6666-6666-6666-666666666608',
  },
] as const;

interface UserCredentials {
  email: string;
  password: string;
  displayName: string;
  userId: string;
}

export function getMatchmakingUser(index: number): UserCredentials {
  const user = MATCHMAKING_TEST_USERS[index];

  if (!user) {
    throw new Error(`Unknown matchmaking test user index: ${index}`);
  }

  return user;
}

/**
 * Perform real login via the signin page.
 * Uses the NextAuth credentials callback directly to avoid UI hydration flakiness.
 * Waits for the shared browser-context session cookie to be established.
 */
async function performRealLogin(page: Page, user: UserCredentials): Promise<void> {
  const csrfResponse = await page.request.get('/api/auth/csrf');
  expect(csrfResponse.ok(), `Failed to fetch CSRF token for ${user.email}`).toBeTruthy();

  const csrfBody = (await csrfResponse.json()) as { csrfToken?: string };
  if (!csrfBody.csrfToken) {
    throw new Error(`Real login failed for ${user.email}: csrf token missing`);
  }

  const callbackBody = new URLSearchParams({
    csrfToken: csrfBody.csrfToken,
    email: user.email,
    password: user.password,
    action: 'login',
    callbackUrl: '/match-making',
    json: 'true',
  });

  const callbackResponse = await page.request.post('/api/auth/callback/email-password', {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    data: callbackBody.toString(),
  });

  const callbackText = await callbackResponse.text();
  if (!callbackResponse.ok()) {
    throw new Error(`Real login failed for ${user.email}: ${callbackText || callbackResponse.status()}`);
  }

  let sessionEstablished = false;
  for (let retries = 0; retries < 15; retries += 1) {
    const sessionResponse = await page.request.get('/api/auth/session');
    if (sessionResponse.ok()) {
      const sessionBody = await sessionResponse.json();
      if (sessionBody?.user?.email === user.email) {
        sessionEstablished = true;
        break;
      }
    }

    await page.waitForTimeout(500);
  }

  if (!sessionEstablished) {
    throw new Error(`Real login failed for ${user.email}: session was not established`);
  }

  await page.goto('/match-making', { waitUntil: 'domcontentloaded' });
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

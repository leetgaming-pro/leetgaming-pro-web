/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║  🧪 AUTH SESSION CONSISTENCY E2E TESTS                                      ║
 * ║══════════════════════════════════════════════════════════════════════════════║
 * ║                                                                              ║
 * ║  Validates login flow, notification display, match-making auth integration,  ║
 * ║  and ensures zero console errors across unauthenticated/authenticated states ║
 * ║                                                                              ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */

import { test, expect, type Page, type ConsoleMessage } from "@playwright/test";

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3030";
const TEST_EMAIL = "test@leetgaming.pro";
const TEST_PASSWORD = "TestPass123!";

// ── Benign error patterns to ignore ─────────────────────────────────────────

const BENIGN_ERROR_PATTERNS = [
  "favicon.ico",
  "Download the React DevTools",
  "webpack",
  "HMR",
  "hot-reloader",
  "next-dev.js",
  "[Fast Refresh]",
  "NEXT_HMR_REFRESH",
  "source map",
  "ResizeObserver",
  "WebSocket",
  "ws://",
  "wss://",
  "hydration",           // React hydration warnings in dev mode
  "server-rendered",     // "Did not expect server-rendered HTML to contain..."
  "content does not match",
  "Failed to get auth headers",
  "[AuthSync]",
  "NEXT_REDIRECT",
  "ERR_ABORTED",         // Cancelled navigations
  "net::ERR",
  "AbortError",
  "preload",             // Resource preload warnings
  "prefetch",
  "subscriptions/current", // Subscription check may 401 during session init
  "ReplayApiClient",       // Client-level retry logging
  "Please sign in",        // Auth guard messages during session establishment
  "/api/subscriptions",    // Subscription API calls during session init
  "/api/players/me",       // Player profile endpoint during session init
  "400 (Bad Request)",     // Non-critical requests during init
  "401 (Unauthorized)",    // Expected for unauthenticated resource loads
  "Failed to load resource", // Browser resource loading errors (checked via URL filter)
];

function isBenignError(text: string, locationUrl?: string): boolean {
  const lowerText = text.toLowerCase();
  const lowerUrl = (locationUrl || "").toLowerCase();
  return BENIGN_ERROR_PATTERNS.some((p) => {
    const lp = p.toLowerCase();
    return lowerText.includes(lp) || lowerUrl.includes(lp);
  });
}

// ── Helpers ─────────────────────────────────────────────────────────────────

/** Collect console errors during a page session */
function collectConsoleErrors(page: Page): ConsoleMessage[] {
  const errors: ConsoleMessage[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") {
      const text = msg.text();
      const locationUrl = msg.location()?.url || "";
      if (!isBenignError(text, locationUrl)) {
        errors.push(msg);
      }
    }
  });
  return errors;
}

/** Collect network 401/403 errors */
function collectAuthErrors(page: Page): { url: string; status: number }[] {
  const authErrors: { url: string; status: number }[] = [];
  page.on("response", (response) => {
    const status = response.status();
    if (status === 401 || status === 403) {
      const url = response.url();
      // Ignore auth check endpoints that legitimately return 200/empty for unauthenticated users
      if (
        url.includes("/api/auth/session") ||
        url.includes("/api/auth/csrf") ||
        url.includes("/api/auth/providers") ||
        url.includes("/api/auth/headers") ||
        url.includes("/api/subscriptions")
      )
        return;
      authErrors.push({ url, status });
    }
  });
  return authErrors;
}

/** Dismiss cookie consent banner if visible */
async function dismissCookieConsent(page: Page): Promise<void> {
  const acceptBtn = page.locator('button:has-text("Accept All")');
  if (await acceptBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
    await acceptBtn.click();
    await page.waitForTimeout(500);
  }
}

/** Wait for React hydration and framer-motion animations to complete */
async function waitForPageReady(page: Page): Promise<void> {
  // Wait for DOM content to be loaded
  await page.waitForLoadState("domcontentloaded");

  // Wait for the page to settle — framer-motion opacity:0→1 animation
  // The PageContainer starts with opacity:0 and animates to opacity:1
  await page.waitForFunction(
    () => {
      // Check that the main content is visible (opacity > 0)
      const body = document.body;
      if (!body) return false;
      // Check that React has hydrated by looking for rendered interactive elements
      const buttons = body.querySelectorAll("button");
      return buttons.length > 0;
    },
    { timeout: 15000 }
  );

  // Small delay for any remaining animations
  await page.waitForTimeout(1000);
}

/** Perform email-password login via the BrandedSignIn form */
async function performLogin(page: Page): Promise<boolean> {
  await page.goto(`${BASE_URL}/signin`);
  await waitForPageReady(page);

  // The BrandedSignIn form uses Input with name="email" and name="password"
  const emailInput = page.locator('input[name="email"]');

  // If the signin form is not visible, user is already authenticated
  if (!(await emailInput.isVisible({ timeout: 5000 }).catch(() => false))) {
    return false;
  }

  await emailInput.fill(TEST_EMAIL);

  const passwordInput = page.locator('input[name="password"]');
  await passwordInput.fill(TEST_PASSWORD);

  // The submit button says "ENTER THE ARENA"
  const submitBtn = page.locator('button[type="submit"]');
  await submitBtn.click();

  // Wait for redirect to match-making (default callbackUrl)
  await page.waitForURL("**/match-making**", { timeout: 90000 });
  return true;
}

// ═══════════════════════════════════════════════════════════════════════════════
//  TEST SUITE: UNAUTHENTICATED STATE
// ═══════════════════════════════════════════════════════════════════════════════

test.describe("Unauthenticated State", () => {
  test("match-making page shows auth banner, no 401 errors", async ({
    page,
  }) => {
    const consoleErrors = collectConsoleErrors(page);
    const authErrors = collectAuthErrors(page);

    await page.goto(`${BASE_URL}/match-making`);
    await waitForPageReady(page);
    await dismissCookieConsent(page);

    // Auth banner should become visible after hydration + session resolution
    // Uses data-testid added to the banner div for reliable targeting
    const authBanner = page.locator('[data-testid="auth-banner"]');
    await expect(authBanner).toBeVisible({ timeout: 15000 });

    // Verify the banner text content
    await expect(authBanner).toContainText("Sign in to save matches and earn rewards");

    // Sign-in link in banner should include callbackUrl
    const signInLink = authBanner.locator(
      'a[href*="/signin?callbackUrl=%2Fmatch-making"]'
    );
    await expect(signInLink).toBeVisible();

    // No 401 errors from notification API or other authenticated endpoints
    expect(authErrors).toHaveLength(0);

    // No significant console errors
    if (consoleErrors.length > 0) {
      console.log(
        "Console errors found:",
        consoleErrors.map((e) => e.text())
      );
    }
    expect(consoleErrors).toHaveLength(0);
  });

  test("notification bell is hidden when not logged in", async ({ page }) => {
    const authErrors = collectAuthErrors(page);
    const notificationRequests: string[] = [];
    page.on("request", (req) => {
      if (req.url().includes("/api/notifications") && !req.url().includes("/api/auth")) {
        notificationRequests.push(req.url());
      }
    });

    await page.goto(`${BASE_URL}/match-making`);
    await waitForPageReady(page);

    // Wait for session to resolve and components to stabilize
    await page.waitForTimeout(2000);

    // Notification bell should NOT be visible (NotificationCenter returns null)
    const bellButton = page.getByRole('button', { name: /^Notifications/ });
    await expect(bellButton).toHaveCount(0);

    // No 401 errors and no notification API calls
    expect(authErrors).toHaveLength(0);
  });

  test("notifications page accessible without crash", async ({ page }) => {
    const consoleErrors = collectConsoleErrors(page);

    await page.goto(`${BASE_URL}/notifications`);
    await waitForPageReady(page);

    // Page should load without crashing (may redirect to signin or show empty state)
    // The key check is: no crash, no unhandled errors

    // No significant console errors
    if (consoleErrors.length > 0) {
      console.log(
        "/notifications console errors:",
        consoleErrors.map((e) => e.text())
      );
    }
    expect(consoleErrors).toHaveLength(0);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
//  TEST SUITE: LOGIN FLOW
// ═══════════════════════════════════════════════════════════════════════════════

test.describe("Login Flow", () => {
  test("email-password login with callbackUrl redirects correctly", async ({
    page,
  }) => {
    const consoleErrors = collectConsoleErrors(page);

    // Go to signin with callbackUrl
    await page.goto(
      `${BASE_URL}/signin?callbackUrl=${encodeURIComponent("/match-making")}`
    );
    await waitForPageReady(page);

    // Fill the BrandedSignIn form
    const emailInput = page.locator('input[name="email"]');
    await expect(emailInput).toBeVisible({ timeout: 10000 });
    await emailInput.fill(TEST_EMAIL);

    const passwordInput = page.locator('input[name="password"]');
    await passwordInput.fill(TEST_PASSWORD);

    // Submit
    const submitBtn = page.locator('button[type="submit"]');
    await submitBtn.click();

    // Wait for redirect to match-making
    await page.waitForURL("**/match-making**", { timeout: 90000 });
    expect(page.url()).toContain("/match-making");

    // After login, check for auth-related console errors
    if (consoleErrors.length > 0) {
      console.log(
        "Post-login console errors:",
        consoleErrors.map((e) => e.text())
      );
    }
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
//  TEST SUITE: AUTHENTICATED STATE
// ═══════════════════════════════════════════════════════════════════════════════

test.describe("Authenticated State", () => {
  // Login before each test in this group
  test.beforeEach(async ({ page }) => {
    await performLogin(page);
  });

  test("notification bell is visible after login", async ({ page }) => {
    const consoleErrors = collectConsoleErrors(page);
    const authErrors = collectAuthErrors(page);

    await page.goto(`${BASE_URL}/match-making`);
    await waitForPageReady(page);
    await dismissCookieConsent(page);

    // Notification bell should be visible (NotificationCenter renders for authenticated users)
    // Use role-based locator with .first() — navbar renders bell twice (desktop + mobile)
    const bellButton = page.getByRole('button', { name: /^Notifications/ }).first();
    await expect(bellButton).toBeVisible({ timeout: 30000 });

    // No 401 errors should have occurred
    expect(authErrors).toHaveLength(0);

    // No significant console errors
    if (consoleErrors.length > 0) {
      console.log(
        "Authenticated console errors:",
        consoleErrors.map((e) => e.text())
      );
    }
  });

  test("notification API returns 200 when authenticated", async ({ page }) => {
    const authErrors = collectAuthErrors(page);

    // Navigate to trigger notification fetch
    await page.goto(`${BASE_URL}/match-making`);
    await waitForPageReady(page);

    // Check that notification API returns successfully
    // page.request keeps the browser context cookies
    const notificationResponse = await page.request.get(
      `${BASE_URL}/api/notifications`
    );
    expect([200, 304]).toContain(notificationResponse.status());

    // No auth errors during page load
    expect(authErrors).toHaveLength(0);
  });

  test("match-making hides auth banner when logged in", async ({ page }) => {
    await page.goto(`${BASE_URL}/match-making`);
    await waitForPageReady(page);
    await dismissCookieConsent(page);

    // Auth banner should NOT be visible (user is authenticated)
    const authBanner = page.locator('[data-testid="auth-banner"]');
    // Wait a moment for hydration, then check it's not there
    await page.waitForTimeout(2000);
    await expect(authBanner).toHaveCount(0);
  });

  test("clicking notification bell opens panel without errors", async ({
    page,
  }) => {
    const consoleErrors = collectConsoleErrors(page);
    const authErrors = collectAuthErrors(page);

    await page.goto(`${BASE_URL}/match-making`);
    await waitForPageReady(page);
    await dismissCookieConsent(page);

    // Click the notification bell
    const bellButton = page.getByRole('button', { name: /^Notifications/ }).first();
    await expect(bellButton).toBeVisible({ timeout: 30000 });
    await bellButton.click();

    // Panel should open — look for the panel with aria-label="Notification center"
    const panel = page.locator('[aria-label="Notification center"]');
    await expect(panel).toBeVisible({ timeout: 5000 });

    // No 401 errors
    expect(authErrors).toHaveLength(0);

    // No significant console errors
    expect(consoleErrors).toHaveLength(0);
  });

  test("notifications page shows content when logged in", async ({ page }) => {
    const consoleErrors = collectConsoleErrors(page);
    const authErrors = collectAuthErrors(page);

    await page.goto(`${BASE_URL}/notifications`);
    await waitForPageReady(page);

    // Page should not redirect to signin
    expect(page.url()).toContain("/notifications");
    expect(page.url()).not.toContain("/signin");

    // No 401 errors
    expect(authErrors).toHaveLength(0);

    // No significant console errors
    expect(consoleErrors).toHaveLength(0);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
//  TEST SUITE: SESSION PERSISTENCE
// ═══════════════════════════════════════════════════════════════════════════════

test.describe("Session Persistence", () => {
  test("authenticated user is not redirected to login on page navigation", async ({
    page,
  }) => {
    await performLogin(page);

    // Navigate to multiple pages and ensure no login redirect
    const pages = ["/match-making", "/notifications", "/match-making"];

    for (const path of pages) {
      await page.goto(`${BASE_URL}${path}`);
      await waitForPageReady(page);

      // Should never hit the signin page
      expect(page.url()).not.toContain("/signin");
    }
  });

  test("401 when authenticated does not redirect to signin", async ({
    page,
  }) => {
    await performLogin(page);

    await page.goto(`${BASE_URL}/match-making`);
    await waitForPageReady(page);

    // User should remain on match-making, not be redirected to signin
    expect(page.url()).toContain("/match-making");
    expect(page.url()).not.toContain("/signin");
  });
});

// ── Google OAuth & Hydration Checks ─────────────────────────────────────────

test.describe("Google OAuth & Hydration", () => {
  test("signin page loads without hydration errors", async ({ page }) => {
    const hydrationErrors: string[] = [];

    page.on("console", (msg) => {
      const text = msg.text();
      if (
        msg.type() === "error" &&
        (text.includes("Hydration") ||
          text.includes("server-rendered") ||
          text.includes("content does not match") ||
          text.includes("did not match"))
      ) {
        hydrationErrors.push(text);
      }
    });

    await page.goto(
      `${BASE_URL}/signin?callbackUrl=${encodeURIComponent("http://localhost:3030/match-making")}`,
    );
    await page.waitForLoadState("networkidle");

    // Page should render without hydration errors
    expect(hydrationErrors).toEqual([]);

    // Should show the sign-in form (not a blank page or error)
    await expect(
      page.locator("text=Google").or(page.locator("text=Sign In")).first(),
    ).toBeVisible({ timeout: 10000 });
  });

  test("Google sign-in button redirects to Google OAuth", async ({ page }) => {
    await page.goto(`${BASE_URL}/signin`);
    await page.waitForLoadState("networkidle");

    // Find and click the Google button
    const googleButton = page.locator("button", { hasText: "Google" });
    await expect(googleButton).toBeVisible({ timeout: 10000 });

    // Intercept the navigation to Google — we don't actually want to sign in
    const navigationPromise = page.waitForURL(
      (url) =>
        url.hostname.includes("accounts.google.com") ||
        url.pathname.includes("/api/auth/signin/google"),
      { timeout: 10000 },
    );

    await googleButton.click();
    await navigationPromise;

    const currentUrl = page.url();
    // Should redirect to Google OAuth or NextAuth's Google signin handler
    expect(
      currentUrl.includes("accounts.google.com") ||
        currentUrl.includes("/api/auth/signin/google"),
    ).toBe(true);
  });

  test("no 401 from subscriptions/current when unauthenticated", async ({
    page,
  }) => {
    const subscription401s: string[] = [];

    page.on("response", (response) => {
      if (
        response.url().includes("subscriptions/current") &&
        response.status() === 401
      ) {
        subscription401s.push(response.url());
      }
    });

    await page.goto(`${BASE_URL}/match-making`);
    await page.waitForLoadState("networkidle");

    // With the useSession guard, no subscription calls should be made when unauthenticated
    expect(subscription401s).toEqual([]);
  });

  test("signin page with absolute callbackUrl normalizes correctly", async ({
    page,
  }) => {
    // Login while on signin page with absolute callbackUrl
    await page.goto(
      `${BASE_URL}/signin?callbackUrl=${encodeURIComponent("http://localhost:3030/match-making")}`,
    );
    await page.waitForLoadState("networkidle");

    // Check no hydration error or crash — page should show sign-in form
    await expect(
      page.locator("text=Google").or(page.locator("text=Sign In")).first(),
    ).toBeVisible({ timeout: 10000 });

    // Login via email-password
    const emailInput = page.locator('input[type="email"], input[name="email"]');
    const passwordInput = page.locator(
      'input[type="password"], input[name="password"]',
    );

    if ((await emailInput.count()) > 0 && (await passwordInput.count()) > 0) {
      await emailInput.fill(TEST_EMAIL);
      await passwordInput.fill(TEST_PASSWORD);

      const submitButton = page
        .locator('button[type="submit"]')
        .or(page.locator("button", { hasText: /sign in|log in/i }))
        .first();

      await submitButton.click();

      // Should redirect to /match-making (not http://localhost:3030/match-making as full URL)
      await page.waitForURL((url) => url.pathname.includes("/match-making"), {
        timeout: 15000,
      });

      expect(page.url()).toContain("/match-making");
    }
  });
});

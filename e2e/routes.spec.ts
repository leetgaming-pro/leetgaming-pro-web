/**
 * Route Verification E2E Tests
 *
 * These tests verify that all routes in the application are accessible
 * and don't return 404 errors. This is critical for catching broken links
 * during development.
 */

import { test, expect } from "@playwright/test";

const isLocalDev = !process.env.CI;

// All public routes that should be accessible without authentication
const PUBLIC_ROUTES = [
  "/",
  "/signin",
  "/signup",
  "/legal/terms",
  "/legal/privacy",
  "/legal/cookies",
  "/service-status",
  "/leaderboards",
  "/tournaments",
  "/ranked",
  "/matches",
  "/teams",
  "/replays",
  "/highlights",
  "/upload",
];

// Legacy routes that should redirect (not 404)
const LEGACY_REDIRECT_ROUTES = [
  { path: "/cloud/upload", redirectsTo: "/upload" },
  { path: "/cloud/replays", redirectsTo: "/replays" },
  { path: "/cloud/highlights", redirectsTo: "/highlights" },
];

// Routes that require authentication but should load the page (redirect to login or show auth prompt)
const AUTH_REQUIRED_ROUTES = ["/settings", "/wallet", "/match-making"];

test.describe("Public Routes", () => {
  test.slow(); // Allow longer timeout for route tests under load

  for (const route of PUBLIC_ROUTES) {
    test(`${route} should be accessible`, async ({ page }) => {
      const response = await page.goto(route, {
        waitUntil: "domcontentloaded",
        timeout: 90000,
      });

      // Should not be a 404
      expect(response?.status()).not.toBe(404);

      // Should not be a 500
      expect(response?.status()).toBeLessThan(500);

      // Wait for page to stabilize
      await page.waitForLoadState("domcontentloaded");

      // Should have some content
      const body = await page.locator("body").textContent();
      expect(body?.length).toBeGreaterThan(0);
    });
  }
});

test.describe("Legacy Redirect Routes", () => {
  test.slow(); // Allow longer timeout for redirect tests under load

  for (const { path, redirectsTo } of LEGACY_REDIRECT_ROUTES) {
    test(`${path} should redirect to ${redirectsTo}`, async ({ page }) => {
      await page.goto(path, { timeout: 90000 });

      // Wait for redirect
      await page.waitForTimeout(1000);
      await page.waitForLoadState("domcontentloaded");

      // Should have been redirected
      expect(page.url()).toContain(redirectsTo);
    });
  }
});

test.describe("Auth-Required Routes", () => {
  for (const route of AUTH_REQUIRED_ROUTES) {
    test(`${route} should load or redirect (not 404)`, async ({ page }) => {
      const response = await page.goto(route, {
        waitUntil: "domcontentloaded",
      });

      // Should not be a 404
      expect(response?.status()).not.toBe(404);

      // Should not be a 500
      expect(response?.status()).toBeLessThan(500);

      await page.waitForLoadState("domcontentloaded");
    });
  }
});

// These tests navigate many pages and can timeout locally — run in CI only
test.describe("Footer Links Verification", () => {
  test("all footer links should resolve without 404", async ({ page }) => {
    test.skip(isLocalDev, "Skipping footer link verification in local development");
    test.slow(); // This test navigates to many pages
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(2000);

    // Get all footer links
    const footerLinks = await page.locator('footer a[href^="/"]').all();
    const hrefs = new Set<string>();

    for (const link of footerLinks) {
      const href = await link.getAttribute("href");
      if (href && href.startsWith("/")) {
        hrefs.add(href);
      }
    }

    // Verify each footer link
    for (const href of Array.from(hrefs)) {
      const response = await page.goto(href, { waitUntil: "domcontentloaded" });
      expect(response?.status(), `Footer link ${href} returned 404`).not.toBe(
        404,
      );
    }
  });
});

// These tests navigate many pages and can timeout locally — run in CI only
test.describe("Navigation Links Verification", () => {
  test("sidebar navigation links should resolve without 404", async ({
    page,
  }) => {
    test.skip(isLocalDev, "Skipping nav link verification in local development");
    test.slow(); // This test navigates to many pages
    // Go to a page that shows the sidebar (use settings instead of dashboard)
    await page.goto("/settings", { waitUntil: "domcontentloaded" });
    await page.waitForLoadState("domcontentloaded");

    // Get all navigation links from sidebar
    const navLinks = await page
      .locator('nav a[href^="/"], aside a[href^="/"]')
      .all();
    const hrefs = new Set<string>();

    for (const link of navLinks) {
      const href = await link.getAttribute("href");
      if (href && href.startsWith("/") && !href.includes("[")) {
        hrefs.add(href);
      }
    }

    // Verify each nav link
    for (const href of Array.from(hrefs)) {
      const response = await page.goto(href, { waitUntil: "domcontentloaded" });
      expect(response?.status(), `Nav link ${href} returned 404`).not.toBe(404);
    }
  });
});

test.describe("Matchmaking Routes", () => {
  test("/match-making should load matchmaking queue interface", async ({
    page,
  }) => {
    const response = await page.goto("/match-making", {
      waitUntil: "domcontentloaded",
    });

    expect(response?.status()).not.toBe(404);
    await page.waitForLoadState("networkidle").catch(() => {});

    // Should show matchmaking interface, login prompt, or redirect to auth
    const hasMatchmakingContent = await page
      .locator("text=/match|queue|find|play|game|ranked/i")
      .first()
      .isVisible({ timeout: 10000 })
      .catch(() => false);
    const hasLoginPrompt = await page
      .locator("text=/login|sign in|sign up|create.*account|authenticate/i")
      .first()
      .isVisible({ timeout: 5000 })
      .catch(() => false);
    // On mobile, auth redirect may navigate to signin page
    const isOnAuthPage = page.url().includes("/signin") || page.url().includes("/login") || page.url().includes("/api/auth");

    expect(hasMatchmakingContent || hasLoginPrompt || isOnAuthPage).toBeTruthy();
  });

  test("/ranked should load ranked matches interface", async ({ page }) => {
    const response = await page.goto("/ranked", {
      waitUntil: "domcontentloaded",
    });

    expect(response?.status()).not.toBe(404);
    await page.waitForLoadState("domcontentloaded");

    // Should show ranked matches or related content
    const body = await page.locator("body").textContent();
    expect(body?.toLowerCase()).toMatch(
      /ranked|match|leaderboard|competition/i,
    );
  });
});

test.describe("API Route Prefetch Verification", () => {
  test("should not have 404 errors when prefetching links on homepage", async ({
    page,
  }) => {
    const failedRequests: string[] = [];

    // Listen for failed requests
    page.on("response", (response) => {
      if (
        response.status() === 404 &&
        response.url().includes(page.url().split("/")[2])
      ) {
        failedRequests.push(response.url());
      }
    });

    await page.goto("/", { waitUntil: "domcontentloaded" });
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(2000);

    // Scroll down to trigger any lazy-loaded prefetches
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(2000);

    // Filter out expected 404s (external resources, API calls without auth, etc.)
    const unexpectedFailures = failedRequests.filter(
      (url) =>
        !url.includes("/api/") && // API calls may 401/404 without auth
        !url.includes("_next/static"), // Build artifacts
    );

    expect(
      unexpectedFailures,
      `Unexpected 404s: ${unexpectedFailures.join(", ")}`,
    ).toHaveLength(0);
  });
});

test.describe("Console Error Free Routes", () => {
  const criticalRoutes = [
    "/",
    "/ranked",
    "/tournaments",
    "/leaderboards",
    "/replays",
  ];

  for (const route of criticalRoutes) {
    test(`${route} should load without console errors`, async ({ page }) => {
      const consoleErrors: string[] = [];

      page.on("console", (msg) => {
        if (msg.type() === "error") {
          const text = msg.text();
          // Filter out expected errors
          if (!text.includes("favicon") && !text.includes("analytics")) {
            consoleErrors.push(text);
          }
        }
      });

      await page.goto(route, { waitUntil: "domcontentloaded" });
      await page.waitForLoadState("domcontentloaded");
      await page.waitForTimeout(1000);

      // Filter for critical errors only
      const criticalErrors = consoleErrors.filter(
        (e) =>
          e.includes("TypeError") ||
          e.includes("ReferenceError") ||
          e.includes("Uncaught") ||
          e.includes("Unhandled"),
      );

      expect(
        criticalErrors,
        `Console errors on ${route}: ${criticalErrors.join("; ")}`,
      ).toHaveLength(0);
    });
  }
});

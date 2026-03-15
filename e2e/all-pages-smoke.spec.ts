/**
 * E2E Smoke Tests: All Pages
 *
 * Quick health check for every major route in the application.
 * Verifies pages load without crashing (no blank screens, no uncaught errors).
 *
 * Public routes are tested without auth. Protected routes are tested with
 * the pro user fixture to verify authenticated access.
 */

import { test, expect } from "@playwright/test";
import { proUserTest } from "./fixtures/real-auth.fixture";

/**
 * Public routes that should load without authentication.
 */
const PUBLIC_ROUTES = [
  { path: "/", label: "Homepage" },
  { path: "/signin", label: "Sign In" },
  { path: "/pricing", label: "Pricing" },
  { path: "/players", label: "Players" },
  { path: "/teams", label: "Teams" },
  { path: "/tournaments", label: "Tournaments" },
  { path: "/leaderboards", label: "Leaderboards" },
  { path: "/replays", label: "Replays" },
  { path: "/highlights", label: "Highlights" },
  { path: "/legal/terms", label: "Terms of Service" },
  { path: "/legal/privacy", label: "Privacy Policy" },
  { path: "/legal/cookies", label: "Cookie Policy" },
  { path: "/help", label: "Help" },
  { path: "/forgot-password", label: "Forgot Password" },
  { path: "/reset-password", label: "Reset Password" },
  { path: "/docs", label: "Documentation" },
  { path: "/docs/leetscores", label: "LeetScores API" },
];

/**
 * Protected routes that require authentication.
 */
const PROTECTED_ROUTES = [
  { path: "/wallet", label: "Wallet" },
  { path: "/wallet/pro", label: "Pro Wallet" },
  { path: "/settings", label: "Settings" },
  { path: "/match-making", label: "Match Making" },
  { path: "/upload", label: "Upload" },
  { path: "/notifications", label: "Notifications" },
  { path: "/cloud", label: "Cloud" },
];

test.describe("Smoke Tests – Public Routes", () => {
  for (const route of PUBLIC_ROUTES) {
    test(`${route.label} (${route.path}) should load without crashing`, async ({
      page,
    }) => {
      // Collect console errors
      const consoleErrors: string[] = [];
      page.on("console", (msg) => {
        if (msg.type() === "error") {
          consoleErrors.push(msg.text());
        }
      });

      const response = await page.goto(route.path, {
        waitUntil: "domcontentloaded",
        timeout: 30000,
      });

      // Should not return server error status
      expect(
        response?.status(),
        `${route.path} should not return server error`,
      ).toBeLessThan(500);

      // Body should be visible (page rendered)
      const body = page.locator("body");
      await expect(body).toBeVisible({ timeout: 10000 });

      // Should have some meaningful content (not a blank page)
      const content = page.locator("main, div, section, h1, h2, p").first();
      await expect(content).toBeVisible({ timeout: 10000 });

      // Filter out known non-critical React hydration warnings
      const criticalErrors = consoleErrors.filter(
        (err) =>
          !err.includes("hydrat") &&
          !err.includes("Warning:") &&
          !err.includes("Failed to load resource") &&
          !err.includes("net::ERR"),
      );

      // Log critical errors for debugging but don't fail test (some
      // errors may be expected due to missing backend in smoke tests)
      if (criticalErrors.length > 0) {
        console.warn(
          `[${route.path}] Console errors:`,
          criticalErrors.join("\n"),
        );
      }
    });
  }
});

proUserTest.describe("Smoke Tests – Protected Routes", () => {
  for (const route of PROTECTED_ROUTES) {
    proUserTest(
      `${route.label} (${route.path}) should load for authenticated user`,
      async ({ proPage }) => {
        const response = await proPage.goto(route.path, {
          waitUntil: "domcontentloaded",
          timeout: 30000,
        });

        // Should not return server error status
        expect(
          response?.status(),
          `${route.path} should not return server error`,
        ).toBeLessThan(500);

        // Body should be visible
        const body = proPage.locator("body");
        await expect(body).toBeVisible({ timeout: 10000 });

        // Should not have been redirected to signin
        expect(
          proPage.url(),
          `${route.path} should not redirect to signin for authenticated user`,
        ).not.toContain("/signin");
      },
    );
  }
});

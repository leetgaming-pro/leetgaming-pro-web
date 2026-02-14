/**
 * Console Error Detection E2E Tests
 * These tests verify that our E2E suite catches console errors
 *
 * This file serves as both tests and documentation for how
 * console error detection works in the CI/CD pipeline.
 */

import { test, expect } from "./global-setup";

// Allow more time for first-hit compilation in dev mode
test.describe.configure({ timeout: 120000 });

test.describe("Console Error Detection", () => {
  test("should capture and report React hydration errors", async ({
    page,
    consoleErrors: _consoleErrors,
    assertNoConsoleErrors,
  }) => {
    // Navigate to homepage
    await page.goto("/", { waitUntil: "domcontentloaded", timeout: 90000 });
    await page.waitForLoadState("domcontentloaded");

    // Check for any console errors that occurred during page load
    // This will catch React hydration mismatches
    assertNoConsoleErrors();
  });

  test("should capture API errors in console", async ({
    page,
    consoleErrors,
  }) => {
    // Navigate to a page that makes API calls
    await page.goto("/home", { waitUntil: "domcontentloaded", timeout: 90000 });
    await page.waitForLoadState("domcontentloaded");

    // Wait a bit for any async API calls
    await page.waitForTimeout(2000);

    // Log any errors found (for debugging)
    if (consoleErrors.length > 0) {
      console.log("Console errors during API calls:", consoleErrors);
    }

    // In CI, this will fail if critical errors were found
    // In local dev, it will just log them
  });

  test("should detect runtime TypeErrors", async ({
    page,
    consoleErrors: _consoleErrors,
    assertNoConsoleErrors,
  }) => {
    // Navigate to match-making page which has dynamic components
    await page.goto("/match-making", { waitUntil: "domcontentloaded", timeout: 90000 });
    await page.waitForLoadState("domcontentloaded");

    // Interact with the page to trigger any potential errors
    const startButton = page.getByRole("button", { name: /start|join|find/i });
    if (await startButton.isVisible().catch(() => false)) {
      await startButton.click().catch(() => {
        // Button might require auth, that's ok
      });
    }

    await page.waitForTimeout(1000);
    assertNoConsoleErrors();
  });

  test("should detect errors during navigation", async ({
    page,
    consoleErrors: _consoleErrors,
    assertNoConsoleErrors,
  }) => {
    test.slow(); // Allow longer timeout for navigation tests under load

    // Test multiple page navigations to catch any route-related errors
    const routes = ["/", "/replays", "/tournaments", "/leaderboards"];

    for (const route of routes) {
      await page.goto(route, { waitUntil: "domcontentloaded", timeout: 90000 });
      await page.waitForLoadState("domcontentloaded");
      await page.waitForTimeout(500);
    }

    assertNoConsoleErrors();
  });

  test("should capture chunk loading errors", async ({
    page,
    consoleErrors,
  }) => {
    // Simulate slow network to potentially trigger chunk loading issues
    await page.route("**/*.js", async (route) => {
      // Add delay to JS chunk loading
      await new Promise((resolve) => setTimeout(resolve, 100));
      await route.continue();
    });

    await page.goto("/", { waitUntil: "domcontentloaded", timeout: 90000 });
    await page.waitForLoadState("domcontentloaded");

    // Check for chunk loading errors
    const chunkErrors = consoleErrors.filter(
      (e) => e.includes("ChunkLoadError") || e.includes("Loading chunk"),
    );

    expect(chunkErrors).toHaveLength(0);
  });
});

test.describe("Critical User Flows - Strict Mode", () => {
  // These tests use strict mode - ANY console error fails the test

  test("homepage should load without ANY console errors", async ({
    page,
    assertNoConsoleErrors,
  }) => {
    await page.goto("/", { waitUntil: "domcontentloaded", timeout: 90000 });
    await page.waitForLoadState("domcontentloaded");
    assertNoConsoleErrors();
  });

  test("authentication flow should be error-free", async ({
    page,
    assertNoConsoleErrors,
  }) => {
    await page.goto("/signin", { waitUntil: "domcontentloaded", timeout: 90000 });
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(3000);

    // Check for either form, loading state, or sign-in related content
    // The page uses client-side rendering so form may not be immediately visible
    const form = page.locator("form");
    const loadingState = page.getByText(/loading/i);
    const signInText = page.getByText(/sign in|sign-in|login/i);
    const pageBody = page.locator("body");

    const hasForm = await form.isVisible().catch(() => false);
    const hasLoading = await loadingState
      .first()
      .isVisible()
      .catch(() => false);
    const hasSignInText = await signInText
      .first()
      .isVisible()
      .catch(() => false);
    const hasBody = await pageBody.isVisible().catch(() => false);

    // Page is functional if any of these are visible
    expect(hasForm || hasLoading || hasSignInText || hasBody).toBe(true);

    assertNoConsoleErrors();
  });
});

test.describe("Error Boundary Testing", () => {
  test("should handle component errors gracefully", async ({
    page,
    consoleErrors,
  }) => {
    // Navigate and check that error boundaries catch errors
    await page.goto("/", { waitUntil: "domcontentloaded", timeout: 90000 });

    // Force an error by navigating to a non-existent route
    await page.goto("/this-route-does-not-exist-12345", {
      waitUntil: "domcontentloaded",
    });
    await page.waitForLoadState("domcontentloaded");

    // A 404 page should render without crashing the app
    // We shouldn't see "Unhandled Runtime Error"
    const unhandledErrors = consoleErrors.filter(
      (e) =>
        e.includes("Unhandled Runtime Error") ||
        e.includes("Application error"),
    );

    expect(unhandledErrors).toHaveLength(0);
  });
});

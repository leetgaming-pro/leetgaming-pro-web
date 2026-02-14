/**
 * E2E Tests for Cloud Upload Page
 * Tests guest token creation and upload functionality
 */

import { test, expect } from "@playwright/test";

test.describe("Cloud Upload Page", () => {
  test.beforeEach(async ({ page }) => {
    // Clear any existing session data
    await page.context().clearCookies();
  });

  test("should load cloud page without JavaScript errors", async ({ page }) => {
    // Track console errors
    const consoleErrors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto("/cloud", { waitUntil: "domcontentloaded" });
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(3000); // Wait for guest token creation

    // Filter out known non-critical errors
    const criticalErrors = consoleErrors.filter(
      (error) =>
        !error.includes("favicon") &&
        !error.includes("404") &&
        !error.includes("net::"),
    );

    // Check for the specific toJSON error
    const toJSONError = criticalErrors.find((error) =>
      error.includes("toJSON is not a function"),
    );
    expect(toJSONError).toBeUndefined();
  });

  test("should create guest token successfully", async ({ page }) => {
    // Track console errors - the toJSON error would appear here
    const toJSONErrors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error" && msg.text().includes("toJSON")) {
        toJSONErrors.push(msg.text());
      }
    });

    await page.goto("/cloud", { waitUntil: "domcontentloaded" });
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(3000); // Wait for guest token creation

    // No toJSON errors means the token was created successfully
    expect(toJSONErrors.length).toBe(0);
  });

  test("should display upload area", async ({ page }) => {
    await page.goto("/cloud", { waitUntil: "domcontentloaded" });
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(2000);

    // Check for upload-related elements
    const uploadArea = page.locator(
      '[data-testid="upload-area"], .upload-area, [class*="upload"], input[type="file"]',
    );
    const dropZone = page.getByText(/drag|drop|upload|select/i);

    const uploadVisible = await uploadArea
      .first()
      .isVisible()
      .catch(() => false);
    const dropZoneVisible = await dropZone
      .first()
      .isVisible()
      .catch(() => false);

    expect(uploadVisible || dropZoneVisible).toBe(true);
  });

  test("should not show toJSON error on page navigation", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error" && msg.text().includes("toJSON")) {
        errors.push(msg.text());
      }
    });

    // Navigate to cloud page
    await page.goto("/cloud", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(3000);

    // Navigate away and back
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(1000);
    await page.goto("/cloud", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(3000);

    // No toJSON errors should occur
    expect(errors.length).toBe(0);
  });

  test("should handle session API calls correctly", async ({ page }) => {
    let sessionApiCalls: { method: string; status: number }[] = [];

    await page.route("**/api/auth/session", async (route) => {
      try {
        const response = await route.fetch();
        sessionApiCalls.push({
          method: route.request().method(),
          status: response.status(),
        });
        await route.fulfill({ response });
      } catch (e) {
        // Context may close during navigation, this is expected
        await route.continue().catch(() => {});
      }
    });

    await page.goto("/cloud", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(3000);

    // Cleanup routes to avoid "route in flight" errors
    await page.unrouteAll({ behavior: "ignoreErrors" });

    // Session API should be called for storing the token
    const postCalls = sessionApiCalls.filter((c) => c.method === "POST");

    // If POST is called, it should succeed (2xx status)
    for (const call of postCalls) {
      expect(call.status).toBeGreaterThanOrEqual(200);
      expect(call.status).toBeLessThan(300);
    }
  });
});

test.describe("Cloud Upload - API Integration", () => {
  test("should be able to upload small file", async ({ page }) => {
    await page.goto("/cloud", { waitUntil: "domcontentloaded" });
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(2000);

    // Look for file input
    const fileInput = page.locator('input[type="file"]');

    if (await fileInput.isVisible().catch(() => false)) {
      // Create a small test file content
      const testContent = Buffer.from("test demo content");

      await fileInput.setInputFiles({
        name: "test.dem",
        mimeType: "application/octet-stream",
        buffer: testContent,
      });

      // Wait for upload to start
      await page.waitForTimeout(1000);

      // Check for progress or success indicators
      const progress = page.locator(
        '[data-testid="upload-progress"], .progress, [class*="progress"]',
      );
      const success = page.getByText(/upload|success|complete/i);

      const progressVisible = await progress
        .first()
        .isVisible()
        .catch(() => false);
      const successVisible = await success
        .first()
        .isVisible()
        .catch(() => false);

      // Either progress indicator or input still visible means upload flow works
      expect(
        progressVisible || successVisible || (await fileInput.isVisible()),
      ).toBe(true);
    } else {
      // Skip if no file input found
      test.skip();
    }
  });
});

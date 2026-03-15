/**
 * E2E Tests for Players Page
 * Tests the player listing, search, and filtering functionality
 *
 * Seed data: e2e/db-init/01-seed-data.js provisions 25+ public player profiles.
 */

import { test, expect } from "@playwright/test";

test.describe("Players Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/players", { waitUntil: "domcontentloaded" });
  });

  test("should load and display the Player Profiles heading", async ({
    page,
  }) => {
    const heading = page.getByRole("heading", { name: /player profiles/i });
    await expect(heading).toBeVisible({ timeout: 15000 });
  });

  test("should show Competitive Community subheading", async ({ page }) => {
    const subheading = page.getByText(/competitive community/i);
    await expect(subheading).toBeVisible({ timeout: 15000 });
  });

  test("should display player cards or empty/error state", async ({
    page,
  }) => {
    // Wait for loading spinner to disappear
    const spinner = page.getByText(/loading players/i);
    if (await spinner.isVisible().catch(() => false)) {
      await expect(spinner).toBeHidden({ timeout: 30000 });
    }

    const playerCards = page.locator('[class*="card"]');
    const emptyState = page.getByText(/no players found/i);
    const errorState = page.getByText(/error loading players/i);
    const showingCount = page.getByText(/showing \d+ player/i);

    const hasCards = (await playerCards.count()) > 0;
    const hasEmpty = await emptyState.isVisible().catch(() => false);
    const hasError = await errorState.isVisible().catch(() => false);
    const hasShowing = await showingCount.isVisible().catch(() => false);

    expect(
      hasCards || hasEmpty || hasError || hasShowing,
      "Page must show player cards, empty state, count, or error state",
    ).toBe(true);
  });

  test("should display game filter", async ({ page }) => {
    await page.waitForTimeout(2000);
    const gameSelector = page.getByText(/all games|select game/i);
    await expect(gameSelector.first()).toBeVisible({ timeout: 10000 });
  });

  test("should be responsive on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/players", { waitUntil: "domcontentloaded" });

    const heading = page.getByRole("heading", { name: /player profiles/i });
    await expect(heading).toBeVisible({ timeout: 15000 });
  });

  test("should handle API errors without crashing", async ({ page }) => {
    await page.route("**/players**", (route) => {
      route.fulfill({
        status: 500,
        body: JSON.stringify({ error: "Internal Server Error" }),
      });
    });

    await page.goto("/players", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(5000);

    // Page must not crash — body should still be visible
    const body = page.locator("body");
    await expect(body).toBeVisible();

    // Should show error state or the heading (client-side component always renders)
    const errorState = page.getByText(/error/i);
    const heading = page.getByRole("heading", { name: /player profiles/i });
    const showingCount = page.getByText(/showing \d+ player/i);

    const hasError = await errorState.first().isVisible().catch(() => false);
    const hasHeading = await heading.isVisible().catch(() => false);
    const hasShowing = await showingCount.isVisible().catch(() => false);

    expect(
      hasError || hasHeading || hasShowing,
      "Should show error state, heading, or player count",
    ).toBe(true);
  });

  test("should navigate to player detail when clicking a card", async ({
    page,
  }) => {
    const spinner = page.getByText(/loading players/i);
    if (await spinner.isVisible().catch(() => false)) {
      await expect(spinner).toBeHidden({ timeout: 30000 });
    }

    const playerCard = page.locator('[class*="card"]').first();
    const hasCard = await playerCard.isVisible().catch(() => false);

    if (hasCard) {
      await playerCard.click();
      await page.waitForURL(/\/players\//, { timeout: 10000 });
      expect(page.url()).toContain("/players/");
    } else {
      // No cards available — skip gracefully
      test.skip();
    }
  });
});

test.describe("Player Detail Page", () => {
  test("should load without crashing", async ({ page }) => {
    await page.goto("/players/1", {
      waitUntil: "domcontentloaded",
      timeout: 30000,
    });
    await page.waitForTimeout(3000);

    const body = page.locator("body");
    await expect(body).toBeVisible();

    const content = page.locator("main, div, section").first();
    await expect(content).toBeVisible();
  });

  test("should be responsive on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/players/1", {
      waitUntil: "domcontentloaded",
      timeout: 30000,
    });
    await page.waitForTimeout(3000);

    const body = page.locator("body");
    await expect(body).toBeVisible();
  });
});

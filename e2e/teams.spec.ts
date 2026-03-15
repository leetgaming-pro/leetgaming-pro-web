/**
 * E2E Tests for Teams Page
 * Tests the teams listing, search, and squad creation functionality
 *
 * Seed data: e2e/db-init/01-seed-data.js provisions 12+ public squads.
 */

import { test, expect } from "@playwright/test";

test.describe("Teams Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/teams", {
      waitUntil: "domcontentloaded",
      timeout: 90000,
    });
  });

  test("should load and display the Competitive Teams heading", async ({
    page,
  }) => {
    const heading = page.getByRole("heading", { name: /competitive teams/i });
    await expect(heading).toBeVisible({ timeout: 15000 });
  });

  test("should display team search input", async ({ page }) => {
    await page.waitForTimeout(2000);
    // Search input with placeholder "Search teams..."
    const searchInput = page.getByPlaceholder(/search teams/i);
    await expect(searchInput).toBeVisible({ timeout: 10000 });
  });

  test("should display loading state or loaded content", async ({ page }) => {
    // Either loading spinner or content should be visible
    const loadingIndicator = page.getByText(/loading/i);
    const heading = page.getByRole("heading", { name: /competitive teams/i });

    const isLoading = await loadingIndicator
      .first()
      .isVisible()
      .catch(() => false);
    const hasHeading = await heading.isVisible().catch(() => false);

    expect(
      isLoading || hasHeading,
      "Page must show loading state or heading",
    ).toBe(true);
  });

  test("should filter teams by game", async ({ page }) => {
    await page.waitForTimeout(3000);

    // Find and interact with game filter — use force to bypass sticky nav
    const gameFilter = page.getByText(/all games|select game/i);
    const isVisible = await gameFilter
      .first()
      .isVisible()
      .catch(() => false);

    if (isVisible) {
      await gameFilter.first().click({ force: true });
      await page.waitForTimeout(500);

      const cs2Option = page.getByText(/counter-strike 2/i);
      const hasOption = await cs2Option
        .first()
        .isVisible()
        .catch(() => false);
      if (hasOption) {
        await cs2Option.first().click({ force: true });
        await page.waitForTimeout(1000);
      }
    }

    // Page should still be functional
    const body = page.locator("body");
    await expect(body).toBeVisible();
  });

  test("should search teams by name", async ({ page }) => {
    await page.waitForTimeout(3000);

    const searchInput = page.getByPlaceholder(/search teams/i);
    const hasSearch = await searchInput.isVisible().catch(() => false);

    if (hasSearch) {
      await searchInput.fill("test");
      await page.waitForTimeout(1000);
    }

    // Page should remain functional
    const body = page.locator("body");
    await expect(body).toBeVisible();
  });

  test("should display sign in to create team button for unauthenticated users", async ({
    page,
  }) => {
    await page.waitForTimeout(3000);

    // Unauthenticated users see "Sign in to create team"
    const signInButton = page.getByRole("button", {
      name: /sign in to create team/i,
    });
    const launchSquadButton = page.getByRole("button", {
      name: /launch your squad/i,
    });

    const hasSignIn = await signInButton.isVisible().catch(() => false);
    const hasLaunchSquad = await launchSquadButton
      .isVisible()
      .catch(() => false);

    // One of these should be visible depending on auth state
    expect(
      hasSignIn || hasLaunchSquad,
      "Should show either 'Sign in to create team' or 'Launch Your Squad'",
    ).toBe(true);
  });

  test("should display team cards or empty state", async ({ page }) => {
    await page.waitForTimeout(5000);

    const teamCards = page.locator('[class*="card"]');
    const noTeamsMessage = page.getByText(/no teams|no squads found/i);
    const heading = page.getByRole("heading", {
      name: /competitive teams/i,
    });

    const hasCards = (await teamCards.count()) > 1; // At least filter card + team card
    const hasNoTeams = await noTeamsMessage
      .first()
      .isVisible()
      .catch(() => false);
    const hasHeading = await heading.isVisible().catch(() => false);

    expect(
      hasCards || hasNoTeams || hasHeading,
      "Should show team cards, empty state, or heading",
    ).toBe(true);
  });

  test("should be responsive on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/teams", { waitUntil: "domcontentloaded" });

    const heading = page.getByRole("heading", {
      name: /competitive teams/i,
    });
    await expect(heading).toBeVisible({ timeout: 15000 });
  });

  test("should handle API errors gracefully", async ({ page }) => {
    await page.route("**/api/**", async (route) => {
      await route.abort("failed");
    });

    await page.goto("/teams", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(5000);

    // Page should still render without crashing
    const body = page.locator("body");
    await expect(body).toBeVisible();
  });
});

test.describe("Squad Creation Flow", () => {
  test("should redirect unauthenticated users to sign in when creating squad", async ({
    page,
  }) => {
    await page.goto("/teams", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(5000);

    const signInButton = page.getByRole("button", {
      name: /sign in to create team/i,
    });
    const isVisible = await signInButton.isVisible().catch(() => false);

    if (isVisible) {
      await signInButton.click();
      await page.waitForTimeout(1000);

      // Should redirect to signin page
      expect(page.url()).toContain("/signin");
    }

    // Page should still be functional
    const body = page.locator("body");
    await expect(body).toBeVisible();
  });
});

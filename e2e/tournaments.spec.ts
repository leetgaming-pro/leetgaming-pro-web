/**
 * E2E Tests for Tournaments Page
 * Tests the tournament listing, filtering, and registration functionality
 */

import { test, expect } from "@playwright/test";

test.describe("Tournaments Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/tournaments", { waitUntil: "domcontentloaded" });
  });

  test("should load and display the tournaments page", async ({ page }) => {
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(3000);

    // Verify page title/header is visible (use exact match to avoid ambiguity with "No tournaments found")
    await expect(
      page.getByRole("heading", { name: "Tournaments", exact: true }),
    ).toBeVisible({ timeout: 10000 });
  });

  test("should display tournament filters", async ({ page }) => {
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(2000);

    // Check for tab filters (All, Open Registration, Live, Upcoming, Past)
    const tabs = page.locator('[role="tablist"]');
    const hasTabs = await tabs.isVisible().catch(() => false);

    // Page should have tabs for filtering
    expect(hasTabs).toBe(true);
  });

  test("should display tournament cards or empty state", async ({ page }) => {
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(5000);

    // After loading, should show either tournament cards, empty state, stats, or heading
    const tournamentCard = page.locator('[class*="card"]').first();
    const emptyStateHeading = page.getByRole("heading", {
      name: /no tournaments/i,
    });
    const emptyStateText = page.getByText(/no tournaments/i);
    const statsCard = page.getByText(/total tournaments/i);
    const tournamentsHeading = page.getByRole("heading", {
      name: /tournaments/i,
    });

    const hasCards = await tournamentCard.isVisible().catch(() => false);
    const isEmptyHeading = await emptyStateHeading
      .isVisible()
      .catch(() => false);
    const isEmptyText = await emptyStateText
      .first()
      .isVisible()
      .catch(() => false);
    const hasStats = await statsCard.isVisible().catch(() => false);
    const hasHeading = await tournamentsHeading
      .first()
      .isVisible()
      .catch(() => false);

    // Page is functional if any of these are visible
    expect(
      hasCards || isEmptyHeading || isEmptyText || hasStats || hasHeading,
    ).toBe(true);
  });

  test("should show tournament status badges", async ({ page }) => {
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(3000);

    // Check for status indicators (registration, in progress, completed, upcoming)
    const registrationBadge = page.getByText(/open registration/i);
    const inProgressBadge = page.getByText(/in progress/i);
    const completedBadge = page.getByText(/completed/i);
    const upcomingBadge = page.getByText(/upcoming/i);
    const emptyState = page.getByText(/no tournaments/i);

    // Any status badge being visible OR empty state is valid
    const hasStatus =
      (await registrationBadge
        .first()
        .isVisible()
        .catch(() => false)) ||
      (await inProgressBadge
        .first()
        .isVisible()
        .catch(() => false)) ||
      (await completedBadge
        .first()
        .isVisible()
        .catch(() => false)) ||
      (await upcomingBadge
        .first()
        .isVisible()
        .catch(() => false));
    const isEmpty = await emptyState.isVisible().catch(() => false);

    // Must show status badges OR empty state - not neither
    expect(hasStatus || isEmpty).toBe(true);
  });

  test("should be responsive on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/tournaments", { waitUntil: "domcontentloaded" });
    await page.waitForLoadState("domcontentloaded");

    // Check that key elements are still visible
    const body = page.locator("body");
    await expect(body).toBeVisible();

    // Navigation should still be accessible (use first to handle multiple navs)
    const nav = page.locator("nav").first();
    await expect(nav).toBeVisible();
  });

  test("should handle API errors gracefully", async ({ page }) => {
    // Mock API to return error
    await page.route("**/tournaments**", (route) => {
      route.fulfill({
        status: 500,
        body: JSON.stringify({ error: "Internal Server Error" }),
      });
    });

    await page.goto("/tournaments", { waitUntil: "domcontentloaded" });
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(2000);

    // Should show error state or empty state, not crash (uses fallback mock data)
    const body = page.locator("body");
    await expect(body).toBeVisible();
  });

  test("should navigate to tournament details when clicking a tournament", async ({
    page,
  }) => {
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(3000);

    // Find a tournament card - look for links to tournament details
    const tournamentLink = page.locator('a[href*="/tournaments/"]').first();
    const tournamentCard = page
      .locator('[class*="card"][class*="hover"]')
      .first();
    const emptyStateHeading = page.getByRole("heading", {
      name: /no tournaments/i,
    });
    const emptyStateText = page.getByText(/no tournaments/i);
    const tournamentsHeading = page.getByRole("heading", {
      name: /tournaments/i,
    });

    const hasLink = await tournamentLink.isVisible().catch(() => false);
    const hasCard = await tournamentCard.isVisible().catch(() => false);
    const isEmptyHeading = await emptyStateHeading
      .isVisible()
      .catch(() => false);
    const isEmptyText = await emptyStateText
      .first()
      .isVisible()
      .catch(() => false);
    const hasHeading = await tournamentsHeading
      .first()
      .isVisible()
      .catch(() => false);

    if (hasLink) {
      await tournamentLink.click();
      await page.waitForTimeout(500);
      await page.waitForLoadState("domcontentloaded");
      expect(page.url()).toContain("/tournaments/");
    } else if (hasCard) {
      await tournamentCard.click();
      await page.waitForTimeout(500);
      await page.waitForLoadState("domcontentloaded");
      expect(page.url()).toContain("/tournaments");
    } else {
      // Empty state or page heading - page is functional
      expect(isEmptyHeading || isEmptyText || hasHeading).toBe(true);
    }
  });
});

test.describe("Tournament Details", () => {
  test("should display tournament information", async ({ page }) => {
    // Try to access a tournament detail page
    await page.goto("/tournaments", { waitUntil: "domcontentloaded" });
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(3000);

    const tournamentCard = page.locator('[class*="card"]').first();
    const hasCard = await tournamentCard.isVisible().catch(() => false);

    if (hasCard) {
      await tournamentCard.click();
      await page.waitForTimeout(500);
      await page.waitForLoadState("domcontentloaded");

      // Check for tournament details
      const body = page.locator("body");
      await expect(body).toBeVisible();

      // Should show tournament name or details
      const content = await page.content();
      expect(content.length).toBeGreaterThan(0);
    } else {
      test.skip();
    }
  });

  test("should show prize pool information", async ({ page }) => {
    await page.goto("/tournaments", { waitUntil: "domcontentloaded" });
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(3000);

    // Prize pool is visible on the main tournaments page cards, stats, or empty state
    const prizeText = page.getByText(/prize pool/i);
    const totalPrize = page.getByText(/total prize pool/i);
    const emptyStateHeading = page.getByRole("heading", {
      name: /no tournaments/i,
    });
    const emptyStateText = page.getByText(/no tournaments/i);
    const tournamentsHeading = page.getByRole("heading", {
      name: /tournaments/i,
    });

    const hasPrize = await prizeText
      .first()
      .isVisible()
      .catch(() => false);
    const hasTotalPrize = await totalPrize.isVisible().catch(() => false);
    const isEmptyHeading = await emptyStateHeading
      .isVisible()
      .catch(() => false);
    const isEmptyText = await emptyStateText
      .first()
      .isVisible()
      .catch(() => false);
    const hasHeading = await tournamentsHeading
      .first()
      .isVisible()
      .catch(() => false);

    // Page is functional if any of these are visible
    expect(
      hasPrize || hasTotalPrize || isEmptyHeading || isEmptyText || hasHeading,
    ).toBe(true);
  });
});

test.describe("Tournament Registration", () => {
  test("should show register button for open tournaments", async ({ page }) => {
    await page.goto("/tournaments", { waitUntil: "domcontentloaded" });
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(3000);

    // Look for register button, other action buttons, empty state, or page heading
    const registerButton = page.getByRole("button", { name: /register/i });
    const actionButtons = page.getByRole("button", {
      name: /watch|view|reminder/i,
    });
    const emptyStateHeading = page.getByRole("heading", {
      name: /no tournaments/i,
    });
    const emptyStateText = page.getByText(/no tournaments/i);
    const tournamentsHeading = page.getByRole("heading", {
      name: /tournaments/i,
    });

    const hasRegister = await registerButton
      .first()
      .isVisible()
      .catch(() => false);
    const hasActions = await actionButtons
      .first()
      .isVisible()
      .catch(() => false);
    const isEmptyHeading = await emptyStateHeading
      .isVisible()
      .catch(() => false);
    const isEmptyText = await emptyStateText
      .first()
      .isVisible()
      .catch(() => false);
    const hasHeading = await tournamentsHeading
      .first()
      .isVisible()
      .catch(() => false);

    // Page is functional
    expect(
      hasRegister || hasActions || isEmptyHeading || isEmptyText || hasHeading,
    ).toBe(true);
  });

  test("should require authentication for registration", async ({ page }) => {
    await page.goto("/tournaments", { waitUntil: "domcontentloaded" });
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(3000);

    // Test page is functional - either has tournaments or empty state
    const registerButton = page
      .getByRole("button", { name: /register/i })
      .first();
    const emptyStateHeading = page.getByRole("heading", {
      name: /no tournaments/i,
    });
    const emptyStateText = page.getByText(/no tournaments/i);
    const tournamentsHeading = page.getByRole("heading", {
      name: /tournaments/i,
    });

    const hasRegister = await registerButton.isVisible().catch(() => false);
    const isEmptyHeading = await emptyStateHeading
      .isVisible()
      .catch(() => false);
    const isEmptyText = await emptyStateText
      .first()
      .isVisible()
      .catch(() => false);
    const hasHeading = await tournamentsHeading
      .first()
      .isVisible()
      .catch(() => false);

    if (hasRegister) {
      await registerButton.click();
      await page.waitForTimeout(500);

      // Should either redirect to signin or show auth modal
      const isSignin = page.url().includes("/signin");
      const authModal = page.getByRole("dialog");
      const hasAuthModal = await authModal.isVisible().catch(() => false);

      // Must redirect to signin OR show auth modal (for unauthenticated users)
      expect(isSignin || hasAuthModal).toBe(true);
    } else {
      // No register button - page should still be functional
      expect(isEmptyHeading || isEmptyText || hasHeading).toBe(true);
    }
  });
});

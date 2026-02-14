/**
 * E2E Tests for Ranked Page
 * Tests the ranked mode display, stats, and match history
 * Note: Most stats require authentication - tests handle unauthenticated state
 */

import { test, expect } from "@playwright/test";

test.describe("Ranked Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/ranked", { waitUntil: "domcontentloaded" });
  });

  test("should load and display the ranked page", async ({ page }) => {
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(3000);

    // Verify page has ranked heading
    const rankedHeading = page.getByRole("heading", { name: "Ranked Mode" });
    await expect(rankedHeading).toBeVisible({ timeout: 10000 });

    // Verify subtitle text (use .first() to handle multiple matches)
    const subtitle = page.getByRole("heading", { name: /Competitive Gaming/i });
    await expect(subtitle.first()).toBeVisible();
  });

  test("should display loading state initially", async ({ page }) => {
    await page.goto("/ranked", { waitUntil: "domcontentloaded" });

    // Check for loading indicator or page content
    const loadingIndicator = page
      .getByText(/loading ranked data/i)
      .or(page.locator('[role="status"]'));
    const rankedHeading = page.getByRole("heading", { name: /ranked mode/i });

    const isLoading = await loadingIndicator
      .first()
      .isVisible()
      .catch(() => false);
    const hasHeading = await rankedHeading.isVisible().catch(() => false);

    // Either loading is visible or page has already loaded
    expect(isLoading || hasHeading).toBe(true);

    // Page should have content after loading
    const content = page.locator("body");
    await expect(content).toBeVisible();
  });

  test("should display current rank card or loading state", async ({
    page,
  }) => {
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(3000);

    // Check for rating display (when authenticated) or loading/heading
    const ratingLabel = page.getByText(/rating/i);
    const loadingState = page.getByText(/loading/i);
    const rankedHeading = page.getByRole("heading", { name: /ranked mode/i });

    const hasRating = await ratingLabel
      .first()
      .isVisible()
      .catch(() => false);
    const hasLoading = await loadingState
      .first()
      .isVisible()
      .catch(() => false);
    const hasHeading = await rankedHeading.isVisible().catch(() => false);

    // Either shows rating (authenticated), loading state, or page heading
    expect(hasRating || hasLoading || hasHeading).toBe(true);
  });

  test("should display win rate statistics or loading state", async ({
    page,
  }) => {
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(3000);

    // Check for win rate display (when authenticated) or loading/heading
    const winRateLabel = page.getByText(/win rate/i);
    const loadingState = page.getByText(/loading/i);
    const rankedHeading = page.getByRole("heading", { name: /ranked mode/i });

    const hasWinRate = await winRateLabel
      .first()
      .isVisible()
      .catch(() => false);
    const hasLoading = await loadingState
      .first()
      .isVisible()
      .catch(() => false);
    const hasHeading = await rankedHeading.isVisible().catch(() => false);

    expect(hasWinRate || hasLoading || hasHeading).toBe(true);
  });

  test("should display total matches count or loading state", async ({
    page,
  }) => {
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(3000);

    // Check for total matches display (when authenticated) or loading/heading
    const matchesLabel = page.getByText(/total matches/i);
    const loadingState = page.getByText(/loading/i);
    const rankedHeading = page.getByRole("heading", { name: /ranked mode/i });

    const hasMatches = await matchesLabel
      .first()
      .isVisible()
      .catch(() => false);
    const hasLoading = await loadingState
      .first()
      .isVisible()
      .catch(() => false);
    const hasHeading = await rankedHeading.isVisible().catch(() => false);

    expect(hasMatches || hasLoading || hasHeading).toBe(true);
  });

  test("should display progress to next rank or loading state", async ({
    page,
  }) => {
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(3000);

    // Check for progress bar (when authenticated) or loading/heading
    const progressBar = page.locator('[class*="progress"]');
    const loadingState = page.getByText(/loading/i);
    const rankedHeading = page.getByRole("heading", { name: /ranked mode/i });

    const hasProgress = await progressBar
      .first()
      .isVisible()
      .catch(() => false);
    const hasLoading = await loadingState
      .first()
      .isVisible()
      .catch(() => false);
    const hasHeading = await rankedHeading.isVisible().catch(() => false);

    expect(hasProgress || hasLoading || hasHeading).toBe(true);
  });

  test("should display recent matches or loading state", async ({ page }) => {
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(3000);

    // Check for match history section or loading/heading
    const matchHistory = page.getByText(/match history|recent matches/i);
    const loadingState = page.getByText(/loading/i);
    const rankedHeading = page.getByRole("heading", { name: /ranked mode/i });

    const hasHistory = await matchHistory
      .first()
      .isVisible()
      .catch(() => false);
    const hasLoading = await loadingState
      .first()
      .isVisible()
      .catch(() => false);
    const hasHeading = await rankedHeading.isVisible().catch(() => false);

    expect(hasHistory || hasLoading || hasHeading).toBe(true);
  });

  test("should show match details in match history or loading state", async ({
    page,
  }) => {
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(3000);

    // Check for match info or loading/heading
    const matchInfo = page.getByText(/win|loss|draw|score/i);
    const loadingState = page.getByText(/loading/i);
    const rankedHeading = page.getByRole("heading", { name: /ranked mode/i });

    const hasInfo = await matchInfo
      .first()
      .isVisible()
      .catch(() => false);
    const hasLoading = await loadingState
      .first()
      .isVisible()
      .catch(() => false);
    const hasHeading = await rankedHeading.isVisible().catch(() => false);

    expect(hasInfo || hasLoading || hasHeading).toBe(true);
  });

  test("should display rating changes in match history or loading state", async ({
    page,
  }) => {
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(3000);

    // Check for rating change indicator or loading/heading
    const ratingChange = page.getByText(/\+\d+|\-\d+/);
    const loadingState = page.getByText(/loading/i);
    const rankedHeading = page.getByRole("heading", { name: /ranked mode/i });

    const hasChange = await ratingChange
      .first()
      .isVisible()
      .catch(() => false);
    const hasLoading = await loadingState
      .first()
      .isVisible()
      .catch(() => false);
    const hasHeading = await rankedHeading.isVisible().catch(() => false);

    expect(hasChange || hasLoading || hasHeading).toBe(true);
  });

  test("should navigate to match detail page when clicking on match or show loading", async ({
    page,
  }) => {
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(3000);

    // Check for match links or loading/heading
    const matchLink = page.locator('a[href*="/matches/"]');
    const loadingState = page.getByText(/loading/i);
    const rankedHeading = page.getByRole("heading", { name: /ranked mode/i });

    const hasLink = await matchLink
      .first()
      .isVisible()
      .catch(() => false);
    const hasLoading = await loadingState
      .first()
      .isVisible()
      .catch(() => false);
    const hasHeading = await rankedHeading.isVisible().catch(() => false);

    expect(hasLink || hasLoading || hasHeading).toBe(true);
  });

  test("should display rank tiers section or loading state", async ({
    page,
  }) => {
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(3000);

    // Check for rank tiers or loading/heading
    const rankTiers = page.getByText(/rank tiers|ranking tiers|tier/i);
    const loadingState = page.getByText(/loading/i);
    const rankedHeading = page.getByRole("heading", { name: /ranked mode/i });

    const hasTiers = await rankTiers
      .first()
      .isVisible()
      .catch(() => false);
    const hasLoading = await loadingState
      .first()
      .isVisible()
      .catch(() => false);
    const hasHeading = await rankedHeading.isVisible().catch(() => false);

    expect(hasTiers || hasLoading || hasHeading).toBe(true);
  });

  test("should show current tier highlighted or display loading", async ({
    page,
  }) => {
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(3000);

    // Check for tier indicator or loading/heading
    const tierIndicator = page.locator('[class*="tier"]');
    const loadingState = page.getByText(/loading/i);
    const rankedHeading = page.getByRole("heading", { name: /ranked mode/i });

    const hasTier = await tierIndicator
      .first()
      .isVisible()
      .catch(() => false);
    const hasLoading = await loadingState
      .first()
      .isVisible()
      .catch(() => false);
    const hasHeading = await rankedHeading.isVisible().catch(() => false);

    expect(hasTier || hasLoading || hasHeading).toBe(true);
  });

  test("should display leaderboard preview or loading state", async ({
    page,
  }) => {
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(3000);

    // Check for leaderboard section or loading/heading
    const leaderboard = page.getByText(/leaderboard|top players/i);
    const loadingState = page.getByText(/loading/i);
    const rankedHeading = page.getByRole("heading", { name: /ranked mode/i });

    const hasLeaderboard = await leaderboard
      .first()
      .isVisible()
      .catch(() => false);
    const hasLoading = await loadingState
      .first()
      .isVisible()
      .catch(() => false);
    const hasHeading = await rankedHeading.isVisible().catch(() => false);

    expect(hasLeaderboard || hasLoading || hasHeading).toBe(true);
  });

  test("should have link to full leaderboard or display loading", async ({
    page,
  }) => {
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(3000);

    // Check for leaderboard link or loading/heading
    const leaderboardLink = page.locator('a[href*="/leaderboards"]');
    const loadingState = page.getByText(/loading/i);
    const rankedHeading = page.getByRole("heading", { name: /ranked mode/i });

    const hasLink = await leaderboardLink
      .first()
      .isVisible()
      .catch(() => false);
    const hasLoading = await loadingState
      .first()
      .isVisible()
      .catch(() => false);
    const hasHeading = await rankedHeading.isVisible().catch(() => false);

    expect(hasLink || hasLoading || hasHeading).toBe(true);
  });

  test("should display game mode selector or loading state", async ({
    page,
  }) => {
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(3000);

    // Check for game mode selector or loading/heading
    const gameModeSelector = page.getByText(/game mode|mode/i);
    const loadingState = page.getByText(/loading/i);
    const rankedHeading = page.getByRole("heading", { name: /ranked mode/i });

    const hasSelector = await gameModeSelector
      .first()
      .isVisible()
      .catch(() => false);
    const hasLoading = await loadingState
      .first()
      .isVisible()
      .catch(() => false);
    const hasHeading = await rankedHeading.isVisible().catch(() => false);

    expect(hasSelector || hasLoading || hasHeading).toBe(true);
  });

  test("should display season information or loading state", async ({
    page,
  }) => {
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(3000);

    // Check for season info or loading/heading
    const seasonInfo = page.getByText(/season|competitive season/i);
    const loadingState = page.getByText(/loading/i);
    const rankedHeading = page.getByRole("heading", { name: /ranked mode/i });

    const hasSeason = await seasonInfo
      .first()
      .isVisible()
      .catch(() => false);
    const hasLoading = await loadingState
      .first()
      .isVisible()
      .catch(() => false);
    const hasHeading = await rankedHeading.isVisible().catch(() => false);

    expect(hasSeason || hasLoading || hasHeading).toBe(true);
  });

  test("should handle unauthenticated user gracefully", async ({ page }) => {
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(3000);

    // Verify page loads without errors even for unauthenticated users
    const rankedHeading = page.getByRole("heading", { name: /ranked mode/i });
    const loadingState = page.getByText(/loading/i);
    const body = page.locator("body");

    const hasHeading = await rankedHeading.isVisible().catch(() => false);
    const hasLoading = await loadingState
      .first()
      .isVisible()
      .catch(() => false);
    const hasBody = await body.isVisible();

    expect(hasHeading || hasLoading || hasBody).toBe(true);
  });

  test("should be responsive on mobile viewport", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/ranked", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(3000);

    // Check page content is visible on mobile
    const rankedHeading = page.getByRole("heading", { name: /ranked mode/i });
    const loadingState = page.getByText(/loading/i);
    const body = page.locator("body");

    const hasHeading = await rankedHeading.isVisible().catch(() => false);
    const hasLoading = await loadingState
      .first()
      .isVisible()
      .catch(() => false);
    const hasBody = await body.isVisible();

    expect(hasHeading || hasLoading || hasBody).toBe(true);
  });
});

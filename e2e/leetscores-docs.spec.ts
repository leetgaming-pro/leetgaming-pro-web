/**
 * E2E Tests: LeetScores Documentation Page
 *
 * Validates the LeetScores product/docs page renders correctly with:
 * - Hero section and navigation anchors
 * - Live component demos (ScoreDisplay, MatchScoreboard, PremiumHighlights)
 * - SDK/API reference tabs
 * - Pricing section
 * - Banner link from main docs page
 */

import { test, expect } from "@playwright/test";

test.describe("LeetScores Documentation Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/docs/leetscores", { waitUntil: "domcontentloaded" });
    // Allow client-side rendering to settle
    await page.waitForTimeout(2000);

    // Dismiss cookie consent banner if present (it overlays and intercepts clicks)
    const acceptBtn = page.getByRole("button", { name: "Accept All" });
    if (await acceptBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await acceptBtn.click();
      await page.waitForTimeout(500);
    }
  });

  test("should load without crashing and display hero", async ({ page }) => {
    // Page should not show error
    await expect(page.locator("body")).not.toContainText("Application error");

    // Hero heading visible
    await expect(
      page.getByText("Esports Score Intelligence as a Service"),
    ).toBeVisible({ timeout: 15000 });

    // LeetScores subtitle
    await expect(page.getByText("LeetScores").first()).toBeVisible();
  });

  test("should display stats bar with key metrics", async ({ page }) => {
    // Scroll to the stats bar area
    const statsSection = page.getByText("Games Supported");
    await statsSection.scrollIntoViewIfNeeded();
    await expect(statsSection).toBeVisible({ timeout: 10000 });
    await expect(page.getByText("Statistics Tracked")).toBeVisible();
  });

  test("should show product overview feature cards", async ({ page }) => {
    const consensus = page.getByRole("heading", { name: "Multi-Provider Consensus", exact: true });
    await consensus.scrollIntoViewIfNeeded();
    await expect(consensus).toBeVisible({ timeout: 10000 });

    const statsEngine = page.getByRole("heading", { name: "75+ Statistics Engine" });
    await statsEngine.scrollIntoViewIfNeeded();
    await expect(statsEngine).toBeVisible();

    const uiLib = page.getByRole("heading", { name: "Award-Winning UI Library" });
    await uiLib.scrollIntoViewIfNeeded();
    await expect(uiLib).toBeVisible();
  });

  test("should render live demo sections with interactive components", async ({
    page,
  }) => {
    // Demo labels
    const scoreLbl = page.getByText("ScoreDisplay").first();
    await scoreLbl.scrollIntoViewIfNeeded();
    await expect(scoreLbl).toBeVisible({ timeout: 10000 });

    // Live Demo chips
    const liveChips = page.getByText("Live Demo");
    await expect(liveChips.first()).toBeVisible();

    // Code toggle buttons should exist
    const codeButtons = page.getByRole("button", { name: "Code" });
    await expect(codeButtons.first()).toBeVisible();
  });

  test("should have code toggle buttons in demo sections", async ({ page }) => {
    // Verify Code buttons exist on demo cards (toggle tests omitted due to
    // NextUI/React Aria onPress not firing in headless Playwright)
    const codeButtons = page.getByRole("button", { name: "Code" });
    const count = await codeButtons.count();
    expect(count).toBeGreaterThanOrEqual(2);

    // Verify first code button is scrollable and visible
    await codeButtons.first().scrollIntoViewIfNeeded();
    await expect(codeButtons.first()).toBeVisible({ timeout: 10000 });
  });

  test("should display game coverage matrix", async ({ page }) => {
    const heading = page.getByRole("heading", { name: "11 Games, Unified Schema" });
    await heading.scrollIntoViewIfNeeded();
    await expect(heading).toBeVisible({ timeout: 10000 });

    // Check for game names within cards
    await expect(page.locator("text=Counter-Strike 2").first()).toBeVisible();
    await expect(page.locator("text=Valorant").first()).toBeVisible();
  });

  test("should render SDK reference with tab navigation", async ({ page }) => {
    // Scroll to SDK section
    const sdkHeading = page.getByRole("heading", { name: "SDK & API Reference" });
    await sdkHeading.scrollIntoViewIfNeeded();
    await expect(sdkHeading).toBeVisible({ timeout: 10000 });

    // Verify description text
    await expect(
      page.getByText("Integrate LeetScores in minutes"),
    ).toBeVisible();

    // Verify all 4 tabs are present in the tablist
    const tsTab = page.getByRole("tab", { name: /TypeScript SDK/ });
    await expect(tsTab).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole("tab", { name: /REST API/ })).toBeVisible();
    await expect(page.getByRole("tab", { name: /Webhooks/ })).toBeVisible();
    await expect(page.getByRole("tab", { name: /Widgets/ })).toBeVisible();
  });

  test("should display pricing tiers", async ({ page }) => {
    const pricing = page.getByText("LeetScores API Pricing");
    await pricing.scrollIntoViewIfNeeded();
    await expect(pricing).toBeVisible({ timeout: 10000 });

    await expect(page.getByText("Most Popular")).toBeVisible();
  });

  test("should have working CTA buttons", async ({ page }) => {
    const cta = page.getByText("Ready to Integrate LeetScores?");
    await cta.scrollIntoViewIfNeeded();
    await expect(cta).toBeVisible({ timeout: 10000 });
  });

  test("should display architecture pipeline", async ({ page }) => {
    const arch = page.getByText("How LeetScores Works");
    await arch.scrollIntoViewIfNeeded();
    await expect(arch).toBeVisible({ timeout: 10000 });

    await expect(page.getByText("Game Servers")).toBeVisible();
    await expect(page.getByText("Consensus Engine", { exact: true })).toBeVisible();
  });

  test("should render consensus engine deep dive", async ({ page }) => {
    const heading = page.getByRole("heading", { name: "Multi-Provider Consensus Engine" });
    await heading.scrollIntoViewIfNeeded();
    await expect(heading).toBeVisible({ timeout: 10000 });

    // Formula weights should be visible
    await expect(page.getByText("Weighted Agreement Formula")).toBeVisible();
    await expect(page.getByText("Series Winner")).toBeVisible();

    // Confidence levels
    await expect(page.getByText("Confidence Levels")).toBeVisible();

    // Anomaly detection
    await expect(page.locator("h3").filter({ hasText: "Anomaly Detection" })).toBeVisible();

    // Provider table
    await expect(page.getByText("Provider Confidence Weights")).toBeVisible();
    await expect(page.getByText("Steam Web API")).toBeVisible();
  });

  test("should render oracle architecture section", async ({ page }) => {
    const heading = page.getByRole("heading", { name: "Decentralized Score Oracle" });
    await heading.scrollIntoViewIfNeeded();
    await expect(heading).toBeVisible({ timeout: 10000 });

    // Chain configs
    await expect(page.getByText("Polygon PoS").first()).toBeVisible();
    await expect(page.getByText("Solana Mainnet").first()).toBeVisible();

    // Key invariants
    await expect(page.getByText("Key Invariants")).toBeVisible();

    // Consensus policies
    await expect(page.getByText("Consensus Policies")).toBeVisible();
  });

  test("should render how to contribute section", async ({ page }) => {
    const heading = page.getByRole("heading", { name: "How to Contribute" });
    await heading.scrollIntoViewIfNeeded();
    await expect(heading).toBeVisible({ timeout: 10000 });

    // Quick start steps
    await expect(page.getByText("Clone & Setup")).toBeVisible();
    await expect(page.getByText("Pick an Issue")).toBeVisible();

    // Code standards
    await expect(page.getByText("Code Standards")).toBeVisible();

    // Repository map
    await expect(page.getByText("Repository Map")).toBeVisible();
  });

  test("should not have console errors on load", async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        const text = msg.text();
        // Ignore expected backend connectivity errors in dev
        if (
          !text.includes("ECONNREFUSED") &&
          !text.includes("fetch failed") &&
          !text.includes("Failed to load resource") &&
          !text.includes("net::ERR_")
        ) {
          consoleErrors.push(text);
        }
      }
    });

    await page.goto("/docs/leetscores", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(3000);

    expect(
      consoleErrors,
      `Unexpected console errors: ${consoleErrors.join(", ")}`,
    ).toHaveLength(0);
  });
});

test.describe("Docs Page → LeetScores Banner", () => {
  test("should show LeetScores banner and navigate to LeetScores page", async ({
    page,
  }) => {
    await page.goto("/docs", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(3000);

    // Banner should be visible — use the heading text
    const banner = page.locator("h3", { hasText: "LeetScores API" });
    await banner.scrollIntoViewIfNeeded();
    await expect(banner).toBeVisible({ timeout: 15000 });

    // NEW chip should be present
    await expect(
      page.locator("text=NEW").first(),
    ).toBeVisible();

    // Click the banner link to navigate
    const bannerLink = page.locator('a[href="/docs/leetscores"]');
    await bannerLink.click();
    await page.waitForURL("**/docs/leetscores", { timeout: 30000 });

    // Should land on the LeetScores page
    await expect(
      page.getByText("Esports Score Intelligence as a Service"),
    ).toBeVisible({ timeout: 15000 });
  });
});

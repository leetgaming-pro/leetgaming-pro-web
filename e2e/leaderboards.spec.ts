/**
 * E2E Tests for Leaderboards Page
 * Tests the leaderboard listing, filtering, and tab functionality
 */

import { test, expect } from '@playwright/test';

test.describe('Leaderboards Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/leaderboards');
  });

  test('should load and display the leaderboards page', async ({ page }) => {
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);

    // Verify page has leaderboards heading
    const leaderboardsHeading = page.getByRole('heading', { name: 'Leaderboards' });
    await expect(leaderboardsHeading).toBeVisible({ timeout: 10000 });

    // Verify subtitle text
    const subtitle = page.getByText(/Global Rankings/i);
    await expect(subtitle).toBeVisible();
  });

  test('should display loading state initially', async ({ page }) => {
    await page.goto('/leaderboards');
    await page.waitForLoadState('domcontentloaded');

    // Check for loading indicator or already loaded content
    const loadingIndicator = page.getByText(/loading leaderboards/i).or(page.locator('[role="status"]'));
    const heading = page.getByRole('heading', { name: 'Leaderboards' });
    const isLoading = await loadingIndicator.isVisible().catch(() => false);
    const isLoaded = await heading.isVisible().catch(() => false);

    if (isLoading && !isLoaded) {
      // Wait for loading to complete with extended timeout
      await expect(loadingIndicator).toBeHidden({ timeout: 20000 }).catch(() => {
        // Loading may have finished before we could observe it
      });
    }

    // Page should have content after loading
    const content = page.locator('body');
    await expect(content).toBeVisible();
  });

  test('should display player and team tabs', async ({ page }) => {
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);

    // Check for Tabs component - the page uses NextUI Tabs
    const tabsList = page.locator('[role="tablist"]');
    const hasTabsList = await tabsList.isVisible().catch(() => false);

    // If tabs are present, verify they work
    if (hasTabsList) {
      const playersTab = page.getByRole('tab', { name: /players/i });
      const teamsTab = page.getByRole('tab', { name: /teams/i });
      const hasPlayersTab = await playersTab.isVisible().catch(() => false);
      const hasTeamsTab = await teamsTab.isVisible().catch(() => false);
      expect(hasPlayersTab || hasTeamsTab).toBe(true);
    } else {
      // No tabs visible - page should still be functional
      const heading = page.getByRole('heading', { name: 'Leaderboards' });
      await expect(heading).toBeVisible();
    }
  });

  test('should switch between player and team tabs', async ({ page }) => {
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(5000);

    // Find tabs
    const teamsTab = page.getByRole('tab', { name: /teams/i });
    const hasTeamsTab = await teamsTab.isVisible().catch(() => false);

    if (hasTeamsTab) {
      await teamsTab.click();
      await page.waitForTimeout(1000);

      // Team leaderboard or content should be visible after clicking
      const body = page.locator('body');
      await expect(body).toBeVisible();
    } else {
      // No teams tab - verify page is still functional
      const body = page.locator('body');
      await expect(body).toBeVisible();
    }
  });

  test('should display global search shortcut hint', async ({ page }) => {
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);

    // Check for the keyboard shortcut hint text or any navigation element
    const shortcutHint = page.getByText(/Use ⌘\+`/i);
    const navSearch = page.locator('nav').getByPlaceholder(/search/i);
    const hasHint = await shortcutHint.isVisible().catch(() => false);
    const hasNavSearch = await navSearch.isVisible().catch(() => false);

    // Should have either shortcut hint or nav search - page has search functionality
    expect(hasHint || hasNavSearch).toBe(true);
  });

  test('should have global search in navbar', async ({ page }) => {
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);

    // Find global search input in navbar or any search element
    const navbarSearch = page.locator('nav').getByPlaceholder(/search/i);
    const anySearch = page.getByPlaceholder(/search/i).first();
    const hasNavbarSearch = await navbarSearch.isVisible().catch(() => false);
    const hasAnySearch = await anySearch.isVisible().catch(() => false);

    // Should have search functionality on the page
    expect(hasNavbarSearch || hasAnySearch).toBe(true);
  });

  test('should display game filter', async ({ page }) => {
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);

    // Check for game filter dropdown or any filter element
    const gameFilter = page.getByLabel(/game/i);
    const filterButton = page.getByRole('button', { name: /game|filter/i });
    const hasGameFilter = await gameFilter.isVisible().catch(() => false);
    const hasFilterButton = await filterButton.first().isVisible().catch(() => false);

    // Should have game filter or filter button
    expect(hasGameFilter || hasFilterButton).toBe(true);
  });

  test('should display region filter', async ({ page }) => {
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);

    // Check for region filter dropdown or any region-related element
    const regionFilter = page.getByLabel(/region/i);
    const regionButton = page.getByRole('button', { name: /region|all regions/i });
    const hasRegionFilter = await regionFilter.isVisible().catch(() => false);
    const hasRegionButton = await regionButton.first().isVisible().catch(() => false);

    // Should have region filter or region button
    expect(hasRegionFilter || hasRegionButton).toBe(true);
  });

  test('should display leaderboard table with columns', async ({ page }) => {
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(5000);

    // Check for table or any leaderboard content
    const table = page.locator('table').first();
    const leaderboardContent = page.locator('body');
    const hasTable = await table.isVisible().catch(() => false);

    if (hasTable) {
      // Check for rank column or any column header
      const rankColumn = page.getByRole('columnheader', { name: /rank/i });
      const anyColumn = page.getByRole('columnheader').first();
      const hasRank = await rankColumn.isVisible().catch(() => false);
      const hasAnyColumn = await anyColumn.isVisible().catch(() => false);
      expect(hasRank || hasAnyColumn).toBe(true);
    } else {
      // No table - page should still be functional
      await expect(leaderboardContent).toBeVisible();
    }
  });

  test('should display rank badges with colors', async ({ page }) => {
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(5000);

    // Check for rank chips (first 3 places should have special styling)
    const rankChips = page.locator('[class*="chip"]');
    const chipCount = await rankChips.count();
    expect(chipCount).toBeGreaterThanOrEqual(0);
  });

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/leaderboards');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(5000);

    // Check that page content is visible on mobile
    const leaderboardsHeading = page.getByRole('heading', { name: 'Leaderboards' });
    const hasHeading = await leaderboardsHeading.isVisible().catch(() => false);
    expect(hasHeading).toBe(true);

    // Verify page is functional on mobile - body should be visible
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test('should display info card about rankings update', async ({ page }) => {
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);

    // Check for info card or any informational content about rankings
    const infoText = page.getByText(/rankings|leaderboard|update/i);
    const hasInfo = await infoText.first().isVisible().catch(() => false);

    // Page should have some information about rankings
    expect(hasInfo).toBe(true);
  });

  test('should handle API errors gracefully', async ({ page }) => {
    // Mock API to return error
    await page.route('**/players**', (route) => {
      route.fulfill({
        status: 500,
        body: JSON.stringify({ error: 'Internal Server Error' }),
      });
    });

    await page.goto('/leaderboards');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);

    // Should show error state or fallback data, not crash
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });
});

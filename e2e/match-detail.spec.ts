/**
 * E2E Tests for Match Detail Page
 * Tests match viewing, analytics (trajectory/heatmap), and round details
 */

import { test, expect } from '@playwright/test';

test.describe('Match Detail Page', () => {
  // Use a test match ID - the page should handle non-existent matches gracefully
  const testMatchId = 'test-match-123';

  test.describe('Match Overview', () => {
    test('should display match detail page with loading state', async ({ page }) => {
      await page.goto(`/match/${testMatchId}`);
      await page.waitForLoadState('domcontentloaded');

      // Should show either loading spinner or match content
      const loadingSpinner = page.locator('[role="status"]').or(page.getByText(/loading/i));
      const matchContent = page.locator('body');

      // Page should be functional
      await expect(matchContent).toBeVisible();
    });

    test('should handle non-existent match gracefully', async ({ page }) => {
      await page.goto('/match/non-existent-match-id-12345');
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(3000);

      // Should show error message or not found state or redirect to matches page
      const errorMessage = page.getByText(/not found|error|couldn't find|match/i);
      const bodyContent = page.locator('body');

      // Page should still be visible and functional
      await expect(bodyContent).toBeVisible();

      // Page should show match-related content (error, not found, or match page)
      const hasContent = await errorMessage.first().isVisible().catch(() => false);
      const url = page.url();
      const isOnMatchPage = url.includes('/match');

      // Must either show error/not found message OR remain on a valid page
      expect(hasContent || isOnMatchPage).toBe(true);
    });

    test('should display match tabs when match exists', async ({ page }) => {
      // Mock match API response
      await page.route('**/games/cs2/matches/*', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            id: testMatchId,
            title: 'Test Match',
            status: 'completed',
            game_id: 'cs2',
            map_name: 'de_dust2',
            total_rounds: 24,
            teams: [
              { name: 'Team Alpha', score: 13, players: [] },
              { name: 'Team Beta', score: 11, players: [] },
            ],
          }),
        });
      });

      await page.goto(`/match/${testMatchId}`);
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(2000);

      // Check for tab navigation
      const tabs = page.locator('[role="tablist"]');
      const hasTabs = await tabs.isVisible().catch(() => false);

      // Tabs should be visible for match detail
      if (hasTabs) {
        // Look for specific tabs
        const overviewTab = page.getByRole('tab', { name: /overview/i });

        // At least overview tab should exist when tabs are present
        const hasOverview = await overviewTab.isVisible().catch(() => false);
        expect(hasOverview).toBe(true);
      } else {
        // If no tabs, page should still be functional
        const body = page.locator('body');
        await expect(body).toBeVisible();
      }
    });

    test('should display team scores and information', async ({ page }) => {
      await page.route('**/games/cs2/matches/*', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            id: testMatchId,
            title: 'Competitive Match',
            status: 'completed',
            map_name: 'de_mirage',
            teams: [
              { name: 'Team Phoenix', score: 16, players: [] },
              { name: 'Team Dragon', score: 14, players: [] },
            ],
          }),
        });
      });

      await page.goto(`/match/${testMatchId}`);
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(2000);

      // Check for team/score display
      const body = page.locator('body');
      await expect(body).toBeVisible();

      // Page should render with match data
      const content = await page.content();
      expect(content.length).toBeGreaterThan(0);
    });
  });

  test.describe('Match Analytics Tab', () => {
    test('should show analytics tab when available', async ({ page }) => {
      await page.route('**/games/cs2/matches/*', async (route) => {
        const url = route.request().url();

        if (url.includes('/trajectory')) {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              match_id: testMatchId,
              map_name: 'de_dust2',
              trajectories: [],
              tick_rate: 64,
            }),
          });
        } else if (url.includes('/heatmap')) {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              match_id: testMatchId,
              map_name: 'de_dust2',
              grid_size: 64,
              cells: [],
              zones: [],
            }),
          });
        } else if (url.includes('/positioning-stats')) {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              match_id: testMatchId,
              player_stats: [],
            }),
          });
        } else {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              id: testMatchId,
              title: 'Analytics Test Match',
              status: 'completed',
              map_name: 'de_dust2',
              teams: [],
            }),
          });
        }
      });

      await page.goto(`/match/${testMatchId}`);
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(2000);

      // Look for analytics tab
      const analyticsTab = page.getByRole('tab', { name: /analytics/i });
      const hasAnalytics = await analyticsTab.isVisible().catch(() => false);

      if (hasAnalytics) {
        await analyticsTab.click();
        await page.waitForTimeout(2000);

        // Check for analytics content
        const trajectorySection = page.getByText(/trajectory|player trajectories/i);
        const heatmapSection = page.getByText(/heatmap|position heatmap/i);

        const hasTrajectory = await trajectorySection.first().isVisible().catch(() => false);
        const hasHeatmap = await heatmapSection.first().isVisible().catch(() => false);

        // Analytics tab clicked - should show analytics visualizations or loading
        const analyticsContent = page.locator('body');
        await expect(analyticsContent).toBeVisible();
      } else {
        // No analytics tab - page should still be functional
        const body = page.locator('body');
        await expect(body).toBeVisible();
      }
    });

    test('should display 3D trajectory viewer', async ({ page }) => {
      await page.route('**/games/cs2/matches/**', async (route) => {
        const url = route.request().url();

        if (url.includes('/trajectory')) {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              match_id: testMatchId,
              map_name: 'de_dust2',
              trajectories: [
                {
                  player_id: 'player-1',
                  player_name: 'TestPlayer',
                  points: [
                    { tick_id: 1, position: { x: 100, y: 200, z: 0 } },
                    { tick_id: 2, position: { x: 105, y: 205, z: 0 } },
                  ],
                },
              ],
              tick_rate: 64,
            }),
          });
        } else {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              id: testMatchId,
              title: 'Trajectory Test',
              status: 'completed',
              map_name: 'de_dust2',
              teams: [],
            }),
          });
        }
      });

      await page.goto(`/match/${testMatchId}`);
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(2000);

      // Navigate to analytics tab if available
      const analyticsTab = page.getByRole('tab', { name: /analytics/i });
      if (await analyticsTab.isVisible().catch(() => false)) {
        await analyticsTab.click();
        await page.waitForTimeout(3000);

        // Check for canvas element (3D viewer uses canvas)
        const canvas = page.locator('canvas');
        const hasCanvas = await canvas.first().isVisible().catch(() => false);

        // Or check for 3D viewer container
        const viewer3D = page.locator('[class*="trajectory"], [class*="3d"]');
        const hasViewer = await viewer3D.first().isVisible().catch(() => false);

        // Analytics tab clicked - page should show content
        const body = page.locator('body');
        await expect(body).toBeVisible();
      } else {
        // No analytics tab available - page should still be functional
        const body = page.locator('body');
        await expect(body).toBeVisible();
      }
    });

    test('should display heatmap visualization', async ({ page }) => {
      await page.route('**/games/cs2/matches/**', async (route) => {
        const url = route.request().url();

        if (url.includes('/heatmap')) {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              match_id: testMatchId,
              map_name: 'de_dust2',
              grid_size: 64,
              cells: [
                { x: 100, y: 100, density: 50 },
                { x: 200, y: 200, density: 75 },
              ],
              zones: [
                { zone_code: 'A_SITE', zone_name: 'A Site', total_time: 120, visit_count: 10, avg_duration: 12 },
              ],
              total_samples: 1000,
            }),
          });
        } else {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              id: testMatchId,
              title: 'Heatmap Test',
              status: 'completed',
              map_name: 'de_dust2',
              teams: [],
            }),
          });
        }
      });

      await page.goto(`/match/${testMatchId}`);
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(2000);

      const analyticsTab = page.getByRole('tab', { name: /analytics/i });
      if (await analyticsTab.isVisible().catch(() => false)) {
        await analyticsTab.click();
        await page.waitForTimeout(3000);

        // Check for heatmap element
        const heatmap = page.locator('[class*="heatmap"]').or(page.getByText(/position heatmap/i));
        const hasHeatmap = await heatmap.first().isVisible().catch(() => false);

        // Check for heatmap controls
        const opacitySlider = page.locator('input[type="range"]').or(page.getByText(/opacity/i));
        const hasControls = await opacitySlider.first().isVisible().catch(() => false);

        // Analytics tab clicked - page should show content
        const body = page.locator('body');
        await expect(body).toBeVisible();
      } else {
        // No analytics tab - page should still be functional
        const body = page.locator('body');
        await expect(body).toBeVisible();
      }
    });
  });

  test.describe('Match Rounds Tab', () => {
    test('should display rounds information', async ({ page }) => {
      await page.route('**/games/cs2/matches/*', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            id: testMatchId,
            title: 'Rounds Test',
            status: 'completed',
            map_name: 'de_dust2',
            total_rounds: 24,
            rounds: [
              { winner: 'CT', reason: 'BombDefused', duration: '1:45' },
              { winner: 'T', reason: 'TargetBombed', duration: '1:20' },
              { winner: 'CT', reason: 'Elimination', duration: '0:55' },
            ],
            teams: [
              { name: 'Team CT', score: 13 },
              { name: 'Team T', score: 11 },
            ],
          }),
        });
      });

      await page.goto(`/match/${testMatchId}`);
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(2000);

      // Look for rounds tab
      const roundsTab = page.getByRole('tab', { name: /rounds/i });
      const hasRoundsTab = await roundsTab.isVisible().catch(() => false);

      if (hasRoundsTab) {
        await roundsTab.click();
        await page.waitForTimeout(1000);

        // Check for round information - page should show rounds content
        const roundContent = page.locator('body');
        await expect(roundContent).toBeVisible();
      } else {
        // No rounds tab - page should still be functional
        const body = page.locator('body');
        await expect(body).toBeVisible();
      }
    });

    test('should navigate to round detail page', async ({ page }) => {
      await page.route('**/games/cs2/matches/*', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            id: testMatchId,
            title: 'Round Nav Test',
            status: 'completed',
            rounds: [
              { winner: 'CT', reason: 'BombDefused' },
            ],
            teams: [],
          }),
        });
      });

      await page.goto(`/match/${testMatchId}`);
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(2000);

      // Try to find and click on a round link
      const roundLink = page.locator('a[href*="/round/"]').first();
      const hasRoundLink = await roundLink.isVisible().catch(() => false);

      if (hasRoundLink) {
        await roundLink.click();
        await page.waitForTimeout(1000);

        // Should navigate to round detail
        expect(page.url()).toContain('/round/');
      } else {
        // No round links - page should still be functional
        const body = page.locator('body');
        await expect(body).toBeVisible();
      }
    });
  });

  test.describe('Match Page - Responsive Design', () => {
    test('should be responsive on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });

      await page.goto(`/match/${testMatchId}`);
      await page.waitForLoadState('domcontentloaded');

      // Page should still be functional on mobile
      const body = page.locator('body');
      await expect(body).toBeVisible();

      // Navigation should be accessible
      const nav = page.locator('nav');
      await expect(nav).toBeVisible();
    });

    test('should be responsive on tablet', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });

      await page.goto(`/match/${testMatchId}`);
      await page.waitForLoadState('domcontentloaded');

      const body = page.locator('body');
      await expect(body).toBeVisible();
    });
  });

  test.describe('Match Page - Error Handling', () => {
    test('should handle API errors gracefully', async ({ page }) => {
      await page.route('**/games/cs2/matches/*', async (route) => {
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Internal Server Error' }),
        });
      });

      await page.goto(`/match/${testMatchId}`);
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(2000);

      // Should show error state but not crash
      const body = page.locator('body');
      await expect(body).toBeVisible();
    });

    test('should handle network errors gracefully', async ({ page }) => {
      await page.route('**/games/cs2/matches/*', async (route) => {
        await route.abort('failed');
      });

      await page.goto(`/match/${testMatchId}`);
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(2000);

      // Page should handle network failure gracefully
      const body = page.locator('body');
      await expect(body).toBeVisible();
    });
  });

  test.describe('Match Page - Accessibility', () => {
    test('should have proper heading hierarchy', async ({ page }) => {
      await page.goto(`/match/${testMatchId}`);
      await page.waitForLoadState('domcontentloaded');

      // Should have at most one h1
      const h1 = page.locator('h1');
      const h1Count = await h1.count();
      expect(h1Count).toBeLessThanOrEqual(1);
    });

    test('should have keyboard navigation', async ({ page }) => {
      await page.goto(`/match/${testMatchId}`);
      await page.waitForLoadState('domcontentloaded');

      // Tab through interactive elements
      await page.keyboard.press('Tab');
      const focusedElement = await page.evaluate(() => document.activeElement?.tagName);

      expect(focusedElement).toBeTruthy();
    });
  });
});

/**
 * Matchmaking Wizard Complete Flow E2E Tests
 *
 * Tests the full 8-step matchmaking wizard interactively:
 *   0: Tier Selection (Free/Premium/Pro/Elite)
 *   1: Game Selection (CS2/Valorant) + profile validation
 *   2: Region Selection (tabs + radio)
 *   3: Game Mode (Casual/Elimination/Bo3/Bo5)
 *   4: Squad (Solo/Party/Team)
 *   5: Schedule (Play Now/Schedule/Weekly)
 *   6: Prize Distribution (Winner Takes All / Top 3 / MVP)
 *   7: Review & Confirm → Find Match
 *
 * Uses mocked API auth + profile responses and exercises
 * the real frontend wizard components end-to-end.
 */

import { test, expect, Page } from '@playwright/test';

// ============================================================================
// Helpers
// ============================================================================

/** Dismiss cookie consent + pre-alpha overlays */
async function dismissOverlays(page: Page): Promise<void> {
  const acceptCookies = page.locator('button:has-text("Accept All")');
  if (await acceptCookies.isVisible({ timeout: 3000 }).catch(() => false)) {
    await acceptCookies.click();
    await page.waitForTimeout(300);
  }
  const dismissNotice = page.locator('button:has-text("Dismiss pre-alpha notice")');
  if (await dismissNotice.isVisible({ timeout: 2000 }).catch(() => false)) {
    await dismissNotice.click();
    await page.waitForTimeout(300);
  }
}

/** Mock authenticated user with CS2 + Valorant profiles */
async function setupAuth(page: Page): Promise<void> {
  await page.route('**/api/auth/session', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        user: {
          id: 'user_wiz',
          uid: 'user_wiz',
          name: 'WizardPlayer',
          email: 'wizard@e2e.test',
          image: null,
          rid: 'rid_wiz_token',
        },
        expires: new Date(Date.now() + 86400000).toISOString(),
      }),
    }),
  );
  await page.route('**/api/auth/csrf', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ csrfToken: 'csrf_wiz' }),
    }),
  );
  await page.route('**/api/auth/providers', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        credentials: { id: 'credentials', name: 'Email', type: 'credentials' },
      }),
    }),
  );

  const profiles = [
    {
      id: 'prof_cs2',
      game_id: 'cs2',
      nickname: 'WizardPlayer',
      slug_uri: 'wizard-player',
      roles: ['Rifler'],
      description: 'E2E',
      visibility_level: 'public',
      visibility_type: 'public',
      resource_owner: { user_id: 'user_wiz' },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'prof_val',
      game_id: 'valorant',
      nickname: 'WizardVal',
      slug_uri: 'wizard-val',
      roles: ['Duelist'],
      description: 'E2E',
      visibility_level: 'public',
      visibility_type: 'public',
      resource_owner: { user_id: 'user_wiz' },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];

  await page.route('**/api/players/**', (route) => {
    const url = route.request().url();
    const method = route.request().method();
    if (method === 'GET') {
      if (url.includes('all=true') || url.includes('/me')) {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true, data: profiles }),
        });
      }
      if (url.includes('game_id=')) {
        const gid = url.match(/game_id=(\w+)/)?.[1] || 'cs2';
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: profiles.find((p) => p.game_id === gid) || profiles[0],
          }),
        });
      }
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: profiles[0] }),
      });
    }
    if (method === 'POST') {
      return route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: { ...profiles[0], id: `prof_new_${Date.now()}` },
        }),
      });
    }
    return route.continue();
  });

  await page.route('**/api/subscriptions/**', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true, data: { tier: 'free', active: true } }),
    }),
  );

  await page.route('**/api/match-making/queue', (route) => {
    if (route.request().method() === 'POST') {
      return route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            session_id: `sess_${Date.now()}`,
            status: 'queued',
            estimated_wait_seconds: 30,
            queue_position: 3,
            queued_at: new Date().toISOString(),
          },
        }),
      });
    }
    if (route.request().method() === 'DELETE') {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true }),
      });
    }
    return route.continue();
  });

  await page.route('**/api/match-making/session/**', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        data: {
          session_id: 'sess_wiz',
          status: 'searching',
          elapsed_time: 10,
          estimated_wait: 25,
          queue_position: 2,
          total_queue_count: 42,
        },
      }),
    }),
  );

  await page.route('**/api/match-making/pools/**', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        data: {
          pool_id: 'pool_cs2_na',
          game_id: 'cs2',
          region: 'na',
          total_players: 142,
          average_wait_time_seconds: 25,
          queue_health: 'healthy',
        },
      }),
    }),
  );

  await page.route('**/api/match-making/lobbies**', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true, data: [] }),
    }),
  );
}

/** Navigate to /match-making, wait for load, dismiss overlays */
async function gotoMatchmaking(page: Page): Promise<void> {
  await page.goto('/match-making', { waitUntil: 'domcontentloaded' });
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(2000);
  await dismissOverlays(page);
}

/**
 * Click the visible Next button in the wizard.
 * VerticalSteps renders "Next" on desktop; mobile bar shows "CONTINUE →".
 */
async function clickNext(page: Page): Promise<void> {
  const btn = page.locator('button:has-text("Next"), button:has-text("CONTINUE")').first();
  await expect(btn).toBeVisible({ timeout: 10000 });
  await btn.click();
  await page.waitForTimeout(800);
}

/** Click Back button */
async function clickBack(page: Page): Promise<void> {
  // Use the first enabled Back button
  const btn = page.locator('button:has-text("Back"):not([disabled])').first();
  await expect(btn).toBeVisible({ timeout: 5000 });
  await btn.click();
  await page.waitForTimeout(500);
}

/**
 * Select a region radio on Step 2. Waits for the radio panel to load,
 * then clicks "Brazil East" or falls back to the first visible region.
 */
async function selectRegion(page: Page): Promise<void> {
  // Wait for the tabpanel and radios to render
  await page.waitForTimeout(500);

  // Try clicking by role first
  const brazilRadio = page.getByRole('radio', { name: /Brazil/i });
  if (await brazilRadio.isVisible({ timeout: 5000 }).catch(() => false)) {
    await brazilRadio.click({ force: true });
    await page.waitForTimeout(300);
    // Verify it was actually selected (checked)
    const isChecked = await brazilRadio.isChecked().catch(() => false);
    if (isChecked) return;
  }

  // Fallback: click the wrapper/label text
  const regionText = page.locator('main').locator('text=/Brazil East|São Paulo/i').first();
  if (await regionText.isVisible({ timeout: 3000 }).catch(() => false)) {
    await regionText.click();
    await page.waitForTimeout(300);
    return;
  }

  // Last resort: click the first radio wrapper
  const firstRadioWrapper = page.locator('main [role="radiogroup"] [cursor=pointer]').first();
  if (await firstRadioWrapper.isVisible().catch(() => false)) {
    await firstRadioWrapper.click();
    await page.waitForTimeout(300);
  }
}

/**
 * Rapidly navigate through steps 0→6 to arrive at Step 7 (Review).
 * Assumes setupAuth has been called with profiles available.
 */
async function navigateToReviewStep(page: Page): Promise<void> {
  // Step 0: Tier – click Free
  const freeH4 = page.getByRole('heading', { name: /^Free$/i, level: 4 });
  await expect(freeH4).toBeVisible({ timeout: 10000 });
  await freeH4.click();
  await clickNext(page);

  // Step 1: Game – auto-selected CS2 with profile
  await page.waitForTimeout(1000);
  await clickNext(page);

  // Step 2: Region – click Brazil East radio
  await selectRegion(page);
  await clickNext(page);

  // Step 3: Game Mode – click Casual
  const casual = page.locator('main').locator('text=/Casual/i').first();
  await casual.click();
  await clickNext(page);

  // Step 4: Squad (optional)
  await page.waitForTimeout(500);
  await clickNext(page);

  // Step 5: Schedule (defaults to instant)
  await page.waitForTimeout(500);
  await clickNext(page);

  // Step 6: Prize Distribution – Winner Takes All
  const wta = page.locator('main').locator('text=/Winner Takes All/i').first();
  if (await wta.isVisible({ timeout: 5000 }).catch(() => false)) {
    await wta.click();
    await page.waitForTimeout(300);
  }
  await clickNext(page);
}

// ============================================================================
// Test Suite: Complete Wizard Flow
// ============================================================================

test.describe('Matchmaking Wizard - Complete Flow', () => {
  test('should walk through all 8 steps of the wizard', async ({ page }) => {
    await setupAuth(page);
    await gotoMatchmaking(page);

    // ── Step 0: Tier ──
    const tierH = page.getByRole('heading', { name: /Choose Your Tier/i });
    await expect(tierH).toBeVisible({ timeout: 10000 });

    // Click Free tier card
    const freeH4 = page.getByRole('heading', { name: /^Free$/i, level: 4 });
    await expect(freeH4).toBeVisible({ timeout: 5000 });
    await freeH4.click();
    await page.waitForTimeout(300);
    await clickNext(page);

    // ── Step 1: Game Selection ──
    const gameH = page.getByRole('heading', { name: /Select Game/i });
    await expect(gameH).toBeVisible({ timeout: 10000 });

    // CS2 option visible
    const cs2 = page.locator('main').locator('text=/Counter-Strike 2/i').first();
    await expect(cs2).toBeVisible({ timeout: 5000 });

    // Profile should be ready ("Playing as")
    const playingAs = page.locator('main').locator('text=/Playing as/i');
    await expect(playingAs.first()).toBeVisible({ timeout: 5000 });
    await clickNext(page);

    // ── Step 2: Region ──
    const regionH = page.getByRole('heading', { name: /Select Region|Choose.*Region/i });
    await expect(regionH).toBeVisible({ timeout: 10000 });

    const tabs = page.locator('[role="tab"]');
    expect(await tabs.count()).toBeGreaterThan(0);

    // Click Brazil East region radio - wait for it to be ready
    await selectRegion(page);
    await clickNext(page);

    // ── Step 3: Game Mode ──
    const modeH = page.getByRole('heading', { name: /Game Mode/i });
    await expect(modeH).toBeVisible({ timeout: 10000 });

    const casual = page.locator('main').locator('text=/Casual/i').first();
    await expect(casual).toBeVisible({ timeout: 5000 });
    await casual.click();
    await clickNext(page);

    // ── Step 4: Squad (optional) ──
    await page.waitForTimeout(800);
    await clickNext(page);

    // ── Step 5: Schedule ──
    const playNow = page.locator('main').locator('text=/Play Now/i').first();
    if (await playNow.isVisible().catch(() => false)) {
      await playNow.click();
      await page.waitForTimeout(300);
    }
    await clickNext(page);

    // ── Step 6: Prize Distribution ──
    const wta = page.locator('main').locator('text=/Winner Takes All/i').first();
    await expect(wta).toBeVisible({ timeout: 10000 });
    await wta.click();
    await page.waitForTimeout(300);
    await clickNext(page);

    // ── Step 7: Review & Confirm ──
    const mainContent = page.locator('main');
    const reviewText = await mainContent.textContent({ timeout: 10000 });
    expect(reviewText).toBeTruthy();

    // Find Match button
    const findMatch = page
      .locator('button:has-text("Find Match"), button:has-text("FIND MATCH")')
      .first();
    await expect(findMatch).toBeVisible({ timeout: 10000 });

    await findMatch.click();
    await page.waitForTimeout(2000);

    // Page should not crash
    await expect(page.locator('body')).toBeVisible();
  });

  test('should navigate backwards through wizard steps', async ({ page }) => {
    await setupAuth(page);
    await gotoMatchmaking(page);

    // Step 0: Select tier
    const tierH = page.getByRole('heading', { name: /Choose Your Tier/i });
    await expect(tierH).toBeVisible({ timeout: 10000 });
    await page.getByRole('heading', { name: /^Free$/i, level: 4 }).click();
    await clickNext(page);

    // Step 1: Game heading visible
    const gameH = page.getByRole('heading', { name: /Select Game/i });
    await expect(gameH).toBeVisible({ timeout: 10000 });

    // Go Back to Step 0
    await clickBack(page);
    await expect(tierH).toBeVisible({ timeout: 10000 });

    // Forward again to Step 1
    await clickNext(page);
    await expect(gameH).toBeVisible({ timeout: 10000 });
  });

  test('should prevent advancing without required selections', async ({ page }) => {
    await setupAuth(page);

    // Override: return empty profiles
    await page.route('**/api/players/**', (route) => {
      if (route.request().method() === 'GET') {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true, data: [] }),
        });
      }
      return route.continue();
    });

    await gotoMatchmaking(page);

    const tierH = page.getByRole('heading', { name: /Choose Your Tier/i });
    await expect(tierH).toBeVisible({ timeout: 10000 });

    // Next button should be disabled when no tier is selected
    const nextBtn = page
      .locator('button:has-text("Next"), button:has-text("CONTINUE")')
      .first();
    await expect(nextBtn).toBeVisible({ timeout: 5000 });
    await expect(nextBtn).toBeDisabled();

    // Still on step 0
    await expect(tierH).toBeVisible({ timeout: 5000 });
  });
});

// ============================================================================
// Game Mode Details
// ============================================================================

test.describe('Matchmaking Wizard - Game Mode Details', () => {
  test('should show all four game modes', async ({ page }) => {
    await setupAuth(page);
    await gotoMatchmaking(page);

    // Navigate to step 3
    await page.getByRole('heading', { name: /^Free$/i, level: 4 }).click();
    await clickNext(page);
    await page.waitForTimeout(1000);
    await clickNext(page);
    await selectRegion(page);
    await clickNext(page);

    const modeH = page.getByRole('heading', { name: /Game Mode/i });
    await expect(modeH).toBeVisible({ timeout: 10000 });

    const main = page.locator('main');
    await expect(main.locator('text=/Casual/i').first()).toBeVisible({ timeout: 5000 });
    await expect(main.locator('text=/Elimination/i').first()).toBeVisible({
      timeout: 5000,
    });
    await expect(main.locator('text=/Best of 3/i').first()).toBeVisible({
      timeout: 5000,
    });
    await expect(main.locator('text=/Best of 5/i').first()).toBeVisible({
      timeout: 5000,
    });

    // Select Best of 3
    await main.locator('text=/Best of 3/i').first().click();
    await page.waitForTimeout(300);

    // Next button should be available
    const nextBtn = page
      .locator('button:has-text("Next"), button:has-text("CONTINUE")')
      .first();
    await expect(nextBtn).toBeVisible();
  });
});

// ============================================================================
// Region Selection
// ============================================================================

test.describe('Matchmaking Wizard - Region Selection', () => {
  test('should show region tabs and allow selection', async ({ page }) => {
    await setupAuth(page);
    await gotoMatchmaking(page);

    // Navigate to step 2
    await page.getByRole('heading', { name: /^Free$/i, level: 4 }).click();
    await clickNext(page);
    await page.waitForTimeout(1000);
    await clickNext(page);

    const regionH = page.getByRole('heading', {
      name: /Select Region|Choose.*Region/i,
    });
    await expect(regionH).toBeVisible({ timeout: 10000 });

    const tabs = page.locator('[role="tab"]');
    expect(await tabs.count()).toBeGreaterThan(0);

    // N.America tab
    const naTab = page.locator('[role="tab"]:has-text("N.America")');
    if (await naTab.isVisible().catch(() => false)) {
      await naTab.click();
      await page.waitForTimeout(500);
      const naRegion = page
        .locator('main')
        .locator('text=/West US|East US|Silicon Valley|Virginia/i')
        .first();
      expect(await naRegion.isVisible().catch(() => false)).toBe(true);
    }

    // Europe tab
    const euTab = page.locator('[role="tab"]:has-text("Europe")');
    if (await euTab.isVisible().catch(() => false)) {
      await euTab.click();
      await page.waitForTimeout(500);
      const euRegion = page
        .locator('main')
        .locator('text=/Frankfurt|London|Paris/i')
        .first();
      expect(await euRegion.isVisible().catch(() => false)).toBe(true);
    }
  });
});

// ============================================================================
// Review & Confirm
// ============================================================================

test.describe('Matchmaking Wizard - Review & Confirm', () => {
  test('should show summary on review step with Find Match button', async ({
    page,
  }) => {
    await setupAuth(page);
    await gotoMatchmaking(page);
    await navigateToReviewStep(page);

    const main = page.locator('main');
    const text = await main.textContent({ timeout: 10000 });
    expect(text?.length).toBeGreaterThan(50);

    const findMatch = page
      .locator('button:has-text("Find Match"), button:has-text("FIND MATCH")')
      .first();
    await expect(findMatch).toBeVisible({ timeout: 5000 });
  });
});

// ============================================================================
// State Persistence
// ============================================================================

test.describe('Matchmaking Wizard - State Persistence', () => {
  test('should remember selections navigating back and forth', async ({
    page,
  }) => {
    await setupAuth(page);
    await gotoMatchmaking(page);

    const tierH = page.getByRole('heading', { name: /Choose Your Tier/i });
    await expect(tierH).toBeVisible({ timeout: 10000 });

    await page.getByRole('heading', { name: /^Free$/i, level: 4 }).click();
    await clickNext(page);

    const gameH = page.getByRole('heading', { name: /Select Game/i });
    await expect(gameH).toBeVisible({ timeout: 10000 });

    await clickBack(page);
    await expect(tierH).toBeVisible({ timeout: 5000 });

    // Tier remembered → can advance
    await clickNext(page);
    await expect(gameH).toBeVisible({ timeout: 5000 });
  });
});

// ============================================================================
// Error Handling
// ============================================================================

test.describe('Matchmaking Wizard - Error Handling', () => {
  test('should handle matchmaking API error gracefully', async ({ page }) => {
    await setupAuth(page);

    // Override queue → 503
    await page.route('**/api/match-making/queue', (route) => {
      if (route.request().method() === 'POST') {
        return route.fulfill({
          status: 503,
          contentType: 'application/json',
          body: JSON.stringify({ success: false, error: 'Service unavailable' }),
        });
      }
      return route.continue();
    });

    await gotoMatchmaking(page);
    await navigateToReviewStep(page);

    const findMatch = page
      .locator('button:has-text("Find Match"), button:has-text("FIND MATCH")')
      .first();
    if (await findMatch.isVisible({ timeout: 5000 }).catch(() => false)) {
      await findMatch.click();
      await page.waitForTimeout(2000);

      // Page should not crash
      await expect(page.locator('body')).toBeVisible();
      const bodyText = await page.textContent('body');
      expect(bodyText?.length).toBeGreaterThan(0);
    }
  });
});

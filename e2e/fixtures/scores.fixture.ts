/**
 * Scores / Match Results Fixtures for E2E Tests
 * Provides mock data and API responses for scores domain tests
 */

import { test as base, Page } from '@playwright/test';

// --- Test Data ---

const NOW = new Date().toISOString();
const ONE_HOUR_AGO = new Date(Date.now() - 3600_000).toISOString();

export const TEST_TEAM_RESULTS = [
  {
    team_id: 'team_alpha_001',
    team_name: 'Team Alpha',
    score: 16,
    position: 1,
    players: ['player_001', 'player_002', 'player_003', 'player_004', 'player_005'],
  },
  {
    team_id: 'team_bravo_001',
    team_name: 'Team Bravo',
    score: 12,
    position: 2,
    players: ['player_006', 'player_007', 'player_008', 'player_009', 'player_010'],
  },
];

export const TEST_PLAYER_RESULTS = [
  {
    player_id: 'player_001',
    team_id: 'team_alpha_001',
    score: 32,
    kills: 28,
    deaths: 14,
    assists: 6,
    rating: 1.42,
    is_mvp: true,
    stats: {},
  },
  {
    player_id: 'player_002',
    team_id: 'team_alpha_001',
    score: 24,
    kills: 20,
    deaths: 16,
    assists: 8,
    rating: 1.15,
    is_mvp: false,
    stats: {},
  },
  {
    player_id: 'player_006',
    team_id: 'team_bravo_001',
    score: 26,
    kills: 22,
    deaths: 18,
    assists: 5,
    rating: 1.08,
    is_mvp: false,
    stats: {},
  },
];

export const TEST_MATCH_RESULT_SUBMITTED = {
  id: 'result_e2e_submitted_001',
  match_id: 'match_e2e_001',
  tournament_id: 'tournament_e2e_001',
  game_id: 'cs2',
  map_name: 'de_dust2',
  mode: '5v5',
  source: 'tournament_admin',
  submitted_by: 'user_e2e_test_001',
  team_results: TEST_TEAM_RESULTS,
  player_results: TEST_PLAYER_RESULTS,
  winner_team_id: 'team_alpha_001',
  is_draw: false,
  rounds_played: 28,
  status: 'submitted',
  dispute_count: 0,
  played_at: ONE_HOUR_AGO,
  duration: 2400,
  created_at: NOW,
  updated_at: NOW,
};

export const TEST_MATCH_RESULT_VERIFIED = {
  ...TEST_MATCH_RESULT_SUBMITTED,
  id: 'result_e2e_verified_001',
  status: 'verified',
  verification_method: 'manual',
  verified_at: NOW,
  verified_by: 'admin_e2e_001',
};

export const TEST_MATCH_RESULT_DISPUTED = {
  ...TEST_MATCH_RESULT_SUBMITTED,
  id: 'result_e2e_disputed_001',
  status: 'disputed',
  dispute_reason: 'Score recording error - round 15 was incorrectly counted',
  disputed_at: NOW,
  disputed_by: 'player_006',
  dispute_count: 1,
};

export const TEST_MATCH_RESULT_FINALIZED = {
  ...TEST_MATCH_RESULT_VERIFIED,
  id: 'result_e2e_finalized_001',
  status: 'finalized',
  finalized_at: NOW,
  prize_distribution_id: 'prize_dist_001',
};

export const TEST_MATCH_RESULT_CONCILIATED = {
  ...TEST_MATCH_RESULT_DISPUTED,
  id: 'result_e2e_conciliated_001',
  status: 'conciliated',
  conciliation_notes: 'Reviewed replay footage, scores confirmed correct',
  conciliated_at: NOW,
  conciliated_by: 'admin_e2e_001',
};

export const TEST_MATCH_RESULT_CANCELLED = {
  ...TEST_MATCH_RESULT_SUBMITTED,
  id: 'result_e2e_cancelled_001',
  status: 'cancelled',
  cancelled_by: 'admin_e2e_001',
  cancelled_at: NOW,
  cancel_reason: 'Confirmed use of unauthorized software',
};

export const TEST_MATCH_RESULTS_LIST = {
  match_results: [
    TEST_MATCH_RESULT_SUBMITTED,
    TEST_MATCH_RESULT_VERIFIED,
    TEST_MATCH_RESULT_DISPUTED,
    TEST_MATCH_RESULT_CONCILIATED,
    TEST_MATCH_RESULT_FINALIZED,
  ],
  total: 5,
  limit: 20,
  offset: 0,
};

// --- Mock API ---

/**
 * Mock all scores API endpoints
 */
export const mockScoresApi = async (page: Page, overrides?: {
  listResponse?: unknown;
  detailResult?: unknown;
}) => {
  // Mock list endpoint
  await page.route('**/api/scores/match-results', async (route) => {
    const method = route.request().method();

    if (method === 'POST') {
      const body = JSON.parse(route.request().postData() || '{}');
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            ...TEST_MATCH_RESULT_SUBMITTED,
            id: 'result_' + Date.now(),
            match_id: body.match_id || 'match_new',
            team_results: body.team_results || TEST_TEAM_RESULTS,
          },
        }),
      });
    } else if (method === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: overrides?.listResponse || TEST_MATCH_RESULTS_LIST,
        }),
      });
    } else {
      await route.continue();
    }
  });

  // Mock detail endpoint
  await page.route('**/api/scores/match-results/*/verify', async (route) => {
    const url = route.request().url();
    const idMatch = url.match(/match-results\/([^/]+)\/verify/);
    const resultId = idMatch?.[1] || 'unknown';

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        data: {
          ...(overrides?.detailResult || TEST_MATCH_RESULT_SUBMITTED),
          id: resultId,
          status: 'verified',
          verified_at: new Date().toISOString(),
          verification_method: 'manual',
        },
      }),
    });
  });

  // Mock dispute endpoint
  await page.route('**/api/scores/match-results/*/dispute', async (route) => {
    const body = JSON.parse(route.request().postData() || '{}');
    const url = route.request().url();
    const idMatch = url.match(/match-results\/([^/]+)\/dispute/);
    const resultId = idMatch?.[1] || 'unknown';

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        data: {
          ...(overrides?.detailResult || TEST_MATCH_RESULT_SUBMITTED),
          id: resultId,
          status: 'disputed',
          dispute_reason: body.reason || 'Disputed via e2e test',
          disputed_at: new Date().toISOString(),
          dispute_count: 1,
        },
      }),
    });
  });

  // Mock finalize endpoint
  await page.route('**/api/scores/match-results/*/finalize', async (route) => {
    const url = route.request().url();
    const idMatch = url.match(/match-results\/([^/]+)\/finalize/);
    const resultId = idMatch?.[1] || 'unknown';

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        data: {
          ...(overrides?.detailResult || TEST_MATCH_RESULT_VERIFIED),
          id: resultId,
          status: 'finalized',
          finalized_at: new Date().toISOString(),
        },
      }),
    });
  });

  // Mock cancel endpoint
  await page.route('**/api/scores/match-results/*/cancel', async (route) => {
    const url = route.request().url();
    const idMatch = url.match(/match-results\/([^/]+)\/cancel/);
    const resultId = idMatch?.[1] || 'unknown';

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        data: {
          ...(overrides?.detailResult || TEST_MATCH_RESULT_SUBMITTED),
          id: resultId,
          status: 'cancelled',
        },
      }),
    });
  });

  // Mock conciliate endpoint
  await page.route('**/api/scores/match-results/*/conciliate', async (route) => {
    const body = JSON.parse(route.request().postData() || '{}');
    const url = route.request().url();
    const idMatch = url.match(/match-results\/([^/]+)\/conciliate/);
    const resultId = idMatch?.[1] || 'unknown';

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        data: {
          ...(overrides?.detailResult || TEST_MATCH_RESULT_DISPUTED),
          id: resultId,
          status: 'conciliated',
          conciliation_notes: body.notes || 'Conciliated via e2e test',
          conciliated_at: new Date().toISOString(),
        },
      }),
    });
  });

  // Mock individual result detail (must come AFTER action routes to not override them)
  await page.route(/\/api\/scores\/match-results\/[^/]+$/, async (route) => {
    const url = route.request().url();
    const idMatch = url.match(/match-results\/([^/]+)$/);
    const resultId = idMatch?.[1] || 'unknown';

    const method = route.request().method();
    if (method === 'GET') {
      // Find the right result based on ID prefix, or use default
      let resultData = overrides?.detailResult || TEST_MATCH_RESULT_SUBMITTED;
      if (resultId.includes('verified')) resultData = TEST_MATCH_RESULT_VERIFIED;
      else if (resultId.includes('conciliated')) resultData = TEST_MATCH_RESULT_CONCILIATED;
      else if (resultId.includes('disputed')) resultData = TEST_MATCH_RESULT_DISPUTED;
      else if (resultId.includes('finalized')) resultData = TEST_MATCH_RESULT_FINALIZED;
      else if (resultId.includes('cancelled')) resultData = TEST_MATCH_RESULT_CANCELLED;

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: { ...(resultData as Record<string, unknown>), id: resultId },
        }),
      });
    } else {
      await route.continue();
    }
  });

  // Mock by-match endpoint
  await page.route('**/api/scores/match-results/by-match/*', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        data: TEST_MATCH_RESULT_SUBMITTED,
      }),
    });
  });
};

// --- Mock Auth Helper ---

const mockAuthSession = async (page: Page) => {
  await page.route('**/api/auth/session', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        user: {
          id: 'user_e2e_test_001',
          uid: 'user_e2e_test_001',
          name: 'E2E Test Player',
          email: 'e2e.test@leetgaming.gg',
          image: null,
          rid: 'e2e_rid_token_mock',
        },
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      }),
    });
  });

  await page.route('**/api/auth/csrf', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ csrfToken: 'e2e_csrf_token_mock' }),
    });
  });

  await page.route('**/api/auth/providers', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        credentials: { id: 'credentials', name: 'Email', type: 'credentials' },
        google: { id: 'google', name: 'Google', type: 'oauth' },
      }),
    });
  });
};

// --- Test Fixtures ---

/**
 * Scores test with mocked API (unauthenticated)
 */
export const scoresTest = base.extend<{ scoresPage: Page }>({
  scoresPage: async ({ page }, use) => {
    await mockScoresApi(page);
    await use(page);
  },
});

/**
 * Scores test with mocked API + authenticated session
 */
export const authenticatedScoresTest = base.extend<{ scoresPage: Page }>({
  scoresPage: async ({ page }, use) => {
    await mockAuthSession(page);
    await mockScoresApi(page);
    await use(page);
  },
});

export { base as test };

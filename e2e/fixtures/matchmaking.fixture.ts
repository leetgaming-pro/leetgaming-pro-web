/**
 * Matchmaking Fixtures for E2E Tests
 * Provides mock data and API responses for matchmaking tests
 */

import { test as base, Page } from '@playwright/test';
import { MatchmakingPage, LobbyStatus, GameMode, Region } from '../page-objects/matchmaking.page';

/**
 * Test lobby data
 */
export const TEST_LOBBY = {
  id: 'lobby_e2e_test_001',
  game_id: 'cs2',
  game_mode: 'competitive' as GameMode,
  region: 'na' as Region,
  status: 'waiting_for_players' as LobbyStatus,
  max_players: 10,
  min_players: 2,
  created_by: 'user_e2e_test_001',
  players: [
    {
      user_id: 'user_e2e_test_001',
      display_name: 'E2E Test Player',
      is_ready: false,
      joined_at: new Date().toISOString(),
    },
  ],
  entry_fee: 0,
  prize_pool: 0,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

/**
 * Test queue session
 */
export const TEST_QUEUE_SESSION = {
  session_id: 'queue_e2e_test_001',
  user_id: 'user_e2e_test_001',
  status: 'searching',
  game_id: 'cs2',
  game_mode: 'competitive',
  region: 'na',
  queue_position: 1,
  estimated_wait_seconds: 30,
  created_at: new Date().toISOString(),
};

/**
 * Test pool stats
 */
export const TEST_POOL_STATS = {
  game_id: 'cs2',
  game_mode: 'competitive',
  region: 'na',
  players_in_queue: 42,
  average_wait_time: 25,
  active_lobbies: 8,
  matches_today: 156,
};

/**
 * Mock matchmaking API responses
 */
export const mockMatchmakingApi = async (page: Page) => {
  // Mock lobby creation
  await page.route('**/api/match-making/lobbies', async (route) => {
    const method = route.request().method();

    if (method === 'POST') {
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            ...TEST_LOBBY,
            id: 'lobby_' + Date.now(),
          },
        }),
      });
    } else if (method === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: [TEST_LOBBY],
          pagination: {
            total: 1,
            page: 1,
            limit: 10,
          },
        }),
      });
    } else {
      await route.continue();
    }
  });

  // Mock lobby details
  await page.route('**/api/match-making/lobbies/*', async (route) => {
    const method = route.request().method();
    const url = route.request().url();

    if (url.includes('/join')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            ...TEST_LOBBY,
            players: [
              ...TEST_LOBBY.players,
              {
                user_id: 'user_joining',
                display_name: 'Joining Player',
                is_ready: false,
                joined_at: new Date().toISOString(),
              },
            ],
          },
        }),
      });
    } else if (url.includes('/leave')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          message: 'Left lobby successfully',
        }),
      });
    } else if (url.includes('/ready')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            ...TEST_LOBBY,
            players: TEST_LOBBY.players.map((p) => ({
              ...p,
              is_ready: true,
            })),
          },
        }),
      });
    } else if (url.includes('/start')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            ...TEST_LOBBY,
            status: 'starting',
          },
        }),
      });
    } else if (method === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: TEST_LOBBY,
        }),
      });
    } else {
      await route.continue();
    }
  });

  // Mock queue
  await page.route('**/api/match-making/queue', async (route) => {
    const method = route.request().method();

    if (method === 'POST') {
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            ...TEST_QUEUE_SESSION,
            session_id: 'queue_' + Date.now(),
          },
        }),
      });
    } else if (method === 'DELETE') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          message: 'Left queue successfully',
        }),
      });
    } else {
      await route.continue();
    }
  });

  // Mock queue session status
  await page.route('**/api/match-making/queue/*', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        data: TEST_QUEUE_SESSION,
      }),
    });
  });

  // Mock pool stats
  await page.route('**/api/match-making/pools/*/stats', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        data: TEST_POOL_STATS,
      }),
    });
  });

  // Mock prize pools
  await page.route('**/api/match-making/prize-pools**', async (route) => {
    const method = route.request().method();

    if (method === 'POST') {
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            pool_id: 'pool_' + Date.now(),
            total_amount: 100,
            currency: 'USD',
            status: 'pending',
          },
        }),
      });
    } else {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: [],
        }),
      });
    }
  });
};

/**
 * Extended test with mocked matchmaking API
 */
export const matchmakingTest = base.extend<{
  matchmakingPage: MatchmakingPage;
}>({
  matchmakingPage: async ({ page }, use) => {
    // Setup mock API
    await mockMatchmakingApi(page);

    // Create page object
    const matchmakingPage = new MatchmakingPage(page);

    await use(matchmakingPage);
  },
});

/**
 * Test with authenticated user and mocked matchmaking
 */
export const authenticatedMatchmakingTest = base.extend<{
  matchmakingPage: MatchmakingPage;
}>({
  matchmakingPage: async ({ page }, use) => {
    // Mock auth session
    await page.route('**/api/auth/session', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          user: {
            id: 'user_e2e_test_001',
            name: 'E2E Test Player',
            email: 'e2e.test@leetgaming.gg',
            image: null,
          },
          expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        }),
      });
    });

    // Setup mock matchmaking API
    await mockMatchmakingApi(page);

    // Create page object
    const matchmakingPage = new MatchmakingPage(page);

    await use(matchmakingPage);
  },
});

export { base as test };

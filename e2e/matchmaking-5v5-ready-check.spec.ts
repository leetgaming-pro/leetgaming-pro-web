import { execFileSync } from 'node:child_process';
import { test, expect, type Browser, type BrowserContext, type Page } from '@playwright/test';
import {
  getMatchmakingUser,
  performRealLogin,
  waitForRIDSync,
} from './fixtures/real-auth.fixture';

test.describe.configure({ mode: 'serial' });

test.setTimeout(240000);

const MATCH_REQUEST = {
  game_id: 'cs2',
  game_mode: 'competitive',
  region: 'sa-east',
  tier: 'free',
  player_mmr: 1500,
  team_format: '5v5',
  max_ping: 120,
  priority_boost: false,
};

type JsonResponse<T> = {
  status: number;
  ok: boolean;
  body: T;
};

type QueueJoinEnvelope = {
  success: boolean;
  data?: {
    session_id: string;
    status: string;
    estimated_wait_seconds: number;
    queue_position: number;
    queued_at: string;
  };
  error?: string;
};

type SessionEnvelope = {
  success: boolean;
  data?: {
    session_id: string;
    status: string;
    lobby_id?: string;
    match_id?: string;
    ready_check?: {
      lobby_id: string;
      players: Array<{
        player_id: string;
        status: string;
      }>;
    };
  };
  error?: string;
};

type CommitmentEnvelope = {
  success: boolean;
  data?: {
    lobby_id: string;
    total_players: number;
    confirmed_count: number;
    pending_count: number;
    declined_count: number;
    expired_count: number;
    all_confirmed: boolean;
    has_declined_or_expired: boolean;
    commitments: Array<{
      player_id: string;
      status: string;
      expires_at: string;
    }>;
  };
};

type ConfirmEnvelope = {
  success: boolean;
  data?: {
    all_ready: boolean;
    summary: CommitmentEnvelope['data'];
  };
};

type ConnectionInfoEnvelope = {
  success: boolean;
  data?: {
    lobby_id: string;
    match_id: string;
    game_id: string;
    region: string;
    server_url?: string;
    server_ip?: string;
    port?: number;
    passcode?: string;
    qr_code_data?: string;
    deep_link?: string;
    instructions: string;
    expires_at?: string;
  };
};

type NotificationsEnvelope = {
  success: boolean;
  data: Array<unknown>;
  unreadCount: number;
};

type AuthenticatedUser = {
  page: Page;
  context: BrowserContext;
  userId: string;
  email: string;
  displayName: string;
};

function resetMatchmakingState(): void {
  execFileSync(
    'kubectl',
    [
      'exec',
      '-n',
      'leetgaming',
      'mongodb-0',
      '--',
      'mongosh',
      '-u',
      'admin',
      '-p',
      'dev-mongo-password-change-me',
      '--authenticationDatabase',
      'admin',
      '--quiet',
      '--eval',
      'db=db.getSiblingDB("leetgaming"); db.matchmaking_sessions.deleteMany({}); db.billable_entries.deleteMany({ operation_id: { $in: ["JoinMatchmakingQueue", "MatchMakingPriorityQueue"] } });',
    ],
    { stdio: 'pipe' },
  );
}

async function fetchJson<T>(
  page: Page,
  url: string,
  options?: {
    method?: string;
    body?: unknown;
  },
): Promise<JsonResponse<T>> {
  return page.evaluate(
    async ({ inputUrl, method, body }) => {
      const response = await fetch(inputUrl, {
        method: method ?? 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        body: body ? JSON.stringify(body) : undefined,
      });

      const text = await response.text();
      let parsed: unknown = null;
      if (text) {
        try {
          parsed = JSON.parse(text);
        } catch {
          parsed = text;
        }
      }

      return {
        status: response.status,
        ok: response.ok,
        body: parsed,
      };
    },
    {
      inputUrl: url,
      method: options?.method,
      body: options?.body,
    },
  ) as Promise<JsonResponse<T>>;
}

async function waitFor<T>(
  action: () => Promise<T | null>,
  predicate: (value: T) => boolean,
  timeoutMs: number,
  intervalMs = 1500,
): Promise<T> {
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeoutMs) {
    const result = await action();
    if (result && predicate(result)) {
      return result;
    }
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }

  throw new Error(`Timed out after ${timeoutMs}ms`);
}

async function loginMatchmakingUser(
  browser: Browser,
  index: number,
): Promise<AuthenticatedUser> {
  const credentials = getMatchmakingUser(index);
  const context = await browser.newContext();
  const page = await context.newPage();

  await performRealLogin(page, credentials);
  await waitForRIDSync(page, 10000);
  await page.goto('/match-making', { waitUntil: 'domcontentloaded' });

  return {
    page,
    context,
    userId: credentials.userId,
    email: credentials.email,
    displayName: credentials.displayName,
  };
}

test('assembles a real 5v5 ready check and exposes connection info', async ({ browser }) => {
  const users: AuthenticatedUser[] = [];

  try {
    resetMatchmakingState();

    for (let index = 0; index < 10; index += 1) {
      users.push(await loginMatchmakingUser(browser, index));
    }

    const notificationsBefore = await fetchJson<NotificationsEnvelope>(users[0].page, '/api/notifications');
    expect(notificationsBefore.ok).toBeTruthy();
    expect(Array.isArray(notificationsBefore.body.data)).toBeTruthy();

    const queueResponses = await Promise.all(
      users.map((user) =>
        fetchJson<QueueJoinEnvelope>(user.page, '/api/match-making/queue', {
          method: 'POST',
          body: {
            ...MATCH_REQUEST,
            player_id: user.userId,
          },
        }),
      ),
    );

    for (const response of queueResponses) {
      expect(response.ok, JSON.stringify(response.body)).toBeTruthy();
      expect(response.body.success, JSON.stringify(response.body)).toBeTruthy();
      expect(response.body.data?.session_id, JSON.stringify(response.body)).toBeTruthy();
    }

    const sessionIds = queueResponses.map((response) => {
      if (!response.body.data?.session_id) {
        throw new Error(`Missing session_id in queue response: ${JSON.stringify(response.body)}`);
      }

      return response.body.data.session_id;
    });

    const statuses = await Promise.all(
      users.map((user, index) =>
        waitFor(
          async () => {
            const response = await fetchJson<SessionEnvelope>(
              user.page,
              `/api/match-making/session/${sessionIds[index]}`,
            );
            return response.ok ? response.body.data ?? null : null;
          },
          (session) => session.status === 'ready_check' && Boolean(session.lobby_id || session.ready_check?.lobby_id),
          180000,
        ),
      ),
    );

    const resolvedLobbyIds = statuses
      .map((status) => status.lobby_id ?? status.ready_check?.lobby_id)
      .filter((value): value is string => Boolean(value));

    expect(new Set(resolvedLobbyIds).size).toBe(1);
    const lobbyId = resolvedLobbyIds[0];
    expect(lobbyId).toBeTruthy();

    const initialSummary = await waitFor(
      async () => {
        const response = await fetchJson<CommitmentEnvelope>(
          users[0].page,
          `/api/match-making/lobbies/${lobbyId}/commitments`,
        );
        return response.ok ? response.body.data ?? null : null;
      },
      (summary) => summary.total_players === 10,
      30000,
    );

    expect(initialSummary.pending_count).toBe(10);
    expect(initialSummary.confirmed_count).toBe(0);

    const confirmResponses = await Promise.all(
      users.map((user) =>
        fetchJson<ConfirmEnvelope>(
          user.page,
          `/api/match-making/lobbies/${lobbyId}/commitments/confirm`,
          { method: 'POST', body: {} },
        ),
      ),
    );

    for (const response of confirmResponses) {
      expect(response.ok).toBeTruthy();
    }

    const finalSummary = await waitFor(
      async () => {
        const response = await fetchJson<CommitmentEnvelope>(
          users[0].page,
          `/api/match-making/lobbies/${lobbyId}/commitments`,
        );
        return response.ok ? response.body.data ?? null : null;
      },
      (summary) => summary.all_confirmed,
      60000,
    );

    expect(finalSummary.total_players).toBe(10);
    expect(finalSummary.confirmed_count).toBe(10);
    expect(finalSummary.pending_count).toBe(0);
    expect(finalSummary.has_declined_or_expired).toBeFalsy();

    const connectionInfo = await waitFor(
      async () => {
        const response = await fetchJson<ConnectionInfoEnvelope>(
          users[0].page,
          `/api/match-making/lobbies/${lobbyId}/connection-info`,
        );
        return response.ok ? response.body.data ?? null : null;
      },
      (data) => Boolean(data.match_id && data.instructions),
      60000,
    );

    expect(connectionInfo.game_id).toBe('cs2');
    expect(connectionInfo.region).toBeTruthy();
    expect(connectionInfo.match_id).toBeTruthy();
    expect(connectionInfo.instructions.length).toBeGreaterThan(0);
    expect(
      Boolean(
        connectionInfo.server_url ||
          connectionInfo.server_ip ||
          connectionInfo.deep_link ||
          connectionInfo.qr_code_data,
      ),
    ).toBeTruthy();

    const notificationsAfter = await fetchJson<NotificationsEnvelope>(users[0].page, '/api/notifications');
    expect(notificationsAfter.ok).toBeTruthy();
    expect(notificationsAfter.body.unreadCount).toBeGreaterThanOrEqual(0);
  } finally {
    await Promise.all(users.map((user) => user.context.close()));
  }
});

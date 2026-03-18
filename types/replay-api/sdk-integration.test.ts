/**
 * SDK Integration Tests
 * Comprehensive tests for all backend SDK methods
 * Tests API integration, error handling, and data transformations
 * 
 * Coverage Target: 85%+ for all SDK modules
 */

import { ReplayApiClient } from './replay-api.client';
import { WalletAPI } from './wallet.sdk';
import { MatchmakingAPI } from './matchmaking.sdk';
import { SubscriptionsAPI } from './subscriptions.sdk';
import { LobbyAPI } from './lobby.sdk';
import { HighlightsAPI } from './highlights.sdk';
import { TournamentAPI } from './tournament.sdk';
import { ChallengeAPI } from './challenge.sdk';
import { SmartWalletAPI } from './blockchain.sdk';
import { NotificationsAPI } from './notifications.sdk';
import { PrizePoolAPI } from './prize-pool.sdk';
import { UserSettingsAPI } from './settings.sdk';
import { MatchAnalyticsAPI } from './match-analytics.sdk';
import { SearchSchemaAPI } from './search-schema.sdk';

// ============================================================================
// Mock Setup
// ============================================================================

const createMockClient = (): jest.Mocked<ReplayApiClient> => ({
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  patch: jest.fn(),
  delete: jest.fn(),
  search: jest.fn(),
  getResource: jest.fn(),
  setDefaultTimeout: jest.fn(),
  setMaxRetries: jest.fn(),
  setRetryDelay: jest.fn(),
} as unknown as jest.Mocked<ReplayApiClient>);

// ============================================================================
// Test Data Factories
// ============================================================================

const mockWalletBalance = {
  wallet_id: 'wallet-123',
  user_id: 'user-456',
  balances: { USD: '100.00', ETH: '0.5' },
  total_deposited: '500.00',
  total_withdrawn: '200.00',
  total_prizes_won: '150.00',
  is_locked: false,
};

const mockTransaction = {
  id: 'tx-123',
  transaction_id: 'tx-123',
  type: 'deposit',
  entry_type: 'credit',
  asset_type: 'fiat',
  currency: 'USD',
  amount: '50.00',
  balance_after: '150.00',
  description: 'Test deposit',
  created_at: '2024-01-01T00:00:00Z',
  is_reversed: false,
};

const mockSubscription = {
  id: 'sub-123',
  plan_id: 'pro-monthly',
  plan: {
    id: 'pro-monthly',
    key: 'pro',
    name: 'Pro Plan',
    description: 'Full access',
    price: { monthly: 9.99, quarterly: 24.99, yearly: 89.99, currency: 'USD' },
    features: ['Unlimited replays', 'Advanced analytics'],
  },
  status: 'active',
  billing_period: 'monthly',
  current_period_start: '2024-01-01T00:00:00Z',
  current_period_end: '2024-02-01T00:00:00Z',
  cancel_at_period_end: false,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

const mockLobby = {
  id: 'lobby-123',
  name: 'Pro Scrims',
  game_id: 'cs2',
  mode: 'competitive',
  max_players: 10,
  current_players: 5,
  status: 'waiting',
  host_id: 'user-456',
  created_at: '2024-01-01T00:00:00Z',
};

const mockHighlight = {
  id: 'highlight-123',
  replay_id: 'replay-456',
  player_id: 'player-123',
  event_type: 'ace',
  timestamp: 1234567890,
  duration: 15000,
  thumbnail_url: 'https://example.com/thumb.jpg',
  video_url: 'https://example.com/video.mp4',
  created_at: '2024-01-01T00:00:00Z',
};

const mockTournament = {
  id: 'tournament-123',
  name: 'Pro League Season 1',
  game_id: 'cs2',
  format: 'single_elimination',
  status: 'registration',
  max_teams: 16,
  registered_teams: 8,
  prize_pool: 10000,
  start_date: '2024-02-01T00:00:00Z',
  end_date: '2024-02-15T00:00:00Z',
  created_at: '2024-01-01T00:00:00Z',
};

const mockChallenge = {
  id: 'challenge-123',
  challenger_id: 'player-123',
  challenged_id: 'player-456',
  match_id: 'match-789',
  stake_amount: '50.00',
  status: 'pending',
  created_at: '2024-01-01T00:00:00Z',
};

const mockNotification = {
  id: 'notif-123',
  user_id: 'user-456',
  type: 'match_found',
  title: 'Match Found!',
  message: 'Your ranked match is ready',
  read: false,
  created_at: '2024-01-01T00:00:00Z',
};

const mockPrizePool = {
  id: 'pool-123',
  tournament_id: 'tournament-123',
  total_amount: '10000.00',
  currency: 'USD',
  distribution: [
    { place: 1, percentage: 50, amount: '5000.00' },
    { place: 2, percentage: 30, amount: '3000.00' },
    { place: 3, percentage: 20, amount: '2000.00' },
  ],
  status: 'locked',
  created_at: '2024-01-01T00:00:00Z',
};

// ============================================================================
// Wallet SDK Tests
// ============================================================================

describe('WalletAPI', () => {
  let mockClient: jest.Mocked<ReplayApiClient>;
  let walletApi: WalletAPI;

  beforeEach(() => {
    jest.clearAllMocks();
    mockClient = createMockClient();
    walletApi = new WalletAPI(mockClient);
  });

  describe('getBalance', () => {
    it('should return wallet balance on success', async () => {
      mockClient.get.mockResolvedValue({ data: mockWalletBalance, status: 200 });
      const result = await walletApi.getBalance();
      expect(result).toEqual(mockWalletBalance);
      expect(mockClient.get).toHaveBeenCalledWith('/wallet/balance');
    });

    it('should return null on error', async () => {
      mockClient.get.mockResolvedValue({ error: { message: 'Failed', status: 500 }, status: 500 });
      const result = await walletApi.getBalance();
      expect(result).toBeNull();
    });
  });

  describe('getTransactions', () => {
    it('should return paginated transactions', async () => {
      const mockTransactions = {
        transactions: [mockTransaction],
        total_count: 1,
        limit: 10,
        offset: 0,
      };
      mockClient.get.mockResolvedValue({ data: mockTransactions, status: 200 });
      
      const result = await walletApi.getTransactions({ limit: 10, offset: 0 });
      expect(result?.transactions).toHaveLength(1);
      expect(mockClient.get).toHaveBeenCalled();
    });

    it('should filter by transaction type', async () => {
      mockClient.get.mockResolvedValue({ data: { transactions: [], total_count: 0, limit: 10, offset: 0 }, status: 200 });
      await walletApi.getTransactions({ type: 'deposit' });
      expect(mockClient.get).toHaveBeenCalledWith(expect.stringContaining('type=deposit'));
    });
  });

  describe('deposit', () => {
    it('should create deposit request', async () => {
      const depositResponse = { ...mockTransaction, type: 'deposit' };
      mockClient.post.mockResolvedValue({ data: depositResponse, status: 201 });
      
      const result = await walletApi.deposit({ amount: 100.00, currency: 'USD' });
      expect(result).toEqual(depositResponse);
      expect(mockClient.post).toHaveBeenCalledWith('/wallet/deposit', expect.any(Object));
    });
  });

  describe('withdraw', () => {
    it('should create withdrawal request', async () => {
      const withdrawResponse = { ...mockTransaction, type: 'withdrawal' };
      mockClient.post.mockResolvedValue({ data: withdrawResponse, status: 201 });
      
      const result = await walletApi.withdraw({ 
        amount: 50.00, 
        currency: 'USD',
        to_address: 'bank-account-123'
      });
      expect(result).toEqual(withdrawResponse);
    });

    it('should handle insufficient funds error', async () => {
      mockClient.post.mockResolvedValue({ 
        error: { message: 'Insufficient funds', status: 400 }, 
        status: 400 
      });
      
      const result = await walletApi.withdraw({ 
        amount: 10000.00, 
        currency: 'USD',
        to_address: 'bank-123'
      });
      expect(result).toBeNull();
    });
  });
});

// ============================================================================
// Subscriptions SDK Tests
// ============================================================================

describe('SubscriptionsAPI', () => {
  let mockClient: jest.Mocked<ReplayApiClient>;
  let subscriptionsApi: SubscriptionsAPI;

  beforeEach(() => {
    jest.clearAllMocks();
    mockClient = createMockClient();
    subscriptionsApi = new SubscriptionsAPI(mockClient);
  });

  describe('getPlans', () => {
    it('should return available subscription plans', async () => {
      const mockPlans = [mockSubscription.plan];
      mockClient.get.mockResolvedValue({ data: mockPlans, status: 200 });
      
      const result = await subscriptionsApi.getPlans();
      expect(result).toHaveLength(1);
      expect(mockClient.get).toHaveBeenCalledWith('/subscriptions/plans');
    });
  });

  describe('getCurrentSubscription', () => {
    it('should return current user subscription', async () => {
      mockClient.get.mockResolvedValue({ data: mockSubscription, status: 200 });
      
      const result = await subscriptionsApi.getCurrentSubscription();
      expect(result).toEqual(mockSubscription);
      expect(result?.status).toBe('active');
    });

    it('should return null for non-subscribed users', async () => {
      mockClient.get.mockResolvedValue({ data: null, status: 404 });
      
      const result = await subscriptionsApi.getCurrentSubscription();
      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create new subscription', async () => {
      mockClient.post.mockResolvedValue({ data: mockSubscription, status: 201 });
      
      const result = await subscriptionsApi.create({
        plan_id: 'pro-monthly',
        billing_period: 'monthly',
      });
      expect(result).toEqual(mockSubscription);
    });
  });

  describe('cancel', () => {
    it('should cancel subscription at period end', async () => {
      const canceledSub = { ...mockSubscription, cancel_at_period_end: true };
      mockClient.post.mockResolvedValue({ data: canceledSub, status: 200 });
      
      const result = await subscriptionsApi.cancel('sub-123');
      expect(result?.cancel_at_period_end).toBe(true);
    });
  });
});

// ============================================================================
// Lobby SDK Tests
// ============================================================================

describe('LobbyAPI', () => {
  let mockClient: jest.Mocked<ReplayApiClient>;
  let lobbyApi: LobbyAPI;

  beforeEach(() => {
    jest.clearAllMocks();
    mockClient = createMockClient();
    lobbyApi = new LobbyAPI(mockClient);
  });

  describe('createLobby', () => {
    it('should create new lobby', async () => {
      mockClient.post.mockResolvedValue({ data: mockLobby, status: 201 });
      
      const result = await lobbyApi.createLobby({
        name: 'Pro Scrims',
        creator_id: 'player-123',
        game_id: 'cs2',
        game_mode: 'competitive',
        max_players: 10,
      });
      expect(result).toEqual(mockLobby);
    });
  });

  describe('joinLobby', () => {
    it('should join existing lobby', async () => {
      const joinResponse = { lobby: mockLobby, assigned_slot: { slot_number: 2, player_id: 'player-456', is_ready: false } };
      mockClient.post.mockResolvedValue({ data: joinResponse, status: 200 });
      
      const result = await lobbyApi.joinLobby('lobby-123', { player_id: 'player-456' });
      expect(result?.lobby).toBeDefined();
    });

    it('should handle full lobby error', async () => {
      mockClient.post.mockResolvedValue({
        error: { message: 'Lobby is full', status: 400 },
        status: 400,
      });
      
      const result = await lobbyApi.joinLobby('lobby-123', { player_id: 'player-789' });
      expect(result).toBeNull();
    });
  });

  describe('leaveLobby', () => {
    it('should leave lobby successfully', async () => {
      mockClient.delete.mockResolvedValue({ status: 200 });
      
      await lobbyApi.leaveLobby('lobby-123', { player_id: 'player-456' });
      expect(mockClient.delete).toHaveBeenCalledWith('/api/lobbies/lobby-123/leave');
    });
  });
});

// ============================================================================
// Highlights SDK Tests
// ============================================================================

describe('HighlightsAPI', () => {
  let mockClient: jest.Mocked<ReplayApiClient>;
  let highlightsApi: HighlightsAPI;

  beforeEach(() => {
    jest.clearAllMocks();
    mockClient = createMockClient();
    highlightsApi = new HighlightsAPI(mockClient);
  });

  describe('getHighlights', () => {
    it('should return highlights for replay', async () => {
      const mockHighlights = { items: [mockHighlight], total: 1 };
      mockClient.get.mockResolvedValue({ data: mockHighlights, status: 200 });
      
      const result = await highlightsApi.getHighlights({ match_id: 'replay-456' });
      expect(result).toBeDefined();
    });
  });

  describe('getAces', () => {
    it('should return ace highlights', async () => {
      const aceHighlight = { ...mockHighlight, event_type: 'Ace' };
      mockClient.get.mockResolvedValue({ data: { items: [aceHighlight] }, status: 200 });
      
      const result = await highlightsApi.getAces();
      expect(result).toBeDefined();
    });
  });

  describe('getClutches', () => {
    it('should return clutch highlights', async () => {
      const clutchHighlight = { ...mockHighlight, event_type: 'Clutch' };
      mockClient.get.mockResolvedValue({ data: { items: [clutchHighlight] }, status: 200 });
      
      const result = await highlightsApi.getClutches();
      expect(result).toBeDefined();
    });
  });
});

// ============================================================================
// Tournament SDK Tests
// ============================================================================

describe('TournamentAPI', () => {
  let mockClient: jest.Mocked<ReplayApiClient>;
  let tournamentApi: TournamentAPI;

  beforeEach(() => {
    jest.clearAllMocks();
    mockClient = createMockClient();
    tournamentApi = new TournamentAPI(mockClient);
  });

  describe('createTournament', () => {
    it('should create new tournament', async () => {
      mockClient.post.mockResolvedValue({ data: mockTournament, status: 201 });
      
      const result = await tournamentApi.createTournament({
        name: 'Pro League Season 1',
        description: 'Top tier competitive tournament',
        game_id: 'cs2',
        game_mode: 'competitive',
        region: 'NA',
        format: 'single_elimination',
        max_participants: 16,
        min_participants: 8,
        start_time: '2024-02-01T00:00:00Z',
        registration_open: '2024-01-15T00:00:00Z',
        registration_close: '2024-01-31T00:00:00Z',
        rules: {
          best_of: 3,
          ban_pick_enabled: true,
          check_in_required: true,
          match_timeout_mins: 60,
          disconnect_grace_mins: 5,
        },
      });
      expect(result).toEqual(mockTournament);
    });
  });

  describe('getTournament', () => {
    it('should return tournament by ID', async () => {
      mockClient.get.mockResolvedValue({ data: mockTournament, status: 200 });
      
      const result = await tournamentApi.getTournament('tournament-123');
      expect(result).toEqual(mockTournament);
    });
  });

  describe('registerPlayer', () => {
    it('should register player for tournament', async () => {
      const updatedTournament = { ...mockTournament, registered_players: 9 };
      mockClient.post.mockResolvedValue({ data: updatedTournament, status: 200 });
      
      const result = await tournamentApi.registerPlayer('tournament-123', {
        player_id: 'player-456',
        display_name: 'ProGamer',
      });
      expect(result).toBeDefined();
    });
  });
});

// ============================================================================
// Challenge SDK Tests
// ============================================================================

describe('ChallengeAPI', () => {
  let mockClient: jest.Mocked<ReplayApiClient>;
  let challengeApi: ChallengeAPI;

  beforeEach(() => {
    jest.clearAllMocks();
    mockClient = createMockClient();
    challengeApi = new ChallengeAPI(mockClient);
  });

  describe('createChallenge', () => {
    it('should create new challenge', async () => {
      mockClient.post.mockResolvedValue({ data: mockChallenge, status: 201 });
      
      const result = await challengeApi.createChallenge({
        match_id: 'match-789',
        game_id: 'cs2',
        type: 'rule_violation',
        title: 'Suspect behavior',
        description: 'Player appeared to violate tournament rules',
      });
      expect(result).toEqual(mockChallenge);
    });
  });

  describe('getChallenge', () => {
    it('should get challenge by ID', async () => {
      mockClient.get.mockResolvedValue({ data: mockChallenge, status: 200 });
      
      const result = await challengeApi.getChallenge('challenge-123');
      expect(result).toBeDefined();
    });
  });

  describe('cancel', () => {
    it('should cancel pending challenge', async () => {
      const canceledChallenge = { ...mockChallenge, status: 'canceled' };
      mockClient.delete.mockResolvedValue({ data: canceledChallenge, status: 200 });
      
      const result = await challengeApi.cancel('challenge-123');
      expect(result).toBeDefined();
    });
  });
});

// ============================================================================
// Notifications SDK Tests
// ============================================================================

describe('NotificationsAPI', () => {
  let mockClient: jest.Mocked<ReplayApiClient>;
  let notificationsApi: NotificationsAPI;

  beforeEach(() => {
    jest.clearAllMocks();
    mockClient = createMockClient();
    notificationsApi = new NotificationsAPI(mockClient);
  });

  describe('getAll', () => {
    it('should return user notifications', async () => {
      const mockNotifications = { items: [mockNotification], total: 1 };
      mockClient.get.mockResolvedValue({ data: mockNotifications, status: 200 });
      
      const result = await notificationsApi.getAll();
      expect(result).toBeDefined();
    });
  });

  describe('markAsRead', () => {
    it('should mark notification as read', async () => {
      mockClient.put.mockResolvedValue({ data: true, status: 200 });
      
      const result = await notificationsApi.markAsRead('notif-123');
      expect(result).toBe(true);
    });
  });

  describe('markAllAsRead', () => {
    it('should mark all notifications as read', async () => {
      mockClient.put.mockResolvedValue({ data: { success: true, count: 5 }, status: 200 });
      
      const result = await notificationsApi.markAllAsRead();
      expect(result).toBe(true);
    });
  });
});

// ============================================================================
// Prize Pool SDK Tests
// ============================================================================

describe('PrizePoolAPI', () => {
  let mockClient: jest.Mocked<ReplayApiClient>;
  let prizePoolApi: PrizePoolAPI;

  beforeEach(() => {
    jest.clearAllMocks();
    mockClient = createMockClient();
    prizePoolApi = new PrizePoolAPI(mockClient);
  });

  describe('getPrizePool', () => {
    it('should return prize pool', async () => {
      mockClient.get.mockResolvedValue({ data: mockPrizePool, status: 200 });
      
      const result = await prizePoolApi.getPrizePool({
        lobby_id: 'lobby-123',
        game_id: 'cs2',
      });
      expect(result).toBeDefined();
    });
  });

  describe('getPrizePoolStats', () => {
    it('should return prize pool stats', async () => {
      const mockStats = { total_pools: 10, total_amount: '100000' };
      mockClient.get.mockResolvedValue({ data: mockStats, status: 200 });
      
      const result = await prizePoolApi.getPrizePoolStats('cs2');
      expect(result).toBeDefined();
    });
  });
});

// ============================================================================
// Matchmaking SDK Tests (Extended)
// ============================================================================

describe('MatchmakingAPI - Extended', () => {
  let mockClient: jest.Mocked<ReplayApiClient>;
  let matchmakingApi: MatchmakingAPI;

  beforeEach(() => {
    jest.clearAllMocks();
    mockClient = createMockClient();
    matchmakingApi = new MatchmakingAPI(mockClient);
  });

  afterEach(() => {
    matchmakingApi.stopPolling();
  });

  describe('joinQueue', () => {
    it('should join matchmaking queue', async () => {
      const mockResponse = {
        session_id: 'session-abc',
        status: 'queued',
        estimated_wait_seconds: 60,
        queue_position: 5,
        queued_at: new Date().toISOString(),
      };
      mockClient.post.mockResolvedValue({ data: mockResponse, status: 200 });

      const result = await matchmakingApi.joinQueue({
        player_id: 'player-123',
        preferences: {
          game_id: 'cs2',
          game_mode: 'competitive',
          region: 'us-east',
          tier: 'free',
          skill_range: { min_mmr: 1000, max_mmr: 2000 },
          max_ping: 100,
          allow_cross_platform: true,
          priority_boost: false,
        },
        player_mmr: 1500,
      });

      expect(result?.session_id).toBe('session-abc');
    });
  });

  describe('leaveQueue', () => {
    it('should leave matchmaking queue', async () => {
      mockClient.delete.mockResolvedValue({ data: { success: true }, status: 200 });

      const result = await matchmakingApi.leaveQueue('session-abc');
      expect(result).toBe(true);
    });
  });

  describe('getSessionStatus', () => {
    it('should return current session status', async () => {
      const mockStatus = {
        session_id: 'session-abc',
        status: 'matched',
        match_id: 'match-123',
      };
      mockClient.get.mockResolvedValue({ data: mockStatus, status: 200 });

      const result = await matchmakingApi.getSessionStatus('session-abc');
      expect(result?.status).toBe('matched');
    });
  });

  describe('getPoolStats', () => {
    it('should return queue pool statistics', async () => {
      const mockStats = {
        total_players: 150,
        average_wait_time: 45,
        matches_created_last_hour: 25,
      };
      mockClient.get.mockResolvedValue({ data: mockStats, status: 200 });

      const result = await matchmakingApi.getPoolStats('cs2', 'competitive', 'us-east');
      expect(result?.total_players).toBe(150);
    });
  });
});

// ============================================================================
// Settings SDK Tests (UserSettingsAPI)
// ============================================================================

describe('UserSettingsAPI', () => {
  let mockClient: jest.Mocked<ReplayApiClient>;
  let settingsApi: UserSettingsAPI;

  beforeEach(() => {
    jest.clearAllMocks();
    mockClient = createMockClient();
    settingsApi = new UserSettingsAPI(mockClient);
  });

  describe('getNotificationSettings', () => {
    it('should return notification settings', async () => {
      const mockSettings = {
        email: true,
        push: true,
        sms: false,
      };
      mockClient.get.mockResolvedValue({ data: mockSettings, status: 200 });

      const result = await settingsApi.getNotificationSettings();
      expect(result).toBeDefined();
    });
  });

  describe('updateNotificationSettings', () => {
    it('should update notification settings', async () => {
      mockClient.put.mockResolvedValue({ data: true, status: 200 });

      const result = await settingsApi.updateNotificationSettings({
        email_matches: false,
      });
      expect(result).toBe(true);
    });
  });
});

// ============================================================================
// Match Analytics SDK Tests
// ============================================================================

describe('MatchAnalyticsAPI', () => {
  let mockClient: jest.Mocked<ReplayApiClient>;
  let analyticsApi: MatchAnalyticsAPI;

  beforeEach(() => {
    jest.clearAllMocks();
    mockClient = createMockClient();
    analyticsApi = new MatchAnalyticsAPI(mockClient);
  });

  describe('getMatchTrajectory', () => {
    it('should return match trajectory', async () => {
      const mockTrajectory = {
        match_id: 'match-123',
        points: [{ x: 0, y: 0 }, { x: 100, y: 100 }],
      };
      mockClient.get.mockResolvedValue({ data: mockTrajectory, status: 200 });

      const result = await analyticsApi.getMatchTrajectory('cs2', 'match-123');
      expect(result).toBeDefined();
    });
  });

  describe('getMatchHeatmap', () => {
    it('should return match heatmap data', async () => {
      const mockHeatmap = {
        match_id: 'match-123',
        data: [[0, 0, 5], [1, 1, 10]],
      };
      mockClient.get.mockResolvedValue({ data: mockHeatmap, status: 200 });

      const result = await analyticsApi.getMatchHeatmap('cs2', 'match-123');
      expect(result).toBeDefined();
    });
  });
});

// ============================================================================
// Blockchain SDK Tests (SmartWalletAPI)
// ============================================================================

describe('SmartWalletAPI', () => {
  let mockClient: jest.Mocked<ReplayApiClient>;
  let smartWalletApi: SmartWalletAPI;

  beforeEach(() => {
    jest.clearAllMocks();
    mockClient = createMockClient();
    smartWalletApi = new SmartWalletAPI(mockClient);
  });

  describe('getWallet', () => {
    it('should return blockchain wallet', async () => {
      const mockWallet = {
        id: 'wallet-123',
        address: '0x123...',
        status: 'deployed',
      };
      mockClient.get.mockResolvedValue({ data: mockWallet, status: 200 });

      const result = await smartWalletApi.getWallet('wallet-123');
      expect(result).toBeDefined();
    });
  });

  describe('getUserWallets', () => {
    it('should return user wallets', async () => {
      const mockWallets = [{ id: 'wallet-123', address: '0x123...' }];
      mockClient.get.mockResolvedValue({ data: mockWallets, status: 200 });

      const result = await smartWalletApi.getUserWallets();
      expect(result).toBeDefined();
    });
  });
});

// ============================================================================
// Search Schema SDK Tests
// ============================================================================

describe('SearchSchemaAPI', () => {
  let mockClient: jest.Mocked<ReplayApiClient>;
  let searchApi: SearchSchemaAPI;

  beforeEach(() => {
    jest.clearAllMocks();
    mockClient = createMockClient();
    searchApi = new SearchSchemaAPI(mockClient);
  });

  describe('getSchema', () => {
    it('should return search schema', async () => {
      const mockSchema = {
        entities: {
          replays: {
            fields: ['game_id', 'map', 'duration', 'played_at'],
            filterable: ['game_id', 'map'],
            sortable: ['played_at', 'duration'],
          },
        },
      };
      mockClient.get.mockResolvedValue({ data: mockSchema, status: 200 });

      const result = await searchApi.getSchema();
      expect(result?.entities).toBeDefined();
    });
  });

  describe('getEntityTypes', () => {
    it('should return entity types', async () => {
      const mockSchema = {
        entities: {
          replays: {},
          players: {},
        },
      };
      mockClient.get.mockResolvedValue({ data: mockSchema, status: 200 });

      const result = await searchApi.getEntityTypes();
      expect(result).toBeDefined();
    });
  });
});

// ============================================================================
// Error Handling Tests
// ============================================================================

describe('SDK Error Handling', () => {
  let mockClient: jest.Mocked<ReplayApiClient>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockClient = createMockClient();
  });

  it('should handle 401 unauthorized errors', async () => {
    mockClient.get.mockResolvedValue({
      error: { message: 'Unauthorized', status: 401 },
      status: 401,
    });
    const subscriptionsApi = new SubscriptionsAPI(mockClient);
    
    const result = await subscriptionsApi.getCurrentSubscription();
    expect(result).toBeNull();
  });

  it('should handle 403 forbidden errors', async () => {
    mockClient.post.mockResolvedValue({
      error: { message: 'Forbidden', status: 403 },
      status: 403,
    });
    const tournamentApi = new TournamentAPI(mockClient);
    
    const result = await tournamentApi.createTournament({ 
      name: 'Test',
      description: 'Test tournament',
      game_id: 'cs2',
      game_mode: 'competitive',
      region: 'NA',
      format: 'single_elimination',
      max_participants: 16,
      min_participants: 8,
      start_time: '2024-02-01T00:00:00Z',
      registration_open: '2024-01-15T00:00:00Z',
      registration_close: '2024-01-31T00:00:00Z',
      rules: {
        best_of: 3,
        ban_pick_enabled: true,
        check_in_required: true,
        match_timeout_mins: 60,
        disconnect_grace_mins: 5,
      },
    });
    expect(result).toBeNull();
  });

  it('should handle 500 server errors', async () => {
    mockClient.get.mockResolvedValue({
      error: { message: 'Internal server error', status: 500 },
      status: 500,
    });
    const highlightsApi = new HighlightsAPI(mockClient);
    
    const result = await highlightsApi.getHighlights();
    expect(result).toBeDefined(); // Returns empty response, not null
  });
});

// ============================================================================
// Data Transformation Tests
// ============================================================================

describe('SDK Data Transformations', () => {
  let mockClient: jest.Mocked<ReplayApiClient>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockClient = createMockClient();
  });

  it('should normalize game IDs correctly', async () => {
    const matchmakingApi = new MatchmakingAPI(mockClient);
    mockClient.post.mockResolvedValue({ data: { session_id: 'test' }, status: 200 });

    await matchmakingApi.joinQueue({
      player_id: 'player-123',
      preferences: { 
        game_id: 'cs2', 
        game_mode: 'competitive', 
        region: 'us-east', 
        tier: 'free',
        skill_range: { min_mmr: 1000, max_mmr: 2000 },
        max_ping: 100,
        allow_cross_platform: true,
        priority_boost: false,
      },
      player_mmr: 1500,
    });

    expect(mockClient.post).toHaveBeenCalled();
  });

  it('should handle date string conversions', async () => {
    const subscriptionsApi = new SubscriptionsAPI(mockClient);
    mockClient.get.mockResolvedValue({
      data: {
        ...mockSubscription,
        current_period_end: '2024-02-01T00:00:00Z',
      },
      status: 200,
    });

    const result = await subscriptionsApi.getCurrentSubscription();
    expect(result?.current_period_end).toBe('2024-02-01T00:00:00Z');
  });
});

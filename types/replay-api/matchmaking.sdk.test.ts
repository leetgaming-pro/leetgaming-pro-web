/**
 * Matchmaking SDK Unit Tests
 * Tests for the MatchmakingAPI class to ensure proper API integration
 * Target: 85%+ coverage for matchmaking module
 */

import { MatchmakingAPI } from "./matchmaking.sdk";
import type {
  JoinQueueRequest,
  JoinQueueResponse,
  SessionStatusResponse,
  PoolStatsResponse,
} from "./matchmaking.types";

// Mock the ReplayApiClient
const mockClient = {
  post: jest.fn(),
  get: jest.fn(),
  delete: jest.fn(),
  put: jest.fn(),
};

describe("MatchmakingAPI", () => {
  let matchmakingApi: MatchmakingAPI;

  beforeEach(() => {
    jest.clearAllMocks();
    matchmakingApi = new MatchmakingAPI(mockClient as any);
  });

  afterEach(() => {
    matchmakingApi.stopPolling();
  });

  describe("joinQueue", () => {
    const validRequest: JoinQueueRequest = {
      player_id: "player-123",
      preferences: {
        game_id: "cs2",
        game_mode: "competitive",
        region: "us-east",
        skill_range: { min_mmr: 1000, max_mmr: 2000 },
        max_ping: 50,
        allow_cross_platform: false,
        tier: "free",
        priority_boost: false,
      },
      player_mmr: 1500,
    };

    it("should successfully join queue and return session", async () => {
      const mockResponse: JoinQueueResponse = {
        session_id: "session-abc",
        status: "queued",
        estimated_wait_seconds: 60,
        queue_position: 5,
        queued_at: new Date().toISOString(),
      };

      mockClient.post.mockResolvedValueOnce({
        data: mockResponse,
        error: null,
      });

      const result = await matchmakingApi.joinQueue(validRequest);

      expect(result).toEqual(mockResponse);
      expect(mockClient.post).toHaveBeenCalledWith(
        "/match-making/queue",
        expect.objectContaining({
          player_id: "player-123",
          game_id: "cs2",
          game_mode: "competitive",
          region: "us-east",
          tier: "free",
        })
      );
    });

    it("should transform request to backend format", async () => {
      mockClient.post.mockResolvedValueOnce({
        data: { session_id: "test" },
        error: null,
      });

      await matchmakingApi.joinQueue(validRequest);

      // Verify the request is transformed to flat structure
      expect(mockClient.post).toHaveBeenCalledWith("/match-making/queue", {
        player_id: "player-123",
        squad_id: undefined,
        game_id: "cs2",
        game_mode: "competitive",
        region: "us-east",
        tier: "free",
        player_mmr: 1500,
        max_ping: 50,
        priority_boost: false,
        team_format: "5v5",
      });
    });

    it("should return null on error", async () => {
      mockClient.post.mockResolvedValueOnce({
        data: null,
        error: "Network error",
      });

      const result = await matchmakingApi.joinQueue(validRequest);

      expect(result).toBeNull();
    });

    it("should include squad_id when provided", async () => {
      const requestWithSquad: JoinQueueRequest = {
        ...validRequest,
        squad_id: "squad-xyz",
      };

      mockClient.post.mockResolvedValueOnce({
        data: { session_id: "test" },
        error: null,
      });

      await matchmakingApi.joinQueue(requestWithSquad);

      expect(mockClient.post).toHaveBeenCalledWith(
        "/match-making/queue",
        expect.objectContaining({
          squad_id: "squad-xyz",
        })
      );
    });
  });

  describe("leaveQueue", () => {
    it("should successfully leave queue and return true", async () => {
      mockClient.delete.mockResolvedValueOnce({ status: 204 });

      const result = await matchmakingApi.leaveQueue("session-abc");

      expect(result).toBe(true);
      expect(mockClient.delete).toHaveBeenCalledWith(
        "/match-making/queue/session-abc"
      );
    });

    it("should return true on 200 status", async () => {
      mockClient.delete.mockResolvedValueOnce({ status: 200 });

      const result = await matchmakingApi.leaveQueue("session-abc");

      expect(result).toBe(true);
    });

    it("should return false on error status", async () => {
      mockClient.delete.mockResolvedValueOnce({ status: 400 });

      const result = await matchmakingApi.leaveQueue("session-abc");

      expect(result).toBe(false);
    });
  });

  describe("getSessionStatus", () => {
    it("should return session status", async () => {
      const mockStatus: SessionStatusResponse = {
        session_id: "session-abc",
        status: "searching",
        elapsed_time: 30,
        estimated_wait: 60,
        queue_position: 3,
      };

      mockClient.get.mockResolvedValueOnce({ data: mockStatus, error: null });

      const result = await matchmakingApi.getSessionStatus("session-abc");

      expect(result).toEqual(mockStatus);
      expect(mockClient.get).toHaveBeenCalledWith(
        "/match-making/session/session-abc"
      );
    });

    it("should return null on error", async () => {
      mockClient.get.mockResolvedValueOnce({ data: null, error: "Not found" });

      const result = await matchmakingApi.getSessionStatus("invalid-session");

      expect(result).toBeNull();
    });

    it("should handle matched status with match_id", async () => {
      const mockStatus: SessionStatusResponse = {
        session_id: "session-abc",
        status: "matched",
        elapsed_time: 45,
        estimated_wait: 0,
        match_id: "match-xyz",
        lobby_id: "lobby-123",
      };

      mockClient.get.mockResolvedValueOnce({ data: mockStatus, error: null });

      const result = await matchmakingApi.getSessionStatus("session-abc");

      expect(result?.status).toBe("matched");
      expect(result?.match_id).toBe("match-xyz");
      expect(result?.lobby_id).toBe("lobby-123");
    });
  });

  describe("getPoolStats", () => {
    it("should return pool stats for game", async () => {
      const mockStats: PoolStatsResponse = {
        pool_id: "pool-123",
        game_id: "cs2",
        game_mode: "competitive",
        region: "us-east",
        total_players: 150,
        average_wait_time_seconds: 45,
        players_by_tier: { free: 100, premium: 30, pro: 15, elite: 5 },
        estimated_match_time_seconds: 60,
        queue_health: "healthy",
        timestamp: new Date().toISOString(),
      };

      mockClient.get.mockResolvedValueOnce({ data: mockStats, error: null });

      const result = await matchmakingApi.getPoolStats("cs2");

      expect(result).toEqual(mockStats);
      expect(mockClient.get).toHaveBeenCalledWith("/match-making/pools/cs2");
    });

    it("should include game_mode and region in query params", async () => {
      mockClient.get.mockResolvedValueOnce({ data: {}, error: null });

      await matchmakingApi.getPoolStats("cs2", "competitive", "us-east");

      expect(mockClient.get).toHaveBeenCalledWith(
        "/match-making/pools/cs2?game_mode=competitive&region=us-east"
      );
    });

    it("should handle only game_mode param", async () => {
      mockClient.get.mockResolvedValueOnce({ data: {}, error: null });

      await matchmakingApi.getPoolStats("cs2", "casual");

      expect(mockClient.get).toHaveBeenCalledWith(
        "/match-making/pools/cs2?game_mode=casual"
      );
    });

    it("should return null on error", async () => {
      mockClient.get.mockResolvedValueOnce({
        data: null,
        error: "Server error",
      });

      const result = await matchmakingApi.getPoolStats("cs2");

      expect(result).toBeNull();
    });
  });

  describe("startPolling", () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it("should poll session status at specified interval", async () => {
      const mockStatus: SessionStatusResponse = {
        session_id: "session-abc",
        status: "searching",
        elapsed_time: 30,
        estimated_wait: 60,
      };

      mockClient.get.mockResolvedValue({ data: mockStatus, error: null });

      const callback = jest.fn();
      matchmakingApi.startPolling("session-abc", callback, 1000);

      // Fast-forward 1 second
      jest.advanceTimersByTime(1000);
      await Promise.resolve(); // Allow async operations to complete

      // Fast-forward another second
      jest.advanceTimersByTime(1000);
      await Promise.resolve();

      matchmakingApi.stopPolling();

      expect(callback).toHaveBeenCalled();
    });

    it("should stop previous polling when starting new one", () => {
      const callback1 = jest.fn();
      const callback2 = jest.fn();

      matchmakingApi.startPolling("session-1", callback1, 1000);
      matchmakingApi.startPolling("session-2", callback2, 1000);

      // Only the second polling should be active
      matchmakingApi.stopPolling();
    });
  });

  describe("stopPolling", () => {
    it("should stop polling without error when no polling is active", () => {
      expect(() => matchmakingApi.stopPolling()).not.toThrow();
    });
  });

  describe("subscribeToPoolUpdates", () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it("should return unsubscribe function", async () => {
      mockClient.get.mockResolvedValue({ data: {}, error: null });

      const callback = jest.fn();
      const unsubscribe = matchmakingApi.subscribeToPoolUpdates(
        "cs2",
        callback,
        1000
      );

      expect(typeof unsubscribe).toBe("function");

      // Should be able to unsubscribe
      unsubscribe();
    });

    it("should poll pool stats at interval", async () => {
      const mockStats: PoolStatsResponse = {
        pool_id: "pool-123",
        game_id: "cs2",
        game_mode: "competitive",
        region: "",
        total_players: 100,
        average_wait_time_seconds: 30,
        players_by_tier: { free: 80, premium: 15, pro: 4, elite: 1 },
        estimated_match_time_seconds: 45,
        queue_health: "healthy",
        timestamp: new Date().toISOString(),
      };

      mockClient.get.mockResolvedValue({ data: mockStats, error: null });

      const callback = jest.fn();
      const unsubscribe = matchmakingApi.subscribeToPoolUpdates(
        "cs2",
        callback,
        1000
      );

      // Fast-forward
      jest.advanceTimersByTime(1500);
      await Promise.resolve();

      unsubscribe();

      expect(callback).toHaveBeenCalled();
    });
  });
});

describe("MatchmakingAPI - Edge Cases", () => {
  let matchmakingApi: MatchmakingAPI;

  beforeEach(() => {
    jest.clearAllMocks();
    matchmakingApi = new MatchmakingAPI(mockClient as any);
  });

  afterEach(() => {
    matchmakingApi.stopPolling();
  });

  it("should handle all tier types", async () => {
    const tiers = ["free", "premium", "pro", "elite"] as const;

    for (const tier of tiers) {
      mockClient.post.mockResolvedValueOnce({
        data: { session_id: `session-${tier}` },
        error: null,
      });

      const request: JoinQueueRequest = {
        player_id: "player-123",
        preferences: {
          game_id: "cs2",
          game_mode: "competitive",
          region: "us-east",
          skill_range: { min_mmr: 1000, max_mmr: 2000 },
          max_ping: 50,
          allow_cross_platform: false,
          tier,
          priority_boost: tier === "elite" || tier === "pro",
        },
        player_mmr: 1500,
      };

      const result = await matchmakingApi.joinQueue(request);

      expect(result).not.toBeNull();
      expect(mockClient.post).toHaveBeenCalledWith(
        "/match-making/queue",
        expect.objectContaining({ tier })
      );
    }
  });

  it("should handle all session statuses", async () => {
    const statuses = [
      "queued",
      "searching",
      "matched",
      "ready",
      "cancelled",
      "expired",
    ] as const;

    for (const status of statuses) {
      mockClient.get.mockResolvedValueOnce({
        data: {
          session_id: "test",
          status,
          elapsed_time: 0,
          estimated_wait: 0,
        },
        error: null,
      });

      const result = await matchmakingApi.getSessionStatus("test");

      expect(result?.status).toBe(status);
    }
  });

  it("should handle all queue health values", async () => {
    const healthValues = ["healthy", "moderate", "slow", "degraded"] as const;

    for (const health of healthValues) {
      mockClient.get.mockResolvedValueOnce({
        data: {
          pool_id: "test",
          game_id: "cs2",
          game_mode: "competitive",
          region: "us-east",
          total_players: 100,
          average_wait_time_seconds: 30,
          players_by_tier: {},
          estimated_match_time_seconds: 45,
          queue_health: health,
          timestamp: new Date().toISOString(),
        },
        error: null,
      });

      const result = await matchmakingApi.getPoolStats("cs2");

      expect(result?.queue_health).toBe(health);
    }
  });
});


/**
 * Matchmaking API SDK
 * Clean, minimal API wrapper for matchmaking operations using ReplayApiClient
 */

import { ReplayApiClient } from './replay-api.client';
import type {
  JoinQueueRequest,
  JoinQueueResponse,
  PoolStatsResponse,
  SessionStatusResponse,
} from './matchmaking.types';

export class MatchmakingAPI {
  private pollingInterval: NodeJS.Timeout | null = null;

  constructor(private client: ReplayApiClient) {}

  /**
   * Join the matchmaking queue
   */
  async joinQueue(request: JoinQueueRequest): Promise<JoinQueueResponse | null> {
    const response = await this.client.post<JoinQueueResponse>('/match-making/queue', request);
    if (response.error) {
      console.error('Failed to join queue:', response.error);
      return null;
    }
    return response.data || null;
  }

  /**
   * Start polling for session status updates
   */
  startPolling(sessionId: string, callback: (status: SessionStatusResponse) => void, intervalMs: number = 2000): void {
    this.stopPolling();
    this.pollingInterval = setInterval(async () => {
      const status = await this.getSessionStatus(sessionId);
      if (status) {
        callback(status);
      }
    }, intervalMs);
  }

  /**
   * Stop polling for session status
   */
  stopPolling(): void {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
  }

  /**
   * Leave the matchmaking queue
   */
  async leaveQueue(sessionId: string): Promise<boolean> {
    const response = await this.client.delete(`/match-making/queue/${sessionId}`);
    return response.status === 204 || response.status === 200;
  }

  /**
   * Get session status
   */
  async getSessionStatus(sessionId: string): Promise<SessionStatusResponse | null> {
    const response = await this.client.get<SessionStatusResponse>(`/match-making/session/${sessionId}`);
    if (response.error) {
      console.error('Failed to get session status:', response.error);
      return null;
    }
    return response.data || null;
  }

  /**
   * Get pool statistics
   */
  async getPoolStats(gameId: string, gameMode?: string, region?: string): Promise<PoolStatsResponse | null> {
    const params = new URLSearchParams();
    if (gameMode) params.set('game_mode', gameMode);
    if (region) params.set('region', region);

    const queryString = params.toString();
    const url = queryString
      ? `/match-making/pools/${gameId}?${queryString}`
      : `/match-making/pools/${gameId}`;

    const response = await this.client.get<PoolStatsResponse>(url);
    if (response.error) {
      console.error('Failed to get pool stats:', response.error);
      return null;
    }
    return response.data || null;
  }

  /**
   * Subscribe to real-time pool statistics updates
   * Returns unsubscribe function
   */
  subscribeToPoolUpdates(
    gameId: string,
    callback: (stats: PoolStatsResponse) => void,
    intervalMs: number = 5000
  ): () => void {
    const interval = setInterval(async () => {
      const stats = await this.getPoolStats(gameId);
      if (stats) {
        callback(stats);
      }
    }, intervalMs);

    // Return unsubscribe function
    return () => clearInterval(interval);
  }
}

// Re-export types for convenience
export type {
  JoinQueueRequest,
  JoinQueueResponse,
  SessionStatusResponse,
  PoolStatsResponse,
} from './matchmaking.types';

// Alias for backward compatibility
export { MatchmakingAPI as MatchmakingSDK };

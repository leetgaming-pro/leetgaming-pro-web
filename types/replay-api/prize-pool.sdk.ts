/**
 * Prize Pool SDK - Tournament Prize Management
 * Client-side API wrapper for prize pool operations
 */

import type { ReplayApiClient } from './replay-api.client';
import type {
  PrizePool,
  GetPrizePoolRequest,
  GetPrizePoolResponse,
  PrizePoolStats,
  LockPrizePoolRequest,
  DistributePrizePoolRequest,
  DistributePrizePoolResponse,
  RefundPrizePoolRequest,
  RefundPrizePoolResponse,
  FileDisputeRequest,
  ResolveDisputeRequest,
} from './prize-pool.types';

export class PrizePoolAPI {
  constructor(private client: ReplayApiClient) {}

  /**
   * Get prize pool by ID or lobby ID
   */
  async getPrizePool(request: GetPrizePoolRequest): Promise<GetPrizePoolResponse | null> {
    const params = new URLSearchParams();

    if (request.pool_id) params.append('pool_id', request.pool_id);
    if (request.lobby_id) params.append('lobby_id', request.lobby_id);
    if (request.game_id) params.append('game_id', request.game_id);
    if (request.region) params.append('region', request.region);

    const url = `/api/prize-pools${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await this.client.get<GetPrizePoolResponse>(url);
    return response.data || null;
  }

  /**
   * Get prize pool statistics for a game/region
   */
  async getPrizePoolStats(gameId: string, region?: string): Promise<PrizePoolStats | null> {
    const params = new URLSearchParams({ game_id: gameId });
    if (region) params.append('region', region);

    const url = `/api/prize-pools/stats?${params.toString()}`;
    const response = await this.client.get<PrizePoolStats>(url);
    return response.data || null;
  }

  /**
   * Lock prize pool (match starting)
   */
  async lockPrizePool(request: LockPrizePoolRequest): Promise<PrizePool | null> {
    const response = await this.client.post<PrizePool>(
      `/api/prize-pools/${request.pool_id}/lock`,
      request
    );
    return response.data || null;
  }

  /**
   * Distribute prizes to winners
   */
  async distributePrizePool(
    request: DistributePrizePoolRequest
  ): Promise<DistributePrizePoolResponse | null> {
    const response = await this.client.post<DistributePrizePoolResponse>(
      `/api/prize-pools/${request.pool_id}/distribute`,
      request
    );
    return response.data || null;
  }

  /**
   * Refund prize pool (match cancelled)
   */
  async refundPrizePool(request: RefundPrizePoolRequest): Promise<RefundPrizePoolResponse | null> {
    const response = await this.client.post<RefundPrizePoolResponse>(
      `/api/prize-pools/${request.pool_id}/refund`,
      request
    );
    return response.data || null;
  }

  /**
   * File a dispute for a prize pool distribution
   */
  async fileDispute(request: FileDisputeRequest): Promise<PrizePool | null> {
    const response = await this.client.post<PrizePool>(
      `/api/prize-pools/${request.pool_id}/dispute`,
      request
    );
    return response.data || null;
  }

  /**
   * Resolve a prize pool dispute (admin only)
   */
  async resolveDispute(request: ResolveDisputeRequest): Promise<PrizePool | null> {
    const response = await this.client.post<PrizePool>(
      `/api/prize-pools/${request.pool_id}/resolve-dispute`,
      request
    );
    return response.data || null;
  }

  /**
   * Subscribe to prize pool updates (polling-based for now)
   * Returns unsubscribe function
   */
  subscribeToPrizePoolUpdates(
    gameId: string,
    region: string,
    onUpdate: (stats: PrizePoolStats) => void,
    intervalMs: number = 5000
  ): () => void {
    const poll = async () => {
      const stats = await this.getPrizePoolStats(gameId, region);
      if (stats) {
        onUpdate(stats);
      }
    };

    // Initial fetch
    poll();

    // Set up interval
    const intervalId = setInterval(poll, intervalMs);

    // Return unsubscribe function
    return () => {
      clearInterval(intervalId);
    };
  }
}

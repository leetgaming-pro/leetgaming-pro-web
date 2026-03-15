/**
 * Prediction API SDK
 * Clean, minimal API wrapper for prediction markets, bets, and leaderboard.
 * Follows Clean Architecture + CQRS pattern from backend.
 */

import { ReplayApiClient, type ApiError } from './replay-api.client';
import type {
  PredictionMarket,
  MarketListResult,
  CreateMarketRequest,
  ResolveMarketRequest,
  Bet,
  BetListResult,
  PlaceBetRequest,
  UserBetSummary,
  LeaderboardResult,
  ListMatchMarketsParams,
  ListUserBetsParams,
  ListMarketBetsParams,
} from './prediction.types';

function throwIfForbidden(error: ApiError | string | undefined, action: string): void {
  if (!error) return;
  const apiError = typeof error === 'string' ? { message: error } : error;
  const isForbidden =
    apiError.status === 403 ||
    (apiError as ApiError).isForbidden ||
    apiError.isAuthError ||
    apiError.message?.toLowerCase().includes('forbidden');

  if (isForbidden) {
    throw new Error(`Permission denied: You do not have permission to ${action}.`);
  }
}

function handleCommandResponse<T>(
  response: { data?: T; error?: ApiError | string },
  action: string,
  logPrefix: string,
): T | null {
  if (response.error) {
    throwIfForbidden(response.error, action);
    const msg =
      typeof response.error === 'string'
        ? response.error
        : response.error.message || 'Unknown error';
    console.error(`${logPrefix}:`, msg);
    throw new Error(msg);
  }
  return response.data || null;
}

export class PredictionAPI {
  constructor(private client: ReplayApiClient) {}

  // ── Markets ──────────────────────────────────────────────────────────────

  async getMarket(marketId: string): Promise<PredictionMarket | null> {
    const res = await this.client.get<PredictionMarket>(`/predictions/markets/${marketId}`);
    return res.data || null;
  }

  async listMatchMarkets(params: ListMatchMarketsParams): Promise<MarketListResult | null> {
    const qs = new URLSearchParams();
    if (params.status) qs.set('status', params.status);
    if (params.limit) qs.set('limit', String(params.limit));
    if (params.offset) qs.set('offset', String(params.offset));
    const qsStr = qs.toString() ? `?${qs.toString()}` : '';

    const res = await this.client.get<MarketListResult>(
      `/predictions/matches/${params.match_id}/markets${qsStr}`,
    );
    return res.data || null;
  }

  async createMarket(req: CreateMarketRequest): Promise<PredictionMarket | null> {
    const res = await this.client.post<PredictionMarket>('/predictions/markets', req);
    return handleCommandResponse(res, 'create prediction market', '[PredictionAPI.createMarket]');
  }

  async lockMarket(marketId: string): Promise<boolean> {
    const res = await this.client.post<{ success: boolean }>(
      `/predictions/markets/${marketId}/lock`,
      {},
    );
    handleCommandResponse(res, 'lock market', '[PredictionAPI.lockMarket]');
    return true;
  }

  async resolveMarket(marketId: string, req: ResolveMarketRequest): Promise<boolean> {
    const res = await this.client.post<{ success: boolean }>(
      `/predictions/markets/${marketId}/resolve`,
      req,
    );
    handleCommandResponse(res, 'resolve market', '[PredictionAPI.resolveMarket]');
    return true;
  }

  async cancelMarket(marketId: string): Promise<boolean> {
    const res = await this.client.post<{ success: boolean }>(
      `/predictions/markets/${marketId}/cancel`,
      {},
    );
    handleCommandResponse(res, 'cancel market', '[PredictionAPI.cancelMarket]');
    return true;
  }

  // ── Bets ─────────────────────────────────────────────────────────────────

  async placeBet(marketId: string, req: PlaceBetRequest): Promise<Bet | null> {
    const res = await this.client.post<Bet>(
      `/predictions/markets/${marketId}/bets`,
      req,
    );
    return handleCommandResponse(res, 'place bet', '[PredictionAPI.placeBet]');
  }

  async getMarketBets(params: ListMarketBetsParams): Promise<BetListResult | null> {
    const qs = new URLSearchParams();
    if (params.limit) qs.set('limit', String(params.limit));
    if (params.offset) qs.set('offset', String(params.offset));
    const qsStr = qs.toString() ? `?${qs.toString()}` : '';

    const res = await this.client.get<BetListResult>(
      `/predictions/markets/${params.market_id}/bets${qsStr}`,
    );
    return res.data || null;
  }

  async getUserBets(params?: ListUserBetsParams): Promise<BetListResult | null> {
    const qs = new URLSearchParams();
    if (params?.status) qs.set('status', params.status);
    if (params?.limit) qs.set('limit', String(params.limit));
    if (params?.offset) qs.set('offset', String(params.offset));
    const qsStr = qs.toString() ? `?${qs.toString()}` : '';

    const res = await this.client.get<BetListResult>(`/predictions/bets/me${qsStr}`);
    return res.data || null;
  }

  async getUserBetSummary(marketId: string): Promise<UserBetSummary | null> {
    const res = await this.client.get<UserBetSummary>(
      `/predictions/markets/${marketId}/summary`,
    );
    return res.data || null;
  }

  // ── Leaderboard ──────────────────────────────────────────────────────────

  async getLeaderboard(limit?: number): Promise<LeaderboardResult | null> {
    const qs = limit ? `?limit=${limit}` : '';
    const res = await this.client.get<LeaderboardResult>(`/predictions/leaderboard${qs}`);
    return res.data || null;
  }
}

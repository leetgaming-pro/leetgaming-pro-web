/**
 * Prediction Domain Types
 * Prediction markets, bets, and leaderboards
 * Based on replay-api/pkg/domain/prediction/entities/
 */

// ── Market Types ────────────────────────────────────────────────────────────

export type PredictionStatus = 'open' | 'locked' | 'resolved' | 'cancelled' | 'voided';

export type BetType =
  | 'match_winner'
  | 'map_score'
  | 'total_rounds'
  | 'first_blood'
  | 'round_winner';

export interface MarketOption {
  key: string;
  label: string;
  odds: number;
  total_staked: number;
  bet_count: number;
}

export interface PredictionMarket {
  id: string;
  match_id: string;
  game_id: string;
  bet_type: BetType;
  title: string;
  description?: string;
  options: MarketOption[];
  status: PredictionStatus;
  outcome?: string;
  locked_at?: string;
  resolved_at?: string;
  total_pool: number;
  bet_count: number;
  created_at: string;
  updated_at: string;
}

export interface MarketListResult {
  markets: PredictionMarket[];
  total_count: number;
  limit: number;
  offset: number;
}

// ── Market Commands ─────────────────────────────────────────────────────────

export interface CreateMarketRequest {
  match_id: string;
  game_id: string;
  bet_type: BetType;
  title: string;
  description?: string;
  options: MarketOption[];
}

export interface ResolveMarketRequest {
  outcome_key: string;
}

// ── Bet Types ───────────────────────────────────────────────────────────────

export type BetStatus = 'pending' | 'won' | 'lost' | 'refunded';

export interface Bet {
  id: string;
  market_id: string;
  match_id: string;
  user_id: string;
  option_key: string;
  amount: number;
  odds_at_place: number;
  status: BetStatus;
  payout: number;
  resolved_at?: string;
  created_at: string;
  updated_at: string;
}

export interface BetListResult {
  bets: Bet[];
  total_count: number;
  limit: number;
  offset: number;
}

export interface PlaceBetRequest {
  option_key: string;
  amount: number;
}

// ── Summary & Leaderboard ───────────────────────────────────────────────────

export interface UserBetSummary {
  market_id: string;
  user_id: string;
  total_staked: number;
  total_payout: number;
  bet_count: number;
  bets: Bet[];
}

export interface BetLeaderboardEntry {
  user_id: string;
  display_name: string;
  avatar_url?: string;
  total_bets: number;
  win_count: number;
  win_rate: number;
  total_profit: number;
}

export interface LeaderboardResult {
  entries: BetLeaderboardEntry[];
  limit: number;
}

// ── Query Params ────────────────────────────────────────────────────────────

export interface ListMatchMarketsParams {
  match_id: string;
  status?: PredictionStatus;
  limit?: number;
  offset?: number;
}

export interface ListUserBetsParams {
  status?: BetStatus;
  limit?: number;
  offset?: number;
}

export interface ListMarketBetsParams {
  market_id: string;
  limit?: number;
  offset?: number;
}

// ── Display Helpers ─────────────────────────────────────────────────────────

export const BET_TYPE_LABELS: Record<BetType, string> = {
  match_winner: 'Match Winner',
  map_score: 'Map Score',
  total_rounds: 'Total Rounds',
  first_blood: 'First Blood',
  round_winner: 'Round Winner',
};

export const PREDICTION_STATUS_LABELS: Record<PredictionStatus, string> = {
  open: 'Open',
  locked: 'Locked',
  resolved: 'Resolved',
  cancelled: 'Cancelled',
  voided: 'Voided',
};

export const MIN_BET_AMOUNT = 100; // $1.00 in cents
export const MAX_BET_AMOUNT = 10000; // $100.00 in cents

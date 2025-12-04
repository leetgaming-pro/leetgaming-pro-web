/**
 * Prize Pool Types - Tournament Prize Distribution
 * TypeScript interfaces matching Go backend entities
 */

import { DistributionRule } from '@/components/match-making/prize-distribution-selector';

// Prize Pool Status Lifecycle
export type PrizePoolStatus =
  | 'accumulating'   // Collecting entry fees
  | 'locked'         // Entry fees locked, match in progress
  | 'in_escrow'      // Match completed, prizes in 72h dispute period
  | 'distributed'    // Prizes distributed to winners
  | 'refunded'       // Prizes refunded (match cancelled)
  | 'disputed';      // Under dispute review

// Prize Pool Amount
export interface Amount {
  cents: number;
  dollars: number;
}

// Player Contribution
export interface PlayerContribution {
  player_id: string;
  amount: Amount;
  contributed_at: string;
}

// Prize Payout
export interface PrizePayout {
  player_id: string;
  amount: Amount;
  position: number; // 1st, 2nd, 3rd, etc.
  reason: string;   // 'winner', 'runner_up', 'mvp_bonus', etc.
}

// Prize Pool Entity
export interface PrizePool {
  pool_id: string;
  lobby_id: string;
  game_id: string;

  // Amounts
  total_amount: Amount;
  platform_contribution: Amount;
  player_contributions: PlayerContribution[];

  // Configuration
  distribution_rule: DistributionRule;
  entry_fee_cents: number;
  max_players: number;
  current_player_count: number;

  // Status & Timing
  status: PrizePoolStatus;
  created_at: string;
  locked_at?: string;
  distributed_at?: string;
  refunded_at?: string;

  // Distribution
  payouts?: PrizePayout[];
  escrow_release_at?: string;

  // Dispute
  is_disputed: boolean;
  dispute_reason?: string;
  dispute_filed_at?: string;

  // Metadata
  metadata?: Record<string, any>;
}

// Get Prize Pool Request
export interface GetPrizePoolRequest {
  pool_id?: string;
  lobby_id?: string;
  game_id?: string;
  region?: string;
}

// Get Prize Pool Response
export interface GetPrizePoolResponse {
  pool: PrizePool;
  projected_payouts?: PrizePayout[]; // What payouts would be if distributed now
}

// Prize Pool Stats (for UI displays)
export interface PrizePoolStats {
  game_id: string;
  region?: string;

  // Current Pools
  active_pools_count: number;
  total_active_value: Amount;
  average_pool_size: Amount;

  // Historical
  total_distributed_24h: Amount;
  total_distributed_7d: Amount;
  total_distributed_30d: Amount;
  total_distributed_all_time: Amount;

  // Recent Winners
  recent_winners: RecentWinner[];

  // Distribution Breakdown
  pools_by_rule: Record<DistributionRule, number>;

  timestamp: string;
}

// Recent Winner
export interface RecentWinner {
  player_id: string;
  player_name: string;
  amount: Amount;
  position: number;
  game_mode: string;
  won_at: string;
  distribution_rule: DistributionRule;
}

// Lock Prize Pool Request
export interface LockPrizePoolRequest {
  pool_id: string;
  lobby_id: string;
}

// Distribute Prize Pool Request
export interface DistributePrizePoolRequest {
  pool_id: string;
  results: {
    player_id: string;
    position: number;
    is_mvp?: boolean;
  }[];
  force_distribute?: boolean; // Admin override to skip escrow
}

// Distribute Prize Pool Response
export interface DistributePrizePoolResponse {
  pool: PrizePool;
  payouts: PrizePayout[];
  wallet_transactions: string[]; // Transaction IDs
}

// Refund Prize Pool Request
export interface RefundPrizePoolRequest {
  pool_id: string;
  reason: string;
}

// Refund Prize Pool Response
export interface RefundPrizePoolResponse {
  pool: PrizePool;
  refund_transactions: string[]; // Transaction IDs
}

// File Dispute Request
export interface FileDisputeRequest {
  pool_id: string;
  player_id: string;
  reason: string;
  evidence?: string[];
}

// Resolve Dispute Request
export interface ResolveDisputeRequest {
  pool_id: string;
  resolution: 'approve_distribution' | 'refund_all' | 'custom_distribution';
  custom_payouts?: PrizePayout[];
  admin_notes?: string;
}

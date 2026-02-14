/**
 * LeetGaming Pro Wallet Type System
 *
 * The award-winning wallet system for competitive esports players.
 * Supports three wallet tiers:
 *
 * 💚 LEET WALLET (full_custodial)
 *    - Platform-managed keys with instant gasless transactions
 *    - Password recovery, perfect for beginners
 *    - Daily limits: $500 (Basic) / $5,000 (Verified)
 *
 * 💎 LEET WALLET PRO (semi_custodial) - RECOMMENDED
 *    - MPC 2-of-3 threshold signing (user + platform + recovery)
 *    - Social recovery, hardware wallet support
 *    - Tournament-grade security, customizable limits up to $50k/day
 *
 * 🦊 DEFI WALLET (non_custodial)
 *    - Full self-custody via MetaMask, Phantom, or Ledger
 *    - No platform access to funds, user pays gas
 *    - For crypto natives who want true ownership
 *
 * Multi-chain support: Polygon, Base, Arbitrum, Optimism, Ethereum, Solana
 */

import type { ChainID, ChainConfig, AssetID } from "./blockchain.types";
import type { Amount, Currency, TransactionStatus } from "./wallet.types";
import type { DistributionRule } from "@/components/match-making/prize-distribution-selector";

// ============ Supported Chain Types ============

/**
 * Supported blockchain networks
 * Primary: Polygon (fastest, cheapest)
 * Secondary: Base, Arbitrum (L2 alternatives)
 * Premium: Ethereum (high-value settlements)
 * Solana: Native SOL ecosystem
 */
export type SupportedChain =
  | "ethereum"
  | "polygon"
  | "base"
  | "arbitrum"
  | "optimism"
  | "solana";

/**
 * Chain metadata for UI display
 */
export interface ChainMeta {
  id: SupportedChain;
  chainId: ChainID;
  name: string;
  icon: string;
  explorer: string;
  gasUnit: string;
  avgConfirmTime: string;
  nativeToken: string;
}

/**
 * Chain type alias for backwards compatibility
 */
export type Chain = SupportedChain;

// ============ Transaction Types (Extended) ============

/**
 * Extended transaction status for escrow operations
 */
export type ExtendedTransactionStatus =
  | "pending"
  | "submitted"
  | "confirming"
  | "confirmed"
  | "failed"
  | "cancelled";

/**
 * Transaction type for wallet operations (used by TransactionCenter)
 */
export type WalletTransactionType =
  | "deposit"
  | "withdrawal"
  | "escrow_lock"
  | "escrow_release"
  | "escrow_refund"
  | "transfer"
  | "swap"
  | "approve"
  | "match_entry"
  | "match_refund"
  | "prize_distribution"
  | "prize_claim"
  | "platform_fee"
  | "vrf_fee";

/**
 * Extended Transaction interface for TransactionCenter
 */
export interface Transaction {
  id: string;
  type: WalletTransactionType;
  status: ExtendedTransactionStatus;
  chain: SupportedChain;
  token: string;
  amount: number;
  fiatValue?: number;
  from: string;
  to: string;
  hash?: string;
  timestamp: Date;
  blockNumber?: number;
  gasUsed?: number;
  gasPrice?: number;
  nonce?: number;
  confirmations?: number;
  requiresSignature?: boolean;
  error?: string;
  metadata?: Record<string, unknown>;
}

// ============ MPC Wallet Types ============

/**
 * MPC Key Shard holder types
 */
export type MPCShardHolder =
  | "user"
  | "platform"
  | "recovery_service"
  | "hardware_device";

/**
 * MPC Key Shard info
 */
export interface MPCKeyShard {
  shard_id: string;
  holder: MPCShardHolder;
  holder_name: string;
  created_at: string;
  last_verified_at?: string;
  is_available: boolean;
  backup_method?: "cloud" | "local" | "hardware" | "social_recovery";
  security_level: "high" | "medium" | "low";
}

/**
 * MPC Wallet configuration
 */
export interface MPCWalletConfig {
  wallet_id: string;
  threshold: number; // Required shards to sign (e.g., 2 of 3)
  total_shards: number;
  shards: MPCKeyShard[];
  signing_protocol: "gg20" | "cmp" | "frost"; // MPC signing protocols
  created_at: string;
  last_rotation_at?: string;
  recovery_enabled: boolean;
  recovery_contacts?: RecoveryContact[];
}

/**
 * Recovery contact for social recovery
 */
export interface RecoveryContact {
  contact_id: string;
  name: string;
  email_masked: string;
  shard_holder: boolean;
  verified_at?: string;
}

/**
 * MPC signing request
 */
export interface MPCSigningRequest {
  request_id: string;
  wallet_id: string;
  chain_id: ChainID;
  transaction_type: "match_entry" | "prize_claim" | "withdrawal" | "transfer";
  unsigned_tx: string;
  shards_collected: number;
  threshold_required: number;
  status: "pending" | "signing" | "complete" | "failed" | "expired";
  expires_at: string;
  created_at: string;
  signed_at?: string;
  tx_hash?: string;
}

// ============ Wallet Types (Leet Wallet / Leet Wallet Pro / DeFi Wallet) ============

/**
 * Wallet type: Leet Wallet (full_custodial), Leet Wallet Pro (semi_custodial), DeFi Wallet (non_custodial)
 */
export type CustodialWalletType =
  | "full_custodial"
  | "semi_custodial"
  | "non_custodial";

/**
 * Wallet status
 */
export interface CustodialWalletStatus {
  wallet_id: string;
  user_id: string;
  wallet_type: CustodialWalletType;

  // Multi-chain addresses
  addresses: WalletChainAddress[];

  // MPC configuration (for Leet Wallet Pro)
  mpc_config?: MPCWalletConfig;

  // Security
  security_score: number; // 0-100
  security_factors: SecurityFactor[];

  // Limits
  daily_withdrawal_limit: Amount;
  daily_withdrawal_used: Amount;
  single_tx_limit: Amount;

  // Features
  features_enabled: WalletFeature[];

  // KYC
  kyc_level: "none" | "basic" | "verified" | "premium";
  kyc_expires_at?: string;

  created_at: string;
  updated_at: string;
}

/**
 * Wallet address per chain
 */
export interface WalletChainAddress {
  chain_id: ChainID;
  address: string;
  is_smart_wallet: boolean; // ERC-4337 Account Abstraction
  deployed_at?: string;
  balance?: ChainBalance;
}

/**
 * Chain balance
 */
export interface ChainBalance {
  native: Amount;
  native_symbol: string;
  tokens: TokenBalance[];
  last_updated_at: string;
}

/**
 * Token balance
 */
export interface TokenBalance {
  asset_id: AssetID;
  symbol: string;
  name: string;
  balance: Amount;
  usd_value: Amount;
  decimals: number;
  logo_uri?: string;
}

/**
 * Security factor for wallet score
 */
export interface SecurityFactor {
  factor: string;
  enabled: boolean;
  weight: number;
  description: string;
  recommendation?: string;
}

/**
 * Wallet features
 */
export type WalletFeature =
  | "match_escrow"
  | "tournament_entry"
  | "prize_claim"
  | "p2p_transfer"
  | "fiat_onramp"
  | "fiat_offramp"
  | "staking"
  | "nft_collectibles"
  | "cross_chain_bridge"
  | "gasless_transactions";

// ============ Escrow Match Types ============

/**
 * Prize distribution type
 */
export type PrizeDistributionType =
  | "winner_takes_all"
  | "tiered"
  | "proportional";

/**
 * Escrow match status
 */
export type EscrowMatchStatus =
  | "open" // Accepting entries
  | "filling" // Minimum reached, waiting for more
  | "ready" // Full, ready to start
  | "in_progress" // Match running
  | "completed" // Match ended, outcomes being verified
  | "in_escrow" // Prizes in escrow period
  | "distributing" // Prizes being distributed
  | "distributed" // All prizes paid out
  | "disputed" // Under dispute
  | "cancelled" // Match cancelled, refunds pending
  | "refunded"; // All refunds completed

/**
 * Escrow match for matchmaking
 */
export interface EscrowMatch {
  match_id: string;
  game_id: string;
  game_mode: string;
  region: string;

  // Entry
  entry_fee: Amount;
  currency: Currency;
  chain_id: ChainID;

  // Prize pool
  total_pot: Amount;
  platform_contribution: Amount;
  platform_fee_percent: number; // Basis points (500 = 5%)

  // Distribution
  distribution_type: PrizeDistributionType;
  distribution_rule?: DistributionRule;
  tiered_splits?: TieredSplit[];

  // Participants
  participants: EscrowParticipant[];
  min_participants: number;
  max_participants: number;
  current_participants: number;

  // Status
  status: EscrowMatchStatus;
  created_at: string;
  starts_at?: string;
  ends_at?: string;

  // Escrow
  escrow_address: string;
  escrow_period_hours: number;
  escrow_ends_at?: string;

  // Blockchain
  blockchain_tx_hash?: string;
  settlement_tx_hash?: string;

  // Randomness (MPC/VRF)
  randomness_request_id?: string;
  randomness_fulfilled?: boolean;

  // Winners
  winners?: MatchWinner[];

  // User's participation (populated when user is participant)
  user_participation?: UserMatchParticipation;
}

/**
 * Tiered prize split configuration
 */
export interface TieredSplit {
  position: number;
  label: string;
  percentage: number; // 0-100
  min_players_required?: number;
}

/**
 * Default tiered splits
 */
export const DEFAULT_TIERED_SPLITS: Record<string, TieredSplit[]> = {
  top_3: [
    { position: 1, label: "1st Place", percentage: 50 },
    { position: 2, label: "2nd Place", percentage: 30 },
    { position: 3, label: "3rd Place", percentage: 20 },
  ],
  top_5: [
    { position: 1, label: "1st Place", percentage: 40 },
    { position: 2, label: "2nd Place", percentage: 25 },
    { position: 3, label: "3rd Place", percentage: 15 },
    { position: 4, label: "4th Place", percentage: 12 },
    { position: 5, label: "5th Place", percentage: 8 },
  ],
  winner_takes_all: [{ position: 1, label: "Winner", percentage: 100 }],
};

/**
 * Escrow participant
 */
export interface EscrowParticipant {
  user_id: string;
  wallet_address: string;
  entry_tx_hash: string;
  entry_amount: Amount;
  entered_at: string;
  checked_in: boolean;
  checked_in_at?: string;
  score?: number;
  rank?: number;
  prize_claimed?: boolean;
  prize_amount?: Amount;
  prize_tx_hash?: string;
}

/**
 * Match winner
 */
export interface MatchWinner {
  user_id: string;
  wallet_address: string;
  rank: number;
  score: number;
  prize_amount: Amount;
  prize_percentage: number;
  is_mvp?: boolean;
  claimed: boolean;
  claimed_at?: string;
  tx_hash?: string;
}

/**
 * User's match participation view
 */
export interface UserMatchParticipation {
  match_id: string;
  user_id: string;
  entry_tx_hash: string;
  entry_amount: Amount;
  entered_at: string;
  status: "entered" | "checked_in" | "playing" | "finished" | "won" | "lost";

  // Results (if match completed)
  rank?: number;
  score?: number;
  prize_won?: Amount;
  prize_claimable?: boolean;
  prize_claimed?: boolean;
  prize_tx_hash?: string;

  // Potential winnings
  potential_winnings?: PotentialWinnings;

  // Refund (if applicable)
  refund_available?: boolean;
  refund_amount?: Amount;
}

/**
 * Potential winnings calculation
 */
export interface PotentialWinnings {
  if_first: Amount;
  if_second?: Amount;
  if_third?: Amount;
  mvp_bonus?: Amount;
  probability_estimate?: number; // Based on MMR comparison
}

// ============ Escrow History Types ============

/**
 * Escrow history entry
 */
export interface EscrowHistoryEntry {
  match_id: string;
  game_id: string;
  game_mode: string;
  entry_fee: Amount;
  prize_won?: Amount;
  rank?: number;
  total_participants: number;
  total_pot: Amount;
  distribution_type: PrizeDistributionType;
  status: "won" | "lost" | "refunded" | "pending";
  match_date: string;
  chain_id: ChainID;
  entry_tx_hash: string;
  prize_tx_hash?: string;

  // Verification
  settlement_verified: boolean;
  explorer_url?: string;
}

/**
 * Escrow stats for user
 */
export interface UserEscrowStats {
  total_matches_entered: number;
  total_matches_won: number;
  win_rate: number;
  total_entry_fees_paid: Amount;
  total_prizes_won: Amount;
  net_profit: Amount;
  biggest_win: Amount;
  current_streak: number;
  best_streak: number;

  // By game
  stats_by_game: Record<string, GameEscrowStats>;

  // Recent performance
  last_30_days: {
    matches: number;
    wins: number;
    profit: Amount;
  };
}

/**
 * Game-specific escrow stats
 */
export interface GameEscrowStats {
  game_id: string;
  matches_played: number;
  wins: number;
  win_rate: number;
  total_prizes: Amount;
  favorite_mode?: string;
}

// ============ Transaction Types for Escrow ============

/**
 * Escrow transaction type
 */
export type EscrowTransactionType =
  | "match_entry"
  | "match_refund"
  | "prize_distribution"
  | "prize_claim"
  | "platform_fee"
  | "vrf_fee";

/**
 * Escrow transaction
 */
export interface EscrowTransaction {
  tx_id: string;
  tx_hash?: string;
  chain_id: ChainID;
  type: EscrowTransactionType;
  match_id: string;
  from_address: string;
  to_address: string;
  amount: Amount;
  currency: Currency;
  gas_fee?: Amount;
  status: TransactionStatus;
  created_at: string;
  confirmed_at?: string;
  block_number?: number;
  explorer_url?: string;
}

// ============ Wallet Actions ============

/**
 * Enter match request
 */
export interface EnterMatchRequest {
  match_id: string;
  wallet_id: string;
  chain_id: ChainID;
  entry_fee: Amount;
  use_gasless?: boolean; // Use paymaster for gas
}

/**
 * Enter match response
 */
export interface EnterMatchResponse {
  success: boolean;
  tx_hash?: string;
  signing_request_id?: string; // For MPC signing
  error?: string;
  escrow_address?: string;
  estimated_gas?: Amount;
}

/**
 * Claim prize request
 */
export interface ClaimPrizeRequest {
  match_id: string;
  wallet_id: string;
  destination_chain_id?: ChainID; // Optional cross-chain claim
}

/**
 * Claim prize response
 */
export interface ClaimPrizeResponse {
  success: boolean;
  tx_hash?: string;
  signing_request_id?: string;
  prize_amount: Amount;
  net_amount: Amount; // After fees
  estimated_arrival?: string;
  error?: string;
}

// ============ UI State Types ============

/**
 * Wallet dashboard view mode
 */
export type WalletViewMode =
  | "overview"
  | "escrow"
  | "history"
  | "security"
  | "settings";

/**
 * Chain filter for wallet
 */
export interface ChainFilter {
  chain_id: ChainID;
  enabled: boolean;
  config: ChainConfig;
}

/**
 * Escrow filter options
 */
export interface EscrowFilterOptions {
  status?: EscrowMatchStatus[];
  game_ids?: string[];
  date_from?: string;
  date_to?: string;
  min_entry_fee?: number;
  max_entry_fee?: number;
  distribution_type?: PrizeDistributionType[];
  chain_ids?: ChainID[];
}

// ============ Notification Types ============

/**
 * Wallet notification type
 */
export type WalletNotificationType =
  | "match_ready"
  | "match_starting"
  | "match_ended"
  | "prize_available"
  | "prize_claimed"
  | "refund_available"
  | "security_alert"
  | "signing_required"
  | "escrow_released";

/**
 * Wallet notification
 */
export interface WalletNotification {
  notification_id: string;
  type: WalletNotificationType;
  title: string;
  message: string;
  match_id?: string;
  amount?: Amount;
  action_url?: string;
  action_label?: string;
  created_at: string;
  read_at?: string;
  dismissed_at?: string;
}

// ============ Helpers ============

/**
 * Calculate net prize after platform fee
 */
export function calculateNetPrize(
  grossPrize: Amount,
  feePercent: number,
): Amount {
  const netDollars = grossPrize.dollars * (1 - feePercent / 10000);
  return {
    cents: Math.round(netDollars * 100),
    dollars: netDollars,
  };
}

/**
 * Calculate potential winnings for each position
 */
export function calculatePotentialWinnings(
  totalPot: Amount,
  splits: TieredSplit[],
  feePercent: number,
): Record<number, Amount> {
  const netPot = calculateNetPrize(totalPot, feePercent);
  const result: Record<number, Amount> = {};

  for (const split of splits) {
    const dollars = netPot.dollars * (split.percentage / 100);
    result[split.position] = {
      cents: Math.round(dollars * 100),
      dollars,
    };
  }

  return result;
}

/**
 * Format escrow status for display
 */
export function formatEscrowStatus(status: EscrowMatchStatus): {
  label: string;
  color: "default" | "primary" | "secondary" | "success" | "warning" | "danger";
  icon: string;
} {
  const statusMap: Record<
    EscrowMatchStatus,
    {
      label: string;
      color: typeof status extends EscrowMatchStatus
        ? "default" | "primary" | "secondary" | "success" | "warning" | "danger"
        : never;
      icon: string;
    }
  > = {
    open: { label: "Open", color: "primary", icon: "solar:door-bold" },
    filling: {
      label: "Filling",
      color: "primary",
      icon: "solar:users-group-rounded-bold",
    },
    ready: {
      label: "Ready",
      color: "success",
      icon: "solar:check-circle-bold",
    },
    in_progress: {
      label: "In Progress",
      color: "warning",
      icon: "solar:gamepad-bold",
    },
    completed: {
      label: "Completed",
      color: "success",
      icon: "solar:flag-bold",
    },
    in_escrow: {
      label: "In Escrow",
      color: "secondary",
      icon: "solar:lock-bold",
    },
    distributing: {
      label: "Distributing",
      color: "warning",
      icon: "solar:transfer-horizontal-bold",
    },
    distributed: {
      label: "Distributed",
      color: "success",
      icon: "solar:check-circle-bold",
    },
    disputed: {
      label: "Disputed",
      color: "danger",
      icon: "solar:danger-triangle-bold",
    },
    cancelled: {
      label: "Cancelled",
      color: "danger",
      icon: "solar:close-circle-bold",
    },
    refunded: {
      label: "Refunded",
      color: "default",
      icon: "solar:undo-left-bold",
    },
  };

  return (
    statusMap[status] || {
      label: status,
      color: "default",
      icon: "solar:question-circle-bold",
    }
  );
}

/**
 * Get security score color
 */
export function getSecurityScoreColor(
  score: number,
): "danger" | "warning" | "success" {
  if (score >= 80) return "success";
  if (score >= 50) return "warning";
  return "danger";
}

/**
 * Get chain icon
 */
export function getChainIcon(chainId: ChainID): string {
  const iconMap: Partial<Record<ChainID, string>> = {
    "solana:mainnet": "cryptocurrency:sol",
    "solana:devnet": "cryptocurrency:sol",
    "eip155:1": "cryptocurrency:eth",
    "eip155:137": "cryptocurrency:matic",
    "eip155:8453": "simple-icons:coinbase",
    "eip155:42161": "simple-icons:arbitrum",
    "eip155:10": "simple-icons:optimism",
    "eip155:56": "cryptocurrency:bnb",
  };

  return iconMap[chainId] || "solar:planet-bold";
}

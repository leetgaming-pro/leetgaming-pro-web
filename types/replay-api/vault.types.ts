/**
 * Team Vault & Inventory Types for LeetGaming.PRO
 * Multisig vault system for team-shared wallets, proposals, and inventory
 */

import type { Currency, Amount, PaginatedResult } from "./wallet.types";

// ═══════════════════════════════════════════════════════════════════════════════
// VAULT TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export type ProposalType =
  | "WITHDRAWAL"
  | "TRANSFER"
  | "ITEM_TRANSFER"
  | "SETTINGS_CHANGE";

export type ProposalStatus =
  | "PENDING"
  | "APPROVED"
  | "EXECUTING"
  | "EXECUTED"
  | "REJECTED"
  | "EXPIRED"
  | "CANCELLED"
  | "FAILED";

export type VaultActivityType =
  | "VAULT_CREATED"
  | "DEPOSIT"
  | "WITHDRAWAL_PROPOSED"
  | "WITHDRAWAL_APPROVED"
  | "WITHDRAWAL_REJECTED"
  | "WITHDRAWAL_EXECUTED"
  | "TRANSFER_PROPOSED"
  | "TRANSFER_EXECUTED"
  | "SETTINGS_UPDATED"
  | "MEMBER_ADDED"
  | "MEMBER_REMOVED"
  | "VAULT_LOCKED"
  | "VAULT_UNLOCKED"
  | "PROPOSAL_EXPIRED"
  | "PROPOSAL_CANCELLED"
  | "ITEM_DEPOSITED"
  | "ITEM_TRANSFERRED";

export type InventoryItemType =
  | "GENERIC"
  | "NFT"
  | "GAME_ASSET"
  | "CONSUMABLE"
  | "COSMETIC"
  | "LOOT_BOX";

export type ItemRarity =
  | "COMMON"
  | "UNCOMMON"
  | "RARE"
  | "EPIC"
  | "LEGENDARY";

export type InventoryItemStatus =
  | "ACTIVE"
  | "LOCKED"
  | "TRANSFERRED"
  | "BURNED"
  | "EXPIRED";

export type NFTStandard = "ERC-721" | "ERC-1155";

// ═══════════════════════════════════════════════════════════════════════════════
// VAULT ENTITIES
// ═══════════════════════════════════════════════════════════════════════════════

export interface PolicyTier {
  max_amount_cents: number;
  required_approvals: number;
  allowed_roles: string[];
  on_chain_required: boolean;
}

export interface ApprovalPolicy {
  tiers: PolicyTier[];
  proposal_expiry_hours: number;
}

export interface TeamVaultSettings {
  approval_policy: ApprovalPolicy;
  on_chain_threshold: number;
  daily_withdraw_limit: number;
  whitelisted_addresses: string[];
}

export interface TeamVault {
  id: string;
  squad_id: string;
  name: string;
  description: string;
  smart_wallet_id?: string;
  balances: Record<string, string | Amount>;
  pending_proposals: string[];
  settings: TeamVaultSettings;
  is_locked: boolean;
  lock_reason?: string;
  version: number;
  created_at: string;
  updated_at: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// VAULT BALANCE
// ═══════════════════════════════════════════════════════════════════════════════

export interface VaultBalance {
  vault_id: string;
  squad_id: string;
  name: string;
  balances: Record<string, string>;
  total_deposited: string;
  total_withdrawn: string;
  pending_proposals: number;
  is_locked: boolean;
  lock_reason?: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// PROPOSALS
// ═══════════════════════════════════════════════════════════════════════════════

export interface VaultApproval {
  user_id: string;
  user_name?: string;
  role: string;
  decision: string;
  reason?: string;
  timestamp: string;
}

export interface VaultProposal {
  id: string;
  vault_id: string;
  proposer_id: string;
  proposer_name?: string;
  type: ProposalType;
  title: string;
  description: string;
  amount?: string;
  currency?: Currency;
  destination?: string;
  inventory_item_ids?: string[];
  required_approvals: number;
  current_approvals: number;
  approvals: VaultApproval[];
  rejections: VaultApproval[];
  status: ProposalStatus;
  on_chain: boolean;
  tx_hash?: string;
  expires_at: string;
  created_at: string;
  executed_at?: string;
}

export interface ProposalFilters {
  status?: ProposalStatus;
  type?: ProposalType;
  limit?: number;
  offset?: number;
}

export interface ProposalsResult {
  proposals: VaultProposal[];
  total_count: number;
  limit: number;
  offset: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// ACTIVITY
// ═══════════════════════════════════════════════════════════════════════════════

export interface VaultActivity {
  id: string;
  actor_id: string;
  actor_name: string;
  activity_type: VaultActivityType;
  description: string;
  related_entity_id?: string;
  details?: Record<string, unknown>;
  amount?: number;
  currency?: string;
  timestamp: string;
  created_at?: string;
}

export interface ActivityFilters {
  activity_type?: VaultActivityType;
  actor_id?: string;
  from_date?: string;
  to_date?: string;
  limit?: number;
  offset?: number;
}

export interface VaultActivityResult {
  activities: VaultActivity[];
  total_count: number;
  limit: number;
  offset: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// INVENTORY
// ═══════════════════════════════════════════════════════════════════════════════

export interface NFTData {
  chain_id: number;
  chain?: string;
  contract_address: string;
  token_id: string;
  standard: NFTStandard;
  metadata_uri: string;
}

export interface InventoryItem {
  id: string;
  item_type: InventoryItemType;
  /** Alias for item_type */
  type: InventoryItemType;
  name: string;
  description: string;
  image_uri: string;
  /** Alias for image_uri */
  image_url: string;
  rarity: ItemRarity;
  game_id?: string;
  quantity: number;
  tradeable: boolean;
  transferable: boolean;
  nft_data?: NFTData;
  estimated_value?: string;
  metadata?: Record<string, unknown>;
  acquired_at: string;
  expires_at?: string;
  status: InventoryItemStatus;
}

export interface InventoryFilters {
  item_type?: InventoryItemType;
  /** Alias for item_type */
  type?: InventoryItemType;
  rarity?: ItemRarity;
  game_id?: string;
  status?: InventoryItemStatus;
  limit?: number;
  offset?: number;
}

export interface VaultInventoryResult {
  items: InventoryItem[];
  total_count: number;
  limit: number;
  offset: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// ANALYTICS
// ═══════════════════════════════════════════════════════════════════════════════

export interface ContributorSummary {
  user_id: string;
  /** Alias for member_id */
  member_id: string;
  user_name?: string;
  total_deposit: string;
  /** Alias for total_deposit */
  total_deposited: string;
  transaction_count: number;
}

export interface InventoryStats {
  total_items: number;
  nft_count: number;
  unique_types: number;
  total_estimated_value: string;
  /** Alias for total_estimated_value */
  estimated_value: string;
  items_by_rarity: Record<string, number>;
  items_by_type: Record<string, number>;
}

export interface VaultAnalytics {
  vault_id: string;
  squad_id: string;
  time_range: {
    from: string;
    to: string;
  };
  total_income: string;
  total_expenses: string;
  /** Alias fields for convenience on analytics pages */
  total_deposits: string;
  total_withdrawals: string;
  net_flow: string;
  transaction_count: number;
  proposal_count: number;
  /** Breakdown of proposal states */
  total_proposals: number;
  pending_proposals: number;
  approved_proposals: number;
  rejected_proposals: number;
  approval_rate: number;
  avg_approval_time_hrs: number;
  /** Alias for display */
  avg_approval_time?: string;
  top_contributors: ContributorSummary[];
  income_by_type: Record<string, string>;
  expense_by_type: Record<string, string>;
  inventory_stats: InventoryStats;
}

// ═══════════════════════════════════════════════════════════════════════════════
// REQUEST TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface CreateVaultRequest {
  name: string;
  description: string;
}

export interface VaultDepositRequest {
  amount: number;
  currency: Currency;
  idempotency_key?: string;
}

export interface ProposeTransactionRequest {
  type: ProposalType;
  title: string;
  description: string;
  amount: number;
  currency: Currency;
  destination?: string;
}

export interface ApproveProposalRequest {
  reason?: string;
  signature_hash?: string;
}

export interface RejectProposalRequest {
  reason: string;
}

export interface UpdateVaultSettingsRequest {
  approval_policy?: ApprovalPolicy;
  on_chain_threshold?: number;
  daily_withdraw_limit?: number;
  whitelisted_addresses?: string[];
}

export interface DepositItemRequest {
  item_id: string;
}

export interface ProposeItemTransferRequest {
  title: string;
  description: string;
  inventory_item_ids: string[];
  destination_user_id: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

export const getProposalStatusColor = (
  status: ProposalStatus
): "success" | "warning" | "danger" | "default" | "info" => {
  switch (status) {
    case "EXECUTED":
    case "APPROVED":
      return "success";
    case "PENDING":
      return "warning";
    case "REJECTED":
    case "FAILED":
      return "danger";
    case "EXECUTING":
      return "info";
    default:
      return "default";
  }
};

export const getProposalStatusLabel = (status: ProposalStatus): string => {
  const labels: Record<ProposalStatus, string> = {
    PENDING: "Pending",
    APPROVED: "Approved",
    EXECUTING: "Executing",
    EXECUTED: "Executed",
    REJECTED: "Rejected",
    EXPIRED: "Expired",
    CANCELLED: "Cancelled",
    FAILED: "Failed",
  };
  return labels[status] || status;
};

export const getProposalTypeLabel = (type: ProposalType): string => {
  const labels: Record<ProposalType, string> = {
    WITHDRAWAL: "Withdrawal",
    TRANSFER: "Transfer",
    ITEM_TRANSFER: "Item Transfer",
    SETTINGS_CHANGE: "Settings Change",
  };
  return labels[type] || type;
};

export const getItemRarityColor = (rarity: ItemRarity): string => {
  const colors: Record<ItemRarity, string> = {
    COMMON: "#9ca3af",
    UNCOMMON: "#22c55e",
    RARE: "#3b82f6",
    EPIC: "#a855f7",
    LEGENDARY: "#f59e0b",
  };
  return colors[rarity] || "#9ca3af";
};

/** Alias for backward compat */
export const getRarityColor = getItemRarityColor;

/** Format a vault amount (stored as cents string or number) to a display string */
export const formatVaultAmount = (
  amount: string | number | undefined,
  currency?: string
): string => {
  if (amount == null) return '$0.00';
  const numVal = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(numVal)) return '$0.00';
  const dollars = numVal / 100;
  const prefix = currency && currency !== 'USD' ? `${currency} ` : '$';
  return `${prefix}${dollars.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

/** Get an icon name for an activity type */
export const getActivityTypeIcon = (type: VaultActivityType | string): string => {
  const icons: Record<string, string> = {
    VAULT_CREATED: 'solar:safe-square-bold',
    DEPOSIT: 'solar:arrow-down-bold',
    WITHDRAWAL_PROPOSED: 'solar:arrow-up-bold',
    WITHDRAWAL_APPROVED: 'solar:check-circle-bold',
    WITHDRAWAL_REJECTED: 'solar:close-circle-bold',
    WITHDRAWAL_EXECUTED: 'solar:arrow-up-bold',
    TRANSFER_PROPOSED: 'solar:transfer-horizontal-bold',
    TRANSFER_EXECUTED: 'solar:transfer-horizontal-bold',
    SETTINGS_UPDATED: 'solar:settings-bold',
    MEMBER_ADDED: 'solar:user-plus-bold',
    MEMBER_REMOVED: 'solar:user-minus-bold',
    VAULT_LOCKED: 'solar:lock-bold',
    VAULT_UNLOCKED: 'solar:lock-unlocked-bold',
    PROPOSAL_EXPIRED: 'solar:clock-circle-bold',
    PROPOSAL_CANCELLED: 'solar:close-circle-bold',
    ITEM_DEPOSITED: 'solar:box-bold',
    ITEM_TRANSFERRED: 'solar:box-bold',
  };
  return icons[type] || 'solar:document-text-bold';
};

export const getActivityTypeLabel = (type: VaultActivityType): string => {
  const labels: Record<VaultActivityType, string> = {
    VAULT_CREATED: "Vault Created",
    DEPOSIT: "Deposit",
    WITHDRAWAL_PROPOSED: "Withdrawal Proposed",
    WITHDRAWAL_APPROVED: "Withdrawal Approved",
    WITHDRAWAL_REJECTED: "Withdrawal Rejected",
    WITHDRAWAL_EXECUTED: "Withdrawal Executed",
    TRANSFER_PROPOSED: "Transfer Proposed",
    TRANSFER_EXECUTED: "Transfer Executed",
    SETTINGS_UPDATED: "Settings Updated",
    MEMBER_ADDED: "Member Added",
    MEMBER_REMOVED: "Member Removed",
    VAULT_LOCKED: "Vault Locked",
    VAULT_UNLOCKED: "Vault Unlocked",
    PROPOSAL_EXPIRED: "Proposal Expired",
    PROPOSAL_CANCELLED: "Proposal Cancelled",
    ITEM_DEPOSITED: "Item Deposited",
    ITEM_TRANSFERRED: "Item Transferred",
  };
  return labels[type] || type;
};

export const approvalProgress = (proposal: VaultProposal): number => {
  if (proposal.required_approvals === 0) return 100;
  return Math.min(
    100,
    (proposal.current_approvals / proposal.required_approvals) * 100
  );
};

export const isProposalActionable = (proposal: VaultProposal): boolean => {
  return proposal.status === "PENDING";
};

export const hasProposalExpired = (proposal: VaultProposal): boolean => {
  return new Date(proposal.expires_at) < new Date();
};

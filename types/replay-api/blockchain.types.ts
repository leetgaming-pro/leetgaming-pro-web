/**
 * Blockchain Types for LeetGaming.PRO
 *
 * Multi-chain support for Solana and EVM-compatible chains
 * Includes types for smart wallets, prize pools, ledger entries, and transactions
 */

// ============ Chain Identification (CAIP-2/CAIP-19) ============

/**
 * Chain type classification
 */
export type ChainType = "Solana" | "EVM" | "Bitcoin" | "Cosmos";

/**
 * Supported chain identifiers (CAIP-2 format)
 */
export type ChainID =
  // Solana Networks
  | "solana:mainnet"
  | "solana:devnet"
  | "solana:testnet"
  | "solana:localnet"
  // EVM Networks (Mainnet)
  | "eip155:1" // Ethereum
  | "eip155:137" // Polygon
  | "eip155:8453" // Base
  | "eip155:42161" // Arbitrum
  | "eip155:10" // Optimism
  | "eip155:43114" // Avalanche
  | "eip155:56" // BSC
  // EVM Testnets
  | "eip155:11155111" // Sepolia
  | "eip155:80001" // Polygon Mumbai
  | "eip155:84532" // Base Sepolia
  | "eip155:31337"; // Hardhat Local

/**
 * Chain configuration
 */
export interface ChainConfig {
  chain_id: ChainID;
  chain_type: ChainType;
  name: string;
  native_currency: string;
  native_decimals: number;
  rpc_url?: string;
  ws_url?: string;
  explorer_url: string;
  explorer_api_url?: string;
  is_testnet: boolean;
  supports_aa: boolean; // ERC-4337 Account Abstraction
  entry_point_addr?: string;
  paymaster_addr?: string;
  block_time_ms: number;
  confirmations: number;
}

/**
 * Chain metadata with display info
 */
export const CHAIN_CONFIGS: Record<ChainID, ChainConfig> = {
  "solana:mainnet": {
    chain_id: "solana:mainnet",
    chain_type: "Solana",
    name: "Solana",
    native_currency: "SOL",
    native_decimals: 9,
    explorer_url: "https://solscan.io",
    is_testnet: false,
    supports_aa: false,
    block_time_ms: 400,
    confirmations: 32,
  },
  "solana:devnet": {
    chain_id: "solana:devnet",
    chain_type: "Solana",
    name: "Solana Devnet",
    native_currency: "SOL",
    native_decimals: 9,
    explorer_url: "https://solscan.io?cluster=devnet",
    is_testnet: true,
    supports_aa: false,
    block_time_ms: 400,
    confirmations: 32,
  },
  "solana:testnet": {
    chain_id: "solana:testnet",
    chain_type: "Solana",
    name: "Solana Testnet",
    native_currency: "SOL",
    native_decimals: 9,
    explorer_url: "https://solscan.io?cluster=testnet",
    is_testnet: true,
    supports_aa: false,
    block_time_ms: 400,
    confirmations: 32,
  },
  "solana:localnet": {
    chain_id: "solana:localnet",
    chain_type: "Solana",
    name: "Solana Local",
    native_currency: "SOL",
    native_decimals: 9,
    explorer_url: "",
    is_testnet: true,
    supports_aa: false,
    block_time_ms: 400,
    confirmations: 1,
  },
  "eip155:1": {
    chain_id: "eip155:1",
    chain_type: "EVM",
    name: "Ethereum",
    native_currency: "ETH",
    native_decimals: 18,
    explorer_url: "https://etherscan.io",
    is_testnet: false,
    supports_aa: true,
    block_time_ms: 12000,
    confirmations: 12,
  },
  "eip155:137": {
    chain_id: "eip155:137",
    chain_type: "EVM",
    name: "Polygon",
    native_currency: "MATIC",
    native_decimals: 18,
    explorer_url: "https://polygonscan.com",
    is_testnet: false,
    supports_aa: true,
    block_time_ms: 2000,
    confirmations: 128,
  },
  "eip155:8453": {
    chain_id: "eip155:8453",
    chain_type: "EVM",
    name: "Base",
    native_currency: "ETH",
    native_decimals: 18,
    explorer_url: "https://basescan.org",
    is_testnet: false,
    supports_aa: true,
    block_time_ms: 2000,
    confirmations: 12,
  },
  "eip155:42161": {
    chain_id: "eip155:42161",
    chain_type: "EVM",
    name: "Arbitrum One",
    native_currency: "ETH",
    native_decimals: 18,
    explorer_url: "https://arbiscan.io",
    is_testnet: false,
    supports_aa: true,
    block_time_ms: 250,
    confirmations: 12,
  },
  "eip155:10": {
    chain_id: "eip155:10",
    chain_type: "EVM",
    name: "Optimism",
    native_currency: "ETH",
    native_decimals: 18,
    explorer_url: "https://optimistic.etherscan.io",
    is_testnet: false,
    supports_aa: true,
    block_time_ms: 2000,
    confirmations: 12,
  },
  "eip155:43114": {
    chain_id: "eip155:43114",
    chain_type: "EVM",
    name: "Avalanche",
    native_currency: "AVAX",
    native_decimals: 18,
    explorer_url: "https://snowtrace.io",
    is_testnet: false,
    supports_aa: true,
    block_time_ms: 2000,
    confirmations: 12,
  },
  "eip155:56": {
    chain_id: "eip155:56",
    chain_type: "EVM",
    name: "BNB Chain",
    native_currency: "BNB",
    native_decimals: 18,
    explorer_url: "https://bscscan.com",
    is_testnet: false,
    supports_aa: true,
    block_time_ms: 3000,
    confirmations: 15,
  },
  "eip155:11155111": {
    chain_id: "eip155:11155111",
    chain_type: "EVM",
    name: "Sepolia",
    native_currency: "ETH",
    native_decimals: 18,
    explorer_url: "https://sepolia.etherscan.io",
    is_testnet: true,
    supports_aa: true,
    block_time_ms: 12000,
    confirmations: 3,
  },
  "eip155:80001": {
    chain_id: "eip155:80001",
    chain_type: "EVM",
    name: "Polygon Mumbai",
    native_currency: "MATIC",
    native_decimals: 18,
    explorer_url: "https://mumbai.polygonscan.com",
    is_testnet: true,
    supports_aa: true,
    block_time_ms: 2000,
    confirmations: 3,
  },
  "eip155:84532": {
    chain_id: "eip155:84532",
    chain_type: "EVM",
    name: "Base Sepolia",
    native_currency: "ETH",
    native_decimals: 18,
    explorer_url: "https://sepolia.basescan.org",
    is_testnet: true,
    supports_aa: true,
    block_time_ms: 2000,
    confirmations: 3,
  },
  "eip155:31337": {
    chain_id: "eip155:31337",
    chain_type: "EVM",
    name: "Hardhat Local",
    native_currency: "ETH",
    native_decimals: 18,
    explorer_url: "",
    is_testnet: true,
    supports_aa: true,
    block_time_ms: 1000,
    confirmations: 1,
  },
};

// ============ Asset Identification (CAIP-19) ============

/**
 * Token standard types
 */
export type TokenStandard = "SPL" | "ERC20" | "ERC721" | "ERC1155" | "Native";

/**
 * Asset identifier (CAIP-19 format)
 */
export interface AssetID {
  chain_id: ChainID;
  token_standard: TokenStandard;
  token_address: string;
}

/**
 * Common stablecoin assets
 */
export const STABLECOIN_ASSETS = {
  // Solana
  USDC_SOLANA: {
    chain_id: "solana:mainnet" as ChainID,
    token_standard: "SPL" as TokenStandard,
    token_address: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
  },
  USDT_SOLANA: {
    chain_id: "solana:mainnet" as ChainID,
    token_standard: "SPL" as TokenStandard,
    token_address: "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB",
  },
  // Polygon
  USDC_POLYGON: {
    chain_id: "eip155:137" as ChainID,
    token_standard: "ERC20" as TokenStandard,
    token_address: "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359",
  },
  // Base
  USDC_BASE: {
    chain_id: "eip155:8453" as ChainID,
    token_standard: "ERC20" as TokenStandard,
    token_address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
  },
  // Arbitrum
  USDC_ARBITRUM: {
    chain_id: "eip155:42161" as ChainID,
    token_standard: "ERC20" as TokenStandard,
    token_address: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
  },
};

// ============ Smart Wallet Types ============

/**
 * Wallet status
 */
export type SmartWalletStatus =
  | "pending"
  | "creating"
  | "active"
  | "frozen"
  | "recovering"
  | "suspended";

/**
 * Guardian type for social recovery
 */
export type GuardianType =
  | "wallet"
  | "email"
  | "phone"
  | "hardware"
  | "institution";

/**
 * Guardian information
 */
export interface Guardian {
  address: string;
  guardian_type: GuardianType;
  added_at: string;
  is_active: boolean;
  label?: string;
}

/**
 * Session key for delegated signing
 */
export interface SessionKey {
  key_address: string;
  valid_after: string;
  valid_until: string;
  spending_limit: string;
  spent: string;
  allowed_tokens: string[];
  is_active: boolean;
}

/**
 * Transaction limits
 */
export interface TransactionLimits {
  daily_limit: string;
  weekly_limit: string;
  monthly_limit: string;
  single_tx_limit: string;
  daily_used: string;
  weekly_used: string;
  monthly_used: string;
  daily_remaining: string;
}

/**
 * Recovery request status
 */
export interface RecoveryRequest {
  new_owner: string;
  initiated_at: string;
  executable_at: string;
  approval_count: number;
  required_approvals: number;
  is_executed: boolean;
  approving_guardians: string[];
}

/**
 * Smart wallet entity
 */
export interface SmartWallet {
  id: string;
  user_id: string;
  label: string;
  status: SmartWalletStatus;
  primary_chain: ChainID;
  addresses: Record<ChainID, string>;
  public_key: string;
  is_frozen: boolean;
  limits: TransactionLimits;
  guardians: Guardian[];
  guardian_threshold: number;
  session_keys: SessionKey[];
  pending_recovery?: RecoveryRequest;
  deployed_chains: ChainID[];
  created_at: string;
  updated_at: string;
  metadata?: Record<string, unknown>;
}

/**
 * Create wallet request
 */
export interface CreateSmartWalletRequest {
  label: string;
  primary_chain: ChainID;
  additional_chains?: ChainID[];
  daily_limit?: string;
  recovery_delay_hours?: number;
}

/**
 * Deploy wallet request
 */
export interface DeployWalletRequest {
  wallet_id: string;
  chain_id: ChainID;
}

/**
 * Add guardian request
 */
export interface AddGuardianRequest {
  wallet_id: string;
  guardian_address: string;
  guardian_type: GuardianType;
  label?: string;
}

/**
 * Create session key request
 */
export interface CreateSessionKeyRequest {
  wallet_id: string;
  key_address: string;
  valid_duration_hours: number;
  spending_limit: string;
  allowed_tokens?: string[];
}

// ============ Prize Pool Types ============

/**
 * Prize pool status
 */
export type PrizePoolStatus =
  | "not_created"
  | "accumulating"
  | "locked"
  | "in_escrow"
  | "distributed"
  | "cancelled";

/**
 * Prize winner information
 */
export interface PrizeWinner {
  address: string;
  wallet_id: string;
  rank: number;
  amount: string;
  share_bps: number; // Basis points (10000 = 100%)
  is_mvp: boolean;
  withdrawn_at?: string;
}

/**
 * Prize pool entity
 */
export interface PrizePool {
  id: string;
  match_id: string;
  on_chain_id: string;
  chain_id: ChainID;
  contract_address: string;
  token_address: string;
  currency: string;
  total_amount: string;
  platform_contribution: string;
  entry_fee_per_player: string;
  platform_fee_percent: number; // Basis points
  participant_count: number;
  participants: string[];
  status: PrizePoolStatus;
  created_at: string;
  locked_at?: string;
  escrow_end_time?: string;
  distributed_at?: string;
  winners?: PrizeWinner[];
  platform_fee_collected?: string;
  create_tx_hash?: string;
  lock_tx_hash?: string;
  distribute_tx_hash?: string;
  is_synced: boolean;
  last_sync_block: number;
}

/**
 * Create prize pool request
 */
export interface CreatePrizePoolRequest {
  match_id: string;
  chain_id: ChainID;
  token_address: string;
  entry_fee: string;
  platform_fee_percent: number;
}

/**
 * Join prize pool request
 */
export interface JoinPrizePoolRequest {
  match_id: string;
  wallet_id: string;
}

/**
 * Distribute prizes request
 */
export interface DistributePrizesRequest {
  match_id: string;
  winners: {
    wallet_id: string;
    rank: number;
    share_bps: number;
    is_mvp: boolean;
  }[];
}

// ============ Ledger Types ============

/**
 * Ledger entry category
 */
export type LedgerCategory =
  | "DEPOSIT"
  | "WITHDRAWAL"
  | "ENTRY_FEE"
  | "PRIZE"
  | "REFUND"
  | "PLATFORM_FEE"
  | "TRANSFER";

/**
 * Ledger entry (immutable on-chain record)
 */
export interface LedgerEntry {
  transaction_id: string;
  account: string;
  token: string;
  amount: string; // Positive = credit, negative = debit
  category: LedgerCategory;
  match_id?: string;
  tournament_id?: string;
  timestamp: string;
  block_number: number;
  previous_hash: string;
  merkle_root: string;
  entry_index: number;
}

/**
 * Ledger entry proof for external verification
 */
export interface LedgerEntryProof {
  entry_hash: string;
  previous_hash: string;
  merkle_root: string;
  block_number: number;
  chain_id: ChainID;
}

/**
 * Ledger filters
 */
export interface LedgerFilters {
  account?: string;
  token?: string;
  category?: LedgerCategory;
  match_id?: string;
  tournament_id?: string;
  from_date?: string;
  to_date?: string;
  limit?: number;
  offset?: number;
}

/**
 * Ledger entries result
 */
export interface LedgerEntriesResult {
  entries: LedgerEntry[];
  total_count: number;
  current_merkle_root: string;
}

// ============ Blockchain Transaction Types ============

/**
 * Blockchain transaction status
 */
export type BlockchainTxStatus =
  | "pending"
  | "submitted"
  | "confirmed"
  | "failed"
  | "replaced";

/**
 * Blockchain transaction type
 */
export type BlockchainTxType =
  | "deposit"
  | "withdrawal"
  | "entry_fee"
  | "prize"
  | "refund"
  | "platform_fee"
  | "contract_call"
  | "bridge";

/**
 * Blockchain transaction
 */
export interface BlockchainTransaction {
  id: string;
  chain_id: ChainID;
  tx_hash: string;
  block_number?: number;
  block_hash?: string;
  type: BlockchainTxType;
  status: BlockchainTxStatus;
  from_address: string;
  to_address: string;
  token_address?: string;
  currency: string;
  amount: string;
  gas_limit: number;
  gas_used?: number;
  gas_price: string;
  max_fee_per_gas?: string;
  max_priority_fee_per_gas?: string;
  nonce: number;
  error_message?: string;
  submitted_at: string;
  confirmed_at?: string;
  metadata?: Record<string, unknown>;
}

// ============ Gas Sponsorship Types ============

/**
 * Payment mode for gas
 */
export type GasPaymentMode =
  | "sponsored"
  | "gas_credits"
  | "token_payment"
  | "verified_free";

/**
 * Gas credits balance
 */
export interface GasCreditsBalance {
  wallet_address: string;
  available_credits: string;
  used_today: string;
  daily_limit: string;
  last_reset: string;
}

/**
 * Sponsorship config
 */
export interface SponsorshipConfig {
  is_active: boolean;
  daily_limit: string;
  per_tx_limit: string;
  daily_used: string;
  allowed_targets: string[];
}

// ============ Helper Functions ============

/**
 * Get chain config by ID
 */
export const getChainConfig = (chainId: ChainID): ChainConfig | undefined => {
  return CHAIN_CONFIGS[chainId];
};

/**
 * Check if chain is Solana
 */
export const isSolanaChain = (chainId: ChainID): boolean => {
  return chainId.startsWith("solana:");
};

/**
 * Check if chain is EVM
 */
export const isEVMChain = (chainId: ChainID): boolean => {
  return chainId.startsWith("eip155:");
};

/**
 * Get EVM chain ID number from CAIP-2
 */
export const getEVMChainNumber = (chainId: ChainID): number | null => {
  if (!isEVMChain(chainId)) return null;
  const match = chainId.match(/^eip155:(\d+)$/);
  return match ? parseInt(match[1], 10) : null;
};

/**
 * Format address for display
 */
export const formatBlockchainAddress = (
  address: string,
  length: number = 8
): string => {
  if (!address) return "";
  if (address.length <= length * 2) return address;
  return `${address.slice(0, length)}...${address.slice(-length)}`;
};

/**
 * Get explorer URL for transaction
 */
export const getExplorerTxUrl = (chainId: ChainID, txHash: string): string => {
  const config = CHAIN_CONFIGS[chainId];
  if (!config?.explorer_url) return "";

  if (isSolanaChain(chainId)) {
    return `${config.explorer_url}/tx/${txHash}`;
  }
  return `${config.explorer_url}/tx/${txHash}`;
};

/**
 * Get explorer URL for address
 */
export const getExplorerAddressUrl = (
  chainId: ChainID,
  address: string
): string => {
  const config = CHAIN_CONFIGS[chainId];
  if (!config?.explorer_url) return "";

  if (isSolanaChain(chainId)) {
    return `${config.explorer_url}/account/${address}`;
  }
  return `${config.explorer_url}/address/${address}`;
};

/**
 * Get prize pool status display info
 */
export const getPrizePoolStatusInfo = (
  status: PrizePoolStatus
): { label: string; color: "default" | "primary" | "success" | "warning" | "danger" } => {
  const info: Record<
    PrizePoolStatus,
    { label: string; color: "default" | "primary" | "success" | "warning" | "danger" }
  > = {
    not_created: { label: "Not Created", color: "default" },
    accumulating: { label: "Open", color: "primary" },
    locked: { label: "In Progress", color: "warning" },
    in_escrow: { label: "Escrow", color: "warning" },
    distributed: { label: "Completed", color: "success" },
    cancelled: { label: "Cancelled", color: "danger" },
  };
  return info[status] ?? { label: status, color: "default" };
};

/**
 * Get wallet status display info
 */
export const getWalletStatusInfo = (
  status: SmartWalletStatus
): { label: string; color: "default" | "primary" | "success" | "warning" | "danger" } => {
  const info: Record<
    SmartWalletStatus,
    { label: string; color: "default" | "primary" | "success" | "warning" | "danger" }
  > = {
    pending: { label: "Pending", color: "default" },
    creating: { label: "Creating", color: "primary" },
    active: { label: "Active", color: "success" },
    frozen: { label: "Frozen", color: "danger" },
    recovering: { label: "Recovering", color: "warning" },
    suspended: { label: "Suspended", color: "danger" },
  };
  return info[status] ?? { label: status, color: "default" };
};

/**
 * Calculate escrow remaining time
 */
export const getEscrowRemainingTime = (
  escrowEndTime: string | undefined
): { hours: number; minutes: number; isComplete: boolean } => {
  if (!escrowEndTime) {
    return { hours: 0, minutes: 0, isComplete: true };
  }

  const endTime = new Date(escrowEndTime).getTime();
  const now = Date.now();
  const remaining = endTime - now;

  if (remaining <= 0) {
    return { hours: 0, minutes: 0, isComplete: true };
  }

  const hours = Math.floor(remaining / (1000 * 60 * 60));
  const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));

  return { hours, minutes, isComplete: false };
};


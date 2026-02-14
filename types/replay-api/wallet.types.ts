/**
 * Wallet Types for LeetGaming.PRO
 * Clean, minimal types using inheritance to reduce bloat
 */

// Base types
export type Currency = "USD" | "USDC" | "USDT";
export type TransactionType =
  | "deposit"
  | "withdrawal"
  | "entry_fee"
  | "prize_payout"
  | "platform_fee"
  | "refund";
export type EntryType = "debit" | "credit";
export type AssetType = "fiat" | "crypto" | "token";
export type TransactionStatus =
  | "pending"
  | "confirmed"
  | "failed"
  | "cancelled";
export type PaymentMethod =
  | "crypto"
  | "credit_card"
  | "pix"
  | "bank_transfer";

// Supported chain IDs (matches Go backend ChainID type)
export const ChainID = {
  None: 0,
  EthereumMainnet: 1,
  PolygonMainnet: 137,
  PolygonAmoy: 80002,
  ArbitrumOne: 42161,
  BaseMainnet: 8453,
} as const;
export type ChainID = (typeof ChainID)[keyof typeof ChainID];

export const SupportedChains: {
  id: ChainID;
  name: string;
  symbol: string;
  explorer: string;
  isTestnet: boolean;
}[] = [
  {
    id: ChainID.PolygonMainnet,
    name: "Polygon",
    symbol: "MATIC",
    explorer: "https://polygonscan.com",
    isTestnet: false,
  },
  {
    id: ChainID.EthereumMainnet,
    name: "Ethereum",
    symbol: "ETH",
    explorer: "https://etherscan.io",
    isTestnet: false,
  },
  {
    id: ChainID.ArbitrumOne,
    name: "Arbitrum",
    symbol: "ETH",
    explorer: "https://arbiscan.io",
    isTestnet: false,
  },
  {
    id: ChainID.BaseMainnet,
    name: "Base",
    symbol: "ETH",
    explorer: "https://basescan.org",
    isTestnet: false,
  },
  {
    id: ChainID.PolygonAmoy,
    name: "Polygon Amoy (Testnet)",
    symbol: "MATIC",
    explorer: "https://amoy.polygonscan.com",
    isTestnet: true,
  },
];

// Base interface for paginated results
export interface PaginatedResult<T> {
  items: T[];
  total_count: number;
  limit: number;
  offset: number;
}

// Computed getter for has_more
export const hasMore = (result: PaginatedResult<unknown>): boolean =>
  result.offset + result.items.length < result.total_count;

// Core types
export interface Amount {
  cents: number;
  dollars: number;
}

export interface EVMAddress {
  address: string;
}

// Wallet balance (matches Go WalletBalanceResult + legacy frontend fields)
export interface WalletBalance {
  // API fields
  wallet_id?: string;
  user_id: string;
  evm_address?: string | EVMAddress;
  balances: Record<string, string | Amount>;
  total_deposited: string | Amount;
  total_withdrawn: string | Amount;
  total_prizes_won: string | Amount;
  is_locked: boolean;
  lock_reason?: string;
  created_at?: string;
  updated_at?: string;
  version?: number; // Optimistic locking — incremented on every mutation
  // Legacy fields (for backwards compatibility)
  id?: string;
  pending_transactions?: string[];
  daily_prize_winnings?: string | Amount;
  last_prize_win_date?: string;
}

// Transaction (matches Go TransactionDTO)
export interface Transaction {
  id: string;
  transaction_id: string;
  type: string;
  entry_type: EntryType;
  asset_type: AssetType;
  currency?: string;
  amount: string;
  balance_after: string;
  description: string;
  created_at: string;
  is_reversed: boolean;
  // Chain & payment method
  chain_id?: ChainID;
  payment_method?: PaymentMethod;
  contract_address?: string;
  // Optional fields for full transaction details
  wallet_id?: string;
  status?: TransactionStatus;
  blockchain_tx_hash?: string;
  gas_fee?: Amount;
  metadata?: Record<string, unknown>;
  updated_at?: string;
  confirmed_at?: string;
}

// Transaction list result
export interface TransactionsResult
  extends Omit<PaginatedResult<Transaction>, "items"> {
  transactions: Transaction[];
  has_more?: boolean; // computed from total_count > offset + items.length
}

// Legacy response type alias
export type TransactionHistoryResponse = TransactionsResult;

// Transaction filters
export interface TransactionFilters {
  currency?: Currency;
  asset_type?: AssetType;
  entry_type?: EntryType;
  operation_type?: string;
  type?: TransactionType;
  status?: TransactionStatus;
  from_date?: string;
  to_date?: string;
  limit?: number;
  offset?: number;
  sort_by?: "created_at" | "amount";
  sort_order?: "asc" | "desc";
}

// Request types
export interface DepositRequest {
  currency: Currency;
  amount: number;
  payment_method?: PaymentMethod;
  chain_id?: ChainID;
  tx_hash?: string;
  idempotency_key?: string; // Client-generated key for duplicate prevention
  metadata?: Record<string, unknown>;
}

export interface WithdrawRequest {
  currency: Currency;
  amount: number;
  to_address: string;
  chain_id?: ChainID;
  payment_method?: PaymentMethod;
  idempotency_key?: string; // Client-generated key for duplicate prevention
  metadata?: Record<string, unknown>;
}

// Type aliases for backwards compatibility
export type WalletBalanceResult = WalletBalance;
export type TransactionDTO = Transaction;
export type WalletTransaction = Transaction;
export type UserWallet = WalletBalance;

// Helper functions for union types (reduces bloat in consumer components)
export const getAmountValue = (
  value: string | Amount | undefined
): { dollars: number; cents: number } => {
  if (!value) return { dollars: 0, cents: 0 };
  if (typeof value === "string") {
    const parsed = parseFloat(value) || 0;
    return { dollars: parsed, cents: Math.round(parsed * 100) };
  }
  return { dollars: value.dollars, cents: value.cents };
};

export const getEVMAddressValue = (
  value: string | EVMAddress | undefined
): string => {
  if (!value) return "";
  return typeof value === "string" ? value : value.address;
};

export const getBalanceValue = (
  balances: Record<string, string | Amount> | undefined,
  currency: string
): number => {
  if (!balances) return 0;
  const value = balances[currency];
  return getAmountValue(value).dollars;
};

// Formatting helpers
export const formatAmount = (amount: string | Amount | undefined): string => {
  const { dollars } = getAmountValue(amount);
  return `$${dollars.toFixed(2)}`;
};

export const formatEVMAddress = (
  address: EVMAddress | string | undefined,
  short = true
): string => {
  const addr = getEVMAddressValue(address);
  if (!addr) return "";
  return short && addr.length > 10
    ? `${addr.slice(0, 6)}...${addr.slice(-4)}`
    : addr;
};

export const getTransactionStatusColor = (
  status: TransactionStatus
): "success" | "warning" | "danger" | "default" => {
  const colors: Record<
    TransactionStatus,
    "success" | "warning" | "danger" | "default"
  > = {
    confirmed: "success",
    pending: "warning",
    failed: "danger",
    cancelled: "danger",
  };
  return colors[status] ?? "default";
};

export const getTransactionTypeIcon = (type: string): string => {
  const icons: Record<string, string> = {
    deposit: "solar:download-minimalistic-bold",
    withdrawal: "solar:upload-minimalistic-bold",
    entry_fee: "solar:ticket-bold",
    prize_payout: "solar:cup-star-bold",
    platform_fee: "solar:settings-bold",
    refund: "solar:refresh-bold",
    // PascalCase variants (API)
    Deposit: "solar:download-minimalistic-bold",
    Withdrawal: "solar:upload-minimalistic-bold",
    EntryFee: "solar:ticket-bold",
    PrizePayout: "solar:cup-star-bold",
    PlatformFee: "solar:settings-bold",
    Refund: "solar:refresh-bold",
  };
  return icons[type] ?? "solar:dollar-bold";
};

export const getCurrencyInfo = (currency: Currency) => {
  const info: Record<
    Currency,
    { name: string; symbol: string; decimals: number; isStablecoin: boolean }
  > = {
    USD: { name: "US Dollar", symbol: "$", decimals: 2, isStablecoin: false },
    USDC: { name: "USD Coin", symbol: "$", decimals: 6, isStablecoin: true },
    USDT: { name: "Tether USD", symbol: "$", decimals: 6, isStablecoin: true },
  };
  return (
    info[currency] ?? {
      name: "Unknown",
      symbol: "$",
      decimals: 2,
      isStablecoin: false,
    }
  );
};

// Normalize transaction type (API returns PascalCase, frontend uses snake_case)
export const normalizeTransactionType = (type: string): TransactionType => {
  const mapping: Record<string, TransactionType> = {
    Deposit: "deposit",
    Withdrawal: "withdrawal",
    EntryFee: "entry_fee",
    PrizePayout: "prize_payout",
    PlatformFee: "platform_fee",
    Refund: "refund",
  };
  return mapping[type] ?? (type as TransactionType);
};

// Chain helpers
export const getChainName = (chainId: ChainID): string => {
  const chain = SupportedChains.find((c) => c.id === chainId);
  return chain?.name ?? "Unknown";
};

export const getChainExplorerUrl = (
  chainId: ChainID,
  txHash: string
): string => {
  const chain = SupportedChains.find((c) => c.id === chainId);
  if (!chain) return "";
  return `${chain.explorer}/tx/${txHash}`;
};

export const getMainnetChains = () =>
  SupportedChains.filter((c) => !c.isTestnet);

export const isPaymentMethodCrypto = (method?: PaymentMethod): boolean =>
  method === "crypto";

export const getPaymentMethodLabel = (method?: PaymentMethod): string => {
  const labels: Record<PaymentMethod, string> = {
    crypto: "Cryptocurrency",
    credit_card: "Credit Card",
    pix: "PIX",
    bank_transfer: "Bank Transfer",
  };
  return method ? labels[method] ?? method : "Unknown";
};

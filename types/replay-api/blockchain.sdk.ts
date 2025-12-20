/**
 * Blockchain API SDK for LeetGaming.PRO
 *
 * Provides high-level, type-safe methods for blockchain operations:
 * - Smart wallet management (ERC-4337)
 * - Prize pool operations
 * - Ledger queries
 * - Multi-chain support
 */

import { ReplayApiClient } from "./replay-api.client";
import type {
  ChainID,
  SmartWallet,
  CreateSmartWalletRequest,
  DeployWalletRequest,
  AddGuardianRequest,
  CreateSessionKeyRequest,
  TransactionLimits,
  RecoveryRequest,
  PrizePool,
  CreatePrizePoolRequest,
  JoinPrizePoolRequest,
  DistributePrizesRequest,
  PrizePoolStatus,
  LedgerEntry,
  LedgerFilters,
  LedgerEntriesResult,
  LedgerEntryProof,
  BlockchainTransaction,
  GasCreditsBalance,
  SponsorshipConfig,
} from "./blockchain.types";

// ============ Smart Wallet API ============

export class SmartWalletAPI {
  constructor(private client: ReplayApiClient) {}

  /**
   * Create a new smart wallet with MPC keys
   */
  async createWallet(
    request: CreateSmartWalletRequest
  ): Promise<SmartWallet | null> {
    const response = await this.client.post<SmartWallet>(
      "/blockchain/wallets",
      request
    );
    if (response.error) {
      console.error("Failed to create smart wallet:", response.error);
      return null;
    }
    return response.data || null;
  }

  /**
   * Get wallet by ID
   */
  async getWallet(walletId: string): Promise<SmartWallet | null> {
    const response = await this.client.get<SmartWallet>(
      `/blockchain/wallets/${walletId}`
    );
    if (response.error) {
      console.error("Failed to get smart wallet:", response.error);
      return null;
    }
    return response.data || null;
  }

  /**
   * Get all wallets for current user
   */
  async getUserWallets(): Promise<SmartWallet[]> {
    const response = await this.client.get<{ wallets: SmartWallet[] }>(
      "/blockchain/wallets"
    );
    if (response.error) {
      console.error("Failed to get user wallets:", response.error);
      return [];
    }
    return response.data?.wallets || [];
  }

  /**
   * Deploy wallet to a specific chain
   */
  async deployWallet(
    request: DeployWalletRequest
  ): Promise<{ tx_hash: string; address: string } | null> {
    const response = await this.client.post<{ tx_hash: string; address: string }>(
      `/blockchain/wallets/${request.wallet_id}/deploy`,
      { chain_id: request.chain_id }
    );
    if (response.error) {
      console.error("Failed to deploy wallet:", response.error);
      return null;
    }
    return response.data || null;
  }

  /**
   * Get wallet balances across all chains
   */
  async getBalances(
    walletId: string
  ): Promise<Record<ChainID, Record<string, string>> | null> {
    const response = await this.client.get<{
      balances: Record<ChainID, Record<string, string>>;
    }>(`/blockchain/wallets/${walletId}/balances`);
    if (response.error) {
      console.error("Failed to get wallet balances:", response.error);
      return null;
    }
    return response.data?.balances || null;
  }

  /**
   * Get transaction limits
   */
  async getLimits(walletId: string): Promise<TransactionLimits | null> {
    const response = await this.client.get<TransactionLimits>(
      `/blockchain/wallets/${walletId}/limits`
    );
    if (response.error) {
      console.error("Failed to get wallet limits:", response.error);
      return null;
    }
    return response.data || null;
  }

  /**
   * Update daily spending limit
   */
  async setDailyLimit(
    walletId: string,
    dailyLimit: string
  ): Promise<boolean> {
    const response = await this.client.put(
      `/blockchain/wallets/${walletId}/limits`,
      { daily_limit: dailyLimit }
    );
    return !response.error;
  }

  /**
   * Add a guardian for social recovery
   */
  async addGuardian(request: AddGuardianRequest): Promise<boolean> {
    const response = await this.client.post(
      `/blockchain/wallets/${request.wallet_id}/guardians`,
      {
        guardian_address: request.guardian_address,
        guardian_type: request.guardian_type,
        label: request.label,
      }
    );
    return !response.error;
  }

  /**
   * Remove a guardian
   */
  async removeGuardian(
    walletId: string,
    guardianAddress: string
  ): Promise<boolean> {
    const response = await this.client.delete(
      `/blockchain/wallets/${walletId}/guardians/${guardianAddress}`
    );
    return !response.error;
  }

  /**
   * Set guardian threshold
   */
  async setGuardianThreshold(
    walletId: string,
    threshold: number
  ): Promise<boolean> {
    const response = await this.client.put(
      `/blockchain/wallets/${walletId}/guardian-threshold`,
      { threshold }
    );
    return !response.error;
  }

  /**
   * Create a session key for delegated signing
   */
  async createSessionKey(request: CreateSessionKeyRequest): Promise<boolean> {
    const response = await this.client.post(
      `/blockchain/wallets/${request.wallet_id}/session-keys`,
      {
        key_address: request.key_address,
        valid_duration_hours: request.valid_duration_hours,
        spending_limit: request.spending_limit,
        allowed_tokens: request.allowed_tokens,
      }
    );
    return !response.error;
  }

  /**
   * Revoke a session key
   */
  async revokeSessionKey(
    walletId: string,
    keyAddress: string
  ): Promise<boolean> {
    const response = await this.client.delete(
      `/blockchain/wallets/${walletId}/session-keys/${keyAddress}`
    );
    return !response.error;
  }

  /**
   * Freeze wallet (emergency)
   */
  async freezeWallet(walletId: string): Promise<boolean> {
    const response = await this.client.post(
      `/blockchain/wallets/${walletId}/freeze`,
      {}
    );
    return !response.error;
  }

  /**
   * Unfreeze wallet
   */
  async unfreezeWallet(walletId: string): Promise<boolean> {
    const response = await this.client.post(
      `/blockchain/wallets/${walletId}/unfreeze`,
      {}
    );
    return !response.error;
  }

  /**
   * Initiate social recovery
   */
  async initiateRecovery(
    walletId: string,
    newOwnerAddress: string
  ): Promise<boolean> {
    const response = await this.client.post(
      `/blockchain/wallets/${walletId}/recovery/initiate`,
      { new_owner: newOwnerAddress }
    );
    return !response.error;
  }

  /**
   * Approve a pending recovery (as guardian)
   */
  async approveRecovery(walletId: string): Promise<boolean> {
    const response = await this.client.post(
      `/blockchain/wallets/${walletId}/recovery/approve`,
      {}
    );
    return !response.error;
  }

  /**
   * Execute recovery (after threshold and delay met)
   */
  async executeRecovery(walletId: string): Promise<boolean> {
    const response = await this.client.post(
      `/blockchain/wallets/${walletId}/recovery/execute`,
      {}
    );
    return !response.error;
  }

  /**
   * Cancel pending recovery
   */
  async cancelRecovery(walletId: string): Promise<boolean> {
    const response = await this.client.post(
      `/blockchain/wallets/${walletId}/recovery/cancel`,
      {}
    );
    return !response.error;
  }

  /**
   * Get pending recovery info
   */
  async getRecoveryStatus(walletId: string): Promise<RecoveryRequest | null> {
    const response = await this.client.get<RecoveryRequest>(
      `/blockchain/wallets/${walletId}/recovery`
    );
    if (response.error) {
      return null;
    }
    return response.data || null;
  }
}

// ============ Prize Pool API ============

export class PrizePoolAPI {
  constructor(private client: ReplayApiClient) {}

  /**
   * Create a new prize pool for a match
   */
  async createPrizePool(
    request: CreatePrizePoolRequest
  ): Promise<PrizePool | null> {
    const response = await this.client.post<PrizePool>(
      "/blockchain/prize-pools",
      request
    );
    if (response.error) {
      console.error("Failed to create prize pool:", response.error);
      return null;
    }
    return response.data || null;
  }

  /**
   * Get prize pool by match ID
   */
  async getPrizePool(matchId: string): Promise<PrizePool | null> {
    const response = await this.client.get<PrizePool>(
      `/blockchain/prize-pools/${matchId}`
    );
    if (response.error) {
      return null;
    }
    return response.data || null;
  }

  /**
   * Get all prize pools with optional filters
   */
  async getPrizePools(filters?: {
    status?: PrizePoolStatus;
    chain_id?: ChainID;
    limit?: number;
    offset?: number;
  }): Promise<{ pools: PrizePool[]; total_count: number }> {
    const params = new URLSearchParams();
    if (filters?.status) params.append("status", filters.status);
    if (filters?.chain_id) params.append("chain_id", filters.chain_id);
    if (filters?.limit) params.append("limit", String(filters.limit));
    if (filters?.offset) params.append("offset", String(filters.offset));

    const queryString = params.toString();
    const url = queryString
      ? `/blockchain/prize-pools?${queryString}`
      : "/blockchain/prize-pools";

    const response = await this.client.get<{
      pools: PrizePool[];
      total_count: number;
    }>(url);

    if (response.error) {
      return { pools: [], total_count: 0 };
    }
    return response.data || { pools: [], total_count: 0 };
  }

  /**
   * Join a prize pool (deposit entry fee)
   */
  async joinPrizePool(request: JoinPrizePoolRequest): Promise<boolean> {
    const response = await this.client.post(
      `/blockchain/prize-pools/${request.match_id}/join`,
      { wallet_id: request.wallet_id }
    );
    return !response.error;
  }

  /**
   * Lock prize pool (starts match)
   */
  async lockPrizePool(matchId: string): Promise<boolean> {
    const response = await this.client.post(
      `/blockchain/prize-pools/${matchId}/lock`,
      {}
    );
    return !response.error;
  }

  /**
   * Start escrow period
   */
  async startEscrow(matchId: string): Promise<boolean> {
    const response = await this.client.post(
      `/blockchain/prize-pools/${matchId}/escrow`,
      {}
    );
    return !response.error;
  }

  /**
   * Distribute prizes to winners
   */
  async distributePrizes(request: DistributePrizesRequest): Promise<boolean> {
    const response = await this.client.post(
      `/blockchain/prize-pools/${request.match_id}/distribute`,
      { winners: request.winners }
    );
    return !response.error;
  }

  /**
   * Cancel prize pool (refunds all participants)
   */
  async cancelPrizePool(matchId: string): Promise<boolean> {
    const response = await this.client.post(
      `/blockchain/prize-pools/${matchId}/cancel`,
      {}
    );
    return !response.error;
  }

  /**
   * Get participants in a prize pool
   */
  async getParticipants(
    matchId: string
  ): Promise<{ address: string; contribution: string }[]> {
    const response = await this.client.get<{
      participants: { address: string; contribution: string }[];
    }>(`/blockchain/prize-pools/${matchId}/participants`);

    if (response.error) {
      return [];
    }
    return response.data?.participants || [];
  }

  /**
   * Withdraw user balance from vault
   */
  async withdraw(
    tokenAddress: string,
    amount: string
  ): Promise<{ tx_hash: string } | null> {
    const response = await this.client.post<{ tx_hash: string }>(
      "/blockchain/vault/withdraw",
      { token_address: tokenAddress, amount }
    );
    if (response.error) {
      console.error("Failed to withdraw:", response.error);
      return null;
    }
    return response.data || null;
  }

  /**
   * Get user vault balance
   */
  async getVaultBalance(
    tokenAddress?: string
  ): Promise<Record<string, string> | null> {
    const url = tokenAddress
      ? `/blockchain/vault/balance?token=${tokenAddress}`
      : "/blockchain/vault/balance";

    const response = await this.client.get<{ balances: Record<string, string> }>(
      url
    );
    if (response.error) {
      return null;
    }
    return response.data?.balances || null;
  }
}

// ============ Ledger API ============

export class LedgerAPI {
  constructor(private client: ReplayApiClient) {}

  /**
   * Get ledger entries with filters
   */
  async getEntries(filters?: LedgerFilters): Promise<LedgerEntriesResult> {
    const params = new URLSearchParams();

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
    }

    const queryString = params.toString();
    const url = queryString
      ? `/blockchain/ledger/entries?${queryString}`
      : "/blockchain/ledger/entries";

    const response = await this.client.get<LedgerEntriesResult>(url);

    if (response.error) {
      return { entries: [], total_count: 0, current_merkle_root: "" };
    }
    return (
      response.data || { entries: [], total_count: 0, current_merkle_root: "" }
    );
  }

  /**
   * Get single entry by transaction ID
   */
  async getEntryByTxId(transactionId: string): Promise<LedgerEntry | null> {
    const response = await this.client.get<LedgerEntry>(
      `/blockchain/ledger/entries/${transactionId}`
    );
    if (response.error) {
      return null;
    }
    return response.data || null;
  }

  /**
   * Get account balance from ledger
   */
  async getAccountBalance(
    account: string,
    token: string
  ): Promise<{ balance: string; entry_count: number } | null> {
    const response = await this.client.get<{
      balance: string;
      entry_count: number;
    }>(`/blockchain/ledger/balance/${account}?token=${token}`);

    if (response.error) {
      return null;
    }
    return response.data || null;
  }

  /**
   * Get entries for a specific match
   */
  async getMatchEntries(matchId: string): Promise<LedgerEntry[]> {
    const response = await this.client.get<{ entries: LedgerEntry[] }>(
      `/blockchain/ledger/match/${matchId}`
    );
    if (response.error) {
      return [];
    }
    return response.data?.entries || [];
  }

  /**
   * Verify ledger chain integrity
   */
  async verifyIntegrity(
    startIndex: number,
    endIndex: number
  ): Promise<{ is_valid: boolean; error?: string }> {
    const response = await this.client.get<{
      is_valid: boolean;
      error?: string;
    }>(
      `/blockchain/ledger/verify?start=${startIndex}&end=${endIndex}`
    );
    if (response.error) {
      return { is_valid: false, error: response.error };
    }
    return response.data || { is_valid: false, error: "Unknown error" };
  }

  /**
   * Generate cryptographic proof for an entry
   */
  async generateProof(entryIndex: number): Promise<LedgerEntryProof | null> {
    const response = await this.client.get<LedgerEntryProof>(
      `/blockchain/ledger/proof/${entryIndex}`
    );
    if (response.error) {
      return null;
    }
    return response.data || null;
  }

  /**
   * Get current merkle root
   */
  async getCurrentMerkleRoot(): Promise<string | null> {
    const response = await this.client.get<{ merkle_root: string }>(
      "/blockchain/ledger/merkle-root"
    );
    if (response.error) {
      return null;
    }
    return response.data?.merkle_root || null;
  }

  /**
   * Get total entry count
   */
  async getTotalEntries(): Promise<number> {
    const response = await this.client.get<{ total: number }>(
      "/blockchain/ledger/stats"
    );
    if (response.error) {
      return 0;
    }
    return response.data?.total || 0;
  }
}

// ============ Gas & Sponsorship API ============

export class GasSponsorshipAPI {
  constructor(private client: ReplayApiClient) {}

  /**
   * Get gas credits balance
   */
  async getCreditsBalance(): Promise<GasCreditsBalance | null> {
    const response = await this.client.get<GasCreditsBalance>(
      "/blockchain/gas/credits"
    );
    if (response.error) {
      return null;
    }
    return response.data || null;
  }

  /**
   * Get sponsorship config for wallet
   */
  async getSponsorshipConfig(
    walletAddress: string
  ): Promise<SponsorshipConfig | null> {
    const response = await this.client.get<SponsorshipConfig>(
      `/blockchain/gas/sponsorship/${walletAddress}`
    );
    if (response.error) {
      return null;
    }
    return response.data || null;
  }

  /**
   * Estimate gas for an operation
   */
  async estimateGas(
    chainId: ChainID,
    operation: string,
    params: Record<string, unknown>
  ): Promise<{ gas_limit: number; gas_price: string; estimated_cost_usd: number } | null> {
    const response = await this.client.post<{
      gas_limit: number;
      gas_price: string;
      estimated_cost_usd: number;
    }>("/blockchain/gas/estimate", {
      chain_id: chainId,
      operation,
      params,
    });
    if (response.error) {
      return null;
    }
    return response.data || null;
  }

  /**
   * Check if operation will be sponsored
   */
  async checkSponsorship(
    walletAddress: string,
    operation: string,
    estimatedGas: number
  ): Promise<{ is_sponsored: boolean; reason?: string }> {
    const response = await this.client.post<{
      is_sponsored: boolean;
      reason?: string;
    }>("/blockchain/gas/check-sponsorship", {
      wallet_address: walletAddress,
      operation,
      estimated_gas: estimatedGas,
    });
    if (response.error) {
      return { is_sponsored: false, reason: response.error };
    }
    return response.data || { is_sponsored: false };
  }
}

// ============ Transaction API ============

export class BlockchainTransactionAPI {
  constructor(private client: ReplayApiClient) {}

  /**
   * Get transaction by ID
   */
  async getTransaction(txId: string): Promise<BlockchainTransaction | null> {
    const response = await this.client.get<BlockchainTransaction>(
      `/blockchain/transactions/${txId}`
    );
    if (response.error) {
      return null;
    }
    return response.data || null;
  }

  /**
   * Get transaction by hash
   */
  async getTransactionByHash(
    chainId: ChainID,
    txHash: string
  ): Promise<BlockchainTransaction | null> {
    const response = await this.client.get<BlockchainTransaction>(
      `/blockchain/transactions/hash/${chainId}/${txHash}`
    );
    if (response.error) {
      return null;
    }
    return response.data || null;
  }

  /**
   * Get transactions for wallet
   */
  async getWalletTransactions(
    walletId: string,
    options?: { limit?: number; offset?: number }
  ): Promise<{ transactions: BlockchainTransaction[]; total_count: number }> {
    const params = new URLSearchParams();
    if (options?.limit) params.append("limit", String(options.limit));
    if (options?.offset) params.append("offset", String(options.offset));

    const queryString = params.toString();
    const url = queryString
      ? `/blockchain/wallets/${walletId}/transactions?${queryString}`
      : `/blockchain/wallets/${walletId}/transactions`;

    const response = await this.client.get<{
      transactions: BlockchainTransaction[];
      total_count: number;
    }>(url);

    if (response.error) {
      return { transactions: [], total_count: 0 };
    }
    return response.data || { transactions: [], total_count: 0 };
  }

  /**
   * Monitor transaction status
   */
  async waitForConfirmation(
    chainId: ChainID,
    txHash: string,
    maxWaitMs: number = 60000
  ): Promise<BlockchainTransaction | null> {
    const startTime = Date.now();
    const pollInterval = 2000;

    while (Date.now() - startTime < maxWaitMs) {
      const tx = await this.getTransactionByHash(chainId, txHash);
      if (tx && tx.status === "confirmed") {
        return tx;
      }
      if (tx && tx.status === "failed") {
        console.error("Transaction failed:", tx.error_message);
        return tx;
      }
      await new Promise((resolve) => setTimeout(resolve, pollInterval));
    }

    console.warn("Transaction confirmation timeout");
    return null;
  }
}

// ============ Main Blockchain API ============

export class BlockchainAPI {
  public wallet: SmartWalletAPI;
  public prizePool: PrizePoolAPI;
  public ledger: LedgerAPI;
  public gas: GasSponsorshipAPI;
  public transaction: BlockchainTransactionAPI;

  constructor(client: ReplayApiClient) {
    this.wallet = new SmartWalletAPI(client);
    this.prizePool = new PrizePoolAPI(client);
    this.ledger = new LedgerAPI(client);
    this.gas = new GasSponsorshipAPI(client);
    this.transaction = new BlockchainTransactionAPI(client);
  }
}

// Export types for convenience
export type {
  ChainID,
  SmartWallet,
  CreateSmartWalletRequest,
  PrizePool,
  CreatePrizePoolRequest,
  LedgerEntry,
  LedgerFilters,
  BlockchainTransaction,
  GasCreditsBalance,
} from "./blockchain.types";


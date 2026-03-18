/**
 * Wallet API SDK
 * Clean, minimal API wrapper for wallet operations
 */

import { ReplayApiClient } from "./replay-api.client";
import type {
  WalletBalance,
  TransactionsResult,
  Transaction,
  TransactionFilters,
  DepositRequest,
  WithdrawRequest,
} from "./wallet.types";

/**
 * Generates a UUID v4 idempotency key for financial request deduplication.
 * Falls back to a pseudo-random key if crypto.randomUUID is unavailable.
 */
function generateIdempotencyKey(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  // Fallback for environments without crypto.randomUUID
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export class WalletAPI {
  constructor(private client: ReplayApiClient) {}

  async getBalance(): Promise<WalletBalance | null> {
    const response = await this.client.get<WalletBalance>("/wallet/balance");
    if (response.error) {
      const errorMsg =
        typeof response.error === "string"
          ? response.error
          : response.error.message || "Failed to fetch wallet balance";
      const status = typeof response.error === "object" ? response.error.status : undefined;
      console.error("Failed to fetch wallet balance:", errorMsg, { status });
      throw new Error(errorMsg);
    }
    return response.data || null;
  }

  async deposit(request: DepositRequest): Promise<Transaction | null> {
    const safeRequest = {
      ...request,
      idempotency_key: request.idempotency_key || generateIdempotencyKey(),
    };
    const response = await this.client.post<Transaction>(
      "/wallet/deposit",
      safeRequest,
    );
    if (response.error) {
      const errorMsg =
        typeof response.error === "string"
          ? response.error
          : response.error.message || "Deposit failed";
      console.error("Deposit failed:", errorMsg);
      throw new Error(errorMsg);
    }
    return response.data || null;
  }

  async withdraw(request: WithdrawRequest): Promise<Transaction | null> {
    const safeRequest = {
      ...request,
      idempotency_key: request.idempotency_key || generateIdempotencyKey(),
    };
    const response = await this.client.post<Transaction>(
      "/wallet/withdraw",
      safeRequest,
    );
    if (response.error) {
      const errorMsg =
        typeof response.error === "string"
          ? response.error
          : response.error.message || "Withdrawal failed";
      console.error("Withdrawal failed:", errorMsg);
      throw new Error(errorMsg);
    }
    return response.data || null;
  }

  async getTransactions(
    filters: TransactionFilters = {},
  ): Promise<TransactionsResult | null> {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, String(value));
      }
    });

    const queryString = params.toString();
    const url = queryString
      ? `/wallet/transactions?${queryString}`
      : "/wallet/transactions";

    const response = await this.client.get<TransactionsResult>(url);
    if (response.error) {
      const errorMsg =
        typeof response.error === "string"
          ? response.error
          : response.error.message || "Failed to fetch transactions";
      console.error("Failed to fetch transactions:", errorMsg);
      throw new Error(errorMsg);
    }
    return response.data || null;
  }

  async getTransaction(transactionId: string): Promise<Transaction | null> {
    const response = await this.client.get<Transaction>(
      `/wallet/transactions/${transactionId}`,
    );
    if (response.error) {
      console.error("Failed to fetch transaction:", response.error);
      return null;
    }
    return response.data || null;
  }

  async cancelTransaction(transactionId: string): Promise<Transaction | null> {
    const response = await this.client.post<Transaction>(
      `/wallet/transactions/${transactionId}/cancel`,
      {},
    );
    if (response.error) {
      console.error("Failed to cancel transaction:", response.error);
      return null;
    }
    return response.data || null;
  }
}

// Re-export types for convenience
export type { DepositRequest, WithdrawRequest } from "./wallet.types";

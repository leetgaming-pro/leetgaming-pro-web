/**
 * Wallet API SDK
 * Clean, minimal API wrapper for wallet operations
 */

import { ReplayApiClient } from './replay-api.client';
import type {
  WalletBalance,
  TransactionsResult,
  Transaction,
  TransactionFilters,
  DepositRequest,
  WithdrawRequest,
} from './wallet.types';

export class WalletAPI {
  constructor(private client: ReplayApiClient) {}

  async getBalance(): Promise<WalletBalance | null> {
    const response = await this.client.get<WalletBalance>('/wallet/balance');
    if (response.error) {
      console.error('Failed to fetch wallet balance:', response.error);
      return null;
    }
    return response.data || null;
  }

  async deposit(request: DepositRequest): Promise<Transaction | null> {
    const response = await this.client.post<Transaction>('/wallet/deposit', request);
    if (response.error) {
      console.error('Deposit failed:', response.error);
      return null;
    }
    return response.data || null;
  }

  async withdraw(request: WithdrawRequest): Promise<Transaction | null> {
    const response = await this.client.post<Transaction>('/wallet/withdraw', request);
    if (response.error) {
      console.error('Withdrawal failed:', response.error);
      return null;
    }
    return response.data || null;
  }

  async getTransactions(filters: TransactionFilters = {}): Promise<TransactionsResult | null> {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, String(value));
      }
    });

    const queryString = params.toString();
    const url = queryString ? `/wallet/transactions?${queryString}` : '/wallet/transactions';

    const response = await this.client.get<TransactionsResult>(url);
    if (response.error) {
      console.error('Failed to fetch transactions:', response.error);
      return null;
    }
    return response.data || null;
  }

  async getTransaction(transactionId: string): Promise<Transaction | null> {
    const response = await this.client.get<Transaction>(`/wallet/transactions/${transactionId}`);
    if (response.error) {
      console.error('Failed to fetch transaction:', response.error);
      return null;
    }
    return response.data || null;
  }

  async cancelTransaction(transactionId: string): Promise<Transaction | null> {
    const response = await this.client.post<Transaction>(`/wallet/transactions/${transactionId}/cancel`, {});
    if (response.error) {
      console.error('Failed to cancel transaction:', response.error);
      return null;
    }
    return response.data || null;
  }
}

// Re-export types for convenience
export type { DepositRequest, WithdrawRequest } from './wallet.types';

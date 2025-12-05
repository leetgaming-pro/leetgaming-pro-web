/**
 * useWallet Hook
 * React hook for wallet operations with state management
 */

'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { ReplayAPISDK } from '@/types/replay-api/sdk';
import { ReplayApiSettingsMock } from '@/types/replay-api/settings';
import { logger } from '@/lib/logger';
import type {
  WalletBalance,
  TransactionsResult,
  TransactionFilters,
  Currency,
} from '@/types/replay-api/wallet.types';
import { hasMore, getAmountValue } from '@/types/replay-api/wallet.types';
import type { DepositRequest, WithdrawRequest } from '@/types/replay-api/wallet.sdk';

const getApiBaseUrl = (): string =>
  typeof window !== 'undefined'
    ? process.env.NEXT_PUBLIC_REPLAY_API_URL || 'http://localhost:8080'
    : process.env.NEXT_PUBLIC_REPLAY_API_URL || process.env.REPLAY_API_URL || 'http://localhost:8080';

export interface UseWalletResult {
  // State
  balance: WalletBalance | null;
  transactions: TransactionsResult | null;
  isLoadingBalance: boolean;
  isLoadingTransactions: boolean;
  balanceError: string | null;
  transactionsError: string | null;
  // Actions
  refreshBalance: () => Promise<void>;
  refreshTransactions: (filters?: TransactionFilters) => Promise<void>;
  deposit: (request: DepositRequest) => Promise<boolean>;
  withdraw: (request: WithdrawRequest) => Promise<boolean>;
  loadMore: () => Promise<void>;
  // Helpers
  getBalance: (currency: Currency) => string;
  isLocked: boolean;
  canLoadMore: boolean;
}

export function useWallet(autoFetch = true, initialFilters: TransactionFilters = { limit: 20, offset: 0 }): UseWalletResult {
  const [balance, setBalance] = useState<WalletBalance | null>(null);
  const [transactions, setTransactions] = useState<TransactionsResult | null>(null);
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false);
  const [balanceError, setBalanceError] = useState<string | null>(null);
  const [transactionsError, setTransactionsError] = useState<string | null>(null);
  const [filters, setFilters] = useState<TransactionFilters>(initialFilters);

  const sdk = useMemo(() => {
    const baseUrl = getApiBaseUrl();
    logger.info('[useWallet] Initializing SDK', { baseUrl });
    return new ReplayAPISDK({ ...ReplayApiSettingsMock, baseUrl }, logger);
  }, []);

  const refreshBalance = useCallback(async () => {
    setIsLoadingBalance(true);
    setBalanceError(null);
    try {
      const result = await sdk.wallet.getBalance();
      setBalance(result);
      if (!result) setBalanceError('Failed to fetch wallet balance');
    } catch (err: unknown) {
      logger.error('[useWallet] Error fetching balance:', err);
      setBalanceError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoadingBalance(false);
    }
  }, [sdk]);

  const refreshTransactions = useCallback(async (newFilters?: TransactionFilters) => {
    setIsLoadingTransactions(true);
    setTransactionsError(null);
    const activeFilters = newFilters || filters;
    if (newFilters) setFilters(newFilters);

    try {
      const result = await sdk.wallet.getTransactions(activeFilters);
      setTransactions(result);
      if (!result) setTransactionsError('Failed to fetch transactions');
    } catch (err: unknown) {
      logger.error('[useWallet] Error fetching transactions:', err);
      setTransactionsError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoadingTransactions(false);
    }
  }, [sdk, filters]);

  const loadMore = useCallback(async () => {
    if (!transactions || isLoadingTransactions) return;
    const newOffset = (filters.offset || 0) + (filters.limit || 20);
    if (newOffset >= transactions.total_count) return;

    setIsLoadingTransactions(true);
    try {
      const newFilters = { ...filters, offset: newOffset };
      const result = await sdk.wallet.getTransactions(newFilters);
      if (result) {
        setTransactions({
          ...result,
          transactions: [...transactions.transactions, ...result.transactions],
        });
        setFilters(newFilters);
      }
    } catch (err: unknown) {
      logger.error('[useWallet] Error loading more:', err);
      setTransactionsError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoadingTransactions(false);
    }
  }, [sdk, transactions, filters, isLoadingTransactions]);

  const deposit = useCallback(async (request: DepositRequest): Promise<boolean> => {
    try {
      const result = await sdk.wallet.deposit(request);
      if (result) {
        await Promise.all([refreshBalance(), refreshTransactions()]);
        return true;
      }
      return false;
    } catch (err: unknown) {
      logger.error('[useWallet] Deposit failed:', err);
      return false;
    }
  }, [sdk, refreshBalance, refreshTransactions]);

  const withdraw = useCallback(async (request: WithdrawRequest): Promise<boolean> => {
    try {
      const result = await sdk.wallet.withdraw(request);
      if (result) {
        await Promise.all([refreshBalance(), refreshTransactions()]);
        return true;
      }
      return false;
    } catch (err: unknown) {
      logger.error('[useWallet] Withdrawal failed:', err);
      return false;
    }
  }, [sdk, refreshBalance, refreshTransactions]);

  const getBalance = useCallback((currency: Currency): string => {
    const value = balance?.balances?.[currency];
    if (!value) return '0.00';
    return getAmountValue(value).dollars.toFixed(2);
  }, [balance]);

  const isLocked = useMemo(() => balance?.is_locked || false, [balance]);

  const canLoadMore = useMemo(() => {
    if (!transactions) return false;
    return hasMore({ items: transactions.transactions, ...transactions });
  }, [transactions]);

  useEffect(() => {
    if (autoFetch) {
      refreshBalance();
      refreshTransactions();
    }
  }, [autoFetch, refreshBalance, refreshTransactions]);

  return {
    balance,
    transactions,
    isLoadingBalance,
    isLoadingTransactions,
    balanceError,
    transactionsError,
    refreshBalance,
    refreshTransactions,
    deposit,
    withdraw,
    loadMore,
    getBalance,
    isLocked,
    canLoadMore,
  };
}

export type { WalletBalance, TransactionsResult, TransactionFilters };

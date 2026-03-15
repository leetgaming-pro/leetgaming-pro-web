/**
 * useExchange Hooks
 * React hooks for BTC exchange operations with state management
 *
 * Provides:
 * - useExchangeRates() - auto-refreshing BTC/USD rates
 * - useQuote() - get a quote with countdown timer
 * - useBuyBitcoin() - mutation hook for buying BTC
 * - useSellBitcoin() - mutation hook for selling BTC
 * - useOrderHistory() - paginated order history
 * - useFeeSchedule() - fee tier info
 */

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { logger } from '@/lib/logger';
import type {
  ExchangeRates,
  QuoteResponse,
  BuyBitcoinRequest,
  BuyBitcoinResponse,
  SellBitcoinRequest,
  SellBitcoinResponse,
  OrderHistory,
  FeeSchedule,
} from '@/lib/api/exchange';

// ─── Exchange Rates Hook ────────────────────────────────────────────────

export interface UseExchangeRatesResult {
  /** Current BTC/USD exchange rates */
  rates: ExchangeRates | null;
  /** Whether rates are currently loading */
  isLoading: boolean;
  /** Error message if fetch failed */
  error: string | null;
  /** Manually refresh rates */
  refresh: () => Promise<void>;
  /** Time since last update in seconds */
  lastUpdatedAgo: number;
}

/**
 * useExchangeRates - Auto-refreshing BTC/USD exchange rates
 * Polls the public rates endpoint every 10 seconds
 */
export function useExchangeRates(pollIntervalMs = 10000): UseExchangeRatesResult {
  const [rates, setRates] = useState<ExchangeRates | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdatedAgo, setLastUpdatedAgo] = useState(0);
  const lastFetchRef = useRef<number>(0);

  const fetchRates = useCallback(async () => {
    try {
      const response = await fetch('/api/exchange/rates');
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to fetch exchange rates');
      }
      const data = await response.json();
      setRates(data.data || data);
      setError(null);
      lastFetchRef.current = Date.now();
    } catch (err: unknown) {
      logger.error('[useExchangeRates] Error:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch rates');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial fetch + polling
  useEffect(() => {
    fetchRates();
    const interval = setInterval(fetchRates, pollIntervalMs);
    return () => clearInterval(interval);
  }, [fetchRates, pollIntervalMs]);

  // Track "last updated ago" every second
  useEffect(() => {
    const interval = setInterval(() => {
      if (lastFetchRef.current > 0) {
        setLastUpdatedAgo(Math.floor((Date.now() - lastFetchRef.current) / 1000));
      }
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return { rates, isLoading, error, refresh: fetchRates, lastUpdatedAgo };
}

// ─── Quote Hook ─────────────────────────────────────────────────────────

export interface UseQuoteResult {
  /** Current quote data */
  quote: QuoteResponse | null;
  /** Whether a quote is loading */
  isLoading: boolean;
  /** Error message if quote fetch failed */
  error: string | null;
  /** Seconds remaining before quote expires */
  remainingSeconds: number;
  /** Whether the quote has expired */
  isExpired: boolean;
  /** Request a new quote */
  requestQuote: () => Promise<void>;
  /** Clear the current quote */
  clearQuote: () => void;
}

/**
 * useQuote - Get a BTC exchange quote with countdown timer
 * Automatically counts down and marks quote as expired
 */
export function useQuote(
  side: 'BUY' | 'SELL',
  amount: number | undefined,
): UseQuoteResult {
  const [quote, setQuote] = useState<QuoteResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);

  const isExpired = quote !== null && remainingSeconds <= 0;

  const clearQuote = useCallback(() => {
    setQuote(null);
    setRemainingSeconds(0);
    setError(null);
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }
  }, []);

  const requestQuote = useCallback(async () => {
    if (!amount || amount <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const body: Record<string, unknown> = { side };
      if (side === 'BUY') {
        body.amount_usd = amount;
      } else {
        body.amount_btc = amount;
      }

      const response = await fetch('/api/exchange/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to get quote');
      }

      const data = await response.json();
      const quoteData: QuoteResponse = data.data || data;
      setQuote(quoteData);
      setRemainingSeconds(quoteData.remaining_seconds);

      // Start countdown timer
      if (countdownRef.current) clearInterval(countdownRef.current);
      countdownRef.current = setInterval(() => {
        setRemainingSeconds((prev) => {
          if (prev <= 1) {
            if (countdownRef.current) clearInterval(countdownRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err: unknown) {
      logger.error('[useQuote] Error:', err);
      setError(err instanceof Error ? err.message : 'Failed to get quote');
    } finally {
      setIsLoading(false);
    }
  }, [side, amount]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, []);

  return { quote, isLoading, error, remainingSeconds, isExpired, requestQuote, clearQuote };
}

// ─── Buy Bitcoin Hook ───────────────────────────────────────────────────

export interface UseBuyBitcoinResult {
  /** Execute buy order */
  buy: (req: Omit<BuyBitcoinRequest, 'idempotency_key'>) => Promise<BuyBitcoinResponse | null>;
  /** Whether a buy is in progress */
  isLoading: boolean;
  /** Error message if buy failed */
  error: string | null;
  /** Last successful buy response */
  result: BuyBitcoinResponse | null;
  /** Clear error state */
  clearError: () => void;
}

/**
 * useBuyBitcoin - Mutation hook for buying BTC with Stripe
 */
export function useBuyBitcoin(): UseBuyBitcoinResult {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<BuyBitcoinResponse | null>(null);

  const buy = useCallback(async (
    req: Omit<BuyBitcoinRequest, 'idempotency_key'>,
  ): Promise<BuyBitcoinResponse | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const idempotency_key = `buy_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;

      const response = await fetch('/api/exchange/buy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...req, idempotency_key }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to buy Bitcoin');
      }

      const data = await response.json();
      const buyResult: BuyBitcoinResponse = data.data || data;
      setResult(buyResult);
      return buyResult;
    } catch (err: unknown) {
      logger.error('[useBuyBitcoin] Error:', err);
      const message = err instanceof Error ? err.message : 'Failed to buy Bitcoin';
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return { buy, isLoading, error, result, clearError };
}

// ─── Sell Bitcoin Hook ──────────────────────────────────────────────────

export interface UseSellBitcoinResult {
  /** Execute sell order */
  sell: (req: Omit<SellBitcoinRequest, 'idempotency_key'>) => Promise<SellBitcoinResponse | null>;
  /** Whether a sell is in progress */
  isLoading: boolean;
  /** Error message if sell failed */
  error: string | null;
  /** Last successful sell response */
  result: SellBitcoinResponse | null;
  /** Clear error state */
  clearError: () => void;
}

/**
 * useSellBitcoin - Mutation hook for selling BTC
 */
export function useSellBitcoin(): UseSellBitcoinResult {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SellBitcoinResponse | null>(null);

  const sell = useCallback(async (
    req: Omit<SellBitcoinRequest, 'idempotency_key'>,
  ): Promise<SellBitcoinResponse | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const idempotency_key = `sell_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;

      const response = await fetch('/api/exchange/sell', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...req, idempotency_key }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to sell Bitcoin');
      }

      const data = await response.json();
      const sellResult: SellBitcoinResponse = data.data || data;
      setResult(sellResult);
      return sellResult;
    } catch (err: unknown) {
      logger.error('[useSellBitcoin] Error:', err);
      const message = err instanceof Error ? err.message : 'Failed to sell Bitcoin';
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return { sell, isLoading, error, result, clearError };
}

// ─── Order History Hook ─────────────────────────────────────────────────

export interface UseOrderHistoryResult {
  /** Order history data */
  orders: OrderHistory | null;
  /** Whether orders are loading */
  isLoading: boolean;
  /** Error message if fetch failed */
  error: string | null;
  /** Refresh order history */
  refresh: () => Promise<void>;
  /** Load next page */
  loadMore: () => Promise<void>;
  /** Whether more pages are available */
  canLoadMore: boolean;
}

/**
 * useOrderHistory - Paginated exchange order history
 */
export function useOrderHistory(
  limit: number = 20,
  offset: number = 0,
  autoFetch = true,
): UseOrderHistoryResult {
  const [orders, setOrders] = useState<OrderHistory | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentOffset, setCurrentOffset] = useState(offset);

  const fetchOrders = useCallback(async (fetchOffset?: number) => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        limit: limit.toString(),
        offset: (fetchOffset ?? currentOffset).toString(),
      });

      const response = await fetch(`/api/exchange/orders?${params.toString()}`);
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to fetch order history');
      }

      const data = await response.json();
      setOrders(data.data || data);
    } catch (err: unknown) {
      logger.error('[useOrderHistory] Error:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch orders');
    } finally {
      setIsLoading(false);
    }
  }, [limit, currentOffset]);

  const refresh = useCallback(async () => {
    setCurrentOffset(0);
    await fetchOrders(0);
  }, [fetchOrders]);

  const loadMore = useCallback(async () => {
    if (!orders || isLoading) return;
    const nextOffset = currentOffset + limit;
    if (nextOffset >= orders.total_count) return;

    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        limit: limit.toString(),
        offset: nextOffset.toString(),
      });

      const response = await fetch(`/api/exchange/orders?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to load more orders');

      const data = await response.json();
      const newData: OrderHistory = data.data || data;

      setOrders({
        ...newData,
        orders: [...(orders.orders || []), ...newData.orders],
      });
      setCurrentOffset(nextOffset);
    } catch (err: unknown) {
      logger.error('[useOrderHistory] Load more error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load more');
    } finally {
      setIsLoading(false);
    }
  }, [orders, isLoading, currentOffset, limit]);

  const canLoadMore = orders
    ? currentOffset + limit < orders.total_count
    : false;

  // Auto-fetch on mount
  useEffect(() => {
    if (autoFetch) {
      fetchOrders();
    }
  }, [autoFetch]); // eslint-disable-line react-hooks/exhaustive-deps

  return { orders, isLoading, error, refresh, loadMore, canLoadMore };
}

// ─── Fee Schedule Hook ──────────────────────────────────────────────────

export interface UseFeeScheduleResult {
  /** Fee schedule data */
  fees: FeeSchedule | null;
  /** Whether fees are loading */
  isLoading: boolean;
  /** Error message if fetch failed */
  error: string | null;
  /** Refresh fee schedule */
  refresh: () => Promise<void>;
}

/**
 * useFeeSchedule - Fee tier info for the authenticated user
 */
export function useFeeSchedule(autoFetch = true): UseFeeScheduleResult {
  const [fees, setFees] = useState<FeeSchedule | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/exchange/fees');
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to fetch fee schedule');
      }

      const data = await response.json();
      setFees(data.data || data);
    } catch (err: unknown) {
      logger.error('[useFeeSchedule] Error:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch fees');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (autoFetch) {
      refresh();
    }
  }, [autoFetch]); // eslint-disable-line react-hooks/exhaustive-deps

  return { fees, isLoading, error, refresh };
}

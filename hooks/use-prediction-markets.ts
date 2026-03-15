/**
 * usePredictionMarkets Hook
 * React hook for prediction markets on a match
 */

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSDK } from '@/contexts/sdk-context';
import type {
  PredictionMarket,
  PredictionStatus,
  ListMatchMarketsParams,
} from '@/types/replay-api/prediction.types';

export interface UsePredictionMarketsOptions {
  pageSize?: number;
  status?: PredictionStatus;
  autoFetch?: boolean;
}

export interface UsePredictionMarketsResult {
  markets: PredictionMarket[];
  totalCount: number;
  isLoading: boolean;
  error: string | null;
  hasMore: boolean;
  refresh: () => Promise<void>;
  loadMore: () => Promise<void>;
}

export function usePredictionMarkets(
  matchId: string | undefined,
  options: UsePredictionMarketsOptions = {},
): UsePredictionMarketsResult {
  const { sdk } = useSDK();
  const { pageSize = 20, status, autoFetch = true } = options;

  const [markets, setMarkets] = useState<PredictionMarket[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [offset, setOffset] = useState(0);

  const mountedRef = useRef(true);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const fetchMarkets = useCallback(
    async (append = false) => {
      if (!matchId || !sdk) return;

      setIsLoading(true);
      setError(null);

      try {
        const params: ListMatchMarketsParams = {
          match_id: matchId,
          status,
          limit: pageSize,
          offset: append ? offset : 0,
        };

        const result = await sdk.predictions.listMatchMarkets(params);

        if (!mountedRef.current) return;

        if (result) {
          setMarkets((prev) => (append ? [...prev, ...result.markets] : result.markets));
          setTotalCount(result.total_count);
          setOffset((append ? offset : 0) + (result.markets?.length || 0));
        }
      } catch (err) {
        if (mountedRef.current) {
          setError(err instanceof Error ? err.message : 'Failed to load markets');
        }
      } finally {
        if (mountedRef.current) {
          setIsLoading(false);
        }
      }
    },
    [matchId, sdk, pageSize, status, offset],
  );

  useEffect(() => {
    if (autoFetch && matchId) {
      fetchMarkets(false);
    }
  }, [matchId, autoFetch]); // eslint-disable-line react-hooks/exhaustive-deps

  const refresh = useCallback(() => fetchMarkets(false), [fetchMarkets]);
  const loadMore = useCallback(() => fetchMarkets(true), [fetchMarkets]);
  const hasMore = markets.length < totalCount;

  return { markets, totalCount, isLoading, error, hasMore, refresh, loadMore };
}

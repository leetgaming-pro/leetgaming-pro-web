'use client';

import { useState, useCallback, useEffect } from 'react';
import { useSDK } from '@/contexts/sdk-context';
import { logger } from '@/lib/logger';
import type {
  VaultActivityResult,
  ActivityFilters,
} from '@/types/replay-api/vault.types';

export interface UseVaultActivityResult {
  activity: VaultActivityResult | null;
  isLoading: boolean;
  error: string | null;
  refreshActivity: (filters?: ActivityFilters) => Promise<void>;
  loadMore: () => Promise<void>;
  canLoadMore: boolean;
}

export function useVaultActivity(
  squadId: string,
  autoFetch = true,
  initialFilters: ActivityFilters = { limit: 20, offset: 0 }
): UseVaultActivityResult {
  const { sdk } = useSDK();
  const [activity, setActivity] = useState<VaultActivityResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<ActivityFilters>(initialFilters);

  const refreshActivity = useCallback(
    async (newFilters?: ActivityFilters) => {
      if (!squadId) return;
      setIsLoading(true);
      setError(null);
      const activeFilters = newFilters || filters;
      if (newFilters) setFilters(newFilters);
      try {
        const result = await sdk.vault.getActivity(squadId, activeFilters);
        setActivity(result);
        if (!result) setError('Failed to fetch activity');
      } catch (err: unknown) {
        logger.error('[useVaultActivity] Error:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setIsLoading(false);
      }
    },
    [sdk, squadId, filters]
  );

  const loadMore = useCallback(async () => {
    if (!activity || isLoading) return;
    const nextOffset = activity.offset + activity.limit;
    if (nextOffset >= activity.total_count) return;

    const moreFilters = { ...filters, offset: nextOffset };
    try {
      const result = await sdk.vault.getActivity(squadId, moreFilters);
      if (result) {
        setActivity((prev) =>
          prev
            ? {
                ...result,
                activities: [...prev.activities, ...result.activities],
              }
            : result
        );
        setFilters(moreFilters);
      }
    } catch (err: unknown) {
      logger.error('[useVaultActivity] Error loading more:', err);
    }
  }, [sdk, squadId, activity, filters, isLoading]);

  const canLoadMore =
    activity !== null &&
    activity.offset + activity.activities.length < activity.total_count;

  useEffect(() => {
    if (autoFetch && squadId) {
      refreshActivity();
    }
  }, [autoFetch, squadId, refreshActivity]);

  return {
    activity,
    isLoading,
    error,
    refreshActivity,
    loadMore,
    canLoadMore,
  };
}

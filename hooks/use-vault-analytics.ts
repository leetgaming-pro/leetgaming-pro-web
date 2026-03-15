'use client';

import { useState, useCallback, useEffect } from 'react';
import { useSDK } from '@/contexts/sdk-context';
import { logger } from '@/lib/logger';
import type { VaultAnalytics } from '@/types/replay-api/vault.types';

export interface UseVaultAnalyticsResult {
  analytics: VaultAnalytics | null;
  isLoading: boolean;
  error: string | null;
  refreshAnalytics: (from?: string, to?: string) => Promise<void>;
}

export function useVaultAnalytics(
  squadId: string,
  autoFetch = true,
  timeRange?: string
): UseVaultAnalyticsResult {
  const { sdk } = useSDK();
  const [analytics, setAnalytics] = useState<VaultAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getDateRange = useCallback((range?: string): { from?: string; to?: string } => {
    if (!range) return {};
    const now = new Date();
    const to = now.toISOString();
    let from: Date;
    switch (range) {
      case '7d': from = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); break;
      case '30d': from = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); break;
      case '90d': from = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000); break;
      case '1y': from = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000); break;
      default: return {};
    }
    return { from: from.toISOString(), to };
  }, []);

  const refreshAnalytics = useCallback(
    async (from?: string, to?: string) => {
      if (!squadId) return;
      setIsLoading(true);
      setError(null);
      try {
        const dates = from ? { from, to } : getDateRange(timeRange);
        const result = await sdk.vault.getAnalytics(squadId, dates.from, dates.to);
        setAnalytics(result);
        if (!result) setError('Failed to fetch analytics');
      } catch (err: unknown) {
        logger.error('[useVaultAnalytics] Error:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setIsLoading(false);
      }
    },
    [sdk, squadId, timeRange, getDateRange]
  );

  useEffect(() => {
    if (autoFetch && squadId) {
      refreshAnalytics();
    }
  }, [autoFetch, squadId, refreshAnalytics]);

  return {
    analytics,
    isLoading,
    error,
    refreshAnalytics,
  };
}

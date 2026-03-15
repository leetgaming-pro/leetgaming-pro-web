'use client';

import { useState, useCallback, useEffect } from 'react';
import { useSDK } from '@/contexts/sdk-context';
import { logger } from '@/lib/logger';
import type {
  VaultInventoryResult,
  InventoryFilters,
  DepositItemRequest,
  ProposeItemTransferRequest,
} from '@/types/replay-api/vault.types';
import type { VaultProposal } from '@/types/replay-api/vault.types';

export interface UseVaultInventoryResult {
  inventory: VaultInventoryResult | null;
  isLoading: boolean;
  error: string | null;
  refreshInventory: (filters?: InventoryFilters) => Promise<void>;
  depositItem: (request: DepositItemRequest) => Promise<boolean>;
  proposeItemTransfer: (request: ProposeItemTransferRequest) => Promise<VaultProposal | null>;
  loadMore: () => Promise<void>;
  canLoadMore: boolean;
}

export function useVaultInventory(
  squadId: string,
  autoFetch = true,
  initialFilters: InventoryFilters = { limit: 20, offset: 0 }
): UseVaultInventoryResult {
  const { sdk } = useSDK();
  const [inventory, setInventory] = useState<VaultInventoryResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<InventoryFilters>(initialFilters);

  const refreshInventory = useCallback(
    async (newFilters?: InventoryFilters) => {
      if (!squadId) return;
      setIsLoading(true);
      setError(null);
      const activeFilters = newFilters || filters;
      if (newFilters) setFilters(newFilters);
      try {
        const result = await sdk.vault.getInventory(squadId, activeFilters);
        setInventory(result);
        if (!result) setError('Failed to fetch inventory');
      } catch (err: unknown) {
        logger.error('[useVaultInventory] Error:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setIsLoading(false);
      }
    },
    [sdk, squadId, filters]
  );

  const depositItem = useCallback(
    async (request: DepositItemRequest): Promise<boolean> => {
      try {
        const success = await sdk.vault.depositItem(squadId, request);
        if (success) await refreshInventory();
        return success;
      } catch (err: unknown) {
        logger.error('[useVaultInventory] Error depositing item:', err);
        return false;
      }
    },
    [sdk, squadId, refreshInventory]
  );

  const proposeItemTransfer = useCallback(
    async (request: ProposeItemTransferRequest): Promise<VaultProposal | null> => {
      try {
        const result = await sdk.vault.proposeItemTransfer(squadId, request);
        return result;
      } catch (err: unknown) {
        logger.error('[useVaultInventory] Error proposing transfer:', err);
        return null;
      }
    },
    [sdk, squadId]
  );

  const loadMore = useCallback(async () => {
    if (!inventory || isLoading) return;
    const nextOffset = inventory.offset + inventory.limit;
    if (nextOffset >= inventory.total_count) return;

    const moreFilters = { ...filters, offset: nextOffset };
    try {
      const result = await sdk.vault.getInventory(squadId, moreFilters);
      if (result) {
        setInventory((prev) =>
          prev
            ? { ...result, items: [...prev.items, ...result.items] }
            : result
        );
        setFilters(moreFilters);
      }
    } catch (err: unknown) {
      logger.error('[useVaultInventory] Error loading more:', err);
    }
  }, [sdk, squadId, inventory, filters, isLoading]);

  const canLoadMore =
    inventory !== null &&
    inventory.offset + inventory.items.length < inventory.total_count;

  useEffect(() => {
    if (autoFetch && squadId) {
      refreshInventory();
    }
  }, [autoFetch, squadId, refreshInventory]);

  return {
    inventory,
    isLoading,
    error,
    refreshInventory,
    depositItem,
    proposeItemTransfer,
    loadMore,
    canLoadMore,
  };
}

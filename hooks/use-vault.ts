'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSDK } from '@/contexts/sdk-context';
import { logger } from '@/lib/logger';
import type {
  TeamVault,
  VaultBalance,
  VaultDepositRequest,
  CreateVaultRequest,
} from '@/types/replay-api/vault.types';

export interface UseVaultResult {
  vault: TeamVault | null;
  balance: VaultBalance | null;
  isLoadingVault: boolean;
  isLoadingBalance: boolean;
  vaultError: string | null;
  balanceError: string | null;
  refreshVault: () => Promise<void>;
  refreshBalance: () => Promise<void>;
  createVault: (request: CreateVaultRequest) => Promise<TeamVault | null>;
  deposit: (request: VaultDepositRequest) => Promise<boolean>;
  isLocked: boolean;
  hasVault: boolean;
}

export function useVault(squadId: string, autoFetch = true): UseVaultResult {
  const { sdk } = useSDK();
  const [vault, setVault] = useState<TeamVault | null>(null);
  const [balance, setBalance] = useState<VaultBalance | null>(null);
  const [isLoadingVault, setIsLoadingVault] = useState(false);
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);
  const [vaultError, setVaultError] = useState<string | null>(null);
  const [balanceError, setBalanceError] = useState<string | null>(null);

  const refreshVault = useCallback(async () => {
    if (!squadId) return;
    setIsLoadingVault(true);
    setVaultError(null);
    try {
      const result = await sdk.vault.getVault(squadId);
      setVault(result);
      if (!result) setVaultError('Vault not found');
    } catch (err: unknown) {
      logger.error('[useVault] Error fetching vault:', err);
      setVaultError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoadingVault(false);
    }
  }, [sdk, squadId]);

  const refreshBalance = useCallback(async () => {
    if (!squadId) return;
    setIsLoadingBalance(true);
    setBalanceError(null);
    try {
      const result = await sdk.vault.getBalance(squadId);
      setBalance(result);
      if (!result) setBalanceError('Failed to fetch vault balance');
    } catch (err: unknown) {
      logger.error('[useVault] Error fetching balance:', err);
      setBalanceError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoadingBalance(false);
    }
  }, [sdk, squadId]);

  const createVault = useCallback(
    async (request: CreateVaultRequest): Promise<TeamVault | null> => {
      try {
        const result = await sdk.vault.createVault(squadId, request);
        if (result) {
          setVault(result);
          await refreshBalance();
        }
        return result;
      } catch (err: unknown) {
        logger.error('[useVault] Error creating vault:', err);
        return null;
      }
    },
    [sdk, squadId, refreshBalance]
  );

  const deposit = useCallback(
    async (request: VaultDepositRequest): Promise<boolean> => {
      try {
        const success = await sdk.vault.deposit(squadId, request);
        if (success) {
          await refreshBalance();
        }
        return success;
      } catch (err: unknown) {
        logger.error('[useVault] Error depositing:', err);
        return false;
      }
    },
    [sdk, squadId, refreshBalance]
  );

  const isLocked = useMemo(() => vault?.is_locked || false, [vault]);
  const hasVault = useMemo(() => vault !== null, [vault]);

  useEffect(() => {
    if (autoFetch && squadId) {
      refreshVault();
      refreshBalance();
    }
  }, [autoFetch, squadId, refreshVault, refreshBalance]);

  return {
    vault,
    balance,
    isLoadingVault,
    isLoadingBalance,
    vaultError,
    balanceError,
    refreshVault,
    refreshBalance,
    createVault,
    deposit,
    isLocked,
    hasVault,
  };
}

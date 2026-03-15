'use client';

import { useState, useCallback, useEffect } from 'react';
import { useSDK } from '@/contexts/sdk-context';
import { logger } from '@/lib/logger';
import type {
  VaultProposal,
  ProposalsResult,
  ProposalFilters,
  ProposeTransactionRequest,
  ApproveProposalRequest,
  RejectProposalRequest,
} from '@/types/replay-api/vault.types';

export interface UseVaultProposalsResult {
  proposals: ProposalsResult | null;
  selectedProposal: VaultProposal | null;
  isLoading: boolean;
  error: string | null;
  refreshProposals: (filters?: ProposalFilters) => Promise<void>;
  getProposal: (proposalId: string) => Promise<void>;
  proposeTransaction: (request: ProposeTransactionRequest) => Promise<VaultProposal | null>;
  approveProposal: (proposalId: string, request?: ApproveProposalRequest) => Promise<boolean>;
  rejectProposal: (proposalId: string, reason: string) => Promise<boolean>;
  cancelProposal: (proposalId: string) => Promise<boolean>;
}

export function useVaultProposals(
  squadId: string,
  autoFetch = true,
  initialFilters: ProposalFilters = { limit: 20, offset: 0 }
): UseVaultProposalsResult {
  const { sdk } = useSDK();
  const [proposals, setProposals] = useState<ProposalsResult | null>(null);
  const [selectedProposal, setSelectedProposal] = useState<VaultProposal | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<ProposalFilters>(initialFilters);

  const refreshProposals = useCallback(
    async (newFilters?: ProposalFilters) => {
      if (!squadId) return;
      setIsLoading(true);
      setError(null);
      const activeFilters = newFilters || filters;
      if (newFilters) setFilters(newFilters);
      try {
        const result = await sdk.vault.getProposals(squadId, activeFilters);
        setProposals(result);
        if (!result) setError('Failed to fetch proposals');
      } catch (err: unknown) {
        logger.error('[useVaultProposals] Error:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setIsLoading(false);
      }
    },
    [sdk, squadId, filters]
  );

  const getProposal = useCallback(
    async (proposalId: string) => {
      if (!squadId) return;
      try {
        const result = await sdk.vault.getProposalById(squadId, proposalId);
        setSelectedProposal(result);
      } catch (err: unknown) {
        logger.error('[useVaultProposals] Error fetching proposal:', err);
      }
    },
    [sdk, squadId]
  );

  const proposeTransaction = useCallback(
    async (request: ProposeTransactionRequest): Promise<VaultProposal | null> => {
      try {
        const result = await sdk.vault.proposeTransaction(squadId, request);
        if (result) await refreshProposals();
        return result;
      } catch (err: unknown) {
        logger.error('[useVaultProposals] Error proposing:', err);
        return null;
      }
    },
    [sdk, squadId, refreshProposals]
  );

  const approveProposal = useCallback(
    async (proposalId: string, request: ApproveProposalRequest = {}): Promise<boolean> => {
      try {
        const success = await sdk.vault.approveProposal(squadId, proposalId, request);
        if (success) await refreshProposals();
        return success;
      } catch (err: unknown) {
        logger.error('[useVaultProposals] Error approving:', err);
        return false;
      }
    },
    [sdk, squadId, refreshProposals]
  );

  const rejectProposal = useCallback(
    async (proposalId: string, reason: string): Promise<boolean> => {
      try {
        const success = await sdk.vault.rejectProposal(squadId, proposalId, { reason });
        if (success) await refreshProposals();
        return success;
      } catch (err: unknown) {
        logger.error('[useVaultProposals] Error rejecting:', err);
        return false;
      }
    },
    [sdk, squadId, refreshProposals]
  );

  const cancelProposal = useCallback(
    async (proposalId: string): Promise<boolean> => {
      try {
        const success = await sdk.vault.cancelProposal(squadId, proposalId);
        if (success) await refreshProposals();
        return success;
      } catch (err: unknown) {
        logger.error('[useVaultProposals] Error cancelling:', err);
        return false;
      }
    },
    [sdk, squadId, refreshProposals]
  );

  useEffect(() => {
    if (autoFetch && squadId) {
      refreshProposals();
    }
  }, [autoFetch, squadId, refreshProposals]);

  return {
    proposals,
    selectedProposal,
    isLoading,
    error,
    refreshProposals,
    getProposal,
    proposeTransaction,
    approveProposal,
    rejectProposal,
    cancelProposal,
  };
}

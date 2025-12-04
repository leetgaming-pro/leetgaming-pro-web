/**
 * useTournament Hook
 * React hook for tournament operations with state management
 */

'use client';

import { useState, useCallback, useMemo } from 'react';
import { ReplayAPISDK } from '@/types/replay-api/sdk';
import { ReplayApiSettingsMock } from '@/types/replay-api/settings';
import { logger } from '@/lib/logger';
import type {
  Tournament,
  TournamentStatus,
  CreateTournamentRequest,
  UpdateTournamentRequest,
  RegisterPlayerRequest,
  CompleteTournamentRequest,
  CancelTournamentRequest,
  TournamentListFilters,
  TournamentWinner,
} from '@/types/replay-api/tournament.types';
import {
  canRegister,
  isFull,
  isPlayerRegistered,
  hasStarted,
  isTerminal,
  canEdit,
  getParticipantCountDisplay,
  getFillPercentage,
  formatPrizePool,
  formatEntryFee,
  getTimeUntilStart,
  sortTournamentsByRelevance,
  filterTournaments,
  getActiveTournaments,
} from '@/types/replay-api/tournament.types';

const getApiBaseUrl = (): string =>
  typeof window !== 'undefined'
    ? process.env.NEXT_PUBLIC_REPLAY_API_URL || 'http://localhost:8080'
    : process.env.NEXT_PUBLIC_REPLAY_API_URL || process.env.REPLAY_API_URL || 'http://localhost:8080';

// --- Hook Types ---

export interface UseTournamentResult {
  // State
  tournament: Tournament | null;
  tournaments: Tournament[];
  myTournaments: Tournament[];
  upcomingTournaments: Tournament[];
  isLoading: boolean;
  error: string | null;
  // Computed (using helper functions from types)
  canRegisterForTournament: boolean;
  isTournamentFull: boolean;
  isUserRegistered: boolean;
  hasTournamentStarted: boolean;
  isTournamentTerminal: boolean;
  canEditTournament: boolean;
  participantDisplay: string;
  fillPercentage: number;
  prizePoolDisplay: string;
  entryFeeDisplay: string;
  timeUntilStart: string;
  // Actions
  getTournament: (tournamentId: string) => Promise<Tournament | null>;
  listTournaments: (filters?: TournamentListFilters) => Promise<void>;
  getUpcoming: (gameId: string, limit?: number) => Promise<void>;
  getMyTournaments: (playerId: string) => Promise<void>;
  createTournament: (request: CreateTournamentRequest) => Promise<Tournament | null>;
  updateTournament: (tournamentId: string, request: UpdateTournamentRequest) => Promise<Tournament | null>;
  deleteTournament: (tournamentId: string) => Promise<boolean>;
  registerPlayer: (tournamentId: string, request: RegisterPlayerRequest) => Promise<Tournament | null>;
  unregisterPlayer: (tournamentId: string, playerId: string) => Promise<Tournament | null>;
  openRegistration: (tournamentId: string) => Promise<Tournament | null>;
  closeRegistration: (tournamentId: string) => Promise<Tournament | null>;
  startTournament: (tournamentId: string) => Promise<Tournament | null>;
  completeTournament: (tournamentId: string, winners: TournamentWinner[]) => Promise<Tournament | null>;
  cancelTournament: (tournamentId: string, reason: string) => Promise<Tournament | null>;
  // Utility
  clearError: () => void;
  clearTournament: () => void;
  sortByRelevance: (tournaments: Tournament[]) => Tournament[];
  filterByStatus: (tournaments: Tournament[], statuses: TournamentStatus[]) => Tournament[];
  getActive: (tournaments: Tournament[]) => Tournament[];
}

export function useTournament(currentPlayerId?: string): UseTournamentResult {
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [myTournaments, setMyTournaments] = useState<Tournament[]>([]);
  const [upcomingTournaments, setUpcomingTournaments] = useState<Tournament[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sdk = useMemo(() => {
    const baseUrl = getApiBaseUrl();
    logger.info('[useTournament] Initializing SDK', { baseUrl });
    return new ReplayAPISDK({ ...ReplayApiSettingsMock, baseUrl }, logger);
  }, []);

  // Computed values using helper functions
  const canRegisterForTournament = useMemo(() => {
    return tournament ? canRegister(tournament) : false;
  }, [tournament]);

  const isTournamentFull = useMemo(() => {
    return tournament ? isFull(tournament) : false;
  }, [tournament]);

  const isUserRegistered = useMemo(() => {
    if (!tournament || !currentPlayerId) return false;
    return isPlayerRegistered(tournament, currentPlayerId);
  }, [tournament, currentPlayerId]);

  const hasTournamentStarted = useMemo(() => {
    return tournament ? hasStarted(tournament) : false;
  }, [tournament]);

  const isTournamentTerminal = useMemo(() => {
    return tournament ? isTerminal(tournament.status) : false;
  }, [tournament]);

  const canEditTournament = useMemo(() => {
    return tournament ? canEdit(tournament) : false;
  }, [tournament]);

  const participantDisplay = useMemo(() => {
    return tournament ? getParticipantCountDisplay(tournament) : '0/0';
  }, [tournament]);

  const fillPercentage = useMemo(() => {
    return tournament ? getFillPercentage(tournament) : 0;
  }, [tournament]);

  const prizePoolDisplay = useMemo(() => {
    return tournament ? formatPrizePool(tournament.prize_pool, tournament.currency) : '$0';
  }, [tournament]);

  const entryFeeDisplay = useMemo(() => {
    return tournament ? formatEntryFee(tournament.entry_fee, tournament.currency) : 'Free';
  }, [tournament]);

  const timeUntilStart = useMemo(() => {
    return tournament ? getTimeUntilStart(tournament.start_time) : '';
  }, [tournament]);

  // Actions
  const getTournament = useCallback(
    async (tournamentId: string): Promise<Tournament | null> => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await sdk.tournaments.getTournament(tournamentId);
        if (result) {
          setTournament(result);
        } else {
          setError('Tournament not found');
        }
        return result;
      } catch (err: unknown) {
        logger.error('[useTournament] Error fetching tournament:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [sdk]
  );

  const listTournaments = useCallback(
    async (filters?: TournamentListFilters) => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await sdk.tournaments.listTournaments(filters);
        if (result) {
          setTournaments(result.tournaments);
        } else {
          setError('Failed to list tournaments');
        }
      } catch (err: unknown) {
        logger.error('[useTournament] Error listing tournaments:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setIsLoading(false);
      }
    },
    [sdk]
  );

  const getUpcoming = useCallback(
    async (gameId: string, limit = 10) => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await sdk.tournaments.getUpcomingTournaments(gameId, limit);
        if (result) {
          setUpcomingTournaments(result);
        } else {
          setError('Failed to fetch upcoming tournaments');
        }
      } catch (err: unknown) {
        logger.error('[useTournament] Error fetching upcoming tournaments:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setIsLoading(false);
      }
    },
    [sdk]
  );

  const getMyTournaments = useCallback(
    async (playerId: string) => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await sdk.tournaments.getPlayerTournaments(playerId);
        if (result) {
          setMyTournaments(result);
        } else {
          setError('Failed to fetch your tournaments');
        }
      } catch (err: unknown) {
        logger.error('[useTournament] Error fetching player tournaments:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setIsLoading(false);
      }
    },
    [sdk]
  );

  const createTournament = useCallback(
    async (request: CreateTournamentRequest): Promise<Tournament | null> => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await sdk.tournaments.createTournament(request);
        if (result) {
          setTournament(result);
        } else {
          setError('Failed to create tournament');
        }
        return result;
      } catch (err: unknown) {
        logger.error('[useTournament] Error creating tournament:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [sdk]
  );

  const updateTournament = useCallback(
    async (tournamentId: string, request: UpdateTournamentRequest): Promise<Tournament | null> => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await sdk.tournaments.updateTournament(tournamentId, request);
        if (result) {
          setTournament(result);
        } else {
          setError('Failed to update tournament');
        }
        return result;
      } catch (err: unknown) {
        logger.error('[useTournament] Error updating tournament:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [sdk]
  );

  const deleteTournament = useCallback(
    async (tournamentId: string): Promise<boolean> => {
      setIsLoading(true);
      setError(null);

      try {
        const success = await sdk.tournaments.deleteTournament(tournamentId);
        if (success) {
          setTournament(null);
        } else {
          setError('Failed to delete tournament');
        }
        return success;
      } catch (err: unknown) {
        logger.error('[useTournament] Error deleting tournament:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [sdk]
  );

  const registerPlayer = useCallback(
    async (tournamentId: string, request: RegisterPlayerRequest): Promise<Tournament | null> => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await sdk.tournaments.registerPlayer(tournamentId, request);
        if (result) {
          setTournament(result);
        } else {
          setError('Failed to register for tournament');
        }
        return result;
      } catch (err: unknown) {
        logger.error('[useTournament] Error registering player:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [sdk]
  );

  const unregisterPlayer = useCallback(
    async (tournamentId: string, playerId: string): Promise<Tournament | null> => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await sdk.tournaments.unregisterPlayer(tournamentId, playerId);
        if (result) {
          setTournament(result);
        } else {
          setError('Failed to unregister from tournament');
        }
        return result;
      } catch (err: unknown) {
        logger.error('[useTournament] Error unregistering player:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [sdk]
  );

  const openRegistration = useCallback(
    async (tournamentId: string): Promise<Tournament | null> => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await sdk.tournaments.openRegistration(tournamentId);
        if (result) {
          setTournament(result);
        } else {
          setError('Failed to open registration');
        }
        return result;
      } catch (err: unknown) {
        logger.error('[useTournament] Error opening registration:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [sdk]
  );

  const closeRegistration = useCallback(
    async (tournamentId: string): Promise<Tournament | null> => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await sdk.tournaments.closeRegistration(tournamentId);
        if (result) {
          setTournament(result);
        } else {
          setError('Failed to close registration');
        }
        return result;
      } catch (err: unknown) {
        logger.error('[useTournament] Error closing registration:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [sdk]
  );

  const startTournament = useCallback(
    async (tournamentId: string): Promise<Tournament | null> => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await sdk.tournaments.startTournament(tournamentId);
        if (result) {
          setTournament(result);
        } else {
          setError('Failed to start tournament');
        }
        return result;
      } catch (err: unknown) {
        logger.error('[useTournament] Error starting tournament:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [sdk]
  );

  const completeTournament = useCallback(
    async (tournamentId: string, winners: TournamentWinner[]): Promise<Tournament | null> => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await sdk.tournaments.completeTournament(tournamentId, { winners });
        if (result) {
          setTournament(result);
        } else {
          setError('Failed to complete tournament');
        }
        return result;
      } catch (err: unknown) {
        logger.error('[useTournament] Error completing tournament:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [sdk]
  );

  const cancelTournament = useCallback(
    async (tournamentId: string, reason: string): Promise<Tournament | null> => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await sdk.tournaments.cancelTournament(tournamentId, { reason });
        if (result) {
          setTournament(result);
        } else {
          setError('Failed to cancel tournament');
        }
        return result;
      } catch (err: unknown) {
        logger.error('[useTournament] Error cancelling tournament:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [sdk]
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const clearTournament = useCallback(() => {
    setTournament(null);
  }, []);

  // Utility functions using helpers from types
  const sortByRelevance = useCallback((items: Tournament[]) => {
    return sortTournamentsByRelevance(items);
  }, []);

  const filterByStatus = useCallback((items: Tournament[], statuses: TournamentStatus[]) => {
    return filterTournaments(items, { status: statuses });
  }, []);

  const getActive = useCallback((items: Tournament[]) => {
    return getActiveTournaments(items);
  }, []);

  return {
    tournament,
    tournaments,
    myTournaments,
    upcomingTournaments,
    isLoading,
    error,
    canRegisterForTournament,
    isTournamentFull,
    isUserRegistered,
    hasTournamentStarted,
    isTournamentTerminal,
    canEditTournament,
    participantDisplay,
    fillPercentage,
    prizePoolDisplay,
    entryFeeDisplay,
    timeUntilStart,
    getTournament,
    listTournaments,
    getUpcoming,
    getMyTournaments,
    createTournament,
    updateTournament,
    deleteTournament,
    registerPlayer,
    unregisterPlayer,
    openRegistration,
    closeRegistration,
    startTournament,
    completeTournament,
    cancelTournament,
    clearError,
    clearTournament,
    sortByRelevance,
    filterByStatus,
    getActive,
  };
}

// Re-export types
export type {
  Tournament,
  TournamentStatus,
  TournamentFormat,
  TournamentRules,
  TournamentPlayer,
  TournamentMatch,
  TournamentWinner,
  CreateTournamentRequest,
  UpdateTournamentRequest,
  RegisterPlayerRequest,
  TournamentListFilters,
} from '@/types/replay-api/tournament.types';

// Re-export helper functions for direct use
export {
  getStatusConfig,
  getMatchStatusConfig,
  getFormatConfig,
  formatTournamentDate,
  getPlacementDisplay,
  TOURNAMENT_STATUS_CONFIG,
  MATCH_STATUS_CONFIG,
  TOURNAMENT_FORMAT_CONFIG,
  DEFAULT_TOURNAMENT_RULES,
} from '@/types/replay-api/tournament.types';

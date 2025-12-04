/**
 * useLobby Hook
 * React hook for lobby operations with state management
 * Supports both WebSocket (real-time) and polling modes
 */

'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { ReplayAPISDK } from '@/types/replay-api/sdk';
import { ReplayApiSettingsMock } from '@/types/replay-api/settings';
import { logger } from '@/lib/logger';
import { useLobbyWebSocket } from './use-lobby-websocket';
import type {
  MatchmakingLobby,
  LobbyStatus,
  CreateLobbyRequest,
  CreateLobbyResponse,
  JoinLobbyResponse,
  SetPlayerReadyResponse,
  StartMatchResponse,
  ListLobbiesRequest,
  LobbyStats,
  PlayerSlot,
} from '@/types/replay-api/lobby.types';

const getApiBaseUrl = (): string =>
  typeof window !== 'undefined'
    ? process.env.NEXT_PUBLIC_REPLAY_API_URL || 'http://localhost:8080'
    : process.env.NEXT_PUBLIC_REPLAY_API_URL || process.env.REPLAY_API_URL || 'http://localhost:8080';

// --- Helper Functions ---

const isLobbyTerminal = (status: LobbyStatus): boolean => {
  return ['completed', 'cancelled', 'expired'].includes(status);
};

const isLobbyActive = (status: LobbyStatus): boolean => {
  return ['waiting_for_players', 'ready_check', 'starting', 'in_progress'].includes(status);
};

const getReadyCount = (slots: PlayerSlot[]): number => {
  return slots.filter((s) => s.player_id && s.is_ready).length;
};

const getPlayerCount = (slots: PlayerSlot[]): number => {
  return slots.filter((s) => s.player_id !== null).length;
};

// --- Hook Types ---

export interface UseLobbyOptions {
  /** Use WebSocket for real-time updates instead of polling (recommended) */
  useWebSocket?: boolean;
  /** Polling interval in ms (only used if useWebSocket is false) */
  pollIntervalMs?: number;
}

export interface UseLobbyResult {
  // State
  lobby: MatchmakingLobby | null;
  lobbies: MatchmakingLobby[];
  stats: LobbyStats | null;
  isLoading: boolean;
  error: string | null;
  // Connection state (WebSocket mode only)
  isConnected: boolean;
  connectionState: 'connecting' | 'connected' | 'disconnected' | 'error';
  // Computed
  isInLobby: boolean;
  isHost: boolean;
  playerCount: number;
  readyCount: number;
  canStart: boolean;
  // Actions
  createLobby: (request: CreateLobbyRequest) => Promise<CreateLobbyResponse | null>;
  joinLobby: (lobbyId: string, playerId: string, playerMmr?: number) => Promise<JoinLobbyResponse | null>;
  leaveLobby: (lobbyId: string) => Promise<boolean>;
  setReady: (lobbyId: string, playerId: string, isReady: boolean) => Promise<SetPlayerReadyResponse | null>;
  startMatch: (lobbyId: string) => Promise<StartMatchResponse | null>;
  cancelLobby: (lobbyId: string) => Promise<boolean>;
  refreshLobby: (lobbyId: string) => Promise<void>;
  listLobbies: (filters?: ListLobbiesRequest) => Promise<void>;
  fetchStats: (gameId?: string, region?: string) => Promise<void>;
  // Helpers
  clearError: () => void;
  clearLobby: () => void;
}

export function useLobby(
  currentPlayerId?: string,
  options: UseLobbyOptions = {}
): UseLobbyResult {
  const { useWebSocket = true, pollIntervalMs = 2000 } = options;

  const [lobbyState, setLobbyState] = useState<MatchmakingLobby | null>(null);
  const [lobbies, setLobbies] = useState<MatchmakingLobby[]>([]);
  const [stats, setStats] = useState<LobbyStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  // WebSocket hook for real-time updates
  const {
    connectionState,
    isConnected,
    lobby: wsLobby,
    subscribeLobby,
    unsubscribeLobby,
  } = useLobbyWebSocket({
    autoReconnect: true,
    onError: (err) => setError(err.message),
  });

  // Use WebSocket lobby state if available and WebSocket mode is enabled
  const lobby = useWebSocket && wsLobby ? wsLobby : lobbyState;

  const sdk = useMemo(() => {
    const baseUrl = getApiBaseUrl();
    logger.info('[useLobby] Initializing SDK', { baseUrl });
    return new ReplayAPISDK({ ...ReplayApiSettingsMock, baseUrl }, logger);
  }, []);

  // Computed values
  const isInLobby = useMemo(() => lobby !== null && isLobbyActive(lobby.status), [lobby]);

  const isHost = useMemo(() => {
    if (!lobby || !currentPlayerId) return false;
    return lobby.creator_id === currentPlayerId;
  }, [lobby, currentPlayerId]);

  const playerCount = useMemo(() => {
    if (!lobby) return 0;
    return getPlayerCount(lobby.player_slots);
  }, [lobby]);

  const readyCount = useMemo(() => {
    if (!lobby) return 0;
    return getReadyCount(lobby.player_slots);
  }, [lobby]);

  const canStart = useMemo(() => {
    if (!lobby || !isHost) return false;
    const players = getPlayerCount(lobby.player_slots);
    const ready = getReadyCount(lobby.player_slots);
    return (
      lobby.status === 'waiting_for_players' &&
      players >= lobby.min_players &&
      (!lobby.requires_ready_check || ready === players)
    );
  }, [lobby, isHost]);

  // Start real-time updates (WebSocket or polling)
  const startRealTimeUpdates = useCallback(
    (lobbyId: string) => {
      if (useWebSocket) {
        // Use WebSocket for real-time updates
        subscribeLobby(lobbyId);
        logger.info('[useLobby] Started WebSocket subscription', { lobbyId });
      } else {
        // Fall back to polling
        if (pollingRef.current) {
          clearInterval(pollingRef.current);
        }

        const poll = async () => {
          try {
            const result = await sdk.lobbies.getLobby(lobbyId);
            if (result?.lobby) {
              setLobbyState(result.lobby);
              if (isLobbyTerminal(result.lobby.status)) {
                stopRealTimeUpdates();
              }
            }
          } catch (err) {
            logger.error('[useLobby] Polling error:', err);
          }
        };

        // Initial poll
        poll();

        // Set up interval
        pollingRef.current = setInterval(poll, pollIntervalMs);
        logger.info('[useLobby] Started polling', { lobbyId, intervalMs: pollIntervalMs });
      }
    },
    [sdk, pollIntervalMs, useWebSocket, subscribeLobby]
  );

  // Stop real-time updates (WebSocket or polling)
  const stopRealTimeUpdates = useCallback(() => {
    if (useWebSocket) {
      unsubscribeLobby();
      logger.info('[useLobby] Stopped WebSocket subscription');
    }
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
      logger.info('[useLobby] Stopped polling');
    }
  }, [useWebSocket, unsubscribeLobby]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopRealTimeUpdates();
    };
  }, [stopRealTimeUpdates]);

  const createLobby = useCallback(
    async (request: CreateLobbyRequest): Promise<CreateLobbyResponse | null> => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await sdk.lobbies.createLobby(request);
        if (result) {
          setLobbyState(result.lobby);
          startRealTimeUpdates(result.lobby.id);
        } else {
          setError('Failed to create lobby');
        }
        return result;
      } catch (err: unknown) {
        logger.error('[useLobby] Error creating lobby:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [sdk, startRealTimeUpdates]
  );

  const joinLobby = useCallback(
    async (lobbyId: string, playerId: string, playerMmr?: number): Promise<JoinLobbyResponse | null> => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await sdk.lobbies.joinLobby(lobbyId, { player_id: playerId, player_mmr: playerMmr });
        if (result) {
          setLobbyState(result.lobby);
          startRealTimeUpdates(lobbyId);
        } else {
          setError('Failed to join lobby');
        }
        return result;
      } catch (err: unknown) {
        logger.error('[useLobby] Error joining lobby:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [sdk, startRealTimeUpdates]
  );

  const leaveLobby = useCallback(
    async (lobbyId: string): Promise<boolean> => {
      if (!currentPlayerId) return false;

      setIsLoading(true);
      setError(null);

      try {
        await sdk.lobbies.leaveLobby(lobbyId, { player_id: currentPlayerId });
        stopRealTimeUpdates();
        setLobbyState(null);
        return true;
      } catch (err: unknown) {
        logger.error('[useLobby] Error leaving lobby:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [sdk, currentPlayerId, stopRealTimeUpdates]
  );

  const setReady = useCallback(
    async (lobbyId: string, playerId: string, isReady: boolean): Promise<SetPlayerReadyResponse | null> => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await sdk.lobbies.setPlayerReady(lobbyId, { player_id: playerId, is_ready: isReady });
        if (result) {
          setLobbyState(result.lobby);
        } else {
          setError('Failed to update ready status');
        }
        return result;
      } catch (err: unknown) {
        logger.error('[useLobby] Error setting ready status:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [sdk]
  );

  const startMatch = useCallback(
    async (lobbyId: string): Promise<StartMatchResponse | null> => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await sdk.lobbies.startMatch(lobbyId);
        if (result) {
          setLobbyState(result.lobby);
        } else {
          setError('Failed to start match');
        }
        return result;
      } catch (err: unknown) {
        logger.error('[useLobby] Error starting match:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [sdk]
  );

  const cancelLobby = useCallback(
    async (lobbyId: string): Promise<boolean> => {
      setIsLoading(true);
      setError(null);

      try {
        await sdk.lobbies.cancelLobby(lobbyId);
        stopRealTimeUpdates();
        setLobbyState(null);
        return true;
      } catch (err: unknown) {
        logger.error('[useLobby] Error cancelling lobby:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [sdk, stopRealTimeUpdates]
  );

  const refreshLobby = useCallback(
    async (lobbyId: string) => {
      try {
        const result = await sdk.lobbies.getLobby(lobbyId);
        if (result?.lobby) {
          setLobbyState(result.lobby);
        }
      } catch (err: unknown) {
        logger.error('[useLobby] Error refreshing lobby:', err);
      }
    },
    [sdk]
  );

  const listLobbies = useCallback(
    async (filters?: ListLobbiesRequest) => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await sdk.lobbies.listLobbies(filters);
        if (result) {
          setLobbies(result.lobbies);
        } else {
          setError('Failed to list lobbies');
        }
      } catch (err: unknown) {
        logger.error('[useLobby] Error listing lobbies:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setIsLoading(false);
      }
    },
    [sdk]
  );

  const fetchStats = useCallback(
    async (gameId?: string, region?: string) => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await sdk.lobbies.getLobbyStats(gameId, region);
        setStats(result);
        if (!result) {
          setError('Failed to fetch lobby stats');
        }
      } catch (err: unknown) {
        logger.error('[useLobby] Error fetching stats:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setIsLoading(false);
      }
    },
    [sdk]
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const clearLobby = useCallback(() => {
    stopRealTimeUpdates();
    setLobbyState(null);
  }, [stopRealTimeUpdates]);

  return {
    // State
    lobby,
    lobbies,
    stats,
    isLoading,
    error,
    // Connection state (WebSocket mode)
    isConnected: useWebSocket ? isConnected : true,
    connectionState: useWebSocket ? connectionState : 'connected',
    // Computed
    isInLobby,
    isHost,
    playerCount,
    readyCount,
    canStart,
    // Actions
    createLobby,
    joinLobby,
    leaveLobby,
    setReady,
    startMatch,
    cancelLobby,
    refreshLobby,
    listLobbies,
    fetchStats,
    // Helpers
    clearError,
    clearLobby,
  };
}

// Re-export types
export type {
  MatchmakingLobby,
  LobbyStatus,
  CreateLobbyRequest,
  CreateLobbyResponse,
  JoinLobbyResponse,
  SetPlayerReadyResponse,
  StartMatchResponse,
  ListLobbiesRequest,
  LobbyStats,
  PlayerSlot,
};

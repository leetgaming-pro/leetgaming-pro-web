/**
 * useMatchmaking Hook
 * React hook for matchmaking operations with state management and polling
 */

'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { ReplayAPISDK } from '@/types/replay-api/sdk';
import { ReplayApiSettingsMock } from '@/types/replay-api/settings';
import { logger } from '@/lib/logger';
import type {
  JoinQueueRequest,
  JoinQueueResponse,
  SessionStatusResponse,
  PoolStatsResponse,
  SessionStatus,
} from '@/types/replay-api/matchmaking.types';
import { isSessionTerminal, isSessionActive } from '@/types/replay-api/matchmaking.types';

const getApiBaseUrl = (): string =>
  typeof window !== 'undefined'
    ? process.env.NEXT_PUBLIC_REPLAY_API_URL || 'http://localhost:8080'
    : process.env.NEXT_PUBLIC_REPLAY_API_URL || process.env.REPLAY_API_URL || 'http://localhost:8080';

export interface UseMatchmakingResult {
  // State
  session: SessionStatusResponse | null;
  poolStats: PoolStatsResponse | null;
  isSearching: boolean;
  isLoading: boolean;
  error: string | null;
  elapsedTime: number;
  // Actions
  joinQueue: (request: JoinQueueRequest) => Promise<JoinQueueResponse | null>;
  leaveQueue: () => Promise<boolean>;
  refreshSession: () => Promise<void>;
  fetchPoolStats: (gameId: string, gameMode?: string, region?: string) => Promise<void>;
  // Helpers
  clearError: () => void;
}

export function useMatchmaking(pollIntervalMs = 2000): UseMatchmakingResult {
  const [session, setSession] = useState<SessionStatusResponse | null>(null);
  const [poolStats, setPoolStats] = useState<PoolStatsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);

  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const elapsedRef = useRef<NodeJS.Timeout | null>(null);

  const sdk = useMemo(() => {
    const baseUrl = getApiBaseUrl();
    logger.info('[useMatchmaking] Initializing SDK', { baseUrl });
    return new ReplayAPISDK({ ...ReplayApiSettingsMock, baseUrl }, logger);
  }, []);

  const isSearching = useMemo(() => {
    return session !== null && isSessionActive(session.status as SessionStatus);
  }, [session]);

  // Start elapsed time counter
  const startElapsedTimer = useCallback(() => {
    if (elapsedRef.current) {
      clearInterval(elapsedRef.current);
    }
    setElapsedTime(0);
    elapsedRef.current = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
    }, 1000);
  }, []);

  // Stop elapsed time counter
  const stopElapsedTimer = useCallback(() => {
    if (elapsedRef.current) {
      clearInterval(elapsedRef.current);
      elapsedRef.current = null;
    }
  }, []);

  // Start polling for session status
  const startPolling = useCallback((sessionId: string) => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
    }

    const poll = async () => {
      try {
        const status = await sdk.matchmaking.getSessionStatus(sessionId);
        if (status) {
          setSession(status);
          if (isSessionTerminal(status.status as SessionStatus)) {
            stopPolling();
            stopElapsedTimer();
          }
        }
      } catch (err) {
        logger.error('[useMatchmaking] Polling error:', err);
      }
    };

    // Initial poll
    poll();

    // Set up interval
    pollingRef.current = setInterval(poll, pollIntervalMs);
    logger.info('[useMatchmaking] Started polling', { sessionId, intervalMs: pollIntervalMs });
  }, [sdk, pollIntervalMs, stopElapsedTimer]);

  // Stop polling
  const stopPolling = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
      logger.info('[useMatchmaking] Stopped polling');
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopPolling();
      stopElapsedTimer();
    };
  }, [stopPolling, stopElapsedTimer]);

  const joinQueue = useCallback(async (request: JoinQueueRequest): Promise<JoinQueueResponse | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await sdk.matchmaking.joinQueue(request);
      if (result) {
        setSession({
          session_id: result.session_id,
          status: result.status,
          elapsed_time: 0,
          estimated_wait: result.estimated_wait_seconds,
          queue_position: result.queue_position,
        });
        startPolling(result.session_id);
        startElapsedTimer();
      } else {
        setError('Failed to join queue');
      }
      return result;
    } catch (err: unknown) {
      logger.error('[useMatchmaking] Error joining queue:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [sdk, startPolling, startElapsedTimer]);

  const leaveQueue = useCallback(async (): Promise<boolean> => {
    if (!session) return false;

    setIsLoading(true);
    setError(null);

    try {
      const success = await sdk.matchmaking.leaveQueue(session.session_id);
      if (success) {
        stopPolling();
        stopElapsedTimer();
        setSession(null);
        setElapsedTime(0);
      } else {
        setError('Failed to leave queue');
      }
      return success;
    } catch (err: unknown) {
      logger.error('[useMatchmaking] Error leaving queue:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [sdk, session, stopPolling, stopElapsedTimer]);

  const refreshSession = useCallback(async () => {
    if (!session) return;

    try {
      const status = await sdk.matchmaking.getSessionStatus(session.session_id);
      if (status) {
        setSession(status);
      }
    } catch (err: unknown) {
      logger.error('[useMatchmaking] Error refreshing session:', err);
    }
  }, [sdk, session]);

  const fetchPoolStats = useCallback(async (gameId: string, gameMode?: string, region?: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const stats = await sdk.matchmaking.getPoolStats(gameId, gameMode, region);
      setPoolStats(stats);
      if (!stats) {
        setError('Failed to fetch pool stats');
      }
    } catch (err: unknown) {
      logger.error('[useMatchmaking] Error fetching pool stats:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, [sdk]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    session,
    poolStats,
    isSearching,
    isLoading,
    error,
    elapsedTime,
    joinQueue,
    leaveQueue,
    refreshSession,
    fetchPoolStats,
    clearError,
  };
}

// Re-export types
export type { JoinQueueRequest, JoinQueueResponse, SessionStatusResponse, PoolStatsResponse };

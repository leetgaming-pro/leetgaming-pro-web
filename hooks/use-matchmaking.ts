/**
 * useMatchmaking Hook
 * React hook for matchmaking operations with state management and polling
 */

"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useSDK } from "@/contexts/sdk-context";
import { logger } from "@/lib/logger";
import type {
  JoinQueueRequest,
  JoinQueueResponse,
  SessionStatusResponse,
  PoolStatsResponse,
  SessionStatus,
  MatchmakingError,
  MatchmakingErrorResponse,
} from "@/types/replay-api/matchmaking.types";
import {
  isSessionTerminal,
  isSessionActive,
} from "@/types/replay-api/matchmaking.types";
import type {
  CommitmentConfirmResponse,
  CommitmentSummaryResponse,
  GameConnectionInfoResponse,
} from "@/types/replay-api/lobby.sdk";

export interface UseMatchmakingResult {
  // State
  session: SessionStatusResponse | null;
  poolStats: PoolStatsResponse | null;
  isSearching: boolean;
  isLoading: boolean;
  error: MatchmakingError | null;
  elapsedTime: number;
  lobbyId?: string;
  matchId?: string;
  // Actions
  joinQueue: (request: JoinQueueRequest) => Promise<JoinQueueResponse | null>;
  leaveQueue: () => Promise<boolean>;
  refreshSession: () => Promise<void>;
  fetchPoolStats: (
    gameId: string,
    gameMode?: string,
    region?: string
  ) => Promise<void>;
  joinLobby: (lobbyId: string) => Promise<boolean>;
  acceptMatch: () => Promise<boolean>;
  declineMatch: () => Promise<boolean>;
  // Readiness confirmation actions
  confirmReadiness: (lobbyId: string) => Promise<CommitmentConfirmResponse | null>;
  declineReadiness: (lobbyId: string, reason?: string) => Promise<CommitmentSummaryResponse | null>;
  getCommitmentSummary: (lobbyId: string) => Promise<CommitmentSummaryResponse | null>;
  getConnectionInfo: (lobbyId: string) => Promise<GameConnectionInfoResponse | null>;
  // Helpers
  clearError: () => void;
  retryLastAction: () => Promise<void>;
}

export function useMatchmaking(pollIntervalMs = 2000): UseMatchmakingResult {
  const { sdk } = useSDK();
  const [session, setSession] = useState<SessionStatusResponse | null>(null);
  const [poolStats, setPoolStats] = useState<PoolStatsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<MatchmakingError | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [lobbyId, setLobbyId] = useState<string | undefined>();
  const [matchId, setMatchId] = useState<string | undefined>();

  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const elapsedRef = useRef<NodeJS.Timeout | null>(null);
  const lobbyPollingRef = useRef<NodeJS.Timeout | null>(null);
  const lastActionRef = useRef<(() => Promise<void>) | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

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

  // ─── Real-time WebSocket for instant match_found delivery ─────
  // Opens /ws/notifications while the player is in queue.
  // On "match_found" the session is refreshed immediately, avoiding
  // up to 2 s of polling latency.  Falls back gracefully to HTTP
  // polling if the WebSocket cannot connect.

  const closeNotificationWs = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
  }, []);

  const openNotificationWs = useCallback(
    (sessionId: string) => {
      closeNotificationWs(); // idempotent

      try {
        const apiUrl =
          process.env.NEXT_PUBLIC_REPLAY_API_URL || "http://localhost:8080";
        const wsUrl = apiUrl
          .replace(/^http/, "ws")
          .replace(/\/$/, "");
        const ws = new WebSocket(`${wsUrl}/ws/notifications`);

        ws.onopen = () => {
          logger.info("[useMatchmaking] WS notifications connected");
        };

        ws.onmessage = (event) => {
          try {
            const msg = JSON.parse(event.data);
            if (
              msg.type === "match_found" ||
              msg.type === "all_players_ready" ||
              msg.type === "ready_check_timeout"
            ) {
              logger.info("[useMatchmaking] WS received", { type: msg.type });
              // Trigger an immediate poll to pick up the new state
              sdk.matchmaking.getSessionStatus(sessionId).then((status) => {
                if (status) {
                  setSession(status);
                  // Extract lobby_id from session status if available
                  if (status.lobby_id) {
                    setLobbyId(status.lobby_id);
                  }
                }
              });
            }
          } catch {
            // non-JSON or unknown message — ignore
          }
        };

        ws.onerror = () => {
          logger.warn(
            "[useMatchmaking] WS notifications error — falling back to polling"
          );
        };

        ws.onclose = () => {
          logger.info("[useMatchmaking] WS notifications closed");
        };

        wsRef.current = ws;
      } catch {
        logger.warn(
          "[useMatchmaking] Failed to open WS notifications — polling only"
        );
      }
    },
    [sdk, closeNotificationWs]
  );

  // Start polling for session status
  const startPolling = useCallback(
    (sessionId: string) => {
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
              closeNotificationWs();
            }
          }
        } catch (err) {
          logger.error("[useMatchmaking] Polling error:", err);
        }
      };

      // Initial poll
      poll();

      // Set up interval
      pollingRef.current = setInterval(poll, pollIntervalMs);
      logger.info("[useMatchmaking] Started polling", {
        sessionId,
        intervalMs: pollIntervalMs,
      });
    },
    [sdk, pollIntervalMs, stopElapsedTimer]
  );

  // Stop polling
  const stopPolling = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
      logger.info("[useMatchmaking] Stopped polling");
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopPolling();
      stopElapsedTimer();
    };
  }, [stopPolling, stopElapsedTimer]);

  const joinQueue = useCallback(
    async (request: JoinQueueRequest): Promise<JoinQueueResponse | null> => {
      setIsLoading(true);
      setError(null);

      // Store last action for retry
      lastActionRef.current = async () => {
        await joinQueue(request);
      };

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
          openNotificationWs(result.session_id);
        } else {
          setError("NETWORK_ERROR");
        }
        return result;
      } catch (err: unknown) {
        logger.error("[useMatchmaking] Error joining queue:", err);

        // Try to parse error response for specific error types
        let matchmakingError: MatchmakingError = "NETWORK_ERROR";
        if (err && typeof err === "object" && "error" in err) {
          const errorResponse = err as MatchmakingErrorResponse;
          matchmakingError = errorResponse.error;
        }

        setError(matchmakingError);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [sdk, startPolling, startElapsedTimer, openNotificationWs]
  );

  const leaveQueue = useCallback(async (): Promise<boolean> => {
    if (!session) return false;

    setIsLoading(true);
    setError(null);

    try {
      const success = await sdk.matchmaking.leaveQueue(session.session_id);
      if (success) {
        stopPolling();
        stopElapsedTimer();
        closeNotificationWs();
        setSession(null);
        setElapsedTime(0);
      } else {
        setError("LOBBY_ERROR" as MatchmakingError);
      }
      return success;
    } catch (err: unknown) {
      logger.error("[useMatchmaking] Error leaving queue:", err);
      setError("LOBBY_ERROR" as MatchmakingError);
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
      logger.error("[useMatchmaking] Error refreshing session:", err);
    }
  }, [sdk, session]);

  const fetchPoolStats = useCallback(
    async (gameId: string, gameMode?: string, region?: string) => {
      setIsLoading(true);
      setError(null);

      try {
        const stats = await sdk.matchmaking.getPoolStats(
          gameId,
          gameMode,
          region
        );
        setPoolStats(stats);
        if (!stats) {
          setError("LOBBY_ERROR" as MatchmakingError);
        }
      } catch (err: unknown) {
        logger.error("[useMatchmaking] Error fetching pool stats:", err);
        setError("LOBBY_ERROR" as MatchmakingError);
      } finally {
        setIsLoading(false);
      }
    },
    [sdk]
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const retryLastAction = useCallback(async () => {
    if (lastActionRef.current) {
      await lastActionRef.current();
    }
  }, []);

  const joinLobby = useCallback(
    async (lobbyId: string): Promise<boolean> => {
      if (!session) return false;

      setIsLoading(true);
      setError(null);

      try {
        // Use lobby SDK from context
        const lobbySdk = sdk.lobbies;
        await lobbySdk.joinLobby(lobbyId, {
          player_id: session.session_id, // This should be the actual player ID
        });
        await lobbySdk.setPlayerReady(lobbyId, {
          player_id: session.session_id, // This should be the actual player ID
          is_ready: false, // Initially not ready
        });

        setLobbyId(lobbyId);

        // Start lobby polling
        startLobbyPolling(lobbyId);

        return true;
      } catch (err: unknown) {
        logger.error("[useMatchmaking] Error joining lobby:", err);
        setError("LOBBY_ERROR");
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [sdk, session]
  );

  // Lobby polling functions
  const stopLobbyPolling = useCallback(() => {
    if (lobbyPollingRef.current) {
      clearInterval(lobbyPollingRef.current);
      lobbyPollingRef.current = null;
    }
  }, []);

  const startLobbyPolling = useCallback(
    (lobbyId: string) => {
      if (lobbyPollingRef.current) {
        clearInterval(lobbyPollingRef.current);
      }

      const poll = async () => {
        try {
          const lobbySdk = sdk.lobbies;
          const result = await lobbySdk.getLobby(lobbyId);

          if (result?.lobby) {
            const lobby = result.lobby;
            // Update session with lobby info
            if (lobby.match_id) {
              setMatchId(lobby.match_id);
              setSession((prev) =>
                prev
                  ? {
                      ...prev,
                      match_id: lobby.match_id,
                      lobby_id: lobbyId,
                    }
                  : null
              );
            }

            // Check if lobby is ready to start
            if (lobby.status === "starting" || lobby.status === "started") {
              stopLobbyPolling();
            }
          }
        } catch (err) {
          logger.error("[useMatchmaking] Lobby polling error:", err);
        }
      };

      // Initial poll
      poll();

      // Set up interval
      lobbyPollingRef.current = setInterval(poll, 1500); // Poll every 1.5 seconds
    },
    [sdk, stopLobbyPolling]
  );

  const acceptMatch = useCallback(async (): Promise<boolean> => {
    if (!lobbyId || !session) return false;

    setIsLoading(true);
    setError(null);

    try {
      const result = await sdk.lobbies.confirmReadiness(lobbyId);
      if (!result) {
        setError("LOBBY_ERROR");
        return false;
      }

      if (result.all_ready) {
        stopLobbyPolling();
      }

      return true;
    } catch (err: unknown) {
      logger.error("[useMatchmaking] Error accepting match:", err);
      setError("LOBBY_ERROR");
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [sdk, lobbyId, session, stopLobbyPolling]);

  const declineMatch = useCallback(async (): Promise<boolean> => {
    if (!lobbyId || !session) return false;

    setIsLoading(true);
    setError(null);

    try {
      const result = await sdk.lobbies.declineReadiness(lobbyId, "player_declined");
      if (!result) {
        setError("LOBBY_ERROR");
        return false;
      }

      stopPolling();
      closeNotificationWs();
      stopElapsedTimer();
      setLobbyId(undefined);
      stopLobbyPolling();
      setSession((prev) =>
        prev
          ? {
              ...prev,
              status: "cancelled",
            }
          : null
      );

      return true;
    } catch (err: unknown) {
      logger.error("[useMatchmaking] Error declining match:", err);
      setError("LOBBY_ERROR");
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [sdk, lobbyId, session, stopPolling, closeNotificationWs, stopElapsedTimer, stopLobbyPolling]);

  // ─── Readiness Confirmation Actions ───────────────────────────

  const confirmReadiness = useCallback(
    async (lobbyIdParam: string): Promise<CommitmentConfirmResponse | null> => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await sdk.lobbies.confirmReadiness(lobbyIdParam);
        return result;
      } catch (err: unknown) {
        logger.error("[useMatchmaking] Error confirming readiness:", err);
        setError("LOBBY_ERROR" as MatchmakingError);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [sdk]
  );

  const declineReadiness = useCallback(
    async (lobbyIdParam: string, reason?: string): Promise<CommitmentSummaryResponse | null> => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await sdk.lobbies.declineReadiness(lobbyIdParam, reason);
        return result;
      } catch (err: unknown) {
        logger.error("[useMatchmaking] Error declining readiness:", err);
        setError("LOBBY_ERROR" as MatchmakingError);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [sdk]
  );

  const getCommitmentSummary = useCallback(
    async (lobbyIdParam: string): Promise<CommitmentSummaryResponse | null> => {
      try {
        return await sdk.lobbies.getCommitmentSummary(lobbyIdParam);
      } catch (err: unknown) {
        logger.error("[useMatchmaking] Error fetching commitment summary:", err);
        return null;
      }
    },
    [sdk]
  );

  const getConnectionInfo = useCallback(
    async (lobbyIdParam: string): Promise<GameConnectionInfoResponse | null> => {
      try {
        return await sdk.lobbies.getGameConnectionInfo(lobbyIdParam);
      } catch (err: unknown) {
        logger.error("[useMatchmaking] Error fetching connection info:", err);
        return null;
      }
    },
    [sdk]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopPolling();
      stopElapsedTimer();
      stopLobbyPolling();
      closeNotificationWs();
    };
  }, [stopPolling, stopElapsedTimer, stopLobbyPolling, closeNotificationWs]);

  return {
    session,
    poolStats,
    isSearching,
    isLoading,
    error,
    elapsedTime,
    lobbyId,
    matchId,
    joinQueue,
    leaveQueue,
    refreshSession,
    fetchPoolStats,
    joinLobby,
    acceptMatch,
    declineMatch,
    confirmReadiness,
    declineReadiness,
    getCommitmentSummary,
    getConnectionInfo,
    clearError,
    retryLastAction,
  };
}

// Re-export types
export type {
  JoinQueueRequest,
  JoinQueueResponse,
  SessionStatusResponse,
  PoolStatsResponse,
};

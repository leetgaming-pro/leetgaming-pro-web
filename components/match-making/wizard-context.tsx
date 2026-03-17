/**
 * Wizard Context - Centralized State Management
 * Manages all wizard form data across multiple steps
 */

"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  ReactNode,
  useCallback,
} from "react";
import { useRouter } from "next/navigation";
import { DistributionRule } from "./prize-distribution-selector";
import { MatchmakingAPI } from "@/types/replay-api/matchmaking.sdk";
import { ReplayAPISDK } from "@/types/replay-api/sdk";
import { ReplayApiSettingsMock } from "@/types/replay-api/settings";
import { logger } from "@/lib/logger";
import type {
  MatchmakingUIState,
  MatchmakingError,
  SessionStatusResponse,
} from "@/types/replay-api/matchmaking.types";
import { ensureSession, createGuestToken } from "@/types/replay-api/auth";

/** Ready check sub-state — active when a match is found and players must confirm */
export interface ReadyCheckState {
  isActive: boolean;
  lobbyId: string;
  gameName: string;
  tier?: string;
  prizePool?: string;
  timeoutSeconds: number;
  players: Array<{
    id: string;
    displayName: string;
    avatarUrl?: string;
    status: "pending" | "confirmed" | "declined" | "timed_out";
  }>;
  currentPlayerId: string;
}

export interface WizardState {
  // Step 0: Tier Selection
  tier?: "free" | "premium" | "pro" | "elite";

  // Step 1: Game Selection (NEW)
  selectedGame?: string; // Game ID (e.g., 'cs2', 'valorant')
  selectedProfileId?: string; // Profile ID for the selected game

  // Step 2: Region
  region: string;

  // Step 3: Game Mode
  gameMode: string;

  // Step 4: Squad
  squadId?: string;
  teamType?: "solo" | "duo" | "squad";
  selectedFriends?: string[];

  // Step 5: Schedule (optional for instant matchmaking)
  scheduleStart?: Date;
  scheduleEnd?: Date;
  weeklyRoutine?: string[];
  scheduleType?: "now" | "time-frames" | "weekly-routine";
  schedule?: {
    timeWindow?: string;
    weeklyRoutine?: string[];
  };

  // Step 6: Prize Distribution
  distributionRule: DistributionRule;
  expectedPool?: number;

  // Step 7: Review
  confirmed?: boolean;

  // Matchmaking State
  matchmaking?: MatchmakingUIState;

  // Ready Check State (active when match found, awaiting confirmation)
  readyCheck?: ReadyCheckState;
}

interface WizardContextType {
  state: WizardState;
  updateState: (updates: Partial<WizardState>) => void;
  resetState: () => void;
  startMatchmaking: (playerId: string) => Promise<void>;
  cancelMatchmaking: () => Promise<void>;
  confirmReady: () => Promise<void>;
  declineReady: () => Promise<void>;
  /** Called by WebSocket/polling when a player's ready status changes */
  updateReadyCheckPlayer: (playerId: string, status: "confirmed" | "declined" | "timed_out") => void;
  /** Called when ALL players confirmed — navigates to match */
  handleAllPlayersReady: (matchId?: string) => void;
  sdk: MatchmakingAPI;
}

const initialState: WizardState = {
  region: "",
  gameMode: "",
  distributionRule: "winner_takes_all",
  confirmed: false,
};

const WizardContext = createContext<WizardContextType | undefined>(undefined);

// Initialize SDK with frontend API routes (which handle auth and forward to backend)
const sdk = new ReplayAPISDK(ReplayApiSettingsMock, logger);
const matchmakingSDK = sdk.matchmaking;

export function WizardProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<WizardState>(initialState);
  const elapsedTimeIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();

  // Handle match found — enter ready check phase instead of navigating immediately
  const handleMatchFound = useCallback(
    (status: SessionStatusResponse) => {
      matchmakingSDK.stopPolling();
      if (elapsedTimeIntervalRef.current) {
        clearInterval(elapsedTimeIntervalRef.current);
        elapsedTimeIntervalRef.current = null;
      }

      const lobbyId = status.lobby_id || "";
      const matchId = status.match_id;

      // Build ready check state from session status
      const readyCheckPlayers = status.ready_check?.players?.map((p) => ({
        id: p.player_id,
        displayName: p.display_name || p.player_id.slice(0, 8),
        avatarUrl: p.avatar_url,
        status: p.status as "pending" | "confirmed" | "declined" | "timed_out",
      })) || [
        // Fallback: create placeholder players for the current user
        {
          id: state.selectedProfileId || "unknown",
          displayName: "You",
          status: "pending" as const,
        },
        {
          id: "opponent",
          displayName: "Opponent",
          status: "pending" as const,
        },
      ];

      setState((prev) => ({
        ...prev,
        matchmaking: prev.matchmaking
          ? {
              ...prev.matchmaking,
              isSearching: false,
              matchId,
              lobbyId,
            }
          : prev.matchmaking,
        readyCheck: {
          isActive: true,
          lobbyId,
          gameName: state.selectedGame?.toUpperCase() || "CS2",
          tier: state.tier,
          prizePool: state.expectedPool ? `$${state.expectedPool}` : undefined,
          timeoutSeconds: status.ready_check?.timeout_seconds || 30,
          players: readyCheckPlayers,
          currentPlayerId: state.selectedProfileId || "unknown",
        },
      }));
    },
    [state.selectedGame, state.tier, state.expectedPool, state.selectedProfileId],
  );

  // Navigate after all players confirmed ready
  const handleAllPlayersReady = useCallback(
    (matchId?: string) => {
      const lobbyId = state.readyCheck?.lobbyId;
      const resolvedMatchId = matchId || state.matchmaking?.matchId;

      // Clear ready check
      setState((prev) => ({
        ...prev,
        readyCheck: undefined,
      }));

      // Navigate to the match detail page
      if (resolvedMatchId) {
        const gameId = state.selectedGame || "cs2";
        router.push(`/matches/${gameId}/${resolvedMatchId}`);
      } else if (lobbyId) {
        router.push(`/matches?lobby=${lobbyId}`);
      }
    },
    [router, state.selectedGame, state.readyCheck?.lobbyId, state.matchmaking?.matchId],
  );

  // Confirm readiness for the current player
  const confirmReady = useCallback(async () => {
    const lobbyId = state.readyCheck?.lobbyId;
    if (!lobbyId) return;

    try {
      const res = await fetch(`/api/match-making/lobbies/${lobbyId}/commitments/confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) {
        logger.error("[WizardContext] Failed to confirm readiness", await res.text());
        return;
      }

      // Optimistically update current player's status
      setState((prev) => {
        if (!prev.readyCheck) return prev;
        return {
          ...prev,
          readyCheck: {
            ...prev.readyCheck,
            players: prev.readyCheck.players.map((p) =>
              p.id === prev.readyCheck!.currentPlayerId
                ? { ...p, status: "confirmed" as const }
                : p
            ),
          },
        };
      });
    } catch (err) {
      logger.error("[WizardContext] Error confirming readiness", err);
    }
  }, [state.readyCheck?.lobbyId]);

  // Decline readiness
  const declineReady = useCallback(async () => {
    const lobbyId = state.readyCheck?.lobbyId;
    if (!lobbyId) return;

    try {
      await fetch(`/api/match-making/lobbies/${lobbyId}/commitments/decline`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: "player_declined" }),
      });
    } catch (err) {
      logger.error("[WizardContext] Error declining readiness", err);
    }

    // Clear ready check and stop matchmaking
    setState((prev) => ({
      ...prev,
      readyCheck: undefined,
      matchmaking: prev.matchmaking
        ? {
            ...prev.matchmaking,
            isSearching: false,
            error: null,
          }
        : prev.matchmaking,
    }));
  }, [state.readyCheck?.lobbyId]);

  // Update a player's ready check status (called from WebSocket callbacks)
  const updateReadyCheckPlayer = useCallback(
    (playerId: string, newStatus: "confirmed" | "declined" | "timed_out") => {
      setState((prev) => {
        if (!prev.readyCheck) return prev;
        const updatedPlayers = prev.readyCheck.players.map((p) =>
          p.id === playerId ? { ...p, status: newStatus } : p
        );
        return {
          ...prev,
          readyCheck: { ...prev.readyCheck, players: updatedPlayers },
        };
      });
    },
    [],
  );

  // Auto-increment elapsed time every second during matchmaking
  useEffect(() => {
    if (state.matchmaking?.isSearching) {
      elapsedTimeIntervalRef.current = setInterval(() => {
        setState((prev) => ({
          ...prev,
          matchmaking: prev.matchmaking
            ? {
                ...prev.matchmaking,
                elapsedTime: (prev.matchmaking.elapsedTime || 0) + 1,
              }
            : prev.matchmaking,
        }));
      }, 1000);
    } else {
      if (elapsedTimeIntervalRef.current) {
        clearInterval(elapsedTimeIntervalRef.current);
        elapsedTimeIntervalRef.current = null;
      }
    }

    return () => {
      if (elapsedTimeIntervalRef.current) {
        clearInterval(elapsedTimeIntervalRef.current);
      }
    };
  }, [state.matchmaking?.isSearching]);

  const updateState = (updates: Partial<WizardState>) => {
    setState((prev) => ({ ...prev, ...updates }));
  };

  const resetState = () => {
    if (elapsedTimeIntervalRef.current) {
      clearInterval(elapsedTimeIntervalRef.current);
      elapsedTimeIntervalRef.current = null;
    }
    matchmakingSDK.stopPolling();
    setState(initialState);
  };

  const startMatchmaking = async (playerId: string) => {
    try {
      // Ensure user has a valid session (authenticated or guest)
      const hasSession = await ensureSession();
      if (!hasSession) {
        // Try to create a guest token if no session exists
        const guestToken = await createGuestToken();
        if (!guestToken?.success) {
          throw new Error("Failed to create session. Please try again.");
        }
        // Use guest user_id if playerId not provided
        if (!playerId && guestToken.user_id) {
          playerId = guestToken.user_id;
        }
      }

      setState((prev) => ({
        ...prev,
        matchmaking: {
          isSearching: true,
          sessionId: null,
          queuePosition: 0,
          totalQueueCount: 0,
          estimatedWait: 0,
          elapsedTime: 0,
          poolStats: null,
          error: null,
        },
      }));

      const response = await matchmakingSDK.joinQueue({
        player_id: playerId,
        squad_id: state.squadId,
        preferences: {
          game_id: state.selectedGame || "cs2", // Use selected game from wizard state
          game_mode: state.gameMode || "competitive",
          region: state.region || "na-east",
          skill_range: { min_mmr: 1000, max_mmr: 2000 },
          max_ping: 50,
          allow_cross_platform: false,
          tier: state.tier || "free",
          priority_boost: state.tier === "elite" || state.tier === "pro",
        },
        player_mmr: 1500,
        distribution_rule: state.distributionRule,
        entry_fee_cents: state.expectedPool
          ? Math.round(state.expectedPool * 100)
          : undefined,
      });

      if (!response || !response.session_id) {
        throw new Error("Failed to join matchmaking queue: no session returned");
      }

      setState((prev) => ({
        ...prev,
        matchmaking: {
          isSearching: true,
          sessionId: response.session_id,
          queuePosition: response.queue_position,
          totalQueueCount: 0,
          estimatedWait: response.estimated_wait_seconds,
          elapsedTime: 0,
          poolStats: null,
          error: null,
        },
      }));

      // Start polling for updates
      matchmakingSDK.startPolling(response.session_id, (status) => {
        // Check if match was found or ready check initiated
        if (
          status.status === "matched" ||
          status.status === "match_found" ||
          status.status === "ready_check" ||
          status.match_id ||
          status.lobby_id
        ) {
          handleMatchFound(status);
          return;
        }

        // Check for terminal error states
        if (
          status.status === "cancelled" ||
          status.status === "expired" ||
          status.status === "error"
        ) {
          matchmakingSDK.stopPolling();
          setState((prev) => ({
            ...prev,
            matchmaking: prev.matchmaking
              ? {
                  ...prev.matchmaking,
                  isSearching: false,
                  error:
                    status.status === "expired"
                      ? "QUEUE_TIMEOUT"
                      : "NETWORK_ERROR",
                }
              : prev.matchmaking,
          }));
          return;
        }

        // Update queue stats
        setState((prev) => ({
          ...prev,
          matchmaking: prev.matchmaking
            ? {
                ...prev.matchmaking,
                queuePosition:
                  status.queue_position || prev.matchmaking.queuePosition,
                totalQueueCount:
                  status.total_queue_count || prev.matchmaking.totalQueueCount,
                estimatedWait: status.estimated_wait,
                elapsedTime: status.elapsed_time,
              }
            : prev.matchmaking,
        }));
      });
    } catch (error: unknown) {
      // Map error to appropriate MatchmakingError type
      let matchmakingErrorType: MatchmakingError = "NETWORK_ERROR";
      if (error instanceof Error) {
        if (error.message.includes("auth"))
          matchmakingErrorType = "AUTHENTICATION_FAILED";
        else if (error.message.includes("session"))
          matchmakingErrorType = "SESSION_EXPIRED";
        else if (error.message.includes("rate"))
          matchmakingErrorType = "RATE_LIMITED";
        else if (error.message.includes("queue"))
          matchmakingErrorType = "QUEUE_FULL";
      }

      setState((prev) => ({
        ...prev,
        matchmaking: {
          isSearching: false,
          sessionId: null,
          queuePosition: 0,
          totalQueueCount: 0,
          estimatedWait: 0,
          elapsedTime: 0,
          poolStats: null,
          error: matchmakingErrorType,
        },
      }));

      // Re-throw so the caller (App.tsx) knows it failed and can avoid showing success toast
      throw error;
    }
  };

  const cancelMatchmaking = async () => {
    if (state.matchmaking?.sessionId) {
      try {
        await matchmakingSDK.leaveQueue(state.matchmaking.sessionId);
        matchmakingSDK.stopPolling();
        if (elapsedTimeIntervalRef.current) {
          clearInterval(elapsedTimeIntervalRef.current);
          elapsedTimeIntervalRef.current = null;
        }
        setState((prev) => ({
          ...prev,
          matchmaking: {
            isSearching: false,
            sessionId: null,
            queuePosition: 0,
            totalQueueCount: 0,
            estimatedWait: 0,
            elapsedTime: 0,
            poolStats: null,
            error: null,
          },
        }));
      } catch (error: unknown) {
        // Map cancel error to appropriate MatchmakingError type
        let cancelErrorType: MatchmakingError = "NETWORK_ERROR";
        if (error instanceof Error) {
          if (error.message.includes("session"))
            cancelErrorType = "SESSION_EXPIRED";
        }

        setState((prev) => ({
          ...prev,
          matchmaking: prev.matchmaking
            ? {
                ...prev.matchmaking,
                error: cancelErrorType,
              }
            : prev.matchmaking,
        }));
      }
    }
  };

  return (
    <WizardContext.Provider
      value={{
        state,
        updateState,
        resetState,
        startMatchmaking,
        cancelMatchmaking,
        confirmReady,
        declineReady,
        updateReadyCheckPlayer,
        handleAllPlayersReady,
        sdk: matchmakingSDK,
      }}
    >
      {children}
    </WizardContext.Provider>
  );
}

export function useWizard() {
  const context = useContext(WizardContext);

  if (!context) {
    throw new Error("useWizard must be used within a WizardProvider");
  }

  return context;
}

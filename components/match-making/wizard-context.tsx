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
} from "@/types/replay-api/matchmaking.types";
import { ensureSession, createGuestToken } from "@/types/replay-api/auth";

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
}

interface WizardContextType {
  state: WizardState;
  updateState: (updates: Partial<WizardState>) => void;
  resetState: () => void;
  startMatchmaking: (playerId: string) => Promise<void>;
  cancelMatchmaking: () => Promise<void>;
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

  // Handle match found — navigate to the match/lobby
  const handleMatchFound = useCallback(
    (matchId?: string, lobbyId?: string) => {
      matchmakingSDK.stopPolling();
      if (elapsedTimeIntervalRef.current) {
        clearInterval(elapsedTimeIntervalRef.current);
        elapsedTimeIntervalRef.current = null;
      }

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
      }));

      // Navigate to the match detail page
      if (matchId) {
        const gameId = state.selectedGame || "cs2";
        router.push(`/matches/${gameId}/${matchId}`);
      } else if (lobbyId) {
        router.push(`/matches?lobby=${lobbyId}`);
      }
    },
    [router, state.selectedGame],
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

      if (!response) {
        throw new Error("Failed to join matchmaking queue");
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
        // Check if match was found
        if (
          status.status === "matched" ||
          status.status === "match_found" ||
          status.match_id ||
          status.lobby_id
        ) {
          handleMatchFound(status.match_id, status.lobby_id);
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

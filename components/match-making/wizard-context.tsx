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
} from "react";
import { DistributionRule } from "./prize-distribution-selector";
import { MatchmakingAPI } from "@/types/replay-api/matchmaking.sdk";
import { ReplayAPISDK } from "@/types/replay-api/sdk";
import { ReplayApiSettingsMock } from "@/types/replay-api/settings";
import { logger } from "@/lib/logger";
import type { MatchmakingUIState } from "@/types/replay-api/matchmaking.types";

export interface WizardState {
  // Step 0: Region
  region: string;

  // Step 1: Game Mode / Tier
  gameMode: string;
  tier?: "free" | "premium" | "pro" | "elite";

  // Step 2: Squad
  squadId?: string;
  teamType?: "solo" | "duo" | "squad";
  selectedFriends?: string[];

  // Step 3: Schedule (optional for instant matchmaking)
  scheduleStart?: Date;
  scheduleEnd?: Date;
  weeklyRoutine?: string[];
  schedule?: {
    timeWindow?: string;
    weeklyRoutine?: string[];
  };

  // Step 4: Prize Distribution
  distributionRule: DistributionRule;
  expectedPool?: number;

  // Step 5: Review
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
      setState((prev) => ({
        ...prev,
        matchmaking: {
          isSearching: true,
          sessionId: null,
          queuePosition: 0,
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
          game_id: "cs2",
          game_mode: state.gameMode || "competitive",
          region: state.region || "na-east",
          skill_range: { min_mmr: 1000, max_mmr: 2000 },
          max_ping: 50,
          allow_cross_platform: false,
          tier: state.tier || "free",
          priority_boost: state.tier === "elite" || state.tier === "pro",
        },
        player_mmr: 1500,
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
          estimatedWait: response.estimated_wait_seconds,
          elapsedTime: 0,
          poolStats: null,
          error: null,
        },
      }));

      // Start polling for updates
      matchmakingSDK.startPolling(response.session_id, (status) => {
        setState((prev) => ({
          ...prev,
          matchmaking: prev.matchmaking
            ? {
                ...prev.matchmaking,
                queuePosition:
                  status.queue_position || prev.matchmaking.queuePosition,
                estimatedWait: status.estimated_wait,
                elapsedTime: status.elapsed_time,
              }
            : prev.matchmaking,
        }));
      });
    } catch (error: any) {
      setState((prev) => ({
        ...prev,
        matchmaking: {
          isSearching: false,
          sessionId: null,
          queuePosition: 0,
          estimatedWait: 0,
          elapsedTime: 0,
          poolStats: null,
          error: error.message || "Failed to start matchmaking",
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
            estimatedWait: 0,
            elapsedTime: 0,
            poolStats: null,
            error: null,
          },
        }));
      } catch (error: any) {
        setState((prev) => ({
          ...prev,
          matchmaking: prev.matchmaking
            ? {
                ...prev.matchmaking,
                error: error.message || "Failed to cancel matchmaking",
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

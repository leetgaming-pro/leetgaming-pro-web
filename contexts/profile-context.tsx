/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║  🎮 LEETGAMING - PROFILE CONTEXT                                             ║
 * ║══════════════════════════════════════════════════════════════════════════════║
 * ║                                                                              ║
 * ║  Multi-profile management for game-specific player profiles.                 ║
 * ║  Users can have one profile per game (CS2, Valorant, LoL, Dota2).            ║
 * ║                                                                              ║
 * ║  Features:                                                                   ║
 * ║  • Fetch all profiles for current user                                       ║
 * ║  • Switch active profile (for match making, etc.)                            ║
 * ║  • Create new profile for a game                                             ║
 * ║  • Get profile by game                                                       ║
 * ║                                                                              ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */

"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { useReplayApi } from "@/hooks/use-replay-api";
import { PlayerProfile } from "@/types/replay-api/entities.types";
import { GameTitle } from "@/types/replay-api/player.types";
import { useOptionalAuth } from "@/hooks";
import { logger } from "@/lib/logger";

// ============================================================================
// Types
// ============================================================================

export interface ProfileContextState {
  /** All profiles owned by the current user (one per game) */
  profiles: PlayerProfile[];

  /** Currently active profile (used for match making, etc.) */
  activeProfile: PlayerProfile | null;

  /** Loading state for profile operations */
  isLoading: boolean;

  /** Error message if any operation fails */
  error: string | null;

  /** Whether the user has any profiles */
  hasProfiles: boolean;

  /** Games for which user has profiles */
  gamesWithProfiles: GameTitle[];
}

export interface ProfileContextActions {
  /** Refresh all profiles from server */
  refreshProfiles: () => Promise<void>;

  /** Switch active profile to a different game */
  switchProfile: (gameId: GameTitle) => void;

  /** Switch active profile by profile ID */
  switchProfileById: (profileId: string) => void;

  /** Get profile for a specific game (null if not created) */
  getProfileForGame: (gameId: GameTitle) => PlayerProfile | null;

  /** Check if user has a profile for a specific game */
  hasProfileForGame: (gameId: GameTitle) => boolean;

  /** Create a new profile (redirects to registration) */
  createProfile: (gameId?: GameTitle) => void;

  /** Clear error state */
  clearError: () => void;
}

export type ProfileContextType = ProfileContextState & ProfileContextActions;

// ============================================================================
// Context
// ============================================================================

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

// ============================================================================
// Storage Keys
// ============================================================================

const ACTIVE_PROFILE_STORAGE_KEY = "leetgaming_active_profile_id";

// ============================================================================
// Provider
// ============================================================================

interface ProfileProviderProps {
  children: ReactNode;
}

export function ProfileProvider({ children }: ProfileProviderProps) {
  const { sdk } = useReplayApi();
  const { isAuthenticated, isLoading: authLoading } = useOptionalAuth();

  // State
  const [profiles, setProfiles] = useState<PlayerProfile[]>([]);
  const [activeProfile, setActiveProfile] = useState<PlayerProfile | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Derived state
  const hasProfiles = profiles.length > 0;
  const gamesWithProfiles = profiles
    .map((p) => p.game_id as unknown as GameTitle)
    .filter(Boolean);

  // ============================================================================
  // Actions
  // ============================================================================

  /**
   * Fetch all profiles for the current user
   */
  const refreshProfiles = useCallback(async () => {
    if (!isAuthenticated) {
      setProfiles([]);
      setActiveProfile(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const fetchedProfiles = await sdk.playerProfiles.getMyProfiles();
      setProfiles(fetchedProfiles);

      // Restore active profile from storage or use first profile
      const storedProfileId = localStorage.getItem(ACTIVE_PROFILE_STORAGE_KEY);

      if (storedProfileId) {
        const stored = fetchedProfiles.find((p) => p.id === storedProfileId);
        if (stored) {
          setActiveProfile(stored);
        } else if (fetchedProfiles.length > 0) {
          // Stored profile not found, use first
          setActiveProfile(fetchedProfiles[0]);
          localStorage.setItem(
            ACTIVE_PROFILE_STORAGE_KEY,
            fetchedProfiles[0].id,
          );
        }
      } else if (fetchedProfiles.length > 0) {
        // No stored preference, use first profile
        setActiveProfile(fetchedProfiles[0]);
        localStorage.setItem(ACTIVE_PROFILE_STORAGE_KEY, fetchedProfiles[0].id);
      }

      logger.info("Profiles loaded", {
        count: fetchedProfiles.length,
        games: fetchedProfiles.map((p) => p.game_id),
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load profiles";
      setError(message);
      logger.error("Failed to load profiles", err);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, sdk]);

  /**
   * Switch active profile by game ID
   */
  const switchProfile = useCallback(
    (gameId: GameTitle) => {
      const profile = profiles.find(
        (p) => p.game_id?.toLowerCase() === gameId.toLowerCase(),
      );
      if (profile) {
        setActiveProfile(profile);
        localStorage.setItem(ACTIVE_PROFILE_STORAGE_KEY, profile.id);
        logger.info("Switched active profile", {
          profileId: profile.id,
          game: gameId,
        });
      } else {
        logger.warn("No profile found for game", { gameId });
      }
    },
    [profiles],
  );

  /**
   * Switch active profile by profile ID
   */
  const switchProfileById = useCallback(
    (profileId: string) => {
      const profile = profiles.find((p) => p.id === profileId);
      if (profile) {
        setActiveProfile(profile);
        localStorage.setItem(ACTIVE_PROFILE_STORAGE_KEY, profile.id);
        logger.info("Switched active profile by ID", {
          profileId,
          game: profile.game_id,
        });
      } else {
        logger.warn("Profile not found", { profileId });
      }
    },
    [profiles],
  );

  /**
   * Get profile for a specific game
   */
  const getProfileForGame = useCallback(
    (gameId: GameTitle): PlayerProfile | null => {
      return (
        profiles.find(
          (p) => p.game_id?.toLowerCase() === gameId.toLowerCase(),
        ) || null
      );
    },
    [profiles],
  );

  /**
   * Check if user has a profile for a specific game
   */
  const hasProfileForGame = useCallback(
    (gameId: GameTitle): boolean => {
      return profiles.some(
        (p) => p.game_id?.toLowerCase() === gameId.toLowerCase(),
      );
    },
    [profiles],
  );

  /**
   * Navigate to profile creation (with optional game pre-selected)
   */
  const createProfile = useCallback((gameId?: GameTitle) => {
    const url = gameId
      ? `/players/register?game=${gameId}`
      : "/players/register";
    // Use window.location for full page navigation
    if (typeof window !== "undefined") {
      window.location.href = url;
    }
  }, []);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // ============================================================================
  // Effects
  // ============================================================================

  // Load profiles when authenticated
  useEffect(() => {
    if (!authLoading) {
      refreshProfiles();
    }
  }, [authLoading, isAuthenticated, refreshProfiles]);

  // ============================================================================
  // Context Value
  // ============================================================================

  const contextValue: ProfileContextType = {
    // State
    profiles,
    activeProfile,
    isLoading,
    error,
    hasProfiles,
    gamesWithProfiles,

    // Actions
    refreshProfiles,
    switchProfile,
    switchProfileById,
    getProfileForGame,
    hasProfileForGame,
    createProfile,
    clearError,
  };

  return (
    <ProfileContext.Provider value={contextValue}>
      {children}
    </ProfileContext.Provider>
  );
}

// ============================================================================
// Hook
// ============================================================================

/**
 * Hook to access profile context
 * @throws Error if used outside ProfileProvider
 */
export function useProfiles(): ProfileContextType {
  const context = useContext(ProfileContext);

  if (!context) {
    throw new Error("useProfiles must be used within a ProfileProvider");
  }

  return context;
}

/**
 * Hook to access only the active profile
 * Convenience hook for components that only need the active profile
 */
export function useActiveProfile() {
  const {
    activeProfile,
    isLoading,
    switchProfile,
    hasProfiles,
    createProfile,
  } = useProfiles();

  return {
    profile: activeProfile,
    isLoading,
    switchProfile,
    hasProfiles,
    createProfile,
  };
}

/**
 * Hook to check if user has profile for a game
 * Useful for match making to validate game selection
 */
export function useProfileForGame(gameId: GameTitle) {
  const { getProfileForGame, hasProfileForGame, isLoading, createProfile } =
    useProfiles();

  return {
    profile: getProfileForGame(gameId),
    hasProfile: hasProfileForGame(gameId),
    isLoading,
    createProfile: () => createProfile(gameId),
  };
}

/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║  🎮 LEETGAMING - GAME SELECTION FORM                                         ║
 * ║══════════════════════════════════════════════════════════════════════════════║
 * ║                                                                              ║
 * ║  Game selection step in matchmaking wizard.                                  ║
 * ║  Shows available games and validates user has a profile for selected game.   ║
 * ║                                                                              ║
 * ║  Features:                                                                   ║
 * ║  • Display all supported games                                               ║
 * ║  • Highlight games where user has a profile                                  ║
 * ║  • Prompt to create profile if missing                                       ║
 * ║  • Integrates with ProfileContext for profile data                           ║
 * ║                                                                              ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */

"use client";

import React, { useEffect } from "react";
import { RadioGroup, Chip, Button, useDisclosure } from "@nextui-org/react";
import { Icon } from "@iconify/react";
import { useTheme } from "next-themes";
import { title } from "@/components/primitives";
import { CustomRadio } from "./game-mode-form";
import { useWizard } from "./wizard-context";
import { useProfiles } from "@/contexts/profile-context";
import { GameTitle } from "@/types/replay-api/player.types";
import { PlayerProfile } from "@/types/replay-api/entities.types";
import { PlayerCreationModal } from "@/components/players/player-creation-modal";
import { useToast } from "@/components/toast/toast-provider";

// ============================================================================
// Game Configuration
// ============================================================================

interface GameConfig {
  id: GameTitle;
  name: string;
  icon: string;
  description: string;
  isAvailable: boolean; // Whether game is available for matchmaking
}

const GAMES: GameConfig[] = [
  {
    id: GameTitle.CS2,
    name: "Counter-Strike 2",
    icon: "simple-icons:counterstrike",
    description: "5v5 tactical shooter - competitive matchmaking",
    isAvailable: true,
  },
  {
    id: GameTitle.VALORANT,
    name: "Valorant",
    icon: "simple-icons:valorant",
    description: "5v5 character-based tactical shooter",
    isAvailable: true,
  },
  {
    id: GameTitle.LOL,
    name: "League of Legends",
    icon: "simple-icons:leagueoflegends",
    description: "5v5 MOBA - ranked games",
    isAvailable: false, // Coming soon
  },
  {
    id: GameTitle.DOTA2,
    name: "Dota 2",
    icon: "simple-icons:dota2",
    description: "5v5 MOBA - competitive matches",
    isAvailable: false, // Coming soon
  },
];

// ============================================================================
// Component
// ============================================================================

export type GameSelectionFormProps = React.HTMLAttributes<HTMLFormElement>;

const GameSelectionForm = React.forwardRef<
  HTMLFormElement,
  GameSelectionFormProps
>(({ className, ...props }, ref) => {
  const { updateState, state } = useWizard();
  const {
    hasProfileForGame,
    getProfileForGame,
    isLoading,
    hasProfiles,
    refreshProfiles,
  } = useProfiles();
  const { theme } = useTheme();
  const { showToast } = useToast();
  const isDark = theme === "dark";

  // Modal for profile creation (full form modal)
  const {
    isOpen: isCreationModalOpen,
    onOpen: onCreationModalOpen,
    onClose: onCreationModalClose,
  } = useDisclosure();
  const [_selectedGameForCreation, setSelectedGameForCreation] =
    React.useState<GameTitle | null>(null);
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  // Handle game selection
  const handleGameSelect = (gameId: string) => {
    const game = gameId as GameTitle;

    // Check if user has profile for this game
    if (!hasProfileForGame(game)) {
      // Open profile creation modal with game pre-selected
      setSelectedGameForCreation(game);
      onCreationModalOpen();
      return;
    }

    // Get the profile for this game
    const profile = getProfileForGame(game);

    // Update wizard state with selected game
    updateState({
      selectedGame: game,
      selectedProfileId: profile?.id,
    });
  };

  // Handle successful profile creation - stay in matchmaking flow
  const handleProfileCreated = React.useCallback(
    async (profile: PlayerProfile) => {
      if (!profile) return;

      setIsRefreshing(true);

      try {
        // Refresh profiles to get the newly created one
        await refreshProfiles();

        // Auto-select the game with the newly created profile
        // Use the profile data directly since we have it
        const gameId = profile.game_id as unknown as GameTitle;
        const profileId = profile.id;
        const nickname = profile.nickname || "Player";

        if (gameId && profileId) {
          updateState({
            selectedGame: gameId,
            selectedProfileId: profileId,
          });

          // Show success feedback
          showToast(
            `Profile "${nickname}" created! You can now continue.`,
            "success",
            4000,
          );
        }
      } finally {
        setIsRefreshing(false);
      }
    },
    [refreshProfiles, updateState, showToast],
  );

  // Auto-select game if user only has one profile
  useEffect(() => {
    if (!isLoading && hasProfiles && !state.selectedGame) {
      // Find the first available game where user has a profile
      const availableGameWithProfile = GAMES.find(
        (g) => g.isAvailable && hasProfileForGame(g.id),
      );

      if (availableGameWithProfile) {
        const profile = getProfileForGame(availableGameWithProfile.id);
        updateState({
          selectedGame: availableGameWithProfile.id,
          selectedProfileId: profile?.id,
        });
      }
    }
  }, [
    isLoading,
    hasProfiles,
    state.selectedGame,
    hasProfileForGame,
    getProfileForGame,
    updateState,
  ]);

  return (
    <>
      {/* Header - Compact for mobile */}
      <div className="text-center mb-4 sm:mb-6 px-2">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Icon
            icon="solar:gamepad-bold-duotone"
            className="text-[#FF4654] dark:text-[#DCFF37]"
            width={28}
          />
          <h1
            className={title({
              color: isDark ? "battleLime" : "battleNavy",
              size: "sm",
            })}
          >
            Select Game
          </h1>
        </div>
        <p className="text-sm text-default-500">Choose your competitive game</p>
      </div>

      {/* Game Selection */}
      <form
        ref={ref}
        className={`flex flex-col gap-2 sm:gap-3 w-full max-w-[480px] mx-auto px-2 sm:px-0 ${className || ""}`}
        {...props}
      >
        <RadioGroup
          className="w-full justify-center items-center gap-3"
          value={state.selectedGame || ""}
          onValueChange={handleGameSelect}
        >
          {GAMES.map((game) => {
            const hasProfile = hasProfileForGame(game.id);
            const profile = getProfileForGame(game.id);
            const isSelected = state.selectedGame === game.id;

            return (
              <CustomRadio
                key={game.id}
                value={game.id}
                isDisabled={!game.isAvailable}
              >
                <div className="flex items-center gap-2 sm:gap-3 w-full">
                  <div
                    className={`flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-none flex-shrink-0 ${
                      isSelected
                        ? "bg-[#FF4654]/20 dark:bg-[#DCFF37]/20"
                        : hasProfile
                          ? "bg-[#34445C]/10 dark:bg-[#DCFF37]/10"
                          : "bg-[#34445C]/5 dark:bg-[#1a1a1a]"
                    }`}
                  >
                    <Icon
                      icon={game.icon}
                      className={
                        isSelected
                          ? "text-[#FF4654] dark:text-[#DCFF37]"
                          : hasProfile
                            ? "text-[#34445C] dark:text-[#F5F0E1]/80"
                            : "text-[#34445C]/40 dark:text-[#F5F0E1]/30"
                      }
                      width={24}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
                      <span
                        className={`font-semibold text-sm sm:text-base ${
                          game.isAvailable
                            ? "text-foreground"
                            : "text-foreground/50"
                        }`}
                      >
                        {game.name}
                      </span>
                      {!game.isAvailable && (
                        <Chip
                          size="sm"
                          variant="flat"
                          color="default"
                          className="text-[10px] sm:text-xs h-5"
                        >
                          Soon
                        </Chip>
                      )}
                      {game.isAvailable && hasProfile && (
                        <Chip
                          size="sm"
                          variant="flat"
                          color="success"
                          className="text-[10px] sm:text-xs h-5"
                        >
                          Ready
                        </Chip>
                      )}
                      {game.isAvailable && !hasProfile && (
                        <Chip
                          size="sm"
                          variant="flat"
                          color="warning"
                          className="text-[10px] sm:text-xs h-5"
                        >
                          No Profile
                        </Chip>
                      )}
                    </div>
                    <span className="text-xs sm:text-small text-[#34445C]/60 dark:text-[#F5F0E1]/50 line-clamp-1">
                      {game.description}
                    </span>
                    {/* Show profile info if exists */}
                    {profile && (
                      <div className="text-[10px] sm:text-xs text-[#FF4654] dark:text-[#DCFF37] mt-0.5 truncate">
                        Playing as: {profile.nickname}
                        {profile.roles?.[0] && ` • ${profile.roles[0]}`}
                      </div>
                    )}
                  </div>
                </div>
              </CustomRadio>
            );
          })}
        </RadioGroup>

        {/* Loading indicator - initial load */}
        {isLoading && !isRefreshing && (
          <div className="text-center text-small text-default-500">
            Loading your profiles...
          </div>
        )}

        {/* Refreshing indicator - after profile creation */}
        {isRefreshing && (
          <div
            className="flex items-center justify-center gap-2 p-4 bg-[#17C964]/10 border border-[#17C964]/30"
            style={{
              clipPath:
                "polygon(0 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%)",
            }}
          >
            <Icon
              icon="solar:refresh-bold-duotone"
              className="w-5 h-5 text-[#17C964] animate-spin"
            />
            <span className="text-sm text-[#17C964] font-medium">
              Profile created! Updating...
            </span>
          </div>
        )}

        {/* No profiles warning */}
        {!isLoading && !hasProfiles && (
          <div className="text-center p-4 bg-warning-50 dark:bg-warning-900/20 rounded-none border border-warning-200 dark:border-warning-800">
            <Icon
              icon="solar:info-circle-bold"
              className="text-warning mx-auto mb-2"
              width={24}
            />
            <p className="text-sm text-warning-700 dark:text-warning-200 mb-3">
              You need to create a player profile to join matchmaking.
            </p>
            <Button
              size="sm"
              color="warning"
              variant="flat"
              className="rounded-none"
              onPress={() => {
                setSelectedGameForCreation(null);
                onCreationModalOpen();
              }}
            >
              Create Profile
            </Button>
          </div>
        )}
      </form>

      {/* Player Profile Creation Modal - stays in matchmaking flow */}
      <PlayerCreationModal
        isOpen={isCreationModalOpen}
        onClose={onCreationModalClose}
        onSuccess={handleProfileCreated}
        defaultGame={_selectedGameForCreation || undefined}
      />
    </>
  );
});

GameSelectionForm.displayName = "GameSelectionForm";

export default GameSelectionForm;

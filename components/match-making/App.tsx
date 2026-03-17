"use client";

import React from "react";
import Link from "next/link";
import { domAnimation, LazyMotion, m } from "framer-motion";
import { Icon } from "@iconify/react";
import { useToast } from "@/components/toast/toast-provider";

import MultistepSidebar from "./multistep-sidebar";
import TierSelectionForm from "./tier-selection-form";
import GameSelectionForm from "./game-selection-form";
import SquadForm from "./squad-form";
import ScheduleInformationForm from "./schedule-information-form";
import ChooseRegionForm from "./choose-region-form";
import GameModeForm from "./game-mode-form";
import MultistepNavigationButtons from "./multistep-navigation-buttons";
import { PrizeDistributionSelector } from "./prize-distribution-selector";
import ReviewConfirmForm from "./review-confirm-form";
import { WizardProvider, useWizard } from "./wizard-context";
import { ReadyCheckOverlay } from "@/components/matchmaking/ReadyCheckOverlay";
import type { ReadyCheckPlayer } from "@/components/matchmaking/ReadyCheckOverlay";
import { useMatchmakingRealtime } from "@/hooks/use-matchmaking-realtime";
import { useAuth } from "@/hooks/use-auth";
import { useProfiles } from "@/contexts/profile-context";
import { GameTitle } from "@/types/replay-api/player.types";

/**
 * Matchmaking Wizard Steps:
 * 0: Tier Selection (Free/Premium/Pro/Elite)
 * 1: Game Selection (CS2/Valorant/etc) - with profile validation
 * 2: Region Selection
 * 3: Game Mode (Casual/Elimination/Bo3/Bo5)
 * 4: Squad Selection (Solo/Duo/Squad)
 * 5: Schedule (Now/Time-frames/Weekly)
 * 6: Prize Distribution
 * 7: Review & Confirm
 */
const TOTAL_STEPS = 8;

const variants = {
  enter: (direction: number) => ({
    y: direction > 0 ? 30 : -30,
    opacity: 0,
  }),
  center: {
    zIndex: 1,
    y: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    zIndex: 0,
    y: direction < 0 ? 30 : -30,
    opacity: 0,
  }),
};

function WizardContent() {
  const {
    state,
    updateState,
    startMatchmaking,
    cancelMatchmaking,
    confirmReady,
    declineReady,
    handleAllPlayersReady,
    updateReadyCheckPlayer,
  } = useWizard();
  const { isAuthenticated, isLoading: isAuthLoading, user: _user } = useAuth();
  const { hasProfiles: _hasProfiles, hasProfileForGame, activeProfile: _activeProfile } = useProfiles();
  const { showToast } = useToast();
  const [[page, direction], setPage] = React.useState([0, 0]);

  // Wire lobby WebSocket for real-time ready check updates
  useMatchmakingRealtime({
    readyCheckActive: state.readyCheck?.isActive ?? false,
    lobbyId: state.readyCheck?.lobbyId,
    currentPlayerId: state.readyCheck?.currentPlayerId,
    updateReadyCheckPlayer,
    handleAllPlayersReady,
  });

  // Prevent SSR/client hydration mismatch: session state differs between
  // server (loading) and client (unauthenticated), which causes the auth
  // banner to appear only client-side. Defer auth-dependent UI to after mount.
  const [hasMounted, setHasMounted] = React.useState(false);
  React.useEffect(() => {
    setHasMounted(true);
  }, []);

  // Validation for each step
  const canProceed = React.useCallback(
    (currentPage: number): boolean => {
      switch (currentPage) {
        case 0: // Tier
          return !!state.tier;
        case 1: // Game Selection - must have profile for selected game AND profile ID must be set
          if (!state.selectedGame) return false;
          if (!state.selectedProfileId) return false;
          // Trust wizard state profileId OR check profile context
          // This handles race condition after profile creation
          const hasProfileInContext = hasProfileForGame(
            state.selectedGame as GameTitle,
          );
          const profileExistsInState = !!state.selectedProfileId;
          return hasProfileInContext || profileExistsInState;
        case 2: // Region
          return !!state.region;
        case 3: // Game Mode
          return !!state.gameMode;
        case 4: // Squad
          return true; // Optional
        case 5: // Schedule
          return true; // Optional
        case 6: // Prize Distribution
          return !!state.distributionRule;
        case 7: // Review - must have valid game profile
          return !!state.selectedProfileId && !!state.selectedGame;
        default:
          return true;
      }
    },
    [state, hasProfileForGame],
  );

  const paginate = React.useCallback(
    (newDirection: number) => {
      setPage((prev) => {
        const nextPage = prev[0] + newDirection;

        if (nextPage < 0 || nextPage > TOTAL_STEPS - 1) return prev;

        // Validate before moving forward
        if (newDirection > 0 && !canProceed(prev[0])) {
          return prev;
        }

        return [nextPage, newDirection];
      });
    },
    [canProceed],
  );

  const onChangePage = React.useCallback(
    (newPage: number) => {
      setPage((prev) => {
        if (newPage < 0 || newPage > TOTAL_STEPS - 1) return prev;
        const currentPage = prev[0];

        // Validate all steps between current and target if moving forward
        if (newPage > currentPage) {
          for (let i = currentPage; i < newPage; i++) {
            if (!canProceed(i)) return prev;
          }
        }

        return [newPage, newPage > currentPage ? 1 : -1];
      });
    },
    [canProceed],
  );

  const onBack = React.useCallback(() => {
    paginate(-1);
  }, [paginate]);

  const onNext = React.useCallback(async () => {
    // If on final step, trigger matchmaking
    if (page === TOTAL_STEPS - 1) {
      // If currently searching, allow cancel
      if (state.matchmaking?.isSearching) {
        await cancelMatchmaking();
        showToast("Matchmaking cancelled", "info");
        return;
      }

      // Validate game selection and profile
      if (!state.selectedGame) {
        showToast("Please select a game", "error");
        return;
      }

      if (!hasProfileForGame(state.selectedGame as GameTitle)) {
        showToast(
          "Please create a profile for the selected game first",
          "error",
        );
        return;
      }

      try {
        // MUST use game profile ID - never fall back to auth user ID
        if (!state.selectedProfileId) {
          showToast(
            "Please select a game and ensure you have a profile for it",
            "error",
          );
          return;
        }

        await startMatchmaking(state.selectedProfileId);
        showToast("Searching for opponents...", "success");
      } catch (error) {
        // startMatchmaking re-throws on failure — show specific error to user
        const msg =
          error instanceof Error ? error.message : "Failed to start matchmaking";
        if (msg.includes("auth") || msg.includes("sign in")) {
          showToast("Please sign in to start matchmaking", "error");
        } else {
          showToast(msg, "error");
        }
      }
    } else {
      // Validate current step before proceeding
      if (!canProceed(page)) {
        switch (page) {
          case 0:
            showToast("Please select a tier", "error");
            break;
          case 1:
            if (!state.selectedGame) {
              showToast("Please select a game", "error");
            } else {
              showToast(
                "Please create a profile for the selected game",
                "error",
              );
            }
            break;
          case 2:
            showToast("Please select a region", "error");
            break;
          case 3:
            showToast("Please select a game mode", "error");
            break;
          default:
            break;
        }
        return;
      }
      paginate(1);
    }
  }, [
    paginate,
    page,
    startMatchmaking,
    cancelMatchmaking,
    showToast,
    state,
    canProceed,
    hasProfileForGame,
  ]);

  const content = React.useMemo(() => {
    let component = <TierSelectionForm />;

    switch (page) {
      case 0:
        component = <TierSelectionForm />;
        break;
      case 1:
        component = <GameSelectionForm />;
        break;
      case 2:
        component = <ChooseRegionForm />;
        break;
      case 3:
        component = <GameModeForm />;
        break;
      case 4:
        component = <SquadForm />;
        break;
      case 5:
        component = <ScheduleInformationForm />;
        break;
      case 6:
        component = (
          <PrizeDistributionSelector
            currentPool={state.expectedPool || 100}
            selectedRule={state.distributionRule}
            onSelectRule={(rule) => updateState({ distributionRule: rule })}
          />
        );
        break;
      case 7:
        component = <ReviewConfirmForm />;
        break;
    }

    return (
      <LazyMotion features={domAnimation}>
        <m.div
          key={page}
          animate="center"
          className="col-span-12"
          custom={direction}
          exit="exit"
          initial="exit"
          transition={{
            y: {
              ease: "backOut",
              duration: 0.35,
            },
            opacity: { duration: 0.4 },
          }}
          variants={variants}
        >
          {component}
        </m.div>
      </LazyMotion>
    );
  }, [
    direction,
    page,
    state.expectedPool,
    state.distributionRule,
    updateState,
  ]);

  return (
    <MultistepSidebar
      currentPage={page}
      onBack={onBack}
      onChangePage={onChangePage}
      onNext={onNext}
    >
      <div className="relative flex h-fit w-full flex-col pt-6 text-center lg:h-full lg:justify-center lg:pt-0">
        {/* Auth awareness banner for unauthenticated users */}
        {hasMounted && !isAuthLoading && !isAuthenticated && (
          <div
            data-testid="auth-banner"
            className="mx-auto mb-4 w-full max-w-2xl border border-[#FF4654]/20 dark:border-[#DCFF37]/20 bg-[#FF4654]/5 dark:bg-[#DCFF37]/10 px-4 py-3"
            style={{
              clipPath:
                'polygon(0 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%)',
            }}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-sm text-[#34445C] dark:text-[#F5F0E1]">
                <Icon icon="solar:shield-user-bold" width={18} className="text-[#FF4654] dark:text-[#DCFF37] flex-shrink-0" />
                <span>Sign in to save matches and earn rewards</span>
              </div>
              <Link
                href="/signin?callbackUrl=%2Fmatch-making"
                className="flex-shrink-0 px-3 py-1 text-xs font-bold uppercase tracking-wider bg-[#34445C] text-[#F5F0E1] dark:bg-[#DCFF37] dark:text-black hover:opacity-80 transition-colors"
                style={{
                  clipPath:
                    'polygon(0 0, 100% 0, 100% calc(100% - 4px), calc(100% - 4px) 100%, 0 100%)',
                }}
              >
                Sign In
              </Link>
            </div>
          </div>
        )}
        {content}
        <MultistepNavigationButtons
          backButtonProps={{
            isDisabled: page === 0 || state.matchmaking?.isSearching,
          }}
          className="hidden justify-start lg:flex"
          nextButtonProps={{
            children: state.matchmaking?.isSearching
              ? "Cancel Search"
              : page === TOTAL_STEPS - 1
                ? "Find Match"
                : "Next",
            isDisabled:
              page < TOTAL_STEPS - 1 &&
              !canProceed(page) &&
              !state.matchmaking?.isSearching,
          }}
          onBack={onBack}
          onNext={onNext}
        />
      </div>

      {/* Ready Check Overlay — shown when match is found */}
      <ReadyCheckOverlay
        isOpen={state.readyCheck?.isActive ?? false}
        lobbyId={state.readyCheck?.lobbyId ?? ""}
        gameName={state.readyCheck?.gameName ?? "CS2"}
        tier={state.readyCheck?.tier}
        prizePool={state.readyCheck?.prizePool}
        timeoutSeconds={state.readyCheck?.timeoutSeconds ?? 30}
        players={(state.readyCheck?.players ?? []) as ReadyCheckPlayer[]}
        currentPlayerId={state.readyCheck?.currentPlayerId ?? ""}
        onConfirm={confirmReady}
        onDecline={declineReady}
        onTimeout={declineReady}
      />
    </MultistepSidebar>
  );
}

export default function Component() {
  return (
    <WizardProvider>
      <WizardContent />
    </WizardProvider>
  );
}

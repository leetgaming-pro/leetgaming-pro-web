"use client";

import React from "react";
import { domAnimation, LazyMotion, m } from "framer-motion";
import { useToast } from "@/components/toast/toast-provider";

import MultistepSidebar from "./multistep-sidebar";
import TierSelectionForm from "./tier-selection-form";
import SquadForm from "./squad-form";
import ScheduleInformationForm from "./schedule-information-form";
import ChooseRegionForm from "./choose-region-form";
import GameModeForm from "./game-mode-form";
import MultistepNavigationButtons from "./multistep-navigation-buttons";
import { PrizeDistributionSelector } from "./prize-distribution-selector";
import ReviewConfirmForm from "./review-confirm-form";
import { WizardProvider, useWizard } from "./wizard-context";
import { useAuth } from "@/hooks/use-auth";

// Total steps: Tier (0) → Region (1) → GameMode (2) → Squad (3) → Schedule (4) → Prize (5) → Review (6)
const TOTAL_STEPS = 7;

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
  const { state, updateState, startMatchmaking, cancelMatchmaking } =
    useWizard();
  const { isAuthenticated, user } = useAuth();
  const { showToast } = useToast();
  const [[page, direction], setPage] = React.useState([0, 0]);

  const paginate = React.useCallback((newDirection: number) => {
    setPage((prev) => {
      const nextPage = prev[0] + newDirection;

      if (nextPage < 0 || nextPage > TOTAL_STEPS - 1) return prev;

      return [nextPage, newDirection];
    });
  }, []);

  const onChangePage = React.useCallback((newPage: number) => {
    setPage((prev) => {
      if (newPage < 0 || newPage > TOTAL_STEPS - 1) return prev;
      const currentPage = prev[0];

      return [newPage, newPage > currentPage ? 1 : -1];
    });
  }, []);

  const onBack = React.useCallback(() => {
    paginate(-1);
  }, [paginate]);

  const onNext = React.useCallback(async () => {
    // If on final step (page 6 - Review), trigger matchmaking
    if (page === TOTAL_STEPS - 1) {
      // If currently searching, allow cancel
      if (state.matchmaking?.isSearching) {
        await cancelMatchmaking();
        showToast("Matchmaking cancelled", "info");
        return;
      }

      try {
        // Use user.id if authenticated, otherwise startMatchmaking will create a guest session
        const playerId = isAuthenticated && user?.id ? user.id : "";
        await startMatchmaking(playerId);
        showToast("Searching for opponents...", "success");
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Failed to start matchmaking. Please try again.";
        showToast(errorMessage, "error");
      }
    } else {
      paginate(1);
    }
  }, [
    paginate,
    page,
    isAuthenticated,
    user,
    startMatchmaking,
    cancelMatchmaking,
    showToast,
    state.matchmaking?.isSearching,
  ]);

  const content = React.useMemo(() => {
    // Steps: Tier (0) → Region (1) → GameMode (2) → Squad (3) → Schedule (4) → Prize (5) → Review (6)
    let component = <TierSelectionForm />;

    switch (page) {
      case 0:
        component = <TierSelectionForm />;
        break;
      case 1:
        component = <ChooseRegionForm />;
        break;
      case 2:
        component = <GameModeForm />;
        break;
      case 3:
        component = <SquadForm />;
        break;
      case 4:
        component = <ScheduleInformationForm />;
        break;
      case 5:
        component = (
          <PrizeDistributionSelector
            currentPool={state.expectedPool || 100}
            selectedRule={state.distributionRule}
            onSelectRule={(rule) => updateState({ distributionRule: rule })}
          />
        );
        break;
      case 6:
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
          }}
          onBack={onBack}
          onNext={onNext}
        />
      </div>
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

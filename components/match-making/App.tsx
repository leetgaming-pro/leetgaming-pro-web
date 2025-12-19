"use client";

import React from "react";
import { domAnimation, LazyMotion, m } from "framer-motion";
import { useToast } from "@/components/toast/toast-provider";
import { useRequireAuth } from "@/hooks";
import { Spinner, Card, CardBody, Button } from "@nextui-org/react";
import { Icon } from "@iconify/react";
import { useRouter } from "next/navigation";

import MultistepSidebar from "./multistep-sidebar";
import SquadForm from "./squad-form";
import ScheduleInformationForm from "./schedule-information-form";
import ChooseRegionForm from "./choose-region-form";
import GameModeForm from "./game-mode-form";
import MultistepNavigationButtons from "./multistep-navigation-buttons";
import { PrizeDistributionSelector } from "./prize-distribution-selector";
import ReviewConfirmForm from "./review-confirm-form";
import { WizardProvider, useWizard } from "./wizard-context";

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
    cancelMatchmaking: _cancelMatchmaking,
  } = useWizard();
  const { isAuthenticated, isLoading: authLoading, user, isRedirecting } = useRequireAuth();
  const { showToast } = useToast();
  const [[page, direction], setPage] = React.useState([0, 0]);

  // Show auth loading state - prevent wizard access for unauthenticated users
  if (authLoading || isRedirecting) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] w-full">
        <div className="text-center">
          <Spinner size="lg" color="warning" />
          <p className="mt-4 text-default-500">
            {authLoading ? "Checking authentication..." : "Redirecting to sign in..."}
          </p>
        </div>
      </div>
    );
  }

  // Step validation - ensure required fields are completed
  const validateStep = React.useCallback(
    (stepIndex: number): { valid: boolean; message?: string } => {
      switch (stepIndex) {
        case 0: // Region selection
          if (!state.region) {
            return {
              valid: false,
              message: "Please select a region to continue",
            };
          }
          return { valid: true };

        case 1: // Game mode
          if (!state.gameMode) {
            return {
              valid: false,
              message: "Please select a game mode to continue",
            };
          }
          return { valid: true };

        case 2: // Squad - Optional (solo is allowed)
          return { valid: true };

        case 3: // Schedule - Optional (instant play is default)
          return { valid: true };

        case 4: // Prize distribution
          if (!state.distributionRule) {
            return {
              valid: false,
              message: "Please select a prize distribution model",
            };
          }
          return { valid: true };

        case 5: // Review - Check all required
          if (!state.region || !state.gameMode) {
            return {
              valid: false,
              message: "Please complete all required steps",
            };
          }
          return { valid: true };

        default:
          return { valid: true };
      }
    },
    [state.region, state.gameMode, state.distributionRule]
  );

  // Check if current step is valid
  const isCurrentStepValid = React.useMemo(() => {
    return validateStep(page).valid;
  }, [validateStep, page]);

  const paginate = React.useCallback((newDirection: number) => {
    setPage((prev) => {
      const nextPage = prev[0] + newDirection;

      if (nextPage < 0 || nextPage > 5) return prev;

      return [nextPage, newDirection];
    });
  }, []);

  const onChangePage = React.useCallback((newPage: number) => {
    setPage((prev) => {
      if (newPage < 0 || newPage > 5) return prev;
      const currentPage = prev[0];

      return [newPage, newPage > currentPage ? 1 : -1];
    });
  }, []);

  const onBack = React.useCallback(() => {
    paginate(-1);
  }, [paginate]);

  const onNext = React.useCallback(async () => {
    // Validate current step before proceeding
    const validation = validateStep(page);
    if (!validation.valid) {
      showToast(validation.message || "Please complete this step", "warning");
      return;
    }

    // If on final step (page 5), trigger matchmaking
    if (page === 5) {
      // If already searching, show status
      if (state.matchmaking?.isSearching) {
        showToast("Already searching for a match...", "info");
        return;
      }

      // User is guaranteed to be authenticated at this point (useRequireAuth handles redirect)
      const userId = user?.id;
      if (!userId) {
        showToast(
          "Unable to verify your account. Please sign in again.",
          "error"
        );
        return;
      }

      await startMatchmaking(userId);
      // Keep on same page to show matchmaking status
    } else {
      paginate(1);
    }
  }, [
    paginate,
    page,
    user,
    startMatchmaking,
    showToast,
    validateStep,
    state.matchmaking?.isSearching,
  ]);

  const content = React.useMemo(() => {
    let component = <ChooseRegionForm />;

    switch (page) {
      case 1:
        component = <GameModeForm />;
        break;
      case 2:
        component = <SquadForm />;
        break;
      case 3:
        component = <ScheduleInformationForm />;
        break;
      case 4:
        component = (
          <PrizeDistributionSelector
            currentPool={state.expectedPool || 100}
            selectedRule={state.distributionRule}
            onSelectRule={(rule) => updateState({ distributionRule: rule })}
          />
        );
        break;
      case 5:
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
    state.distributionRule,
    state.expectedPool,
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
              ? "Searching..."
              : page === 5
              ? "Find Match"
              : "Continue",
            isDisabled:
              state.matchmaking?.isSearching ||
              (!isCurrentStepValid && page !== 5),
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

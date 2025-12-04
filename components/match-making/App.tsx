"use client";

import React from "react";
import { domAnimation, LazyMotion, m } from "framer-motion";
import { useSession } from "next-auth/react";
import { useToast } from "@/components/toast/toast-provider";

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
  const { state, updateState, startMatchmaking } = useWizard();
  const { data: session } = useSession();
  const { showToast } = useToast();
  const [[page, direction], setPage] = React.useState([0, 0]);

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
    // If on final step (page 5), trigger matchmaking
    if (page === 5) {
      if (!session?.user) {
        showToast("Please sign in to start matchmaking", "warning");
        return;
      }
      await startMatchmaking((session.user as any)?.id || "mock-player-id");
      // Keep on same page to show matchmaking status
    } else {
      paginate(1);
    }
  }, [paginate, page, session, startMatchmaking, showToast]);

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
  }, [direction, page]);

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
              : "Next",
            isDisabled: state.matchmaking?.isSearching,
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

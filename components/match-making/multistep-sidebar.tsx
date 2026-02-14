"use client";

import React from "react";
import { Button } from "@nextui-org/react";
import { Icon } from "@iconify/react";
import { cn } from "@nextui-org/react";

import SupportCard from "./support-card";
import VerticalSteps from "./vertical-steps";
import MultistepNavigationButtons from "./multistep-navigation-buttons";

export type MultiStepSidebarProps = React.HTMLAttributes<HTMLDivElement> & {
  currentPage: number;
  onBack: () => void;
  onNext: () => void;
  onChangePage: (page: number) => void;
};

// LeetGaming brand color scheme - lime green (#DCFF37), battleOrange (#FF4654 to #FFC700), navy (#34445C)
const stepperClasses = cn(
  // light mode - professional esports colors (navy base with battleOrange accents)
  "[--step-color:#FF4654]", // battleOrange for completed steps
  "[--step-fg-color:#FFFFFF]", // White checkmark on completed
  "[--active-color:#FF4654]", // battleOrange active
  "[--active-border-color:#FF4654]",
  "[--inactive-border-color:rgba(52,68,92,0.3)]",
  "[--inactive-bar-color:rgba(52,68,92,0.2)]",
  "[--inactive-color:rgba(52,68,92,0.5)]",
  // dark mode - lime green (#DCFF37) signature with navy accents
  "dark:[--step-color:#DCFF37]", // Lime for completed steps
  "dark:[--step-fg-color:#1a1a1a]", // Dark checkmark on lime
  "dark:[--active-color:#DCFF37]",
  "dark:[--active-border-color:rgba(220,255,55,0.8)]",
  "dark:[--inactive-border-color:rgba(220,255,55,0.3)]",
  "dark:[--inactive-bar-color:rgba(220,255,55,0.2)]",
  "dark:[--inactive-color:rgba(255,255,255,0.4)]",
);

const MultiStepSidebar = React.forwardRef<
  HTMLDivElement,
  MultiStepSidebarProps
>(
  (
    {
      children,
      className,
      currentPage,
      onBack,
      onNext,
      onChangePage,
      ...props
    },
    ref,
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex h-[calc(100vh_-_40px)] w-full gap-x-2 overflow-x-hidden",
          // Account for mobile nav at bottom - different padding on mobile vs desktop
          "pb-0 md:pb-0",
          className,
        )}
        {...props}
      >
        {/* Sidebar - LeetGaming brand: navy base with lime accent in dark, navy base with orange in light */}
        <div className="flex hidden h-full w-[380px] flex-shrink-0 flex-col items-start gap-y-6 rounded-none px-6 py-6 shadow-2xl lg:flex relative overflow-hidden bg-gradient-to-b from-[#34445C] via-[#2a3749] to-[#1e2a38] dark:from-[#0a0a0a] dark:via-[#111111] dark:to-[#0a0a0a] border-r border-[#34445C]/30 dark:border-[#DCFF37]/20">
          {/* Diagonal corner accent - LeetGaming signature battleOrange gradient */}
          <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-tl from-[#FF4654]/20 via-[#FFC700]/10 to-transparent dark:from-[#DCFF37]/10 dark:to-transparent pointer-events-none" />
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#FF4654] via-[#FFC700] to-[#FF4654] dark:from-[#DCFF37] dark:via-[#34445C] dark:to-[#DCFF37]" />

          <Button
            className="bg-[#34445C]/80 text-small font-medium text-white shadow-lg border border-[#FF4654]/30 hover:bg-[#FF4654]/20 hover:border-[#FFC700]/50 dark:bg-[#1a1a1a] dark:text-[#DCFF37] dark:border-[#DCFF37]/30 dark:hover:bg-[#DCFF37]/10 dark:hover:border-[#DCFF37]/50 transition-all z-10 rounded-none"
            isDisabled={currentPage === 0}
            variant="flat"
            onPress={onBack}
          >
            <Icon icon="solar:arrow-left-outline" width={18} />
            Back
          </Button>

          <div className="z-10">
            <div className="flex items-center gap-2">
              <Icon
                icon="solar:gamepad-bold"
                className="text-[#FF4654] dark:text-[#DCFF37]"
                width={28}
              />
              <div className="text-xl font-bold leading-7 text-white tracking-tight uppercase">
                Matchmaker
              </div>
            </div>
            <div className="mt-2 text-sm font-medium leading-6 text-white/70 dark:text-[#DCFF37]/70">
              Find worthy opponents and dominate the competition
            </div>
          </div>

          {/* Desktop Steps */}
          <VerticalSteps
            className={cn(stepperClasses, "z-10")}
            color="secondary"
            currentStep={currentPage}
            steps={[
              {
                title: "Choose Tier",
                description: "Select your competitive level.",
              },
              {
                title: "Select Game",
                description: "Choose your game for matchmaking.",
              },
              {
                title: "Select Region",
                description: "Choose your battleground server location.",
              },
              {
                title: "Game Mode",
                description: "Pick your preferred competitive format.",
              },
              {
                title: "Squad Up",
                description: "Assemble your team or go solo.",
              },
              {
                title: "Set Schedule",
                description: "When are you ready to compete?",
              },
              {
                title: "Prize Pool",
                description: "How should winnings be distributed?",
              },
              {
                title: "Ready Up",
                description: "Confirm and enter the queue.",
              },
            ]}
            onStepChange={onChangePage}
          />
          <SupportCard className="w-full backdrop-blur-lg z-10 bg-[#1e2a38]/60 dark:bg-[#111111]/60 border border-[#FF4654]/20 dark:border-[#DCFF37]/20 shadow-none rounded-none" />
        </div>

        {/* Main content area */}
        <div className="flex h-full w-full flex-col items-center gap-0 md:gap-4">
          {/* Mobile header - LeetGaming brand gradient with horizontal scrollable steps */}
          <div className="sticky top-0 z-10 w-full rounded-none bg-gradient-to-r from-[#34445C] via-[#2a3749] to-[#34445C] dark:from-[#0a0a0a] dark:via-[#111111] dark:to-[#0a0a0a] py-3 shadow-lg lg:hidden border-b border-[#FF4654]/30 dark:border-[#DCFF37]/30">
            {/* Step indicator - compact for mobile */}
            <div className="flex items-center justify-between px-4 mb-2">
              <span className="text-xs font-semibold text-white/80 dark:text-[#DCFF37]/80 uppercase tracking-wider">
                Step {currentPage + 1} of 8
              </span>
              <span className="text-xs font-bold text-[#FF4654] dark:text-[#DCFF37]">
                {
                  [
                    "Tier",
                    "Game",
                    "Region",
                    "Mode",
                    "Squad",
                    "Schedule",
                    "Prizes",
                    "Ready",
                  ][currentPage]
                }
              </span>
            </div>
            {/* Progress bar */}
            <div className="px-4">
              <div className="h-1.5 bg-[#34445C]/50 dark:bg-[#DCFF37]/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#FF4654] via-[#FFC700] to-[#FF4654] dark:from-[#DCFF37] dark:to-[#34445C] transition-all duration-300 rounded-full"
                  style={{ width: `${((currentPage + 1) / 8) * 100}%` }}
                />
              </div>
            </div>
            {/* Scrollable step dots */}
            <div className="flex justify-center gap-1.5 mt-2 px-4 overflow-x-auto scrollbar-hide">
              {[0, 1, 2, 3, 4, 5, 6, 7].map((step) => (
                <button
                  key={step}
                  onClick={() => {
                    // Only allow navigation to completed steps or current step
                    if (step <= currentPage) {
                      onChangePage(step);
                    }
                  }}
                  className={cn(
                    "w-2.5 h-2.5 rounded-full transition-all duration-200 flex-shrink-0",
                    step === currentPage
                      ? "bg-[#FF4654] dark:bg-[#DCFF37] scale-125"
                      : step < currentPage
                        ? "bg-[#FF4654]/50 dark:bg-[#DCFF37]/50 cursor-pointer hover:bg-[#FF4654]/70 dark:hover:bg-[#DCFF37]/70"
                        : "bg-white/20 dark:bg-white/10",
                  )}
                  aria-label={`Step ${step + 1}`}
                />
              ))}
            </div>
          </div>
          {/* Content area with proper mobile scrolling - account for both step navigation buttons AND bottom app nav */}
          <div className="flex-1 w-full overflow-y-auto p-4 pb-44 sm:pb-8 sm:max-w-md md:max-w-lg lg:pb-4">
            {children}
          </div>
          {/* Fixed bottom navigation for mobile - positioned ABOVE the app's mobile navigation bar */}
          <div className="fixed bottom-[88px] left-0 right-0 z-30 lg:hidden bg-white/95 dark:bg-[#0a0a0a]/95 backdrop-blur-xl border-t border-[#FF4654]/20 dark:border-[#DCFF37]/20 px-4 py-3 shadow-[0_-4px_20px_rgba(0,0,0,0.1)] dark:shadow-[0_-4px_20px_rgba(0,0,0,0.5)]">
            <MultistepNavigationButtons
              backButtonProps={{ isDisabled: currentPage === 0 }}
              nextButtonProps={{
                children: currentPage === 7 ? "🎮 FIND MATCH" : "CONTINUE →",
              }}
              onBack={onBack}
              onNext={onNext}
            />
          </div>
          {/* Support card - hidden on mobile, shown only on tablet/desktop */}
          <SupportCard className="hidden sm:block mx-auto w-full max-w-[252px] lg:hidden mb-4" />
        </div>
      </div>
    );
  },
);

MultiStepSidebar.displayName = "MultiStepSidebar";

export default MultiStepSidebar;

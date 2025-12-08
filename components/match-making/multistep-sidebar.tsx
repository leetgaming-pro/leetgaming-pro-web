"use client";

import React from "react";
import {Button} from "@nextui-org/react";
import {Icon} from "@iconify/react";
import {cn} from "@nextui-org/react";

import SupportCard from "./support-card";
import VerticalSteps from "./vertical-steps";

import RowSteps from "./row-steps";
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
  "[--step-color:#34445C]",
  "[--active-color:#FF4654]",
  "[--inactive-border-color:rgba(52,68,92,0.3)]",
  "[--inactive-bar-color:rgba(52,68,92,0.2)]",
  "[--inactive-color:rgba(52,68,92,0.5)]",
  // dark mode - lime green (#DCFF37) signature with navy accents
  "dark:[--step-color:#DCFF37]",
  "dark:[--active-color:#DCFF37]",
  "dark:[--active-border-color:rgba(220,255,55,0.8)]",
  "dark:[--inactive-border-color:rgba(220,255,55,0.3)]",
  "dark:[--inactive-bar-color:rgba(220,255,55,0.2)]",
  "dark:[--inactive-color:rgba(255,255,255,0.4)]",
);

const MultiStepSidebar = React.forwardRef<HTMLDivElement, MultiStepSidebarProps>(
  ({children, className, currentPage, onBack, onNext, onChangePage, ...props}, ref) => {
    return (
      <div
        ref={ref}
        className={cn("flex h-[calc(100vh_-_40px)] w-full gap-x-2 overflow-x-hidden", className)}
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
              <Icon icon="solar:gamepad-bold" className="text-[#FF4654] dark:text-[#DCFF37]" width={28} />
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
        <div className="flex h-full w-full flex-col items-center gap-4 md:p-4">
          {/* Mobile header - LeetGaming brand gradient */}
          <div className="sticky top-0 z-10 w-full rounded-none bg-gradient-to-r from-[#34445C] via-[#2a3749] to-[#34445C] dark:from-[#0a0a0a] dark:via-[#111111] dark:to-[#0a0a0a] py-4 shadow-lg md:max-w-xl lg:hidden border-b border-[#FF4654]/30 dark:border-[#DCFF37]/30">
            <div className="flex justify-center">
              {/* Mobile Steps */}
              <RowSteps
                className={cn("pl-6", stepperClasses)}
                currentStep={currentPage}
                steps={[
                  {
                    title: "Region",
                  },
                  {
                    title: "Mode",
                  },
                  {
                    title: "Squad",
                  },
                  {
                    title: "Time",
                  },
                  {
                    title: "Prizes",
                  },
                  {
                    title: "GO!",
                  },
                ]}
                onStepChange={onChangePage}
              />
            </div>
          </div>
          <div className="h-full w-full p-4 sm:max-w-md md:max-w-lg">
            {children}
            <MultistepNavigationButtons
              backButtonProps={{isDisabled: currentPage === 0}}
              className="lg:hidden"
              nextButtonProps={{
                children:
                  currentPage === 5
                    ? "FIND MATCH"
                    : "CONTINUE",
              }}
              onBack={onBack}
              onNext={onNext}
            />
            <SupportCard className="mx-auto w-full max-w-[252px] lg:hidden" />
          </div>
        </div>
      </div>
    );
  },
);

MultiStepSidebar.displayName = "MultiStepSidebar";

export default MultiStepSidebar;

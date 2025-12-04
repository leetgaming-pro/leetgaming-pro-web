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

// E-sports inspired color scheme - dark with neon accents
const stepperClasses = cn(
  // light mode - competitive gaming colors
  "[--step-color:hsl(var(--nextui-primary-500))]",
  "[--active-color:hsl(var(--nextui-primary-600))]",
  "[--inactive-border-color:rgba(139,92,246,0.3)]",
  "[--inactive-bar-color:rgba(139,92,246,0.2)]",
  "[--inactive-color:rgba(255,255,255,0.5)]",
  // dark mode - neon gamer aesthetic
  "dark:[--step-color:hsl(var(--nextui-secondary-400))]",
  "dark:[--active-color:hsl(var(--nextui-secondary-500))]",
  "dark:[--active-border-color:rgba(34,211,238,0.8)]",
  "dark:[--inactive-border-color:rgba(139,92,246,0.4)]",
  "dark:[--inactive-bar-color:rgba(139,92,246,0.3)]",
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
        {/* Sidebar - E-sports dark gradient with neon accent */}
        <div className="flex hidden h-full w-[380px] flex-shrink-0 flex-col items-start gap-y-6 rounded-large bg-gradient-to-b from-slate-900 via-purple-950/80 to-slate-900 px-6 py-6 shadow-2xl lg:flex border border-purple-500/20 relative overflow-hidden">
          {/* Animated background glow effect */}
          <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/5 via-transparent to-purple-500/10 pointer-events-none" />
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500" />

          <Button
            className="bg-slate-800/80 text-small font-medium text-cyan-400 shadow-lg border border-cyan-500/30 hover:bg-cyan-500/20 hover:border-cyan-400/50 transition-all z-10"
            isDisabled={currentPage === 0}
            radius="full"
            variant="flat"
            onPress={onBack}
          >
            <Icon icon="solar:arrow-left-outline" width={18} />
            Back
          </Button>

          <div className="z-10">
            <div className="flex items-center gap-2">
              <Icon icon="solar:gamepad-bold" className="text-cyan-400" width={28} />
              <div className="text-xl font-bold leading-7 text-white tracking-tight">
                MATCHMAKER
              </div>
            </div>
            <div className="mt-2 text-sm font-medium leading-6 text-purple-200/80">
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
          <SupportCard className="w-full backdrop-blur-lg z-10 bg-slate-800/40 border border-purple-500/20 shadow-none" />
        </div>

        {/* Main content area */}
        <div className="flex h-full w-full flex-col items-center gap-4 md:p-4">
          {/* Mobile header - gaming gradient */}
          <div className="sticky top-0 z-10 w-full rounded-large bg-gradient-to-r from-slate-900 via-purple-900/90 to-slate-900 py-4 shadow-lg md:max-w-xl lg:hidden border border-purple-500/30">
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

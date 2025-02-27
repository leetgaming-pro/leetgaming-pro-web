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
// #FF4654, #FFC700
const stepperClasses = cn(
  // light
  "[--step-color:hsl(var(--nextui-secondary-400))]",
  "[--active-color:rgb(33, 62, 105)]",
  "[--inactive-border-color:rgb(33, 62, 105)]",
  "[--inactive-bar-color:hsl(var(--nextui-secondary-200))]",
  "[--inactive-color:hsl(var(--nextui-secondary-300))]",
  // dark
  "dark:[--step-color:rgba(255,255,255,0.1)]",
  "dark:[--active-color:hsl(var(--nextui-foreground-600))]",
  "dark:[--active-border-color:rgba(255,255,255,0.5)]",
  "dark:[--inactive-border-color:rgba(255,255,255,0.1)]",
  "dark:[--inactive-bar-color:rgba(255,255,255,0.1)]",
  "dark:[--inactive-color:rgba(255,255,255,0.2)]",
);

const MultiStepSidebar = React.forwardRef<HTMLDivElement, MultiStepSidebarProps>(
  ({children, className, currentPage, onBack, onNext, onChangePage, ...props}, ref) => {
    return (
      <div
        ref={ref}
        className={cn("flex h-[calc(100vh_-_40px)] w-full gap-x-2", className)}
        {...props}
      >
        <div className="flex hidden h-full w-[344px] flex-shrink-0 flex-col items-start gap-y-8 rounded-large bg-gradient-to-b from-yellow-300 via-orange-400 to-red-500 px-8 py-6 shadow-small lg:flex">
          <Button
            className="bg-default-50 text-small font-medium text-default-500 shadow-lg"
            isDisabled={currentPage === 0}
            radius="full"
            variant="flat"
            onPress={onBack}
          >
            <Icon icon="solar:arrow-left-outline" width={18} />
            Back
          </Button>
          <div>
            <div className="text-xl font-medium leading-7 text-default-foreground">
              Team finder
            </div>
            <div className="mt-1 text-base font-medium leading-6 text-default-500">
              Find a team to play with and leverage your teamplay
            </div>
          </div>
          {/* Desktop Steps */}
          <VerticalSteps
            className={stepperClasses}
            color="secondary"
            currentStep={currentPage}
            steps={[
              {
                title: "Choose Your Battleground",
                description: "Select your region and let the competition begin.",
              },
              {
                title: "Pick Your Poison",
                description: "Select your preferred game mode and rank to find worthy opponents.",
              },
              {
                title: "Assemble Your Squad",
                description: "Gather your gaming buddies and form your dream team.",
              },
              {
                title: "Flex Your Schedule",
                description: "Tell us when you're ready to dominate. We'll find matches that fit your schedule.",
              },
              {
                title: "Lock and Load",
                description: "Your match is almost ready! Prepare for battle and level up your team play.",
              },
            ]}
            onStepChange={onChangePage}
          />
          <SupportCard className="w-full backdrop-blur-lg lg:bg-white/40 lg:shadow-none dark:lg:bg-white/20" />
        </div>
        <div className="flex h-full w-full flex-col items-center gap-4 md:p-4">
          <div className="sticky top-0 z-10 w-full rounded-large bg-gradient-to-r from-orange-100 via-red-100 to-yellow-100 py-4 shadow-small md:max-w-xl lg:hidden">
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
                    title: "Modes",
                  },
                  {
                    title: "Squad",
                  },
                  {
                    title: "Schedule",
                  },
                  {
                    title: "Match",
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
                  currentPage === 0
                    ? "Sign Up for Free"
                    : currentPage === 4
                      ? "Go to Battle"
                      : "Continue",
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

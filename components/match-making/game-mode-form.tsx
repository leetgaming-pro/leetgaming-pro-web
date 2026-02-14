"use client";

import React, { useState, useEffect } from "react";
import { useRadio, VisuallyHidden, RadioGroup, Chip } from "@nextui-org/react";
import { Icon } from "@iconify/react";
import { cn } from "@nextui-org/react";
import { title } from "../primitives";
import { useTheme } from "next-themes";
import {
  BestOfFiveMatchIcon,
  BestOfThreeMatchIcon,
  SingleEliminationMatchIcon,
} from "../icons";
import { useWizard } from "./wizard-context";

export type GameModeFormProps = React.HTMLAttributes<HTMLFormElement>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const CustomRadio = (props: any) => {
  const {
    Component,
    children,
    description,
    getBaseProps,
    getWrapperProps,
    getInputProps,
    getLabelProps,
    getLabelWrapperProps,
    getControlProps,
  } = useRadio(props);

  return (
    <Component
      {...getBaseProps()}
      className={cn(
        "group inline-flex items-center hover:scale-[1.02] active:scale-[0.98] justify-between flex-row-reverse tap-highlight-transparent transition-all duration-200",
        "w-full max-w-[420px] cursor-pointer border-2 border-default-200 dark:border-[#DCFF37]/20 rounded-none gap-4 p-5",
        "hover:border-[#FF4654]/50 hover:bg-[#FF4654]/5 dark:hover:border-[#DCFF37]/50 dark:hover:bg-[#DCFF37]/5",
        "data-[selected=true]:border-[#FF4654] dark:data-[selected=true]:border-[#DCFF37] data-[selected=true]:bg-[#FF4654]/10 dark:data-[selected=true]:bg-[#DCFF37]/10",
        "data-[selected=true]:shadow-lg data-[selected=true]:shadow-[#FF4654]/20 dark:data-[selected=true]:shadow-[#DCFF37]/20",
      )}
    >
      <VisuallyHidden>
        <input {...getInputProps()} />
      </VisuallyHidden>
      <span {...getWrapperProps()}>
        <span {...getControlProps()} />
      </span>
      <div {...getLabelWrapperProps()} className="flex-1">
        {children && <span {...getLabelProps()}>{children}</span>}
        {description && (
          <span className="text-small text-[#34445C]/60 dark:text-[#F5F0E1]/50 block mt-1">
            {description}
          </span>
        )}
      </div>
    </Component>
  );
};

const GameModeForm = React.forwardRef<HTMLFormElement, GameModeFormProps>(
  ({ className, ...props }, ref) => {
    const { updateState } = useWizard();
    const _appearanceNoneClassName =
      "[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none";
    const { theme: rawTheme } = useTheme();
    // Use mounted state to prevent hydration mismatch
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);
    const theme = mounted ? (rawTheme === "dark" ? "dark" : "light") : "light";

    return (
      <>
        <div className="text-center mb-4 sm:mb-6 px-2">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Icon
              icon="solar:gameboy-bold-duotone"
              className="text-[#FF4654] dark:text-[#DCFF37]"
              width={28}
            />
            <h1
              className={title({
                color: theme === "dark" ? "battleLime" : "battleNavy",
                size: "sm",
              })}
            >
              Game Mode
            </h1>
          </div>
          <p className="text-sm text-default-500">
            Choose your competitive format
          </p>
        </div>
        <form
          ref={ref}
          className={cn(
            "flex flex-col gap-2 sm:gap-3 w-full max-w-[480px] mx-auto px-2 sm:px-0",
            className,
          )}
          {...props}
        >
          <RadioGroup
            className="w-full justify-center items-center gap-3"
            onValueChange={(value) => updateState({ gameMode: value })}
          >
            <CustomRadio value="free">
              <div className="flex items-center gap-3 w-full">
                <div className="flex items-center justify-center w-12 h-12 rounded-none bg-[#34445C]/10 dark:bg-[#1a1a1a]">
                  <Icon
                    icon="solar:gamepad-minimalistic-bold-duotone"
                    className="text-[#34445C] dark:text-[#F5F0E1]/60"
                    width={28}
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-foreground">
                      Casual
                    </span>
                    <Chip
                      size="sm"
                      variant="flat"
                      color="default"
                      className="text-xs"
                    >
                      Training
                    </Chip>
                  </div>
                  <span className="text-small text-[#34445C]/60 dark:text-[#F5F0E1]/50">
                    Practice mode - no stakes, just fun
                  </span>
                </div>
              </div>
            </CustomRadio>

            <CustomRadio value="single">
              <div className="flex items-center gap-3 w-full">
                <div className="flex items-center justify-center w-12 h-12 rounded-none bg-gradient-to-r from-[#FF4654]/10 to-[#FFC700]/10 dark:from-[#FF4654]/20 dark:to-[#FFC700]/20">
                  <SingleEliminationMatchIcon
                    size={28}
                    className="text-orange-600 dark:text-orange-400"
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-foreground">
                      Elimination
                    </span>
                    <Chip
                      size="sm"
                      variant="flat"
                      color="warning"
                      className="text-xs"
                    >
                      Single
                    </Chip>
                  </div>
                  <span className="text-small text-[#34445C]/60 dark:text-[#F5F0E1]/50">
                    One game decides it all - high stakes
                  </span>
                </div>
              </div>
            </CustomRadio>

            <CustomRadio value="bo3">
              <div className="flex items-center gap-3 w-full">
                <div className="flex items-center justify-center w-12 h-12 rounded-none bg-[#34445C]/10 dark:bg-[#34445C]/30">
                  <BestOfThreeMatchIcon
                    size={28}
                    className="text-[#34445C] dark:text-[#DCFF37]"
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-foreground">
                      Best of 3
                    </span>
                    <Chip
                      size="sm"
                      variant="flat"
                      color="secondary"
                      className="text-xs"
                    >
                      Competitive
                    </Chip>
                  </div>
                  <span className="text-small text-[#34445C]/60 dark:text-[#F5F0E1]/50">
                    First to 2 wins - tournament standard
                  </span>
                </div>
              </div>
            </CustomRadio>

            <CustomRadio value="bo5">
              <div className="flex items-center gap-3 w-full">
                <div className="flex items-center justify-center w-12 h-12 rounded-none bg-[#DCFF37]/10 dark:bg-[#DCFF37]/20">
                  <BestOfFiveMatchIcon
                    size={28}
                    className="text-[#DCFF37] dark:text-[#DCFF37]"
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-foreground">
                      Best of 5
                    </span>
                    <Chip
                      size="sm"
                      variant="flat"
                      color="primary"
                      className="text-xs"
                    >
                      Pro League
                    </Chip>
                  </div>
                  <span className="text-small text-[#34445C]/60 dark:text-[#F5F0E1]/50">
                    First to 3 wins - championship format
                  </span>
                </div>
              </div>
            </CustomRadio>
          </RadioGroup>
        </form>
      </>
    );
  },
);

GameModeForm.displayName = "GameModeForm";

export default GameModeForm;

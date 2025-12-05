"use client";

import type {InputProps, SelectProps} from "@nextui-org/react";

import React from "react";
import {
  Input,
  Avatar,
  Autocomplete,
  AutocompleteItem,
  Select,
  SelectItem,
  Checkbox,
  Link,
  Tabs,
  Tab,
  useRadio,
  VisuallyHidden,
  RadioGroup,
  Spacer,
  Chip,
} from "@nextui-org/react";
import {Icon} from "@iconify/react";
import {cn} from "@nextui-org/react";
import { title } from "../primitives";
import { useTheme } from "next-themes";
import { BestOfFiveMatchIcon, BestOfThreeMatchIcon, SingleEliminationMatchIcon } from "../icons";
import { useWizard } from "./wizard-context";

export type GameModeFormProps = React.HTMLAttributes<HTMLFormElement>;

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
        "w-full max-w-[420px] cursor-pointer border-2 border-default-200 dark:border-slate-700 rounded-xl gap-4 p-5",
        "hover:border-purple-400/50 hover:bg-purple-500/5 dark:hover:border-cyan-400/50 dark:hover:bg-cyan-500/5",
        "data-[selected=true]:border-purple-500 dark:data-[selected=true]:border-cyan-400 data-[selected=true]:bg-purple-500/10 dark:data-[selected=true]:bg-cyan-500/10",
        "data-[selected=true]:shadow-lg data-[selected=true]:shadow-purple-500/20 dark:data-[selected=true]:shadow-cyan-500/20",
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
          <span className="text-small text-default-500 dark:text-slate-400 block mt-1">{description}</span>
        )}
      </div>
    </Component>
  );
};


const GameModeForm = React.forwardRef<HTMLFormElement, GameModeFormProps>(
  ({className, ...props}, ref) => {
    const { updateState } = useWizard();
    const appearanceNoneClassName =
      "[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none";
      let { theme } = useTheme();

      if (!theme || theme === "system") {
        theme = "light";
      }

    return (
      <>
        <div className="text-center mb-2">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Icon icon="solar:gameboy-bold-duotone" className="text-purple-500 dark:text-cyan-400" width={32} />
            <h1 className={title({color: theme === "dark" ? "foreground" : "battleNavy"})}>Game Mode</h1>
          </div>
          <div className="text-base leading-5 text-default-500">
            Choose your competitive format
          </div>
        </div>
        <form
          ref={ref}
          className={cn("flex flex-col gap-3 py-6 w-full max-w-[480px] mx-auto", className)}
          {...props}
        >

      <RadioGroup
        className="w-full justify-center items-center gap-3"
        onValueChange={(value) => updateState({ gameMode: value })}
      >
        <CustomRadio value="free">
          <div className="flex items-center gap-3 w-full">
            <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-slate-100 dark:bg-slate-800">
              <Icon icon="solar:gamepad-minimalistic-bold-duotone" className="text-slate-500 dark:text-slate-400" width={28} />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-foreground">Casual</span>
                <Chip size="sm" variant="flat" color="default" className="text-xs">Training</Chip>
              </div>
              <span className="text-small text-default-500 dark:text-slate-400">Practice mode - no stakes, just fun</span>
            </div>
          </div>
        </CustomRadio>

        <CustomRadio value="single">
          <div className="flex items-center gap-3 w-full">
            <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-orange-100 dark:bg-orange-900/30">
              <SingleEliminationMatchIcon size={28} className="text-orange-600 dark:text-orange-400" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-foreground">Elimination</span>
                <Chip size="sm" variant="flat" color="warning" className="text-xs">Single</Chip>
              </div>
              <span className="text-small text-default-500 dark:text-slate-400">One game decides it all - high stakes</span>
            </div>
          </div>
        </CustomRadio>

        <CustomRadio value="bo3">
          <div className="flex items-center gap-3 w-full">
            <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-purple-100 dark:bg-purple-900/30">
              <BestOfThreeMatchIcon size={28} className="text-purple-600 dark:text-purple-400" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-foreground">Best of 3</span>
                <Chip size="sm" variant="flat" color="secondary" className="text-xs">Competitive</Chip>
              </div>
              <span className="text-small text-default-500 dark:text-slate-400">First to 2 wins - tournament standard</span>
            </div>
          </div>
        </CustomRadio>

        <CustomRadio value="bo5">
          <div className="flex items-center gap-3 w-full">
            <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-cyan-100 dark:bg-cyan-900/30">
              <BestOfFiveMatchIcon size={28} className="text-cyan-600 dark:text-cyan-400" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-foreground">Best of 5</span>
                <Chip size="sm" variant="flat" color="primary" className="text-xs">Pro League</Chip>
              </div>
              <span className="text-small text-default-500 dark:text-slate-400">First to 3 wins - championship format</span>
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

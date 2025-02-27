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
} from "@nextui-org/react";
import {Icon} from "@iconify/react";
import {cn} from "@nextui-org/react";
import { title } from "../primitives";
import { useTheme } from "next-themes";
import { BestOfFiveMatchIcon, BestOfThreeMatchIcon, SingleEliminationMatchIcon } from "../icons";

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
        "group inline-flex items-center hover:opacity-70 active:opacity-50 justify-between flex-row-reverse tap-highlight-transparent",
        "max-w-[300px] cursor-pointer border-2 border-default rounded-lg gap-4 p-4",
        "data-[selected=true]:border-primary",
      )}
    >
      <VisuallyHidden>
        <input {...getInputProps()} />
      </VisuallyHidden>
      <span {...getWrapperProps()}>
        <span {...getControlProps()} />
      </span>
      <div {...getLabelWrapperProps()}>
        {children && <span {...getLabelProps()}>{children}</span>}
        {description && (
          <span className="text-small text-foreground opacity-70">{description}</span>
        )}
      </div>
    </Component>
  );
};


const GameModeForm = React.forwardRef<HTMLFormElement, GameModeFormProps>(
  ({className, ...props}, ref) => {
    const appearanceNoneClassName =
      "[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none";
      let { theme } = useTheme();

      if (!theme || theme === "system") {
        theme = "light";
      }

    return (
      <>
        <h1 className={title({color: theme === "dark" ? "foreground" : "battleNavy"})}>Select Game Mode</h1>
        <div className="py-4 text-base leading-5 text-default-500">
          Select the game mode for the challenge
        </div>
        <form
          ref={ref}
          className={cn("flex grid grid-cols-12 flex-col gap-4 py-8 w-[500px]", className)}
          {...props}
        >
     
      <RadioGroup className="w-[500px] justify-center items-center">
      <CustomRadio className="justify-center text-center items-center" description="Free or unlimited gameplay. Recommended for training or just player networking." value="free">
          <div className="flex flex-col items-center gap-2">
          Casual
          </div>
        </CustomRadio>
        <CustomRadio className="justify-center text-center items-center" description="Single game won decides the challenge." value="single">
          <div className="flex flex-col items-center gap-2">
          <SingleEliminationMatchIcon size={32} /> 
          Elimination
          </div>
        </CustomRadio>
        <CustomRadio className="justify-center text-center items-center" description="Best of 3 games wins the challenge." value="bo3">
        <div className="flex flex-col items-center gap-2">
          <BestOfThreeMatchIcon size={32} />
          Best Of Three
          </div>
        </CustomRadio>
        <CustomRadio className="justify-center text-center items-center" description="Best of 5 games wins the challenge." value="bo5">
        <div className="flex flex-col items-center gap-2">
         <BestOfFiveMatchIcon size={32} />
         Best Of Five
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

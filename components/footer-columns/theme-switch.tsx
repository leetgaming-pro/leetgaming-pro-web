"use client";

import React from "react";
import {RadioGroup, VisuallyHidden, useRadio, useRadioGroupContext} from "@nextui-org/react";
import {Icon} from "@iconify/react";

import {cl} from "../cl";

interface ThemeSwitchProps {
  classNames?: {
    wrapper?: string;
    [key: string]: string | undefined;
  };
  defaultValue?: string;
  orientation?: "horizontal" | "vertical";
  className?: string;
  onChange?: (value: string) => void;
}

interface ThemeRadioItemProps {
  icon: string;
  value: string;
}

const ThemeRadioItem = ({icon, value}: ThemeRadioItemProps) => {
  const {
    Component,
    isSelected: isSelfSelected,
    getBaseProps,
    getInputProps,
    getWrapperProps,
  } = useRadio({value});

  const groupContext = useRadioGroupContext();

  const isSelected =
    isSelfSelected || Number(groupContext.groupState.selectedValue) >= Number(value);

  const wrapperProps = getWrapperProps();

  return (
    <Component {...getBaseProps()}>
      <VisuallyHidden>
        <input {...getInputProps()} />
      </VisuallyHidden>
      <div
        {...wrapperProps}
        className={cl(
          wrapperProps?.["className"],
          "pointer-events-none h-8 w-8 rounded-full border-black border-opacity-10 ring-0 transition-transform group-data-[pressed=true]:scale-90",
          {
            "bg-default-200 dark:bg-default-100": isSelected,
          },
        )}
      >
        <Icon className="text-default-500" icon={icon} width={18} />
      </div>
    </Component>
  );
};

const ThemeSwitch = React.forwardRef<HTMLDivElement, ThemeSwitchProps>(
  ({classNames = {}, className, defaultValue = "dark", orientation = "horizontal", onChange}, ref) => (
    <RadioGroup
      ref={ref}
      aria-label="Select a theme"
      className={className}
      classNames={{
        ...classNames,
        wrapper: cl("gap-0 items-center", classNames?.wrapper),
      }}
      defaultValue={defaultValue}
      orientation={orientation}
      onValueChange={onChange}
    >
      <ThemeRadioItem icon="solar:moon-linear" value="dark" />
      <ThemeRadioItem icon="solar:sun-2-linear" value="light" />
      <ThemeRadioItem icon="solar:monitor-linear" value="system" />
    </RadioGroup>
  ),
);

ThemeSwitch.displayName = "ThemeSwitch";

export default ThemeSwitch;

"use client";

import React from "react";
import {Tooltip, VisuallyHidden, useRadio} from "@nextui-org/react";
import {cn} from "@nextui-org/react";

export interface GameRadioItemProps {
  value: string;
  color?: string;
  tooltip?: string;
}

const GameRadioItem = React.forwardRef<HTMLInputElement, GameRadioItemProps>(
  ({color, tooltip, value}, ref) => {
    const {Component, isSelected, isFocusVisible, getBaseProps, getInputProps} = useRadio({value});

    return (
      <Tooltip content={tooltip} delay={1000} isDisabled={!tooltip} offset={0} placement="top">
        <Component {...getBaseProps()} ref={ref}>
          <VisuallyHidden>
            <input {...getInputProps()} />
          </VisuallyHidden>
          <span
            className={cn(
              "pointer-events-none h-8 w-8 rounded-full border border-black border-opacity-10 transition-transform group-data-[pressed=true]:scale-90",
              {
                "ring-2 ring-offset-2 ring-offset-content1": isSelected,
              },
            )}
            style={{
              backgroundColor: color,
              // @ts-ignore
              "--tw-ring-color":
                isSelected || isFocusVisible ? "hsl(var(--nextui-primary))" : "transparent",
            }}
          />
        </Component>
      </Tooltip>
    );
  },
);

GameRadioItem.displayName = "GameRadioItem";

export default GameRadioItem;

"use client";

import React from "react";
import {extendVariants, Switch} from "@nextui-org/react";
import { cl } from "@/components/cl";

const CustomSwitch = extendVariants(Switch, {
  variants: {
    color: {
      foreground: {
        wrapper: [
          "group-data-[selected=true]:bg-foreground",
          "group-data-[selected=true]:text-background",
        ],
      },
    },
  },
});

export interface SwitchCellProps {
  label: string;
  description: string;
  color?: "default" | "primary" | "secondary" | "success" | "warning" | "danger" | "foreground";
  classNames?: {
    base?: string;
    label?: string;
    description?: string | string[];
  };
  defaultSelected?: boolean;
}

const SwitchCell = React.forwardRef<HTMLInputElement, SwitchCellProps>(
  ({label, description, classNames, color, defaultSelected}, ref) => (
    <CustomSwitch
      ref={ref}
      color={color}
      defaultSelected={defaultSelected}
      classNames={{
        base: cl(
          "inline-flex bg-content2 flex-row-reverse w-full max-w-full items-center",
          "justify-between cursor-pointer rounded-medium gap-2 p-4",
          classNames?.base,
        ),
      }}
    >
      <div className="flex flex-col">
        <p className={cl("text-medium", classNames?.label)}>{label}</p>
        <p className={cl("text-small text-default-500", classNames?.description)}>{description}</p>
      </div>
    </CustomSwitch>
  ),
);

SwitchCell.displayName = "SwitchCell";

export default SwitchCell;

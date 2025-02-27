"use client";

import React from "react";
import {cn} from "@nextui-org/react";

import { replayFiles } from "./mock";

import ReplayFileItemCard from "../replay-file-item-card/app";

export type ProductGridProps = React.HTMLAttributes<HTMLDivElement> & {
  itemClassName?: string;
};

const ReplayFilesGrid = React.forwardRef<HTMLDivElement, ProductGridProps>(
  ({itemClassName, className, ...props}, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "grid w-full grid-cols-1 gap-0 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4",
          className,
        )}
        {...props}
      >
        {replayFiles.map((replayFile) => (
          <ReplayFileItemCard
            key={replayFile.id}
            removeWrapper
            {...replayFile}
            className={cn("w-full snap-start", itemClassName)}
          />
        ))}
      </div>
    );
  },
);

ReplayFilesGrid.displayName = "ReplayFilesGrid";

export default ReplayFilesGrid;

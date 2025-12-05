"use client";

import React, { useEffect, useState } from "react";
import { cn } from "@nextui-org/react";
import ReplayFileItemCard from "../replay-file-item-card/app";
import { ReplayAPISDK } from '@/types/replay-api/sdk';
import { ReplayApiSettingsMock } from '@/types/replay-api/settings';
import { logger } from '@/lib/logger';
import { ReplayFile } from '@/types/replay-api/replay-file';

const baseUrl = process.env.NEXT_PUBLIC_REPLAY_API_URL || process.env.REPLAY_API_URL || 'http://localhost:8080';
const sdk = new ReplayAPISDK({ ...ReplayApiSettingsMock, baseUrl }, logger);

export type ProductGridProps = React.HTMLAttributes<HTMLDivElement> & {
  itemClassName?: string;
  replays?: ReplayFile[];
};

const ReplayFilesGrid = React.forwardRef<HTMLDivElement, ProductGridProps>(
  ({ itemClassName, className, replays = [], ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "grid w-full grid-cols-1 gap-0 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4",
          className,
        )}
        {...props}
      >
        {replays.length === 0 && (
          <div className="col-span-full py-10 text-center text-sm text-default-500">No replays found.</div>
        )}
        {replays.map((replayFile) => (
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

function useReplayFiles() {
  const [replays, setReplays] = useState<ReplayFile[]>([]);
  useEffect(() => {
    let mounted = true;
    sdk.replayFiles.searchReplayFiles({ limit: 20 })
      .then((data) => {
        if (mounted && Array.isArray(data)) {
          setReplays(data as ReplayFile[]);
        }
      })
      .catch((err) => logger.warn('Failed to load replays', err));
    return () => { mounted = false; };
  }, []);
  return replays;
}

// Wrapper component exposing hook data
export const ReplayFilesGridWithData: React.FC = () => {
  const replays = useReplayFiles();
  return <ReplayFilesGrid replays={replays} />;
};

// Extend props to accept loaded replays

export default ReplayFilesGrid;

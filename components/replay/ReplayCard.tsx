"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Card, CardBody, Chip, Button, Tooltip, Progress } from "@nextui-org/react";
import { Icon } from "@iconify/react";
import clsx from "clsx";
import { electrolize } from "@/config/fonts";
import { ShareButton } from "@/components/share/share-button";
import { normalizeStatus, STATUS_CONFIG, isStatusProcessing, isStatusReady } from "@/lib/status-utils";
import { ReplayFile, ResourceOwner, getResourceOwnerPrimaryId } from "@/types/replay-api/replay-file";

interface ReplayCardProps {
  replay: ReplayFile;
  variant?: "default" | "compact" | "featured";
  onView?: () => void;
  className?: string;
}

export function ReplayCard({
  replay,
  variant = "default",
  onView,
  className,
}: ReplayCardProps) {
  const router = useRouter();
  const replayRecord = replay as ReplayFile & Record<string, unknown>;
  
  // Normalize status
  const rawStatus = replayRecord.status || "pending";
  const status = normalizeStatus(rawStatus);
  const statusConfig = STATUS_CONFIG[status];
  const isProcessing = isStatusProcessing(rawStatus);
  const isReady = isStatusReady(rawStatus);
  
  // Get game info
  const gameId = replayRecord.game_id || (replayRecord as Record<string, unknown>).gameId as string || "cs2";
  const map = replayRecord.map || "Unknown Map";
  const title = replay.title || `${gameId.toUpperCase()} Match`;
  const createdAt = new Date(replay.created_at).toLocaleDateString();
  const duration = replayRecord.duration;
  const ownerName = getResourceOwnerPrimaryId(replayRecord.resource_owner || (replayRecord as Record<string, unknown>).resourceOwner as ResourceOwner);
  
  // Format duration
  const formatDuration = (seconds?: number) => {
    if (!seconds) return null;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleView = () => {
    if (onView) {
      onView();
    } else {
      router.push(`/replays/${replay.id}`);
    }
  };

  if (variant === "compact") {
    return (
      <Card
        className={clsx(
          "group overflow-hidden border border-default-200/50 dark:border-default-100/50 hover:border-[#DCFF37]/50 transition-all duration-300",
          className
        )}
        isPressable
        onPress={handleView}
      >
        <CardBody className="p-3">
          <div className="flex items-center gap-3">
            {/* Thumbnail */}
            <div className="w-16 h-12 rounded overflow-hidden flex-shrink-0 bg-gradient-to-br from-[#FF4654]/20 to-[#FFC700]/20 dark:from-[#DCFF37]/10 dark:to-[#34445C]/20 flex items-center justify-center">
              <Icon icon="solar:play-bold" className="text-white/60" width={20} />
            </div>
            
            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm truncate">{title}</span>
                <Chip
                  size="sm"
                  color={statusConfig.color}
                  variant="flat"
                  className="text-[10px] h-5"
                >
                  {statusConfig.label}
                </Chip>
              </div>
              <div className="flex items-center gap-2 text-xs text-default-500 mt-0.5">
                <span>{gameId.toUpperCase()}</span>
                <span>•</span>
                <span>{createdAt}</span>
              </div>
            </div>
            
            {/* Arrow */}
            <Icon
              icon="solar:arrow-right-bold"
              width={16}
              className="text-default-400 group-hover:text-[#DCFF37] group-hover:translate-x-1 transition-all"
            />
          </div>
        </CardBody>
      </Card>
    );
  }

  if (variant === "featured") {
    return (
      <Card
        className={clsx(
          "group overflow-hidden border-2 border-[#DCFF37]/30 hover:border-[#DCFF37] transition-all duration-300 bg-gradient-to-br from-background to-[#DCFF37]/5",
          className
        )}
      >
        <CardBody className="p-0">
          {/* Large thumbnail */}
          <div className="aspect-[21/9] relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-[#FF4654]/30 to-[#FFC700]/30 dark:from-[#DCFF37]/20 dark:to-[#34445C]/30" />
            
            {/* Play overlay */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
              <div className="w-16 h-16 rounded-full bg-[#DCFF37] flex items-center justify-center">
                <Icon icon="solar:play-bold" className="text-[#34445C] ml-1" width={32} />
              </div>
            </div>
            
            {/* Top badges */}
            <div className="absolute top-3 left-3 flex gap-2">
              <Chip
                size="sm"
                color="primary"
                variant="shadow"
                className="font-semibold"
                startContent={<Icon icon="solar:star-bold" width={12} className="text-[#FFB800]" />}
              >
                FEATURED
              </Chip>
              <Chip size="sm" color="secondary" variant="shadow">
                {gameId.toUpperCase()}
              </Chip>
            </div>
            
            {/* Bottom gradient */}
            <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/80 to-transparent" />
            
            {/* Title overlay */}
            <div className="absolute bottom-4 left-4 right-4">
              <h3 className={clsx("text-2xl font-black text-white uppercase tracking-tight", electrolize.className)}>
                {title}
              </h3>
              <div className="flex items-center gap-3 text-white/70 text-sm mt-1">
                <span>{map}</span>
                {duration && (
                  <>
                    <span>•</span>
                    <span>{formatDuration(duration)}</span>
                  </>
                )}
              </div>
            </div>
          </div>
          
          {/* Actions */}
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-default-500">
              <Icon icon="solar:user-bold" width={14} />
              <span>{ownerName}</span>
            </div>
            <div className="flex gap-2">
              <ShareButton contentType="replay" contentId={replay.id} size="sm" variant="ghost" />
              <Button
                size="sm"
                className="bg-gradient-to-r from-[#FF4654] to-[#DCFF37] text-white font-semibold"
                onClick={handleView}
              >
                Watch Now
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>
    );
  }

  // Default variant
  return (
    <Card
      className={clsx(
        "group overflow-hidden border border-default-200/50 dark:border-default-100/50 hover:border-[#DCFF37]/50 hover:shadow-lg hover:shadow-[#DCFF37]/10 transition-all duration-300",
        className
      )}
    >
      <CardBody className="p-0">
        {/* Thumbnail */}
        <div className="aspect-video relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#FF4654]/20 to-[#FFC700]/20 dark:from-[#DCFF37]/10 dark:to-[#34445C]/20" />
          
          {/* Center play icon with hover effect */}
          <div className="absolute inset-0 flex items-center justify-center">
            {isProcessing ? (
              <div className="text-center">
                <div className="w-12 h-12 border-3 border-t-[#DCFF37] border-r-[#FF4654] border-b-[#FFC700] border-l-transparent rounded-full animate-spin" />
                <p className="text-white/70 text-xs mt-2">Processing...</p>
              </div>
            ) : (
              <div className="w-14 h-14 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 group-hover:bg-[#DCFF37] transition-all duration-300">
                <Icon
                  icon="solar:play-bold"
                  className="text-white group-hover:text-[#34445C] ml-0.5"
                  width={28}
                />
              </div>
            )}
          </div>
          
          {/* Top badges */}
          <div className="absolute top-2 left-2 flex gap-1.5">
            <Chip
              size="sm"
              color="primary"
              variant="shadow"
              className="text-xs font-semibold"
            >
              {gameId.toUpperCase()}
            </Chip>
            <Chip
              size="sm"
              color={statusConfig.color}
              variant="shadow"
              className="text-xs"
              startContent={<Icon icon={statusConfig.icon} width={12} />}
            >
              {statusConfig.label}
            </Chip>
          </div>
          
          {/* Visibility badge */}
          <div className="absolute top-2 right-2">
            <Chip
              size="sm"
              color={replay.visibility === "public" ? "success" : "warning"}
              variant="shadow"
              className="text-xs"
            >
              {replay.visibility || "public"}
            </Chip>
          </div>
          
          {/* Duration badge */}
          {duration && (
            <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/60 backdrop-blur-sm text-white text-xs font-medium">
              {formatDuration(duration)}
            </div>
          )}
          
          {/* Processing progress */}
          {isProcessing && (
            <div className="absolute bottom-0 left-0 right-0">
              <Progress
                size="sm"
                isIndeterminate
                color="warning"
                classNames={{
                  track: "bg-black/30",
                }}
              />
            </div>
          )}
        </div>
        
        {/* Content */}
        <div className="p-4">
          {/* Title */}
          <h3 className="font-semibold text-default-900 line-clamp-2 mb-2 group-hover:text-[#DCFF37] transition-colors">
            {title}
          </h3>
          
          {/* Meta info */}
          <div className="flex items-center justify-between text-sm text-default-500 mb-3">
            <Tooltip content={`Uploaded by ${ownerName}`}>
              <span className="truncate max-w-[140px]">{ownerName}</span>
            </Tooltip>
            <span>{createdAt}</span>
          </div>
          
          {/* Map info if available */}
          {map && map !== "Unknown Map" && (
            <div className="flex items-center gap-1.5 text-xs text-default-400 mb-3">
              <Icon icon="solar:map-point-bold" width={12} />
              <span>{map}</span>
            </div>
          )}
          
          {/* Actions */}
          <div className="flex gap-2">
            <Button
              size="sm"
              color="primary"
              variant="ghost"
              className="flex-1"
              onClick={handleView}
              isDisabled={!isReady && !isProcessing}
            >
              {isReady ? "View" : isProcessing ? "Processing..." : "Unavailable"}
            </Button>
            <ShareButton
              contentType="replay"
              contentId={replay.id}
              size="sm"
              variant="ghost"
            />
          </div>
        </div>
      </CardBody>
    </Card>
  );
}

// Grid of replay cards
export function ReplayCardGrid({
  replays,
  isLoading,
  columns = 4,
}: {
  replays: ReplayFile[];
  isLoading?: boolean;
  columns?: 2 | 3 | 4;
}) {
  const colClasses = {
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
  };

  if (isLoading) {
    return (
      <div className={clsx("grid gap-6", colClasses[columns])}>
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <CardBody className="p-0">
              <div className="aspect-video animate-pulse bg-gradient-to-br from-[#34445C]/10 to-[#34445C]/20" />
              <div className="p-4 space-y-3">
                <div className="h-5 w-3/4 rounded animate-pulse bg-default-200/50" />
                <div className="h-4 w-1/2 rounded animate-pulse bg-default-200/30" />
                <div className="flex gap-2">
                  <div className="h-8 flex-1 rounded animate-pulse bg-default-200/30" />
                  <div className="h-8 w-10 rounded animate-pulse bg-default-200/30" />
                </div>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className={clsx("grid gap-6", colClasses[columns])}>
      {replays.map((replay) => (
        <ReplayCard key={replay.id} replay={replay} />
      ))}
    </div>
  );
}

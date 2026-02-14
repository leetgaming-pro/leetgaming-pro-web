"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Card, CardBody, Chip, Button, Tooltip } from "@nextui-org/react";
import { Icon } from "@iconify/react";
import clsx from "clsx";
import { electrolize } from "@/config/fonts";
import { MatchData } from "@/types/replay-api/sdk";
import { normalizeStatus, STATUS_CONFIG, isStatusReady } from "@/lib/status-utils";
import { ShareButton } from "@/components/share/share-button";

interface MatchCardProps {
  match: MatchData;
  gameId?: string;
  variant?: "default" | "compact" | "featured";
  onView?: () => void;
  className?: string;
}

// Side colors
const SIDE_COLORS = {
  CT: "#00A8FF",
  T: "#FFB800",
};

export function MatchCard({
  match,
  gameId = "cs2",
  variant = "default",
  onView,
  className,
}: MatchCardProps) {
  const router = useRouter();
  const matchId = match.id || match.match_id || "";
  
  // Get scoreboard data
  const team1 = match.scoreboard?.team_scoreboards?.[0];
  const team2 = match.scoreboard?.team_scoreboards?.[1];
  const team1Score = team1?.team_score ?? 0;
  const team2Score = team2?.team_score ?? 0;
  const team1Side = (team1?.side || "CT") as "CT" | "T";
  const team2Side = (team2?.side || "T") as "CT" | "T";
  const team1Name = team1?.team?.name || team1Side;
  const team2Name = team2?.team?.name || team2Side;
  const team1Wins = team1Score > team2Score;
  const team2Wins = team2Score > team1Score;
  
  // Match metadata
  const map = match.map || "Unknown Map";
  const playedAt = match.played_at || match.created_at;
  const formattedDate = playedAt ? new Date(playedAt).toLocaleDateString() : "Unknown";
  const totalRounds = team1Score + team2Score;
  const status = normalizeStatus(match.status);
  const statusConfig = STATUS_CONFIG[status];
  const isReady = isStatusReady(match.status);

  // Get total players
  const totalPlayers = (team1?.players?.length ?? 0) + (team2?.players?.length ?? 0);

  const handleView = () => {
    if (onView) {
      onView();
    } else {
      router.push(`/matches/${gameId}/${matchId}`);
    }
  };

  // Format duration
  const formatDuration = (seconds?: number) => {
    if (!seconds) return null;
    const mins = Math.floor(seconds / 60);
    return `${mins} min`;
  };

  if (variant === "compact") {
    return (
      <Card
        className={clsx(
          "group overflow-hidden border border-default-200/50 hover:border-[#DCFF37]/50 transition-all",
          className
        )}
        isPressable
        onPress={handleView}
      >
        <CardBody className="p-3">
          <div className="flex items-center gap-4">
            {/* Teams score */}
            <div className="flex items-center gap-2 min-w-[100px]">
              <div className="text-center">
                <div
                  className={clsx(
                    "text-lg font-bold",
                    team1Wins ? "text-[#00A8FF]" : "text-default-400"
                  )}
                >
                  {team1Score}
                </div>
              </div>
              <span className="text-default-400 text-xs">vs</span>
              <div className="text-center">
                <div
                  className={clsx(
                    "text-lg font-bold",
                    team2Wins ? "text-[#FFB800]" : "text-default-400"
                  )}
                >
                  {team2Score}
                </div>
              </div>
            </div>

            {/* Map and date */}
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-sm truncate">{map}</div>
              <div className="text-xs text-default-500">{formattedDate}</div>
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
          "group overflow-hidden border-2 border-[#DCFF37]/30 hover:border-[#DCFF37] transition-all bg-gradient-to-br from-background to-[#DCFF37]/5",
          className
        )}
      >
        <CardBody className="p-6">
          {/* Featured badge */}
          <div className="flex items-center justify-between mb-4">
            <Chip
              size="sm"
              color="warning"
              variant="shadow"
              startContent={<Icon icon="solar:fire-bold" width={12} />}
            >
              FEATURED MATCH
            </Chip>
            <Chip size="sm" variant="flat">
              {gameId.toUpperCase()}
            </Chip>
          </div>

          {/* Large score display */}
          <div className="flex items-center justify-center gap-6 py-6">
            <div className="text-center">
              <div className="text-xs text-default-500 uppercase tracking-wider mb-2">
                {team1Name}
              </div>
              <div
                className={clsx(
                  "text-6xl font-black",
                  team1Wins ? "" : "opacity-60",
                  electrolize.className
                )}
                style={{ color: SIDE_COLORS[team1Side] }}
              >
                {team1Score}
              </div>
              {team1Wins && (
                <div className="flex items-center justify-center gap-1 mt-2">
                  <Icon icon="solar:crown-bold" width={14} className="text-[#FFB800]" />
                  <span className="text-xs text-[#FFB800] font-semibold">WINNER</span>
                </div>
              )}
            </div>

            <div className={clsx("text-2xl font-bold text-default-400", electrolize.className)}>
              VS
            </div>

            <div className="text-center">
              <div className="text-xs text-default-500 uppercase tracking-wider mb-2">
                {team2Name}
              </div>
              <div
                className={clsx(
                  "text-6xl font-black",
                  team2Wins ? "" : "opacity-60",
                  electrolize.className
                )}
                style={{ color: SIDE_COLORS[team2Side] }}
              >
                {team2Score}
              </div>
              {team2Wins && (
                <div className="flex items-center justify-center gap-1 mt-2">
                  <Icon icon="solar:crown-bold" width={14} className="text-[#FFB800]" />
                  <span className="text-xs text-[#FFB800] font-semibold">WINNER</span>
                </div>
              )}
            </div>
          </div>

          {/* Match info */}
          <div className="flex items-center justify-center gap-4 text-sm text-default-500 mb-4">
            <span className="flex items-center gap-1">
              <Icon icon="solar:map-point-bold" width={14} />
              {map}
            </span>
            <span className="flex items-center gap-1">
              <Icon icon="solar:calendar-bold" width={14} />
              {formattedDate}
            </span>
            <span className="flex items-center gap-1">
              <Icon icon="solar:users-group-rounded-bold" width={14} />
              {totalPlayers} players
            </span>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              className="flex-1 bg-gradient-to-r from-[#FF4654] to-[#DCFF37] text-white font-semibold"
              onClick={handleView}
            >
              View Details
            </Button>
            <ShareButton contentType="match" contentId={matchId} variant="flat" />
          </div>
        </CardBody>
      </Card>
    );
  }

  // Default variant
  return (
    <Card
      className={clsx(
        "group overflow-hidden border border-default-200/50 hover:border-[#DCFF37]/50 hover:shadow-lg hover:shadow-[#DCFF37]/10 transition-all duration-300",
        className
      )}
    >
      <CardBody className="p-4">
        {/* Header with badges */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Chip size="sm" color="primary" variant="flat">
              {gameId.toUpperCase()}
            </Chip>
            <Chip
              size="sm"
              color={statusConfig.color}
              variant="flat"
              startContent={<Icon icon={statusConfig.icon} width={12} />}
            >
              {statusConfig.label}
            </Chip>
          </div>
          <div className="text-xs text-default-500">
            {formattedDate}
          </div>
        </div>

        {/* Score display */}
        <div className="flex items-center justify-center gap-4 py-4">
          <div className="text-center flex-1">
            <div className="text-xs text-default-500 uppercase tracking-wider mb-1 truncate">
              {team1Name}
            </div>
            <div
              className={clsx(
                "text-4xl font-black",
                team1Wins ? "" : "opacity-60",
                electrolize.className
              )}
              style={{ color: SIDE_COLORS[team1Side] }}
            >
              {team1Score}
            </div>
            {team1Wins && (
              <Icon icon="solar:crown-bold" width={16} className="text-[#FFB800] mx-auto mt-1" />
            )}
          </div>

          <div className={clsx("text-lg font-bold text-default-400", electrolize.className)}>
            VS
          </div>

          <div className="text-center flex-1">
            <div className="text-xs text-default-500 uppercase tracking-wider mb-1 truncate">
              {team2Name}
            </div>
            <div
              className={clsx(
                "text-4xl font-black",
                team2Wins ? "" : "opacity-60",
                electrolize.className
              )}
              style={{ color: SIDE_COLORS[team2Side] }}
            >
              {team2Score}
            </div>
            {team2Wins && (
              <Icon icon="solar:crown-bold" width={16} className="text-[#FFB800] mx-auto mt-1" />
            )}
          </div>
        </div>

        {/* Match info */}
        <div className="flex items-center justify-center gap-3 text-xs text-default-500 mb-4">
          <Tooltip content="Map">
            <span className="flex items-center gap-1">
              <Icon icon="solar:map-point-bold" width={12} />
              {map}
            </span>
          </Tooltip>
          <span>•</span>
          <Tooltip content="Total Rounds">
            <span className="flex items-center gap-1">
              <Icon icon="solar:layers-minimalistic-bold" width={12} />
              {totalRounds} rounds
            </span>
          </Tooltip>
          {match.duration && (
            <>
              <span>•</span>
              <Tooltip content="Duration">
                <span className="flex items-center gap-1">
                  <Icon icon="solar:clock-circle-bold" width={12} />
                  {formatDuration(match.duration)}
                </span>
              </Tooltip>
            </>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            size="sm"
            color="primary"
            variant="ghost"
            className="flex-1"
            onClick={handleView}
            isDisabled={!isReady}
          >
            {isReady ? "View Match" : "Processing..."}
          </Button>
          <ShareButton
            contentType="match"
            contentId={matchId}
            size="sm"
            variant="ghost"
          />
        </div>
      </CardBody>
    </Card>
  );
}

// Grid of match cards
export function MatchCardGrid({
  matches,
  gameId,
  isLoading,
  columns = 3,
}: {
  matches: MatchData[];
  gameId?: string;
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
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <CardBody className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="h-5 w-16 rounded animate-pulse bg-default-200/50" />
                <div className="h-4 w-20 rounded animate-pulse bg-default-200/30" />
              </div>
              <div className="flex items-center justify-center gap-4 py-4">
                <div className="h-12 w-12 rounded animate-pulse bg-default-200/50" />
                <div className="h-6 w-6 rounded animate-pulse bg-default-200/30" />
                <div className="h-12 w-12 rounded animate-pulse bg-default-200/50" />
              </div>
              <div className="flex justify-center gap-2">
                <div className="h-8 flex-1 rounded animate-pulse bg-default-200/30" />
                <div className="h-8 w-10 rounded animate-pulse bg-default-200/30" />
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className={clsx("grid gap-6", colClasses[columns])}>
      {matches.map((match) => (
        <MatchCard key={match.id || match.match_id} match={match} gameId={gameId} />
      ))}
    </div>
  );
}

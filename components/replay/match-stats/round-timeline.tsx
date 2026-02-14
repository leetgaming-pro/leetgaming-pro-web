"use client";

/**
 * Round Timeline Component
 * Visualizes round-by-round match progression with key events
 */

import React, { useState } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Chip,
  Tooltip,
  ScrollShadow,
  Divider,
} from "@nextui-org/react";
import { Icon } from "@iconify/react";

interface RoundEvent {
  tick: number;
  type:
    | "kill"
    | "bomb_plant"
    | "bomb_defuse"
    | "clutch_start"
    | "clutch_win"
    | "ace";
  player_name?: string;
  victim_name?: string;
  weapon?: string;
  headshot?: boolean;
  site?: string;
}

interface RoundData {
  round_number: number;
  winner: "CT" | "T";
  win_reason: string;
  duration_seconds: number;
  events: RoundEvent[];
  team1_score: number;
  team2_score: number;
}

interface RoundTimelineProps {
  rounds: RoundData[];
  onRoundSelect?: (roundNumber: number) => void;
  selectedRound?: number;
}

const winReasonLabels: Record<string, { label: string; icon: string }> = {
  bomb_defused: { label: "Bomb Defused", icon: "mdi:bomb-off" },
  bomb_exploded: { label: "Bomb Exploded", icon: "mdi:bomb" },
  elimination: { label: "Elimination", icon: "solar:target-bold" },
  time_expired: { label: "Time Expired", icon: "solar:clock-circle-bold" },
  hostage_rescued: { label: "Hostage Rescued", icon: "mdi:human-handsup" },
  hostage_killed: { label: "Hostage Killed", icon: "mdi:human-handsdown" },
};

const RoundCard: React.FC<{
  round: RoundData;
  isSelected: boolean;
  onClick: () => void;
}> = ({ round, isSelected, onClick }) => {
  const winReason = winReasonLabels[round.win_reason] || {
    label: round.win_reason,
    icon: "solar:question-circle-bold",
  };

  const isCT = round.winner === "CT";
  const bgClass = isCT
    ? "bg-blue-500/10 hover:bg-blue-500/20 border-blue-500/30"
    : "bg-amber-500/10 hover:bg-amber-500/20 border-amber-500/30";

  const selectedClass = isSelected
    ? "ring-2 ring-primary ring-offset-2 ring-offset-background"
    : "";

  const _kills = round.events.filter((e) => e.type === "kill").length;
  const hasClutch = round.events.some((e) => e.type === "clutch_win");
  const hasAce = round.events.some((e) => e.type === "ace");

  return (
    <button
      onClick={onClick}
      className={`
        flex-shrink-0 w-16 p-2 rounded-none border transition-all
        ${bgClass} ${selectedClass}
      `}
    >
      <div className="text-center">
        <span className="text-xs text-default-500">R{round.round_number}</span>
        <div
          className={`text-lg font-bold ${
            isCT ? "text-blue-500" : "text-amber-500"
          }`}
        >
          {round.team1_score}-{round.team2_score}
        </div>
        <Tooltip content={winReason.label}>
          <Icon
            icon={winReason.icon}
            width={16}
            className={isCT ? "text-blue-400" : "text-amber-400"}
          />
        </Tooltip>
        <div className="flex justify-center gap-0.5 mt-1">
          {hasAce && (
            <Tooltip content="ACE">
              <Icon
                icon="solar:star-bold"
                width={10}
                className="text-amber-400"
              />
            </Tooltip>
          )}
          {hasClutch && (
            <Tooltip content="Clutch">
              <Icon
                icon="solar:fire-bold"
                width={10}
                className="text-orange-400"
              />
            </Tooltip>
          )}
        </div>
      </div>
    </button>
  );
};

const RoundDetails: React.FC<{ round: RoundData }> = ({ round }) => {
  const kills = round.events.filter((e) => e.type === "kill");
  const winReason = winReasonLabels[round.win_reason] || {
    label: round.win_reason,
    icon: "solar:question-circle-bold",
  };
  const isCT = round.winner === "CT";

  return (
    <Card className="rounded-none border border-default-200 dark:border-default-100/10">
      <CardHeader className="flex justify-between items-center pb-2">
        <div className="flex items-center gap-3">
          <div
            className={`
            w-10 h-10 flex items-center justify-center rounded-none
            ${isCT ? "bg-blue-500/20" : "bg-amber-500/20"}
          `}
          >
            <span className="font-bold">{round.round_number}</span>
          </div>
          <div>
            <h4 className="font-semibold">Round {round.round_number}</h4>
            <p className="text-xs text-default-500">
              Duration: {round.duration_seconds}s
            </p>
          </div>
        </div>
        <Chip
          size="sm"
          color={isCT ? "primary" : "warning"}
          variant="flat"
          startContent={<Icon icon={winReason.icon} width={14} />}
        >
          {isCT ? "CT" : "T"} - {winReason.label}
        </Chip>
      </CardHeader>
      <Divider />
      <CardBody className="pt-2">
        {kills.length > 0 ? (
          <div className="space-y-2">
            {kills.map((event, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 text-sm p-2 bg-default-100 dark:bg-default-50/5 rounded"
              >
                <span className="font-medium text-success">
                  {event.player_name}
                </span>
                <Icon
                  icon={event.headshot ? "mdi:head" : "solar:target-bold"}
                  width={14}
                  className={
                    event.headshot ? "text-danger" : "text-default-400"
                  }
                />
                <span className="text-default-400">{event.weapon}</span>
                <Icon
                  icon="solar:arrow-right-linear"
                  width={14}
                  className="text-default-300"
                />
                <span className="text-danger">{event.victim_name}</span>
                {event.headshot && (
                  <Chip
                    size="sm"
                    variant="flat"
                    color="danger"
                    className="ml-auto"
                  >
                    HS
                  </Chip>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-default-500 text-sm text-center py-4">
            No kill events recorded
          </p>
        )}
      </CardBody>
    </Card>
  );
};

export const RoundTimeline: React.FC<RoundTimelineProps> = ({
  rounds,
  onRoundSelect,
  selectedRound,
}) => {
  const [internalSelected, setInternalSelected] = useState<number>(1);
  const currentRound = selectedRound ?? internalSelected;

  const handleRoundClick = (roundNumber: number) => {
    setInternalSelected(roundNumber);
    onRoundSelect?.(roundNumber);
  };

  const selectedRoundData = rounds.find((r) => r.round_number === currentRound);

  // Calculate half-time
  const halfIndex = Math.ceil(rounds.length / 2);

  return (
    <div className="space-y-4">
      {/* Timeline Bar */}
      <Card className="rounded-none border border-default-200 dark:border-default-100/10">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center w-full">
            <h3 className="font-bold flex items-center gap-2">
              <Icon icon="solar:calendar-bold" width={20} />
              Round Timeline
            </h3>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-sm bg-blue-500" />
                <span className="text-default-500">CT Win</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-sm bg-amber-500" />
                <span className="text-default-500">T Win</span>
              </div>
            </div>
          </div>
        </CardHeader>
        <Divider />
        <CardBody className="p-4">
          <ScrollShadow orientation="horizontal" className="w-full">
            <div className="flex gap-1 min-w-max">
              {rounds.map((round, idx) => (
                <React.Fragment key={round.round_number}>
                  {idx === halfIndex && (
                    <div className="flex-shrink-0 w-px bg-default-300 mx-2 self-stretch" />
                  )}
                  <RoundCard
                    round={round}
                    isSelected={round.round_number === currentRound}
                    onClick={() => handleRoundClick(round.round_number)}
                  />
                </React.Fragment>
              ))}
            </div>
          </ScrollShadow>
        </CardBody>
      </Card>

      {/* Selected Round Details */}
      {selectedRoundData && <RoundDetails round={selectedRoundData} />}
    </div>
  );
};

export default RoundTimeline;

/**
 * Match Timeline Component
 * Comprehensive timeline showing rounds, economy, objectives, and key events
 * Per PRD D.4 - Match Timeline Feature
 */

"use client";

import React, { useState, useMemo, useCallback, useRef } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Chip,
  ScrollShadow,
  Tooltip,
  Avatar,
  Tabs,
  Tab,
} from "@nextui-org/react";
import { Icon } from "@iconify/react";
import { motion, AnimatePresence } from "framer-motion";

// ============================================================================
// Types
// ============================================================================

export type MatchEventType =
  | "round_start"
  | "round_end"
  | "kill"
  | "bomb_planted"
  | "bomb_defused"
  | "bomb_exploded"
  | "timeout"
  | "pause"
  | "economy_break"
  | "ace"
  | "clutch"
  | "highlight";

export type TeamSide = "team1" | "team2" | "ct" | "t";

export interface MatchEvent {
  id: string;
  type: MatchEventType;
  timestamp: number; // seconds from match start
  round: number;
  tick?: number;

  // Event details
  title: string;
  description?: string;

  // Involved players
  players?: {
    id: string;
    name: string;
    avatar?: string;
    team: TeamSide;
  }[];

  // For kills
  weapon?: string;
  isHeadshot?: boolean;

  // For economy events
  teamEconomy?: {
    team1: number;
    team2: number;
  };

  // Importance level
  importance: "low" | "medium" | "high" | "critical";

  // Position for minimap
  position?: { x: number; y: number };
}

export interface RoundData {
  number: number;
  startTime: number;
  endTime: number;
  winner: TeamSide;
  winCondition:
    | "elimination"
    | "bomb_exploded"
    | "bomb_defused"
    | "time"
    | "surrender";

  // Score after this round
  score: {
    team1: number;
    team2: number;
  };

  // Economy
  team1StartMoney: number;
  team2StartMoney: number;
  team1Equipment: number;
  team2Equipment: number;

  // Stats
  team1Kills: number;
  team2Kills: number;

  // MVP
  mvp?: {
    id: string;
    name: string;
    reason: string;
  };

  // Events in this round
  events: MatchEvent[];
}

export interface MatchTimelineProps {
  rounds: RoundData[];
  events: MatchEvent[];
  currentTime?: number;
  totalDuration: number;
  team1: {
    name: string;
    logo?: string;
    color?: string;
  };
  team2: {
    name: string;
    logo?: string;
    color?: string;
  };
  onSeekToTime?: (time: number) => void;
  onSeekToRound?: (round: number) => void;
  onEventClick?: (event: MatchEvent) => void;
  className?: string;
}

// ============================================================================
// Constants
// ============================================================================

const EVENT_ICONS: Record<MatchEventType, string> = {
  round_start: "solar:play-circle-bold",
  round_end: "solar:stop-circle-bold",
  kill: "solar:target-bold",
  bomb_planted: "solar:bomb-bold",
  bomb_defused: "solar:shield-check-bold",
  bomb_exploded: "solar:fire-bold",
  timeout: "solar:stopwatch-bold",
  pause: "solar:pause-circle-bold",
  economy_break: "solar:wallet-bold",
  ace: "solar:star-bold",
  clutch: "solar:crown-bold",
  highlight: "solar:bolt-bold",
};

const EVENT_COLORS: Record<MatchEventType, string> = {
  round_start: "default",
  round_end: "default",
  kill: "danger",
  bomb_planted: "warning",
  bomb_defused: "success",
  bomb_exploded: "danger",
  timeout: "default",
  pause: "default",
  economy_break: "primary",
  ace: "warning",
  clutch: "secondary",
  highlight: "primary",
};

const IMPORTANCE_SIZE: Record<string, number> = {
  low: 8,
  medium: 12,
  high: 16,
  critical: 20,
};

// ============================================================================
// Helper Functions
// ============================================================================

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

const formatMoney = (amount: number): string => {
  return `$${amount.toLocaleString()}`;
};

// ============================================================================
// Sub-Components
// ============================================================================

function TimelineRuler({
  totalDuration,
  currentTime,
  rounds,
  onSeekToTime,
}: {
  totalDuration: number;
  currentTime?: number;
  rounds: RoundData[];
  onSeekToTime?: (time: number) => void;
}) {
  const rulerRef = useRef<HTMLDivElement>(null);

  const handleClick = (e: React.MouseEvent) => {
    if (!rulerRef.current || !onSeekToTime) return;
    const rect = rulerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    const time = percentage * totalDuration;
    onSeekToTime(time);
  };

  return (
    <div
      ref={rulerRef}
      className="relative h-8 bg-default-100 rounded-lg cursor-pointer overflow-hidden"
      onClick={handleClick}
    >
      {/* Round markers */}
      {rounds.map((round, index) => {
        const startPercent = (round.startTime / totalDuration) * 100;
        const endPercent = (round.endTime / totalDuration) * 100;
        const width = endPercent - startPercent;

        return (
          <div
            key={round.number}
            className={`absolute top-0 bottom-0 ${
              round.winner === "team1" || round.winner === "ct"
                ? "bg-primary/20"
                : "bg-danger/20"
            }`}
            style={{
              left: `${startPercent}%`,
              width: `${width}%`,
            }}
          >
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-xs font-medium text-default-600">
              {index + 1}
            </span>
          </div>
        );
      })}

      {/* Playhead */}
      {currentTime !== undefined && (
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-primary z-10"
          style={{ left: `${(currentTime / totalDuration) * 100}%` }}
        >
          <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-primary rounded-full" />
        </div>
      )}

      {/* Time markers */}
      {Array.from({ length: Math.ceil(totalDuration / 300) + 1 }).map(
        (_, i) => {
          const time = i * 300;
          const percent = (time / totalDuration) * 100;
          if (percent > 100) return null;

          return (
            <div
              key={i}
              className="absolute bottom-0 text-[10px] text-default-400"
              style={{ left: `${percent}%`, transform: "translateX(-50%)" }}
            >
              {formatTime(time)}
            </div>
          );
        }
      )}
    </div>
  );
}

function RoundCard({
  round,
  team1,
  team2,
  isSelected,
  onClick,
}: {
  round: RoundData;
  team1: { name: string; color?: string };
  team2: { name: string; color?: string };
  isSelected: boolean;
  onClick: () => void;
}) {
  const winnerTeam =
    round.winner === "team1" || round.winner === "ct" ? team1 : team2;
  const winnerColor =
    round.winner === "team1" || round.winner === "ct" ? "primary" : "danger";

  const getWinConditionIcon = () => {
    switch (round.winCondition) {
      case "elimination":
        return "solar:target-bold";
      case "bomb_exploded":
        return "solar:fire-bold";
      case "bomb_defused":
        return "solar:shield-check-bold";
      case "time":
        return "solar:stopwatch-bold";
      case "surrender":
        return "solar:flag-bold";
      default:
        return "solar:check-circle-bold";
    }
  };

  return (
    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
      <Card
        isPressable
        onPress={onClick}
        className={`min-w-[140px] ${isSelected ? "ring-2 ring-primary" : ""}`}
      >
        <CardBody className="p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-default-500">
              Round {round.number}
            </span>
            <Chip size="sm" color={winnerColor} variant="flat">
              {winnerTeam.name}
            </Chip>
          </div>

          <div className="flex items-center justify-center gap-4 text-xl font-bold">
            <span
              className={
                round.winner === "team1" || round.winner === "ct"
                  ? "text-primary"
                  : ""
              }
            >
              {round.score.team1}
            </span>
            <span className="text-default-400">-</span>
            <span
              className={
                round.winner === "team2" || round.winner === "t"
                  ? "text-danger"
                  : ""
              }
            >
              {round.score.team2}
            </span>
          </div>

          <div className="flex items-center justify-center gap-1 text-xs text-default-500">
            <Icon icon={getWinConditionIcon()} className="w-3 h-3" />
            <span className="capitalize">
              {round.winCondition.replace("_", " ")}
            </span>
          </div>

          {round.mvp && (
            <div className="text-xs text-center text-default-400 truncate">
              MVP: {round.mvp.name}
            </div>
          )}
        </CardBody>
      </Card>
    </motion.div>
  );
}

function EconomyChart({
  rounds,
  team1,
  team2,
}: {
  rounds: RoundData[];
  team1: { name: string; color?: string };
  team2: { name: string; color?: string };
}) {
  const maxMoney = Math.max(
    ...rounds.flatMap((r) => [r.team1Equipment, r.team2Equipment])
  );

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-primary">{team1.name}</span>
        <span className="text-danger">{team2.name}</span>
      </div>

      <div className="flex gap-1 h-24">
        {rounds.map((round) => (
          <div key={round.number} className="flex-1 flex flex-col gap-0.5">
            <Tooltip
              content={`R${round.number}: ${team1.name} ${formatMoney(
                round.team1Equipment
              )}`}
            >
              <div
                className="bg-primary/60 rounded-t"
                style={{
                  height: `${(round.team1Equipment / maxMoney) * 100}%`,
                }}
              />
            </Tooltip>
            <Tooltip
              content={`R${round.number}: ${team2.name} ${formatMoney(
                round.team2Equipment
              )}`}
            >
              <div
                className="bg-danger/60 rounded-b"
                style={{
                  height: `${(round.team2Equipment / maxMoney) * 100}%`,
                }}
              />
            </Tooltip>
          </div>
        ))}
      </div>

      <div className="flex justify-between text-xs text-default-400">
        <span>Round 1</span>
        <span>Round {rounds.length}</span>
      </div>
    </div>
  );
}

function EventItem({
  event,
  onClick,
}: {
  event: MatchEvent;
  onClick?: () => void;
}) {
  const size = IMPORTANCE_SIZE[event.importance];
  const color = EVENT_COLORS[event.type];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-start gap-3 p-2 hover:bg-default-100 rounded-lg cursor-pointer transition-colors"
      onClick={onClick}
    >
      <div
        className={`flex-shrink-0 rounded-lg flex items-center justify-center bg-${color}/10`}
        style={{ width: size + 16, height: size + 16 }}
      >
        <Icon
          icon={EVENT_ICONS[event.type]}
          className={`text-${color}`}
          style={{ width: size, height: size }}
        />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm">{event.title}</span>
          <span className="text-xs text-default-400">
            {formatTime(event.timestamp)}
          </span>
        </div>

        {event.description && (
          <p className="text-xs text-default-500 mt-0.5">{event.description}</p>
        )}

        {event.players && event.players.length > 0 && (
          <div className="flex items-center gap-1 mt-1">
            {event.players.map((player) => (
              <Tooltip key={player.id} content={player.name}>
                <Avatar
                  size="sm"
                  src={player.avatar}
                  name={player.name}
                  className="w-5 h-5"
                />
              </Tooltip>
            ))}
          </div>
        )}
      </div>

      <Chip size="sm" variant="flat">
        R{event.round}
      </Chip>
    </motion.div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function MatchTimeline({
  rounds,
  events,
  currentTime,
  totalDuration,
  team1,
  team2,
  onSeekToTime,
  onSeekToRound,
  onEventClick,
  className = "",
}: MatchTimelineProps) {
  const [selectedRound, setSelectedRound] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<"timeline" | "rounds" | "economy">(
    "timeline"
  );
  const [filterType, setFilterType] = useState<MatchEventType | "all">("all");

  // Filter events based on selected round and filter type
  const filteredEvents = useMemo(() => {
    let filtered = events;

    if (selectedRound !== null) {
      filtered = filtered.filter((e) => e.round === selectedRound);
    }

    if (filterType !== "all") {
      filtered = filtered.filter((e) => e.type === filterType);
    }

    return filtered.sort((a, b) => a.timestamp - b.timestamp);
  }, [events, selectedRound, filterType]);

  // Get highlight events (high/critical importance)
  const highlights = useMemo(() => {
    return events.filter(
      (e) => e.importance === "high" || e.importance === "critical"
    );
  }, [events]);

  const handleRoundClick = useCallback(
    (roundNumber: number) => {
      setSelectedRound((prev) => (prev === roundNumber ? null : roundNumber));
      onSeekToRound?.(roundNumber);
    },
    [onSeekToRound]
  );

  return (
    <Card className={className}>
      <CardHeader className="flex flex-col gap-4">
        <div className="flex items-center justify-between w-full">
          <h3 className="text-lg font-semibold">Match Timeline</h3>
          <div className="flex items-center gap-2">
            {selectedRound !== null && (
              <Button
                size="sm"
                variant="flat"
                onClick={() => setSelectedRound(null)}
              >
                Show All Rounds
              </Button>
            )}
          </div>
        </div>

        {/* Timeline ruler */}
        <TimelineRuler
          totalDuration={totalDuration}
          currentTime={currentTime}
          rounds={rounds}
          onSeekToTime={onSeekToTime}
        />

        {/* View mode tabs */}
        <Tabs
          selectedKey={viewMode}
          onSelectionChange={(key) => setViewMode(key as typeof viewMode)}
          size="sm"
          variant="underlined"
          classNames={{
            tabList: "gap-4",
          }}
        >
          <Tab
            key="timeline"
            title={
              <div className="flex items-center gap-2">
                <Icon icon="solar:list-bold" className="w-4 h-4" />
                <span>Events</span>
              </div>
            }
          />
          <Tab
            key="rounds"
            title={
              <div className="flex items-center gap-2">
                <Icon icon="solar:layers-bold" className="w-4 h-4" />
                <span>Rounds</span>
              </div>
            }
          />
          <Tab
            key="economy"
            title={
              <div className="flex items-center gap-2">
                <Icon icon="solar:wallet-bold" className="w-4 h-4" />
                <span>Economy</span>
              </div>
            }
          />
        </Tabs>
      </CardHeader>

      <CardBody className="p-4">
        <AnimatePresence mode="wait">
          {viewMode === "timeline" && (
            <motion.div
              key="timeline"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {/* Event type filter */}
              <div className="flex flex-wrap gap-2">
                <Chip
                  variant={filterType === "all" ? "solid" : "bordered"}
                  color="default"
                  className="cursor-pointer"
                  onClick={() => setFilterType("all")}
                >
                  All ({events.length})
                </Chip>
                {(
                  [
                    "kill",
                    "bomb_planted",
                    "bomb_defused",
                    "ace",
                    "clutch",
                  ] as MatchEventType[]
                ).map((type) => {
                  const count = events.filter((e) => e.type === type).length;
                  if (count === 0) return null;
                  return (
                    <Chip
                      key={type}
                      variant={filterType === type ? "solid" : "bordered"}
                      color={
                        EVENT_COLORS[type] as
                          | "default"
                          | "primary"
                          | "secondary"
                          | "success"
                          | "warning"
                          | "danger"
                      }
                      className="cursor-pointer"
                      onClick={() =>
                        setFilterType((prev) => (prev === type ? "all" : type))
                      }
                    >
                      <div className="flex items-center gap-1">
                        <Icon icon={EVENT_ICONS[type]} className="w-3 h-3" />
                        <span className="capitalize">
                          {type.replace("_", " ")}
                        </span>
                        <span>({count})</span>
                      </div>
                    </Chip>
                  );
                })}
              </div>

              {/* Highlights section */}
              {highlights.length > 0 && filterType === "all" && (
                <div className="p-3 bg-warning/10 rounded-lg border border-warning/20">
                  <h4 className="text-sm font-semibold text-warning mb-2 flex items-center gap-2">
                    <Icon icon="solar:star-bold" className="w-4 h-4" />
                    Highlights ({highlights.length})
                  </h4>
                  <div className="space-y-1">
                    {highlights.slice(0, 5).map((event) => (
                      <EventItem
                        key={event.id}
                        event={event}
                        onClick={() => onEventClick?.(event)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Events list */}
              <ScrollShadow className="max-h-[400px]">
                <div className="space-y-1">
                  {filteredEvents.length === 0 ? (
                    <div className="text-center py-8 text-default-500">
                      No events found
                    </div>
                  ) : (
                    filteredEvents.map((event) => (
                      <EventItem
                        key={event.id}
                        event={event}
                        onClick={() => onEventClick?.(event)}
                      />
                    ))
                  )}
                </div>
              </ScrollShadow>
            </motion.div>
          )}

          {viewMode === "rounds" && (
            <motion.div
              key="rounds"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <ScrollShadow orientation="horizontal" className="pb-4">
                <div className="flex gap-2">
                  {rounds.map((round) => (
                    <RoundCard
                      key={round.number}
                      round={round}
                      team1={team1}
                      team2={team2}
                      isSelected={selectedRound === round.number}
                      onClick={() => handleRoundClick(round.number)}
                    />
                  ))}
                </div>
              </ScrollShadow>

              {/* Selected round details */}
              {selectedRound !== null && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 p-4 bg-default-100 rounded-lg"
                >
                  <h4 className="font-semibold mb-3">
                    Round {selectedRound} Events
                  </h4>
                  <div className="space-y-2">
                    {filteredEvents.length === 0 ? (
                      <p className="text-default-500 text-sm">
                        No events in this round
                      </p>
                    ) : (
                      filteredEvents.map((event) => (
                        <EventItem
                          key={event.id}
                          event={event}
                          onClick={() => onEventClick?.(event)}
                        />
                      ))
                    )}
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}

          {viewMode === "economy" && (
            <motion.div
              key="economy"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              <EconomyChart rounds={rounds} team1={team1} team2={team2} />

              {/* Economy summary */}
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardBody className="p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-3 h-3 rounded-full bg-primary" />
                      <span className="font-medium">{team1.name}</span>
                    </div>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-default-500">Avg Equipment</span>
                        <span>
                          {formatMoney(
                            Math.round(
                              rounds.reduce(
                                (acc, r) => acc + r.team1Equipment,
                                0
                              ) / rounds.length
                            )
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-default-500">Total Kills</span>
                        <span>
                          {rounds.reduce((acc, r) => acc + r.team1Kills, 0)}
                        </span>
                      </div>
                    </div>
                  </CardBody>
                </Card>

                <Card>
                  <CardBody className="p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-3 h-3 rounded-full bg-danger" />
                      <span className="font-medium">{team2.name}</span>
                    </div>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-default-500">Avg Equipment</span>
                        <span>
                          {formatMoney(
                            Math.round(
                              rounds.reduce(
                                (acc, r) => acc + r.team2Equipment,
                                0
                              ) / rounds.length
                            )
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-default-500">Total Kills</span>
                        <span>
                          {rounds.reduce((acc, r) => acc + r.team2Kills, 0)}
                        </span>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardBody>
    </Card>
  );
}

// ============================================================================
// Sample Data Factory
// ============================================================================

export const createSampleRoundData = (): RoundData[] => {
  const rounds: RoundData[] = [];
  let team1Score = 0;
  let team2Score = 0;

  for (let i = 1; i <= 24; i++) {
    const winner = Math.random() > 0.5 ? "team1" : "team2";
    if (winner === "team1") team1Score++;
    else team2Score++;

    const winConditions: RoundData["winCondition"][] = [
      "elimination",
      "bomb_exploded",
      "bomb_defused",
      "time",
    ];

    rounds.push({
      number: i,
      startTime: (i - 1) * 120,
      endTime: i * 120 - 10,
      winner: winner as TeamSide,
      winCondition:
        winConditions[Math.floor(Math.random() * winConditions.length)],
      score: { team1: team1Score, team2: team2Score },
      team1StartMoney: 800 + Math.floor(Math.random() * 15200),
      team2StartMoney: 800 + Math.floor(Math.random() * 15200),
      team1Equipment: 1000 + Math.floor(Math.random() * 28000),
      team2Equipment: 1000 + Math.floor(Math.random() * 28000),
      team1Kills: Math.floor(Math.random() * 5),
      team2Kills: Math.floor(Math.random() * 5),
      mvp:
        Math.random() > 0.3
          ? {
              id: `player-${Math.floor(Math.random() * 10)}`,
              name: `Player${Math.floor(Math.random() * 10)}`,
              reason: Math.random() > 0.5 ? "3 kills" : "clutch",
            }
          : undefined,
      events: [],
    });
  }

  return rounds;
};

export default MatchTimeline;

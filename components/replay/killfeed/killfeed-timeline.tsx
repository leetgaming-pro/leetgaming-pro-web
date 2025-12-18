/**
 * Killfeed Timeline Component
 * Interactive timeline showing kills and events in a replay
 * Per PRD D.3.3 - KillfeedTimeline
 */

"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Chip,
  ScrollShadow,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Input,
  Avatar,
} from "@nextui-org/react";
import { Icon } from "@iconify/react";
import { motion, AnimatePresence } from "framer-motion";

// Event types
export type KillEventType = "kill" | "teamkill" | "suicide" | "world";

export interface KillEvent {
  id: string;
  tick: number;
  timestamp: number; // seconds into match
  round: number;

  // Attacker info
  attackerId?: string;
  attackerName?: string;
  attackerTeam?: "team1" | "team2";
  attackerAvatar?: string;

  // Victim info
  victimId: string;
  victimName: string;
  victimTeam: "team1" | "team2";
  victimAvatar?: string;

  // Kill details
  weapon: string;
  isHeadshot: boolean;
  isPenetration: boolean;
  isBlind: boolean;
  isNoScope: boolean;
  isThroughSmoke: boolean;
  distance?: number; // in units

  // Event type
  type: KillEventType;

  // Position data for map integration
  attackerPosition?: { x: number; y: number };
  victimPosition?: { x: number; y: number };
}

// Round summary
export interface RoundSummary {
  roundNumber: number;
  winner: "team1" | "team2";
  winCondition: "elimination" | "bomb_exploded" | "bomb_defused" | "time";
  team1Kills: number;
  team2Kills: number;
  mvp?: string;
}

interface KillfeedTimelineProps {
  events: KillEvent[];
  rounds: RoundSummary[];
  currentTick: number;
  maxTick: number;
  onSeekToEvent?: (event: KillEvent) => void;
  onSeekToRound?: (roundNumber: number) => void;
  onPlayerClick?: (playerId: string) => void;
  team1Name?: string;
  team2Name?: string;
  highlightedPlayer?: string | null;
}

// Weapon icon mapping
const WEAPON_ICONS: Record<string, string> = {
  // Pistols
  glock: "🔫",
  "usp-s": "🔫",
  p2000: "🔫",
  p250: "🔫",
  "five-seven": "🔫",
  "cz75-auto": "🔫",
  "tec-9": "🔫",
  deagle: "🔫",
  r8: "🔫",

  // SMGs
  "mac-10": "🔫",
  mp9: "🔫",
  mp7: "🔫",
  "mp5-sd": "🔫",
  "ump-45": "🔫",
  p90: "🔫",
  "pp-bizon": "🔫",

  // Rifles
  famas: "🔫",
  "galil-ar": "🔫",
  m4a4: "🔫",
  "m4a1-s": "🔫",
  "ak-47": "🔫",
  aug: "🔫",
  "sg-553": "🔫",

  // Snipers
  "ssg-08": "🎯",
  awp: "🎯",
  g3sg1: "🎯",
  "scar-20": "🎯",

  // Shotguns
  nova: "💥",
  xm1014: "💥",
  "mag-7": "💥",
  "sawed-off": "💥",

  // Machine Guns
  m249: "🔫",
  negev: "🔫",

  // Grenades
  hegrenade: "💣",
  molotov: "🔥",
  incgrenade: "🔥",

  // Melee
  knife: "🔪",

  // Other
  bomb: "💣",
  world: "☠️",
  fall: "⬇️",
};

const getWeaponIcon = (weapon: string): string => {
  const normalized = weapon.toLowerCase().replace(/[^a-z0-9-]/g, "");
  return WEAPON_ICONS[normalized] || "🔫";
};

// Team colors
const TEAM_COLORS = {
  team1: {
    bg: "bg-blue-500/20",
    text: "text-blue-400",
    border: "border-blue-500",
  },
  team2: {
    bg: "bg-orange-500/20",
    text: "text-orange-400",
    border: "border-orange-500",
  },
};

export function KillfeedTimeline({
  events,
  rounds,
  currentTick,
  maxTick: _maxTick,
  onSeekToEvent,
  onSeekToRound,
  onPlayerClick,
  team1Name = "Team 1",
  team2Name = "Team 2",
  highlightedPlayer,
}: KillfeedTimelineProps) {
  const [filterRound, setFilterRound] = useState<number | null>(null);
  const [filterPlayer, setFilterPlayer] = useState<string>("");
  const [filterType, setFilterType] = useState<
    "all" | "headshots" | "noscope" | "blind" | "smoke"
  >("all");
  const [viewMode, setViewMode] = useState<"timeline" | "round" | "stats">(
    "timeline"
  );
  const timelineRef = useRef<HTMLDivElement>(null);

  // Get unique players
  const players = useMemo(() => {
    const playerSet = new Map<
      string,
      { name: string; team: "team1" | "team2"; avatar?: string }
    >();
    events.forEach((e) => {
      if (e.attackerId && e.attackerName) {
        playerSet.set(e.attackerId, {
          name: e.attackerName,
          team: e.attackerTeam || "team1",
          avatar: e.attackerAvatar,
        });
      }
      playerSet.set(e.victimId, {
        name: e.victimName,
        team: e.victimTeam,
        avatar: e.victimAvatar,
      });
    });
    return Array.from(playerSet.entries()).map(([id, data]) => ({
      id,
      ...data,
    }));
  }, [events]);

  // Filter events
  const filteredEvents = useMemo(() => {
    let result = [...events];

    if (filterRound !== null) {
      result = result.filter((e) => e.round === filterRound);
    }

    if (filterPlayer) {
      const query = filterPlayer.toLowerCase();
      result = result.filter(
        (e) =>
          e.attackerName?.toLowerCase().includes(query) ||
          e.victimName.toLowerCase().includes(query)
      );
    }

    switch (filterType) {
      case "headshots":
        result = result.filter((e) => e.isHeadshot);
        break;
      case "noscope":
        result = result.filter((e) => e.isNoScope);
        break;
      case "blind":
        result = result.filter((e) => e.isBlind);
        break;
      case "smoke":
        result = result.filter((e) => e.isThroughSmoke);
        break;
    }

    return result.sort((a, b) => a.tick - b.tick);
  }, [events, filterRound, filterPlayer, filterType]);

  // Group events by round
  const eventsByRound = useMemo(() => {
    const grouped = new Map<number, KillEvent[]>();
    filteredEvents.forEach((event) => {
      const existing = grouped.get(event.round) || [];
      existing.push(event);
      grouped.set(event.round, existing);
    });
    return grouped;
  }, [filteredEvents]);

  // Calculate player stats
  const playerStats = useMemo(() => {
    const stats = new Map<
      string,
      {
        kills: number;
        deaths: number;
        headshots: number;
        assists: number;
        adr: number;
      }
    >();

    events.forEach((e) => {
      // Attacker stats
      if (e.attackerId && e.type === "kill") {
        const existing = stats.get(e.attackerId) || {
          kills: 0,
          deaths: 0,
          headshots: 0,
          assists: 0,
          adr: 0,
        };
        existing.kills++;
        if (e.isHeadshot) existing.headshots++;
        stats.set(e.attackerId, existing);
      }

      // Victim stats
      const victimStats = stats.get(e.victimId) || {
        kills: 0,
        deaths: 0,
        headshots: 0,
        assists: 0,
        adr: 0,
      };
      victimStats.deaths++;
      stats.set(e.victimId, victimStats);
    });

    return stats;
  }, [events]);

  // Auto-scroll to current event
  useEffect(() => {
    if (timelineRef.current && viewMode === "timeline") {
      const currentEvent = filteredEvents.find((e) => e.tick >= currentTick);
      if (currentEvent) {
        const eventElement = document.getElementById(
          `event-${currentEvent.id}`
        );
        if (eventElement) {
          eventElement.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }
    }
  }, [currentTick, filteredEvents, viewMode]);

  // Format timestamp
  const formatTimestamp = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <Card className="w-full h-full">
      <CardHeader className="flex flex-col gap-3 pb-2">
        <div className="flex items-center justify-between w-full">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Icon icon="solar:target-bold" className="text-danger" />
            Kill Feed
          </h3>
          <div className="flex gap-1">
            {(["timeline", "round", "stats"] as const).map((mode) => (
              <Button
                key={mode}
                size="sm"
                variant={viewMode === mode ? "solid" : "flat"}
                color={viewMode === mode ? "primary" : "default"}
                onPress={() => setViewMode(mode)}
                className="capitalize"
              >
                {mode}
              </Button>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 w-full">
          <Dropdown>
            <DropdownTrigger>
              <Button
                size="sm"
                variant="flat"
                endContent={<Icon icon="solar:alt-arrow-down-bold" />}
              >
                {filterRound !== null ? `Round ${filterRound}` : "All Rounds"}
              </Button>
            </DropdownTrigger>
            <DropdownMenu
              onAction={(key) =>
                setFilterRound(key === "all" ? null : Number(key))
              }
              selectedKeys={
                filterRound !== null ? [String(filterRound)] : ["all"]
              }
              items={[
                { key: "all", label: "All Rounds" },
                ...rounds.map((r) => ({
                  key: String(r.roundNumber),
                  label: `Round ${r.roundNumber}`,
                })),
              ]}
            >
              {(item) => (
                <DropdownItem key={item.key}>{item.label}</DropdownItem>
              )}
            </DropdownMenu>
          </Dropdown>

          <Dropdown>
            <DropdownTrigger>
              <Button
                size="sm"
                variant="flat"
                endContent={<Icon icon="solar:alt-arrow-down-bold" />}
              >
                {filterType === "all"
                  ? "All Kills"
                  : filterType.charAt(0).toUpperCase() + filterType.slice(1)}
              </Button>
            </DropdownTrigger>
            <DropdownMenu
              onAction={(key) => setFilterType(key as typeof filterType)}
            >
              <DropdownItem key="all">All Kills</DropdownItem>
              <DropdownItem key="headshots">Headshots</DropdownItem>
              <DropdownItem key="noscope">No-Scopes</DropdownItem>
              <DropdownItem key="blind">While Blind</DropdownItem>
              <DropdownItem key="smoke">Through Smoke</DropdownItem>
            </DropdownMenu>
          </Dropdown>

          <Input
            size="sm"
            placeholder="Search player..."
            value={filterPlayer}
            onValueChange={setFilterPlayer}
            startContent={
              <Icon icon="solar:magnifer-linear" className="text-default-400" />
            }
            className="w-40"
            classNames={{ inputWrapper: "h-8" }}
          />

          <Chip size="sm" variant="flat">
            {filteredEvents.length} kills
          </Chip>
        </div>
      </CardHeader>

      <CardBody className="pt-0">
        <AnimatePresence mode="wait">
          {/* Timeline View */}
          {viewMode === "timeline" && (
            <motion.div
              key="timeline"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <ScrollShadow ref={timelineRef} className="h-[400px]">
                <div className="space-y-1">
                  {filteredEvents.map((event) => {
                    const isCurrent =
                      event.tick <= currentTick &&
                      !filteredEvents.find(
                        (e) => e.tick > event.tick && e.tick <= currentTick
                      );
                    const isHighlighted =
                      highlightedPlayer === event.attackerId ||
                      highlightedPlayer === event.victimId;

                    return (
                      <motion.div
                        key={event.id}
                        id={`event-${event.id}`}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`
                          p-2 rounded-lg cursor-pointer transition-colors
                          ${
                            isCurrent
                              ? "bg-primary/20 border border-primary"
                              : "hover:bg-default-100"
                          }
                          ${isHighlighted ? "ring-2 ring-warning" : ""}
                        `}
                        onClick={() => onSeekToEvent?.(event)}
                      >
                        <div className="flex items-center gap-2">
                          {/* Timestamp */}
                          <span className="text-xs text-default-500 min-w-[45px]">
                            {formatTimestamp(event.timestamp)}
                          </span>

                          {/* Round badge */}
                          <Chip
                            size="sm"
                            variant="flat"
                            className="min-w-[50px] text-center"
                          >
                            R{event.round}
                          </Chip>

                          {/* Attacker */}
                          {event.attackerName && event.type === "kill" && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (event.attackerId) {
                                  onPlayerClick?.(event.attackerId);
                                }
                              }}
                              className={`flex items-center gap-1 px-2 py-0.5 rounded ${
                                TEAM_COLORS[event.attackerTeam || "team1"].bg
                              }`}
                            >
                              {event.attackerAvatar && (
                                <Avatar
                                  src={event.attackerAvatar}
                                  size="sm"
                                  className="w-5 h-5"
                                />
                              )}
                              <span
                                className={`text-sm font-medium ${
                                  TEAM_COLORS[event.attackerTeam || "team1"]
                                    .text
                                }`}
                              >
                                {event.attackerName}
                              </span>
                            </button>
                          )}

                          {/* Kill info */}
                          <div className="flex items-center gap-1">
                            <span className="text-lg">
                              {getWeaponIcon(event.weapon)}
                            </span>
                            {event.isHeadshot && (
                              <Chip
                                size="sm"
                                color="danger"
                                variant="flat"
                                className="h-5"
                              >
                                HS
                              </Chip>
                            )}
                            {event.isNoScope && (
                              <Chip
                                size="sm"
                                color="warning"
                                variant="flat"
                                className="h-5"
                              >
                                NS
                              </Chip>
                            )}
                            {event.isBlind && (
                              <Chip
                                size="sm"
                                color="secondary"
                                variant="flat"
                                className="h-5"
                              >
                                ⚡
                              </Chip>
                            )}
                            {event.isThroughSmoke && (
                              <Chip
                                size="sm"
                                color="default"
                                variant="flat"
                                className="h-5"
                              >
                                💨
                              </Chip>
                            )}
                          </div>

                          {/* Victim */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onPlayerClick?.(event.victimId);
                            }}
                            className={`flex items-center gap-1 px-2 py-0.5 rounded ${
                              TEAM_COLORS[event.victimTeam].bg
                            }`}
                          >
                            {event.victimAvatar && (
                              <Avatar
                                src={event.victimAvatar}
                                size="sm"
                                className="w-5 h-5"
                              />
                            )}
                            <span
                              className={`text-sm font-medium ${
                                TEAM_COLORS[event.victimTeam].text
                              }`}
                            >
                              {event.victimName}
                            </span>
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}

                  {filteredEvents.length === 0 && (
                    <div className="text-center py-8 text-default-500">
                      <Icon
                        icon="solar:target-bold-duotone"
                        className="w-12 h-12 mx-auto mb-2 opacity-50"
                      />
                      <p>No kills match the current filters</p>
                    </div>
                  )}
                </div>
              </ScrollShadow>
            </motion.div>
          )}

          {/* Round View */}
          {viewMode === "round" && (
            <motion.div
              key="round"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <ScrollShadow className="h-[400px]">
                <div className="space-y-4">
                  {rounds.map((round) => {
                    const roundEvents =
                      eventsByRound.get(round.roundNumber) || [];
                    return (
                      <Card key={round.roundNumber} className="bg-default-50">
                        <CardBody className="gap-2">
                          <div
                            className="flex items-center justify-between cursor-pointer"
                            onClick={() => onSeekToRound?.(round.roundNumber)}
                          >
                            <div className="flex items-center gap-3">
                              <Chip
                                color={
                                  round.winner === "team1"
                                    ? "primary"
                                    : "warning"
                                }
                                variant="flat"
                              >
                                Round {round.roundNumber}
                              </Chip>
                              <span className="text-sm text-default-600">
                                {round.winner === "team1"
                                  ? team1Name
                                  : team2Name}{" "}
                                wins
                              </span>
                              <Chip size="sm" variant="flat">
                                {round.winCondition.replace("_", " ")}
                              </Chip>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-blue-400">
                                {round.team1Kills}K
                              </span>
                              <span className="text-default-400">-</span>
                              <span className="text-orange-400">
                                {round.team2Kills}K
                              </span>
                            </div>
                          </div>

                          {roundEvents.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2 pt-2 border-t border-divider">
                              {roundEvents.map((event) => (
                                <Chip
                                  key={event.id}
                                  size="sm"
                                  variant="flat"
                                  className={
                                    TEAM_COLORS[event.attackerTeam || "team1"]
                                      .bg
                                  }
                                  onClick={() => onSeekToEvent?.(event)}
                                >
                                  {event.attackerName} → {event.victimName}
                                  {event.isHeadshot && " 🎯"}
                                </Chip>
                              ))}
                            </div>
                          )}
                        </CardBody>
                      </Card>
                    );
                  })}
                </div>
              </ScrollShadow>
            </motion.div>
          )}

          {/* Stats View */}
          {viewMode === "stats" && (
            <motion.div
              key="stats"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <ScrollShadow className="h-[400px]">
                <table className="w-full">
                  <thead className="sticky top-0 bg-background z-10">
                    <tr className="text-xs text-default-500 border-b border-divider">
                      <th className="text-left py-2 px-2">Player</th>
                      <th className="text-center py-2 px-2">K</th>
                      <th className="text-center py-2 px-2">D</th>
                      <th className="text-center py-2 px-2">+/-</th>
                      <th className="text-center py-2 px-2">HS%</th>
                    </tr>
                  </thead>
                  <tbody>
                    {players
                      .map((player) => ({
                        ...player,
                        stats: playerStats.get(player.id) || {
                          kills: 0,
                          deaths: 0,
                          headshots: 0,
                          assists: 0,
                          adr: 0,
                        },
                      }))
                      .sort(
                        (a, b) =>
                          b.stats.kills -
                          b.stats.deaths -
                          (a.stats.kills - a.stats.deaths)
                      )
                      .map((player) => {
                        const kd = player.stats.kills - player.stats.deaths;
                        const hsPercent =
                          player.stats.kills > 0
                            ? Math.round(
                                (player.stats.headshots / player.stats.kills) *
                                  100
                              )
                            : 0;

                        return (
                          <tr
                            key={player.id}
                            className={`
                              border-b border-divider hover:bg-default-100 cursor-pointer
                              ${
                                highlightedPlayer === player.id
                                  ? "bg-warning/20"
                                  : ""
                              }
                            `}
                            onClick={() => onPlayerClick?.(player.id)}
                          >
                            <td className="py-2 px-2">
                              <div className="flex items-center gap-2">
                                {player.avatar && (
                                  <Avatar
                                    src={player.avatar}
                                    size="sm"
                                    className="w-6 h-6"
                                  />
                                )}
                                <span
                                  className={`text-sm font-medium ${
                                    TEAM_COLORS[player.team].text
                                  }`}
                                >
                                  {player.name}
                                </span>
                              </div>
                            </td>
                            <td className="text-center py-2 px-2 font-semibold">
                              {player.stats.kills}
                            </td>
                            <td className="text-center py-2 px-2">
                              {player.stats.deaths}
                            </td>
                            <td
                              className={`text-center py-2 px-2 font-semibold ${
                                kd > 0
                                  ? "text-success"
                                  : kd < 0
                                  ? "text-danger"
                                  : ""
                              }`}
                            >
                              {kd > 0 ? `+${kd}` : kd}
                            </td>
                            <td className="text-center py-2 px-2">
                              {hsPercent}%
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </ScrollShadow>
            </motion.div>
          )}
        </AnimatePresence>
      </CardBody>
    </Card>
  );
}

export default KillfeedTimeline;

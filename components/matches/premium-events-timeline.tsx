"use client";

/**
 * Premium Events Timeline Component
 * Round-by-round events with timeline visualization and filtering
 */

import React, { useState, useMemo } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Chip,
  Avatar,
  Button,
  Skeleton,
  Tooltip,
  Tabs,
  Tab,
} from "@nextui-org/react";
import { Icon } from "@iconify/react";
import clsx from "clsx";
import { electrolize } from "@/config/fonts";
import { MatchEventsResponse, MatchKillEvent } from "@/types/replay-api/match-analytics.sdk";

interface PremiumEventsTimelineProps {
  events: MatchEventsResponse | null;
  loading: boolean;
  matchId: string;
  gameId: string;
  onWatchTick?: (tick: number) => void;
}

// Event type configurations
const EVENT_CONFIG: Record<string, { icon: string; color: string; bgColor: string; label: string }> = {
  kill: { icon: "solar:target-bold", color: "text-[#FF4654]", bgColor: "bg-[#FF4654]", label: "Kill" },
  round_start: { icon: "solar:play-circle-bold", color: "text-[#DCFF37]", bgColor: "bg-[#DCFF37]", label: "Round Start" },
  round_end: { icon: "solar:stop-circle-bold", color: "text-[#34445C]", bgColor: "bg-[#34445C]", label: "Round End" },
  bomb_plant: { icon: "solar:bomb-bold", color: "text-[#FFC700]", bgColor: "bg-[#FFC700]", label: "Bomb Plant" },
  bomb_defuse: { icon: "solar:shield-check-bold", color: "text-[#00A8FF]", bgColor: "bg-[#00A8FF]", label: "Bomb Defuse" },
  weapon_fire: { icon: "solar:pistol-bold", color: "text-default-400", bgColor: "bg-default-400", label: "Weapon Fire" },
  hit: { icon: "solar:danger-bold", color: "text-orange-500", bgColor: "bg-orange-500", label: "Hit" },
};

// Weapon icons
const WEAPON_ICONS: Record<string, string> = {
  "ak-47": "🔫", "ak47": "🔫", "m4a4": "🔫", "m4a1-s": "🔫", "m4a1_silencer": "🔫",
  "awp": "🎯", "usp-s": "🔫", "usp_silencer": "🔫", "glock-18": "🔫", "glock": "🔫",
  "desert eagle": "🔫", "deagle": "🔫", "knife": "🔪", "c4": "💣",
  "he grenade": "💥", "hegrenade": "💥", "flashbang": "⚡", 
  "smoke grenade": "💨", "smokegrenade": "💨", "molotov": "🔥", "incgrenade": "🔥",
};

interface TimelineEvent {
  type: "kill" | "round_start" | "round_end" | "bomb_plant" | "bomb_defuse";
  tick: number;
  round_number?: number;
  data: unknown;
}

export function PremiumEventsTimeline({
  events,
  loading,
  matchId: _matchId,
  gameId: _gameId,
  onWatchTick,
}: PremiumEventsTimelineProps) {
  const [selectedRound, setSelectedRound] = useState<number | "all">("all");
  const [viewMode, setViewMode] = useState<"timeline" | "killfeed" | "rounds">("timeline");
  const [expandedRounds, setExpandedRounds] = useState<Set<number>>(new Set([1]));

  // Get available rounds
  const roundOptions = useMemo(() => {
    if (!events) return [];
    const rounds = new Set<number>();
    events.kills?.forEach(k => { if (k.round_number) rounds.add(k.round_number); });
    events.round_starts?.forEach(r => { if (r.round_number) rounds.add(r.round_number); });
    events.round_ends?.forEach(r => { if (r.round_number) rounds.add(r.round_number); });
    return Array.from(rounds).sort((a, b) => a - b);
  }, [events]);

  // Combine all events into timeline
  const allEvents = useMemo(() => {
    if (!events) return [];
    
    let combined: TimelineEvent[] = [
      ...(events.kills || []).map(k => ({ type: "kill" as const, tick: k.tick, round_number: k.round_number, data: k })),
      ...(events.round_starts || []).map(r => ({ type: "round_start" as const, tick: r.tick, round_number: r.round_number, data: r })),
      ...(events.round_ends || []).map(r => ({ type: "round_end" as const, tick: r.tick, round_number: r.round_number, data: r })),
      ...(events.bomb_plants || []).map(b => ({ type: "bomb_plant" as const, tick: b.tick, round_number: b.round_number, data: b })),
      ...(events.bomb_defuses || []).map(b => ({ type: "bomb_defuse" as const, tick: b.tick, round_number: b.round_number, data: b })),
    ].sort((a, b) => a.tick - b.tick);
    
    // Filter by round if selected
    if (selectedRound !== "all") {
      combined = combined.filter(e => e.round_number === selectedRound);
    }
    
    return combined;
  }, [events, selectedRound]);

  // Group events by round
  const eventsByRound = useMemo(() => {
    const grouped: Record<number, TimelineEvent[]> = {};
    allEvents.forEach(e => {
      const round = e.round_number || 0;
      if (!grouped[round]) grouped[round] = [];
      grouped[round].push(e);
    });
    return grouped;
  }, [allEvents]);

  // Kill stats
  const killStats = useMemo(() => {
    if (!events?.kills) return { total: 0, headshots: 0, wallbangs: 0, throughSmoke: 0 };
    const kills = events.kills;
    return {
      total: kills.length,
      headshots: kills.filter(k => k.headshot).length,
      wallbangs: kills.filter(k => k.wallbang).length,
      throughSmoke: kills.filter(k => k.through_smoke).length,
    };
  }, [events]);

  const toggleRound = (round: number) => {
    const newExpanded = new Set(expandedRounds);
    if (newExpanded.has(round)) {
      newExpanded.delete(round);
    } else {
      newExpanded.add(round);
    }
    setExpandedRounds(newExpanded);
  };

  if (loading) {
    return (
      <Card className="bg-gradient-to-br from-background/80 to-background/60 backdrop-blur-xl border border-[#FF4654]/20 dark:border-[#DCFF37]/20">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <Icon icon="solar:list-bold" width={20} className="text-[#FF4654] dark:text-[#DCFF37]" />
            <h2 className={clsx("text-lg font-bold uppercase tracking-wide", electrolize.className)}>
              Loading Events...
            </h2>
          </div>
        </CardHeader>
        <CardBody>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex gap-4 animate-pulse">
                <Skeleton className="w-4 h-4 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-1/4 rounded" />
                  <Skeleton className="h-3 w-1/2 rounded" />
                </div>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>
    );
  }

  if (!events?.kills?.length) {
    return (
      <Card className="bg-gradient-to-br from-background/80 to-background/60 backdrop-blur-xl border border-[#FF4654]/20 dark:border-[#DCFF37]/20">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <Icon icon="solar:list-bold" width={20} className="text-[#FF4654] dark:text-[#DCFF37]" />
            <h2 className={clsx("text-lg font-bold uppercase tracking-wide", electrolize.className)}>
              Match Events Timeline
            </h2>
          </div>
        </CardHeader>
        <CardBody>
          <div className="text-center py-16">
            <div className="relative w-24 h-24 mx-auto mb-6">
              <div className="absolute inset-0 bg-gradient-to-br from-[#FF4654]/20 to-[#DCFF37]/20 rounded-full blur-xl animate-pulse" />
              <div className="relative w-24 h-24 bg-gradient-to-br from-[#FF4654]/10 to-[#DCFF37]/10 rounded-full flex items-center justify-center">
                <Icon icon="solar:list-line-duotone" width={48} className="text-default-300" />
              </div>
            </div>
            <p className={clsx("text-2xl font-black text-default-500 mb-3", electrolize.className)}>
              No Events Available
            </p>
            <p className="text-sm text-default-400">
              Event timeline will appear once the replay is processed
            </p>
          </div>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-background/80 to-background/60 backdrop-blur-xl border border-[#FF4654]/20 dark:border-[#DCFF37]/20">
      <CardHeader className="pb-4">
        <div className="flex flex-col gap-4 w-full">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <div className="relative">
                <div className="absolute inset-0 bg-[#FF4654] blur-lg opacity-50 animate-pulse" />
                <Icon icon="solar:list-bold" width={24} className="relative text-[#FF4654] dark:text-[#DCFF37]" />
              </div>
              <h2 className={clsx("text-lg font-bold uppercase tracking-wide", electrolize.className)}>
                Match Events Timeline
              </h2>
            </div>
            
            {/* Stats Summary */}
            <div className="flex items-center gap-2">
              <Chip size="sm" variant="flat" color="danger" startContent={<Icon icon="solar:target-bold" width={12} />}>
                {killStats.total} kills
              </Chip>
              {killStats.headshots > 0 && (
                <Chip size="sm" variant="flat" color="success" startContent={<Icon icon="solar:target-bold" width={12} />}>
                  {killStats.headshots} HS
                </Chip>
              )}
              {killStats.wallbangs > 0 && (
                <Chip size="sm" variant="flat" color="secondary" startContent={<Icon icon="solar:shield-bold" width={12} />}>
                  {killStats.wallbangs} WB
                </Chip>
              )}
            </div>
          </div>
          
          {/* View Mode & Round Filter */}
          <div className="flex items-center justify-between flex-wrap gap-4">
            <Tabs
              selectedKey={viewMode}
              onSelectionChange={(key) => setViewMode(key as typeof viewMode)}
              size="sm"
              variant="bordered"
              classNames={{
                tabList: "gap-2 bg-transparent",
                tab: "px-3",
              }}
            >
              <Tab 
                key="timeline" 
                title={
                  <div className="flex items-center gap-1">
                    <Icon icon="solar:timeline-horizontal-bold" width={14} />
                    <span>Timeline</span>
                  </div>
                } 
              />
              <Tab 
                key="killfeed" 
                title={
                  <div className="flex items-center gap-1">
                    <Icon icon="solar:target-bold" width={14} />
                    <span>Kill Feed</span>
                  </div>
                } 
              />
              <Tab 
                key="rounds" 
                title={
                  <div className="flex items-center gap-1">
                    <Icon icon="solar:layers-bold" width={14} />
                    <span>By Round</span>
                  </div>
                } 
              />
            </Tabs>
            
            <select
              className="bg-background/60 border border-[#FF4654]/20 dark:border-[#DCFF37]/20 rounded-none px-3 py-1.5 text-sm text-foreground focus:outline-none focus:border-[#FF4654] dark:focus:border-[#DCFF37]"
              value={selectedRound}
              onChange={(e) => setSelectedRound(e.target.value === "all" ? "all" : Number(e.target.value))}
            >
              <option value="all">All Rounds ({roundOptions.length})</option>
              {roundOptions.map(roundNum => (
                <option key={roundNum} value={roundNum}>
                  Round {roundNum}
                </option>
              ))}
            </select>
          </div>
        </div>
      </CardHeader>
      
      <CardBody className="pt-0">
        {/* TIMELINE VIEW */}
        {viewMode === "timeline" && (
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[#FF4654] via-[#FFC700] to-[#DCFF37]" />
            
            <div className="space-y-3">
              {allEvents.slice(0, 100).map((event, idx) => {
                const config = EVENT_CONFIG[event.type] || EVENT_CONFIG.kill;
                
                return (
                  <div 
                    key={`${event.type}-${event.tick}-${idx}`} 
                    className="relative flex items-start gap-4 pl-12 group"
                  >
                    {/* Timeline dot */}
                    <div className={clsx(
                      "absolute left-4 w-4 h-4 rounded-full border-2 border-background transition-transform group-hover:scale-125",
                      config.bgColor
                    )} />
                    
                    <div className={clsx(
                      "flex-1 p-3 rounded-none transition-all",
                      "bg-gradient-to-r from-background/60 to-background/40",
                      "border border-[#FF4654]/20 dark:border-[#DCFF37]/20 hover:border-[#FF4654]/40 dark:hover:border-[#DCFF37]/40",
                      "hover:shadow-lg hover:shadow-default/10"
                    )}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <Icon icon={config.icon} width={16} className={config.color} />
                          <span className={clsx("text-sm font-semibold uppercase", electrolize.className)}>
                            {config.label}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={clsx("text-xs text-default-400 font-mono", electrolize.className)}>
                            R{event.round_number || "?"}
                          </span>
                          <span className="text-xs text-default-300">•</span>
                          <span className="text-xs text-default-400 font-mono">
                            T{event.tick}
                          </span>
                          <Button
                            isIconOnly
                            size="sm"
                            variant="light"
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => onWatchTick?.(event.tick)}
                          >
                            <Icon icon="solar:play-bold" width={12} />
                          </Button>
                        </div>
                      </div>
                      
                      {/* Event-specific content */}
                      {event.type === "kill" && (() => {
                        const kill = event.data as MatchKillEvent;
                        return (
                          <div className="flex items-center gap-2 text-sm mt-1">
                            <Avatar size="sm" name={kill.killer_name?.[0] || "?"} classNames={{ base: "bg-[#00A8FF]/30 w-6 h-6" }} />
                            <span className="font-semibold text-[#00A8FF]">{kill.killer_name || "?"}</span>
                            <div className="flex items-center gap-1 px-2">
                              {kill.headshot && <Tooltip content="Headshot"><span className="text-[#FF4654]">💀</span></Tooltip>}
                              {kill.wallbang && <Tooltip content="Wallbang"><span>🧱</span></Tooltip>}
                              {kill.through_smoke && <Tooltip content="Through Smoke"><span>💨</span></Tooltip>}
                              <span className="text-default-400">{WEAPON_ICONS[kill.weapon?.toLowerCase()] || "🔫"}</span>
                            </div>
                            <span className="font-semibold text-[#FFB800]">{kill.victim_name || "?"}</span>
                            <Avatar size="sm" name={kill.victim_name?.[0] || "?"} classNames={{ base: "bg-[#FFB800]/30 w-6 h-6" }} />
                            {kill.weapon && (
                              <Chip size="sm" variant="flat" className="ml-auto text-[10px]">
                                {kill.weapon}
                              </Chip>
                            )}
                          </div>
                        );
                      })()}
                      
                      {event.type === "bomb_plant" && (() => {
                        const plant = event.data as { site?: string };
                        return (
                          <p className="text-sm text-[#FFC700] mt-1 flex items-center gap-2">
                            <Icon icon="solar:bomb-bold" width={14} />
                            Bomb planted at Site {plant.site || "?"}
                          </p>
                        );
                      })()}
                      
                      {event.type === "bomb_defuse" && (
                        <p className="text-sm text-[#00A8FF] mt-1 flex items-center gap-2">
                          <Icon icon="solar:shield-check-bold" width={14} />
                          Bomb defused successfully!
                        </p>
                      )}
                      
                      {event.type === "round_end" && (() => {
                        const round = event.data as { winner_team?: string; reason?: string };
                        return (
                          <p className="text-sm mt-1">
                            Winner: <span className={clsx(
                              "font-bold",
                              round.winner_team === "CT" ? "text-[#00A8FF]" : "text-[#FFB800]"
                            )}>{round.winner_team || "?"}</span>
                            {round.reason && <span className="text-default-400 ml-2">({round.reason})</span>}
                          </p>
                        );
                      })()}
                    </div>
                  </div>
                );
              })}
            </div>
            
            {allEvents.length > 100 && (
              <div className="text-center mt-6 pt-4 border-t border-default-200/30">
                <Chip variant="flat" color="default">
                  + {allEvents.length - 100} more events
                </Chip>
              </div>
            )}
          </div>
        )}

        {/* KILL FEED VIEW */}
        {viewMode === "killfeed" && (
          <div className="space-y-2">
            {(events.kills || [])
              .filter(k => selectedRound === "all" || k.round_number === selectedRound)
              .map((kill, idx) => (
              <div 
                key={`kill-${kill.tick}-${idx}`}
                className={clsx(
                  "flex items-center gap-3 p-3 rounded-none transition-all",
                  "bg-gradient-to-r from-[#FF4654]/5 to-transparent",
                  "border border-[#FF4654]/20 hover:border-[#FF4654]/40",
                  "hover:shadow-lg hover:shadow-[#FF4654]/10 group"
                )}
              >
                {/* Round Badge */}
                <div className={clsx(
                  "w-10 h-10 rounded-none flex items-center justify-center",
                  "bg-gradient-to-br from-[#FF4654]/20 to-[#FF4654]/5",
                  "border border-[#FF4654]/30"
                )}>
                  <span className={clsx("text-xs font-black text-[#FF4654]", electrolize.className)}>
                    R{kill.round_number || "?"}
                  </span>
                </div>
                
                {/* Killer */}
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <Avatar
                    size="sm"
                    name={kill.killer_name?.[0] || "?"}
                    classNames={{ base: "bg-[#00A8FF]/30" }}
                  />
                  <span className="font-semibold text-[#00A8FF] truncate">
                    {kill.killer_name || "Unknown"}
                  </span>
                </div>
                
                {/* Kill Method */}
                <div className="flex items-center gap-2 px-4 py-1 bg-black/30 rounded-none">
                  {kill.headshot && (
                    <Tooltip content="Headshot">
                      <Icon icon="solar:target-bold" width={14} className="text-[#FF4654]" />
                    </Tooltip>
                  )}
                  {kill.wallbang && (
                    <Tooltip content="Wallbang">
                      <Icon icon="solar:shield-minimalistic-bold" width={14} className="text-[#7B61FF]" />
                    </Tooltip>
                  )}
                  {kill.through_smoke && (
                    <Tooltip content="Through Smoke">
                      <Icon icon="solar:fog-bold" width={14} className="text-default-400" />
                    </Tooltip>
                  )}
                  <span className="text-default-400 text-lg">
                    {WEAPON_ICONS[kill.weapon?.toLowerCase()] || "🔫"}
                  </span>
                  <span className="text-xs text-default-400 font-mono ml-1">
                    {kill.weapon || "?"}
                  </span>
                </div>
                
                {/* Victim */}
                <div className="flex items-center gap-2 flex-1 min-w-0 justify-end">
                  <span className="font-semibold text-[#FFB800] truncate">
                    {kill.victim_name || "Unknown"}
                  </span>
                  <Avatar
                    size="sm"
                    name={kill.victim_name?.[0] || "?"}
                    classNames={{ base: "bg-[#FFB800]/30" }}
                  />
                </div>
                
                {/* Watch Button */}
                <Button
                  isIconOnly
                  size="sm"
                  variant="light"
                  color="danger"
                  className="opacity-50 group-hover:opacity-100 transition-opacity"
                  onClick={() => onWatchTick?.(kill.tick)}
                >
                  <Icon icon="solar:play-bold" width={14} />
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* ROUNDS VIEW */}
        {viewMode === "rounds" && (
          <div className="space-y-4">
            {roundOptions.map(roundNum => {
              const roundEvents = eventsByRound[roundNum] || [];
              const roundKills = roundEvents.filter(e => e.type === "kill");
              const roundEnd = roundEvents.find(e => e.type === "round_end");
              const winnerTeam = (roundEnd?.data as { winner_team?: string })?.winner_team;
              const isExpanded = expandedRounds.has(roundNum);
              
              return (
                <div 
                  key={roundNum}
                  className={clsx(
                    "rounded-none transition-all duration-300 overflow-hidden",
                    "border border-[#FF4654]/20 dark:border-[#DCFF37]/20",
                    isExpanded ? "bg-gradient-to-br from-background/80 to-background/40" : "bg-background/40"
                  )}
                >
                  {/* Round Header */}
                  <button
                    className="w-full flex items-center justify-between p-4 hover:bg-default-100/20 transition-colors"
                    onClick={() => toggleRound(roundNum)}
                  >
                    <div className="flex items-center gap-4">
                      <div className={clsx(
                        "w-12 h-12 rounded-none flex items-center justify-center",
                        "bg-gradient-to-br",
                        winnerTeam === "CT" ? "from-[#00A8FF]/30 to-[#00A8FF]/10 border border-[#00A8FF]/30" :
                        winnerTeam === "T" ? "from-[#FFB800]/30 to-[#FFB800]/10 border border-[#FFB800]/30" :
                        "from-default-200/30 to-default-200/10 border border-default-200/30"
                      )}>
                        <span className={clsx(
                          "text-lg font-black",
                          electrolize.className,
                          winnerTeam === "CT" ? "text-[#00A8FF]" :
                          winnerTeam === "T" ? "text-[#FFB800]" : "text-default-500"
                        )}>
                          {roundNum}
                        </span>
                      </div>
                      <div className="text-left">
                        <p className={clsx("font-bold", electrolize.className)}>
                          Round {roundNum}
                        </p>
                        <p className="text-sm text-default-400">
                          {roundKills.length} kills • Winner: {winnerTeam || "?"}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="flex -space-x-2">
                        {roundKills.slice(0, 3).map((k, i) => {
                          const kill = k.data as MatchKillEvent;
                          return (
                            <Tooltip key={i} content={`${kill.killer_name} → ${kill.victim_name}`}>
                              <Avatar
                                size="sm"
                                name={kill.killer_name?.[0] || "?"}
                                classNames={{ base: "border-2 border-background" }}
                              />
                            </Tooltip>
                          );
                        })}
                        {roundKills.length > 3 && (
                          <div className="w-8 h-8 rounded-full bg-default-200 border-2 border-background flex items-center justify-center">
                            <span className="text-xs font-bold">+{roundKills.length - 3}</span>
                          </div>
                        )}
                      </div>
                      <Icon 
                        icon={isExpanded ? "solar:alt-arrow-up-bold" : "solar:alt-arrow-down-bold"} 
                        width={20} 
                        className="text-default-400"
                      />
                    </div>
                  </button>
                  
                  {/* Round Events */}
                  {isExpanded && roundEvents.length > 0 && (
                    <div className="px-4 pb-4 pt-2 border-t border-default-200/20">
                      <div className="space-y-2">
                        {roundEvents.map((event, idx) => {
                          const config = EVENT_CONFIG[event.type] || EVENT_CONFIG.kill;
                          
                          if (event.type === "kill") {
                            const kill = event.data as MatchKillEvent;
                            return (
                              <div 
                                key={idx}
                                className="flex items-center gap-2 p-2 rounded-none bg-black/20 group"
                              >
                                <Icon icon={config.icon} width={14} className={config.color} />
                                <span className="font-semibold text-[#00A8FF] text-sm">{kill.killer_name}</span>
                                <span className="text-default-400">{WEAPON_ICONS[kill.weapon?.toLowerCase()] || "🔫"}</span>
                                <span className="font-semibold text-[#FFB800] text-sm">{kill.victim_name}</span>
                                {kill.headshot && <Icon icon="solar:target-bold" width={12} className="text-[#FF4654] ml-auto" />}
                                <Button
                                  isIconOnly
                                  size="sm"
                                  variant="light"
                                  className="opacity-0 group-hover:opacity-100"
                                  onClick={() => onWatchTick?.(kill.tick)}
                                >
                                  <Icon icon="solar:play-bold" width={12} />
                                </Button>
                              </div>
                            );
                          }
                          
                          return (
                            <div 
                              key={idx}
                              className="flex items-center gap-2 p-2 rounded-lg bg-black/10 text-sm"
                            >
                              <Icon icon={config.icon} width={14} className={config.color} />
                              <span className="text-default-400">{config.label}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardBody>
    </Card>
  );
}

export default PremiumEventsTimeline;

"use client";

/**
 * Premium Rounds Timeline Component
 * Award-winning esports branding with round-by-round visualization
 */

import React, { useState, useMemo } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Chip,
  Avatar,
  Skeleton,
  Tooltip,
} from "@nextui-org/react";
import { Icon } from "@iconify/react";
import clsx from "clsx";
import { electrolize } from "@/config/fonts";
import { MatchEventsResponse, MatchKillEvent } from "@/types/replay-api/match-analytics.sdk";
import { EsportsButton } from "@/components/ui/esports-button";

interface PremiumRoundsTimelineProps {
  events: MatchEventsResponse | null;
  loading: boolean;
  matchId: string;
  gameId: string;
  onWatchRound?: (round: number) => void;
}

// Weapon icons for killfeed
const WEAPON_ICONS: Record<string, string> = {
  "ak-47": "🔫", "ak47": "🔫", "m4a4": "🔫", "m4a1-s": "🔫", "m4a1_silencer": "🔫",
  "awp": "🎯", "usp-s": "🔫", "usp_silencer": "🔫", "glock-18": "🔫", "glock": "🔫",
  "desert eagle": "🔫", "deagle": "🔫", "knife": "🔪", "c4": "💣",
  "he grenade": "💥", "hegrenade": "💥", "flashbang": "⚡", 
  "smoke grenade": "💨", "smokegrenade": "💨", "molotov": "🔥", "incgrenade": "🔥",
};

interface RoundSummary {
  round_number: number;
  winner_team: "CT" | "T" | null;
  kills: MatchKillEvent[];
  bomb_planted: boolean;
  bomb_defused: boolean;
  reason?: string;
}

export function PremiumRoundsTimeline({
  events,
  loading,
  matchId: _matchId,
  gameId: _gameId,
  onWatchRound,
}: PremiumRoundsTimelineProps) {
  const [selectedRound, setSelectedRound] = useState<number | null>(null);
  const [expandedRound, setExpandedRound] = useState<number | null>(1);

  // Build round summaries from events
  const roundSummaries = useMemo(() => {
    if (!events) return [];
    
    const summaries: Map<number, RoundSummary> = new Map();
    
    // Initialize rounds from round_ends
    events.round_ends?.forEach(re => {
      if (re.round_number) {
        summaries.set(re.round_number, {
          round_number: re.round_number,
          winner_team: re.winner_team as "CT" | "T" || null,
          kills: [],
          bomb_planted: false,
          bomb_defused: false,
          reason: re.reason,
        });
      }
    });
    
    // Add kills to rounds
    events.kills?.forEach(k => {
      if (k.round_number) {
        const summary = summaries.get(k.round_number);
        if (summary) {
          summary.kills.push(k);
        } else {
          summaries.set(k.round_number, {
            round_number: k.round_number,
            winner_team: null,
            kills: [k],
            bomb_planted: false,
            bomb_defused: false,
          });
        }
      }
    });
    
    // Mark bomb plants
    events.bomb_plants?.forEach(bp => {
      if (bp.round_number) {
        const summary = summaries.get(bp.round_number);
        if (summary) summary.bomb_planted = true;
      }
    });
    
    // Mark bomb defuses
    events.bomb_defuses?.forEach(bd => {
      if (bd.round_number) {
        const summary = summaries.get(bd.round_number);
        if (summary) summary.bomb_defused = true;
      }
    });
    
    return Array.from(summaries.values()).sort((a, b) => a.round_number - b.round_number);
  }, [events]);

  // Score tracker
  const scores = useMemo(() => {
    let ct = 0;
    let t = 0;
    return roundSummaries.map(r => {
      if (r.winner_team === "CT") ct++;
      if (r.winner_team === "T") t++;
      return { ct, t };
    });
  }, [roundSummaries]);

  // Loading state
  if (loading) {
    return (
      <Card className="leet-card bg-gradient-to-br from-background/80 to-background/60 backdrop-blur-xl">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="leet-icon-box leet-icon-box-md">
              <Icon icon="solar:rewind-forward-bold" width={24} />
            </div>
            <h2 className={clsx("text-xl font-black uppercase tracking-wider", electrolize.className)}>
              Loading Rounds...
            </h2>
          </div>
        </CardHeader>
        <CardBody>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex gap-4 animate-pulse p-4 border border-default-200/30 rounded-none">
                <Skeleton className="w-14 h-14 rounded-none" />
                <div className="flex-1 space-y-3">
                  <Skeleton className="h-5 w-1/4 rounded-none" />
                  <Skeleton className="h-4 w-2/3 rounded-none" />
                </div>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>
    );
  }

  // Empty state
  if (roundSummaries.length === 0) {
    return (
      <Card className="leet-card bg-gradient-to-br from-background/80 to-background/60 backdrop-blur-xl">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="leet-icon-box leet-icon-box-md">
              <Icon icon="solar:rewind-forward-bold" width={24} />
            </div>
            <h2 className={clsx("text-xl font-black uppercase tracking-wider", electrolize.className)}>
              Round Timeline
            </h2>
          </div>
        </CardHeader>
        <CardBody>
          <div className="text-center py-16">
            <div className="leet-hero-icon">
              <Icon icon="solar:layers-line-duotone" width={48} />
            </div>
            <p className={clsx("text-2xl font-black text-default-500 mb-3", electrolize.className)}>
              No Round Data Available
            </p>
            <p className="text-sm text-default-400">
              Round timeline will appear once events are processed
            </p>
          </div>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card className="leet-card bg-gradient-to-br from-background/80 to-background/60 backdrop-blur-xl overflow-visible">
      <CardHeader className="pb-6">
        <div className="flex flex-col gap-6 w-full">
          {/* Header */}
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="leet-icon-box leet-icon-box-md">
                <Icon icon="solar:rewind-forward-bold" width={24} />
              </div>
              <div>
                <h2 className={clsx("text-xl font-black uppercase tracking-wider", electrolize.className)}>
                  Round Timeline
                </h2>
                <p className="text-sm text-default-400">
                  {roundSummaries.length} rounds • {events?.kills?.length || 0} total kills
                </p>
              </div>
            </div>
            
            {/* Final Score */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-[#00A8FF]/20 via-transparent to-[#FFB800]/20 border border-[#FF4654]/20 dark:border-[#DCFF37]/20 rounded-none">
                <div className="text-center">
                  <div className={clsx("text-2xl font-black text-[#00A8FF]", electrolize.className)}>
                    {scores[scores.length - 1]?.ct || 0}
                  </div>
                  <div className="text-xs text-[#00A8FF]/70 uppercase font-bold">CT</div>
                </div>
                <div className="text-default-400 text-xl font-bold">:</div>
                <div className="text-center">
                  <div className={clsx("text-2xl font-black text-[#FFB800]", electrolize.className)}>
                    {scores[scores.length - 1]?.t || 0}
                  </div>
                  <div className="text-xs text-[#FFB800]/70 uppercase font-bold">T</div>
                </div>
              </div>
            </div>
          </div>

          {/* Round Selector Bar - Esports Style */}
          <div className="relative">
            {/* Half indicator */}
            {roundSummaries.length > 12 && (
              <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-[#FF4654] to-[#FFC700] dark:from-[#DCFF37] dark:to-[#34445C] z-10 transform -translate-x-1/2">
                <div className={clsx("absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-bold text-default-400 uppercase whitespace-nowrap", electrolize.className)}>
                  Half
                </div>
              </div>
            )}
            
            <div className="flex gap-1 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-default-300">
              {roundSummaries.map((round, idx) => {
                const isSelected = selectedRound === round.round_number;
                const _isExpanded = expandedRound === round.round_number;
                const isCTWin = round.winner_team === "CT";
                const isTWin = round.winner_team === "T";
                const isHalfBreak = idx === 12;
                
                return (
                  <React.Fragment key={round.round_number}>
                    {isHalfBreak && <div className="w-4 flex-shrink-0" />}
                    <button
                      onClick={() => {
                        setSelectedRound(round.round_number);
                        setExpandedRound(round.round_number);
                      }}
                      className={clsx(
                        "relative w-10 h-12 flex-shrink-0 flex flex-col items-center justify-center transition-all duration-200",
                        "border rounded-none",
                        isSelected && "ring-2 ring-offset-2 ring-offset-background scale-110 z-20",
                        isCTWin && [
                          "bg-gradient-to-b from-[#00A8FF]/30 to-[#00A8FF]/10",
                          "border-[#00A8FF]/50 hover:border-[#00A8FF]",
                          isSelected && "ring-[#00A8FF]"
                        ],
                        isTWin && [
                          "bg-gradient-to-b from-[#FFB800]/30 to-[#FFB800]/10",
                          "border-[#FFB800]/50 hover:border-[#FFB800]",
                          isSelected && "ring-[#FFB800]"
                        ],
                        !isCTWin && !isTWin && [
                          "bg-gradient-to-b from-default-200/30 to-default-200/10",
                          "border-default-300/50 hover:border-default-400",
                          isSelected && "ring-default-400"
                        ],
                        electrolize.className
                      )}
                    >
                      <span className={clsx(
                        "text-sm font-black",
                        isCTWin && "text-[#00A8FF]",
                        isTWin && "text-[#FFB800]",
                        !isCTWin && !isTWin && "text-default-500"
                      )}>
                        {round.round_number}
                      </span>
                      
                      {/* Indicators */}
                      <div className="flex gap-0.5 mt-0.5">
                        {round.bomb_planted && (
                          <div className="w-1.5 h-1.5 rounded-full bg-[#FFC700]" title="Bomb planted" />
                        )}
                        {round.bomb_defused && (
                          <div className="w-1.5 h-1.5 rounded-full bg-[#00A8FF]" title="Bomb defused" />
                        )}
                        {round.kills.length > 3 && (
                          <div className="w-1.5 h-1.5 rounded-full bg-[#FF4654]" title="Multi-kill round" />
                        )}
                      </div>
                      
                      {/* Win indicator line */}
                      <div className={clsx(
                        "absolute bottom-0 left-0 right-0 h-1",
                        isCTWin && "bg-[#00A8FF]",
                        isTWin && "bg-[#FFB800]"
                      )} />
                    </button>
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardBody className="pt-0">
        {/* Selected Round Details */}
        {expandedRound && (() => {
          const round = roundSummaries.find(r => r.round_number === expandedRound);
          if (!round) return null;
          
          const scoreAtRound = scores[round.round_number - 1] || { ct: 0, t: 0 };
          const isCTWin = round.winner_team === "CT";
          const isTWin = round.winner_team === "T";
          const headshotKills = round.kills.filter(k => k.headshot).length;
          
          return (
            <div className="space-y-6">
              {/* Round Header Banner */}
              <div className={clsx(
                "relative overflow-hidden rounded-none p-6",
                "bg-gradient-to-r",
                isCTWin && "from-[#00A8FF]/20 via-[#00A8FF]/10 to-transparent border-l-4 border-[#00A8FF]",
                isTWin && "from-[#FFB800]/20 via-[#FFB800]/10 to-transparent border-l-4 border-[#FFB800]",
                !isCTWin && !isTWin && "from-default-200/20 via-default-200/10 to-transparent border-l-4 border-default-400"
              )}>
                {/* Background glow */}
                <div className={clsx(
                  "absolute top-0 left-0 w-32 h-32 blur-3xl opacity-30",
                  isCTWin && "bg-[#00A8FF]",
                  isTWin && "bg-[#FFB800]"
                )} />
                
                <div className="relative flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-4">
                    <div className={clsx(
                      "w-16 h-16 flex items-center justify-center rounded-none",
                      "bg-gradient-to-br border-2",
                      isCTWin && "from-[#00A8FF]/30 to-[#00A8FF]/10 border-[#00A8FF]/50",
                      isTWin && "from-[#FFB800]/30 to-[#FFB800]/10 border-[#FFB800]/50",
                      !isCTWin && !isTWin && "from-default-200/30 to-default-200/10 border-default-300/50"
                    )}>
                      <span className={clsx(
                        "text-3xl font-black",
                        electrolize.className,
                        isCTWin && "text-[#00A8FF]",
                        isTWin && "text-[#FFB800]",
                        !isCTWin && !isTWin && "text-default-500"
                      )}>
                        {round.round_number}
                      </span>
                    </div>
                    <div>
                      <h3 className={clsx("text-2xl font-black uppercase", electrolize.className)}>
                        Round {round.round_number}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Chip
                          size="sm"
                          variant="flat"
                          className={clsx(
                            "font-bold",
                            isCTWin && "bg-[#00A8FF]/20 text-[#00A8FF]",
                            isTWin && "bg-[#FFB800]/20 text-[#FFB800]"
                          )}
                        >
                          {round.winner_team || "?"} WIN
                        </Chip>
                        {round.reason && (
                          <span className="text-sm text-default-400 capitalize">
                            {round.reason.replace(/_/g, " ")}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    {/* Score at this round */}
                    <div className="flex items-center gap-2 px-4 py-2 bg-black/30 rounded-none">
                      <span className={clsx("text-lg font-black text-[#00A8FF]", electrolize.className)}>
                        {scoreAtRound.ct}
                      </span>
                      <span className="text-default-400">-</span>
                      <span className={clsx("text-lg font-black text-[#FFB800]", electrolize.className)}>
                        {scoreAtRound.t}
                      </span>
                    </div>
                    
                    <EsportsButton
                      variant="primary"
                      size="md"
                      onClick={() => onWatchRound?.(round.round_number)}
                    >
                      <Icon icon="solar:play-bold" width={18} />
                      Watch
                    </EsportsButton>
                  </div>
                </div>
              </div>
              
              {/* Round Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="leet-stats-card text-center">
                  <div className={clsx("text-3xl font-black text-[#FF4654] dark:text-[#DCFF37]", electrolize.className)}>
                    {round.kills.length}
                  </div>
                  <div className="text-xs text-default-400 uppercase font-bold tracking-wider mt-1">Total Kills</div>
                </div>
                <div className="leet-stats-card text-center">
                  <div className={clsx("text-3xl font-black text-[#FF4654] dark:text-[#DCFF37]", electrolize.className)}>
                    {headshotKills}
                  </div>
                  <div className="text-xs text-default-400 uppercase font-bold tracking-wider mt-1">Headshots</div>
                </div>
                <div className="leet-stats-card text-center">
                  <div className={clsx("text-3xl font-black", electrolize.className, round.bomb_planted ? "text-[#FFC700]" : "text-default-300")}>
                    {round.bomb_planted ? "Yes" : "No"}
                  </div>
                  <div className="text-xs text-default-400 uppercase font-bold tracking-wider mt-1">Bomb Plant</div>
                </div>
                <div className="leet-stats-card text-center">
                  <div className={clsx("text-3xl font-black", electrolize.className, round.bomb_defused ? "text-[#00A8FF]" : "text-default-300")}>
                    {round.bomb_defused ? "Yes" : "No"}
                  </div>
                  <div className="text-xs text-default-400 uppercase font-bold tracking-wider mt-1">Defused</div>
                </div>
              </div>
              
              {/* Kill Feed */}
              {round.kills.length > 0 && (
                <div className="space-y-3">
                  <h4 className={clsx("text-sm font-bold uppercase tracking-wider text-default-500", electrolize.className)}>
                    <Icon icon="solar:target-bold" className="inline mr-2" width={16} />
                    Kill Feed ({round.kills.length})
                  </h4>
                  
                  <div className="space-y-2">
                    {round.kills.map((kill, idx) => (
                      <div 
                        key={`${kill.tick}-${idx}`}
                        className={clsx(
                          "flex items-center gap-3 p-3 rounded-none transition-all group",
                          "bg-gradient-to-r from-[#FF4654]/5 to-transparent hover:from-[#FF4654]/10",
                          "border border-[#FF4654]/10 hover:border-[#FF4654]/30"
                        )}
                      >
                        {/* Killer */}
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <Avatar
                            size="sm"
                            name={kill.killer_name?.[0] || "?"}
                            classNames={{ 
                              base: clsx(
                                "border-2",
                                kill.killer_team === "CT" ? "bg-[#00A8FF]/30 border-[#00A8FF]/50" : "bg-[#FFB800]/30 border-[#FFB800]/50"
                              )
                            }}
                          />
                          <span className={clsx(
                            "font-bold truncate",
                            kill.killer_team === "CT" ? "text-[#00A8FF]" : "text-[#FFB800]"
                          )}>
                            {kill.killer_name || "Unknown"}
                          </span>
                        </div>
                        
                        {/* Kill Method */}
                        <div className="flex items-center gap-2 px-3 py-1 bg-black/30 rounded-none">
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
                          <span className="text-lg">
                            {WEAPON_ICONS[kill.weapon?.toLowerCase()] || "🔫"}
                          </span>
                          <span className={clsx("text-xs text-default-400 font-mono", electrolize.className)}>
                            {kill.weapon || "?"}
                          </span>
                        </div>
                        
                        {/* Victim */}
                        <div className="flex items-center gap-2 flex-1 min-w-0 justify-end">
                          <span className={clsx(
                            "font-bold truncate",
                            kill.victim_team === "CT" ? "text-[#00A8FF]" : "text-[#FFB800]"
                          )}>
                            {kill.victim_name || "Unknown"}
                          </span>
                          <Avatar
                            size="sm"
                            name={kill.victim_name?.[0] || "?"}
                            classNames={{ 
                              base: clsx(
                                "border-2 opacity-50",
                                kill.victim_team === "CT" ? "bg-[#00A8FF]/30 border-[#00A8FF]/50" : "bg-[#FFB800]/30 border-[#FFB800]/50"
                              )
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {round.kills.length === 0 && (
                <div className="text-center py-8 text-default-400">
                  <Icon icon="solar:ghost-smile-linear" width={48} className="mx-auto mb-3 opacity-50" />
                  <p className="text-sm">No kills in this round</p>
                </div>
              )}
            </div>
          );
        })()}
        
        {/* No round selected */}
        {!expandedRound && (
          <div className="text-center py-12">
            <div className="leet-hero-icon mb-4">
              <Icon icon="solar:cursor-bold" width={32} />
            </div>
            <p className={clsx("text-lg font-bold text-default-500 mb-2", electrolize.className)}>
              Select a Round
            </p>
            <p className="text-sm text-default-400">
              Click on a round number above to see detailed statistics
            </p>
          </div>
        )}
      </CardBody>
    </Card>
  );
}

export default PremiumRoundsTimeline;

"use client";

/**
 * Premium Highlights Component
 * Award-winning UX with timeline, player cards, weapon icons, and kill feed styling
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
} from "@nextui-org/react";
import { Icon } from "@iconify/react";
import clsx from "clsx";
import { electrolize } from "@/config/fonts";
import { GameEvent, HighlightEventType } from "@/types/replay-api/highlights.types";

interface PremiumHighlightsProps {
  highlights: GameEvent[];
  loading: boolean;
  matchId: string;
  gameId: string;
  replayId?: string;
  onWatchHighlight?: (tickId: number) => void;
}

// CS2 Weapon icons mapping
const WEAPON_ICONS: Record<string, string> = {
  "ak-47": "game-icons:ak47",
  "ak47": "game-icons:ak47",
  "m4a4": "game-icons:machine-gun",
  "m4a1-s": "game-icons:machine-gun",
  "m4a1_silencer": "game-icons:machine-gun",
  "awp": "game-icons:sniper-rifle",
  "usp-s": "game-icons:pistol-gun",
  "usp_silencer": "game-icons:pistol-gun",
  "glock-18": "game-icons:pistol-gun",
  "glock": "game-icons:pistol-gun",
  "desert eagle": "game-icons:pistol-gun",
  "deagle": "game-icons:pistol-gun",
  "knife": "game-icons:bowie-knife",
  "c4": "game-icons:dynamite",
  "he grenade": "game-icons:grenade",
  "hegrenade": "game-icons:grenade",
  "flashbang": "game-icons:flash-grenade",
  "smoke grenade": "game-icons:smoke-bomb",
  "smokegrenade": "game-icons:smoke-bomb",
  "molotov": "game-icons:molotov",
  "incgrenade": "game-icons:molotov",
  "sg 553": "game-icons:machine-gun",
  "aug": "game-icons:machine-gun",
  "famas": "game-icons:machine-gun",
  "galil ar": "game-icons:machine-gun",
  "ssg 08": "game-icons:sniper-rifle",
  "scout": "game-icons:sniper-rifle",
  "g3sg1": "game-icons:sniper-rifle",
  "scar-20": "game-icons:sniper-rifle",
  "mac-10": "game-icons:uzi",
  "mp9": "game-icons:uzi",
  "mp7": "game-icons:uzi",
  "ump-45": "game-icons:uzi",
  "p90": "game-icons:uzi",
  "pp-bizon": "game-icons:uzi",
  "nova": "game-icons:shotgun",
  "xm1014": "game-icons:shotgun",
  "mag-7": "game-icons:shotgun",
  "sawed-off": "game-icons:shotgun",
  "m249": "game-icons:gatling-gun",
  "negev": "game-icons:gatling-gun",
  "p250": "game-icons:pistol-gun",
  "cz75-auto": "game-icons:pistol-gun",
  "five-seven": "game-icons:pistol-gun",
  "tec-9": "game-icons:pistol-gun",
  "dual berettas": "game-icons:pistol-gun",
  "r8 revolver": "game-icons:pistol-gun",
  "default": "solar:bomb-bold"
};

// Highlight type configurations
const HIGHLIGHT_CONFIG: Record<string, { color: "danger" | "secondary" | "warning" | "primary" | "success"; icon: string; label: string; glow: string }> = {
  "Ace": { color: "danger", icon: "solar:fire-bold", label: "ACE", glow: "shadow-[#FF4654]/50" },
  "QuadraKill": { color: "danger", icon: "solar:fire-bold", label: "QUAD KILL", glow: "shadow-[#FF4654]/40" },
  "TripleKill": { color: "warning", icon: "solar:bomb-bold", label: "TRIPLE", glow: "shadow-[#FFB800]/40" },
  "Clutch": { color: "secondary", icon: "solar:shield-bold", label: "CLUTCH", glow: "shadow-[#7B61FF]/40" },
  "MultiKill": { color: "warning", icon: "solar:bomb-bold", label: "MULTI", glow: "shadow-[#FFB800]/40" },
  "GenericKill": { color: "primary", icon: "solar:target-bold", label: "KILL", glow: "shadow-[#00A8FF]/30" },
  "FirstBlood": { color: "danger", icon: "solar:blood-bold", label: "FIRST BLOOD", glow: "shadow-[#FF4654]/40" },
  "Headshot": { color: "success", icon: "solar:target-bold", label: "HEADSHOT", glow: "shadow-[#00FF85]/40" },
  "Wallbang": { color: "secondary", icon: "solar:shield-minimalistic-bold", label: "WALLBANG", glow: "shadow-[#7B61FF]/40" },
  "NoScope": { color: "success", icon: "solar:eye-closed-bold", label: "NO-SCOPE", glow: "shadow-[#00FF85]/40" },
  "default": { color: "primary", icon: "solar:star-bold", label: "HIGHLIGHT", glow: "shadow-primary/30" },
};

const getWeaponIcon = (weapon?: string): string => {
  if (!weapon) return WEAPON_ICONS.default;
  const normalizedWeapon = weapon.toLowerCase().replace(/_/g, "-").replace(/ /g, "-");
  return WEAPON_ICONS[normalizedWeapon] || WEAPON_ICONS.default;
};

const getHighlightConfig = (type?: HighlightEventType) => {
  if (!type) return HIGHLIGHT_CONFIG.default;
  return HIGHLIGHT_CONFIG[type] || HIGHLIGHT_CONFIG.default;
};

export function PremiumHighlights({
  highlights,
  loading,
  matchId: _matchId,
  gameId: _gameId,
  replayId: _replayId,
  onWatchHighlight,
}: PremiumHighlightsProps) {
  const [filter, setFilter] = useState<HighlightEventType | "all">("all");
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  // Group highlights by round
  const _highlightsByRound = useMemo(() => {
    const grouped: Record<number, GameEvent[]> = {};
    highlights.forEach((h) => {
      const round = h.round_number || 0;
      if (!grouped[round]) grouped[round] = [];
      grouped[round].push(h);
    });
    return grouped;
  }, [highlights]);

  // Filter highlights
  const filteredHighlights = useMemo(() => {
    if (filter === "all") return highlights;
    return highlights.filter((h) => h.type === filter);
  }, [highlights, filter]);

  // Count by type
  const typeCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    highlights.forEach((h) => {
      const type = h.type || "unknown";
      counts[type] = (counts[type] || 0) + 1;
    });
    return counts;
  }, [highlights]);

  if (loading) {
    return (
      <Card className="bg-gradient-to-br from-background/80 to-background/60 backdrop-blur-xl border border-[#FF4654]/20 dark:border-[#DCFF37]/20">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <Icon icon="solar:star-bold" width={20} className="text-[#FF4654] dark:text-[#DCFF37]" />
            <h2 className={clsx("text-lg font-bold uppercase tracking-wide", electrolize.className)}>
              Loading Highlights...
            </h2>
          </div>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="p-4 rounded-none border border-[#FF4654]/20 dark:border-[#DCFF37]/20 animate-pulse">
                <div className="flex gap-4">
                  <Skeleton className="w-16 h-16 rounded-none" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-1/3 rounded" />
                    <Skeleton className="h-3 w-2/3 rounded" />
                    <Skeleton className="h-3 w-1/2 rounded" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>
    );
  }

  if (highlights.length === 0) {
    return (
      <Card className="bg-gradient-to-br from-background/80 to-background/60 backdrop-blur-xl border border-[#FF4654]/20 dark:border-[#DCFF37]/20">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <Icon icon="solar:star-bold" width={20} className="text-[#FF4654] dark:text-[#DCFF37]" />
            <h2 className={clsx("text-lg font-bold uppercase tracking-wide", electrolize.className)}>
              Match Highlights
            </h2>
          </div>
        </CardHeader>
        <CardBody>
          <div className="text-center py-16">
            <div className="relative w-24 h-24 mx-auto mb-6">
              <div className="absolute inset-0 bg-gradient-to-br from-[#FF4654]/20 to-[#DCFF37]/20 rounded-full blur-xl animate-pulse" />
              <div className="relative w-24 h-24 bg-gradient-to-br from-[#FF4654]/10 to-[#DCFF37]/10 rounded-full flex items-center justify-center">
                <Icon icon="solar:star-line-duotone" width={48} className="text-default-300" />
              </div>
            </div>
            <p className={clsx("text-2xl font-black text-default-500 mb-3", electrolize.className)}>
              No Highlights Detected
            </p>
            <p className="text-sm text-default-400 max-w-md mx-auto">
              Highlights like Aces, Clutches, and Multi-Kills will appear here once the replay analysis is complete.
            </p>
            <div className="flex justify-center gap-2 mt-6">
              <Chip size="sm" variant="flat" startContent={<Icon icon="solar:fire-bold" width={12} />}>
                Ace
              </Chip>
              <Chip size="sm" variant="flat" startContent={<Icon icon="solar:shield-bold" width={12} />}>
                Clutch
              </Chip>
              <Chip size="sm" variant="flat" startContent={<Icon icon="solar:bomb-bold" width={12} />}>
                Multi-Kill
              </Chip>
            </div>
          </div>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-background/80 to-background/60 backdrop-blur-xl border border-[#FF4654]/20 dark:border-[#DCFF37]/20 overflow-visible">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between w-full flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <div className="relative">
              <div className="absolute inset-0 bg-[#FF4654] blur-lg opacity-50 animate-pulse" />
              <Icon icon="solar:star-bold" width={24} className="relative text-[#FF4654] dark:text-[#DCFF37]" />
            </div>
            <h2 className={clsx("text-lg font-bold uppercase tracking-wide", electrolize.className)}>
              Match Highlights
            </h2>
            <Chip size="sm" variant="shadow" color="danger" className="ml-2">
              {highlights.length}
            </Chip>
          </div>
          
          {/* Filter Chips */}
          <div className="flex items-center gap-2 flex-wrap">
            <Chip
              size="sm"
              variant={filter === "all" ? "shadow" : "flat"}
              color={filter === "all" ? "danger" : "default"}
              className="cursor-pointer transition-all"
              onClick={() => setFilter("all")}
            >
              All ({highlights.length})
            </Chip>
            {Object.entries(typeCounts).slice(0, 5).map(([type, count]) => {
              const config = getHighlightConfig(type as HighlightEventType);
              return (
                <Chip
                  key={type}
                  size="sm"
                  variant={filter === type ? "shadow" : "flat"}
                  color={filter === type ? config.color : "default"}
                  startContent={<Icon icon={config.icon} width={12} />}
                  className="cursor-pointer transition-all"
                  onClick={() => setFilter(type as HighlightEventType)}
                >
                  {config.label} ({count})
                </Chip>
              );
            })}
          </div>
        </div>
      </CardHeader>
      
      <CardBody className="overflow-visible">
        {/* Featured Highlight - First Ace or Clutch */}
        {filteredHighlights.some(h => h.type === "Ace" || (h.type === "Clutch" && h.clutch_success)) && (
          <div className="mb-6">
            {(() => {
              const featured = filteredHighlights.find(h => h.type === "Ace") || 
                               filteredHighlights.find(h => h.type === "Clutch" && h.clutch_success);
              if (!featured) return null;
              const config = getHighlightConfig(featured.type);
              
              return (
                <div className={clsx(
                  "relative p-6 rounded-2xl transition-all duration-500",
                  "bg-gradient-to-br from-[#FF4654]/20 via-background/80 to-[#DCFF37]/10",
                  "border-2 border-[#FF4654]/40 dark:border-[#DCFF37]/40",
                  "shadow-2xl",
                  config.glow,
                  "overflow-hidden group"
                )}>
                  {/* Animated background particles */}
                  <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-[#FF4654]/20 rounded-full blur-3xl animate-pulse" />
                    <div className="absolute bottom-1/4 right-1/4 w-32 h-32 bg-[#DCFF37]/20 rounded-full blur-3xl animate-pulse delay-500" />
                  </div>
                  
                  <div className="relative flex items-center gap-6">
                    {/* Trophy Icon */}
                    <div className="flex-shrink-0">
                      <div className="relative w-20 h-20">
                        <div className="absolute inset-0 bg-gradient-to-br from-[#FF4654] to-[#FFC700] rounded-2xl blur-xl opacity-60 group-hover:opacity-80 transition-opacity" />
                        <div className="relative w-20 h-20 bg-gradient-to-br from-[#FF4654] to-[#FFC700] rounded-2xl flex items-center justify-center shadow-lg">
                          <Icon icon={config.icon} width={40} className="text-white" />
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <Chip
                          size="lg"
                          variant="shadow"
                          color={config.color}
                          startContent={<Icon icon={config.icon} width={16} />}
                          className={clsx("font-black uppercase tracking-wider", electrolize.className)}
                        >
                          {featured.type === "Clutch" && featured.clutch_type 
                            ? `1v${featured.clutch_type} ${config.label}` 
                            : config.label}
                        </Chip>
                        <span className={clsx("text-sm text-default-400 font-medium", electrolize.className)}>
                          ROUND {featured.round_number || "?"}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <Avatar
                          size="md"
                          name={featured.primary_player?.display_name?.[0] || "?"}
                          classNames={{ base: "bg-gradient-to-br from-[#FF4654] to-[#FFC700]" }}
                        />
                        <div>
                          <p className={clsx("text-xl font-black", electrolize.className)}>
                            {featured.primary_player?.display_name || "Unknown Player"}
                          </p>
                          {featured.weapon && (
                            <p className="text-sm text-default-400 flex items-center gap-2">
                              <Icon icon={getWeaponIcon(featured.weapon)} width={16} />
                              {featured.weapon}
                              {featured.kill_count && <span className="text-[#FF4654] font-bold">• {featured.kill_count} kills</span>}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <Button
                      size="lg"
                      color="danger"
                      variant="shadow"
                      className={clsx("font-bold uppercase", electrolize.className)}
                      startContent={<Icon icon="solar:play-bold" width={20} />}
                      onClick={() => featured.tick_id && onWatchHighlight?.(featured.tick_id)}
                    >
                      Watch
                    </Button>
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* Highlights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredHighlights.map((highlight, idx) => {
            const config = getHighlightConfig(highlight.type);
            const isHovered = hoveredIdx === idx;
            
            return (
              <div
                key={highlight.id || idx}
                className={clsx(
                  "group relative p-4 rounded-none transition-all duration-300",
                  "bg-gradient-to-br from-background/80 to-background/40",
                  "border border-[#FF4654]/20 dark:border-[#DCFF37]/20",
                  "hover:border-[#FF4654]/50 dark:hover:border-[#DCFF37]/50",
                  "hover:shadow-lg",
                  isHovered && config.glow
                )}
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
              >
                {/* Kill Feed Style Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className={clsx(
                      "w-8 h-8 rounded-none flex items-center justify-center",
                      "bg-gradient-to-br",
                      config.color === "danger" ? "from-[#FF4654]/30 to-[#FF4654]/10" :
                      config.color === "secondary" ? "from-[#7B61FF]/30 to-[#7B61FF]/10" :
                      config.color === "warning" ? "from-[#FFB800]/30 to-[#FFB800]/10" :
                      config.color === "success" ? "from-[#00FF85]/30 to-[#00FF85]/10" :
                      "from-[#00A8FF]/30 to-[#00A8FF]/10"
                    )}>
                      <Icon icon={config.icon} width={16} className={clsx(
                        config.color === "danger" ? "text-[#FF4654]" :
                        config.color === "secondary" ? "text-[#7B61FF]" :
                        config.color === "warning" ? "text-[#FFB800]" :
                        config.color === "success" ? "text-[#00FF85]" :
                        "text-[#00A8FF]"
                      )} />
                    </div>
                    <Chip
                      size="sm"
                      variant="flat"
                      color={config.color}
                      className={clsx("font-bold uppercase", electrolize.className)}
                    >
                      {highlight.type === "Clutch" && highlight.clutch_type 
                        ? `1v${highlight.clutch_type}` 
                        : highlight.type === "MultiKill" && highlight.kill_count
                        ? `${highlight.kill_count}K`
                        : config.label}
                    </Chip>
                  </div>
                  <span className={clsx("text-xs text-default-400 font-mono", electrolize.className)}>
                    R{highlight.round_number || "?"}
                  </span>
                </div>

                {/* Player Kill Feed */}
                <div className="flex items-center gap-3 p-3 bg-black/20 rounded-none mb-3">
                  {/* Killer */}
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <Avatar
                      size="sm"
                      name={highlight.primary_player?.display_name?.[0] || "?"}
                      classNames={{ base: "bg-[#00A8FF]/30" }}
                    />
                    <span className="font-semibold text-[#00A8FF] truncate">
                      {highlight.primary_player?.display_name || "Unknown"}
                    </span>
                  </div>
                  
                  {/* Weapon Icon */}
                  <div className="flex items-center gap-1 px-2">
                    {highlight.is_headshot && (
                      <Tooltip content="Headshot">
                        <Icon icon="solar:target-bold" width={14} className="text-[#FF4654]" />
                      </Tooltip>
                    )}
                    <Icon icon={getWeaponIcon(highlight.weapon)} width={20} className="text-default-400" />
                  </div>
                  
                  {/* Victim (if applicable) */}
                  {highlight.victim_player && (
                    <div className="flex items-center gap-2 flex-1 min-w-0 justify-end">
                      <span className="font-semibold text-[#FFB800] truncate">
                        {highlight.victim_player.display_name || "Unknown"}
                      </span>
                      <Avatar
                        size="sm"
                        name={highlight.victim_player.display_name?.[0] || "?"}
                        classNames={{ base: "bg-[#FFB800]/30" }}
                      />
                    </div>
                  )}
                </div>

                {/* Tags Row */}
                <div className="flex items-center gap-1 flex-wrap mb-3">
                  {highlight.weapon && (
                    <Chip size="sm" variant="flat" className="text-[10px] bg-default-100/50">
                      <Icon icon={getWeaponIcon(highlight.weapon)} width={10} className="mr-1" />
                      {highlight.weapon}
                    </Chip>
                  )}
                  {highlight.is_headshot && (
                    <Chip size="sm" variant="flat" color="danger" className="text-[10px]">
                      <Icon icon="solar:target-bold" width={10} className="mr-1" />
                      HS
                    </Chip>
                  )}
                  {highlight.is_wallbang && (
                    <Chip size="sm" variant="flat" color="secondary" className="text-[10px]">
                      <Icon icon="solar:shield-minimalistic-bold" width={10} className="mr-1" />
                      WB
                    </Chip>
                  )}
                  {highlight.is_noscope && (
                    <Chip size="sm" variant="flat" color="success" className="text-[10px]">
                      <Icon icon="solar:eye-closed-bold" width={10} className="mr-1" />
                      NS
                    </Chip>
                  )}
                  {highlight.is_through_smoke && (
                    <Chip size="sm" variant="flat" color="default" className="text-[10px]">
                      <Icon icon="solar:fog-bold" width={10} className="mr-1" />
                      Smoke
                    </Chip>
                  )}
                  {highlight.clutch_success && (
                    <Chip size="sm" variant="flat" color="success" className="text-[10px]">
                      <Icon icon="solar:check-circle-bold" width={10} className="mr-1" />
                      Won
                    </Chip>
                  )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-default-100">
                  <span className="text-xs text-default-400 font-mono">
                    {highlight.tick_id ? `T${highlight.tick_id}` : ""}
                  </span>
                  <Button
                    size="sm"
                    variant="light"
                    color="danger"
                    className={clsx(
                      "opacity-70 group-hover:opacity-100 transition-opacity",
                      electrolize.className
                    )}
                    startContent={<Icon icon="solar:play-bold" width={14} />}
                    onClick={() => highlight.tick_id && onWatchHighlight?.(highlight.tick_id)}
                  >
                    Watch
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </CardBody>
    </Card>
  );
}

export default PremiumHighlights;

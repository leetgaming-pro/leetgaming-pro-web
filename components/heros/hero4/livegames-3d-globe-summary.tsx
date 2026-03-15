/**
 * Live Games 3D Globe Summary
 * Displays real-time live game activity with animated regional hotspots
 * Shows pulsing indicators for active matches across regions
 */

"use client";

import React, { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import clsx from "clsx";
import { Orbitron } from "next/font/google";

const orbitron = Orbitron({ weight: ["400", "700"], subsets: ["latin"] });

export interface LiveGamesGlobeProps {
  className?: string;
}

// Regional hotspot positions (percentage-based for responsive layout)
const REGION_HOTSPOTS = [
  { id: "na-east", label: "NA East", x: 28, y: 35, region: "us-east" },
  { id: "na-west", label: "NA West", x: 15, y: 40, region: "us-west" },
  { id: "eu-west", label: "EU West", x: 48, y: 30, region: "eu-west" },
  { id: "eu-north", label: "EU North", x: 52, y: 22, region: "eu-north" },
  { id: "sa", label: "SA", x: 32, y: 65, region: "sa-east" },
  { id: "asia", label: "Asia", x: 72, y: 38, region: "asia-east" },
  { id: "oceania", label: "OCE", x: 80, y: 62, region: "oceania" },
];

// Simulated live activity per region
function useRegionActivity() {
  const [activity, setActivity] = useState<Record<string, { games: number; players: number }>>({});

  useEffect(() => {
    function generateActivity() {
      const result: Record<string, { games: number; players: number }> = {};
      for (const region of REGION_HOTSPOTS) {
        result[region.id] = {
          games: Math.floor(Math.random() * 12) + 1,
          players: Math.floor(Math.random() * 80) + 10,
        };
      }
      return result;
    }

    setActivity(generateActivity());
    const interval = setInterval(() => setActivity(generateActivity()), 8000);
    return () => clearInterval(interval);
  }, []);

  return activity;
}

function LivePulse({ size = "md", color = "emerald" }: { size?: "sm" | "md" | "lg"; color?: string }) {
  const sizeClasses = { sm: "h-2 w-2", md: "h-3 w-3", lg: "h-4 w-4" };
  return (
    <span className={clsx("relative flex", sizeClasses[size])}>
      <span className={clsx(
        "animate-ping absolute inline-flex h-full w-full rounded-full opacity-75",
        `bg-${color}-400`
      )} />
      <span className={clsx(
        "relative inline-flex rounded-full h-full w-full",
        `bg-${color}-500`
      )} />
    </span>
  );
}

export function LiveGames3DGlobeSummary({
  className = "",
}: LiveGamesGlobeProps) {
  const activity = useRegionActivity();
  const totalGames = Object.values(activity).reduce((sum, r) => sum + r.games, 0);
  const totalPlayers = Object.values(activity).reduce((sum, r) => sum + r.players, 0);

  return (
    <div className={`relative min-h-[280px] ${className}`}>
      {/* Background globe effect */}
      <div className="absolute inset-0 overflow-hidden">
        {/* World map silhouette (gradient) */}
        <div className="absolute inset-0 bg-gradient-radial from-emerald-500/10 via-transparent to-transparent" />

        {/* Grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        {/* Region hotspots */}
        {REGION_HOTSPOTS.map((region) => {
          const regionData = activity[region.id];
          const intensity = regionData ? Math.min(regionData.games / 10, 1) : 0;
          const glowSize = 20 + intensity * 30;

          return (
            <div
              key={region.id}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 group"
              style={{ left: `${region.x}%`, top: `${region.y}%` }}
            >
              {/* Glow */}
              <div
                className="absolute rounded-full bg-emerald-500/20 animate-pulse"
                style={{
                  width: glowSize,
                  height: glowSize,
                  left: -glowSize / 2,
                  top: -glowSize / 2,
                  animationDelay: `${Math.random() * 2}s`,
                }}
              />

              {/* Pulse dot */}
              <LivePulse size={intensity > 0.5 ? "md" : "sm"} />

              {/* Tooltip on hover */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
                <div className="bg-black/80 backdrop-blur-sm border border-default-200/30 px-3 py-2 rounded-none whitespace-nowrap">
                  <div className={clsx("text-xs font-bold text-emerald-400", orbitron.className)}>
                    {region.label}
                  </div>
                  {regionData && (
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-[10px] text-default-400">
                        <Icon icon="solar:gamepad-bold" className="inline mr-1" width={10} />
                        {regionData.games} games
                      </span>
                      <span className="text-[10px] text-default-400">
                        <Icon icon="solar:users-group-rounded-bold" className="inline mr-1" width={10} />
                        {regionData.players} players
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom stats bar */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-6 px-6 py-2 bg-black/40 backdrop-blur-sm border border-default-200/20 rounded-none">
        <div className="flex items-center gap-2">
          <LivePulse size="sm" />
          <span className={clsx("text-xs font-bold text-emerald-400", orbitron.className)}>
            {totalGames}
          </span>
          <span className="text-[10px] text-default-400 uppercase">Active</span>
        </div>
        <div className="w-px h-4 bg-default-200/30" />
        <div className="flex items-center gap-2">
          <Icon icon="solar:users-group-rounded-bold" className="text-default-400" width={12} />
          <span className={clsx("text-xs font-bold text-[#FF4654] dark:text-[#DCFF37]", orbitron.className)}>
            {totalPlayers}
          </span>
          <span className="text-[10px] text-default-400 uppercase">Players</span>
        </div>
      </div>
    </div>
  );
}

export default LiveGames3DGlobeSummary;

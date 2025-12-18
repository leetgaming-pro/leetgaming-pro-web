/**
 * @fileoverview Game Logo Component
 * @module components/ui/game-logo
 *
 * Centralized component for displaying game logos with consistent sizing
 * and fallback handling across the platform.
 */

"use client";

import React from "react";
import Image from "next/image";
import { Icon } from "@iconify/react";
import { GAME_CONFIGS } from "@/config/games";
import type { GameId } from "@/types/games";

export type GameLogoSize = "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
export type GameLogoVariant = "logo" | "banner" | "icon";

const SIZE_MAP: Record<
  GameLogoSize,
  { width: number; height: number; iconSize: number }
> = {
  xs: { width: 24, height: 24, iconSize: 16 },
  sm: { width: 32, height: 32, iconSize: 20 },
  md: { width: 48, height: 48, iconSize: 28 },
  lg: { width: 64, height: 64, iconSize: 36 },
  xl: { width: 96, height: 96, iconSize: 48 },
  "2xl": { width: 128, height: 128, iconSize: 64 },
};

const BANNER_SIZE_MAP: Record<GameLogoSize, { width: number; height: number }> =
  {
    xs: { width: 120, height: 45 },
    sm: { width: 200, height: 75 },
    md: { width: 320, height: 120 },
    lg: { width: 480, height: 180 },
    xl: { width: 640, height: 240 },
    "2xl": { width: 800, height: 300 },
  };

interface GameLogoProps {
  gameId: GameId;
  size?: GameLogoSize;
  variant?: GameLogoVariant;
  className?: string;
  showName?: boolean;
  priority?: boolean;
}

/**
 * GameLogo - Displays game logos, banners, or icons with consistent sizing
 *
 * @example
 * // Display a small logo
 * <GameLogo gameId="cs2" size="sm" />
 *
 * @example
 * // Display a banner
 * <GameLogo gameId="valorant" variant="banner" size="lg" />
 *
 * @example
 * // Display just the icon
 * <GameLogo gameId="lol" variant="icon" />
 */
export function GameLogo({
  gameId,
  size = "md",
  variant = "logo",
  className = "",
  showName = false,
  priority = false,
}: GameLogoProps) {
  const config = GAME_CONFIGS[gameId];

  if (!config) {
    return (
      <div
        className={`flex items-center justify-center bg-default-100 rounded-lg ${className}`}
        style={{ width: SIZE_MAP[size].width, height: SIZE_MAP[size].height }}
      >
        <Icon
          icon="mdi:gamepad-variant"
          className="text-default-400"
          width={SIZE_MAP[size].iconSize}
        />
      </div>
    );
  }

  // Icon variant - use Iconify
  if (variant === "icon") {
    return (
      <div className={`inline-flex items-center gap-2 ${className}`}>
        <Icon
          icon={config.icon}
          width={SIZE_MAP[size].iconSize}
          style={{ color: config.color.primary }}
        />
        {showName && <span className="font-medium">{config.shortName}</span>}
      </div>
    );
  }

  // Banner variant
  if (variant === "banner") {
    const dimensions = BANNER_SIZE_MAP[size];
    return (
      <div className={`relative overflow-hidden rounded-lg ${className}`}>
        <Image
          src={config.banner}
          alt={`${config.name} banner`}
          width={dimensions.width}
          height={dimensions.height}
          className="object-cover"
          priority={priority}
          onError={(e) => {
            // Fallback to a gradient with game name
            const target = e.currentTarget;
            target.style.display = "none";
            const parent = target.parentElement;
            if (parent) {
              parent.innerHTML = `
                <div 
                  style="
                    width: ${dimensions.width}px;
                    height: ${dimensions.height}px;
                    background: linear-gradient(135deg, ${
                      config.color.primary
                    }40, ${config.color.secondary});
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 8px;
                  "
                >
                  <span style="color: ${config.color.primary}; font-size: ${
                dimensions.height / 4
              }px; font-weight: bold;">
                    ${config.shortName}
                  </span>
                </div>
              `;
            }
          }}
        />
        {showName && (
          <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/60 rounded text-white text-sm">
            {config.name}
          </div>
        )}
      </div>
    );
  }

  // Logo variant (default)
  const dimensions = SIZE_MAP[size];
  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <div
        className="relative"
        style={{ width: dimensions.width, height: dimensions.height }}
      >
        <Image
          src={config.logo}
          alt={`${config.name} logo`}
          fill
          className="object-contain"
          priority={priority}
          onError={(e) => {
            // Fallback to icon
            const target = e.currentTarget;
            target.style.display = "none";
          }}
        />
      </div>
      {showName && <span className="font-medium">{config.name}</span>}
    </div>
  );
}

/**
 * GameLogoGrid - Display multiple game logos in a grid
 */
interface GameLogoGridProps {
  gameIds: GameId[];
  size?: GameLogoSize;
  columns?: 2 | 3 | 4 | 5 | 6;
  gap?: "sm" | "md" | "lg";
  showNames?: boolean;
  className?: string;
}

export function GameLogoGrid({
  gameIds,
  size = "md",
  columns = 4,
  gap = "md",
  showNames = false,
  className = "",
}: GameLogoGridProps) {
  const gapClass = {
    sm: "gap-2",
    md: "gap-4",
    lg: "gap-6",
  }[gap];

  const colsClass = {
    2: "grid-cols-2",
    3: "grid-cols-3",
    4: "grid-cols-4",
    5: "grid-cols-5",
    6: "grid-cols-6",
  }[columns];

  return (
    <div className={`grid ${colsClass} ${gapClass} ${className}`}>
      {gameIds.map((gameId) => (
        <div key={gameId} className="flex flex-col items-center">
          <GameLogo gameId={gameId} size={size} showName={showNames} />
        </div>
      ))}
    </div>
  );
}

export default GameLogo;

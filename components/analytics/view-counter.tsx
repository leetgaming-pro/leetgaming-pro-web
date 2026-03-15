"use client";

/**
 * ViewCounter — Compact view count badge for entity cards/headers.
 * Shows total views with an eye icon. Follows the brand system:
 * rounded-none, clip-path corners, solar: icons.
 */

import React from "react";
import { Chip, Tooltip } from "@nextui-org/react";
import { Icon } from "@iconify/react";
import { motion, AnimatePresence } from "framer-motion";
import type { TrendDirection } from "@/types/replay-api/view-analytics.types";

interface ViewCounterProps {
  totalViews: number;
  uniqueViewers?: number;
  trendDirection?: TrendDirection;
  trendPercentage?: number;
  size?: "sm" | "md" | "lg";
  showTrend?: boolean;
  className?: string;
}

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

const trendIcons: Record<TrendDirection, string> = {
  up: "solar:arrow-up-bold",
  down: "solar:arrow-down-bold",
  stable: "solar:minus-circle-bold",
};

const trendColors: Record<TrendDirection, string> = {
  up: "text-success",
  down: "text-danger",
  stable: "text-default-400",
};

export function ViewCounter({
  totalViews,
  uniqueViewers,
  trendDirection = "stable",
  trendPercentage = 0,
  size = "md",
  showTrend = true,
  className = "",
}: ViewCounterProps) {
  const iconSize = size === "sm" ? 14 : size === "lg" ? 20 : 16;
  const textSize = size === "sm" ? "text-xs" : size === "lg" ? "text-base" : "text-sm";

  const tooltipContent = [
    `${totalViews.toLocaleString()} total views`,
    uniqueViewers !== undefined ? `${uniqueViewers.toLocaleString()} unique viewers` : null,
    showTrend && trendDirection !== "stable"
      ? `${trendDirection === "up" ? "+" : "-"}${trendPercentage}% this period`
      : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <Tooltip content={tooltipContent} placement="bottom">
      <div
        className={`inline-flex items-center gap-1.5 ${className}`}
      >
        <Chip
          variant="flat"
          size={size}
          className="rounded-none bg-content1/50 backdrop-blur-sm border border-white/10"
          startContent={
            <Icon
              icon="solar:eye-bold"
              width={iconSize}
              className="text-default-400"
            />
          }
        >
          <span className={`${textSize} font-medium text-default-600`}>
            {formatCount(totalViews)}
          </span>
        </Chip>

        <AnimatePresence>
          {showTrend && trendDirection !== "stable" && trendPercentage > 0 && (
            <motion.span
              initial={{ opacity: 0, x: -4 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -4 }}
              className={`inline-flex items-center gap-0.5 ${trendColors[trendDirection]} ${textSize}`}
            >
              <Icon icon={trendIcons[trendDirection]} width={iconSize - 2} />
              <span className="font-medium">{trendPercentage}%</span>
            </motion.span>
          )}
        </AnimatePresence>
      </div>
    </Tooltip>
  );
}

export default ViewCounter;

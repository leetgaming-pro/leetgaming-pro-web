"use client";

/**
 * ViewStatisticsCard — Rich stats card with sparkline for view analytics.
 * Shows total views, unique viewers, trend, and a mini daily views chart.
 * Follows the brand system: rounded-none, clip-path corners, glass cards, solar: icons.
 */

import React, { useMemo } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  Divider,
  Chip,
} from "@nextui-org/react";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import type { ViewStatistics, TrendDirection } from "@/types/replay-api/view-analytics.types";

interface ViewStatisticsCardProps {
  stats: ViewStatistics | null;
  loading?: boolean;
  className?: string;
}

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

const trendMeta: Record<TrendDirection, { icon: string; color: string; bg: string }> = {
  up: {
    icon: "solar:arrow-up-bold",
    color: "text-success",
    bg: "bg-success/10",
  },
  down: {
    icon: "solar:arrow-down-bold",
    color: "text-danger",
    bg: "bg-danger/10",
  },
  stable: {
    icon: "solar:minus-circle-bold",
    color: "text-default-400",
    bg: "bg-default/10",
  },
};

/** Mini sparkline SVG rendered from views_by_day */
function Sparkline({ data, className = "" }: { data: number[]; className?: string }) {
  if (data.length < 2) return null;

  const width = 120;
  const height = 32;
  const max = Math.max(...data, 1);
  const step = width / (data.length - 1);

  const points = data.map((v, i) => {
    const x = i * step;
    const y = height - (v / max) * (height - 4) - 2;
    return `${x},${y}`;
  });

  const polyline = points.join(" ");
  const areaPath = `M0,${height} L${points.join(" L")} L${width},${height} Z`;

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className={className}>
      <defs>
        <linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgb(var(--nextui-warning))" stopOpacity="0.3" />
          <stop offset="100%" stopColor="rgb(var(--nextui-warning))" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill="url(#sparkGrad)" />
      <polyline
        points={polyline}
        fill="none"
        stroke="rgb(var(--nextui-warning))"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ViewStatisticsCard({
  stats,
  loading = false,
  className = "",
}: ViewStatisticsCardProps) {
  const dailyData = useMemo(() => {
    if (!stats?.views_by_day) return [];
    const entries = Object.entries(stats.views_by_day).sort(([a], [b]) => a.localeCompare(b));
    return entries.slice(-14).map(([, v]) => v); // last 14 days
  }, [stats?.views_by_day]);

  const topDevices = useMemo(() => {
    if (!stats?.views_by_device) return [];
    return Object.entries(stats.views_by_device)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3);
  }, [stats?.views_by_device]);

  const topReferrers = useMemo(() => {
    if (!stats?.views_by_referrer) return [];
    return Object.entries(stats.views_by_referrer)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3);
  }, [stats?.views_by_referrer]);

  const trend = stats?.trend_direction || "stable";
  const meta = trendMeta[trend];

  if (loading) {
    return (
      <Card
        className={`rounded-none bg-content1/50 backdrop-blur-sm border border-white/10 animate-pulse ${className}`}
        style={{
          clipPath:
            "polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))",
        }}
      >
        <CardBody className="p-6 h-32" />
      </Card>
    );
  }

  if (!stats) return null;

  return (
    <Card
      className={`rounded-none bg-content1/50 backdrop-blur-sm border border-white/10 ${className}`}
      style={{
        clipPath:
          "polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))",
      }}
    >
      <CardHeader className="flex items-center justify-between px-4 pt-4 pb-2">
        <div className="flex items-center gap-2">
          <Icon icon="solar:chart-square-bold" width={20} className="text-warning" />
          <h3 className="text-sm font-semibold text-foreground">Profile Analytics</h3>
        </div>
        <Chip
          size="sm"
          variant="flat"
          className={`rounded-none ${meta.bg} ${meta.color}`}
          startContent={<Icon icon={meta.icon} width={12} />}
        >
          {stats.trend_percentage > 0 ? `${trend === "down" ? "-" : "+"}${stats.trend_percentage}%` : "stable"}
        </Chip>
      </CardHeader>

      <Divider className="opacity-20" />

      <CardBody className="px-4 py-3 gap-4">
        {/* Key metrics row */}
        <div className="grid grid-cols-2 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col"
          >
            <span className="text-[10px] uppercase tracking-wider text-default-400 mb-0.5">
              Total Views
            </span>
            <span className="text-xl font-bold text-foreground">
              {formatNumber(stats.total_views)}
            </span>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="flex flex-col"
          >
            <span className="text-[10px] uppercase tracking-wider text-default-400 mb-0.5">
              Unique Viewers
            </span>
            <span className="text-xl font-bold text-foreground">
              {formatNumber(stats.unique_viewers)}
            </span>
          </motion.div>
        </div>

        {/* Sparkline */}
        {dailyData.length > 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <span className="text-[10px] uppercase tracking-wider text-default-400">
              Daily views (last 14 days)
            </span>
            <Sparkline data={dailyData} className="mt-1 w-full" />
          </motion.div>
        )}

        {/* Breakdown chips */}
        {(topDevices.length > 0 || topReferrers.length > 0) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15 }}
            className="flex flex-wrap gap-1.5"
          >
            {topDevices.map(([device, count]) => (
              <Chip key={device} size="sm" variant="dot" className="rounded-none text-[10px]">
                {device}: {count}
              </Chip>
            ))}
            {topReferrers.map(([source, count]) => (
              <Chip key={source} size="sm" variant="bordered" className="rounded-none text-[10px]">
                {source}: {count}
              </Chip>
            ))}
          </motion.div>
        )}
      </CardBody>
    </Card>
  );
}

export default ViewStatisticsCard;

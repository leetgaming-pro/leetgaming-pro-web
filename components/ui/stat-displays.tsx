"use client";

import React from "react";
import { Card, CardBody, Tooltip, Progress } from "@nextui-org/react";
import { Icon } from "@iconify/react";
import clsx from "clsx";
import { electrolize } from "@/config/fonts";

// Individual stat display with tooltip and styling
export function StatBadge({
  icon,
  value,
  label,
  tooltip,
  color = "default",
  size = "md",
  trend,
}: {
  icon: string;
  value: string | number;
  label: string;
  tooltip?: string;
  color?: "default" | "success" | "warning" | "danger" | "primary" | "secondary";
  size?: "sm" | "md" | "lg";
  trend?: "up" | "down" | "stable";
}) {
  const colorClasses = {
    default: "text-default-600",
    success: "text-success",
    warning: "text-warning",
    danger: "text-danger",
    primary: "text-primary",
    secondary: "text-secondary",
  };

  const sizeClasses = {
    sm: { icon: 12, value: "text-sm", label: "text-[10px]" },
    md: { icon: 16, value: "text-lg", label: "text-xs" },
    lg: { icon: 20, value: "text-2xl", label: "text-sm" },
  };

  const content = (
    <div className="flex flex-col items-center gap-1">
      <div className="flex items-center gap-1">
        <Icon
          icon={icon}
          width={sizeClasses[size].icon}
          className={colorClasses[color]}
        />
        <span
          className={clsx(
            sizeClasses[size].value,
            "font-bold",
            colorClasses[color]
          )}
        >
          {value}
        </span>
        {trend && (
          <Icon
            icon={
              trend === "up"
                ? "solar:arrow-up-bold"
                : trend === "down"
                ? "solar:arrow-down-bold"
                : "solar:minus-bold"
            }
            width={sizeClasses[size].icon - 2}
            className={
              trend === "up"
                ? "text-success"
                : trend === "down"
                ? "text-danger"
                : "text-default-400"
            }
          />
        )}
      </div>
      <span className={clsx(sizeClasses[size].label, "text-default-500 uppercase tracking-wider")}>
        {label}
      </span>
    </div>
  );

  return tooltip ? (
    <Tooltip content={tooltip} placement="top">
      {content}
    </Tooltip>
  ) : (
    content
  );
}

// K/D/A display with visual emphasis
export function KDADisplay({
  kills,
  deaths,
  assists,
  size = "md",
  showLabels = true,
  showDiff = false,
}: {
  kills: number;
  deaths: number;
  assists: number;
  size?: "sm" | "md" | "lg";
  showLabels?: boolean;
  showDiff?: boolean;
}) {
  const kdDiff = kills - deaths;
  const _kda = deaths > 0 ? ((kills + assists) / deaths).toFixed(2) : "∞";

  const sizeClasses = {
    sm: "text-sm gap-1",
    md: "text-xl gap-2",
    lg: "text-3xl gap-3",
  };

  return (
    <div className={clsx("flex items-center", sizeClasses[size])}>
      <div className="text-center">
        <span className="font-bold text-success">{kills}</span>
        {showLabels && (
          <div className="text-[10px] text-default-500 uppercase">K</div>
        )}
      </div>
      <span className="text-default-400">/</span>
      <div className="text-center">
        <span className="font-bold text-danger">{deaths}</span>
        {showLabels && (
          <div className="text-[10px] text-default-500 uppercase">D</div>
        )}
      </div>
      <span className="text-default-400">/</span>
      <div className="text-center">
        <span className="font-bold text-warning">{assists}</span>
        {showLabels && (
          <div className="text-[10px] text-default-500 uppercase">A</div>
        )}
      </div>
      {showDiff && (
        <div className="ml-2 text-center">
          <span
            className={clsx(
              "font-bold",
              kdDiff > 0 ? "text-success" : kdDiff < 0 ? "text-danger" : "text-default-500"
            )}
          >
            {kdDiff > 0 ? `+${kdDiff}` : kdDiff}
          </span>
          {showLabels && (
            <div className="text-[10px] text-default-500 uppercase">+/-</div>
          )}
        </div>
      )}
    </div>
  );
}

// Rating display with color coding
export function RatingDisplay({
  rating,
  label = "Rating",
  variant = "hltv2",
  size = "md",
}: {
  rating: number;
  label?: string;
  variant?: "hltv2" | "simple" | "elo";
  size?: "sm" | "md" | "lg";
}) {
  const getColor = () => {
    if (variant === "hltv2") {
      if (rating >= 1.3) return "success";
      if (rating >= 1.1) return "primary";
      if (rating >= 0.9) return "warning";
      return "danger";
    }
    if (variant === "elo") {
      if (rating >= 2500) return "success";
      if (rating >= 2000) return "primary";
      if (rating >= 1500) return "warning";
      return "danger";
    }
    // simple 0-100
    if (rating >= 80) return "success";
    if (rating >= 60) return "primary";
    if (rating >= 40) return "warning";
    return "danger";
  };

  const colorClasses = {
    success: "bg-success/20 text-success border-success/30",
    primary: "bg-primary/20 text-primary border-primary/30",
    warning: "bg-warning/20 text-warning border-warning/30",
    danger: "bg-danger/20 text-danger border-danger/30",
  };

  const sizeClasses = {
    sm: "text-sm px-2 py-1",
    md: "text-lg px-3 py-1.5",
    lg: "text-2xl px-4 py-2",
  };

  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className={clsx(
          "font-bold rounded border",
          colorClasses[getColor()],
          sizeClasses[size]
        )}
      >
        {rating.toFixed(2)}
      </div>
      <span className="text-[10px] text-default-500 uppercase tracking-wider">
        {label}
      </span>
    </div>
  );
}

// Score display for match results
export function ScoreDisplay({
  team1Score,
  team2Score,
  team1Name = "Team 1",
  team2Name = "Team 2",
  team1Side = "CT",
  team2Side = "T",
  size = "lg",
  showWinner = true,
}: {
  team1Score: number;
  team2Score: number;
  team1Name?: string;
  team2Name?: string;
  team1Side?: "CT" | "T";
  team2Side?: "CT" | "T";
  size?: "sm" | "md" | "lg";
  showWinner?: boolean;
}) {
  const team1Wins = team1Score > team2Score;
  const team2Wins = team2Score > team1Score;

  const sideColors = {
    CT: "#00A8FF",
    T: "#FFB800",
  };

  const sizeClasses = {
    sm: { score: "text-3xl", name: "text-xs", vs: "text-sm" },
    md: { score: "text-5xl", name: "text-sm", vs: "text-lg" },
    lg: { score: "text-7xl", name: "text-base", vs: "text-xl" },
  };

  return (
    <div className="flex items-center justify-center gap-4 md:gap-8">
      {/* Team 1 */}
      <div
        className={clsx(
          "text-center transition-opacity",
          showWinner && team2Wins ? "opacity-50" : ""
        )}
      >
        <div className="text-xs text-default-500 uppercase tracking-wider mb-1">
          {team1Name}
        </div>
        <div
          className={clsx(
            sizeClasses[size].score,
            "font-black",
            electrolize.className
          )}
          style={{ color: sideColors[team1Side] }}
        >
          {team1Score}
        </div>
        {showWinner && team1Wins && (
          <div className="flex items-center justify-center gap-1 mt-1">
            <Icon icon="solar:crown-bold" width={14} className="text-[#FFB800]" />
            <span className="text-xs text-[#FFB800] font-semibold uppercase">
              Winner
            </span>
          </div>
        )}
      </div>

      {/* VS */}
      <div
        className={clsx(
          sizeClasses[size].vs,
          "font-bold text-default-400",
          electrolize.className
        )}
      >
        VS
      </div>

      {/* Team 2 */}
      <div
        className={clsx(
          "text-center transition-opacity",
          showWinner && team1Wins ? "opacity-50" : ""
        )}
      >
        <div className="text-xs text-default-500 uppercase tracking-wider mb-1">
          {team2Name}
        </div>
        <div
          className={clsx(
            sizeClasses[size].score,
            "font-black",
            electrolize.className
          )}
          style={{ color: sideColors[team2Side] }}
        >
          {team2Score}
        </div>
        {showWinner && team2Wins && (
          <div className="flex items-center justify-center gap-1 mt-1">
            <Icon icon="solar:crown-bold" width={14} className="text-[#FFB800]" />
            <span className="text-xs text-[#FFB800] font-semibold uppercase">
              Winner
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

// Progress stat with label and bar
export function ProgressStat({
  label,
  value,
  max,
  icon,
  color = "primary",
  showPercentage = true,
  suffix,
}: {
  label: string;
  value: number;
  max: number;
  icon?: string;
  color?: "default" | "primary" | "secondary" | "success" | "warning" | "danger";
  showPercentage?: boolean;
  suffix?: string;
}) {
  const percentage = max > 0 ? (value / max) * 100 : 0;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {icon && (
            <Icon icon={icon} width={14} className="text-default-500" />
          )}
          <span className="text-xs text-default-500 uppercase tracking-wider">
            {label}
          </span>
        </div>
        <span className="text-sm font-semibold">
          {value}
          {suffix}
          {showPercentage && (
            <span className="text-default-400 ml-1">
              ({percentage.toFixed(0)}%)
            </span>
          )}
        </span>
      </div>
      <Progress value={percentage} color={color} size="sm" />
    </div>
  );
}

// Stat card with esports styling
export function EsportsStatCard({
  title,
  value,
  subtitle,
  icon,
  iconColor = "#DCFF37",
  trend,
  trendValue,
  progress,
  className,
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: string;
  iconColor?: string;
  trend?: "up" | "down" | "stable";
  trendValue?: string;
  progress?: number;
  className?: string;
}) {
  return (
    <Card
      className={clsx(
        "bg-content1/50 backdrop-blur-sm border border-white/10 hover:border-[#DCFF37]/30 transition-all",
        className
      )}
    >
      <CardBody className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: `${iconColor}15` }}
          >
            <Icon icon={icon} width={22} style={{ color: iconColor }} />
          </div>
          {trend && (
            <div
              className={clsx(
                "flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full",
                trend === "up"
                  ? "bg-success/20 text-success"
                  : trend === "down"
                  ? "bg-danger/20 text-danger"
                  : "bg-default-100 text-default-500"
              )}
            >
              <Icon
                icon={
                  trend === "up"
                    ? "solar:arrow-up-bold"
                    : trend === "down"
                    ? "solar:arrow-down-bold"
                    : "solar:minus-bold"
                }
                width={12}
              />
              {trendValue}
            </div>
          )}
        </div>
        <div className="space-y-1">
          <div
            className={clsx(
              "text-2xl font-bold",
              electrolize.className
            )}
          >
            {value}
          </div>
          <div className="text-xs text-default-500 uppercase tracking-wider">
            {title}
          </div>
          {subtitle && (
            <div className="text-xs text-default-400 mt-1">{subtitle}</div>
          )}
        </div>
        {progress !== undefined && (
          <Progress
            value={Math.min(100, Math.max(0, progress))}
            className="mt-3"
            size="sm"
            classNames={{
              indicator: "bg-gradient-to-r from-[#FF4654] to-[#DCFF37]",
            }}
          />
        )}
      </CardBody>
    </Card>
  );
}

// Mini stat for compact display
export function MiniStat({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: string | number;
  icon?: string;
  color?: string;
}) {
  return (
    <Tooltip content={label}>
      <div className="flex items-center gap-1 text-xs">
        {icon && (
          <Icon
            icon={icon}
            width={12}
            style={{ color: color || "inherit" }}
            className={!color ? "text-default-400" : ""}
          />
        )}
        <span className="font-semibold" style={{ color }}>
          {value}
        </span>
      </div>
    </Tooltip>
  );
}

// Side indicator (CT/T)
export function SideIndicator({
  side,
  size = "md",
}: {
  side: "CT" | "T";
  size?: "sm" | "md" | "lg";
}) {
  const sizeClasses = {
    sm: "w-6 h-6 text-[10px]",
    md: "w-8 h-8 text-xs",
    lg: "w-10 h-10 text-sm",
  };

  const colors = {
    CT: { bg: "#00A8FF", text: "#fff" },
    T: { bg: "#FFB800", text: "#000" },
  };

  return (
    <div
      className={clsx(
        "flex items-center justify-center rounded font-bold",
        sizeClasses[size],
        electrolize.className
      )}
      style={{
        backgroundColor: colors[side].bg,
        color: colors[side].text,
      }}
    >
      {side}
    </div>
  );
}

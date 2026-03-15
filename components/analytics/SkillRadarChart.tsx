/**
 * Skill Radar Chart
 * 6-axis radar visualization of player skill dimensions
 * Overlays "current period" vs "previous period" for comparison
 * Per PRD D.6 - Player Analytics & Performance Tracking
 */

"use client";

import React, { useState } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Chip,
  Tooltip,
  Switch,
} from "@nextui-org/react";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Legend,
} from "recharts";

// ── Types ──────────────────────────────────────────────

export interface SkillDimension {
  axis: string;
  label: string;
  current: number; // 0-100 normalized score
  previous?: number; // previous period for comparison
  description: string;
  icon: string;
  rawValue?: string; // e.g. "1.32 rating" for tooltip
  rawPrevValue?: string;
}

interface SkillRadarChartProps {
  skills: SkillDimension[];
  playerName?: string;
  isLoading?: boolean;
  title?: string;
}

// ── Default skill axis definitions ─────────────────────

export const CS2_SKILL_AXES: Omit<
  SkillDimension,
  "current" | "previous" | "rawValue" | "rawPrevValue"
>[] = [
  {
    axis: "aim",
    label: "Aim",
    description:
      "Headshot accuracy, crosshair placement, and spray control",
    icon: "solar:target-bold",
  },
  {
    axis: "positioning",
    label: "Positioning",
    description:
      "Map control, rotation timing, and angle discipline",
    icon: "solar:map-point-bold",
  },
  {
    axis: "utility",
    label: "Utility",
    description:
      "Flash effectiveness, smoke placement, and molotov impact",
    icon: "solar:fire-bold",
  },
  {
    axis: "economy",
    label: "Economy",
    description:
      "Buy decisions, eco-round efficiency, and money management",
    icon: "solar:dollar-bold",
  },
  {
    axis: "clutch",
    label: "Clutch",
    description:
      "1vX success rate, post-plant play, and pressure performance",
    icon: "solar:star-bold",
  },
  {
    axis: "entry",
    label: "Entry",
    description:
      "Opening kills, trade efficiency, and first-blood rate",
    icon: "solar:running-round-bold",
  },
];

/**
 * Compute normalized skill dimensions from raw player stats
 */
export function computeSkillDimensions(stats: {
  hsPercent?: number;
  kast?: number;
  adr?: number;
  rating?: number;
  clutchWinRate?: number;
  entryWinRate?: number;
  utilityDamagePerRound?: number;
  econRating?: number;
  prevHsPercent?: number;
  prevKast?: number;
  prevAdr?: number;
  prevRating?: number;
  prevClutchWinRate?: number;
  prevEntryWinRate?: number;
  prevUtilityDamagePerRound?: number;
  prevEconRating?: number;
}): SkillDimension[] {
  const normalize = (value: number, min: number, max: number) =>
    Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100));

  return [
    {
      ...CS2_SKILL_AXES[0],
      current: normalize(stats.hsPercent ?? 0, 0, 80),
      previous: stats.prevHsPercent !== undefined
        ? normalize(stats.prevHsPercent, 0, 80)
        : undefined,
      rawValue: `${(stats.hsPercent ?? 0).toFixed(1)}% HS`,
      rawPrevValue: stats.prevHsPercent !== undefined
        ? `${stats.prevHsPercent.toFixed(1)}% HS`
        : undefined,
    },
    {
      ...CS2_SKILL_AXES[1],
      current: normalize(stats.kast ?? 0, 30, 90),
      previous: stats.prevKast !== undefined
        ? normalize(stats.prevKast, 30, 90)
        : undefined,
      rawValue: `${(stats.kast ?? 0).toFixed(1)}% KAST`,
      rawPrevValue: stats.prevKast !== undefined
        ? `${stats.prevKast.toFixed(1)}% KAST`
        : undefined,
    },
    {
      ...CS2_SKILL_AXES[2],
      current: normalize(stats.utilityDamagePerRound ?? 0, 0, 30),
      previous: stats.prevUtilityDamagePerRound !== undefined
        ? normalize(stats.prevUtilityDamagePerRound, 0, 30)
        : undefined,
      rawValue: `${(stats.utilityDamagePerRound ?? 0).toFixed(1)} util dmg/rnd`,
      rawPrevValue: stats.prevUtilityDamagePerRound !== undefined
        ? `${stats.prevUtilityDamagePerRound.toFixed(1)} util dmg/rnd`
        : undefined,
    },
    {
      ...CS2_SKILL_AXES[3],
      current: normalize(stats.econRating ?? 0, 0, 2),
      previous: stats.prevEconRating !== undefined
        ? normalize(stats.prevEconRating, 0, 2)
        : undefined,
      rawValue: `${(stats.econRating ?? 0).toFixed(2)} econ`,
      rawPrevValue: stats.prevEconRating !== undefined
        ? `${stats.prevEconRating.toFixed(2)} econ`
        : undefined,
    },
    {
      ...CS2_SKILL_AXES[4],
      current: normalize(stats.clutchWinRate ?? 0, 0, 50),
      previous: stats.prevClutchWinRate !== undefined
        ? normalize(stats.prevClutchWinRate, 0, 50)
        : undefined,
      rawValue: `${(stats.clutchWinRate ?? 0).toFixed(1)}% clutch`,
      rawPrevValue: stats.prevClutchWinRate !== undefined
        ? `${stats.prevClutchWinRate.toFixed(1)}% clutch`
        : undefined,
    },
    {
      ...CS2_SKILL_AXES[5],
      current: normalize(stats.entryWinRate ?? 0, 0, 70),
      previous: stats.prevEntryWinRate !== undefined
        ? normalize(stats.prevEntryWinRate, 0, 70)
        : undefined,
      rawValue: `${(stats.entryWinRate ?? 0).toFixed(1)}% entry`,
      rawPrevValue: stats.prevEntryWinRate !== undefined
        ? `${stats.prevEntryWinRate.toFixed(1)}% entry`
        : undefined,
    },
  ];
}

// ── Component ──────────────────────────────────────────

export function SkillRadarChart({
  skills,
  playerName,
  isLoading = false,
  title = "Skill Overview",
}: SkillRadarChartProps) {
  const [showComparison, setShowComparison] = useState(true);

  const hasPreviousData = skills.some((s) => s.previous !== undefined);

  const radarData = skills.map((s) => ({
    axis: s.label,
    current: s.current,
    previous: s.previous ?? 0,
    fullMark: 100,
  }));

  // Compute overall "score" as average of all dimensions
  const overallScore =
    skills.reduce((sum, s) => sum + s.current, 0) / (skills.length || 1);
  const prevOverall = hasPreviousData
    ? skills.reduce((sum, s) => sum + (s.previous ?? 0), 0) /
      (skills.length || 1)
    : undefined;
  const overallDelta =
    prevOverall !== undefined ? overallScore - prevOverall : undefined;

  if (isLoading) {
    return (
      <Card className="bg-content1/50 backdrop-blur-sm border border-white/10">
        <CardBody className="h-[420px] flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Icon
              icon="solar:radar-2-bold-duotone"
              className="w-12 h-12 text-default-300 animate-pulse"
            />
            <p className="text-default-500">Loading skills...</p>
          </div>
        </CardBody>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
    >
      <Card className="bg-content1/50 backdrop-blur-sm border border-white/10">
        <CardHeader className="flex items-center justify-between pb-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#006FEE]/20 flex items-center justify-center">
              <Icon
                icon="solar:radar-2-bold"
                className="text-[#006FEE]"
                width={20}
              />
            </div>
            <div>
              <h3 className="text-lg font-bold">{title}</h3>
              {playerName && (
                <p className="text-xs text-default-500">{playerName}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Overall score */}
            <div className="text-right">
              <div className="flex items-center gap-1">
                <span className="text-2xl font-bold text-primary">
                  {Math.round(overallScore)}
                </span>
                <span className="text-xs text-default-500">/100</span>
              </div>
              {overallDelta !== undefined && overallDelta !== 0 && (
                <span
                  className={`text-xs ${overallDelta > 0 ? "text-success" : "text-danger"}`}
                >
                  {overallDelta > 0 ? "+" : ""}
                  {overallDelta.toFixed(1)} vs prev
                </span>
              )}
            </div>

            {hasPreviousData && (
              <Switch
                size="sm"
                isSelected={showComparison}
                onValueChange={setShowComparison}
                classNames={{
                  wrapper: "group-data-[selected=true]:bg-[#006FEE]",
                }}
              >
                <span className="text-xs text-default-500">
                  Compare
                </span>
              </Switch>
            )}
          </div>
        </CardHeader>

        <CardBody className="pt-2">
          <div className="h-[340px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData} cx="50%" cy="50%">
                <PolarGrid
                  stroke="rgba(255,255,255,0.1)"
                  gridType="polygon"
                />
                <PolarAngleAxis
                  dataKey="axis"
                  tick={{
                    fill: "#889096",
                    fontSize: 12,
                    fontWeight: 600,
                  }}
                />
                <PolarRadiusAxis
                  angle={30}
                  domain={[0, 100]}
                  tick={{ fill: "#555", fontSize: 9 }}
                  axisLine={false}
                />

                {/* Previous period (background) */}
                {hasPreviousData && showComparison && (
                  <Radar
                    name="Previous"
                    dataKey="previous"
                    stroke="#FF465480"
                    fill="#FF4654"
                    fillOpacity={0.1}
                    strokeWidth={1}
                    strokeDasharray="4 4"
                  />
                )}

                {/* Current period (foreground) */}
                <Radar
                  name="Current"
                  dataKey="current"
                  stroke="#DCFF37"
                  fill="#DCFF37"
                  fillOpacity={0.2}
                  strokeWidth={2}
                  dot={{ fill: "#DCFF37", r: 4, strokeWidth: 0 }}
                />

                <Legend
                  iconType="circle"
                  wrapperStyle={{ fontSize: 11, color: "#889096" }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Skill breakdown pills */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
            {skills.map((skill) => {
              const delta =
                skill.previous !== undefined
                  ? skill.current - skill.previous
                  : undefined;
              return (
                <Tooltip
                  key={skill.axis}
                  content={
                    <div className="p-2 max-w-[200px]">
                      <p className="font-semibold mb-1">{skill.label}</p>
                      <p className="text-xs text-default-500 mb-2">
                        {skill.description}
                      </p>
                      {skill.rawValue && (
                        <p className="text-xs">
                          Current: <strong>{skill.rawValue}</strong>
                        </p>
                      )}
                      {skill.rawPrevValue && (
                        <p className="text-xs">
                          Previous: <strong>{skill.rawPrevValue}</strong>
                        </p>
                      )}
                    </div>
                  }
                >
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-default-50/50 border border-white/5">
                    <Icon
                      icon={skill.icon}
                      className="w-4 h-4 text-default-400"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-default-500 truncate">
                        {skill.label}
                      </p>
                      <div className="flex items-center gap-1">
                        <span className="text-sm font-bold">
                          {Math.round(skill.current)}
                        </span>
                        {delta !== undefined && delta !== 0 && (
                          <Chip
                            size="sm"
                            variant="flat"
                            className="h-4 text-[10px]"
                            color={delta > 0 ? "success" : "danger"}
                          >
                            {delta > 0 ? "+" : ""}
                            {Math.round(delta)}
                          </Chip>
                        )}
                      </div>
                    </div>
                  </div>
                </Tooltip>
              );
            })}
          </div>
        </CardBody>
      </Card>
    </motion.div>
  );
}

export default SkillRadarChart;

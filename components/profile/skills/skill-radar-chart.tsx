/**
 * Skill Radar Chart — Hexagonal SVG radar visualization
 * Professional gaming skill profile display
 *
 * Award-winning visual: animated SVG fills, branded gradients,
 * interactive hover with tooltips, responsive scaling
 */

"use client";

import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Tooltip } from "@nextui-org/react";
import { Icon } from "@iconify/react";
import {
  SkillCategory,
  SkillProfile,
  getSkillCategoryIcon,
  getSkillCategoryLabel,
  getSkillLevelLabel,
} from "@/types/replay-api/player-profile.types";

// ============================================================================
// Types
// ============================================================================

interface SkillRadarChartProps {
  profile: SkillProfile;
  size?: number;
  showLabels?: boolean;
  interactive?: boolean;
  className?: string;
}

// ============================================================================
// Constants
// ============================================================================

const CATEGORIES: SkillCategory[] = [
  "mechanical",
  "tactical",
  "leadership",
  "utility",
  "consistency",
];

const RINGS = [20, 40, 60, 80, 100];

// ============================================================================
// Geometry helpers
// ============================================================================

function polarToCartesian(
  cx: number,
  cy: number,
  radius: number,
  angleIndex: number,
  totalPoints: number
): { x: number; y: number } {
  const angle =
    (Math.PI * 2 * angleIndex) / totalPoints - Math.PI / 2; // Start from top
  return {
    x: cx + radius * Math.cos(angle),
    y: cy + radius * Math.sin(angle),
  };
}

function buildPolygonPoints(
  cx: number,
  cy: number,
  values: number[],
  maxRadius: number,
  maxValue: number
): string {
  return values
    .map((v, i) => {
      const r = (v / maxValue) * maxRadius;
      const { x, y } = polarToCartesian(cx, cy, r, i, values.length);
      return `${x},${y}`;
    })
    .join(" ");
}

// ============================================================================
// Component
// ============================================================================

export function SkillRadarChart({
  profile,
  size = 320,
  showLabels = true,
  interactive = true,
  className = "",
}: SkillRadarChartProps) {
  const [hoveredCategory, setHoveredCategory] = useState<SkillCategory | null>(
    null
  );

  const cx = size / 2;
  const cy = size / 2;
  const maxRadius = size * 0.38;
  const labelRadius = size * 0.48;

  const values = useMemo(
    () => CATEGORIES.map((cat) => profile.categories[cat] || 0),
    [profile.categories]
  );

  const skillPoints = useMemo(
    () => buildPolygonPoints(cx, cy, values, maxRadius, 100),
    [cx, cy, values, maxRadius]
  );

  return (
    <div className={`relative inline-block ${className}`}>
      <svg
        viewBox={`0 0 ${size} ${size}`}
        width={size}
        height={size}
        className="select-none"
      >
        <defs>
          {/* Gradient for the skill fill area */}
          <linearGradient
            id="skill-fill-gradient"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop
              offset="0%"
              className="[stop-color:#FF4654] dark:[stop-color:#DCFF37]"
              stopOpacity="0.4"
            />
            <stop
              offset="100%"
              className="[stop-color:#FFC700] dark:[stop-color:#34445C]"
              stopOpacity="0.2"
            />
          </linearGradient>

          {/* Gradient for the border stroke */}
          <linearGradient
            id="skill-stroke-gradient"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop
              offset="0%"
              className="[stop-color:#FF4654] dark:[stop-color:#DCFF37]"
              stopOpacity="0.9"
            />
            <stop
              offset="100%"
              className="[stop-color:#FFC700] dark:[stop-color:#34445C]"
              stopOpacity="0.7"
            />
          </linearGradient>

          {/* Glow filter */}
          <filter id="skill-glow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Background rings */}
        {RINGS.map((ringValue) => {
          const ringRadius = (ringValue / 100) * maxRadius;
          const points = CATEGORIES.map((_cat, i) => {
            const { x, y } = polarToCartesian(
              cx,
              cy,
              ringRadius,
              i,
              CATEGORIES.length
            );
            return `${x},${y}`;
          }).join(" ");

          return (
            <polygon
              key={ringValue}
              points={points}
              fill="none"
              className="stroke-[#34445C]/10 dark:stroke-[#DCFF37]/10"
              strokeWidth={ringValue === 100 ? 1.5 : 0.5}
            />
          );
        })}

        {/* Axis lines from center to vertices */}
        {CATEGORIES.map((_cat, i) => {
          const { x, y } = polarToCartesian(
            cx,
            cy,
            maxRadius,
            i,
            CATEGORIES.length
          );
          return (
            <line
              key={`axis-${i}`}
              x1={cx}
              y1={cy}
              x2={x}
              y2={y}
              className="stroke-[#34445C]/15 dark:stroke-[#DCFF37]/15"
              strokeWidth={0.5}
            />
          );
        })}

        {/* Skill data polygon — animated entrance */}
        <motion.polygon
          points={skillPoints}
          fill="url(#skill-fill-gradient)"
          stroke="url(#skill-stroke-gradient)"
          strokeWidth={2}
          filter="url(#skill-glow)"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
          style={{ transformOrigin: `${cx}px ${cy}px` }}
        />

        {/* Data points on vertices */}
        {CATEGORIES.map((cat, i) => {
          const value = profile.categories[cat] || 0;
          const r = (value / 100) * maxRadius;
          const { x, y } = polarToCartesian(cx, cy, r, i, CATEGORIES.length);
          const isHovered = hoveredCategory === cat;

          return (
            <motion.circle
              key={`point-${cat}`}
              cx={x}
              cy={y}
              r={isHovered ? 6 : 4}
              className="fill-[#FF4654] dark:fill-[#DCFF37] stroke-[#F5F0E1] dark:stroke-[#0a0a0a]"
              strokeWidth={2}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.4, delay: 0.4 + i * 0.1 }}
              style={{ cursor: interactive ? "pointer" : "default" }}
              onMouseEnter={() => interactive && setHoveredCategory(cat)}
              onMouseLeave={() => interactive && setHoveredCategory(null)}
            />
          );
        })}
      </svg>

      {/* Category labels positioned around the chart */}
      {showLabels &&
        CATEGORIES.map((cat, i) => {
          const { x, y } = polarToCartesian(
            cx,
            cy,
            labelRadius,
            i,
            CATEGORIES.length
          );
          const value = profile.categories[cat] || 0;
          const isHovered = hoveredCategory === cat;

          const label = (
            <motion.div
              key={`label-${cat}`}
              className="absolute flex flex-col items-center gap-0.5"
              style={{
                left: x,
                top: y,
                transform: "translate(-50%, -50%)",
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 + i * 0.1 }}
              onMouseEnter={() => interactive && setHoveredCategory(cat)}
              onMouseLeave={() => interactive && setHoveredCategory(null)}
            >
              <div
                className={`w-7 h-7 flex items-center justify-center transition-all duration-200 ${
                  isHovered
                    ? "bg-gradient-to-br from-[#FF4654] to-[#FFC700] dark:from-[#DCFF37] dark:to-[#34445C] scale-110"
                    : "bg-[#34445C]/10 dark:bg-[#DCFF37]/10"
                }`}
                style={{
                  clipPath:
                    "polygon(0 0, 100% 0, 100% calc(100% - 4px), calc(100% - 4px) 100%, 0 100%)",
                }}
              >
                <Icon
                  icon={getSkillCategoryIcon(cat)}
                  width={14}
                  className={
                    isHovered
                      ? "text-[#F5F0E1] dark:text-[#34445C]"
                      : "text-[#34445C] dark:text-[#DCFF37]"
                  }
                />
              </div>
              <span className="text-[10px] font-semibold text-[#34445C] dark:text-[#F5F0E1] uppercase tracking-wider whitespace-nowrap">
                {getSkillCategoryLabel(cat)}
              </span>
              <span
                className={`text-xs font-bold ${
                  isHovered
                    ? "text-[#FF4654] dark:text-[#DCFF37]"
                    : "text-default-500"
                }`}
              >
                {value}
              </span>
            </motion.div>
          );

          if (interactive) {
            return (
              <Tooltip
                key={`tooltip-${cat}`}
                content={
                  <div className="px-2 py-1 text-center">
                    <div className="font-semibold">
                      {getSkillCategoryLabel(cat)}
                    </div>
                    <div className="text-xs text-default-400">
                      Level: {value}/100 ({getSkillLevelLabel(value)})
                    </div>
                  </div>
                }
                placement="top"
                isOpen={isHovered}
              >
                {label}
              </Tooltip>
            );
          }

          return label;
        })}
    </div>
  );
}

// ============================================================================
// Mini variant for sidebar/card use
// ============================================================================

export function SkillRadarMini({
  profile,
  size = 120,
  className = "",
}: {
  profile: SkillProfile;
  size?: number;
  className?: string;
}) {
  return (
    <SkillRadarChart
      profile={profile}
      size={size}
      showLabels={false}
      interactive={false}
      className={className}
    />
  );
}

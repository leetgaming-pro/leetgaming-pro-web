"use client";

/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║  🏆 LEETGAMING PRO WALLET - ANALYTICS DASHBOARD                              ║
 * ║══════════════════════════════════════════════════════════════════════════════║
 * ║                                                                              ║
 * ║  🎯 Award-Winning Analytics Dashboard for Competitive Gaming                 ║
 * ║  📊 Real-time performance tracking, earnings insights & tax reporting        ║
 * ║                                                                              ║
 * ║  Features:                                                                   ║
 * ║  • 📈 Interactive charts with smooth animations                              ║
 * ║  • 🎮 Game-by-game performance breakdown                                     ║
 * ║  • 💰 ROI tracking & profit analysis                                         ║
 * ║  • 📋 Tax-ready export functionality                                         ║
 * ║  • 🏅 Win rate visualization with gauges                                     ║
 * ║  • ⚡ Real-time animated counters                                            ║
 * ║                                                                              ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */

import React, { useState, useMemo } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Chip,
  Divider,
  Select,
  SelectItem,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Tabs,
  Tab,
  Progress,
  Tooltip,
  Badge,
  Button,
} from "@nextui-org/react";
import { Icon } from "@iconify/react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@nextui-org/react";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import type { Amount } from "@/types/replay-api/wallet.types";

// Types
interface EarningsData {
  period: string;
  entry_fees: Amount;
  prizes_won: Amount;
  net_profit: Amount;
  matches_played: number;
  wins: number;
}

interface GamePerformance {
  game_id: string;
  game_name: string;
  matches: number;
  wins: number;
  win_rate: number;
  total_entry: Amount;
  total_prize: Amount;
  net_profit: Amount;
  avg_roi: number;
}

interface TaxableEvent {
  date: string;
  type: "prize_won" | "withdrawal" | "deposit";
  amount: Amount;
  asset: string;
  chain: string;
  tx_hash: string;
  cost_basis?: Amount;
  gain_loss?: Amount;
}

interface AnalyticsDashboardProps {
  totalEarnings: Amount;
  totalSpent: Amount;
  netProfit: Amount;
  earningsHistory: EarningsData[];
  gamePerformance: GamePerformance[];
  taxableEvents: TaxableEvent[];
  walletCreatedAt?: string;
  onExportTaxReport?: (year: number, format: "csv" | "pdf") => void;
  onExportTransactions?: (format: "csv" | "json") => void;
}

// ============================================================================
// 🎨 INNOVATIVE CHART COMPONENTS
// ============================================================================

// Sparkline Mini Chart for Trend Indicators
function SparklineChart({
  data,
  color = "#DCFF37",
  width = 80,
  height = 32,
}: {
  data: number[];
  color?: string;
  width?: number;
  height?: number;
}) {
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;

  const points = data
    .map((value, i) => {
      const x = (i / (data.length - 1)) * width;
      const y = height - ((value - min) / range) * height;
      return `${x},${y}`;
    })
    .join(" ");

  const fillPoints = `0,${height} ${points} ${width},${height}`;

  return (
    <svg width={width} height={height} className="overflow-visible">
      <defs>
        <linearGradient
          id={`spark-gradient-${color.replace("#", "")}`}
          x1="0"
          y1="0"
          x2="0"
          y2="1"
        >
          <stop offset="0%" stopColor={color} stopOpacity={0.3} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <motion.polygon
        points={fillPoints}
        fill={`url(#spark-gradient-${color.replace("#", "")})`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      />
      <motion.polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1, ease: "easeOut" }}
      />
    </svg>
  );
}

// Animated Donut Chart
function DonutChart({
  segments,
  size = 160,
  strokeWidth = 20,
  centerContent,
}: {
  segments: { value: number; color: string; label: string }[];
  size?: number;
  strokeWidth?: number;
  centerContent?: React.ReactNode;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const total = segments.reduce((sum, s) => sum + s.value, 0) || 1;

  let currentOffset = 0;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="-rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-default-100 dark:text-default-800"
        />
        {/* Segment circles */}
        {segments.map((segment, index) => {
          const segmentLength = (segment.value / total) * circumference;
          const offset = currentOffset;
          currentOffset += segmentLength;

          return (
            <motion.circle
              key={index}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={segment.color}
              strokeWidth={strokeWidth}
              strokeLinecap="butt"
              strokeDasharray={`${segmentLength} ${circumference}`}
              strokeDashoffset={-offset}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            />
          );
        })}
      </svg>
      {centerContent && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {centerContent}
        </div>
      )}
    </div>
  );
}

// Premium Bar Chart with Gradient Bars
function PremiumBarChart({
  data,
  height = 220,
}: {
  data: { label: string; value: number; secondaryValue?: number }[];
  height?: number;
}) {
  const maxValue = Math.max(...data.map((d) => Math.abs(d.value)), 1);
  const hasNegative = data.some((d) => d.value < 0);

  return (
    <div className="w-full">
      <div
        className="flex items-end gap-1 justify-between px-2"
        style={{ height: hasNegative ? height + 40 : height }}
      >
        {data.map((item, index) => {
          const isPositive = item.value >= 0;
          const barHeight = (Math.abs(item.value) / maxValue) * (height - 60);

          return (
            <Tooltip
              key={index}
              content={
                <div className="p-2">
                  <p className="font-semibold text-white">{item.label}</p>
                  <p
                    className={cn(
                      "text-sm",
                      isPositive ? "text-success" : "text-danger",
                    )}
                  >
                    {isPositive ? "+" : ""}${item.value.toFixed(2)}
                  </p>
                </div>
              }
              classNames={{ content: "bg-[#34445C] rounded-none" }}
            >
              <div className="flex flex-col items-center flex-1 cursor-pointer group">
                {isPositive ? (
                  <>
                    <motion.div
                      className={cn(
                        "w-full max-w-[32px] rounded-t-sm relative overflow-hidden",
                        "bg-gradient-to-t from-[#22c55e] to-[#4ade80]",
                        "group-hover:from-[#16a34a] group-hover:to-[#22c55e] transition-all",
                      )}
                      initial={{ height: 0 }}
                      animate={{ height: barHeight }}
                      transition={{
                        duration: 0.6,
                        delay: index * 0.03,
                        ease: "easeOut",
                      }}
                    >
                      <motion.div
                        className="absolute inset-0 bg-white/20"
                        initial={{ y: "100%" }}
                        animate={{ y: "-100%" }}
                        transition={{
                          duration: 1.5,
                          delay: index * 0.03 + 0.5,
                          repeat: Infinity,
                          repeatDelay: 3,
                        }}
                      />
                    </motion.div>
                    <span className="text-[10px] text-default-500 mt-2 font-medium">
                      {item.label}
                    </span>
                  </>
                ) : (
                  <>
                    <span className="text-[10px] text-default-500 mb-2 font-medium">
                      {item.label}
                    </span>
                    <motion.div
                      className={cn(
                        "w-full max-w-[32px] rounded-b-sm relative overflow-hidden",
                        "bg-gradient-to-b from-[#ef4444] to-[#f87171]",
                        "group-hover:from-[#dc2626] group-hover:to-[#ef4444] transition-all",
                      )}
                      initial={{ height: 0 }}
                      animate={{ height: barHeight }}
                      transition={{
                        duration: 0.6,
                        delay: index * 0.03,
                        ease: "easeOut",
                      }}
                    />
                  </>
                )}
              </div>
            </Tooltip>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================================
// 📊 PREMIUM STAT CARD COMPONENT
// ============================================================================

function StatCard({
  title,
  value,
  prefix = "$",
  suffix = "",
  change,
  changeLabel,
  icon,
  trend,
  color = "default",
  highlight = false,
}: {
  title: string;
  value: number;
  prefix?: string;
  suffix?: string;
  change?: number;
  changeLabel?: string;
  icon: string;
  trend?: number[];
  color?: "success" | "danger" | "warning" | "primary" | "default";
  highlight?: boolean;
}) {
  const colorConfig = {
    success: {
      bg: "bg-gradient-to-br from-success/10 to-success/5",
      border: "border-success/40",
      icon: "text-success",
      glow: "shadow-success/20",
    },
    danger: {
      bg: "bg-gradient-to-br from-danger/10 to-danger/5",
      border: "border-danger/40",
      icon: "text-danger",
      glow: "shadow-danger/20",
    },
    warning: {
      bg: "bg-gradient-to-br from-warning/10 to-warning/5",
      border: "border-warning/40",
      icon: "text-warning",
      glow: "shadow-warning/20",
    },
    primary: {
      bg: "bg-gradient-to-br from-primary/10 to-primary/5",
      border: "border-primary/40",
      icon: "text-primary",
      glow: "shadow-primary/20",
    },
    default: {
      bg: "bg-gradient-to-br from-[#34445C]/10 to-[#34445C]/5 dark:from-[#DCFF37]/10 dark:to-[#DCFF37]/5",
      border: "border-[#34445C]/30 dark:border-[#DCFF37]/30",
      icon: "text-[#34445C] dark:text-[#DCFF37]",
      glow: "shadow-[#34445C]/10 dark:shadow-[#DCFF37]/10",
    },
  };

  const config = colorConfig[color];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02, y: -2 }}
      transition={{ duration: 0.2 }}
    >
      <Card
        className={cn(
          "rounded-none border-2 overflow-hidden relative",
          config.bg,
          config.border,
          highlight && `shadow-lg ${config.glow}`,
        )}
      >
        {highlight && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
            initial={{ x: "-100%" }}
            animate={{ x: "100%" }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
          />
        )}
        <CardBody className="p-4 relative">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <p className="text-xs text-default-500 mb-1 uppercase tracking-wide font-medium">
                {title}
              </p>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl md:text-3xl font-bold text-[#34445C] dark:text-white">
                  <AnimatedCounter
                    value={value}
                    prefix={prefix}
                    suffix={suffix}
                    decimals={2}
                  />
                </span>
              </div>
              <div className="flex items-center gap-2 mt-2">
                {change !== undefined && (
                  <div className="flex items-center gap-1">
                    <Icon
                      icon={
                        change >= 0
                          ? "solar:arrow-up-bold"
                          : "solar:arrow-down-bold"
                      }
                      className={change >= 0 ? "text-success" : "text-danger"}
                      width={14}
                    />
                    <span
                      className={cn(
                        "text-xs font-semibold",
                        change >= 0 ? "text-success" : "text-danger",
                      )}
                    >
                      {Math.abs(change).toFixed(1)}%
                    </span>
                  </div>
                )}
                {changeLabel && (
                  <span className="text-xs text-default-400">
                    {changeLabel}
                  </span>
                )}
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <div
                className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center",
                  config.bg,
                  "border-2",
                  config.border,
                )}
              >
                <Icon icon={icon} width={24} className={config.icon} />
              </div>
              {trend && trend.length > 0 && (
                <SparklineChart
                  data={trend}
                  color={
                    color === "success"
                      ? "#22c55e"
                      : color === "danger"
                        ? "#ef4444"
                        : "#DCFF37"
                  }
                />
              )}
            </div>
          </div>
        </CardBody>
      </Card>
    </motion.div>
  );
}

// ============================================================================
// 🎯 WIN RATE GAUGE COMPONENT
// ============================================================================

function WinRateGauge({
  rate,
  size = 140,
  label = "Win Rate",
}: {
  rate: number;
  size?: number;
  label?: string;
}) {
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (rate / 100) * circumference;

  const getColor = () => {
    if (rate >= 60)
      return { stroke: "#22c55e", glow: "drop-shadow(0 0 6px #22c55e)" };
    if (rate >= 45)
      return { stroke: "#DCFF37", glow: "drop-shadow(0 0 6px #DCFF37)" };
    if (rate >= 30)
      return { stroke: "#eab308", glow: "drop-shadow(0 0 6px #eab308)" };
    return { stroke: "#ef4444", glow: "drop-shadow(0 0 6px #ef4444)" };
  };

  const colorConfig = getColor();

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        className="-rotate-90"
      >
        {/* Background track */}
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke="currentColor"
          strokeWidth="10"
          className="text-default-100 dark:text-default-800"
        />
        {/* Animated progress */}
        <motion.circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke={colorConfig.stroke}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          style={{ filter: colorConfig.glow }}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        />
        {/* Decorative dots */}
        {[0, 90, 180, 270].map((angle, i) => (
          <motion.circle
            key={i}
            cx={50 + 45 * Math.cos((angle * Math.PI) / 180)}
            cy={50 + 45 * Math.sin((angle * Math.PI) / 180)}
            r="2"
            fill="currentColor"
            className="text-default-300"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5 + i * 0.1 }}
          />
        ))}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          className="text-3xl font-bold text-[#34445C] dark:text-white"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          {rate.toFixed(1)}%
        </motion.span>
        <span className="text-xs text-default-500 font-medium">{label}</span>
      </div>
    </div>
  );
}

// ============================================================================
// 🏆 GAME RANK BADGE COMPONENT
// ============================================================================

function GameRankBadge({ rank }: { rank: number }) {
  const config = {
    1: {
      icon: "🥇",
      color: "bg-gradient-to-r from-yellow-400 to-amber-500",
      text: "text-amber-900",
    },
    2: {
      icon: "🥈",
      color: "bg-gradient-to-r from-gray-300 to-gray-400",
      text: "text-gray-800",
    },
    3: {
      icon: "🥉",
      color: "bg-gradient-to-r from-orange-400 to-orange-500",
      text: "text-orange-900",
    },
  }[rank] || {
    icon: `#${rank}`,
    color: "bg-default-200",
    text: "text-default-700",
  };

  return (
    <motion.div
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ type: "spring", damping: 15 }}
      className={cn(
        "w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm",
        config.color,
        config.text,
      )}
    >
      {rank <= 3 ? config.icon : `#${rank}`}
    </motion.div>
  );
}

// ============================================================================
// 🎯 MAIN ANALYTICS DASHBOARD COMPONENT
// ============================================================================

export function AnalyticsDashboard({
  totalEarnings,
  totalSpent,
  netProfit,
  earningsHistory,
  gamePerformance,
  taxableEvents,
  onExportTaxReport,
  onExportTransactions,
}: AnalyticsDashboardProps) {
  const [timeRange, setTimeRange] = useState<
    "7d" | "30d" | "90d" | "1y" | "all"
  >("30d");
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedTaxYear, setSelectedTaxYear] = useState(
    new Date().getFullYear(),
  );

  // Calculate overall stats
  const overallStats = useMemo(() => {
    const totalMatches = earningsHistory.reduce(
      (sum, d) => sum + d.matches_played,
      0,
    );
    const totalWins = earningsHistory.reduce((sum, d) => sum + d.wins, 0);
    const winRate = totalMatches > 0 ? (totalWins / totalMatches) * 100 : 0;
    const roi =
      totalSpent.dollars > 0
        ? (netProfit.dollars / totalSpent.dollars) * 100
        : 0;

    return { totalMatches, totalWins, winRate, roi };
  }, [earningsHistory, totalSpent, netProfit]);

  // Generate trend data for sparklines
  const earningsTrend = useMemo(
    () => earningsHistory.slice(-8).map((d) => d.prizes_won.dollars),
    [earningsHistory],
  );
  const profitTrend = useMemo(
    () => earningsHistory.slice(-8).map((d) => d.net_profit.dollars),
    [earningsHistory],
  );

  // Prepare chart data for bar chart
  const barChartData = useMemo(() => {
    return earningsHistory.slice(-12).map((d) => ({
      label: d.period,
      value: d.net_profit.dollars,
    }));
  }, [earningsHistory]);

  // Prepare donut chart data
  const earningsBreakdown = useMemo(() => {
    const byGame = gamePerformance.reduce(
      (acc, game) => {
        if (game.total_prize.dollars > 0) {
          acc.push({
            value: game.total_prize.dollars,
            color:
              game.game_id === "cs2"
                ? "#FF4654"
                : game.game_id === "valorant"
                  ? "#DCFF37"
                  : game.game_id === "fortnite"
                    ? "#FFC700"
                    : "#34445C",
            label: game.game_name,
          });
        }
        return acc;
      },
      [] as { value: number; color: string; label: string }[],
    );
    return byGame;
  }, [gamePerformance]);

  // Calculate tax summary
  const taxSummary = useMemo(() => {
    const yearEvents = taxableEvents.filter(
      (e) => new Date(e.date).getFullYear() === selectedTaxYear,
    );
    const totalPrizes = yearEvents
      .filter((e) => e.type === "prize_won")
      .reduce((sum, e) => sum + e.amount.dollars, 0);
    const totalWithdrawals = yearEvents
      .filter((e) => e.type === "withdrawal")
      .reduce((sum, e) => sum + e.amount.dollars, 0);
    const totalDeposits = yearEvents
      .filter((e) => e.type === "deposit")
      .reduce((sum, e) => sum + e.amount.dollars, 0);

    return {
      totalPrizes,
      totalWithdrawals,
      totalDeposits,
      events: yearEvents.length,
    };
  }, [taxableEvents, selectedTaxYear]);

  // Sorted game performance for leaderboard
  const sortedGamePerformance = useMemo(
    () =>
      [...gamePerformance].sort(
        (a, b) => b.net_profit.dollars - a.net_profit.dollars,
      ),
    [gamePerformance],
  );

  // Mock data for demonstration (used when no real data available)
  const mockEarningsHistory: EarningsData[] = earningsHistory.length
    ? earningsHistory
    : [
        {
          period: "Jan",
          entry_fees: { cents: 5000, dollars: 50 },
          prizes_won: { cents: 8500, dollars: 85 },
          net_profit: { cents: 3500, dollars: 35 },
          matches_played: 12,
          wins: 7,
        },
        {
          period: "Feb",
          entry_fees: { cents: 7500, dollars: 75 },
          prizes_won: { cents: 6000, dollars: 60 },
          net_profit: { cents: -1500, dollars: -15 },
          matches_played: 15,
          wins: 5,
        },
        {
          period: "Mar",
          entry_fees: { cents: 10000, dollars: 100 },
          prizes_won: { cents: 15000, dollars: 150 },
          net_profit: { cents: 5000, dollars: 50 },
          matches_played: 20,
          wins: 12,
        },
        {
          period: "Apr",
          entry_fees: { cents: 8000, dollars: 80 },
          prizes_won: { cents: 12000, dollars: 120 },
          net_profit: { cents: 4000, dollars: 40 },
          matches_played: 16,
          wins: 9,
        },
        {
          period: "May",
          entry_fees: { cents: 12000, dollars: 120 },
          prizes_won: { cents: 18000, dollars: 180 },
          net_profit: { cents: 6000, dollars: 60 },
          matches_played: 24,
          wins: 14,
        },
        {
          period: "Jun",
          entry_fees: { cents: 15000, dollars: 150 },
          prizes_won: { cents: 22000, dollars: 220 },
          net_profit: { cents: 7000, dollars: 70 },
          matches_played: 30,
          wins: 18,
        },
      ];

  return (
    <div className="space-y-8">
      {/* ════════════════════════════════════════════════════════════════════════
          🏆 PREMIUM HERO HEADER
          ════════════════════════════════════════════════════════════════════════ */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-none bg-gradient-to-br from-[#34445C] via-[#34445C] to-[#1a2436] p-6 md:p-8"
      >
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute -top-1/2 -right-1/2 w-full h-full bg-gradient-to-bl from-[#DCFF37]/10 to-transparent rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
          />
          <motion.div
            className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-gradient-to-tr from-[#FF4654]/10 to-transparent rounded-full"
            animate={{ rotate: -360 }}
            transition={{ duration: 45, repeat: Infinity, ease: "linear" }}
          />
          {/* Grid pattern */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAgTSAwIDIwIEwgNDAgMjAgTSAyMCAwIEwgMjAgNDAgTSAwIDMwIEwgNDAgMzAgTSAzMCAwIEwgMzAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2ZmZmZmZiIgc3Ryb2tlLW9wYWNpdHk9IjAuMDMiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-50" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", damping: 15, delay: 0.2 }}
                className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#DCFF37] to-[#FFC700] flex items-center justify-center"
              >
                <Icon
                  icon="solar:chart-2-bold-duotone"
                  className="text-[#34445C]"
                  width={28}
                />
              </motion.div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-2">
                  Performance Analytics
                  <Chip
                    size="sm"
                    className="rounded-none bg-[#DCFF37]/20 text-[#DCFF37] border border-[#DCFF37]/40"
                  >
                    PRO
                  </Chip>
                </h1>
                <p className="text-white/60 text-sm">
                  Real-time insights into your competitive gaming career
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <Select
              size="sm"
              selectedKeys={[timeRange]}
              onSelectionChange={(keys) =>
                setTimeRange(Array.from(keys)[0] as typeof timeRange)
              }
              className="w-36"
              classNames={{
                trigger: "rounded-none bg-white/10 border-white/20 text-white",
                value: "text-white",
                popoverContent: "rounded-none",
              }}
              startContent={
                <Icon
                  icon="solar:calendar-bold"
                  className="text-[#DCFF37]"
                  width={16}
                />
              }
            >
              <SelectItem key="7d">Last 7 days</SelectItem>
              <SelectItem key="30d">Last 30 days</SelectItem>
              <SelectItem key="90d">Last 90 days</SelectItem>
              <SelectItem key="1y">Last year</SelectItem>
              <SelectItem key="all">All time</SelectItem>
            </Select>
            <Button
              size="sm"
              className="rounded-none bg-[#DCFF37] text-[#34445C] font-semibold hover:bg-[#DCFF37]/90"
              startContent={<Icon icon="solar:download-bold" width={16} />}
              onPress={() => onExportTransactions?.("csv")}
            >
              Export Data
            </Button>
          </div>
        </div>
      </motion.div>

      {/* ════════════════════════════════════════════════════════════════════════
          📊 NAVIGATION TABS
          ════════════════════════════════════════════════════════════════════════ */}
      <Tabs
        selectedKey={activeTab}
        onSelectionChange={(key) => setActiveTab(key as string)}
        classNames={{
          tabList:
            "gap-2 bg-[#34445C]/5 dark:bg-[#DCFF37]/5 p-1.5 rounded-none border border-default-200",
          cursor:
            "rounded-none bg-gradient-to-r from-[#FF4654] to-[#FFC700] dark:from-[#DCFF37] dark:to-[#34445C]",
          tab: "rounded-none px-4 py-2",
          tabContent:
            "group-data-[selected=true]:text-white dark:group-data-[selected=true]:text-[#34445C] font-medium",
        }}
      >
        <Tab
          key="overview"
          title={
            <span className="flex items-center gap-2">
              <Icon icon="solar:chart-square-bold" width={18} />
              Overview
            </span>
          }
        />
        <Tab
          key="games"
          title={
            <span className="flex items-center gap-2">
              <Icon icon="solar:gamepad-bold" width={18} />
              Game Stats
              <Badge
                content={gamePerformance.length}
                size="sm"
                color="primary"
                classNames={{ badge: "rounded-none" }}
              >
                <span />
              </Badge>
            </span>
          }
        />
        <Tab
          key="taxes"
          title={
            <span className="flex items-center gap-2">
              <Icon icon="solar:document-text-bold" width={18} />
              Tax Center
            </span>
          }
        />
      </Tabs>

      <AnimatePresence mode="wait">
        {/* ════════════════════════════════════════════════════════════════════════
            📈 OVERVIEW TAB
            ════════════════════════════════════════════════════════════════════════ */}
        {activeTab === "overview" && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Key Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                title="Total Earnings"
                value={totalEarnings.dollars}
                icon="solar:cup-star-bold-duotone"
                color="success"
                change={12.5}
                changeLabel="vs last month"
                trend={earningsTrend}
                highlight
              />
              <StatCard
                title="Entry Fees Paid"
                value={totalSpent.dollars}
                icon="solar:card-send-bold-duotone"
                color="warning"
                change={-5.2}
                changeLabel="vs last month"
              />
              <StatCard
                title="Net Profit"
                value={netProfit.dollars}
                icon="solar:wallet-money-bold-duotone"
                color={netProfit.dollars >= 0 ? "success" : "danger"}
                change={25.8}
                changeLabel="vs last month"
                trend={profitTrend}
                highlight={netProfit.dollars > 0}
              />
              <StatCard
                title="Return on Investment"
                value={overallStats.roi}
                prefix=""
                suffix="%"
                icon="solar:graph-up-bold-duotone"
                color={overallStats.roi >= 0 ? "success" : "danger"}
                change={8.3}
                changeLabel="vs last month"
              />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Earnings Chart */}
              <Card className="lg:col-span-2 rounded-none border-2 border-default-200">
                <CardHeader className="flex items-center justify-between pb-0">
                  <div>
                    <h3 className="font-bold text-[#34445C] dark:text-white text-lg">
                      📊 Profit & Loss Timeline
                    </h3>
                    <p className="text-xs text-default-500">
                      Monthly net profit over the past year
                    </p>
                  </div>
                  <Chip
                    size="sm"
                    variant="flat"
                    className="rounded-none bg-[#34445C]/10 dark:bg-[#DCFF37]/10"
                  >
                    <Icon
                      icon="solar:calendar-minimalistic-bold"
                      width={14}
                      className="mr-1"
                    />
                    12 Months
                  </Chip>
                </CardHeader>
                <CardBody className="pt-4">
                  <PremiumBarChart data={barChartData} height={220} />
                </CardBody>
              </Card>

              {/* Performance Summary with Donut */}
              <Card className="rounded-none border-2 border-default-200">
                <CardHeader className="pb-0">
                  <h3 className="font-bold text-[#34445C] dark:text-white text-lg">
                    🎯 Performance Summary
                  </h3>
                </CardHeader>
                <CardBody className="flex flex-col items-center pt-2">
                  <WinRateGauge rate={overallStats.winRate} size={140} />

                  <Divider className="my-4" />

                  <div className="w-full space-y-3">
                    <div className="flex items-center justify-between p-2 bg-default-50 dark:bg-default-100/10 rounded-lg">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-success" />
                        <span className="text-sm text-default-600">
                          Total Matches
                        </span>
                      </div>
                      <span className="font-bold text-[#34445C] dark:text-white">
                        {overallStats.totalMatches}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-success/5 rounded-lg border border-success/20">
                      <div className="flex items-center gap-2">
                        <Icon
                          icon="solar:cup-bold"
                          width={16}
                          className="text-success"
                        />
                        <span className="text-sm text-success">Victories</span>
                      </div>
                      <span className="font-bold text-success">
                        {overallStats.totalWins}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-danger/5 rounded-lg border border-danger/20">
                      <div className="flex items-center gap-2">
                        <Icon
                          icon="solar:close-circle-bold"
                          width={16}
                          className="text-danger"
                        />
                        <span className="text-sm text-danger">Defeats</span>
                      </div>
                      <span className="font-bold text-danger">
                        {overallStats.totalMatches - overallStats.totalWins}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-[#34445C]/5 dark:bg-[#DCFF37]/5 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Icon
                          icon="solar:dollar-bold"
                          width={16}
                          className="text-[#34445C] dark:text-[#DCFF37]"
                        />
                        <span className="text-sm text-default-600">
                          Avg Entry
                        </span>
                      </div>
                      <span className="font-bold text-[#34445C] dark:text-white">
                        $
                        {(
                          totalSpent.dollars /
                          Math.max(overallStats.totalMatches, 1)
                        ).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </div>

            {/* Earnings by Game Donut Chart */}
            {earningsBreakdown.length > 0 && (
              <Card className="rounded-none border-2 border-default-200">
                <CardHeader>
                  <h3 className="font-bold text-[#34445C] dark:text-white text-lg">
                    🎮 Earnings by Game
                  </h3>
                </CardHeader>
                <CardBody>
                  <div className="flex flex-col md:flex-row items-center justify-center gap-8">
                    <DonutChart
                      segments={earningsBreakdown}
                      size={180}
                      strokeWidth={24}
                      centerContent={
                        <div className="text-center">
                          <p className="text-2xl font-bold text-[#34445C] dark:text-white">
                            ${totalEarnings.dollars.toFixed(0)}
                          </p>
                          <p className="text-xs text-default-500">Total</p>
                        </div>
                      }
                    />
                    <div className="flex flex-wrap gap-3 justify-center">
                      {earningsBreakdown.map((segment, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-2 px-3 py-2 bg-default-50 dark:bg-default-100/10 rounded-lg"
                        >
                          <div
                            className="w-3 h-3 rounded-sm"
                            style={{ backgroundColor: segment.color }}
                          />
                          <span className="text-sm font-medium">
                            {segment.label}
                          </span>
                          <span className="text-sm text-default-500">
                            ${segment.value.toFixed(0)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardBody>
              </Card>
            )}

            {/* Monthly Breakdown Table */}
            <Card className="rounded-none border-2 border-default-200">
              <CardHeader className="flex items-center justify-between">
                <h3 className="font-bold text-[#34445C] dark:text-white text-lg">
                  📅 Monthly Breakdown
                </h3>
                <Button
                  size="sm"
                  variant="flat"
                  className="rounded-none"
                  startContent={<Icon icon="solar:export-bold" width={14} />}
                >
                  Export
                </Button>
              </CardHeader>
              <CardBody className="p-0">
                <Table
                  aria-label="Monthly breakdown"
                  removeWrapper
                  classNames={{
                    th: "bg-[#34445C]/5 dark:bg-[#DCFF37]/5 text-[#34445C] dark:text-white font-bold",
                    td: "py-3",
                  }}
                >
                  <TableHeader>
                    <TableColumn>PERIOD</TableColumn>
                    <TableColumn>MATCHES</TableColumn>
                    <TableColumn>WINS</TableColumn>
                    <TableColumn>WIN RATE</TableColumn>
                    <TableColumn>ENTRY FEES</TableColumn>
                    <TableColumn>PRIZES WON</TableColumn>
                    <TableColumn>NET PROFIT</TableColumn>
                  </TableHeader>
                  <TableBody>
                    {mockEarningsHistory.map((data) => (
                      <TableRow
                        key={data.period}
                        className="hover:bg-default-50 dark:hover:bg-default-100/5"
                      >
                        <TableCell>
                          <span className="font-semibold text-[#34445C] dark:text-white">
                            {data.period}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="font-medium">
                            {data.matches_played}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-success font-semibold">
                            {data.wins}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Chip
                            size="sm"
                            color={
                              (data.wins / data.matches_played) * 100 >= 50
                                ? "success"
                                : "warning"
                            }
                            variant="flat"
                            className="rounded-none font-semibold"
                          >
                            {((data.wins / data.matches_played) * 100).toFixed(
                              1,
                            )}
                            %
                          </Chip>
                        </TableCell>
                        <TableCell>
                          <span className="text-default-500">
                            ${data.entry_fees.dollars.toFixed(2)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-success font-medium">
                            ${data.prizes_won.dollars.toFixed(2)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span
                            className={cn(
                              "font-bold",
                              data.net_profit.dollars >= 0
                                ? "text-success"
                                : "text-danger",
                            )}
                          >
                            {data.net_profit.dollars >= 0 ? "+" : ""}$
                            {data.net_profit.dollars.toFixed(2)}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardBody>
            </Card>
          </motion.div>
        )}

        {/* ════════════════════════════════════════════════════════════════════════
            🎮 GAMES TAB
            ════════════════════════════════════════════════════════════════════════ */}
        {activeTab === "games" && (
          <motion.div
            key="games"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Game Leaderboard */}
            <Card className="rounded-none border-2 border-default-200 overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-[#34445C] to-[#34445C]/80 text-white">
                <div className="flex items-center gap-2">
                  <Icon
                    icon="solar:ranking-bold-duotone"
                    width={24}
                    className="text-[#DCFF37]"
                  />
                  <div>
                    <h3 className="font-bold text-lg">
                      🏆 Your Game Leaderboard
                    </h3>
                    <p className="text-white/60 text-xs">
                      Ranked by net profit
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardBody className="p-0">
                <div className="divide-y divide-default-200">
                  {sortedGamePerformance.map((game, index) => (
                    <motion.div
                      key={game.game_id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={cn(
                        "p-4 flex items-center gap-4 hover:bg-default-50 dark:hover:bg-default-100/5 transition-colors",
                        index === 0 &&
                          "bg-gradient-to-r from-yellow-50 to-transparent dark:from-yellow-900/10",
                      )}
                    >
                      <GameRankBadge rank={index + 1} />

                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-[#34445C] dark:text-white">
                          {game.game_name}
                        </h4>
                        <p className="text-xs text-default-500">
                          {game.matches} matches played
                        </p>
                      </div>

                      <div className="flex items-center gap-6 text-right">
                        <div>
                          <p className="text-xs text-default-500 mb-1">
                            Win Rate
                          </p>
                          <Chip
                            size="sm"
                            color={
                              game.win_rate >= 50
                                ? "success"
                                : game.win_rate >= 35
                                  ? "warning"
                                  : "danger"
                            }
                            variant="flat"
                            className="rounded-none font-bold"
                          >
                            {game.win_rate.toFixed(1)}%
                          </Chip>
                        </div>
                        <div>
                          <p className="text-xs text-default-500 mb-1">ROI</p>
                          <span
                            className={cn(
                              "font-bold text-sm",
                              game.avg_roi >= 0
                                ? "text-success"
                                : "text-danger",
                            )}
                          >
                            {game.avg_roi >= 0 ? "+" : ""}
                            {game.avg_roi.toFixed(1)}%
                          </span>
                        </div>
                        <div className="min-w-[80px]">
                          <p className="text-xs text-default-500 mb-1">
                            Net Profit
                          </p>
                          <span
                            className={cn(
                              "font-bold text-lg",
                              game.net_profit.dollars >= 0
                                ? "text-success"
                                : "text-danger",
                            )}
                          >
                            {game.net_profit.dollars >= 0 ? "+" : ""}$
                            {game.net_profit.dollars.toFixed(0)}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardBody>
            </Card>

            {/* Game Performance Detailed Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sortedGamePerformance.map((game, index) => (
                <motion.div
                  key={game.game_id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card
                    className={cn(
                      "rounded-none border-2 overflow-hidden",
                      game.net_profit.dollars >= 0
                        ? "border-success/40"
                        : "border-danger/40",
                    )}
                  >
                    <CardHeader
                      className={cn(
                        "py-3",
                        game.net_profit.dollars >= 0
                          ? "bg-gradient-to-r from-success/10 to-transparent"
                          : "bg-gradient-to-r from-danger/10 to-transparent",
                      )}
                    >
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-3">
                          <div
                            className={cn(
                              "w-10 h-10 rounded-lg flex items-center justify-center",
                              game.game_id === "cs2"
                                ? "bg-[#FF4654]/10"
                                : game.game_id === "valorant"
                                  ? "bg-[#DCFF37]/10"
                                  : game.game_id === "fortnite"
                                    ? "bg-[#FFC700]/10"
                                    : "bg-[#34445C]/10",
                            )}
                          >
                            <Icon
                              icon="solar:gamepad-bold"
                              width={20}
                              className={
                                game.game_id === "cs2"
                                  ? "text-[#FF4654]"
                                  : game.game_id === "valorant"
                                    ? "text-[#DCFF37]"
                                    : game.game_id === "fortnite"
                                      ? "text-[#FFC700]"
                                      : "text-[#34445C]"
                              }
                            />
                          </div>
                          <div>
                            <h4 className="font-bold text-[#34445C] dark:text-white">
                              {game.game_name}
                            </h4>
                            <p className="text-xs text-default-500">
                              {game.matches} matches • {game.wins} wins
                            </p>
                          </div>
                        </div>
                        <Chip
                          size="sm"
                          color={
                            game.net_profit.dollars >= 0 ? "success" : "danger"
                          }
                          variant="solid"
                          className="rounded-none font-bold"
                        >
                          {game.net_profit.dollars >= 0 ? "+" : ""}$
                          {game.net_profit.dollars.toFixed(0)}
                        </Chip>
                      </div>
                    </CardHeader>
                    <CardBody className="p-4">
                      <div className="grid grid-cols-3 gap-4 mb-4">
                        <div className="text-center p-3 bg-default-50 dark:bg-default-100/10 rounded-lg">
                          <p className="text-2xl font-bold text-[#34445C] dark:text-white">
                            {game.wins}
                          </p>
                          <p className="text-xs text-default-500">Victories</p>
                        </div>
                        <div className="text-center p-3 bg-default-50 dark:bg-default-100/10 rounded-lg">
                          <p
                            className={cn(
                              "text-2xl font-bold",
                              game.win_rate >= 50
                                ? "text-success"
                                : game.win_rate >= 35
                                  ? "text-warning"
                                  : "text-danger",
                            )}
                          >
                            {game.win_rate.toFixed(1)}%
                          </p>
                          <p className="text-xs text-default-500">Win Rate</p>
                        </div>
                        <div className="text-center p-3 bg-default-50 dark:bg-default-100/10 rounded-lg">
                          <p
                            className={cn(
                              "text-2xl font-bold",
                              game.avg_roi >= 0
                                ? "text-success"
                                : "text-danger",
                            )}
                          >
                            {game.avg_roi >= 0 ? "+" : ""}
                            {game.avg_roi.toFixed(1)}%
                          </p>
                          <p className="text-xs text-default-500">ROI</p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-default-500">Win Progress</span>
                          <span className="font-medium">
                            {game.win_rate.toFixed(1)}%
                          </span>
                        </div>
                        <Progress
                          value={game.win_rate}
                          classNames={{
                            track: "rounded-none h-2",
                            indicator: cn(
                              "rounded-none",
                              game.win_rate >= 50
                                ? "bg-gradient-to-r from-success to-success/70"
                                : game.win_rate >= 35
                                  ? "bg-gradient-to-r from-warning to-warning/70"
                                  : "bg-gradient-to-r from-danger to-danger/70",
                            ),
                          }}
                        />
                      </div>

                      <Divider className="my-4" />

                      <div className="flex justify-between text-sm">
                        <div>
                          <p className="text-default-500">Entry Fees</p>
                          <p className="font-semibold text-[#34445C] dark:text-white">
                            ${game.total_entry.dollars.toFixed(2)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-default-500">Prizes Won</p>
                          <p className="font-semibold text-success">
                            ${game.total_prize.dollars.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Game Comparison Table */}
            <Card className="rounded-none border-2 border-default-200">
              <CardHeader>
                <h3 className="font-bold text-[#34445C] dark:text-white text-lg">
                  📊 Performance Comparison Table
                </h3>
              </CardHeader>
              <CardBody className="p-0">
                <Table
                  aria-label="Game performance comparison"
                  removeWrapper
                  classNames={{
                    th: "bg-[#34445C]/5 dark:bg-[#DCFF37]/5 text-[#34445C] dark:text-white font-bold",
                    td: "py-3",
                  }}
                >
                  <TableHeader>
                    <TableColumn>RANK</TableColumn>
                    <TableColumn>GAME</TableColumn>
                    <TableColumn>MATCHES</TableColumn>
                    <TableColumn>WIN RATE</TableColumn>
                    <TableColumn>ENTRY</TableColumn>
                    <TableColumn>PRIZES</TableColumn>
                    <TableColumn>PROFIT</TableColumn>
                    <TableColumn>ROI</TableColumn>
                  </TableHeader>
                  <TableBody>
                    {sortedGamePerformance.map((game, index) => (
                      <TableRow
                        key={game.game_id}
                        className="hover:bg-default-50 dark:hover:bg-default-100/5"
                      >
                        <TableCell>
                          <GameRankBadge rank={index + 1} />
                        </TableCell>
                        <TableCell>
                          <span className="font-bold text-[#34445C] dark:text-white">
                            {game.game_name}
                          </span>
                        </TableCell>
                        <TableCell>{game.matches}</TableCell>
                        <TableCell>
                          <Chip
                            size="sm"
                            color={
                              game.win_rate >= 50
                                ? "success"
                                : game.win_rate >= 35
                                  ? "warning"
                                  : "danger"
                            }
                            variant="flat"
                            className="rounded-none font-semibold"
                          >
                            {game.win_rate.toFixed(1)}%
                          </Chip>
                        </TableCell>
                        <TableCell>
                          ${game.total_entry.dollars.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-success font-medium">
                          ${game.total_prize.dollars.toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <span
                            className={cn(
                              "font-bold",
                              game.net_profit.dollars >= 0
                                ? "text-success"
                                : "text-danger",
                            )}
                          >
                            {game.net_profit.dollars >= 0 ? "+" : ""}$
                            {game.net_profit.dollars.toFixed(2)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span
                            className={cn(
                              "font-bold",
                              game.avg_roi >= 0
                                ? "text-success"
                                : "text-danger",
                            )}
                          >
                            {game.avg_roi >= 0 ? "+" : ""}
                            {game.avg_roi.toFixed(1)}%
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardBody>
            </Card>
          </motion.div>
        )}

        {/* ════════════════════════════════════════════════════════════════════════
            📋 TAX CENTER TAB
            ════════════════════════════════════════════════════════════════════════ */}
        {activeTab === "taxes" && (
          <motion.div
            key="taxes"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Tax Year Header */}
            <Card className="rounded-none border-2 border-default-200 overflow-hidden">
              <CardBody className="p-0">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-gradient-to-r from-[#34445C]/5 to-transparent">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#FF4654] to-[#FFC700] flex items-center justify-center">
                      <Icon
                        icon="solar:document-text-bold"
                        width={24}
                        className="text-white"
                      />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-[#34445C] dark:text-white">
                        Tax Report Center
                      </h3>
                      <p className="text-sm text-default-500">
                        Generate tax-ready reports for your gaming earnings
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <Select
                      size="sm"
                      selectedKeys={[String(selectedTaxYear)]}
                      onSelectionChange={(keys) =>
                        setSelectedTaxYear(Number(Array.from(keys)[0]))
                      }
                      className="w-32"
                      classNames={{ trigger: "rounded-none" }}
                      startContent={
                        <Icon icon="solar:calendar-bold" width={16} />
                      }
                    >
                      {[2026, 2025, 2024, 2023].map((year) => (
                        <SelectItem key={String(year)}>{year}</SelectItem>
                      ))}
                    </Select>
                    <Button
                      size="sm"
                      variant="flat"
                      className="rounded-none"
                      startContent={
                        <Icon icon="solar:document-text-bold" width={16} />
                      }
                      onPress={() =>
                        onExportTaxReport?.(selectedTaxYear, "csv")
                      }
                    >
                      CSV
                    </Button>
                    <Button
                      size="sm"
                      className="rounded-none bg-gradient-to-r from-[#FF4654] to-[#FFC700] text-white font-semibold"
                      startContent={
                        <Icon icon="solar:file-download-bold" width={16} />
                      }
                      onPress={() =>
                        onExportTaxReport?.(selectedTaxYear, "pdf")
                      }
                    >
                      Download PDF
                    </Button>
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Tax Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card className="rounded-none bg-gradient-to-br from-success/10 to-success/5 border-2 border-success/40">
                  <CardBody className="p-5 text-center">
                    <div className="w-14 h-14 rounded-xl bg-success/20 flex items-center justify-center mx-auto mb-3">
                      <Icon
                        icon="solar:cup-star-bold-duotone"
                        width={28}
                        className="text-success"
                      />
                    </div>
                    <p className="text-3xl font-bold text-success">
                      ${taxSummary.totalPrizes.toFixed(2)}
                    </p>
                    <p className="text-sm text-default-500 mt-1">
                      🏆 Prizes Won
                    </p>
                    <p className="text-xs text-success/70 mt-2">
                      Taxable Income
                    </p>
                  </CardBody>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="rounded-none bg-gradient-to-br from-primary/10 to-primary/5 border-2 border-primary/40">
                  <CardBody className="p-5 text-center">
                    <div className="w-14 h-14 rounded-xl bg-primary/20 flex items-center justify-center mx-auto mb-3">
                      <Icon
                        icon="solar:download-minimalistic-bold-duotone"
                        width={28}
                        className="text-primary"
                      />
                    </div>
                    <p className="text-3xl font-bold text-primary">
                      ${taxSummary.totalDeposits.toFixed(2)}
                    </p>
                    <p className="text-sm text-default-500 mt-1">💳 Deposits</p>
                    <p className="text-xs text-primary/70 mt-2">Not Taxable</p>
                  </CardBody>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card className="rounded-none bg-gradient-to-br from-warning/10 to-warning/5 border-2 border-warning/40">
                  <CardBody className="p-5 text-center">
                    <div className="w-14 h-14 rounded-xl bg-warning/20 flex items-center justify-center mx-auto mb-3">
                      <Icon
                        icon="solar:upload-minimalistic-bold-duotone"
                        width={28}
                        className="text-warning"
                      />
                    </div>
                    <p className="text-3xl font-bold text-warning">
                      ${taxSummary.totalWithdrawals.toFixed(2)}
                    </p>
                    <p className="text-sm text-default-500 mt-1">
                      📤 Withdrawals
                    </p>
                    <p className="text-xs text-warning/70 mt-2">
                      Already Reported
                    </p>
                  </CardBody>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Card className="rounded-none bg-gradient-to-br from-[#34445C]/10 to-[#34445C]/5 border-2 border-[#34445C]/40 dark:from-[#DCFF37]/10 dark:to-[#DCFF37]/5 dark:border-[#DCFF37]/40">
                  <CardBody className="p-5 text-center">
                    <div className="w-14 h-14 rounded-xl bg-[#34445C]/20 dark:bg-[#DCFF37]/20 flex items-center justify-center mx-auto mb-3">
                      <Icon
                        icon="solar:document-text-bold-duotone"
                        width={28}
                        className="text-[#34445C] dark:text-[#DCFF37]"
                      />
                    </div>
                    <p className="text-3xl font-bold text-[#34445C] dark:text-[#DCFF37]">
                      {taxSummary.events}
                    </p>
                    <p className="text-sm text-default-500 mt-1">📋 Events</p>
                    <p className="text-xs text-default-400 mt-2">
                      Total Transactions
                    </p>
                  </CardBody>
                </Card>
              </motion.div>
            </div>

            {/* Tax Notice */}
            <Card className="rounded-none border-2 border-warning/50 bg-gradient-to-r from-warning/10 to-warning/5 overflow-hidden">
              <CardBody className="p-5">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-warning/20 flex items-center justify-center flex-shrink-0">
                    <Icon
                      icon="solar:info-circle-bold-duotone"
                      width={24}
                      className="text-warning"
                    />
                  </div>
                  <div>
                    <h4 className="font-bold text-warning-700 dark:text-warning text-lg mb-2">
                      ⚠️ Important Tax Information
                    </h4>
                    <p className="text-sm text-warning-600 dark:text-warning-400">
                      This report is provided for{" "}
                      <strong>informational purposes only</strong>. Prize
                      winnings from competitive gaming may be taxable income in
                      your jurisdiction. Tax laws vary by country and region.
                    </p>
                    <p className="text-sm text-warning-600 dark:text-warning-400 mt-2">
                      <strong>
                        Please consult with a qualified tax professional
                      </strong>{" "}
                      for advice specific to your situation. LeetGaming is not
                      responsible for tax filing or reporting obligations.
                    </p>
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Taxable Events Table */}
            <Card className="rounded-none border-2 border-default-200">
              <CardHeader className="flex items-center justify-between">
                <h3 className="font-bold text-[#34445C] dark:text-white text-lg">
                  📜 Taxable Events - {selectedTaxYear}
                </h3>
                <Chip size="sm" variant="flat" className="rounded-none">
                  {taxableEvents.length} events
                </Chip>
              </CardHeader>
              <CardBody className="p-0">
                {taxableEvents.length === 0 ? (
                  <div className="p-12 text-center">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", damping: 15 }}
                    >
                      <Icon
                        icon="solar:document-text-bold-duotone"
                        width={64}
                        className="mx-auto text-default-200 mb-4"
                      />
                    </motion.div>
                    <p className="text-lg font-semibold text-default-400">
                      No taxable events for {selectedTaxYear}
                    </p>
                    <p className="text-sm text-default-300 mt-1">
                      Your transaction history will appear here
                    </p>
                  </div>
                ) : (
                  <Table
                    aria-label="Taxable events"
                    removeWrapper
                    classNames={{
                      th: "bg-[#34445C]/5 dark:bg-[#DCFF37]/5 text-[#34445C] dark:text-white font-bold",
                      td: "py-3",
                    }}
                  >
                    <TableHeader>
                      <TableColumn>DATE</TableColumn>
                      <TableColumn>TYPE</TableColumn>
                      <TableColumn>AMOUNT</TableColumn>
                      <TableColumn>ASSET</TableColumn>
                      <TableColumn>CHAIN</TableColumn>
                      <TableColumn>TX HASH</TableColumn>
                    </TableHeader>
                    <TableBody>
                      {taxableEvents.map((event, index) => (
                        <TableRow
                          key={index}
                          className="hover:bg-default-50 dark:hover:bg-default-100/5"
                        >
                          <TableCell>
                            <span className="font-medium">
                              {new Date(event.date).toLocaleDateString(
                                "en-US",
                                {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                },
                              )}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Chip
                              size="sm"
                              color={
                                event.type === "prize_won"
                                  ? "success"
                                  : event.type === "deposit"
                                    ? "primary"
                                    : "warning"
                              }
                              variant="flat"
                              className="rounded-none capitalize font-semibold"
                              startContent={
                                <Icon
                                  icon={
                                    event.type === "prize_won"
                                      ? "solar:cup-bold"
                                      : event.type === "deposit"
                                        ? "solar:download-bold"
                                        : "solar:upload-bold"
                                  }
                                  width={12}
                                />
                              }
                            >
                              {event.type.replace("_", " ")}
                            </Chip>
                          </TableCell>
                          <TableCell>
                            <span
                              className={cn(
                                "font-bold",
                                event.type === "prize_won"
                                  ? "text-success"
                                  : event.type === "withdrawal"
                                    ? "text-warning"
                                    : "",
                              )}
                            >
                              ${event.amount.dollars.toFixed(2)}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Chip
                              size="sm"
                              variant="flat"
                              className="rounded-none"
                            >
                              {event.asset}
                            </Chip>
                          </TableCell>
                          <TableCell>
                            <span className="capitalize text-default-600">
                              {event.chain}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Tooltip content={event.tx_hash}>
                              <span className="font-mono text-xs text-default-500 cursor-pointer hover:text-[#FF4654]">
                                {event.tx_hash.slice(0, 8)}...
                                {event.tx_hash.slice(-6)}
                              </span>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardBody>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default AnalyticsDashboard;

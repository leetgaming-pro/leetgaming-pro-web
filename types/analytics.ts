/**
 * Analytics Types
 * Per PRD D.6 - Player Analytics & Performance Tracking
 */

import type { GameId } from "./games";

// Time period for analytics
export type AnalyticsPeriod = "24h" | "7d" | "30d" | "90d" | "all";

// Stat trend direction
export type TrendDirection = "up" | "down" | "stable";

// Performance metric types
export type MetricType =
  | "kd-ratio"
  | "win-rate"
  | "headshot-percentage"
  | "adr" // Average Damage per Round
  | "kast" // Kill, Assist, Survive, Trade percentage
  | "rating" // Overall rating (1.0-2.0)
  | "clutch-rate"
  | "first-blood-rate"
  | "flash-assists"
  | "utility-damage"
  | "acs" // Average Combat Score (Valorant)
  | "econ-rating"
  | "matches-played"
  | "hours-played";

// Skill rating system (Glicko-2 based per PRD)
export interface SkillRating {
  rating: number; // Current rating (e.g., 1500)
  deviation: number; // Rating deviation (uncertainty)
  volatility: number; // Rating volatility
  percentile: number; // Global percentile (0-100)
  rank?: string; // Display rank (e.g., "Gold II")
  peakRating?: number;
  peakDate?: string;
  lastUpdated: string;
}

// Individual stat with trend
export interface StatValue {
  current: number;
  previous?: number;
  trend: TrendDirection;
  trendPercentage?: number;
  period: AnalyticsPeriod;
}

// Performance stats snapshot
export interface PerformanceStats {
  // Core stats
  kills: number;
  deaths: number;
  assists: number;
  kdRatio: StatValue;
  kast: StatValue;
  adr: StatValue;

  // Aim stats
  headshotPercentage: StatValue;
  accuracy: StatValue;

  // Economy
  avgEquipmentValue: number;
  econRating: StatValue;

  // Utility
  utilityDamage: number;
  flashAssists: number;
  smokeKills?: number;

  // Impact
  firstBloods: number;
  firstDeaths: number;
  clutchesWon: number;
  clutchesAttempted: number;
  clutchRate: StatValue;

  // Trading
  tradeKills: number;
  tradedDeaths: number;

  // Overall
  rating: StatValue;
  matchesPlayed: number;
  matchesWon: number;
  winRate: StatValue;
  hoursPlayed: number;

  // Per-map stats
  mapStats?: MapStats[];

  // Per-agent/weapon stats
  agentStats?: AgentStats[];
  weaponStats?: WeaponStats[];
}

// Map-specific stats
export interface MapStats {
  mapId: string;
  mapName: string;
  mapImage?: string;
  matchesPlayed: number;
  winRate: number;
  avgRating: number;
  ctWinRate?: number;
  tWinRate?: number;
  favoritePosition?: string;
}

// Agent/Character stats
export interface AgentStats {
  agentId: string;
  agentName: string;
  agentIcon?: string;
  matchesPlayed: number;
  winRate: number;
  kdRatio: number;
  avgRating: number;
  avgScore?: number;
}

// Weapon stats
export interface WeaponStats {
  weaponId: string;
  weaponName: string;
  weaponIcon?: string;
  kills: number;
  headshotPercentage: number;
  avgDamagePerKill: number;
}

// Match history entry
export interface MatchHistoryEntry {
  id: string;
  gameId: GameId;
  mapId: string;
  mapName: string;

  // Result
  result: "win" | "loss" | "draw";
  score: {
    team1: number;
    team2: number;
  };

  // Player performance
  kills: number;
  deaths: number;
  assists: number;
  rating: number;
  adr?: number;
  hsp?: number; // Headshot percentage

  // MVP?
  isMvp?: boolean;

  // Timestamp
  playedAt: string;
  duration: number; // Minutes

  // Replay available?
  hasReplay: boolean;
  replayId?: string;
}

// Player profile with analytics
export interface PlayerAnalytics {
  playerId: string;
  playerName: string;
  avatar?: string;

  // Game-specific data
  gameId: GameId;

  // Skill rating
  skillRating: SkillRating;

  // Performance stats
  stats: PerformanceStats;

  // Activity
  lastActive: string;
  recentMatches: MatchHistoryEntry[];

  // Trends
  ratingHistory: {
    date: string;
    rating: number;
  }[];

  // Comparisons
  comparedToAverage: {
    metric: MetricType;
    playerValue: number;
    averageValue: number;
    percentile: number;
  }[];

  // Achievements/Highlights
  highlights?: {
    type: string;
    title: string;
    description: string;
    date: string;
    value?: number;
  }[];
}

// Leaderboard entry
export interface LeaderboardEntry {
  rank: number;
  playerId: string;
  playerName: string;
  avatar?: string;
  teamName?: string;
  teamTag?: string;

  // Rating/Score
  rating: number;
  previousRank?: number;
  rankChange?: number;

  // Stats
  matchesPlayed: number;
  winRate: number;
  kdRatio?: number;

  // Region
  region?: string;
  country?: string;
}

// Dashboard widget config
export interface AnalyticsWidget {
  id: string;
  type:
    | "stat-card"
    | "chart"
    | "recent-matches"
    | "map-performance"
    | "rating-history"
    | "leaderboard-position";
  title: string;
  size: "sm" | "md" | "lg" | "xl";
  position: { x: number; y: number };
  config?: Record<string, unknown>;
}

// Helper functions
export function formatRating(rating: number): string {
  return rating.toFixed(2);
}

export function formatPercentage(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`;
}

export function formatKDRatio(kills: number, deaths: number): string {
  if (deaths === 0) return kills.toString();
  return (kills / deaths).toFixed(2);
}

export function getTrendColor(trend: TrendDirection): string {
  switch (trend) {
    case "up":
      return "text-success";
    case "down":
      return "text-danger";
    default:
      return "text-default-500";
  }
}

export function getTrendIcon(trend: TrendDirection): string {
  switch (trend) {
    case "up":
      return "solar:arrow-up-bold";
    case "down":
      return "solar:arrow-down-bold";
    default:
      return "solar:minus-bold";
  }
}

export function getRankTier(rating: number): {
  name: string;
  tier: number;
  color: string;
  icon: string;
} {
  // Example rank tiers (configurable per game)
  if (rating >= 2500)
    return {
      name: "Global Elite",
      tier: 18,
      color: "#FFD700",
      icon: "solar:crown-bold",
    };
  if (rating >= 2250)
    return {
      name: "Supreme",
      tier: 17,
      color: "#C0C0C0",
      icon: "solar:star-bold",
    };
  if (rating >= 2000)
    return {
      name: "Legendary Eagle Master",
      tier: 16,
      color: "#CD7F32",
      icon: "solar:star-bold",
    };
  if (rating >= 1750)
    return {
      name: "Legendary Eagle",
      tier: 15,
      color: "#9370DB",
      icon: "solar:medal-star-bold",
    };
  if (rating >= 1500)
    return {
      name: "Distinguished Master Guardian",
      tier: 14,
      color: "#4169E1",
      icon: "solar:medal-ribbons-star-bold",
    };
  if (rating >= 1250)
    return {
      name: "Master Guardian Elite",
      tier: 13,
      color: "#32CD32",
      icon: "solar:shield-bold",
    };
  if (rating >= 1000)
    return {
      name: "Master Guardian",
      tier: 12,
      color: "#00CED1",
      icon: "solar:shield-bold",
    };
  if (rating >= 750)
    return {
      name: "Gold Nova",
      tier: 9,
      color: "#FFD700",
      icon: "solar:star-bold",
    };
  if (rating >= 500)
    return {
      name: "Silver",
      tier: 5,
      color: "#C0C0C0",
      icon: "solar:shield-minimalistic-bold",
    };
  return {
    name: "Unranked",
    tier: 0,
    color: "#808080",
    icon: "solar:question-circle-bold",
  };
}

// Period labels
export function getPeriodLabel(period: AnalyticsPeriod): string {
  const labels: Record<AnalyticsPeriod, string> = {
    "24h": "Last 24 Hours",
    "7d": "Last 7 Days",
    "30d": "Last 30 Days",
    "90d": "Last 90 Days",
    all: "All Time",
  };
  return labels[period];
}

// Constants
export const DEFAULT_RATING = 1000;
export const DEFAULT_DEVIATION = 350;
export const MIN_MATCHES_FOR_RANKING = 10;

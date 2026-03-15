/**
 * Player Profile Types — Professional Gaming Portfolio
 * Skills, Traits, Team History, and Endorsements
 *
 * Per ARCHITECTURE_STANDARDS: types in .types.ts, helpers alongside types
 */

// ============================================================================
// Skill System
// ============================================================================

/** Skill categories that map to radar chart vertices */
export type SkillCategory =
  | "mechanical"
  | "tactical"
  | "leadership"
  | "utility"
  | "consistency";

/** How the skill level was determined */
export type SkillDataSource = "auto" | "manual" | "hybrid";

/** Individual player skill with endorsement support */
export interface PlayerSkill {
  id: string;
  player_id: string;
  skill_name: string;
  skill_key: string; // e.g. "aim_precision", "clutch_mastery"
  category: SkillCategory;
  level: number; // 0–100
  data_source: SkillDataSource;
  endorsement_count: number;
  endorsed_by_viewer?: boolean; // Whether the current user has endorsed
  last_evaluated?: string;
}

/** Aggregated skill profile for radar chart display */
export interface SkillProfile {
  player_id: string;
  categories: Record<SkillCategory, number>; // 0–100 per category
  top_skills: PlayerSkill[];
  total_endorsements: number;
}

// ============================================================================
// Trait System
// ============================================================================

/** Trait tier based on achievement difficulty */
export type TraitTier = "bronze" | "silver" | "gold" | "diamond";

/** Professional trait auto-awarded + endorseable */
export interface PlayerTrait {
  id: string;
  player_id: string;
  trait_key: string;
  display_name: string;
  description: string;
  icon: string; // Iconify icon name
  tier: TraitTier;
  awarded_at: string;
  awarded_criteria: string;
  endorsement_count: number;
  endorsed_by_viewer?: boolean;
}

// ============================================================================
// Team History
// ============================================================================

/** A player's tenure on a specific team */
export interface TeamHistoryEntry {
  squad_id: string;
  squad_name: string;
  squad_tag: string;
  squad_logo_uri?: string;
  role: string;
  joined_at: string;
  left_at?: string; // null = current team
  matches_played: number;
  win_rate: number;
  achievements: string[]; // Titles/events won with this team
}

/** Historical roster entry for a team profile */
export interface TeamRosterHistoryEntry {
  player_id: string;
  player_nickname: string;
  player_avatar?: string;
  role: string;
  joined_at: string;
  left_at?: string;
  matches_played: number;
  contribution_rating: number; // 0.00–2.00 (HLTV-style)
}

// ============================================================================
// Helpers — Object lookups over switch statements
// ============================================================================

/** Icon for each skill category */
export const getSkillCategoryIcon = (category: SkillCategory): string => {
  const icons: Record<SkillCategory, string> = {
    mechanical: "solar:target-bold",
    tactical: "solar:map-point-bold",
    leadership: "solar:crown-bold",
    utility: "solar:shield-user-bold",
    consistency: "solar:chart-bold",
  };
  return icons[category];
};

/** Display label for each skill category */
export const getSkillCategoryLabel = (category: SkillCategory): string => {
  const labels: Record<SkillCategory, string> = {
    mechanical: "Mechanical",
    tactical: "Tactical",
    leadership: "Leadership",
    utility: "Utility",
    consistency: "Consistency",
  };
  return labels[category];
};

/** Color token per skill category (NextUI compatible) */
export const getSkillCategoryColor = (
  category: SkillCategory
): "danger" | "primary" | "warning" | "success" | "secondary" => {
  const colors: Record<
    SkillCategory,
    "danger" | "primary" | "warning" | "success" | "secondary"
  > = {
    mechanical: "danger",
    tactical: "primary",
    leadership: "warning",
    utility: "success",
    consistency: "secondary",
  };
  return colors[category];
};

/** Tier color class mapping */
export const getTraitTierColor = (
  tier: TraitTier
): { bg: string; border: string; text: string; glow: string } => {
  const map: Record<
    TraitTier,
    { bg: string; border: string; text: string; glow: string }
  > = {
    bronze: {
      bg: "bg-amber-700/10",
      border: "border-amber-700/30",
      text: "text-amber-700",
      glow: "",
    },
    silver: {
      bg: "bg-slate-400/10",
      border: "border-slate-400/30",
      text: "text-slate-400",
      glow: "",
    },
    gold: {
      bg: "bg-[#FFC700]/10",
      border: "border-[#FFC700]/30",
      text: "text-[#FFC700]",
      glow: "shadow-[0_0_12px_rgba(255,199,0,0.3)]",
    },
    diamond: {
      bg: "bg-cyan-400/10",
      border: "border-cyan-400/30",
      text: "text-cyan-400",
      glow: "shadow-[0_0_16px_rgba(34,211,238,0.4)]",
    },
  };
  return map[tier];
};

/** Trait tier label */
export const getTraitTierLabel = (tier: TraitTier): string => {
  const labels: Record<TraitTier, string> = {
    bronze: "Bronze",
    silver: "Silver",
    gold: "Gold",
    diamond: "Diamond",
  };
  return labels[tier];
};

/** Check if team history entry is current team */
export const isCurrentTeam = (entry: TeamHistoryEntry): boolean =>
  !entry.left_at;

/** Format tenure duration from dates */
export const formatTenure = (joinedAt: string, leftAt?: string): string => {
  const start = new Date(joinedAt);
  const end = leftAt ? new Date(leftAt) : new Date();
  const months = Math.max(
    1,
    Math.round(
      (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 30)
    )
  );

  if (months < 12) {
    return `${months}mo`;
  }
  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;
  return remainingMonths > 0 ? `${years}y ${remainingMonths}mo` : `${years}y`;
};

/** Format date range for display */
export const formatDateRange = (joinedAt: string, leftAt?: string): string => {
  const start = new Date(joinedAt);
  const formatDate = (d: Date) =>
    d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
  if (!leftAt) {
    return `${formatDate(start)} — Present`;
  }
  return `${formatDate(start)} — ${formatDate(new Date(leftAt))}`;
};

/** Skill level label based on numeric value */
export const getSkillLevelLabel = (level: number): string => {
  if (level >= 90) return "Elite";
  if (level >= 75) return "Expert";
  if (level >= 60) return "Advanced";
  if (level >= 40) return "Intermediate";
  if (level >= 20) return "Developing";
  return "Beginner";
};

// ============================================================================
// Default skill definitions for CS2/Valorant
// ============================================================================

export interface SkillDefinition {
  key: string;
  name: string;
  category: SkillCategory;
  description: string;
  icon: string;
}

/** Standard skill definitions for tactical FPS games */
export const SKILL_DEFINITIONS: SkillDefinition[] = [
  // Mechanical
  {
    key: "aim_precision",
    name: "Aim Precision",
    category: "mechanical",
    description: "Accuracy and headshot percentage",
    icon: "solar:target-bold",
  },
  {
    key: "spray_control",
    name: "Spray Control",
    category: "mechanical",
    description: "Recoil management and multi-kill sprays",
    icon: "solar:fire-bold",
  },
  {
    key: "movement",
    name: "Movement",
    category: "mechanical",
    description: "Counter-strafing, peeking, and positioning",
    icon: "solar:running-bold",
  },
  // Tactical
  {
    key: "map_awareness",
    name: "Map Awareness",
    category: "tactical",
    description: "Rotations, timings, and map control",
    icon: "solar:map-bold",
  },
  {
    key: "game_sense",
    name: "Game Sense",
    category: "tactical",
    description: "Reading opponents, predicting plays",
    icon: "solar:eye-bold",
  },
  {
    key: "trade_fragging",
    name: "Trade Fragging",
    category: "tactical",
    description: "Supporting teammates with refrag plays",
    icon: "solar:users-group-rounded-bold",
  },
  // Leadership
  {
    key: "shot_calling",
    name: "Shot Calling",
    category: "leadership",
    description: "In-game leadership and strategy calls",
    icon: "solar:microphone-bold",
  },
  {
    key: "clutch_mastery",
    name: "Clutch Mastery",
    category: "leadership",
    description: "Performance in clutch (1vX) situations",
    icon: "solar:star-bold",
  },
  // Utility
  {
    key: "utility_usage",
    name: "Utility Usage",
    category: "utility",
    description: "Grenade/ability efficiency and impact",
    icon: "solar:bomb-bold",
  },
  {
    key: "flash_assists",
    name: "Flash Assists",
    category: "utility",
    description: "Creating openings through flashbangs",
    icon: "solar:sun-bold",
  },
  // Consistency
  {
    key: "impact_rating",
    name: "Impact Rating",
    category: "consistency",
    description: "Average damage per round and impact frags",
    icon: "solar:chart-2-bold",
  },
  {
    key: "consistency_score",
    name: "Consistency",
    category: "consistency",
    description: "Performance stability across matches",
    icon: "solar:graph-up-bold",
  },
];

/** Standard trait definitions with award criteria */
export interface TraitDefinition {
  key: string;
  name: string;
  description: string;
  icon: string;
  criteria: Record<TraitTier, string>;
}

export const TRAIT_DEFINITIONS: TraitDefinition[] = [
  {
    key: "clutch_king",
    name: "Clutch King",
    description: "Excels in 1vX clutch situations",
    icon: "solar:crown-bold",
    criteria: {
      bronze: "Win 10+ clutch rounds",
      silver: "Win 50+ clutch rounds",
      gold: "Win 100+ clutch rounds with 40%+ success",
      diamond: "Win 250+ clutch rounds with 50%+ success",
    },
  },
  {
    key: "consistent_performer",
    name: "Consistent Performer",
    description: "Maintains high performance across matches",
    icon: "solar:chart-bold",
    criteria: {
      bronze: "70%+ positive K/D over 20 matches",
      silver: "70%+ positive K/D over 50 matches",
      gold: "1.10+ rating over 100 matches",
      diamond: "1.20+ rating over 200 matches",
    },
  },
  {
    key: "team_leader",
    name: "Team Leader",
    description: "Natural in-game leader with strategic impact",
    icon: "solar:microphone-bold",
    criteria: {
      bronze: "Captained a team for 10+ matches",
      silver: "Led team to 60%+ win rate over 30 matches",
      gold: "Led team to tournament podium",
      diamond: "Led team to multiple tournament wins",
    },
  },
  {
    key: "rising_star",
    name: "Rising Star",
    description: "Rapid improvement trajectory",
    icon: "solar:rocket-bold",
    criteria: {
      bronze: "Rating improved 100+ points in 30 days",
      silver: "Rating improved 200+ points in 60 days",
      gold: "Reached top 10% from bottom 50% in a season",
      diamond: "Reached top 1% within first season",
    },
  },
  {
    key: "headshot_machine",
    name: "Headshot Machine",
    description: "Exceptional precision with headshot placement",
    icon: "solar:target-bold",
    criteria: {
      bronze: "40%+ headshot rate over 20 matches",
      silver: "50%+ headshot rate over 50 matches",
      gold: "55%+ headshot rate over 100 matches",
      diamond: "60%+ headshot rate over 200 matches",
    },
  },
  {
    key: "utility_master",
    name: "Utility Master",
    description: "Expert grenade and ability usage",
    icon: "solar:bomb-bold",
    criteria: {
      bronze: "100+ utility damage per match average",
      silver: "150+ utility damage per match average",
      gold: "200+ utility damage with 3+ flash assists/match",
      diamond: "Top 5% utility efficiency rating",
    },
  },
  {
    key: "entry_fragger",
    name: "Entry Fragger",
    description: "Creates space by winning opening duels",
    icon: "solar:running-bold",
    criteria: {
      bronze: "Positive first-kill/first-death ratio",
      silver: "1.2+ FK/FD ratio over 30 matches",
      gold: "1.5+ FK/FD ratio with 60%+ opening success",
      diamond: "Top 3% entry success rate",
    },
  },
  {
    key: "champion",
    name: "Champion",
    description: "Tournament winner with proven results",
    icon: "solar:cup-star-bold",
    criteria: {
      bronze: "Won 1 tournament",
      silver: "Won 3 tournaments",
      gold: "Won 5+ tournaments with MVP appearances",
      diamond: "Won 10+ tournaments including tier-1 events",
    },
  },
];

// ============================================================================
// Type aliases for backward compatibility
// ============================================================================
export type PlayerSkillResult = PlayerSkill;
export type PlayerTraitResult = PlayerTrait;
export type TeamHistoryResult = TeamHistoryEntry;
export type TeamRosterHistoryResult = TeamRosterHistoryEntry;

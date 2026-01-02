/**
 * Matchmaking Types for LeetGaming.PRO
 * Comprehensive types for real-time competitive matchmaking
 */

export type MatchmakingTier = "free" | "premium" | "pro" | "elite";

export type SessionStatus =
  | "queued"
  | "searching"
  | "matched"
  | "ready"
  | "cancelled"
  | "expired";

export type QueueHealth = "healthy" | "moderate" | "slow" | "degraded";

export interface SkillRange {
  min_mmr: number;
  max_mmr: number;
}

export interface MatchPreferences {
  game_id: string;
  game_mode: string;
  region: string;
  map_preferences?: string[];
  skill_range: SkillRange;
  max_ping: number;
  allow_cross_platform: boolean;
  tier: MatchmakingTier;
  priority_boost: boolean;
  player_role?: string;
  team_format?: string;
  squad_id?: string;
}

export interface JoinQueueRequest {
  player_id: string;
  squad_id?: string;
  preferences: MatchPreferences;
  player_mmr: number;
}

export interface JoinQueueResponse {
  session_id: string;
  status: SessionStatus;
  estimated_wait_seconds: number;
  queue_position: number;
  queued_at: string;
}

export interface SessionStatusResponse {
  session_id: string;
  status: SessionStatus;
  elapsed_time: number;
  estimated_wait: number;
  queue_position?: number;
  total_queue_count?: number;
  match_id?: string;
  lobby_id?: string;
}

export interface PoolStatsResponse {
  pool_id: string;
  game_id: string;
  game_mode: string;
  region: string;
  total_players: number;
  average_wait_time_seconds: number;
  players_by_tier: Record<MatchmakingTier, number>;
  estimated_match_time_seconds: number;
  queue_health: QueueHealth;
  timestamp: string;
}

// Comprehensive error types for matchmaking operations
export type MatchmakingError =
  | "INVALID_GAME_MODE"
  | "REGION_FULL"
  | "TIER_RESTRICTED"
  | "ANTICHEAT_REQUIRED"
  | "CONCURRENT_SESSION"
  | "LOBBY_ERROR"
  | "NETWORK_ERROR"
  | "AUTHENTICATION_FAILED"
  | "SESSION_EXPIRED"
  | "QUEUE_FULL"
  | "INVALID_PREFERENCES"
  | "RATE_LIMITED";

export interface MatchmakingErrorResponse {
  error: MatchmakingError;
  message: string;
  details?: Record<string, unknown>;
  retryable?: boolean;
  retryAfter?: number;
}

// UI-specific types
export interface MatchmakingUIState {
  isSearching: boolean;
  sessionId: string | null;
  queuePosition: number;
  totalQueueCount: number;
  estimatedWait: number;
  elapsedTime: number;
  poolStats: PoolStatsResponse | null;
  error: MatchmakingError | null;
  lobbyId?: string;
  matchId?: string;
}

// Tier benefits for display
export interface TierBenefits {
  tier: MatchmakingTier;
  name: string;
  price: number;
  features: string[];
  waitTimeReduction: number;
  priorityMultiplier: number;
  color: "default" | "primary" | "secondary" | "success" | "warning" | "danger";
  icon: string;
}

export const TIER_BENEFITS: Record<MatchmakingTier, TierBenefits> = {
  free: {
    tier: "free",
    name: "Free",
    price: 0,
    features: [
      "Standard matchmaking",
      "Basic region selection",
      "Community servers",
    ],
    waitTimeReduction: 0,
    priorityMultiplier: 1,
    color: "default",
    icon: "solar:user-linear",
  },
  premium: {
    tier: "premium",
    name: "Premium",
    price: 4.99,
    features: [
      "Priority queue (2x faster)",
      "Advanced map selection",
      "Server location choice",
      "Ad-free experience",
    ],
    waitTimeReduction: 50,
    priorityMultiplier: 2,
    color: "primary",
    icon: "solar:star-bold",
  },
  pro: {
    tier: "pro",
    name: "Pro",
    price: 9.99,
    features: [
      "Ultra-priority queue (3x faster)",
      "Custom game modes",
      "Premium servers",
      "Stats & analytics",
      "Replay analysis",
    ],
    waitTimeReduction: 66,
    priorityMultiplier: 3,
    color: "secondary",
    icon: "solar:cup-star-bold",
  },
  elite: {
    tier: "elite",
    name: "Elite",
    price: 19.99,
    features: [
      "Instant priority (4x faster)",
      "Exclusive tournaments",
      "Premium-only servers",
      "Advanced analytics",
      "Coach matching",
      "VIP support",
    ],
    waitTimeReduction: 75,
    priorityMultiplier: 4,
    color: "warning",
    icon: "solar:crown-star-bold",
  },
};

// Game modes and regions
export interface GameModeOption {
  id: string;
  name: string;
  description: string;
  playerCount: string;
  icon: string;
}

export interface RegionOption {
  id: string;
  name: string;
  location: string;
  avgPing: number;
  icon: string;
}

export const GAME_MODES: Record<string, GameModeOption> = {
  competitive: {
    id: "competitive",
    name: "Competitive",
    description: "Ranked 5v5 matches",
    playerCount: "5v5",
    icon: "solar:ranking-bold",
  },
  casual: {
    id: "casual",
    name: "Casual",
    description: "Unranked 5v5 matches",
    playerCount: "5v5",
    icon: "solar:gameboy-bold",
  },
  wingman: {
    id: "wingman",
    name: "Wingman",
    description: "2v2 tactical matches",
    playerCount: "2v2",
    icon: "solar:user-hands-bold",
  },
  deathmatch: {
    id: "deathmatch",
    name: "Deathmatch",
    description: "Free-for-all combat",
    playerCount: "FFA",
    icon: "solar:target-bold",
  },
};

export const REGIONS: Record<string, RegionOption> = {
  "na-east": {
    id: "na-east",
    name: "North America East",
    location: "Virginia, USA",
    avgPing: 15,
    icon: "🇺🇸",
  },
  "na-west": {
    id: "na-west",
    name: "North America West",
    location: "Oregon, USA",
    avgPing: 25,
    icon: "🇺🇸",
  },
  "eu-west": {
    id: "eu-west",
    name: "Europe West",
    location: "Dublin, Ireland",
    avgPing: 35,
    icon: "🇪🇺",
  },
  "eu-east": {
    id: "eu-east",
    name: "Europe East",
    location: "Frankfurt, Germany",
    avgPing: 30,
    icon: "🇪🇺",
  },
  "asia-pacific": {
    id: "asia-pacific",
    name: "Asia Pacific",
    location: "Singapore",
    avgPing: 45,
    icon: "🌏",
  },
  "south-america": {
    id: "south-america",
    name: "South America",
    location: "São Paulo, Brazil",
    avgPing: 50,
    icon: "🇧🇷",
  },
};

// Player role options for role-based matchmaking
export interface PlayerRoleOption {
  id: string;
  name: string;
  description: string;
  icon: string;
  gameSpecific?: boolean;
}

export const PLAYER_ROLES: Record<string, PlayerRoleOption> = {
  any: {
    id: "any",
    name: "Any Role",
    description: "No preference",
    icon: "solar:user-bold",
  },
  carry: {
    id: "carry",
    name: "Carry",
    description: "High damage output",
    icon: "solar:target-bold",
    gameSpecific: true,
  },
  support: {
    id: "support",
    name: "Support",
    description: "Team utility and healing",
    icon: "solar:heart-bold",
    gameSpecific: true,
  },
  tank: {
    id: "tank",
    name: "Tank",
    description: "Damage mitigation",
    icon: "solar:shield-bold",
    gameSpecific: true,
  },
  assassin: {
    id: "assassin",
    name: "Assassin",
    description: "Burst damage and mobility",
    icon: "solar:flash-bold",
    gameSpecific: true,
  },
};

// Team format options
export interface TeamFormatOption {
  id: string;
  name: string;
  description: string;
  playerCount: number;
  icon: string;
}

export const TEAM_FORMATS: Record<string, TeamFormatOption> = {
  "1v1": {
    id: "1v1",
    name: "1v1",
    description: "Single player vs single player",
    playerCount: 2,
    icon: "solar:user-bold",
  },
  "2v2": {
    id: "2v2",
    name: "2v2",
    description: "Two player teams",
    playerCount: 4,
    icon: "solar:users-group-two-rounded-bold",
  },
  "3v3": {
    id: "3v3",
    name: "3v3",
    description: "Three player teams",
    playerCount: 6,
    icon: "solar:users-group-rounded-bold",
  },
  "5v5": {
    id: "5v5",
    name: "5v5",
    description: "Standard competitive teams",
    playerCount: 10,
    icon: "solar:users-group-rounded-bold",
  },
  "6v6": {
    id: "6v6",
    name: "6v6",
    description: "Large team matches",
    playerCount: 12,
    icon: "solar:users-group-rounded-bold",
  },
};

// --- Helper Functions (reduce code bloat in components) ---

/**
 * Get session status display config
 */
export const getSessionStatusConfig = (
  status: SessionStatus
): {
  color: "success" | "warning" | "danger" | "default" | "primary";
  label: string;
  icon: string;
} => {
  const config: Record<
    SessionStatus,
    {
      color: "success" | "warning" | "danger" | "default" | "primary";
      label: string;
      icon: string;
    }
  > = {
    queued: {
      color: "warning",
      label: "Queued",
      icon: "solar:clock-circle-bold",
    },
    searching: {
      color: "primary",
      label: "Searching",
      icon: "solar:magnifer-bold",
    },
    matched: {
      color: "success",
      label: "Matched",
      icon: "solar:check-circle-bold",
    },
    ready: { color: "success", label: "Ready", icon: "solar:play-circle-bold" },
    cancelled: {
      color: "default",
      label: "Cancelled",
      icon: "solar:close-circle-bold",
    },
    expired: { color: "danger", label: "Expired", icon: "solar:alarm-bold" },
  };
  return config[status] ?? config.queued;
};

/**
 * Get queue health display config
 */
export const getQueueHealthConfig = (
  health: QueueHealth
): {
  color: "success" | "warning" | "danger" | "default";
  label: string;
  icon: string;
} => {
  const config: Record<
    QueueHealth,
    {
      color: "success" | "warning" | "danger" | "default";
      label: string;
      icon: string;
    }
  > = {
    healthy: {
      color: "success",
      label: "Healthy",
      icon: "solar:check-circle-bold",
    },
    moderate: {
      color: "warning",
      label: "Moderate",
      icon: "solar:clock-circle-bold",
    },
    slow: { color: "warning", label: "Slow", icon: "solar:hourglass-bold" },
    degraded: {
      color: "danger",
      label: "Degraded",
      icon: "solar:danger-triangle-bold",
    },
  };
  return config[health] ?? config.healthy;
};

/**
 * Get tier display config
 */
export const getTierConfig = (tier: MatchmakingTier): TierBenefits => {
  return TIER_BENEFITS[tier] ?? TIER_BENEFITS.free;
};

/**
 * Format estimated wait time
 */
export const formatWaitTime = (seconds: number): string => {
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  if (minutes < 60) {
    return remainingSeconds > 0
      ? `${minutes}m ${remainingSeconds}s`
      : `${minutes}m`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours}h ${remainingMinutes}m`;
};

/**
 * Format elapsed time since queue start
 */
export const formatElapsedTime = (seconds: number): string => {
  return formatWaitTime(seconds);
};

/**
 * Check if session is in a terminal state
 */
export const isSessionTerminal = (status: SessionStatus): boolean => {
  return ["matched", "cancelled", "expired"].includes(status);
};

/**
 * Check if session is actively searching
 */
export const isSessionActive = (status: SessionStatus): boolean => {
  return ["queued", "searching"].includes(status);
};

/**
 * Get game mode by ID
 */
export const getGameMode = (modeId: string): GameModeOption | undefined => {
  return GAME_MODES[modeId];
};

/**
 * Get player role by ID
 */
export const getPlayerRole = (roleId: string): PlayerRoleOption | undefined => {
  return PLAYER_ROLES[roleId];
};

/**
 * Get team format by ID
 */
export const getTeamFormat = (formatId: string): TeamFormatOption | undefined => {
  return TEAM_FORMATS[formatId];
};

/**
 * Get all available player roles
 */
export const getAvailablePlayerRoles = (): PlayerRoleOption[] => {
  return Object.values(PLAYER_ROLES);
};

/**
 * Get all available team formats
 */
export const getAvailableTeamFormats = (): TeamFormatOption[] => {
  return Object.values(TEAM_FORMATS);
};

/**
 * Get team formats for a specific player count
 */
export const getTeamFormatsForPlayerCount = (playerCount: number): TeamFormatOption[] => {
  return Object.values(TEAM_FORMATS).filter(format => format.playerCount === playerCount);
};

/**
 * Calculate pair size from team format
 */
export const getPairSizeFromTeamFormat = (teamFormat: string): number => {
  const format = TEAM_FORMATS[teamFormat];
  return format ? format.playerCount / 2 : 2; // Default to 2 if not found
};

/**
 * Calculate estimated wait reduction based on tier
 */
export const calculateWaitReduction = (
  baseSeconds: number,
  tier: MatchmakingTier
): number => {
  const benefits = TIER_BENEFITS[tier];
  const reduction = (baseSeconds * benefits.waitTimeReduction) / 100;
  return Math.floor(baseSeconds - reduction);
};

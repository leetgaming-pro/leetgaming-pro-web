/**
 * Matchmaking Types for LeetGaming.PRO
 * Comprehensive types for real-time competitive matchmaking
 */

export type MatchmakingTier = 'free' | 'premium' | 'pro' | 'elite';

export type SessionStatus =
  | 'queued'
  | 'searching'
  | 'matched'
  | 'ready'
  | 'cancelled'
  | 'expired';

export type QueueHealth = 'healthy' | 'moderate' | 'slow' | 'degraded';

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
  match_id?: string;
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

// UI-specific types
export interface MatchmakingUIState {
  isSearching: boolean;
  sessionId: string | null;
  queuePosition: number;
  estimatedWait: number;
  elapsedTime: number;
  poolStats: PoolStatsResponse | null;
  error: string | null;
}

// Tier benefits for display
export interface TierBenefits {
  tier: MatchmakingTier;
  name: string;
  price: number;
  features: string[];
  waitTimeReduction: number;
  priorityMultiplier: number;
  color: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  icon: string;
}

export const TIER_BENEFITS: Record<MatchmakingTier, TierBenefits> = {
  free: {
    tier: 'free',
    name: 'Free',
    price: 0,
    features: [
      'Standard matchmaking',
      'Basic region selection',
      'Community servers',
    ],
    waitTimeReduction: 0,
    priorityMultiplier: 1,
    color: 'default',
    icon: 'solar:user-linear',
  },
  premium: {
    tier: 'premium',
    name: 'Premium',
    price: 4.99,
    features: [
      'Priority queue (2x faster)',
      'Advanced map selection',
      'Server location choice',
      'Ad-free experience',
    ],
    waitTimeReduction: 50,
    priorityMultiplier: 2,
    color: 'primary',
    icon: 'solar:star-bold',
  },
  pro: {
    tier: 'pro',
    name: 'Pro',
    price: 9.99,
    features: [
      'Ultra-priority queue (3x faster)',
      'Custom game modes',
      'Premium servers',
      'Stats & analytics',
      'Replay analysis',
    ],
    waitTimeReduction: 66,
    priorityMultiplier: 3,
    color: 'secondary',
    icon: 'solar:cup-star-bold',
  },
  elite: {
    tier: 'elite',
    name: 'Elite',
    price: 19.99,
    features: [
      'Instant priority (4x faster)',
      'Exclusive tournaments',
      'Premium-only servers',
      'Advanced analytics',
      'Coach matching',
      'VIP support',
    ],
    waitTimeReduction: 75,
    priorityMultiplier: 4,
    color: 'warning',
    icon: 'solar:crown-star-bold',
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
    id: 'competitive',
    name: 'Competitive',
    description: 'Ranked 5v5 matches',
    playerCount: '5v5',
    icon: 'solar:ranking-bold',
  },
  casual: {
    id: 'casual',
    name: 'Casual',
    description: 'Unranked 5v5 matches',
    playerCount: '5v5',
    icon: 'solar:gameboy-bold',
  },
  wingman: {
    id: 'wingman',
    name: 'Wingman',
    description: '2v2 tactical matches',
    playerCount: '2v2',
    icon: 'solar:user-hands-bold',
  },
  deathmatch: {
    id: 'deathmatch',
    name: 'Deathmatch',
    description: 'Free-for-all combat',
    playerCount: 'FFA',
    icon: 'solar:target-bold',
  },
};

export const REGIONS: Record<string, RegionOption> = {
  'na-east': {
    id: 'na-east',
    name: 'North America East',
    location: 'Virginia, USA',
    avgPing: 15,
    icon: '🇺🇸',
  },
  'na-west': {
    id: 'na-west',
    name: 'North America West',
    location: 'Oregon, USA',
    avgPing: 25,
    icon: '🇺🇸',
  },
  'eu-west': {
    id: 'eu-west',
    name: 'Europe West',
    location: 'Dublin, Ireland',
    avgPing: 35,
    icon: '🇪🇺',
  },
  'eu-east': {
    id: 'eu-east',
    name: 'Europe East',
    location: 'Frankfurt, Germany',
    avgPing: 30,
    icon: '🇪🇺',
  },
  'asia-pacific': {
    id: 'asia-pacific',
    name: 'Asia Pacific',
    location: 'Singapore',
    avgPing: 45,
    icon: '🌏',
  },
  'south-america': {
    id: 'south-america',
    name: 'South America',
    location: 'São Paulo, Brazil',
    avgPing: 50,
    icon: '🇧🇷',
  },
};

// --- Helper Functions (reduce code bloat in components) ---

/**
 * Get session status display config
 */
export const getSessionStatusConfig = (status: SessionStatus): { color: 'success' | 'warning' | 'danger' | 'default' | 'primary'; label: string; icon: string } => {
  const config: Record<SessionStatus, { color: 'success' | 'warning' | 'danger' | 'default' | 'primary'; label: string; icon: string }> = {
    queued: { color: 'warning', label: 'Queued', icon: 'solar:clock-circle-bold' },
    searching: { color: 'primary', label: 'Searching', icon: 'solar:magnifer-bold' },
    matched: { color: 'success', label: 'Matched', icon: 'solar:check-circle-bold' },
    ready: { color: 'success', label: 'Ready', icon: 'solar:play-circle-bold' },
    cancelled: { color: 'default', label: 'Cancelled', icon: 'solar:close-circle-bold' },
    expired: { color: 'danger', label: 'Expired', icon: 'solar:alarm-bold' },
  };
  return config[status] ?? config.queued;
};

/**
 * Get queue health display config
 */
export const getQueueHealthConfig = (health: QueueHealth): { color: 'success' | 'warning' | 'danger' | 'default'; label: string; icon: string } => {
  const config: Record<QueueHealth, { color: 'success' | 'warning' | 'danger' | 'default'; label: string; icon: string }> = {
    healthy: { color: 'success', label: 'Healthy', icon: 'solar:check-circle-bold' },
    moderate: { color: 'warning', label: 'Moderate', icon: 'solar:clock-circle-bold' },
    slow: { color: 'warning', label: 'Slow', icon: 'solar:hourglass-bold' },
    degraded: { color: 'danger', label: 'Degraded', icon: 'solar:danger-triangle-bold' },
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
    return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
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
  return ['matched', 'cancelled', 'expired'].includes(status);
};

/**
 * Check if session is actively searching
 */
export const isSessionActive = (status: SessionStatus): boolean => {
  return ['queued', 'searching'].includes(status);
};

/**
 * Get game mode by ID
 */
export const getGameMode = (modeId: string): GameModeOption | undefined => {
  return GAME_MODES[modeId];
};

/**
 * Get region by ID
 */
export const getRegion = (regionId: string): RegionOption | undefined => {
  return REGIONS[regionId];
};

/**
 * Calculate estimated wait reduction based on tier
 */
export const calculateWaitReduction = (baseSeconds: number, tier: MatchmakingTier): number => {
  const benefits = TIER_BENEFITS[tier];
  const reduction = (baseSeconds * benefits.waitTimeReduction) / 100;
  return Math.floor(baseSeconds - reduction);
};

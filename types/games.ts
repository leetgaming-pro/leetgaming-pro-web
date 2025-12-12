/**
 * @fileoverview Games Type Definitions
 * @module types/games
 * 
 * Type definitions for the games configuration system.
 * These types ensure type safety across all game-related features.
 */

/**
 * Unique identifier for each supported game
 */
export type GameId = 
  | "cs2"
  | "valorant"
  | "freefire"
  | "pubg"
  | "r6"
  | "tibia"
  | "dota2"
  | "lol";

/**
 * Game category classification
 */
export type GameCategory =
  | "tactical-fps"
  | "battle-royale"
  | "moba"
  | "mmorpg"
  | "fighting"
  | "sports"
  | "card"
  | "rts";

/**
 * Supported replay file formats
 */
export type ReplayFormat = "dem" | "mp4" | "webm" | "replay" | "rec" | "rofl";

/**
 * Gaming platform integrations
 */
export type GamePlatform = 
  | "steam"
  | "riot"
  | "garena"
  | "ubisoft"
  | "cipsoft"
  | "epic"
  | "battlenet";

/**
 * Anticheat provider types
 */
export type AnticheatProvider = 
  | "vac"
  | "vanguard"
  | "battleye"
  | "eac"
  | "faceit-ac"
  | "garena-ac"
  | "leetguard";

/**
 * Ranking system types
 */
export type RankSystem =
  | "elo-mmr"
  | "elo-rr"
  | "tiered"
  | "tiered-survival"
  | "mmr-medals"
  | "lp-tiers"
  | "experience";

/**
 * Color scheme for game branding
 */
export interface GameColorScheme {
  primary: string;
  secondary: string;
  accent: string;
}

/**
 * Platform integration configuration
 */
export interface GameIntegration {
  platform: GamePlatform;
  appId: string;
  apiEnabled: boolean;
  replaySupport: boolean;
  rankingSupport: boolean;
  statsApiUrl?: string;
}

/**
 * Replay analysis configuration
 */
export interface GameReplayConfig {
  formats: ReplayFormat[];
  maxFileSize: number;
  parser: string | null;
  features: ReplayFeature[];
}

/**
 * Available replay analysis features
 */
export type ReplayFeature =
  | "kill-feed"
  | "economy-tracking"
  | "utility-analysis"
  | "positioning-heatmaps"
  | "round-by-round"
  | "player-stats"
  | "trade-kills"
  | "flash-assists"
  | "clutch-analysis"
  | "ability-usage"
  | "agent-performance"
  | "ultimate-tracking"
  | "match-summary"
  | "loot-tracking"
  | "vehicle-paths"
  | "circle-analysis"
  | "operator-picks"
  | "gadget-usage"
  | "gold-exp-graphs"
  | "item-timings"
  | "ward-placement"
  | "teamfight-analysis"
  | "draft-analysis"
  | "lane-analysis"
  | "objective-control";

/**
 * Game mode configuration
 */
export interface GameMode {
  id: string;
  name: string;
  teamSize: number;
  ranked: boolean;
  description?: string;
}

/**
 * Game map configuration
 */
export interface GameMap {
  id: string;
  name: string;
  active: boolean;
  competitive: boolean;
  thumbnail?: string;
}

/**
 * Matchmaking configuration
 */
export interface GameMatchmaking {
  teamSize: number;
  modes: GameMode[];
  maps: GameMap[];
  mapVetoEnabled: boolean;
  mapVetoFormat?: string;
  anticheatRequired: boolean;
  anticheatProviders: AnticheatProvider[];
}

/**
 * Rank tier configuration
 */
export interface RankTier {
  id: string;
  name: string;
  minRating: number;
  icon: string;
  color?: string;
}

/**
 * Ranking system configuration
 */
export interface GameRanking {
  system: RankSystem;
  tiers: RankTier[];
  placements: number;
  decayEnabled: boolean;
  decayDays: number;
}

/**
 * Feature flags for game capabilities
 */
export interface GameFeatures {
  tournaments: boolean;
  coaching: boolean;
  teamFinder: boolean;
  replayAnalysis: boolean;
  liveMatches: boolean;
  betting: boolean;
  trading: boolean;
}

/**
 * Complete game configuration
 */
export interface GameConfig {
  // Identity
  id: GameId;
  name: string;
  shortName: string;
  slug: string;
  category: GameCategory;
  
  // Branding
  icon: string;
  logo: string;
  banner: string;
  color: GameColorScheme;
  description: string;
  
  // Integration
  integration: GameIntegration;
  
  // Features
  replay: GameReplayConfig;
  matchmaking: GameMatchmaking;
  ranking: GameRanking;
  stats: string[];
  features: GameFeatures;
  
  // Platform Status
  priority: number;
  active: boolean;
  launchDate: Date;
}

/**
 * Player game profile
 */
export interface PlayerGameProfile {
  playerId: string;
  gameId: GameId;
  platformId: string;
  platformUsername: string;
  
  // Stats
  rating: number;
  rankTierId: string;
  wins: number;
  losses: number;
  totalGames: number;
  
  // Activity
  lastPlayed: Date;
  totalPlaytime: number;
  
  // Platform-specific stats
  gameStats: Record<string, number | string>;
}

/**
 * Match configuration
 */
export interface MatchConfig {
  id: string;
  gameId: GameId;
  mode: string;
  map: string;
  
  // Teams
  teamSize: number;
  teams: MatchTeam[];
  
  // Settings
  ranked: boolean;
  anticheat: AnticheatProvider[];
  
  // Status
  status: MatchStatus;
  scheduledAt?: Date;
  startedAt?: Date;
  endedAt?: Date;
}

/**
 * Match team configuration
 */
export interface MatchTeam {
  id: string;
  name: string;
  players: MatchPlayer[];
  score: number;
  side?: string;
}

/**
 * Match player configuration
 */
export interface MatchPlayer {
  id: string;
  userId: string;
  displayName: string;
  rating: number;
  role?: string;
}

/**
 * Match status
 */
export type MatchStatus = 
  | "pending"
  | "ready-check"
  | "veto"
  | "warmup"
  | "live"
  | "paused"
  | "overtime"
  | "completed"
  | "cancelled"
  | "abandoned";

/**
 * Map veto configuration
 */
export interface MapVeto {
  matchId: string;
  gameId: GameId;
  format: string;
  actions: MapVetoAction[];
  remainingMaps: string[];
  selectedMaps: string[];
  currentTeamId: string;
  isComplete: boolean;
}

/**
 * Map veto action
 */
export interface MapVetoAction {
  teamId: string;
  action: "ban" | "pick";
  mapId: string;
  timestamp: Date;
}

/**
 * Tournament game configuration
 */
export interface TournamentGameConfig {
  gameId: GameId;
  format: TournamentFormat;
  teamSize: number;
  
  // Maps
  mapPool: string[];
  mapVetoFormat: string;
  
  // Rules
  overtimeRules?: OvertimeRules;
  roundTime?: number;
  maxRounds?: number;
  
  // Requirements
  minRank?: string;
  maxRank?: string;
  anticheatRequired: boolean;
}

/**
 * Tournament format
 */
export type TournamentFormat =
  | "single-elimination"
  | "double-elimination"
  | "round-robin"
  | "swiss"
  | "gsl";

/**
 * Overtime rules
 */
export interface OvertimeRules {
  enabled: boolean;
  maxOvertimes: number;
  roundsPerOvertime: number;
  sidesSwitch: boolean;
}

/**
 * Game search/filter criteria
 */
export interface GameFilter {
  categories?: GameCategory[];
  features?: (keyof GameFeatures)[];
  platform?: GamePlatform;
  replaySupport?: boolean;
  rankedOnly?: boolean;
  activeOnly?: boolean;
}

/**
 * Game selection for user preferences
 */
export interface GameSelection {
  gameId: GameId;
  preferred: boolean;
  modes: string[];
  regions: string[];
}

/**
 * Queue preferences per game
 */
export interface QueuePreferences {
  gameId: GameId;
  modes: string[];
  maps: string[];
  regions: string[];
  acceptCrossPlatform: boolean;
  maxPingMs: number;
  minRankDiff: number;
  maxRankDiff: number;
}

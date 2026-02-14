/**
 * Common Game Types - Game-agnostic types for multi-game support
 * Supports: CS2, Valorant, Dota2, and future titles
 */

// ============================================================================
// Core Position & Vector Types
// ============================================================================

/** 2D position for map coordinates */
export interface Position2D {
  x: number;
  y: number;
}

/** 3D position with elevation */
export interface Position3D extends Position2D {
  z: number;
}

/** 3D velocity vector */
export interface Velocity3D {
  x: number;
  y: number;
  z: number;
}

/** View angle/rotation */
export interface ViewAngle {
  pitch: number;  // Up/down
  yaw: number;    // Left/right
  roll?: number;  // Tilt (optional)
}

// ============================================================================
// Game Identity Types
// ============================================================================

/** Supported game identifiers */
export type GameId = 'cs2' | 'valorant' | 'dota2' | 'lol' | 'overwatch2';

/** Game-specific configuration */
export interface GameConfig {
  id: GameId;
  displayName: string;
  hasRounds: boolean;        // CS2, Valorant have rounds; Dota2 doesn't
  hasTeamSides: boolean;     // Most games have T/CT or Attack/Defense
  hasUtilities: boolean;     // Grenades, abilities, items
  hasEconomy: boolean;       // Buy phases
  tickRate: number;          // Default tick rate
  maxPlayers: number;        // 10 for CS2/Valorant, etc.
}

/** Game configurations registry */
export const GAME_CONFIGS: Record<GameId, GameConfig> = {
  cs2: {
    id: 'cs2',
    displayName: 'Counter-Strike 2',
    hasRounds: true,
    hasTeamSides: true,
    hasUtilities: true,
    hasEconomy: true,
    tickRate: 64,
    maxPlayers: 10,
  },
  valorant: {
    id: 'valorant',
    displayName: 'VALORANT',
    hasRounds: true,
    hasTeamSides: true,
    hasUtilities: true,  // Abilities
    hasEconomy: true,
    tickRate: 128,
    maxPlayers: 10,
  },
  dota2: {
    id: 'dota2',
    displayName: 'Dota 2',
    hasRounds: false,
    hasTeamSides: true,  // Radiant/Dire
    hasUtilities: true,  // Spells/Items
    hasEconomy: true,    // Gold
    tickRate: 30,
    maxPlayers: 10,
  },
  lol: {
    id: 'lol',
    displayName: 'League of Legends',
    hasRounds: false,
    hasTeamSides: true,
    hasUtilities: true,
    hasEconomy: true,
    tickRate: 30,
    maxPlayers: 10,
  },
  overwatch2: {
    id: 'overwatch2',
    displayName: 'Overwatch 2',
    hasRounds: true,
    hasTeamSides: true,
    hasUtilities: true,  // Abilities
    hasEconomy: false,
    tickRate: 63,
    maxPlayers: 10,
  },
};

// ============================================================================
// Team Types
// ============================================================================

/** Generic team side (game-agnostic) */
export type TeamSide = 
  | 'team1' | 'team2'          // Generic
  | 'T' | 'CT'                  // CS2
  | 'attack' | 'defense'        // Valorant
  | 'radiant' | 'dire'          // Dota2
  | 'blue' | 'red'              // LoL
  | 'Unknown';

/** Team information */
export interface Team {
  id: string;
  name: string;
  side: TeamSide;
  score: number;
  players: string[];  // Player IDs
}

// ============================================================================
// Player Types
// ============================================================================

/** Base player identity */
export interface PlayerIdentity {
  player_id: string;
  player_name: string;
  team_id?: string;
  team_side?: TeamSide;
  platform_id?: string;  // Steam ID, Riot ID, etc.
}

/** Player state at a point in time */
export interface PlayerState extends PlayerIdentity {
  position: Position3D;
  view_angle?: ViewAngle;
  velocity?: Velocity3D;
  health: number;
  max_health: number;
  armor?: number;
  is_alive: boolean;
  is_crouching?: boolean;
  is_scoped?: boolean;
  is_defusing?: boolean;
  is_planting?: boolean;
}

// ============================================================================
// Map Types
// ============================================================================

/** Map bounds for coordinate normalization */
export interface MapBounds {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  minZ?: number;
  maxZ?: number;
}

/** Map callout/location */
export interface MapCallout {
  code: string;           // e.g., "A_SITE", "MID"
  name: string;           // Display name
  position: Position2D;   // Center position (percentage)
  bounds?: MapBounds;     // Area bounds
}

/** Map configuration for visualization */
export interface MapConfig {
  id: string;             // e.g., "de_inferno"
  displayName: string;    // e.g., "Inferno"
  gameId: GameId;
  radarUrl?: string;      // Path to radar/minimap image
  bounds: MapBounds;      // Game coordinate bounds
  scale: number;          // Pixels per game unit
  offsetX: number;        // X offset for centering
  offsetY: number;        // Y offset for centering
  callouts: MapCallout[];
  layers?: string[];      // Available layers (floors, etc.)
}

// ============================================================================
// Event Types (Game-Agnostic Base)
// ============================================================================

/** Base event type all events inherit from */
export interface BaseGameEvent {
  id: string;
  type: string;
  game_id: GameId;
  match_id: string;
  tick: number;
  timestamp?: number;
  round_number?: number;  // Optional for games without rounds
}

/** Kill/elimination event */
export interface KillEvent extends BaseGameEvent {
  type: 'kill';
  killer: PlayerIdentity;
  killer_position: Position3D;
  victim: PlayerIdentity;
  victim_position: Position3D;
  weapon: string;
  headshot: boolean;
  wallbang?: boolean;
  no_scope?: boolean;
  through_smoke?: boolean;
  flash_assist?: boolean;
  assister?: PlayerIdentity;
  distance?: number;
}

/** Damage event */
export interface DamageEvent extends BaseGameEvent {
  type: 'damage';
  attacker: PlayerIdentity;
  attacker_position?: Position3D;
  victim: PlayerIdentity;
  victim_position?: Position3D;
  damage: number;
  weapon: string;
  hit_group?: string;  // head, body, legs, etc.
}

// ============================================================================
// Utility Types (Grenades, Abilities, Items)
// ============================================================================

/** Utility category */
export type UtilityCategory = 
  | 'explosive'      // HE, Raze satchel
  | 'flash'          // Flash, Breach blind
  | 'smoke'          // Smoke, Viper smoke
  | 'incendiary'     // Molotov, Brimstone molly
  | 'recon'          // Recon dart, Sova arrow
  | 'heal'           // Sage heal
  | 'buff'           // Stim beacon
  | 'trap'           // Cypher cage
  | 'other';

/** Base utility event */
export interface UtilityEvent extends BaseGameEvent {
  type: 'utility';
  category: UtilityCategory;
  utility_name: string;
  thrower: PlayerIdentity;
  thrower_position?: Position3D;
  impact_position: Position3D;
  duration?: number;
  damage?: number;
  players_affected?: number;
  enemies_affected?: number;
  team_affected?: number;
}

/** Explosive utility (HE, satchel) */
export interface ExplosiveUtilityEvent extends UtilityEvent {
  category: 'explosive';
  radius?: number;
  total_damage: number;
}

/** Flash utility */
export interface FlashUtilityEvent extends UtilityEvent {
  category: 'flash';
  blind_duration?: number;
  players_flashed: number;
  enemies_flashed: number;
  team_flashed?: number;
}

/** Smoke utility */
export interface SmokeUtilityEvent extends UtilityEvent {
  category: 'smoke';
  smoke_duration: number;
  is_extinguished?: boolean;
}

/** Incendiary utility (molotov, incendiary) */
export interface IncendiaryUtilityEvent extends UtilityEvent {
  category: 'incendiary';
  fire_duration: number;
  ticks_burning?: number;
}

// ============================================================================
// Round/Phase Types
// ============================================================================

/** Round phase */
export type RoundPhase = 
  | 'warmup'
  | 'freeze_time' | 'buy_phase'
  | 'live' | 'active'
  | 'bomb_planted' | 'spike_planted'
  | 'round_end' | 'overtime'
  | 'halftime' | 'timeout';

/** Round end reason */
export type RoundEndReason = 
  | 'elimination'        // All enemies killed
  | 'bomb_exploded'      // Bomb/spike detonated
  | 'bomb_defused'       // Bomb/spike defused
  | 'time_expired'       // Time ran out
  | 'surrendered'        // Team surrendered
  | 'unknown';

/** Round summary */
export interface RoundSummary {
  round_number: number;
  winner_side: TeamSide;
  winner_team_id?: string;
  end_reason: RoundEndReason;
  tick_start: number;
  tick_end: number;
  duration_seconds: number;
  team1_alive?: number;
  team2_alive?: number;
  mvp_player_id?: string;
}

// ============================================================================
// Trajectory & Heatmap Types
// ============================================================================

/** Trajectory point */
export interface TrajectoryPoint {
  tick: number;
  position: Position3D;
  velocity?: Velocity3D;
  view_angle?: ViewAngle;
  is_alive: boolean;
  state_flags?: number;  // Bitmask for crouching, scoped, etc.
}

/** Player trajectory for a period */
export interface PlayerTrajectory {
  player: PlayerIdentity;
  points: TrajectoryPoint[];
  start_tick: number;
  end_tick: number;
}

/** Heatmap cell */
export interface HeatmapCell {
  x: number;
  y: number;
  z?: number;           // Optional floor/elevation
  density: number;      // Normalized 0-1
  raw_count?: number;   // Raw sample count
  player_count?: number;
  duration_ms?: number;
}

/** Heatmap data */
export interface HeatmapData {
  match_id: string;
  map_id: string;
  grid_size: number;
  cells: HeatmapCell[];
  total_samples: number;
  filter?: {
    round_number?: number;
    player_ids?: string[];
    team_side?: TeamSide;
    tick_range?: { start: number; end: number };
  };
}

// ============================================================================
// Match Types
// ============================================================================

/** Match status */
export type MatchStatus = 
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'cancelled';

/** Match metadata */
export interface MatchMetadata {
  match_id: string;
  game_id: GameId;
  map_id: string;
  map_name?: string;
  status: MatchStatus;
  created_at: string;
  updated_at?: string;
  duration_seconds?: number;
  tick_count?: number;
  tick_rate?: number;
}

/** Match score */
export interface MatchScore {
  team1_score: number;
  team2_score: number;
  team1_name?: string;
  team2_name?: string;
  rounds_played?: number;
  overtime_rounds?: number;
}

/** Match summary */
export interface MatchSummary extends MatchMetadata {
  score: MatchScore;
  teams: Team[];
  round_count?: number;
  rounds?: RoundSummary[];
}

// ============================================================================
// Helper Functions
// ============================================================================

/** Get game config by ID */
export function getGameConfig(gameId: GameId): GameConfig {
  return GAME_CONFIGS[gameId];
}

/** Check if game supports rounds */
export function gameHasRounds(gameId: GameId): boolean {
  return GAME_CONFIGS[gameId]?.hasRounds ?? false;
}

/** Normalize position to percentage (0-100) based on map bounds */
export function normalizePosition(
  pos: Position3D,
  bounds: MapBounds
): Position2D {
  return {
    x: ((pos.x - bounds.minX) / (bounds.maxX - bounds.minX)) * 100,
    y: 100 - ((pos.y - bounds.minY) / (bounds.maxY - bounds.minY)) * 100,
  };
}

/** Map utility category from game-specific names */
export function mapUtilityCategory(
  gameId: GameId,
  utilityName: string
): UtilityCategory {
  const name = utilityName.toLowerCase();
  
  // CS2 grenades
  if (gameId === 'cs2') {
    if (name.includes('hegrenade') || name === 'he') return 'explosive';
    if (name.includes('flash')) return 'flash';
    if (name.includes('smoke')) return 'smoke';
    if (name.includes('molotov') || name.includes('incendiary')) return 'incendiary';
    if (name.includes('decoy')) return 'other';
  }
  
  // Valorant abilities (simplified)
  if (gameId === 'valorant') {
    if (name.includes('flash') || name.includes('blind')) return 'flash';
    if (name.includes('smoke') || name.includes('dark')) return 'smoke';
    if (name.includes('molly') || name.includes('fire')) return 'incendiary';
    if (name.includes('recon') || name.includes('arrow')) return 'recon';
    if (name.includes('heal')) return 'heal';
  }
  
  return 'other';
}

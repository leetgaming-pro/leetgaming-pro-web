/**
 * Valorant Game-Specific Types
 * Extends common game types for VALORANT
 */

import {
  GameId,
  Position3D,
  PlayerIdentity,
  BaseGameEvent,
  UtilityEvent,
  ExplosiveUtilityEvent,
  FlashUtilityEvent,
  SmokeUtilityEvent,
  IncendiaryUtilityEvent,
  UtilityCategory,
  MapConfig,
  MapBounds,
  MapCallout,
} from '../common/game-types';

// ============================================================================
// Valorant-Specific Constants
// ============================================================================

export const VALORANT_GAME_ID: GameId = 'valorant';

/** Valorant agent roles */
export type ValorantAgentRole = 
  | 'duelist'
  | 'initiator'
  | 'controller'
  | 'sentinel';

/** Valorant agents */
export type ValorantAgent = 
  | 'brimstone' | 'phoenix' | 'sage' | 'sova' | 'viper'
  | 'cypher' | 'reyna' | 'killjoy' | 'breach' | 'omen'
  | 'jett' | 'raze' | 'skye' | 'yoru' | 'astra'
  | 'kayo' | 'chamber' | 'neon' | 'fade' | 'harbor'
  | 'gekko' | 'deadlock' | 'iso' | 'clove' | 'vyse';

/** Valorant ability slot */
export type ValorantAbilitySlot = 
  | 'signature'  // E ability
  | 'ability1'   // C ability
  | 'ability2'   // Q ability
  | 'ultimate';  // X ability

/** Valorant ability category mapping */
export const VALORANT_ABILITY_CATEGORIES: Record<string, UtilityCategory> = {
  // Flash abilities
  'flash': 'flash',
  'blind': 'flash',
  'paranoia': 'flash',
  'flashpoint': 'flash',
  'curveball': 'flash',
  'leer': 'flash',
  'guiding_light': 'flash',
  'fakeout': 'flash',
  
  // Smoke abilities
  'smoke': 'smoke',
  'dark_cover': 'smoke',
  'sky_smoke': 'smoke',
  'viper_smoke': 'smoke',
  'nebula': 'smoke',
  'shrouded_step': 'smoke',
  
  // Incendiary abilities
  'incendiary': 'incendiary',
  'hot_hands': 'incendiary',
  'blaze': 'incendiary',
  'snake_bite': 'incendiary',
  'paint_shells': 'incendiary',
  'after_shock': 'incendiary',
  
  // Recon abilities
  'recon_bolt': 'recon',
  'owl_drone': 'recon',
  'seekers': 'recon',
  'neural_theft': 'recon',
  'spycam': 'recon',
  
  // Heal abilities
  'healing_orb': 'heal',
  'devour': 'heal',
  'empress_heal': 'heal',
  
  // Trap abilities
  'trapwire': 'trap',
  'cyber_cage': 'trap',
  'turret': 'trap',
  'nanoswarm': 'trap',
  'barrier_orb': 'trap',
};

// ============================================================================
// Valorant-Specific Events
// ============================================================================

/** Valorant ability use event */
export interface ValorantAbilityEvent extends UtilityEvent {
  game_id: 'valorant';
  agent: ValorantAgent;
  ability_name: string;
  ability_slot: ValorantAbilitySlot;
}

/** Valorant spike plant event */
export interface ValorantSpikePlantEvent extends BaseGameEvent {
  type: 'spike_plant' | 'spike_planted';
  game_id: 'valorant';
  player: PlayerIdentity;
  position: Position3D;
  site: 'A' | 'B' | 'C';
}

/** Valorant spike defuse event */
export interface ValorantSpikeDefuseEvent extends BaseGameEvent {
  type: 'spike_defuse' | 'spike_defused';
  game_id: 'valorant';
  player: PlayerIdentity;
  position: Position3D;
  site: 'A' | 'B' | 'C';
  time_remaining?: number;
}

/** Valorant ultimate charge event */
export interface ValorantUltimateChargeEvent extends BaseGameEvent {
  type: 'ultimate_charge';
  game_id: 'valorant';
  player: PlayerIdentity;
  points: number;
  points_required: number;
  is_ready: boolean;
}

// ============================================================================
// Valorant Map Configurations
// ============================================================================

/** Valorant map bounds */
export const VALORANT_MAP_BOUNDS: Record<string, MapBounds> = {
  ascent: {
    minX: -7000,
    maxX: 7000,
    minY: -7000,
    maxY: 7000,
  },
  bind: {
    minX: -5000,
    maxX: 7000,
    minY: -6000,
    maxY: 6000,
  },
  haven: {
    minX: -6000,
    maxX: 8000,
    minY: -7000,
    maxY: 7000,
  },
  split: {
    minX: -5500,
    maxX: 6500,
    minY: -6000,
    maxY: 6000,
  },
  icebox: {
    minX: -5500,
    maxX: 6500,
    minY: -6500,
    maxY: 5500,
  },
  breeze: {
    minX: -6500,
    maxX: 7500,
    minY: -7500,
    maxY: 6500,
  },
  fracture: {
    minX: -8000,
    maxX: 6000,
    minY: -6000,
    maxY: 8000,
  },
  pearl: {
    minX: -6000,
    maxX: 8000,
    minY: -7000,
    maxY: 7000,
  },
  lotus: {
    minX: -7000,
    maxX: 7000,
    minY: -7000,
    maxY: 7000,
  },
  sunset: {
    minX: -6000,
    maxX: 8000,
    minY: -6000,
    maxY: 8000,
  },
  abyss: {
    minX: -7000,
    maxX: 7000,
    minY: -7000,
    maxY: 7000,
  },
};

/** Valorant map configurations */
export const VALORANT_MAP_CONFIGS: Record<string, MapConfig> = {
  ascent: {
    id: 'ascent',
    displayName: 'Ascent',
    gameId: 'valorant',
    radarUrl: '/images/maps/valorant/ascent_minimap.png',
    bounds: VALORANT_MAP_BOUNDS.ascent,
    scale: 0.01,
    offsetX: 7000,
    offsetY: 7000,
    callouts: [
      { code: 'A_SITE', name: 'A Site', position: { x: 72, y: 30 } },
      { code: 'B_SITE', name: 'B Site', position: { x: 28, y: 30 } },
      { code: 'MID', name: 'Mid', position: { x: 50, y: 45 } },
    ],
    layers: ['main'],
  },
  bind: {
    id: 'bind',
    displayName: 'Bind',
    gameId: 'valorant',
    radarUrl: '/images/maps/valorant/bind_minimap.png',
    bounds: VALORANT_MAP_BOUNDS.bind,
    scale: 0.01,
    offsetX: 5000,
    offsetY: 6000,
    callouts: [
      { code: 'A_SITE', name: 'A Site', position: { x: 70, y: 35 } },
      { code: 'B_SITE', name: 'B Site', position: { x: 30, y: 35 } },
    ],
    layers: ['main'],
  },
  haven: {
    id: 'haven',
    displayName: 'Haven',
    gameId: 'valorant',
    radarUrl: '/images/maps/valorant/haven_minimap.png',
    bounds: VALORANT_MAP_BOUNDS.haven,
    scale: 0.01,
    offsetX: 6000,
    offsetY: 7000,
    callouts: [
      { code: 'A_SITE', name: 'A Site', position: { x: 75, y: 25 } },
      { code: 'B_SITE', name: 'B Site', position: { x: 50, y: 35 } },
      { code: 'C_SITE', name: 'C Site', position: { x: 25, y: 25 } },
    ],
    layers: ['main'],
  },
  split: {
    id: 'split',
    displayName: 'Split',
    gameId: 'valorant',
    radarUrl: '/images/maps/valorant/split_minimap.png',
    bounds: VALORANT_MAP_BOUNDS.split,
    scale: 0.01,
    offsetX: 5500,
    offsetY: 6000,
    callouts: [
      { code: 'A_SITE', name: 'A Site', position: { x: 72, y: 28 } },
      { code: 'B_SITE', name: 'B Site', position: { x: 28, y: 28 } },
      { code: 'MID', name: 'Mid', position: { x: 50, y: 45 } },
    ],
    layers: ['main'],
  },
};

/** Get Valorant map config by map name */
export function getValorantMapConfig(mapId: string): MapConfig | undefined {
  return VALORANT_MAP_CONFIGS[mapId];
}

/** Get Valorant map bounds by map name */
export function getValorantMapBounds(mapId: string): MapBounds | undefined {
  return VALORANT_MAP_BOUNDS[mapId];
}

// ============================================================================
// Valorant Utility Helpers
// ============================================================================

/** Get ability category from ability name */
export function getValorantAbilityCategory(abilityName: string): UtilityCategory {
  const normalized = abilityName.toLowerCase().replace(/\s+/g, '_');
  return VALORANT_ABILITY_CATEGORIES[normalized] || 'other';
}

/** Get agent role */
export function getValorantAgentRole(agent: ValorantAgent): ValorantAgentRole {
  const duelists: ValorantAgent[] = ['jett', 'reyna', 'raze', 'phoenix', 'yoru', 'neon', 'iso'];
  const initiators: ValorantAgent[] = ['sova', 'breach', 'skye', 'kayo', 'fade', 'gekko'];
  const controllers: ValorantAgent[] = ['brimstone', 'omen', 'viper', 'astra', 'harbor', 'clove'];
  const sentinels: ValorantAgent[] = ['sage', 'cypher', 'killjoy', 'chamber', 'deadlock', 'vyse'];
  
  if (duelists.includes(agent)) return 'duelist';
  if (initiators.includes(agent)) return 'initiator';
  if (controllers.includes(agent)) return 'controller';
  if (sentinels.includes(agent)) return 'sentinel';
  
  return 'duelist'; // Default
}

/** Get agent display name */
export function getValorantAgentDisplayName(agent: ValorantAgent): string {
  return agent.charAt(0).toUpperCase() + agent.slice(1);
}

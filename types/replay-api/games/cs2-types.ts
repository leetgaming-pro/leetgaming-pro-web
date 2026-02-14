/**
 * CS2 Game-Specific Types
 * Extends common game types for Counter-Strike 2
 */

import {
  GameId,
  Position3D,
  ViewAngle,
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
  TeamSide,
} from '../common/game-types';

// ============================================================================
// CS2-Specific Constants
// ============================================================================

export const CS2_GAME_ID: GameId = 'cs2';

/** CS2 weapon categories */
export type CS2WeaponCategory = 
  | 'pistol'
  | 'smg'
  | 'rifle'
  | 'heavy'
  | 'shotgun'
  | 'sniper'
  | 'knife'
  | 'grenade'
  | 'c4'
  | 'taser'
  | 'equipment';

/** CS2 grenade types */
export type CS2GrenadeType = 
  | 'hegrenade'
  | 'flashbang'
  | 'smokegrenade'
  | 'molotov'
  | 'incendiary'
  | 'decoy';

/** Map CS2 grenade to utility category */
export function cs2GrenadeToCategory(grenade: CS2GrenadeType): UtilityCategory {
  switch (grenade) {
    case 'hegrenade': return 'explosive';
    case 'flashbang': return 'flash';
    case 'smokegrenade': return 'smoke';
    case 'molotov':
    case 'incendiary': return 'incendiary';
    case 'decoy': return 'other';
  }
}

// ============================================================================
// CS2-Specific Events
// ============================================================================

/** CS2 weapon fire event */
export interface CS2WeaponFireEvent extends BaseGameEvent {
  type: 'weapon_fire';
  game_id: 'cs2';
  player: PlayerIdentity;
  position: Position3D;
  view_angle: ViewAngle;
  weapon: string;
  weapon_category: CS2WeaponCategory;
  silenced?: boolean;
}

/** CS2 HE grenade explosion */
export interface CS2HeGrenadeEvent extends ExplosiveUtilityEvent {
  game_id: 'cs2';
  grenade_type: 'hegrenade';
  players_hit: string[];
  enemies_hit: number;
  team_hit: number;
}

/** CS2 flashbang */
export interface CS2FlashbangEvent extends FlashUtilityEvent {
  game_id: 'cs2';
  grenade_type: 'flashbang';
}

/** CS2 smoke grenade */
export interface CS2SmokeEvent extends SmokeUtilityEvent {
  game_id: 'cs2';
  grenade_type: 'smokegrenade';
  is_one_way?: boolean;
}

/** CS2 molotov/incendiary */
export interface CS2MolotovEvent extends IncendiaryUtilityEvent {
  game_id: 'cs2';
  grenade_type: 'molotov' | 'incendiary';
  extinguished_by_smoke?: boolean;
}

/** CS2 bomb plant event */
export interface CS2BombPlantEvent extends BaseGameEvent {
  type: 'bomb_plant' | 'bomb_planted';
  game_id: 'cs2';
  player: PlayerIdentity;
  position: Position3D;
  site: 'A' | 'B';
}

/** CS2 bomb defuse event */
export interface CS2BombDefuseEvent extends BaseGameEvent {
  type: 'bomb_defuse' | 'bomb_defused';
  game_id: 'cs2';
  player: PlayerIdentity;
  position: Position3D;
  site: 'A' | 'B';
  time_remaining?: number;
  has_kit: boolean;
}

// ============================================================================
// CS2 Map Configurations
// ============================================================================

/** CS2 map bounds - used for coordinate normalization */
export const CS2_MAP_BOUNDS: Record<string, MapBounds> = {
  de_inferno: {
    minX: -2168,
    maxX: 2476,
    minY: -1380,
    maxY: 3200,
  },
  de_mirage: {
    minX: -3230,
    maxX: 1855,
    minY: -3405,
    maxY: 1820,
  },
  de_dust2: {
    minX: -2476,
    maxX: 2700,
    minY: -1262,
    maxY: 3239,
  },
  de_ancient: {
    minX: -2953,
    maxX: 2164,
    minY: -2098,
    maxY: 2290,
  },
  de_nuke: {
    minX: -3453,
    maxX: 3500,
    minY: -4290,
    maxY: 2887,
  },
  de_vertigo: {
    minX: -3168,
    maxX: 400,
    minY: -2767,
    maxY: 1050,
  },
  de_anubis: {
    minX: -2796,
    maxX: 2168,
    minY: -3168,
    maxY: 1050,
  },
};

/** Inferno callouts */
const INFERNO_CALLOUTS: MapCallout[] = [
  { code: 'A_SITE', name: 'A Site', position: { x: 75, y: 30 } },
  { code: 'B_SITE', name: 'B Site', position: { x: 25, y: 20 } },
  { code: 'MID', name: 'Mid', position: { x: 50, y: 50 } },
  { code: 'BANANA', name: 'Banana', position: { x: 20, y: 55 } },
  { code: 'APPS', name: 'Apartments', position: { x: 70, y: 65 } },
  { code: 'T_SPAWN', name: 'T Spawn', position: { x: 50, y: 85 } },
  { code: 'CT_SPAWN', name: 'CT Spawn', position: { x: 80, y: 15 } },
  { code: 'ARCH', name: 'Arch', position: { x: 60, y: 35 } },
  { code: 'LIBRARY', name: 'Library', position: { x: 78, y: 25 } },
  { code: 'PIT', name: 'Pit', position: { x: 80, y: 35 } },
];

/** CS2 map configurations */
export const CS2_MAP_CONFIGS: Record<string, MapConfig> = {
  de_inferno: {
    id: 'de_inferno',
    displayName: 'Inferno',
    gameId: 'cs2',
    radarUrl: '/images/maps/cs2/de_inferno_radar.png',
    bounds: CS2_MAP_BOUNDS.de_inferno,
    scale: 0.05,
    offsetX: 2168,
    offsetY: 3200,
    callouts: INFERNO_CALLOUTS,
    layers: ['main'],
  },
  de_mirage: {
    id: 'de_mirage',
    displayName: 'Mirage',
    gameId: 'cs2',
    radarUrl: '/images/maps/cs2/de_mirage_radar.png',
    bounds: CS2_MAP_BOUNDS.de_mirage,
    scale: 0.05,
    offsetX: 3230,
    offsetY: 1820,
    callouts: [],
    layers: ['main'],
  },
  de_dust2: {
    id: 'de_dust2',
    displayName: 'Dust 2',
    gameId: 'cs2',
    radarUrl: '/images/maps/cs2/de_dust2_radar.png',
    bounds: CS2_MAP_BOUNDS.de_dust2,
    scale: 0.05,
    offsetX: 2476,
    offsetY: 3239,
    callouts: [],
    layers: ['lower', 'upper'],
  },
  de_ancient: {
    id: 'de_ancient',
    displayName: 'Ancient',
    gameId: 'cs2',
    radarUrl: '/images/maps/cs2/de_ancient_radar.png',
    bounds: CS2_MAP_BOUNDS.de_ancient,
    scale: 0.05,
    offsetX: 2953,
    offsetY: 2290,
    callouts: [],
    layers: ['main'],
  },
  de_nuke: {
    id: 'de_nuke',
    displayName: 'Nuke',
    gameId: 'cs2',
    radarUrl: '/images/maps/cs2/de_nuke_radar.png',
    bounds: CS2_MAP_BOUNDS.de_nuke,
    scale: 0.03,
    offsetX: 3453,
    offsetY: 2887,
    callouts: [],
    layers: ['outside', 'upper', 'lower'],
  },
  de_vertigo: {
    id: 'de_vertigo',
    displayName: 'Vertigo',
    gameId: 'cs2',
    radarUrl: '/images/maps/cs2/de_vertigo_radar.png',
    bounds: CS2_MAP_BOUNDS.de_vertigo,
    scale: 0.04,
    offsetX: 3168,
    offsetY: 1050,
    callouts: [],
    layers: ['lower', 'upper'],
  },
  de_anubis: {
    id: 'de_anubis',
    displayName: 'Anubis',
    gameId: 'cs2',
    radarUrl: '/images/maps/cs2/de_anubis_radar.png',
    bounds: CS2_MAP_BOUNDS.de_anubis,
    scale: 0.04,
    offsetX: 2796,
    offsetY: 1050,
    callouts: [],
    layers: ['main'],
  },
};

/** Get CS2 map config by map name */
export function getCS2MapConfig(mapId: string): MapConfig | undefined {
  return CS2_MAP_CONFIGS[mapId];
}

/** Get CS2 map bounds by map name */
export function getCS2MapBounds(mapId: string): MapBounds | undefined {
  return CS2_MAP_BOUNDS[mapId];
}

// ============================================================================
// CS2 Utility Helpers
// ============================================================================

/** Parse CS2 grenade type from event type string */
export function parseCS2GrenadeType(eventType: string): CS2GrenadeType | null {
  const lower = eventType.toLowerCase();
  
  if (lower.includes('hegrenade') || lower === 'heexplode' || lower === 'hegrenadeexplode') {
    return 'hegrenade';
  }
  if (lower.includes('flash') || lower === 'flashexplode') {
    return 'flashbang';
  }
  if (lower.includes('smoke') || lower === 'smokestart' || lower === 'smokeend') {
    return 'smokegrenade';
  }
  if (lower.includes('molotov') || lower.includes('inferno')) {
    return 'molotov';
  }
  if (lower.includes('incendiary')) {
    return 'incendiary';
  }
  if (lower.includes('decoy')) {
    return 'decoy';
  }
  
  return null;
}

/** Check if event type is a CS2 grenade event */
export function isCS2GrenadeEvent(eventType: string): boolean {
  return parseCS2GrenadeType(eventType) !== null;
}

/** Get CS2 grenade display name */
export function getCS2GrenadeDisplayName(grenadeType: CS2GrenadeType): string {
  switch (grenadeType) {
    case 'hegrenade': return 'HE Grenade';
    case 'flashbang': return 'Flashbang';
    case 'smokegrenade': return 'Smoke';
    case 'molotov': return 'Molotov';
    case 'incendiary': return 'Incendiary';
    case 'decoy': return 'Decoy';
  }
}

/** Get CS2 grenade color for visualization */
export function getCS2GrenadeColor(grenadeType: CS2GrenadeType): string {
  switch (grenadeType) {
    case 'hegrenade': return '#ef4444';    // Red
    case 'flashbang': return '#fbbf24';    // Yellow
    case 'smokegrenade': return '#a1a1aa'; // Gray
    case 'molotov':
    case 'incendiary': return '#f97316';   // Orange
    case 'decoy': return '#3b82f6';        // Blue
  }
}

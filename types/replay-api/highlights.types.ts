/**
 * Highlight Types for Game Events
 * Represents epic moments from CS2 matches - clutches, aces, multi-kills, etc.
 */

import { GameIDKey } from './settings';

/** Supported highlight event types */
export type HighlightEventType =
  | 'Clutch'           // 1vX situations
  | 'Ace'              // All enemy team killed by one player
  | 'MultiKill'        // 3+ kills in rapid succession
  | 'Headshot'         // Clean headshot kill
  | 'Wallbang'         // Kill through penetrable surface
  | 'NoScope'          // AWP/Scout kill without scoping
  | 'FlashAssist'      // Flash-assisted kill
  | 'SmokeKill'        // Kill through smoke
  | 'Collateral'       // One bullet, multiple kills
  | 'Defuse'           // Clutch defuse moments
  | 'NinjaDiffuse'     // Sneaky defuse
  | 'Trade'            // Quick trade kill
  | 'FirstBlood'       // Opening kill of the round
  | 'MVP'              // Round MVP moment
  | 'EconomyReset'     // Force buy round win
  | 'GenericKill';     // Standard kill event

/** Clutch situation type */
export type ClutchType = '1v1' | '1v2' | '1v3' | '1v4' | '1v5';

/** Weapon categories for display */
export type WeaponCategory = 'rifle' | 'smg' | 'pistol' | 'sniper' | 'shotgun' | 'knife' | 'grenade' | 'other';

/** Player involved in the highlight */
export interface HighlightPlayer {
  id: string;
  display_name: string;
  avatar_url?: string;
  team?: string;
  team_color?: 'CT' | 'T';
  steam_id?: string;
}

/** Individual stat in a highlight */
export interface HighlightStat {
  key: string;
  label: string;
  value: number | string;
  icon?: string;
}

/** Game Event / Highlight entity */
export interface GameEvent {
  id: string;
  type: HighlightEventType;
  game_id: GameIDKey;
  match_id: string;
  tick_id: number;
  event_time: number; // Duration in milliseconds
  round_number?: number;
  
  // Display data
  title?: string;
  description?: string;
  thumbnail_url?: string;
  video_url?: string;
  video_preview_url?: string;
  
  // Players involved
  primary_player?: HighlightPlayer;
  secondary_players?: HighlightPlayer[];
  victim_player?: HighlightPlayer;
  
  // Event-specific data
  weapon?: string;
  weapon_category?: WeaponCategory;
  is_headshot?: boolean;
  is_wallbang?: boolean;
  is_noscope?: boolean;
  is_through_smoke?: boolean;
  flash_assist?: boolean;
  
  // Clutch-specific
  clutch_type?: ClutchType;
  clutch_success?: boolean;
  
  // Multi-kill specific
  kill_count?: number;
  time_span_ms?: number;
  
  // Match context
  map_name?: string;
  score_ct?: number;
  score_t?: number;
  
  // Stats summary
  stats?: HighlightStat[];
  
  // Engagement
  views_count?: number;
  likes_count?: number;
  shares_count?: number;
  
  // Timestamps
  created_at: string;
  updated_at?: string;
}

/** Highlight response for API */
export interface HighlightResponse {
  id: string;
  type: HighlightEventType;
  game_id: string;
  match_id: string;
  tick_id: number;
  event_time: number;
  stats?: Record<string, unknown>;
  created_at: string;
  // Payload may contain additional event-specific data
  payload?: Record<string, unknown>;
}

/** Paginated highlights response */
export interface HighlightsListResponse {
  highlights: GameEvent[];
  total: number;
  page: number;
  limit: number;
  has_more: boolean;
}

/** Highlight filters for searching */
export interface HighlightFilters {
  game_id?: GameIDKey;
  match_id?: string;
  player_id?: string;
  event_type?: HighlightEventType | HighlightEventType[];
  map_name?: string;
  min_kills?: number;
  clutch_type?: ClutchType;
  weapon?: string;
  is_headshot?: boolean;
  is_wallbang?: boolean;
  from_date?: string;
  to_date?: string;
  sort_by?: 'created_at' | 'views_count' | 'likes_count' | 'kill_count';
  sort_order?: 'asc' | 'desc';
  page?: number;
  limit?: number;
  cursor?: string;
}

/** Highlight category for filtering UI */
export interface HighlightCategory {
  key: HighlightEventType;
  label: string;
  icon: string;
  color: string;
  description: string;
}

/** Predefined highlight categories */
export const HIGHLIGHT_CATEGORIES: HighlightCategory[] = [
  { key: 'Clutch', label: 'Clutches', icon: 'solar:crown-bold', color: '#FFD700', description: '1vX situation wins' },
  { key: 'Ace', label: 'Aces', icon: 'solar:stars-bold', color: '#FF4654', description: 'Entire enemy team eliminated' },
  { key: 'MultiKill', label: 'Multi-Kills', icon: 'solar:fire-bold', color: '#FF6B35', description: '3+ rapid kills' },
  { key: 'Headshot', label: 'Headshots', icon: 'solar:target-bold', color: '#00D9FF', description: 'Clean headshot eliminations' },
  { key: 'Wallbang', label: 'Wallbangs', icon: 'solar:shield-minimalistic-bold', color: '#9D4EDD', description: 'Through-wall kills' },
  { key: 'NoScope', label: 'No-Scopes', icon: 'solar:eye-closed-bold', color: '#06FFA5', description: 'Hip-fire sniper kills' },
  { key: 'SmokeKill', label: 'Smoke Kills', icon: 'solar:cloud-bold', color: '#888888', description: 'Through smoke eliminations' },
  { key: 'FirstBlood', label: 'First Bloods', icon: 'solar:flash-bold', color: '#FF0066', description: 'Opening kills' },
];

/** Get category by type */
export function getHighlightCategory(type: HighlightEventType): HighlightCategory | undefined {
  return HIGHLIGHT_CATEGORIES.find(cat => cat.key === type);
}

/** Get display color for event type */
export function getEventTypeColor(type: HighlightEventType): string {
  return getHighlightCategory(type)?.color || '#DCFF37';
}

/** Get display icon for event type */
export function getEventTypeIcon(type: HighlightEventType): string {
  return getHighlightCategory(type)?.icon || 'solar:play-bold';
}

/** Format event time for display */
export function formatEventTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

/** Format clutch type for display */
export function formatClutchType(clutchType?: ClutchType): string {
  if (!clutchType) return '';
  return clutchType.replace('v', ' vs ');
}


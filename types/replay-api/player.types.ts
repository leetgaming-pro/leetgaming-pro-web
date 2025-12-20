/**
 * Player Profile Types
 * Type definitions for player profile operations
 */

// ============================================================================
// Enums
// ============================================================================

export enum PlayerVisibility {
  PUBLIC = 'public',
  RESTRICTED = 'restricted',
  PRIVATE = 'private',
}

export enum PlayerStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
}

export enum GameTitle {
  CS2 = 'cs2',
  CSGO = 'csgo',
  VALORANT = 'valorant',
  LOL = 'lol',
  DOTA2 = 'dota2',
}

// ============================================================================
// Interfaces
// ============================================================================

export interface SocialLinks {
  discord?: string;
  twitch?: string;
  twitter?: string;
  youtube?: string;
  steam_id?: string;
}

export interface PlayerStats {
  matches_played: number;
  wins: number;
  losses: number;
  rating: number;
  kills?: number;
  deaths?: number;
  assists?: number;
  headshot_percentage?: number;
  adr?: number;
}

export interface PlayerProfileData {
  id: string;
  user_id: string;
  display_name: string;
  slug: string;
  avatar_url?: string;
  bio?: string;
  game: GameTitle;
  role: string;
  rank?: string;
  country?: string;
  timezone?: string;
  looking_for_team: boolean;
  visibility: PlayerVisibility;
  status: PlayerStatus;
  social_links: SocialLinks;
  stats: PlayerStats;
  created_at: string;
  updated_at: string;
}

export interface CreatePlayerRequest {
  display_name: string;
  slug: string;
  avatar_url?: string;
  bio?: string;
  game: GameTitle;
  role: string;
  rank?: string;
  country?: string;
  timezone?: string;
  looking_for_team?: boolean;
  visibility?: PlayerVisibility;
  social_links?: SocialLinks;
}

export interface UpdatePlayerRequest {
  display_name?: string;
  slug?: string;
  avatar_url?: string;
  bio?: string;
  role?: string;
  rank?: string;
  country?: string;
  timezone?: string;
  looking_for_team?: boolean;
  visibility?: PlayerVisibility;
  social_links?: SocialLinks;
}

export interface PlayerSearchFilters {
  game?: GameTitle;
  role?: string;
  rank?: string;
  country?: string;
  looking_for_team?: boolean;
  min_rating?: number;
  max_rating?: number;
  search?: string;
  page?: number;
  limit?: number;
}

export interface PlayerSearchResult {
  players: PlayerProfileData[];
  total: number;
  page: number;
  limit: number;
  has_more: boolean;
}


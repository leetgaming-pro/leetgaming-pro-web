/**
 * Players SDK for frontend-to-backend communication
 * Handles player profile CRUD operations
 */

import { Loggable } from '@/lib/logger';

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
// Types
// ============================================================================

export interface PlayerProfile {
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
  players: PlayerProfile[];
  total: number;
  page: number;
  limit: number;
  has_more: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// ============================================================================
// SDK Class
// ============================================================================

export class PlayersSDK {
  private baseUrl: string;
  private logger: Loggable;

  constructor(baseUrl: string, logger: Loggable) {
    this.baseUrl = baseUrl;
    this.logger = logger;
  }

  /**
   * Create a new player profile
   */
  async createPlayer(request: CreatePlayerRequest): Promise<PlayerProfile> {
    try {
      const response = await fetch(`${this.baseUrl}/players`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
        credentials: 'include',
      });

      const result: ApiResponse<PlayerProfile> = await response.json();

      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to create player profile');
      }

      this.logger.info('[PlayersSDK] Player profile created', { player_id: result.data.id });
      return result.data;
    } catch (error: any) {
      this.logger.error('[PlayersSDK] Failed to create player', { error: error.message });
      throw error;
    }
  }

  /**
   * Get current user's player profile
   */
  async getMyProfile(): Promise<PlayerProfile | null> {
    try {
      const response = await fetch(`${this.baseUrl}/players/me`, {
        method: 'GET',
        credentials: 'include',
      });

      if (response.status === 404) {
        return null;
      }

      const result: ApiResponse<PlayerProfile> = await response.json();

      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to get player profile');
      }

      return result.data;
    } catch (error: any) {
      this.logger.error('[PlayersSDK] Failed to get profile', { error: error.message });
      throw error;
    }
  }

  /**
   * Get a player profile by ID
   */
  async getPlayer(playerId: string): Promise<PlayerProfile> {
    try {
      const response = await fetch(`${this.baseUrl}/players/${playerId}`, {
        method: 'GET',
        credentials: 'include',
      });

      const result: ApiResponse<PlayerProfile> = await response.json();

      if (!result.success || !result.data) {
        throw new Error(result.error || 'Player not found');
      }

      return result.data;
    } catch (error: any) {
      this.logger.error('[PlayersSDK] Failed to get player', { error: error.message, playerId });
      throw error;
    }
  }

  /**
   * Get a player profile by slug
   */
  async getPlayerBySlug(slug: string): Promise<PlayerProfile> {
    try {
      const response = await fetch(`${this.baseUrl}/players/slug/${slug}`, {
        method: 'GET',
        credentials: 'include',
      });

      const result: ApiResponse<PlayerProfile> = await response.json();

      if (!result.success || !result.data) {
        throw new Error(result.error || 'Player not found');
      }

      return result.data;
    } catch (error: any) {
      this.logger.error('[PlayersSDK] Failed to get player by slug', { error: error.message, slug });
      throw error;
    }
  }

  /**
   * Update player profile
   */
  async updatePlayer(playerId: string, request: UpdatePlayerRequest): Promise<PlayerProfile> {
    try {
      const response = await fetch(`${this.baseUrl}/players/${playerId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
        credentials: 'include',
      });

      const result: ApiResponse<PlayerProfile> = await response.json();

      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to update player profile');
      }

      this.logger.info('[PlayersSDK] Player profile updated', { player_id: playerId });
      return result.data;
    } catch (error: any) {
      this.logger.error('[PlayersSDK] Failed to update player', { error: error.message, playerId });
      throw error;
    }
  }

  /**
   * Search for players
   */
  async searchPlayers(filters: PlayerSearchFilters): Promise<PlayerSearchResult> {
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });

      const response = await fetch(`${this.baseUrl}/players?${params.toString()}`, {
        method: 'GET',
        credentials: 'include',
      });

      const result: ApiResponse<PlayerSearchResult> = await response.json();

      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to search players');
      }

      return result.data;
    } catch (error: any) {
      this.logger.error('[PlayersSDK] Failed to search players', { error: error.message });
      throw error;
    }
  }

  /**
   * Check if a slug is available
   */
  async checkSlugAvailability(slug: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/players/check-slug?slug=${encodeURIComponent(slug)}`, {
        method: 'GET',
        credentials: 'include',
      });

      const result: ApiResponse<{ available: boolean }> = await response.json();

      return result.data?.available ?? false;
    } catch (error: any) {
      this.logger.error('[PlayersSDK] Failed to check slug', { error: error.message, slug });
      return false;
    }
  }

  /**
   * Upload player avatar
   */
  async uploadAvatar(file: File): Promise<string> {
    try {
      const formData = new FormData();
      formData.append('avatar', file);

      const response = await fetch(`${this.baseUrl}/players/avatar`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      const result: ApiResponse<{ avatar_url: string }> = await response.json();

      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to upload avatar');
      }

      this.logger.info('[PlayersSDK] Avatar uploaded');
      return result.data.avatar_url;
    } catch (error: any) {
      this.logger.error('[PlayersSDK] Failed to upload avatar', { error: error.message });
      throw error;
    }
  }
}

// Export singleton instance
import { logger } from '@/lib/logger';
export const playersSDK = new PlayersSDK('/api', logger);

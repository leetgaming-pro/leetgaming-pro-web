/**
 * @deprecated Use `ReplayAPISDK.playerProfiles` from `@/types/replay-api/sdk` instead.
 * This file is kept for backwards compatibility but will be removed in a future version.
 * 
 * Migration:
 * ```typescript
 * // OLD (deprecated)
 * import { playersSDK } from '@/types/replay-api/players.sdk';
 * await playersSDK.getMyProfile();
 * 
 * // NEW (recommended)
 * import { ReplayAPISDK } from '@/types/replay-api/sdk';
 * import { ReplayApiSettingsMock } from '@/types/replay-api/settings';
 * import { logger } from '@/lib/logger';
 * const sdk = new ReplayAPISDK({ ...ReplayApiSettingsMock, baseUrl: '/api' }, logger);
 * await sdk.playerProfiles.getMyProfile();
 * ```
 */

import { Loggable } from '@/lib/logger';

// Re-export types from the proper types file for backward compatibility
export {
  PlayerVisibility,
  PlayerStatus,
  GameTitle,
  type SocialLinks,
  type PlayerStats,
  type PlayerProfileData,
  type CreatePlayerRequest,
  type UpdatePlayerRequest,
  type PlayerSearchFilters,
  type PlayerSearchResult,
} from './player.types';

import type {
  PlayerVisibility,
  PlayerStatus,
  GameTitle,
  SocialLinks,
  PlayerStats,
  CreatePlayerRequest,
  UpdatePlayerRequest,
  PlayerSearchFilters,
  PlayerSearchResult,
  PlayerProfileData,
} from './player.types';

// Alias for backward compatibility
export type PlayerProfile = PlayerProfileData;

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
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error('[PlayersSDK] Failed to create player', { error: message });
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
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error('[PlayersSDK] Failed to get profile', { error: message });
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
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error('[PlayersSDK] Failed to get player', { error: message, playerId });
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
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error('[PlayersSDK] Failed to get player by slug', { error: message, slug });
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
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error('[PlayersSDK] Failed to update player', { error: message, playerId });
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
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error('[PlayersSDK] Failed to search players', { error: message });
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
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error('[PlayersSDK] Failed to check slug', { error: message, slug });
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
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error('[PlayersSDK] Failed to upload avatar', { error: message });
      throw error;
    }
  }
}

// Export singleton instance
import { logger } from '@/lib/logger';
export const playersSDK = new PlayersSDK('/api', logger);

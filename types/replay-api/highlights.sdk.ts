/**
 * Highlights/Game Events API wrapper
 * Provides type-safe access to game event highlights (clutches, aces, etc.)
 */

import { ReplayApiClient } from './replay-api.client';
import {
  GameEvent,
  HighlightsListResponse,
  HighlightFilters,
  HighlightEventType,
  HighlightResponse,
} from './highlights.types';
import { GameIDKey } from './settings';
import { GameIDString } from './highlights.types';

/** Default game ID */
const DEFAULT_GAME_ID: GameIDString = 'cs2';

/**
 * Transform API response to GameEvent
 */
function transformHighlightResponse(response: HighlightResponse): GameEvent {
  const payload = response.payload || {};
  
  return {
    id: response.id,
    type: response.type as HighlightEventType,
    game_id: response.game_id as GameIDKey,
    match_id: response.match_id,
    tick_id: response.tick_id,
    event_time: response.event_time,
    round_number: payload.round_number as number | undefined,
    title: payload.title as string | undefined,
    description: payload.description as string | undefined,
    thumbnail_url: payload.thumbnail_url as string | undefined,
    video_url: payload.video_url as string | undefined,
    primary_player: payload.primary_player as GameEvent['primary_player'],
    secondary_players: payload.secondary_players as GameEvent['secondary_players'],
    victim_player: payload.victim_player as GameEvent['victim_player'],
    weapon: payload.weapon as string | undefined,
    weapon_category: payload.weapon_category as GameEvent['weapon_category'],
    is_headshot: payload.is_headshot as boolean | undefined,
    is_wallbang: payload.is_wallbang as boolean | undefined,
    is_noscope: payload.is_noscope as boolean | undefined,
    is_through_smoke: payload.is_through_smoke as boolean | undefined,
    flash_assist: payload.flash_assist as boolean | undefined,
    clutch_type: payload.clutch_type as GameEvent['clutch_type'],
    clutch_success: payload.clutch_success as boolean | undefined,
    kill_count: payload.kill_count as number | undefined,
    time_span_ms: payload.time_span_ms as number | undefined,
    map_name: payload.map_name as string | undefined,
    score_ct: payload.score_ct as number | undefined,
    score_t: payload.score_t as number | undefined,
    views_count: payload.views_count as number | undefined,
    likes_count: payload.likes_count as number | undefined,
    shares_count: payload.shares_count as number | undefined,
    created_at: response.created_at,
    stats: response.stats as GameEvent['stats'],
  };
}

/**
 * Highlights API wrapper for game event highlights
 */
export class HighlightsAPI {
  constructor(private client: ReplayApiClient) {}

  /**
   * Get all highlights/game events with optional filtering
   */
  async getHighlights(
    filters: HighlightFilters = {}
  ): Promise<HighlightsListResponse> {
    const gameId = filters.game_id || DEFAULT_GAME_ID;
    const params = new URLSearchParams();

    // Apply filters
    if (filters.match_id) params.append('match_id', filters.match_id);
    if (filters.player_id) params.append('player_id', filters.player_id);
    if (filters.map_name) params.append('map', filters.map_name);
    
    if (filters.event_type) {
      const types = Array.isArray(filters.event_type)
        ? filters.event_type
        : [filters.event_type];
      types.forEach(t => params.append('type', t));
    }
    
    if (filters.clutch_type) params.append('clutch_type', filters.clutch_type);
    if (filters.weapon) params.append('weapon', filters.weapon);
    if (filters.min_kills) params.append('min_kills', String(filters.min_kills));
    if (filters.is_headshot !== undefined) params.append('is_headshot', String(filters.is_headshot));
    if (filters.is_wallbang !== undefined) params.append('is_wallbang', String(filters.is_wallbang));
    if (filters.from_date) params.append('from', filters.from_date);
    if (filters.to_date) params.append('to', filters.to_date);
    
    // Pagination & sorting
    if (filters.sort_by) params.append('sort', filters.sort_by);
    if (filters.sort_order) params.append('order', filters.sort_order);
    if (filters.page) params.append('page', String(filters.page));
    if (filters.limit) params.append('limit', String(filters.limit));
    if (filters.cursor) params.append('cursor', filters.cursor);

    const queryString = params.toString();
    const url = `/games/${gameId}/events${queryString ? `?${queryString}` : ''}`;

    const response = await this.client.get<HighlightResponse[] | { data: HighlightResponse[]; total?: number; page?: number; limit?: number }>(url);
    
    // Handle different response formats
    let highlights: GameEvent[] = [];
    let total = 0;
    let page = filters.page || 1;
    let limit = filters.limit || 20;
    
    if (response.data) {
      if (Array.isArray(response.data)) {
        highlights = response.data.map(transformHighlightResponse);
        total = highlights.length;
      } else if ('data' in response.data && Array.isArray(response.data.data)) {
        highlights = response.data.data.map(transformHighlightResponse);
        total = response.data.total || highlights.length;
        page = response.data.page || page;
        limit = response.data.limit || limit;
      }
    }

    return {
      highlights,
      total,
      page,
      limit,
      has_more: highlights.length >= limit,
    };
  }

  /**
   * Get a single highlight by ID
   */
  async getHighlight(
    gameId: GameIDKey | GameIDString,
    highlightId: string
  ): Promise<GameEvent | null> {
    const response = await this.client.get<HighlightResponse>(
      `/games/${gameId}/events/${highlightId}`
    );

    if (response.data) {
      return transformHighlightResponse(response.data);
    }

    return null;
  }

  /**
   * Get highlights for a specific match
   */
  async getMatchHighlights(
    gameId: GameIDKey | GameIDString,
    matchId: string,
    eventTypes?: HighlightEventType[]
  ): Promise<GameEvent[]> {
    const filters: HighlightFilters = {
      game_id: gameId,
      match_id: matchId,
      event_type: eventTypes,
    };

    const result = await this.getHighlights(filters);
    return result.highlights;
  }

  /**
   * Get highlights for a specific player
   */
  async getPlayerHighlights(
    playerId: string,
    options?: {
      gameId?: GameIDKey | GameIDString;
      eventTypes?: HighlightEventType[];
      limit?: number;
    }
  ): Promise<GameEvent[]> {
    const filters: HighlightFilters = {
      game_id: options?.gameId,
      player_id: playerId,
      event_type: options?.eventTypes,
      limit: options?.limit,
      sort_by: 'created_at',
      sort_order: 'desc',
    };

    const result = await this.getHighlights(filters);
    return result.highlights;
  }

  /**
   * Get trending highlights (most viewed recently)
   */
  async getTrendingHighlights(
    options?: {
      gameId?: GameIDKey | GameIDString;
      limit?: number;
    }
  ): Promise<GameEvent[]> {
    const filters: HighlightFilters = {
      game_id: options?.gameId,
      limit: options?.limit || 10,
      sort_by: 'views_count',
      sort_order: 'desc',
    };

    const result = await this.getHighlights(filters);
    return result.highlights;
  }

  /**
   * Get clutch highlights only
   */
  async getClutches(
    options?: {
      gameId?: GameIDKey | GameIDString;
      clutchType?: GameEvent['clutch_type'];
      limit?: number;
    }
  ): Promise<GameEvent[]> {
    const filters: HighlightFilters = {
      game_id: options?.gameId,
      event_type: 'Clutch',
      clutch_type: options?.clutchType,
      limit: options?.limit,
      sort_by: 'created_at',
      sort_order: 'desc',
    };

    const result = await this.getHighlights(filters);
    return result.highlights;
  }

  /**
   * Get ace highlights only
   */
  async getAces(
    options?: {
      gameId?: GameIDKey | GameIDString;
      limit?: number;
    }
  ): Promise<GameEvent[]> {
    const filters: HighlightFilters = {
      game_id: options?.gameId,
      event_type: 'Ace',
      limit: options?.limit,
      sort_by: 'created_at',
      sort_order: 'desc',
    };

    const result = await this.getHighlights(filters);
    return result.highlights;
  }

  /**
   * Like a highlight (requires authentication)
   */
  async likeHighlight(
    gameId: GameIDKey | GameIDString,
    highlightId: string
  ): Promise<boolean> {
    const response = await this.client.post(
      `/games/${gameId}/events/${highlightId}/like`
    );
    return response.status === 200 || response.status === 201;
  }

  /**
   * Unlike a highlight (requires authentication)
   */
  async unlikeHighlight(
    gameId: GameIDKey | GameIDString,
    highlightId: string
  ): Promise<boolean> {
    const response = await this.client.delete(
      `/games/${gameId}/events/${highlightId}/like`
    );
    return response.status === 200 || response.status === 204;
  }

  /**
   * Share a highlight - returns a share URL
   */
  async shareHighlight(
    gameId: GameIDKey | GameIDString,
    highlightId: string
  ): Promise<{ share_url: string } | null> {
    const response = await this.client.post<{ share_url: string }>(
      `/games/${gameId}/events/${highlightId}/share`
    );
    return response.data || null;
  }

  /**
   * Report a highlight (requires authentication)
   */
  async reportHighlight(
    gameId: GameIDKey | GameIDString,
    highlightId: string,
    reason: string
  ): Promise<boolean> {
    const response = await this.client.post(
      `/games/${gameId}/events/${highlightId}/report`,
      { reason }
    );
    return response.status === 200 || response.status === 201;
  }
}


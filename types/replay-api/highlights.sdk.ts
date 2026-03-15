/**
 * Highlights/Game Events API wrapper
 * Provides type-safe access to game event highlights (clutches, aces, etc.)
 */

import { ReplayApiClient } from "./replay-api.client";
import {
  GameEvent,
  HighlightsListResponse,
  HighlightFilters,
  HighlightEventType,
  HighlightResponse,
} from "./highlights.types";
import { GameIDKey } from "./settings";
import { GameIDString } from "./highlights.types";

/** Default game ID */
const DEFAULT_GAME_ID: GameIDString = "cs2";

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
    round_number: response.round_number ?? (payload.round_number as number | undefined),
    title: payload.title as string | undefined,
    description: payload.description as string | undefined,
    thumbnail_url: payload.thumbnail_url as string | undefined,
    video_url: payload.video_url as string | undefined,
    primary_player: payload.primary_player as GameEvent["primary_player"],
    secondary_players:
      payload.secondary_players as GameEvent["secondary_players"],
    victim_player: payload.victim_player as GameEvent["victim_player"],
    weapon: payload.weapon as string | undefined,
    weapon_category: payload.weapon_category as GameEvent["weapon_category"],
    is_headshot: payload.is_headshot as boolean | undefined,
    is_wallbang: payload.is_wallbang as boolean | undefined,
    is_noscope: payload.is_noscope as boolean | undefined,
    is_through_smoke: payload.is_through_smoke as boolean | undefined,
    flash_assist: payload.flash_assist as boolean | undefined,
    clutch_type: payload.clutch_type as GameEvent["clutch_type"],
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
    stats: response.stats as GameEvent["stats"],
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
    if (filters.match_id) params.append("match_id", filters.match_id);
    if (filters.player_id) params.append("player_id", filters.player_id);
    if (filters.map_name) params.append("map", filters.map_name);

    if (filters.event_type) {
      const types = Array.isArray(filters.event_type)
        ? filters.event_type
        : [filters.event_type];
      types.forEach((t) => params.append("type", t));
    }

    if (filters.clutch_type) params.append("clutch_type", filters.clutch_type);
    if (filters.weapon) params.append("weapon", filters.weapon);
    if (filters.min_kills)
      params.append("min_kills", String(filters.min_kills));
    if (filters.is_headshot !== undefined)
      params.append("is_headshot", String(filters.is_headshot));
    if (filters.is_wallbang !== undefined)
      params.append("is_wallbang", String(filters.is_wallbang));
    if (filters.from_date) params.append("from", filters.from_date);
    if (filters.to_date) params.append("to", filters.to_date);

    // Pagination & sorting
    if (filters.sort_by) params.append("sort", filters.sort_by);
    if (filters.sort_order) params.append("order", filters.sort_order);
    if (filters.page) params.append("page", String(filters.page));
    if (filters.limit) params.append("limit", String(filters.limit));
    if (filters.cursor) params.append("cursor", filters.cursor);

    const queryString = params.toString();
    const url = `/games/${gameId}/events${
      queryString ? `?${queryString}` : ""
    }`;

    const response = await this.client.get<
      | HighlightResponse[]
      | {
          data: HighlightResponse[];
          total?: number;
          page?: number;
          limit?: number;
        }
    >(url);

    // Handle different response formats
    let highlights: GameEvent[] = [];
    let total = 0;
    let page = filters.page || 1;
    let limit = filters.limit || 20;

    if (response.data) {
      if (Array.isArray(response.data)) {
        highlights = response.data.map(transformHighlightResponse);
        total = highlights.length;
      } else if ("data" in response.data && Array.isArray(response.data.data)) {
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
   * Get highlights for a specific match using server-side filtering
   * Optimized for scalability - only fetches highlight-worthy events from API
   */
  async getMatchHighlights(
    gameId: GameIDKey | GameIDString,
    matchId: string,
    eventTypes?: HighlightEventType[]
  ): Promise<GameEvent[]> {
    // API response format with pagination support
    interface APIEvent {
      id: string;
      type: string;
      game_id: string;
      match_id: string;
      tick: number;
      tick_id?: number;
      event_time: number;
      round_number?: number;
      payload: Array<{ Key: string; Value: unknown }> | Record<string, unknown>;
      stats?: Record<string, unknown>;
    }
    
    interface APIResponse {
      events: APIEvent[];
      match_id: string;
      total_events: number;
      returned: number;
      limit: number;
      offset: number;
      has_more: boolean;
    }
    
    // Server-side filter for highlight-worthy events only
    // This dramatically improves performance for matches with thousands of events
    const highlightEventTypes = ['kill', 'clutchstart', 'clutchend', 'ace', 'multikill'];
    const eventTypesParam = highlightEventTypes.join(',');
    
    // Fetch only highlight events with server-side filtering
    const response = await this.client.get<APIResponse>(
      `/games/${gameId}/matches/${matchId}/events?event_types=${eventTypesParam}&limit=500`
    );
    
    if (!response.data?.events) {
      return [];
    }
    
    // Helper to extract payload value from Key/Value array format
    const getPayloadValue = (payload: APIEvent['payload'], key: string): unknown => {
      if (Array.isArray(payload)) {
        const item = payload.find(p => p.Key.toLowerCase() === key.toLowerCase());
        return item?.Value;
      }
      return (payload as Record<string, unknown>)?.[key];
    };
    
    // Transform API events to GameEvent format
    const highlights: GameEvent[] = [];
    
    for (const event of response.data.events) {
      const eventTypeLower = event.type.toLowerCase();
      
      // Apply client-side filter if specific types requested
      if (eventTypes && eventTypes.length > 0) {
        const matchesType = eventTypes.some(
          t => t.toLowerCase() === eventTypeLower || 
               (t === 'Clutch' && eventTypeLower.startsWith('clutch'))
        );
        if (!matchesType) continue;
      }
      
      const payload = event.payload;
      
      // Map API event types to highlight types
      let highlightType: HighlightEventType;
      const isHeadshot = Boolean(getPayloadValue(payload, 'headshot'));
      const isWallbang = Boolean(getPayloadValue(payload, 'is_wallbang') || getPayloadValue(payload, 'wallbang') || getPayloadValue(payload, 'iswallbang'));
      const isNoScope = Boolean(getPayloadValue(payload, 'noscope') || getPayloadValue(payload, 'is_no_scope'));
      const isThroughSmoke = Boolean(getPayloadValue(payload, 'is_through_smoke') || getPayloadValue(payload, 'throughsmoke') || getPayloadValue(payload, 'isthroughsmoke'));
      const isOpeningKill = Boolean(getPayloadValue(payload, 'isopeningkill') || getPayloadValue(payload, 'is_opening_kill'));

      if (eventTypeLower === 'kill') {
        // Initial classification — will be upgraded by multi-kill detection below
        if (isOpeningKill) highlightType = 'FirstBlood';
        else if (isWallbang) highlightType = 'Wallbang';
        else if (isNoScope) highlightType = 'NoScope';
        else if (isThroughSmoke) highlightType = 'SmokeKill';
        else if (isHeadshot) highlightType = 'Headshot';
        else highlightType = 'GenericKill';
      } else if (eventTypeLower.startsWith('clutch')) {
        highlightType = 'Clutch';
      } else if (eventTypeLower === 'ace') {
        highlightType = 'Ace';
      } else if (eventTypeLower === 'multikill') {
        const killCount = Number(getPayloadValue(payload, 'kill_count') || getPayloadValue(payload, 'kills')) || 0;
        if (killCount >= 5) highlightType = 'Ace';
        else if (killCount >= 4) highlightType = 'QuadraKill';
        else if (killCount >= 3) highlightType = 'TripleKill';
        else highlightType = 'MultiKill';
      } else {
        highlightType = 'GenericKill';
      }
      
      highlights.push({
        id: event.id,
        type: highlightType,
        game_id: event.game_id as GameIDKey,
        match_id: event.match_id,
        tick_id: event.tick_id || event.tick,
        event_time: event.event_time,
        round_number: event.round_number || Number(getPayloadValue(payload, 'round_number')) || undefined,
        title: String(getPayloadValue(payload, 'killername') || getPayloadValue(payload, 'killer_name') || getPayloadValue(payload, 'title') || ''),
        primary_player: {
          display_name: String(getPayloadValue(payload, 'killername') || getPayloadValue(payload, 'killer_name') || ''),
          id: String(getPayloadValue(payload, 'killerid') || getPayloadValue(payload, 'killer_steam_id') || getPayloadValue(payload, 'sourceplayerid') || ''),
        },
        victim_player: {
          display_name: String(getPayloadValue(payload, 'victimname') || getPayloadValue(payload, 'victim_name') || ''),
          id: String(getPayloadValue(payload, 'victimid') || getPayloadValue(payload, 'victim_steam_id') || getPayloadValue(payload, 'targetplayerid') || ''),
        },
        weapon: String(getPayloadValue(payload, 'weapon') || ''),
        is_headshot: Boolean(getPayloadValue(payload, 'headshot')),
        is_wallbang: Boolean(getPayloadValue(payload, 'is_wallbang') || getPayloadValue(payload, 'wallbang') || getPayloadValue(payload, 'iswallbang')),
        is_noscope: Boolean(getPayloadValue(payload, 'noscope') || getPayloadValue(payload, 'is_no_scope')),
        is_through_smoke: Boolean(getPayloadValue(payload, 'is_through_smoke') || getPayloadValue(payload, 'throughsmoke') || getPayloadValue(payload, 'isthroughsmoke')),
        clutch_type: eventTypeLower.startsWith('clutch') 
          ? (String(getPayloadValue(payload, 'clutch_type') || getPayloadValue(payload, 'odds')) as GameEvent['clutch_type'])
          : undefined,
        clutch_success: eventTypeLower === 'clutchend'
          ? Boolean(getPayloadValue(payload, 'success') || getPayloadValue(payload, 'won'))
          : undefined,
        kill_count: Number(getPayloadValue(payload, 'kill_count') || getPayloadValue(payload, 'kills')) || undefined,
        created_at: new Date().toISOString(),
        stats: event.stats as GameEvent['stats'],
      });
    }
    
    // ─── Multi-Kill Detection ─────────────────────────────────────────────
    // Group kills by (killer_id, round_number) to detect Aces, Quad Kills, Triple Kills
    const killHighlights = highlights.filter(h => 
      h.type === 'GenericKill' || h.type === 'Headshot' || h.type === 'FirstBlood' || 
      h.type === 'Wallbang' || h.type === 'NoScope' || h.type === 'SmokeKill'
    );
    const nonKillHighlights = highlights.filter(h => 
      h.type !== 'GenericKill' && h.type !== 'Headshot' && h.type !== 'FirstBlood' && 
      h.type !== 'Wallbang' && h.type !== 'NoScope' && h.type !== 'SmokeKill'
    );
    
    const killsByPlayerRound = new Map<string, GameEvent[]>();
    for (const kill of killHighlights) {
      const key = `${kill.primary_player?.id || 'unknown'}_${kill.round_number || 0}`;
      if (!killsByPlayerRound.has(key)) killsByPlayerRound.set(key, []);
      killsByPlayerRound.get(key)!.push(kill);
    }
    
    const enhancedHighlights: GameEvent[] = [...nonKillHighlights];
    
    for (const [, kills] of killsByPlayerRound) {
      const killCount = kills.length;
      
      if (killCount >= 5) {
        // ACE — player killed entire enemy team
        enhancedHighlights.push({
          ...kills[0],
          type: 'Ace',
          kill_count: killCount,
          title: `${kills[0].primary_player?.display_name || 'Unknown'} ACE`,
        });
      } else if (killCount >= 4) {
        // QUAD KILL
        enhancedHighlights.push({
          ...kills[0],
          type: 'QuadraKill',
          kill_count: killCount,
          title: `${kills[0].primary_player?.display_name || 'Unknown'} QUAD KILL`,
        });
      } else if (killCount >= 3) {
        // TRIPLE KILL
        enhancedHighlights.push({
          ...kills[0],
          type: 'TripleKill',
          kill_count: killCount,
          title: `${kills[0].primary_player?.display_name || 'Unknown'} TRIPLE KILL`,
        });
      }
      
      // Always keep special kills (wallbang, noscope, smoke, opening kill) individually
      for (const kill of kills) {
        if (kill.type === 'FirstBlood' || kill.type === 'Wallbang' || 
            kill.type === 'NoScope' || kill.type === 'SmokeKill') {
          enhancedHighlights.push(kill);
        } else if (killCount < 3) {
          // For non-multi-kill rounds, keep headshots; skip generic kills
          if (kill.type === 'Headshot') {
            enhancedHighlights.push(kill);
          }
        }
      }
    }
    
    // Sort by priority: Ace > QuadKill > TripleKill > Clutch > FirstBlood > special > headshots
    const typePriority: Record<string, number> = {
      'Ace': 10, 'QuadraKill': 9, 'TripleKill': 8, 'Clutch': 7,
      'FirstBlood': 6, 'Wallbang': 5, 'NoScope': 5, 'SmokeKill': 5,
      'Headshot': 3, 'GenericKill': 1, 'MultiKill': 8,
    };
    
    enhancedHighlights.sort((a, b) => {
      const pa = typePriority[a.type] || 0;
      const pb = typePriority[b.type] || 0;
      if (pa !== pb) return pb - pa;
      return (a.round_number || 0) - (b.round_number || 0);
    });
    
    return enhancedHighlights;
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
      sort_by: "created_at",
      sort_order: "desc",
    };

    const result = await this.getHighlights(filters);
    return result.highlights;
  }

  /**
   * Get trending highlights (most viewed recently)
   */
  async getTrendingHighlights(options?: {
    gameId?: GameIDKey | GameIDString;
    limit?: number;
  }): Promise<GameEvent[]> {
    const filters: HighlightFilters = {
      game_id: options?.gameId,
      limit: options?.limit || 10,
      sort_by: "views_count",
      sort_order: "desc",
    };

    const result = await this.getHighlights(filters);
    return result.highlights;
  }

  /**
   * Get clutch highlights only
   */
  async getClutches(options?: {
    gameId?: GameIDKey | GameIDString;
    clutchType?: GameEvent["clutch_type"];
    limit?: number;
  }): Promise<GameEvent[]> {
    const filters: HighlightFilters = {
      game_id: options?.gameId,
      event_type: "Clutch",
      clutch_type: options?.clutchType,
      limit: options?.limit,
      sort_by: "created_at",
      sort_order: "desc",
    };

    const result = await this.getHighlights(filters);
    return result.highlights;
  }

  /**
   * Get ace highlights only
   */
  async getAces(options?: {
    gameId?: GameIDKey | GameIDString;
    limit?: number;
  }): Promise<GameEvent[]> {
    const filters: HighlightFilters = {
      game_id: options?.gameId,
      event_type: "Ace",
      limit: options?.limit,
      sort_by: "created_at",
      sort_order: "desc",
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

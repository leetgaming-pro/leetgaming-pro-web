/**
 * High-level API endpoint wrappers for common operations
 * Provides type-safe, convenient methods for interacting with replay-api
 */

import { ReplayApiClient } from './replay-api.client';
import { ReplayApiSettings } from './settings';
import { Loggable } from '@/lib/logger';
import { Squad, PlayerProfile, User, Profile, IdentifierSourceType } from './entities.types';
import { OnboardingResponse } from './auth';
import { WalletAPI } from './wallet.sdk';
import { LobbyAPI } from './lobby.sdk';
import { PrizePoolAPI } from './prize-pool.sdk';
import { PaymentAPI } from './payment.sdk';
import { MatchmakingAPI } from './matchmaking.sdk';
import { TournamentAPI } from './tournament.sdk';
import { MatchAnalyticsAPI } from './match-analytics.sdk';
import { ChallengeAPI } from './challenge.sdk';
import { HighlightsAPI } from './highlights.sdk';
import { BlockchainAPI } from './blockchain.sdk';
import { ReplayFile } from './replay-file';

/**
 * Match data structure
 */
export interface MatchData {
  id?: string;
  match_id?: string;
  game_id?: string;
  map?: string;
  mode?: string;
  status?: string;
  title?: string;
  played_at?: string;
  created_at?: string;
  duration?: number;
  scoreboard?: MatchScoreboard;
}

export interface MatchScoreboard {
  team_scoreboards?: TeamScoreboard[];
}

export interface TeamScoreboard {
  name?: string;
  score?: number;
  players?: PlayerScoreboardEntry[];
}

export interface PlayerScoreboardEntry {
  id?: string;
  display_name?: string;
  kills?: number;
  deaths?: number;
  assists?: number;
}

/**
 * Replay events
 */
export interface ReplayEvent {
  id: string;
  type: string;
  tick: number;
  timestamp?: string;
  data?: Record<string, unknown>;
}

export interface ReplayEventsResponse {
  replay_id: string;
  match_id: string;
  events: ReplayEvent[];
  total_events: number;
}

export interface ReplayScoreboardResponse {
  replay_id: string;
  match_id: string;
  scoreboard: MatchScoreboard;
  teams: TeamScoreboard[];
  mvp?: PlayerScoreboardEntry;
}

export interface ReplayTimelineResponse {
  replay_id: string;
  match_id: string;
  timeline: ReplayEvent[];
  total_rounds: number;
  final_score: string;
  scoreboard: MatchScoreboard;
}

/**
 * Onboarding API wrapper
 */
export class OnboardingAPI {
  constructor(private client: ReplayApiClient) {}

  /**
   * Onboard a Steam user
   */
  async onboardSteam(steamProfile: {
    id: string;
    personaname: string;
    profileurl: string;
    avatar: string;
    avatarmedium?: string;
    avatarfull?: string;
    [key: string]: unknown;
  }, verificationHash: string): Promise<OnboardingResponse | null> {
    const response = await this.client.post<OnboardingResponse>('/onboarding/steam', {
      v_hash: verificationHash,
      steam: steamProfile,
    });

    return response.data || null;
  }

  /**
   * Onboard a Google user
   */
  async onboardGoogle(googleProfile: {
    email: string;
    name?: string;
    picture?: string;
    [key: string]: unknown;
  }, verificationHash: string): Promise<OnboardingResponse | null> {
    const response = await this.client.post<OnboardingResponse>('/onboarding/google', {
      v_hash: verificationHash,
      ...googleProfile,
    });

    return response.data || null;
  }
}

/**
 * Squad/Team API wrapper
 */
export class SquadAPI {
  constructor(private client: ReplayApiClient) {}

  /**
   * Create a new squad
   */
  async createSquad(squad: {
    game_id: string;
    name: string;
    symbol?: string;
    description?: string;
    logo_uri?: string;
    visibility_type?: string;
  }): Promise<Squad | null> {
    const response = await this.client.post<Squad>('/squads', squad);
    return response.data || null;
  }

  /**
   * Get squad by ID
   */
  async getSquad(squadId: string): Promise<Squad | null> {
    const response = await this.client.get<Squad>(`/squads/${squadId}`);
    return response.data || null;
  }

  /**
   * Update squad
   */
  async updateSquad(squadId: string, updates: Partial<Squad>): Promise<Squad | null> {
    const response = await this.client.put<Squad>(`/squads/${squadId}`, updates);
    return response.data || null;
  }

  /**
   * Delete squad
   */
  async deleteSquad(squadId: string): Promise<boolean> {
    const response = await this.client.delete(`/squads/${squadId}`);
    return response.status === 204 || response.status === 200;
  }

  /**
   * Search squads
   */
  async searchSquads(filters: {
    game_id?: string;
    name?: string;
    visibility?: string;
    page?: number;
    limit?: number;
  }): Promise<Squad[]> {
    // Use GET with query params - backend doesn't support POST /squads/search
    const params = new URLSearchParams();
    if (filters.game_id) params.append('game_id', filters.game_id);
    if (filters.name) params.append('q', filters.name);
    if (filters.visibility) params.append('visibility', filters.visibility);
    if (filters.page) params.append('page', String(filters.page));
    if (filters.limit) params.append('limit', String(filters.limit));

    const queryString = params.toString();
    const response = await this.client.get<Squad[]>(`/squads${queryString ? `?${queryString}` : ''}`);
    return response.data || [];
  }

  /**
   * Get team leaderboard - top squads sorted by rating
   */
  async getLeaderboard(filters: {
    game_id?: string;
    region?: string;
    limit?: number;
    offset?: number;
  }): Promise<Squad[]> {
    const params = new URLSearchParams();
    if (filters.game_id) params.append('game_id', filters.game_id);
    if (filters.region) params.append('region', filters.region);
    params.append('sort', 'rating');
    params.append('order', 'desc');
    params.append('limit', String(filters.limit || 20));
    if (filters.offset) params.append('offset', String(filters.offset));

    const response = await this.client.get<Squad[]>(`/squads?${params.toString()}`);
    return response.data || [];
  }
}

/**
 * Player Profile API wrapper
 */
export class PlayerProfileAPI {
  constructor(private client: ReplayApiClient) {}

  /**
   * Create a new player profile
   */
  async createPlayerProfile(profile: {
    game_id: string;
    nickname: string;
    slug_uri?: string;
    avatar_uri?: string;
    roles?: string[];
    description?: string;
  }): Promise<PlayerProfile | null> {
    const response = await this.client.post<PlayerProfile>('/players', profile);
    return response.data || null;
  }

  /**
   * Get player profile by ID
   */
  async getPlayerProfile(profileId: string): Promise<PlayerProfile | null> {
    const response = await this.client.get<PlayerProfile>(`/players/${profileId}`);
    return response.data || null;
  }

  /**
   * Get the current authenticated user's player profile
   */
  async getMyProfile(): Promise<PlayerProfile | null> {
    const response = await this.client.get<PlayerProfile>('/players/me');
    return response.data || null;
  }

  /**
   * Update player profile
   */
  async updatePlayerProfile(profileId: string, updates: Partial<PlayerProfile>): Promise<PlayerProfile | null> {
    const response = await this.client.put<PlayerProfile>(`/players/${profileId}`, updates);
    return response.data || null;
  }

  /**
   * Search player profiles
   */
  async searchPlayerProfiles(filters: {
    game_id?: string;
    nickname?: string;
    limit?: number;
    offset?: number;
  }): Promise<PlayerProfile[]> {
    // Use GET with query params - backend doesn't support POST /players/search
    const params = new URLSearchParams();
    if (filters.game_id) params.append('game_id', filters.game_id);
    if (filters.nickname) params.append('q', filters.nickname);
    if (filters.limit) params.append('limit', String(filters.limit));
    if (filters.offset) params.append('offset', String(filters.offset));

    const queryString = params.toString();
    const response = await this.client.get<PlayerProfile[]>(`/players${queryString ? `?${queryString}` : ''}`);
    return response.data || [];
  }

  /**
   * Get player leaderboard - top players sorted by rating
   */
  async getLeaderboard(filters: {
    game_id?: string;
    region?: string;
    limit?: number;
    offset?: number;
  }): Promise<PlayerProfile[]> {
    const params = new URLSearchParams();
    if (filters.game_id) params.append('game_id', filters.game_id);
    if (filters.region) params.append('region', filters.region);
    params.append('sort', 'rating');
    params.append('order', 'desc');
    params.append('limit', String(filters.limit || 50));
    if (filters.offset) params.append('offset', String(filters.offset));

    const response = await this.client.get<PlayerProfile[]>(`/players?${params.toString()}`);
    return response.data || [];
  }

  /**
   * Get player profile by slug URI
   */
  async getPlayerBySlug(slug: string): Promise<PlayerProfile | null> {
    const response = await this.client.get<PlayerProfile>(`/players/slug/${slug}`);
    return response.data || null;
  }

  /**
   * Check if a slug is available
   */
  async checkSlugAvailability(slug: string): Promise<boolean> {
    const response = await this.client.get<{ available: boolean }>(`/players/check-slug?slug=${encodeURIComponent(slug)}`);
    return response.data?.available ?? false;
  }

  /**
   * Upload player avatar (multipart form data)
   * Note: This requires special handling for file uploads
   */
  async uploadAvatar(file: File): Promise<string | null> {
    // For file uploads, we need to bypass the JSON client and use FormData
    // The client's base URL is private, so we use /api proxy
    const formData = new FormData();
    formData.append('avatar', file);

    try {
      const response = await fetch('/api/players/avatar', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (!response.ok) {
        console.error('Failed to upload avatar:', response.statusText);
        return null;
      }

      const result = await response.json();
      return result.data?.avatar_url || null;
    } catch (error) {
      console.error('Failed to upload avatar:', error);
      return null;
    }
  }
}

/**
 * Match API wrapper
 */
export class MatchAPI {
  constructor(private client: ReplayApiClient) {}

  /**
   * Get match by ID
   */
  async getMatch(gameId: string, matchId: string): Promise<MatchData | null> {
    const response = await this.client.get<MatchData>(`/games/${gameId}/matches/${matchId}`);
    return response.data || null;
  }

  /**
   * Search matches
   */
  async searchMatches(gameId: string, filters: {
    player_id?: string;
    squad_id?: string;
    map?: string;
    status?: string;
    search_term?: string;
    limit?: number;
    offset?: number;
  }): Promise<MatchData[]> {
    // Use GET with query params - backend doesn't support POST /games/{id}/matches/search
    const params = new URLSearchParams();
    if (filters.player_id) params.append('player_id', filters.player_id);
    if (filters.squad_id) params.append('squad_id', filters.squad_id);
    if (filters.map) params.append('map', filters.map);
    if (filters.status) params.append('status', filters.status);
    if (filters.search_term) params.append('q', filters.search_term);
    if (filters.limit) params.append('limit', String(filters.limit));
    if (filters.offset) params.append('offset', String(filters.offset));

    const queryString = params.toString();
    const response = await this.client.get<MatchData[]>(`/games/${gameId}/matches${queryString ? `?${queryString}` : ''}`);
    return response.data || [];
  }
}

/**
 * Replay File API wrapper
 */
export class ReplayFileAPI {
  constructor(private client: ReplayApiClient) {}

  /**
   * Get replay file metadata
   */
  async getReplayFile(gameId: string, replayFileId: string): Promise<ReplayFile | null> {
    const response = await this.client.get<ReplayFile>(`/games/${gameId}/replays/${replayFileId}`);
    return response.data || null;
  }

  /**
   * Get replay file status
   */
  async getReplayStatus(gameId: string, replayFileId: string): Promise<{ status: string; error?: string } | null> {
    const response = await this.client.get<{ status: string; error?: string }>(
      `/games/${gameId}/replays/${replayFileId}/status`
    );
    return response.data || null;
  }

  /**
   * Delete replay file
   */
  async deleteReplayFile(gameId: string, replayFileId: string): Promise<boolean> {
    const response = await this.client.delete(`/games/${gameId}/replays/${replayFileId}`);
    return response.status === 204 || response.status === 200;
  }

  /**
   * Search replay files
   */
  async searchReplayFiles(filters: {
    game_id?: string;
    player_id?: string;
    squad_id?: string;
    status?: string;
    visibility?: string;
    search_term?: string;
    limit?: number;
    offset?: number;
  }): Promise<ReplayFile[]> {
    // Use GET with query params - backend doesn't support POST /replays/search
    const params = new URLSearchParams();
    if (filters.game_id) params.append('game_id', filters.game_id);
    if (filters.player_id) params.append('player_id', filters.player_id);
    if (filters.squad_id) params.append('squad_id', filters.squad_id);
    if (filters.status) params.append('status', filters.status);
    if (filters.visibility) params.append('visibility', filters.visibility);
    if (filters.search_term) params.append('q', filters.search_term);
    if (filters.limit) params.append('limit', String(filters.limit));
    if (filters.offset) params.append('offset', String(filters.offset));

    const queryString = params.toString();
    // Use /games/{game_id}/replays endpoint which exists in backend
    const gameId = filters.game_id || 'cs2';
    const response = await this.client.get<ReplayFile[]>(`/games/${gameId}/replays${queryString ? `?${queryString}` : ''}`);
    return response.data || [];
  }

  /**
   * Get replay events (kills, plants, defuses, etc.)
   */
  async getReplayEvents(gameId: string, replayFileId: string, eventType?: string): Promise<ReplayEventsResponse | null> {
    const params = eventType ? `?type=${eventType}` : '';
    const response = await this.client.get<ReplayEventsResponse>(
      `/games/${gameId}/replays/${replayFileId}/events${params}`
    );
    return response.data || null;
  }

  /**
   * Get replay scoreboard (player statistics)
   */
  async getReplayScoreboard(gameId: string, replayFileId: string): Promise<ReplayScoreboardResponse | null> {
    const response = await this.client.get<ReplayScoreboardResponse>(
      `/games/${gameId}/replays/${replayFileId}/scoreboard`
    );
    return response.data || null;
  }

  /**
   * Get replay timeline (round-by-round data)
   */
  async getReplayTimeline(gameId: string, replayFileId: string): Promise<ReplayTimelineResponse | null> {
    const response = await this.client.get<ReplayTimelineResponse>(
      `/games/${gameId}/replays/${replayFileId}/timeline`
    );
    return response.data || null;
  }
}

/**
 * Share Token API wrapper
 */
export class ShareTokenAPI {
  constructor(private client: ReplayApiClient) {}

  /**
   * Create share token for a resource
   */
  async createShareToken(gameId: string, replayFileId: string, options?: {
    expires_at?: string;
    visibility_type?: string;
  }): Promise<{ token: string } | null> {
    const response = await this.client.post<{ token: string }>(
      `/games/${gameId}/replays/${replayFileId}/share`,
      options
    );
    return response.data || null;
  }

  /**
   * Revoke share token
   */
  async revokeShareToken(gameId: string, replayFileId: string, shareTokenId: string): Promise<boolean> {
    const response = await this.client.delete(
      `/games/${gameId}/replays/${replayFileId}/share/${shareTokenId}`
    );
    return response.status === 204 || response.status === 200;
  }
}

/**
 * Search result group structure
 */
interface SearchResultGroup {
  category: string;
  items: Array<{
    id: string;
    name: string;
    type: string;
    [key: string]: unknown;
  }>;
}

/**
 * Global Search API wrapper
 */
export class SearchAPI {
  constructor(private client: ReplayApiClient) {}

  /**
   * Global search across all entities
   */
  async search(query: string, options?: {
    category?: string;
    limit?: number;
  }): Promise<{ groups: SearchResultGroup[]; total: number }> {
    const params = new URLSearchParams({ q: query });
    if (options?.category) params.append('category', options.category);
    if (options?.limit) params.append('limit', String(options.limit));

    const response = await this.client.get<{ groups: SearchResultGroup[]; total: number }>(
      `/search?${params.toString()}`
    );
    return response.data || { groups: [], total: 0 };
  }
}

/**
 * Unified SDK wrapper providing access to all API endpoints
 */
export class ReplayAPISDK {
  public client: ReplayApiClient;
  public onboarding: OnboardingAPI;
  public squads: SquadAPI;
  public playerProfiles: PlayerProfileAPI;
  public matches: MatchAPI;
  public replayFiles: ReplayFileAPI;
  public shareTokens: ShareTokenAPI;
  public wallet: WalletAPI;
  public lobbies: LobbyAPI;
  public prizePools: PrizePoolAPI;
  public payment: PaymentAPI;
  public matchmaking: MatchmakingAPI;
  public tournaments: TournamentAPI;
  public search: SearchAPI;
  public matchAnalytics: MatchAnalyticsAPI;
  public challenges: ChallengeAPI;
  public highlights: HighlightsAPI;
  public blockchain: BlockchainAPI;

  constructor(settings: ReplayApiSettings, logger: Loggable) {
    this.client = new ReplayApiClient(settings, logger);
    this.onboarding = new OnboardingAPI(this.client);
    this.squads = new SquadAPI(this.client);
    this.playerProfiles = new PlayerProfileAPI(this.client);
    this.matches = new MatchAPI(this.client);
    this.replayFiles = new ReplayFileAPI(this.client);
    this.shareTokens = new ShareTokenAPI(this.client);
    this.wallet = new WalletAPI(this.client);
    this.lobbies = new LobbyAPI(this.client);
    this.prizePools = new PrizePoolAPI(this.client);
    this.payment = new PaymentAPI(this.client);
    this.matchmaking = new MatchmakingAPI(this.client);
    this.tournaments = new TournamentAPI(this.client);
    this.search = new SearchAPI(this.client);
    this.matchAnalytics = new MatchAnalyticsAPI(this.client);
    this.challenges = new ChallengeAPI(this.client);
    this.highlights = new HighlightsAPI(this.client);
    this.blockchain = new BlockchainAPI(this.client);
  }
}

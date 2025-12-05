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
    [key: string]: any;
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
    [key: string]: any;
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
    const response = await this.client.post<Squad[]>('/squads/search', filters);
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

    const response = await this.client.post<Squad[]>('/squads/search', {
      game_id: filters.game_id,
      limit: filters.limit || 20,
      offset: filters.offset || 0,
    });
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
  }): Promise<PlayerProfile[]> {
    const response = await this.client.post<PlayerProfile[]>('/players/search', filters);
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
}

/**
 * Match API wrapper
 */
export class MatchAPI {
  constructor(private client: ReplayApiClient) {}

  /**
   * Get match by ID
   */
  async getMatch(gameId: string, matchId: string): Promise<any | null> {
    const response = await this.client.get(`/games/${gameId}/matches/${matchId}`);
    return response.data || null;
  }

  /**
   * Search matches
   */
  async searchMatches(gameId: string, filters: any): Promise<any[]> {
    const response = await this.client.post<any[]>(`/games/${gameId}/matches/search`, filters);
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
  async getReplayFile(gameId: string, replayFileId: string): Promise<any | null> {
    const response = await this.client.get(`/games/${gameId}/replays/${replayFileId}`);
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
  async searchReplayFiles(filters: any): Promise<any[]> {
    const response = await this.client.post<any[]>('/replays/search', filters);
    return response.data || [];
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
  }
}

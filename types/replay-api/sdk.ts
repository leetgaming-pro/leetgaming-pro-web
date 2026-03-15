/**
 * High-level API endpoint wrappers for common operations
 * Provides type-safe, convenient methods for interacting with replay-api
 */

import { ReplayApiClient } from "./replay-api.client";
import { ReplayApiSettings } from "./settings";
import { Loggable } from "@/lib/logger";
import {
  Squad,
  PlayerProfile,
  User,
  Profile,
  IdentifierSourceType,
} from "./entities.types";
import {
  PlayerSkill,
  PlayerTrait,
  TeamHistoryEntry,
  TeamRosterHistoryEntry,
} from "./player-profile.types";
import { OnboardingResponse } from "./auth";
import { WalletAPI } from "./wallet.sdk";
import { LobbyAPI } from "./lobby.sdk";
import { PrizePoolAPI } from "./prize-pool.sdk";
import { PaymentAPI } from "./payment.sdk";
import { MatchmakingAPI } from "./matchmaking.sdk";
import { TournamentAPI } from "./tournament.sdk";
import { MatchAnalyticsAPI } from "./match-analytics.sdk";
import { ChallengeAPI } from "./challenge.sdk";
import { HighlightsAPI } from "./highlights.sdk";
import { BlockchainAPI } from "./blockchain.sdk";
import { ReplayFile } from "./replay-file";
import { SearchSchemaAPI } from "./search-schema.sdk";
import { SubscriptionsAPI } from "./subscriptions.sdk";
import { ScoresAPI } from "./scores.sdk";
import { VaultAPI } from "./vault.sdk";
import { MessagingAPI } from "./messaging.sdk";
import { PredictionAPI } from "./prediction.sdk";
import { ViewAnalyticsAPI } from "./view-analytics.sdk";
import { PlayerPerformanceAPI } from "./player-performance.sdk";

/**
 * Auth / MFA API wrapper
 */
export class AuthAPI {
  constructor(private client: ReplayApiClient) {}

  /**
   * Initialize MFA setup (generates secret + QR code)
   */
  async setupMFA(): Promise<{
    secret: string;
    qr_code_url?: string;
    recovery_codes?: string[];
  } | null> {
    const response = await this.client.post<{
      secret: string;
      qr_code_url?: string;
      recovery_codes?: string[];
    }>("/auth/mfa/setup", {});
    return response.data || null;
  }

  /**
   * Confirm MFA setup with TOTP code
   */
  async confirmMFASetup(code: string): Promise<{
    success: boolean;
    message?: string;
  } | null> {
    const response = await this.client.post<{
      success: boolean;
      message?: string;
    }>("/auth/mfa/confirm", { code });
    return response.data || null;
  }

  /**
   * Disable MFA
   */
  async disableMFA(code: string): Promise<{ success: boolean } | null> {
    const response = await this.client.post<{ success: boolean }>(
      "/auth/mfa/disable",
      { code },
    );
    return response.data || null;
  }
}

/**
 * Normalize game IDs to match backend data format
 * The backend stores CS2 replays with game_id 'cs2'
 * This function maps frontend game IDs to backend equivalents
 */
function normalizeGameId(gameId: string): string {
  const gameIdMap: Record<string, string> = {
    cs2: "cs2", // Backend uses 'cs2' for Counter-Strike 2
    csgo: "csgo", // CS:GO stays the same
    valorant: "valorant",
    lol: "lol",
    dota2: "dota2",
  };
  return gameIdMap[gameId] || gameId;
}

/**
 * Match source indicates how the match was created
 */
export type MatchSource =
  | "replay"
  | "matchmaking"
  | "external_api"
  | "manual"
  | "ocr_stream"
  | "ocr_screenshot"
  | "youtube_vod"
  | "demo";

/**
 * Match data structure
 */
export interface MatchData {
  id?: string;
  match_id?: string;
  game_id?: string;
  map_name?: string; // Backend returns "map_name" (e.g., "de_inferno")
  map?: string; // Alias for map_name (kept for backward compatibility)
  mode?: string;
  status?: string;
  title?: string;
  played_at?: string;
  created_at?: string;
  duration?: number;
  scoreboard?: MatchScoreboard;
  event_count?: number; // Number of game events extracted from replay
  server_name?: string; // Server name from match metadata
  // Source tracking
  source?: MatchSource; // How the match was created (replay, matchmaking, external_api, manual, ocr_stream, ocr_screenshot, youtube_vod, demo)
  linked_replay_id?: string; // For matchmaking matches, links to associated replay
  external_match_id?: string; // External system match ID (FACEIT, Valve, etc.)
  replay_file_id?: string; // Primary replay file ID
  has_replay?: boolean; // Convenience field: true if match has replay
  slug?: string; // Reconciliation slug (e.g., "cs2:faze-vs-navi:2026-03-12:mirage")
  linked_match_ids?: string[]; // IDs of matches reconciled/linked to this one
  // Team data
  teams?: Team[];
}

export interface MatchScoreboard {
  team_scoreboards?: TeamScoreboard[];
  match_mvp?: PlayerScoreboardEntry;
}

export interface TeamScoreboard {
  name?: string;
  team?: Team;
  side?: string;
  team_score?: number;
  team_mvp?: PlayerScoreboardEntry;
  players?: PlayerScoreboardEntry[];
  player_stats?: PlayerStatsEntry[]; // Array of player stats, each with player_id
  score?: number; // alias for team_score
}

// Player stats entry with comprehensive esports statistics
export interface PlayerStatsEntry {
  player_id: string;
  kills: number;
  deaths: number;
  assists: number;
  kd_ratio: number;
  headshots: number;
  headshot_pct: number; // Headshot percentage
  total_damage: number;
  utility_damage: number;
  adr: number;
  mvp_count: number;
  score: number;
  // Advanced esports stats
  kast: number; // Kill/Assist/Survived/Traded %
  impact_rating: number; // Impact rating (HLTV-style)
  opening_kills: number; // First kills of a round
  opening_deaths: number; // First deaths of a round
  opening_attempts?: number; // Entry duel attempts
  trade_kills: number; // Kills avenging teammates
  traded_deaths?: number; // Deaths that were traded
  clutch_wins: number; // 1vX clutch wins
  clutch_attempts: number; // 1vX clutch attempts
  clutch_1v1_wins?: number; // 1v1 clutch wins
  clutch_1v2_wins?: number; // 1v2 clutch wins
  clutch_1v3_wins?: number; // 1v3 clutch wins
  clutch_1v4_wins?: number; // 1v4 clutch wins
  clutch_1v5_wins?: number; // 1v5 clutch wins
  flash_assists: number; // Kills assisted by flashes
  enemies_flashed: number; // Total enemies flashed
  entry_attempts: number; // Entry duel attempts
  entry_successes: number; // Entry duel wins
  multi_kills: number; // 2+ kills in a round
  double_kills?: number; // 2 kills in a round
  triple_kills?: number; // 3 kills in a round
  quad_kills?: number; // 4 kills in a round
  aces?: number; // 5 kills in a round (ace)
  rating_2: number; // HLTV 2.0 rating
  // Utility stats
  flashes_thrown?: number;
  smokes_thrown?: number;
  hes_thrown?: number;
  molotovs_thrown?: number;
  team_flashes?: number; // Flashes that hit teammates
  // Weapon stats
  weapon_kills?: Record<string, number>;
  weapon_headshots?: Record<string, number>;
  weapon_accuracy?: Record<string, number>;
  // Damage breakdown
  damage_by_weapon?: Record<string, number>;
  damage_by_hitbox?: Record<string, number>;
  // Economy
  money_spent_total?: number;
  money_earned_total?: number;
  // Objectives
  bomb_plants?: number;
  bomb_defuses?: number;
  // Special kills
  wallbang_kills?: number;
  noscope_kills?: number;
  through_smoke_kills?: number;
  airborne_kills?: number;
  blind_kills?: number;
  knife_kills?: number;
}

export interface Team {
  id?: string;
  name?: string;
  short_name?: string;
  players?: PlayerScoreboardEntry[];
}

export interface PlayerStats {
  kills?: number;
  deaths?: number;
  assists?: number;
  kd_ratio?: number;
  headshots?: number;
  total_damage?: number;
  utility_damage?: number;
  adr?: number;
  mvp_count?: number;
  score?: number;
}

export interface PlayerScoreboardEntry {
  id?: string;
  name?: string; // Backend uses 'name' field
  display_name?: string;
  current_name?: string;
  network_user_id?: string;
  network_id?: string; // e.g., "steam"
  game_id?: string; // e.g., "cs2"
  clan_name?: string;
  avatar_uri?: string;
  kills?: number;
  deaths?: number;
  assists?: number;
  kd_ratio?: number;
  headshots?: number;
  total_damage?: number;
  utility_damage?: number;
  adr?: number;
  mvp_count?: number;
  score?: number;
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
  async onboardSteam(
    steamProfile: {
      id: string;
      personaname: string;
      profileurl: string;
      avatar: string;
      avatarmedium?: string;
      avatarfull?: string;
      [key: string]: unknown;
    },
    verificationHash: string,
  ): Promise<OnboardingResponse | null> {
    const response = await this.client.post<OnboardingResponse>(
      "/onboarding/steam",
      {
        v_hash: verificationHash,
        steam: steamProfile,
      },
    );

    return response.data || null;
  }

  /**
   * Onboard a Google user
   */
  async onboardGoogle(
    googleProfile: {
      email: string;
      name?: string;
      picture?: string;
      [key: string]: unknown;
    },
    verificationHash: string,
  ): Promise<OnboardingResponse | null> {
    const response = await this.client.post<OnboardingResponse>(
      "/onboarding/google",
      {
        v_hash: verificationHash,
        ...googleProfile,
      },
    );

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
    slug_uri?: string;
    logo_uri?: string;
    visibility_type?: string;
  }): Promise<Squad | null> {
    const response = await this.client.post<Squad>("/squads", squad);
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
  async updateSquad(
    squadId: string,
    updates: Partial<Squad>,
  ): Promise<Squad | null> {
    const response = await this.client.put<Squad>(
      `/squads/${squadId}`,
      updates,
    );
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
    // Field names must be PascalCase to match Go struct fields
    const params = new URLSearchParams();
    if (filters.game_id) params.append("GameID", filters.game_id);
    if (filters.name) {
      params.append("q", filters.name);
      // Specify which fields to search for squads (PascalCase)
      params.append("search_fields", "Name,Symbol");
    }
    if (filters.visibility) params.append("Visibility", filters.visibility);
    if (filters.page) params.append("page", String(filters.page));
    if (filters.limit) params.append("limit", String(filters.limit));

    const queryString = params.toString();
    const response = await this.client.get<Squad[]>(
      `/squads${queryString ? `?${queryString}` : ""}`,
    );
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
    if (filters.game_id) params.append("game_id", filters.game_id);
    if (filters.region) params.append("region", filters.region);
    params.append("sort", "rating");
    params.append("order", "desc");
    params.append("limit", String(filters.limit || 20));
    if (filters.offset) params.append("offset", String(filters.offset));

    const response = await this.client.get<Squad[]>(
      `/squads?${params.toString()}`,
    );
    return response.data || [];
  }

  /**
   * Get squad roster history
   * Returns roster changes over time (joins, departures, role changes)
   */
  async getSquadRosterHistory(
    squadId: string,
  ): Promise<TeamRosterHistoryEntry[]> {
    try {
      const response = await this.client.get<TeamRosterHistoryEntry[]>(
        `/squads/${squadId}/roster-history`,
      );
      return response.data || [];
    } catch {
      return [];
    }
  }
}

/**
 * Player Profile API wrapper
 */
export class PlayerProfileAPI {
  constructor(private client: ReplayApiClient) {}

  /**
   * Create a new player profile
   * @throws Error with message from API if request fails
   */
  async createPlayerProfile(profile: {
    game_id: string;
    nickname: string;
    slug_uri?: string;
    avatar_uri?: string;
    roles?: string[];
    description?: string;
    rank?: string;
    country?: string;
    timezone?: string;
    looking_for_team?: boolean;
    visibility?: string;
    social_links?: {
      discord?: string;
      twitch?: string;
      twitter?: string;
      steam_id?: string;
    };
  }): Promise<PlayerProfile | null> {
    const response = await this.client.post<PlayerProfile>("/players", profile);

    // Throw error with API message so error handler can properly classify it
    if (response.error) {
      const errorMessage =
        typeof response.error === "string"
          ? response.error
          : response.error.message || "Failed to create player profile";
      const error = new Error(errorMessage);
      // Attach additional error info for error parser
      (error as any).status = response.status;
      (error as any).apiError = response.error;
      throw error;
    }

    return response.data || null;
  }

  /**
   * Get player profile by ID
   */
  async getPlayerProfile(profileId: string): Promise<PlayerProfile | null> {
    const response = await this.client.get<PlayerProfile>(
      `/players/${profileId}`,
    );
    return response.data || null;
  }

  /**
   * Get the current authenticated user's player profile
   * @param gameId - Optional game ID to get profile for specific game
   * @returns The user's profile for the specified game, or their primary profile if no gameId
   */
  async getMyProfile(gameId?: string): Promise<PlayerProfile | null> {
    const params = gameId ? `?game_id=${gameId}` : "";
    const response = await this.client.get<PlayerProfile>(
      `/players/me${params}`,
    );
    return response.data || null;
  }

  /**
   * Get all player profiles for the current authenticated user
   * Users can have multiple profiles, one per game (CS2, Valorant, etc.)
   * @returns Array of all profiles owned by the user
   */
  async getMyProfiles(): Promise<PlayerProfile[]> {
    const response = await this.client.get<PlayerProfile[]>(
      "/players/me?all=true",
    );
    return response.data || [];
  }

  /**
   * Get the user's profile for a specific game
   * @param gameId - The game ID (e.g., 'cs2', 'valorant', 'lol', 'dota2')
   * @returns The profile for that game or null if user hasn't created one
   */
  async getMyProfileForGame(gameId: string): Promise<PlayerProfile | null> {
    const response = await this.client.get<PlayerProfile>(
      `/players/me?game_id=${gameId}`,
    );
    return response.data || null;
  }

  /**
   * Update player profile
   */
  async updatePlayerProfile(
    profileId: string,
    updates: Partial<PlayerProfile>,
  ): Promise<PlayerProfile | null> {
    const response = await this.client.put<PlayerProfile>(
      `/players/${profileId}`,
      updates,
    );
    return response.data || null;
  }

  /**
   * Delete player profile
   */
  async deletePlayerProfile(profileId: string): Promise<boolean> {
    const response = await this.client.delete(`/players/${profileId}`);
    return response.status === 204 || response.status === 200;
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
    // Field names must be PascalCase to match Go struct fields
    const params = new URLSearchParams();
    if (filters.game_id) params.append("GameID", filters.game_id);
    if (filters.nickname) {
      params.append("q", filters.nickname);
      // Specify which fields to search for players (PascalCase)
      params.append("search_fields", "Nickname");
    }
    if (filters.limit) params.append("limit", String(filters.limit));
    if (filters.offset) params.append("offset", String(filters.offset));

    const queryString = params.toString();
    const response = await this.client.get<PlayerProfile[]>(
      `/players${queryString ? `?${queryString}` : ""}`,
    );
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
    if (filters.game_id) params.append("game_id", filters.game_id);
    if (filters.region) params.append("region", filters.region);
    params.append("sort", "rating");
    params.append("order", "desc");
    params.append("limit", String(filters.limit || 50));
    if (filters.offset) params.append("offset", String(filters.offset));

    const response = await this.client.get<PlayerProfile[]>(
      `/players?${params.toString()}`,
    );
    return response.data || [];
  }

  /**
   * Get player profile by slug URI
   */
  async getPlayerBySlug(slug: string): Promise<PlayerProfile | null> {
    const response = await this.client.get<PlayerProfile>(
      `/players/slug/${slug}`,
    );
    return response.data || null;
  }

  /**
   * Check if a slug is available
   * Uses the search API to check if a player with this slug already exists
   */
  async checkSlugAvailability(slug: string): Promise<boolean> {
    try {
      // Search for players with this exact slug (SlugURI is PascalCase for Go backend)
      const response = await this.client.get<PlayerProfile[]>(
        `/players?SlugURI=${encodeURIComponent(slug)}&limit=1`,
      );

      // If no players found with this slug, it's available
      const players = response.data || [];
      return players.length === 0;
    } catch (error) {
      console.warn(
        "[PlayerProfilesAPI] Slug check failed, assuming available",
        { slug, error },
      );
      // On error, assume available and let server validate on creation
      return true;
    }
  }

  /**
   * Get player skills (professional profile feature)
   * Returns skill ratings, endorsements, and category breakdowns
   */
  async getPlayerSkills(playerId: string): Promise<PlayerSkill[]> {
    try {
      const response = await this.client.get<PlayerSkill[]>(
        `/players/${playerId}/skills`,
      );
      return response.data || [];
    } catch {
      return [];
    }
  }

  /**
   * Get player traits (professional profile feature)
   * Returns personality/playstyle traits with endorsements
   */
  async getPlayerTraits(playerId: string): Promise<PlayerTrait[]> {
    try {
      const response = await this.client.get<PlayerTrait[]>(
        `/players/${playerId}/traits`,
      );
      return response.data || [];
    } catch {
      return [];
    }
  }

  /**
   * Get player team history (professional profile feature)
   * Returns teams the player has been part of over time
   */
  async getPlayerTeamHistory(playerId: string): Promise<TeamHistoryEntry[]> {
    try {
      const response = await this.client.get<TeamHistoryEntry[]>(
        `/players/${playerId}/team-history`,
      );
      return response.data || [];
    } catch {
      return [];
    }
  }

  /**
   * Endorse a player skill
   */
  async endorseSkill(
    playerId: string,
    skillId: string,
  ): Promise<boolean> {
    try {
      await this.client.post(
        `/players/${playerId}/skills/${skillId}/endorse`,
        {},
      );
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Endorse a player trait
   */
  async endorseTrait(
    playerId: string,
    traitId: string,
  ): Promise<boolean> {
    try {
      await this.client.post(
        `/players/${playerId}/traits/${traitId}/endorse`,
        {},
      );
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Upload player avatar (multipart form data)
   * Note: This requires special handling for file uploads
   */
  async uploadAvatar(file: File): Promise<string | null> {
    // For file uploads, we need to bypass the JSON client and use FormData
    // The client's base URL is private, so we use /api proxy
    const formData = new FormData();
    formData.append("avatar", file);

    try {
      const response = await fetch("/api/players/avatar", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!response.ok) {
        console.error("Failed to upload avatar:", response.statusText);
        return null;
      }

      const result = await response.json();
      return result.data?.avatar_url || null;
    } catch (error) {
      console.error("Failed to upload avatar:", error);
      return null;
    }
  }
}

/**
 * Backend match detail response format
 */
interface MatchDetailResponse {
  match: MatchData;
  metadata?: {
    has_events?: boolean;
    has_rounds?: boolean;
  };
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
    const response = await this.client.get<MatchDetailResponse>(
      `/games/${normalizeGameId(gameId)}/matches/${matchId}`,
    );
    // Backend returns { match: MatchData, metadata: {...} } - extract the match object
    if (response.data?.match) {
      return response.data.match;
    }
    // Fallback for direct MatchData response
    return (response.data as unknown as MatchData) || null;
  }

  /**
   * List matches from /games/{gameId}/matches endpoint with optional search
   */
  async listMatches(filters?: {
    game_id?: string;
    search_term?: string;
    limit?: number;
    offset?: number;
  }): Promise<MatchData[]> {
    const params = new URLSearchParams();
    if (filters?.search_term) {
      params.append("q", filters.search_term);
      // Only NetworkID is queryable for text search
      params.append("search_fields", "NetworkID");
    }
    if (filters?.limit) params.append("limit", String(filters.limit));
    if (filters?.offset) params.append("offset", String(filters.offset));

    const queryString = params.toString();
    const gameId = normalizeGameId(filters?.game_id || "cs2");
    const response = await this.client.get<MatchData[]>(
      `/games/${gameId}/matches${queryString ? `?${queryString}` : ""}`,
    );
    return response.data || [];
  }

  /**
   * Search matches
   * Field names must be PascalCase to match Go struct fields.
   * Text search uses 'q' + 'search_fields' for OR logic.
   *
   * Valid queryable fields for Match:
   * - ID, GameID, NetworkID, Status, Header.*, ResourceOwner, CreatedAt, UpdatedAt
   */
  async searchMatches(
    gameId: string,
    filters: {
      network_id?: string;
      status?: string;
      search_term?: string;
      limit?: number;
      offset?: number;
    },
  ): Promise<MatchData[]> {
    // Use GET with query params - backend doesn't support POST /games/{id}/matches/search
    // Field names must be PascalCase to match Go struct fields
    const params = new URLSearchParams();
    if (filters.network_id) params.append("NetworkID", filters.network_id);
    if (filters.status) params.append("Status", filters.status);
    if (filters.search_term) {
      params.append("q", filters.search_term);
      // Search in NetworkID for matches
      params.append("search_fields", "NetworkID");
    }
    if (filters.limit) params.append("limit", String(filters.limit));
    if (filters.offset) params.append("offset", String(filters.offset));

    const queryString = params.toString();
    const response = await this.client.get<MatchData[]>(
      `/games/${normalizeGameId(gameId)}/matches${
        queryString ? `?${queryString}` : ""
      }`,
    );
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
  async getReplayFile(
    gameId: string,
    replayFileId: string,
  ): Promise<ReplayFile | null> {
    const response = await this.client.get<ReplayFile>(
      `/games/${normalizeGameId(gameId)}/replays/${replayFileId}`,
    );
    return response.data || null;
  }

  /**
   * Get replay file status
   */
  async getReplayStatus(
    gameId: string,
    replayFileId: string,
  ): Promise<{ status: string; error?: string } | null> {
    const response = await this.client.get<{ status: string; error?: string }>(
      `/games/${normalizeGameId(gameId)}/replays/${replayFileId}/status`,
    );
    return response.data || null;
  }

  /**
   * Delete replay file
   */
  async deleteReplayFile(
    gameId: string,
    replayFileId: string,
  ): Promise<boolean> {
    const response = await this.client.delete(
      `/games/${normalizeGameId(gameId)}/replays/${replayFileId}`,
    );
    return response.status === 204 || response.status === 200;
  }

  /**
   * Update replay file metadata (title, description, visibility, tags)
   * Only the owner can update their replay
   */
  async updateReplayFile(
    gameId: string,
    replayFileId: string,
    updates: {
      title?: string;
      description?: string;
      visibility?: number; // 1=public, 2=restricted, 4=private
      tags?: string[];
    },
  ): Promise<ReplayFile | null> {
    const response = await this.client.put<ReplayFile>(
      `/games/${normalizeGameId(gameId)}/replays/${replayFileId}`,
      updates,
    );
    return response.data || null;
  }

  /**
   * List replay files from /games/{gameId}/replays endpoint with optional search
   */
  async listReplayFiles(filters?: {
    game_id?: string;
    search_term?: string;
    limit?: number;
    offset?: number;
  }): Promise<ReplayFile[]> {
    const params = new URLSearchParams();
    if (filters?.search_term) {
      params.append("q", filters.search_term);
      // Only NetworkID is queryable for text search
      params.append("search_fields", "NetworkID");
    }
    if (filters?.limit) params.append("limit", String(filters.limit));
    if (filters?.offset) params.append("offset", String(filters.offset));

    const queryString = params.toString();
    const gameId = normalizeGameId(filters?.game_id || "cs2");
    const response = await this.client.get<ReplayFile[]>(
      `/games/${gameId}/replays${queryString ? `?${queryString}` : ""}`,
    );
    return response.data || [];
  }

  /**
   * Search replay files
   * Field names must be PascalCase to match Go struct fields.
   * Text search uses 'q' + 'search_fields' for OR logic.
   *
   * Valid queryable fields for ReplayFile:
   * - ID, GameID, NetworkID, Size, Status, Header.*, ResourceOwner, CreatedAt, UpdatedAt
   */
  async searchReplayFiles(filters: {
    id?: string;
    game_id?: string;
    network_id?: string;
    status?: string;
    search_term?: string;
    limit?: number;
    offset?: number;
  }): Promise<ReplayFile[]> {
    const gameId = normalizeGameId(filters.game_id || "cs2");

    // When searching by ID, use the direct GET endpoint
    if (filters.id) {
      const response = await this.client.get<ReplayFile>(
        `/games/${gameId}/replays/${filters.id}`,
      );
      return response.data ? [response.data] : [];
    }

    // Use GET with query params for list/search
    // Field names must be PascalCase to match Go struct fields
    const params = new URLSearchParams();
    if (filters.game_id)
      params.append("GameID", normalizeGameId(filters.game_id));
    if (filters.network_id) params.append("NetworkID", filters.network_id);
    if (filters.status) params.append("Status", filters.status);
    if (filters.search_term) {
      params.append("q", filters.search_term);
      // Search in NetworkID for replay files
      params.append("search_fields", "NetworkID");
    }
    if (filters.limit) params.append("limit", String(filters.limit));
    if (filters.offset) params.append("offset", String(filters.offset));

    const queryString = params.toString();
    // Use /games/{game_id}/replays endpoint which exists in backend
    const response = await this.client.get<ReplayFile[]>(
      `/games/${gameId}/replays${queryString ? `?${queryString}` : ""}`,
    );
    return response.data || [];
  }

  /**
   * Get replay events (kills, plants, defuses, etc.)
   */
  async getReplayEvents(
    gameId: string,
    replayFileId: string,
    eventType?: string,
  ): Promise<ReplayEventsResponse | null> {
    const params = eventType ? `?type=${eventType}` : "";
    const response = await this.client.get<ReplayEventsResponse>(
      `/games/${normalizeGameId(
        gameId,
      )}/replays/${replayFileId}/events${params}`,
    );
    return response.data || null;
  }

  /**
   * Get replay scoreboard (player statistics)
   */
  async getReplayScoreboard(
    gameId: string,
    replayFileId: string,
  ): Promise<ReplayScoreboardResponse | null> {
    const response = await this.client.get<ReplayScoreboardResponse>(
      `/games/${normalizeGameId(gameId)}/replays/${replayFileId}/scoreboard`,
    );
    return response.data || null;
  }

  /**
   * Get replay timeline (round-by-round data)
   */
  async getReplayTimeline(
    gameId: string,
    replayFileId: string,
  ): Promise<ReplayTimelineResponse | null> {
    const response = await this.client.get<ReplayTimelineResponse>(
      `/games/${normalizeGameId(gameId)}/replays/${replayFileId}/timeline`,
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
  async createShareToken(
    gameId: string,
    replayFileId: string,
    options?: {
      expires_at?: string;
      visibility_type?: string;
    },
  ): Promise<{ token: string } | null> {
    const response = await this.client.post<{ token: string }>(
      `/games/${normalizeGameId(gameId)}/replays/${replayFileId}/share`,
      options,
    );
    return response.data || null;
  }

  /**
   * Revoke share token
   */
  async revokeShareToken(
    gameId: string,
    replayFileId: string,
    shareTokenId: string,
  ): Promise<boolean> {
    const response = await this.client.delete(
      `/games/${normalizeGameId(
        gameId,
      )}/replays/${replayFileId}/share/${shareTokenId}`,
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
  async search(
    query: string,
    options?: {
      category?: string;
      limit?: number;
    },
  ): Promise<{ groups: SearchResultGroup[]; total: number }> {
    const params = new URLSearchParams({ q: query });
    if (options?.category) params.append("category", options.category);
    if (options?.limit) params.append("limit", String(options.limit));

    const response = await this.client.get<{
      groups: SearchResultGroup[];
      total: number;
    }>(`/search?${params.toString()}`);
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
  public searchSchema: SearchSchemaAPI;
  public matchAnalytics: MatchAnalyticsAPI;
  public challenges: ChallengeAPI;
  public highlights: HighlightsAPI;
  public blockchain: BlockchainAPI;
  public subscriptions: SubscriptionsAPI;
  public scores: ScoresAPI;
  public auth: AuthAPI;
  public vault: VaultAPI;
  public messaging: MessagingAPI;
  public predictions: PredictionAPI;
  public viewAnalytics: ViewAnalyticsAPI;
  public playerPerformance: PlayerPerformanceAPI;

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
    this.searchSchema = new SearchSchemaAPI(this.client);
    this.matchAnalytics = new MatchAnalyticsAPI(this.client);
    this.challenges = new ChallengeAPI(this.client);
    this.highlights = new HighlightsAPI(this.client);
    this.blockchain = new BlockchainAPI(this.client);
    this.subscriptions = new SubscriptionsAPI(this.client);
    this.scores = new ScoresAPI(this.client);
    this.auth = new AuthAPI(this.client);
    this.vault = new VaultAPI(this.client);
    this.messaging = new MessagingAPI(this.client);
    this.predictions = new PredictionAPI(this.client);
    this.viewAnalytics = new ViewAnalyticsAPI(this.client);
    this.playerPerformance = new PlayerPerformanceAPI(this.client);
  }

  /**
   * Get replay file metadata (convenience method)
   */
  async getReplayFile(
    gameId: string,
    replayFileId: string,
  ): Promise<ReplayFile | null> {
    return this.replayFiles.getReplayFile(gameId, replayFileId);
  }
}

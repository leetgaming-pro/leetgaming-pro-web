/**
 * Lobby Types - Matchmaking Lobby System
 * TypeScript interfaces matching Go backend entities
 */

import { DistributionRule } from '@/components/match-making/prize-distribution-selector';

// Lobby Status Lifecycle
// IMPORTANT: These MUST match backend Go enum values
export type LobbyStatus =
  | 'open'           // Lobby accepting players
  | 'ready_check'    // Countdown active, checking player readiness
  | 'starting'       // Creating match, all ready
  | 'started'        // Match in progress
  | 'cancelled'      // Lobby was cancelled
  | 'completed';     // Match finished

// Lobby Visibility - Controls who can see and join
export type LobbyVisibility =
  | 'public'         // Anyone can see and join
  | 'private'        // Invite only, hidden from browse
  | 'matchmaking'    // System managed, limited info shown
  | 'friends';       // Only friends can see/join

// Lobby Type - Defines the purpose of the lobby
export type LobbyType =
  | 'custom'         // Player-created custom lobby
  | 'ranked'         // Ranked competitive
  | 'casual'         // Casual unranked
  | 'tournament'     // Tournament match
  | 'practice';      // Practice/scrimmage

// Legacy status mappings for backwards compatibility
export const LobbyStatusMap = {
  open: 'open',
  waiting_for_players: 'open',  // Legacy alias
  ready_check: 'ready_check',
  starting: 'starting',
  started: 'started',
  in_progress: 'started',       // Legacy alias
  cancelled: 'cancelled',
  completed: 'completed',
  expired: 'cancelled',         // Expired lobbies are treated as cancelled
} as const;

// Player Slot in Lobby
export interface PlayerSlot {
  slot_number: number;
  player_id: string | null;
  player_name?: string;
  is_ready: boolean;
  joined_at?: string;
  mmr?: number;
  rank?: string;
  team?: number;        // 0=unassigned, 1=team1, 2=team2
  is_spectator?: boolean;
}

// Skill Range for matchmaking
export interface SkillRange {
  min_mmr: number;
  max_mmr: number;
}

// Prize Pool Configuration
export interface PrizePoolConfig {
  entry_fee_cents: number;
  prize_pool_id?: string;
  distribution_rule: DistributionRule;
}

// Queue Stats for matchmaking lobbies
export interface QueueStats {
  players_waiting: number;
  average_wait_time_seconds: number;
  estimated_wait_time_seconds: number;
}

// Matchmaking Lobby
export interface MatchmakingLobby {
  id: string;
  tenant_id?: string;
  client_id?: string;
  creator_id: string;
  
  // Game Configuration
  game_id: string;
  game_mode: string;
  map_pool?: string[];
  region: string;

  // Lobby Settings
  name: string;
  description?: string;
  type: LobbyType;
  visibility: LobbyVisibility;
  is_featured?: boolean;
  tags?: string[];

  // Player Configuration
  max_players: number;
  min_players: number;
  requires_ready_check: boolean;
  allow_spectators: boolean;
  allow_cross_platform: boolean;

  // Players
  player_slots: PlayerSlot[];
  spectator_ids?: string[];

  // Skill/Ranking
  skill_range?: SkillRange;
  max_ping?: number;

  // Prize Pool
  prize_pool?: PrizePoolConfig;
  // Legacy fields for compatibility
  prize_pool_id?: string;
  entry_fee_cents?: number;
  distribution_rule?: DistributionRule;

  // Status & Timing
  status: LobbyStatus;
  created_at: string;
  updated_at: string;
  expires_at: string;
  started_at?: string;
  completed_at?: string;

  // Match Result
  match_id?: string;
  winner_player_ids?: string[];

  // Queue Stats (for matchmaking type lobbies)
  queue_stats?: QueueStats;

  // Metadata
  metadata?: Record<string, unknown>;
}

// Computed properties helper
export function getLobbyPlayerCount(lobby: MatchmakingLobby): number {
  return lobby.player_slots?.filter(s => s.player_id && !s.is_spectator).length || 0;
}

export function getLobbyReadyCount(lobby: MatchmakingLobby): number {
  return lobby.player_slots?.filter(s => s.player_id && s.is_ready && !s.is_spectator).length || 0;
}

export function isLobbyFull(lobby: MatchmakingLobby): boolean {
  return getLobbyPlayerCount(lobby) >= lobby.max_players;
}

export function canLobbyStart(lobby: MatchmakingLobby): boolean {
  return getLobbyReadyCount(lobby) >= lobby.min_players;
}

// Create Lobby Request
export interface CreateLobbyRequest {
  // Required fields
  creator_id: string;
  game_id: string;
  game_mode?: string;
  region?: string;
  max_players: number;
  
  // Lobby settings
  name: string;
  description?: string;
  type?: LobbyType;
  visibility?: LobbyVisibility;
  
  // Optional settings
  min_players?: number;
  distribution_rule?: DistributionRule;
  entry_fee_cents?: number;
  prize_pool?: PrizePoolConfig;
  skill_range?: {
    min_mmr: number;
    max_mmr: number;
  };
  max_ping?: number;
  allow_cross_platform?: boolean;
  requires_ready_check?: boolean;
  allow_spectators?: boolean;
  map_pool?: string[];
  tags?: string[];
  metadata?: Record<string, unknown>;
}

// Create Lobby Response
export interface CreateLobbyResponse {
  lobby: MatchmakingLobby;
  creator_slot: PlayerSlot;
}

// Join Lobby Request
export interface JoinLobbyRequest {
  player_id: string;
  player_mmr?: number;
}

// Join Lobby Response
export interface JoinLobbyResponse {
  lobby: MatchmakingLobby;
  assigned_slot: PlayerSlot;
  position_in_queue?: number;
}

// Leave Lobby Request
export interface LeaveLobbyRequest {
  player_id: string;
  reason?: string;
}

// Set Player Ready Request
export interface SetPlayerReadyRequest {
  player_id: string;
  is_ready: boolean;
}

// Set Player Ready Response
export interface SetPlayerReadyResponse {
  lobby: MatchmakingLobby;
  all_players_ready: boolean;
  ready_count: number;
  total_count: number;
}

// Start Match Request
export interface StartMatchRequest {
  force_start?: boolean; // Admin override to start without all ready
}

// Start Match Response
export interface StartMatchResponse {
  lobby: MatchmakingLobby;
  match_id: string;
  server_info?: {
    ip: string;
    port: number;
    password?: string;
  };
}

// Cancel Lobby Request
export interface CancelLobbyRequest {
  reason?: string;
}

// Get Lobby Response
export interface GetLobbyResponse {
  lobby: MatchmakingLobby;
}

// List Lobbies Request
export interface ListLobbiesRequest {
  game_id?: string;
  game_mode?: string;
  region?: string;
  status?: LobbyStatus;
  limit?: number;
  offset?: number;
}

// List Lobbies Response
export interface ListLobbiesResponse {
  lobbies: MatchmakingLobby[];
  total: number;
  has_more: boolean;
}

// Lobby Event (for WebSocket updates)
export interface LobbyEvent {
  event_type:
    | 'player_joined'
    | 'player_left'
    | 'player_ready'
    | 'player_not_ready'
    | 'lobby_starting'
    | 'lobby_started'
    | 'lobby_cancelled'
    | 'lobby_expired';
  lobby_id: string;
  lobby: MatchmakingLobby;
  player_id?: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

// Lobby Statistics
export interface LobbyStats {
  total_active_lobbies: number;
  lobbies_by_game_mode: Record<string, number>;
  lobbies_by_region: Record<string, number>;
  lobbies_by_status: Record<LobbyStatus, number>;
  average_fill_time_seconds: number;
  average_players_per_lobby: number;
}

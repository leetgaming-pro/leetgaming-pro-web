/**
 * Lobby Types - Matchmaking Lobby System
 * TypeScript interfaces matching Go backend entities
 */

import { DistributionRule } from '@/components/match-making/prize-distribution-selector';

// Lobby Status Lifecycle
// IMPORTANT: These MUST match backend Go enum values in replay-api/pkg/domain/matchmaking/entities/lobby.go
export type LobbyStatus =
  | 'open'           // Lobby accepting players (backend: LobbyStatusOpen)
  | 'ready_check'    // Countdown active, checking player readiness (backend: LobbyStatusReadyCheck)
  | 'starting'       // Creating match, all ready (backend: LobbyStatusStarting)
  | 'started'        // Match in progress (backend: LobbyStatusStarted)
  | 'cancelled';     // Lobby was cancelled (backend: LobbyStatusCancelled)

// Legacy status mappings for backwards compatibility
export const LobbyStatusMap = {
  open: 'open',
  waiting_for_players: 'open',  // Legacy alias
  ready_check: 'ready_check',
  starting: 'starting',
  started: 'started',
  in_progress: 'started',       // Legacy alias
  cancelled: 'cancelled',
  completed: 'started',         // Matches complete through match system
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
}

// Matchmaking Lobby
export interface MatchmakingLobby {
  id: string;
  creator_id: string;
  game_id: string;
  game_mode: string;
  region: string;

  // Lobby Configuration
  max_players: number;
  min_players: number;
  requires_ready_check: boolean;
  allow_spectators: boolean;

  // Player Management
  player_slots: PlayerSlot[];
  spectator_ids: string[];

  // Prize Pool
  prize_pool_id: string;
  entry_fee_cents: number;
  distribution_rule: DistributionRule;

  // Match Settings
  skill_range?: {
    min_mmr: number;
    max_mmr: number;
  };
  max_ping?: number;
  allow_cross_platform: boolean;

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

  // Metadata
  metadata?: Record<string, any>;
}

// Create Lobby Request
export interface CreateLobbyRequest {
  game_id: string;
  game_mode: string;
  region: string;
  max_players: number;
  min_players?: number;
  distribution_rule: DistributionRule;
  entry_fee_cents?: number;
  skill_range?: {
    min_mmr: number;
    max_mmr: number;
  };
  max_ping?: number;
  allow_cross_platform?: boolean;
  requires_ready_check?: boolean;
  allow_spectators?: boolean;
  metadata?: Record<string, any>;
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

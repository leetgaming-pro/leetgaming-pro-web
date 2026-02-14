/**
 * Match Result / Scores Types for LeetGaming.PRO
 * Types for the Scores domain — match results, verification, dispute, and prize distribution
 */

// --- Value Object Types ---

export type ResultStatus =
  | 'submitted'
  | 'under_review'
  | 'verified'
  | 'disputed'
  | 'conciliated'
  | 'finalized'
  | 'cancelled';

export type ScoreSource =
  | 'replay_file'
  | 'tournament_admin'
  | 'external_api'
  | 'consensus'
  | 'matchmaking';

export type VerificationMethod =
  | 'automatic'
  | 'manual'
  | 'var_review'
  | 'consensus';

// --- Entity Interfaces ---

export interface TeamResult {
  team_id: string;
  team_name: string;
  score: number;
  position: number;
  players: string[];
}

export interface PlayerResult {
  player_id: string;
  team_id: string;
  score: number;
  kills: number;
  deaths: number;
  assists: number;
  rating: number;
  is_mvp: boolean;
  stats?: Record<string, unknown>;
}

export interface MatchResult {
  id: string;
  match_id: string;
  tournament_id?: string;
  matchmaking_session_id?: string;
  game_id: string;
  map_name: string;
  mode: string;

  // Score Source
  source: ScoreSource;
  source_replay_id?: string;
  submitted_by: string;

  // Results
  team_results: TeamResult[];
  player_results: PlayerResult[];
  winner_team_id?: string;
  is_draw: boolean;
  rounds_played: number;

  // Status & Verification
  status: ResultStatus;
  verification_method?: VerificationMethod;
  verified_at?: string;
  verified_by?: string;

  // Dispute
  dispute_reason?: string;
  disputed_at?: string;
  disputed_by?: string;
  dispute_count: number;

  // Conciliation
  conciliated_at?: string;
  conciliated_by?: string;
  conciliation_notes?: string;
  original_team_results?: TeamResult[];

  // Finalization
  finalized_at?: string;
  prize_distribution_id?: string;

  // Match Metadata
  played_at: string;
  duration: number;

  // Base Entity
  created_at: string;
  updated_at: string;
}

// --- Request DTOs ---

export interface SubmitMatchResultRequest {
  match_id: string;
  tournament_id?: string;
  matchmaking_session_id?: string;
  game_id: string;
  map_name: string;
  mode: string;
  source: ScoreSource;
  team_results: TeamResult[];
  player_results: PlayerResult[];
  played_at: string;
  duration: number;
  rounds_played: number;
}

export interface VerifyMatchResultRequest {
  verification_method: VerificationMethod;
}

export interface DisputeMatchResultRequest {
  reason: string;
}

export interface ConciliateMatchResultRequest {
  notes: string;
  adjusted_team_results?: TeamResult[];
}

export interface CancelMatchResultRequest {
  reason: string;
}

// --- Response DTOs ---

export interface MatchResultListResponse {
  match_results: MatchResult[];
  total: number;
  limit: number;
  offset: number;
}

// --- Filter Types ---

export interface MatchResultFilters {
  match_id?: string;
  tournament_id?: string;
  matchmaking_session_id?: string;
  game_id?: string;
  status?: ResultStatus;
  source?: ScoreSource;
  player_id?: string;
  team_id?: string;
  limit?: number;
  offset?: number;
}

// --- UI Helper Types ---

export const STATUS_COLORS: Record<ResultStatus, 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'secondary'> = {
  submitted: 'default',
  under_review: 'primary',
  verified: 'success',
  disputed: 'warning',
  conciliated: 'secondary',
  finalized: 'success',
  cancelled: 'danger',
};

export const STATUS_LABELS: Record<ResultStatus, string> = {
  submitted: 'Submitted',
  under_review: 'Under Review',
  verified: 'Verified',
  disputed: 'Disputed',
  conciliated: 'Conciliated',
  finalized: 'Finalized',
  cancelled: 'Cancelled',
};

export const SOURCE_LABELS: Record<ScoreSource, string> = {
  replay_file: 'Replay File',
  tournament_admin: 'Tournament Admin',
  external_api: 'External API',
  consensus: 'Team Consensus',
  matchmaking: 'Matchmaking',
};

export const SOURCE_ICONS: Record<ScoreSource, string> = {
  replay_file: 'solar:videocamera-record-bold-duotone',
  tournament_admin: 'solar:shield-user-bold-duotone',
  external_api: 'solar:cloud-download-bold-duotone',
  consensus: 'solar:users-group-rounded-bold-duotone',
  matchmaking: 'solar:gamepad-bold-duotone',
};

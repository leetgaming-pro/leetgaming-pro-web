/**
 * Challenge Types
 * Domain types for game challenges, bug reports, VAR, and round restart requests
 */

// Challenge type enum - matches backend ChallengeType
export type ChallengeType =
  | 'bug_report'       // Game bug affecting outcome
  | 'var'              // Video Assistant Review request
  | 'round_restart'    // Request to restart current round
  | 'match_restart'    // Request to restart entire match
  | 'technical_issue'  // Server/connection problems
  | 'rule_violation'   // Alleged rule violation by opponent
  | 'score_dispute';   // Dispute about match score

// Challenge status enum - matches backend ChallengeStatus
export type ChallengeStatus =
  | 'pending'       // Awaiting review
  | 'in_review'     // Being reviewed by admin/system
  | 'vote_pending'  // Waiting for player votes
  | 'approved'      // Challenge accepted
  | 'rejected'      // Challenge denied
  | 'resolved'      // Final resolution applied
  | 'expired'       // Timeout without resolution
  | 'cancelled';    // Cancelled by challenger

// Challenge priority - matches backend ChallengePriority
export type ChallengePriority =
  | 'low'       // Non-urgent, review later
  | 'normal'    // Standard processing
  | 'high'      // Urgent, affects ongoing match
  | 'critical'; // Match-stopping issue

// Challenge resolution - matches backend ChallengeResolution
export type ChallengeResolution =
  | 'none'              // Not yet resolved
  | 'round_restarted'   // Round was restarted
  | 'match_restarted'   // Match was restarted
  | 'score_adjusted'    // Score was corrected
  | 'penalty_applied'   // Penalty given to violator
  | 'no_action'         // No action warranted
  | 'match_voided'      // Match result invalidated
  | 'compensation';     // Financial compensation

// Tick range for replay clips in evidence
export interface EvidenceTickRange {
  start_tick: number;
  end_tick: number;
}

// Evidence attached to a challenge
export interface Evidence {
  id: string;
  type: 'screenshot' | 'replay_clip' | 'log' | 'video';
  url: string;
  description: string;
  timestamp: string;
  tick_range?: EvidenceTickRange;
  uploaded_at: string;
}

// Vote on a challenge
export interface Vote {
  player_id: string;
  team_id?: string;
  vote_type: 'approve' | 'reject' | 'abstain';
  reason?: string;
  voted_at: string;
}

// Admin action on a challenge
export interface AdminAction {
  admin_id: string;
  action: string;
  notes: string;
  performed_at: string;
}

// Main Challenge entity
export interface Challenge {
  id: string;
  match_id: string;
  round_number?: number;
  game_id: string;
  lobby_id?: string;
  tournament_id?: string;

  challenger_id: string;
  challenger_team_id?: string;

  type: ChallengeType;
  title: string;
  description: string;
  priority: ChallengePriority;
  status: ChallengeStatus;
  resolution: ChallengeResolution;

  evidence: Evidence[];
  votes: Vote[];
  admin_actions: AdminAction[];

  resolved_by_id?: string;
  resolution_notes?: string;
  resolved_at?: string;

  voting_deadline?: string;
  review_deadline?: string;
  expires_at?: string;

  match_paused_at?: string;
  match_resumed_at?: string;
  score_before_challenge?: Record<string, number>;
  score_after_resolution?: Record<string, number>;

  created_at: string;
  updated_at: string;
}

// Response type for challenge list with counts
export interface ChallengeResponse {
  id: string;
  match_id: string;
  round_number?: number;
  challenger_id: string;
  challenger_team_id?: string;
  game_id: string;
  type: string;
  title: string;
  description: string;
  priority: string;
  status: string;
  resolution: string;
  evidence_count: number;
  vote_count: number;
  created_at: string;
  updated_at: string;
}

// --- Request Types ---

export interface CreateChallengeRequest {
  match_id: string;
  round_number?: number;
  challenger_team_id?: string;
  game_id: string;
  lobby_id?: string;
  tournament_id?: string;
  type: ChallengeType;
  title: string;
  description: string;
  priority?: ChallengePriority;
}

export interface AddEvidenceRequest {
  type: 'screenshot' | 'replay_clip' | 'log' | 'video';
  url: string;
  description: string;
  start_tick?: number;
  end_tick?: number;
}

export interface VoteRequest {
  vote_type: 'approve' | 'reject' | 'abstain';
  reason?: string;
}

export interface ResolveRequest {
  decision: 'approve' | 'reject';
  resolution: ChallengeResolution;
  notes: string;
}

export interface CancelRequest {
  reason?: string;
}

// --- Filter Types ---

export interface ChallengeListFilters {
  match_id?: string;
  challenger_id?: string;
  game_id?: string;
  tournament_id?: string;
  lobby_id?: string;
  types?: ChallengeType[];
  statuses?: ChallengeStatus[];
  priorities?: ChallengePriority[];
  include_expired?: boolean;
  limit?: number;
  offset?: number;
}

export interface PendingChallengesFilters {
  game_id?: string;
  priority?: ChallengePriority;
  limit?: number;
}

// Vote counts
export interface VoteCounts {
  approve: number;
  reject: number;
  abstain: number;
}


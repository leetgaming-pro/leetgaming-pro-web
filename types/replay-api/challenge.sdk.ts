/**
 * Challenge API SDK
 * Clean, minimal API wrapper for challenge operations
 * Handles bug reports, VAR, round restarts, and match disputes
 * Follows Clean Architecture + CQRS pattern from backend
 */

import { ReplayApiClient } from './replay-api.client';
import type {
  Challenge,
  ChallengeResponse,
  CreateChallengeRequest,
  AddEvidenceRequest,
  VoteRequest,
  ResolveRequest,
  CancelRequest,
  ChallengeListFilters,
  PendingChallengesFilters,
} from './challenge.types';

export interface ChallengesResult {
  challenges: ChallengeResponse[];
  total: number;
  limit: number;
  offset: number;
}

export class ChallengeAPI {
  constructor(private client: ReplayApiClient) {}

  // --- Query Operations (ChallengeReader) ---

  /**
   * Get a single challenge by ID
   */
  async getChallenge(challengeId: string): Promise<ChallengeResponse | null> {
    const response = await this.client.get<ChallengeResponse>(`/challenges/${challengeId}`);
    if (response.error) {
      console.error('Failed to fetch challenge:', response.error);
      return null;
    }
    return response.data || null;
  }

  /**
   * Get full challenge details by ID (with all evidence, votes, admin actions)
   */
  async getChallengeDetails(challengeId: string): Promise<Challenge | null> {
    const response = await this.client.get<Challenge>(`/challenges/${challengeId}/details`);
    if (response.error) {
      console.error('Failed to fetch challenge details:', response.error);
      return null;
    }
    return response.data || null;
  }

  /**
   * Get challenges for a specific match
   */
  async getChallengesByMatch(matchId: string): Promise<ChallengeResponse[] | null> {
    const response = await this.client.get<ChallengeResponse[]>(`/matches/${matchId}/challenges`);
    if (response.error) {
      console.error('Failed to fetch match challenges:', response.error);
      return null;
    }
    return response.data || null;
  }

  /**
   * Get pending challenges requiring review
   */
  async getPendingChallenges(
    filters: PendingChallengesFilters = {}
  ): Promise<ChallengeResponse[] | null> {
    const params = new URLSearchParams();

    if (filters.game_id) params.append('game_id', filters.game_id);
    if (filters.priority) params.append('priority', filters.priority);
    if (filters.limit) params.append('limit', String(filters.limit));

    const queryString = params.toString();
    const url = queryString ? `/challenges/pending?${queryString}` : '/challenges/pending';

    const response = await this.client.get<ChallengeResponse[]>(url);
    if (response.error) {
      console.error('Failed to fetch pending challenges:', response.error);
      return null;
    }
    return response.data || null;
  }

  /**
   * List challenges with optional filters
   */
  async listChallenges(filters: ChallengeListFilters = {}): Promise<ChallengesResult | null> {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          value.forEach((v) => params.append(key, String(v)));
        } else {
          params.append(key, String(value));
        }
      }
    });

    const queryString = params.toString();
    const url = queryString ? `/challenges?${queryString}` : '/challenges';

    const response = await this.client.get<ChallengesResult>(url);
    if (response.error) {
      console.error('Failed to fetch challenges:', response.error);
      return null;
    }
    return response.data || null;
  }

  // --- Command Operations (ChallengeCommand) ---

  /**
   * Create a new challenge (bug report, VAR request, etc.)
   */
  async createChallenge(request: CreateChallengeRequest): Promise<ChallengeResponse | null> {
    const response = await this.client.post<ChallengeResponse>('/challenges', request);
    if (response.error) {
      console.error('Failed to create challenge:', response.error);
      return null;
    }
    return response.data || null;
  }

  /**
   * Add evidence to an existing challenge
   */
  async addEvidence(
    challengeId: string,
    request: AddEvidenceRequest
  ): Promise<ChallengeResponse | null> {
    const response = await this.client.post<ChallengeResponse>(
      `/challenges/${challengeId}/evidence`,
      request
    );
    if (response.error) {
      console.error('Failed to add evidence:', response.error);
      return null;
    }
    return response.data || null;
  }

  /**
   * Vote on a challenge (approve, reject, or abstain)
   */
  async vote(challengeId: string, request: VoteRequest): Promise<ChallengeResponse | null> {
    const response = await this.client.post<ChallengeResponse>(
      `/challenges/${challengeId}/vote`,
      request
    );
    if (response.error) {
      console.error('Failed to vote on challenge:', response.error);
      return null;
    }
    return response.data || null;
  }

  /**
   * Resolve a challenge (admin only)
   */
  async resolve(challengeId: string, request: ResolveRequest): Promise<ChallengeResponse | null> {
    const response = await this.client.post<ChallengeResponse>(
      `/challenges/${challengeId}/resolve`,
      request
    );
    if (response.error) {
      console.error('Failed to resolve challenge:', response.error);
      return null;
    }
    return response.data || null;
  }

  /**
   * Cancel a challenge
   */
  async cancel(challengeId: string, request: CancelRequest = {}): Promise<ChallengeResponse | null> {
    // For DELETE with body, we use POST to a cancel endpoint
    // or pass reason in query params if small
    const params = request.reason ? `?reason=${encodeURIComponent(request.reason)}` : '';
    const response = await this.client.delete<ChallengeResponse>(
      `/challenges/${challengeId}${params}`
    );
    if (response.error) {
      console.error('Failed to cancel challenge:', response.error);
      return null;
    }
    return response.data || null;
  }

  // --- Convenience Methods ---

  /**
   * Create a bug report challenge
   */
  async reportBug(
    matchId: string,
    title: string,
    description: string,
    gameId = 'cs2',
    priority: 'low' | 'normal' | 'high' | 'critical' = 'normal',
    roundNumber?: number
  ): Promise<ChallengeResponse | null> {
    return this.createChallenge({
      match_id: matchId,
      game_id: gameId,
      type: 'bug_report',
      title,
      description,
      priority,
      round_number: roundNumber,
    });
  }

  /**
   * Request a VAR (Video Assistant Review)
   */
  async requestVAR(
    matchId: string,
    title: string,
    description: string,
    gameId = 'cs2',
    roundNumber?: number
  ): Promise<ChallengeResponse | null> {
    return this.createChallenge({
      match_id: matchId,
      game_id: gameId,
      type: 'var',
      title,
      description,
      priority: 'high',
      round_number: roundNumber,
    });
  }

  /**
   * Request a round restart
   */
  async requestRoundRestart(
    matchId: string,
    roundNumber: number,
    reason: string,
    gameId = 'cs2'
  ): Promise<ChallengeResponse | null> {
    return this.createChallenge({
      match_id: matchId,
      game_id: gameId,
      type: 'round_restart',
      title: `Round ${roundNumber} Restart Request`,
      description: reason,
      priority: 'critical',
      round_number: roundNumber,
    });
  }

  /**
   * Report a technical issue
   */
  async reportTechnicalIssue(
    matchId: string,
    title: string,
    description: string,
    gameId = 'cs2'
  ): Promise<ChallengeResponse | null> {
    return this.createChallenge({
      match_id: matchId,
      game_id: gameId,
      type: 'technical_issue',
      title,
      description,
      priority: 'high',
    });
  }

  /**
   * Dispute match score
   */
  async disputeScore(
    matchId: string,
    description: string,
    gameId = 'cs2'
  ): Promise<ChallengeResponse | null> {
    return this.createChallenge({
      match_id: matchId,
      game_id: gameId,
      type: 'score_dispute',
      title: 'Score Dispute',
      description,
      priority: 'high',
    });
  }
}

// Re-export types for convenience
export type {
  Challenge,
  ChallengeResponse,
  ChallengeType,
  ChallengeStatus,
  ChallengePriority,
  ChallengeResolution,
  Evidence,
  Vote,
  AdminAction,
  EvidenceTickRange,
  CreateChallengeRequest,
  AddEvidenceRequest,
  VoteRequest,
  ResolveRequest,
  CancelRequest,
  ChallengeListFilters,
  PendingChallengesFilters,
} from './challenge.types';


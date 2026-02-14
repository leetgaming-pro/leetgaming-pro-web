/**
 * Scores / Match Results API SDK
 * Clean, minimal API wrapper for scores and match result operations
 * Follows Clean Architecture + CQRS pattern from backend
 */

import { ReplayApiClient } from './replay-api.client';
import type {
  MatchResult,
  MatchResultListResponse,
  MatchResultFilters,
  SubmitMatchResultRequest,
  VerifyMatchResultRequest,
  DisputeMatchResultRequest,
  ConciliateMatchResultRequest,
  CancelMatchResultRequest,
} from './scores.types';

export class ScoresAPI {
  constructor(private client: ReplayApiClient) {}

  // --- Query Operations ---

  /**
   * Get a single match result by ID
   */
  async getMatchResult(resultId: string): Promise<MatchResult | null> {
    const response = await this.client.get<MatchResult>(`/scores/match-results/${resultId}`);
    if (response.error) {
      console.error('Failed to fetch match result:', response.error);
      return null;
    }
    return response.data || null;
  }

  /**
   * Get match result by the match ID (returns the result for a specific match)
   */
  async getByMatchId(matchId: string): Promise<MatchResult | null> {
    const response = await this.client.get<MatchResult>(`/scores/match-results/by-match/${matchId}`);
    if (response.error) {
      console.error('Failed to fetch match result by match ID:', response.error);
      return null;
    }
    return response.data || null;
  }

  /**
   * List match results with optional filters
   */
  async listMatchResults(filters: MatchResultFilters = {}): Promise<MatchResultListResponse | null> {
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
    const url = queryString ? `/scores/match-results?${queryString}` : '/scores/match-results';

    const response = await this.client.get<MatchResultListResponse>(url);
    if (response.error) {
      console.error('Failed to fetch match results:', response.error);
      return null;
    }
    return response.data || null;
  }

  /**
   * Get match results for a tournament
   */
  async getTournamentResults(tournamentId: string, limit = 50): Promise<MatchResultListResponse | null> {
    return this.listMatchResults({ tournament_id: tournamentId, limit });
  }

  /**
   * Get match results for a player
   */
  async getPlayerResults(playerId: string, limit = 20): Promise<MatchResultListResponse | null> {
    return this.listMatchResults({ player_id: playerId, limit });
  }

  // --- Command Operations ---

  /**
   * Submit a new match result
   */
  async submitMatchResult(request: SubmitMatchResultRequest): Promise<MatchResult | null> {
    const response = await this.client.post<MatchResult>('/scores/match-results', request);
    if (response.error) {
      console.error('Failed to submit match result:', response.error);
      return null;
    }
    return response.data || null;
  }

  /**
   * Verify a match result (admin / automated verification)
   */
  async verifyMatchResult(resultId: string, request: VerifyMatchResultRequest): Promise<MatchResult | null> {
    const response = await this.client.put<MatchResult>(
      `/scores/match-results/${resultId}/verify`,
      request
    );
    if (response.error) {
      console.error('Failed to verify match result:', response.error);
      return null;
    }
    return response.data || null;
  }

  /**
   * Dispute a match result
   */
  async disputeMatchResult(resultId: string, request: DisputeMatchResultRequest): Promise<MatchResult | null> {
    const response = await this.client.put<MatchResult>(
      `/scores/match-results/${resultId}/dispute`,
      request
    );
    if (response.error) {
      console.error('Failed to dispute match result:', response.error);
      return null;
    }
    return response.data || null;
  }

  /**
   * Conciliate a disputed match result (admin resolution)
   */
  async conciliateMatchResult(resultId: string, request: ConciliateMatchResultRequest): Promise<MatchResult | null> {
    const response = await this.client.put<MatchResult>(
      `/scores/match-results/${resultId}/conciliate`,
      request
    );
    if (response.error) {
      console.error('Failed to conciliate match result:', response.error);
      return null;
    }
    return response.data || null;
  }

  /**
   * Finalize a match result (triggers prize distribution)
   */
  async finalizeMatchResult(resultId: string): Promise<MatchResult | null> {
    const response = await this.client.put<MatchResult>(
      `/scores/match-results/${resultId}/finalize`,
      {}
    );
    if (response.error) {
      console.error('Failed to finalize match result:', response.error);
      return null;
    }
    return response.data || null;
  }

  /**
   * Cancel a match result
   */
  async cancelMatchResult(resultId: string, request: CancelMatchResultRequest): Promise<MatchResult | null> {
    const response = await this.client.put<MatchResult>(
      `/scores/match-results/${resultId}/cancel`,
      request
    );
    if (response.error) {
      console.error('Failed to cancel match result:', response.error);
      return null;
    }
    return response.data || null;
  }
}

// Re-export types for convenience
export type {
  MatchResult,
  TeamResult,
  PlayerResult,
  ResultStatus,
  ScoreSource,
  VerificationMethod,
  SubmitMatchResultRequest,
  VerifyMatchResultRequest,
  DisputeMatchResultRequest,
  ConciliateMatchResultRequest,
  CancelMatchResultRequest,
  MatchResultFilters,
  MatchResultListResponse,
} from './scores.types';

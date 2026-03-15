/**
 * Scores / Match Results API SDK
 * Clean, minimal API wrapper for scores and match result operations
 * Follows Clean Architecture + CQRS pattern from backend
 *
 * Error handling:
 *  - Query operations return null on failure (non-critical)
 *  - Command operations THROW on 403/permission errors so the UI
 *    can display meaningful feedback to the user
 */

import { ReplayApiClient, type ApiError } from './replay-api.client';
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

/**
 * Check if an API error is a permission/forbidden error and throw a
 * user-friendly Error so consuming components can display it.
 */
function throwIfForbidden(error: ApiError | string | undefined, action: string): void {
  if (!error) return;
  const apiError = typeof error === 'string' ? { message: error } : error;
  const isForbidden =
    apiError.status === 403 ||
    (apiError as ApiError).isForbidden ||
    apiError.isAuthError ||
    apiError.message?.toLowerCase().includes('forbidden');

  if (isForbidden) {
    throw new Error(
      `Permission denied: You do not have permission to ${action}. ` +
      `Only tournament organizers or platform administrators can perform this action.`
    );
  }
}

/**
 * Wrap a command response — throw on permission errors, return data or null.
 */
function handleCommandResponse<T>(
  response: { data?: T; error?: ApiError | string },
  action: string,
  logPrefix: string,
): T | null {
  if (response.error) {
    throwIfForbidden(response.error, action);
    console.error(`${logPrefix}:`, response.error);
    // For non-permission errors, throw with the server message so the UI
    // can display it rather than silently returning null
    const msg = typeof response.error === 'string'
      ? response.error
      : response.error.message || 'Unknown error';
    throw new Error(msg);
  }
  return response.data || null;
}

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
    return handleCommandResponse(response, 'submit match results', 'Failed to submit match result');
  }

  /**
   * Verify a match result (admin / automated verification)
   */
  async verifyMatchResult(resultId: string, request: VerifyMatchResultRequest): Promise<MatchResult | null> {
    const response = await this.client.put<MatchResult>(
      `/scores/match-results/${resultId}/verify`,
      request
    );
    return handleCommandResponse(response, 'verify match results', 'Failed to verify match result');
  }

  /**
   * Dispute a match result
   */
  async disputeMatchResult(resultId: string, request: DisputeMatchResultRequest): Promise<MatchResult | null> {
    const response = await this.client.put<MatchResult>(
      `/scores/match-results/${resultId}/dispute`,
      request
    );
    return handleCommandResponse(response, 'dispute match results', 'Failed to dispute match result');
  }

  /**
   * Conciliate a disputed match result (admin resolution)
   */
  async conciliateMatchResult(resultId: string, request: ConciliateMatchResultRequest): Promise<MatchResult | null> {
    const response = await this.client.put<MatchResult>(
      `/scores/match-results/${resultId}/conciliate`,
      request
    );
    return handleCommandResponse(response, 'resolve disputes', 'Failed to conciliate match result');
  }

  /**
   * Finalize a match result (triggers prize distribution)
   */
  async finalizeMatchResult(resultId: string): Promise<MatchResult | null> {
    const response = await this.client.put<MatchResult>(
      `/scores/match-results/${resultId}/finalize`,
      {}
    );
    return handleCommandResponse(response, 'finalize match results', 'Failed to finalize match result');
  }

  /**
   * Cancel a match result
   */
  async cancelMatchResult(resultId: string, request: CancelMatchResultRequest): Promise<MatchResult | null> {
    const response = await this.client.put<MatchResult>(
      `/scores/match-results/${resultId}/cancel`,
      request
    );
    return handleCommandResponse(response, 'cancel match results', 'Failed to cancel match result');
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

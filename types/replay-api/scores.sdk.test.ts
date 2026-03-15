/**
 * ScoresAPI SDK Unit Tests
 *
 * Tests all query + command operations including:
 * - Error handling (403 → throw, other errors → throw with message)
 * - Correct endpoint construction
 * - Filter/param serialization
 * - Response data mapping
 */

import { ScoresAPI } from './scores.sdk';
import type { ReplayApiClient } from './replay-api.client';
import type { MatchResult, MatchResultListResponse } from './scores.types';

// --- Mock Client ---

const createMockClient = (): jest.Mocked<ReplayApiClient> =>
  ({
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    patch: jest.fn(),
  } as unknown as jest.Mocked<ReplayApiClient>);

// --- Mock Data ---

const mockResult: MatchResult = {
  id: 'result-123',
  match_id: 'match-456',
  game_id: 'cs2',
  map_name: 'de_dust2',
  mode: 'competitive',
  source: 'tournament_admin',
  status: 'verified',
  submitted_by: 'user-1',
  played_at: '2024-01-01T00:00:00Z',
  duration: 2700,
  is_draw: false,
  rounds_played: 28,
  team_results: [],
  player_results: [],
  winner_team_id: 'team-a',
  dispute_count: 0,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

const mockListResponse: MatchResultListResponse = {
  match_results: [mockResult],
  total: 1,
  offset: 0,
  limit: 20,
};

describe('ScoresAPI', () => {
  let mockClient: jest.Mocked<ReplayApiClient>;
  let scoresApi: ScoresAPI;

  beforeEach(() => {
    jest.clearAllMocks();
    mockClient = createMockClient();
    scoresApi = new ScoresAPI(mockClient);
  });

  // --- Query Operations ---

  describe('getMatchResult', () => {
    it('returns match result on success', async () => {
      mockClient.get.mockResolvedValue({ data: mockResult, status: 200 });
      const result = await scoresApi.getMatchResult('result-123');
      expect(result).toEqual(mockResult);
      expect(mockClient.get).toHaveBeenCalledWith('/scores/match-results/result-123');
    });

    it('returns null on error', async () => {
      mockClient.get.mockResolvedValue({ error: { message: 'Not found', status: 404 }, status: 404 });
      const result = await scoresApi.getMatchResult('bad-id');
      expect(result).toBeNull();
    });
  });

  describe('getByMatchId', () => {
    it('calls correct endpoint', async () => {
      mockClient.get.mockResolvedValue({ data: mockResult });
      await scoresApi.getByMatchId('match-456');
      expect(mockClient.get).toHaveBeenCalledWith('/scores/match-results/by-match/match-456');
    });

    it('returns null on failure', async () => {
      mockClient.get.mockResolvedValue({ error: 'server error' });
      const result = await scoresApi.getByMatchId('match-456');
      expect(result).toBeNull();
    });
  });

  describe('listMatchResults', () => {
    it('calls without params when no filters', async () => {
      mockClient.get.mockResolvedValue({ data: mockListResponse });
      const result = await scoresApi.listMatchResults();
      expect(result).toEqual(mockListResponse);
      expect(mockClient.get).toHaveBeenCalledWith('/scores/match-results');
    });

    it('serializes filters as query params', async () => {
      mockClient.get.mockResolvedValue({ data: mockListResponse });
      await scoresApi.listMatchResults({ tournament_id: 'tourney-1', limit: 10, status: 'verified' });
      const calledUrl = mockClient.get.mock.calls[0][0];
      expect(calledUrl).toContain('tournament_id=tourney-1');
      expect(calledUrl).toContain('limit=10');
      expect(calledUrl).toContain('status=verified');
    });

    it('skips undefined/null filter values', async () => {
      mockClient.get.mockResolvedValue({ data: mockListResponse });
      await scoresApi.listMatchResults({ tournament_id: undefined, limit: 5 });
      const calledUrl = mockClient.get.mock.calls[0][0];
      expect(calledUrl).toContain('limit=5');
      expect(calledUrl).not.toContain('tournament_id');
    });
  });

  describe('getTournamentResults', () => {
    it('delegates to listMatchResults with tournament filter', async () => {
      mockClient.get.mockResolvedValue({ data: mockListResponse });
      await scoresApi.getTournamentResults('tourney-1', 25);
      const calledUrl = mockClient.get.mock.calls[0][0];
      expect(calledUrl).toContain('tournament_id=tourney-1');
      expect(calledUrl).toContain('limit=25');
    });
  });

  describe('getPlayerResults', () => {
    it('delegates to listMatchResults with player filter', async () => {
      mockClient.get.mockResolvedValue({ data: mockListResponse });
      await scoresApi.getPlayerResults('player-1');
      const calledUrl = mockClient.get.mock.calls[0][0];
      expect(calledUrl).toContain('player_id=player-1');
      expect(calledUrl).toContain('limit=20');
    });
  });

  // --- Command Operations ---

  describe('submitMatchResult', () => {
    const request = {
      match_id: 'match-1',
      game_id: 'cs2',
      map_name: 'de_dust2',
      mode: 'competitive',
      source: 'tournament_admin' as const,
      team_results: [],
      player_results: [],
      played_at: '2024-01-01T00:00:00Z',
      duration: 2700,
      rounds_played: 28,
    };

    it('returns result on success', async () => {
      mockClient.post.mockResolvedValue({ data: mockResult });
      const result = await scoresApi.submitMatchResult(request);
      expect(result).toEqual(mockResult);
      expect(mockClient.post).toHaveBeenCalledWith('/scores/match-results', request);
    });

    it('throws on 403 permission error', async () => {
      mockClient.post.mockResolvedValue({
        error: { message: 'Forbidden', status: 403 },
      });
      await expect(scoresApi.submitMatchResult(request)).rejects.toThrow('Permission denied');
    });

    it('throws on non-permission errors with server message', async () => {
      mockClient.post.mockResolvedValue({
        error: { message: 'Validation failed: missing game_id', status: 400 },
      });
      await expect(scoresApi.submitMatchResult(request)).rejects.toThrow('Validation failed');
    });
  });

  describe('verifyMatchResult', () => {
    it('calls correct endpoint', async () => {
      mockClient.put.mockResolvedValue({ data: mockResult });
      await scoresApi.verifyMatchResult('result-123', { verification_method: 'manual' });
      expect(mockClient.put).toHaveBeenCalledWith(
        '/scores/match-results/result-123/verify',
        { verification_method: 'manual' },
      );
    });

    it('throws on 403', async () => {
      mockClient.put.mockResolvedValue({
        error: { message: 'forbidden: not organizer', status: 403 },
      });
      await expect(
        scoresApi.verifyMatchResult('r-1', { verification_method: 'manual' }),
      ).rejects.toThrow('Permission denied');
    });
  });

  describe('disputeMatchResult', () => {
    it('calls correct endpoint with reason', async () => {
      mockClient.put.mockResolvedValue({ data: mockResult });
      await scoresApi.disputeMatchResult('result-123', { reason: 'Wrong scores' });
      expect(mockClient.put).toHaveBeenCalledWith(
        '/scores/match-results/result-123/dispute',
        { reason: 'Wrong scores' },
      );
    });

    it('throws on auth error', async () => {
      mockClient.put.mockResolvedValue({
        error: { message: 'Auth required', isAuthError: true },
      });
      await expect(
        scoresApi.disputeMatchResult('r-1', { reason: 'test' }),
      ).rejects.toThrow('Permission denied');
    });
  });

  describe('conciliateMatchResult', () => {
    it('calls correct endpoint', async () => {
      mockClient.put.mockResolvedValue({ data: mockResult });
      await scoresApi.conciliateMatchResult('result-123', { notes: 'Confirmed correct' });
      expect(mockClient.put).toHaveBeenCalledWith(
        '/scores/match-results/result-123/conciliate',
        { notes: 'Confirmed correct' },
      );
    });
  });

  describe('finalizeMatchResult', () => {
    it('calls correct endpoint with empty body', async () => {
      mockClient.put.mockResolvedValue({ data: mockResult });
      await scoresApi.finalizeMatchResult('result-123');
      expect(mockClient.put).toHaveBeenCalledWith(
        '/scores/match-results/result-123/finalize',
        {},
      );
    });

    it('throws on dispute window error', async () => {
      mockClient.put.mockResolvedValue({
        error: { message: 'cannot finalize: dispute window has not elapsed', status: 400 },
      });
      await expect(scoresApi.finalizeMatchResult('r-1')).rejects.toThrow('dispute window');
    });
  });

  describe('cancelMatchResult', () => {
    it('calls correct endpoint with reason', async () => {
      mockClient.put.mockResolvedValue({ data: mockResult });
      await scoresApi.cancelMatchResult('result-123', { reason: 'Cheating detected' });
      expect(mockClient.put).toHaveBeenCalledWith(
        '/scores/match-results/result-123/cancel',
        { reason: 'Cheating detected' },
      );
    });

    it('throws on 403 with sanitized error', async () => {
      mockClient.put.mockResolvedValue({
        error: { message: 'Forbidden: insufficient permissions', status: 403 },
      });
      await expect(
        scoresApi.cancelMatchResult('r-1', { reason: 'test' }),
      ).rejects.toThrow('Permission denied');
    });
  });

  // --- Error handling edge cases ---

  describe('error handling', () => {
    it('handles string errors in command responses', async () => {
      mockClient.put.mockResolvedValue({ error: 'Something went wrong' });
      await expect(scoresApi.finalizeMatchResult('r-1')).rejects.toThrow('Something went wrong');
    });

    it('handles forbidden string error in command responses', async () => {
      mockClient.put.mockResolvedValue({ error: 'forbidden' });
      await expect(scoresApi.finalizeMatchResult('r-1')).rejects.toThrow('Permission denied');
    });

    it('handles missing error message gracefully', async () => {
      mockClient.put.mockResolvedValue({ error: { message: '', status: 500 } });
      await expect(scoresApi.finalizeMatchResult('r-1')).rejects.toThrow();
    });
  });
});

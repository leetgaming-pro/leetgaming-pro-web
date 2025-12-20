/**
 * Highlights SDK Unit Tests
 * Tests for the HighlightsAPI class to ensure proper API integration
 * Target: 85%+ coverage for highlights module
 */

import { HighlightsAPI } from './highlights.sdk';
import type { GameIDKey } from './settings';
import type { GameEvent, HighlightFilters, HighlightsListResponse } from './highlights.types';

// Mock the ReplayApiClient
const mockClient = {
  post: jest.fn(),
  get: jest.fn(),
  delete: jest.fn(),
  put: jest.fn(),
};

describe('HighlightsAPI', () => {
  let highlightsApi: HighlightsAPI;

  beforeEach(() => {
    jest.clearAllMocks();
    highlightsApi = new HighlightsAPI(mockClient as unknown as ConstructorParameters<typeof HighlightsAPI>[0]);
  });

  describe('getHighlights', () => {
    it('should fetch highlights with default filters', async () => {
      const mockHighlights = [
        {
          id: 'highlight-1',
          type: 'Ace',
          game_id: 'cs2',
          match_id: 'match-123',
          tick_id: 12000,
          event_time: 45000,
          created_at: new Date().toISOString(),
        },
      ];

      mockClient.get.mockResolvedValueOnce({
        data: mockHighlights,
        status: 200,
      });

      const result = await highlightsApi.getHighlights();

      expect(mockClient.get).toHaveBeenCalledWith('/games/cs2/events');
      expect(result.highlights).toHaveLength(1);
      expect(result.highlights[0].type).toBe('Ace');
    });

    it('should apply filters correctly', async () => {
      mockClient.get.mockResolvedValueOnce({
        data: [],
        status: 200,
      });

      const filters: HighlightFilters = {
        game_id: 'cs2' as GameIDKey,
        match_id: 'match-456',
        player_id: 'player-789',
        event_type: 'Clutch',
        clutch_type: '1v3',
        min_kills: 3,
        limit: 20,
        page: 2,
        sort_by: 'views_count',
        sort_order: 'desc',
      };

      await highlightsApi.getHighlights(filters);

      expect(mockClient.get).toHaveBeenCalledWith(
        expect.stringContaining('/games/cs2/events?')
      );
      expect(mockClient.get).toHaveBeenCalledWith(
        expect.stringContaining('match_id=match-456')
      );
      expect(mockClient.get).toHaveBeenCalledWith(
        expect.stringContaining('player_id=player-789')
      );
    });

    it('should handle paginated response format', async () => {
      mockClient.get.mockResolvedValueOnce({
        data: {
          data: [
            {
              id: 'highlight-1',
              type: 'MultiKill',
              game_id: 'cs2',
              match_id: 'match-123',
              tick_id: 12000,
              event_time: 45000,
              created_at: new Date().toISOString(),
            },
          ],
          total: 50,
          page: 1,
          limit: 20,
        },
        status: 200,
      });

      const result = await highlightsApi.getHighlights();

      expect(result.total).toBe(50);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(20);
      expect(result.has_more).toBe(true);
    });

    it('should handle empty response', async () => {
      mockClient.get.mockResolvedValueOnce({
        data: [],
        status: 200,
      });

      const result = await highlightsApi.getHighlights();

      expect(result.highlights).toHaveLength(0);
      expect(result.total).toBe(0);
    });

    it('should handle API error', async () => {
      mockClient.get.mockResolvedValueOnce({
        error: { message: 'Server error' },
        status: 500,
      });

      const result = await highlightsApi.getHighlights();

      expect(result.highlights).toHaveLength(0);
    });
  });

  describe('getHighlight', () => {
    it('should fetch a single highlight by ID', async () => {
      const mockHighlight = {
        id: 'highlight-abc',
        type: 'Ace',
        game_id: 'cs2',
        match_id: 'match-123',
        tick_id: 15000,
        event_time: 60000,
        created_at: new Date().toISOString(),
        payload: {
          title: 'Amazing Ace',
          description: 'Player got an ace with AWP',
          kill_count: 5,
        },
      };

      mockClient.get.mockResolvedValueOnce({
        data: mockHighlight,
        status: 200,
      });

      const result = await highlightsApi.getHighlight('cs2', 'highlight-abc');

      expect(mockClient.get).toHaveBeenCalledWith('/games/cs2/events/highlight-abc');
      expect(result).not.toBeNull();
      expect(result?.id).toBe('highlight-abc');
      expect(result?.type).toBe('Ace');
    });

    it('should return null when highlight not found', async () => {
      mockClient.get.mockResolvedValueOnce({
        data: null,
        status: 404,
      });

      const result = await highlightsApi.getHighlight('cs2', 'non-existent');

      expect(result).toBeNull();
    });
  });

  describe('getMatchHighlights', () => {
    it('should fetch highlights for a specific match', async () => {
      mockClient.get.mockResolvedValueOnce({
        data: [
          {
            id: 'highlight-1',
            type: 'Clutch',
            game_id: 'cs2',
            match_id: 'match-999',
            tick_id: 12000,
            event_time: 45000,
            created_at: new Date().toISOString(),
          },
        ],
        status: 200,
      });

      const result = await highlightsApi.getMatchHighlights('cs2', 'match-999');

      expect(mockClient.get).toHaveBeenCalledWith(
        expect.stringContaining('match_id=match-999')
      );
      expect(result).toHaveLength(1);
    });

    it('should filter by event types', async () => {
      mockClient.get.mockResolvedValueOnce({
        data: [],
        status: 200,
      });

      await highlightsApi.getMatchHighlights('cs2', 'match-999', ['Ace', 'Clutch']);

      expect(mockClient.get).toHaveBeenCalledWith(
        expect.stringContaining('type=Ace')
      );
      expect(mockClient.get).toHaveBeenCalledWith(
        expect.stringContaining('type=Clutch')
      );
    });
  });

  describe('getPlayerHighlights', () => {
    it('should fetch highlights for a specific player', async () => {
      mockClient.get.mockResolvedValueOnce({
        data: [
          {
            id: 'highlight-1',
            type: 'MultiKill',
            game_id: 'cs2',
            match_id: 'match-123',
            tick_id: 12000,
            event_time: 45000,
            created_at: new Date().toISOString(),
          },
        ],
        status: 200,
      });

      const result = await highlightsApi.getPlayerHighlights('player-123');

      expect(mockClient.get).toHaveBeenCalledWith(
        expect.stringContaining('player_id=player-123')
      );
      expect(result).toHaveLength(1);
    });

    it('should apply options correctly', async () => {
      mockClient.get.mockResolvedValueOnce({
        data: [],
        status: 200,
      });

      await highlightsApi.getPlayerHighlights('player-123', {
        gameId: 'cs2',
        eventTypes: ['Ace'],
        limit: 10,
      });

      expect(mockClient.get).toHaveBeenCalledWith(
        expect.stringContaining('limit=10')
      );
    });
  });

  describe('getTrendingHighlights', () => {
    it('should fetch trending highlights sorted by views', async () => {
      mockClient.get.mockResolvedValueOnce({
        data: [
          {
            id: 'trending-1',
            type: 'Ace',
            game_id: 'cs2',
            match_id: 'match-123',
            tick_id: 12000,
            event_time: 45000,
            created_at: new Date().toISOString(),
          },
        ],
        status: 200,
      });

      const result = await highlightsApi.getTrendingHighlights();

      expect(mockClient.get).toHaveBeenCalledWith(
        expect.stringContaining('sort=views_count')
      );
      expect(mockClient.get).toHaveBeenCalledWith(
        expect.stringContaining('order=desc')
      );
      expect(result).toHaveLength(1);
    });

    it('should apply custom limit', async () => {
      mockClient.get.mockResolvedValueOnce({
        data: [],
        status: 200,
      });

      await highlightsApi.getTrendingHighlights({ limit: 5 });

      expect(mockClient.get).toHaveBeenCalledWith(
        expect.stringContaining('limit=5')
      );
    });
  });

  describe('getClutches', () => {
    it('should fetch only clutch events', async () => {
      mockClient.get.mockResolvedValueOnce({
        data: [
          {
            id: 'clutch-1',
            type: 'Clutch',
            game_id: 'cs2',
            match_id: 'match-123',
            tick_id: 12000,
            event_time: 45000,
            created_at: new Date().toISOString(),
            payload: {
              clutch_type: '1v3',
              clutch_success: true,
            },
          },
        ],
        status: 200,
      });

      const result = await highlightsApi.getClutches();

      expect(mockClient.get).toHaveBeenCalledWith(
        expect.stringContaining('type=Clutch')
      );
      expect(result).toHaveLength(1);
    });

    it('should filter by clutch type', async () => {
      mockClient.get.mockResolvedValueOnce({
        data: [],
        status: 200,
      });

      await highlightsApi.getClutches({ clutchType: '1v5' });

      expect(mockClient.get).toHaveBeenCalledWith(
        expect.stringContaining('clutch_type=1v5')
      );
    });
  });

  describe('getAces', () => {
    it('should fetch only ace events', async () => {
      mockClient.get.mockResolvedValueOnce({
        data: [
          {
            id: 'ace-1',
            type: 'Ace',
            game_id: 'cs2',
            match_id: 'match-123',
            tick_id: 12000,
            event_time: 45000,
            created_at: new Date().toISOString(),
            payload: {
              kill_count: 5,
            },
          },
        ],
        status: 200,
      });

      const result = await highlightsApi.getAces();

      expect(mockClient.get).toHaveBeenCalledWith(
        expect.stringContaining('type=Ace')
      );
      expect(result).toHaveLength(1);
    });
  });

  describe('likeHighlight', () => {
    it('should like a highlight successfully', async () => {
      mockClient.post.mockResolvedValueOnce({
        status: 200,
      });

      const result = await highlightsApi.likeHighlight('cs2', 'highlight-123');

      expect(mockClient.post).toHaveBeenCalledWith('/games/cs2/events/highlight-123/like');
      expect(result).toBe(true);
    });

    it('should handle like failure', async () => {
      mockClient.post.mockResolvedValueOnce({
        status: 403,
        error: { message: 'Forbidden' },
      });

      const result = await highlightsApi.likeHighlight('cs2', 'highlight-123');

      expect(result).toBe(false);
    });
  });

  describe('unlikeHighlight', () => {
    it('should unlike a highlight successfully', async () => {
      mockClient.delete.mockResolvedValueOnce({
        status: 204,
      });

      const result = await highlightsApi.unlikeHighlight('cs2', 'highlight-123');

      expect(mockClient.delete).toHaveBeenCalledWith('/games/cs2/events/highlight-123/like');
      expect(result).toBe(true);
    });
  });

  describe('shareHighlight', () => {
    it('should return share URL', async () => {
      mockClient.post.mockResolvedValueOnce({
        data: { share_url: 'https://leetgaming.pro/share/abc123' },
        status: 200,
      });

      const result = await highlightsApi.shareHighlight('cs2', 'highlight-123');

      expect(mockClient.post).toHaveBeenCalledWith('/games/cs2/events/highlight-123/share');
      expect(result).not.toBeNull();
      expect(result?.share_url).toBe('https://leetgaming.pro/share/abc123');
    });

    it('should return null on failure', async () => {
      mockClient.post.mockResolvedValueOnce({
        status: 500,
        error: { message: 'Server error' },
      });

      const result = await highlightsApi.shareHighlight('cs2', 'highlight-123');

      expect(result).toBeNull();
    });
  });

  describe('reportHighlight', () => {
    it('should report a highlight successfully', async () => {
      mockClient.post.mockResolvedValueOnce({
        status: 201,
      });

      const result = await highlightsApi.reportHighlight('cs2', 'highlight-123', 'Inappropriate content');

      expect(mockClient.post).toHaveBeenCalledWith(
        '/games/cs2/events/highlight-123/report',
        { reason: 'Inappropriate content' }
      );
      expect(result).toBe(true);
    });
  });
});


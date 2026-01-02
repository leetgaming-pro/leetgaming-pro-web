/**
 * @fileoverview Tests for Search Query Parser
 */

import {
  parseSearchQuery,
  GAME_DISPLAY_CONFIG,
  getSupportedGameIds,
  isValidGameId,
  suggestGames,
} from '../query-parser';

describe('parseSearchQuery', () => {
  describe('game detection', () => {
    it('should detect "valorant" as a game filter', () => {
      const result = parseSearchQuery('valorant');
      expect(result.gameId).toBe('valorant');
      expect(result.gameDisplay?.shortName).toBe('VAL');
      expect(result.hasGameFilter).toBe(true);
    });

    it('should detect "cs2" as a game filter', () => {
      const result = parseSearchQuery('cs2');
      expect(result.gameId).toBe('cs2');
      expect(result.gameDisplay?.shortName).toBe('CS2');
      expect(result.hasGameFilter).toBe(true);
    });

    it('should detect game aliases like "csgo"', () => {
      const result = parseSearchQuery('csgo players');
      expect(result.gameId).toBe('cs2');
      expect(result.hasGameFilter).toBe(true);
    });

    it('should detect multi-word game names like "apex legends"', () => {
      const result = parseSearchQuery('apex legends teams');
      expect(result.gameId).toBe('apex');
      expect(result.hasGameFilter).toBe(true);
    });

    it('should extract search term after game filter', () => {
      const result = parseSearchQuery('valorant NightHawk');
      expect(result.gameId).toBe('valorant');
      expect(result.searchTerm).toBe('NightHawk');
    });

    it('should handle game filter at end of query', () => {
      const result = parseSearchQuery('NightHawk valorant');
      expect(result.gameId).toBe('valorant');
      expect(result.searchTerm).toBe('NightHawk');
    });
  });

  describe('entity type detection', () => {
    it('should detect "teams" as entity filter', () => {
      const result = parseSearchQuery('teams');
      expect(result.entityType).toBe('team');
      expect(result.hasEntityFilter).toBe(true);
    });

    it('should detect "players" as entity filter', () => {
      const result = parseSearchQuery('players');
      expect(result.entityType).toBe('player');
      expect(result.hasEntityFilter).toBe(true);
    });

    it('should detect "replays" as entity filter', () => {
      const result = parseSearchQuery('replays');
      expect(result.entityType).toBe('replay');
      expect(result.hasEntityFilter).toBe(true);
    });

    it('should detect "matches" as entity filter', () => {
      const result = parseSearchQuery('matches');
      expect(result.entityType).toBe('match');
      expect(result.hasEntityFilter).toBe(true);
    });

    it('should detect entity aliases like "squad"', () => {
      const result = parseSearchQuery('squad');
      expect(result.entityType).toBe('team');
    });
  });

  describe('combined filters', () => {
    it('should detect both game and entity filters', () => {
      const result = parseSearchQuery('valorant teams');
      expect(result.gameId).toBe('valorant');
      expect(result.entityType).toBe('team');
      expect(result.searchTerm).toBe('');
      expect(result.hasGameFilter).toBe(true);
      expect(result.hasEntityFilter).toBe(true);
    });

    it('should extract search term with both filters', () => {
      const result = parseSearchQuery('cs2 teams NeoStrike');
      expect(result.gameId).toBe('cs2');
      expect(result.entityType).toBe('team');
      expect(result.searchTerm).toBe('NeoStrike');
    });

    it('should handle filters in any order', () => {
      const result = parseSearchQuery('players apex legends');
      expect(result.gameId).toBe('apex');
      expect(result.entityType).toBe('player');
    });
  });

  describe('edge cases', () => {
    it('should return empty result for short queries', () => {
      const result = parseSearchQuery('a');
      expect(result.gameId).toBe(null);
      expect(result.searchTerm).toBe('a');
    });

    it('should handle empty query', () => {
      const result = parseSearchQuery('');
      expect(result.gameId).toBe(null);
      expect(result.searchTerm).toBe('');
    });

    it('should preserve original query', () => {
      const result = parseSearchQuery('valorant NightHawk');
      expect(result.original).toBe('valorant NightHawk');
    });

    it('should handle case-insensitive matching', () => {
      const result = parseSearchQuery('VALORANT TEAMS');
      expect(result.gameId).toBe('valorant');
      expect(result.entityType).toBe('team');
    });
  });

  describe('confidence scoring', () => {
    it('should have higher confidence for complete queries', () => {
      const result1 = parseSearchQuery('valorant');
      const result2 = parseSearchQuery('valorant teams NeoStrike');
      expect(result2.confidence).toBeGreaterThan(result1.confidence);
    });

    it('should have non-zero confidence for valid queries', () => {
      const result = parseSearchQuery('NightHawk');
      expect(result.confidence).toBeGreaterThan(0);
    });
  });
});

describe('helper functions', () => {
  describe('getSupportedGameIds', () => {
    it('should return all supported game IDs', () => {
      const ids = getSupportedGameIds();
      expect(ids).toContain('cs2');
      expect(ids).toContain('valorant');
      expect(ids).toContain('lol');
      expect(ids.length).toBeGreaterThan(5);
    });
  });

  describe('isValidGameId', () => {
    it('should return true for valid game IDs', () => {
      expect(isValidGameId('cs2')).toBe(true);
      expect(isValidGameId('valorant')).toBe(true);
    });

    it('should return false for invalid game IDs', () => {
      expect(isValidGameId('invalid')).toBe(false);
      expect(isValidGameId('')).toBe(false);
    });
  });

  describe('suggestGames', () => {
    it('should suggest games based on partial input', () => {
      const suggestions = suggestGames('val');
      expect(suggestions).toContain('valorant');
    });

    it('should return empty array for empty input', () => {
      expect(suggestGames('')).toEqual([]);
    });

    it('should match against display names', () => {
      const suggestions = suggestGames('counter');
      expect(suggestions).toContain('cs2');
    });
  });
});

describe('GAME_DISPLAY_CONFIG', () => {
  it('should have config for all supported games', () => {
    const gameIds = getSupportedGameIds();
    for (const id of gameIds) {
      expect(GAME_DISPLAY_CONFIG[id]).toBeDefined();
      expect(GAME_DISPLAY_CONFIG[id].name).toBeDefined();
      expect(GAME_DISPLAY_CONFIG[id].shortName).toBeDefined();
      expect(GAME_DISPLAY_CONFIG[id].icon).toBeDefined();
      expect(GAME_DISPLAY_CONFIG[id].color).toBeDefined();
    }
  });
});

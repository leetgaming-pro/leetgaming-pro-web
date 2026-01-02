/**
 * Global Search Hook
 * Unified search across all entities: Replays, Players, Teams, Matches
 *
 * Features:
 * - Intelligent game detection from query (e.g., "valorant" filters to Valorant entities)
 * - Entity type filtering (e.g., "teams", "players")
 * - Parallel search execution with proper error handling
 * - Resource visibility and ownership respect
 */

import { useState, useCallback, useRef } from 'react';
import { useSDK } from '@/contexts/sdk-context';
import { logger } from '@/lib/logger';
import { ReplayFile } from '@/types/replay-api/replay-file';
import {
  parseSearchQuery,
  ParsedSearchQuery,
  GAME_DISPLAY_CONFIG,
} from '@/lib/search/query-parser';
import type { GameId } from '@/types/games';

// Re-export for convenience
export type { ParsedSearchQuery } from '@/lib/search/query-parser';

export interface GlobalSearchResult {
  type: 'replay' | 'player' | 'team' | 'match';
  id: string;
  title: string;
  description: string;
  href: string;
  gameId?: string;
  gameDisplay?: {
    name: string;
    shortName: string;
    icon: string;
    color: string;
  };
  metadata?: Record<string, unknown>;
}

export interface UseGlobalSearchResult {
  results: GlobalSearchResult[];
  loading: boolean;
  error: string | null;
  parsedQuery: ParsedSearchQuery | null;
  search: (query: string) => Promise<void>;
  clear: () => void;
}

/**
 * Transform replay files to search results
 */
function transformReplays(replays: ReplayFile[]): GlobalSearchResult[] {
  return replays.map((replay) => {
    const gameId = replay.gameId as GameId;
    const gameDisplay = GAME_DISPLAY_CONFIG[gameId] || null;

    return {
      type: 'replay' as const,
      id: replay.id,
      title: replay.networkId
        ? `${gameDisplay?.shortName || replay.gameId?.toUpperCase()} • ${replay.networkId}`
        : `Replay ${replay.id.substring(0, 8)}`,
      description: `${replay.status || 'Processing'} • ${new Date(replay.createdAt).toLocaleDateString()}`,
      href: `/match/${replay.id}`,
      gameId: replay.gameId,
      gameDisplay: gameDisplay || undefined,
      metadata: {
        gameId: replay.gameId,
        networkId: replay.networkId,
        status: replay.status,
        createdAt: replay.createdAt,
      },
    };
  });
}

interface PlayerSearchItem {
  id?: string;
  user_id?: string;
  steam_name?: string;
  username?: string;
  nickname?: string;
  steam_id?: string;
  game_id?: string;
  profiles?: unknown[];
  roles?: string[];
  rating?: number;
  description?: string;
  looking_for_team?: boolean;
}

/**
 * Transform player profiles to search results
 */
function transformPlayers(players: PlayerSearchItem[]): GlobalSearchResult[] {
  return players.map((player) => {
    const gameId = player.game_id as GameId;
    const gameDisplay = gameId ? GAME_DISPLAY_CONFIG[gameId] : null;
    const displayName = player.nickname || player.steam_name || player.username || 'Unknown Player';

    // Build description parts
    const descParts: string[] = [];
    if (player.roles?.length) {
      descParts.push(player.roles.slice(0, 2).join(', '));
    }
    if (player.rating) {
      descParts.push(`${player.rating} Rating`);
    }
    if (player.looking_for_team) {
      descParts.push('🔍 LFT');
    }
    if (descParts.length === 0) {
      descParts.push(player.description?.substring(0, 50) || 'Player Profile');
    }

    return {
      type: 'player' as const,
      id: player.id || player.user_id || '',
      title: displayName,
      description: descParts.join(' • '),
      href: `/players/${player.id || player.user_id}`,
      gameId: player.game_id,
      gameDisplay: gameDisplay || undefined,
      metadata: {
        steamId: player.steam_id,
        profiles: player.profiles,
        roles: player.roles,
        rating: player.rating,
        lookingForTeam: player.looking_for_team,
      },
    };
  });
}

import { Squad, SquadMembership } from '@/types/replay-api/entities.types';

/**
 * Transform squads/teams to search results
 */
function transformTeams(teams: Squad[]): GlobalSearchResult[] {
  return teams.map((team) => {
    const gameId = team.game_id as GameId;
    const gameDisplay = gameId ? GAME_DISPLAY_CONFIG[gameId] : null;

    // Get membership info
    const memberCount = team.membership?.length || 0;
    const maxMembers = 5; // Standard team size

    // Build description
    const descParts: string[] = [];
    descParts.push(`${memberCount}/${maxMembers} members`);
    if (team.symbol) {
      descParts.push(`[${team.symbol}]`);
    }
    if (team.rating) {
      descParts.push(`${team.rating} Rating`);
    }

    return {
      type: 'team' as const,
      id: team.id,
      title: team.name || 'Unnamed Team',
      description: descParts.join(' • '),
      href: `/teams/${team.id}`,
      gameId: team.game_id,
      gameDisplay: gameDisplay || undefined,
      metadata: {
        membership: team.membership,
        memberCount,
        symbol: team.symbol,
        rating: team.rating,
        createdAt: team.created_at,
      },
    };
  });
}

interface MatchSearchItem {
  id?: string;
  match_id?: string;
  title?: string;
  game_id?: string;
  status?: string;
  played_at?: string;
  mode?: string;
  map?: string;
}

/**
 * Transform matches to search results
 */
function transformMatches(matches: MatchSearchItem[]): GlobalSearchResult[] {
  return matches.map((match) => {
    const gameId = (match.game_id || 'cs2') as GameId;
    const gameDisplay = GAME_DISPLAY_CONFIG[gameId] || null;

    // Build description
    const descParts: string[] = [];
    if (match.map) {
      descParts.push(match.map);
    }
    if (match.mode) {
      descParts.push(match.mode);
    }
    descParts.push(match.status || 'Completed');
    if (match.played_at) {
      descParts.push(new Date(match.played_at).toLocaleDateString());
    }

    return {
      type: 'match' as const,
      id: match.id || match.match_id || '',
      title: match.title || `Match ${match.id?.substring(0, 8) || 'Unknown'}`,
      description: descParts.join(' • '),
      href: `/match/${match.id || match.match_id}`,
      gameId: match.game_id || 'cs2',
      gameDisplay: gameDisplay || undefined,
      metadata: {
        gameId: match.game_id,
        status: match.status,
        playedAt: match.played_at,
        map: match.map,
        mode: match.mode,
      },
    };
  });
}

/**
 * Global search hook with intelligent game detection
 */
export function useGlobalSearch(): UseGlobalSearchResult {
  const { sdk } = useSDK();
  const [results, setResults] = useState<GlobalSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [parsedQuery, setParsedQuery] = useState<ParsedSearchQuery | null>(null);

  const abortRef = useRef<AbortController | null>(null);

  const search = useCallback(async (query: string) => {
    if (!query || query.trim().length < 2) {
      setResults([]);
      setParsedQuery(null);
      return;
    }

    // Parse the query for intelligent filtering
    const parsed = parseSearchQuery(query);
    setParsedQuery(parsed);

    setLoading(true);
    setError(null);

    try {
      // Abort previous in-flight requests
      if (abortRef.current) {
        abortRef.current.abort();
      }
      const controller = new AbortController();
      abortRef.current = controller;

      const allResults: GlobalSearchResult[] = [];

      // Determine which searches to execute based on entity type filter
      const shouldSearchReplays = !parsed.entityType || parsed.entityType === 'replay';
      const shouldSearchPlayers = !parsed.entityType || parsed.entityType === 'player';
      const shouldSearchTeams = !parsed.entityType || parsed.entityType === 'team';
      const shouldSearchMatches = !parsed.entityType || parsed.entityType === 'match';

      // Use parsed search term (game/entity keywords removed) or full query
      const searchTerm = parsed.searchTerm || parsed.original;

      // Build search promises with game filtering
      const searchPromises: Promise<void>[] = [];

      // Search replays with game filter
      if (shouldSearchReplays) {
        const replayPromise = (async () => {
          try {
            const replays = await sdk.replayFiles.searchReplayFiles({
              search_term: searchTerm.length >= 2 ? searchTerm : undefined,
              game_id: parsed.gameId || undefined,
              limit: 5,
            });
            if (replays?.length) {
              allResults.push(...transformReplays(replays.slice(0, 5)));
            }
          } catch (err) {
            logger.warn('Replay search failed:', err);
          }
        })();
        searchPromises.push(replayPromise);
      }

      // Search players with game filter
      if (shouldSearchPlayers) {
        const playerPromise = (async () => {
          try {
            const players = await sdk.playerProfiles.searchPlayerProfiles({
              nickname: searchTerm.length >= 2 ? searchTerm : undefined,
              game_id: parsed.gameId || undefined,
              limit: 5,
            });
            if (players?.length) {
              allResults.push(...transformPlayers(players.slice(0, 5)));
            }
          } catch (err) {
            logger.warn('Player search failed:', err);
          }
        })();
        searchPromises.push(playerPromise);
      }

      // Search teams/squads with game filter
      if (shouldSearchTeams) {
        const teamPromise = (async () => {
          try {
            const teams = await sdk.squads.searchSquads({
              name: searchTerm.length >= 2 ? searchTerm : undefined,
              game_id: parsed.gameId || undefined,
              limit: 5,
            });
            if (teams?.length) {
              allResults.push(...transformTeams(teams.slice(0, 5)));
            }
          } catch (err) {
            logger.warn('Team search failed:', err);
          }
        })();
        searchPromises.push(teamPromise);
      }

      // Search matches - always filter by game if specified
      if (shouldSearchMatches) {
        const gameToSearch = parsed.gameId || 'cs2';
        const matchPromise = (async () => {
          try {
            const matches = await sdk.matches.searchMatches(gameToSearch, {
              search_term: searchTerm.length >= 2 ? searchTerm : undefined,
              limit: 5,
            });
            if (matches?.length) {
              allResults.push(...transformMatches(matches.slice(0, 5)));
            }
          } catch (err) {
            logger.warn('Match search failed:', err);
          }
        })();
        searchPromises.push(matchPromise);

        // If filtering by a specific game other than cs2, also search that game's matches
        if (parsed.gameId && parsed.gameId !== 'cs2') {
          // Already searching the specific game above
        } else if (!parsed.gameId) {
          // Search multiple games for broader results
          const otherGames: GameId[] = ['valorant', 'apex', 'lol'];
          for (const game of otherGames) {
            const otherMatchPromise = (async () => {
              try {
                const matches = await sdk.matches.searchMatches(game, {
                  search_term: searchTerm.length >= 2 ? searchTerm : undefined,
                  limit: 2,
                });
                if (matches?.length) {
                  allResults.push(...transformMatches(matches.slice(0, 2)));
                }
              } catch {
                // Silently fail for other games - they may not have data
              }
            })();
            searchPromises.push(otherMatchPromise);
          }
        }
      }

      // Execute all searches in parallel
      await Promise.all(searchPromises);

      // Sort results by relevance (exact title matches first)
      const normalizedSearch = searchTerm.toLowerCase();
      allResults.sort((a, b) => {
        const aTitle = a.title.toLowerCase();
        const bTitle = b.title.toLowerCase();

        // Exact matches first
        if (aTitle === normalizedSearch && bTitle !== normalizedSearch) return -1;
        if (bTitle === normalizedSearch && aTitle !== normalizedSearch) return 1;

        // Starts with search term
        if (aTitle.startsWith(normalizedSearch) && !bTitle.startsWith(normalizedSearch)) return -1;
        if (bTitle.startsWith(normalizedSearch) && !aTitle.startsWith(normalizedSearch)) return 1;

        // Game filter match boost
        if (parsed.gameId) {
          const aGameMatch = a.gameId === parsed.gameId;
          const bGameMatch = b.gameId === parsed.gameId;
          if (aGameMatch && !bGameMatch) return -1;
          if (bGameMatch && !aGameMatch) return 1;
        }

        return 0;
      });

      setResults(allResults);
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') {
        logger.warn('Global search aborted');
        return;
      }
      const message = err instanceof Error ? err.message : 'Search failed';
      logger.error('Global search error:', { error: message });
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [sdk]);

  const clear = useCallback(() => {
    setResults([]);
    setError(null);
    setParsedQuery(null);
    if (abortRef.current) {
      abortRef.current.abort();
    }
  }, []);

  return {
    results,
    loading,
    error,
    parsedQuery,
    search,
    clear,
  };
}

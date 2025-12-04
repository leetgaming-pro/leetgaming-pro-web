/**
 * Global Search Hook
 * Unified search across all entities: Replays, Players, Teams, Matches
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { ReplayAPISDK } from '@/types/replay-api/sdk';
import { ReplayApiSettingsMock } from '@/types/replay-api/settings';
import { logger } from '@/lib/logger';
import { ReplayFile } from '@/types/replay-api/replay-file';

export interface GlobalSearchResult {
  type: 'replay' | 'player' | 'team' | 'match';
  id: string;
  title: string;
  description: string;
  href: string;
  metadata?: any;
}

export interface UseGlobalSearchResult {
  results: GlobalSearchResult[];
  loading: boolean;
  error: string | null;
  search: (query: string) => Promise<void>;
  clear: () => void;
}

// Initialize SDK with real API base URL (no mock)
const baseUrl = process.env.NEXT_PUBLIC_REPLAY_API_URL || process.env.REPLAY_API_URL || 'http://localhost:8080';
const sdk = new ReplayAPISDK({ ...ReplayApiSettingsMock, baseUrl }, logger);

/**
 * Transform replay files to search results
 */
function transformReplays(replays: ReplayFile[]): GlobalSearchResult[] {
  return replays.map((replay) => ({
    type: 'replay' as const,
    id: replay.id,
    title: `Replay: ${replay.networkId} - ${replay.gameId}`,
    description: `Uploaded ${new Date(replay.createdAt).toLocaleDateString()} • ${replay.status}`,
    href: `/match/${replay.id}`,
    metadata: {
      gameId: replay.gameId,
      networkId: replay.networkId,
      status: replay.status,
      createdAt: replay.createdAt,
    },
  }));
}

/**
 * Transform player profiles to search results
 */
function transformPlayers(players: any[]): GlobalSearchResult[] {
  return players.map((player) => ({
    type: 'player' as const,
    id: player.id || player.user_id,
    title: player.steam_name || player.username || 'Unknown Player',
    description: `Steam ID: ${player.steam_id || 'N/A'} • ${player.profiles?.length || 0} profiles`,
    href: `/players/${player.id || player.user_id}`,
    metadata: {
      steamId: player.steam_id,
      profiles: player.profiles,
    },
  }));
}

/**
 * Transform squads/teams to search results
 */
function transformTeams(teams: any[]): GlobalSearchResult[] {
  return teams.map((team) => ({
    type: 'team' as const,
    id: team.id,
    title: team.name || 'Unnamed Team',
    description: `${team.members?.length || 0} members • Created ${new Date(team.created_at).toLocaleDateString()}`,
    href: `/teams/${team.id}`,
    metadata: {
      members: team.members,
      createdAt: team.created_at,
    },
  }));
}

/**
 * Transform matches to search results
 */
function transformMatches(matches: any[]): GlobalSearchResult[] {
  return matches.map((match) => ({
    type: 'match' as const,
    id: match.id || match.match_id,
    title: match.title || `Match ${match.id?.substring(0, 8) || 'Unknown'}`,
    description: `${match.game_id?.toUpperCase() || 'CS2'} • ${match.status || 'Completed'} • ${match.played_at ? new Date(match.played_at).toLocaleDateString() : 'N/A'}`,
    href: `/match/${match.id || match.match_id}`,
    metadata: {
      gameId: match.game_id,
      status: match.status,
      playedAt: match.played_at,
    },
  }));
}

/**
 * Global search hook
 */
export function useGlobalSearch(): UseGlobalSearchResult {
  const [results, setResults] = useState<GlobalSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const abortRef = useRef<AbortController | null>(null);
  const search = useCallback(async (query: string) => {
    if (!query || query.trim().length < 2) {
      setResults([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const searchTerm = query.trim();
      const allResults: GlobalSearchResult[] = [];

      // Abort previous in-flight requests
      if (abortRef.current) {
        abortRef.current.abort();
      }
      const controller = new AbortController();
      abortRef.current = controller;

      const commonFetchInit: RequestInit = { signal: controller.signal };

      // Execute all searches in parallel for better performance
      const [replaysResult, playersResult, squadsResult, matchesResult] = await Promise.allSettled([
        sdk.replayFiles.searchReplayFiles({ search_term: searchTerm }),
        sdk.playerProfiles.searchPlayerProfiles({ nickname: searchTerm }),
        sdk.squads.searchSquads({ name: searchTerm }),
        sdk.matches.searchMatches('cs2', { search_term: searchTerm }),
      ]);

      // Process replays
      if (replaysResult.status === 'fulfilled' && replaysResult.value?.length > 0) {
        allResults.push(...transformReplays((replaysResult.value as ReplayFile[]).slice(0, 5)));
      } else if (replaysResult.status === 'rejected') {
        logger.warn('Replay search failed:', replaysResult.reason);
      }

      // Process players
      if (playersResult.status === 'fulfilled' && playersResult.value?.length > 0) {
        allResults.push(...transformPlayers(playersResult.value.slice(0, 5)));
      } else if (playersResult.status === 'rejected') {
        logger.warn('Player search failed:', playersResult.reason);
      }

      // Process teams/squads
      if (squadsResult.status === 'fulfilled' && squadsResult.value?.length > 0) {
        allResults.push(...transformTeams(squadsResult.value.slice(0, 5)));
      } else if (squadsResult.status === 'rejected') {
        logger.warn('Team search failed:', squadsResult.reason);
      }

      // Process matches
      if (matchesResult.status === 'fulfilled' && matchesResult.value?.length > 0) {
        allResults.push(...transformMatches(matchesResult.value.slice(0, 5)));
      } else if (matchesResult.status === 'rejected') {
        logger.warn('Match search failed:', matchesResult.reason);
      }

      setResults(allResults);
    } catch (err: any) {
      if (err?.name === 'AbortError') {
        logger.warn('Global search aborted');
        return; // Ignore aborted requests
      }
      logger.error('Global search error:', err);
      setError(err.message || 'Search failed');
    } finally {
      setLoading(false);
    }
  }, []);

  const clear = useCallback(() => {
    setResults([]);
    setError(null);
    if (abortRef.current) {
      abortRef.current.abort();
    }
  }, []);

  return {
    results,
    loading,
    error,
    search,
    clear,
  };
}

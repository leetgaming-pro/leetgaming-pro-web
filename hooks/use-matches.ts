/**
 * useMatches Hook
 * Fetches match data from the API with SWR for caching and revalidation
 */

import useSWR from 'swr';

export interface Match {
  id: string;
  game: string;
  gameIcon: string;
  map: string;
  mode: string;
  teams: {
    name: string;
    score: number;
    players: { name: string; avatar?: string }[];
  }[];
  status: 'live' | 'completed' | 'upcoming';
  timestamp: Date;
  duration?: string;
  tournament?: string;
}

interface MatchesResponse {
  data: Match[];
  total: number;
  limit: number;
  offset: number;
  next_offset: number | null;
}

interface UseMatchesParams {
  status?: string;
  game?: string;
  limit?: number;
  offset?: number;
  playerId?: string;
}

const fetcher = async (url: string): Promise<MatchesResponse> => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch matches');
  }
  const data = await response.json();
  
  // Convert timestamp strings to Date objects
  return {
    ...data,
    data: data.data.map((match: Match & { timestamp: string | Date }) => ({
      ...match,
      timestamp: new Date(match.timestamp),
    })),
  };
};

export function useMatches(params: UseMatchesParams = {}) {
  const { status = 'all', game = 'all', limit = 20, offset = 0, playerId } = params;
  
  // Build query string
  const queryParams = new URLSearchParams();
  if (status !== 'all') queryParams.append('status', status);
  if (game !== 'all') queryParams.append('game', game);
  queryParams.append('limit', limit.toString());
  queryParams.append('offset', offset.toString());
  if (playerId) queryParams.append('player_id', playerId);
  
  const url = `/api/matches?${queryParams.toString()}`;
  
  const { data, error, isLoading, mutate } = useSWR<MatchesResponse>(url, fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    refreshInterval: status === 'live' ? 10000 : 0, // Refresh live matches every 10 seconds
  });
  
  return {
    matches: data?.data || [],
    total: data?.total || 0,
    limit: data?.limit || limit,
    offset: data?.offset || offset,
    nextOffset: data?.next_offset,
    isLoading,
    isError: !!error,
    error,
    refresh: mutate,
  };
}

export function usePlayerMatches(playerId: string, limit = 20, offset = 0) {
  return useMatches({ playerId, limit, offset });
}

export function useLiveMatches() {
  return useMatches({ status: 'live' });
}

export function useUpcomingMatches(limit = 10) {
  return useMatches({ status: 'upcoming', limit });
}


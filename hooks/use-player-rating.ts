/**
 * usePlayerRating Hook
 * Fetches player rating and leaderboard data from the API
 */

import useSWR from 'swr';

export interface PlayerRating {
  player_id: string;
  game_id: string;
  rating: number;
  rating_deviation: number;
  volatility: number;
  rank: string;
  wins: number;
  losses: number;
  draws: number;
  games_played: number;
  streak: number;
  max_rating: number;
  is_provisional: boolean;
  last_played_at: string;
  confidence_interval: {
    lower: number;
    upper: number;
  };
}

export interface LeaderboardEntry {
  position: number;
  player_id: string;
  display_name: string;
  avatar?: string;
  rating: number;
  rank: string;
  wins: number;
  losses: number;
  games_played: number;
  win_rate: number;
}

export interface RankDistribution {
  rank: string;
  count: number;
  percentage: number;
}

interface LeaderboardResponse {
  data: LeaderboardEntry[];
  total: number;
  game_id: string;
}

const fetcher = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch');
  }
  return response.json();
};

export function usePlayerRating(playerId: string, gameId = 'cs2') {
  const { data, error, isLoading, mutate } = useSWR<PlayerRating>(
    playerId ? `/api/players/${playerId}/rating?game_id=${gameId}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
    }
  );

  return {
    rating: data,
    isLoading,
    isError: !!error,
    error,
    refresh: mutate,
  };
}

export function useLeaderboard(gameId = 'cs2', limit = 100, offset = 0) {
  const url = `/api/leaderboard?game_id=${gameId}&limit=${limit}&offset=${offset}`;
  
  const { data, error, isLoading, mutate } = useSWR<LeaderboardResponse>(
    url,
    fetcher,
    {
      revalidateOnFocus: false,
      refreshInterval: 60000, // Refresh every minute
    }
  );

  return {
    leaderboard: data?.data || [],
    total: data?.total || 0,
    gameId: data?.game_id || gameId,
    isLoading,
    isError: !!error,
    error,
    refresh: mutate,
  };
}

export function useRankDistribution(gameId = 'cs2') {
  const url = `/api/ranks/distribution?game_id=${gameId}`;
  
  const { data, error, isLoading, mutate } = useSWR<RankDistribution[]>(
    url,
    fetcher,
    {
      revalidateOnFocus: false,
      refreshInterval: 300000, // Refresh every 5 minutes
    }
  );

  return {
    distribution: data || [],
    isLoading,
    isError: !!error,
    error,
    refresh: mutate,
  };
}

// Rank display helpers
export const rankColors: Record<string, string> = {
  Unranked: 'default',
  Bronze: 'warning',
  Silver: 'default',
  Gold: 'warning',
  Platinum: 'primary',
  Diamond: 'secondary',
  Master: 'danger',
  Grandmaster: 'danger',
  Challenger: 'success',
};

export const rankIcons: Record<string, string> = {
  Unranked: 'solar:question-circle-bold',
  Bronze: 'solar:medal-ribbons-star-bold',
  Silver: 'solar:medal-ribbons-star-bold',
  Gold: 'solar:medal-ribbons-star-bold',
  Platinum: 'solar:crown-minimalistic-bold',
  Diamond: 'solar:crown-bold',
  Master: 'solar:crown-star-bold',
  Grandmaster: 'solar:fire-bold',
  Challenger: 'solar:fire-square-bold',
};


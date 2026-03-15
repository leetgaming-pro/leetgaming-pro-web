/**
 * useUpcomingGames Hook
 * Fetches and manages upcoming/live game events from lobbies
 * Auto-refreshes every 15 seconds for live data
 */

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type { MatchmakingLobby } from '@/types/replay-api/lobby.types';
import type { UpcomingGameEvent } from '@/types/replay-api/upcoming-games.types';
import { lobbyToGameEvent } from '@/types/replay-api/upcoming-games.types';

interface UseUpcomingGamesOptions {
  /** Maximum number of events to display */
  limit?: number;
  /** Auto-refresh interval in ms (default: 15000) */
  refreshInterval?: number;
  /** Game filter */
  gameId?: string;
  /** Whether to include live (started) lobbies */
  includeLive?: boolean;
  /** Whether to auto-fetch on mount */
  autoFetch?: boolean;
}

interface UseUpcomingGamesReturn {
  events: UpcomingGameEvent[];
  liveEvents: UpcomingGameEvent[];
  upcomingEvents: UpcomingGameEvent[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  stats: {
    totalPlayers: number;
    liveGames: number;
    openLobbies: number;
  };
}

export function useUpcomingGames(options: UseUpcomingGamesOptions = {}): UseUpcomingGamesReturn {
  const {
    limit = 12,
    refreshInterval = 15000,
    gameId,
    includeLive = true,
    autoFetch = true,
  } = options;

  const [events, setEvents] = useState<UpcomingGameEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchEvents = useCallback(async () => {
    try {
      // Fetch open/active lobbies
      const params = new URLSearchParams();
      if (gameId) params.append('game_id', gameId);
      params.append('limit', limit.toString());

      const url = `/api/match-making/lobbies/featured?${params.toString()}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.status}`);
      }

      const result = await response.json();
      const lobbies: MatchmakingLobby[] = result?.lobbies || [];

      // Convert lobbies to game events
      const gameEvents = lobbies
        .filter((lobby) => {
          // Include open, ready_check, starting, and optionally started
          const validStatuses = ['open', 'ready_check', 'starting'];
          if (includeLive) validStatuses.push('started');
          return validStatuses.includes(lobby.status);
        })
        .map((lobby) => lobbyToGameEvent(lobby))
        .sort((a, b) => {
          // Sort: live first, then starting_soon, then by start time
          const statusOrder: Record<string, number> = {
            live: 0,
            starting_soon: 1,
            filling: 2,
            open: 3,
            scheduled: 4,
            completed: 5,
          };
          const aOrder = statusOrder[a.status] ?? 3;
          const bOrder = statusOrder[b.status] ?? 3;
          if (aOrder !== bOrder) return aOrder - bOrder;

          // Within same status, sort by start time
          if (a.starts_at && b.starts_at) {
            return new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime();
          }
          return 0;
        });

      setEvents(gameEvents);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch upcoming games:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch');
    } finally {
      setLoading(false);
    }
  }, [gameId, limit, includeLive]);

  // Auto-fetch on mount
  useEffect(() => {
    if (autoFetch) {
      fetchEvents();
    }
  }, [autoFetch, fetchEvents]);

  // Auto-refresh interval
  useEffect(() => {
    if (refreshInterval > 0) {
      intervalRef.current = setInterval(fetchEvents, refreshInterval);
      return () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
      };
    }
    return undefined;
  }, [refreshInterval, fetchEvents]);

  // Derived data
  const liveEvents = events.filter((e) => e.status === 'live');
  const upcomingEvents = events.filter((e) => e.status !== 'live' && e.status !== 'completed');

  const stats = {
    totalPlayers: events.reduce((sum, e) => sum + e.current_players, 0),
    liveGames: liveEvents.length,
    openLobbies: upcomingEvents.length,
  };

  return {
    events,
    liveEvents,
    upcomingEvents,
    loading,
    error,
    refresh: fetchEvents,
    stats,
  };
}

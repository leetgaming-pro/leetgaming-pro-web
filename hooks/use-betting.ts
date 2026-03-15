/**
 * useBetting Hook
 * React hook for placing bets and viewing bet history
 */

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSDK } from '@/contexts/sdk-context';
import type {
  Bet,
  BetStatus,
  UserBetSummary,
  BetLeaderboardEntry,
  PlaceBetRequest,
} from '@/types/replay-api/prediction.types';

export interface UseBettingResult {
  // User bets
  userBets: Bet[];
  userBetsTotalCount: number;
  isLoadingBets: boolean;
  betsError: string | null;

  // Bet summary for a specific market
  summary: UserBetSummary | null;
  isLoadingSummary: boolean;

  // Leaderboard
  leaderboard: BetLeaderboardEntry[];
  isLoadingLeaderboard: boolean;

  // Actions
  placeBet: (marketId: string, optionKey: string, amount: number) => Promise<Bet | null>;
  isPlacingBet: boolean;

  fetchUserBets: (status?: BetStatus) => Promise<void>;
  fetchSummary: (marketId: string) => Promise<void>;
  fetchLeaderboard: (limit?: number) => Promise<void>;
}

export function useBetting(): UseBettingResult {
  const { sdk } = useSDK();

  const [userBets, setUserBets] = useState<Bet[]>([]);
  const [userBetsTotalCount, setUserBetsTotalCount] = useState(0);
  const [isLoadingBets, setIsLoadingBets] = useState(false);
  const [betsError, setBetsError] = useState<string | null>(null);

  const [summary, setSummary] = useState<UserBetSummary | null>(null);
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);

  const [leaderboard, setLeaderboard] = useState<BetLeaderboardEntry[]>([]);
  const [isLoadingLeaderboard, setIsLoadingLeaderboard] = useState(false);

  const [isPlacingBet, setIsPlacingBet] = useState(false);

  const mountedRef = useRef(true);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const placeBet = useCallback(
    async (marketId: string, optionKey: string, amount: number): Promise<Bet | null> => {
      if (!sdk) return null;

      setIsPlacingBet(true);
      try {
        const req: PlaceBetRequest = { option_key: optionKey, amount };
        const bet = await sdk.predictions.placeBet(marketId, req);
        return bet;
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Failed to place bet';
        throw new Error(msg);
      } finally {
        if (mountedRef.current) {
          setIsPlacingBet(false);
        }
      }
    },
    [sdk],
  );

  const fetchUserBets = useCallback(
    async (status?: BetStatus) => {
      if (!sdk) return;

      setIsLoadingBets(true);
      setBetsError(null);

      try {
        const result = await sdk.predictions.getUserBets({ status, limit: 50 });
        if (mountedRef.current && result) {
          setUserBets(result.bets || []);
          setUserBetsTotalCount(result.total_count);
        }
      } catch (err) {
        if (mountedRef.current) {
          setBetsError(err instanceof Error ? err.message : 'Failed to load bets');
        }
      } finally {
        if (mountedRef.current) {
          setIsLoadingBets(false);
        }
      }
    },
    [sdk],
  );

  const fetchSummary = useCallback(
    async (marketId: string) => {
      if (!sdk) return;

      setIsLoadingSummary(true);

      try {
        const result = await sdk.predictions.getUserBetSummary(marketId);
        if (mountedRef.current) {
          setSummary(result);
        }
      } catch {
        // Non-critical, ignore
      } finally {
        if (mountedRef.current) {
          setIsLoadingSummary(false);
        }
      }
    },
    [sdk],
  );

  const fetchLeaderboard = useCallback(
    async (limit?: number) => {
      if (!sdk) return;

      setIsLoadingLeaderboard(true);

      try {
        const result = await sdk.predictions.getLeaderboard(limit);
        if (mountedRef.current && result) {
          setLeaderboard(result.entries || []);
        }
      } catch {
        // Non-critical, ignore
      } finally {
        if (mountedRef.current) {
          setIsLoadingLeaderboard(false);
        }
      }
    },
    [sdk],
  );

  return {
    userBets,
    userBetsTotalCount,
    isLoadingBets,
    betsError,
    summary,
    isLoadingSummary,
    leaderboard,
    isLoadingLeaderboard,
    placeBet,
    isPlacingBet,
    fetchUserBets,
    fetchSummary,
    fetchLeaderboard,
  };
}

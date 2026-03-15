/**
 * Player Performance Trends SDK
 * API wrapper for fetching player performance history and computing
 * time-series data for charts.
 *
 * Currently aggregates data from match results since there's no
 * dedicated performance-history backend endpoint yet. When the
 * backend endpoint `/players/{id}/performance-history` is built,
 * this will simply forward to it.
 */

import { ReplayApiClient } from "./replay-api.client";
import type { PerformanceDataPoint } from "@/components/analytics/PerformanceTrendsChart";
import type { SkillDimension } from "@/components/analytics/SkillRadarChart";
import { computeSkillDimensions } from "@/components/analytics/SkillRadarChart";
import type { OpponentData } from "@/components/analytics/OpponentScoutingCard";

// ── Types ──────────────────────────────────────────────

export interface PerformanceTrendsRequest {
  playerId: string;
  gameId?: string;
  limit?: number;
  period?: "7d" | "30d" | "90d" | "all";
}

export interface PerformanceTrendsResponse {
  playerId: string;
  dataPoints: PerformanceDataPoint[];
  skills: SkillDimension[];
  opponents: OpponentData[];
  summary: {
    matchesPlayed: number;
    avgRating: number;
    avgAdr: number;
    avgKast: number;
    avgHsPercent: number;
    winRate: number;
    ratingTrend: "up" | "down" | "stable";
    bestMap: string;
    worstMap: string;
  };
}

// ── SDK Class ──────────────────────────────────────────

export class PlayerPerformanceAPI {
  constructor(private client: ReplayApiClient) {}

  /**
   * Get performance trends for a player.
   * First attempts the dedicated endpoint; if 404, falls back
   * to aggregating from match results.
   */
  async getPerformanceTrends(
    req: PerformanceTrendsRequest
  ): Promise<PerformanceTrendsResponse | null> {
    const gameId = req.gameId || "cs2";
    const limit = req.limit || 20;

    // Try dedicated backend endpoint first
    try {
      const params = new URLSearchParams();
      params.set("game_id", gameId);
      params.set("limit", String(limit));
      if (req.period) params.set("period", req.period);

      const response = await this.client.get<PerformanceTrendsResponse>(
        `/players/${req.playerId}/performance-history?${params.toString()}`
      );

      if (response.data) {
        return response.data;
      }
    } catch {
      // Endpoint not available yet, fall back to client-side aggregation
    }

    // Fallback: aggregate from match results list via scores API
    return this.aggregateFromMatches(req.playerId, gameId, limit);
  }

  /**
   * Client-side aggregation fallback: fetch recent match results
   * and compute performance data points.
   */
  private async aggregateFromMatches(
    playerId: string,
    gameId: string,
    limit: number
  ): Promise<PerformanceTrendsResponse> {
    // Try to get match results from the scores endpoint
    let matchResults: MatchResultLite[] = [];
    try {
      const response = await this.client.get<MatchResultLite[]>(
        `/scores/match-results?player_id=${playerId}&game_id=${gameId}&limit=${limit}&sort=played_at&order=desc`
      );
      matchResults = response.data || [];
    } catch {
      // If scores endpoint fails, try matches endpoint
      try {
        const response = await this.client.get<MatchResultLite[]>(
          `/games/${gameId}/matches?player_id=${playerId}&limit=${limit}`
        );
        matchResults = response.data || [];
      } catch {
        // No data available
      }
    }

    // Process match results into performance data points
    const dataPoints: PerformanceDataPoint[] = matchResults
      .reverse()
      .map((match, idx) => {
        const playerResult = match.player_results?.find(
          (p) => p.player_id === playerId
        );

        return {
          matchIndex: idx + 1,
          matchLabel: `Match ${idx + 1}`,
          date: match.played_at || match.created_at || new Date().toISOString(),
          mapName: match.map_name || "Unknown",
          result: this.getMatchResult(match, playerId),
          rating: playerResult?.rating || playerResult?.stats?.rating_2 || 0,
          adr: playerResult?.stats?.adr || 0,
          kast: playerResult?.stats?.kast || 0,
          hsPercent: playerResult?.stats?.headshot_pct || 0,
          kills: playerResult?.kills || playerResult?.stats?.kills || 0,
          deaths: playerResult?.deaths || playerResult?.stats?.deaths || 0,
          assists: playerResult?.assists || playerResult?.stats?.assists || 0,
          impactRating: playerResult?.stats?.impact_rating,
        };
      });

    // Compute skill dimensions from aggregated stats
    const avgStats = this.computeAverages(dataPoints);
    const halfIdx = Math.floor(dataPoints.length / 2);
    const recentHalf = dataPoints.slice(halfIdx);
    const olderHalf = dataPoints.slice(0, halfIdx);
    const recentAvg = this.computeAverages(recentHalf);
    const olderAvg = this.computeAverages(olderHalf);

    const skills = computeSkillDimensions({
      hsPercent: recentAvg.hsPercent,
      kast: recentAvg.kast,
      adr: recentAvg.adr,
      rating: recentAvg.rating,
      clutchWinRate: 0, // not available from match results
      entryWinRate: 0,
      utilityDamagePerRound: 0,
      econRating: 0,
      prevHsPercent: olderAvg.hsPercent,
      prevKast: olderAvg.kast,
      prevAdr: olderAvg.adr,
      prevRating: olderAvg.rating,
    });

    // Compute opponents from match data
    const opponents = this.extractOpponents(matchResults, playerId);

    // Build summary
    const wins = dataPoints.filter((d) => d.result === "win").length;
    const summary = {
      matchesPlayed: dataPoints.length,
      avgRating: avgStats.rating,
      avgAdr: avgStats.adr,
      avgKast: avgStats.kast,
      avgHsPercent: avgStats.hsPercent,
      winRate: dataPoints.length > 0 ? (wins / dataPoints.length) * 100 : 0,
      ratingTrend: this.computeTrend(dataPoints, "rating"),
      bestMap: this.getBestMap(dataPoints),
      worstMap: this.getWorstMap(dataPoints),
    };

    return {
      playerId,
      dataPoints,
      skills,
      opponents,
      summary,
    };
  }

  private getMatchResult(
    match: MatchResultLite,
    playerId: string
  ): "win" | "loss" | "draw" {
    if (match.is_draw) return "draw";

    const playerResult = match.player_results?.find(
      (p) => p.player_id === playerId
    );
    if (!playerResult) return "loss";

    if (match.winner_team_id && playerResult.team_id === match.winner_team_id) {
      return "win";
    }

    return "loss";
  }

  private computeAverages(points: PerformanceDataPoint[]): {
    rating: number;
    adr: number;
    kast: number;
    hsPercent: number;
  } {
    if (points.length === 0) {
      return { rating: 0, adr: 0, kast: 0, hsPercent: 0 };
    }
    const sum = points.reduce(
      (acc, p) => ({
        rating: acc.rating + p.rating,
        adr: acc.adr + p.adr,
        kast: acc.kast + p.kast,
        hsPercent: acc.hsPercent + p.hsPercent,
      }),
      { rating: 0, adr: 0, kast: 0, hsPercent: 0 }
    );
    return {
      rating: sum.rating / points.length,
      adr: sum.adr / points.length,
      kast: sum.kast / points.length,
      hsPercent: sum.hsPercent / points.length,
    };
  }

  private computeTrend(
    points: PerformanceDataPoint[],
    key: "rating" | "adr" | "kast" | "hsPercent"
  ): "up" | "down" | "stable" {
    if (points.length < 4) return "stable";
    const half = Math.floor(points.length / 2);
    const recent = points.slice(half);
    const older = points.slice(0, half);
    const recentAvg =
      recent.reduce((s, p) => s + p[key], 0) / recent.length;
    const olderAvg =
      older.reduce((s, p) => s + p[key], 0) / older.length;
    const diff = ((recentAvg - olderAvg) / (olderAvg || 1)) * 100;
    if (diff > 3) return "up";
    if (diff < -3) return "down";
    return "stable";
  }

  private getBestMap(points: PerformanceDataPoint[]): string {
    return this.getMapByWinRate(points, "best");
  }

  private getWorstMap(points: PerformanceDataPoint[]): string {
    return this.getMapByWinRate(points, "worst");
  }

  private getMapByWinRate(
    points: PerformanceDataPoint[],
    type: "best" | "worst"
  ): string {
    const mapStats: Record<string, { wins: number; total: number }> = {};
    for (const p of points) {
      if (!mapStats[p.mapName]) mapStats[p.mapName] = { wins: 0, total: 0 };
      mapStats[p.mapName].total++;
      if (p.result === "win") mapStats[p.mapName].wins++;
    }

    let result = "N/A";
    let bestWR = type === "best" ? -1 : 101;
    for (const [map, stats] of Object.entries(mapStats)) {
      if (stats.total < 2) continue;
      const wr = (stats.wins / stats.total) * 100;
      if (type === "best" && wr > bestWR) {
        bestWR = wr;
        result = map;
      } else if (type === "worst" && wr < bestWR) {
        bestWR = wr;
        result = map;
      }
    }
    return result;
  }

  private extractOpponents(
    matches: MatchResultLite[],
    playerId: string
  ): OpponentData[] {
    const opponentMap: Record<string, OpponentAccumulator> = {};

    for (const match of matches) {
      const playerResult = match.player_results?.find(
        (p) => p.player_id === playerId
      );
      if (!playerResult) continue;

      const playerTeamId = playerResult.team_id;
      const opponents =
        match.player_results?.filter((p) => p.team_id !== playerTeamId) || [];
      const isWin =
        match.winner_team_id === playerTeamId && !match.is_draw;
      const isLoss =
        match.winner_team_id !== playerTeamId && !match.is_draw;

      for (const opp of opponents) {
        if (!opp.player_id) continue;
        if (!opponentMap[opp.player_id]) {
          opponentMap[opp.player_id] = {
            playerId: opp.player_id,
            playerName: opp.player_name || "Unknown",
            totalMatches: 0,
            totalRating: 0,
            wins: 0,
            losses: 0,
            draws: 0,
            recentForm: [],
          };
        }
        const acc = opponentMap[opp.player_id];
        acc.totalMatches++;
        acc.totalRating += opp.rating || 0;
        if (isWin) acc.wins++;
        else if (isLoss) acc.losses++;
        else acc.draws++;
        acc.recentForm.push(
          isWin ? "win" : isLoss ? "loss" : "draw"
        );
      }
    }

    // Convert to OpponentData (top 5 most-faced opponents)
    return Object.values(opponentMap)
      .sort((a, b) => b.totalMatches - a.totalMatches)
      .slice(0, 5)
      .map((acc) => ({
        playerId: acc.playerId,
        playerName: acc.playerName,
        rating: acc.totalMatches > 0 ? acc.totalRating / acc.totalMatches : 0,
        matchesPlayed: acc.totalMatches,
        h2h: {
          matchesAgainst: acc.totalMatches,
          wins: acc.wins,
          losses: acc.losses,
          draws: acc.draws,
          avgRatingAgainst:
            acc.totalMatches > 0 ? acc.totalRating / acc.totalMatches : 0,
        },
        tendencies: {
          ctWinRate: 50,
          tWinRate: 50,
          aggressionScore: 50,
          entryRate: 20,
          clutchRate: 15,
          awpUsageRate: 10,
          ecoWinRate: 20,
          forceWinRate: 30,
        },
        topWeapons: [],
        mapPreferences: [],
        recentForm: acc.recentForm.slice(-10),
        patterns: [],
      }));
  }
}

// ── Internal helper types ──────────────────────────────

interface MatchResultLite {
  match_id?: string;
  id?: string;
  game_id?: string;
  map_name?: string;
  played_at?: string;
  created_at?: string;
  is_draw?: boolean;
  winner_team_id?: string;
  player_results?: PlayerResultLite[];
  team_results?: TeamResultLite[];
}

interface PlayerResultLite {
  player_id?: string;
  player_name?: string;
  team_id?: string;
  kills?: number;
  deaths?: number;
  assists?: number;
  rating?: number;
  stats?: Record<string, number>;
}

interface TeamResultLite {
  team_id?: string;
  team_name?: string;
  score?: number;
}

interface OpponentAccumulator {
  playerId: string;
  playerName: string;
  totalMatches: number;
  totalRating: number;
  wins: number;
  losses: number;
  draws: number;
  recentForm: ("win" | "loss" | "draw")[];
}

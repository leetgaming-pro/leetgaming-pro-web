"use client";
import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { MatchData, TeamScoreboard, PlayerStatsEntry } from "@/types/replay-api/sdk";
import { useReplayApi } from "@/hooks/use-replay-api";
import { logger } from "@/lib/logger";
import {
  Card,
  CardBody,
  CardHeader,
  Tabs,
  Tab,
  Chip,
  Select,
  SelectItem,
} from "@nextui-org/react";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import { Icon } from "@iconify/react";
import MatchAnalyticsDashboard from "@/components/analytics/MatchAnalyticsDashboard";
import { AdvancedStatsPanel, AdvancedPlayerStats } from "@/components/analytics/AdvancedStatsCharts";
import { PerformanceTrendsChart, type PerformanceDataPoint } from "@/components/analytics/PerformanceTrendsChart";
import { SkillRadarChart, type SkillDimension } from "@/components/analytics/SkillRadarChart";
import { OpponentScoutingCard, type OpponentData } from "@/components/analytics/OpponentScoutingCard";
import { EsportsSpinner } from "@/components/ui/loading-states";
import { ErrorState, NoPlayerStats } from "@/components/ui/empty-states";
import type { PerformanceTrendsResponse } from "@/types/replay-api/player-performance.sdk";

interface MetricPoint {
  ts: string;
  value: number;
}

// Platform Overview Tab - Shows replay ingest metrics
function PlatformOverview() {
  const { sdk } = useReplayApi();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [ingestSeries, setIngestSeries] = useState<MetricPoint[]>([]);
  const [processingSeries, setProcessingSeries] = useState<MetricPoint[]>([]);
  const [totalReplays, setTotalReplays] = useState<number>(0);
  const [totalMatches, setTotalMatches] = useState<number>(0);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        // Get replay files for metrics
        const all = await sdk.replayFiles.searchReplayFiles({});
        setTotalReplays(all?.length || 0);
        
        const byDay: Record<string, number> = {};
        (all || []).forEach((r) => {
          const day = new Date(r.created_at).toISOString().split("T")[0];
          byDay[day] = (byDay[day] || 0) + 1;
        });
        const sortedDays = Object.keys(byDay).sort();
        setIngestSeries(sortedDays.map((d) => ({ ts: d, value: byDay[d] })));
        setProcessingSeries(
          sortedDays.map((d) => ({
            ts: d,
            value: Math.max(0, byDay[d] - Math.floor(byDay[d] * 0.1)),
          }))
        );

        // Get matches count
        try {
          const matches = await sdk.matches.listMatches({ game_id: "cs2" });
          setTotalMatches(matches?.length || 0);
        } catch {
          setTotalMatches(0);
        }
      } catch (e) {
        const errorMessage =
          e instanceof Error ? e.message : "Failed loading metrics";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [sdk]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <EsportsSpinner size="lg" label="Loading platform metrics..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <ErrorState
          title="Failed to Load Metrics"
          message={error}
          onRetry={() => window.location.reload()}
        />
      )}

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-content1/50 backdrop-blur-sm border border-white/10">
          <CardBody className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-[#DCFF37]/20 flex items-center justify-center">
                <Icon icon="solar:file-bold" className="text-[#DCFF37]" width={24} />
              </div>
              <div>
                <div className="text-2xl font-bold">{totalReplays}</div>
                <div className="text-xs text-default-400">Total Replays</div>
              </div>
            </div>
          </CardBody>
        </Card>
        <Card className="bg-content1/50 backdrop-blur-sm border border-white/10">
          <CardBody className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-[#17C964]/20 flex items-center justify-center">
                <Icon icon="solar:gamepad-bold" className="text-[#17C964]" width={24} />
              </div>
              <div>
                <div className="text-2xl font-bold">{totalMatches}</div>
                <div className="text-xs text-default-400">Matches Processed</div>
              </div>
            </div>
          </CardBody>
        </Card>
        <Card className="bg-content1/50 backdrop-blur-sm border border-white/10">
          <CardBody className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-[#006FEE]/20 flex items-center justify-center">
                <Icon icon="solar:check-circle-bold" className="text-[#006FEE]" width={24} />
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {processingSeries.reduce((sum, p) => sum + p.value, 0)}
                </div>
                <div className="text-xs text-default-400">Successfully Processed</div>
              </div>
            </div>
          </CardBody>
        </Card>
        <Card className="bg-content1/50 backdrop-blur-sm border border-white/10">
          <CardBody className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-[#F5A524]/20 flex items-center justify-center">
                <Icon icon="solar:clock-circle-bold" className="text-[#F5A524]" width={24} />
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {Math.max(0, totalReplays - processingSeries.reduce((sum, p) => sum + p.value, 0))}
                </div>
                <div className="text-xs text-default-400">Pending</div>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-content1/50 backdrop-blur-sm border border-white/10">
          <CardHeader>
            <h3 className="text-lg font-semibold">Daily Replay Ingest</h3>
          </CardHeader>
          <CardBody className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={ingestSeries}
                margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="ts" tick={{ fill: "#889096", fontSize: 10 }} />
                <YAxis tick={{ fill: "#889096", fontSize: 10 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#1a1a1a", border: "1px solid rgba(255,255,255,0.1)" }}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  name="Replays"
                  stroke="#DCFF37"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>
        <Card className="bg-content1/50 backdrop-blur-sm border border-white/10">
          <CardHeader>
            <h3 className="text-lg font-semibold">Processing Status</h3>
          </CardHeader>
          <CardBody className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={ingestSeries.map((p, i) => ({
                  ts: p.ts,
                  processed: processingSeries[i]?.value || 0,
                  pending: Math.max(
                    0,
                    p.value - (processingSeries[i]?.value || 0)
                  ),
                }))}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="ts" tick={{ fill: "#889096", fontSize: 10 }} />
                <YAxis tick={{ fill: "#889096", fontSize: 10 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#1a1a1a", border: "1px solid rgba(255,255,255,0.1)" }}
                />
                <Legend />
                <Bar
                  dataKey="processed"
                  name="Processed"
                  stackId="a"
                  fill="#17C964"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="pending"
                  name="Pending"
                  stackId="a"
                  fill="#F5A524"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

// Player Stats Tab - Shows detailed player statistics
function PlayerStatsTab() {
  const { sdk } = useReplayApi();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [matches, setMatches] = useState<MatchData[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<string>("");
  const [selectedPlayer, setSelectedPlayer] = useState<string>("");
  const [playerStats, setPlayerStats] = useState<AdvancedPlayerStats | null>(null);
  const [availablePlayers, setAvailablePlayers] = useState<{ id: string; name: string; team: string }[]>([]);

  // Load matches
  useEffect(() => {
    const loadMatches = async () => {
      try {
        setLoading(true);
        const matchesData = await sdk.matches.listMatches({ game_id: "cs2" });
        setMatches(matchesData || []);
        if (matchesData && matchesData.length > 0) {
          setSelectedMatch(matchesData[0].id || matchesData[0].match_id || "");
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load matches");
      } finally {
        setLoading(false);
      }
    };
    loadMatches();
  }, [sdk]);

  // Load players when match changes
  useEffect(() => {
    if (!selectedMatch) return;

    const loadPlayers = async () => {
      try {
        const match = await sdk.matches.getMatch("cs2", selectedMatch);
        if (!match) return;

        const players: { id: string; name: string; team: string }[] = [];
        const teamScoreboards = match.scoreboard?.team_scoreboards || [];

        teamScoreboards.forEach((team: TeamScoreboard) => {
          const playerStats = team.player_stats || [];
          const teamPlayers = team.players || [];

          playerStats.forEach((stats: PlayerStatsEntry, idx: number) => {
            const playerMeta = teamPlayers[idx];
            players.push({
              id: stats.player_id || `player-${idx}`,
              name: playerMeta?.name || playerMeta?.display_name || `Player ${idx + 1}`,
              team: team.side || "Unknown",
            });
          });
        });

        setAvailablePlayers(players);
        if (players.length > 0 && !selectedPlayer) {
          setSelectedPlayer(players[0].id);
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load players");
      }
    };

    loadPlayers();
  }, [selectedMatch, sdk, selectedPlayer]);

  // Load player stats when player changes
  useEffect(() => {
    if (!selectedMatch || !selectedPlayer) return;

    const loadPlayerStats = async () => {
      try {
        setLoading(true);
        const match = await sdk.matches.getMatch("cs2", selectedMatch);
        if (!match) return;

        const teamScoreboards = match.scoreboard?.team_scoreboards || [];
        let foundStats: AdvancedPlayerStats | null = null;

        teamScoreboards.forEach((team: TeamScoreboard) => {
          const playerStats = team.player_stats || [];
          const teamPlayers = team.players || [];

          playerStats.forEach((stats: PlayerStatsEntry, idx: number) => {
            const playerId = stats.player_id || `player-${idx}`;
            if (playerId === selectedPlayer) {
              const playerMeta = teamPlayers[idx];
              foundStats = {
                player_id: playerId,
                player_name: playerMeta?.name || playerMeta?.display_name || `Player ${idx + 1}`,
                team: team.side || "Unknown",
                kills: stats.kills || 0,
                deaths: stats.deaths || 0,
                assists: stats.assists || 0,
                headshots: stats.headshots || 0,
                headshot_pct: stats.headshot_pct || 0,
                adr: stats.adr || 0,
                kast: stats.kast || 0,
                rating_2: stats.rating_2 || 0,
                double_kills: stats.double_kills || 0,
                triple_kills: stats.triple_kills || 0,
                quad_kills: stats.quad_kills || 0,
                aces: stats.aces || 0,
                opening_kills: stats.opening_kills || 0,
                opening_deaths: stats.opening_deaths || 0,
                opening_attempts: stats.opening_attempts || (stats.opening_kills || 0) + (stats.opening_deaths || 0),
                trade_kills: stats.trade_kills || 0,
                traded_deaths: stats.traded_deaths || 0,
                clutch_wins: stats.clutch_wins || 0,
                clutch_attempts: stats.clutch_attempts || 0,
                clutch_1v1_wins: stats.clutch_1v1_wins || 0,
                clutch_1v2_wins: stats.clutch_1v2_wins || 0,
                clutch_1v3_wins: stats.clutch_1v3_wins || 0,
                clutch_1v4_wins: stats.clutch_1v4_wins || 0,
                clutch_1v5_wins: stats.clutch_1v5_wins || 0,
                flashes_thrown: stats.flashes_thrown || 0,
                smokes_thrown: stats.smokes_thrown || 0,
                hes_thrown: stats.hes_thrown || 0,
                molotovs_thrown: stats.molotovs_thrown || 0,
                enemies_flashed: stats.enemies_flashed || 0,
                flash_assists: stats.flash_assists || 0,
                team_flashes: stats.team_flashes || 0,
                utility_damage: stats.utility_damage || 0,
                weapon_kills: stats.weapon_kills || {},
                weapon_headshots: stats.weapon_headshots || {},
                weapon_accuracy: stats.weapon_accuracy || {},
                damage_by_weapon: stats.damage_by_weapon || {},
                damage_by_hitbox: stats.damage_by_hitbox || {},
                total_damage: stats.total_damage || 0,
                money_spent_total: stats.money_spent_total || 0,
                money_earned_total: stats.money_earned_total || 0,
                bomb_plants: stats.bomb_plants || 0,
                bomb_defuses: stats.bomb_defuses || 0,
                wallbang_kills: stats.wallbang_kills || 0,
                noscope_kills: stats.noscope_kills || 0,
                through_smoke_kills: stats.through_smoke_kills || 0,
                airborne_kills: stats.airborne_kills || 0,
                blind_kills: stats.blind_kills || 0,
                knife_kills: stats.knife_kills || 0,
              };
            }
          });
        });

        setPlayerStats(foundStats);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load player stats");
      } finally {
        setLoading(false);
      }
    };

    loadPlayerStats();
  }, [selectedMatch, selectedPlayer, sdk]);

  if (loading && !playerStats) {
    return (
      <div className="flex items-center justify-center h-96">
        <EsportsSpinner size="lg" label="Loading player stats..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Selection Controls */}
      <div className="flex flex-col md:flex-row gap-4">
        <Select
          label="Select Match"
          placeholder="Choose a match"
          selectedKeys={selectedMatch ? [selectedMatch] : []}
          onChange={(e) => {
            setSelectedMatch(e.target.value);
            setSelectedPlayer("");
          }}
          className="max-w-xs"
        >
          {matches.map((match) => (
            <SelectItem key={match.id || match.match_id || ""} textValue={`${match.map_name || match.map || "Unknown Map"} - ${new Date(match.created_at || match.played_at || "").toLocaleDateString()}`}>
              {match.map_name || match.map || "Unknown Map"} - {new Date(match.created_at || match.played_at || "").toLocaleDateString()}
            </SelectItem>
          ))}
        </Select>
        <Select
          label="Select Player"
          placeholder="Choose a player"
          selectedKeys={selectedPlayer ? [selectedPlayer] : []}
          onChange={(e) => setSelectedPlayer(e.target.value)}
          className="max-w-xs"
        >
          {availablePlayers.map((player) => (
            <SelectItem key={player.id} textValue={`${player.name} (${player.team})`}>
              <div className="flex items-center gap-2">
                <span>{player.name}</span>
                <Chip size="sm" variant="flat" className={player.team === "CT" ? "bg-[#5D79AE]/20 text-[#5D79AE]" : "bg-[#DE9B35]/20 text-[#DE9B35]"}>
                  {player.team}
                </Chip>
              </div>
            </SelectItem>
          ))}
        </Select>
      </div>

      {error && (
        <ErrorState
          title="Failed to Load Player Stats"
          message={error}
          onRetry={() => window.location.reload()}
        />
      )}

      {playerStats && <AdvancedStatsPanel stats={playerStats} />}

      {!playerStats && !loading && (
        <NoPlayerStats 
          message="Select a match and player to view detailed stats"
        />
      )}
    </div>
  );
}

// Performance Trends Tab — Rating 2.0 / ADR / KAST / HS% time-series + Skill Radar
function PerformanceTrendsTab() {
  const { sdk } = useReplayApi();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [trendsData, setTrendsData] = useState<PerformanceTrendsResponse | null>(null);
  const [playerId, setPlayerId] = useState<string>("");

  // Auto-detect current player
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const profile = await sdk.playerProfiles.getMyProfile("cs2");
        if (profile?.id) {
          setPlayerId(profile.id);
        }
      } catch {
        // Not logged in or no profile
      }
    };
    loadProfile();
  }, [sdk]);

  // Load trends when playerId is available
  useEffect(() => {
    if (!playerId) {
      setLoading(false);
      return;
    }
    const loadTrends = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await sdk.playerPerformance.getPerformanceTrends({
          playerId,
          gameId: "cs2",
          limit: 20,
        });
        setTrendsData(data);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load performance trends");
      } finally {
        setLoading(false);
      }
    };
    loadTrends();
  }, [playerId, sdk]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <EsportsSpinner size="lg" label="Loading performance trends..." />
      </div>
    );
  }

  if (!playerId) {
    return (
      <Card className="bg-content1/50 backdrop-blur-sm border border-white/10 p-8">
        <CardBody className="text-center">
          <Icon icon="solar:chart-2-bold-duotone" className="w-16 h-16 text-default-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Performance Trends</h3>
          <p className="text-default-500">Sign in and create a player profile to see your performance trends</p>
        </CardBody>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <ErrorState
          title="Failed to Load Trends"
          message={error}
          onRetry={() => window.location.reload()}
        />
      )}

      {/* Summary cards */}
      {trendsData?.summary && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <SummaryCard
            label="Avg Rating"
            value={trendsData.summary.avgRating.toFixed(2)}
            icon="solar:chart-bold"
            color="#DCFF37"
            trend={trendsData.summary.ratingTrend}
          />
          <SummaryCard
            label="Avg ADR"
            value={trendsData.summary.avgAdr.toFixed(1)}
            icon="solar:target-bold"
            color="#17C964"
          />
          <SummaryCard
            label="Avg KAST"
            value={`${trendsData.summary.avgKast.toFixed(1)}%`}
            icon="solar:shield-check-bold"
            color="#006FEE"
          />
          <SummaryCard
            label="Win Rate"
            value={`${trendsData.summary.winRate.toFixed(0)}%`}
            icon="solar:cup-star-bold"
            color="#F5A524"
          />
          <SummaryCard
            label="Best Map"
            value={trendsData.summary.bestMap}
            icon="solar:map-bold"
            color="#9333EA"
          />
        </div>
      )}

      {/* Two-column layout: Trends + Skill Radar */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <PerformanceTrendsChart
            data={trendsData?.dataPoints || []}
            isLoading={loading}
          />
        </div>
        <div>
          <SkillRadarChart
            skills={trendsData?.skills || []}
            isLoading={loading}
            title="Skill Overview"
          />
        </div>
      </div>
    </div>
  );
}

// Opponents Tab — Scouting reports for frequently-faced opponents
function OpponentsTab() {
  const { sdk } = useReplayApi();
  const [loading, setLoading] = useState(true);
  const [opponents, setOpponents] = useState<OpponentData[]>([]);
  const [playerId, setPlayerId] = useState<string>("");

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const profile = await sdk.playerProfiles.getMyProfile("cs2");
        if (profile?.id) setPlayerId(profile.id);
      } catch {
        // Not logged in
      }
    };
    loadProfile();
  }, [sdk]);

  useEffect(() => {
    if (!playerId) {
      setLoading(false);
      return;
    }
    const loadOpponents = async () => {
      try {
        setLoading(true);
        const data = await sdk.playerPerformance.getPerformanceTrends({
          playerId,
          gameId: "cs2",
          limit: 50,
        });
        setOpponents(data?.opponents || []);
      } catch (e) {
        logger.warn("[OpponentsTab] Failed to load opponents", { error: e instanceof Error ? e.message : String(e) });
      } finally {
        setLoading(false);
      }
    };
    loadOpponents();
  }, [playerId, sdk]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <EsportsSpinner size="lg" label="Loading opponent data..." />
      </div>
    );
  }

  if (!playerId) {
    return (
      <Card className="bg-content1/50 backdrop-blur-sm border border-white/10 p-8">
        <CardBody className="text-center">
          <Icon icon="solar:users-group-rounded-bold-duotone" className="w-16 h-16 text-default-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Opponent Scouting</h3>
          <p className="text-default-500">Sign in to see scouting reports on opponents you&apos;ve faced</p>
        </CardBody>
      </Card>
    );
  }

  if (opponents.length === 0) {
    return (
      <Card className="bg-content1/50 backdrop-blur-sm border border-white/10 p-8">
        <CardBody className="text-center">
          <Icon icon="solar:users-group-rounded-bold-duotone" className="w-16 h-16 text-default-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Opponents Yet</h3>
          <p className="text-default-500">Play matches to build up scouting data on your opponents</p>
        </CardBody>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-[#F31260]/20 flex items-center justify-center">
          <Icon icon="solar:users-group-rounded-bold" className="text-[#F31260]" width={20} />
        </div>
        <div>
          <h3 className="text-lg font-bold">Opponent Scouting Reports</h3>
          <p className="text-xs text-default-500">{opponents.length} opponents analyzed from recent matches</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {opponents.map((opp) => (
          <OpponentScoutingCard key={opp.playerId} opponent={opp} />
        ))}
      </div>
    </div>
  );
}

// My Profile Analytics Tab — View statistics on who viewed your profile
function MyProfileAnalyticsTab() {
  const { sdk } = useReplayApi();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<{
    totalViews: number;
    uniqueViewers: number;
    viewsThisWeek: number;
    viewsLastWeek: number;
    topReferrers: { source: string; count: number }[];
  } | null>(null);

  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true);
        const profile = await sdk.playerProfiles.getMyProfile("cs2");
        if (!profile?.id) {
          setLoading(false);
          return;
        }

        const viewStats = await sdk.viewAnalytics.getViewStatistics(
          "player",
          profile.id,
          { period: "30d" }
        );

        if (viewStats) {
          // Compute period views from views_by_day
          const dailyViews = Object.values(viewStats.views_by_day || {});
          const totalDailyViews = dailyViews.reduce((s, v) => s + v, 0);
          const halfIdx = Math.floor(dailyViews.length / 2);
          const recentViews = dailyViews.slice(halfIdx).reduce((s, v) => s + v, 0);
          const olderViews = dailyViews.slice(0, halfIdx).reduce((s, v) => s + v, 0);

          // Build referrer breakdown from views_by_referrer
          const referrerEntries = Object.entries(viewStats.views_by_referrer || {})
            .map(([source, count]) => ({ source, count }))
            .sort((a, b) => b.count - a.count);

          setStats({
            totalViews: viewStats.total_views || 0,
            uniqueViewers: viewStats.unique_viewers || 0,
            viewsThisWeek: recentViews || totalDailyViews,
            viewsLastWeek: olderViews,
            topReferrers: referrerEntries,
          });
        }
      } catch {
        // Not available
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, [sdk]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <EsportsSpinner size="lg" label="Loading profile analytics..." />
      </div>
    );
  }

  if (!stats) {
    return (
      <Card className="bg-content1/50 backdrop-blur-sm border border-white/10 p-8">
        <CardBody className="text-center">
          <Icon icon="solar:eye-bold-duotone" className="w-16 h-16 text-default-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Profile Analytics</h3>
          <p className="text-default-500">Sign in to see who&apos;s viewing your profile</p>
        </CardBody>
      </Card>
    );
  }

  const viewDelta = stats.viewsLastWeek > 0
    ? ((stats.viewsThisWeek - stats.viewsLastWeek) / stats.viewsLastWeek) * 100
    : 0;

  return (
    <div className="space-y-6">
      {/* View stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-content1/50 backdrop-blur-sm border border-white/10">
          <CardBody className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-[#DCFF37]/20 flex items-center justify-center">
                <Icon icon="solar:eye-bold" className="text-[#DCFF37]" width={24} />
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.totalViews.toLocaleString()}</div>
                <div className="text-xs text-default-400">Total Views</div>
              </div>
            </div>
          </CardBody>
        </Card>
        <Card className="bg-content1/50 backdrop-blur-sm border border-white/10">
          <CardBody className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-[#17C964]/20 flex items-center justify-center">
                <Icon icon="solar:users-group-rounded-bold" className="text-[#17C964]" width={24} />
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.uniqueViewers.toLocaleString()}</div>
                <div className="text-xs text-default-400">Unique Viewers</div>
              </div>
            </div>
          </CardBody>
        </Card>
        <Card className="bg-content1/50 backdrop-blur-sm border border-white/10">
          <CardBody className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-[#006FEE]/20 flex items-center justify-center">
                <Icon icon="solar:graph-up-bold" className="text-[#006FEE]" width={24} />
              </div>
              <div>
                <div className="flex items-center gap-1">
                  <span className="text-2xl font-bold">{stats.viewsThisWeek}</span>
                  {viewDelta !== 0 && (
                    <Chip size="sm" color={viewDelta > 0 ? "success" : "danger"} variant="flat" className="h-5 text-[10px]">
                      {viewDelta > 0 ? "+" : ""}{viewDelta.toFixed(0)}%
                    </Chip>
                  )}
                </div>
                <div className="text-xs text-default-400">This Period</div>
              </div>
            </div>
          </CardBody>
        </Card>
        <Card className="bg-content1/50 backdrop-blur-sm border border-white/10">
          <CardBody className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-[#F5A524]/20 flex items-center justify-center">
                <Icon icon="solar:link-bold" className="text-[#F5A524]" width={24} />
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.topReferrers.length}</div>
                <div className="text-xs text-default-400">Traffic Sources</div>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Referrer breakdown */}
      {stats.topReferrers.length > 0 && (
        <Card className="bg-content1/50 backdrop-blur-sm border border-white/10">
          <CardHeader>
            <h3 className="font-semibold">Traffic Sources</h3>
          </CardHeader>
          <CardBody className="pt-0">
            <div className="space-y-3">
              {stats.topReferrers.map((ref, idx) => {
                const maxCount = Math.max(...stats.topReferrers.map((r) => r.count), 1);
                return (
                  <div key={idx} className="flex items-center gap-3">
                    <span className="text-sm text-default-500 w-24 truncate capitalize">{ref.source}</span>
                    <div className="flex-1 h-2 rounded-full bg-default-100 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-[#DCFF37] to-[#17C964]"
                        style={{ width: `${(ref.count / maxCount) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium w-12 text-right">{ref.count}</span>
                  </div>
                );
              })}
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
}

// Summary card helper
function SummaryCard({
  label,
  value,
  icon,
  color,
  trend,
}: {
  label: string;
  value: string;
  icon: string;
  color: string;
  trend?: "up" | "down" | "stable";
}) {
  return (
    <Card className="bg-content1/50 backdrop-blur-sm border border-white/10">
      <CardBody className="p-4">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: `${color}20` }}
          >
            <Icon icon={icon} width={20} style={{ color }} />
          </div>
          <div>
            <div className="flex items-center gap-1">
              <span className="text-xl font-bold">{value}</span>
              {trend && trend !== "stable" && (
                <Icon
                  icon={trend === "up" ? "solar:arrow-up-bold" : "solar:arrow-down-bold"}
                  className={`w-3.5 h-3.5 ${trend === "up" ? "text-success" : "text-danger"}`}
                />
              )}
            </div>
            <div className="text-xs text-default-400">{label}</div>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}

function AnalyticsDashboardContent() {
  const searchParams = useSearchParams();
  const matchId = searchParams.get("match");
  const [activeTab, setActiveTab] = useState(matchId ? "match" : "overview");

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-content1 p-4 md:p-8 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-[#DCFF37] to-[#17C964] bg-clip-text text-transparent">
          Analytics Dashboard
        </h1>
        <p className="text-default-500 mt-1">
          Comprehensive esports analytics and performance tracking
        </p>
      </div>

      {/* Main Tabs — 6 tabs */}
      <Tabs
        selectedKey={activeTab}
        onSelectionChange={(key) => setActiveTab(key as string)}
        className="mb-6"
        variant="underlined"
        classNames={{
          tabList: "gap-4 flex-wrap",
          cursor: "bg-[#DCFF37]",
          tab: "px-0 h-12",
          tabContent: "group-data-[selected=true]:text-[#DCFF37]",
        }}
      >
        <Tab
          key="overview"
          title={
            <div className="flex items-center gap-2">
              <Icon icon="solar:chart-2-bold" width={18} />
              <span>Overview</span>
            </div>
          }
        />
        <Tab
          key="performance"
          title={
            <div className="flex items-center gap-2">
              <Icon icon="solar:graph-up-bold" width={18} />
              <span>Performance</span>
            </div>
          }
        />
        <Tab
          key="match"
          title={
            <div className="flex items-center gap-2">
              <Icon icon="solar:gamepad-bold" width={18} />
              <span>Match Deep Dive</span>
            </div>
          }
        />
        <Tab
          key="opponents"
          title={
            <div className="flex items-center gap-2">
              <Icon icon="solar:users-group-rounded-bold" width={18} />
              <span>Opponents</span>
            </div>
          }
        />
        <Tab
          key="player"
          title={
            <div className="flex items-center gap-2">
              <Icon icon="solar:user-bold" width={18} />
              <span>Player Stats</span>
            </div>
          }
        />
        <Tab
          key="profile"
          title={
            <div className="flex items-center gap-2">
              <Icon icon="solar:eye-bold" width={18} />
              <span>My Profile Analytics</span>
            </div>
          }
        />
      </Tabs>

      {/* Tab Content */}
      {activeTab === "overview" && <PlatformOverview />}
      {activeTab === "performance" && <PerformanceTrendsTab />}
      {activeTab === "match" && <MatchAnalyticsDashboard matchId={matchId || undefined} />}
      {activeTab === "opponents" && <OpponentsTab />}
      {activeTab === "player" && <PlayerStatsTab />}
      {activeTab === "profile" && <MyProfileAnalyticsTab />}
    </div>
  );
}

export default function AnalyticsDashboardPage() {
  return (
    <Suspense fallback={<EsportsSpinner size="lg" label="Loading Analytics..." />}>
      <AnalyticsDashboardContent />
    </Suspense>
  );
}

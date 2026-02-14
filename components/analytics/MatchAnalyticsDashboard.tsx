"use client";
import React, { useEffect, useState, useMemo } from "react";
import { ReplayAPISDK, MatchData, TeamScoreboard, PlayerStatsEntry } from "@/types/replay-api/sdk";
import { ReplayApiSettingsMock } from "@/types/replay-api/settings";
import { logger } from "@/lib/logger";
import {
  Card,
  CardBody,
  CardHeader,
  Spinner,
  Tabs,
  Tab,
  Progress,
  Chip,
  Avatar,
  Tooltip,
  Divider,
  Select,
  SelectItem,
} from "@nextui-org/react";
import {
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Bar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  ComposedChart,
} from "recharts";
import { Icon } from "@iconify/react";

// Color schemes for esports-style UI
const COLORS = {
  primary: "#DCFF37",
  secondary: "#FF4654",
  ct: "#5D79AE",
  t: "#DE9B35",
  success: "#17C964",
  warning: "#F5A524",
  danger: "#F31260",
  neutral: "#889096",
  background: "rgba(255,255,255,0.05)",
};

const RADAR_COLORS = ["#DCFF37", "#FF4654", "#5D79AE", "#DE9B35", "#17C964"];

interface PlayerAnalytics {
  player_id: string;
  player_name: string;
  team: string;
  stats: PlayerStatsEntry;
  rating: number;
  consistency: number;
  improvement: number;
}

interface MatchAnalytics {
  match_id: string;
  map_name: string;
  date: string;
  team1_score: number;
  team2_score: number;
  duration: number;
  players: PlayerAnalytics[];
  round_data: RoundData[];
  economy_data: EconomyData[];
  momentum_data: MomentumData[];
}

interface RoundData {
  round: number;
  winner: string;
  win_type: string;
  ct_alive: number;
  t_alive: number;
  first_blood: string;
  first_blood_side: string;
  duration: number;
}

interface EconomyData {
  round: number;
  ct_money: number;
  t_money: number;
  ct_equipment: number;
  t_equipment: number;
}

interface MomentumData {
  round: number;
  momentum: number; // -10 to 10, negative = T momentum
  ct_streak: number;
  t_streak: number;
}

// Stat card with animated progress
function StatCard({
  title,
  value,
  subtitle,
  icon,
  color,
  progress,
  trend,
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: string;
  color: string;
  progress?: number;
  trend?: "up" | "down" | "stable";
}) {
  return (
    <Card className="bg-content1/50 backdrop-blur-sm border border-white/10">
      <CardBody className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-xs text-default-500 uppercase tracking-wider">{title}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-2xl font-bold" style={{ color }}>
                {value}
              </span>
              {trend && (
                <Icon
                  icon={trend === "up" ? "solar:arrow-up-bold" : trend === "down" ? "solar:arrow-down-bold" : "solar:minus-bold"}
                  className={trend === "up" ? "text-success" : trend === "down" ? "text-danger" : "text-default-400"}
                  width={16}
                />
              )}
            </div>
            {subtitle && <p className="text-xs text-default-400 mt-1">{subtitle}</p>}
          </div>
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: `${color}20` }}
          >
            <Icon icon={icon} width={24} style={{ color }} />
          </div>
        </div>
        {progress !== undefined && (
          <Progress
            value={Math.min(100, Math.max(0, progress))}
            className="mt-3"
            size="sm"
            color="primary"
          />
        )}
      </CardBody>
    </Card>
  );
}

// Player performance radar chart
function PlayerRadarChart({ players, selectedPlayers }: { players: PlayerAnalytics[]; selectedPlayers: string[] }) {
  const radarData = useMemo(() => {
    const metrics = [
      { key: "kills", label: "Kills", max: 30 },
      { key: "kd_ratio", label: "K/D", max: 2.5 },
      { key: "adr", label: "ADR", max: 120 },
      { key: "kast", label: "KAST", max: 100 },
      { key: "headshot_pct", label: "HS%", max: 70 },
      { key: "rating_2", label: "Rating", max: 2 },
    ];

    return metrics.map(({ key, label, max }) => {
      const dataPoint: Record<string, string | number> = { metric: label };
      selectedPlayers.forEach((playerId, idx) => {
        const player = players.find((p) => p.player_id === playerId);
        if (player?.stats) {
          // Type-safe access to stats using Record<string, unknown>
          const statsRecord = player.stats as unknown as Record<string, number | undefined>;
          const value = statsRecord[key] || 0;
          dataPoint[`player${idx}`] = Math.min((value / max) * 100, 100);
        }
      });
      return dataPoint;
    });
  }, [players, selectedPlayers]);

  return (
    <ResponsiveContainer width="100%" height={350}>
      <RadarChart data={radarData}>
        <PolarGrid stroke="rgba(255,255,255,0.1)" />
        <PolarAngleAxis dataKey="metric" tick={{ fill: "#889096", fontSize: 12 }} />
        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: "#889096", fontSize: 10 }} />
        {selectedPlayers.map((playerId, idx) => {
          const player = players.find((p) => p.player_id === playerId);
          return (
            <Radar
              key={playerId}
              name={player?.player_name || `Player ${idx + 1}`}
              dataKey={`player${idx}`}
              stroke={RADAR_COLORS[idx % RADAR_COLORS.length]}
              fill={RADAR_COLORS[idx % RADAR_COLORS.length]}
              fillOpacity={0.2}
              strokeWidth={2}
            />
          );
        })}
        <Legend />
      </RadarChart>
    </ResponsiveContainer>
  );
}

// Match momentum chart
function MomentumChart({ data }: { data: MomentumData[] }) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id="momentumGradientPositive" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={COLORS.ct} stopOpacity={0.8} />
            <stop offset="100%" stopColor={COLORS.ct} stopOpacity={0} />
          </linearGradient>
          <linearGradient id="momentumGradientNegative" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor={COLORS.t} stopOpacity={0.8} />
            <stop offset="100%" stopColor={COLORS.t} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
        <XAxis dataKey="round" tick={{ fill: "#889096", fontSize: 10 }} />
        <YAxis domain={[-10, 10]} tick={{ fill: "#889096", fontSize: 10 }} />
        <RechartsTooltip
          contentStyle={{ backgroundColor: "#1a1a1a", border: "1px solid rgba(255,255,255,0.1)" }}
          labelStyle={{ color: "#fff" }}
        />
        <Area
          type="monotone"
          dataKey="momentum"
          stroke={COLORS.ct}
          fill="url(#momentumGradientPositive)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

// Economy flow chart
function EconomyChart({ data }: { data: EconomyData[] }) {
  return (
    <ResponsiveContainer width="100%" height={250}>
      <ComposedChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
        <XAxis dataKey="round" tick={{ fill: "#889096", fontSize: 10 }} />
        <YAxis yAxisId="left" tick={{ fill: "#889096", fontSize: 10 }} />
        <YAxis yAxisId="right" orientation="right" tick={{ fill: "#889096", fontSize: 10 }} />
        <RechartsTooltip
          contentStyle={{ backgroundColor: "#1a1a1a", border: "1px solid rgba(255,255,255,0.1)" }}
          labelStyle={{ color: "#fff" }}
          formatter={(value: number) => [`$${value.toLocaleString()}`, ""]}
        />
        <Legend />
        <Bar yAxisId="left" dataKey="ct_equipment" name="CT Equipment" fill={COLORS.ct} opacity={0.7} />
        <Bar yAxisId="left" dataKey="t_equipment" name="T Equipment" fill={COLORS.t} opacity={0.7} />
        <Line yAxisId="right" type="monotone" dataKey="ct_money" name="CT Money" stroke={COLORS.ct} strokeWidth={2} dot={false} />
        <Line yAxisId="right" type="monotone" dataKey="t_money" name="T Money" stroke={COLORS.t} strokeWidth={2} dot={false} />
      </ComposedChart>
    </ResponsiveContainer>
  );
}

// Kill distribution pie chart
function KillDistributionChart({ players }: { players: PlayerAnalytics[] }) {
  const data = useMemo(() => {
    return players
      .filter((p) => p.stats?.kills > 0)
      .map((p) => ({
        name: p.player_name,
        value: p.stats?.kills || 0,
        team: p.team,
      }))
      .sort((a, b) => b.value - a.value);
  }, [players]);

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={2}
          dataKey="value"
          label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
          labelLine={false}
        >
          {data.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={entry.team === "CT" ? COLORS.ct : COLORS.t}
              opacity={0.8 + (index * 0.02)}
            />
          ))}
        </Pie>
        <RechartsTooltip
          contentStyle={{ backgroundColor: "#1a1a1a", border: "1px solid rgba(255,255,255,0.1)" }}
          formatter={(value: number, name: string) => [`${value} kills`, name]}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

// Player leaderboard with detailed stats
function PlayerLeaderboard({ players }: { players: PlayerAnalytics[] }) {
  const sortedPlayers = useMemo(() => {
    return [...players].sort((a, b) => (b.stats?.rating_2 || 0) - (a.stats?.rating_2 || 0));
  }, [players]);

  return (
    <div className="space-y-2">
      {sortedPlayers.map((player, index) => {
        const stats = player.stats;
        const rating = stats?.rating_2 || 0;
        const ratingColor = rating >= 1.2 ? COLORS.success : rating >= 0.9 ? COLORS.warning : COLORS.danger;

        return (
          <div
            key={player.player_id}
            className="flex items-center gap-4 p-3 rounded-lg bg-content2/30 hover:bg-content2/50 transition-colors"
          >
            <div className="w-8 h-8 rounded-full flex items-center justify-center bg-content3 font-bold text-sm">
              {index + 1}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold">{player.player_name}</span>
                <Chip
                  size="sm"
                  variant="flat"
                  className={player.team === "CT" ? "bg-[#5D79AE]/20 text-[#5D79AE]" : "bg-[#DE9B35]/20 text-[#DE9B35]"}
                >
                  {player.team}
                </Chip>
              </div>
              <div className="flex items-center gap-4 mt-1 text-xs text-default-400">
                <span>{stats?.kills || 0}/{stats?.deaths || 0}/{stats?.assists || 0}</span>
                <span>ADR: {stats?.adr?.toFixed(1) || 0}</span>
                <span>HS: {stats?.headshot_pct?.toFixed(0) || 0}%</span>
                <span>KAST: {stats?.kast?.toFixed(0) || 0}%</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xl font-bold" style={{ color: ratingColor }}>
                {rating.toFixed(2)}
              </div>
              <div className="text-xs text-default-400">Rating 2.0</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Round timeline visualization
function RoundTimeline({ rounds }: { rounds: RoundData[] }) {
  return (
    <div className="flex gap-1 overflow-x-auto pb-2">
      {rounds.map((round, idx) => (
        <Tooltip
          key={idx}
          content={
            <div className="p-2">
              <div className="font-bold">Round {round.round}</div>
              <div className="text-sm">Winner: {round.winner}</div>
              <div className="text-sm">Type: {round.win_type}</div>
              <div className="text-sm">First Blood: {round.first_blood} ({round.first_blood_side})</div>
            </div>
          }
        >
          <div
            className={`w-8 h-12 rounded flex items-center justify-center cursor-pointer transition-all hover:scale-110 ${
              round.winner === "CT" ? "bg-[#5D79AE]" : "bg-[#DE9B35]"
            }`}
          >
            <span className="text-xs font-bold text-white">{round.round}</span>
          </div>
        </Tooltip>
      ))}
    </div>
  );
}

// Props for match analytics dashboard
interface MatchAnalyticsDashboardProps {
  matchId?: string;
}

// Main Analytics Dashboard
export default function MatchAnalyticsDashboard({ matchId: initialMatchId }: MatchAnalyticsDashboardProps) {
  const sdk = useMemo(() => new ReplayAPISDK(ReplayApiSettingsMock, logger), []);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [matches, setMatches] = useState<MatchData[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<string>(initialMatchId || "");
  const [matchAnalytics, setMatchAnalytics] = useState<MatchAnalytics | null>(null);
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState("overview");

  // Load matches on mount
  useEffect(() => {
    const loadMatches = async () => {
      try {
        setLoading(true);
        const matchesData = await sdk.matches.listMatches({ game_id: "cs2" });
        setMatches(matchesData || []);
        if (!initialMatchId && matchesData && matchesData.length > 0) {
          setSelectedMatch(matchesData[0].id || matchesData[0].match_id || "");
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load matches");
      } finally {
        setLoading(false);
      }
    };
    loadMatches();
  }, [sdk, initialMatchId]);

  // Load match analytics when selection changes
  useEffect(() => {
    if (!selectedMatch) return;

    const loadMatchAnalytics = async () => {
      try {
        setLoading(true);
        setError(null);
        const match = await sdk.matches.getMatch("cs2", selectedMatch);
        if (!match) {
          setError("Match not found");
          return;
        }

        // Build analytics from match data
        const players: PlayerAnalytics[] = [];
        const teamScoreboards = match.scoreboard?.team_scoreboards || [];

        teamScoreboards.forEach((team: TeamScoreboard) => {
          const playerStats = team.player_stats || [];
          const teamPlayers = team.players || [];

          playerStats.forEach((stats: PlayerStatsEntry, idx: number) => {
            const playerMeta = teamPlayers[idx];
            players.push({
              player_id: stats.player_id || `player-${idx}`,
              player_name: playerMeta?.name || playerMeta?.display_name || `Player ${idx + 1}`,
              team: team.side || "Unknown",
              stats: stats,
              rating: stats.rating_2 || 0,
              consistency: 0.8, // Placeholder
              improvement: 0.05, // Placeholder
            });
          });
        });

        // Generate synthetic round/economy/momentum data for visualization
        const totalRounds = Math.max(1, (teamScoreboards[0]?.team_score || 0) + (teamScoreboards[1]?.team_score || 0));
        const roundData: RoundData[] = [];
        const economyData: EconomyData[] = [];
        const momentumData: MomentumData[] = [];

        let momentum = 0;

        for (let i = 1; i <= totalRounds; i++) {
          // Simulate round winner based on final score distribution
          const ctWinProb = (teamScoreboards[0]?.team_score || 8) / totalRounds;
          const ctWon = Math.random() < ctWinProb;
          if (ctWon) {
            momentum = Math.min(10, momentum + 2);
          } else {
            momentum = Math.max(-10, momentum - 2);
          }

          roundData.push({
            round: i,
            winner: ctWon ? "CT" : "T",
            win_type: Math.random() > 0.6 ? "elimination" : Math.random() > 0.5 ? "defuse" : "explosion",
            ct_alive: ctWon ? Math.floor(Math.random() * 3) + 1 : 0,
            t_alive: ctWon ? 0 : Math.floor(Math.random() * 3) + 1,
            first_blood: players[Math.floor(Math.random() * players.length)]?.player_name || "Unknown",
            first_blood_side: Math.random() > 0.5 ? "CT" : "T",
            duration: 60 + Math.random() * 90,
          });

          const baseMoney = i === 1 || i === 13 ? 800 : 3000 + Math.random() * 10000;
          economyData.push({
            round: i,
            ct_money: Math.floor(baseMoney + Math.random() * 5000),
            t_money: Math.floor(baseMoney + Math.random() * 5000),
            ct_equipment: Math.floor(baseMoney * 0.8),
            t_equipment: Math.floor(baseMoney * 0.75),
          });

          momentumData.push({
            round: i,
            momentum: momentum * (1 + Math.random() * 0.2 - 0.1),
            ct_streak: ctWon ? (momentumData[i - 2]?.ct_streak || 0) + 1 : 0,
            t_streak: ctWon ? 0 : (momentumData[i - 2]?.t_streak || 0) + 1,
          });
        }

        setMatchAnalytics({
          match_id: selectedMatch,
          map_name: match.map || "Unknown",
          date: match.created_at || match.played_at || new Date().toISOString(),
          team1_score: teamScoreboards[0]?.team_score || 0,
          team2_score: teamScoreboards[1]?.team_score || 0,
          duration: match.duration || 0,
          players,
          round_data: roundData,
          economy_data: economyData,
          momentum_data: momentumData,
        });

        // Select top 2 players for radar comparison by default
        if (players.length >= 2) {
          const topPlayers = [...players].sort((a, b) => (b.stats?.rating_2 || 0) - (a.stats?.rating_2 || 0));
          setSelectedPlayers([topPlayers[0].player_id, topPlayers[1].player_id]);
        } else if (players.length > 0) {
          setSelectedPlayers([players[0].player_id]);
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load match analytics");
      } finally {
        setLoading(false);
      }
    };

    loadMatchAnalytics();
  }, [selectedMatch, sdk]);

  // Calculate aggregate stats
  const aggregateStats = useMemo(() => {
    if (!matchAnalytics) return null;

    const players = matchAnalytics.players;
    const totalKills = players.reduce((sum, p) => sum + (p.stats?.kills || 0), 0);
    const totalDeaths = players.reduce((sum, p) => sum + (p.stats?.deaths || 0), 0);
    const avgRating = players.length > 0 
      ? players.reduce((sum, p) => sum + (p.stats?.rating_2 || 0), 0) / players.length 
      : 0;
    const avgADR = players.length > 0 
      ? players.reduce((sum, p) => sum + (p.stats?.adr || 0), 0) / players.length 
      : 0;
    const avgKAST = players.length > 0 
      ? players.reduce((sum, p) => sum + (p.stats?.kast || 0), 0) / players.length 
      : 0;
    const totalHS = players.reduce((sum, p) => sum + (p.stats?.headshots || 0), 0);
    const avgHSPct = totalKills > 0 ? (totalHS / totalKills) * 100 : 0;

    return {
      totalKills,
      totalDeaths,
      avgRating,
      avgADR,
      avgKAST,
      avgHSPct,
      totalRounds: matchAnalytics.team1_score + matchAnalytics.team2_score,
    };
  }, [matchAnalytics]);

  if (loading && !matchAnalytics) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center space-y-4">
          <Spinner size="lg" color="primary" />
          <p className="text-default-500">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (!matchAnalytics && !loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center space-y-4">
          <Icon icon="solar:chart-2-bold-duotone" className="text-default-300 mx-auto" width={64} />
          <p className="text-default-500">No match data available</p>
          <p className="text-sm text-default-400">Process a replay file to see analytics</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-[#DCFF37] to-[#17C964] bg-clip-text text-transparent">
            Match Analytics
          </h1>
          <p className="text-default-500 mt-1">
            Advanced esports performance analysis
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Select
            label="Select Match"
            placeholder="Choose a match"
            selectedKeys={selectedMatch ? [selectedMatch] : []}
            onChange={(e) => setSelectedMatch(e.target.value)}
            className="w-64"
            size="sm"
          >
            {matches.map((match) => (
              <SelectItem key={match.id || match.match_id || ""} textValue={`${match.map || "Unknown Map"} - ${new Date(match.created_at || match.played_at || "").toLocaleDateString()}`}>
                {match.map || "Unknown Map"} - {new Date(match.created_at || match.played_at || "").toLocaleDateString()}
              </SelectItem>
            ))}
          </Select>
        </div>
      </div>

      {error && (
        <Card className="bg-danger/10 border border-danger/20">
          <CardBody className="flex flex-row items-center gap-3">
            <Icon icon="solar:danger-triangle-bold" className="text-danger" width={24} />
            <span className="text-danger">{error}</span>
          </CardBody>
        </Card>
      )}

      {matchAnalytics && (
        <>
          {/* Match Header */}
          <Card className="bg-content1/50 backdrop-blur-sm border border-white/10">
            <CardBody className="p-6">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <div className="text-4xl font-black text-[#5D79AE]">{matchAnalytics.team1_score}</div>
                    <div className="text-sm text-default-400">CT</div>
                  </div>
                  <div className="text-3xl font-bold text-default-300">:</div>
                  <div className="text-center">
                    <div className="text-4xl font-black text-[#DE9B35]">{matchAnalytics.team2_score}</div>
                    <div className="text-sm text-default-400">T</div>
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold">{matchAnalytics.map_name}</div>
                  <div className="text-sm text-default-400">
                    {new Date(matchAnalytics.date).toLocaleDateString()} • {aggregateStats?.totalRounds} rounds
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Chip size="lg" variant="flat" className="bg-[#DCFF37]/10 text-[#DCFF37]">
                    {matchAnalytics.team1_score > matchAnalytics.team2_score ? "CT Win" : matchAnalytics.team2_score > matchAnalytics.team1_score ? "T Win" : "Draw"}
                  </Chip>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Tabs */}
          <Tabs
            selectedKey={activeTab}
            onSelectionChange={(key) => setActiveTab(key as string)}
            variant="underlined"
            classNames={{
              tabList: "gap-6",
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
              key="players"
              title={
                <div className="flex items-center gap-2">
                  <Icon icon="solar:users-group-rounded-bold" width={18} />
                  <span>Players</span>
                </div>
              }
            />
            <Tab
              key="economy"
              title={
                <div className="flex items-center gap-2">
                  <Icon icon="solar:wallet-money-bold" width={18} />
                  <span>Economy</span>
                </div>
              }
            />
            <Tab
              key="rounds"
              title={
                <div className="flex items-center gap-2">
                  <Icon icon="solar:clock-circle-bold" width={18} />
                  <span>Rounds</span>
                </div>
              }
            />
          </Tabs>

          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Stat Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard
                  title="Total Kills"
                  value={aggregateStats?.totalKills || 0}
                  icon="solar:target-bold"
                  color={COLORS.primary}
                  progress={(aggregateStats?.totalKills || 0) / 150 * 100}
                />
                <StatCard
                  title="Avg Rating"
                  value={(aggregateStats?.avgRating || 0).toFixed(2)}
                  icon="solar:star-bold"
                  color={COLORS.success}
                  trend={aggregateStats?.avgRating && aggregateStats.avgRating >= 1 ? "up" : "down"}
                />
                <StatCard
                  title="Avg ADR"
                  value={(aggregateStats?.avgADR || 0).toFixed(1)}
                  icon="solar:fire-bold"
                  color={COLORS.warning}
                  progress={(aggregateStats?.avgADR || 0)}
                />
                <StatCard
                  title="Avg HS%"
                  value={`${(aggregateStats?.avgHSPct || 0).toFixed(0)}%`}
                  icon="solar:bolt-circle-bold"
                  color={COLORS.secondary}
                  progress={aggregateStats?.avgHSPct || 0}
                />
              </div>

              {/* Charts Row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-content1/50 backdrop-blur-sm border border-white/10">
                  <CardHeader>
                    <h3 className="text-lg font-semibold">Match Momentum</h3>
                  </CardHeader>
                  <CardBody>
                    <MomentumChart data={matchAnalytics.momentum_data} />
                  </CardBody>
                </Card>
                <Card className="bg-content1/50 backdrop-blur-sm border border-white/10">
                  <CardHeader>
                    <h3 className="text-lg font-semibold">Kill Distribution</h3>
                  </CardHeader>
                  <CardBody>
                    <KillDistributionChart players={matchAnalytics.players} />
                  </CardBody>
                </Card>
              </div>

              {/* Round Timeline */}
              <Card className="bg-content1/50 backdrop-blur-sm border border-white/10">
                <CardHeader>
                  <h3 className="text-lg font-semibold">Round Timeline</h3>
                </CardHeader>
                <CardBody>
                  <RoundTimeline rounds={matchAnalytics.round_data} />
                </CardBody>
              </Card>

              {/* Player Leaderboard */}
              <Card className="bg-content1/50 backdrop-blur-sm border border-white/10">
                <CardHeader>
                  <h3 className="text-lg font-semibold">Player Leaderboard</h3>
                </CardHeader>
                <CardBody>
                  <PlayerLeaderboard players={matchAnalytics.players} />
                </CardBody>
              </Card>
            </div>
          )}

          {/* Players Tab */}
          {activeTab === "players" && (
            <div className="space-y-6">
              {/* Player Comparison */}
              <Card className="bg-content1/50 backdrop-blur-sm border border-white/10">
                <CardHeader className="flex flex-row items-center justify-between">
                  <h3 className="text-lg font-semibold">Player Comparison</h3>
                  <div className="flex gap-2 flex-wrap">
                    {matchAnalytics.players.map((player) => (
                      <Chip
                        key={player.player_id}
                        variant={selectedPlayers.includes(player.player_id) ? "solid" : "flat"}
                        className={`cursor-pointer ${
                          selectedPlayers.includes(player.player_id)
                            ? "bg-[#DCFF37] text-black"
                            : ""
                        }`}
                        onClick={() => {
                          if (selectedPlayers.includes(player.player_id)) {
                            setSelectedPlayers(selectedPlayers.filter((id) => id !== player.player_id));
                          } else if (selectedPlayers.length < 4) {
                            setSelectedPlayers([...selectedPlayers, player.player_id]);
                          }
                        }}
                      >
                        {player.player_name}
                      </Chip>
                    ))}
                  </div>
                </CardHeader>
                <CardBody>
                  <PlayerRadarChart players={matchAnalytics.players} selectedPlayers={selectedPlayers} />
                </CardBody>
              </Card>

              {/* Detailed Player Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {matchAnalytics.players.map((player) => {
                  const stats = player.stats;
                  return (
                    <Card key={player.player_id} className="bg-content1/50 backdrop-blur-sm border border-white/10">
                      <CardBody className="p-4">
                        <div className="flex items-center gap-4 mb-4">
                          <Avatar
                            name={player.player_name.charAt(0)}
                            className={player.team === "CT" ? "bg-[#5D79AE]" : "bg-[#DE9B35]"}
                          />
                          <div>
                            <div className="font-semibold">{player.player_name}</div>
                            <Chip size="sm" variant="flat">{player.team}</Chip>
                          </div>
                          <div className="ml-auto text-right">
                            <div className="text-2xl font-bold text-[#DCFF37]">
                              {(stats?.rating_2 || 0).toFixed(2)}
                            </div>
                            <div className="text-xs text-default-400">Rating</div>
                          </div>
                        </div>
                        <div className="grid grid-cols-4 gap-4 text-center text-sm">
                          <div>
                            <div className="font-bold">{stats?.kills || 0}</div>
                            <div className="text-default-400">K</div>
                          </div>
                          <div>
                            <div className="font-bold">{stats?.deaths || 0}</div>
                            <div className="text-default-400">D</div>
                          </div>
                          <div>
                            <div className="font-bold">{stats?.assists || 0}</div>
                            <div className="text-default-400">A</div>
                          </div>
                          <div>
                            <div className="font-bold">{(stats?.adr || 0).toFixed(0)}</div>
                            <div className="text-default-400">ADR</div>
                          </div>
                        </div>
                        <Divider className="my-3" />
                        <div className="grid grid-cols-3 gap-4 text-center text-xs">
                          <div>
                            <div className="font-semibold">{stats?.headshots || 0}</div>
                            <div className="text-default-400">HS</div>
                          </div>
                          <div>
                            <div className="font-semibold">{(stats?.kast || 0).toFixed(0)}%</div>
                            <div className="text-default-400">KAST</div>
                          </div>
                          <div>
                            <div className="font-semibold">{stats?.opening_kills || 0}/{stats?.opening_deaths || 0}</div>
                            <div className="text-default-400">FK/FD</div>
                          </div>
                        </div>
                      </CardBody>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* Economy Tab */}
          {activeTab === "economy" && (
            <div className="space-y-6">
              <Card className="bg-content1/50 backdrop-blur-sm border border-white/10">
                <CardHeader>
                  <h3 className="text-lg font-semibold">Economy Flow</h3>
                </CardHeader>
                <CardBody>
                  <EconomyChart data={matchAnalytics.economy_data} />
                </CardBody>
              </Card>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard
                  title="CT Avg Equipment"
                  value={`$${Math.round(matchAnalytics.economy_data.reduce((s, e) => s + e.ct_equipment, 0) / matchAnalytics.economy_data.length).toLocaleString()}`}
                  icon="solar:shield-bold"
                  color={COLORS.ct}
                />
                <StatCard
                  title="T Avg Equipment"
                  value={`$${Math.round(matchAnalytics.economy_data.reduce((s, e) => s + e.t_equipment, 0) / matchAnalytics.economy_data.length).toLocaleString()}`}
                  icon="solar:shield-bold"
                  color={COLORS.t}
                />
                <StatCard
                  title="CT Peak Money"
                  value={`$${Math.max(...matchAnalytics.economy_data.map(e => e.ct_money)).toLocaleString()}`}
                  icon="solar:wallet-bold"
                  color={COLORS.ct}
                />
                <StatCard
                  title="T Peak Money"
                  value={`$${Math.max(...matchAnalytics.economy_data.map(e => e.t_money)).toLocaleString()}`}
                  icon="solar:wallet-bold"
                  color={COLORS.t}
                />
              </div>
            </div>
          )}

          {/* Rounds Tab */}
          {activeTab === "rounds" && (
            <div className="space-y-6">
              <Card className="bg-content1/50 backdrop-blur-sm border border-white/10">
                <CardHeader>
                  <h3 className="text-lg font-semibold">Round Details</h3>
                </CardHeader>
                <CardBody className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-content2/50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-default-500">Round</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-default-500">Winner</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-default-500">Win Type</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-default-500">First Blood</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-default-500">CT Alive</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-default-500">T Alive</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-default-500">Duration</th>
                        </tr>
                      </thead>
                      <tbody>
                        {matchAnalytics.round_data.map((round, idx) => (
                          <tr key={idx} className="border-t border-white/5 hover:bg-content2/30">
                            <td className="px-4 py-3 font-semibold">{round.round}</td>
                            <td className="px-4 py-3">
                              <Chip
                                size="sm"
                                variant="flat"
                                className={round.winner === "CT" ? "bg-[#5D79AE]/20 text-[#5D79AE]" : "bg-[#DE9B35]/20 text-[#DE9B35]"}
                              >
                                {round.winner}
                              </Chip>
                            </td>
                            <td className="px-4 py-3 text-default-400 capitalize">{round.win_type}</td>
                            <td className="px-4 py-3">
                              <span className="text-sm">{round.first_blood}</span>
                              <span className={`ml-2 text-xs ${round.first_blood_side === "CT" ? "text-[#5D79AE]" : "text-[#DE9B35]"}`}>
                                ({round.first_blood_side})
                              </span>
                            </td>
                            <td className="px-4 py-3 text-[#5D79AE]">{round.ct_alive}</td>
                            <td className="px-4 py-3 text-[#DE9B35]">{round.t_alive}</td>
                            <td className="px-4 py-3 text-default-400">{round.duration.toFixed(0)}s</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardBody>
              </Card>
            </div>
          )}
        </>
      )}
    </div>
  );
}

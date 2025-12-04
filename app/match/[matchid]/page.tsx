"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  Card,
  CardHeader,
  CardBody,
  Chip,
  Avatar,
  Button,
  Spinner,
  Tabs,
  Tab,
  Table,
  TableHeader,
  TableBody,
  TableColumn,
  TableRow,
  TableCell,
  Accordion,
  AccordionItem,
  Tooltip,
} from "@nextui-org/react";
import { Icon } from "@iconify/react";
import { ReplayAPISDK } from "@/types/replay-api/sdk";
import { ReplayApiSettingsMock } from "@/types/replay-api/settings";
import { logger } from "@/lib/logger";
import dynamic from "next/dynamic";
import {
  MatchTrajectoryResponse,
  MatchHeatmapResponse,
  MatchPositioningStatsResponse,
} from "@/types/replay-api/match-analytics.sdk";

// Dynamic imports for 3D components (client-side only)
const Map2DTrajectory3D = dynamic(
  () => import("@/components/replay/game-events/roundcard/map2d-trajectory3d"),
  { ssr: false, loading: () => <Spinner label="Loading 3D viewer..." /> }
);
const MatchHeatmap = dynamic(
  () => import("@/components/replay/game-events/roundcard/match-heatmap"),
  { ssr: false, loading: () => <Spinner label="Loading heatmap..." /> }
);

const sdk = new ReplayAPISDK(ReplayApiSettingsMock, logger);

/** Player stats within a match */
interface MatchPlayer {
  id?: string;
  name?: string;
  avatar?: string;
  kills?: number;
  deaths?: number;
  assists?: number;
  rating?: number;
}

/** Team within a match */
interface MatchTeam {
  name: string;
  logo?: string;
  score: number;
  players?: MatchPlayer[];
}

/** Round within a match */
interface MatchRound {
  winner?: string;
  reason?: string;
  duration?: string;
}

/** Match data from API */
interface MatchData {
  id?: string;
  title?: string;
  status?: string;
  game_id?: string;
  map_name?: string;
  created_at?: string;
  duration?: string;
  total_rounds?: number;
  total_kills?: number;
  mvp?: string;
  teams?: MatchTeam[];
  rounds?: MatchRound[];
}

export default function MatchDetailPage() {
  const params = useParams();
  const { data: session } = useSession();
  const matchId = params.matchid as string;

  const [match, setMatch] = useState<MatchData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState("overview");

  // Analytics data states
  const [trajectoryData, setTrajectoryData] = useState<MatchTrajectoryResponse | null>(null);
  const [heatmapData, setHeatmapData] = useState<MatchHeatmapResponse | null>(null);
  const [positioningStats, setPositioningStats] = useState<MatchPositioningStatsResponse | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  useEffect(() => {
    async function fetchMatch() {
      try {
        setLoading(true);
        setError(null);

        const gameId = "cs2"; // Get from query param or default
        const matchData = await sdk.matches.getMatch(gameId, matchId);

        if (!matchData) {
          setError("Match not found");
          return;
        }

        setMatch(matchData as MatchData);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to load match";
        logger.error("Failed to fetch match", err);
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    }

    if (matchId) {
      fetchMatch();
    }
  }, [matchId]);

  // Fetch analytics data when analytics tab is selected
  useEffect(() => {
    async function fetchAnalytics() {
      if (selectedTab !== "analytics" || !matchId || analyticsLoading) return;
      if (trajectoryData || heatmapData) return; // Already loaded

      try {
        setAnalyticsLoading(true);
        const gameId = "cs2";

        // Fetch all analytics data in parallel
        const [trajectory, heatmap, stats] = await Promise.all([
          sdk.matchAnalytics.getMatchTrajectory(gameId, matchId, { sample_rate: 64 }),
          sdk.matchAnalytics.getMatchHeatmap(gameId, matchId, { grid_size: 64, include_zones: true }),
          sdk.matchAnalytics.getPositioningStats(gameId, matchId),
        ]);

        setTrajectoryData(trajectory);
        setHeatmapData(heatmap);
        setPositioningStats(stats);
      } catch (err) {
        logger.error("Failed to fetch analytics data", err);
      } finally {
        setAnalyticsLoading(false);
      }
    }

    fetchAnalytics();
  }, [selectedTab, matchId, analyticsLoading, trajectoryData, heatmapData]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner size="lg" label="Loading match details..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Card className="max-w-md">
          <CardBody className="text-center">
            <Icon icon="mdi:alert-circle" className="text-danger mx-auto mb-4" width={48} />
            <p className="text-danger font-semibold mb-2">Error loading match</p>
            <p className="text-default-500 mb-4">{error}</p>
            <Button color="primary" onPress={() => window.location.reload()}>
              Retry
            </Button>
          </CardBody>
        </Card>
      </div>
    );
  }

  if (!match) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Card className="max-w-md">
          <CardBody className="text-center">
            <Icon icon="mdi:file-question" className="text-default-400 mx-auto mb-4" width={48} />
            <p className="text-default-500">Match not found</p>
          </CardBody>
        </Card>
      </div>
    );
  }

  const teamA = match.teams?.[0] || { name: "Team A", score: 0, players: [] };
  const teamB = match.teams?.[1] || { name: "Team B", score: 0, players: [] };
  const winner = teamA.score > teamB.score ? "A" : "B";

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Match Header */}
      <Card className="mb-6 bg-gradient-to-r from-primary-50 to-secondary-50 dark:from-primary-900/20 dark:to-secondary-900/20">
        <CardBody className="p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Chip
                  color={match.status === "completed" ? "success" : "warning"}
                  variant="flat"
                  size="sm"
                >
                  {match.status || "Completed"}
                </Chip>
                <Chip variant="flat" size="sm" startContent={<Icon icon="mdi:gamepad" />}>
                  {match.game_id?.toUpperCase() || "CS2"}
                </Chip>
                <Chip variant="flat" size="sm">
                  {match.map_name || "de_dust2"}
                </Chip>
              </div>
              <h1 className="text-3xl font-bold mb-2">
                {match.title || `Match #${matchId.slice(0, 8)}`}
              </h1>
              <p className="text-default-500">
                {new Date(match.created_at || Date.now()).toLocaleString()}
              </p>
            </div>
            
            <div className="flex gap-2">
              <Tooltip content="Share match">
                <Button isIconOnly variant="flat" size="sm">
                  <Icon icon="mdi:share-variant" width={20} />
                </Button>
              </Tooltip>
              <Tooltip content="Download replay">
                <Button isIconOnly variant="flat" size="sm">
                  <Icon icon="mdi:download" width={20} />
                </Button>
              </Tooltip>
              {session && (
                <Tooltip content="Add to favorites">
                  <Button isIconOnly variant="flat" size="sm" color="danger">
                    <Icon icon="mdi:heart-outline" width={20} />
                  </Button>
                </Tooltip>
              )}
            </div>
          </div>

          {/* Score Display */}
          <div className="mt-6 flex items-center justify-center gap-8">
            <div className="text-center flex-1 max-w-xs">
              <p className="text-sm text-default-500 mb-2">Team A</p>
              <div className="flex items-center justify-center gap-3">
                <Avatar
                  src={teamA.logo}
                  name={teamA.name}
                  size="lg"
                  className="border-2 border-primary"
                />
                <div>
                  <p className="text-xl font-bold">{teamA.name}</p>
                  <p className="text-4xl font-bold text-primary">{teamA.score}</p>
                </div>
              </div>
            </div>

            <div className="text-center">
              <Icon icon="mdi:versus" className="text-default-300" width={32} />
              {winner && (
                <Chip color="success" size="sm" className="mt-2">
                  Team {winner} Wins
                </Chip>
              )}
            </div>

            <div className="text-center flex-1 max-w-xs">
              <p className="text-sm text-default-500 mb-2">Team B</p>
              <div className="flex items-center justify-center gap-3">
                <div className="text-right">
                  <p className="text-xl font-bold">{teamB.name}</p>
                  <p className="text-4xl font-bold text-secondary">{teamB.score}</p>
                </div>
                <Avatar
                  src={teamB.logo}
                  name={teamB.name}
                  size="lg"
                  className="border-2 border-secondary"
                />
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Tabs for different views */}
      <Tabs
        selectedKey={selectedTab}
        onSelectionChange={(key) => setSelectedTab(key as string)}
        variant="underlined"
        className="mb-6"
      >
        <Tab key="overview" title="Overview">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Team A Players */}
            <Card>
              <CardHeader className="bg-primary/10">
                <h3 className="text-lg font-semibold">Team A Players</h3>
              </CardHeader>
              <CardBody>
                <Table hideHeader removeWrapper aria-label="Team A players">
                  <TableHeader>
                    <TableColumn>Player</TableColumn>
                    <TableColumn>K</TableColumn>
                    <TableColumn>D</TableColumn>
                    <TableColumn>A</TableColumn>
                    <TableColumn>Rating</TableColumn>
                  </TableHeader>
                  <TableBody>
                    {(teamA.players || []).map((player: MatchPlayer, idx: number) => (
                      <TableRow key={idx}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar src={player.avatar} name={player.name} size="sm" />
                            <span>{player.name || `Player ${idx + 1}`}</span>
                          </div>
                        </TableCell>
                        <TableCell>{player.kills || 0}</TableCell>
                        <TableCell>{player.deaths || 0}</TableCell>
                        <TableCell>{player.assists || 0}</TableCell>
                        <TableCell>
                          <Chip size="sm" variant="flat">
                            {player.rating?.toFixed(2) || "1.00"}
                          </Chip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardBody>
            </Card>

            {/* Team B Players */}
            <Card>
              <CardHeader className="bg-secondary/10">
                <h3 className="text-lg font-semibold">Team B Players</h3>
              </CardHeader>
              <CardBody>
                <Table hideHeader removeWrapper aria-label="Team B players">
                  <TableHeader>
                    <TableColumn>Player</TableColumn>
                    <TableColumn>K</TableColumn>
                    <TableColumn>D</TableColumn>
                    <TableColumn>A</TableColumn>
                    <TableColumn>Rating</TableColumn>
                  </TableHeader>
                  <TableBody>
                    {(teamB.players || []).map((player: MatchPlayer, idx: number) => (
                      <TableRow key={idx}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar src={player.avatar} name={player.name} size="sm" />
                            <span>{player.name || `Player ${idx + 1}`}</span>
                          </div>
                        </TableCell>
                        <TableCell>{player.kills || 0}</TableCell>
                        <TableCell>{player.deaths || 0}</TableCell>
                        <TableCell>{player.assists || 0}</TableCell>
                        <TableCell>
                          <Chip size="sm" variant="flat">
                            {player.rating?.toFixed(2) || "1.00"}
                          </Chip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardBody>
            </Card>
          </div>

          {/* Match Stats */}
          <Card className="mt-6">
            <CardHeader>
              <h3 className="text-lg font-semibold">Match Statistics</h3>
            </CardHeader>
            <CardBody>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-sm text-default-500">Duration</p>
                  <p className="text-2xl font-bold">{match.duration || "45:32"}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-default-500">Total Rounds</p>
                  <p className="text-2xl font-bold">{match.total_rounds || teamA.score + teamB.score}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-default-500">Total Kills</p>
                  <p className="text-2xl font-bold">{match.total_kills || "N/A"}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-default-500">MVP</p>
                  <Chip color="warning" variant="flat">
                    {match.mvp || "TBD"}
                  </Chip>
                </div>
              </div>
            </CardBody>
          </Card>
        </Tab>

        <Tab key="rounds" title="Rounds">
          <Card>
            <CardBody>
              <Accordion variant="splitted">
                {(match.rounds || []).map((round: MatchRound, idx: number) => (
                  <AccordionItem
                    key={idx}
                    title={
                      <div className="flex items-center gap-3">
                        <Avatar
                          name={round.winner === "T" ? "T" : "CT"}
                          color={round.winner === "T" ? "warning" : "primary"}
                          size="sm"
                        />
                        <span>Round {idx + 1}</span>
                        {round.reason && (
                          <Chip size="sm" variant="flat">
                            {round.reason}
                          </Chip>
                        )}
                      </div>
                    }
                    subtitle={`Winner: ${round.winner} | Duration: ${round.duration || "N/A"}`}
                  >
                    <div className="pl-4">
                      <p className="text-sm text-default-500">
                        Round details would be displayed here with player actions, kills, bomb events, etc.
                      </p>
                    </div>
                  </AccordionItem>
                ))}
              </Accordion>
              
              {(!match.rounds || match.rounds.length === 0) && (
                <div className="text-center py-8">
                  <Icon icon="mdi:information" className="text-default-300 mx-auto mb-2" width={48} />
                  <p className="text-default-500">Round details not available for this match</p>
                </div>
              )}
            </CardBody>
          </Card>
        </Tab>

        <Tab key="timeline" title="Timeline">
          <Card>
            <CardBody>
              <div className="text-center py-8">
                <Icon icon="mdi:timeline-clock" className="text-default-300 mx-auto mb-2" width={48} />
                <p className="text-default-500">Timeline feature coming soon</p>
              </div>
            </CardBody>
          </Card>
        </Tab>

        <Tab key="analytics" title="Analytics">
          {analyticsLoading ? (
            <div className="flex justify-center items-center py-12">
              <Spinner size="lg" label="Loading analytics data..." />
            </div>
          ) : (
            <div className="space-y-6">
              {/* Trajectory 3D Visualization */}
              <Card>
                <CardHeader className="pb-0">
                  <div className="flex items-center gap-2">
                    <Icon icon="mdi:map-marker-path" className="text-primary" width={24} />
                    <h3 className="text-lg font-semibold">Player Trajectories</h3>
                  </div>
                </CardHeader>
                <CardBody>
                  <Suspense fallback={<Spinner label="Loading 3D viewer..." />}>
                    <Map2DTrajectory3D
                      trajectoryData={trajectoryData}
                      mapName={match?.map_name || "de_dust2"}
                    />
                  </Suspense>
                </CardBody>
              </Card>

              {/* Heatmap Visualization */}
              <Card>
                <CardHeader className="pb-0">
                  <div className="flex items-center gap-2">
                    <Icon icon="mdi:fire" className="text-danger" width={24} />
                    <h3 className="text-lg font-semibold">Position Heatmap</h3>
                  </div>
                </CardHeader>
                <CardBody>
                  <Suspense fallback={<Spinner label="Loading heatmap..." />}>
                    <MatchHeatmap
                      heatmapData={heatmapData}
                      mapName={match?.map_name || "de_dust2"}
                    />
                  </Suspense>
                </CardBody>
              </Card>

              {/* Positioning Stats */}
              {positioningStats && (
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Icon icon="mdi:chart-bar" className="text-success" width={24} />
                      <h3 className="text-lg font-semibold">Positioning Statistics</h3>
                    </div>
                  </CardHeader>
                  <CardBody>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {positioningStats.player_stats?.map((player) => (
                        <Card key={player.player_id} className="bg-default-50">
                          <CardBody className="p-4">
                            <div className="flex items-center justify-between mb-3">
                              <span className="font-semibold">{player.player_name || player.player_id.slice(0, 8)}</span>
                            </div>
                            <div className="grid grid-cols-3 gap-2 text-sm">
                              <div className="text-center">
                                <p className="text-default-500">Avg Speed</p>
                                <p className="font-bold">{player.average_speed?.toFixed(1) || "N/A"}</p>
                              </div>
                              <div className="text-center">
                                <p className="text-default-500">Distance</p>
                                <p className="font-bold">{player.total_distance?.toFixed(0) || "N/A"}</p>
                              </div>
                              <div className="text-center">
                                <p className="text-default-500">Zones</p>
                                <p className="font-bold">{player.zones_visited || "N/A"}</p>
                              </div>
                            </div>
                          </CardBody>
                        </Card>
                      ))}
                    </div>
                  </CardBody>
                </Card>
              )}
            </div>
          )}
        </Tab>
      </Tabs>
    </div>
  );
}

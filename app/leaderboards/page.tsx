"use client";

import React, { useState, useEffect } from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableColumn,
  TableRow,
  TableCell,
  Avatar,
  Chip,
  Button,
  Tabs,
  Tab,
  Card,
  CardBody,
  Select,
  SelectItem,
  Spinner,
} from "@nextui-org/react";
import { Icon } from "@iconify/react";
import { title, subtitle } from "@/components/primitives";
import { ReplayAPISDK } from "@/types/replay-api/sdk";
import { ReplayApiSettingsMock } from "@/types/replay-api/settings";
import { PlayerProfile, Squad } from "@/types/replay-api/entities.types";
import { logger } from "@/lib/logger";

const sdk = new ReplayAPISDK(ReplayApiSettingsMock, logger);

/** Extended player profile with stats from API */
interface PlayerProfileWithStats extends PlayerProfile {
  rating?: number;
  stats?: {
    wins?: number;
    losses?: number;
    win_rate?: number;
    kd_ratio?: number;
  };
  country?: string;
}

/** Extended squad with stats from API */
interface SquadWithStats extends Squad {
  rating?: number;
  stats?: {
    wins?: number;
    losses?: number;
    win_rate?: number;
  };
  region?: string;
}

interface LeaderboardPlayer {
  rank: number;
  previousRank: number;
  name: string;
  avatar: string;
  rating: number;
  wins: number;
  losses: number;
  winRate: number;
  kd: number;
  tier: string;
  country: string;
}

interface LeaderboardTeam {
  rank: number;
  previousRank: number;
  name: string;
  avatar: string;
  rating: number;
  wins: number;
  losses: number;
  winRate: number;
  members: number;
  country: string;
}

export default function LeaderboardsPage() {
  const [selectedTab, setSelectedTab] = useState("players");
  const [selectedRegion, setSelectedRegion] = useState("global");
  const [selectedGame, setSelectedGame] = useState("cs2");
  const [playerLeaderboard, setPlayerLeaderboard] = useState<LeaderboardPlayer[]>([]);
  const [teamLeaderboard, setTeamLeaderboard] = useState<LeaderboardTeam[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch leaderboard data from API
  useEffect(() => {
    async function fetchLeaderboards() {
      try {
        setLoading(true);
        setError(null);

        const gameId = selectedGame === "all" ? undefined : selectedGame;
        const region = selectedRegion === "global" ? undefined : selectedRegion;

        // Fetch player leaderboard
        const players = await sdk.playerProfiles.getLeaderboard({
          game_id: gameId,
          region,
          limit: 50,
        });

        // Map API data to leaderboard interface
        const mappedPlayers: LeaderboardPlayer[] = players.map((p: PlayerProfileWithStats, index: number) => ({
          rank: index + 1,
          previousRank: index + 1, // API would need to track this
          name: p.nickname || "Unknown",
          avatar: p.avatar_uri || `https://i.pravatar.cc/150?u=${p.id}`,
          rating: p.rating || 0,
          wins: p.stats?.wins || 0,
          losses: p.stats?.losses || 0,
          winRate: p.stats?.win_rate || 0,
          kd: p.stats?.kd_ratio || 0,
          tier: getTierFromRating(p.rating || 0),
          country: p.country || "XX",
        }));

        // Fetch team leaderboard
        const teams = await sdk.squads.getLeaderboard({
          game_id: gameId,
          region,
          limit: 20,
        });

        // Map API data to team leaderboard interface
        const mappedTeams = teams.map((t: SquadWithStats, index: number) => ({
          rank: index + 1,
          previousRank: index + 1,
          name: t.name || "Unknown Team",
          avatar: t.logo_uri || "https://avatars.githubusercontent.com/u/168373383",
          rating: t.rating || 0,
          wins: t.stats?.wins || 0,
          losses: t.stats?.losses || 0,
          winRate: t.stats?.win_rate || 0,
          members: Object.keys(t.members || {}).length || 5,
          country: t.region || "XX",
        }));

        // Use API data
        setPlayerLeaderboard(mappedPlayers);
        setTeamLeaderboard(mappedTeams);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to load leaderboards";
        logger.error("Failed to fetch leaderboards", err);
        setError(errorMessage);
        // Don't use mock data - show empty state when API fails
        setPlayerLeaderboard([]);
        setTeamLeaderboard([]);
      } finally {
        setLoading(false);
      }
    }

    fetchLeaderboards();
  }, [selectedGame, selectedRegion]);

  // Helper function to determine tier from rating
  function getTierFromRating(rating: number): string {
    if (rating >= 4500) return "Challenger";
    if (rating >= 4000) return "Grandmaster";
    if (rating >= 3500) return "Master";
    if (rating >= 3000) return "Diamond";
    if (rating >= 2500) return "Platinum";
    if (rating >= 2000) return "Gold";
    if (rating >= 1500) return "Silver";
    return "Bronze";
  }

  // Use unfiltered leaderboards (global search in navbar handles searching)
  const filteredPlayerLeaderboard = playerLeaderboard;
  const filteredTeamLeaderboard = teamLeaderboard;

  const getRankChangeIcon = (current: number, previous: number) => {
    if (current < previous) {
      return <Icon icon="mdi:arrow-up" className="text-success" />;
    } else if (current > previous) {
      return <Icon icon="mdi:arrow-down" className="text-danger" />;
    }
    return <Icon icon="mdi:minus" className="text-default-400" />;
  };

  const getRankBadgeColor = (rank: number) => {
    if (rank === 1) return "warning";
    if (rank === 2) return "default";
    if (rank === 3) return "warning";
    return "primary";
  };

  return (
    <div className="flex w-full flex-col items-center gap-8 px-4 py-8 lg:px-24">
      {/* Header */}
      <div className="flex w-full max-w-7xl flex-col items-center text-center gap-2">
        <h2 className="text-secondary font-medium">Global Rankings</h2>
        <h1 className={title({ size: "lg" })}>Leaderboards</h1>
        <p className={subtitle({ class: "mt-2 max-w-2xl" })}>
          Track the top players and teams across all competitive games. Rankings updated daily.
        </p>
      </div>

      {/* Filters */}
      <Card className="w-full max-w-7xl">
        <CardBody>
          <div className="flex flex-col md:flex-row gap-4 items-center justify-center">
            <Select
              label="Game"
              selectedKeys={[selectedGame]}
              onSelectionChange={(keys) => setSelectedGame(Array.from(keys)[0] as string)}
              className="w-full md:w-48"
              variant="bordered"
            >
              <SelectItem key="cs2" value="cs2">CS2</SelectItem>
              <SelectItem key="csgo" value="csgo">CS:GO</SelectItem>
              <SelectItem key="valorant" value="valorant">Valorant</SelectItem>
            </Select>
            <Select
              label="Region"
              selectedKeys={[selectedRegion]}
              onSelectionChange={(keys) => setSelectedRegion(Array.from(keys)[0] as string)}
              className="w-full md:w-48"
              variant="bordered"
            >
              <SelectItem key="global" value="global">Global</SelectItem>
              <SelectItem key="na" value="na">North America</SelectItem>
              <SelectItem key="eu" value="eu">Europe</SelectItem>
              <SelectItem key="asia" value="asia">Asia</SelectItem>
              <SelectItem key="sa" value="sa">South America</SelectItem>
            </Select>
            <p className="text-tiny text-default-400 hidden md:block">
              Use ⌘+` to search players or teams
            </p>
          </div>
        </CardBody>
      </Card>

      {/* Loading State */}
      {loading && (
        <div className="w-full max-w-7xl flex justify-center py-12">
          <Spinner size="lg" label="Loading leaderboards..." color="primary" />
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <Card className="w-full max-w-md">
          <CardBody className="text-center">
            <Icon icon="mdi:alert-circle" className="text-danger mx-auto mb-4" width={48} />
            <p className="text-danger font-semibold mb-2">Error loading leaderboards</p>
            <p className="text-default-500 mb-4">{error}</p>
            <p className="text-xs text-default-400">Showing cached data</p>
          </CardBody>
        </Card>
      )}

      {/* Leaderboard Tabs */}
      {!loading && (
      <div className="w-full max-w-7xl">
        <Tabs
          selectedKey={selectedTab}
          onSelectionChange={(key) => setSelectedTab(key as string)}
          variant="underlined"
          classNames={{
            tabList: "gap-6 w-full",
            cursor: "bg-primary",
            tab: "h-12",
            panel: "pt-6",
          }}
        >
          <Tab
            key="players"
            title={
              <div className="flex items-center gap-2">
                <Icon icon="mdi:account" width={20} />
                <span>Players ({filteredPlayerLeaderboard.length})</span>
              </div>
            }
          >
            <Card>
              <CardBody className="p-0">
                <Table
                  aria-label="Player leaderboard"
                  classNames={{
                    wrapper: "shadow-none",
                    th: "bg-default-100",
                  }}
                >
                  <TableHeader>
                    <TableColumn className="w-20">RANK</TableColumn>
                    <TableColumn>PLAYER</TableColumn>
                    <TableColumn className="text-center">RATING</TableColumn>
                    <TableColumn className="text-center hidden md:table-cell">W/L</TableColumn>
                    <TableColumn className="text-center hidden md:table-cell">WIN RATE</TableColumn>
                    <TableColumn className="text-center hidden lg:table-cell">K/D</TableColumn>
                    <TableColumn className="text-center">TIER</TableColumn>
                  </TableHeader>
                  <TableBody emptyContent="No players found">
                    {filteredPlayerLeaderboard.map((player) => (
                      <TableRow key={player.rank} className="hover:bg-default-50">
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Chip
                              size="sm"
                              variant={player.rank <= 3 ? "shadow" : "flat"}
                              color={getRankBadgeColor(player.rank)}
                              className="font-bold min-w-12"
                            >
                              #{player.rank}
                            </Chip>
                            <div className="hidden md:block">
                              {getRankChangeIcon(player.rank, player.previousRank)}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar
                              src={player.avatar}
                              size="sm"
                              className="flex-shrink-0"
                            />
                            <div className="flex flex-col">
                              <span className="font-semibold">{player.name}</span>
                              <span className="text-xs text-default-400">{player.country}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-center">
                            <Chip size="sm" variant="flat" color="primary">
                              {player.rating}
                            </Chip>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <div className="text-center">
                            <span className="text-success font-semibold">{player.wins}</span>
                            <span className="text-default-400"> / </span>
                            <span className="text-danger font-semibold">{player.losses}</span>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <div className="text-center font-semibold">
                            {player.winRate.toFixed(1)}%
                          </div>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <div className="text-center font-mono">
                            {player.kd.toFixed(2)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-center">
                            <Chip
                              size="sm"
                              variant="flat"
                              className="text-xs"
                              style={{
                                backgroundColor:
                                  player.tier === "Challenger"
                                    ? "#DCFF3730"
                                    : player.tier === "Grandmaster"
                                    ? "#E74C3C30"
                                    : "#9B59B630",
                              }}
                            >
                              {player.tier}
                            </Chip>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardBody>
            </Card>
          </Tab>

          <Tab
            key="teams"
            title={
              <div className="flex items-center gap-2">
                <Icon icon="mdi:account-group" width={20} />
                <span>Teams ({filteredTeamLeaderboard.length})</span>
              </div>
            }
          >
            <Card>
              <CardBody className="p-0">
                <Table
                  aria-label="Team leaderboard"
                  classNames={{
                    wrapper: "shadow-none",
                    th: "bg-default-100",
                  }}
                >
                  <TableHeader>
                    <TableColumn className="w-20">RANK</TableColumn>
                    <TableColumn>TEAM</TableColumn>
                    <TableColumn className="text-center">RATING</TableColumn>
                    <TableColumn className="text-center hidden md:table-cell">W/L</TableColumn>
                    <TableColumn className="text-center hidden md:table-cell">WIN RATE</TableColumn>
                    <TableColumn className="text-center hidden lg:table-cell">MEMBERS</TableColumn>
                  </TableHeader>
                  <TableBody emptyContent="No teams found">
                    {filteredTeamLeaderboard.map((team) => (
                      <TableRow key={team.rank} className="hover:bg-default-50">
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Chip
                              size="sm"
                              variant={team.rank <= 3 ? "shadow" : "flat"}
                              color={getRankBadgeColor(team.rank)}
                              className="font-bold min-w-12"
                            >
                              #{team.rank}
                            </Chip>
                            <div className="hidden md:block">
                              {getRankChangeIcon(team.rank, team.previousRank)}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar
                              src={team.avatar}
                              size="sm"
                              className="flex-shrink-0"
                            />
                            <div className="flex flex-col">
                              <span className="font-semibold">{team.name}</span>
                              <span className="text-xs text-default-400">{team.country}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-center">
                            <Chip size="sm" variant="flat" color="primary">
                              {team.rating}
                            </Chip>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <div className="text-center">
                            <span className="text-success font-semibold">{team.wins}</span>
                            <span className="text-default-400"> / </span>
                            <span className="text-danger font-semibold">{team.losses}</span>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <div className="text-center font-semibold">
                            {team.winRate.toFixed(1)}%
                          </div>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <div className="flex justify-center">
                            <Chip size="sm" variant="flat">
                              {team.members} players
                            </Chip>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardBody>
            </Card>
          </Tab>
        </Tabs>
      </div>
      )}

      {/* Info Card */}
      <Card className="w-full max-w-7xl bg-gradient-to-r from-primary-50 to-secondary-50">
        <CardBody className="text-center py-8">
          <Icon icon="mdi:information" className="text-4xl mx-auto mb-2 text-primary" />
          <h3 className="text-lg font-semibold mb-2">Rankings Update Schedule</h3>
          <p className="text-default-600">
            Leaderboards are updated daily at 00:00 UTC. Play ranked matches to climb the ladder and earn your place among the top players!
          </p>
        </CardBody>
      </Card>
    </div>
  );
}

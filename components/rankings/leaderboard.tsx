"use client";

import React, { useState } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Chip,
  Avatar,
  Progress,
  Tabs,
  Tab,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Tooltip,
  Pagination,
  Badge,
  Skeleton,
} from "@nextui-org/react";
import { Icon } from "@iconify/react";

import { GAME_CONFIGS, getRankTier, getActiveGames } from "@/config/games";
import type { GameId, RankTier } from "@/types/games";

export interface LeaderboardProps {
  /** Selected game ID */
  gameId?: GameId;
  /** Leaderboard type */
  type?: "global" | "regional" | "seasonal" | "weekly" | "friends";
  /** Region filter */
  region?: string;
  /** Season ID */
  seasonId?: string;
  /** Number of entries per page */
  pageSize?: number;
  /** Current player ID (for highlighting) */
  currentPlayerId?: string;
  /** Custom class name */
  className?: string;
  /** Show game selector */
  showGameSelector?: boolean;
}

export interface LeaderboardEntry {
  rank: number;
  previousRank?: number;
  playerId: string;
  playerName: string;
  playerAvatar?: string;
  teamName?: string;
  teamLogo?: string;
  rating: number;
  tier: RankTier;
  wins: number;
  losses: number;
  winRate: number;
  gamesPlayed: number;
  streak?: {
    type: "win" | "loss";
    count: number;
  };
  badges?: string[];
  region?: string;
  country?: string;
  lastActive?: Date;
}

// Mock data generator
const generateMockLeaderboard = (
  gameId: GameId,
  count: number
): LeaderboardEntry[] => {
  const names = [
    "s1mple",
    "ZywOo",
    "NiKo",
    "device",
    "m0NESY",
    "Kscerato",
    "sh1ro",
    "b1t",
    "YEKINDAR",
    "Jame",
    "stavn",
    "blameF",
    "Magisk",
    "cadiaN",
    "dupreeh",
    "electroNic",
    "Perfecto",
    "Boombl4",
    "rain",
    "karrigan",
    "ropz",
    "Twistzz",
    "EliGE",
    "NAF",
    "Glaive",
    "k0nfig",
    "broky",
    "olof",
    "flusha",
    "krimz",
  ];

  return Array.from({ length: count }, (_, i) => {
    const rating = Math.max(
      100,
      3500 - i * 35 - Math.floor(Math.random() * 50)
    );
    const tier = getRankTier(gameId, rating);
    const wins = Math.floor(Math.random() * 300) + 100;
    const losses = Math.floor(Math.random() * 200) + 50;

    return {
      rank: i + 1,
      previousRank: i + 1 + Math.floor(Math.random() * 5) - 2,
      playerId: `player-${i + 1}`,
      playerName:
        names[i % names.length] +
        (i >= names.length ? `_${Math.floor(i / names.length)}` : ""),
      rating,
      tier: tier || {
        id: "unranked",
        name: "Unranked",
        minRating: 0,
        icon: "❓",
      },
      wins,
      losses,
      winRate: Math.round((wins / (wins + losses)) * 100),
      gamesPlayed: wins + losses,
      streak:
        Math.random() > 0.5
          ? {
              type: Math.random() > 0.5 ? "win" : "loss",
              count: Math.floor(Math.random() * 8) + 1,
            }
          : undefined,
      badges:
        Math.random() > 0.7
          ? ["verified", Math.random() > 0.5 ? "pro" : "streamer"].filter(
              () => Math.random() > 0.5
            )
          : [],
      region: ["NA", "EU", "SA", "ASIA"][Math.floor(Math.random() * 4)],
      country: ["US", "SE", "BR", "RU", "DK", "DE", "FR", "PL"][
        Math.floor(Math.random() * 8)
      ],
      lastActive: new Date(Date.now() - Math.floor(Math.random() * 86400000)),
    };
  });
};

/**
 * Premium leaderboard component for competitive rankings.
 * Features:
 * - Multiple leaderboard types (global, regional, seasonal, weekly, friends)
 * - Game-specific rankings
 * - Animated rank changes
 * - Player highlighting
 * - Filtering and pagination
 */
export function Leaderboard({
  gameId: initialGameId,
  type = "global",
  region: _region,
  seasonId: _seasonId,
  pageSize = 25,
  currentPlayerId,
  className = "",
  showGameSelector = true,
}: LeaderboardProps) {
  const [selectedGame, setSelectedGame] = useState<GameId>(
    initialGameId || "cs2"
  );
  const [selectedType, setSelectedType] = useState(type);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading] = useState(false);

  const game = GAME_CONFIGS[selectedGame];
  const activeGames = getActiveGames();

  // Generate mock data (replace with API call)
  const [leaderboardData] = useState<LeaderboardEntry[]>(() =>
    generateMockLeaderboard(selectedGame, 100)
  );

  const paginatedData = leaderboardData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const totalPages = Math.ceil(leaderboardData.length / pageSize);

  const getRankChangeIcon = (current: number, previous?: number) => {
    if (!previous || current === previous) {
      return <Icon icon="solar:minus-linear" className="text-default-400" />;
    }
    if (current < previous) {
      return (
        <Tooltip content={`Up ${previous - current}`}>
          <span className="text-success flex items-center">
            <Icon icon="solar:arrow-up-bold" />
            {previous - current}
          </span>
        </Tooltip>
      );
    }
    return (
      <Tooltip content={`Down ${current - previous}`}>
        <span className="text-danger flex items-center">
          <Icon icon="solar:arrow-down-bold" />
          {current - previous}
        </span>
      </Tooltip>
    );
  };

  const getBadgeIcon = (badge: string) => {
    switch (badge) {
      case "verified":
        return (
          <Icon icon="solar:verified-check-bold" className="text-primary" />
        );
      case "pro":
        return <Icon icon="solar:crown-bold" className="text-amber-500" />;
      case "streamer":
        return (
          <Icon
            icon="solar:videocamera-record-bold"
            className="text-purple-500"
          />
        );
      default:
        return null;
    }
  };

  const getRankMedal = (rank: number) => {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return null;
  };

  if (!game) {
    return (
      <Card className={className}>
        <CardBody className="text-center py-12">
          <Icon
            icon="solar:ranking-bold"
            className="text-4xl text-default-300 mx-auto mb-2"
          />
          <p className="text-default-500">Select a game to view leaderboard</p>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card className={`leaderboard overflow-hidden ${className}`}>
      <CardHeader
        className="flex-col items-start gap-4 p-4"
        style={{
          background: `linear-gradient(135deg, ${game.color.primary}20, ${game.color.secondary})`,
        }}
      >
        {/* Header row */}
        <div className="flex items-center justify-between w-full flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: game.color.primary + "30" }}
            >
              <Icon
                icon={game.icon}
                className="text-2xl"
                style={{ color: game.color.primary }}
              />
            </div>
            <div>
              <h2 className="font-gaming font-bold text-xl">
                {selectedType === "global"
                  ? "Global"
                  : selectedType === "regional"
                  ? "Regional"
                  : selectedType === "seasonal"
                  ? "Seasonal"
                  : selectedType === "weekly"
                  ? "Weekly"
                  : "Friends"}{" "}
                Leaderboard
              </h2>
              <p className="text-sm text-default-500">{game.name}</p>
            </div>
          </div>

          {/* Game selector dropdown */}
          {showGameSelector && (
            <Dropdown>
              <DropdownTrigger>
                <Button
                  variant="bordered"
                  className="font-gaming"
                  startContent={<Icon icon={game.icon} />}
                  endContent={<Icon icon="solar:alt-arrow-down-bold" />}
                >
                  {game.shortName}
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                aria-label="Select game"
                selectedKeys={new Set([selectedGame])}
                selectionMode="single"
                onSelectionChange={(keys) => {
                  const key = Array.from(keys)[0] as GameId;
                  if (key) setSelectedGame(key);
                }}
              >
                {activeGames.map((g) => (
                  <DropdownItem
                    key={g.id}
                    startContent={<Icon icon={g.icon} />}
                  >
                    {g.name}
                  </DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>
          )}
        </div>

        {/* Leaderboard type tabs */}
        <Tabs
          selectedKey={selectedType}
          onSelectionChange={(key) =>
            setSelectedType(key as typeof selectedType)
          }
          variant="solid"
          color="primary"
          classNames={{
            tabList: "bg-content2/50 backdrop-blur-md",
          }}
        >
          <Tab key="global" title="Global" />
          <Tab key="regional" title="Regional" />
          <Tab key="seasonal" title="Seasonal" />
          <Tab key="weekly" title="Weekly" />
          <Tab key="friends" title="Friends" />
        </Tabs>
      </CardHeader>

      <CardBody className="p-0">
        {/* Stats summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-content2/30">
          <div className="text-center">
            <p
              className="text-2xl font-gaming font-bold"
              style={{ color: game.color.primary }}
            >
              {leaderboardData.length.toLocaleString()}
            </p>
            <p className="text-xs text-default-500">Total Players</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-gaming font-bold">
              {Math.round(
                leaderboardData.reduce((acc, e) => acc + e.rating, 0) /
                  leaderboardData.length
              )}
            </p>
            <p className="text-xs text-default-500">Avg Rating</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-gaming font-bold">
              {Math.round(
                leaderboardData.reduce((acc, e) => acc + e.winRate, 0) /
                  leaderboardData.length
              )}
              %
            </p>
            <p className="text-xs text-default-500">Avg Win Rate</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-gaming font-bold">
              {leaderboardData
                .reduce((acc, e) => acc + e.gamesPlayed, 0)
                .toLocaleString()}
            </p>
            <p className="text-xs text-default-500">Total Games</p>
          </div>
        </div>

        {/* Leaderboard table */}
        <div className="overflow-x-auto">
          <Table
            aria-label="Leaderboard"
            removeWrapper
            classNames={{
              th: "bg-transparent font-gaming text-default-500 text-xs uppercase",
              td: "py-3",
            }}
          >
            <TableHeader>
              <TableColumn>RANK</TableColumn>
              <TableColumn>PLAYER</TableColumn>
              <TableColumn>TIER</TableColumn>
              <TableColumn>RATING</TableColumn>
              <TableColumn>W/L</TableColumn>
              <TableColumn>WIN %</TableColumn>
              <TableColumn>STREAK</TableColumn>
            </TableHeader>
            <TableBody
              isLoading={isLoading}
              loadingContent={<Skeleton className="w-full h-8" />}
            >
              {paginatedData.map((entry) => (
                <TableRow
                  key={entry.playerId}
                  className={`transition-colors ${
                    entry.playerId === currentPlayerId
                      ? "bg-primary/10"
                      : "hover:bg-content2/50"
                  }`}
                >
                  {/* Rank */}
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="font-gaming font-bold text-lg min-w-[2rem]">
                        {getRankMedal(entry.rank) || `#${entry.rank}`}
                      </span>
                      <span className="text-xs">
                        {getRankChangeIcon(entry.rank, entry.previousRank)}
                      </span>
                    </div>
                  </TableCell>

                  {/* Player */}
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Badge
                        content=""
                        color="success"
                        placement="bottom-right"
                        shape="circle"
                        size="sm"
                        isInvisible={
                          !entry.lastActive ||
                          Date.now() - entry.lastActive.getTime() > 300000
                        }
                      >
                        <Avatar
                          src={entry.playerAvatar}
                          name={entry.playerName}
                          size="sm"
                        />
                      </Badge>
                      <div>
                        <div className="flex items-center gap-1">
                          <span className="font-semibold">
                            {entry.playerName}
                          </span>
                          {entry.badges?.map((badge) => (
                            <Tooltip key={badge} content={badge}>
                              <span>{getBadgeIcon(badge)}</span>
                            </Tooltip>
                          ))}
                        </div>
                        {entry.teamName && (
                          <p className="text-xs text-default-400">
                            {entry.teamName}
                          </p>
                        )}
                      </div>
                    </div>
                  </TableCell>

                  {/* Tier */}
                  <TableCell>
                    <Chip
                      size="sm"
                      variant="flat"
                      startContent={<span>{entry.tier.icon}</span>}
                      style={{
                        backgroundColor: game.color.primary + "20",
                        color: game.color.primary,
                      }}
                    >
                      {entry.tier.name}
                    </Chip>
                  </TableCell>

                  {/* Rating */}
                  <TableCell>
                    <span
                      className="font-gaming font-bold"
                      style={{ color: game.color.primary }}
                    >
                      {entry.rating.toLocaleString()}
                    </span>
                  </TableCell>

                  {/* W/L */}
                  <TableCell>
                    <span className="text-success">{entry.wins}</span>
                    <span className="text-default-400 mx-1">/</span>
                    <span className="text-danger">{entry.losses}</span>
                  </TableCell>

                  {/* Win Rate */}
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Progress
                        value={entry.winRate}
                        color={
                          entry.winRate >= 55
                            ? "success"
                            : entry.winRate >= 45
                            ? "warning"
                            : "danger"
                        }
                        size="sm"
                        className="max-w-[4rem]"
                      />
                      <span className="text-sm">{entry.winRate}%</span>
                    </div>
                  </TableCell>

                  {/* Streak */}
                  <TableCell>
                    {entry.streak ? (
                      <Chip
                        size="sm"
                        color={
                          entry.streak.type === "win" ? "success" : "danger"
                        }
                        variant="flat"
                      >
                        {entry.streak.type === "win" ? "🔥" : "❄️"}{" "}
                        {entry.streak.count}
                      </Chip>
                    ) : (
                      <span className="text-default-400">-</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex justify-center p-4 border-t border-divider">
          <Pagination
            total={totalPages}
            page={currentPage}
            onChange={setCurrentPage}
            color="primary"
            showControls
            showShadow
          />
        </div>
      </CardBody>
    </Card>
  );
}

/**
 * Compact leaderboard for sidebar/widgets
 */
export function CompactLeaderboard({
  gameId = "cs2",
  limit = 5,
  currentPlayerId,
  className = "",
}: {
  gameId?: GameId;
  limit?: number;
  currentPlayerId?: string;
  className?: string;
}) {
  const game = GAME_CONFIGS[gameId];
  const [data] = useState(() => generateMockLeaderboard(gameId, limit));

  if (!game) return null;

  return (
    <Card className={className}>
      <CardHeader className="pb-0">
        <div className="flex items-center gap-2">
          <Icon icon={game.icon} style={{ color: game.color.primary }} />
          <h3 className="font-gaming font-bold text-sm">Top Players</h3>
        </div>
      </CardHeader>
      <CardBody className="pt-2">
        <div className="space-y-2">
          {data.map((entry) => (
            <div
              key={entry.playerId}
              className={`flex items-center justify-between p-2 rounded-lg transition-colors ${
                entry.playerId === currentPlayerId
                  ? "bg-primary/10"
                  : "hover:bg-content2/50"
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="font-gaming font-bold text-sm w-6 text-center">
                  {entry.rank <= 3
                    ? ["🥇", "🥈", "🥉"][entry.rank - 1]
                    : `#${entry.rank}`}
                </span>
                <Avatar
                  src={entry.playerAvatar}
                  name={entry.playerName}
                  size="sm"
                />
                <div>
                  <p className="text-sm font-semibold">{entry.playerName}</p>
                  <p className="text-xs text-default-400">
                    {entry.tier.icon} {entry.tier.name}
                  </p>
                </div>
              </div>
              <span
                className="font-gaming text-sm"
                style={{ color: game.color.primary }}
              >
                {entry.rating}
              </span>
            </div>
          ))}
        </div>
        <Button
          variant="light"
          color="primary"
          size="sm"
          className="w-full mt-2"
          endContent={<Icon icon="solar:arrow-right-linear" />}
        >
          View Full Leaderboard
        </Button>
      </CardBody>
    </Card>
  );
}

/**
 * Player rank card for profile display
 */
export function PlayerRankCard({
  gameId,
  playerName,
  playerAvatar,
  rating,
  rank,
  wins,
  losses,
  className = "",
}: {
  gameId: GameId;
  playerName: string;
  playerAvatar?: string;
  rating: number;
  rank: number;
  wins: number;
  losses: number;
  className?: string;
}) {
  const game = GAME_CONFIGS[gameId];
  const tier = getRankTier(gameId, rating);

  if (!game || !tier) return null;

  const winRate = Math.round((wins / (wins + losses)) * 100);

  return (
    <Card
      className={`overflow-hidden ${className}`}
      style={{
        background: `linear-gradient(135deg, ${game.color.primary}20, ${game.color.secondary})`,
      }}
    >
      <CardBody className="p-4">
        <div className="flex items-center gap-4">
          {/* Player avatar */}
          <Avatar
            src={playerAvatar}
            name={playerName}
            size="lg"
            className="ring-2 ring-primary"
          />

          {/* Player info */}
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-gaming font-bold text-lg">{playerName}</h3>
              <Icon icon={game.icon} style={{ color: game.color.primary }} />
            </div>
            <div className="flex items-center gap-2 mt-1">
              <Chip
                size="sm"
                variant="solid"
                style={{
                  backgroundColor: game.color.primary,
                  color: "white",
                }}
              >
                {tier.icon} {tier.name}
              </Chip>
              <span className="text-sm text-default-500">#{rank}</span>
            </div>
          </div>

          {/* Rating */}
          <div className="text-right">
            <p
              className="font-gaming text-3xl font-bold"
              style={{ color: game.color.primary }}
            >
              {rating}
            </p>
            <p className="text-xs text-default-500">MMR</p>
          </div>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-divider">
          <div className="text-center">
            <p className="text-lg font-gaming font-bold text-success">{wins}</p>
            <p className="text-xs text-default-500">Wins</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-gaming font-bold text-danger">
              {losses}
            </p>
            <p className="text-xs text-default-500">Losses</p>
          </div>
          <div className="text-center">
            <p
              className={`text-lg font-gaming font-bold ${
                winRate >= 55
                  ? "text-success"
                  : winRate >= 45
                  ? "text-warning"
                  : "text-danger"
              }`}
            >
              {winRate}%
            </p>
            <p className="text-xs text-default-500">Win Rate</p>
          </div>
        </div>

        {/* Progress to next rank */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs text-default-500 mb-1">
            <span>{tier.name}</span>
            <span>Next: {rating + 100}</span>
          </div>
          <Progress
            value={((rating - tier.minRating) / 100) * 100}
            color="primary"
            size="sm"
          />
        </div>
      </CardBody>
    </Card>
  );
}

export default Leaderboard;

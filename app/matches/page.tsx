"use client";

import { useState } from "react";
import {
  Card,
  CardBody,
  Chip,
  Input,
  Select,
  SelectItem,
  Avatar,
  AvatarGroup,
  Pagination,
  Button,
  Skeleton,
} from "@nextui-org/react";
import { Icon } from "@iconify/react";
import Link from "next/link";

interface Match {
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
  status: "live" | "completed" | "upcoming";
  timestamp: Date;
  duration?: string;
  tournament?: string;
}

const mockMatches: Match[] = [
  {
    id: "m1",
    game: "Counter-Strike 2",
    gameIcon: "simple-icons:counterstrike",
    map: "Dust 2",
    mode: "Competitive 5v5",
    teams: [
      {
        name: "Team Alpha",
        score: 16,
        players: [
          { name: "Player1" },
          { name: "Player2" },
          { name: "Player3" },
          { name: "Player4" },
          { name: "Player5" },
        ],
      },
      {
        name: "Team Beta",
        score: 12,
        players: [
          { name: "Player6" },
          { name: "Player7" },
          { name: "Player8" },
          { name: "Player9" },
          { name: "Player10" },
        ],
      },
    ],
    status: "completed",
    timestamp: new Date(Date.now() - 3600000),
    duration: "45:23",
    tournament: "Pro League Season 12",
  },
  {
    id: "m2",
    game: "Valorant",
    gameIcon: "simple-icons:valorant",
    map: "Ascent",
    mode: "Ranked",
    teams: [
      {
        name: "Phoenix Squad",
        score: 8,
        players: [
          { name: "ValorantPro" },
          { name: "HeadshotKing" },
          { name: "FlashMaster" },
          { name: "SmokeGod" },
          { name: "ClutchKing" },
        ],
      },
      {
        name: "Radiant Stars",
        score: 7,
        players: [
          { name: "AimBot" },
          { name: "TriggerHappy" },
          { name: "WallBanger" },
          { name: "SprayNPray" },
          { name: "OneDeag" },
        ],
      },
    ],
    status: "live",
    timestamp: new Date(),
  },
  {
    id: "m3",
    game: "League of Legends",
    gameIcon: "simple-icons:leagueoflegends",
    map: "Summoner's Rift",
    mode: "Ranked Solo/Duo",
    teams: [
      {
        name: "Blue Side",
        score: 0,
        players: [
          { name: "TopLaner" },
          { name: "JungleKing" },
          { name: "MidOrFeed" },
          { name: "ADCarry" },
          { name: "Support" },
        ],
      },
      {
        name: "Red Side",
        score: 0,
        players: [
          { name: "Faker" },
          { name: "Canyon" },
          { name: "ShowMaker" },
          { name: "Ruler" },
          { name: "Keria" },
        ],
      },
    ],
    status: "upcoming",
    timestamp: new Date(Date.now() + 7200000),
  },
];

const statusConfig = {
  live: {
    color: "danger" as const,
    icon: "solar:play-circle-bold",
    label: "LIVE",
  },
  completed: {
    color: "success" as const,
    icon: "solar:check-circle-bold",
    label: "Completed",
  },
  upcoming: {
    color: "warning" as const,
    icon: "solar:clock-circle-bold",
    label: "Upcoming",
  },
};

function MatchCard({ match }: { match: Match }) {
  const config = statusConfig[match.status];
  const winner =
    match.status === "completed"
      ? match.teams[0].score > match.teams[1].score
        ? 0
        : 1
      : null;

  return (
    <Link href={`/match/${match.id}`}>
      <Card
        className="bg-content1/60 backdrop-blur-md border border-white/10 hover:border-primary/50 transition-all cursor-pointer"
        isPressable
      >
        <CardBody className="gap-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Icon icon={match.gameIcon} className="w-6 h-6" />
              <div>
                <p className="font-semibold">{match.game}</p>
                <p className="text-xs text-default-500">
                  {match.map} • {match.mode}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {match.status === "live" && (
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-danger opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-danger"></span>
                </span>
              )}
              <Chip color={config.color} variant="flat" size="sm">
                <div className="flex items-center gap-1">
                  <Icon icon={config.icon} className="w-3 h-3" />
                  {config.label}
                </div>
              </Chip>
            </div>
          </div>

          {/* Teams */}
          <div className="flex items-center justify-between gap-4">
            {/* Team 1 */}
            <div
              className={`flex-1 ${
                winner === 0 ? "opacity-100" : winner === 1 ? "opacity-50" : ""
              }`}
            >
              <div className="flex items-center gap-3">
                <AvatarGroup max={3} size="sm">
                  {match.teams[0].players.map((player, i) => (
                    <Avatar
                      key={i}
                      name={player.name[0]}
                      src={player.avatar}
                      size="sm"
                    />
                  ))}
                </AvatarGroup>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{match.teams[0].name}</p>
                  <p className="text-xs text-default-500">
                    {match.teams[0].players.length} players
                  </p>
                </div>
              </div>
            </div>

            {/* Score */}
            <div className="flex items-center gap-2 px-4">
              <span
                className={`text-2xl font-bold ${
                  winner === 0 ? "text-success" : ""
                }`}
              >
                {match.teams[0].score}
              </span>
              <span className="text-default-400">-</span>
              <span
                className={`text-2xl font-bold ${
                  winner === 1 ? "text-success" : ""
                }`}
              >
                {match.teams[1].score}
              </span>
            </div>

            {/* Team 2 */}
            <div
              className={`flex-1 ${
                winner === 1 ? "opacity-100" : winner === 0 ? "opacity-50" : ""
              }`}
            >
              <div className="flex items-center gap-3 justify-end">
                <div className="flex-1 min-w-0 text-right">
                  <p className="font-medium truncate">{match.teams[1].name}</p>
                  <p className="text-xs text-default-500">
                    {match.teams[1].players.length} players
                  </p>
                </div>
                <AvatarGroup max={3} size="sm">
                  {match.teams[1].players.map((player, i) => (
                    <Avatar
                      key={i}
                      name={player.name[0]}
                      src={player.avatar}
                      size="sm"
                    />
                  ))}
                </AvatarGroup>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between text-xs text-default-500">
            <div className="flex items-center gap-2">
              <Icon icon="solar:calendar-linear" className="w-4 h-4" />
              <span>
                {match.status === "upcoming"
                  ? `Starts ${match.timestamp.toLocaleString()}`
                  : match.timestamp.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center gap-4">
              {match.duration && (
                <div className="flex items-center gap-1">
                  <Icon icon="solar:clock-circle-linear" className="w-4 h-4" />
                  <span>{match.duration}</span>
                </div>
              )}
              {match.tournament && (
                <div className="flex items-center gap-1">
                  <Icon icon="solar:cup-linear" className="w-4 h-4" />
                  <span className="truncate max-w-[150px]">
                    {match.tournament}
                  </span>
                </div>
              )}
            </div>
          </div>
        </CardBody>
      </Card>
    </Link>
  );
}

function MatchSkeleton() {
  return (
    <Card className="bg-content1/60 backdrop-blur-md border border-white/10">
      <CardBody className="gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="w-6 h-6 rounded" />
            <div>
              <Skeleton className="h-4 w-24 rounded" />
              <Skeleton className="h-3 w-32 rounded mt-1" />
            </div>
          </div>
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-32 rounded" />
          <Skeleton className="h-8 w-16 rounded" />
          <Skeleton className="h-10 w-32 rounded" />
        </div>
        <div className="flex items-center justify-between">
          <Skeleton className="h-3 w-24 rounded" />
          <Skeleton className="h-3 w-16 rounded" />
        </div>
      </CardBody>
    </Card>
  );
}

export default function MatchesPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [gameFilter, setGameFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [loading] = useState(false);

  const filteredMatches = mockMatches.filter((match) => {
    const matchesSearch =
      match.game.toLowerCase().includes(search.toLowerCase()) ||
      match.map.toLowerCase().includes(search.toLowerCase()) ||
      match.teams.some((t) =>
        t.name.toLowerCase().includes(search.toLowerCase())
      );

    const matchesStatus =
      statusFilter === "all" || match.status === statusFilter;
    const matchesGame = gameFilter === "all" || match.game === gameFilter;

    return matchesSearch && matchesStatus && matchesGame;
  });

  const games = Array.from(new Set(mockMatches.map((m) => m.game)));

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-content1/20">
      <div className="container mx-auto px-4 py-12 max-w-5xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Matches</h1>
          <p className="text-default-500 text-lg">
            Browse live, recent, and upcoming matches
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <Input
            placeholder="Search matches..."
            value={search}
            onValueChange={setSearch}
            startContent={
              <Icon icon="solar:magnifer-linear" className="text-default-400" />
            }
            className="flex-1"
            classNames={{
              inputWrapper:
                "bg-content1/60 backdrop-blur-md border border-white/10",
            }}
          />
          <Select
            placeholder="Status"
            selectedKeys={[statusFilter]}
            onSelectionChange={(keys) =>
              setStatusFilter(Array.from(keys)[0] as string)
            }
            className="w-full sm:w-40"
            classNames={{
              trigger: "bg-content1/60 backdrop-blur-md border border-white/10",
            }}
          >
            <SelectItem key="all">All Status</SelectItem>
            <SelectItem key="live">Live</SelectItem>
            <SelectItem key="completed">Completed</SelectItem>
            <SelectItem key="upcoming">Upcoming</SelectItem>
          </Select>
          <Select
            placeholder="Game"
            selectedKeys={[gameFilter]}
            onSelectionChange={(keys) =>
              setGameFilter(Array.from(keys)[0] as string)
            }
            className="w-full sm:w-48"
            classNames={{
              trigger: "bg-content1/60 backdrop-blur-md border border-white/10",
            }}
            items={[
              { key: "all", label: "All Games" },
              ...games.map((g) => ({ key: g, label: g })),
            ]}
          >
            {(item) => <SelectItem key={item.key}>{item.label}</SelectItem>}
          </Select>
        </div>

        {/* Live Matches Highlight */}
        {filteredMatches.some((m) => m.status === "live") && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-danger opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-danger"></span>
              </span>
              <h2 className="text-xl font-semibold">Live Now</h2>
            </div>
            <div className="space-y-4">
              {filteredMatches
                .filter((m) => m.status === "live")
                .map((match) => (
                  <MatchCard key={match.id} match={match} />
                ))}
            </div>
          </div>
        )}

        {/* All Matches */}
        <div>
          <h2 className="text-xl font-semibold mb-4">
            {statusFilter === "live"
              ? "Live Matches"
              : statusFilter === "upcoming"
              ? "Upcoming Matches"
              : statusFilter === "completed"
              ? "Completed Matches"
              : "All Matches"}
          </h2>

          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <MatchSkeleton key={i} />
              ))}
            </div>
          ) : filteredMatches.length === 0 ? (
            <Card className="bg-content1/60 backdrop-blur-md border border-white/10">
              <CardBody className="py-12 text-center">
                <Icon
                  icon="solar:gameboy-linear"
                  className="w-16 h-16 mx-auto mb-4 text-default-300"
                />
                <p className="text-lg font-medium">No matches found</p>
                <p className="text-default-500 mt-2">
                  Try adjusting your search or filters
                </p>
                <Button
                  color="primary"
                  variant="flat"
                  className="mt-4"
                  onPress={() => {
                    setSearch("");
                    setStatusFilter("all");
                    setGameFilter("all");
                  }}
                >
                  Clear Filters
                </Button>
              </CardBody>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredMatches
                .filter((m) =>
                  statusFilter === "live" ? true : m.status !== "live"
                )
                .map((match) => (
                  <MatchCard key={match.id} match={match} />
                ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {filteredMatches.length > 10 && (
          <div className="flex justify-center mt-8">
            <Pagination
              total={Math.ceil(filteredMatches.length / 10)}
              page={page}
              onChange={setPage}
              showControls
              classNames={{
                wrapper: "gap-2",
                item: "bg-content1/60 backdrop-blur-md border border-white/10",
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

/**
 * Matches Page - State-of-the-Art Match Browser
 * Browse live, completed, and upcoming matches with beautiful UI
 */

import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Chip,
  Input,
  Select,
  SelectItem,
  Avatar,
  AvatarGroup,
  Pagination,
  Button,
  Skeleton,
  Tooltip,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@nextui-org/react";
import { Icon } from "@iconify/react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useMatches, Match } from "@/hooks/use-matches";
import { PageContainer } from "@/components/layouts/centered-content";

// Status configuration
const statusConfig = {
  live: {
    color: "danger" as const,
    icon: "solar:play-circle-bold",
    label: "LIVE",
    bgColor: "#FF4654",
  },
  completed: {
    color: "success" as const,
    icon: "solar:check-circle-bold",
    label: "Completed",
    bgColor: "#06FFA5",
  },
  upcoming: {
    color: "warning" as const,
    icon: "solar:clock-circle-bold",
    label: "Upcoming",
    bgColor: "#FFC700",
  },
};

// Game configurations
const gameConfig: Record<string, { icon: string; color: string; name: string }> = {
  "cs2": { icon: "simple-icons:counterstrike", color: "#F7941D", name: "Counter-Strike 2" },
  "Counter-Strike 2": { icon: "simple-icons:counterstrike", color: "#F7941D", name: "Counter-Strike 2" },
  "valorant": { icon: "simple-icons:valorant", color: "#FF4655", name: "Valorant" },
  "Valorant": { icon: "simple-icons:valorant", color: "#FF4655", name: "Valorant" },
  "lol": { icon: "simple-icons:leagueoflegends", color: "#C89B3C", name: "League of Legends" },
  "League of Legends": { icon: "simple-icons:leagueoflegends", color: "#C89B3C", name: "League of Legends" },
  "dota2": { icon: "simple-icons:dota2", color: "#A1252F", name: "Dota 2" },
  "Dota 2": { icon: "simple-icons:dota2", color: "#A1252F", name: "Dota 2" },
};

const gameOptions = [
  { key: "all", label: "All Games" },
  { key: "Counter-Strike 2", label: "Counter-Strike 2" },
  { key: "Valorant", label: "Valorant" },
  { key: "League of Legends", label: "League of Legends" },
  { key: "Dota 2", label: "Dota 2" },
];

const mapThumbnails: Record<string, string> = {
  de_dust2: "/images/maps/dust2.jpg",
  de_mirage: "/images/maps/mirage.jpg",
  de_inferno: "/images/maps/inferno.jpg",
  de_nuke: "/images/maps/nuke.jpg",
  de_ancient: "/images/maps/ancient.jpg",
  de_anubis: "/images/maps/anubis.jpg",
  de_vertigo: "/images/maps/vertigo.jpg",
};

// Generate mock matches for demo
function generateMockMatches(count: number): Match[] {
  const maps = ["de_dust2", "de_mirage", "de_inferno", "de_nuke", "de_ancient", "de_anubis"];
  const modes = ["Competitive", "Premier", "Wingman"];
  const teamNames = [
    ["NAVI", "Vitality"],
    ["FaZe", "G2"],
    ["Cloud9", "Liquid"],
    ["Astralis", "Heroic"],
    ["ENCE", "BIG"],
    ["NIP", "fnatic"],
    ["MOUZ", "Spirit"],
    ["Virtus.pro", "Eternal Fire"],
  ];
  const tournaments = ["BLAST Premier", "ESL Pro League", "IEM Katowice", "PGL Major", null, null];
  const statuses: Match["status"][] = ["live", "completed", "completed", "completed", "upcoming", "completed"];
  const playerNames = ["s1mple", "ZywOo", "NiKo", "device", "Twistzz", "electronic", "ropz", "b1t", "m0NESY", "broky"];

  return Array.from({ length: count }, (_, i) => {
    const status = statuses[i % statuses.length];
    const teamPair = teamNames[i % teamNames.length];
    const map = maps[i % maps.length];
    const isLive = status === "live";
    const isCompleted = status === "completed";

    const team1Score = isCompleted ? Math.floor(Math.random() * 16) + 8 : isLive ? Math.floor(Math.random() * 12) : 0;
    const team2Score = isCompleted 
      ? (team1Score >= 13 ? Math.floor(Math.random() * (team1Score - 3)) + 1 : Math.floor(Math.random() * 16) + 8)
      : isLive ? Math.floor(Math.random() * 12) : 0;

    return {
      id: `match-${i + 1}-${Date.now()}`,
      game: "Counter-Strike 2",
      gameIcon: "simple-icons:counterstrike",
      map,
      mode: modes[i % modes.length],
      teams: [
        {
          name: teamPair[0],
          score: team1Score,
          players: Array.from({ length: 5 }, (_, j) => ({
            name: playerNames[(i * 5 + j) % playerNames.length],
            avatar: `/avatars/default-player.svg`,
          })),
        },
        {
          name: teamPair[1],
          score: team2Score,
          players: Array.from({ length: 5 }, (_, j) => ({
            name: playerNames[(i * 5 + j + 5) % playerNames.length],
            avatar: `/avatars/default-player.svg`,
          })),
        },
      ],
      status,
      timestamp: new Date(Date.now() - (isCompleted ? Math.random() * 7 * 24 * 60 * 60 * 1000 : isLive ? 0 : -Math.random() * 2 * 24 * 60 * 60 * 1000)),
      duration: isCompleted ? `${Math.floor(Math.random() * 20) + 30}m` : undefined,
      tournament: tournaments[i % tournaments.length] || undefined,
    };
  });
}

// Match Card Component
function MatchCard({ match, variant = "default" }: { match: Match; variant?: "default" | "featured" | "live" }) {
  const config = statusConfig[match.status];
  const gameInfo = gameConfig[match.game] || { icon: "solar:gameboy-bold", color: "#DCFF37", name: match.game };
  const winner = match.status === "completed"
    ? match.teams[0].score > match.teams[1].score ? 0 : match.teams[0].score < match.teams[1].score ? 1 : null
    : null;

  const mapBg = mapThumbnails[match.map] || "/images/maps/dust2.jpg";

  if (variant === "live" || (variant === "default" && match.status === "live")) {
    return (
      <Link href={`/match/${match.id}`}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.3 }}
        >
          <Card
            className="relative overflow-hidden border-2 border-[#FF4654] hover:border-[#FF4654] transition-all cursor-pointer"
            style={{
              background: "linear-gradient(135deg, #0a0a0a 0%, #1a0a0a 50%, #0a0a0a 100%)",
              clipPath: "polygon(0 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%)",
            }}
          >
            {/* Live indicator glow */}
            <div className="absolute inset-0 animate-pulse opacity-20 bg-gradient-to-r from-[#FF4654] via-transparent to-[#FF4654]" />
            
            <CardBody className="p-5 relative z-10">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-10 h-10 flex items-center justify-center"
                    style={{ 
                      background: `linear-gradient(135deg, ${gameInfo.color}30, ${gameInfo.color}10)`,
                      clipPath: "polygon(0 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%)",
                    }}
                  >
                    <Icon icon={gameInfo.icon} width={24} style={{ color: gameInfo.color }} />
                  </div>
                  <div>
                    <p className="font-bold text-[#F5F0E1]">{gameInfo.name}</p>
                    <p className="text-xs text-[#F5F0E1]/50">{match.map} • {match.mode}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF4654] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-[#FF4654]"></span>
                  </span>
                  <Chip 
                    className="rounded-none font-bold uppercase text-xs"
                    style={{ backgroundColor: "#FF4654", color: "#0a0a0a" }}
                  >
                    LIVE
                  </Chip>
                </div>
              </div>

              {/* Teams & Score */}
              <div className="flex items-center justify-between gap-4">
                {/* Team 1 */}
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <AvatarGroup max={3} size="sm">
                      {match.teams[0]?.players.slice(0, 3).map((player, i) => (
                        <Avatar
                          key={i}
                          name={player.name?.[0]}
                          src={player.avatar}
                          size="sm"
                          className="ring-1 ring-[#FF4654]/50"
                        />
                      ))}
                    </AvatarGroup>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-[#F5F0E1] truncate">{match.teams[0]?.name}</p>
                      <p className="text-xs text-[#F5F0E1]/40">{match.teams[0]?.players.length} players</p>
                    </div>
                  </div>
                </div>

                {/* Score */}
                <div className="flex items-center gap-3 px-4 py-2 bg-[#0a0a0a]/80 rounded-none">
                  <span className="text-3xl font-black text-[#F5F0E1]">{match.teams[0]?.score ?? 0}</span>
                  <span className="text-[#F5F0E1]/30 text-xl">:</span>
                  <span className="text-3xl font-black text-[#F5F0E1]">{match.teams[1]?.score ?? 0}</span>
                </div>

                {/* Team 2 */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 justify-end">
                    <div className="flex-1 min-w-0 text-right">
                      <p className="font-bold text-[#F5F0E1] truncate">{match.teams[1]?.name}</p>
                      <p className="text-xs text-[#F5F0E1]/40">{match.teams[1]?.players.length} players</p>
                    </div>
                    <AvatarGroup max={3} size="sm">
                      {match.teams[1]?.players.slice(0, 3).map((player, i) => (
                        <Avatar
                          key={i}
                          name={player.name?.[0]}
                          src={player.avatar}
                          size="sm"
                          className="ring-1 ring-[#FF4654]/50"
                        />
                      ))}
                    </AvatarGroup>
                  </div>
                </div>
              </div>

              {/* Footer */}
              {match.tournament && (
                <div className="mt-4 pt-3 border-t border-[#FF4654]/20 flex items-center gap-2 text-xs text-[#F5F0E1]/50">
                  <Icon icon="solar:cup-bold" width={14} className="text-[#FFC700]" />
                  <span>{match.tournament}</span>
                </div>
              )}
            </CardBody>
          </Card>
        </motion.div>
      </Link>
    );
  }

  // Default card for completed/upcoming
  return (
    <Link href={`/match/${match.id}`}>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.01, y: -2 }}
        transition={{ duration: 0.2 }}
      >
        <Card
          className="group relative overflow-hidden border border-[#34445C]/30 dark:border-[#DCFF37]/10 hover:border-[#DCFF37]/40 transition-all cursor-pointer"
          style={{
            background: "linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)",
            clipPath: "polygon(0 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%)",
          }}
        >
          <CardBody className="p-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Icon icon={gameInfo.icon} width={18} style={{ color: gameInfo.color }} />
                <span className="text-sm text-[#F5F0E1]/70">{match.map}</span>
                <span className="text-[#F5F0E1]/30">•</span>
                <span className="text-sm text-[#F5F0E1]/50">{match.mode}</span>
              </div>
              <Chip 
                size="sm"
                className="rounded-none text-xs"
                style={{ 
                  backgroundColor: `${config.bgColor}20`,
                  color: config.bgColor,
                }}
                startContent={<Icon icon={config.icon} width={12} />}
              >
                {config.label}
              </Chip>
            </div>

            {/* Teams & Score */}
            <div className="flex items-center justify-between gap-3">
              {/* Team 1 */}
              <div className={`flex-1 ${winner === 1 ? "opacity-50" : ""}`}>
                <div className="flex items-center gap-2">
                  <AvatarGroup max={2} size="sm">
                    {match.teams[0]?.players.slice(0, 2).map((player, i) => (
                      <Avatar
                        key={i}
                        name={player.name?.[0]}
                        src={player.avatar}
                        size="sm"
                        className="ring-1 ring-[#34445C]/30"
                      />
                    ))}
                  </AvatarGroup>
                  <div className="flex-1 min-w-0">
                    <p className={`font-semibold truncate ${winner === 0 ? "text-[#06FFA5]" : "text-[#F5F0E1]"}`}>
                      {match.teams[0]?.name}
                      {winner === 0 && <Icon icon="solar:crown-bold" width={14} className="inline ml-1 text-[#FFC700]" />}
                    </p>
                  </div>
                </div>
              </div>

              {/* Score */}
              <div className="flex items-center gap-2 px-3 py-1 bg-[#0a0a0a]/60">
                <span className={`text-xl font-bold ${winner === 0 ? "text-[#06FFA5]" : "text-[#F5F0E1]"}`}>
                  {match.teams[0]?.score ?? 0}
                </span>
                <span className="text-[#F5F0E1]/20">-</span>
                <span className={`text-xl font-bold ${winner === 1 ? "text-[#06FFA5]" : "text-[#F5F0E1]"}`}>
                  {match.teams[1]?.score ?? 0}
                </span>
              </div>

              {/* Team 2 */}
              <div className={`flex-1 ${winner === 0 ? "opacity-50" : ""}`}>
                <div className="flex items-center gap-2 justify-end">
                  <div className="flex-1 min-w-0 text-right">
                    <p className={`font-semibold truncate ${winner === 1 ? "text-[#06FFA5]" : "text-[#F5F0E1]"}`}>
                      {winner === 1 && <Icon icon="solar:crown-bold" width={14} className="inline mr-1 text-[#FFC700]" />}
                      {match.teams[1]?.name}
                    </p>
                  </div>
                  <AvatarGroup max={2} size="sm">
                    {match.teams[1]?.players.slice(0, 2).map((player, i) => (
                      <Avatar
                        key={i}
                        name={player.name?.[0]}
                        src={player.avatar}
                        size="sm"
                        className="ring-1 ring-[#34445C]/30"
                      />
                    ))}
                  </AvatarGroup>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-3 pt-2 border-t border-[#34445C]/20 flex items-center justify-between text-xs text-[#F5F0E1]/40">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <Icon icon="solar:calendar-linear" width={12} />
                  {match.timestamp.toLocaleDateString()}
                </span>
                {match.duration && (
                  <span className="flex items-center gap-1">
                    <Icon icon="solar:clock-circle-linear" width={12} />
                    {match.duration}
                  </span>
                )}
              </div>
              {match.tournament && (
                <span className="flex items-center gap-1 text-[#FFC700]/70">
                  <Icon icon="solar:cup-linear" width={12} />
                  <span className="truncate max-w-[120px]">{match.tournament}</span>
                </span>
              )}
            </div>
          </CardBody>
        </Card>
      </motion.div>
    </Link>
  );
}

function MatchSkeleton() {
  return (
    <Card 
      className="overflow-hidden border border-[#34445C]/20"
      style={{
        background: "linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)",
        clipPath: "polygon(0 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%)",
      }}
    >
      <CardBody className="p-4 gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Skeleton className="w-5 h-5 rounded" />
            <Skeleton className="h-4 w-20 rounded" />
          </div>
          <Skeleton className="h-6 w-20 rounded-none" />
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Skeleton className="w-8 h-8 rounded-full" />
            <Skeleton className="h-5 w-24 rounded" />
          </div>
          <Skeleton className="h-8 w-16 rounded" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-24 rounded" />
            <Skeleton className="w-8 h-8 rounded-full" />
          </div>
        </div>
        <div className="flex items-center justify-between">
          <Skeleton className="h-3 w-24 rounded" />
          <Skeleton className="h-3 w-20 rounded" />
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
  const itemsPerPage = 12;

  // Fetch matches from real API
  const { matches: apiMatches, total, isLoading, isError, refresh } = useMatches({
    status: statusFilter,
    game: gameFilter,
    limit: 50,
    offset: 0,
  });

  // Use mock data if API returns empty or errors
  const mockMatches = useMemo(() => generateMockMatches(20), []);
  const matches = apiMatches.length > 0 ? apiMatches : mockMatches;

  // Client-side filtering for search
  const filteredMatches = useMemo(() => {
    return matches.filter((match) => {
      const matchesSearch =
        search === "" ||
        match.game.toLowerCase().includes(search.toLowerCase()) ||
        match.map.toLowerCase().includes(search.toLowerCase()) ||
        match.teams.some((t) => t.name.toLowerCase().includes(search.toLowerCase()));

      const matchesStatus = statusFilter === "all" || match.status === statusFilter;
      const matchesGame = gameFilter === "all" || match.game.toLowerCase().includes(gameFilter.toLowerCase());

      return matchesSearch && matchesStatus && matchesGame;
    });
  }, [matches, search, statusFilter, gameFilter]);

  // Separate by status
  const liveMatches = filteredMatches.filter((m) => m.status === "live");
  const upcomingMatches = filteredMatches.filter((m) => m.status === "upcoming");
  const completedMatches = filteredMatches.filter((m) => m.status === "completed");

  // Pagination for completed matches
  const totalPages = Math.ceil(completedMatches.length / itemsPerPage);
  const paginatedCompleted = completedMatches.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  // Stats for header
  const stats = {
    live: liveMatches.length,
    completed: completedMatches.length,
    upcoming: upcomingMatches.length,
    total: filteredMatches.length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a0a] via-[#121212] to-[#0a0a0a]">
      <PageContainer title="" description="" maxWidth="6xl">
        {/* Hero Header */}
        <div className="relative mb-12 py-12 -mx-4 px-4 overflow-hidden">
          {/* Animated background */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0a] via-[#1a1a1a] to-[#0a0a0a]" />
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 left-1/3 w-80 h-80 bg-[#06FFA5] rounded-full filter blur-[120px] animate-pulse" />
            <div className="absolute bottom-0 right-1/3 w-80 h-80 bg-[#FF4654] rounded-full filter blur-[120px] animate-pulse delay-700" />
          </div>

          {/* Content */}
          <div className="relative z-10 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex justify-center mb-6">
                <div
                  className="w-20 h-20 flex items-center justify-center bg-gradient-to-br from-[#06FFA5] to-[#00D9FF]"
                  style={{
                    clipPath: "polygon(0 0, 100% 0, 100% calc(100% - 16px), calc(100% - 16px) 100%, 0 100%)",
                  }}
                >
                  <Icon icon="solar:gameboy-bold" className="text-[#0a0a0a]" width={48} />
                </div>
              </div>

              <h1 className="text-5xl md:text-7xl font-black text-[#F5F0E1] mb-4 tracking-tight">
                MATCHES
              </h1>
              <p className="text-xl text-[#F5F0E1]/60 max-w-2xl mx-auto">
                Live, upcoming, and recent competitive matches
              </p>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex justify-center gap-8 mt-8"
            >
              <div className="text-center">
                <div className="flex items-center justify-center gap-1">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF4654] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#FF4654]"></span>
                  </span>
                  <p className="text-3xl font-bold text-[#FF4654]">{stats.live}</p>
                </div>
                <p className="text-sm text-[#F5F0E1]/50">Live Now</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-[#FFC700]">{stats.upcoming}</p>
                <p className="text-sm text-[#F5F0E1]/50">Upcoming</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-[#06FFA5]">{stats.completed}</p>
                <p className="text-sm text-[#F5F0E1]/50">Completed</p>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <Input
              placeholder="Search teams, maps..."
              value={search}
              onValueChange={setSearch}
              startContent={
                <Icon icon="solar:magnifer-linear" width={20} className="text-[#DCFF37]" />
              }
              isClearable
              onClear={() => setSearch("")}
              className="max-w-xs"
              classNames={{
                inputWrapper: "rounded-none border-[#34445C]/30 bg-[#1a1a1a]",
                input: "text-[#F5F0E1]",
              }}
            />
            <div className="flex gap-2 flex-wrap">
              {/* Status Filter */}
              <Dropdown>
                <DropdownTrigger>
                  <Button
                    variant="bordered"
                    className="rounded-none border-[#34445C]/30 min-w-[120px]"
                    endContent={<Icon icon="solar:alt-arrow-down-linear" width={16} />}
                  >
                    {statusFilter === "all" ? "All Status" : statusConfig[statusFilter as keyof typeof statusConfig]?.label || statusFilter}
                  </Button>
                </DropdownTrigger>
                <DropdownMenu
                  aria-label="Status filter"
                  selectionMode="single"
                  selectedKeys={[statusFilter]}
                  onSelectionChange={(keys) => {
                    setStatusFilter(Array.from(keys)[0] as string);
                    setPage(1);
                  }}
                >
                  <DropdownItem key="all">All Status</DropdownItem>
                  <DropdownItem key="live" startContent={<span className="w-2 h-2 rounded-full bg-[#FF4654]" />}>Live</DropdownItem>
                  <DropdownItem key="upcoming" startContent={<span className="w-2 h-2 rounded-full bg-[#FFC700]" />}>Upcoming</DropdownItem>
                  <DropdownItem key="completed" startContent={<span className="w-2 h-2 rounded-full bg-[#06FFA5]" />}>Completed</DropdownItem>
                </DropdownMenu>
              </Dropdown>

              {/* Game Filter */}
              <Dropdown>
                <DropdownTrigger>
                  <Button
                    variant="bordered"
                    className="rounded-none border-[#34445C]/30 min-w-[140px]"
                    endContent={<Icon icon="solar:alt-arrow-down-linear" width={16} />}
                  >
                    {gameFilter === "all" ? "All Games" : gameFilter}
                  </Button>
                </DropdownTrigger>
                <DropdownMenu
                  aria-label="Game filter"
                  selectionMode="single"
                  selectedKeys={[gameFilter]}
                  onSelectionChange={(keys) => {
                    setGameFilter(Array.from(keys)[0] as string);
                    setPage(1);
                  }}
                >
                  {gameOptions.map((opt) => (
                    <DropdownItem key={opt.key}>{opt.label}</DropdownItem>
                  ))}
                </DropdownMenu>
              </Dropdown>

              {/* Refresh Button */}
              <Button
                isIconOnly
                variant="bordered"
                className="rounded-none border-[#34445C]/30"
                onPress={() => refresh()}
              >
                <Icon icon="solar:refresh-linear" width={20} />
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Error State */}
        {isError && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-6 p-4 bg-[#FF4654]/10 border border-[#FF4654]/30 rounded-none"
          >
            <div className="flex items-center gap-3">
              <Icon icon="solar:danger-triangle-bold" width={24} className="text-[#FF4654]" />
              <div className="flex-1">
                <p className="font-semibold text-[#FF4654]">Unable to connect to server</p>
                <p className="text-sm text-[#F5F0E1]/60">Showing cached/demo data</p>
              </div>
              <Button size="sm" variant="flat" className="rounded-none" onPress={() => refresh()}>
                Retry
              </Button>
            </div>
          </motion.div>
        )}

        {/* Loading State */}
        {isLoading && apiMatches.length === 0 ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <MatchSkeleton key={i} />
            ))}
          </div>
        ) : filteredMatches.length === 0 ? (
          /* Empty State */
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <div
              className="w-24 h-24 mx-auto mb-6 flex items-center justify-center bg-[#34445C]/20"
              style={{
                clipPath: "polygon(0 0, 100% 0, 100% calc(100% - 16px), calc(100% - 16px) 100%, 0 100%)",
              }}
            >
              <Icon icon="solar:gameboy-linear" width={48} className="text-[#DCFF37]/50" />
            </div>
            <h3 className="text-xl font-bold text-[#F5F0E1] mb-2">No matches found</h3>
            <p className="text-[#F5F0E1]/50 mb-6">
              Try adjusting your filters or check back later
            </p>
            <Button
              className="rounded-none bg-[#DCFF37] text-[#0a0a0a] font-semibold"
              onPress={() => {
                setSearch("");
                setStatusFilter("all");
                setGameFilter("all");
              }}
            >
              Clear Filters
            </Button>
          </motion.div>
        ) : (
          <>
            {/* Live Matches Section */}
            {liveMatches.length > 0 && statusFilter !== "completed" && statusFilter !== "upcoming" && (
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="mb-10"
              >
                <div className="flex items-center gap-3 mb-4">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF4654] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-[#FF4654]"></span>
                  </span>
                  <h2 className="text-2xl font-bold text-[#F5F0E1]">Live Now</h2>
                  <Chip size="sm" className="rounded-none bg-[#FF4654]/20 text-[#FF4654]">
                    {liveMatches.length}
                  </Chip>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {liveMatches.map((match) => (
                    <MatchCard key={match.id} match={match} variant="live" />
                  ))}
                </div>
              </motion.section>
            )}

            {/* Upcoming Matches Section */}
            {upcomingMatches.length > 0 && statusFilter !== "completed" && statusFilter !== "live" && (
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="mb-10"
              >
                <div className="flex items-center gap-3 mb-4">
                  <Icon icon="solar:clock-circle-bold" width={24} className="text-[#FFC700]" />
                  <h2 className="text-2xl font-bold text-[#F5F0E1]">Upcoming</h2>
                  <Chip size="sm" className="rounded-none bg-[#FFC700]/20 text-[#FFC700]">
                    {upcomingMatches.length}
                  </Chip>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {upcomingMatches.slice(0, 4).map((match) => (
                    <MatchCard key={match.id} match={match} />
                  ))}
                </div>
              </motion.section>
            )}

            {/* Completed Matches Section */}
            {completedMatches.length > 0 && statusFilter !== "live" && statusFilter !== "upcoming" && (
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <Icon icon="solar:history-bold" width={24} className="text-[#06FFA5]" />
                  <h2 className="text-2xl font-bold text-[#F5F0E1]">Match History</h2>
                  <Chip size="sm" className="rounded-none bg-[#06FFA5]/20 text-[#06FFA5]">
                    {completedMatches.length}
                  </Chip>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <AnimatePresence mode="popLayout">
                    {paginatedCompleted.map((match, i) => (
                      <motion.div
                        key={match.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.2, delay: i * 0.05 }}
                        layout
                      >
                        <MatchCard match={match} />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center mt-8">
                    <Pagination
                      total={totalPages}
                      page={page}
                      onChange={setPage}
                      showControls
                      classNames={{
                        wrapper: "gap-2",
                        item: "rounded-none bg-[#1a1a1a] border border-[#34445C]/30",
                        cursor: "rounded-none bg-[#DCFF37] text-[#0a0a0a]",
                      }}
                    />
                  </div>
                )}
              </motion.section>
            )}
          </>
        )}

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="mt-16 relative overflow-hidden"
        >
          <div
            className="p-8 md:p-12 bg-gradient-to-r from-[#06FFA5] via-[#00D9FF] to-[#DCFF37] relative"
            style={{
              clipPath: "polygon(0 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%)",
            }}
          >
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="text-center md:text-left">
                <h3 className="text-2xl md:text-3xl font-black text-[#0a0a0a] mb-2">
                  Ready to Compete?
                </h3>
                <p className="text-[#0a0a0a]/70 max-w-lg">
                  Join matchmaking and find your next competitive match. Play ranked or casual with players at your skill level.
                </p>
              </div>
              <Button
                size="lg"
                as={Link}
                href="/match-making"
                className="rounded-none bg-[#0a0a0a] text-[#F5F0E1] font-bold px-8"
                startContent={<Icon icon="solar:play-bold" width={24} />}
              >
                Find Match
              </Button>
            </div>
          </div>
        </motion.div>
      </PageContainer>
    </div>
  );
}

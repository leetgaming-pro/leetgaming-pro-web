/**
 * FeaturedLobbies Component
 * Award-winning homepage slice showcasing featured lobbies
 * with game selector and esports branding
 */

"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Select,
  SelectItem,
  Skeleton,
  Chip,
  Progress,
  Tooltip,
} from "@nextui-org/react";
import { Icon } from "@iconify/react";
import { AnimatePresence, LazyMotion, domAnimation, m } from "framer-motion";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import { Electrolize } from "next/font/google";

import { GAME_CONFIGS } from "@/config/games";
import type { GameId } from "@/types/games";
import type { MatchmakingLobby, LobbyVisibility, LobbyType } from "@/types/replay-api/lobby.types";
import { getLobbyPlayerCount, isLobbyFull, canLobbyStart } from "@/types/replay-api/lobby.types";
import { useTheme } from "next-themes";

const electrolize = Electrolize({
  weight: "400",
  subsets: ["latin"],
});

// Game filter options
const GAME_OPTIONS: { id: GameId | "all"; name: string; icon: string }[] = [
  { id: "all", name: "All Games", icon: "solar:gamepad-bold" },
  { id: "cs2", name: "CS2", icon: "simple-icons:counterstrike" },
  { id: "valorant", name: "Valorant", icon: "simple-icons:valorant" },
  { id: "lol", name: "League of Legends", icon: "simple-icons:leagueoflegends" },
  { id: "dota2", name: "Dota 2", icon: "simple-icons:dota2" },
  { id: "r6", name: "Rainbow Six", icon: "simple-icons:ubisoft" },
  { id: "pubg", name: "PUBG", icon: "simple-icons:pubg" },
];

// Lobby type configurations
const LOBBY_TYPE_CONFIG: Record<LobbyType, { label: string; color: "primary" | "secondary" | "success" | "warning" | "danger"; icon: string }> = {
  custom: { label: "Custom", color: "primary", icon: "solar:settings-bold" },
  ranked: { label: "Ranked", color: "warning", icon: "solar:medal-star-bold" },
  casual: { label: "Casual", color: "success", icon: "solar:gamepad-bold" },
  tournament: { label: "Tournament", color: "danger", icon: "solar:cup-star-bold" },
  practice: { label: "Practice", color: "secondary", icon: "solar:target-bold" },
};

// Visibility icons
const VISIBILITY_ICONS: Record<LobbyVisibility, string> = {
  public: "solar:globe-bold",
  private: "solar:lock-bold",
  matchmaking: "solar:refresh-bold",
  friends: "solar:users-group-rounded-bold",
};

interface FeaturedLobbiesProps {
  className?: string;
  maxLobbies?: number;
}

export default function FeaturedLobbies({ className, maxLobbies = 8 }: FeaturedLobbiesProps) {
  const router = useRouter();
  const { theme } = useTheme();
  const [selectedGame, setSelectedGame] = useState<GameId | "all">("all");
  const [lobbies, setLobbies] = useState<MatchmakingLobby[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Fetch featured lobbies via Next.js API route (proxies to match-making-api)
  const fetchLobbies = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams();
      if (selectedGame !== "all") params.append("game_id", selectedGame);
      params.append("limit", maxLobbies.toString());
      
      const url = `/api/match-making/lobbies/featured${params.toString() ? `?${params.toString()}` : ""}`;
      const response = await fetch(url);
      const result = await response.json();
      
      if (result?.lobbies) {
        setLobbies(result.lobbies);
      } else {
        setLobbies([]);
      }
    } catch (err) {
      console.error("Failed to fetch lobbies:", err);
      setError("Failed to load lobbies");
      // Show demo data in development
      setLobbies(getDemoLobbies() as MatchmakingLobby[]);
    } finally {
      setLoading(false);
    }
  }, [selectedGame, maxLobbies]);

  useEffect(() => {
    fetchLobbies();
    // Poll for updates every 30 seconds
    const pollInterval = setInterval(fetchLobbies, 30000);
    return () => clearInterval(pollInterval);
  }, [fetchLobbies]);

  // Handle game filter change
  const handleGameChange = (keys: Set<React.Key> | "all") => {
    if (keys === "all") {
      setSelectedGame("all");
    } else {
      const selected = Array.from(keys)[0] as GameId | "all";
      setSelectedGame(selected || "all");
    }
  };

  // Navigate to lobby details
  const handleJoinLobby = (lobby: MatchmakingLobby) => {
    router.push(`/match-making/lobby/${lobby.id}`);
  };

  // Open create lobby modal
  const handleCreateLobby = () => {
    setIsCreateModalOpen(true);
  };

  // Navigate to browse all
  const handleBrowseAll = () => {
    router.push("/match-making/lobbies");
  };

  // Import the modal dynamically to avoid SSR issues
  const CreateLobbyModal = React.lazy(() => import("./CreateLobbyModal"));

  return (
    <LazyMotion features={domAnimation}>
      <section className={clsx("w-full", className)}>
        {/* Create Lobby Modal */}
        <React.Suspense fallback={null}>
          <CreateLobbyModal
            defaultGameId={selectedGame !== "all" ? selectedGame : undefined}
            isOpen={isCreateModalOpen}
            onClose={() => setIsCreateModalOpen(false)}
          />
        </React.Suspense>

        <Card className="leet-card bg-gradient-to-br from-background/95 to-background/80 backdrop-blur-xl overflow-visible">
          <CardHeader className="pb-6">
            <div className="flex flex-col gap-6 w-full">
              {/* Header */}
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-3">
                  <div className="leet-icon-box leet-icon-box-md">
                    <Icon icon="solar:users-group-rounded-bold" width={24} />
                  </div>
                  <div>
                    <h2 className={clsx("text-xl font-black uppercase tracking-wider", electrolize.className)}>
                      Featured Lobbies
                    </h2>
                    <p className="text-sm text-default-400">
                      Join active games or create your own lobby
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {/* Game Filter */}
                  <Select
                    aria-label="Filter by game"
                    className="w-48"
                    classNames={{
                      trigger: "border-default-200/50 bg-default-100/50",
                    }}
                    defaultSelectedKeys={["all"]}
                    radius="none"
                    size="sm"
                    startContent={
                      <Icon
                        className="text-default-400"
                        icon={GAME_OPTIONS.find(g => g.id === selectedGame)?.icon || "solar:gamepad-bold"}
                        width={18}
                      />
                    }
                    variant="bordered"
                    onSelectionChange={handleGameChange}
                  >
                    {GAME_OPTIONS.map((game) => (
                      <SelectItem
                        key={game.id}
                        startContent={<Icon icon={game.icon} width={18} />}
                        value={game.id}
                      >
                        {game.name}
                      </SelectItem>
                    ))}
                  </Select>

                  {/* Create Lobby Button */}
                  <Button
                    className="font-semibold"
                    color="primary"
                    radius="none"
                    size="sm"
                    startContent={<Icon icon="solar:add-circle-bold" width={18} />}
                    style={{
                      backgroundColor: theme === "dark" ? "#DCFF37" : "#FF4654",
                      color: theme === "dark" ? "#34445C" : "#FFFFFF",
                      clipPath: "polygon(0 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%)",
                    }}
                    onPress={handleCreateLobby}
                  >
                    Create Lobby
                  </Button>
                </div>
              </div>
            </div>
          </CardHeader>

          <CardBody className="pt-0">
            {/* Loading State */}
            {loading && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <Card key={i} className="border border-default-200/30">
                    <CardBody className="p-4">
                      <div className="space-y-3 animate-pulse">
                        <Skeleton className="h-5 w-3/4 rounded-none" />
                        <Skeleton className="h-4 w-1/2 rounded-none" />
                        <Skeleton className="h-8 w-full rounded-none" />
                        <div className="flex justify-between">
                          <Skeleton className="h-6 w-16 rounded-none" />
                          <Skeleton className="h-8 w-20 rounded-none" />
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                ))}
              </div>
            )}

            {/* Error State */}
            {!loading && error && (
              <div className="text-center py-12">
                <div className="leet-hero-icon">
                  <Icon icon="solar:danger-triangle-bold" width={40} />
                </div>
                <p className={clsx("text-lg font-bold text-default-500 mb-2", electrolize.className)}>
                  {error}
                </p>
                <Button
                  color="primary"
                  radius="none"
                  size="sm"
                  startContent={<Icon icon="solar:refresh-bold" width={18} />}
                  variant="flat"
                  onPress={fetchLobbies}
                >
                  Try Again
                </Button>
              </div>
            )}

            {/* Empty State */}
            {!loading && !error && lobbies.length === 0 && (
              <div className="text-center py-12">
                <div className="leet-hero-icon">
                  <Icon icon="solar:users-group-rounded-bold" width={40} />
                </div>
                <p className={clsx("text-xl font-bold text-default-500 mb-2", electrolize.className)}>
                  No Active Lobbies
                </p>
                <p className="text-sm text-default-400 mb-4">
                  Be the first to create a lobby and invite players!
                </p>
                <Button
                  className="font-semibold"
                  color="primary"
                  radius="none"
                  startContent={<Icon icon="solar:add-circle-bold" width={20} />}
                  style={{
                    backgroundColor: theme === "dark" ? "#DCFF37" : "#FF4654",
                    color: theme === "dark" ? "#34445C" : "#FFFFFF",
                    clipPath: "polygon(0 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%)",
                  }}
                  onPress={handleCreateLobby}
                >
                  Create First Lobby
                </Button>
              </div>
            )}

            {/* Lobbies Grid */}
            {!loading && !error && lobbies.length > 0 && (
              <AnimatePresence mode="wait">
                <m.div
                  animate={{ opacity: 1, y: 0 }}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
                  exit={{ opacity: 0, y: 10 }}
                  initial={{ opacity: 0, y: 20 }}
                  transition={{ duration: 0.3 }}
                >
                  {lobbies.map((lobby, index) => (
                    <LobbyCard
                      key={lobby.id}
                      index={index}
                      lobby={lobby}
                      theme={theme}
                      onJoin={handleJoinLobby}
                    />
                  ))}
                </m.div>
              </AnimatePresence>
            )}

            {/* Browse All Link */}
            {!loading && lobbies.length > 0 && (
              <div className="flex justify-center mt-6">
                <Button
                  className="font-medium"
                  endContent={<Icon icon="solar:arrow-right-linear" width={18} />}
                  radius="none"
                  size="sm"
                  variant="light"
                  onPress={handleBrowseAll}
                >
                  Browse All Lobbies
                </Button>
              </div>
            )}
          </CardBody>
        </Card>
      </section>
    </LazyMotion>
  );
}

// Individual Lobby Card Component
interface LobbyCardProps {
  lobby: MatchmakingLobby;
  index: number;
  theme?: string;
  onJoin: (lobby: MatchmakingLobby) => void;
}

function LobbyCard({ lobby, index, theme, onJoin }: LobbyCardProps) {
  const gameConfig = lobby.game_id ? GAME_CONFIGS[lobby.game_id as GameId] : null;
  const typeConfig = lobby.type ? LOBBY_TYPE_CONFIG[lobby.type as LobbyType] : LOBBY_TYPE_CONFIG.custom;
  const playerCount = getLobbyPlayerCount(lobby);
  const maxPlayers = lobby.max_players || 10;
  const fillPercentage = (playerCount / maxPlayers) * 100;
  const isFull = isLobbyFull(lobby);
  const canStart = canLobbyStart(lobby);

  return (
    <m.div
      animate={{ opacity: 1, y: 0 }}
      initial={{ opacity: 0, y: 20 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
    >
      <Card
        className={clsx(
          "border border-default-200/30 hover:border-default-400/50 transition-all duration-300",
          "bg-gradient-to-br from-background/90 to-background/70",
          lobby.is_featured && "ring-2 ring-warning/50"
        )}
        isPressable
        radius="none"
        onPress={() => onJoin(lobby)}
      >
        {/* Game Banner */}
        {gameConfig && (
          <div
            className="h-12 w-full relative overflow-hidden"
            style={{
              background: `linear-gradient(135deg, ${gameConfig.color.primary}40, ${gameConfig.color.secondary}80)`,
            }}
          >
            <div className="absolute inset-0 flex items-center justify-between px-3">
              <div className="flex items-center gap-2">
                <Icon className="text-white/90" icon={gameConfig.icon} width={20} />
                <span className="text-xs font-bold text-white/90 uppercase">
                  {gameConfig.shortName}
                </span>
              </div>
              {lobby.is_featured && (
                <Chip
                  className="text-tiny"
                  color="warning"
                  radius="none"
                  size="sm"
                  startContent={<Icon icon="solar:star-bold" width={12} />}
                  variant="flat"
                >
                  Featured
                </Chip>
              )}
            </div>
          </div>
        )}

        <CardBody className="p-4 pt-3">
          {/* Lobby Name & Type */}
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex-1 min-w-0">
              <h3 className={clsx(
                "text-sm font-bold truncate",
                electrolize.className
              )}>
                {lobby.name || `Lobby #${lobby.id.slice(-6)}`}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <Chip
                  className="text-tiny"
                  color={typeConfig.color}
                  radius="none"
                  size="sm"
                  startContent={<Icon icon={typeConfig.icon} width={12} />}
                  variant="flat"
                >
                  {typeConfig.label}
                </Chip>
                <Tooltip content={`${lobby.visibility || "public"} lobby`}>
                  <Icon
                    className="text-default-400"
                    icon={VISIBILITY_ICONS[lobby.visibility as LobbyVisibility] || VISIBILITY_ICONS.public}
                    width={14}
                  />
                </Tooltip>
              </div>
            </div>
          </div>

          {/* Region & Mode */}
          <div className="flex items-center gap-2 text-xs text-default-500 mb-3">
            <span className="flex items-center gap-1">
              <Icon icon="solar:map-point-bold" width={12} />
              {lobby.region?.toUpperCase() || "ANY"}
            </span>
            <span>•</span>
            <span>{lobby.game_mode || "Competitive"}</span>
          </div>

          {/* Player Capacity */}
          <div className="mb-3">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-default-500">Players</span>
              <span className={clsx(
                "font-medium",
                isFull ? "text-danger" : canStart ? "text-success" : "text-default-600"
              )}>
                {playerCount}/{maxPlayers}
              </span>
            </div>
            <Progress
              aria-label="Player capacity"
              classNames={{
                indicator: isFull
                  ? "bg-danger"
                  : canStart
                  ? "bg-success"
                  : theme === "dark"
                  ? "bg-[#DCFF37]"
                  : "bg-[#FF4654]",
                track: "bg-default-200/30",
              }}
              radius="none"
              size="sm"
              value={fillPercentage}
            />
          </div>

          {/* Prize Pool (if any) */}
          {lobby.entry_fee_cents && lobby.entry_fee_cents > 0 && (
            <div className="flex items-center gap-2 mb-3 p-2 bg-warning/10 border border-warning/20">
              <Icon className="text-warning" icon="solar:cup-star-bold" width={16} />
              <span className="text-xs font-medium text-warning">
                ${(lobby.entry_fee_cents / 100).toLocaleString()} Entry Fee
              </span>
            </div>
          )}

          {/* Join Button */}
          <Button
            className="w-full font-semibold"
            color={isFull ? "default" : "primary"}
            isDisabled={isFull}
            radius="none"
            size="sm"
            style={
              !isFull
                ? {
                    backgroundColor: theme === "dark" ? "#DCFF37" : "#FF4654",
                    color: theme === "dark" ? "#34445C" : "#FFFFFF",
                    clipPath: "polygon(0 0, 100% 0, 100% calc(100% - 4px), calc(100% - 4px) 100%, 0 100%)",
                  }
                : {}
            }
          >
            {isFull ? "Full" : "Join Lobby"}
          </Button>
        </CardBody>
      </Card>
    </m.div>
  );
}

// Demo lobbies for development/preview
function getDemoLobbies(): Partial<MatchmakingLobby>[] {
  const now = new Date().toISOString();
  const baseFields = {
    created_at: now,
    updated_at: now,
    expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    requires_ready_check: true,
    allow_spectators: true,
    allow_cross_platform: true,
    creator_id: "demo-user",
  };

  return [
    {
      ...baseFields,
      id: "demo-1",
      name: "Pro Scrims - Ranked",
      description: "Looking for skilled players",
      status: "open",
      game_id: "cs2",
      game_mode: "Competitive",
      region: "na",
      visibility: "public",
      type: "ranked",
      is_featured: true,
      max_players: 10,
      min_players: 10,
      player_slots: Array(7).fill({ slot_number: 0, player_id: "demo", is_ready: true }),
      entry_fee_cents: 500,
      distribution_rule: "winner_takes_all",
      tags: ["pro", "scrims"],
    },
    {
      ...baseFields,
      id: "demo-2",
      name: "Casual Gaming Night",
      description: "Fun games, all skill levels welcome",
      status: "open",
      game_id: "valorant",
      game_mode: "Unrated",
      region: "eu",
      visibility: "public",
      type: "casual",
      is_featured: true,
      max_players: 10,
      min_players: 2,
      player_slots: Array(4).fill({ slot_number: 0, player_id: "demo", is_ready: true }),
      tags: ["casual", "fun"],
    },
    {
      ...baseFields,
      id: "demo-3",
      name: "Tournament Practice",
      description: "Preparing for upcoming tournament",
      status: "open",
      game_id: "lol",
      game_mode: "Draft Pick",
      region: "br",
      visibility: "friends",
      type: "practice",
      is_featured: false,
      max_players: 10,
      min_players: 10,
      player_slots: Array(8).fill({ slot_number: 0, player_id: "demo", is_ready: true }),
      tags: ["practice", "tournament"],
    },
    {
      ...baseFields,
      id: "demo-4",
      name: "Weekly Cup Qualifier",
      description: "Official tournament qualifier",
      status: "open",
      game_id: "dota2",
      game_mode: "Captain's Mode",
      region: "sea",
      visibility: "public",
      type: "tournament",
      is_featured: true,
      max_players: 10,
      min_players: 10,
      player_slots: Array(6).fill({ slot_number: 0, player_id: "demo", is_ready: true }),
      entry_fee_cents: 1000,
      distribution_rule: "top_three",
      tags: ["tournament", "official"],
    },
  ] as Partial<MatchmakingLobby>[];
}

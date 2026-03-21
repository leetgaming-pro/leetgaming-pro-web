/**
 * LobbiesShowcase Component
 * Award-winning esports landing page slice showcasing live lobbies
 * with dramatic animations, live player counts, and professional UX
 */

"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Button, Chip, Progress, Avatar, AvatarGroup } from "@nextui-org/react";
import { Icon } from "@iconify/react";
import { AnimatePresence, LazyMotion, domAnimation, m, useMotionValue, useTransform, animate } from "framer-motion";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import { Electrolize, Orbitron } from "next/font/google";
import { useTheme } from "next-themes";

import { GAME_CONFIGS } from "@/config/games";
import type { GameId } from "@/types/games";
import type { MatchmakingLobby, LobbyType } from "@/types/replay-api/lobby.types";
import { getLobbyPlayerCount, isLobbyFull } from "@/types/replay-api/lobby.types";
import { useTranslation } from "@/lib/i18n/useTranslation";

const electrolize = Electrolize({ weight: "400", subsets: ["latin"] });
const orbitron = Orbitron({ weight: ["400", "700", "900"], subsets: ["latin"] });

// Lobby type styling
const LOBBY_TYPE_STYLES: Record<LobbyType, { gradient: string; glow: string; icon: string }> = {
  ranked: { 
    gradient: "from-amber-500/20 via-orange-500/10 to-transparent", 
    glow: "shadow-amber-500/20",
    icon: "solar:medal-star-bold"
  },
  tournament: { 
    gradient: "from-red-500/20 via-rose-500/10 to-transparent", 
    glow: "shadow-red-500/20",
    icon: "solar:cup-star-bold"
  },
  casual: { 
    gradient: "from-emerald-500/20 via-green-500/10 to-transparent", 
    glow: "shadow-emerald-500/20",
    icon: "solar:gamepad-bold"
  },
  custom: { 
    gradient: "from-blue-500/20 via-cyan-500/10 to-transparent", 
    glow: "shadow-blue-500/20",
    icon: "solar:settings-bold"
  },
  practice: { 
    gradient: "from-purple-500/20 via-violet-500/10 to-transparent", 
    glow: "shadow-purple-500/20",
    icon: "solar:target-bold"
  },
};

// Game accent colors
const GAME_ACCENTS: Record<string, { primary: string; secondary: string; glow: string }> = {
  cs2: { primary: "#FF9800", secondary: "#F57C00", glow: "shadow-orange-500/30" },
  valorant: { primary: "#FF4654", secondary: "#DC3D4B", glow: "shadow-red-500/30" },
  lol: { primary: "#C89B3C", secondary: "#A67C00", glow: "shadow-amber-500/30" },
  dota2: { primary: "#A13D2D", secondary: "#8B2D1F", glow: "shadow-rose-500/30" },
  r6: { primary: "#4A90D9", secondary: "#2C5AA0", glow: "shadow-blue-500/30" },
  pubg: { primary: "#F2A900", secondary: "#D69E00", glow: "shadow-yellow-500/30" },
};

interface LobbiesShowcaseProps {
  className?: string;
}

// Animated counter component
function AnimatedCounter({ value, duration = 1 }: { value: number; duration?: number }) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.round(latest));
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const controls = animate(count, value, { duration });
    return controls.stop;
  }, [value, count, duration]);

  useEffect(() => {
    const unsubscribe = rounded.on("change", (latest) => setDisplayValue(latest));
    return unsubscribe;
  }, [rounded]);

  return <span>{displayValue}</span>;
}

// Live pulse indicator
function LivePulse({ className }: { className?: string }) {
  return (
    <span className={clsx("relative flex h-2 w-2", className)}>
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
      <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
    </span>
  );
}

export default function LobbiesShowcase({ className }: LobbiesShowcaseProps) {
  const router = useRouter();
  const { theme, resolvedTheme } = useTheme();
  const { t } = useTranslation();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  // Use 'dark' as fallback during SSR/hydration to prevent mismatch
  const activeTheme = mounted ? (resolvedTheme || theme || 'dark') : 'dark';
  const [lobbies, setLobbies] = useState<MatchmakingLobby[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredLobby, setHoveredLobby] = useState<string | null>(null);
  const [stats, setStats] = useState({ totalPlayers: 0, activeLobbies: 0, gamesPlayed: 0 });

  // Fetch lobbies
  const fetchLobbies = useCallback(async () => {
    try {
      const response = await fetch("/api/match-making/lobbies/featured?limit=6");
      if (!response.ok) {
        console.warn("Lobbies fetch returned", response.status);
        return;
      }
      const result = await response.json();
      if (result?.lobbies) {
        setLobbies(result.lobbies);
        // Calculate stats
        const totalPlayers = result.lobbies.reduce((acc: number, lobby: MatchmakingLobby) => 
          acc + getLobbyPlayerCount(lobby), 0);
        setStats({
          totalPlayers,
          activeLobbies: result.lobbies.length,
          gamesPlayed: Math.floor(Math.random() * 500) + 1200, // Demo stat
        });
      }
    } catch (err) {
      console.error("Failed to fetch lobbies:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLobbies();
    const interval = setInterval(fetchLobbies, 15000);
    return () => clearInterval(interval);
  }, [fetchLobbies]);

  const handleJoinLobby = (lobbyId: string) => {
    router.push(`/match-making/lobby/${lobbyId}`);
  };

  const handleBrowseAll = () => {
    router.push("/match-making/lobbies");
  };

  const handleCreateLobby = () => {
    router.push("/match-making/create");
  };

  return (
    <LazyMotion features={domAnimation}>
      <section className={clsx(
        "relative w-full overflow-hidden",
        "bg-gradient-to-b from-background via-background/95 to-background",
        className
      )}>
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Grid pattern */}
          <div 
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `linear-gradient(to right, currentColor 1px, transparent 1px),
                               linear-gradient(to bottom, currentColor 1px, transparent 1px)`,
              backgroundSize: "60px 60px",
            }}
          />
          {/* Glowing orbs */}
          <m.div
            animate={{ x: [0, 100, 0], y: [0, -50, 0] }}
            className="absolute top-20 left-1/4 w-96 h-96 bg-[#FF4654]/10 rounded-full blur-[120px]"
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          />
          <m.div
            animate={{ x: [0, -80, 0], y: [0, 60, 0] }}
            className="absolute bottom-20 right-1/4 w-80 h-80 bg-[#FF4654]/10 dark:bg-[#DCFF37]/10 rounded-full blur-[100px]"
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          />
        </div>

        <div className="relative container mx-auto px-6 py-20 lg:py-28">
          {/* Section Header */}
          <m.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            className="text-center mb-16"
            transition={{ duration: 0.6 }}
          >
            {/* Live indicator */}
            <div className="flex items-center justify-center gap-2 mb-6">
              <LivePulse />
              <span className={clsx(
                "text-xs font-bold uppercase tracking-[0.3em] text-red-500",
                orbitron.className
              )}>
                {t("landing.lobbies.liveBadge")}
              </span>
            </div>

            {/* Main title */}
            <h2 className={clsx(
              "text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-tight mb-4",
              orbitron.className
            )}>
              <span className="text-foreground">{t("landing.lobbies.headingPrefix")} </span>
              <span className="bg-gradient-to-r from-[#FF4654] via-[#E6A800] to-[#34445C] dark:from-[#FF4654] dark:via-[#FFC700] dark:to-[#DCFF37] bg-clip-text text-transparent">
                {t("landing.lobbies.headingHighlight")}
              </span>
            </h2>

            <p className="text-lg text-default-500 max-w-2xl mx-auto mb-8">
              {t("landing.lobbies.subtitle")}
            </p>

            {/* Live Stats Bar */}
            <m.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-8 px-8 py-4 rounded-none border border-default-200/30 bg-default-100/30 backdrop-blur-sm"
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <div className="text-center">
                <div className={clsx("text-2xl font-black text-[#FF4654] dark:text-[#DCFF37]", orbitron.className)}>
                  <AnimatedCounter value={stats.totalPlayers} />
                </div>
                <div className="text-xs text-default-400 uppercase tracking-wider">{t("landing.lobbies.playersOnline")}</div>
              </div>
              <div className="w-px h-10 bg-default-200/50" />
              <div className="text-center">
                <div className={clsx("text-2xl font-black text-[#FF4654]", orbitron.className)}>
                  <AnimatedCounter value={stats.activeLobbies} />
                </div>
                <div className="text-xs text-default-400 uppercase tracking-wider">{t("landing.lobbies.activeLobbies")}</div>
              </div>
              <div className="w-px h-10 bg-default-200/50" />
              <div className="text-center">
                <div className={clsx("text-2xl font-black text-[#E6A800] dark:text-[#FFC700]", orbitron.className)}>
                  <AnimatedCounter value={stats.gamesPlayed} />+
                </div>
                <div className="text-xs text-default-400 uppercase tracking-wider">{t("landing.lobbies.gamesToday")}</div>
              </div>
            </m.div>
          </m.div>

          {/* Lobbies Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            <AnimatePresence mode="popLayout">
              {loading ? (
                // Loading skeletons
                [...Array(6)].map((_, i) => (
                  <m.div
                    key={`skeleton-${i}`}
                    animate={{ opacity: 1 }}
                    className="h-64 rounded-none bg-default-100/50 animate-pulse"
                    exit={{ opacity: 0 }}
                    initial={{ opacity: 0 }}
                  />
                ))
              ) : lobbies.length === 0 ? (
                // Empty state
                <m.div
                  key="empty-state"
                  animate={{ opacity: 1, y: 0 }}
                  className="col-span-full flex flex-col items-center justify-center py-16 text-center"
                  initial={{ opacity: 0, y: 20 }}
                >
                  <Icon icon="solar:gamepad-bold-duotone" width={64} className="text-default-300 dark:text-default-600 mb-4" />
                  <p className="text-lg font-semibold text-default-500">{t("landing.lobbies.emptyHeading")}</p>
                  <p className="text-sm text-default-400 mt-1">{t("landing.lobbies.emptyMessage")}</p>
                </m.div>
              ) : (
                lobbies.map((lobby, index) => (
                  <LobbyShowcaseCard
                    key={lobby.id}
                    index={index}
                    isHovered={hoveredLobby === lobby.id}
                    lobby={lobby}
                    theme={activeTheme}
                    onHover={setHoveredLobby}
                    onJoin={handleJoinLobby}
                  />
                ))
              )}
            </AnimatePresence>
          </div>

          {/* Action Buttons */}
          <m.div
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            <Button
              className={clsx(
                "h-14 px-10 text-base font-black uppercase tracking-wider",
                orbitron.className
              )}
              color="primary"
              endContent={<Icon icon="solar:add-circle-bold" width={22} />}
              radius="none"
              size="lg"
              style={{
                backgroundColor: activeTheme === "dark" ? "#DCFF37" : "#FF4654",
                color: activeTheme === "dark" ? "#0a0a0a" : "#ffffff",
                clipPath: "polygon(0 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%)",
              }}
              onPress={handleCreateLobby}
            >
              {t("landing.lobbies.createLobby")}
            </Button>
            <Button
              className={clsx(
                "h-14 px-10 text-base font-bold uppercase tracking-wider border-2",
                orbitron.className
              )}
              endContent={<Icon icon="solar:alt-arrow-right-linear" width={22} />}
              radius="none"
              size="lg"
              variant="bordered"
              onPress={handleBrowseAll}
            >
              {t("landing.lobbies.browseAll")}
            </Button>
          </m.div>
        </div>
      </section>
    </LazyMotion>
  );
}

// Individual Lobby Card with esports styling
interface LobbyShowcaseCardProps {
  lobby: MatchmakingLobby;
  index: number;
  theme?: string;
  isHovered: boolean;
  onJoin: (id: string) => void;
  onHover: (id: string | null) => void;
}

function LobbyShowcaseCard({ lobby, index, theme: _theme, isHovered, onJoin, onHover }: LobbyShowcaseCardProps) {
  const { t } = useTranslation();
  const gameConfig = lobby.game_id ? GAME_CONFIGS[lobby.game_id as GameId] : null;
  const gameAccent = GAME_ACCENTS[lobby.game_id || "cs2"] || GAME_ACCENTS.cs2;
  const typeStyle = LOBBY_TYPE_STYLES[lobby.type as LobbyType] || LOBBY_TYPE_STYLES.custom;
  const playerCount = getLobbyPlayerCount(lobby);
  const maxPlayers = lobby.max_players || 10;
  const fillPercentage = (playerCount / maxPlayers) * 100;
  const isFull = isLobbyFull(lobby);

  // Get player avatars (mock for demo)
  const playerAvatars = lobby.player_slots?.slice(0, 4).map((slot, i) => ({
    name: slot.player_name || `Player ${i + 1}`,
    src: `https://i.pravatar.cc/150?u=${slot.player_id}`,
  })) || [];

  return (
    <m.div
      animate={{ opacity: 1, y: 0 }}
      className="relative group"
      exit={{ opacity: 0, scale: 0.95 }}
      initial={{ opacity: 0, y: 30 }}
      layout
      transition={{ delay: index * 0.08, duration: 0.4, type: "spring" }}
      onMouseEnter={() => onHover(lobby.id)}
      onMouseLeave={() => onHover(null)}
    >
      {/* Glow effect on hover */}
      <m.div
        animate={{ opacity: isHovered ? 1 : 0 }}
        className={clsx(
          "absolute -inset-1 rounded-none blur-xl transition-opacity",
          gameAccent.glow
        )}
        style={{ backgroundColor: gameAccent.primary + "30" }}
      />

      {/* Card */}
      <div
        className={clsx(
          "relative h-full rounded-none overflow-hidden cursor-pointer",
          "border border-default-200/30 hover:border-default-400/50",
          "bg-gradient-to-br from-default-100/80 to-default-50/50 backdrop-blur-sm",
          "transition-all duration-300",
          isHovered && "transform scale-[1.02]"
        )}
        onClick={() => onJoin(lobby.id)}
      >
        {/* Game banner */}
        <div
          className="relative h-20 overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${gameAccent.primary}90 0%, ${gameAccent.secondary}70 50%, transparent 100%)`,
          }}
        >
          {/* Pattern overlay */}
          <div 
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `repeating-linear-gradient(
                -45deg,
                transparent,
                transparent 10px,
                rgba(255,255,255,0.1) 10px,
                rgba(255,255,255,0.1) 20px
              )`,
            }}
          />
          
          {/* Game info */}
          <div className="absolute inset-0 flex items-center justify-between px-4">
            <div className="flex items-center gap-3">
              {gameConfig && (
                <div className="p-2 bg-black/30 backdrop-blur-sm rounded-none">
                  <Icon className="text-white" icon={gameConfig.icon} width={24} />
                </div>
              )}
              <div>
                <div className={clsx("text-white font-black uppercase tracking-wider", orbitron.className)}>
                  {gameConfig?.shortName || lobby.game_id?.toUpperCase()}
                </div>
                <div className="text-white/70 text-xs uppercase">
                  {lobby.game_mode || "Competitive"}
                </div>
              </div>
            </div>

            {/* Featured badge */}
            {lobby.is_featured && (
              <div className="flex items-center gap-1 px-2 py-1 bg-amber-500/90 text-black text-xs font-bold uppercase">
                <Icon icon="solar:star-bold" width={12} />
                {t("landing.lobbies.featured")}
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Lobby name */}
          <h3 className={clsx(
            "text-lg font-bold mb-2 line-clamp-1",
            electrolize.className
          )}>
            {lobby.name || `Lobby #${lobby.id.slice(-6)}`}
          </h3>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-4">
            <Chip
              className="text-tiny"
              radius="none"
              size="sm"
              startContent={<Icon icon={typeStyle.icon} width={12} />}
              variant="flat"
            >
              {lobby.type || "Custom"}
            </Chip>
            <Chip
              className="text-tiny"
              radius="none"
              size="sm"
              startContent={<Icon icon="solar:map-point-bold" width={12} />}
              variant="flat"
            >
              {lobby.region?.toUpperCase() || "ANY"}
            </Chip>
          </div>

          {/* Player progress */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <AvatarGroup
                  isBordered
                  max={3}
                  size="sm"
                  total={playerCount > 3 ? playerCount - 3 : 0}
                >
                  {playerAvatars.map((avatar, i) => (
                    <Avatar
                      key={i}
                      className="w-6 h-6"
                      name={avatar.name}
                      src={avatar.src}
                    />
                  ))}
                </AvatarGroup>
              </div>
              <span className={clsx(
                "text-sm font-bold",
                isFull ? "text-red-500" : "text-[#FF4654] dark:text-[#DCFF37]",
                orbitron.className
              )}>
                {playerCount}/{maxPlayers}
              </span>
            </div>
            <Progress
              aria-label="Player count"
              classNames={{
                track: "bg-default-200/30",
                indicator: isFull 
                  ? "bg-red-500" 
                  : `bg-gradient-to-r from-[${gameAccent.primary}] to-[${gameAccent.secondary}]`,
              }}
              radius="none"
              size="sm"
              value={fillPercentage}
            />
          </div>

          {/* Join button */}
          <Button
            className={clsx(
              "w-full font-bold uppercase tracking-wider",
              orbitron.className
            )}
            color={isFull ? "default" : "primary"}
            isDisabled={isFull}
            radius="none"
            size="sm"
            style={!isFull ? {
              backgroundColor: gameAccent.primary,
              color: "#000000",
            } : undefined}
          >
            {isFull ? t("landing.lobbies.lobbyFull") : t("landing.lobbies.joinNow")}
          </Button>
        </div>

        {/* Hover indicator line */}
        <m.div
          animate={{ scaleX: isHovered ? 1 : 0 }}
          className="absolute bottom-0 left-0 right-0 h-1"
          initial={{ scaleX: 0 }}
          style={{ backgroundColor: gameAccent.primary }}
          transition={{ duration: 0.2 }}
        />
      </div>
    </m.div>
  );
}

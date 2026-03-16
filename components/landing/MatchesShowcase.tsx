/**
 * MatchesShowcase Component
 * Elite esports landing page slice showcasing recent matches
 * with dramatic scoreboard animations, team vs team displays, and professional UX
 */

"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Button, Chip, Avatar, AvatarGroup, Tooltip, Card, CardBody } from "@nextui-org/react";
import { Icon } from "@iconify/react";
import { AnimatePresence, LazyMotion, domAnimation, m, useMotionValue, useTransform, animate } from "framer-motion";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import { Electrolize, Orbitron } from "next/font/google";
import { useTheme } from "next-themes";

import type { MatchData } from "@/types/replay-api/sdk";

const electrolize = Electrolize({ weight: "400", subsets: ["latin"] });
const orbitron = Orbitron({ weight: ["400", "700", "900"], subsets: ["latin"] });

// Game accent colors for branding
const GAME_ACCENTS: Record<string, { primary: string; secondary: string; glow: string; bg: string }> = {
  cs2: { primary: "#FF9800", secondary: "#F57C00", glow: "shadow-orange-500/30", bg: "from-orange-500/10" },
  cs: { primary: "#FF9800", secondary: "#F57C00", glow: "shadow-orange-500/30", bg: "from-orange-500/10" },
  valorant: { primary: "#FF4654", secondary: "#DC3D4B", glow: "shadow-red-500/30", bg: "from-red-500/10" },
  lol: { primary: "#C89B3C", secondary: "#A67C00", glow: "shadow-amber-500/30", bg: "from-amber-500/10" },
  dota2: { primary: "#A13D2D", secondary: "#8B2D1F", glow: "shadow-rose-500/30", bg: "from-rose-500/10" },
  r6: { primary: "#4A90D9", secondary: "#2C5AA0", glow: "shadow-blue-500/30", bg: "from-blue-500/10" },
};

// Team side colors
const SIDE_COLORS = {
  CT: { primary: "#00A8FF", secondary: "#0066CC", name: "Counter-Terrorists" },
  T: { primary: "#FFB800", secondary: "#CC9200", name: "Terrorists" },
};

// Map images (placeholder gradients for now)
const MAP_BACKGROUNDS: Record<string, string> = {
  de_dust2: "from-amber-900/40 via-yellow-900/20 to-transparent",
  de_mirage: "from-blue-900/40 via-cyan-900/20 to-transparent",
  de_inferno: "from-orange-900/40 via-red-900/20 to-transparent",
  de_ancient: "from-emerald-900/40 via-green-900/20 to-transparent",
  de_nuke: "from-slate-900/40 via-blue-900/20 to-transparent",
  de_anubis: "from-amber-900/40 via-orange-900/20 to-transparent",
  de_vertigo: "from-cyan-900/40 via-blue-900/20 to-transparent",
  default: "from-slate-900/40 via-slate-800/20 to-transparent",
};

interface MatchesShowcaseProps {
  className?: string;
}

// Animated counter component
function AnimatedCounter({ value, duration = 1.2 }: { value: number; duration?: number }) {
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

// Victory crown animation
function VictoryCrown({ show }: { show: boolean }) {
  if (!show) return null;
  return (
    <m.div
      initial={{ opacity: 0, scale: 0, rotate: -45 }}
      animate={{ opacity: 1, scale: 1, rotate: 0 }}
      transition={{ delay: 0.3, duration: 0.5, type: "spring", bounce: 0.6 }}
      className="absolute -top-3 left-1/2 transform -translate-x-1/2"
    >
      <Icon icon="solar:crown-bold" className="w-6 h-6 text-[#FFD700] drop-shadow-[0_0_10px_rgba(255,215,0,0.8)]" />
    </m.div>
  );
}

// VS Divider with animation
function VSDivider({ theme }: { theme?: string }) {
  const accentColor = theme === "dark" ? "#DCFF37" : "#FF4654";
  const accentRgb = theme === "dark" ? "220, 255, 55" : "255, 70, 84";
  
  return (
    <div className="relative flex flex-col items-center justify-center px-4">
      {/* Vertical line top */}
      <div className="w-px h-8 bg-gradient-to-b from-transparent via-default-300/30 to-default-400/50 dark:via-white/20 dark:to-white/40" />
      
      {/* VS Badge */}
      <div className="relative">
        <m.div
          animate={{ 
            boxShadow: [
              `0 0 20px rgba(${accentRgb}, 0.3)`,
              `0 0 40px rgba(${accentRgb}, 0.5)`,
              `0 0 20px rgba(${accentRgb}, 0.3)`,
            ]
          }}
          transition={{ duration: 2, repeat: Infinity }}
          className={clsx(
            "relative z-10 px-3 py-1.5 rounded-lg",
            "bg-gradient-to-br",
            theme === "dark" 
              ? "from-[#DCFF37]/20 via-[#DCFF37]/10 to-transparent border-[#DCFF37]/30"
              : "from-[#FF4654]/20 via-[#FF4654]/10 to-transparent border-[#FF4654]/30",
            "border"
          )}
        >
          <span 
            className={clsx(orbitron.className, "text-lg font-black")}
            style={{ color: accentColor }}
          >
            VS
          </span>
        </m.div>
      </div>
      
      {/* Vertical line bottom */}
      <div className="w-px h-8 bg-gradient-to-b from-default-400/50 via-default-300/30 to-transparent dark:from-white/40 dark:via-white/20" />
    </div>
  );
}

// Team score display
function TeamScore({ 
  score, 
  side, 
  teamName, 
  isWinner,
  players = [],
  index,
  theme: _theme
}: { 
  score: number; 
  side: "CT" | "T";
  teamName: string;
  isWinner: boolean;
  players?: { name?: string; avatar_uri?: string }[];
  index: number;
  theme?: string;
}) {
  const sideColor = SIDE_COLORS[side];
  const isLeft = index === 0;
  
  return (
    <m.div
      initial={{ opacity: 0, x: isLeft ? -50 : 50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.1 * index, duration: 0.5, type: "spring" }}
      className={clsx(
        "relative flex flex-col items-center",
        isLeft ? "text-right" : "text-left"
      )}
    >
      {/* Winner crown */}
      <VictoryCrown show={isWinner} />
      
      {/* Team name */}
      <div className={clsx(
        "text-xs font-semibold uppercase tracking-wider mb-2",
        isWinner ? "text-foreground" : "text-default-500"
      )}>
        {teamName}
      </div>
      
      {/* Score */}
      <m.div
        initial={{ scale: 0.5 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, duration: 0.4, type: "spring", bounce: 0.5 }}
        className="relative"
      >
        <span
          className={clsx(
            electrolize.className,
            "text-5xl md:text-6xl font-black transition-all",
            isWinner ? "" : "opacity-50"
          )}
          style={{ 
            color: sideColor.primary,
            textShadow: isWinner ? `0 0 30px ${sideColor.primary}80` : "none"
          }}
        >
          <AnimatedCounter value={score} />
        </span>
      </m.div>
      
      {/* Side indicator */}
      <Chip
        size="sm"
        variant="flat"
        className="mt-2"
        style={{ 
          backgroundColor: `${sideColor.primary}20`,
          color: sideColor.primary
        }}
      >
        {side === "CT" ? "CT" : "T"}
      </Chip>
      
      {/* Player avatars */}
      {players.length > 0 && (
        <div className="mt-3">
          <AvatarGroup max={5} size="sm" className="justify-center">
            {players.slice(0, 5).map((player, idx) => (
              <Tooltip key={idx} content={player.name || `Player ${idx + 1}`}>
                <Avatar
                  size="sm"
                  src={player.avatar_uri}
                  name={player.name?.[0] || "?"}
                  className="border-2"
                  style={{ borderColor: sideColor.primary }}
                />
              </Tooltip>
            ))}
          </AvatarGroup>
        </div>
      )}
    </m.div>
  );
}

// Match card component
function MatchShowcaseCard({ match, index, theme }: { match: MatchData; index: number; theme?: string }) {
  const router = useRouter();
  const gameId = match.game_id || "cs2";
  const _gameAccent = GAME_ACCENTS[gameId] || GAME_ACCENTS.cs2;
  const accentColor = theme === "dark" ? "#DCFF37" : "#FF4654";
  
  // Extract team data
  const team1 = match.scoreboard?.team_scoreboards?.[0];
  const team2 = match.scoreboard?.team_scoreboards?.[1];
  const team1Score = team1?.team_score ?? team1?.score ?? 0;
  const team2Score = team2?.team_score ?? team2?.score ?? 0;
  const team1Side = (team1?.side || "CT") as "CT" | "T";
  const team2Side = (team2?.side || "T") as "CT" | "T";
  const team1Name = team1?.name || team1?.team?.name || team1Side;
  const team2Name = team2?.name || team2?.team?.name || team2Side;
  const team1Wins = team1Score > team2Score;
  const team2Wins = team2Score > team1Score;
  
  // Match metadata
  const map = match.map || "Unknown Map";
  const mapBg = MAP_BACKGROUNDS[map.toLowerCase()] || MAP_BACKGROUNDS.default;
  const playedAt = match.played_at || match.created_at;
  const formattedDate = playedAt 
    ? new Date(playedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })
    : "Recent";
  const formattedTime = playedAt
    ? new Date(playedAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
    : "";
  const totalRounds = team1Score + team2Score;
  const matchId = match.id || match.match_id || "";
  
  // Format duration
  const formatDuration = (seconds?: number) => {
    if (!seconds) return null;
    const mins = Math.floor(seconds / 60);
    return `${mins}m`;
  };

  const handleView = () => {
    router.push(`/matches/${gameId}/${matchId}`);
  };

  return (
    <m.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.15, duration: 0.5, type: "spring" }}
      whileHover={{ scale: 1.02, y: -5 }}
      className="group cursor-pointer"
      onClick={handleView}
    >
      <Card
        className={clsx(
          "relative overflow-hidden border-2",
          "border-default-200 dark:border-white/10",
          theme === "dark" 
            ? "hover:border-[#DCFF37]/50" 
            : "hover:border-[#FF4654]/50",
          "transition-all duration-300",
          "bg-gradient-to-br from-content1/95 via-content1/80 to-content1/60",
          "backdrop-blur-xl"
        )}
      >
        {/* Map background gradient */}
        <div className={clsx(
          "absolute inset-0 bg-gradient-to-br opacity-30",
          mapBg
        )} />
        
        {/* Animated border glow on hover */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          <div className={clsx(
            "absolute inset-0 bg-gradient-to-r via-transparent",
            theme === "dark"
              ? "from-[#FF4654]/20 to-[#DCFF37]/20"
              : "from-[#FF4654]/15 to-[#34445C]/15"
          )} />
        </div>
        
        <CardBody className="relative z-10 p-6">
          {/* Header: Map & Time */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Chip
                size="sm"
                variant="shadow"
                className="bg-default-100 dark:bg-white/10 text-foreground font-semibold"
                startContent={<Icon icon="solar:map-point-bold" width={12} />}
              >
                {map.replace("de_", "").toUpperCase()}
              </Chip>
              <Chip
                size="sm"
                variant="flat"
                style={{
                  backgroundColor: theme === "dark" ? "rgba(220, 255, 55, 0.1)" : "rgba(255, 70, 84, 0.1)",
                  color: accentColor
                }}
              >
                {gameId.toUpperCase()}
              </Chip>
            </div>
            
            <div className="flex items-center gap-2 text-xs text-default-500">
              <Icon icon="solar:clock-circle-bold" width={14} />
              <span>{formattedDate}</span>
              {formattedTime && <span>• {formattedTime}</span>}
            </div>
          </div>
          
          {/* Score Display */}
          <div className="flex items-center justify-center gap-2 md:gap-4">
            <TeamScore
              score={team1Score}
              side={team1Side}
              teamName={team1Name}
              isWinner={team1Wins}
              players={team1?.players || []}
              index={0}
              theme={theme}
            />
            
            <VSDivider theme={theme} />
            
            <TeamScore
              score={team2Score}
              side={team2Side}
              teamName={team2Name}
              isWinner={team2Wins}
              players={team2?.players || []}
              index={1}
              theme={theme}
            />
          </div>
          
          {/* Footer: Stats */}
          <div className="flex items-center justify-center gap-6 mt-6 pt-4 border-t border-default-200 dark:border-white/10">
            <div className="flex items-center gap-1.5 text-xs text-default-600 dark:text-default-400">
              <Icon icon="solar:refresh-circle-bold" width={14} />
              <span>{totalRounds} Rounds</span>
            </div>
            
            {match.duration && (
              <div className="flex items-center gap-1.5 text-xs text-default-600 dark:text-default-400">
                <Icon icon="solar:hourglass-bold" width={14} />
                <span>{formatDuration(match.duration)}</span>
              </div>
            )}
            
            <div className="flex items-center gap-1.5 text-xs text-default-600 dark:text-default-400">
              <Icon icon="solar:users-group-rounded-bold" width={14} />
              <span>{(team1?.players?.length || 0) + (team2?.players?.length || 0)} Players</span>
            </div>
          </div>
          
          {/* View button on hover */}
          <m.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 0, y: 10 }}
            whileHover={{ opacity: 1, y: 0 }}
            className="absolute bottom-4 left-1/2 transform -translate-x-1/2 group-hover:opacity-100 transition-opacity"
          >
            <Button
              size="sm"
              style={{
                backgroundColor: accentColor,
                color: theme === "dark" ? "#000" : "#fff"
              }}
              className="font-semibold px-6"
              startContent={<Icon icon="solar:play-bold" width={14} />}
            >
              View Match
            </Button>
          </m.div>
        </CardBody>
      </Card>
    </m.div>
  );
}

export default function MatchesShowcase({ className }: MatchesShowcaseProps) {
  const router = useRouter();
  const { theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  // Use 'dark' as fallback during SSR/hydration to prevent mismatch
  const activeTheme = mounted ? (resolvedTheme || theme || 'dark') : 'dark';
  const [matches, setMatches] = useState<MatchData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [_error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalMatches: 0,
    totalRounds: 0,
    avgDuration: 0,
  });

  // Fetch matches from API
  const fetchMatches = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/matches/featured?limit=6");
      
      if (!response.ok) {
        throw new Error("Failed to fetch matches");
      }
      
      const data = await response.json();
      const matchList = data.data || data.matches || [];
      setMatches(matchList);
      
      // Calculate stats
      if (matchList.length > 0) {
        const totalRounds = matchList.reduce((sum: number, m: MatchData) => {
          const t1 = m.scoreboard?.team_scoreboards?.[0]?.team_score ?? 0;
          const t2 = m.scoreboard?.team_scoreboards?.[1]?.team_score ?? 0;
          return sum + t1 + t2;
        }, 0);
        
        const totalDuration = matchList.reduce((sum: number, m: MatchData) => sum + (m.duration || 0), 0);
        
        setStats({
          totalMatches: data.total || matchList.length,
          totalRounds,
          avgDuration: Math.round(totalDuration / matchList.length / 60),
        });
      }
    } catch (err) {
      console.error("Error fetching matches:", err);
      setError(err instanceof Error ? err.message : "Failed to load matches");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMatches();
  }, [fetchMatches]);

  // Don't render if no matches and not loading
  if (!isLoading && matches.length === 0) {
    return null;
  }

  return (
    <LazyMotion features={domAnimation}>
      <section className={clsx(
        "relative w-full py-24 overflow-hidden",
        "bg-gradient-to-b from-background via-background/95 to-background",
        className
      )}>
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Grid pattern */}
          <div 
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `
                linear-gradient(rgba(220, 255, 55, 0.5) 1px, transparent 1px),
                linear-gradient(90deg, rgba(220, 255, 55, 0.5) 1px, transparent 1px)
              `,
              backgroundSize: "60px 60px",
            }}
          />
          
          {/* Floating orbs */}
          <m.div
            animate={{ 
              x: [0, 100, 0],
              y: [0, -50, 0],
              scale: [1, 1.2, 1],
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-20 right-20 w-96 h-96 bg-[#00A8FF]/10 rounded-full blur-3xl"
          />
          <m.div
            animate={{ 
              x: [0, -80, 0],
              y: [0, 80, 0],
              scale: [1, 1.3, 1],
            }}
            transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-20 left-20 w-80 h-80 bg-[#FFB800]/10 rounded-full blur-3xl"
          />
        </div>

        <div className="container mx-auto px-4 md:px-8 relative z-10">
          {/* Section header */}
          <div className="text-center mb-16">
            {/* Badge */}
            <m.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className={clsx(
                "inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6",
                "bg-default-100 dark:bg-white/5 border border-default-200 dark:border-white/10"
              )}
            >
              <Icon 
                icon="solar:medal-ribbons-star-bold" 
                className="w-5 h-5" 
                style={{ color: activeTheme === "dark" ? "#DCFF37" : "#FF4654" }}
              />
              <span className="text-sm font-semibold text-default-700 dark:text-white/80">Recent Battles</span>
            </m.div>
            
            {/* Title */}
            <m.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className={clsx(
                orbitron.className,
                "text-4xl md:text-5xl lg:text-6xl font-black mb-4"
              )}
            >
              <span className={clsx(
                "bg-clip-text text-transparent bg-gradient-to-r",
                activeTheme === "dark" 
                  ? "from-[#00A8FF] via-white to-[#FFB800]"
                  : "from-[#FF4654] via-[#34445C] to-[#00A8FF]"
              )}>
                Match History
              </span>
            </m.h2>
            
            {/* Subtitle */}
            <m.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="text-lg text-default-600 dark:text-default-400 max-w-2xl mx-auto"
            >
              Relive the most intense battles. Analyze strategies. Improve your game.
            </m.p>
            
            {/* Stats bar */}
            <m.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="flex items-center justify-center gap-8 mt-8"
            >
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-lg bg-[#00A8FF]/20 flex items-center justify-center">
                  <Icon icon="solar:gamepad-bold" className="w-5 h-5 text-[#00A8FF]" />
                </div>
                <div className="text-left">
                  <div className={clsx(electrolize.className, "text-2xl font-bold text-foreground")}>
                    <AnimatedCounter value={stats.totalMatches} />+
                  </div>
                  <div className="text-xs text-default-500">Matches Played</div>
                </div>
              </div>
              
              <div className="w-px h-10 bg-default-200 dark:bg-white/10" />
              
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-lg bg-[#FFB800]/20 flex items-center justify-center">
                  <Icon icon="solar:refresh-circle-bold" className="w-5 h-5 text-[#FFB800]" />
                </div>
                <div className="text-left">
                  <div className={clsx(electrolize.className, "text-2xl font-bold text-foreground")}>
                    <AnimatedCounter value={stats.totalRounds} />
                  </div>
                  <div className="text-xs text-default-500">Total Rounds</div>
                </div>
              </div>
              
              <div className="w-px h-10 bg-default-200 dark:bg-white/10" />
              
              <div className="flex items-center gap-2">
                <div 
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: activeTheme === "dark" ? "rgba(220, 255, 55, 0.2)" : "rgba(255, 70, 84, 0.2)" }}
                >
                  <Icon 
                    icon="solar:hourglass-bold" 
                    className="w-5 h-5" 
                    style={{ color: activeTheme === "dark" ? "#DCFF37" : "#FF4654" }}
                  />
                </div>
                <div className="text-left">
                  <div className={clsx(electrolize.className, "text-2xl font-bold text-foreground")}>
                    <AnimatedCounter value={stats.avgDuration} />m
                  </div>
                  <div className="text-xs text-default-500">Avg Duration</div>
                </div>
              </div>
            </m.div>
          </div>

          {/* Matches grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="h-80 rounded-2xl bg-default-100 dark:bg-white/5 animate-pulse"
                />
              ))}
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <m.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {matches.map((match, index) => (
                  <MatchShowcaseCard
                    key={match.id || match.match_id || index}
                    match={match}
                    index={index}
                    theme={activeTheme}
                  />
                ))}
              </m.div>
            </AnimatePresence>
          )}

          {/* CTA Buttons */}
          <m.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-12"
          >
            <Button
              className={clsx(
                "h-14 px-10 text-base font-black uppercase tracking-wider",
                orbitron.className
              )}
              color="primary"
              endContent={<Icon icon="solar:history-bold" width={22} />}
              radius="none"
              size="lg"
              style={{
                backgroundColor: activeTheme === "dark" ? "#DCFF37" : "#FF4654",
                color: activeTheme === "dark" ? "#0a0a0a" : "#ffffff",
                clipPath: "polygon(0 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%)",
              }}
              onPress={() => router.push("/matches")}
            >
              View All Matches
            </Button>
            <Button
              className={clsx(
                "h-14 px-10 text-base font-bold uppercase tracking-wider border-2",
                orbitron.className
              )}
              endContent={<Icon icon="solar:upload-square-bold" width={22} />}
              radius="none"
              size="lg"
              variant="bordered"
              onPress={() => router.push("/upload")}
            >
              Upload Your Replay
            </Button>
          </m.div>
        </div>
      </section>
    </LazyMotion>
  );
}

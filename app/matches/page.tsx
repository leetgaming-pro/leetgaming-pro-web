"use client";

/**
 * Matches Page - Professional Match Browser with Esports Branding
 * Browse matches with award-winning UX matching LobbiesShowcase style
 */

import React, { useState, useEffect, useCallback } from "react";
import {
  Chip,
  RadioGroup,
  Select,
  SelectItem,
  Input,
  Button,
} from "@nextui-org/react";
import { Icon } from "@iconify/react";
import { useRouter } from "next/navigation";
import { useOptionalAuth } from "@/hooks";
import {
  LazyMotion,
  domAnimation,
  m,
  useMotionValue,
  useTransform,
  animate,
} from "framer-motion";
import { AnimatePresence } from "framer-motion";
import clsx from "clsx";
import { Orbitron } from "next/font/google";
import { useTheme } from "next-themes";

import GameRadioItem from "@/components/filters/game-filter/game-radio-item";
import { useSDK } from "@/contexts/sdk-context";
import { logger } from "@/lib/logger";
import { ensureSession } from "@/types/replay-api/auth";
import { MatchData } from "@/types/replay-api/sdk";
import { MatchCardGrid } from "@/components/match/MatchCard";
import { NoMatchesFound, ErrorState } from "@/components/ui/empty-states";
import { MobileNavigation } from "@/components/ui";

const orbitron = Orbitron({
  weight: ["400", "700", "900"],
  subsets: ["latin"],
});

interface MatchListState {
  matches: MatchData[];
  loading: boolean;
  error: string | null;
  total: number;
  page: number;
  hasMore: boolean;
}

// Animated counter component
function AnimatedCounter({
  value,
  duration = 1,
}: {
  value: number;
  duration?: number;
}) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.round(latest));
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const controls = animate(count, value, { duration });
    return controls.stop;
  }, [value, count, duration]);

  useEffect(() => {
    const unsubscribe = rounded.on("change", (latest) =>
      setDisplayValue(latest),
    );
    return unsubscribe;
  }, [rounded]);

  return <span>{displayValue}</span>;
}

// Live pulse indicator
function LivePulse({ className }: { className?: string }) {
  return (
    <span className={clsx("relative flex h-2 w-2", className)}>
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF4654] opacity-75" />
      <span className="relative inline-flex rounded-full h-2 w-2 bg-[#FF4654]" />
    </span>
  );
}

export default function MatchesPage() {
  const { isAuthenticated } = useOptionalAuth();
  const router = useRouter();
  const { theme } = useTheme();
  const [state, setState] = useState<MatchListState>({
    matches: [],
    loading: true,
    error: null,
    total: 0,
    page: 1,
    hasMore: true,
  });

  // Filters state
  const [selectedGame, setSelectedGame] = useState<string>("cs2");
  const [selectedTeams, setSelectedTeams] = useState<string[]>([]);
  const [selectedVisibility, setSelectedVisibility] =
    useState<string>("public");
  const [sortBy, setSortBy] = useState<string>("most_recent");

  // Handle visibility change - private/shared require auth
  const handleVisibilityChange = (value: string) => {
    if ((value === "private" || value === "shared") && !isAuthenticated) {
      router.push("/signin?callbackUrl=/matches");
      return;
    }
    setSelectedVisibility(value);
  };

  // Use SDK context for consistent auth-aware API access
  const { sdk, isReady } = useSDK();

  // Search state
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState<string>("");

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch matches - uses SDK context for consistent auth
  const fetchMatches = useCallback(
    async (page: number = 1, append: boolean = false) => {
      if (!isReady) return;

      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        if (isAuthenticated || selectedVisibility !== "public") {
          const hasSession = await ensureSession();
          if (!hasSession) {
            throw new Error(
              "Failed to establish session. Please try refreshing the page.",
            );
          }
        }

        const response = await sdk.matches.listMatches({
          game_id: selectedGame,
          search_term: debouncedSearchTerm || undefined,
          limit: 20,
          offset: (page - 1) * 20,
        });

        setState((prev) => ({
          ...prev,
          matches: append ? [...prev.matches, ...response] : response,
          loading: false,
          total: response.length,
          page,
          hasMore: response.length === 20,
        }));
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to load matches";
        logger.error("[MatchesPage] Failed to fetch matches", error);
        setState((prev) => ({
          ...prev,
          loading: false,
          error: errorMessage,
        }));
      }
    },
    [
      isAuthenticated,
      selectedVisibility,
      sdk,
      isReady,
      selectedGame,
      debouncedSearchTerm,
    ],
  );

  // Load matches on mount and filter change
  useEffect(() => {
    fetchMatches(1, false);
  }, [fetchMatches]);

  // Load more handler
  const handleLoadMore = () => {
    if (!state.loading && state.hasMore) {
      fetchMatches(state.page + 1, true);
    }
  };

  const handleUpload = () => {
    router.push("/upload");
  };

  return (
    <LazyMotion features={domAnimation}>
      <section
        className={clsx(
          "relative w-full min-h-screen overflow-hidden pb-24 md:pb-0",
          "bg-gradient-to-b from-background via-background/95 to-background",
        )}
      >
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
            className="absolute bottom-20 right-1/4 w-80 h-80 bg-[#DCFF37]/10 rounded-full blur-[100px]"
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          />
        </div>

        <div className="relative container mx-auto px-4 sm:px-6 py-8 lg:py-20">
          {/* Section Header */}
          <m.div
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8 md:mb-12"
            initial={{ opacity: 0, y: 30 }}
            transition={{ duration: 0.6 }}
          >
            {/* Live indicator */}
            <div className="flex items-center justify-center gap-2 mb-4 md:mb-6">
              <LivePulse />
              <span
                className={clsx(
                  "text-xs font-bold uppercase tracking-[0.2em] sm:tracking-[0.3em]",
                  theme === "dark" ? "text-[#DCFF37]" : "text-[#FF4654]",
                  orbitron.className,
                )}
              >
                Match Library
              </span>
            </div>

            {/* Main title */}
            <h1
              className={clsx(
                "text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-tight mb-3 md:mb-4",
                orbitron.className,
              )}
            >
              <span className="text-foreground">View All </span>
              <span
                className={clsx(
                  "bg-clip-text text-transparent",
                  theme === "dark"
                    ? "bg-gradient-to-r from-[#DCFF37] via-[#FFC700] to-[#FF4654]"
                    : "bg-gradient-to-r from-[#FF4654] via-[#FFC700] to-[#DCFF37]",
                )}
              >
                Matches
              </span>
            </h1>

            <p className="text-sm sm:text-base md:text-lg text-default-500 max-w-2xl mx-auto mb-6 md:mb-8 px-4">
              Browse and analyze competitive matches from the community. Filter
              by game, visibility, and more.
            </p>

            {/* Stats Bar - Mobile optimized horizontal scroll */}
            <m.div
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-4 sm:gap-8 px-4 sm:px-8 py-3 sm:py-4 rounded-none border border-default-200/30 bg-default-100/30 backdrop-blur-sm overflow-x-auto max-w-full"
              initial={{ opacity: 0, scale: 0.9 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <div className="text-center min-w-[70px]">
                <div
                  className={clsx(
                    "text-xl sm:text-2xl font-black",
                    theme === "dark" ? "text-[#DCFF37]" : "text-[#FF4654]",
                    orbitron.className,
                  )}
                >
                  <AnimatedCounter value={state.total} />
                </div>
                <div className="text-[10px] sm:text-xs text-default-400 uppercase tracking-wider whitespace-nowrap">
                  Total Matches
                </div>
              </div>
              <div className="w-px h-8 sm:h-10 bg-default-200/50 flex-shrink-0" />
              <div className="text-center min-w-[60px]">
                <div
                  className={clsx(
                    "text-xl sm:text-2xl font-black text-[#FFC700]",
                    orbitron.className,
                  )}
                >
                  {selectedGame.toUpperCase()}
                </div>
                <div className="text-[10px] sm:text-xs text-default-400 uppercase tracking-wider whitespace-nowrap">
                  Selected Game
                </div>
              </div>
              <div className="w-px h-8 sm:h-10 bg-default-200/50 flex-shrink-0" />
              <div className="text-center min-w-[70px]">
                <div
                  className={clsx(
                    "text-xl sm:text-2xl font-black",
                    theme === "dark" ? "text-[#DCFF37]" : "text-[#FF4654]",
                    orbitron.className,
                  )}
                >
                  <AnimatedCounter value={state.matches.filter(m => m.status === "completed" || m.status === "analyzed").length} />
                </div>
                <div className="text-[10px] sm:text-xs text-default-400 uppercase tracking-wider whitespace-nowrap">
                  Analyzed
                </div>
              </div>
            </m.div>
          </m.div>

          {/* Filters Row - Mobile optimized with horizontal scroll */}
          <m.div
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4 mb-6 sm:mb-8"
            initial={{ opacity: 0, y: 20 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            {/* Search Input - Full width on mobile */}
            <Input
              type="text"
              placeholder="Search matches..."
              value={searchTerm}
              onValueChange={setSearchTerm}
              startContent={
                <Icon
                  icon="solar:magnifer-bold"
                  className="text-default-400"
                  width={18}
                />
              }
              endContent={
                searchTerm && (
                  <Button
                    isIconOnly
                    size="sm"
                    variant="light"
                    onPress={() => setSearchTerm("")}
                    className="h-8 w-8 min-w-8 touch-target"
                  >
                    <Icon icon="solar:close-circle-bold" width={16} />
                  </Button>
                )
              }
              classNames={{
                base: "w-full sm:w-64",
                input: "text-base sm:text-sm",
                inputWrapper: clsx(
                  "bg-default-100/50 backdrop-blur-sm rounded-none min-h-[48px] sm:min-h-[40px]",
                  "border border-default-200/50",
                  theme === "dark"
                    ? "hover:border-[#DCFF37]/50"
                    : "hover:border-[#FF4654]/50",
                ),
              }}
            />

            {/* Filters row - horizontal scroll on mobile */}
            <div className="flex items-center gap-3 overflow-x-auto pb-2 sm:pb-0 scrollbar-hide">
              {/* Game Filter */}
              <RadioGroup
                aria-label="Game"
                classNames={{
                  wrapper: "gap-2 flex-shrink-0",
                }}
                orientation="horizontal"
                value={selectedGame}
                onValueChange={setSelectedGame}
              >
                <GameRadioItem color="#FF4654" tooltip="CS:2" value="cs2" />
                <GameRadioItem color="#FFC700" tooltip="CS:GO" value="csgo" />
                <GameRadioItem
                  color="#DCFF37"
                  tooltip="Valorant"
                  value="valorant"
                />
              </RadioGroup>

              {/* Visibility Filter */}
              <Select
                aria-label="Visibility"
                classNames={{
                  base: "w-32 sm:w-40 flex-shrink-0",
                  trigger: clsx(
                    "bg-default-100/50 backdrop-blur-sm rounded-none min-h-[44px] sm:min-h-[40px]",
                    "border border-default-200/50",
                    theme === "dark"
                      ? "hover:border-[#DCFF37]/50"
                      : "hover:border-[#FF4654]/50",
                  ),
                }}
                selectedKeys={[selectedVisibility]}
                onSelectionChange={(keys) => {
                  const value = Array.from(keys)[0] as string;
                  handleVisibilityChange(value);
                }}
                placeholder="Visibility"
                variant="bordered"
              >
                <SelectItem key="public" value="public">
                  Public
                </SelectItem>
                <SelectItem key="private" value="private">
                  Private {!isAuthenticated && "🔒"}
                </SelectItem>
                <SelectItem key="shared" value="shared">
                  Shared {!isAuthenticated && "🔒"}
                </SelectItem>
                <SelectItem key="all" value="all">
                  All
                </SelectItem>
              </Select>

              {/* Sort Filter */}
              <Select
                aria-label="Sort by"
                classNames={{
                  base: "w-32 sm:w-40 flex-shrink-0",
                  trigger: clsx(
                    "bg-default-100/50 backdrop-blur-sm rounded-none min-h-[44px] sm:min-h-[40px]",
                    "border border-default-200/50",
                    theme === "dark"
                      ? "hover:border-[#DCFF37]/50"
                      : "hover:border-[#FF4654]/50",
                  ),
                }}
                selectedKeys={[sortBy]}
                onSelectionChange={(keys) =>
                  setSortBy(Array.from(keys)[0] as string)
                }
                placeholder="Sort by"
                variant="bordered"
              >
                <SelectItem key="newest" value="newest">
                  Newest
                </SelectItem>
                <SelectItem key="top_rated" value="top_rated">
                  Top Rated
                </SelectItem>
                <SelectItem key="most_popular" value="most_popular">
                  Most Popular
                </SelectItem>
              </Select>
            </div>
          </m.div>

          {/* Active filters display - Mobile swipeable chips */}
          {(selectedGame !== "cs2" ||
            selectedVisibility !== "public" ||
            selectedTeams.length > 0) && (
            <div className="flex flex-wrap items-center justify-center gap-2 mb-6 sm:mb-8 px-2 overflow-x-auto scrollbar-hide">
              {selectedGame !== "cs2" && (
                <Chip
                  classNames={{
                    base: "h-8 touch-target",
                    content: "text-default-700 text-sm",
                    closeButton: "text-default-500 w-5 h-5",
                  }}
                  variant="flat"
                  onClose={() => setSelectedGame("cs2")}
                >
                  Game: {selectedGame.toUpperCase()}
                </Chip>
              )}
              {selectedVisibility !== "public" && (
                <Chip
                  classNames={{
                    base: "h-8 touch-target",
                    content: "text-default-700 text-sm",
                    closeButton: "text-default-500 w-5 h-5",
                  }}
                  variant="flat"
                  onClose={() => setSelectedVisibility("public")}
                >
                  Visibility: {selectedVisibility}
                </Chip>
              )}
              {selectedTeams.map((team) => (
                <Chip
                  key={team}
                  classNames={{
                    base: "h-8 touch-target",
                    content: "text-default-700 text-sm",
                    closeButton: "text-default-500 w-5 h-5",
                  }}
                  variant="flat"
                  onClose={() =>
                    setSelectedTeams((prev) => prev.filter((t) => t !== team))
                  }
                >
                  Team: {team}
                </Chip>
              ))}
            </div>
          )}

          {/* Content Area */}
          <div className="mb-12">
            {/* Error state */}
            {state.error && (
              <ErrorState
                title="Error Loading Matches"
                message={state.error}
                onRetry={() => fetchMatches(1, false)}
              />
            )}

            {/* Loading state - Mobile optimized skeleton */}
            {state.loading && state.matches.length === 0 && !state.error && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                <AnimatePresence mode="popLayout">
                  {[...Array(6)].map((_, i) => (
                    <m.div
                      key={`skeleton-${i}`}
                      animate={{ opacity: 1 }}
                      className="h-56 sm:h-64 rounded-none bg-default-100/50 animate-pulse"
                      exit={{ opacity: 0 }}
                      initial={{ opacity: 0 }}
                    />
                  ))}
                </AnimatePresence>
              </div>
            )}

            {/* Empty state */}
            {!state.loading && state.matches.length === 0 && !state.error && (
              <NoMatchesFound
                searchTerm={debouncedSearchTerm}
                onClearSearch={
                  debouncedSearchTerm ? () => setSearchTerm("") : undefined
                }
              />
            )}

            {/* Matches grid */}
            {state.matches.length > 0 && (
              <>
                <MatchCardGrid
                  matches={state.matches}
                  gameId={selectedGame}
                  isLoading={false}
                  columns={3}
                />

                {/* Load more button - Touch optimized */}
                {state.hasMore && (
                  <m.div
                    className="flex justify-center mt-8 sm:mt-12"
                    animate={{ opacity: 1, y: 0 }}
                    initial={{ opacity: 0, y: 20 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                  >
                    <Button
                      className={clsx(
                        "h-12 sm:h-12 px-6 sm:px-8 text-sm sm:text-base font-bold uppercase tracking-wider border-2 touch-target w-full sm:w-auto",
                        orbitron.className,
                      )}
                      endContent={<Icon icon="solar:refresh-bold" width={20} />}
                      radius="none"
                      size="lg"
                      variant="bordered"
                      onPress={handleLoadMore}
                      isLoading={state.loading}
                      disabled={state.loading}
                    >
                      {state.loading ? "Loading..." : "Load More"}
                    </Button>
                  </m.div>
                )}
              </>
            )}
          </div>

          {/* Action Buttons - Mobile stack */}
          <m.div
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4 px-4 sm:px-0"
            initial={{ opacity: 0, y: 20 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            <Button
              className={clsx(
                "h-14 px-6 sm:px-10 text-sm sm:text-base font-black uppercase tracking-wider touch-target",
                orbitron.className,
              )}
              color="primary"
              endContent={<Icon icon="solar:upload-bold" width={22} />}
              radius="none"
              size="lg"
              style={{
                backgroundColor: theme === "dark" ? "#DCFF37" : "#FF4654",
                color: theme === "dark" ? "#0a0a0a" : "#ffffff",
                clipPath:
                  "polygon(0 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%)",
              }}
              onPress={handleUpload}
            >
              Upload Replay
            </Button>
            <Button
              className={clsx(
                "h-14 px-6 sm:px-10 text-sm sm:text-base font-bold uppercase tracking-wider border-2 touch-target",
                orbitron.className,
              )}
              endContent={<Icon icon="solar:home-2-bold" width={22} />}
              radius="none"
              size="lg"
              variant="bordered"
              onPress={() => router.push("/")}
            >
              Back to Home
            </Button>
          </m.div>
        </div>

        {/* Mobile Navigation */}
        <MobileNavigation />
      </section>
    </LazyMotion>
  );
}

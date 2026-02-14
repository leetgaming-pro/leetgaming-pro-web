"use client";

/**
 * Highlights Page - Professional Game Events Showcase with Esports Branding
 * Displays epic moments from matches with award-winning UX and visibility controls
 */

import React, { useState, useEffect, useCallback } from "react";
import { Button, Chip, Input, Select, SelectItem } from "@nextui-org/react";
import { Icon } from "@iconify/react";
import { useRouter } from "next/navigation";

import { HighlightCard as _HighlightCard } from "@/components/highlights/highlight-card";
import { useSDK } from "@/contexts/sdk-context";
import { logger } from "@/lib/logger";
import {
  GameEvent,
  HighlightEventType,
  HIGHLIGHT_CATEGORIES,
  HighlightFilters,
} from "@/types/replay-api/highlights.types";
import { useOptionalAuth } from "@/hooks";
import { ensureSession } from "@/types/replay-api/auth";
import { Card, CardBody, RadioGroup } from "@nextui-org/react";

// Reserved for future component migration
void _HighlightCard;
import GameRadioItem from "@/components/filters/game-filter/game-radio-item";
import { PageContainer } from "@/components/layout/page-container";

// Maps for filtering (reserved for future map filter feature)
const _MAPS = [
  { key: "all", label: "All Maps" },
  { key: "de_dust2", label: "Dust II" },
  { key: "de_mirage", label: "Mirage" },
  { key: "de_inferno", label: "Inferno" },
  { key: "de_nuke", label: "Nuke" },
  { key: "de_ancient", label: "Ancient" },
  { key: "de_anubis", label: "Anubis" },
  { key: "de_vertigo", label: "Vertigo" },
];

// Sort options (reserved for future sort feature)
const _SORT_OPTIONS = [
  { key: "created_at", label: "Most Recent" },
  { key: "views_count", label: "Most Viewed" },
  { key: "likes_count", label: "Most Liked" },
  { key: "kill_count", label: "Kill Count" },
];

// Generate mock highlights for demo when API is unavailable (reserved for fallback)
function _generateMockHighlights(count: number, page: number): GameEvent[] {
  const types: HighlightEventType[] = [
    "Clutch",
    "Ace",
    "MultiKill",
    "Headshot",
    "Wallbang",
    "NoScope",
    "FirstBlood",
  ];
  const clutchTypes: GameEvent["clutch_type"][] = [
    "1v1",
    "1v2",
    "1v3",
    "1v4",
    "1v5",
  ];
  const maps = ["de_dust2", "de_mirage", "de_inferno", "de_nuke", "de_ancient"];
  const weapons = ["AK-47", "M4A4", "AWP", "Deagle", "USP-S"];
  const playerNames = [
    "s1mple",
    "ZywOo",
    "NiKo",
    "device",
    "Twistzz",
    "electronic",
    "ropz",
    "b1t",
    "m0NESY",
    "broky",
  ];

  return Array.from({ length: count }, (_, i) => {
    const type = types[Math.floor(Math.random() * types.length)];
    const isClutch = type === "Clutch";
    const map = maps[Math.floor(Math.random() * maps.length)];
    const weapon = weapons[Math.floor(Math.random() * weapons.length)];
    const playerName =
      playerNames[Math.floor(Math.random() * playerNames.length)];

    return {
      id: `highlight-${page}-${i}-${Date.now()}`,
      type,
      game_id: "cs2",
      match_id: `match-${Math.floor(Math.random() * 1000)}`,
      tick_id: Math.floor(Math.random() * 100000),
      event_time: Math.floor(Math.random() * 120000) + 10000,
      round_number: Math.floor(Math.random() * 30) + 1,
      title: isClutch ? undefined : undefined, // Let the card generate title
      thumbnail_url: `/images/maps/${map.replace("de_", "")}.jpg`,
      map_name: map,
      weapon,
      weapon_category: "rifle",
      is_headshot: Math.random() > 0.5,
      is_wallbang: Math.random() > 0.8,
      is_noscope: type === "NoScope" || Math.random() > 0.9,
      clutch_type: isClutch
        ? clutchTypes[Math.floor(Math.random() * clutchTypes.length)]
        : undefined,
      clutch_success: isClutch ? Math.random() > 0.3 : undefined,
      kill_count:
        type === "MultiKill"
          ? Math.floor(Math.random() * 3) + 3
          : type === "Ace"
            ? 5
            : 1,
      primary_player: {
        id: `player-${i}`,
        display_name: playerName,
        avatar_url: `/avatars/default-player.svg`,
        team: Math.random() > 0.5 ? "NAVI" : "Vitality",
        team_color: Math.random() > 0.5 ? "CT" : "T",
      },
      views_count: Math.floor(Math.random() * 50000) + 1000,
      likes_count: Math.floor(Math.random() * 5000) + 100,
      shares_count: Math.floor(Math.random() * 500) + 10,
      created_at: new Date(
        Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000,
      ).toISOString(),
    };
  });
}

interface HighlightsListState {
  highlights: GameEvent[];
  loading: boolean;
  error: string | null;
  total: number;
  page: number;
  hasMore: boolean;
}

export default function Component() {
  const { isAuthenticated } = useOptionalAuth();
  const router = useRouter();
  const [state, setState] = useState<HighlightsListState>({
    highlights: [],
    loading: true,
    error: null,
    total: 0,
    page: 1,
    hasMore: true,
  });

  // Filters state
  const [selectedGame, setSelectedGame] = useState<string>("cs2");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedMap, setSelectedMap] = useState<string>("all");
  const [_selectedVisibility, _setSelectedVisibility] =
    useState<string>("public");
  const [sortBy, setSortBy] = useState<string>("most_recent");
  const [_page, _setPage] = useState<number>(1);

  // Search state
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState<string>("");

  // Use SDK context for consistent auth-aware API access
  const { sdk, isReady } = useSDK();

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch highlights - uses SDK context for consistent auth
  const fetchHighlights = useCallback(
    async (fetchPage: number = 1, append: boolean = false) => {
      if (!isReady) return;
      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        // For public highlights, we don't need authentication
        // Only ensure session if user is authenticated or needs private highlights
        if (isAuthenticated || _selectedVisibility !== "public") {
          const hasSession = await ensureSession();
          if (!hasSession) {
            throw new Error(
              "Failed to establish session. Please try refreshing the page.",
            );
          }
        }

        const filters: HighlightFilters = {
          game_id: selectedGame as GameEvent["game_id"],
          page: fetchPage,
          limit: 20,
          sort_by:
            sortBy === "most_recent"
              ? "created_at"
              : sortBy === "most_viewed"
                ? "views_count"
                : "created_at",
          sort_order: "desc",
        };

        if (selectedCategory !== "all") {
          filters.event_type = selectedCategory as HighlightEventType;
        }

        if (selectedMap !== "all") {
          filters.map_name = selectedMap;
        }

        const response = await sdk.highlights.getHighlights(filters);

        // Apply client-side search filtering if search term exists
        let filteredHighlights = response.highlights;
        if (debouncedSearchTerm) {
          const searchLower = debouncedSearchTerm.toLowerCase();
          filteredHighlights = response.highlights.filter(
            (highlight) =>
              highlight.primary_player?.display_name
                ?.toLowerCase()
                .includes(searchLower) ||
              highlight.type.toLowerCase().includes(searchLower) ||
              highlight.map_name?.toLowerCase().includes(searchLower) ||
              highlight.weapon?.toLowerCase().includes(searchLower),
          );
        }

        setState((prev) => ({
          ...prev,
          highlights: append
            ? [...prev.highlights, ...filteredHighlights]
            : filteredHighlights,
          loading: false,
          total: filteredHighlights.length,
          page: fetchPage,
          hasMore: response.highlights.length === 20,
        }));
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to load highlights";
        logger.error("[HighlightsPage] Failed to fetch highlights", error);
        setState((prev) => ({
          ...prev,
          loading: false,
          error: errorMessage,
        }));
      }
    },
    [
      selectedGame,
      selectedCategory,
      selectedMap,
      _selectedVisibility,
      sortBy,
      sdk,
      debouncedSearchTerm,
      isAuthenticated,
      isReady,
    ],
  );

  // Load highlights on mount and filter change
  useEffect(() => {
    fetchHighlights(1, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    selectedGame,
    selectedCategory,
    selectedMap,
    _selectedVisibility,
    sortBy,
    debouncedSearchTerm,
  ]);

  // Load more handler
  const handleLoadMore = () => {
    if (!state.loading && state.hasMore) {
      fetchHighlights(state.page + 1, true);
    }
  };

  // Handle filter changes
  const handleCategoryChange = (category: HighlightEventType | "all") => {
    setSelectedCategory(category);
    _setPage(1);
    fetchHighlights(1, true);
  };

  const _handleMapChange = (map: string) => {
    setSelectedMap(map);
    _setPage(1);
    fetchHighlights(1, true);
  };

  const handleSortChange = (sort: typeof sortBy) => {
    setSortBy(sort);
    _setPage(1);
    fetchHighlights(1, true);
  };

  // Video modal handlers
  const handlePlayHighlight = (highlight: GameEvent) => {
    router.push(`/highlights/${highlight.id}`);
  };

  const _handleLikeHighlight = async (highlight: GameEvent) => {
    // In production, this would call the API
    logger.info("Liked highlight", { id: highlight.id });
  };

  const handleShareHighlight = async (highlight: GameEvent) => {
    // Share functionality
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Check out this ${highlight.type} by ${highlight.primary_player?.display_name}!`,
          url: `${window.location.origin}/highlights/${highlight.id}`,
        });
      } catch (err) {
        // Fallback to clipboard
        navigator.clipboard.writeText(
          `${window.location.origin}/highlights/${highlight.id}`,
        );
      }
    } else {
      navigator.clipboard.writeText(
        `${window.location.origin}/highlights/${highlight.id}`,
      );
    }
  };

  // Featured highlights (first 2) - reserved for layout variations
  const _featuredHighlights = state.highlights.slice(0, 2);
  const _regularHighlights = state.highlights.slice(2);

  return (
    <PageContainer maxWidth="full" padding="none" className="min-h-screen">
      <div className="flex h-[calc(100vh_-_40px)] w-full gap-x-2 overflow-x-hidden">
        {/* Sidebar - LeetGaming brand: navy base with lime accent in dark, navy base with orange in light */}
        <div className="flex hidden h-full w-[380px] flex-shrink-0 flex-col items-start gap-y-6 rounded-none px-6 py-6 shadow-2xl lg:flex relative overflow-hidden bg-gradient-to-b from-[#34445C] via-[#2a3749] to-[#1e2a38] dark:from-[#0a0a0a] dark:via-[#111111] dark:to-[#0a0a0a] border-r border-[#34445C]/30 dark:border-[#DCFF37]/20">
          {/* Diagonal corner accent - LeetGaming signature battleOrange gradient */}
          <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-tl from-[#FF4654]/20 via-[#FFC700]/10 to-transparent dark:from-[#DCFF37]/10 dark:to-transparent pointer-events-none" />
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#FF4654] via-[#FFC700] to-[#FF4654] dark:from-[#DCFF37] dark:via-[#34445C] dark:to-[#DCFF37]" />

          <div className="z-10">
            <div className="flex items-center gap-2">
              <Icon
                icon="solar:play-bold"
                className="text-[#FF4654] dark:text-[#DCFF37]"
                width={28}
              />
              <div className="text-xl font-bold leading-7 text-white tracking-tight uppercase">
                Highlights
              </div>
            </div>
            <div className="mt-2 text-sm font-medium leading-6 text-white/70 dark:text-[#DCFF37]/70">
              Epic moments and game-changing plays
            </div>
          </div>

          {/* Stats Section */}
          <div className="z-10 w-full">
            <div className="rounded-lg bg-[#34445C]/50 dark:bg-[#1a1a1a]/50 p-4 border border-[#FF4654]/20 dark:border-[#DCFF37]/20">
              <div className="text-center">
                <div className="text-2xl font-bold text-white dark:text-[#DCFF37]">
                  {state.total.toLocaleString()}
                </div>
                <div className="text-sm text-white/70 dark:text-[#DCFF37]/70">
                  Epic Moments
                </div>
              </div>
            </div>
          </div>

          {/* Additional Stats */}
          <div className="z-10 w-full space-y-3">
            <div className="rounded-lg bg-[#34445C]/50 dark:bg-[#1a1a1a]/50 p-3 border border-[#FF4654]/20 dark:border-[#DCFF37]/20">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-lg font-bold text-[#FF4654] dark:text-[#DCFF37]">
                    {state.loading ? "..." : Math.floor(state.total / 50)}
                  </div>
                  <div className="text-xs text-white/70 dark:text-[#DCFF37]/70">
                    Highlights/Day
                  </div>
                </div>
                <Icon
                  icon="solar:calendar-bold"
                  className="text-[#FF4654]/60 dark:text-[#DCFF37]/60"
                  width={20}
                />
              </div>
            </div>

            <div className="rounded-lg bg-[#34445C]/50 dark:bg-[#1a1a1a]/50 p-3 border border-[#FF4654]/20 dark:border-[#DCFF37]/20">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-lg font-bold text-[#FF4654] dark:text-[#DCFF37]">
                    {state.loading ? "..." : "4.2M"}
                  </div>
                  <div className="text-xs text-white/70 dark:text-[#DCFF37]/70">
                    Total Views
                  </div>
                </div>
                <Icon
                  icon="solar:eye-bold"
                  className="text-[#FF4654]/60 dark:text-[#DCFF37]/60"
                  width={20}
                />
              </div>
            </div>

            <div className="rounded-lg bg-[#34445C]/50 dark:bg-[#1a1a1a]/50 p-3 border border-[#FF4654]/20 dark:border-[#DCFF37]/20">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-lg font-bold text-[#FF4654] dark:text-[#DCFF37]">
                    {state.loading ? "..." : "92%"}
                  </div>
                  <div className="text-xs text-white/70 dark:text-[#DCFF37]/70">
                    Clutch Success
                  </div>
                </div>
                <Icon
                  icon="solar:trophy-bold"
                  className="text-[#FF4654]/60 dark:text-[#DCFF37]/60"
                  width={20}
                />
              </div>
            </div>
          </div>

          {/* Filters Section */}
          <div className="z-10 w-full space-y-4">
            <div className="text-sm font-semibold text-white dark:text-[#DCFF37] uppercase tracking-wide">
              Filters
            </div>

            {/* Game Filter */}
            <div className="space-y-2">
              <div className="text-xs font-medium text-white/80 dark:text-[#DCFF37]/80 uppercase tracking-wide">
                Game
              </div>
              <RadioGroup
                aria-label="Game"
                classNames={{
                  wrapper: "gap-2",
                }}
                orientation="vertical"
                value={selectedGame}
                onValueChange={setSelectedGame}
              >
                <div className="flex items-center gap-2 cursor-pointer p-2 rounded hover:bg-[#34445C]/30 dark:hover:bg-[#DCFF37]/10">
                  <GameRadioItem color="#006FEE" tooltip="CS:2" value="cs2" />
                  <span className="text-sm text-white/90 dark:text-[#DCFF37]/90">
                    CS2
                  </span>
                </div>
                <div className="flex items-center gap-2 cursor-pointer p-2 rounded hover:bg-[#34445C]/30 dark:hover:bg-[#DCFF37]/10">
                  <GameRadioItem color="#F5A524" tooltip="CS:GO" value="csgo" />
                  <span className="text-sm text-white/90 dark:text-[#DCFF37]/90">
                    CS:GO
                  </span>
                </div>
                <div className="flex items-center gap-2 cursor-pointer p-2 rounded hover:bg-[#34445C]/30 dark:hover:bg-[#DCFF37]/10">
                  <GameRadioItem
                    color="#F31260"
                    tooltip="Valorant"
                    value="valorant"
                  />
                  <span className="text-sm text-white/90 dark:text-[#DCFF37]/90">
                    Valorant
                  </span>
                </div>
              </RadioGroup>
            </div>

            {/* Category Filter */}
            <div className="space-y-2">
              <div className="text-xs font-medium text-white/80 dark:text-[#DCFF37]/80 uppercase tracking-wide">
                Category
              </div>
              <Select
                aria-label="Category"
                classNames={{
                  base: "w-full",
                  trigger:
                    "bg-[#34445C]/50 dark:bg-[#1a1a1a]/50 border-[#FF4654]/30 dark:border-[#DCFF37]/30 text-white dark:text-[#DCFF37]",
                  value: "text-white dark:text-[#DCFF37]",
                }}
                selectedKeys={[selectedCategory]}
                onSelectionChange={(keys) =>
                  handleCategoryChange(
                    Array.from(keys)[0] as HighlightEventType | "all",
                  )
                }
                placeholder="All Categories"
                variant="bordered"
                items={[
                  { key: "all", label: "All Categories" },
                  ...HIGHLIGHT_CATEGORIES,
                ]}
              >
                {(item) => (
                  <SelectItem key={item.key} value={item.key}>
                    {item.label}
                  </SelectItem>
                )}
              </Select>
            </div>

            {/* Sort Filter */}
            <div className="space-y-2">
              <div className="text-xs font-medium text-white/80 dark:text-[#DCFF37]/80 uppercase tracking-wide">
                Sort By
              </div>
              <Select
                aria-label="Sort by"
                classNames={{
                  base: "w-full",
                  trigger:
                    "bg-[#34445C]/50 dark:bg-[#1a1a1a]/50 border-[#FF4654]/30 dark:border-[#DCFF37]/30 text-white dark:text-[#DCFF37]",
                  value: "text-white dark:text-[#DCFF37]",
                }}
                selectedKeys={[sortBy]}
                onSelectionChange={(keys) =>
                  handleSortChange(Array.from(keys)[0] as typeof sortBy)
                }
                placeholder="Select an option"
                variant="bordered"
              >
                <SelectItem key="most_recent" value="most_recent">
                  Most Recent
                </SelectItem>
                <SelectItem key="most_viewed" value="most_viewed">
                  Most Viewed
                </SelectItem>
                <SelectItem key="most_liked" value="most_liked">
                  Most Liked
                </SelectItem>
              </Select>
            </div>
          </div>

          {/* Upload Button */}
          {isAuthenticated && (
            <div className="z-10 mt-auto w-full">
              <Button
                as="a"
                href="/upload"
                className="w-full bg-gradient-to-r from-[#FF4654] to-[#FFC700] text-white font-semibold rounded-none shadow-lg hover:shadow-xl transition-all"
                startContent={
                  <Icon icon="solar:cloud-upload-bold" width={18} />
                }
              >
                Upload Replay
              </Button>
            </div>
          )}
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-h-0">
          {/* Mobile Header */}
          <div className="lg:hidden bg-gradient-to-r from-[#34445C] to-[#2a3749] dark:from-[#0a0a0a] dark:to-[#111111] p-4 border-b border-[#FF4654]/20 dark:border-[#DCFF37]/20">
            <div className="flex items-center gap-2">
              <Icon
                icon="solar:play-bold"
                className="text-[#FF4654] dark:text-[#DCFF37]"
                width={24}
              />
              <div className="text-lg font-bold text-white dark:text-[#DCFF37] uppercase tracking-tight">
                Highlights
              </div>
            </div>
            <div className="text-sm text-white/70 dark:text-[#DCFF37]/70 mt-1">
              {state.total} epic moments captured
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-auto p-6">
            {/* Search Input */}
            <div className="mb-6">
              <Input
                type="text"
                placeholder="Search highlights by player, type, map, or weapon..."
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
                      className="h-6 w-6 min-w-6"
                    >
                      <Icon icon="solar:close-circle-bold" width={14} />
                    </Button>
                  )
                }
                classNames={{
                  base: "max-w-md",
                  input: "text-sm",
                  inputWrapper:
                    "bg-[#34445C]/50 dark:bg-[#1a1a1a]/50 border-[#FF4654]/30 dark:border-[#DCFF37]/30",
                }}
              />
            </div>

            {/* Highlights Grid */}
            {state.error ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Icon
                  icon="solar:danger-triangle-bold"
                  className="text-red-500 mb-4"
                  width={48}
                />
                <h3 className="text-lg font-semibold text-default-900 mb-2">
                  Error Loading Highlights
                </h3>
                <p className="text-default-500 text-center max-w-md">
                  {state.error}
                </p>
                <Button
                  className="mt-4"
                  color="primary"
                  onClick={() => fetchHighlights(1, false)}
                >
                  Try Again
                </Button>
              </div>
            ) : state.highlights.length === 0 && !state.loading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Icon
                  icon="solar:play-bold"
                  className="text-default-400 mb-4"
                  width={48}
                />
                <h3 className="text-lg font-semibold text-default-900 mb-2">
                  No Highlights Found
                </h3>
                <p className="text-default-500 text-center max-w-md">
                  {selectedGame !== "cs2" || selectedCategory !== "all"
                    ? "Try adjusting your filters to see more highlights."
                    : "Be the first to upload a replay and share your epic moments!"}
                </p>
                {isAuthenticated && (
                  <Button
                    as="a"
                    href="/upload"
                    className="mt-4 bg-gradient-to-r from-[#FF4654] to-[#FFC700] text-white"
                    startContent={
                      <Icon icon="solar:cloud-upload-bold" width={18} />
                    }
                  >
                    Upload First Replay
                  </Button>
                )}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                  {state.highlights.map((highlight) => (
                    <Card
                      key={highlight.id}
                      className="group hover:shadow-xl transition-all duration-300 border border-default-200 dark:border-default-100 cursor-pointer"
                      onClick={() => handlePlayHighlight(highlight)}
                    >
                      <CardBody className="p-0">
                        <div className="aspect-video bg-gradient-to-br from-[#FF4654]/20 to-[#FFC700]/20 dark:from-[#DCFF37]/10 dark:to-[#34445C]/20 relative overflow-hidden">
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Icon
                              icon="solar:play-bold"
                              className="text-white/80"
                              width={48}
                            />
                          </div>
                          <div className="absolute top-2 left-2">
                            <Chip
                              size="sm"
                              color="primary"
                              variant="shadow"
                              className="text-xs"
                            >
                              {highlight.type}
                            </Chip>
                          </div>
                          <div className="absolute top-2 right-2">
                            <Chip
                              size="sm"
                              color="success"
                              variant="shadow"
                              className="text-xs"
                            >
                              {highlight.primary_player?.team || "Unknown"}
                            </Chip>
                          </div>
                        </div>
                        <div className="p-4">
                          <h3 className="font-semibold text-default-900 line-clamp-2 mb-2">
                            {highlight.type} by{" "}
                            {highlight.primary_player?.display_name ||
                              "Unknown"}
                          </h3>
                          <div className="flex items-center justify-between text-sm text-default-500 mb-3">
                            <span>
                              {new Date(
                                highlight.created_at || Date.now(),
                              ).toLocaleDateString()}
                            </span>
                            <span>{highlight.views_count || 0} views</span>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              color="primary"
                              variant="ghost"
                              className="flex-1"
                              onClick={(e) => {
                                e.stopPropagation();
                                handlePlayHighlight(highlight);
                              }}
                            >
                              Watch
                            </Button>
                            <Button
                              size="sm"
                              color="default"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleShareHighlight(highlight);
                              }}
                            >
                              <Icon icon="solar:share-bold" width={16} />
                            </Button>
                          </div>
                        </div>
                      </CardBody>
                    </Card>
                  ))}
                </div>

                {/* Load More */}
                {state.hasMore && (
                  <div className="flex justify-center">
                    <Button
                      color="primary"
                      variant="ghost"
                      size="lg"
                      isLoading={state.loading}
                      onClick={handleLoadMore}
                      className="min-w-[200px]"
                    >
                      {state.loading ? "Loading..." : "Load More"}
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </PageContainer>
  );
}

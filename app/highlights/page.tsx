"use client";

/**
 * Highlights Page - State-of-the-Art Game Events Showcase
 * Displays epic moments from CS2 matches: clutches, aces, multi-kills, etc.
 * Features infinite scroll, filtering, and stunning visual design
 */

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Button,
  Chip,
  Input,
  Spinner,
  Select,
  SelectItem,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Modal,
  ModalContent,
  ModalBody,
  Skeleton,
} from "@nextui-org/react";
import { Icon } from "@iconify/react";
import { motion, AnimatePresence } from "framer-motion";
import { useInView } from "react-intersection-observer";

import { HighlightCard } from "@/components/highlights/highlight-card";
import { PageContainer } from "@/components/layouts/centered-content";
import { ReplayAPISDK } from "@/types/replay-api/sdk";
import { ReplayApiSettingsMock } from "@/types/replay-api/settings";
import { logger } from "@/lib/logger";
import {
  GameEvent,
  HighlightEventType,
  HIGHLIGHT_CATEGORIES,
  HighlightFilters,
  getEventTypeColor,
} from "@/types/replay-api/highlights.types";

// Maps for filtering
const MAPS = [
  { key: "all", label: "All Maps" },
  { key: "de_dust2", label: "Dust II" },
  { key: "de_mirage", label: "Mirage" },
  { key: "de_inferno", label: "Inferno" },
  { key: "de_nuke", label: "Nuke" },
  { key: "de_ancient", label: "Ancient" },
  { key: "de_anubis", label: "Anubis" },
  { key: "de_vertigo", label: "Vertigo" },
];

// Sort options
const SORT_OPTIONS = [
  { key: "created_at", label: "Most Recent" },
  { key: "views_count", label: "Most Viewed" },
  { key: "likes_count", label: "Most Liked" },
  { key: "kill_count", label: "Kill Count" },
];

// Generate mock highlights for demo when API is unavailable
function generateMockHighlights(count: number, page: number): GameEvent[] {
  const types: HighlightEventType[] = ["Clutch", "Ace", "MultiKill", "Headshot", "Wallbang", "NoScope", "FirstBlood"];
  const clutchTypes: GameEvent["clutch_type"][] = ["1v1", "1v2", "1v3", "1v4", "1v5"];
  const maps = ["de_dust2", "de_mirage", "de_inferno", "de_nuke", "de_ancient"];
  const weapons = ["AK-47", "M4A4", "AWP", "Deagle", "USP-S"];
  const playerNames = ["s1mple", "ZywOo", "NiKo", "device", "Twistzz", "electronic", "ropz", "b1t", "m0NESY", "broky"];

  return Array.from({ length: count }, (_, i) => {
    const type = types[Math.floor(Math.random() * types.length)];
    const isClutch = type === "Clutch";
    const map = maps[Math.floor(Math.random() * maps.length)];
    const weapon = weapons[Math.floor(Math.random() * weapons.length)];
    const playerName = playerNames[Math.floor(Math.random() * playerNames.length)];

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
      clutch_type: isClutch ? clutchTypes[Math.floor(Math.random() * clutchTypes.length)] : undefined,
      clutch_success: isClutch ? Math.random() > 0.3 : undefined,
      kill_count: type === "MultiKill" ? Math.floor(Math.random() * 3) + 3 : type === "Ace" ? 5 : 1,
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
      created_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
    };
  });
}

export default function HighlightsPage() {
  // State
  const [highlights, setHighlights] = useState<GameEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  
  // Filters
  const [selectedCategory, setSelectedCategory] = useState<HighlightEventType | "all">("all");
  const [selectedMap, setSelectedMap] = useState("all");
  const [sortBy, setSortBy] = useState<"created_at" | "views_count" | "likes_count" | "kill_count">("created_at");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Video modal
  const [selectedHighlight, setSelectedHighlight] = useState<GameEvent | null>(null);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

  // Intersection observer for infinite scroll
  const { ref: loadMoreRef, inView } = useInView({
    threshold: 0.1,
    triggerOnce: false,
  });

  // API SDK
  const sdkRef = useRef<ReplayAPISDK | null>(null);
  
  // Initialize SDK
  useEffect(() => {
    sdkRef.current = new ReplayAPISDK(ReplayApiSettingsMock, logger);
  }, []);

  // Fetch highlights
  const fetchHighlights = useCallback(async (pageNum: number, reset = false) => {
    if (!sdkRef.current) return;

    try {
      if (reset) {
        setLoading(true);
        setError(null);
      } else {
        setLoadingMore(true);
      }

      const filters: HighlightFilters = {
        game_id: "cs2",
        page: pageNum,
        limit: 12,
        sort_by: sortBy,
        sort_order: "desc",
      };

      if (selectedCategory !== "all") {
        filters.event_type = selectedCategory;
      }

      if (selectedMap !== "all") {
        filters.map_name = selectedMap;
      }

      // Try fetching from API
      let newHighlights: GameEvent[] = [];
      let totalCount = 0;

      try {
        const response = await sdkRef.current.highlights.getHighlights(filters);
        newHighlights = response.highlights;
        totalCount = response.total;
      } catch (apiError) {
        // API unavailable - use mock data for demo
        logger.warn("Highlights API unavailable, using mock data", apiError);
        newHighlights = generateMockHighlights(12, pageNum);
        totalCount = 100; // Simulate more data available
      }

      // If API returned no data but no error, use mock data
      if (newHighlights.length === 0 && pageNum === 1) {
        newHighlights = generateMockHighlights(12, pageNum);
        totalCount = 100;
      }

      // Apply client-side search filter if needed
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        newHighlights = newHighlights.filter(h => 
          h.primary_player?.display_name?.toLowerCase().includes(query) ||
          h.map_name?.toLowerCase().includes(query) ||
          h.type.toLowerCase().includes(query) ||
          h.weapon?.toLowerCase().includes(query)
        );
      }

      if (reset) {
        setHighlights(newHighlights);
      } else {
        setHighlights(prev => [...prev, ...newHighlights]);
      }

      setHasMore(newHighlights.length >= 12);
      setPage(pageNum);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load highlights";
      logger.error("Failed to fetch highlights", err);
      setError(errorMessage);
      
      // Still show mock data on error
      if (pageNum === 1) {
        setHighlights(generateMockHighlights(12, 1));
        setHasMore(true);
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [selectedCategory, selectedMap, sortBy, searchQuery]);

  // Initial load
  useEffect(() => {
    fetchHighlights(1, true);
  }, [fetchHighlights]);

  // Infinite scroll
  useEffect(() => {
    if (inView && hasMore && !loading && !loadingMore) {
      fetchHighlights(page + 1, false);
    }
  }, [inView, hasMore, loading, loadingMore, page, fetchHighlights]);

  // Handle filter changes
  const handleCategoryChange = (category: HighlightEventType | "all") => {
    setSelectedCategory(category);
    setPage(1);
    fetchHighlights(1, true);
  };

  const handleMapChange = (map: string) => {
    setSelectedMap(map);
    setPage(1);
    fetchHighlights(1, true);
  };

  const handleSortChange = (sort: typeof sortBy) => {
    setSortBy(sort);
    setPage(1);
    fetchHighlights(1, true);
  };

  // Video modal handlers
  const handlePlayHighlight = (highlight: GameEvent) => {
    setSelectedHighlight(highlight);
    setIsVideoModalOpen(true);
  };

  const handleLikeHighlight = async (highlight: GameEvent) => {
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
        navigator.clipboard.writeText(`${window.location.origin}/highlights/${highlight.id}`);
      }
    } else {
      navigator.clipboard.writeText(`${window.location.origin}/highlights/${highlight.id}`);
    }
  };

  // Featured highlights (first 2)
  const featuredHighlights = highlights.slice(0, 2);
  const regularHighlights = highlights.slice(2);

  return (
    <PageContainer title="" description="" maxWidth="7xl">
      {/* Hero Header */}
      <div className="relative mb-12 py-12 -mx-4 px-4 overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0a] via-[#1a1a1a] to-[#0a0a0a]" />
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#FF4654] rounded-full filter blur-[150px] animate-pulse" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#DCFF37] rounded-full filter blur-[150px] animate-pulse delay-1000" />
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
                className="w-20 h-20 flex items-center justify-center bg-gradient-to-br from-[#FF4654] to-[#FFC700] dark:from-[#DCFF37] dark:to-[#34445C]"
                style={{
                  clipPath: "polygon(0 0, 100% 0, 100% calc(100% - 16px), calc(100% - 16px) 100%, 0 100%)",
                }}
              >
                <Icon icon="solar:video-frame-play-bold" className="text-[#0a0a0a]" width={48} />
              </div>
            </div>

            <h1 className="text-5xl md:text-7xl font-black text-[#F5F0E1] mb-4 tracking-tight">
              HIGHLIGHTS
            </h1>
            <p className="text-xl text-[#F5F0E1]/60 max-w-2xl mx-auto">
              Epic moments from the community. Watch clutches, aces, and incredible plays from CS2 matches.
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
              <p className="text-3xl font-bold text-[#DCFF37]">10K+</p>
              <p className="text-sm text-[#F5F0E1]/50">Highlights</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-[#FF4654]">500+</p>
              <p className="text-sm text-[#F5F0E1]/50">Aces</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-[#00D9FF]">2K+</p>
              <p className="text-sm text-[#F5F0E1]/50">Clutches</p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Filters Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="mb-8 space-y-4"
      >
        {/* Category chips */}
        <div className="flex flex-wrap gap-2">
          <Chip
            size="lg"
            variant={selectedCategory === "all" ? "solid" : "bordered"}
            className={`cursor-pointer rounded-none transition-all ${
              selectedCategory === "all"
                ? "bg-[#34445C] text-[#F5F0E1] dark:bg-[#DCFF37] dark:text-[#0a0a0a]"
                : "border-[#34445C]/30 dark:border-[#DCFF37]/30 hover:border-[#DCFF37]/60"
            }`}
            onClick={() => handleCategoryChange("all")}
          >
            All Highlights
          </Chip>
          {HIGHLIGHT_CATEGORIES.map((cat) => (
            <Chip
              key={cat.key}
              size="lg"
              variant={selectedCategory === cat.key ? "solid" : "bordered"}
              className={`cursor-pointer rounded-none transition-all ${
                selectedCategory === cat.key
                  ? "text-[#0a0a0a]"
                  : "border-[#34445C]/30 dark:border-[#DCFF37]/30 hover:border-opacity-60"
              }`}
              style={{
                backgroundColor: selectedCategory === cat.key ? cat.color : undefined,
                borderColor: selectedCategory !== cat.key ? `${cat.color}40` : undefined,
              }}
              startContent={<Icon icon={cat.icon} width={16} />}
              onClick={() => handleCategoryChange(cat.key)}
            >
              {cat.label}
            </Chip>
          ))}
        </div>

        {/* Search & Sort */}
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <Input
            className="max-w-xs"
            placeholder="Search players, maps, weapons..."
            value={searchQuery}
            onValueChange={setSearchQuery}
            onKeyDown={(e) => e.key === "Enter" && fetchHighlights(1, true)}
            startContent={
              <Icon icon="solar:magnifer-linear" width={20} className="text-[#FF4654] dark:text-[#DCFF37]" />
            }
            isClearable
            onClear={() => {
              setSearchQuery("");
              fetchHighlights(1, true);
            }}
            classNames={{
              inputWrapper: "rounded-none border-[#FF4654]/30 dark:border-[#DCFF37]/30 bg-[#1a1a1a]",
              input: "text-[#F5F0E1]",
            }}
          />

          <div className="flex gap-2">
            {/* Map Filter */}
            <Select
              size="sm"
              label="Map"
              selectedKeys={[selectedMap]}
              onChange={(e) => handleMapChange(e.target.value)}
              classNames={{
                trigger: "rounded-none bg-[#1a1a1a] border-[#34445C]/30 min-w-[140px]",
                popoverContent: "rounded-none bg-[#1a1a1a]",
              }}
            >
              {MAPS.map((map) => (
                <SelectItem key={map.key} value={map.key}>
                  {map.label}
                </SelectItem>
              ))}
            </Select>

            {/* Sort Dropdown */}
            <Dropdown>
              <DropdownTrigger>
                <Button
                  variant="bordered"
                  className="rounded-none border-[#34445C]/30 dark:border-[#DCFF37]/30"
                  endContent={<Icon icon="solar:alt-arrow-down-linear" width={16} />}
                >
                  {SORT_OPTIONS.find((s) => s.key === sortBy)?.label}
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                aria-label="Sort options"
                selectionMode="single"
                selectedKeys={[sortBy]}
                onSelectionChange={(keys) => handleSortChange(Array.from(keys)[0] as typeof sortBy)}
                classNames={{
                  base: "rounded-none",
                }}
              >
                {SORT_OPTIONS.map((option) => (
                  <DropdownItem key={option.key}>{option.label}</DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>
          </div>
        </div>
      </motion.div>

      {/* Error State */}
      {error && (
        <div className="mb-6 p-4 bg-[#FF4654]/10 border border-[#FF4654]/30 rounded-none">
          <div className="flex items-center gap-3">
            <Icon icon="solar:danger-triangle-bold" width={24} className="text-[#FF4654]" />
            <div>
              <p className="font-semibold text-[#FF4654]">Error loading highlights</p>
              <p className="text-sm text-[#F5F0E1]/60">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="rounded-none overflow-hidden"
              style={{
                clipPath: "polygon(0 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%)",
              }}
            >
              <Skeleton className="aspect-video w-full" />
              <div className="p-4 bg-[#1a1a1a] space-y-3">
                <Skeleton className="h-6 w-3/4 rounded-none" />
                <div className="flex items-center gap-2">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <Skeleton className="h-4 w-1/2 rounded-none" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : highlights.length === 0 ? (
        /* Empty State */
        <div className="text-center py-20">
          <div
            className="w-24 h-24 mx-auto mb-6 flex items-center justify-center bg-[#34445C]/20"
            style={{
              clipPath: "polygon(0 0, 100% 0, 100% calc(100% - 16px), calc(100% - 16px) 100%, 0 100%)",
            }}
          >
            <Icon icon="solar:video-frame-linear" width={48} className="text-[#DCFF37]/50" />
          </div>
          <h3 className="text-xl font-bold text-[#F5F0E1] mb-2">No highlights found</h3>
          <p className="text-[#F5F0E1]/50 mb-6">
            Try adjusting your filters or check back later for new content.
          </p>
          <Button
            className="rounded-none bg-[#DCFF37] text-[#0a0a0a] font-semibold"
            onPress={() => {
              setSelectedCategory("all");
              setSelectedMap("all");
              setSearchQuery("");
              fetchHighlights(1, true);
            }}
          >
            Clear Filters
          </Button>
        </div>
      ) : (
        <>
          {/* Featured Highlights */}
          {featuredHighlights.length > 0 && selectedCategory === "all" && page === 1 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mb-8"
            >
              <h2 className="text-2xl font-bold text-[#F5F0E1] mb-4 flex items-center gap-3">
                <Icon icon="solar:fire-bold" width={28} className="text-[#FF4654]" />
                Trending Now
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {featuredHighlights.map((highlight, i) => (
                  <motion.div
                    key={highlight.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, delay: 0.1 * i }}
                  >
                    <HighlightCard
                      highlight={highlight}
                      variant="featured"
                      onPlay={handlePlayHighlight}
                      onLike={handleLikeHighlight}
                      onShare={handleShareHighlight}
                    />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Regular Highlights Grid */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <h2 className="text-2xl font-bold text-[#F5F0E1] mb-4 flex items-center gap-3">
              <Icon icon="solar:play-circle-bold" width={28} className="text-[#DCFF37]" />
              {selectedCategory === "all" ? "All Highlights" : `${selectedCategory} Highlights`}
              <Chip size="sm" className="rounded-none bg-[#DCFF37]/20 text-[#DCFF37]">
                {highlights.length}+
              </Chip>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              <AnimatePresence mode="popLayout">
                {regularHighlights.map((highlight, i) => (
                  <motion.div
                    key={highlight.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3, delay: Math.min(i * 0.05, 0.3) }}
                    layout
                  >
                    <HighlightCard
                      highlight={highlight}
                      onPlay={handlePlayHighlight}
                      onLike={handleLikeHighlight}
                      onShare={handleShareHighlight}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Load More / Infinite Scroll Trigger */}
          {hasMore && (
            <div ref={loadMoreRef} className="flex justify-center py-12">
              {loadingMore ? (
                <div className="flex items-center gap-3">
                  <Spinner color="warning" size="lg" />
                  <span className="text-[#F5F0E1]/60">Loading more highlights...</span>
                </div>
              ) : (
                <Button
                  variant="bordered"
                  className="rounded-none border-[#DCFF37]/30 text-[#DCFF37]"
                  onPress={() => fetchHighlights(page + 1, false)}
                  startContent={<Icon icon="solar:refresh-linear" width={20} />}
                >
                  Load More
                </Button>
              )}
            </div>
          )}
        </>
      )}

      {/* Video Player Modal */}
      <Modal
        isOpen={isVideoModalOpen}
        onClose={() => {
          setIsVideoModalOpen(false);
          setSelectedHighlight(null);
        }}
        size="5xl"
        classNames={{
          base: "rounded-none bg-[#0a0a0a] border border-[#DCFF37]/30",
          closeButton: "text-[#F5F0E1] hover:bg-[#DCFF37]/20",
        }}
      >
        <ModalContent>
          <ModalBody className="p-0">
            {selectedHighlight && (
              <div className="relative">
                {/* Video Player Placeholder */}
                <div className="aspect-video bg-[#1a1a1a] flex items-center justify-center">
                  {selectedHighlight.video_url ? (
                    <video
                      src={selectedHighlight.video_url}
                      controls
                      autoPlay
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="text-center">
                      <Icon
                        icon="solar:video-frame-play-bold"
                        width={80}
                        className="text-[#DCFF37]/30 mb-4"
                      />
                      <p className="text-[#F5F0E1]/50">Video preview not available</p>
                      <p className="text-sm text-[#F5F0E1]/30 mt-2">
                        {selectedHighlight.type} by {selectedHighlight.primary_player?.display_name}
                      </p>
                    </div>
                  )}
                </div>

                {/* Highlight Info */}
                <div className="p-6 border-t border-[#DCFF37]/10">
                  <div className="flex items-start justify-between">
                    <div>
                      <Chip
                        size="sm"
                        className="rounded-none mb-2"
                        style={{
                          backgroundColor: getEventTypeColor(selectedHighlight.type),
                          color: "#0a0a0a",
                        }}
                      >
                        {selectedHighlight.type}
                      </Chip>
                      <h3 className="text-xl font-bold text-[#F5F0E1]">
                        {selectedHighlight.title || selectedHighlight.type}
                      </h3>
                      <p className="text-[#F5F0E1]/60 mt-1">
                        {selectedHighlight.primary_player?.display_name} on {selectedHighlight.map_name}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        isIconOnly
                        variant="flat"
                        className="rounded-none bg-[#FF4654]/20 text-[#FF4654]"
                        onPress={() => handleLikeHighlight(selectedHighlight)}
                      >
                        <Icon icon="solar:heart-bold" width={20} />
                      </Button>
                      <Button
                        isIconOnly
                        variant="flat"
                        className="rounded-none bg-[#DCFF37]/20 text-[#DCFF37]"
                        onPress={() => handleShareHighlight(selectedHighlight)}
                      >
                        <Icon icon="solar:share-bold" width={20} />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Call to Action */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="mt-16 relative overflow-hidden"
      >
        <div
          className="p-8 md:p-12 bg-gradient-to-r from-[#FF4654] via-[#FFC700] to-[#DCFF37] relative"
          style={{
            clipPath: "polygon(0 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%)",
          }}
        >
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <h3 className="text-2xl md:text-3xl font-black text-[#0a0a0a] mb-2">
                Got Epic Plays?
              </h3>
              <p className="text-[#0a0a0a]/70 max-w-lg">
                Upload your replays and let our AI automatically detect and create highlights from your best moments.
              </p>
            </div>
            <Button
              size="lg"
              className="rounded-none bg-[#0a0a0a] text-[#F5F0E1] font-bold px-8"
              startContent={<Icon icon="solar:upload-bold" width={24} />}
            >
              Upload Replay
            </Button>
          </div>
        </div>
      </motion.div>
    </PageContainer>
  );
}

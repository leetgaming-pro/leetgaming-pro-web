"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Icon } from "@iconify/react";
import {
  Chip,
  RadioGroup,
  Select,
  SelectItem,
  Button,
  Tooltip,
} from "@nextui-org/react";
import { useRouter } from "next/navigation";
import { useOptionalAuth } from "@/hooks";
import { BreadcrumbBar } from "@/components/breadcrumb/breadcrumb-bar";
import { PageContainer } from "@/components/layout/page-container";

import GameRadioItem from "@/components/filters/game-filter/game-radio-item";
import TagGroupItem from "@/components/filters/tag-filter/tag-group-item";
import { useSDK } from "@/contexts/sdk-context";
import { ReplayFile } from "@/types/replay-api/replay-file";
import { logger } from "@/lib/logger";
import { ReplayCardGrid } from "@/components/replay/ReplayCard";
import { NoReplaysFound, ErrorState } from "@/components/ui/empty-states";
import { EsportsSpinner } from "@/components/ui/loading-states";
import { MobileNavigation } from "@/components/ui";

interface ReplayListState {
  replays: ReplayFile[];
  loading: boolean;
  error: string | null;
  total: number;
  page: number;
  hasMore: boolean;
}

export default function ReplaysPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: _isLoading } = useOptionalAuth();
  const { sdk, isReady } = useSDK();

  // Filter states
  const [selectedGame, setSelectedGame] = useState<string>("cs2");
  const [selectedVisibility, setSelectedVisibility] =
    useState<string>("public");
  const [sortBy, setSortBy] = useState<string>("newest");
  const [selectedTeams, setSelectedTeams] = useState<string[]>([]);

  // Replay list state
  const [state, setState] = useState<ReplayListState>({
    replays: [],
    loading: true,
    error: null,
    total: 0,
    page: 1,
    hasMore: false,
  });

  // Handle visibility change with authentication check
  const handleVisibilityChange = (value: string) => {
    if (value === "private" || value === "shared") {
      if (!isAuthenticated) {
        router.push("/signin?callbackUrl=/replays");
        return;
      }
    }
    setSelectedVisibility(value);
  };

  // Fetch replays function - uses SDK context for consistent auth
  const fetchReplays = useCallback(
    async (page: number, append: boolean = false) => {
      if (!isReady) return;

      try {
        setState((prev) => ({
          ...prev,
          loading: true,
          error: null,
        }));

        const response = await sdk.replayFiles.searchReplayFiles({
          game_id: selectedGame,
          limit: 20,
          offset: (page - 1) * 20,
        });

        const newReplays = response;
        const total = response.length; // For now, assume we get all results
        const hasMore = response.length === 20; // Assuming 20 is the limit

        setState((prev) => ({
          ...prev,
          replays: append ? [...prev.replays, ...newReplays] : newReplays,
          loading: false,
          total,
          page,
          hasMore,
        }));
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to load replays";
        logger.error("[ReplaysPage] Failed to fetch replays", error);
        setState((prev) => ({
          ...prev,
          loading: false,
          error: errorMessage,
        }));
      }
    },
    [sdk, isReady, selectedGame],
  );

  // Load replays on mount and filter change
  useEffect(() => {
    fetchReplays(1, false);
  }, [fetchReplays, selectedVisibility, sortBy, selectedTeams]);

  // Load more handler
  const handleLoadMore = () => {
    if (!state.loading && state.hasMore) {
      fetchReplays(state.page + 1, true);
    }
  };

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
                icon="solar:gamepad-bold"
                className="text-[#FF4654] dark:text-[#DCFF37]"
                width={28}
              />
              <h1 className="text-xl font-bold leading-7 text-white tracking-tight uppercase">
                Replays
              </h1>
            </div>
            <p className="mt-2 text-sm font-medium leading-6 text-white/70 dark:text-[#DCFF37]/70">
              Relive epic moments and study the competition
            </p>
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

            {/* Visibility Filter */}
            <div className="space-y-2">
              <div className="text-xs font-medium text-white/80 dark:text-[#DCFF37]/80 uppercase tracking-wide">
                Visibility
              </div>
              <RadioGroup
                aria-label="Visibility"
                classNames={{
                  wrapper: "gap-2",
                }}
                orientation="vertical"
                value={selectedVisibility}
                onValueChange={handleVisibilityChange}
              >
                <div className="flex items-center gap-2 cursor-pointer p-2 rounded hover:bg-[#34445C]/30 dark:hover:bg-[#DCFF37]/10">
                  <TagGroupItem value="public">Public</TagGroupItem>
                </div>
                <Tooltip
                  content={
                    !isAuthenticated
                      ? "Sign in to view your private replays"
                      : undefined
                  }
                  isDisabled={isAuthenticated}
                >
                  <div className="flex items-center gap-2 cursor-pointer p-2 rounded hover:bg-[#34445C]/30 dark:hover:bg-[#DCFF37]/10">
                    <TagGroupItem value="private" isDisabled={!isAuthenticated}>
                      Private {!isAuthenticated && "🔒"}
                    </TagGroupItem>
                  </div>
                </Tooltip>
                <Tooltip
                  content={
                    !isAuthenticated
                      ? "Sign in to view shared replays"
                      : undefined
                  }
                  isDisabled={isAuthenticated}
                >
                  <div className="flex items-center gap-2 cursor-pointer p-2 rounded hover:bg-[#34445C]/30 dark:hover:bg-[#DCFF37]/10">
                    <TagGroupItem value="shared" isDisabled={!isAuthenticated}>
                      Shared {!isAuthenticated && "🔒"}
                    </TagGroupItem>
                  </div>
                </Tooltip>
                <div className="flex items-center gap-2 cursor-pointer p-2 rounded hover:bg-[#34445C]/30 dark:hover:bg-[#DCFF37]/10">
                  <TagGroupItem value="all">All</TagGroupItem>
                </div>
              </RadioGroup>
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
                  setSortBy(Array.from(keys)[0] as string)
                }
                placeholder="Select an option"
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
                icon="solar:gamepad-bold"
                className="text-[#FF4654] dark:text-[#DCFF37]"
                width={24}
              />
              <div className="text-lg font-bold text-white dark:text-[#DCFF37] uppercase tracking-tight">
                Replays
              </div>
            </div>
            <div className="text-sm text-white/70 dark:text-[#DCFF37]/70 mt-1">
              {state.total} epic moments captured
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-auto p-6">
            {/* Breadcrumbs */}
            <div className="mb-6">
              <BreadcrumbBar />
            </div>

            {/* Active filters display */}
            {(selectedGame !== "cs2" ||
              selectedVisibility !== "public" ||
              selectedTeams.length > 0) && (
              <div className="mb-4 flex flex-wrap items-center gap-2">
                {selectedGame !== "cs2" && (
                  <Chip
                    classNames={{
                      content: "text-default-700",
                      closeButton: "text-default-500",
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
                      content: "text-default-700",
                      closeButton: "text-default-500",
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
                      content: "text-default-700",
                      closeButton: "text-default-500",
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

            {/* Replays Grid */}
            {state.loading && state.replays.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16">
                <EsportsSpinner size="lg" label="Loading replays..." />
              </div>
            ) : state.error ? (
              <ErrorState
                title="Error Loading Replays"
                message={state.error}
                onRetry={() => fetchReplays(1, false)}
              />
            ) : state.replays.length === 0 ? (
              <NoReplaysFound
                isAuthenticated={isAuthenticated}
                onUpload={() =>
                  router.push(
                    isAuthenticated ? "/upload" : "/signin?callbackUrl=/upload",
                  )
                }
                hasFilters={
                  selectedGame !== "cs2" ||
                  selectedVisibility !== "public" ||
                  selectedTeams.length > 0
                }
                onClearFilters={() => {
                  setSelectedGame("cs2");
                  setSelectedVisibility("public");
                  setSelectedTeams([]);
                }}
              />
            ) : (
              <>
                <ReplayCardGrid replays={state.replays} isLoading={false} />

                {/* Load More */}
                {state.hasMore && (
                  <div className="flex justify-center mt-8">
                    <Button
                      color="primary"
                      variant="ghost"
                      size="lg"
                      isLoading={state.loading}
                      onClick={handleLoadMore}
                      className="min-w-[200px]"
                      startContent={
                        !state.loading && (
                          <Icon icon="solar:refresh-bold" width={18} />
                        )
                      }
                    >
                      {state.loading ? "Loading..." : "Load More Replays"}
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <MobileNavigation />
    </PageContainer>
  );
}

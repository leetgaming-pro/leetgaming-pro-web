"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  BreadcrumbItem,
  Breadcrumbs,
  CheckboxGroup,
  Chip,
  RadioGroup,
  Select,
  SelectItem,
  Spinner,
  Button,
  Card,
  CardBody,
  CardFooter,
  Tooltip,
} from "@nextui-org/react";
import { useRouter } from "next/navigation";
import { useOptionalAuth } from "@/hooks";
import { ShareButton } from "@/components/share/share-button";

import GameRadioItem from "@/components/filters/game-filter/game-radio-item";
import PopoverFilterWrapper from "@/components/filters/popover-filter-wrapper";
import TagGroupItem from "@/components/filters/tag-filter/tag-group-item";
import RatingRadioGroup from "@/components/filters/rating-filter/rating-radio-group";
import { ReplayAPISDK } from "@/types/replay-api/sdk";
import { ReplayApiSettingsMock, GameIDKey, VisibilityTypeKey } from "@/types/replay-api/settings";
import { SearchBuilder, SortDirection } from "@/types/replay-api/search-builder";
import { logger } from "@/lib/logger";
import { ReplayFile } from "@/types/replay-api/replay-file";

interface ReplayListState {
  replays: ReplayFile[];
  loading: boolean;
  error: string | null;
  total: number;
  page: number;
  hasMore: boolean;
}

export default function Component() {
  const { isAuthenticated, isLoading: authLoading, redirectToSignIn } = useOptionalAuth();
  const router = useRouter();
  const [state, setState] = useState<ReplayListState>({
    replays: [],
    loading: true,
    error: null,
    total: 0,
    page: 1,
    hasMore: true,
  });

  // Filters state
  const [selectedGame, setSelectedGame] = useState<string>("cs2");
  const [selectedTeams, setSelectedTeams] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedVisibility, setSelectedVisibility] = useState<string>("public");
  const [sortBy, setSortBy] = useState<string>("most_recent");

  // Handle visibility change - private/shared require auth
  const handleVisibilityChange = (value: string) => {
    if ((value === 'private' || value === 'shared') && !isAuthenticated) {
      redirectToSignIn('/replays');
      return;
    }
    setSelectedVisibility(value);
  };

  const sdk = useMemo(() => new ReplayAPISDK(ReplayApiSettingsMock, logger), []);

  // Fetch replays
  const fetchReplays = async (page: number = 1, append: boolean = false) => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const searchBuilder = new SearchBuilder()
        .withGameIds(selectedGame as GameIDKey)
        .sortDesc(sortBy === 'most_recent' ? 'created_at' : 'created_at')
        .paginate(page, 20);

      // Apply visibility filter - only add filter for non-all values
      if (selectedVisibility !== 'all' && selectedVisibility !== 'public' && selectedVisibility !== 'private' && selectedVisibility !== 'shared') {
        // Skip invalid visibility values
      } else if (selectedVisibility !== 'all') {
        // Use raw string since SDK handles conversion
        searchBuilder.withResourceVisibilities(selectedVisibility);
      }

      // Apply team filter if selected
      if (selectedTeams.length > 0) {
        searchBuilder.withTeamIds(selectedTeams);
      }

      const search = searchBuilder.build();
      const response = await sdk.replayFiles.searchReplayFiles(search.filters);

      setState(prev => ({
        ...prev,
        replays: append ? [...prev.replays, ...response] : response,
        loading: false,
        total: response.length,
        page,
        hasMore: response.length === 20,
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load replays';
      logger.error('[ReplaysPage] Failed to fetch replays', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));
    }
  };

  // Load replays on mount and filter change
  useEffect(() => {
    fetchReplays(1, false);
  }, [selectedGame, selectedVisibility, sortBy, selectedTeams]);

  // Load more handler
  const handleLoadMore = () => {
    if (!state.loading && state.hasMore) {
      fetchReplays(state.page + 1, true);
    }
  };

  return (
    <div className="h-full left-0 right-0 px-2 lg:px-24 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 flex items-center justify-center bg-gradient-to-br from-[#FF4654] to-[#FFC700] dark:from-[#DCFF37] dark:to-[#34445C] rounded-none"
            style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%)' }}>
            <svg className="w-6 h-6 text-[#F5F0E1] dark:text-[#1a1a1a]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#34445C] dark:text-[#F5F0E1]">Replay Library</h1>
            <p className="text-sm text-[#34445C]/60 dark:text-[#F5F0E1]/60">Browse and analyze game replays</p>
          </div>
        </div>
        <Breadcrumbs classNames={{
          base: "rounded-none",
          list: "rounded-none",
          separator: "text-[#FF4654] dark:text-[#DCFF37]",
        }}>
          <BreadcrumbItem className="text-[#34445C] dark:text-[#F5F0E1]">Home</BreadcrumbItem>
          <BreadcrumbItem className="text-[#FF4654] dark:text-[#DCFF37] font-semibold">Replays</BreadcrumbItem>
        </Breadcrumbs>
      </div>
      <div className="flex gap-x-6">
        <div className="w-full flex-1 flex-col">
          <header className="relative z-10 flex flex-col gap-2 rounded-none bg-[#F5F0E1]/90 dark:bg-[#1a1a1a]/90 px-4 pb-3 pt-2 md:pt-3 border border-[#FF4654]/20 dark:border-[#DCFF37]/20">
            <div className="flex items-center gap-1 md:hidden md:gap-2">
              <h2 className="text-large font-medium text-[#34445C] dark:text-[#F5F0E1]">Replays</h2>
              <span className="text-small text-[#FF4654] dark:text-[#DCFF37]">({state.total})</span>
            </div>
            <div className="flex items-center justify-between gap-2 ">
              <div className="flex flex-row gap-2">
                <div className="hidden items-center gap-1 md:flex">
                  <h2 className="text-medium font-medium text-[#34445C] dark:text-[#F5F0E1]">Replays</h2>
                  <span className="text-small text-[#FF4654] dark:text-[#DCFF37]">({state.total})</span>
                </div>
                {!isAuthenticated && !authLoading && (
                  <Chip 
                    color="warning" 
                    variant="flat" 
                    size="sm" 
                    className="rounded-none cursor-pointer hover:bg-warning/20"
                    onClick={() => redirectToSignIn('/replays')}
                  >
                    Sign in to upload replays
                  </Chip>
                )}
              </div>
              <div className="-ml-2 flex w-full flex-wrap items-center justify-start gap-2 md:ml-0 md:justify-end">
                <PopoverFilterWrapper title="Game">
                  <RadioGroup
                    aria-label="Game"
                    classNames={{
                      wrapper: "gap-2",
                    }}
                    orientation="horizontal"
                    value={selectedGame}
                    onValueChange={setSelectedGame}
                  >
                    <GameRadioItem color="#006FEE" tooltip="CS:2" value="cs2" />
                    <GameRadioItem color="#F5A524" tooltip="CS:GO" value="csgo" />
                    <GameRadioItem color="#F31260" tooltip="Valorant" value="valorant" />
                  </RadioGroup>
                </PopoverFilterWrapper>
                <PopoverFilterWrapper title="Visibility">
                  <RadioGroup
                    aria-label="Visibility"
                    classNames={{
                      wrapper: "gap-2",
                    }}
                    orientation="vertical"
                    value={selectedVisibility}
                    onValueChange={handleVisibilityChange}
                  >
                    <TagGroupItem value="public">Public</TagGroupItem>
                    <Tooltip 
                      content={!isAuthenticated ? "Sign in to view your private replays" : undefined}
                      isDisabled={isAuthenticated}
                    >
                      <div>
                        <TagGroupItem 
                          value="private" 
                          isDisabled={!isAuthenticated}
                        >
                          Private {!isAuthenticated && "🔒"}
                        </TagGroupItem>
                      </div>
                    </Tooltip>
                    <Tooltip 
                      content={!isAuthenticated ? "Sign in to view shared replays" : undefined}
                      isDisabled={isAuthenticated}
                    >
                      <div>
                        <TagGroupItem 
                          value="shared"
                          isDisabled={!isAuthenticated}
                        >
                          Shared {!isAuthenticated && "🔒"}
                        </TagGroupItem>
                      </div>
                    </Tooltip>
                    <TagGroupItem value="all">All</TagGroupItem>
                  </RadioGroup>
                </PopoverFilterWrapper>
                <Select
                  aria-label="Sort by"
                  classNames={{
                    base: "items-center justify-end max-w-fit",
                    value: "w-[112px]",
                  }}
                  selectedKeys={[sortBy]}
                  onSelectionChange={(keys) => setSortBy(Array.from(keys)[0] as string)}
                  labelPlacement="outside-left"
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
          </header>
          <main className="mt-4 h-full w-full overflow-visible px-1">
            {/* Active filters display */}
            {(selectedGame !== 'cs2' || selectedVisibility !== 'public' || selectedTeams.length > 0) && (
              <div className="mb-4 mt-2 flex flex-wrap items-center gap-2">
                {selectedGame !== 'cs2' && (
                  <Chip
                    classNames={{
                      content: "text-default-700",
                      closeButton: "text-default-500",
                    }}
                    variant="flat"
                    onClose={() => setSelectedGame('cs2')}
                  >
                    Game: {selectedGame.toUpperCase()}
                  </Chip>
                )}
                {selectedVisibility !== 'public' && (
                  <Chip
                    classNames={{
                      content: "text-default-700",
                      closeButton: "text-default-500",
                    }}
                    variant="flat"
                    onClose={() => setSelectedVisibility('public')}
                  >
                    Visibility: {selectedVisibility}
                  </Chip>
                )}
                {selectedTeams.map(team => (
                  <Chip
                    key={team}
                    classNames={{
                      content: "text-default-700",
                      closeButton: "text-default-500",
                    }}
                    variant="flat"
                    onClose={() => setSelectedTeams(prev => prev.filter(t => t !== team))}
                  >
                    Team: {team}
                  </Chip>
                ))}
              </div>
            )}

            {/* Error state */}
            {state.error && (
              <Card className="mb-4">
                <CardBody className="text-center py-8">
                  <p className="text-danger">{state.error}</p>
                  <Button
                    color="primary"
                    className="mt-4"
                    onPress={() => fetchReplays(1, false)}
                  >
                    Retry
                  </Button>
                </CardBody>
              </Card>
            )}

            {/* Loading state */}
            {state.loading && state.replays.length === 0 && (
              <div className="flex justify-center items-center py-20">
                <Spinner size="lg" label="Loading replays..." />
              </div>
            )}

            {/* Empty state */}
            {!state.loading && state.replays.length === 0 && !state.error && (
              <Card className="mb-4 rounded-none border border-[#FF4654]/20 dark:border-[#DCFF37]/20">
                <CardBody className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center bg-gradient-to-br from-[#FF4654] to-[#FFC700] dark:from-[#DCFF37] dark:to-[#34445C]"
                    style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%)' }}>
                    <span className="text-2xl text-[#F5F0E1] dark:text-[#34445C]">📹</span>
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-[#34445C] dark:text-[#F5F0E1]">No replays found</h3>
                  <p className="text-default-500 mb-4">
                    Try adjusting your filters or upload your first replay
                  </p>
                  <Button
                    className="bg-gradient-to-r from-[#FF4654] to-[#FFC700] text-[#F5F0E1] rounded-none"
                    style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%)' }}
                    as="a"
                    href="/upload"
                  >
                    Upload Replay
                  </Button>
                </CardBody>
              </Card>
            )}

            {/* Replays grid */}
            {state.replays.length > 0 && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
                  {state.replays.map((replay) => (
                    <Card
                      key={replay.id}
                      isPressable
                      as="a"
                      href={`/replays/${replay.id}`}
                      className="hover:scale-[1.02] hover:shadow-lg hover:shadow-[#FF4654]/20 dark:hover:shadow-[#DCFF37]/20 transition-all rounded-none border border-[#FF4654]/20 dark:border-[#DCFF37]/20"
                    >
                      <CardBody className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <Chip
                            size="sm"
                            className="rounded-none"
                            color={
                              replay.status === 'Completed' || replay.status === 'Ready'
                                ? 'success'
                                : replay.status === 'Processing'
                                ? 'warning'
                                : replay.status === 'Failed'
                                ? 'danger'
                                : 'default'
                            }
                            variant="flat"
                          >
                            {replay.status}
                          </Chip>
                          <Chip size="sm" variant="flat" className="rounded-none">
                            {replay.gameId.toUpperCase()}
                          </Chip>
                        </div>
                        <h4 className="font-semibold text-md mb-1 truncate text-[#34445C] dark:text-[#F5F0E1]">
                          Replay #{replay.id.slice(0, 8)}
                        </h4>
                        <p className="text-xs text-default-500 mb-2">
                          {new Date(replay.createdAt).toLocaleDateString()}
                        </p>
                        <div className="flex justify-between items-center text-xs text-default-400">
                          <span>{(replay.size / 1024 / 1024).toFixed(2)} MB</span>
                          <span>{replay.networkId}</span>
                        </div>
                      </CardBody>
                      <CardFooter className="pt-0 px-4 pb-4">
                        <ShareButton
                          contentType="replay"
                          contentId={replay.id}
                          title={`Replay #${replay.id.slice(0, 8)}`}
                          description={`${replay.gameId.toUpperCase()} replay from ${new Date(replay.createdAt).toLocaleDateString()}`}
                          variant="flat"
                          size="sm"
                          className="w-full rounded-none"
                        />
                      </CardFooter>
                    </Card>
                  ))}
                </div>

                {/* Load more button */}
                {state.hasMore && (
                  <div className="flex justify-center mt-8 mb-12">
                    <Button
                      className="bg-[#34445C] dark:bg-[#DCFF37] text-[#F5F0E1] dark:text-[#34445C] rounded-none"
                      style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%)' }}
                      onPress={handleLoadMore}
                      isLoading={state.loading}
                      disabled={state.loading}
                    >
                      {state.loading ? 'Loading...' : 'Load More'}
                    </Button>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

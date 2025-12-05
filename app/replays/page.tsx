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
} from "@nextui-org/react";
import { useSession } from "next-auth/react";
import { ShareButton } from "@/components/share/share-button";

import GameRadioItem from "@/components/filters/game-filter/game-radio-item";
import PopoverFilterWrapper from "@/components/filters/popover-filter-wrapper";
import TagGroupItem from "@/components/filters/tag-filter/tag-group-item";
import RatingRadioGroup from "@/components/filters/rating-filter/rating-radio-group";
import { ReplayAPISDK } from "@/types/replay-api/sdk";
import { ReplayApiSettingsMock, GameIDKey, VisibilityTypeKey } from "@/types/replay-api/settings";
import { SearchBuilder, SortDirection } from "@/types/replay-api/search-builder";
import { logger } from "@/lib/logger";
import { isAuthenticatedSync } from "@/types/replay-api/auth";
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
  const { data: session } = useSession();
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
    <div className="h-full left-0 right-0 px-2 lg:px-24">
      <nav className="my-4 px-2 py-2">
        <Breadcrumbs>
          <BreadcrumbItem>Home</BreadcrumbItem>
          <BreadcrumbItem>Replays</BreadcrumbItem>
        </Breadcrumbs>
      </nav>
      <div className="flex gap-x-6">
        <div className="w-full flex-1 flex-col">
          <header className="relative z-10 flex flex-col gap-2 rounded-medium bg-default-50 px-4 pb-3 pt-2 md:pt-3">
            <div className="flex items-center gap-1 md:hidden md:gap-2">
              <h2 className="text-large font-medium">Replays</h2>
              <span className="text-small text-default-400">({state.total})</span>
            </div>
            <div className="flex items-center justify-between gap-2 ">
              <div className="flex flex-row gap-2">
                <div className="hidden items-center gap-1 md:flex">
                  <h2 className="text-medium font-medium">Replays</h2>
                  <span className="text-small text-default-400">({state.total})</span>
                </div>
                {!isAuthenticatedSync() && (
                  <Chip color="warning" variant="flat" size="sm">
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
                    onValueChange={setSelectedVisibility}
                  >
                    <TagGroupItem value="public">Public</TagGroupItem>
                    <TagGroupItem value="private">Private</TagGroupItem>
                    <TagGroupItem value="shared">Shared</TagGroupItem>
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
              <Card className="mb-4">
                <CardBody className="text-center py-12">
                  <h3 className="text-xl font-semibold mb-2">No replays found</h3>
                  <p className="text-default-500 mb-4">
                    Try adjusting your filters or upload your first replay
                  </p>
                  <Button
                    color="primary"
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
                      className="hover:scale-105 transition-transform"
                    >
                      <CardBody className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <Chip
                            size="sm"
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
                          <Chip size="sm" variant="flat">
                            {replay.gameId.toUpperCase()}
                          </Chip>
                        </div>
                        <h4 className="font-semibold text-md mb-1 truncate">
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
                          className="w-full"
                        />
                      </CardFooter>
                    </Card>
                  ))}
                </div>

                {/* Load more button */}
                {state.hasMore && (
                  <div className="flex justify-center mt-8 mb-12">
                    <Button
                      color="primary"
                      variant="flat"
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

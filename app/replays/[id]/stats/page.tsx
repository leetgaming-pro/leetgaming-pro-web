"use client";

/**
 * Enhanced Replay Detail Page
 * Shows replay metadata and routes to match details when processing is complete
 */

import React, { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Chip,
  Divider,
  Spinner,
  Progress,
  Tabs,
  Tab,
} from "@nextui-org/react";
import { Icon } from "@iconify/react";
import { MatchScoreboard } from "@/components/replay/match-stats/scoreboard";
import { HeatmapVisualizer } from "@/components/replay/match-stats/heatmap";
import { ReplayAPISDK, MatchData } from "@/types/replay-api/sdk";
import { ReplayApiSettingsMock } from "@/types/replay-api/settings";
import { ReplayFile } from "@/types/replay-api/replay-file";
import {
  MatchScoreboardResponse,
  MatchHeatmapResponse,
} from "@/types/replay-api/match-analytics.sdk";
import { logger } from "@/lib/logger";
import { EsportsButton } from "@/components/ui/esports-button";
import clsx from "clsx";
import { electrolize } from "@/config/fonts";

interface ReplayPageState {
  replay: ReplayFile | null;
  match: MatchData | null;
  scoreboard: MatchScoreboardResponse | null;
  heatmap: MatchHeatmapResponse | null;
  loading: boolean;
  error: string | null;
  processingStatus: string;
}

const statusConfig = {
  Pending: {
    color: "warning" as const,
    icon: "solar:clock-circle-bold",
    label: "Pending",
    description: "Waiting to be processed",
  },
  Processing: {
    color: "primary" as const,
    icon: "solar:refresh-bold",
    label: "Processing",
    description: "Analyzing your replay...",
  },
  Completed: {
    color: "success" as const,
    icon: "solar:check-circle-bold",
    label: "Ready",
    description: "Analysis complete",
  },
  Ready: {
    color: "success" as const,
    icon: "solar:check-circle-bold",
    label: "Ready",
    description: "Analysis complete",
  },
  Failed: {
    color: "danger" as const,
    icon: "solar:danger-circle-bold",
    label: "Failed",
    description: "Processing failed",
  },
};

export default function ReplayDetailPageEnhanced() {
  const params = useParams();
  const router = useRouter();
  const replayId = params?.id as string | undefined;

  const sdk = useMemo(
    () => new ReplayAPISDK(ReplayApiSettingsMock, logger),
    []
  );

  const [state, setState] = useState<ReplayPageState>({
    replay: null,
    match: null,
    scoreboard: null,
    heatmap: null,
    loading: true,
    error: null,
    processingStatus: "Pending",
  });

  const [selectedTab, setSelectedTab] = useState("overview");
  const [pollCount, setPollCount] = useState(0);

  // Fetch replay and associated data
  useEffect(() => {
    const fetchData = async () => {
      if (!replayId) return;

      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        // Fetch replay file metadata
        const replays = await sdk.replayFiles.searchReplayFiles({
          id: replayId,
        });
        const replay = Array.isArray(replays)
          ? replays.find((r) => r.id === replayId)
          : null;

        if (!replay) {
          setState((prev) => ({
            ...prev,
            loading: false,
            error: "Replay not found",
          }));
          return;
        }

        // Cast to ReplayFile & Record to handle API response format
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const r = replay as ReplayFile & Record<string, any>;
        const currentStatus = r.status || "Pending";

        // If completed, fetch match data
        let matchData: MatchData | null = null;
        let scoreboardData: MatchScoreboardResponse | null = null;
        let heatmapData: MatchHeatmapResponse | null = null;

        if (currentStatus === "Completed" || currentStatus === "Ready") {
          const gameId = r.game_id || r.gameId || "cs2";

          // Find the match associated with this replay
          // The replay_file_id on the match links back to the replay
          let matchId = r.match_id || r.matchId;

          if (!matchId) {
            // Look up match by replay_file_id
            try {
              const matches = await sdk.matches.listMatches({ game_id: gameId, limit: 50 });
              const linkedMatch = matches.find((m) => m.replay_file_id === replayId);
              if (linkedMatch?.id) {
                matchId = linkedMatch.id;
              }
            } catch {
              // Match lookup is best-effort
            }
          }

          if (matchId) {
            try {
              const [match, scoreboard, heatmap] = await Promise.all([
                sdk.matches.getMatch(gameId, matchId).catch(() => null),
                sdk.matchAnalytics
                  .getMatchScoreboard(gameId, matchId)
                  .catch(() => null),
                sdk.matchAnalytics
                  .getMatchHeatmap(gameId, matchId, { include_zones: true })
                  .catch(() => null),
              ]);

              matchData = match;
              scoreboardData = scoreboard;
              heatmapData = heatmap;
            } catch (err) {
              logger.warn("Failed to fetch match data", { matchId, error: err });
            }
          }
        }

        setState({
          replay,
          match: matchData,
          scoreboard: scoreboardData,
          heatmap: heatmapData,
          loading: false,
          error: null,
          processingStatus: currentStatus,
        });
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to load replay";
        logger.error("Failed to fetch replay", { replayId, error });
        setState((prev) => ({
          ...prev,
          loading: false,
          error: errorMessage,
        }));
      }
    };

    fetchData();
  }, [replayId, sdk, pollCount]);

  // Poll for status updates while processing
  useEffect(() => {
    if (
      state.processingStatus === "Processing" ||
      state.processingStatus === "Pending"
    ) {
      const interval = setInterval(() => {
        setPollCount((c) => c + 1);
      }, 3000); // Poll every 3 seconds

      return () => clearInterval(interval);
    }
    return undefined;
  }, [state.processingStatus]);

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "Unknown";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (date?: Date | string) => {
    if (!date) return "Unknown";
    const d = date instanceof Date ? date : new Date(date);
    return d.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Separate players by team
  const team1Players = useMemo(() => {
    if (!state.scoreboard?.players) return [];
    return state.scoreboard.players.filter(
      (p) =>
        p.team?.toLowerCase() === "ct" ||
        p.team === state.scoreboard?.team1_name
    );
  }, [state.scoreboard]);

  const team2Players = useMemo(() => {
    if (!state.scoreboard?.players) return [];
    return state.scoreboard.players.filter(
      (p) =>
        p.team?.toLowerCase() === "t" || p.team === state.scoreboard?.team2_name
    );
  }, [state.scoreboard]);

  if (state.loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Spinner size="lg" color="primary" />
          <p className="mt-4 text-default-500">Loading replay...</p>
        </div>
      </div>
    );
  }

  if (state.error || !state.replay) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Card className="bg-danger-50 dark:bg-danger-900/20 rounded-none">
          <CardBody className="text-center py-12">
            <Icon
              icon="solar:danger-circle-bold"
              className="mx-auto mb-4 text-danger"
              width={64}
            />
            <h2 className="text-xl font-semibold mb-2">Error Loading Replay</h2>
            <p className="text-default-600 mb-4">
              {state.error || "Replay not found"}
            </p>
            <Button color="primary" onPress={() => router.push("/replays")}>
              Back to Replays
            </Button>
          </CardBody>
        </Card>
      </div>
    );
  }

  const status =
    statusConfig[state.processingStatus as keyof typeof statusConfig] ||
    statusConfig.Pending;
  const isReady =
    state.processingStatus === "Completed" ||
    state.processingStatus === "Ready";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const stateReplay = state.replay as ReplayFile & Record<string, any>;
  const gameId = stateReplay?.game_id || stateReplay?.gameId || "cs2";
  const mapName =
    stateReplay?.header?.mapName || state.match?.map_name || state.match?.map || "Unknown Map";

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Enhanced Header with Esports Branding */}
      <div className="relative">
        {/* Background gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#FF4654]/10 via-transparent to-[#DCFF37]/10 rounded-2xl blur-3xl -z-10" />

        <div className="bg-gradient-to-r from-background/80 to-background/60 backdrop-blur-xl border border-[#FF4654]/20 dark:border-[#DCFF37]/20 rounded-2xl p-6">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div className="flex items-start gap-4">
              <EsportsButton
                variant="ghost"
                size="sm"
                onClick={() => router.push("/replays")}
                className="group"
              >
                <Icon icon="solar:arrow-left-bold" width={16} />
                <span className="hidden sm:inline">Back to Replays</span>
              </EsportsButton>
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1
                    className={clsx(
                      "text-2xl font-black uppercase tracking-tight",
                      "bg-gradient-to-r from-[#FF4654] to-[#FFC700] dark:from-[#DCFF37] dark:to-[#FF4654] bg-clip-text text-transparent",
                      electrolize.className
                    )}
                  >
                    REPLAY #{state.replay.id?.slice(0, 8).toUpperCase()}
                  </h1>
                  <Chip
                    size="sm"
                    color={status.color}
                    variant="shadow"
                    startContent={
                      <Icon
                        icon={status.icon}
                        width={14}
                        className={
                          state.processingStatus === "Processing"
                            ? "animate-spin"
                            : ""
                        }
                      />
                    }
                    className={clsx(
                      "font-semibold uppercase tracking-wide",
                      electrolize.className
                    )}
                  >
                    {status.label}
                  </Chip>
                </div>
                <p className="text-sm text-default-500">{status.description}</p>
              </div>
            </div>

            <div className="flex gap-2">
              {isReady && (
                <EsportsButton
                  variant="primary"
                  size="lg"
                  glow={true}
                  onClick={() => router.push(`/replays/${replayId}/player`)}
                  className="group"
                >
                  <Icon
                    icon="solar:play-bold"
                    width={20}
                    className="group-hover:scale-110 transition-transform"
                  />
                  WATCH REPLAY
                </EsportsButton>
              )}

              <EsportsButton
                variant="ghost"
                size="lg"
                onClick={() => router.push("/upload")}
                className="group"
              >
                <Icon icon="solar:cloud-upload-bold" width={18} />
                <span className="hidden sm:inline">Upload Another</span>
              </EsportsButton>
            </div>
          </div>
        </div>
      </div>

      {/* Processing Progress */}
      {(state.processingStatus === "Processing" ||
        state.processingStatus === "Pending") && (
        <Card className="rounded-none border border-primary/30 bg-primary/5">
          <CardBody className="py-6">
            <div className="flex items-center gap-4 mb-4">
              <Icon
                icon="solar:cpu-bolt-bold"
                width={32}
                className="text-primary animate-pulse"
              />
              <div>
                <h3 className="font-semibold">Processing Your Replay</h3>
                <p className="text-sm text-default-500">
                  {state.processingStatus === "Pending"
                    ? "Queued for processing..."
                    : "Analyzing match data, extracting statistics..."}
                </p>
              </div>
            </div>
            <Progress
              isIndeterminate={state.processingStatus === "Pending"}
              value={state.processingStatus === "Processing" ? 60 : 0}
              size="sm"
              color="primary"
              classNames={{
                track: "rounded-none",
                indicator: "rounded-none",
              }}
            />
            <p className="text-xs text-default-400 mt-2">
              This usually takes 30 seconds to 2 minutes depending on match
              length
            </p>
          </CardBody>
        </Card>
      )}

      {/* Main Content */}
      {isReady ? (
        <Tabs
          aria-label="Replay sections"
          color="primary"
          variant="underlined"
          selectedKey={selectedTab}
          onSelectionChange={(key) => setSelectedTab(key as string)}
          classNames={{
            tabList: "gap-6",
            tab: "text-base font-medium",
          }}
        >
          <Tab
            key="overview"
            title={
              <div className="flex items-center gap-2">
                <Icon icon="solar:chart-2-bold" width={18} />
                <span>Overview</span>
              </div>
            }
          >
            <div className="space-y-6 py-4">
              {/* Match Info Card */}
              <Card className="rounded-none border border-default-200">
                <CardBody>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div>
                      <p className="text-sm text-default-500">Game</p>
                      <p className="font-semibold flex items-center gap-2">
                        <Icon icon="simple-icons:counterstrike" width={18} />
                        {(gameId || "CS2").toUpperCase()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-default-500">Map</p>
                      <p className="font-semibold">{mapName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-default-500">Size</p>
                      <p className="font-semibold">
                        {formatFileSize(state.replay.size)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-default-500">Uploaded</p>
                      <p className="font-semibold">
                        {formatDate(state.replay.created_at)}
                      </p>
                    </div>
                  </div>
                </CardBody>
              </Card>

              {/* Scoreboard */}
              {state.scoreboard ? (
                <MatchScoreboard
                  team1Name={state.scoreboard.team1_name}
                  team2Name={state.scoreboard.team2_name}
                  team1Score={state.scoreboard.team1_score}
                  team2Score={state.scoreboard.team2_score}
                  team1Players={team1Players}
                  team2Players={team2Players}
                  mapName={mapName}
                />
              ) : (
                <Card className="rounded-none">
                  <CardBody className="text-center py-12">
                    <Icon
                      icon="solar:users-group-rounded-bold"
                      width={48}
                      className="mx-auto mb-4 text-default-300"
                    />
                    <p className="text-default-500">
                      Scoreboard data loading...
                    </p>
                  </CardBody>
                </Card>
              )}
            </div>
          </Tab>

          <Tab
            key="heatmaps"
            title={
              <div className="flex items-center gap-2">
                <Icon icon="solar:fire-bold" width={18} />
                <span>Heatmaps</span>
              </div>
            }
          >
            <div className="py-4">
              {state.heatmap ? (
                <HeatmapVisualizer
                  mapName={mapName}
                  cells={state.heatmap.cells}
                  zones={state.heatmap.zones}
                  gridSize={state.heatmap.grid_size}
                  title="Position Heatmap"
                  type="position"
                />
              ) : (
                <Card className="rounded-none">
                  <CardBody className="text-center py-12">
                    <Icon
                      icon="solar:fire-bold-duotone"
                      width={48}
                      className="mx-auto mb-4 text-default-300"
                    />
                    <p className="text-default-500">
                      Heatmap data not available
                    </p>
                  </CardBody>
                </Card>
              )}
            </div>
          </Tab>

          <Tab
            key="details"
            title={
              <div className="flex items-center gap-2">
                <Icon icon="solar:document-text-bold" width={18} />
                <span>Details</span>
              </div>
            }
          >
            <div className="py-4">
              <Card className="rounded-none border border-default-200">
                <CardHeader>
                  <h3 className="font-semibold">File Details</h3>
                </CardHeader>
                <Divider />
                <CardBody className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-default-500">Replay ID</p>
                      <p className="font-mono text-sm">{stateReplay?.id}</p>
                    </div>
                    <div>
                      <p className="text-sm text-default-500">Game ID</p>
                      <p className="font-mono text-sm">{gameId}</p>
                    </div>
                    <div>
                      <p className="text-sm text-default-500">Network</p>
                      <p className="font-mono text-sm">
                        {stateReplay?.network_id ||
                          stateReplay?.networkId ||
                          "Unknown"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-default-500">Status</p>
                      <Chip size="sm" color={status.color} variant="flat">
                        {stateReplay?.status}
                      </Chip>
                    </div>
                    <div>
                      <p className="text-sm text-default-500">File Size</p>
                      <p>{formatFileSize(stateReplay?.size)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-default-500">Created</p>
                      <p>{formatDate(state.replay.created_at)}</p>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </div>
          </Tab>
        </Tabs>
      ) : (
        /* Non-ready state - show basic info */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="rounded-none">
              <CardBody className="text-center py-16">
                <Icon
                  icon="solar:videocamera-record-bold-duotone"
                  width={80}
                  className="mx-auto mb-4 text-default-300"
                />
                <p className="text-lg font-semibold mb-2">
                  {state.processingStatus === "Failed"
                    ? "Processing Failed"
                    : "Processing In Progress"}
                </p>
                <p className="text-sm text-default-500 max-w-md mx-auto">
                  {state.processingStatus === "Failed"
                    ? "There was an error processing your replay. Please try uploading again."
                    : "Your replay is being analyzed. Statistics, heatmaps, and player performance data will be available shortly."}
                </p>
                {state.processingStatus === "Failed" && (
                  <Button
                    color="primary"
                    className="mt-6"
                    onPress={() => router.push("/upload")}
                  >
                    Upload New Replay
                  </Button>
                )}
              </CardBody>
            </Card>
          </div>

          <div>
            <Card className="rounded-none border border-default-200">
              <CardHeader>
                <h3 className="font-semibold">File Info</h3>
              </CardHeader>
              <Divider />
              <CardBody className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-default-500">Game</span>
                  <Chip size="sm" variant="flat" color="primary">
                    {(stateReplay.game_id || "CS2").toUpperCase()}
                  </Chip>
                </div>
                <div className="flex justify-between">
                  <span className="text-default-500">Size</span>
                  <span className="font-medium">
                    {formatFileSize(state.replay.size)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-default-500">Uploaded</span>
                  <span className="font-medium">
                    {formatDate(state.replay.created_at)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-default-500">Status</span>
                  <Chip size="sm" color={status.color} variant="flat">
                    {status.label}
                  </Chip>
                </div>
              </CardBody>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}

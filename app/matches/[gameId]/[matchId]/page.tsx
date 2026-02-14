"use client";

/**
 * Match Details Page
 * Displays comprehensive match statistics, scoreboard, heatmaps, and round timeline
 */

import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Card,
  CardBody,
  CardHeader,
  Chip,
  Progress,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Avatar,
  Tooltip,
  Tabs,
  Tab,
} from "@nextui-org/react";
import { Icon } from "@iconify/react";
import {
  ReplayAPISDK,
  MatchData,
  TeamScoreboard,
  PlayerStatsEntry,
} from "@/types/replay-api/sdk";
import { BreadcrumbBar } from "@/components/breadcrumb/breadcrumb-bar";
import { ReplayApiSettingsMock } from "@/types/replay-api/settings";
import {
  MatchHeatmapResponse,
  MatchScoreboardResponse,
  MatchEventsResponse,
} from "@/types/replay-api/match-analytics.sdk";
import { GameEvent, GameIDString } from "@/types/replay-api/highlights.types";
import { logger } from "@/lib/logger";
import { EsportsButton } from "@/components/ui/esports-button";
import clsx from "clsx";
import { electrolize } from "@/config/fonts";
import { normalizeStatus, STATUS_CONFIG } from "@/lib/status-utils";
import { PageLoadingState } from "@/components/ui/loading-states";
import { ErrorState } from "@/components/ui/empty-states";
import {
  PremiumHighlights,
  PremiumEventsTimeline,
  PremiumHeatmap,
  PremiumRoundsTimeline,
} from "@/components/matches";

interface MatchPageState {
  match: MatchData | null;
  scoreboard: MatchScoreboardResponse | null;
  heatmap: MatchHeatmapResponse | null;
  events: MatchEventsResponse | null;
  highlights: GameEvent[];
  loading: boolean;
  error: string | null;
  highlightsLoading: boolean;
  eventsLoading: boolean;
}

// Helper to get player stats from PlayerStats array by index (arrays are parallel)
const getPlayerStatsByIndex = (
  teamScoreboard: TeamScoreboard | undefined,
  playerIndex: number,
): PlayerStatsEntry | null => {
  if (!teamScoreboard?.player_stats || playerIndex < 0) return null;
  return teamScoreboard.player_stats[playerIndex] || null;
};

export default function MatchDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const gameId = (params?.gameId as string) || "cs2";
  const matchId = params?.matchId as string;

  const sdk = useMemo(
    () => new ReplayAPISDK(ReplayApiSettingsMock, logger),
    [],
  );

  const [state, setState] = useState<MatchPageState>({
    match: null,
    scoreboard: null,
    heatmap: null,
    events: null,
    highlights: [],
    loading: true,
    error: null,
    highlightsLoading: false,
    eventsLoading: false,
  });

  const [selectedTab, setSelectedTab] = useState("overview");

  // Compute available round numbers from match scoreboard or events data
  const roundOptions = useMemo(() => {
    const rounds = new Set<number>();

    // First try to get rounds from events
    if (state.events) {
      state.events.kills?.forEach((k) => {
        if (k.round_number) rounds.add(k.round_number);
      });
      state.events.round_starts?.forEach((r) => {
        if (r.round_number) rounds.add(r.round_number);
      });
      state.events.round_ends?.forEach((r) => {
        if (r.round_number) rounds.add(r.round_number);
      });
    }

    // If no rounds from events, derive from match scoreboard
    if (rounds.size === 0 && state.match?.scoreboard?.team_scoreboards) {
      const totalRounds = state.match.scoreboard.team_scoreboards.reduce(
        (sum, t) => sum + (t.team_score || 0),
        0,
      );
      for (let i = 1; i <= totalRounds; i++) {
        rounds.add(i);
      }
    }

    return Array.from(rounds).sort((a, b) => a - b);
  }, [state.events, state.match?.scoreboard?.team_scoreboards]);

  // Fetch highlights data when tab changes
  const fetchHighlights = useCallback(async () => {
    if (!matchId || state.highlights.length > 0 || state.highlightsLoading)
      return;

    setState((prev) => ({ ...prev, highlightsLoading: true }));
    try {
      const highlightsData = await sdk.highlights.getMatchHighlights(
        gameId as GameIDString,
        matchId,
      );
      setState((prev) => ({
        ...prev,
        highlights: highlightsData,
        highlightsLoading: false,
      }));
    } catch (error) {
      logger.error("Failed to fetch highlights", { matchId, error });
      setState((prev) => ({ ...prev, highlightsLoading: false }));
    }
  }, [matchId, gameId, sdk, state.highlights.length, state.highlightsLoading]);

  // Fetch events data when tab changes
  const fetchEvents = useCallback(async () => {
    if (!matchId || state.events || state.eventsLoading) return;

    setState((prev) => ({ ...prev, eventsLoading: true }));
    try {
      const eventsData = await sdk.matchAnalytics.getMatchEvents(
        gameId,
        matchId,
      );
      setState((prev) => ({
        ...prev,
        events: eventsData,
        eventsLoading: false,
      }));
    } catch (error) {
      logger.error("Failed to fetch events", { matchId, error });
      setState((prev) => ({ ...prev, eventsLoading: false }));
    }
  }, [matchId, gameId, sdk, state.events, state.eventsLoading]);

  // Handle tab change and lazy load data
  const handleTabChange = useCallback(
    (tab: string) => {
      setSelectedTab(tab);
      if (tab === "highlights") {
        fetchHighlights();
      } else if (tab === "events" || tab === "rounds" || tab === "heatmap") {
        // Heatmap needs events data for grenade visualization
        fetchEvents();
      }
    },
    [fetchHighlights, fetchEvents],
  );

  useEffect(() => {
    const fetchMatchData = async () => {
      if (!matchId) return;

      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        // Fetch match data, scoreboard, and heatmap in parallel
        const [matchData, scoreboardData, heatmapData] = await Promise.all([
          sdk.matches.getMatch(gameId, matchId),
          sdk.matchAnalytics
            .getMatchScoreboard(gameId, matchId)
            .catch(() => null),
          sdk.matchAnalytics
            .getMatchHeatmap(gameId, matchId, { include_zones: true })
            .catch(() => null),
        ]);

        if (!matchData) {
          setState((prev) => ({
            ...prev,
            loading: false,
            error: "Match not found",
          }));
          return;
        }

        setState((prev) => ({
          ...prev,
          match: matchData,
          scoreboard: scoreboardData,
          heatmap: heatmapData,
          loading: false,
          error: null,
        }));
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to load match";
        logger.error("Failed to fetch match data", { matchId, error });
        setState((prev) => ({
          ...prev,
          loading: false,
          error: errorMessage,
        }));
      }
    };

    fetchMatchData();
  }, [gameId, matchId, sdk]);

  const formatDuration = (seconds?: number, totalRounds?: number) => {
    // If no duration but we have rounds, estimate it
    if (!seconds && totalRounds && totalRounds > 0) {
      seconds = totalRounds * 100; // Average ~100 seconds per round
    }
    if (!seconds || seconds <= 0)
      return "~" + (totalRounds || 0) * 1.5 + " min";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Unknown";
    return new Date(dateString).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Note: Team filtering and round timeline data are handled by the
  // PremiumRoundsTimeline component using real data from state.events

  if (state.loading) {
    return (
      <PageLoadingState
        title="Loading Match Details"
        subtitle="Analyzing scoreboard and statistics..."
      />
    );
  }

  if (state.error || !state.match) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <ErrorState
          title="Error Loading Match"
          message={state.error || "Match not found"}
          onRetry={() => router.push("/matches")}
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Enhanced Header with Esports Branding */}
      <div className="relative">
        {/* Background gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#FF4654]/10 via-transparent to-[#DCFF37]/10 blur-3xl -z-10" />

        <div className="esports-card bg-gradient-to-r from-background/80 to-background/60 backdrop-blur-xl border-2 border-[#FF4654]/30 dark:border-[#DCFF37]/30 p-6">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div className="flex items-start gap-4">
              <EsportsButton
                variant="ghost"
                size="sm"
                onClick={() => router.push("/matches")}
                className="group"
              >
                <Icon icon="solar:arrow-left-bold" width={16} />
                <span className="hidden sm:inline">Back to Matches</span>
              </EsportsButton>
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1
                    className={clsx(
                      "text-2xl font-black uppercase tracking-tight",
                      "bg-gradient-to-r from-[#FF4654] to-[#FFC700] dark:from-[#DCFF37] dark:to-[#FF4654] bg-clip-text text-transparent",
                      electrolize.className,
                    )}
                  >
                    {state.match.title ||
                      `MATCH #${matchId?.slice(0, 8).toUpperCase()}`}
                  </h1>
                  <Chip
                    size="sm"
                    color="success"
                    variant="shadow"
                    startContent={
                      <Icon icon="solar:check-circle-bold" width={14} />
                    }
                    className={clsx(
                      "font-semibold uppercase tracking-wide",
                      electrolize.className,
                    )}
                  >
                    Analyzed
                  </Chip>
                  {/* Match Source Badge */}
                  <Chip
                    size="sm"
                    variant="shadow"
                    color={
                      state.match.source === "matchmaking"
                        ? "secondary"
                        : state.match.source === "external_api"
                          ? "primary"
                          : state.match.source === "manual"
                            ? "warning"
                            : "default"
                    }
                    startContent={
                      <Icon
                        icon={
                          state.match.source === "matchmaking"
                            ? "solar:gamepad-bold"
                            : state.match.source === "external_api"
                              ? "solar:cloud-download-bold"
                              : state.match.source === "manual"
                                ? "solar:pen-bold"
                                : "solar:videocamera-record-bold"
                        }
                        width={14}
                      />
                    }
                    className={clsx(
                      "font-semibold uppercase tracking-wide",
                      electrolize.className,
                    )}
                  >
                    {state.match.source === "matchmaking"
                      ? "Matchmaking"
                      : state.match.source === "external_api"
                        ? "External API"
                        : state.match.source === "manual"
                          ? "Manual"
                          : "Replay"}
                  </Chip>
                </div>
                <div className="flex items-center gap-4 text-sm text-default-500">
                  <span className="flex items-center gap-1">
                    <Icon icon="solar:map-point-bold" width={16} />
                    {state.match.map_name || state.match.map || "Unknown Map"}
                  </span>
                  <span className="flex items-center gap-1">
                    <Icon icon="solar:clock-circle-bold" width={16} />
                    {formatDuration(
                      state.match.duration,
                      (state.match.scoreboard?.team_scoreboards?.[0]
                        ?.team_score ?? 0) +
                        (state.match.scoreboard?.team_scoreboards?.[1]
                          ?.team_score ?? 0),
                    )}
                  </span>
                  <span className="flex items-center gap-1">
                    <Icon icon="solar:calendar-bold" width={16} />
                    {formatDate(
                      state.match.played_at || state.match.created_at,
                    )}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              {/* Submit Score Button - for submitting match results */}
              <EsportsButton
                variant="primary"
                size="lg"
                onClick={() => {
                  const params = new URLSearchParams({
                    match_id: matchId || "",
                    game_id: gameId || "",
                  });
                  if (state.match?.map_name || state.match?.map) {
                    params.set(
                      "map",
                      state.match.map_name || state.match.map || "",
                    );
                  }
                  router.push(`/scores/submit?${params.toString()}`);
                }}
                className="group bg-gradient-to-r from-[#DCFF37] to-[#34445C] dark:from-[#FF4654] dark:to-[#FFC700]"
              >
                <Icon icon="solar:clipboard-add-bold" width={18} />
                <span>Submit Score</span>
              </EsportsButton>
              {/* View Replay Button - shown when replay is available */}
              {(state.match.replay_file_id ||
                state.match.linked_replay_id ||
                state.match.has_replay) && (
                <EsportsButton
                  variant="primary"
                  size="lg"
                  onClick={() => {
                    const replayId =
                      state.match?.linked_replay_id ||
                      state.match?.replay_file_id;
                    if (replayId) {
                      router.push(`/replays/${gameId}/${replayId}`);
                    }
                  }}
                  className="group bg-gradient-to-r from-[#FF4654] to-[#FFC700] dark:from-[#DCFF37] dark:to-[#34445C]"
                >
                  <Icon icon="solar:play-circle-bold" width={18} />
                  <span>Watch Replay</span>
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

      {/* Breadcrumbs */}
      <BreadcrumbBar />

      {/* Tabbed Content Navigation */}
      <Tabs
        selectedKey={selectedTab}
        onSelectionChange={(key) => handleTabChange(key as string)}
        variant="underlined"
        color="danger"
        classNames={{
          base: "w-full",
          tabList:
            "gap-4 w-full relative rounded-none p-0 border-b border-divider flex-wrap",
          cursor: "w-full bg-[#FF4654] dark:bg-[#DCFF37]",
          tab: "max-w-fit px-0 h-12",
          tabContent:
            "group-data-[selected=true]:text-[#FF4654] dark:group-data-[selected=true]:text-[#DCFF37]",
        }}
        aria-label="Match sections"
      >
        <Tab
          key="overview"
          title={
            <div className="flex items-center space-x-2">
              <Icon icon="solar:chart-square-bold" width={20} />
              <span
                className={clsx(
                  "font-semibold uppercase tracking-wide",
                  electrolize.className,
                )}
              >
                Overview
              </span>
            </div>
          }
        />
        <Tab
          key="scoreboard"
          title={
            <div className="flex items-center space-x-2">
              <Icon icon="solar:users-group-rounded-bold" width={20} />
              <span
                className={clsx(
                  "font-semibold uppercase tracking-wide",
                  electrolize.className,
                )}
              >
                Scoreboard
              </span>
              {state.match?.scoreboard?.team_scoreboards && (
                <Chip size="sm" variant="flat" color="primary" className="ml-1">
                  {state.match.scoreboard.team_scoreboards.reduce(
                    (acc, t) => acc + (t.players?.length || 0),
                    0,
                  )}
                </Chip>
              )}
            </div>
          }
        />
        <Tab
          key="rounds"
          title={
            <div className="flex items-center space-x-2">
              <Icon icon="solar:rewind-forward-bold" width={20} />
              <span
                className={clsx(
                  "font-semibold uppercase tracking-wide",
                  electrolize.className,
                )}
              >
                Rounds
              </span>
              {roundOptions.length > 0 && (
                <Chip size="sm" variant="flat" color="warning" className="ml-1">
                  {roundOptions.length}
                </Chip>
              )}
            </div>
          }
        />
        <Tab
          key="highlights"
          title={
            <div className="flex items-center space-x-2">
              <Icon icon="solar:star-bold" width={20} />
              <span
                className={clsx(
                  "font-semibold uppercase tracking-wide",
                  electrolize.className,
                )}
              >
                Highlights
              </span>
              {state.highlights.length > 0 && (
                <Chip size="sm" variant="flat" color="danger" className="ml-1">
                  {state.highlights.length}
                </Chip>
              )}
            </div>
          }
        />
        <Tab
          key="events"
          title={
            <div className="flex items-center space-x-2">
              <Icon icon="solar:list-bold" width={20} />
              <span
                className={clsx(
                  "font-semibold uppercase tracking-wide",
                  electrolize.className,
                )}
              >
                Events
              </span>
            </div>
          }
        />
        <Tab
          key="heatmap"
          title={
            <div className="flex items-center space-x-2">
              <Icon icon="solar:flame-bold" width={20} />
              <span
                className={clsx(
                  "font-semibold uppercase tracking-wide",
                  electrolize.className,
                )}
              >
                Heatmap
              </span>
            </div>
          }
        />
      </Tabs>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Tab Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* OVERVIEW TAB */}
          {selectedTab === "overview" && (
            <>
              {/* Match Video/Replay */}
              <Card className="bg-gradient-to-br from-background/80 to-background/60 backdrop-blur-xl border border-[#FF4654]/20 dark:border-[#DCFF37]/20">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-2">
                    <Icon
                      icon="solar:play-circle-bold"
                      width={20}
                      className="text-[#FF4654] dark:text-[#DCFF37]"
                    />
                    <h2
                      className={clsx(
                        "text-lg font-bold uppercase tracking-wide",
                        electrolize.className,
                      )}
                    >
                      Match Replay
                    </h2>
                  </div>
                </CardHeader>
                <CardBody className="p-0">
                  <div className="aspect-video bg-gradient-to-br from-[#34445C]/20 to-[#FF4654]/10 flex items-center justify-center">
                    <div className="text-center space-y-4">
                      <Icon
                        icon="solar:play-circle-bold"
                        width={64}
                        className="text-[#FF4654] dark:text-[#DCFF37] mx-auto"
                      />
                      <div>
                        <p className="text-lg font-semibold">
                          Replay Processing
                        </p>
                        <p className="text-sm text-default-500">
                          Video analysis in progress...
                        </p>
                      </div>
                      <Progress
                        size="sm"
                        value={75}
                        color="danger"
                        className="max-w-xs mx-auto"
                      />
                    </div>
                  </div>
                </CardBody>
              </Card>

              {/* Match Statistics */}
              <Card className="bg-gradient-to-br from-background/80 to-background/60 backdrop-blur-xl border border-[#FF4654]/20 dark:border-[#DCFF37]/20">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-2">
                    <Icon
                      icon="solar:chart-square-bold"
                      width={20}
                      className="text-[#FF4654] dark:text-[#DCFF37]"
                    />
                    <h2
                      className={clsx(
                        "text-lg font-bold uppercase tracking-wide",
                        electrolize.className,
                      )}
                    >
                      Match Score
                    </h2>
                  </div>
                </CardHeader>
                <CardBody>
                  {/* Final Score Display */}
                  <div className="flex items-center justify-center gap-8 mb-6">
                    <div className="text-center">
                      <div className="text-xs text-default-500 uppercase tracking-wider mb-1">
                        {state.match.scoreboard?.team_scoreboards?.[0]?.team
                          ?.name ||
                          state.match.scoreboard?.team_scoreboards?.[0]?.side ||
                          "Team 1"}
                      </div>
                      <div
                        className={clsx(
                          "text-5xl font-black",
                          state.match.scoreboard?.team_scoreboards?.[0]
                            ?.side === "CT"
                            ? "text-[#00A8FF]"
                            : "text-[#FFB800]",
                          electrolize.className,
                        )}
                      >
                        {state.match.scoreboard?.team_scoreboards?.[0]
                          ?.team_score ?? 0}
                      </div>
                    </div>
                    <div
                      className={clsx(
                        "text-2xl font-bold text-default-500",
                        electrolize.className,
                      )}
                    >
                      VS
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-default-500 uppercase tracking-wider mb-1">
                        {state.match.scoreboard?.team_scoreboards?.[1]?.team
                          ?.name ||
                          state.match.scoreboard?.team_scoreboards?.[1]?.side ||
                          "Team 2"}
                      </div>
                      <div
                        className={clsx(
                          "text-5xl font-black",
                          state.match.scoreboard?.team_scoreboards?.[1]
                            ?.side === "CT"
                            ? "text-[#00A8FF]"
                            : "text-[#FFB800]",
                          electrolize.className,
                        )}
                      >
                        {state.match.scoreboard?.team_scoreboards?.[1]
                          ?.team_score ?? 0}
                      </div>
                    </div>
                  </div>

                  {/* Match Stats Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-gradient-to-br from-[#FF4654]/10 to-[#FFC700]/10 dark:from-[#DCFF37]/10 dark:to-[#34445C]/10 rounded-none border border-[#FF4654]/20 dark:border-[#DCFF37]/20">
                      <div className="text-2xl font-black text-[#FF4654] dark:text-[#DCFF37]">
                        {(state.match.scoreboard?.team_scoreboards?.[0]
                          ?.team_score ?? 0) +
                          (state.match.scoreboard?.team_scoreboards?.[1]
                            ?.team_score ?? 0)}
                      </div>
                      <div className="text-sm text-default-500 uppercase tracking-wide">
                        Total Rounds
                      </div>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-br from-[#DCFF37]/10 to-[#FF4654]/10 dark:from-[#34445C]/10 dark:to-[#DCFF37]/10 rounded-none border border-[#FF4654]/20 dark:border-[#DCFF37]/20">
                      <div className="text-2xl font-black text-[#DCFF37] dark:text-[#FF4654]">
                        {state.match.scoreboard?.team_scoreboards?.reduce(
                          (total, team) => total + (team.players?.length ?? 0),
                          0,
                        ) ?? 0}
                      </div>
                      <div className="text-sm text-default-500 uppercase tracking-wide">
                        Players
                      </div>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-br from-[#FFC700]/10 to-[#DCFF37]/10 dark:from-[#DCFF37]/10 dark:to-[#FFC700]/10 rounded-none border border-[#FF4654]/20 dark:border-[#DCFF37]/20">
                      <div className="text-2xl font-black text-[#FFC700] dark:text-[#FF4654]">
                        {formatDuration(
                          state.match.duration,
                          (state.match.scoreboard?.team_scoreboards?.[0]
                            ?.team_score ?? 0) +
                            (state.match.scoreboard?.team_scoreboards?.[1]
                              ?.team_score ?? 0),
                        )}
                      </div>
                      <div className="text-sm text-default-500 uppercase tracking-wide">
                        Duration
                      </div>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-br from-[#34445C]/10 to-[#FF4654]/10 dark:from-[#34445C]/10 dark:to-[#DCFF37]/10 rounded-none border border-[#FF4654]/20 dark:border-[#DCFF37]/20">
                      <div className="text-2xl font-black text-[#34445C] dark:text-[#DCFF37]">
                        {state.match.event_count ??
                          state.match.scoreboard?.team_scoreboards?.reduce(
                            (total, team) =>
                              total +
                              (team.players?.reduce(
                                (pTotal, p) => pTotal + (p.kills ?? 0),
                                0,
                              ) ?? 0),
                            0,
                          ) ??
                          0}
                      </div>
                      <div className="text-sm text-default-500 uppercase tracking-wide">
                        {state.match.event_count ? "Events" : "Total Kills"}
                      </div>
                    </div>
                  </div>
                </CardBody>
              </Card>

              {/* Team Scoreboards */}
              {state.match.scoreboard?.team_scoreboards?.map(
                (teamScoreboard, teamIndex) => (
                  <Card
                    key={teamIndex}
                    className={clsx(
                      "bg-gradient-to-br from-background/80 to-background/60 backdrop-blur-xl border",
                      teamScoreboard.side === "CT"
                        ? "border-[#00A8FF]/30"
                        : "border-[#FFB800]/30",
                    )}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-3">
                          <div
                            className={clsx(
                              "w-10 h-10 rounded-none flex items-center justify-center font-black text-lg",
                              teamScoreboard.side === "CT"
                                ? "bg-[#00A8FF]/20 text-[#00A8FF] border border-[#00A8FF]/30"
                                : "bg-[#FFB800]/20 text-[#FFB800] border border-[#FFB800]/30",
                              electrolize.className,
                            )}
                          >
                            {teamScoreboard.side ||
                              (teamIndex === 0 ? "CT" : "T")}
                          </div>
                          <div>
                            <h3
                              className={clsx(
                                "text-lg font-bold uppercase tracking-wide",
                                electrolize.className,
                              )}
                            >
                              {teamScoreboard.team?.name ||
                                teamScoreboard.side ||
                                `Team ${teamIndex + 1}`}
                            </h3>
                            <div className="text-sm text-default-500">
                              {teamScoreboard.players?.length ?? 0} players
                            </div>
                          </div>
                        </div>
                        <div
                          className={clsx(
                            "text-4xl font-black",
                            teamScoreboard.side === "CT"
                              ? "text-[#00A8FF]"
                              : "text-[#FFB800]",
                            electrolize.className,
                          )}
                        >
                          {teamScoreboard.team_score ?? 0}
                        </div>
                      </div>
                    </CardHeader>
                    <CardBody className="pt-0">
                      <Table
                        aria-label={`${teamScoreboard.team?.name || "Team"} scoreboard`}
                        removeWrapper
                        classNames={{
                          th: "bg-transparent text-default-500 text-xs uppercase tracking-wider",
                          td: "py-2",
                        }}
                      >
                        <TableHeader>
                          <TableColumn>PLAYER</TableColumn>
                          <TableColumn align="center">K</TableColumn>
                          <TableColumn align="center">D</TableColumn>
                          <TableColumn align="center">A</TableColumn>
                          <TableColumn align="center">+/-</TableColumn>
                          <TableColumn align="center">ADR</TableColumn>
                          <TableColumn align="center">HS%</TableColumn>
                          <TableColumn align="center">FK</TableColumn>
                          <TableColumn align="center">KAST</TableColumn>
                          <TableColumn align="center">RATING</TableColumn>
                          <TableColumn align="center">MVPs</TableColumn>
                        </TableHeader>
                        <TableBody emptyContent="No players found">
                          {(teamScoreboard.players ?? []).map(
                            (player, playerIndex) => {
                              // Get stats from player_stats array by index (arrays are parallel)
                              const playerStats = getPlayerStatsByIndex(
                                teamScoreboard,
                                playerIndex,
                              );
                              const kills =
                                playerStats?.kills ?? player.kills ?? 0;
                              const deaths =
                                playerStats?.deaths ?? player.deaths ?? 0;
                              const assists =
                                playerStats?.assists ?? player.assists ?? 0;
                              const kdDiff = kills - deaths;
                              const adr = playerStats?.adr ?? player.adr ?? 0;
                              const mvps =
                                playerStats?.mvp_count ?? player.mvp_count ?? 0;
                              const headshotPct =
                                playerStats?.headshot_pct ?? 0;
                              const rating2 = playerStats?.rating_2 ?? 0;
                              const openingKills =
                                playerStats?.opening_kills ?? 0;
                              const openingDeaths =
                                playerStats?.opening_deaths ?? 0;
                              const tradeKills = playerStats?.trade_kills ?? 0;
                              const clutchWins = playerStats?.clutch_wins ?? 0;
                              const clutchAttempts =
                                playerStats?.clutch_attempts ?? 0;
                              const flashAssists =
                                playerStats?.flash_assists ?? 0;
                              const kast = playerStats?.kast ?? 0;

                              return (
                                <TableRow
                                  key={`${player.name || player.current_name || playerIndex}-${playerIndex}`}
                                >
                                  <TableCell>
                                    <div className="flex items-center gap-3">
                                      <Avatar
                                        size="sm"
                                        name={
                                          player.name?.[0] ||
                                          player.current_name?.[0] ||
                                          player.display_name?.[0] ||
                                          "?"
                                        }
                                        classNames={{
                                          base:
                                            teamScoreboard.side === "CT"
                                              ? "bg-[#00A8FF]/20"
                                              : "bg-[#FFB800]/20",
                                        }}
                                      />
                                      <div className="min-w-0">
                                        <div className="font-semibold truncate max-w-[120px]">
                                          {player.name ||
                                            player.current_name ||
                                            player.display_name ||
                                            `Player ${playerIndex + 1}`}
                                        </div>
                                        <div className="flex items-center gap-1.5 text-[10px] text-default-400">
                                          {tradeKills > 0 && (
                                            <Tooltip
                                              content={`${tradeKills} Trade Kills`}
                                            >
                                              <span className="flex items-center gap-0.5 text-cyan-500">
                                                <Icon
                                                  icon="solar:refresh-circle-bold"
                                                  width={10}
                                                />
                                                {tradeKills}
                                              </span>
                                            </Tooltip>
                                          )}
                                          {clutchWins > 0 && (
                                            <Tooltip
                                              content={`${clutchWins}/${clutchAttempts} Clutches Won`}
                                            >
                                              <span className="flex items-center gap-0.5 text-purple-500">
                                                <Icon
                                                  icon="solar:fire-bold"
                                                  width={10}
                                                />
                                                {clutchWins}
                                              </span>
                                            </Tooltip>
                                          )}
                                          {flashAssists > 0 && (
                                            <Tooltip
                                              content={`${flashAssists} Flash Assists`}
                                            >
                                              <span className="flex items-center gap-0.5 text-yellow-500">
                                                <Icon
                                                  icon="solar:flashlight-bold"
                                                  width={10}
                                                />
                                                {flashAssists}
                                              </span>
                                            </Tooltip>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <span className="font-bold text-success">
                                      {kills}
                                    </span>
                                  </TableCell>
                                  <TableCell>
                                    <span className="font-bold text-danger">
                                      {deaths}
                                    </span>
                                  </TableCell>
                                  <TableCell>
                                    <span className="font-bold text-warning">
                                      {assists}
                                    </span>
                                  </TableCell>
                                  <TableCell>
                                    <span
                                      className={clsx(
                                        "font-bold",
                                        kdDiff > 0
                                          ? "text-success"
                                          : kdDiff < 0
                                            ? "text-danger"
                                            : "text-default-500",
                                      )}
                                    >
                                      {kdDiff > 0 ? `+${kdDiff}` : kdDiff}
                                    </span>
                                  </TableCell>
                                  <TableCell>
                                    <Tooltip content="Average Damage per Round">
                                      <span
                                        className={clsx(
                                          "font-bold",
                                          adr >= 80
                                            ? "text-success"
                                            : adr >= 60
                                              ? "text-warning"
                                              : "text-default-500",
                                        )}
                                      >
                                        {typeof adr === "number"
                                          ? adr.toFixed(1)
                                          : adr || "-"}
                                      </span>
                                    </Tooltip>
                                  </TableCell>
                                  <TableCell>
                                    <Tooltip content="Headshot Percentage">
                                      <span
                                        className={clsx(
                                          "font-bold",
                                          headshotPct >= 50
                                            ? "text-success"
                                            : headshotPct >= 30
                                              ? "text-warning"
                                              : "text-default-500",
                                        )}
                                      >
                                        {headshotPct > 0
                                          ? `${headshotPct.toFixed(0)}%`
                                          : "-"}
                                      </span>
                                    </Tooltip>
                                  </TableCell>
                                  <TableCell>
                                    <Tooltip
                                      content={`First Kills: ${openingKills} | First Deaths: ${openingDeaths}`}
                                    >
                                      <div className="flex items-center gap-1">
                                        <span
                                          className={clsx(
                                            "font-bold",
                                            openingKills > openingDeaths
                                              ? "text-success"
                                              : openingKills < openingDeaths
                                                ? "text-danger"
                                                : "text-default-500",
                                          )}
                                        >
                                          {openingKills > 0 || openingDeaths > 0
                                            ? `${openingKills}/${openingDeaths}`
                                            : "-"}
                                        </span>
                                      </div>
                                    </Tooltip>
                                  </TableCell>
                                  <TableCell>
                                    <Tooltip content="Kill/Assist/Survive/Trade %">
                                      <span
                                        className={clsx(
                                          "font-bold",
                                          kast >= 75
                                            ? "text-success"
                                            : kast >= 60
                                              ? "text-warning"
                                              : "text-default-500",
                                        )}
                                      >
                                        {kast > 0 ? `${kast.toFixed(0)}%` : "-"}
                                      </span>
                                    </Tooltip>
                                  </TableCell>
                                  <TableCell>
                                    <Tooltip content="HLTV 2.0 Rating">
                                      <Chip
                                        size="sm"
                                        variant="flat"
                                        color={
                                          rating2 >= 1.2
                                            ? "success"
                                            : rating2 >= 0.9
                                              ? "warning"
                                              : "danger"
                                        }
                                        className="font-bold"
                                      >
                                        {rating2 > 0 ? rating2.toFixed(2) : "-"}
                                      </Chip>
                                    </Tooltip>
                                  </TableCell>
                                  <TableCell>
                                    {mvps > 0 ? (
                                      <div className="flex items-center gap-1">
                                        <Icon
                                          icon="solar:star-bold"
                                          className="text-[#FFB800]"
                                          width={16}
                                        />
                                        <span className="font-bold text-[#FFB800]">
                                          {mvps}
                                        </span>
                                      </div>
                                    ) : (
                                      <span className="text-default-400">
                                        -
                                      </span>
                                    )}
                                  </TableCell>
                                </TableRow>
                              );
                            },
                          )}
                        </TableBody>
                      </Table>
                    </CardBody>
                  </Card>
                ),
              )}
            </>
          )}

          {/* SCOREBOARD TAB - Dedicated Scoreboard View */}
          {selectedTab === "scoreboard" && (
            <>
              {state.match?.scoreboard?.team_scoreboards?.map(
                (teamScoreboard, teamIndex) => (
                  <Card
                    key={teamIndex}
                    className={clsx(
                      "bg-gradient-to-br from-background/80 to-background/60 backdrop-blur-xl border",
                      teamScoreboard.side === "CT"
                        ? "border-[#00A8FF]/30"
                        : "border-[#FFB800]/30",
                    )}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-3">
                          <div
                            className={clsx(
                              "w-12 h-12 rounded-none flex items-center justify-center font-black text-xl",
                              teamScoreboard.side === "CT"
                                ? "bg-[#00A8FF]/20 text-[#00A8FF] border border-[#00A8FF]/30"
                                : "bg-[#FFB800]/20 text-[#FFB800] border border-[#FFB800]/30",
                              electrolize.className,
                            )}
                          >
                            {teamScoreboard.side ||
                              (teamIndex === 0 ? "CT" : "T")}
                          </div>
                          <div>
                            <h3
                              className={clsx(
                                "text-xl font-bold uppercase tracking-wide",
                                electrolize.className,
                              )}
                            >
                              {teamScoreboard.team?.name ||
                                teamScoreboard.side ||
                                `Team ${teamIndex + 1}`}
                            </h3>
                            <div className="flex items-center gap-2 text-sm text-default-500">
                              <span>
                                {teamScoreboard.players?.length ?? 0} players
                              </span>
                              <span>•</span>
                              <span>
                                Score: {teamScoreboard.team_score ?? 0}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div
                          className={clsx(
                            "text-5xl font-black",
                            teamScoreboard.side === "CT"
                              ? "text-[#00A8FF]"
                              : "text-[#FFB800]",
                            electrolize.className,
                          )}
                        >
                          {teamScoreboard.team_score ?? 0}
                        </div>
                      </div>
                    </CardHeader>
                    <CardBody className="pt-0">
                      <Table
                        aria-label={`${teamScoreboard.team?.name || "Team"} scoreboard`}
                        removeWrapper
                        classNames={{
                          th: "bg-transparent text-default-500 text-xs uppercase tracking-wider",
                          td: "py-3",
                        }}
                      >
                        <TableHeader>
                          <TableColumn>PLAYER</TableColumn>
                          <TableColumn align="center">K</TableColumn>
                          <TableColumn align="center">D</TableColumn>
                          <TableColumn align="center">A</TableColumn>
                          <TableColumn align="center">+/-</TableColumn>
                          <TableColumn align="center">ADR</TableColumn>
                          <TableColumn align="center">HS%</TableColumn>
                          <TableColumn align="center">FK/FD</TableColumn>
                          <TableColumn align="center">KAST</TableColumn>
                          <TableColumn align="center">RATING</TableColumn>
                          <TableColumn align="center">MVPs</TableColumn>
                        </TableHeader>
                        <TableBody emptyContent="No players found">
                          {(teamScoreboard.players ?? []).map(
                            (player, playerIndex) => {
                              const playerStats = getPlayerStatsByIndex(
                                teamScoreboard,
                                playerIndex,
                              );
                              const kills =
                                playerStats?.kills ?? player.kills ?? 0;
                              const deaths =
                                playerStats?.deaths ?? player.deaths ?? 0;
                              const assists =
                                playerStats?.assists ?? player.assists ?? 0;
                              const kdDiff = kills - deaths;
                              const adr = playerStats?.adr ?? player.adr ?? 0;
                              const mvps =
                                playerStats?.mvp_count ?? player.mvp_count ?? 0;
                              const headshotPct =
                                playerStats?.headshot_pct ?? 0;
                              const rating2 = playerStats?.rating_2 ?? 0;
                              const openingKills =
                                playerStats?.opening_kills ?? 0;
                              const openingDeaths =
                                playerStats?.opening_deaths ?? 0;
                              const kast = playerStats?.kast ?? 0;

                              return (
                                <TableRow
                                  key={`${player.name || player.current_name || playerIndex}-${playerIndex}`}
                                >
                                  <TableCell>
                                    <div className="flex items-center gap-3">
                                      <Avatar
                                        size="sm"
                                        name={
                                          player.name?.[0] ||
                                          player.current_name?.[0] ||
                                          "?"
                                        }
                                        classNames={{
                                          base:
                                            teamScoreboard.side === "CT"
                                              ? "bg-[#00A8FF]/20"
                                              : "bg-[#FFB800]/20",
                                        }}
                                      />
                                      <span className="font-semibold">
                                        {player.name ||
                                          player.current_name ||
                                          `Player ${playerIndex + 1}`}
                                      </span>
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <span className="font-bold text-success">
                                      {kills}
                                    </span>
                                  </TableCell>
                                  <TableCell>
                                    <span className="font-bold text-danger">
                                      {deaths}
                                    </span>
                                  </TableCell>
                                  <TableCell>
                                    <span className="font-bold text-warning">
                                      {assists}
                                    </span>
                                  </TableCell>
                                  <TableCell>
                                    <span
                                      className={clsx(
                                        "font-bold",
                                        kdDiff > 0
                                          ? "text-success"
                                          : kdDiff < 0
                                            ? "text-danger"
                                            : "text-default-500",
                                      )}
                                    >
                                      {kdDiff > 0 ? `+${kdDiff}` : kdDiff}
                                    </span>
                                  </TableCell>
                                  <TableCell>
                                    <span
                                      className={clsx(
                                        "font-bold",
                                        adr >= 80
                                          ? "text-success"
                                          : adr >= 60
                                            ? "text-warning"
                                            : "text-default-500",
                                      )}
                                    >
                                      {typeof adr === "number"
                                        ? adr.toFixed(1)
                                        : adr || "-"}
                                    </span>
                                  </TableCell>
                                  <TableCell>
                                    <span
                                      className={clsx(
                                        "font-bold",
                                        headshotPct >= 50
                                          ? "text-success"
                                          : headshotPct >= 30
                                            ? "text-warning"
                                            : "text-default-500",
                                      )}
                                    >
                                      {headshotPct > 0
                                        ? `${headshotPct.toFixed(0)}%`
                                        : "-"}
                                    </span>
                                  </TableCell>
                                  <TableCell>
                                    <span
                                      className={clsx(
                                        "font-bold",
                                        openingKills > openingDeaths
                                          ? "text-success"
                                          : openingKills < openingDeaths
                                            ? "text-danger"
                                            : "text-default-500",
                                      )}
                                    >
                                      {openingKills > 0 || openingDeaths > 0
                                        ? `${openingKills}/${openingDeaths}`
                                        : "-"}
                                    </span>
                                  </TableCell>
                                  <TableCell>
                                    <span
                                      className={clsx(
                                        "font-bold",
                                        kast >= 75
                                          ? "text-success"
                                          : kast >= 60
                                            ? "text-warning"
                                            : "text-default-500",
                                      )}
                                    >
                                      {kast > 0 ? `${kast.toFixed(0)}%` : "-"}
                                    </span>
                                  </TableCell>
                                  <TableCell>
                                    <Chip
                                      size="sm"
                                      variant="flat"
                                      color={
                                        rating2 >= 1.2
                                          ? "success"
                                          : rating2 >= 0.9
                                            ? "warning"
                                            : "danger"
                                      }
                                      className="font-bold"
                                    >
                                      {rating2 > 0 ? rating2.toFixed(2) : "-"}
                                    </Chip>
                                  </TableCell>
                                  <TableCell>
                                    {mvps > 0 ? (
                                      <div className="flex items-center gap-1">
                                        <Icon
                                          icon="solar:star-bold"
                                          className="text-[#FFB800]"
                                          width={16}
                                        />
                                        <span className="font-bold text-[#FFB800]">
                                          {mvps}
                                        </span>
                                      </div>
                                    ) : (
                                      <span className="text-default-400">
                                        -
                                      </span>
                                    )}
                                  </TableCell>
                                </TableRow>
                              );
                            },
                          )}
                        </TableBody>
                      </Table>
                    </CardBody>
                  </Card>
                ),
              )}
            </>
          )}

          {/* ROUNDS TAB - Premium Round Timeline Component */}
          {selectedTab === "rounds" && (
            <PremiumRoundsTimeline
              events={state.events}
              loading={state.eventsLoading}
              matchId={matchId}
              gameId={gameId}
              onWatchRound={(round) => {
                const replayId =
                  state.match?.linked_replay_id || state.match?.replay_file_id;
                if (replayId) {
                  router.push(`/replays/${gameId}/${replayId}?round=${round}`);
                }
              }}
            />
          )}

          {/* HIGHLIGHTS TAB - Premium Component */}
          {selectedTab === "highlights" && (
            <PremiumHighlights
              highlights={state.highlights}
              loading={state.highlightsLoading}
              matchId={matchId}
              gameId={gameId}
              replayId={
                state.match?.linked_replay_id || state.match?.replay_file_id
              }
              onWatchHighlight={(tickId) => {
                const replayId =
                  state.match?.linked_replay_id || state.match?.replay_file_id;
                if (replayId) {
                  router.push(`/replays/${gameId}/${replayId}?tick=${tickId}`);
                }
              }}
            />
          )}

          {/* EVENTS TAB - Premium Component */}
          {selectedTab === "events" && (
            <PremiumEventsTimeline
              events={state.events}
              loading={state.eventsLoading}
              matchId={matchId}
              gameId={gameId}
              onWatchTick={(tick) => {
                const replayId =
                  state.match?.linked_replay_id || state.match?.replay_file_id;
                if (replayId) {
                  router.push(`/replays/${gameId}/${replayId}?tick=${tick}`);
                }
              }}
            />
          )}

          {/* HEATMAP TAB - Premium Component */}
          {selectedTab === "heatmap" && (
            <PremiumHeatmap
              heatmap={state.heatmap}
              kills={state.events?.kills}
              heGrenades={state.events?.he_grenades}
              flashGrenades={state.events?.flash_grenades}
              smokes={state.events?.smokes}
              molotovs={state.events?.molotovs}
              insights={state.events?.insights}
              loading={!state.heatmap && state.loading}
              matchId={matchId}
              gameId={gameId}
              mapName={state.match?.map_name || state.match?.map}
            />
          )}
        </div>

        {/* Right Column - Additional Info */}
        <div className="space-y-6">
          {/* Match Info */}
          <Card className="bg-gradient-to-br from-background/80 to-background/60 backdrop-blur-xl border border-[#FF4654]/20 dark:border-[#DCFF37]/20">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2">
                <Icon
                  icon="solar:info-circle-bold"
                  width={20}
                  className="text-[#FF4654] dark:text-[#DCFF37]"
                />
                <h2
                  className={clsx(
                    "text-lg font-bold uppercase tracking-wide",
                    electrolize.className,
                  )}
                >
                  Match Info
                </h2>
              </div>
            </CardHeader>
            <CardBody className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-default-500">Game Mode</span>
                <Chip size="sm" variant="flat" color="primary">
                  {state.match.mode || "Competitive"}
                </Chip>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-default-500">Visibility</span>
                <Chip size="sm" variant="flat" color="success">
                  Public
                </Chip>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-default-500">Status</span>
                {(() => {
                  const matchStatus = normalizeStatus(state.match.status);
                  const statusCfg = STATUS_CONFIG[matchStatus];
                  return (
                    <Chip
                      size="sm"
                      variant="flat"
                      color={statusCfg.color}
                      startContent={<Icon icon={statusCfg.icon} width={12} />}
                    >
                      {statusCfg.label}
                    </Chip>
                  );
                })()}
              </div>
            </CardBody>
          </Card>

          {/* Quick Actions */}
          <Card className="bg-gradient-to-br from-background/80 to-background/60 backdrop-blur-xl border border-[#FF4654]/20 dark:border-[#DCFF37]/20">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2">
                <Icon
                  icon="solar:bolt-bold"
                  width={20}
                  className="text-[#FF4654] dark:text-[#DCFF37]"
                />
                <h2
                  className={clsx(
                    "text-lg font-bold uppercase tracking-wide",
                    electrolize.className,
                  )}
                >
                  Quick Actions
                </h2>
              </div>
            </CardHeader>
            <CardBody className="space-y-3">
              <EsportsButton
                variant="primary"
                size="lg"
                className="w-full justify-start"
                onClick={() => router.push(`/replays/${gameId}/${matchId}`)}
              >
                <Icon icon="solar:play-bold" width={18} />
                Watch Full Replay
              </EsportsButton>
              <EsportsButton
                variant="ghost"
                size="lg"
                className="w-full justify-start"
                onClick={() => router.push(`/highlights/${gameId}/${matchId}`)}
              >
                <Icon icon="solar:star-bold" width={18} />
                View Highlights
              </EsportsButton>
              <EsportsButton
                variant="ghost"
                size="lg"
                className="w-full justify-start"
              >
                <Icon icon="solar:share-bold" width={18} />
                Share Match
              </EsportsButton>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}

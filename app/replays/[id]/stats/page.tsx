"use client";

/**
 * Replay Stats Page — Premium Esports UI
 * Shows full match analysis: scoreboard, statistics, player performance
 */

import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Card,
  CardBody,
  CardHeader,
  Chip,
  Spinner,
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
  Button,
} from "@nextui-org/react";
import { Icon } from "@iconify/react";
import {
  ReplayAPISDK,
  MatchData,
  TeamScoreboard,
  PlayerStatsEntry,
  ReplayScoreboardResponse,
} from "@/types/replay-api/sdk";
import { ReplayApiSettingsMock } from "@/types/replay-api/settings";
import { ReplayFile } from "@/types/replay-api/replay-file";
import { logger } from "@/lib/logger";
import { EsportsButton } from "@/components/ui/esports-button";
import clsx from "clsx";
import { electrolize } from "@/config/fonts";

// ─── Types ───────────────────────────────────────────────────────────────────

interface ReplayPageState {
  replay: ReplayFile | null;
  match: MatchData | null;
  replayScoreboard: ReplayScoreboardResponse | null;
  loading: boolean;
  error: string | null;
  processingStatus: string;
}

const statusConfig: Record<
  string,
  {
    color: "warning" | "primary" | "success" | "danger";
    icon: string;
    label: string;
    description: string;
  }
> = {
  Pending: {
    color: "warning",
    icon: "solar:clock-circle-bold",
    label: "Pending",
    description: "Queued for analysis",
  },
  Processing: {
    color: "primary",
    icon: "solar:refresh-bold",
    label: "Processing",
    description: "Analyzing your replay...",
  },
  Completed: {
    color: "success",
    icon: "solar:check-circle-bold",
    label: "Ready",
    description: "Analysis complete",
  },
  Ready: {
    color: "success",
    icon: "solar:check-circle-bold",
    label: "Ready",
    description: "Analysis complete",
  },
  Failed: {
    color: "danger",
    icon: "solar:danger-circle-bold",
    label: "Failed",
    description: "Processing failed",
  },
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

const getPlayerStatsByIndex = (
  team: TeamScoreboard | undefined,
  idx: number,
): PlayerStatsEntry | null => {
  if (!team?.player_stats || idx < 0) return null;
  return team.player_stats[idx] || null;
};

const formatDuration = (seconds?: number, totalRounds?: number) => {
  if (!seconds && totalRounds && totalRounds > 0) {
    const est = Math.round(totalRounds * 1.7);
    return `~${est} min`;
  }
  if (!seconds || seconds <= 0) return "Unknown";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

const formatFileSize = (bytes?: number) => {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const formatDate = (date?: Date | string) => {
  if (!date) return "—";
  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatMapName = (raw?: string) => {
  if (!raw) return "Unknown Map";
  return raw
    .replace(/^(de_|cs_|ar_)/, "")
    .replace(/^\w/, (c) => c.toUpperCase());
};

const mapImages: Record<string, string> = {
  de_inferno: "🔥",
  de_mirage: "🏜️",
  de_dust2: "🌵",
  de_nuke: "☢️",
  de_overpass: "🌉",
  de_ancient: "🏛️",
  de_vertigo: "🏗️",
  de_anubis: "🐍",
  cs_office: "🏢",
};

// ─── Component ───────────────────────────────────────────────────────────────

export default function ReplayStatsPage() {
  const params = useParams();
  const router = useRouter();
  const replayId = params?.id as string | undefined;

  const sdk = useMemo(
    () => new ReplayAPISDK(ReplayApiSettingsMock, logger),
    [],
  );

  const [state, setState] = useState<ReplayPageState>({
    replay: null,
    match: null,
    replayScoreboard: null,
    loading: true,
    error: null,
    processingStatus: "Pending",
  });

  const [selectedTab, setSelectedTab] = useState("overview");
  const [pollCount, setPollCount] = useState(0);
  const [dataRetryCount, setDataRetryCount] = useState(0);

  // ─── Data Fetching ───────────────────────────────────────────────────────

  const fetchData = useCallback(async () => {
    if (!replayId) return;

    setState((prev) => ({
      ...prev,
      loading: prev.replay === null,
      error: null,
    }));

    try {
      // 1. Fetch replay file metadata
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

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const r = replay as ReplayFile & Record<string, any>;
      const currentStatus = r.status || "Pending";
      const gameId = r.game_id || r.gameId || "cs2";

      let replayScoreboard: ReplayScoreboardResponse | null = null;
      let matchData: MatchData | null = null;

      if (currentStatus === "Completed" || currentStatus === "Ready") {
        // 2. Fetch replay-specific scoreboard (handles dedup/reference replays)
        try {
          replayScoreboard = await sdk.replayFiles
            .getReplayScoreboard(gameId, replayId)
            .catch(() => null);
        } catch {
          // best-effort
        }

        // 3. Fetch match data for duration, map, server, events
        let matchId = r.match_id || r.matchId;
        if (!matchId && replayScoreboard?.match_id) {
          matchId = replayScoreboard.match_id;
        }

        if (matchId) {
          try {
            matchData = await sdk.matches
              .getMatch(gameId, matchId)
              .catch(() => null);
          } catch {
            // best-effort
          }
        }
      }

      setState({
        replay,
        match: matchData,
        replayScoreboard,
        loading: false,
        error: null,
        processingStatus: currentStatus,
      });
    } catch (error) {
      const msg =
        error instanceof Error ? error.message : "Failed to load replay";
      logger.error("Failed to fetch replay", { replayId, error });
      setState((prev) => ({ ...prev, loading: false, error: msg }));
    }
  }, [replayId, sdk]);

  useEffect(() => {
    fetchData();
  }, [fetchData, pollCount, dataRetryCount]);

  // Poll while processing
  useEffect(() => {
    if (
      state.processingStatus === "Processing" ||
      state.processingStatus === "Pending"
    ) {
      const interval = setInterval(() => setPollCount((c) => c + 1), 3000);
      return () => clearInterval(interval);
    }
    return undefined;
  }, [state.processingStatus]);

  // Retry when complete but scoreboard missing (dedup background processing)
  useEffect(() => {
    const isCompleted =
      state.processingStatus === "Completed" ||
      state.processingStatus === "Ready";
    if (
      isCompleted &&
      !state.replayScoreboard &&
      !state.loading &&
      dataRetryCount < 10
    ) {
      const timer = setTimeout(() => setDataRetryCount((c) => c + 1), 3000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [
    state.processingStatus,
    state.replayScoreboard,
    state.loading,
    dataRetryCount,
  ]);

  // ─── Derived Data ────────────────────────────────────────────────────────

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const stateReplay = state.replay as
    | (ReplayFile & Record<string, any>) // eslint-disable-line @typescript-eslint/no-explicit-any
    | null;
  const gameId = stateReplay?.game_id || stateReplay?.gameId || "cs2";

  const teams = state.replayScoreboard?.teams || [];
  const team1 = teams[0] || null;
  const team2 = teams[1] || null;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const matchAny = state.match as (MatchData & Record<string, any>) | null;
  const mapName =
    matchAny?.map_name || matchAny?.map || stateReplay?.header?.mapName || "";
  const mapDisplay = formatMapName(mapName);
  const mapEmoji = mapImages[mapName] || "🗺️";

  const duration = matchAny?.duration;
  const totalRounds = (team1?.team_score ?? 0) + (team2?.team_score ?? 0);
  const serverName = matchAny?.server_name || "";
  const mode = matchAny?.mode || "";
  const eventCount = matchAny?.event_count ?? 0;

  const mvpPlayer = state.replayScoreboard?.mvp;
  const matchMvp = matchAny?.scoreboard?.match_mvp;
  const overallMvp = mvpPlayer || matchMvp;

  // Build sorted player list with all stats for statistics tab
  const allPlayersWithStats = useMemo(() => {
    if (!teams.length) return [];
    const result: Array<{
      name: string;
      side: string;
      stats: PlayerStatsEntry;
    }> = [];

    for (const t of teams) {
      const players = t.players || [];
      const playerStats = t.player_stats || [];
      for (let i = 0; i < playerStats.length; i++) {
        const player = players[i];
        result.push({
          name: player?.name || player?.current_name || `Player ${i + 1}`,
          side: t.side || "?",
          stats: playerStats[i],
        });
      }
    }
    // Sort by rating descending
    result.sort((a, b) => (b.stats.rating_2 ?? 0) - (a.stats.rating_2 ?? 0));
    return result;
  }, [teams]);

  const isReady =
    state.processingStatus === "Completed" ||
    state.processingStatus === "Ready";
  const status = statusConfig[state.processingStatus] || statusConfig.Pending;

  // ─── Render: Loading ─────────────────────────────────────────────────────

  if (state.loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Spinner size="lg" color="primary" />
          <p
            className={clsx(
              "mt-4 text-default-500 uppercase tracking-wide",
              electrolize.className,
            )}
          >
            Loading Analysis...
          </p>
        </div>
      </div>
    );
  }

  if (state.error || !state.replay) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Card className="bg-danger-50 dark:bg-danger-900/20 border border-danger/30">
          <CardBody className="text-center py-12">
            <Icon
              icon="solar:danger-circle-bold"
              className="mx-auto mb-4 text-danger"
              width={64}
            />
            <h2
              className={clsx(
                "text-xl font-black mb-2 uppercase",
                electrolize.className,
              )}
            >
              Error Loading Replay
            </h2>
            <p className="text-default-600 mb-4">
              {state.error || "Replay not found"}
            </p>
            <EsportsButton
              variant="primary"
              onClick={() => router.push("/replays")}
            >
              Back to Replays
            </EsportsButton>
          </CardBody>
        </Card>
      </div>
    );
  }

  // ─── Render: Main ────────────────────────────────────────────────────────

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* ════════════════════════════════════════════
          HERO HEADER
          ════════════════════════════════════════════ */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-[#FF4654]/10 via-transparent to-[#DCFF37]/10 blur-3xl -z-10" />

        <div className="esports-card bg-gradient-to-r from-background/80 to-background/60 backdrop-blur-xl border-2 border-[#FF4654]/30 dark:border-[#DCFF37]/30 p-6">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            {/* Left: Back + Title */}
            <div className="flex items-start gap-4">
              <EsportsButton
                variant="ghost"
                size="sm"
                onClick={() => router.push("/replays")}
                className="group"
              >
                <Icon icon="solar:arrow-left-bold" width={16} />
                <span className="hidden sm:inline">Back</span>
              </EsportsButton>

              <div>
                <div className="flex items-center gap-3 mb-2 flex-wrap">
                  <h1
                    className={clsx(
                      "text-2xl font-black uppercase tracking-tight",
                      "bg-gradient-to-r from-[#FF4654] to-[#FFC700] dark:from-[#DCFF37] dark:to-[#FF4654] bg-clip-text text-transparent",
                      electrolize.className,
                    )}
                  >
                    {mapDisplay !== "Unknown Map"
                      ? `${mapDisplay.toUpperCase()} — MATCH ANALYSIS`
                      : `REPLAY #${replayId?.slice(0, 8).toUpperCase()}`}
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
                      electrolize.className,
                    )}
                  >
                    {status.label}
                  </Chip>
                </div>

                {/* Sub-header meta info */}
                {isReady && (
                  <div className="flex items-center gap-4 text-sm text-default-500 flex-wrap">
                    {mapName && (
                      <span className="flex items-center gap-1">
                        <Icon icon="solar:map-point-bold" width={16} />{" "}
                        {mapEmoji} {mapDisplay}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Icon icon="solar:clock-circle-bold" width={16} />
                      {formatDuration(duration, totalRounds)}
                    </span>
                    {mode && (
                      <span className="flex items-center gap-1">
                        <Icon icon="solar:gamepad-bold" width={16} />
                        {mode.charAt(0).toUpperCase() + mode.slice(1)}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Icon icon="solar:calendar-bold" width={16} />
                      {formatDate(state.replay.created_at)}
                    </span>
                    <Chip
                      size="sm"
                      variant="flat"
                      color="primary"
                      className="ml-1"
                    >
                      <Icon
                        icon="simple-icons:counterstrike"
                        width={12}
                        className="mr-1"
                      />
                      {(gameId || "CS2").toUpperCase()}
                    </Chip>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex gap-2 flex-wrap">
              {isReady && state.match?.id && (
                <EsportsButton
                  variant="primary"
                  size="lg"
                  glow
                  onClick={() =>
                    router.push(`/matches/${gameId}/${state.match!.id}`)
                  }
                  className="group"
                >
                  <Icon icon="solar:chart-square-bold" width={18} />
                  FULL MATCH
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

      {/* ════════════════════════════════════════════
          PROCESSING STATE
          ════════════════════════════════════════════ */}
      {(state.processingStatus === "Processing" ||
        state.processingStatus === "Pending") && (
        <Card className="border border-primary/30 bg-primary/5">
          <CardBody className="py-6">
            <div className="flex items-center gap-4 mb-4">
              <Icon
                icon="solar:cpu-bolt-bold"
                width={32}
                className="text-primary animate-pulse"
              />
              <div>
                <h3
                  className={clsx(
                    "font-bold uppercase",
                    electrolize.className,
                  )}
                >
                  Processing Your Replay
                </h3>
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
              This usually takes 30 seconds to 2 minutes
            </p>
          </CardBody>
        </Card>
      )}

      {/* ════════════════════════════════════════════
          SCORE BANNER
          ════════════════════════════════════════════ */}
      {isReady && team1 && team2 && (
        <Card className="bg-gradient-to-br from-background/80 to-background/60 backdrop-blur-xl border-2 border-[#FF4654]/30 dark:border-[#DCFF37]/30 overflow-hidden">
          <CardBody className="p-0">
            <div className="flex items-stretch">
              {/* Team 1 */}
              <div
                className={clsx(
                  "flex-1 p-6 flex flex-col items-center justify-center",
                  team1.side === "CT"
                    ? "bg-[#00A8FF]/5"
                    : "bg-[#FFB800]/5",
                )}
              >
                <div
                  className={clsx(
                    "w-12 h-12 rounded-none flex items-center justify-center font-black text-xl mb-2",
                    team1.side === "CT"
                      ? "bg-[#00A8FF]/20 text-[#00A8FF] border border-[#00A8FF]/30"
                      : "bg-[#FFB800]/20 text-[#FFB800] border border-[#FFB800]/30",
                    electrolize.className,
                  )}
                >
                  {team1.side || "T1"}
                </div>
                <div className="text-xs text-default-500 uppercase tracking-wider mb-1">
                  {team1.team?.name || team1.side || "Team 1"}
                </div>
                <div
                  className={clsx(
                    "text-6xl font-black",
                    team1.side === "CT"
                      ? "text-[#00A8FF]"
                      : "text-[#FFB800]",
                    electrolize.className,
                  )}
                >
                  {team1.team_score ?? 0}
                </div>
                {team1.team_mvp && (
                  <div className="flex items-center gap-1 mt-2 text-xs text-default-400">
                    <Icon
                      icon="solar:star-bold"
                      width={12}
                      className="text-[#FFB800]"
                    />
                    MVP: {team1.team_mvp.name}
                  </div>
                )}
              </div>

              {/* Center divider */}
              <div className="flex flex-col items-center justify-center px-6 bg-gradient-to-b from-[#FF4654]/10 to-[#DCFF37]/10">
                <div
                  className={clsx(
                    "text-2xl font-black text-default-400 mb-2",
                    electrolize.className,
                  )}
                >
                  VS
                </div>
                <div className="text-xs text-default-500 uppercase tracking-wider">
                  {totalRounds > 0 && `${totalRounds} Rounds`}
                </div>
                {mapName && <div className="text-lg mt-1">{mapEmoji}</div>}
              </div>

              {/* Team 2 */}
              <div
                className={clsx(
                  "flex-1 p-6 flex flex-col items-center justify-center",
                  team2.side === "CT"
                    ? "bg-[#00A8FF]/5"
                    : "bg-[#FFB800]/5",
                )}
              >
                <div
                  className={clsx(
                    "w-12 h-12 rounded-none flex items-center justify-center font-black text-xl mb-2",
                    team2.side === "CT"
                      ? "bg-[#00A8FF]/20 text-[#00A8FF] border border-[#00A8FF]/30"
                      : "bg-[#FFB800]/20 text-[#FFB800] border border-[#FFB800]/30",
                    electrolize.className,
                  )}
                >
                  {team2.side || "T2"}
                </div>
                <div className="text-xs text-default-500 uppercase tracking-wider mb-1">
                  {team2.team?.name || team2.side || "Team 2"}
                </div>
                <div
                  className={clsx(
                    "text-6xl font-black",
                    team2.side === "CT"
                      ? "text-[#00A8FF]"
                      : "text-[#FFB800]",
                    electrolize.className,
                  )}
                >
                  {team2.team_score ?? 0}
                </div>
                {team2.team_mvp && (
                  <div className="flex items-center gap-1 mt-2 text-xs text-default-400">
                    <Icon
                      icon="solar:star-bold"
                      width={12}
                      className="text-[#FFB800]"
                    />
                    MVP: {team2.team_mvp.name}
                  </div>
                )}
              </div>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Scoreboard loading/retry */}
      {isReady && !state.replayScoreboard && (
        <Card className="border border-primary/30">
          <CardBody className="text-center py-12">
            {dataRetryCount < 10 ? (
              <>
                <Spinner
                  size="lg"
                  color="primary"
                  className="mx-auto mb-4"
                />
                <p
                  className={clsx(
                    "text-default-500 uppercase tracking-wide",
                    electrolize.className,
                  )}
                >
                  Loading Match Data... ({dataRetryCount}/10)
                </p>
                <p className="text-xs text-default-400 mt-1">
                  Match analysis in progress, please wait
                </p>
              </>
            ) : (
              <>
                <Icon
                  icon="solar:restart-bold"
                  width={48}
                  className="mx-auto mb-4 text-default-300"
                />
                <p className="text-default-500">
                  Could not load match data
                </p>
                <Button
                  color="primary"
                  size="sm"
                  className="mt-4"
                  onPress={() => setDataRetryCount(0)}
                >
                  Retry
                </Button>
              </>
            )}
          </CardBody>
        </Card>
      )}

      {/* ════════════════════════════════════════════
          TABBED CONTENT
          ════════════════════════════════════════════ */}
      {isReady && state.replayScoreboard && (
        <Tabs
          selectedKey={selectedTab}
          onSelectionChange={(key) => setSelectedTab(key as string)}
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
          aria-label="Replay sections"
        >
          {/* ─── OVERVIEW TAB ─── */}
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
          >
            <div className="space-y-6 py-4">
              {/* Match Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard
                  icon="solar:rewind-forward-bold"
                  label="Total Rounds"
                  value={totalRounds}
                  color="#FF4654"
                />
                <StatCard
                  icon="solar:users-group-rounded-bold"
                  label="Players"
                  value={teams.reduce(
                    (a, t) => a + (t.players?.length ?? 0),
                    0,
                  )}
                  color="#DCFF37"
                />
                <StatCard
                  icon="solar:clock-circle-bold"
                  label="Duration"
                  value={formatDuration(duration, totalRounds)}
                  color="#FFC700"
                />
                <StatCard
                  icon="solar:bolt-circle-bold"
                  label={eventCount > 0 ? "Events" : "Total Kills"}
                  value={
                    eventCount > 0
                      ? eventCount
                      : teams.reduce(
                          (a, t) =>
                            a +
                            (t.player_stats?.reduce(
                              (s, p) => s + (p.kills ?? 0),
                              0,
                            ) ?? 0),
                          0,
                        )
                  }
                  color="#00A8FF"
                />
              </div>

              {/* MVP Highlight */}
              {overallMvp && (
                <Card className="bg-gradient-to-r from-[#FFB800]/10 via-[#FFC700]/5 to-[#FFB800]/10 border border-[#FFB800]/30">
                  <CardBody className="py-4">
                    <div className="flex items-center gap-4 flex-wrap">
                      <div className="w-14 h-14 rounded-none bg-[#FFB800]/20 border border-[#FFB800]/40 flex items-center justify-center">
                        <Icon
                          icon="solar:crown-bold"
                          width={28}
                          className="text-[#FFB800]"
                        />
                      </div>
                      <div>
                        <div className="text-xs text-[#FFB800] uppercase tracking-widest font-bold">
                          Match MVP
                        </div>
                        <div
                          className={clsx(
                            "text-xl font-black uppercase",
                            electrolize.className,
                          )}
                        >
                          {overallMvp.name || "Unknown"}
                        </div>
                      </div>
                      {(() => {
                        const mvpStats = allPlayersWithStats.find(
                          (p) => p.name === overallMvp.name,
                        );
                        if (!mvpStats) return null;
                        return (
                          <div className="ml-auto flex items-center gap-6 text-sm">
                            <div className="text-center">
                              <div className="text-lg font-black text-success">
                                {mvpStats.stats.kills}
                              </div>
                              <div className="text-[10px] text-default-400 uppercase">
                                Kills
                              </div>
                            </div>
                            <div className="text-center">
                              <div className="text-lg font-black text-danger">
                                {mvpStats.stats.deaths}
                              </div>
                              <div className="text-[10px] text-default-400 uppercase">
                                Deaths
                              </div>
                            </div>
                            <div className="text-center">
                              <div className="text-lg font-black text-warning">
                                {mvpStats.stats.assists}
                              </div>
                              <div className="text-[10px] text-default-400 uppercase">
                                Assists
                              </div>
                            </div>
                            <div className="text-center">
                              <Chip
                                size="sm"
                                variant="flat"
                                color={
                                  mvpStats.stats.rating_2 >= 1.2
                                    ? "success"
                                    : "warning"
                                }
                                className="font-bold"
                              >
                                {mvpStats.stats.rating_2?.toFixed(2)}
                              </Chip>
                              <div className="text-[10px] text-default-400 uppercase mt-0.5">
                                Rating
                              </div>
                            </div>
                            <div className="text-center">
                              <div className="flex items-center gap-0.5">
                                <Icon
                                  icon="solar:star-bold"
                                  width={14}
                                  className="text-[#FFB800]"
                                />
                                <span className="text-lg font-black text-[#FFB800]">
                                  {mvpStats.stats.mvp_count}
                                </span>
                              </div>
                              <div className="text-[10px] text-default-400 uppercase">
                                MVPs
                              </div>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  </CardBody>
                </Card>
              )}

              {/* Match Info Bar */}
              {(serverName || mode || mapName) && (
                <Card className="border border-default-200 bg-default-50/50 dark:bg-default-100/10">
                  <CardBody className="py-3">
                    <div className="flex items-center gap-6 text-sm text-default-500 flex-wrap">
                      {mapName && (
                        <span className="flex items-center gap-1.5">
                          <Icon
                            icon="solar:map-point-bold"
                            width={16}
                            className="text-[#FF4654] dark:text-[#DCFF37]"
                          />
                          <span className="font-semibold text-foreground">
                            {mapEmoji} {mapDisplay}
                          </span>
                        </span>
                      )}
                      {mode && (
                        <span className="flex items-center gap-1.5">
                          <Icon
                            icon="solar:gamepad-bold"
                            width={16}
                            className="text-[#FF4654] dark:text-[#DCFF37]"
                          />
                          <span className="font-semibold text-foreground">
                            {mode.charAt(0).toUpperCase() + mode.slice(1)}
                          </span>
                        </span>
                      )}
                      {serverName && (
                        <span className="flex items-center gap-1.5">
                          <Icon
                            icon="solar:server-bold"
                            width={16}
                            className="text-[#FF4654] dark:text-[#DCFF37]"
                          />
                          <span className="font-medium truncate max-w-[300px]">
                            {serverName}
                          </span>
                        </span>
                      )}
                    </div>
                  </CardBody>
                </Card>
              )}

              {/* Team Scoreboards */}
              {teams.map((ts, teamIdx) => (
                <TeamScoreboardCard
                  key={teamIdx}
                  teamScoreboard={ts}
                  teamIndex={teamIdx}
                />
              ))}
            </div>
          </Tab>

          {/* ─── STATISTICS TAB ─── */}
          <Tab
            key="statistics"
            title={
              <div className="flex items-center space-x-2">
                <Icon icon="solar:graph-up-bold" width={20} />
                <span
                  className={clsx(
                    "font-semibold uppercase tracking-wide",
                    electrolize.className,
                  )}
                >
                  Statistics
                </span>
                <Chip size="sm" variant="flat" color="warning">
                  {allPlayersWithStats.length}
                </Chip>
              </div>
            }
          >
            <div className="space-y-6 py-4">
              {/* All Players Ranking Table */}
              <Card className="bg-gradient-to-br from-background/80 to-background/60 backdrop-blur-xl border border-[#FF4654]/20 dark:border-[#DCFF37]/20">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <Icon
                      icon="solar:ranking-bold"
                      width={20}
                      className="text-[#FF4654] dark:text-[#DCFF37]"
                    />
                    <h2
                      className={clsx(
                        "text-lg font-bold uppercase tracking-wide",
                        electrolize.className,
                      )}
                    >
                      Player Rankings
                    </h2>
                  </div>
                </CardHeader>
                <CardBody className="pt-0 overflow-x-auto">
                  <Table
                    aria-label="Player rankings"
                    removeWrapper
                    classNames={{
                      th: "bg-transparent text-default-500 text-xs uppercase tracking-wider",
                      td: "py-2",
                    }}
                  >
                    <TableHeader>
                      <TableColumn>#</TableColumn>
                      <TableColumn>PLAYER</TableColumn>
                      <TableColumn align="center">K</TableColumn>
                      <TableColumn align="center">D</TableColumn>
                      <TableColumn align="center">A</TableColumn>
                      <TableColumn align="center">+/-</TableColumn>
                      <TableColumn align="center">ADR</TableColumn>
                      <TableColumn align="center">HS%</TableColumn>
                      <TableColumn align="center">FK/FD</TableColumn>
                      <TableColumn align="center">KAST</TableColumn>
                      <TableColumn align="center">IMPACT</TableColumn>
                      <TableColumn align="center">DMG</TableColumn>
                      <TableColumn align="center">UD</TableColumn>
                      <TableColumn align="center">FLASH</TableColumn>
                      <TableColumn align="center">CLUTCH</TableColumn>
                      <TableColumn align="center">RATING</TableColumn>
                    </TableHeader>
                    <TableBody>
                      {allPlayersWithStats.map((p, idx) => {
                        const s = p.stats;
                        const kdDiff = (s.kills ?? 0) - (s.deaths ?? 0);
                        return (
                          <TableRow key={idx}>
                            <TableCell>
                              <span
                                className={clsx(
                                  "font-bold text-sm",
                                  idx === 0
                                    ? "text-[#FFB800]"
                                    : idx < 3
                                      ? "text-[#FF4654] dark:text-[#DCFF37]"
                                      : "text-default-400",
                                )}
                              >
                                {idx + 1}
                              </span>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2 min-w-[130px]">
                                <Avatar
                                  size="sm"
                                  name={p.name[0]}
                                  classNames={{
                                    base:
                                      p.side === "CT"
                                        ? "bg-[#00A8FF]/20"
                                        : "bg-[#FFB800]/20",
                                  }}
                                />
                                <div className="min-w-0">
                                  <div className="font-semibold truncate max-w-[120px]">
                                    {p.name}
                                  </div>
                                  <Chip
                                    size="sm"
                                    variant="flat"
                                    className={clsx(
                                      "h-4 text-[10px]",
                                      p.side === "CT"
                                        ? "bg-[#00A8FF]/20 text-[#00A8FF]"
                                        : "bg-[#FFB800]/20 text-[#FFB800]",
                                    )}
                                  >
                                    {p.side}
                                  </Chip>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <span className="font-bold text-success">
                                {s.kills}
                              </span>
                            </TableCell>
                            <TableCell>
                              <span className="font-bold text-danger">
                                {s.deaths}
                              </span>
                            </TableCell>
                            <TableCell>
                              <span className="font-bold text-warning">
                                {s.assists}
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
                                  (s.adr ?? 0) >= 80
                                    ? "text-success"
                                    : (s.adr ?? 0) >= 60
                                      ? "text-warning"
                                      : "text-default-500",
                                )}
                              >
                                {s.adr?.toFixed(1) ?? "—"}
                              </span>
                            </TableCell>
                            <TableCell>
                              <span
                                className={clsx(
                                  "font-bold",
                                  (s.headshot_pct ?? 0) >= 50
                                    ? "text-success"
                                    : (s.headshot_pct ?? 0) >= 30
                                      ? "text-warning"
                                      : "text-default-500",
                                )}
                              >
                                {s.headshot_pct
                                  ? `${s.headshot_pct.toFixed(0)}%`
                                  : "—"}
                              </span>
                            </TableCell>
                            <TableCell>
                              <Tooltip
                                content={`First Kills: ${s.opening_kills ?? 0} | First Deaths: ${s.opening_deaths ?? 0}`}
                              >
                                <span
                                  className={clsx(
                                    "font-bold",
                                    (s.opening_kills ?? 0) >
                                      (s.opening_deaths ?? 0)
                                      ? "text-success"
                                      : (s.opening_kills ?? 0) <
                                          (s.opening_deaths ?? 0)
                                        ? "text-danger"
                                        : "text-default-500",
                                  )}
                                >
                                  {(s.opening_kills ?? 0) > 0 ||
                                  (s.opening_deaths ?? 0) > 0
                                    ? `${s.opening_kills ?? 0}/${s.opening_deaths ?? 0}`
                                    : "—"}
                                </span>
                              </Tooltip>
                            </TableCell>
                            <TableCell>
                              <span
                                className={clsx(
                                  "font-bold",
                                  (s.kast ?? 0) >= 75
                                    ? "text-success"
                                    : (s.kast ?? 0) >= 60
                                      ? "text-warning"
                                      : "text-default-500",
                                )}
                              >
                                {s.kast ? `${s.kast}%` : "—"}
                              </span>
                            </TableCell>
                            <TableCell>
                              <Tooltip content="Impact Rating">
                                <span
                                  className={clsx(
                                    "font-bold",
                                    (s.impact_rating ?? 0) >= 1.5
                                      ? "text-success"
                                      : (s.impact_rating ?? 0) >= 1.0
                                        ? "text-warning"
                                        : "text-default-500",
                                  )}
                                >
                                  {s.impact_rating?.toFixed(2) ?? "—"}
                                </span>
                              </Tooltip>
                            </TableCell>
                            <TableCell>
                              <Tooltip content="Total Damage">
                                <span className="font-bold text-default-600">
                                  {s.total_damage ?? "—"}
                                </span>
                              </Tooltip>
                            </TableCell>
                            <TableCell>
                              <Tooltip content="Utility Damage">
                                <span
                                  className={clsx(
                                    "font-bold",
                                    (s.utility_damage ?? 0) > 100
                                      ? "text-warning"
                                      : "text-default-500",
                                  )}
                                >
                                  {s.utility_damage ?? 0}
                                </span>
                              </Tooltip>
                            </TableCell>
                            <TableCell>
                              <Tooltip
                                content={`Flash Assists: ${s.flash_assists ?? 0} | Enemies Flashed: ${s.enemies_flashed ?? 0}`}
                              >
                                <span
                                  className={clsx(
                                    "font-bold",
                                    (s.flash_assists ?? 0) > 0
                                      ? "text-yellow-500"
                                      : "text-default-500",
                                  )}
                                >
                                  {(s.flash_assists ?? 0) > 0 ||
                                  (s.enemies_flashed ?? 0) > 0
                                    ? `${s.flash_assists ?? 0}/${s.enemies_flashed ?? 0}`
                                    : "—"}
                                </span>
                              </Tooltip>
                            </TableCell>
                            <TableCell>
                              <Tooltip
                                content={`Clutch Wins: ${s.clutch_wins ?? 0} / ${s.clutch_attempts ?? 0} Attempts`}
                              >
                                <span
                                  className={clsx(
                                    "font-bold",
                                    (s.clutch_wins ?? 0) > 0
                                      ? "text-purple-500"
                                      : "text-default-500",
                                  )}
                                >
                                  {(s.clutch_wins ?? 0) > 0 ||
                                  (s.clutch_attempts ?? 0) > 0
                                    ? `${s.clutch_wins ?? 0}/${s.clutch_attempts ?? 0}`
                                    : "—"}
                                </span>
                              </Tooltip>
                            </TableCell>
                            <TableCell>
                              <Chip
                                size="sm"
                                variant="flat"
                                color={
                                  (s.rating_2 ?? 0) >= 1.2
                                    ? "success"
                                    : (s.rating_2 ?? 0) >= 0.9
                                      ? "warning"
                                      : "danger"
                                }
                                className="font-bold"
                              >
                                {s.rating_2?.toFixed(2) ?? "—"}
                              </Chip>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </CardBody>
              </Card>

              {/* Performance Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <LeaderboardCard
                  title="Top Fraggers"
                  icon="solar:target-bold"
                  iconColor="text-danger"
                  players={allPlayersWithStats.slice(0, 3)}
                  valueKey="kills"
                  valueSuffix="K"
                />
                <LeaderboardCard
                  title="Highest ADR"
                  icon="solar:bomb-bold"
                  iconColor="text-warning"
                  players={[...allPlayersWithStats]
                    .sort(
                      (a, b) => (b.stats.adr ?? 0) - (a.stats.adr ?? 0),
                    )
                    .slice(0, 3)}
                  valueKey="adr"
                  valueDecimals={1}
                />
                <LeaderboardCard
                  title="Best K/D Ratio"
                  icon="solar:shield-bold"
                  iconColor="text-primary"
                  players={[...allPlayersWithStats]
                    .sort(
                      (a, b) =>
                        (b.stats.kd_ratio ?? 0) - (a.stats.kd_ratio ?? 0),
                    )
                    .slice(0, 3)}
                  valueKey="kd_ratio"
                  valueDecimals={2}
                />
                <LeaderboardCard
                  title="Headshot %"
                  icon="solar:target-bold"
                  iconColor="text-success"
                  players={[...allPlayersWithStats]
                    .sort(
                      (a, b) =>
                        (b.stats.headshot_pct ?? 0) -
                        (a.stats.headshot_pct ?? 0),
                    )
                    .slice(0, 3)}
                  valueKey="headshot_pct"
                  valueDecimals={1}
                  valueSuffix="%"
                />
              </div>
            </div>
          </Tab>

          {/* ─── DETAILS TAB ─── */}
          <Tab
            key="details"
            title={
              <div className="flex items-center space-x-2">
                <Icon icon="solar:document-text-bold" width={20} />
                <span
                  className={clsx(
                    "font-semibold uppercase tracking-wide",
                    electrolize.className,
                  )}
                >
                  Details
                </span>
              </div>
            }
          >
            <div className="space-y-4 py-4">
              <Card className="border border-default-200">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <Icon
                      icon="solar:info-circle-bold"
                      width={18}
                      className="text-[#FF4654] dark:text-[#DCFF37]"
                    />
                    <h3
                      className={clsx(
                        "font-bold uppercase tracking-wide text-sm",
                        electrolize.className,
                      )}
                    >
                      Match Information
                    </h3>
                  </div>
                </CardHeader>
                <CardBody className="pt-0">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <DetailItem
                      label="Map"
                      value={mapDisplay}
                      icon="solar:map-point-bold"
                    />
                    <DetailItem
                      label="Mode"
                      value={
                        mode
                          ? mode.charAt(0).toUpperCase() + mode.slice(1)
                          : "—"
                      }
                      icon="solar:gamepad-bold"
                    />
                    <DetailItem
                      label="Duration"
                      value={formatDuration(duration, totalRounds)}
                      icon="solar:clock-circle-bold"
                    />
                    <DetailItem
                      label="Total Rounds"
                      value={totalRounds > 0 ? String(totalRounds) : "—"}
                      icon="solar:rewind-forward-bold"
                    />
                    <DetailItem
                      label="Events"
                      value={eventCount > 0 ? String(eventCount) : "—"}
                      icon="solar:bolt-circle-bold"
                    />
                    <DetailItem
                      label="Score"
                      value={
                        team1 && team2
                          ? `${team1.team_score ?? 0} — ${team2.team_score ?? 0}`
                          : "—"
                      }
                      icon="solar:medal-star-bold"
                    />
                  </div>
                </CardBody>
              </Card>

              {serverName && (
                <Card className="border border-default-200">
                  <CardBody className="py-3">
                    <DetailItem
                      label="Server"
                      value={serverName}
                      icon="solar:server-bold"
                    />
                  </CardBody>
                </Card>
              )}

              <Card className="border border-default-200">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <Icon
                      icon="solar:file-bold"
                      width={18}
                      className="text-[#FF4654] dark:text-[#DCFF37]"
                    />
                    <h3
                      className={clsx(
                        "font-bold uppercase tracking-wide text-sm",
                        electrolize.className,
                      )}
                    >
                      File Information
                    </h3>
                  </div>
                </CardHeader>
                <CardBody className="pt-0">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <DetailItem
                      label="Replay ID"
                      value={stateReplay?.id || "—"}
                      icon="solar:hashtag-bold"
                      mono
                    />
                    <DetailItem
                      label="Match ID"
                      value={
                        state.replayScoreboard?.match_id ||
                        state.match?.id ||
                        "—"
                      }
                      icon="solar:hashtag-bold"
                      mono
                    />
                    <DetailItem
                      label="Game"
                      value={(gameId || "CS2").toUpperCase()}
                      icon="simple-icons:counterstrike"
                    />
                    <DetailItem
                      label="Network"
                      value={(
                        stateReplay?.network_id ||
                        stateReplay?.networkId ||
                        "steam"
                      ).toUpperCase()}
                      icon="solar:global-bold"
                    />
                    <DetailItem
                      label="File Size"
                      value={formatFileSize(stateReplay?.size)}
                      icon="solar:folder-bold"
                    />
                    <DetailItem
                      label="Uploaded"
                      value={formatDate(state.replay?.created_at)}
                      icon="solar:calendar-bold"
                    />
                    <DetailItem
                      label="Status"
                      value={stateReplay?.status || "—"}
                      icon="solar:check-circle-bold"
                    />
                  </div>
                </CardBody>
              </Card>
            </div>
          </Tab>
        </Tabs>
      )}

      {/* ════════════════════════════════════════════
          NON-READY STATE
          ════════════════════════════════════════════ */}
      {!isReady && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="border border-default-200">
              <CardBody className="text-center py-16">
                <Icon
                  icon="solar:videocamera-record-bold-duotone"
                  width={80}
                  className="mx-auto mb-4 text-default-300"
                />
                <p
                  className={clsx(
                    "text-lg font-bold mb-2 uppercase",
                    electrolize.className,
                  )}
                >
                  {state.processingStatus === "Failed"
                    ? "Processing Failed"
                    : "Processing In Progress"}
                </p>
                <p className="text-sm text-default-500 max-w-md mx-auto">
                  {state.processingStatus === "Failed"
                    ? "There was an error processing your replay. Please try uploading again."
                    : "Your replay is being analyzed. Statistics, scoreboards, and player performance data will be available shortly."}
                </p>
                {state.processingStatus === "Failed" && (
                  <EsportsButton
                    variant="primary"
                    onClick={() => router.push("/upload")}
                    className="mt-6"
                  >
                    Upload New Replay
                  </EsportsButton>
                )}
              </CardBody>
            </Card>
          </div>
          <div>
            <Card className="border border-default-200">
              <CardHeader>
                <h3
                  className={clsx(
                    "font-bold uppercase text-sm",
                    electrolize.className,
                  )}
                >
                  File Info
                </h3>
              </CardHeader>
              <CardBody className="space-y-3 pt-0">
                <InfoRow
                  label="Game"
                  value={
                    <Chip size="sm" variant="flat" color="primary">
                      {(gameId || "CS2").toUpperCase()}
                    </Chip>
                  }
                />
                <InfoRow
                  label="Size"
                  value={formatFileSize(state.replay?.size)}
                />
                <InfoRow
                  label="Uploaded"
                  value={formatDate(state.replay?.created_at)}
                />
                <InfoRow
                  label="Status"
                  value={
                    <Chip size="sm" color={status.color} variant="flat">
                      {status.label}
                    </Chip>
                  }
                />
              </CardBody>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: string;
  label: string;
  value: string | number;
  color: string;
}) {
  return (
    <div className="text-center p-4 bg-gradient-to-br from-background/80 to-background/60 rounded-none border border-[#FF4654]/20 dark:border-[#DCFF37]/20">
      <Icon
        icon={icon}
        width={20}
        className="mx-auto mb-1"
        style={{ color }}
      />
      <div
        className={clsx("text-2xl font-black", electrolize.className)}
        style={{ color }}
      >
        {value}
      </div>
      <div className="text-xs text-default-500 uppercase tracking-wide">
        {label}
      </div>
    </div>
  );
}

function DetailItem({
  label,
  value,
  icon,
  mono,
}: {
  label: string;
  value: string;
  icon: string;
  mono?: boolean;
}) {
  return (
    <div>
      <div className="flex items-center gap-1.5 mb-0.5">
        <Icon icon={icon} width={14} className="text-default-400" />
        <span className="text-xs text-default-500 uppercase tracking-wide">
          {label}
        </span>
      </div>
      <p
        className={clsx(
          "font-semibold text-sm",
          mono && "font-mono text-xs break-all",
        )}
      >
        {value}
      </p>
    </div>
  );
}

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-default-500 text-sm">{label}</span>
      <span className="font-medium text-sm">{value}</span>
    </div>
  );
}

function LeaderboardCard({
  title,
  icon,
  iconColor,
  players,
  valueKey,
  valueDecimals,
  valueSuffix,
}: {
  title: string;
  icon: string;
  iconColor: string;
  players: Array<{
    name: string;
    side: string;
    stats: PlayerStatsEntry;
  }>;
  valueKey: keyof PlayerStatsEntry;
  valueDecimals?: number;
  valueSuffix?: string;
}) {
  return (
    <Card className="border border-[#FF4654]/20 dark:border-[#DCFF37]/20">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <Icon icon={icon} width={18} className={iconColor} />
          <h3
            className={clsx(
              "font-bold uppercase tracking-wide text-sm",
              electrolize.className,
            )}
          >
            {title}
          </h3>
        </div>
      </CardHeader>
      <CardBody className="pt-0 space-y-2">
        {players.map((p, i) => {
          const raw = p.stats[valueKey] as number | undefined;
          const display =
            valueDecimals !== undefined
              ? (raw ?? 0).toFixed(valueDecimals)
              : String(raw ?? 0);
          return (
            <div
              key={i}
              className="flex items-center justify-between p-2 rounded bg-default-50 dark:bg-default-100/10"
            >
              <div className="flex items-center gap-2">
                <span
                  className={clsx(
                    "font-black text-lg w-6 text-center",
                    i === 0 ? "text-[#FFB800]" : "text-default-400",
                    electrolize.className,
                  )}
                >
                  {i + 1}
                </span>
                <span className="font-semibold">{p.name}</span>
                <Chip
                  size="sm"
                  variant="flat"
                  className={clsx(
                    "h-4 text-[10px]",
                    p.side === "CT"
                      ? "bg-[#00A8FF]/20 text-[#00A8FF]"
                      : "bg-[#FFB800]/20 text-[#FFB800]",
                  )}
                >
                  {p.side}
                </Chip>
              </div>
              <span
                className={clsx(
                  "font-bold text-lg",
                  i === 0 ? "text-success" : "text-warning",
                )}
              >
                {display}
                {valueSuffix || ""}
              </span>
            </div>
          );
        })}
      </CardBody>
    </Card>
  );
}

function TeamScoreboardCard({
  teamScoreboard,
  teamIndex,
}: {
  teamScoreboard: TeamScoreboard;
  teamIndex: number;
}) {
  const side = teamScoreboard.side || (teamIndex === 0 ? "CT" : "T");
  const isCT = side === "CT";

  return (
    <Card
      className={clsx(
        "bg-gradient-to-br from-background/80 to-background/60 backdrop-blur-xl border",
        isCT ? "border-[#00A8FF]/30" : "border-[#FFB800]/30",
      )}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-3">
            <div
              className={clsx(
                "w-10 h-10 rounded-none flex items-center justify-center font-black text-lg",
                isCT
                  ? "bg-[#00A8FF]/20 text-[#00A8FF] border border-[#00A8FF]/30"
                  : "bg-[#FFB800]/20 text-[#FFB800] border border-[#FFB800]/30",
                electrolize.className,
              )}
            >
              {side}
            </div>
            <div>
              <h3
                className={clsx(
                  "text-lg font-bold uppercase tracking-wide",
                  electrolize.className,
                )}
              >
                {teamScoreboard.team?.name ||
                  side ||
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
              isCT ? "text-[#00A8FF]" : "text-[#FFB800]",
              electrolize.className,
            )}
          >
            {teamScoreboard.team_score ?? 0}
          </div>
        </div>
      </CardHeader>
      <CardBody className="pt-0 overflow-x-auto">
        <Table
          aria-label={`${side} scoreboard`}
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
          <TableBody emptyContent="No player data">
            {(teamScoreboard.players ?? []).map((player, playerIndex) => {
              const stats = getPlayerStatsByIndex(
                teamScoreboard,
                playerIndex,
              );
              const kills = stats?.kills ?? 0;
              const deaths = stats?.deaths ?? 0;
              const assists = stats?.assists ?? 0;
              const kdDiff = kills - deaths;
              const adr = stats?.adr ?? 0;
              const mvps = stats?.mvp_count ?? 0;
              const headshotPct = stats?.headshot_pct ?? 0;
              const rating2 = stats?.rating_2 ?? 0;
              const openingKills = stats?.opening_kills ?? 0;
              const openingDeaths = stats?.opening_deaths ?? 0;
              const tradeKills = stats?.trade_kills ?? 0;
              const clutchWins = stats?.clutch_wins ?? 0;
              const clutchAttempts = stats?.clutch_attempts ?? 0;
              const flashAssists = stats?.flash_assists ?? 0;
              const kast = stats?.kast ?? 0;

              return (
                <TableRow key={playerIndex}>
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
                          base: isCT
                            ? "bg-[#00A8FF]/20"
                            : "bg-[#FFB800]/20",
                        }}
                      />
                      <div className="min-w-0">
                        <div className="font-semibold truncate max-w-[120px]">
                          {player.name ||
                            player.current_name ||
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
                              content={`${clutchWins}/${clutchAttempts} Clutches`}
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
                    <span className="font-bold text-success">{kills}</span>
                  </TableCell>
                  <TableCell>
                    <span className="font-bold text-danger">{deaths}</span>
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
                        {adr.toFixed(1)}
                      </span>
                    </Tooltip>
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
                        : "—"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Tooltip
                      content={`First Kills: ${openingKills} | First Deaths: ${openingDeaths}`}
                    >
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
                          : "—"}
                      </span>
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
                        {kast > 0 ? `${kast}%` : "—"}
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
                        {rating2 > 0 ? rating2.toFixed(2) : "—"}
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
                      <span className="text-default-400">—</span>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardBody>
    </Card>
  );
}

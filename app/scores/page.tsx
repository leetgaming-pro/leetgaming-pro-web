"use client";

/**
 * Match Results & Scores Page — LeetGaming.PRO
 *
 * Browse, filter, and manage official match results across tournaments,
 * matchmaking, and replay-sourced scores. This page is the central hub
 * for all competitive result tracking on the platform.
 *
 * Permissions:
 * - Browsing/viewing: Public (no auth required)
 * - Submit Result: Tournament organizer or platform admin
 * - Admin actions: Handled on the detail page
 */

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useOptionalAuth } from "@/hooks/use-auth";
import {
  Card,
  CardHeader,
  CardBody,
  Chip,
  Tabs,
  Tab,
  Divider,
  Tooltip,
  Select,
  SelectItem,
  Input,
  Pagination,
  Skeleton,
} from "@nextui-org/react";
import { Icon } from "@iconify/react";
import { logger } from "@/lib/logger";
import { useSDK } from "@/contexts/sdk-context";
import { PageContainer, Section } from "@/components/layout/page-container";
import { PageLoadingState } from "@/components/ui/loading-states";
import { EmptyState, ErrorState } from "@/components/ui/empty-states";
import { EsportsButton } from "@/components/ui/esports-button";
import clsx from "clsx";
import { electrolize } from "@/config/fonts";
import type {
  MatchResult,
  ResultStatus,
  MatchResultFilters,
} from "@/types/replay-api/scores.types";
import {
  STATUS_COLORS,
  STATUS_LABELS,
  SOURCE_LABELS,
  SOURCE_ICONS,
} from "@/types/replay-api/scores.types";

// --- Constants ---
const PAGE_SIZE = 24;

const STATUS_TABS: {
  key: string;
  label: string;
  icon: string;
  statuses?: ResultStatus[];
  description: string;
}[] = [
  {
    key: "all",
    label: "All Results",
    icon: "solar:list-bold-duotone",
    description: "All match results across the platform",
  },
  {
    key: "active",
    label: "Active",
    icon: "solar:play-circle-bold-duotone",
    statuses: ["submitted", "under_review", "verified"],
    description: "Pending verification or awaiting dispute window",
  },
  {
    key: "disputed",
    label: "Disputed",
    icon: "solar:danger-triangle-bold-duotone",
    statuses: ["disputed", "conciliated"],
    description: "Results under dispute or recently resolved",
  },
  {
    key: "finalized",
    label: "Finalized",
    icon: "solar:check-circle-bold-duotone",
    statuses: ["finalized"],
    description: "Official results — prizes distributed",
  },
  {
    key: "cancelled",
    label: "Cancelled",
    icon: "solar:close-circle-bold-duotone",
    statuses: ["cancelled"],
    description: "Voided or cancelled results",
  },
];

const GAME_OPTIONS = [
  { key: "cs2", label: "CS2" },
  { key: "valorant", label: "VALORANT" },
  { key: "dota2", label: "Dota 2" },
  { key: "lol", label: "League of Legends" },
];

// --- Result Card Component ---
function MatchResultCard({
  result,
  onClick,
}: {
  result: MatchResult;
  onClick: () => void;
}) {
  const team1 = result.team_results?.[0];
  const team2 = result.team_results?.[1];
  const team1Wins = team1 && team2 && team1.score > team2.score;
  const team2Wins = team2 && team1 && team2.score > team1.score;

  return (
    <Card
      isPressable
      onPress={onClick}
      className="bg-content1/80 backdrop-blur-sm border border-default-200/50 hover:border-[#DCFF37]/40 transition-all duration-300 group"
      style={{
        clipPath:
          "polygon(0 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%)",
      }}
    >
      <CardHeader className="flex justify-between items-start gap-2 pb-1">
        <div className="flex items-center gap-2">
          <Icon
            icon={SOURCE_ICONS[result.source] || "solar:document-bold-duotone"}
            width={18}
            className="text-default-500"
          />
          <span className="text-xs text-default-500 uppercase tracking-wider">
            {SOURCE_LABELS[result.source] || result.source}
          </span>
          {result.tournament_id && (
            <Tooltip content="Tournament Match">
              <Chip
                size="sm"
                variant="dot"
                color="warning"
                classNames={{ base: "h-5", content: "text-[10px] px-1" }}
              >
                Tournament
              </Chip>
            </Tooltip>
          )}
        </div>
        <Chip
          size="sm"
          variant="flat"
          color={STATUS_COLORS[result.status] || "default"}
          classNames={{ base: "h-6", content: "text-xs font-semibold px-2" }}
        >
          {STATUS_LABELS[result.status] || result.status}
        </Chip>
      </CardHeader>
      <CardBody className="pt-1">
        {/* Score Display */}
        <div className="flex items-center justify-center gap-4 py-3">
          {/* Team 1 */}
          <div className="flex-1 text-right">
            <p
              className={clsx(
                "text-sm font-medium truncate",
                electrolize.className,
                team1Wins ? "text-foreground" : "text-default-500",
              )}
            >
              {team1?.team_name || "Team 1"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={clsx(
                "text-2xl font-bold tabular-nums",
                electrolize.className,
                team1Wins ? "text-[#DCFF37]" : "text-default-500",
              )}
            >
              {team1?.score ?? "-"}
            </span>
            <span className="text-default-300 text-lg select-none">:</span>
            <span
              className={clsx(
                "text-2xl font-bold tabular-nums",
                electrolize.className,
                team2Wins ? "text-[#DCFF37]" : "text-default-500",
              )}
            >
              {team2?.score ?? "-"}
            </span>
          </div>
          {/* Team 2 */}
          <div className="flex-1 text-left">
            <p
              className={clsx(
                "text-sm font-medium truncate",
                electrolize.className,
                team2Wins ? "text-foreground" : "text-default-500",
              )}
            >
              {team2?.team_name || "Team 2"}
            </p>
          </div>
        </div>

        {/* Meta Info Row */}
        <Divider className="my-2" />
        <div className="flex items-center justify-between text-xs text-default-400 mt-1">
          <div className="flex items-center gap-3">
            <Tooltip content="Game">
              <span className="flex items-center gap-1">
                <Icon icon="solar:gamepad-bold-duotone" width={14} />
                {result.game_id?.toUpperCase() || "—"}
              </span>
            </Tooltip>
            {result.map_name && (
              <Tooltip content="Map">
                <span className="flex items-center gap-1">
                  <Icon icon="solar:map-bold-duotone" width={14} />
                  {result.map_name}
                </span>
              </Tooltip>
            )}
            {result.rounds_played > 0 && (
              <span className="flex items-center gap-1">
                <Icon icon="solar:refresh-circle-bold-duotone" width={14} />
                {result.rounds_played} rds
              </span>
            )}
          </div>
          <span className="text-default-400">
            {result.played_at
              ? new Date(result.played_at).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "—"}
          </span>
        </div>

        {/* Badges Row */}
        <div className="mt-2 flex items-center gap-2 flex-wrap">
          {result.is_draw && (
            <Chip
              size="sm"
              variant="bordered"
              color="warning"
              startContent={<Icon icon="solar:equal-bold" width={12} />}
            >
              Draw
            </Chip>
          )}
          {result.dispute_count > 0 && (
            <Chip
              size="sm"
              variant="flat"
              color="warning"
              startContent={
                <Icon
                  icon="solar:danger-triangle-bold-duotone"
                  width={12}
                />
              }
            >
              {result.dispute_count} dispute
              {result.dispute_count > 1 ? "s" : ""}
            </Chip>
          )}
          {result.prize_distribution_id && (
            <Chip
              size="sm"
              variant="flat"
              color="success"
              startContent={
                <Icon icon="solar:wallet-money-bold-duotone" width={12} />
              }
            >
              Prize Pool
            </Chip>
          )}
        </div>
      </CardBody>
    </Card>
  );
}

// --- Stats Summary Bar ---
function StatsSummaryBar({
  results,
  total,
}: {
  results: MatchResult[];
  total: number;
}) {
  const counts = useMemo(
    () => ({
      total,
      finalized: results.filter((r) => r.status === "finalized").length,
      disputed: results.filter((r) => r.status === "disputed").length,
      pending: results.filter(
        (r) => r.status === "submitted" || r.status === "under_review",
      ).length,
    }),
    [results, total],
  );

  const stats = [
    {
      label: "Total",
      value: counts.total,
      icon: "solar:chart-2-bold-duotone",
      color: "text-[#DCFF37]",
    },
    {
      label: "Finalized",
      value: counts.finalized,
      icon: "solar:check-circle-bold-duotone",
      color: "text-success",
    },
    {
      label: "Disputed",
      value: counts.disputed,
      icon: "solar:danger-triangle-bold-duotone",
      color: "text-warning",
    },
    {
      label: "Pending",
      value: counts.pending,
      icon: "solar:clock-circle-bold-duotone",
      color: "text-primary",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {stats.map((stat) => (
        <Card
          key={stat.label}
          className="bg-content1/60 backdrop-blur-sm border border-default-200/30"
          style={{
            clipPath:
              "polygon(0 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%)",
          }}
        >
          <CardBody className="flex flex-row items-center gap-3 py-3 px-4">
            <Icon icon={stat.icon} width={24} className={stat.color} />
            <div>
              <p
                className={clsx(
                  "text-xl font-bold",
                  electrolize.className,
                  stat.color,
                )}
              >
                {stat.value}
              </p>
              <p className="text-xs text-default-400 uppercase tracking-wider">
                {stat.label}
              </p>
            </div>
          </CardBody>
        </Card>
      ))}
    </div>
  );
}

// --- Loading Skeleton ---
function ResultCardSkeleton() {
  return (
    <Card className="bg-content1/60 border border-default-200/30">
      <CardBody className="space-y-3 p-4">
        <div className="flex justify-between">
          <Skeleton className="h-4 w-24 rounded" />
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
        <div className="flex items-center justify-center gap-4 py-3">
          <Skeleton className="h-4 w-20 rounded" />
          <Skeleton className="h-8 w-16 rounded" />
          <Skeleton className="h-4 w-20 rounded" />
        </div>
        <Skeleton className="h-px w-full" />
        <div className="flex justify-between">
          <Skeleton className="h-3 w-32 rounded" />
          <Skeleton className="h-3 w-20 rounded" />
        </div>
      </CardBody>
    </Card>
  );
}

// --- Main Page ---
export default function ScoresPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useOptionalAuth();
  const { sdk, isReady } = useSDK();
  const [selectedTab, setSelectedTab] = useState<string>("all");
  const [results, setResults] = useState<MatchResult[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [gameFilter, setGameFilter] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [page, setPage] = useState(1);

  // Determine if user can submit scores (admin or tournament organizer)
  const canSubmitScores = useMemo(() => {
    if (!isAuthenticated || !user) return false;
    // Platform admin can always submit; other authenticated users
    // will be validated at backend level (tournament organizer check)
    return true;
  }, [isAuthenticated, user]);

  const fetchResults = useCallback(
    async (filters: MatchResultFilters = {}) => {
      if (!isReady) return;
      setLoading(true);
      setError(null);

      try {
        // Build filters from current tab
        const tabConfig = STATUS_TABS.find((t) => t.key === selectedTab);
        const statusFilter =
          tabConfig?.statuses?.length === 1 ? tabConfig.statuses[0] : undefined;

        const response = await sdk.scores.listMatchResults({
          ...filters,
          status: statusFilter,
          game_id: gameFilter || undefined,
          limit: PAGE_SIZE,
          offset: (page - 1) * PAGE_SIZE,
        });

        if (response?.match_results) {
          setResults(response.match_results);
          setTotalCount(response.total || response.match_results.length);
        } else {
          setResults([]);
          setTotalCount(0);
        }
      } catch (err) {
        logger.error("[ScoresPage] Failed to fetch match results", err);
        setError("Failed to load match results. Please try again.");
      } finally {
        setLoading(false);
      }
    },
    [sdk, isReady, selectedTab, gameFilter, page],
  );

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [selectedTab, gameFilter]);

  // Client-side filter for multi-status tabs and search
  const filteredResults = useMemo(() => {
    let filtered = results;

    const tabConfig = STATUS_TABS.find((t) => t.key === selectedTab);
    if (tabConfig?.statuses && tabConfig.statuses.length > 1) {
      filtered = filtered.filter((r) => tabConfig.statuses!.includes(r.status));
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.team_results?.some((t) =>
            t.team_name?.toLowerCase().includes(q),
          ) ||
          r.map_name?.toLowerCase().includes(q) ||
          r.match_id?.toLowerCase().includes(q),
      );
    }

    return filtered;
  }, [results, selectedTab, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  // Loading state (initial load)
  if (loading && results.length === 0 && page === 1) {
    return (
      <PageLoadingState
        title="Loading Match Results"
        subtitle="Fetching scores and official results..."
      />
    );
  }

  // Error state
  if (error && results.length === 0) {
    return (
      <ErrorState
        title="Error Loading Results"
        message={error}
        onRetry={() => fetchResults()}
      />
    );
  }

  return (
    <PageContainer maxWidth="7xl" animate animationVariant="slideUp">
      {/* Page Header */}
      <Section className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1
              className={clsx(
                "text-3xl font-bold text-foreground",
                electrolize.className,
              )}
            >
              <Icon
                icon="solar:ranking-bold-duotone"
                width={32}
                className="inline-block mr-2 text-[#DCFF37]"
              />
              Match Results
            </h1>
            <p className="text-default-500 mt-1">
              Official scores, verification status, and prize distribution
              tracking
            </p>
          </div>
          {canSubmitScores && (
            <EsportsButton
              onClick={() => router.push("/scores/submit")}
              startContent={
                <Icon icon="solar:add-circle-bold-duotone" width={18} />
              }
            >
              Submit Result
            </EsportsButton>
          )}
        </div>
      </Section>

      {/* Stats Summary */}
      {(results.length > 0 || totalCount > 0) && (
        <Section className="mb-6">
          <StatsSummaryBar results={results} total={totalCount} />
        </Section>
      )}

      {/* Filters & Tabs */}
      <Section className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <Tabs
            selectedKey={selectedTab}
            onSelectionChange={(key) => setSelectedTab(key as string)}
            variant="underlined"
            color="danger"
            classNames={{
              tabList:
                "gap-4 w-full relative rounded-none p-0 border-b border-divider flex-wrap",
              cursor: "w-full bg-[#FF4654] dark:bg-[#DCFF37]",
              tab: "max-w-fit px-0 h-12",
              tabContent:
                "group-data-[selected=true]:text-[#FF4654] dark:group-data-[selected=true]:text-[#DCFF37]",
            }}
          >
            {STATUS_TABS.map((tab) => (
              <Tab
                key={tab.key}
                title={
                  <Tooltip content={tab.description}>
                    <div className="flex items-center gap-2">
                      <Icon icon={tab.icon} width={16} />
                      <span className={electrolize.className}>
                        {tab.label}
                      </span>
                    </div>
                  </Tooltip>
                }
              />
            ))}
          </Tabs>
        </div>

        {/* Search & Game Filter */}
        <div className="flex flex-col sm:flex-row gap-3 mt-4">
          <Input
            placeholder="Search by team, map, or match ID..."
            value={searchQuery}
            onValueChange={setSearchQuery}
            startContent={
              <Icon
                icon="solar:magnifer-bold-duotone"
                width={16}
                className="text-default-400"
              />
            }
            size="sm"
            variant="bordered"
            classNames={{ inputWrapper: "border-default-200/50" }}
            className="flex-1 max-w-md"
            isClearable
            onClear={() => setSearchQuery("")}
          />
          <Select
            placeholder="All Games"
            size="sm"
            variant="bordered"
            className="max-w-[160px]"
            selectedKeys={gameFilter ? [gameFilter] : []}
            onSelectionChange={(keys) => {
              const selected = Array.from(keys)[0] as string;
              setGameFilter(selected || "");
            }}
          >
            {GAME_OPTIONS.map((game) => (
              <SelectItem key={game.key}>{game.label}</SelectItem>
            ))}
          </Select>
        </div>
      </Section>

      {/* Results Grid */}
      <Section>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <ResultCardSkeleton key={i} />
            ))}
          </div>
        ) : filteredResults.length === 0 ? (
          <EmptyState
            icon="solar:ranking-bold-duotone"
            title="No Match Results Found"
            description={
              selectedTab !== "all"
                ? "No results match the selected filter. Try another status tab."
                : searchQuery
                  ? `No results matching "${searchQuery}". Try a different search.`
                  : "No match results yet. Results are created when replays are processed or tournament admins submit scores."
            }
            variant="match"
          />
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredResults.map((result) => (
                <MatchResultCard
                  key={result.id}
                  result={result}
                  onClick={() => router.push(`/scores/${result.id}`)}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-8">
                <Pagination
                  total={totalPages}
                  page={page}
                  onChange={setPage}
                  showControls
                  classNames={{
                    cursor:
                      "bg-[#FF4654] dark:bg-[#DCFF37] text-white dark:text-black",
                  }}
                />
              </div>
            )}
          </>
        )}
      </Section>
    </PageContainer>
  );
}

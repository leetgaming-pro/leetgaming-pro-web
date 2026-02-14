"use client";

/**
 * Match Results Page
 * Browse, filter and manage match results and scores
 * Supports replay file results, tournament admin submissions, and consensus
 */

import React, { useState, useEffect, useCallback } from "react";
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

// --- Status filter tabs ---
const STATUS_TABS: { key: string; label: string; icon: string; statuses?: ResultStatus[] }[] = [
  { key: "all", label: "All Results", icon: "solar:list-bold-duotone" },
  { key: "active", label: "Active", icon: "solar:play-circle-bold-duotone", statuses: ["submitted", "under_review", "verified"] },
  { key: "disputed", label: "Disputed", icon: "solar:danger-triangle-bold-duotone", statuses: ["disputed", "conciliated"] },
  { key: "finalized", label: "Finalized", icon: "solar:check-circle-bold-duotone", statuses: ["finalized"] },
  { key: "cancelled", label: "Cancelled", icon: "solar:close-circle-bold-duotone", statuses: ["cancelled"] },
];

// --- Result Card Component ---
function MatchResultCard({ result, onClick }: { result: MatchResult; onClick: () => void }) {
  const team1 = result.team_results?.[0];
  const team2 = result.team_results?.[1];

  return (
    <Card
      isPressable
      onPress={onClick}
      className="bg-content1/80 backdrop-blur-sm border border-default-200/50 hover:border-[#DCFF37]/30 dark:hover:border-[#DCFF37]/30 transition-all duration-300 group"
      style={{
        clipPath: "polygon(0 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%)",
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
            <p className={clsx("text-sm font-medium text-default-700 truncate", electrolize.className)}>
              {team1?.team_name || "Team 1"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={clsx(
                "text-2xl font-bold tabular-nums",
                electrolize.className,
                team1 && team2 && team1.score > team2.score
                  ? "text-[#DCFF37] dark:text-[#DCFF37]"
                  : "text-default-500"
              )}
            >
              {team1?.score ?? "-"}
            </span>
            <span className="text-default-400 text-lg">:</span>
            <span
              className={clsx(
                "text-2xl font-bold tabular-nums",
                electrolize.className,
                team2 && team1 && team2.score > team1.score
                  ? "text-[#DCFF37] dark:text-[#DCFF37]"
                  : "text-default-500"
              )}
            >
              {team2?.score ?? "-"}
            </span>
          </div>
          {/* Team 2 */}
          <div className="flex-1 text-left">
            <p className={clsx("text-sm font-medium text-default-700 truncate", electrolize.className)}>
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

        {/* Draw Badge */}
        {result.is_draw && (
          <div className="mt-2 flex justify-center">
            <Chip size="sm" variant="bordered" color="warning" startContent={<Icon icon="solar:equal-bold" width={12} />}>
              Draw
            </Chip>
          </div>
        )}

        {/* Dispute indicator */}
        {result.dispute_count > 0 && (
          <div className="mt-2 flex items-center gap-1 text-warning text-xs">
            <Icon icon="solar:danger-triangle-bold-duotone" width={14} />
            <span>{result.dispute_count} dispute{result.dispute_count > 1 ? "s" : ""}</span>
          </div>
        )}
      </CardBody>
    </Card>
  );
}

// --- Stats Summary Bar ---
function StatsSummaryBar({ results }: { results: MatchResult[] }) {
  const counts = {
    total: results.length,
    finalized: results.filter((r) => r.status === "finalized").length,
    disputed: results.filter((r) => r.status === "disputed").length,
    pending: results.filter((r) => ["submitted", "under_review"].includes(r.status)).length,
  };

  const stats = [
    { label: "Total", value: counts.total, icon: "solar:chart-2-bold-duotone", color: "text-[#DCFF37]" },
    { label: "Finalized", value: counts.finalized, icon: "solar:check-circle-bold-duotone", color: "text-success" },
    { label: "Disputed", value: counts.disputed, icon: "solar:danger-triangle-bold-duotone", color: "text-warning" },
    { label: "Pending", value: counts.pending, icon: "solar:clock-circle-bold-duotone", color: "text-primary" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {stats.map((stat) => (
        <Card
          key={stat.label}
          className="bg-content1/60 backdrop-blur-sm border border-default-200/30"
          style={{ clipPath: "polygon(0 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%)" }}
        >
          <CardBody className="flex flex-row items-center gap-3 py-3 px-4">
            <Icon icon={stat.icon} width={24} className={stat.color} />
            <div>
              <p className={clsx("text-xl font-bold", electrolize.className, stat.color)}>{stat.value}</p>
              <p className="text-xs text-default-400 uppercase tracking-wider">{stat.label}</p>
            </div>
          </CardBody>
        </Card>
      ))}
    </div>
  );
}

// --- Main Page ---
export default function ScoresPage() {
  const router = useRouter();
  const { isAuthenticated } = useOptionalAuth();
  const { sdk, isReady } = useSDK();
  const [selectedTab, setSelectedTab] = useState<string>("all");
  const [results, setResults] = useState<MatchResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [gameFilter, setGameFilter] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const fetchResults = useCallback(
    async (filters: MatchResultFilters = {}) => {
      if (!isReady) return;
      setLoading(true);
      setError(null);

      try {
        const response = await sdk.scores.listMatchResults({
          ...filters,
          limit: 50,
        });

        if (response?.match_results) {
          setResults(response.match_results);
        } else {
          setResults([]);
        }
      } catch (err) {
        logger.error("[ScoresPage] Failed to fetch match results", err);
        setError("Failed to load match results. Please try again.");
      } finally {
        setLoading(false);
      }
    },
    [sdk, isReady]
  );

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  // Filter results by selected tab
  const filteredResults = results.filter((r) => {
    const tabConfig = STATUS_TABS.find((t) => t.key === selectedTab);
    if (tabConfig?.statuses && !tabConfig.statuses.includes(r.status)) return false;
    if (gameFilter && r.game_id !== gameFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        r.team_results?.some((t) => t.team_name?.toLowerCase().includes(q)) ||
        r.map_name?.toLowerCase().includes(q) ||
        r.match_id?.toLowerCase().includes(q);
      if (!matchesSearch) return false;
    }
    return true;
  });

  // Loading state
  if (loading && results.length === 0) {
    return <PageLoadingState title="Loading Match Results" subtitle="Fetching scores and verdicts..." />;
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
            <h1 className={clsx("text-3xl font-bold text-foreground", electrolize.className)}>
              <Icon icon="solar:ranking-bold-duotone" width={32} className="inline-block mr-2 text-[#DCFF37]" />
              Match Results
            </h1>
            <p className="text-default-500 mt-1">
              View scores, dispute results, and track prize distribution status
            </p>
          </div>
          {isAuthenticated && (
            <EsportsButton
              onClick={() => router.push("/scores/submit")}
              startContent={<Icon icon="solar:add-circle-bold-duotone" width={18} />}
            >
              Submit Result
            </EsportsButton>
          )}
        </div>
      </Section>

      {/* Stats Summary */}
      {results.length > 0 && (
        <Section className="mb-6">
          <StatsSummaryBar results={results} />
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
              tabList: "gap-4 w-full relative rounded-none p-0 border-b border-divider flex-wrap",
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
                  <div className="flex items-center gap-2">
                    <Icon icon={tab.icon} width={16} />
                    <span className={electrolize.className}>{tab.label}</span>
                  </div>
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
            startContent={<Icon icon="solar:magnifer-bold-duotone" width={16} className="text-default-400" />}
            size="sm"
            variant="bordered"
            classNames={{ inputWrapper: "border-default-200/50" }}
            className="flex-1 max-w-md"
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
            <SelectItem key="cs2">CS2</SelectItem>
            <SelectItem key="valorant">VALORANT</SelectItem>
            <SelectItem key="dota2">Dota 2</SelectItem>
            <SelectItem key="lol">League of Legends</SelectItem>
          </Select>
        </div>
      </Section>

      {/* Results Grid */}
      <Section>
        {filteredResults.length === 0 ? (
          <EmptyState
            icon="solar:ranking-bold-duotone"
            title="No Match Results Found"
            description={
              selectedTab !== "all"
                ? "No results match the selected filter. Try another status tab."
                : "No match results yet. Results are created when replays are processed or admins submit scores."
            }
            variant="match"
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredResults.map((result) => (
              <MatchResultCard
                key={result.id}
                result={result}
                onClick={() => router.push(`/scores/${result.id}`)}
              />
            ))}
          </div>
        )}
      </Section>
    </PageContainer>
  );
}

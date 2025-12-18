/**
 * Analytics Dashboard Component
 * Real-time player stats and performance tracking
 * Per PRD D.6 - Player Analytics & Performance Tracking
 */

"use client";

import React, { useState } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Select,
  SelectItem,
  Avatar,
  Chip,
  Progress,
  Tabs,
  Tab,
  Skeleton,
  Button,
  Tooltip,
} from "@nextui-org/react";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import type {
  PlayerAnalytics,
  AnalyticsPeriod,
  StatValue,
  MatchHistoryEntry,
} from "@/types/analytics";
import {
  formatRating,
  formatPercentage,
  formatKDRatio,
  getTrendColor,
  getTrendIcon,
  getRankTier,
  getPeriodLabel,
} from "@/types/analytics";
import { GAME_CONFIGS } from "@/config/games";

interface AnalyticsDashboardProps {
  analytics: PlayerAnalytics | null;
  isLoading?: boolean;
  onPeriodChange?: (period: AnalyticsPeriod) => void;
  onRefresh?: () => void;
}

const PERIODS: AnalyticsPeriod[] = ["24h", "7d", "30d", "90d", "all"];

export function AnalyticsDashboard({
  analytics,
  isLoading = false,
  onPeriodChange,
  onRefresh,
}: AnalyticsDashboardProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<AnalyticsPeriod>("30d");
  const [selectedTab, setSelectedTab] = useState("overview");

  const gameConfig = analytics ? GAME_CONFIGS[analytics.gameId] : null;
  const rankInfo = analytics ? getRankTier(analytics.skillRating.rating) : null;

  const handlePeriodChange = (period: AnalyticsPeriod) => {
    setSelectedPeriod(period);
    onPeriodChange?.(period);
  };

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (!analytics) {
    return (
      <Card className="p-8">
        <CardBody className="flex flex-col items-center text-center">
          <Icon
            icon="solar:chart-2-bold-duotone"
            className="w-16 h-16 text-default-300 mb-4"
          />
          <h3 className="text-lg font-semibold mb-2">No Analytics Available</h3>
          <p className="text-default-500">
            Play some matches to start tracking your performance
          </p>
        </CardBody>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <Avatar
            src={analytics.avatar}
            name={analytics.playerName}
            size="lg"
            radius="sm"
          />
          <div>
            <h1 className="text-2xl font-bold">{analytics.playerName}</h1>
            <div className="flex items-center gap-2">
              {gameConfig && (
                <Chip
                  size="sm"
                  variant="flat"
                  startContent={
                    <Avatar
                      src={gameConfig.icon}
                      alt={gameConfig.name}
                      size="sm"
                      className="w-4 h-4"
                    />
                  }
                >
                  {gameConfig.name}
                </Chip>
              )}
              {rankInfo && (
                <Chip
                  size="sm"
                  variant="flat"
                  style={{ color: rankInfo.color }}
                  startContent={
                    <Icon icon={rankInfo.icon} className="w-3 h-3" />
                  }
                >
                  {rankInfo.name}
                </Chip>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Select
            aria-label="Time period"
            selectedKeys={[selectedPeriod]}
            onChange={(e) =>
              handlePeriodChange(e.target.value as AnalyticsPeriod)
            }
            className="w-40"
            size="sm"
            classNames={{ trigger: "rounded-none" }}
          >
            {PERIODS.map((period) => (
              <SelectItem key={period} textValue={getPeriodLabel(period)}>
                {getPeriodLabel(period)}
              </SelectItem>
            ))}
          </Select>
          {onRefresh && (
            <Tooltip content="Refresh stats">
              <Button isIconOnly variant="flat" size="sm" onPress={onRefresh}>
                <Icon icon="solar:refresh-bold" className="w-4 h-4" />
              </Button>
            </Tooltip>
          )}
        </div>
      </div>

      {/* Rating Card */}
      <Card className="bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-primary-900/20 dark:to-secondary-900/20">
        <CardBody className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Skill Rating */}
            <div className="text-center">
              <p className="text-sm text-default-500 mb-2">Skill Rating</p>
              <div className="flex items-center justify-center gap-2">
                {rankInfo && (
                  <Icon
                    icon={rankInfo.icon}
                    className="w-8 h-8"
                    style={{ color: rankInfo.color }}
                  />
                )}
                <span className="text-4xl font-bold text-primary">
                  {Math.round(analytics.skillRating.rating)}
                </span>
              </div>
              <p className="text-sm text-default-500 mt-1">
                Top {analytics.skillRating.percentile.toFixed(1)}%
              </p>
            </div>

            {/* Win Rate */}
            <div className="text-center">
              <p className="text-sm text-default-500 mb-2">Win Rate</p>
              <div className="flex items-center justify-center gap-2">
                <span className="text-4xl font-bold">
                  {formatPercentage(analytics.stats.winRate.current, 0)}
                </span>
                <StatTrend stat={analytics.stats.winRate} />
              </div>
              <p className="text-sm text-default-500 mt-1">
                {analytics.stats.matchesWon}W /{" "}
                {analytics.stats.matchesPlayed - analytics.stats.matchesWon}L
              </p>
            </div>

            {/* K/D Ratio */}
            <div className="text-center">
              <p className="text-sm text-default-500 mb-2">K/D Ratio</p>
              <div className="flex items-center justify-center gap-2">
                <span className="text-4xl font-bold">
                  {formatKDRatio(analytics.stats.kills, analytics.stats.deaths)}
                </span>
                <StatTrend stat={analytics.stats.kdRatio} />
              </div>
              <p className="text-sm text-default-500 mt-1">
                {analytics.stats.kills}K / {analytics.stats.deaths}D /{" "}
                {analytics.stats.assists}A
              </p>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Tabs */}
      <Tabs
        selectedKey={selectedTab}
        onSelectionChange={(key) => setSelectedTab(key as string)}
        classNames={{
          tabList: "gap-4",
          cursor: "rounded-none",
          tab: "rounded-none",
        }}
      >
        <Tab key="overview" title="Overview">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
            {/* Performance Stats */}
            <Card>
              <CardHeader>
                <h3 className="font-semibold">Performance</h3>
              </CardHeader>
              <CardBody className="pt-0">
                <div className="space-y-4">
                  <StatRow
                    label="Rating"
                    stat={analytics.stats.rating}
                    format={(v) => formatRating(v)}
                  />
                  <StatRow
                    label="ADR"
                    stat={analytics.stats.adr}
                    format={(v) => v.toFixed(1)}
                  />
                  <StatRow
                    label="KAST"
                    stat={analytics.stats.kast}
                    format={(v) => formatPercentage(v)}
                  />
                  <StatRow
                    label="Headshot %"
                    stat={analytics.stats.headshotPercentage}
                    format={(v) => formatPercentage(v)}
                  />
                  <StatRow
                    label="Clutch Rate"
                    stat={analytics.stats.clutchRate}
                    format={(v) => formatPercentage(v)}
                  />
                </div>
              </CardBody>
            </Card>

            {/* Combat Stats */}
            <Card>
              <CardHeader>
                <h3 className="font-semibold">Combat</h3>
              </CardHeader>
              <CardBody className="pt-0">
                <div className="grid grid-cols-2 gap-4">
                  <MiniStatCard
                    label="First Bloods"
                    value={analytics.stats.firstBloods}
                    icon="solar:target-bold"
                    color="success"
                  />
                  <MiniStatCard
                    label="First Deaths"
                    value={analytics.stats.firstDeaths}
                    icon="solar:skull-bold"
                    color="danger"
                  />
                  <MiniStatCard
                    label="Trade Kills"
                    value={analytics.stats.tradeKills}
                    icon="solar:transfer-horizontal-bold"
                    color="primary"
                  />
                  <MiniStatCard
                    label="Clutches"
                    value={`${analytics.stats.clutchesWon}/${analytics.stats.clutchesAttempted}`}
                    icon="solar:star-bold"
                    color="warning"
                  />
                </div>
              </CardBody>
            </Card>

            {/* Map Performance */}
            {analytics.stats.mapStats &&
              analytics.stats.mapStats.length > 0 && (
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <h3 className="font-semibold">Map Performance</h3>
                  </CardHeader>
                  <CardBody className="pt-0">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {analytics.stats.mapStats.slice(0, 8).map((map) => (
                        <MapStatCard key={map.mapId} map={map} />
                      ))}
                    </div>
                  </CardBody>
                </Card>
              )}
          </div>
        </Tab>

        <Tab key="matches" title="Match History">
          <div className="mt-4 space-y-4">
            {analytics.recentMatches.map((match) => (
              <MatchCard key={match.id} match={match} />
            ))}
          </div>
        </Tab>

        <Tab key="weapons" title="Weapons">
          <div className="mt-4">
            {analytics.stats.weaponStats &&
            analytics.stats.weaponStats.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {analytics.stats.weaponStats.map((weapon) => (
                  <Card key={weapon.weaponId}>
                    <CardBody className="flex flex-row items-center gap-4">
                      {weapon.weaponIcon && (
                        <Avatar
                          src={weapon.weaponIcon}
                          alt={weapon.weaponName}
                          size="lg"
                          radius="sm"
                        />
                      )}
                      <div className="flex-1">
                        <p className="font-semibold">{weapon.weaponName}</p>
                        <div className="flex items-center gap-4 text-sm text-default-500">
                          <span>{weapon.kills} kills</span>
                          <span>
                            {formatPercentage(weapon.headshotPercentage)} HS
                          </span>
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-8">
                <CardBody className="text-center text-default-500">
                  No weapon stats available
                </CardBody>
              </Card>
            )}
          </div>
        </Tab>

        <Tab key="agents" title="Agents">
          <div className="mt-4">
            {analytics.stats.agentStats &&
            analytics.stats.agentStats.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {analytics.stats.agentStats.map((agent) => (
                  <Card key={agent.agentId}>
                    <CardBody className="flex flex-row items-center gap-4">
                      {agent.agentIcon && (
                        <Avatar
                          src={agent.agentIcon}
                          alt={agent.agentName}
                          size="lg"
                          radius="sm"
                        />
                      )}
                      <div className="flex-1">
                        <p className="font-semibold">{agent.agentName}</p>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-default-500">Win Rate: </span>
                            <span className="font-medium">
                              {formatPercentage(agent.winRate)}
                            </span>
                          </div>
                          <div>
                            <span className="text-default-500">K/D: </span>
                            <span className="font-medium">
                              {agent.kdRatio.toFixed(2)}
                            </span>
                          </div>
                        </div>
                        <p className="text-xs text-default-500">
                          {agent.matchesPlayed} matches
                        </p>
                      </div>
                    </CardBody>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-8">
                <CardBody className="text-center text-default-500">
                  No agent stats available
                </CardBody>
              </Card>
            )}
          </div>
        </Tab>
      </Tabs>
    </div>
  );
}

// Stat row component
function StatRow({
  label,
  stat,
  format,
}: {
  label: string;
  stat: StatValue;
  format: (value: number) => string;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-default-500">{label}</span>
      <div className="flex items-center gap-2">
        <span className="font-semibold">{format(stat.current)}</span>
        <StatTrend stat={stat} />
      </div>
    </div>
  );
}

// Stat trend indicator
function StatTrend({ stat }: { stat: StatValue }) {
  if (!stat.trendPercentage || stat.trend === "stable") return null;

  return (
    <div
      className={`flex items-center gap-0.5 text-xs ${getTrendColor(
        stat.trend
      )}`}
    >
      <Icon icon={getTrendIcon(stat.trend)} className="w-3 h-3" />
      <span>{Math.abs(stat.trendPercentage).toFixed(1)}%</span>
    </div>
  );
}

// Mini stat card
function MiniStatCard({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: string | number;
  icon: string;
  color: "success" | "danger" | "primary" | "warning" | "secondary";
}) {
  const colorMap = {
    success: "bg-success/10 text-success",
    danger: "bg-danger/10 text-danger",
    primary: "bg-primary/10 text-primary",
    warning: "bg-warning/10 text-warning",
    secondary: "bg-secondary/10 text-secondary",
  };

  return (
    <div className="p-3 bg-default-50 rounded-lg">
      <div className="flex items-center gap-2 mb-1">
        <div className={`p-1.5 rounded ${colorMap[color]}`}>
          <Icon icon={icon} className="w-4 h-4" />
        </div>
        <span className="text-xs text-default-500">{label}</span>
      </div>
      <p className="text-xl font-bold">{value}</p>
    </div>
  );
}

// Map stat card
function MapStatCard({
  map,
}: {
  map: {
    mapId: string;
    mapName: string;
    winRate: number;
    matchesPlayed: number;
    avgRating: number;
  };
}) {
  return (
    <Card className="bg-default-50">
      <CardBody className="p-3">
        <p className="font-semibold mb-2">{map.mapName}</p>
        <div className="space-y-2">
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-default-500">Win Rate</span>
              <span
                className={map.winRate >= 50 ? "text-success" : "text-danger"}
              >
                {formatPercentage(map.winRate)}
              </span>
            </div>
            <Progress
              value={map.winRate}
              size="sm"
              color={map.winRate >= 50 ? "success" : "danger"}
            />
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-default-500">
              Rating: {formatRating(map.avgRating)}
            </span>
            <span className="text-default-500">
              {map.matchesPlayed} matches
            </span>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}

// Match card
function MatchCard({ match }: { match: MatchHistoryEntry }) {
  const isWin = match.result === "win";
  const _gameConfig = GAME_CONFIGS[match.gameId];

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <Card
        className={`border-l-4 ${
          isWin ? "border-l-success" : "border-l-danger"
        }`}
      >
        <CardBody className="flex flex-row items-center gap-4 p-4">
          {/* Result indicator */}
          <div
            className={`w-12 h-12 rounded-lg flex items-center justify-center ${
              isWin ? "bg-success/20" : "bg-danger/20"
            }`}
          >
            <span
              className={`text-lg font-bold ${
                isWin ? "text-success" : "text-danger"
              }`}
            >
              {isWin ? "W" : "L"}
            </span>
          </div>

          {/* Match info */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold">{match.mapName}</span>
              <Chip size="sm" variant="flat">
                {match.score.team1} - {match.score.team2}
              </Chip>
              {match.isMvp && (
                <Chip
                  size="sm"
                  color="warning"
                  variant="flat"
                  startContent={
                    <Icon icon="solar:cup-star-bold" className="w-3 h-3" />
                  }
                >
                  MVP
                </Chip>
              )}
            </div>
            <p className="text-sm text-default-500">
              {new Date(match.playedAt).toLocaleDateString()} · {match.duration}{" "}
              min
            </p>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-6 text-center">
            <div>
              <p className="text-lg font-bold">
                {match.kills}/{match.deaths}/{match.assists}
              </p>
              <p className="text-xs text-default-500">K/D/A</p>
            </div>
            <div>
              <p className="text-lg font-bold">{formatRating(match.rating)}</p>
              <p className="text-xs text-default-500">Rating</p>
            </div>
            {match.adr && (
              <div>
                <p className="text-lg font-bold">{match.adr.toFixed(0)}</p>
                <p className="text-xs text-default-500">ADR</p>
              </div>
            )}
          </div>

          {/* Actions */}
          {match.hasReplay && (
            <Tooltip content="Watch replay">
              <Button isIconOnly variant="flat" size="sm">
                <Icon icon="solar:play-circle-bold" className="w-5 h-5" />
              </Button>
            </Tooltip>
          )}
        </CardBody>
      </Card>
    </motion.div>
  );
}

// Loading skeleton
function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Skeleton className="w-16 h-16 rounded-lg" />
        <div className="space-y-2">
          <Skeleton className="w-40 h-6 rounded-lg" />
          <Skeleton className="w-24 h-4 rounded-lg" />
        </div>
      </div>
      <Skeleton className="w-full h-40 rounded-lg" />
      <div className="grid grid-cols-2 gap-4">
        <Skeleton className="h-60 rounded-lg" />
        <Skeleton className="h-60 rounded-lg" />
      </div>
    </div>
  );
}

export default AnalyticsDashboard;

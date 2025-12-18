/**
 * Team Statistics Dashboard Component
 * Advanced team analytics and performance tracking
 * Per PRD D.3 - Team Management Suite
 */

"use client";

import React, { useState, useMemo } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Chip,
  Progress,
  Avatar,
  AvatarGroup,
  Tabs,
  Tab,
  ScrollShadow,
  Tooltip,
  Select,
  SelectItem,
} from "@nextui-org/react";
import { Icon } from "@iconify/react";
import { motion, AnimatePresence } from "framer-motion";

// ============================================================================
// Types
// ============================================================================

export interface TeamMemberStats {
  id: string;
  name: string;
  avatar?: string;
  role: "captain" | "igl" | "entry" | "support" | "awper" | "lurker" | "coach";

  // Performance metrics
  rating: number;
  kda: number;
  kills: number;
  deaths: number;
  assists: number;
  adr: number; // Average Damage per Round
  headshots: number;
  headshotPercentage: number;

  // Advanced stats
  clutchesWon: number;
  clutchesPlayed: number;
  firstKills: number;
  firstDeaths: number;
  flashAssists: number;
  utilityDamage: number;

  // Match data
  matchesPlayed: number;
  wins: number;
  losses: number;

  // Form (recent performance)
  form: "excellent" | "good" | "average" | "poor";
  formTrend: "up" | "down" | "stable";
}

export interface TeamStats {
  id: string;
  name: string;
  tag: string;
  logo?: string;

  // Overall stats
  totalMatches: number;
  wins: number;
  losses: number;
  draws: number;
  winRate: number;

  // Team rating
  rating: number;
  ratingChange: number;

  // Per-map stats
  mapStats: {
    mapName: string;
    played: number;
    wins: number;
    winRate: number;
  }[];

  // Round stats
  roundsWon: number;
  roundsLost: number;
  roundWinRate: number;

  // Economy stats
  avgEquipmentValue: number;
  pistolRoundWinRate: number;
  ecoRoundWinRate: number;
  forceRoundWinRate: number;

  // Recent matches
  recentForm: ("W" | "L" | "D")[];

  // Members
  members: TeamMemberStats[];
}

export interface TeamStatsDashboardProps {
  team: TeamStats;
  onMemberClick?: (memberId: string) => void;
  onMatchClick?: (matchId: string) => void;
  className?: string;
}

// ============================================================================
// Constants
// ============================================================================

const ROLE_INFO: Record<
  string,
  { label: string; icon: string; color: string }
> = {
  captain: { label: "Captain", icon: "solar:crown-bold", color: "warning" },
  igl: { label: "IGL", icon: "solar:microphone-bold", color: "primary" },
  entry: { label: "Entry", icon: "solar:running-bold", color: "danger" },
  support: {
    label: "Support",
    icon: "solar:shield-user-bold",
    color: "success",
  },
  awper: { label: "AWPer", icon: "solar:target-bold", color: "secondary" },
  lurker: { label: "Lurker", icon: "solar:ghost-bold", color: "default" },
  coach: { label: "Coach", icon: "solar:clipboard-bold", color: "primary" },
};

const FORM_COLORS = {
  excellent: "success",
  good: "primary",
  average: "warning",
  poor: "danger",
};

// ============================================================================
// Sub-Components
// ============================================================================

function StatCard({
  title,
  value,
  change,
  icon,
  color = "default",
}: {
  title: string;
  value: string | number;
  change?: number;
  icon: string;
  color?: "default" | "primary" | "success" | "warning" | "danger";
}) {
  return (
    <Card>
      <CardBody className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-default-500 uppercase tracking-wide">
              {title}
            </p>
            <p className="text-2xl font-bold mt-1">{value}</p>
            {change !== undefined && (
              <div
                className={`flex items-center gap-1 mt-1 text-xs ${
                  change > 0
                    ? "text-success"
                    : change < 0
                    ? "text-danger"
                    : "text-default-500"
                }`}
              >
                <Icon
                  icon={
                    change > 0
                      ? "solar:arrow-up-bold"
                      : change < 0
                      ? "solar:arrow-down-bold"
                      : "solar:minus-bold"
                  }
                  className="w-3 h-3"
                />
                <span>{Math.abs(change).toFixed(1)}</span>
              </div>
            )}
          </div>
          <div
            className={`w-10 h-10 rounded-lg bg-${color}/10 flex items-center justify-center`}
          >
            <Icon icon={icon} className={`w-5 h-5 text-${color}`} />
          </div>
        </div>
      </CardBody>
    </Card>
  );
}

function MemberCard({
  member,
  onClick,
}: {
  member: TeamMemberStats;
  onClick?: () => void;
}) {
  const roleInfo = ROLE_INFO[member.role];
  const formColor = FORM_COLORS[member.form];
  const winRate =
    member.matchesPlayed > 0
      ? ((member.wins / member.matchesPlayed) * 100).toFixed(1)
      : "0.0";

  return (
    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
      <Card isPressable onPress={onClick} className="h-full">
        <CardBody className="p-4">
          <div className="flex items-start gap-3">
            <div className="relative">
              <Avatar
                src={member.avatar}
                name={member.name}
                size="lg"
                className="w-14 h-14"
              />
              {member.role === "captain" && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-warning rounded-full flex items-center justify-center">
                  <Icon
                    icon="solar:crown-bold"
                    className="w-3 h-3 text-white"
                  />
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h4 className="font-semibold truncate">{member.name}</h4>
                <Chip size="sm" variant="flat" color={roleInfo.color as never}>
                  {roleInfo.label}
                </Chip>
              </div>

              <div className="flex items-center gap-4 mt-2 text-sm">
                <div>
                  <span className="text-default-500">Rating</span>
                  <p className="font-semibold">{member.rating.toFixed(2)}</p>
                </div>
                <div>
                  <span className="text-default-500">K/D</span>
                  <p className="font-semibold">{member.kda.toFixed(2)}</p>
                </div>
                <div>
                  <span className="text-default-500">ADR</span>
                  <p className="font-semibold">{member.adr.toFixed(1)}</p>
                </div>
              </div>

              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center gap-1">
                  <span className="text-xs text-default-500">
                    {member.matchesPlayed} matches
                  </span>
                  <span className="text-xs text-default-400">•</span>
                  <span className="text-xs text-success">{winRate}% WR</span>
                </div>
                <Chip
                  size="sm"
                  variant="dot"
                  color={formColor as never}
                  startContent={
                    member.formTrend === "up" ? (
                      <Icon icon="solar:arrow-up-bold" className="w-3 h-3" />
                    ) : member.formTrend === "down" ? (
                      <Icon icon="solar:arrow-down-bold" className="w-3 h-3" />
                    ) : null
                  }
                >
                  {member.form}
                </Chip>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>
    </motion.div>
  );
}

function MapStatsTable({ mapStats }: { mapStats: TeamStats["mapStats"] }) {
  return (
    <div className="space-y-3">
      {mapStats.map((map) => (
        <div key={map.mapName} className="flex items-center gap-3">
          <div className="w-20 flex-shrink-0">
            <span className="text-sm font-medium capitalize">
              {map.mapName}
            </span>
          </div>
          <div className="flex-1">
            <Progress
              value={map.winRate}
              color={
                map.winRate >= 60
                  ? "success"
                  : map.winRate >= 40
                  ? "warning"
                  : "danger"
              }
              size="sm"
              className="max-w-full"
            />
          </div>
          <div className="w-24 text-right">
            <span className="text-sm">
              {map.wins}/{map.played}
            </span>
            <span className="text-xs text-default-500 ml-1">
              ({map.winRate.toFixed(0)}%)
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

function FormDisplay({ form }: { form: TeamStats["recentForm"] }) {
  return (
    <div className="flex items-center gap-1">
      {form.map((result, index) => (
        <div
          key={index}
          className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold ${
            result === "W"
              ? "bg-success/20 text-success"
              : result === "L"
              ? "bg-danger/20 text-danger"
              : "bg-default-200 text-default-500"
          }`}
        >
          {result}
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function TeamStatsDashboard({
  team,
  onMemberClick,
  onMatchClick: _onMatchClick,
  className = "",
}: TeamStatsDashboardProps) {
  const [viewMode, setViewMode] = useState<
    "overview" | "members" | "maps" | "economy"
  >("overview");
  const [selectedPeriod, setSelectedPeriod] = useState("30d");

  // Calculate aggregate stats
  const aggregateStats = useMemo(() => {
    const totalKills = team.members.reduce((acc, m) => acc + m.kills, 0);
    const totalDeaths = team.members.reduce((acc, m) => acc + m.deaths, 0);
    const avgAdr =
      team.members.reduce((acc, m) => acc + m.adr, 0) / team.members.length;
    const avgRating =
      team.members.reduce((acc, m) => acc + m.rating, 0) / team.members.length;
    const totalClutchesWon = team.members.reduce(
      (acc, m) => acc + m.clutchesWon,
      0
    );
    const totalClutchesPlayed = team.members.reduce(
      (acc, m) => acc + m.clutchesPlayed,
      0
    );

    return {
      teamKD: totalDeaths > 0 ? (totalKills / totalDeaths).toFixed(2) : "0.00",
      avgAdr: avgAdr.toFixed(1),
      avgRating: avgRating.toFixed(2),
      clutchRate:
        totalClutchesPlayed > 0
          ? ((totalClutchesWon / totalClutchesPlayed) * 100).toFixed(1)
          : "0.0",
    };
  }, [team.members]);

  return (
    <Card className={className}>
      <CardHeader className="flex flex-col gap-4 pb-0">
        {/* Team Header */}
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-4">
            <Avatar
              src={team.logo}
              name={team.tag}
              size="lg"
              className="w-16 h-16"
              isBordered
              color="primary"
            />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold">{team.name}</h2>
                <Chip size="sm" variant="bordered">
                  [{team.tag}]
                </Chip>
              </div>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-sm text-default-500">
                  Rating:{" "}
                  <span className="font-semibold text-foreground">
                    {team.rating}
                  </span>
                  {team.ratingChange !== 0 && (
                    <span
                      className={
                        team.ratingChange > 0 ? "text-success" : "text-danger"
                      }
                    >
                      {" "}
                      ({team.ratingChange > 0 ? "+" : ""}
                      {team.ratingChange})
                    </span>
                  )}
                </span>
                <span className="text-default-400">•</span>
                <span className="text-sm text-default-500">
                  {team.totalMatches} matches
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Select
              size="sm"
              selectedKeys={[selectedPeriod]}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="w-32"
              aria-label="Period"
            >
              <SelectItem key="7d">Last 7 days</SelectItem>
              <SelectItem key="30d">Last 30 days</SelectItem>
              <SelectItem key="90d">Last 90 days</SelectItem>
              <SelectItem key="all">All time</SelectItem>
            </Select>
          </div>
        </div>

        {/* Recent Form */}
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <span className="text-sm text-default-500">Recent Form:</span>
            <FormDisplay form={team.recentForm} />
          </div>
          <AvatarGroup max={5} size="sm">
            {team.members.map((member) => (
              <Tooltip key={member.id} content={member.name}>
                <Avatar src={member.avatar} name={member.name} />
              </Tooltip>
            ))}
          </AvatarGroup>
        </div>

        {/* View Tabs */}
        <Tabs
          selectedKey={viewMode}
          onSelectionChange={(key) => setViewMode(key as typeof viewMode)}
          variant="underlined"
          classNames={{
            tabList: "gap-4 w-full",
          }}
        >
          <Tab
            key="overview"
            title={
              <div className="flex items-center gap-2">
                <Icon icon="solar:chart-square-bold" className="w-4 h-4" />
                <span>Overview</span>
              </div>
            }
          />
          <Tab
            key="members"
            title={
              <div className="flex items-center gap-2">
                <Icon
                  icon="solar:users-group-rounded-bold"
                  className="w-4 h-4"
                />
                <span>Members</span>
                <Chip size="sm" variant="flat">
                  {team.members.length}
                </Chip>
              </div>
            }
          />
          <Tab
            key="maps"
            title={
              <div className="flex items-center gap-2">
                <Icon icon="solar:map-bold" className="w-4 h-4" />
                <span>Maps</span>
              </div>
            }
          />
          <Tab
            key="economy"
            title={
              <div className="flex items-center gap-2">
                <Icon icon="solar:wallet-bold" className="w-4 h-4" />
                <span>Economy</span>
              </div>
            }
          />
        </Tabs>
      </CardHeader>

      <CardBody className="pt-4">
        <AnimatePresence mode="wait">
          {viewMode === "overview" && (
            <motion.div
              key="overview"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              {/* Key Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard
                  title="Win Rate"
                  value={`${team.winRate.toFixed(1)}%`}
                  icon="solar:cup-star-bold"
                  color="success"
                />
                <StatCard
                  title="Team K/D"
                  value={aggregateStats.teamKD}
                  icon="solar:target-bold"
                  color="primary"
                />
                <StatCard
                  title="Avg Rating"
                  value={aggregateStats.avgRating}
                  change={team.ratingChange / 100}
                  icon="solar:medal-ribbons-star-bold"
                  color="warning"
                />
                <StatCard
                  title="Clutch Rate"
                  value={`${aggregateStats.clutchRate}%`}
                  icon="solar:shield-check-bold"
                  color="default"
                />
              </div>

              {/* Record and Round Stats */}
              <div className="grid md:grid-cols-2 gap-4">
                <Card>
                  <CardBody className="p-4">
                    <h4 className="font-semibold mb-3">Match Record</h4>
                    <div className="flex items-center justify-around">
                      <div className="text-center">
                        <p className="text-3xl font-bold text-success">
                          {team.wins}
                        </p>
                        <p className="text-xs text-default-500">Wins</p>
                      </div>
                      <div className="text-center">
                        <p className="text-3xl font-bold text-danger">
                          {team.losses}
                        </p>
                        <p className="text-xs text-default-500">Losses</p>
                      </div>
                      <div className="text-center">
                        <p className="text-3xl font-bold text-default-500">
                          {team.draws}
                        </p>
                        <p className="text-xs text-default-500">Draws</p>
                      </div>
                    </div>
                  </CardBody>
                </Card>

                <Card>
                  <CardBody className="p-4">
                    <h4 className="font-semibold mb-3">Round Performance</h4>
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <Progress
                          value={team.roundWinRate}
                          color="primary"
                          className="h-3"
                        />
                      </div>
                      <span className="text-sm font-medium">
                        {team.roundWinRate.toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-2 text-sm text-default-500">
                      <span>{team.roundsWon} won</span>
                      <span>{team.roundsLost} lost</span>
                    </div>
                  </CardBody>
                </Card>
              </div>

              {/* Top Performers */}
              <div>
                <h4 className="font-semibold mb-3">Top Performers</h4>
                <ScrollShadow orientation="horizontal" className="pb-2">
                  <div className="flex gap-3">
                    {[...team.members]
                      .sort((a, b) => b.rating - a.rating)
                      .slice(0, 3)
                      .map((member, index) => (
                        <Card key={member.id} className="min-w-[200px]">
                          <CardBody className="p-3">
                            <div className="flex items-center gap-3">
                              <div className="relative">
                                <Avatar
                                  src={member.avatar}
                                  name={member.name}
                                />
                                <div
                                  className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                                    index === 0
                                      ? "bg-warning text-white"
                                      : index === 1
                                      ? "bg-default-300"
                                      : "bg-amber-600 text-white"
                                  }`}
                                >
                                  {index + 1}
                                </div>
                              </div>
                              <div>
                                <p className="font-medium text-sm">
                                  {member.name}
                                </p>
                                <p className="text-xs text-default-500">
                                  {member.rating.toFixed(2)} rating
                                </p>
                              </div>
                            </div>
                          </CardBody>
                        </Card>
                      ))}
                  </div>
                </ScrollShadow>
              </div>
            </motion.div>
          )}

          {viewMode === "members" && (
            <motion.div
              key="members"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="grid md:grid-cols-2 gap-4">
                {team.members.map((member) => (
                  <MemberCard
                    key={member.id}
                    member={member}
                    onClick={() => onMemberClick?.(member.id)}
                  />
                ))}
              </div>
            </motion.div>
          )}

          {viewMode === "maps" && (
            <motion.div
              key="maps"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <MapStatsTable mapStats={team.mapStats} />
            </motion.div>
          )}

          {viewMode === "economy" && (
            <motion.div
              key="economy"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              <div className="grid md:grid-cols-2 gap-4">
                <StatCard
                  title="Avg Equipment Value"
                  value={`$${team.avgEquipmentValue.toLocaleString()}`}
                  icon="solar:wallet-bold"
                  color="primary"
                />
                <StatCard
                  title="Pistol Round Win Rate"
                  value={`${team.pistolRoundWinRate.toFixed(1)}%`}
                  icon="solar:target-bold"
                  color="success"
                />
                <StatCard
                  title="Eco Round Win Rate"
                  value={`${team.ecoRoundWinRate.toFixed(1)}%`}
                  icon="solar:wallet-2-bold"
                  color="warning"
                />
                <StatCard
                  title="Force Round Win Rate"
                  value={`${team.forceRoundWinRate.toFixed(1)}%`}
                  icon="solar:fire-bold"
                  color="danger"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardBody>
    </Card>
  );
}

// ============================================================================
// Sample Data Factory
// ============================================================================

export const createSampleTeamStats = (): TeamStats => ({
  id: "team-1",
  name: "LeetGaming Esports",
  tag: "LEET",
  logo: undefined,
  totalMatches: 47,
  wins: 28,
  losses: 17,
  draws: 2,
  winRate: 59.6,
  rating: 1847,
  ratingChange: 23,
  mapStats: [
    { mapName: "inferno", played: 15, wins: 10, winRate: 66.7 },
    { mapName: "mirage", played: 12, wins: 7, winRate: 58.3 },
    { mapName: "dust2", played: 10, wins: 5, winRate: 50.0 },
    { mapName: "nuke", played: 8, wins: 6, winRate: 75.0 },
    { mapName: "ancient", played: 2, wins: 0, winRate: 0 },
  ],
  roundsWon: 523,
  roundsLost: 412,
  roundWinRate: 55.9,
  avgEquipmentValue: 18500,
  pistolRoundWinRate: 62.5,
  ecoRoundWinRate: 18.2,
  forceRoundWinRate: 35.4,
  recentForm: ["W", "W", "L", "W", "L", "W", "W", "D", "W", "L"],
  members: [
    {
      id: "p1",
      name: "Phoenix",
      avatar: undefined,
      role: "captain",
      rating: 1.24,
      kda: 1.35,
      kills: 847,
      deaths: 628,
      assists: 156,
      adr: 85.2,
      headshots: 423,
      headshotPercentage: 49.9,
      clutchesWon: 23,
      clutchesPlayed: 45,
      firstKills: 89,
      firstDeaths: 67,
      flashAssists: 42,
      utilityDamage: 1250,
      matchesPlayed: 47,
      wins: 28,
      losses: 19,
      form: "excellent",
      formTrend: "up",
    },
    {
      id: "p2",
      name: "Ghost",
      avatar: undefined,
      role: "awper",
      rating: 1.18,
      kda: 1.22,
      kills: 756,
      deaths: 620,
      assists: 89,
      adr: 78.4,
      headshots: 189,
      headshotPercentage: 25.0,
      clutchesWon: 18,
      clutchesPlayed: 38,
      firstKills: 112,
      firstDeaths: 54,
      flashAssists: 12,
      utilityDamage: 450,
      matchesPlayed: 47,
      wins: 28,
      losses: 19,
      form: "good",
      formTrend: "stable",
    },
    {
      id: "p3",
      name: "Viper",
      avatar: undefined,
      role: "entry",
      rating: 1.08,
      kda: 1.05,
      kills: 698,
      deaths: 665,
      assists: 178,
      adr: 82.1,
      headshots: 378,
      headshotPercentage: 54.2,
      clutchesWon: 8,
      clutchesPlayed: 22,
      firstKills: 145,
      firstDeaths: 98,
      flashAssists: 28,
      utilityDamage: 890,
      matchesPlayed: 47,
      wins: 28,
      losses: 19,
      form: "average",
      formTrend: "down",
    },
    {
      id: "p4",
      name: "Shade",
      avatar: undefined,
      role: "support",
      rating: 0.98,
      kda: 0.92,
      kills: 589,
      deaths: 641,
      assists: 234,
      adr: 68.9,
      headshots: 265,
      headshotPercentage: 45.0,
      clutchesWon: 5,
      clutchesPlayed: 15,
      firstKills: 45,
      firstDeaths: 78,
      flashAssists: 89,
      utilityDamage: 2340,
      matchesPlayed: 47,
      wins: 28,
      losses: 19,
      form: "good",
      formTrend: "up",
    },
    {
      id: "p5",
      name: "Storm",
      avatar: undefined,
      role: "lurker",
      rating: 1.05,
      kda: 1.12,
      kills: 612,
      deaths: 547,
      assists: 123,
      adr: 72.3,
      headshots: 312,
      headshotPercentage: 51.0,
      clutchesWon: 28,
      clutchesPlayed: 52,
      firstKills: 78,
      firstDeaths: 42,
      flashAssists: 35,
      utilityDamage: 780,
      matchesPlayed: 47,
      wins: 28,
      losses: 19,
      form: "excellent",
      formTrend: "stable",
    },
  ],
});

export default TeamStatsDashboard;

"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  Card,
  CardBody,
  CardHeader,
  Progress,
  Avatar,
  Chip,
  Button,
  Tabs,
  Tab,
  Spacer,
  Divider,
  Spinner,
} from "@nextui-org/react";
import { Icon } from "@iconify/react";
import { title, subtitle } from "@/components/primitives";
import { ReplayAPISDK } from "@/types/replay-api/sdk";
import { ReplayApiSettingsMock } from "@/types/replay-api/settings";
import { PlayerProfile } from "@/types/replay-api/entities.types";
import { logger } from "@/lib/logger";

const sdk = new ReplayAPISDK(ReplayApiSettingsMock, logger);

/** Extended player profile with stats from API */
interface PlayerProfileWithStats extends PlayerProfile {
  rating?: number;
  rating_change?: number;
  stats?: {
    wins?: number;
    losses?: number;
  };
}

interface RankTier {
  name: string;
  division: string;
  icon: string;
  color: string;
  minRating: number;
}

interface PlayerRankStats {
  currentRating: number;
  tier: RankTier;
  wins: number;
  losses: number;
  totalMatches: number;
  winRate: number;
  ratingChange: number;
  nextTierRating: number;
  progressToNext: number;
}

const RANK_TIERS: RankTier[] = [
  { name: "Iron", division: "I", icon: "mdi:shield", color: "#8B7355", minRating: 0 },
  { name: "Bronze", division: "I", icon: "mdi:shield", color: "#CD7F32", minRating: 1000 },
  { name: "Silver", division: "I", icon: "mdi:shield-star", color: "#C0C0C0", minRating: 1500 },
  { name: "Gold", division: "I", icon: "mdi:shield-star", color: "#FFD700", minRating: 2000 },
  { name: "Platinum", division: "I", icon: "mdi:shield-crown", color: "#E5E4E2", minRating: 2500 },
  { name: "Diamond", division: "I", icon: "mdi:shield-crown", color: "#B9F2FF", minRating: 3000 },
  { name: "Master", division: "I", icon: "mdi:crown", color: "#9B59B6", minRating: 3500 },
  { name: "Grandmaster", division: "I", icon: "mdi:crown-circle", color: "#E74C3C", minRating: 4000 },
  { name: "Challenger", division: "I", icon: "mdi:trophy", color: "#DCFF37", minRating: 4500 },
];

interface RecentMatch {
  id: number;
  result: string;
  ratingChange: number;
  map: string;
  kda: string;
  date: string;
}

export default function RankedPage() {
  const { data: session } = useSession();
  const [selectedTab, setSelectedTab] = useState("overview");
  const [stats, setStats] = useState<PlayerRankStats | null>(null);
  const [recentMatches, setRecentMatches] = useState<RecentMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Helper to get tier from rating
  function getTierFromRating(rating: number): RankTier {
    for (let i = RANK_TIERS.length - 1; i >= 0; i--) {
      if (rating >= RANK_TIERS[i].minRating) {
        return RANK_TIERS[i];
      }
    }
    return RANK_TIERS[0];
  }

  // Helper to get next tier info
  function getNextTierInfo(rating: number): { nextTier: RankTier | null; progress: number } {
    const currentTierIndex = RANK_TIERS.findIndex(t => t.minRating > rating) - 1;
    const nextTierIndex = currentTierIndex + 1;

    if (nextTierIndex >= RANK_TIERS.length) {
      return { nextTier: null, progress: 100 };
    }

    const currentTier = RANK_TIERS[Math.max(0, currentTierIndex)];
    const nextTier = RANK_TIERS[nextTierIndex];
    const ratingInTier = rating - currentTier.minRating;
    const tierRange = nextTier.minRating - currentTier.minRating;
    const progress = Math.min(100, Math.round((ratingInTier / tierRange) * 100));

    return { nextTier, progress };
  }

  // Fetch player ranked data
  useEffect(() => {
    async function fetchRankedData() {
      // Don't fetch if not logged in
      if (!session?.user) {
        setLoading(false);
        setStats(null);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Fetch current user's player profile
        const player = await sdk.playerProfiles.getMyProfile() as PlayerProfileWithStats | null;

        if (player) {
          const rating = player.rating || 0;
          const wins = player.stats?.wins || 0;
          const losses = player.stats?.losses || 0;
          const totalMatches = wins + losses;
          const winRate = totalMatches > 0 ? (wins / totalMatches) * 100 : 0;

          const tier = getTierFromRating(rating);
          const { nextTier, progress } = getNextTierInfo(rating);

          setStats({
            currentRating: rating,
            tier,
            wins,
            losses,
            totalMatches,
            winRate: Math.round(winRate * 10) / 10,
            ratingChange: player.rating_change || 0,
            nextTierRating: nextTier?.minRating || rating,
            progressToNext: progress,
          });
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to load ranked data";
        logger.error("Failed to fetch ranked data", err);
        setError(errorMessage);
        // Show empty state on error - no mock data fallback
        setStats(null);
        setRecentMatches([]);
      } finally {
        setLoading(false);
      }
    }

    fetchRankedData();
  }, [session]);

  return (
    <div className="flex w-full flex-col items-center gap-8 px-4 py-8 lg:px-24">
      {/* Header */}
      <div className="flex w-full max-w-6xl flex-col items-center text-center gap-2">
        <h2 className="text-secondary font-medium">Competitive Gaming</h2>
        <h1 className={title({ size: "lg" })}>Ranked Mode</h1>
        <p className={subtitle({ class: "mt-2 max-w-2xl" })}>
          Compete against players of similar skill level. Climb the ranks and prove your worth in competitive matches.
        </p>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="w-full max-w-6xl flex justify-center py-12">
          <Spinner size="lg" label="Loading ranked data..." color="primary" />
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <Card className="w-full max-w-md">
          <CardBody className="text-center">
            <Icon icon="mdi:alert-circle" className="text-danger mx-auto mb-4" width={48} />
            <p className="text-danger font-semibold mb-2">Error loading ranked data</p>
            <p className="text-default-500 mb-4">{error}</p>
            <p className="text-xs text-default-400">Showing cached data</p>
          </CardBody>
        </Card>
      )}

      {/* Not Logged In State */}
      {!loading && !session?.user && (
        <Card className="w-full max-w-6xl">
          <CardBody className="text-center py-12">
            <Icon icon="mdi:account-lock" className="text-6xl text-default-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Sign In Required</h3>
            <p className="text-default-500 mb-4">
              Sign in to view your ranked stats and start climbing the leaderboards.
            </p>
            <Button color="primary" variant="shadow" as="a" href="/api/auth/signin">
              <Icon icon="mdi:login" width={20} />
              Sign In
            </Button>
          </CardBody>
        </Card>
      )}

      {/* No Data State (logged in but no profile) */}
      {!loading && session?.user && !stats && (
        <Card className="w-full max-w-6xl">
          <CardBody className="text-center py-12">
            <Icon icon="mdi:chart-timeline-variant" className="text-6xl text-default-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Ranked Data Available</h3>
            <p className="text-default-500 mb-4">
              Play ranked matches to see your stats and climb the leaderboards.
            </p>
            <Button color="primary" variant="shadow">
              <Icon icon="mdi:sword-cross" width={20} />
              Find Match
            </Button>
          </CardBody>
        </Card>
      )}

      {/* Current Rank Card */}
      {stats && (
      <Card className="w-full max-w-6xl bg-gradient-to-br from-default-100 to-default-50">
        <CardBody className="p-8">
          <div className="flex flex-col md:flex-row items-center gap-8">
            {/* Rank Icon */}
            <div className="flex flex-col items-center gap-4">
              <div
                className="relative flex h-40 w-40 items-center justify-center rounded-full"
                style={{
                  background: `radial-gradient(circle, ${stats.tier.color}40, transparent)`,
                }}
              >
                <Icon
                  icon={stats.tier.icon}
                  className="text-8xl"
                  style={{ color: stats.tier.color }}
                />
              </div>
              <div className="flex flex-col items-center">
                <h2 className="text-2xl font-bold" style={{ color: stats.tier.color }}>
                  {stats.tier.name}
                </h2>
                <p className="text-default-500">{stats.tier.division}</p>
              </div>
            </div>

            {/* Stats */}
            <div className="flex-1 w-full">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
                <div className="flex flex-col">
                  <span className="text-default-500 text-sm">Rating</span>
                  <span className="text-2xl font-bold">{stats.currentRating}</span>
                  <Chip
                    size="sm"
                    color={stats.ratingChange > 0 ? "success" : "danger"}
                    variant="flat"
                    className="mt-1 w-fit"
                  >
                    {stats.ratingChange > 0 ? "+" : ""}{stats.ratingChange}
                  </Chip>
                </div>
                <div className="flex flex-col">
                  <span className="text-default-500 text-sm">Win Rate</span>
                  <span className="text-2xl font-bold">{stats.winRate}%</span>
                  <span className="text-xs text-default-400 mt-1">
                    {stats.wins}W / {stats.losses}L
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-default-500 text-sm">Total Matches</span>
                  <span className="text-2xl font-bold">{stats.totalMatches}</span>
                  <span className="text-xs text-default-400 mt-1">This season</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-default-500 text-sm">Next Rank</span>
                  <span className="text-2xl font-bold">Platinum</span>
                  <span className="text-xs text-default-400 mt-1">+150 rating</span>
                </div>
              </div>

              {/* Progress to Next Rank */}
              <div className="w-full">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-default-600">Progress to Platinum</span>
                  <span className="text-sm font-semibold">{stats.progressToNext}%</span>
                </div>
                <Progress
                  value={stats.progressToNext}
                  color="warning"
                  className="w-full"
                  size="md"
                />
                <div className="flex justify-between mt-1 text-xs text-default-400">
                  <span>{stats.currentRating}</span>
                  <span>{stats.nextTierRating}</span>
                </div>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>
      )}

      {/* Tabs Section */}
      {stats && (
      <div className="w-full max-w-6xl">
        <Tabs
          selectedKey={selectedTab}
          onSelectionChange={(key) => setSelectedTab(key as string)}
          variant="underlined"
          classNames={{
            tabList: "gap-6",
            cursor: "bg-primary",
            tab: "h-12",
          }}
        >
          <Tab key="overview" title="Overview">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              {/* Recent Matches */}
              <Card>
                <CardHeader className="flex justify-between">
                  <h3 className="text-lg font-semibold">Recent Matches</h3>
                  <Button size="sm" variant="light" color="primary">
                    View All
                  </Button>
                </CardHeader>
                <Divider />
                <CardBody className="gap-3">
                  {recentMatches.map((match) => (
                    <div
                      key={match.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-default-100 hover:bg-default-200 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Chip
                          size="sm"
                          color={match.result === "win" ? "success" : "danger"}
                          variant="flat"
                          className="uppercase font-bold min-w-16"
                        >
                          {match.result}
                        </Chip>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium">{match.map}</span>
                          <span className="text-xs text-default-500">{match.date}</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-sm font-mono">{match.kda}</span>
                        <span
                          className={`text-xs font-semibold ${
                            match.ratingChange > 0 ? "text-success" : "text-danger"
                          }`}
                        >
                          {match.ratingChange > 0 ? "+" : ""}{match.ratingChange}
                        </span>
                      </div>
                    </div>
                  ))}
                </CardBody>
              </Card>

              {/* Season Info */}
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold">Season Information</h3>
                </CardHeader>
                <Divider />
                <CardBody className="gap-4">
                  <div className="flex justify-between items-center">
                    <span className="text-default-600">Current Season</span>
                    <Chip color="primary" variant="flat">Season 5</Chip>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-default-600">Season End</span>
                    <span className="font-medium">45 days remaining</span>
                  </div>
                  <Divider />
                  <div className="flex justify-between items-center">
                    <span className="text-default-600">Peak Rating</span>
                    <span className="font-bold text-warning">2420</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-default-600">Peak Rank</span>
                    <span className="font-bold" style={{ color: "#FFD700" }}>Gold II</span>
                  </div>
                  <Divider />
                  <Button color="primary" variant="shadow" className="w-full mt-2">
                    <Icon icon="mdi:sword-cross" width={20} />
                    Find Match
                  </Button>
                </CardBody>
              </Card>
            </div>
          </Tab>

          <Tab key="ranks" title="Rank System">
            <div className="mt-6">
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold">All Ranks</h3>
                </CardHeader>
                <Divider />
                <CardBody>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {RANK_TIERS.map((tier, index) => (
                      <div
                        key={index}
                        className={`flex items-center gap-4 p-4 rounded-lg border-2 transition-all ${
                          tier.name === stats.tier.name
                            ? "border-primary bg-primary-50"
                            : "border-default-200 bg-default-50 hover:border-default-300"
                        }`}
                      >
                        <Icon
                          icon={tier.icon}
                          className="text-4xl"
                          style={{ color: tier.color }}
                        />
                        <div className="flex flex-col">
                          <span className="font-bold" style={{ color: tier.color }}>
                            {tier.name}
                          </span>
                          <span className="text-xs text-default-500">
                            {tier.minRating}+ rating
                          </span>
                        </div>
                        {tier.name === stats.tier.name && (
                          <Chip size="sm" color="primary" variant="flat" className="ml-auto">
                            Current
                          </Chip>
                        )}
                      </div>
                    ))}
                  </div>
                </CardBody>
              </Card>
            </div>
          </Tab>

          <Tab key="rewards" title="Rewards">
            <div className="mt-6">
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold">Season Rewards</h3>
                </CardHeader>
                <Divider />
                <CardBody>
                  <p className="text-default-500 text-center py-8">
                    Season rewards will be displayed here. Complete ranked matches to earn exclusive rewards and unlock achievements.
                  </p>
                </CardBody>
              </Card>
            </div>
          </Tab>
        </Tabs>
      </div>
      )}
    </div>
  );
}

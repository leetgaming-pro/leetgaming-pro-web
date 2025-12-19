"use client";

/**
 * Prize Pool Card Component
 * Displays live prize pool with animated counter, platform contribution, and recent winners
 * Integrated with real backend via SDK
 */

import React, { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Avatar,
  Chip,
  Divider,
  Skeleton,
} from "@nextui-org/react";
import { Icon } from "@iconify/react";
import { motion, AnimatePresence } from "framer-motion";
import { useReplayApi } from "@/hooks/use-replay-api";

interface PrizePoolData {
  pool_id: string;
  total_amount: number;
  platform_contribution: number;
  player_count: number;
  currency: string;
  recent_winners?: RecentWinner[];
}

interface RecentWinner {
  player_id: string;
  nickname: string;
  avatar?: string;
  amount: number;
  won_at: string;
  rank: number;
}

interface PrizePoolCardProps {
  gameId: string;
  region: string;
  refreshInterval?: number; // milliseconds
  onPoolUpdate?: (data: PrizePoolData) => void;
}

export function PrizePoolCard({
  gameId,
  region,
  refreshInterval = 5000,
  onPoolUpdate,
}: PrizePoolCardProps) {
  const { sdk } = useReplayApi();
  const [poolData, setPoolData] = useState<PrizePoolData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [displayAmount, setDisplayAmount] = useState(0);
  const [_error, setError] = useState<string | null>(null);

  // Fetch pool data from backend via SDK
  const fetchPoolData = useCallback(async () => {
    try {
      // Get pool stats from matchmaking endpoint
      const matchmakingStats = await sdk.matchmaking.getPoolStats(
        gameId,
        undefined,
        region
      );

      if (matchmakingStats) {
        // Calculate prize pool based on player count and tier distribution
        const baseContribution = 2.5; // Base per player
        const tierMultipliers: Record<string, number> = {
          free: 1,
          premium: 2,
          pro: 3,
          elite: 4,
        };

        let estimatedPool = 0;
        const playersByTier = matchmakingStats.players_by_tier || {};
        Object.entries(playersByTier).forEach(([tier, count]) => {
          const multiplier = tierMultipliers[tier] || 1;
          estimatedPool += (count as number) * baseContribution * multiplier;
        });

        // Platform contribution (20% of pool)
        const platformContribution = estimatedPool * 0.2;

        const data: PrizePoolData = {
          pool_id: matchmakingStats.pool_id,
          total_amount: estimatedPool + platformContribution,
          platform_contribution: platformContribution,
          player_count: matchmakingStats.total_players,
          currency: "$",
          recent_winners: [], // Would come from separate prize pool history endpoint
        };

        setPoolData(data);
        onPoolUpdate?.(data);
        setError(null);
      }
    } catch (err) {
      console.error("Failed to fetch prize pool:", err);
      setError("Unable to load prize pool data");
    } finally {
      setIsLoading(false);
    }
  }, [sdk, gameId, region, onPoolUpdate]);

  // Initial fetch and polling
  useEffect(() => {
    fetchPoolData();
    const interval = setInterval(fetchPoolData, refreshInterval);
    return () => clearInterval(interval);
  }, [fetchPoolData, refreshInterval]);

  // Animated counter effect
  useEffect(() => {
    if (!poolData) return;

    const targetAmount = poolData.total_amount;
    const duration = 1000; // 1 second animation
    const steps = 60;
    const increment = (targetAmount - displayAmount) / steps;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      if (currentStep >= steps) {
        setDisplayAmount(targetAmount);
        clearInterval(timer);
      } else {
        setDisplayAmount((prev) => Math.min(prev + increment, targetAmount));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [poolData?.total_amount]);

  if (isLoading) {
    return (
      <Card className="w-full bg-gradient-to-br from-warning-50 to-warning-100 dark:from-warning-900/20 dark:to-warning-800/20 rounded-none border-l-4 border-l-[#FF4654] dark:border-l-[#DCFF37]">
        <CardBody className="gap-4">
          <Skeleton className="h-8 w-48 rounded-none" />
          <Skeleton className="h-16 w-64 rounded-none" />
          <Skeleton className="h-6 w-32 rounded-none" />
        </CardBody>
      </Card>
    );
  }

  if (!poolData) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="w-full bg-gradient-to-br from-warning-50 via-amber-50 to-orange-50 dark:from-warning-900/30 dark:via-amber-900/20 dark:to-orange-900/20 border-2 border-warning-200 dark:border-warning-800 shadow-xl rounded-none border-l-4 border-l-[#FF4654] dark:border-l-[#DCFF37]">
        <CardHeader className="flex items-center justify-between pb-2">
          <div className="flex items-center gap-2">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              <Icon
                icon="solar:cup-star-bold-duotone"
                width={32}
                className="text-warning-600"
              />
            </motion.div>
            <div>
              <h3 className="text-xl font-bold text-warning-800 dark:text-warning-400">
                Prize Pool
              </h3>
              <p className="text-xs text-warning-600 dark:text-warning-500">
                Live · {poolData.player_count} players competing
              </p>
            </div>
          </div>

          <Chip
            startContent={<Icon icon="solar:gift-bold" width={16} />}
            color="success"
            size="sm"
            variant="flat"
            className="animate-pulse"
          >
            +{poolData.currency}
            {poolData.platform_contribution.toFixed(2)} Platform Boost
          </Chip>
        </CardHeader>

        <Divider className="bg-warning-200 dark:bg-warning-800" />

        <CardBody className="gap-4 pt-6">
          {/* Animated Prize Amount */}
          <div className="text-center">
            <motion.div
              key={displayAmount}
              initial={{ scale: 1.2 }}
              animate={{ scale: 1 }}
              className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-warning-600 via-amber-600 to-orange-600 dark:from-warning-400 dark:via-amber-400 dark:to-orange-400"
            >
              {poolData.currency}
              {displayAmount.toFixed(2)}
            </motion.div>
            <p className="text-sm text-warning-700 dark:text-warning-400 mt-1 font-medium">
              Total Prize Money
            </p>
          </div>

          {/* Recent Winners Ticker */}
          {poolData.recent_winners && poolData.recent_winners.length > 0 && (
            <>
              <Divider className="my-2" />
              <div className="space-y-2">
                <div className="flex items-center gap-2 mb-2">
                  <Icon
                    icon="solar:fire-bold"
                    width={16}
                    className="text-warning-600"
                  />
                  <span className="text-xs font-semibold text-warning-700 dark:text-warning-400 uppercase tracking-wide">
                    Recent Winners
                  </span>
                </div>

                <div className="space-y-2 max-h-32 overflow-y-auto custom-scrollbar">
                  <AnimatePresence mode="popLayout">
                    {poolData.recent_winners
                      .slice(0, 5)
                      .map((winner, index) => (
                        <motion.div
                          key={winner.player_id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-center justify-between p-2 rounded-none bg-white/60 dark:bg-black/20 hover:bg-white/80 dark:hover:bg-black/30 transition-colors border-l-2 border-warning-400"
                        >
                          <div className="flex items-center gap-2">
                            <Avatar
                              src={winner.avatar}
                              name={winner.nickname}
                              size="sm"
                              className="flex-shrink-0"
                            />
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-foreground truncate">
                                {winner.nickname}
                              </p>
                              <p className="text-xs text-default-500">
                                {new Date(winner.won_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Chip
                              size="sm"
                              variant="flat"
                              color="warning"
                              className="font-semibold"
                            >
                              {poolData.currency}
                              {winner.amount.toFixed(2)}
                            </Chip>
                            {winner.rank === 1 && (
                              <Icon
                                icon="solar:crown-bold"
                                width={20}
                                className="text-warning-500"
                              />
                            )}
                          </div>
                        </motion.div>
                      ))}
                  </AnimatePresence>
                </div>
              </div>
            </>
          )}

          {/* Pool Growth Indicator */}
          <div className="flex items-center justify-center gap-2 pt-2">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Icon
                icon="solar:chart-2-bold"
                width={16}
                className="text-success-600"
              />
            </motion.div>
            <span className="text-xs font-medium text-success-700 dark:text-success-400">
              Pool growing with each match
            </span>
          </div>
        </CardBody>
      </Card>
    </motion.div>
  );
}

// Custom scrollbar styles (add to globals.css)
// .custom-scrollbar::-webkit-scrollbar { width: 4px; }
// .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
// .custom-scrollbar::-webkit-scrollbar-thumb { background: rgb(var(--nextui-warning-400)); border-radius: 2px; }

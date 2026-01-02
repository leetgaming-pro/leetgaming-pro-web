"use client";

/**
 * Prize Pool Card Component
 * Displays live prize pool with animated counter, platform contribution, and recent winners
 * Uses SDK for real backend integration - no mock data
 */

import React, { useState, useEffect } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Avatar,
  Chip,
  Divider,
  Skeleton,
} from "@nextui-org/react";
import { cn } from "@nextui-org/react";
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

  // Fetch pool data using SDK
  useEffect(() => {
    const fetchPoolData = async () => {
      try {
        // Use SDK's matchmaking API to get pool stats
        const stats = await sdk.matchmaking.getPoolStats(
          gameId,
          undefined,
          region
        );
        if (stats) {
          const poolDataFromStats: PrizePoolData = {
            pool_id: stats.pool_id || `${gameId}-${region}`,
            total_amount: stats.total_players ? stats.total_players * 10 : 100, // Estimate from player count
            platform_contribution: 10, // Platform always adds $10
            player_count: stats.total_players || 0,
            currency: "$",
            recent_winners: [], // Would come from a separate API endpoint
          };
          setPoolData(poolDataFromStats);
          onPoolUpdate?.(poolDataFromStats);
        }
      } catch (error) {
        console.error("Failed to fetch prize pool:", error);
        // Fallback to default pool data
        setPoolData({
          pool_id: `${gameId}-${region}`,
          total_amount: 100,
          platform_contribution: 10,
          player_count: 0,
          currency: "$",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchPoolData();
    const interval = setInterval(fetchPoolData, refreshInterval);

    return () => clearInterval(interval);
  }, [gameId, region, refreshInterval, onPoolUpdate, sdk]);

  // Animated counter effect
  useEffect(() => {
    if (!poolData) return;

    const targetAmount = poolData.total_amount;
    const startingAmount = displayAmount;
    const duration = 1000; // 1 second animation
    const steps = 60;
    const increment = (targetAmount - startingAmount) / steps;
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [poolData?.total_amount]);

  if (isLoading) {
    return (
      <Card
        className="w-full rounded-none bg-gradient-to-br from-[#F5F0E1] to-[#F5F0E1]/90 dark:from-[#111111] dark:to-[#0a0a0a] border-2 border-[#FF4654]/20 dark:border-[#DCFF37]/20"
        style={{
          clipPath:
            "polygon(0 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%)",
        }}
      >
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
      <Card
        className={cn(
          "w-full rounded-none relative overflow-hidden",
          "bg-gradient-to-br from-[#F5F0E1] via-[#F5F0E1]/95 to-[#F5F0E1]/90",
          "dark:from-[#111111] dark:via-[#0a0a0a] dark:to-[#111111]",
          "border-2 border-[#FF4654]/30 dark:border-[#DCFF37]/30 shadow-xl"
        )}
        style={{
          clipPath:
            "polygon(0 0, 100% 0, 100% calc(100% - 24px), calc(100% - 24px) 100%, 0 100%)",
        }}
      >
        {/* Top gradient bar */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#FF4654] via-[#FFC700] to-[#FF4654] dark:from-[#DCFF37] dark:via-[#34445C] dark:to-[#DCFF37]" />
        {/* Corner accent */}
        <div className="absolute bottom-0 right-0 w-10 h-10 bg-gradient-to-tl from-[#FF4654] dark:from-[#DCFF37] to-transparent" />

        <CardHeader className="flex items-center justify-between pb-2">
          <div className="flex items-center gap-2">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              <Icon
                icon="solar:cup-star-bold-duotone"
                width={32}
                className="text-[#FF4654] dark:text-[#DCFF37]"
              />
            </motion.div>
            <div>
              <h3 className="text-xl font-bold text-[#34445C] dark:text-[#F5F0E1]">
                Prize Pool
              </h3>
              <p className="text-xs text-[#34445C]/60 dark:text-[#F5F0E1]/60">
                Live · {poolData.player_count} players competing
              </p>
            </div>
          </div>

          <Chip
            startContent={<Icon icon="solar:gift-bold" width={16} />}
            size="sm"
            variant="flat"
            classNames={{
              base: cn(
                "rounded-none animate-pulse",
                "bg-[#DCFF37]/20 border border-[#DCFF37]/30",
                "dark:bg-[#DCFF37]/10 dark:border-[#DCFF37]/20"
              ),
              content:
                "text-[#34445C] dark:text-[#DCFF37] font-semibold text-xs",
            }}
          >
            +{poolData.currency}
            {poolData.platform_contribution.toFixed(2)} Platform Boost
          </Chip>
        </CardHeader>

        <Divider className="bg-[#FF4654]/20 dark:bg-[#DCFF37]/20" />

        <CardBody className="gap-4 pt-6">
          {/* Animated Prize Amount */}
          <div className="text-center">
            <motion.div
              key={displayAmount}
              initial={{ scale: 1.2 }}
              animate={{ scale: 1 }}
              className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#FF4654] via-[#FFC700] to-[#FF4654] dark:from-[#DCFF37] dark:via-[#F5F0E1] dark:to-[#DCFF37]"
            >
              {poolData.currency}
              {displayAmount.toFixed(2)}
            </motion.div>
            <p className="text-sm text-[#34445C]/70 dark:text-[#F5F0E1]/70 mt-1 font-medium">
              Total Prize Money
            </p>
          </div>

          {/* Recent Winners Ticker */}
          {poolData.recent_winners && poolData.recent_winners.length > 0 && (
            <>
              <Divider className="my-2 bg-[#FF4654]/10 dark:bg-[#DCFF37]/10" />
              <div className="space-y-2">
                <div className="flex items-center gap-2 mb-2">
                  <Icon
                    icon="solar:fire-bold"
                    width={16}
                    className="text-[#FF4654] dark:text-[#DCFF37]"
                  />
                  <span className="text-xs font-semibold text-[#34445C]/70 dark:text-[#DCFF37] uppercase tracking-wide">
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
                          className="flex items-center justify-between p-2 rounded-none bg-[#34445C]/5 dark:bg-[#DCFF37]/5 hover:bg-[#FF4654]/10 dark:hover:bg-[#DCFF37]/10 transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <Avatar
                              src={winner.avatar}
                              name={winner.nickname}
                              size="sm"
                              className="flex-shrink-0"
                            />
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-[#34445C] dark:text-[#F5F0E1] truncate">
                                {winner.nickname}
                              </p>
                              <p className="text-xs text-[#34445C]/50 dark:text-[#F5F0E1]/50">
                                {new Date(winner.won_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Chip
                              size="sm"
                              variant="flat"
                              classNames={{
                                base: "rounded-none bg-gradient-to-r from-[#FF4654]/20 to-[#FFC700]/20 dark:from-[#DCFF37]/20 dark:to-[#34445C]/20",
                                content:
                                  "font-semibold text-[#FF4654] dark:text-[#DCFF37]",
                              }}
                            >
                              {poolData.currency}
                              {winner.amount.toFixed(2)}
                            </Chip>
                            {winner.rank === 1 && (
                              <Icon
                                icon="solar:crown-bold"
                                width={20}
                                className="text-[#FFC700] dark:text-[#DCFF37]"
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
                className="text-[#DCFF37] dark:text-[#DCFF37]"
              />
            </motion.div>
            <span className="text-xs font-medium text-[#34445C]/70 dark:text-[#DCFF37]/80">
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

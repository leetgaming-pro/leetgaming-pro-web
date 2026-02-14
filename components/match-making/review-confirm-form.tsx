/**
 * Review & Confirm Step - Final wizard step
 * Shows summary of all selections before submitting
 */

"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Divider,
  Chip,
} from "@nextui-org/react";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import { useWizard } from "./wizard-context";
import {
  TIER_BENEFITS,
  type MatchmakingTier,
  type PoolStatsResponse,
} from "@/types/replay-api/matchmaking.types";

const DISTRIBUTION_NAMES = {
  winner_takes_all: "Winner Takes All",
  top_three_split_60_30_10: "Top 3 Split (60/30/10)",
  performance_mvp_70_20_10: "Performance MVP (70/20/10)",
};

const GAME_MODE_NAMES: Record<string, string> = {
  free: "Casual",
  single: "Elimination",
  bo3: "Best of 3",
  bo5: "Best of 5",
};

export default function ReviewConfirmForm() {
  const { state, sdk } = useWizard();
  const [poolStats, setPoolStats] = useState<PoolStatsResponse | null>(null);

  // Fetch pool stats during matchmaking search
  const fetchPoolStats = useCallback(async () => {
    if (!state.matchmaking?.isSearching) return;

    try {
      const stats = await sdk.getPoolStats(
        "cs2",
        state.gameMode || "competitive",
        state.region || "na-east",
      );
      if (stats) {
        setPoolStats(stats);
      }
    } catch (error) {
      console.error("Failed to fetch pool stats:", error);
    }
  }, [sdk, state.matchmaking?.isSearching, state.gameMode, state.region]);

  // Poll pool stats every 5 seconds during search
  useEffect(() => {
    if (state.matchmaking?.isSearching) {
      fetchPoolStats();
      const interval = setInterval(fetchPoolStats, 5000);
      return () => clearInterval(interval);
    }
    return undefined;
  }, [state.matchmaking?.isSearching, fetchPoolStats]);

  const tierInfo = state.tier
    ? TIER_BENEFITS[state.tier as MatchmakingTier]
    : null;

  const sections = [
    {
      icon: "solar:crown-bold-duotone",
      title: "Tier",
      value: tierInfo ? tierInfo.name : "Free Tier",
      color: "amber",
    },
    {
      icon: "solar:global-bold-duotone",
      title: "Region",
      value: state.region || "Not selected",
      color: "primary",
    },
    {
      icon: "solar:gameboy-bold-duotone",
      title: "Game Mode",
      value:
        GAME_MODE_NAMES[state.gameMode] || state.gameMode || "Not selected",
      color: "warning",
    },
    {
      icon: "solar:users-group-two-rounded-bold-duotone",
      title: "Team",
      value: state.teamType
        ? `${state.teamType.charAt(0).toUpperCase() + state.teamType.slice(1)}${
            state.selectedFriends?.length
              ? ` (${state.selectedFriends.length} friends)`
              : ""
          }`
        : "Solo",
      color: "green",
    },
    {
      icon: "solar:cup-star-bold-duotone",
      title: "Prize Distribution",
      value:
        DISTRIBUTION_NAMES[
          state.distributionRule as keyof typeof DISTRIBUTION_NAMES
        ] || "Not selected",
      color: "danger",
    },
  ];

  return (
    <div className="space-y-4 sm:space-y-6 px-2 sm:px-0">
      <div className="text-center space-y-2">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="inline-block"
        >
          <div className="rounded-full bg-gradient-to-br from-[#FF4654]/20 to-[#FFC700]/20 dark:from-[#DCFF37]/30 dark:to-[#34445C]/30 p-3 sm:p-4 mb-2 border border-[#FF4654]/30 dark:border-[#DCFF37]/30">
            <Icon
              icon="solar:shield-check-bold-duotone"
              width={36}
              className="text-[#FF4654] dark:text-[#DCFF37] sm:w-12 sm:h-12"
            />
          </div>
        </motion.div>
        <h3 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-[#FF4654] to-[#FFC700] dark:from-[#DCFF37] dark:to-[#34445C] bg-clip-text text-transparent">
          Ready to Compete
        </h3>
        <p className="text-sm text-default-500">
          Review your settings before entering the queue
        </p>
      </div>

      {/* Settings summary - scrollable grid on mobile */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-3">
        {sections.map((section, index) => (
          <motion.div
            key={section.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="hover:shadow-lg transition-all duration-200 rounded-none bg-[#F5F0E1]/80 dark:bg-[#111111]/80 border border-[#FF4654]/20 dark:border-[#DCFF37]/20 hover:border-[#FF4654]/50 dark:hover:border-[#DCFF37]/50">
              <CardBody className="p-3 sm:p-4">
                <div className="flex items-start gap-2 sm:gap-3">
                  <div className="rounded-none p-1.5 sm:p-2.5 bg-gradient-to-br from-[#FF4654]/10 to-[#FFC700]/10 dark:from-[#DCFF37]/20 dark:to-[#34445C]/20 border border-[#FF4654]/20 dark:border-[#DCFF37]/20 flex-shrink-0">
                    <Icon
                      icon={section.icon}
                      width={18}
                      className="text-[#FF4654] dark:text-[#DCFF37] sm:w-5 sm:h-5"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] sm:text-xs font-semibold text-[#34445C]/60 dark:text-[#F5F0E1]/50 uppercase tracking-wider">
                      {section.title}
                    </p>
                    <p className="text-xs sm:text-sm font-bold text-[#34445C] dark:text-[#F5F0E1] mt-0.5 truncate">
                      {section.value}
                    </p>
                  </div>
                </div>
              </CardBody>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Match Details Card - Award-winning branding */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4 }}
      >
        <Card
          className="rounded-none bg-gradient-to-br from-[#F5F0E1] to-[#F5F0E1]/90 dark:from-[#111111] dark:to-[#0a0a0a] border-2 border-[#FF4654]/30 dark:border-[#DCFF37]/30 overflow-hidden relative"
          style={{
            clipPath:
              "polygon(0 0, 100% 0, 100% calc(100% - 16px), calc(100% - 16px) 100%, 0 100%)",
          }}
        >
          {/* Top accent bar */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#FF4654] via-[#FFC700] to-[#FF4654] dark:from-[#DCFF37] dark:via-[#34445C] dark:to-[#DCFF37]" />

          <CardHeader className="flex-col items-start gap-2 pb-2 pt-4">
            <div className="flex items-center gap-2">
              <Icon
                icon="solar:cup-star-bold-duotone"
                width={20}
                className="text-[#FF4654] dark:text-[#DCFF37]"
              />
              <h4 className="font-semibold text-[#34445C] dark:text-[#DCFF37]">
                Match Details
              </h4>
            </div>
          </CardHeader>
          <Divider className="bg-[#FF4654]/20 dark:bg-[#DCFF37]/20" />
          <CardBody className="gap-3 pt-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#34445C]/70 dark:text-[#F5F0E1]/60">
                Expected Pool:
              </span>
              <Chip
                size="sm"
                variant="flat"
                className="rounded-none bg-gradient-to-r from-[#FF4654]/20 to-[#FFC700]/20 dark:from-[#DCFF37]/30 dark:to-[#34445C]/30 text-[#FF4654] dark:text-[#DCFF37] font-bold border border-[#FF4654]/30 dark:border-[#DCFF37]/30"
              >
                ${state.expectedPool?.toFixed(2) || "100.00"}
              </Chip>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#34445C]/70 dark:text-[#F5F0E1]/60">
                Match Type:
              </span>
              <Chip
                size="sm"
                variant="flat"
                className="rounded-none bg-[#FFC700]/20 dark:bg-[#DCFF37]/20 text-[#34445C] dark:text-[#DCFF37] font-semibold border border-[#FFC700]/30 dark:border-[#DCFF37]/30"
              >
                {tierInfo ? tierInfo.name : "Free Tier"}
              </Chip>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#34445C]/70 dark:text-[#F5F0E1]/60">
                Server:
              </span>
              <Chip
                size="sm"
                variant="flat"
                className="rounded-none bg-[#34445C]/10 dark:bg-[#34445C]/30 text-[#34445C] dark:text-[#F5F0E1] border border-[#34445C]/20 dark:border-[#DCFF37]/20"
              >
                {state.region || "Auto-Select"}
              </Chip>
            </div>
          </CardBody>
        </Card>
      </motion.div>

      {/* Ready to Play Indicator */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="flex items-center justify-center gap-3 p-4 rounded-none bg-gradient-to-r from-[#FF4654]/10 via-[#FFC700]/10 to-[#FF4654]/10 dark:from-[#DCFF37]/20 dark:via-[#34445C]/20 dark:to-[#DCFF37]/20 border border-[#FF4654]/30 dark:border-[#DCFF37]/30"
        style={{
          clipPath: "polygon(8px 0, 100% 0, 100% 100%, 0 100%, 0 8px)",
        }}
      >
        <div className="relative">
          <Icon
            icon="solar:play-circle-bold"
            width={28}
            className="text-[#FF4654] dark:text-[#DCFF37]"
          />
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#DCFF37] dark:bg-[#DCFF37] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-[#FF4654] dark:bg-[#DCFF37]"></span>
          </span>
        </div>
        <span className="font-bold text-[#FF4654] dark:text-[#DCFF37] uppercase tracking-wide text-sm">
          Ready to Queue
        </span>
      </motion.div>

      {/* Matchmaking Status */}
      {state.matchmaking?.isSearching && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-4"
        >
          <Card className="rounded-none bg-gradient-to-br from-[#34445C] via-[#34445C]/90 to-[#0a0a0a] dark:from-[#0a0a0a] dark:via-[#111111] dark:to-[#0a0a0a] border-2 border-[#FF4654]/30 dark:border-[#DCFF37]/30 overflow-hidden relative">
            {/* Animated background effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#FF4654]/5 via-[#FFC700]/5 to-[#FF4654]/5 dark:from-[#DCFF37]/5 dark:via-[#34445C]/5 dark:to-[#DCFF37]/5 animate-pulse" />
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#FF4654] via-[#FFC700] to-[#FF4654] dark:from-[#DCFF37] dark:via-[#34445C] dark:to-[#DCFF37]" />

            <CardBody className="p-6 text-center space-y-4 relative z-10">
              <div className="flex justify-center">
                <div className="relative">
                  {/* Outer glow ring */}
                  <div className="absolute inset-0 w-20 h-20 rounded-full bg-gradient-to-r from-[#FF4654]/20 to-[#FFC700]/20 dark:from-[#DCFF37]/20 dark:to-[#34445C]/20 animate-pulse" />
                  {/* Spinning ring */}
                  <div className="w-20 h-20 border-4 border-[#34445C]/50 border-t-[#FF4654] border-r-[#FFC700] dark:border-[#34445C] dark:border-t-[#DCFF37] dark:border-r-[#DCFF37] rounded-full animate-spin" />
                  {/* Center icon */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Icon
                      icon="solar:gamepad-bold"
                      width={28}
                      className="text-[#FF4654] dark:text-[#DCFF37]"
                    />
                  </div>
                </div>
              </div>
              <div>
                <h4 className="text-xl font-bold bg-gradient-to-r from-[#FF4654] to-[#FFC700] dark:from-[#DCFF37] dark:to-[#F5F0E1] bg-clip-text text-transparent mb-3">
                  SEARCHING FOR OPPONENTS
                </h4>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="flex flex-col items-center p-3 rounded-none bg-[#34445C]/50 dark:bg-[#111111]/50 border border-[#FF4654]/20 dark:border-[#DCFF37]/20">
                    <Icon
                      icon="solar:users-group-rounded-bold"
                      width={20}
                      className="text-[#FF4654] dark:text-[#DCFF37] mb-1"
                    />
                    <span className="text-[#F5F0E1]/60 text-xs">Queue</span>
                    <span className="font-bold text-[#F5F0E1]">
                      #{state.matchmaking.queuePosition}
                    </span>
                  </div>
                  <div className="flex flex-col items-center p-3 rounded-none bg-[#34445C]/50 dark:bg-[#111111]/50 border border-[#FF4654]/20 dark:border-[#DCFF37]/20">
                    <Icon
                      icon="solar:clock-circle-bold"
                      width={20}
                      className="text-[#FFC700] dark:text-[#DCFF37] mb-1"
                    />
                    <span className="text-[#F5F0E1]/60 text-xs">Est. Wait</span>
                    <span className="font-bold text-[#F5F0E1]">
                      {Math.floor(state.matchmaking.estimatedWait / 60)}:
                      {String(state.matchmaking.estimatedWait % 60).padStart(
                        2,
                        "0",
                      )}
                    </span>
                  </div>
                  <div className="flex flex-col items-center p-3 rounded-none bg-[#34445C]/50 dark:bg-[#111111]/50 border border-[#FF4654]/20 dark:border-[#DCFF37]/20">
                    <Icon
                      icon="solar:hourglass-bold"
                      width={20}
                      className="text-[#FFC700] mb-1"
                    />
                    <span className="text-[#F5F0E1]/60 text-xs">Elapsed</span>
                    <span className="font-bold text-[#F5F0E1]">
                      {Math.floor(state.matchmaking.elapsedTime / 60)}:
                      {String(state.matchmaking.elapsedTime % 60).padStart(
                        2,
                        "0",
                      )}
                    </span>
                  </div>
                </div>

                {/* Pool Stats Section */}
                {poolStats && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 pt-4 border-t border-[#FF4654]/20 dark:border-[#DCFF37]/20"
                  >
                    <div className="flex items-center justify-center gap-2 mb-3">
                      <Icon
                        icon="solar:chart-bold"
                        width={16}
                        className="text-[#FFC700] dark:text-[#DCFF37]"
                      />
                      <span className="text-xs font-semibold text-[#F5F0E1]/70 uppercase tracking-wider">
                        Queue Activity
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center justify-between p-2 rounded-none bg-[#34445C]/30 dark:bg-[#111111]/30 border border-[#FF4654]/10 dark:border-[#DCFF37]/10">
                        <span className="text-[#F5F0E1]/60 text-xs">
                          Players in Pool
                        </span>
                        <span className="font-bold text-[#DCFF37]">
                          {poolStats.total_players}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-2 rounded-none bg-[#34445C]/30 dark:bg-[#111111]/30 border border-[#FF4654]/10 dark:border-[#DCFF37]/10">
                        <span className="text-[#F5F0E1]/60 text-xs">
                          Queue Health
                        </span>
                        <Chip
                          size="sm"
                          variant="flat"
                          className={`rounded-none text-xs font-bold ${
                            poolStats.queue_health === "healthy"
                              ? "bg-green-500/20 text-green-400"
                              : poolStats.queue_health === "moderate"
                                ? "bg-yellow-500/20 text-yellow-400"
                                : "bg-red-500/20 text-red-400"
                          }`}
                        >
                          {poolStats.queue_health?.toUpperCase()}
                        </Chip>
                      </div>
                    </div>
                    {/* Player Distribution */}
                    {poolStats.players_by_tier && (
                      <div className="mt-3">
                        <span className="text-[#F5F0E1]/60 text-xs block mb-2">
                          Players by Tier
                        </span>
                        <div className="flex gap-1 justify-center">
                          {Object.entries(poolStats.players_by_tier).map(
                            ([tier, count]) => (
                              <Chip
                                key={tier}
                                size="sm"
                                variant="flat"
                                className={`rounded-none text-xs ${
                                  tier === "elite"
                                    ? "bg-purple-500/20 text-purple-300"
                                    : tier === "pro"
                                      ? "bg-blue-500/20 text-blue-300"
                                      : tier === "premium"
                                        ? "bg-yellow-500/20 text-yellow-300"
                                        : "bg-gray-500/20 text-gray-300"
                                }`}
                              >
                                {tier}: {count}
                              </Chip>
                            ),
                          )}
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </div>
            </CardBody>
          </Card>
        </motion.div>
      )}

      {/* Error Display */}
      {state.matchmaking?.error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="rounded-none bg-[#FF4654]/10 dark:bg-[#FF4654]/20 border-2 border-[#FF4654]/40 dark:border-[#FF4654]/60">
            <CardBody className="p-4">
              <div className="flex items-center gap-3">
                <Icon
                  icon="solar:danger-circle-bold"
                  width={24}
                  className="text-[#FF4654] flex-shrink-0"
                />
                <div>
                  <p className="font-semibold text-[#FF4654]">
                    Matchmaking Error
                  </p>
                  <p className="text-sm text-[#FF4654]/80">
                    {state.matchmaking.error}
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>
        </motion.div>
      )}

      {/* Tips - Award-winning branding */}
      {!state.matchmaking?.isSearching && (
        <Card className="rounded-none bg-[#F5F0E1]/60 dark:bg-[#111111]/60 border border-[#34445C]/20 dark:border-[#DCFF37]/20">
          <CardBody className="p-4">
            <div className="flex items-start gap-3">
              <Icon
                icon="solar:lightbulb-bolt-bold-duotone"
                width={20}
                className="text-[#FF4654] dark:text-[#DCFF37] flex-shrink-0 mt-0.5"
              />
              <div className="space-y-1 text-xs text-[#34445C]/80 dark:text-[#F5F0E1]/60">
                <p className="font-semibold text-[#34445C] dark:text-[#F5F0E1]">
                  Pro Tips:
                </p>
                <ul className="list-disc list-inside space-y-0.5">
                  <li>Make sure your squad is ready before searching</li>
                  <li>Your selected region affects matchmaking speed</li>
                  <li>Prize distribution is locked once the match starts</li>
                </ul>
              </div>
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
}

"use client";

/**
 * Match Rewards Preview Component
 * Shows potential winnings while in queue
 * Implements award-winning LeetGaming branding
 */

import React from "react";
import { Card, CardBody, Chip } from "@nextui-org/react";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import { cn } from "@nextui-org/react";
import type { DistributionRule } from "./prize-distribution-selector";

interface MatchRewardsPreviewProps {
  currentPool: number;
  distributionRule: DistributionRule;
  tier: string;
  currency?: string;
  estimatedWaitSeconds?: number;
}

export function MatchRewardsPreview({
  currentPool,
  distributionRule,
  tier,
  currency = "$",
  estimatedWaitSeconds = 0,
}: MatchRewardsPreviewProps) {
  const getRuleName = (rule: DistributionRule) => {
    switch (rule) {
      case "winner_takes_all":
        return "Winner Takes All";
      case "top_three_split_60_30_10":
        return "Top 3 Split";
      case "performance_mvp_70_20_10":
        return "Performance MVP";
      default:
        return "Unknown";
    }
  };

  const getPayouts = (rule: DistributionRule) => {
    switch (rule) {
      case "winner_takes_all":
        return [
          {
            label: "Winner",
            percent: 100,
            icon: "solar:cup-star-bold",
            color: "warning",
          },
        ];
      case "top_three_split_60_30_10":
        return [
          {
            label: "1st Place",
            percent: 60,
            icon: "solar:medal-ribbons-star-bold",
            color: "warning",
          },
          {
            label: "2nd Place",
            percent: 30,
            icon: "solar:medal-ribbon-star-bold",
            color: "default",
          },
          {
            label: "3rd Place",
            percent: 10,
            icon: "solar:medal-ribbon-bold",
            color: "default",
          },
        ];
      case "performance_mvp_70_20_10":
        return [
          {
            label: "Winner",
            percent: 70,
            icon: "solar:cup-star-bold",
            color: "warning",
          },
          {
            label: "Runner-up",
            percent: 20,
            icon: "solar:shield-star-bold",
            color: "default",
          },
          {
            label: "MVP Bonus",
            percent: 10,
            icon: "solar:star-bold",
            color: "secondary",
          },
        ];
      default:
        return [];
    }
  };

  const payouts = getPayouts(distributionRule);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Card
        className={cn(
          "rounded-none relative overflow-hidden",
          "bg-gradient-to-br from-[#F5F0E1] to-[#F5F0E1]/90 dark:from-[#111111] dark:to-[#0a0a0a]",
          "border-2 border-[#FF4654]/30 dark:border-[#DCFF37]/30"
        )}
        style={{
          clipPath:
            "polygon(0 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%)",
        }}
      >
        {/* Corner accent */}
        <div className="absolute bottom-0 right-0 w-8 h-8 bg-gradient-to-tl from-[#FF4654] dark:from-[#DCFF37] to-transparent" />
        {/* Top gradient bar */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#FF4654] via-[#FFC700] to-[#FF4654] dark:from-[#DCFF37] dark:via-[#34445C] dark:to-[#DCFF37]" />

        <CardBody className="gap-4 pt-5">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              >
                <Icon
                  icon="solar:dollar-minimalistic-bold-duotone"
                  width={24}
                  className="text-[#FF4654] dark:text-[#DCFF37]"
                />
              </motion.div>
              <div>
                <h4 className="font-semibold text-[#34445C] dark:text-[#F5F0E1]">
                  Potential Rewards
                </h4>
                <p className="text-xs text-[#34445C]/60 dark:text-[#F5F0E1]/60">
                  {getRuleName(distributionRule)}
                </p>
              </div>
            </div>
            <Chip
              size="sm"
              variant="flat"
              classNames={{
                base: cn(
                  "rounded-none",
                  "bg-gradient-to-r from-[#FF4654]/20 to-[#FFC700]/20 dark:from-[#DCFF37]/20 dark:to-[#34445C]/20",
                  "border border-[#FF4654]/30 dark:border-[#DCFF37]/30"
                ),
                content:
                  "text-[#FF4654] dark:text-[#DCFF37] font-semibold text-xs",
              }}
            >
              {tier} Tier
            </Chip>
          </div>

          {/* Prize Breakdown */}
          <div className="space-y-2">
            {payouts.map((payout, index) => {
              const amount = ((currentPool * payout.percent) / 100).toFixed(2);

              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-3 rounded-none bg-[#34445C]/5 dark:bg-[#DCFF37]/5 hover:bg-[#FF4654]/10 dark:hover:bg-[#DCFF37]/10 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "p-2 rounded-none",
                        payout.color === "warning"
                          ? "bg-gradient-to-br from-[#FF4654]/20 to-[#FFC700]/20 dark:from-[#DCFF37]/20 dark:to-[#34445C]/20"
                          : payout.color === "secondary"
                          ? "bg-[#FFC700]/20 dark:bg-[#DCFF37]/20"
                          : "bg-[#34445C]/10 dark:bg-[#F5F0E1]/10"
                      )}
                    >
                      <Icon
                        icon={payout.icon}
                        width={20}
                        className={
                          payout.color === "warning"
                            ? "text-[#FF4654] dark:text-[#DCFF37]"
                            : payout.color === "secondary"
                            ? "text-[#FFC700] dark:text-[#DCFF37]/80"
                            : "text-[#34445C]/60 dark:text-[#F5F0E1]/60"
                        }
                      />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#34445C] dark:text-[#F5F0E1]">
                        {payout.label}
                      </p>
                      <p className="text-xs text-[#34445C]/50 dark:text-[#F5F0E1]/50">
                        {payout.percent}% of pool
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <motion.p
                      key={amount}
                      initial={{ scale: 1.2 }}
                      animate={{ scale: 1 }}
                      className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#FF4654] to-[#FFC700] dark:from-[#DCFF37] dark:to-[#34445C]"
                    >
                      {currency}
                      {amount}
                    </motion.p>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Match Probability Hint */}
          <div className="flex items-start gap-2 p-3 rounded-none bg-[#DCFF37]/10 dark:bg-[#DCFF37]/5 border border-[#DCFF37]/30 dark:border-[#DCFF37]/20">
            <Icon
              icon="solar:chart-2-bold-duotone"
              width={20}
              className="text-[#34445C] dark:text-[#DCFF37] flex-shrink-0 mt-0.5"
            />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-[#34445C] dark:text-[#DCFF37] mb-1">
                Your Winning Chances
              </p>
              <p className="text-xs text-[#34445C]/70 dark:text-[#F5F0E1]/60">
                {tier === "Elite" &&
                  "Elite tier matches you with top 5% players. Higher skill = better odds."}
                {tier === "Pro" &&
                  "Pro tier provides balanced matchmaking. AI optimizes team composition."}
                {tier === "Premium" &&
                  "Premium tier offers fair matchmaking. Focus on teamwork for best results."}
                {tier === "Free" &&
                  "Free tier has wider skill ranges. Consistent performance improves your chances."}
              </p>
            </div>
          </div>

          {/* Estimated Time */}
          {estimatedWaitSeconds > 0 && (
            <div className="flex items-center justify-between text-xs text-[#34445C]/60 dark:text-[#F5F0E1]/60">
              <span>Est. match start:</span>
              <span className="font-semibold text-[#FF4654] dark:text-[#DCFF37]">
                {estimatedWaitSeconds < 60
                  ? `${estimatedWaitSeconds}s`
                  : `${Math.floor(estimatedWaitSeconds / 60)}m ${
                      estimatedWaitSeconds % 60
                    }s`}
              </span>
            </div>
          )}
        </CardBody>
      </Card>
    </motion.div>
  );
}

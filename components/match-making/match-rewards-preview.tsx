"use client";

/**
 * Match Rewards Preview Component
 * Shows potential winnings while in queue
 */

import React from "react";
import { Card, CardBody, Chip, Progress } from "@nextui-org/react";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
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
      <Card className="bg-gradient-to-br from-primary-50/50 to-secondary-50/50 dark:from-primary-900/10 dark:to-secondary-900/10 border border-primary-200 dark:border-primary-800">
        <CardBody className="gap-4">
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
                  className="text-primary-600"
                />
              </motion.div>
              <div>
                <h4 className="font-semibold text-foreground">
                  Potential Rewards
                </h4>
                <p className="text-xs text-default-600">
                  {getRuleName(distributionRule)}
                </p>
              </div>
            </div>
            <Chip size="sm" variant="flat" color="primary">
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
                  className="flex items-center justify-between p-3 rounded-lg bg-white/60 dark:bg-black/20 hover:bg-white/80 dark:hover:bg-black/30 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-lg ${
                        payout.color === "warning"
                          ? "bg-warning-100 dark:bg-warning-900/30"
                          : payout.color === "secondary"
                          ? "bg-secondary-100 dark:bg-secondary-900/30"
                          : "bg-default-100 dark:bg-default-900/30"
                      }`}
                    >
                      <Icon
                        icon={payout.icon}
                        width={20}
                        className={
                          payout.color === "warning"
                            ? "text-warning-600"
                            : payout.color === "secondary"
                            ? "text-secondary-600"
                            : "text-default-600"
                        }
                      />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        {payout.label}
                      </p>
                      <p className="text-xs text-default-500">
                        {payout.percent}% of pool
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <motion.p
                      key={amount}
                      initial={{ scale: 1.2 }}
                      animate={{ scale: 1 }}
                      className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-warning-600 to-orange-600 dark:from-warning-400 dark:to-orange-400"
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
          <div className="flex items-start gap-2 p-3 rounded-lg bg-success-50 dark:bg-success-900/20 border border-success-200 dark:border-success-800">
            <Icon
              icon="solar:chart-2-bold-duotone"
              width={20}
              className="text-success-600 flex-shrink-0 mt-0.5"
            />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-success-700 dark:text-success-400 mb-1">
                Your Winning Chances
              </p>
              <p className="text-xs text-success-600 dark:text-success-500">
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
            <div className="flex items-center justify-between text-xs text-default-600">
              <span>Est. match start:</span>
              <span className="font-semibold">
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

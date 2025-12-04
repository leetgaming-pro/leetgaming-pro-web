"use client";

/**
 * Prize Distribution Selector Component
 * Beautiful cards for choosing how prize money is distributed
 */

import React, { useState } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Chip,
  Radio,
  RadioGroup,
  Divider,
} from "@nextui-org/react";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";

export type DistributionRule =
  | "winner_takes_all"
  | "top_three_split_60_30_10"
  | "performance_mvp_70_20_10";

interface DistributionOption {
  id: DistributionRule;
  name: string;
  icon: string;
  description: string;
  percentages: { label: string; percent: number; color: string }[];
  benefits: string[];
  risk: "high" | "medium" | "low";
}

const DISTRIBUTION_OPTIONS: DistributionOption[] = [
  {
    id: "winner_takes_all",
    name: "Winner Takes All",
    icon: "solar:cup-star-bold-duotone",
    description: "100% of the prize pool goes to the winning team",
    percentages: [{ label: "1st Place", percent: 100, color: "warning" }],
    benefits: [
      "Maximum prize for winner",
      "High-stakes competitive pressure",
      "Simple and clear reward structure",
    ],
    risk: "high",
  },
  {
    id: "top_three_split_60_30_10",
    name: "Top 3 Split",
    icon: "solar:ranking-bold-duotone",
    description: "Prize split across top three performing teams",
    percentages: [
      { label: "1st Place", percent: 60, color: "warning" },
      { label: "2nd Place", percent: 30, color: "default" },
      { label: "3rd Place", percent: 10, color: "default" },
    ],
    benefits: [
      "Rewards multiple top performers",
      "Balanced competition incentive",
      "More players earn prizes",
    ],
    risk: "medium",
  },
  {
    id: "performance_mvp_70_20_10",
    name: "Performance MVP",
    icon: "solar:medal-star-bold-duotone",
    description: "Rewards winning team and best individual player",
    percentages: [
      { label: "1st Place", percent: 70, color: "warning" },
      { label: "2nd Place", percent: 20, color: "default" },
      { label: "MVP Bonus", percent: 10, color: "secondary" },
    ],
    benefits: [
      "Recognizes individual skill",
      "Encourages standout performances",
      "Fair team and player rewards",
    ],
    risk: "low",
  },
];

interface PrizeDistributionSelectorProps {
  currentPool: number;
  selectedRule: DistributionRule;
  onSelectRule: (rule: DistributionRule) => void;
  currency?: string;
}

export function PrizeDistributionSelector({
  currentPool,
  selectedRule,
  onSelectRule,
  currency = "$",
}: PrizeDistributionSelectorProps) {
  const [hoveredRule, setHoveredRule] = useState<DistributionRule | null>(null);

  const calculatePayout = (percent: number) => {
    return ((currentPool * percent) / 100).toFixed(2);
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "high":
        return "danger";
      case "medium":
        return "warning";
      case "low":
        return "success";
      default:
        return "default";
    }
  };

  return (
    <div className="space-y-4">
      <div className="text-center space-y-2">
        <h3 className="text-2xl font-bold">Choose Prize Distribution</h3>
        <p className="text-default-600">
          Select how the{" "}
          <span className="font-semibold text-warning">
            {currency}
            {currentPool.toFixed(2)}
          </span>{" "}
          prize pool will be distributed
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {DISTRIBUTION_OPTIONS.map((option, index) => {
          const isSelected = selectedRule === option.id;
          const isHovered = hoveredRule === option.id;

          return (
            <motion.div
              key={option.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onHoverStart={() => setHoveredRule(option.id)}
              onHoverEnd={() => setHoveredRule(null)}
              className="h-full"
            >
              <Card
                isPressable
                isHoverable
                className={`h-full transition-all duration-300 ${
                  isSelected
                    ? "border-2 border-warning-500 shadow-xl scale-105 bg-warning-50/50 dark:bg-warning-900/20"
                    : isHovered
                    ? "border-2 border-default-300 shadow-lg scale-102"
                    : "border-2 border-transparent shadow-md"
                }`}
                onPress={() => onSelectRule(option.id)}
              >
                <CardHeader className="flex-col items-start gap-2 pb-4">
                  <div className="flex items-center justify-between w-full">
                    <motion.div
                      animate={
                        isSelected
                          ? { rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }
                          : {}
                      }
                      transition={{ duration: 0.5 }}
                    >
                      <Icon
                        icon={option.icon}
                        width={40}
                        className={`${
                          isSelected ? "text-warning-600" : "text-default-400"
                        } transition-colors`}
                      />
                    </motion.div>

                    <Chip
                      size="sm"
                      variant="flat"
                      color={getRiskColor(option.risk)}
                      className="uppercase text-xs font-semibold"
                    >
                      {option.risk} risk
                    </Chip>
                  </div>

                  <div className="w-full">
                    <h4 className="text-lg font-bold text-foreground">
                      {option.name}
                    </h4>
                    <p className="text-sm text-default-600 mt-1">
                      {option.description}
                    </p>
                  </div>
                </CardHeader>

                <Divider />

                <CardBody className="gap-4 pt-4">
                  {/* Prize Breakdown */}
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-default-600 uppercase tracking-wide">
                      Prize Breakdown
                    </p>
                    {option.percentages.map((payout, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 * idx }}
                        className="flex items-center justify-between p-2 rounded-lg bg-default-100/50 dark:bg-default-50/5"
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-2 h-2 rounded-full ${
                              payout.color === "warning"
                                ? "bg-warning-500"
                                : payout.color === "secondary"
                                ? "bg-secondary-500"
                                : "bg-default-400"
                            }`}
                          />
                          <span className="text-sm font-medium">
                            {payout.label}
                          </span>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-warning-600">
                            {currency}
                            {calculatePayout(payout.percent)}
                          </p>
                          <p className="text-xs text-default-500">
                            {payout.percent}%
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  <Divider />

                  {/* Benefits */}
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-default-600 uppercase tracking-wide">
                      Benefits
                    </p>
                    <ul className="space-y-1">
                      {option.benefits.map((benefit, idx) => (
                        <motion.li
                          key={idx}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.2 + 0.1 * idx }}
                          className="flex items-start gap-2 text-xs text-default-600"
                        >
                          <Icon
                            icon="solar:check-circle-bold"
                            width={14}
                            className={`flex-shrink-0 mt-0.5 ${
                              isSelected
                                ? "text-success-500"
                                : "text-default-400"
                            }`}
                          />
                          <span>{benefit}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </div>

                  {/* Selected Indicator */}
                  {isSelected && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex items-center justify-center gap-2 p-2 rounded-lg bg-warning-100 dark:bg-warning-900/30 border border-warning-300 dark:border-warning-700"
                    >
                      <Icon
                        icon="solar:check-circle-bold"
                        width={16}
                        className="text-warning-600"
                      />
                      <span className="text-xs font-semibold text-warning-700 dark:text-warning-400">
                        Selected
                      </span>
                    </motion.div>
                  )}
                </CardBody>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Visual Preview of Distribution */}
      <Card className="bg-gradient-to-br from-default-50 to-default-100 dark:from-default-900/20 dark:to-default-800/20">
        <CardBody className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-default-700">
              Distribution Preview
            </h4>
            <Chip size="sm" variant="flat" color="warning">
              {DISTRIBUTION_OPTIONS.find((o) => o.id === selectedRule)?.name}
            </Chip>
          </div>
          <div className="relative h-12 bg-default-200 dark:bg-default-800 rounded-full overflow-hidden">
            {DISTRIBUTION_OPTIONS.find(
              (o) => o.id === selectedRule
            )?.percentages.map((payout, idx) => {
              const previousPercent =
                DISTRIBUTION_OPTIONS.find((o) => o.id === selectedRule)
                  ?.percentages.slice(0, idx)
                  .reduce((sum, p) => sum + p.percent, 0) || 0;

              return (
                <motion.div
                  key={idx}
                  initial={{ width: 0 }}
                  animate={{ width: `${payout.percent}%` }}
                  transition={{ duration: 0.8, delay: idx * 0.2 }}
                  className={`absolute h-full ${
                    payout.color === "warning"
                      ? "bg-warning-500"
                      : payout.color === "secondary"
                      ? "bg-secondary-500"
                      : "bg-default-400"
                  }`}
                  style={{ left: `${previousPercent}%` }}
                >
                  <div className="flex items-center justify-center h-full text-white font-semibold text-sm">
                    {payout.percent >= 20 && `${payout.percent}%`}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

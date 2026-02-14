"use client";

/**
 * Prize Distribution Selector Component
 * Beautiful cards for choosing how prize money is distributed
 * Implements award-winning LeetGaming branding patterns
 */

import React, { useState, useEffect } from "react";
import { Card, CardBody, CardHeader, Chip, Divider } from "@nextui-org/react";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import { cn } from "@nextui-org/react";
import { useTheme } from "next-themes";
import { title } from "../primitives";

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
  const { theme: rawTheme } = useTheme();
  // Use mounted state to prevent hydration mismatch
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const theme = mounted ? (rawTheme === "dark" ? "dark" : "light") : "light";

  const calculatePayout = (percent: number) => {
    return ((currentPool * percent) / 100).toFixed(2);
  };

  return (
    <div className="space-y-4 px-2 sm:px-0">
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Icon
            icon="solar:wallet-money-bold-duotone"
            className="text-[#FF4654] dark:text-[#DCFF37]"
            width={28}
          />
          <h3
            className={title({
              color: theme === "dark" ? "battleLime" : "battleNavy",
              size: "sm",
            })}
          >
            Prize Distribution
          </h3>
        </div>
        <p className="text-sm text-[#34445C]/70 dark:text-[#F5F0E1]/70">
          Select how the{" "}
          <span className="font-bold text-[#FF4654] dark:text-[#DCFF37]">
            {currency}
            {currentPool.toFixed(2)}
          </span>{" "}
          prize pool will be distributed
        </p>
      </div>

      {/* Grid - single column on mobile */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
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
                className={cn(
                  "h-full transition-all duration-300 rounded-none",
                  "bg-[#F5F0E1] dark:bg-[#111111]",
                  isSelected
                    ? "border-2 border-[#FF4654] dark:border-[#DCFF37] shadow-xl scale-105 bg-[#FF4654]/10 dark:bg-[#DCFF37]/10"
                    : isHovered
                      ? "border-2 border-[#FF4654]/50 dark:border-[#DCFF37]/50 shadow-lg scale-102"
                      : "border-2 border-[#34445C]/20 dark:border-[#DCFF37]/20 shadow-md",
                )}
                style={{
                  clipPath: isSelected
                    ? "polygon(0 0, 100% 0, 100% calc(100% - 16px), calc(100% - 16px) 100%, 0 100%)"
                    : undefined,
                }}
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
                        className={cn(
                          "transition-colors",
                          isSelected
                            ? "text-[#FF4654] dark:text-[#DCFF37]"
                            : "text-[#34445C]/50 dark:text-[#F5F0E1]/50",
                        )}
                      />
                    </motion.div>

                    <Chip
                      size="sm"
                      variant="flat"
                      classNames={{
                        base: cn(
                          "uppercase text-xs font-semibold rounded-none",
                          option.risk === "high" &&
                            "bg-[#FF4654]/20 text-[#FF4654] dark:bg-[#FF4654]/30 dark:text-[#FF4654]",
                          option.risk === "medium" &&
                            "bg-[#FFC700]/20 text-[#FFC700] dark:bg-[#FFC700]/30 dark:text-[#FFC700]",
                          option.risk === "low" &&
                            "bg-[#DCFF37]/20 text-[#34445C] dark:bg-[#DCFF37]/30 dark:text-[#DCFF37]",
                        ),
                      }}
                    >
                      {option.risk} risk
                    </Chip>
                  </div>

                  <div className="w-full">
                    <h4 className="text-lg font-bold text-[#34445C] dark:text-[#F5F0E1]">
                      {option.name}
                    </h4>
                    <p className="text-sm text-[#34445C]/60 dark:text-[#F5F0E1]/60 mt-1">
                      {option.description}
                    </p>
                  </div>
                </CardHeader>

                <Divider className="bg-[#34445C]/10 dark:bg-[#DCFF37]/10" />

                <CardBody className="gap-4 pt-4">
                  {/* Prize Breakdown */}
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-[#34445C]/60 dark:text-[#DCFF37]/70 uppercase tracking-wide">
                      Prize Breakdown
                    </p>
                    {option.percentages.map((payout, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 * idx }}
                        className="flex items-center justify-between p-2 rounded-none bg-[#34445C]/5 dark:bg-[#DCFF37]/5"
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className={cn(
                              "w-2 h-2",
                              payout.color === "warning"
                                ? "bg-gradient-to-r from-[#FF4654] to-[#FFC700] dark:bg-[#DCFF37]"
                                : payout.color === "secondary"
                                  ? "bg-[#FFC700] dark:bg-[#DCFF37]/70"
                                  : "bg-[#34445C]/40 dark:bg-[#F5F0E1]/40",
                            )}
                            style={{
                              clipPath:
                                "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)",
                            }}
                          />
                          <span className="text-sm font-medium text-[#34445C] dark:text-[#F5F0E1]">
                            {payout.label}
                          </span>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-[#FF4654] dark:text-[#DCFF37]">
                            {currency}
                            {calculatePayout(payout.percent)}
                          </p>
                          <p className="text-xs text-[#34445C]/50 dark:text-[#F5F0E1]/50">
                            {payout.percent}%
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  <Divider className="bg-[#34445C]/10 dark:bg-[#DCFF37]/10" />

                  {/* Benefits */}
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-[#34445C]/60 dark:text-[#DCFF37]/70 uppercase tracking-wide">
                      Benefits
                    </p>
                    <ul className="space-y-1">
                      {option.benefits.map((benefit, idx) => (
                        <motion.li
                          key={idx}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.2 + 0.1 * idx }}
                          className="flex items-start gap-2 text-xs text-[#34445C]/70 dark:text-[#F5F0E1]/70"
                        >
                          <Icon
                            icon="solar:check-circle-bold"
                            width={14}
                            className={cn(
                              "flex-shrink-0 mt-0.5",
                              isSelected
                                ? "text-[#FF4654] dark:text-[#DCFF37]"
                                : "text-[#34445C]/40 dark:text-[#F5F0E1]/40",
                            )}
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
                      className="flex items-center justify-center gap-2 p-2 rounded-none bg-gradient-to-r from-[#FF4654]/20 to-[#FFC700]/20 dark:from-[#DCFF37]/20 dark:to-[#34445C]/20 border border-[#FF4654]/30 dark:border-[#DCFF37]/30"
                    >
                      <Icon
                        icon="solar:check-circle-bold"
                        width={16}
                        className="text-[#FF4654] dark:text-[#DCFF37]"
                      />
                      <span className="text-xs font-semibold text-[#FF4654] dark:text-[#DCFF37]">
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

      {/* Visual Preview of Distribution - Award-winning branding */}
      <Card
        className="bg-gradient-to-br from-[#F5F0E1] to-[#F5F0E1]/90 dark:from-[#111111] dark:to-[#0a0a0a] border-2 border-[#FF4654]/20 dark:border-[#DCFF37]/20 rounded-none relative overflow-hidden"
        style={{
          clipPath:
            "polygon(0 0, 100% 0, 100% calc(100% - 24px), calc(100% - 24px) 100%, 0 100%)",
        }}
      >
        {/* Corner accent */}
        <div className="absolute bottom-0 right-0 w-10 h-10 bg-gradient-to-tl from-[#FF4654] dark:from-[#DCFF37] to-transparent" />

        <CardBody className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Icon
                icon="solar:chart-square-bold-duotone"
                className="text-[#FF4654] dark:text-[#DCFF37]"
                width={20}
              />
              <h4 className="font-semibold text-[#34445C] dark:text-[#F5F0E1]">
                Distribution Preview
              </h4>
            </div>
            <Chip
              size="sm"
              variant="flat"
              classNames={{
                base: "rounded-none bg-gradient-to-r from-[#FF4654]/20 to-[#FFC700]/20 dark:from-[#DCFF37]/20 dark:to-[#34445C]/20 border border-[#FF4654]/30 dark:border-[#DCFF37]/30",
                content:
                  "text-[#FF4654] dark:text-[#DCFF37] font-semibold text-xs",
              }}
            >
              {DISTRIBUTION_OPTIONS.find((o) => o.id === selectedRule)?.name}
            </Chip>
          </div>

          {/* Progress bar with brand gradient */}
          <div className="relative h-12 bg-[#34445C]/10 dark:bg-[#DCFF37]/10 rounded-none overflow-hidden border border-[#34445C]/20 dark:border-[#DCFF37]/20">
            {DISTRIBUTION_OPTIONS.find(
              (o) => o.id === selectedRule,
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
                  className={cn(
                    "absolute h-full",
                    payout.color === "warning"
                      ? "bg-gradient-to-r from-[#FF4654] to-[#FFC700] dark:from-[#DCFF37] dark:to-[#34445C]"
                      : payout.color === "secondary"
                        ? "bg-[#FFC700] dark:bg-[#DCFF37]/70"
                        : "bg-[#34445C]/40 dark:bg-[#F5F0E1]/40",
                  )}
                  style={{ left: `${previousPercent}%` }}
                >
                  <div className="flex items-center justify-center h-full text-white dark:text-[#1a1a1a] font-bold text-sm">
                    {payout.percent >= 20 && `${payout.percent}%`}
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-4 mt-4">
            {DISTRIBUTION_OPTIONS.find(
              (o) => o.id === selectedRule,
            )?.percentages.map((payout, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <div
                  className={cn(
                    "w-3 h-3",
                    payout.color === "warning"
                      ? "bg-gradient-to-r from-[#FF4654] to-[#FFC700] dark:from-[#DCFF37] dark:to-[#34445C]"
                      : payout.color === "secondary"
                        ? "bg-[#FFC700] dark:bg-[#DCFF37]/70"
                        : "bg-[#34445C]/40 dark:bg-[#F5F0E1]/40",
                  )}
                  style={{
                    clipPath: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)",
                  }}
                />
                <span className="text-xs text-[#34445C]/70 dark:text-[#F5F0E1]/70">
                  {payout.label}:{" "}
                  <span className="font-semibold text-[#FF4654] dark:text-[#DCFF37]">
                    {currency}
                    {calculatePayout(payout.percent)}
                  </span>
                </span>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

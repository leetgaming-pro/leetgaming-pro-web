/**
 * Tier Selection Form - Choose your competitive tier
 * Award-winning design with pricing and benefits
 */

"use client";

import React from "react";
import { Card, CardBody, Chip, Button } from "@nextui-org/react";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import { useWizard } from "./wizard-context";
import {
  TIER_BENEFITS,
  type MatchmakingTier,
} from "@/types/replay-api/matchmaking.types";

export default function TierSelectionForm() {
  const { state, updateState } = useWizard();

  const handleTierSelect = (tierId: MatchmakingTier) => {
    updateState({ tier: tierId });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="inline-block"
        >
          <div className="rounded-full bg-gradient-to-br from-[#FF4654]/20 to-[#FFC700]/20 dark:from-[#DCFF37]/30 dark:to-[#34445C]/30 p-4 mb-3 border border-[#FF4654]/30 dark:border-[#DCFF37]/30">
            <Icon
              icon="solar:crown-bold-duotone"
              width={48}
              className="text-[#FF4654] dark:text-[#DCFF37]"
            />
          </div>
        </motion.div>
        <h3 className="text-2xl font-bold bg-gradient-to-r from-[#FF4654] to-[#FFC700] dark:from-[#DCFF37] dark:to-[#34445C] bg-clip-text text-transparent">
          Choose Your Tier
        </h3>
        <p className="text-default-500">
          Select a tier that matches your competitive goals
        </p>
      </div>

      {/* Tier Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.values(TIER_BENEFITS).map((tier, index) => {
          const isSelected = state.tier === tier.tier;

          return (
            <motion.div
              key={tier.tier}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="h-full"
            >
              <Card
                isPressable
                isHoverable
                className={`h-full cursor-pointer transition-all duration-300 rounded-none ${
                  isSelected
                    ? "border-2 border-[#FF4654] dark:border-[#DCFF37] bg-gradient-to-br from-[#FF4654]/10 via-[#FFC700]/5 to-transparent dark:from-[#DCFF37]/20 dark:via-[#34445C]/10 dark:to-transparent shadow-lg shadow-[#FF4654]/20 dark:shadow-[#DCFF37]/20"
                    : "border border-[#34445C]/20 dark:border-[#DCFF37]/10 bg-[#F5F0E1]/50 dark:bg-[#111111]/50 hover:border-[#FF4654]/50 dark:hover:border-[#DCFF37]/50 hover:shadow-md"
                }`}
                onPress={() => handleTierSelect(tier.tier)}
              >
                {/* Selection indicator accent bar */}
                {isSelected && (
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#FF4654] via-[#FFC700] to-[#FF4654] dark:from-[#DCFF37] dark:via-[#34445C] dark:to-[#DCFF37]" />
                )}

                <CardBody className="p-6 space-y-4">
                  {/* Header with icon and price */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded-lg bg-gradient-to-br ${
                          isSelected
                            ? "from-[#FF4654]/20 to-[#FFC700]/20 dark:from-[#DCFF37]/30 dark:to-[#34445C]/30"
                            : "from-default-100 to-default-200 dark:from-default-100/20 dark:to-default-200/20"
                        }`}
                      >
                        <Icon
                          icon={tier.icon}
                          width={28}
                          className={
                            isSelected
                              ? "text-[#FF4654] dark:text-[#DCFF37]"
                              : "text-default-500"
                          }
                        />
                      </div>
                      <div>
                        <h4
                          className={`text-lg font-bold ${
                            isSelected
                              ? "text-[#FF4654] dark:text-[#DCFF37]"
                              : "text-[#34445C] dark:text-[#F5F0E1]"
                          }`}
                        >
                          {tier.name}
                        </h4>
                        <p className="text-xs text-default-500">
                          {tier.waitTimeReduction}% faster queue
                        </p>
                      </div>
                    </div>
                    {tier.price > 0 ? (
                      <Chip
                        size="sm"
                        variant="flat"
                        className={`rounded-none font-bold ${
                          isSelected
                            ? "bg-[#FF4654]/20 dark:bg-[#DCFF37]/30 text-[#FF4654] dark:text-[#DCFF37]"
                            : "bg-default-100 text-default-600"
                        }`}
                      >
                        ${tier.price}/mo
                      </Chip>
                    ) : (
                      <Chip
                        size="sm"
                        variant="flat"
                        className="rounded-none bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 font-bold"
                      >
                        FREE
                      </Chip>
                    )}
                  </div>

                  {/* Features list */}
                  <ul className="space-y-2">
                    {tier.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm">
                        <Icon
                          icon="solar:check-circle-bold"
                          className={`mt-0.5 flex-shrink-0 ${
                            isSelected
                              ? "text-[#FF4654] dark:text-[#DCFF37]"
                              : "text-green-500"
                          }`}
                          width={16}
                        />
                        <span className="text-[#34445C]/80 dark:text-[#F5F0E1]/70">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* Selection button */}
                  <Button
                    size="sm"
                    className={`w-full rounded-none font-semibold ${
                      isSelected
                        ? "bg-gradient-to-r from-[#FF4654] to-[#FFC700] dark:from-[#DCFF37] dark:to-[#34445C] text-white dark:text-[#1a1a1a]"
                        : "bg-[#34445C]/10 dark:bg-[#DCFF37]/10 text-[#34445C] dark:text-[#DCFF37] hover:bg-[#34445C]/20 dark:hover:bg-[#DCFF37]/20"
                    }`}
                    startContent={
                      isSelected ? (
                        <Icon icon="solar:check-circle-bold" width={18} />
                      ) : (
                        <Icon icon="solar:add-circle-line-duotone" width={18} />
                      )
                    }
                  >
                    {isSelected ? "Selected" : "Select Tier"}
                  </Button>
                </CardBody>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Selected tier summary */}
      {state.tier && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-none bg-gradient-to-r from-[#FF4654]/10 to-[#FFC700]/10 dark:from-[#DCFF37]/20 dark:to-[#34445C]/20 border border-[#FF4654]/30 dark:border-[#DCFF37]/30"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icon
                icon={TIER_BENEFITS[state.tier].icon}
                width={24}
                className="text-[#FF4654] dark:text-[#DCFF37]"
              />
              <span className="font-bold text-[#34445C] dark:text-[#F5F0E1]">
                {TIER_BENEFITS[state.tier].name} Tier
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Icon
                icon="solar:bolt-bold"
                className="text-amber-500"
                width={16}
              />
              <span className="text-[#34445C]/70 dark:text-[#F5F0E1]/70">
                {TIER_BENEFITS[state.tier].waitTimeReduction}% faster
                matchmaking
              </span>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

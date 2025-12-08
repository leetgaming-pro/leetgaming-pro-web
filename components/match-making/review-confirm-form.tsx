/**
 * Review & Confirm Step - Final wizard step
 * Shows summary of all selections before submitting
 */

"use client";

import React from "react";
import { Card, CardBody, CardHeader, Divider, Chip } from "@nextui-org/react";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import { useWizard } from "./wizard-context";

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
  const { state } = useWizard();

  const sections = [
    {
      icon: "solar:global-bold-duotone",
      title: "Region",
      value: state.region || "Not selected",
      color: "cyan",
    },
    {
      icon: "solar:gameboy-bold-duotone",
      title: "Game Mode",
      value:
        GAME_MODE_NAMES[state.gameMode] || state.gameMode || "Not selected",
      color: "purple",
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
      color: "amber",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="inline-block"
        >
          <div className="rounded-none bg-gradient-to-br from-[#FF4654]/20 via-[#FFC700]/10 to-[#34445C]/20 dark:from-[#DCFF37]/20 dark:to-[#34445C]/30 p-4 mb-3 border border-[#FF4654]/30 dark:border-[#DCFF37]/30">
            <Icon
              icon="solar:shield-check-bold-duotone"
              width={48}
              className="text-[#FF4654] dark:text-[#DCFF37]"
            />
          </div>
        </motion.div>
        <h3 className="text-2xl font-bold bg-gradient-to-r from-[#FF4654] to-[#FFC700] dark:from-[#DCFF37] dark:to-[#34445C] bg-clip-text text-transparent">
          Ready to Compete
        </h3>
        <p className="text-default-500">
          Review your match settings before entering the queue
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {sections.map((section, index) => (
          <motion.div
            key={section.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="hover:shadow-lg transition-all duration-200 bg-default-50 dark:bg-[#111111] border border-default-200 dark:border-[#DCFF37]/20 hover:border-[#FF4654]/30 dark:hover:border-[#DCFF37]/30 rounded-none">
              <CardBody className="p-4">
                <div className="flex items-start gap-3">
                  <div
                    className={`rounded-lg p-2.5 bg-${section.color}-100 dark:bg-${section.color}-900/30 border border-${section.color}-200 dark:border-${section.color}-800/50`}
                  >
                    <Icon
                      icon={section.icon}
                      width={22}
                      className={`text-${section.color}-600 dark:text-${section.color}-400`}
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-default-400 uppercase tracking-wider">
                      {section.title}
                    </p>
                    <p className="text-sm font-bold text-foreground mt-0.5">
                      {section.value}
                    </p>
                  </div>
                </div>
              </CardBody>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Match Details Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800/50 dark:to-slate-900/50 border border-slate-200 dark:border-slate-700">
          <CardHeader className="flex-col items-start gap-2 pb-2">
            <div className="flex items-center gap-2">
              <Icon
                icon="solar:cup-star-bold-duotone"
                width={20}
                className="text-amber-500"
              />
              <h4 className="font-semibold text-slate-700 dark:text-slate-300">
                Match Details
              </h4>
            </div>
          </CardHeader>
          <Divider className="bg-slate-200 dark:bg-slate-700" />
          <CardBody className="gap-3 pt-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600 dark:text-slate-400">
                Expected Pool:
              </span>
              <Chip
                size="sm"
                variant="flat"
                className="bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 font-bold"
              >
                ${state.expectedPool?.toFixed(2) || "100.00"}
              </Chip>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600 dark:text-slate-400">
                Match Type:
              </span>
              <Chip
                size="sm"
                variant="flat"
                className="bg-[#34445C]/10 dark:bg-[#34445C]/30 text-[#34445C] dark:text-[#DCFF37]"
              >
                {state.tier
                  ? state.tier.charAt(0).toUpperCase() + state.tier.slice(1)
                  : "Ranked"}
              </Chip>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600 dark:text-slate-400">
                Server:
              </span>
              <Chip
                size="sm"
                variant="flat"
                className="bg-[#DCFF37]/10 dark:bg-[#DCFF37]/20 text-[#34445C] dark:text-[#DCFF37]"
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
        className="flex items-center justify-center gap-3 p-4 rounded-none bg-gradient-to-r from-[#FF4654]/10 via-[#FFC700]/5 to-[#34445C]/10 dark:from-[#DCFF37]/10 dark:to-[#34445C]/20 border border-[#FF4654]/30 dark:border-[#DCFF37]/30"
      >
        <div className="relative">
          <Icon
            icon="solar:play-circle-bold"
            width={28}
            className="text-[#FF4654] dark:text-[#DCFF37]"
          />
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#DCFF37] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-[#DCFF37]"></span>
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
          <Card className="bg-gradient-to-br from-[#0a0a0a] via-[#111111] to-[#0a0a0a] border-2 border-[#FF4654]/30 dark:border-[#DCFF37]/30 overflow-hidden relative rounded-none">
            {/* Animated background effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#FF4654]/5 via-[#FFC700]/5 to-[#FF4654]/5 animate-pulse" />
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#FF4654] via-[#FFC700] to-[#FF4654]" />

            <CardBody className="p-6 text-center space-y-4 relative z-10">
              <div className="flex justify-center">
                <div className="relative">
                  {/* Outer glow ring */}
                  <div className="absolute inset-0 w-20 h-20 rounded-full bg-gradient-to-r from-[#FF4654]/20 via-[#FFC700]/20 to-[#DCFF37]/20 animate-pulse" />
                  {/* Spinning ring */}
                  <div className="w-20 h-20 border-4 border-slate-700 border-t-[#DCFF37] border-r-[#FF4654] rounded-full animate-spin" />
                  {/* Center icon */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Icon
                      icon="solar:gamepad-bold"
                      width={28}
                      className="text-[#DCFF37]"
                    />
                  </div>
                </div>
              </div>
              <div>
                <h4 className="text-xl font-bold bg-gradient-to-r from-[#FF4654] via-[#FFC700] to-[#DCFF37] bg-clip-text text-transparent mb-3">
                  SEARCHING FOR OPPONENTS
                </h4>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="flex flex-col items-center p-3 rounded-none bg-slate-800/50 border border-[#DCFF37]/20">
                    <Icon
                      icon="solar:users-group-rounded-bold"
                      width={20}
                      className="text-[#FF4654] mb-1"
                    />
                    <span className="text-slate-400 text-xs">Queue</span>
                    <span className="font-bold text-white">
                      #{state.matchmaking.queuePosition}
                    </span>
                  </div>
                  <div className="flex flex-col items-center p-3 rounded-none bg-slate-800/50 border border-[#DCFF37]/20">
                    <Icon
                      icon="solar:clock-circle-bold"
                      width={20}
                      className="text-[#DCFF37] mb-1"
                    />
                    <span className="text-slate-400 text-xs">Est. Wait</span>
                    <span className="font-bold text-white">
                      {Math.floor(state.matchmaking.estimatedWait / 60)}:
                      {String(state.matchmaking.estimatedWait % 60).padStart(
                        2,
                        "0"
                      )}
                    </span>
                  </div>
                  <div className="flex flex-col items-center p-3 rounded-none bg-slate-800/50 border border-[#DCFF37]/20">
                    <Icon
                      icon="solar:hourglass-bold"
                      width={20}
                      className="text-[#FFC700] mb-1"
                    />
                    <span className="text-slate-400 text-xs">Elapsed</span>
                    <span className="font-bold text-white">
                      {Math.floor(state.matchmaking.elapsedTime / 60)}:
                      {String(state.matchmaking.elapsedTime % 60).padStart(
                        2,
                        "0"
                      )}
                    </span>
                  </div>
                </div>
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
          <Card className="bg-danger-50 dark:bg-danger-900/20 border-2 border-danger-200 dark:border-danger-800">
            <CardBody className="p-4">
              <div className="flex items-center gap-3">
                <Icon
                  icon="solar:danger-circle-bold"
                  width={24}
                  className="text-danger-600 flex-shrink-0"
                />
                <div>
                  <p className="font-semibold text-danger-700 dark:text-danger-400">
                    Matchmaking Error
                  </p>
                  <p className="text-sm text-danger-600 dark:text-danger-500">
                    {state.matchmaking.error}
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>
        </motion.div>
      )}

      {/* Tips */}
      {!state.matchmaking?.isSearching && (
        <Card className="bg-default-50 dark:bg-default-900/20">
          <CardBody className="p-4">
            <div className="flex items-start gap-3">
              <Icon
                icon="solar:lightbulb-bolt-bold-duotone"
                width={20}
                className="text-primary-600 flex-shrink-0 mt-0.5"
              />
              <div className="space-y-1 text-xs text-default-600">
                <p className="font-semibold text-default-700">Pro Tips:</p>
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

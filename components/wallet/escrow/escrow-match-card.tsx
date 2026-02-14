"use client";

/**
 * Escrow Match Card Component
 * Displays an active escrow match with entry status, prize pool, and potential winnings
 * Features award-winning LeetGaming branding with angular cuts and neon accents
 */

import React, { useState } from "react";
import {
  Card,
  CardBody,
  Chip,
  Progress,
  Tooltip,
  Divider,
  Button,
} from "@nextui-org/react";
import { Icon } from "@iconify/react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@nextui-org/react";
import type {
  EscrowMatch,
  EscrowMatchStatus,
} from "@/types/replay-api/escrow-wallet.types";
import {
  formatEscrowStatus,
  getChainIcon,
  calculateNetPrize,
} from "@/types/replay-api/escrow-wallet.types";
import { AnimatedCounter } from "@/components/ui/animated-counter";

interface EscrowMatchCardProps {
  match: EscrowMatch;
  onEnterMatch?: () => void;
  onClaimPrize?: () => void;
  onViewDetails?: () => void;
  isUserParticipant?: boolean;
  compact?: boolean;
  className?: string;
}

// Status-based card styling
const getStatusGradient = (status: EscrowMatchStatus, isDark: boolean) => {
  const gradients: Record<EscrowMatchStatus, string> = {
    open: isDark
      ? "from-[#DCFF37]/10 to-[#34445C]/20"
      : "from-[#FF4654]/5 to-[#FFC700]/5",
    filling: isDark
      ? "from-[#DCFF37]/15 to-[#34445C]/20"
      : "from-[#FF4654]/10 to-[#FFC700]/10",
    ready: isDark
      ? "from-emerald-500/20 to-[#34445C]/20"
      : "from-emerald-500/10 to-emerald-600/5",
    in_progress: isDark
      ? "from-amber-500/20 to-[#34445C]/20"
      : "from-amber-500/10 to-amber-600/5",
    completed: isDark
      ? "from-blue-500/20 to-[#34445C]/20"
      : "from-blue-500/10 to-blue-600/5",
    in_escrow: isDark
      ? "from-purple-500/20 to-[#34445C]/20"
      : "from-purple-500/10 to-purple-600/5",
    distributing: isDark
      ? "from-cyan-500/20 to-[#34445C]/20"
      : "from-cyan-500/10 to-cyan-600/5",
    distributed: isDark
      ? "from-emerald-500/20 to-[#34445C]/20"
      : "from-emerald-500/10 to-emerald-600/5",
    disputed: isDark
      ? "from-red-500/20 to-[#34445C]/20"
      : "from-red-500/10 to-red-600/5",
    cancelled: isDark
      ? "from-gray-500/20 to-[#34445C]/20"
      : "from-gray-500/10 to-gray-600/5",
    refunded: isDark
      ? "from-gray-500/20 to-[#34445C]/20"
      : "from-gray-500/10 to-gray-600/5",
  };
  return gradients[status] || gradients.open;
};

// Game icons mapping
const getGameIcon = (gameId: string): string => {
  const icons: Record<string, string> = {
    cs2: "simple-icons:counterstrike",
    valorant: "simple-icons:valorant",
    league: "simple-icons:leagueoflegends",
    dota2: "simple-icons:dota2",
    pubg: "simple-icons:pubg",
    fortnite: "simple-icons:fortnite",
  };
  return icons[gameId] || "solar:gamepad-bold";
};

export function EscrowMatchCard({
  match,
  onEnterMatch,
  onClaimPrize,
  onViewDetails,
  isUserParticipant = false,
  compact = false,
  className,
}: EscrowMatchCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [showPotentialWinnings, setShowPotentialWinnings] = useState(false);

  // Determine dark mode (you'd normally use useTheme hook)
  const isDark =
    typeof window !== "undefined" &&
    document.documentElement.classList.contains("dark");

  const statusInfo = formatEscrowStatus(match.status);
  const fillPercentage =
    (match.current_participants / match.max_participants) * 100;
  const netPrize = calculateNetPrize(
    match.total_pot,
    match.platform_fee_percent,
  );

  // Calculate time remaining
  const getTimeRemaining = () => {
    if (!match.starts_at) return null;
    const now = new Date();
    const start = new Date(match.starts_at);
    const diff = start.getTime() - now.getTime();

    if (diff <= 0) return "Starting now";

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 24) return `${Math.floor(hours / 24)}d ${hours % 24}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  // User participation info
  const userPart = match.user_participation;
  const canEnter = match.status === "open" || match.status === "filling";
  const canClaim = userPart?.prize_claimable && !userPart?.prize_claimed;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: compact ? 1 : 1.02 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className={className}
    >
      <Card
        className={cn(
          "bg-gradient-to-br border-2 rounded-none overflow-hidden transition-all duration-300",
          getStatusGradient(match.status, isDark),
          isUserParticipant
            ? "border-[#DCFF37]/50 dark:border-[#DCFF37]/70"
            : "border-[#34445C]/20 dark:border-[#DCFF37]/20",
          isHovered && "shadow-lg shadow-[#DCFF37]/10 dark:shadow-[#DCFF37]/20",
        )}
        style={{
          clipPath: compact
            ? "none"
            : "polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 20px 100%, 0 calc(100% - 20px))",
        }}
      >
        {/* Status Banner */}
        <div
          className={cn(
            "px-4 py-2 flex items-center justify-between",
            "bg-gradient-to-r from-[#34445C] to-[#34445C]/80 dark:from-[#DCFF37]/20 dark:to-[#DCFF37]/10",
          )}
        >
          <div className="flex items-center gap-2">
            <Icon
              icon={getGameIcon(match.game_id)}
              className="w-5 h-5 text-white dark:text-[#DCFF37]"
            />
            <span className="font-semibold text-white dark:text-[#DCFF37] text-sm uppercase tracking-wider">
              {match.game_mode}
            </span>
          </div>
          <Chip
            size="sm"
            variant="flat"
            color={statusInfo.color}
            startContent={<Icon icon={statusInfo.icon} width={14} />}
            classNames={{
              base: "rounded-none",
              content: "font-semibold",
            }}
          >
            {statusInfo.label}
          </Chip>
        </div>

        <CardBody className={cn("gap-4", compact ? "p-3" : "p-4")}>
          {/* Prize Pool Display */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-default-500 uppercase tracking-wider mb-1">
                Prize Pool
              </p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#FF4654] to-[#FFC700] dark:from-[#DCFF37] dark:to-white">
                  <AnimatedCounter
                    value={netPrize.dollars}
                    prefix="$"
                    decimals={2}
                  />
                </span>
                {match.platform_contribution.dollars > 0 && (
                  <Tooltip content="Platform contribution included">
                    <Chip
                      size="sm"
                      variant="flat"
                      color="secondary"
                      className="rounded-none cursor-help"
                    >
                      +${match.platform_contribution.dollars.toFixed(0)}
                    </Chip>
                  </Tooltip>
                )}
              </div>
            </div>

            {/* Chain Badge */}
            <Tooltip content={match.chain_id.replace(":", " - ").toUpperCase()}>
              <div className="p-2 rounded-lg bg-white/10 dark:bg-black/20">
                <Icon
                  icon={getChainIcon(match.chain_id)}
                  className="w-6 h-6 text-[#34445C] dark:text-[#DCFF37]"
                />
              </div>
            </Tooltip>
          </div>

          {/* Entry Fee & Participants */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-xs text-default-500 uppercase tracking-wider">
                Entry Fee
              </p>
              <div className="flex items-center gap-2">
                <Icon
                  icon="solar:ticket-bold-duotone"
                  className="w-5 h-5 text-[#FF4654] dark:text-[#DCFF37]"
                />
                <span className="font-bold text-lg text-[#34445C] dark:text-white">
                  ${match.entry_fee.dollars.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="space-y-1">
              <p className="text-xs text-default-500 uppercase tracking-wider">
                Players
              </p>
              <div className="flex items-center gap-2">
                <Icon
                  icon="solar:users-group-rounded-bold"
                  className="w-5 h-5 text-[#FF4654] dark:text-[#DCFF37]"
                />
                <span className="font-bold text-lg text-[#34445C] dark:text-white">
                  {match.current_participants}/{match.max_participants}
                </span>
              </div>
            </div>
          </div>

          {/* Fill Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-default-500">
                {match.min_participants - match.current_participants > 0
                  ? `${match.min_participants - match.current_participants} more needed`
                  : "Minimum reached"}
              </span>
              <span className="text-default-500">
                {Math.round(fillPercentage)}% filled
              </span>
            </div>
            <Progress
              size="sm"
              value={fillPercentage}
              color={fillPercentage >= 100 ? "success" : "primary"}
              classNames={{
                track: "rounded-none bg-default-200/50",
                indicator: cn(
                  "rounded-none",
                  fillPercentage >= 100
                    ? "bg-gradient-to-r from-emerald-500 to-emerald-600"
                    : "bg-gradient-to-r from-[#FF4654] to-[#FFC700] dark:from-[#DCFF37] dark:to-[#34445C]",
                ),
              }}
            />
          </div>

          {/* User Participation Status */}
          {isUserParticipant && userPart && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="p-3 rounded-lg bg-[#DCFF37]/10 dark:bg-[#DCFF37]/20 border border-[#DCFF37]/30"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon
                    icon="solar:check-circle-bold"
                    className="w-5 h-5 text-[#DCFF37]"
                  />
                  <span className="font-semibold text-sm text-[#34445C] dark:text-white">
                    You&apos;re In!
                  </span>
                </div>
                <span className="text-xs text-default-500">
                  Entry: ${userPart.entry_amount.dollars.toFixed(2)}
                </span>
              </div>

              {/* Potential Winnings Preview */}
              {userPart.potential_winnings && (
                <div className="mt-2 pt-2 border-t border-[#DCFF37]/20">
                  <button
                    onClick={() =>
                      setShowPotentialWinnings(!showPotentialWinnings)
                    }
                    className="flex items-center gap-1 text-xs text-[#34445C] dark:text-[#DCFF37] hover:opacity-80 transition-opacity"
                  >
                    <Icon
                      icon={
                        showPotentialWinnings
                          ? "solar:alt-arrow-up-bold"
                          : "solar:alt-arrow-down-bold"
                      }
                      width={14}
                    />
                    Potential Winnings
                  </button>

                  <AnimatePresence>
                    {showPotentialWinnings && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-2 space-y-1"
                      >
                        <div className="flex justify-between text-sm">
                          <span className="text-default-500">🥇 1st Place</span>
                          <span className="font-semibold text-success">
                            $
                            {userPart.potential_winnings.if_first.dollars.toFixed(
                              2,
                            )}
                          </span>
                        </div>
                        {userPart.potential_winnings.if_second && (
                          <div className="flex justify-between text-sm">
                            <span className="text-default-500">
                              🥈 2nd Place
                            </span>
                            <span className="font-semibold">
                              $
                              {userPart.potential_winnings.if_second.dollars.toFixed(
                                2,
                              )}
                            </span>
                          </div>
                        )}
                        {userPart.potential_winnings.if_third && (
                          <div className="flex justify-between text-sm">
                            <span className="text-default-500">
                              🥉 3rd Place
                            </span>
                            <span className="font-semibold">
                              $
                              {userPart.potential_winnings.if_third.dollars.toFixed(
                                2,
                              )}
                            </span>
                          </div>
                        )}
                        {userPart.potential_winnings.mvp_bonus && (
                          <div className="flex justify-between text-sm">
                            <span className="text-default-500">
                              ⭐ MVP Bonus
                            </span>
                            <span className="font-semibold text-secondary">
                              +$
                              {userPart.potential_winnings.mvp_bonus.dollars.toFixed(
                                2,
                              )}
                            </span>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* Winner Result */}
              {userPart.status === "won" && userPart.prize_won && (
                <div className="mt-2 pt-2 border-t border-[#DCFF37]/20">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-success">
                      🏆 You Won!
                    </span>
                    <span className="text-lg font-bold text-success">
                      ${userPart.prize_won.dollars.toFixed(2)}
                    </span>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* Distribution Type Badge */}
          <div className="flex items-center gap-2">
            <Chip
              size="sm"
              variant="bordered"
              className="rounded-none"
              startContent={
                <Icon
                  icon={
                    match.distribution_type === "winner_takes_all"
                      ? "solar:cup-bold"
                      : match.distribution_type === "tiered"
                        ? "solar:ranking-bold"
                        : "solar:chart-bold"
                  }
                  width={14}
                />
              }
            >
              {match.distribution_type === "winner_takes_all"
                ? "Winner Takes All"
                : match.distribution_type === "tiered"
                  ? "Tiered Split"
                  : "Proportional"}
            </Chip>

            {match.escrow_period_hours > 0 && (
              <Tooltip content="Prize escrow period before distribution">
                <Chip
                  size="sm"
                  variant="bordered"
                  className="rounded-none"
                  startContent={<Icon icon="solar:lock-bold" width={14} />}
                >
                  {match.escrow_period_hours}h Escrow
                </Chip>
              </Tooltip>
            )}
          </div>

          {/* Time Remaining */}
          {getTimeRemaining() && (
            <div className="flex items-center gap-2 text-sm">
              <Icon
                icon="solar:clock-circle-bold"
                className="w-4 h-4 text-default-500"
              />
              <span className="text-default-500">
                Starts in{" "}
                <span className="font-semibold text-[#34445C] dark:text-white">
                  {getTimeRemaining()}
                </span>
              </span>
            </div>
          )}

          <Divider />

          {/* Action Buttons */}
          <div className="flex gap-2">
            {!isUserParticipant && canEnter && (
              <Button
                fullWidth
                className={cn(
                  "rounded-none font-semibold",
                  "bg-gradient-to-r from-[#FF4654] to-[#FFC700] dark:from-[#DCFF37] dark:to-[#34445C]",
                  "text-white dark:text-[#34445C]",
                )}
                startContent={<Icon icon="solar:login-3-bold" width={18} />}
                onPress={onEnterMatch}
              >
                Enter Match - ${match.entry_fee.dollars.toFixed(2)}
              </Button>
            )}

            {canClaim && (
              <Button
                fullWidth
                color="success"
                className="rounded-none font-semibold"
                startContent={<Icon icon="solar:hand-money-bold" width={18} />}
                onPress={onClaimPrize}
              >
                Claim Prize - ${userPart?.prize_won?.dollars.toFixed(2)}
              </Button>
            )}

            {(isUserParticipant || !canEnter) && !canClaim && (
              <Button
                fullWidth
                variant="bordered"
                className="rounded-none border-[#34445C]/30 dark:border-[#DCFF37]/30"
                startContent={<Icon icon="solar:eye-bold" width={18} />}
                onPress={onViewDetails}
              >
                View Details
              </Button>
            )}

            {/* Blockchain Verification Link */}
            {match.blockchain_tx_hash && (
              <Tooltip content="View on blockchain explorer">
                <Button
                  isIconOnly
                  variant="flat"
                  className="rounded-none"
                  onPress={() => {
                    // Open explorer URL
                  }}
                >
                  <Icon icon="solar:link-bold" width={18} />
                </Button>
              </Tooltip>
            )}
          </div>
        </CardBody>

        {/* Hover Glow Effect */}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 pointer-events-none"
              style={{
                background: `radial-gradient(circle at 50% 50%, ${
                  isDark ? "rgba(220, 255, 55, 0.1)" : "rgba(255, 70, 84, 0.05)"
                }, transparent 70%)`,
              }}
            />
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
}

export default EscrowMatchCard;

"use client";

/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║  🎮 LEETGAMING - PLAN LIMIT MODAL                                            ║
 * ║══════════════════════════════════════════════════════════════════════════════║
 * ║                                                                              ║
 * ║  Award-winning UX for handling plan limit exceeded errors:                   ║
 * ║  • Beautiful branded design matching LeetGaming style                        ║
 * ║  • Clear messaging about what limit was hit                                  ║
 * ║  • One-click upgrade flow to appropriate plan                                ║
 * ║  • Comparison of current vs recommended plan                                 ║
 * ║  • Smooth animations and transitions                                         ║
 * ║                                                                              ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Progress,
  Chip,
  cn,
} from "@nextui-org/react";
import { Icon } from "@iconify/react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";

// ============================================================================
// 🎯 TYPES
// ============================================================================

export interface PlanLimitError {
  /** The operation that was blocked (e.g., "CreatePlayerProfile") */
  operation: string;
  /** Human-readable operation name */
  operationName?: string;
  /** Current usage amount */
  currentUsage?: number;
  /** The limit that was exceeded */
  limit: number;
  /** Current plan name */
  currentPlan: string;
  /** Current plan tier (free, pro, elite) */
  currentPlanTier?: string;
  /** Recommended plan to upgrade to */
  recommendedPlan?: string;
  /** The raw error message from API */
  rawMessage?: string;
}

interface PlanLimitModalProps {
  isOpen: boolean;
  onClose: () => void;
  error: PlanLimitError | null;
  /** Called when user clicks upgrade - defaults to navigating to /pricing */
  onUpgrade?: (planId?: string) => void;
}

// ============================================================================
// 🎨 PLAN DATA
// ============================================================================

interface PlanInfo {
  name: string;
  icon: string;
  color: string;
  gradient: string;
  limits: Record<string, number>;
  price: { monthly: number; yearly: number };
}

const PLANS: Record<string, PlanInfo> = {
  free: {
    name: "Free",
    icon: "solar:gamepad-bold",
    color: "#34445C",
    gradient: "from-[#34445C] to-[#4a5568]",
    limits: {
      CreatePlayerProfile: 3,
      TeamCreate: 1,
      ReplayUpload: 5,
      ReplayAnalysis: 2,
      JoinMatchmakingQueue: 10,
    },
    price: { monthly: 0, yearly: 0 },
  },
  pro: {
    name: "Pro",
    icon: "solar:crown-bold",
    color: "#FF4654",
    gradient: "from-[#FF4654] to-[#FFC700]",
    limits: {
      CreatePlayerProfile: 5,
      TeamCreate: 3,
      ReplayUpload: 30,
      ReplayAnalysis: 15,
      JoinMatchmakingQueue: 100,
    },
    price: { monthly: 9.99, yearly: 99.99 },
  },
  elite: {
    name: "Elite",
    icon: "solar:cup-star-bold",
    color: "#FFC700",
    gradient: "from-[#FFC700] to-[#FF4654]",
    limits: {
      CreatePlayerProfile: 10,
      TeamCreate: 10,
      ReplayUpload: 100,
      ReplayAnalysis: 50,
      JoinMatchmakingQueue: 1000,
    },
    price: { monthly: 29.99, yearly: 299.99 },
  },
};

// Operation display names and icons
const OPERATION_INFO: Record<
  string,
  { name: string; icon: string; description: string }
> = {
  CreatePlayerProfile: {
    name: "Player Profiles",
    icon: "solar:user-plus-bold-duotone",
    description: "Create profiles for different games",
  },
  TeamCreate: {
    name: "Team Creation",
    icon: "solar:users-group-rounded-bold-duotone",
    description: "Create and manage teams",
  },
  ReplayUpload: {
    name: "Replay Uploads",
    icon: "solar:upload-bold-duotone",
    description: "Upload game replays for analysis",
  },
  ReplayAnalysis: {
    name: "AI Analysis",
    icon: "solar:magic-stick-3-bold-duotone",
    description: "AI-powered replay analysis",
  },
  JoinMatchmakingQueue: {
    name: "Matchmaking",
    icon: "solar:users-group-two-rounded-bold-duotone",
    description: "Join competitive queues",
  },
  MatchMakingQueueAmount: {
    name: "Concurrent Queues",
    icon: "solar:list-bold-duotone",
    description: "Queue in multiple pools simultaneously",
  },
};

// ============================================================================
// 🔧 UTILITIES
// ============================================================================

/**
 * Parse API error message to extract plan limit details
 */
export function parsePlanLimitError(
  errorMessage: string,
): PlanLimitError | null {
  // Pattern: "the amount X.XX exceeds the limit Y.YY for the current plan PlanName on operation OperationName"
  const regex =
    /amount (\d+\.?\d*) exceeds the limit (\d+\.?\d*) for the current plan (.+?) on operation (\w+)/i;
  const match = errorMessage.match(regex);

  if (!match) return null;

  const [, currentUsageStr, limitStr, planName, operation] = match;
  const currentUsage = parseFloat(currentUsageStr);
  const limit = parseFloat(limitStr);

  // Determine plan tier from name
  let currentPlanTier = "free";
  const lowerPlanName = planName.toLowerCase();
  if (lowerPlanName.includes("elite") || lowerPlanName.includes("business")) {
    currentPlanTier = "elite";
  } else if (lowerPlanName.includes("pro")) {
    currentPlanTier = "pro";
  }

  // Recommend next tier up
  let recommendedPlan = "pro";
  if (currentPlanTier === "pro") {
    recommendedPlan = "elite";
  } else if (currentPlanTier === "elite") {
    recommendedPlan = "elite"; // Already at max, but can still show benefits
  }

  return {
    operation,
    operationName: OPERATION_INFO[operation]?.name || operation,
    currentUsage,
    limit,
    currentPlan: planName,
    currentPlanTier,
    recommendedPlan,
    rawMessage: errorMessage,
  };
}

/**
 * Check if an error is a plan limit error
 */
export function isPlanLimitError(error: unknown): boolean {
  if (!error) return false;

  const errorStr =
    typeof error === "string"
      ? error
      : (error as { message?: string })?.message || "";

  return (
    errorStr.toLowerCase().includes("exceeds the limit") &&
    errorStr.toLowerCase().includes("current plan")
  );
}

// ============================================================================
// 🎮 MAIN COMPONENT
// ============================================================================

export function PlanLimitModal({
  isOpen,
  onClose,
  error,
  onUpgrade,
}: PlanLimitModalProps) {
  const router = useRouter();
  const { theme: _theme } = useTheme();
  const [isUpgrading, setIsUpgrading] = useState(false);

  if (!error) return null;

  const operationInfo = OPERATION_INFO[error.operation] || {
    name: error.operationName || error.operation,
    icon: "solar:danger-triangle-bold-duotone",
    description: "This operation",
  };

  const currentPlanInfo = PLANS[error.currentPlanTier || "free"] || PLANS.free;
  const recommendedPlanInfo =
    PLANS[error.recommendedPlan || "pro"] || PLANS.pro;

  const handleUpgrade = async () => {
    setIsUpgrading(true);

    if (onUpgrade) {
      onUpgrade(error.recommendedPlan);
    } else {
      // Default: navigate to pricing page
      router.push(
        `/pricing?highlight=${error.recommendedPlan}&operation=${error.operation}`,
      );
    }

    // Small delay for visual feedback
    setTimeout(() => {
      setIsUpgrading(false);
      onClose();
    }, 500);
  };

  const usagePercent =
    error.limit > 0
      ? Math.min(100, ((error.currentUsage || 0) / error.limit) * 100)
      : 100;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="2xl"
      hideCloseButton
      classNames={{
        base: cn(
          "bg-[#F5F0E1] dark:bg-[#0a0a0a]",
          "border-2 border-[#FF4654]/30 dark:border-[#DCFF37]/30",
          "shadow-2xl",
        ),
        backdrop: "bg-black/60 backdrop-blur-sm",
        wrapper: "items-center",
      }}
      motionProps={{
        variants: {
          enter: {
            y: 0,
            opacity: 1,
            scale: 1,
            transition: { type: "spring", damping: 30, stiffness: 300 },
          },
          exit: {
            y: 20,
            opacity: 0,
            scale: 0.95,
            transition: { duration: 0.2 },
          },
        },
      }}
      style={{
        clipPath:
          "polygon(0 0, 100% 0, 100% calc(100% - 24px), calc(100% - 24px) 100%, 0 100%)",
      }}
    >
      <ModalContent>
        {(onCloseModal) => (
          <>
            {/* Brand accent line */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#FF4654] via-[#FFC700] to-[#FF4654] dark:from-[#DCFF37] dark:via-[#34445C] dark:to-[#DCFF37]" />

            <ModalHeader className="flex flex-col gap-4 pt-8 pb-4 px-6">
              {/* Header with close button */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  {/* Warning icon with animation */}
                  <motion.div
                    className="w-16 h-16 flex items-center justify-center bg-gradient-to-br from-[#FF4654]/20 to-[#FFC700]/20 dark:from-[#DCFF37]/20 dark:to-[#34445C]/20"
                    style={{
                      clipPath:
                        "polygon(0 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%)",
                    }}
                    initial={{ scale: 0.8, rotate: -10 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", damping: 15 }}
                  >
                    <Icon
                      icon="solar:shield-warning-bold-duotone"
                      width={32}
                      className="text-[#FF4654] dark:text-[#DCFF37]"
                    />
                  </motion.div>
                  <div>
                    <h2 className="text-xl font-bold text-[#34445C] dark:text-[#F5F0E1]">
                      Plan Limit Reached
                    </h2>
                    <p className="text-sm text-[#34445C]/60 dark:text-[#F5F0E1]/60 mt-1">
                      Upgrade to continue using{" "}
                      {operationInfo.name.toLowerCase()}
                    </p>
                  </div>
                </div>

                {/* Close button */}
                <button
                  onClick={onCloseModal}
                  className={cn(
                    "w-10 h-10 flex items-center justify-center",
                    "bg-[#34445C]/10 dark:bg-[#F5F0E1]/10",
                    "hover:bg-[#34445C]/20 dark:hover:bg-[#F5F0E1]/20",
                    "active:scale-95 transition-all",
                  )}
                  style={{
                    clipPath:
                      "polygon(0 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%)",
                  }}
                  aria-label="Close"
                >
                  <Icon
                    icon="solar:close-circle-linear"
                    className="w-5 h-5 text-[#34445C]/70 dark:text-[#F5F0E1]/70"
                  />
                </button>
              </div>
            </ModalHeader>

            <ModalBody className="py-4 px-6">
              <AnimatePresence mode="wait">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex flex-col gap-6"
                >
                  {/* Current usage card */}
                  <div
                    className="bg-[#34445C]/5 dark:bg-[#DCFF37]/5 border border-[#FF4654]/20 dark:border-[#DCFF37]/20 p-4"
                    style={{
                      clipPath:
                        "polygon(0 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%)",
                    }}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div
                        className="w-10 h-10 flex items-center justify-center bg-gradient-to-br from-[#FF4654] to-[#FFC700] dark:from-[#DCFF37] dark:to-[#34445C]"
                        style={{
                          clipPath:
                            "polygon(0 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%)",
                        }}
                      >
                        <Icon
                          icon={operationInfo.icon}
                          width={20}
                          className="text-[#F5F0E1] dark:text-[#34445C]"
                        />
                      </div>
                      <div>
                        <p className="font-semibold text-[#34445C] dark:text-[#F5F0E1]">
                          {operationInfo.name}
                        </p>
                        <p className="text-xs text-[#34445C]/60 dark:text-[#F5F0E1]/60">
                          {operationInfo.description}
                        </p>
                      </div>
                    </div>

                    {/* Usage bar */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-[#34445C]/70 dark:text-[#F5F0E1]/70">
                          Current Plan:{" "}
                          <span className="font-semibold text-[#34445C] dark:text-[#F5F0E1]">
                            {error.currentPlan}
                          </span>
                        </span>
                        <span className="font-medium text-[#FF4654] dark:text-[#DCFF37]">
                          {error.currentUsage || 0} / {error.limit} used
                        </span>
                      </div>
                      <Progress
                        value={usagePercent}
                        classNames={{
                          track: "bg-[#34445C]/10 dark:bg-[#F5F0E1]/10 h-3",
                          indicator: cn(
                            "bg-gradient-to-r",
                            usagePercent >= 100
                              ? "from-[#FF4654] to-[#FF4654]"
                              : "from-[#FF4654] to-[#FFC700] dark:from-[#DCFF37] dark:to-[#34445C]",
                          ),
                        }}
                        style={{ borderRadius: 0 }}
                      />
                      {usagePercent >= 100 && (
                        <p className="text-xs text-[#FF4654] dark:text-[#DCFF37] font-medium flex items-center gap-1">
                          <Icon icon="solar:danger-circle-bold" width={14} />
                          You&apos;ve reached your plan limit
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Plan comparison */}
                  <div className="grid grid-cols-2 gap-4">
                    {/* Current plan */}
                    <div
                      className="p-4 border border-[#34445C]/20 dark:border-[#F5F0E1]/10 bg-[#34445C]/5 dark:bg-[#1a1a1a] opacity-60"
                      style={{
                        clipPath:
                          "polygon(0 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%)",
                      }}
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <div
                          className={cn(
                            "w-8 h-8 flex items-center justify-center bg-gradient-to-br",
                            currentPlanInfo.gradient,
                          )}
                          style={{
                            clipPath:
                              "polygon(0 0, 100% 0, 100% calc(100% - 4px), calc(100% - 4px) 100%, 0 100%)",
                          }}
                        >
                          <Icon
                            icon={currentPlanInfo.icon}
                            width={16}
                            className="text-[#F5F0E1]"
                          />
                        </div>
                        <div>
                          <p className="font-semibold text-sm text-[#34445C] dark:text-[#F5F0E1]">
                            {currentPlanInfo.name}
                          </p>
                          <p className="text-xs text-[#34445C]/50 dark:text-[#F5F0E1]/50">
                            Current plan
                          </p>
                        </div>
                      </div>
                      <p className="text-2xl font-bold text-[#34445C] dark:text-[#F5F0E1]">
                        {error.limit}
                        <span className="text-sm font-normal text-[#34445C]/50 dark:text-[#F5F0E1]/50 ml-1">
                          {operationInfo.name.toLowerCase()}
                        </span>
                      </p>
                    </div>

                    {/* Recommended plan */}
                    <div
                      className="p-4 border-2 border-[#FF4654] dark:border-[#DCFF37] bg-gradient-to-br from-[#FF4654]/5 to-[#FFC700]/5 dark:from-[#DCFF37]/5 dark:to-[#34445C]/5 relative overflow-hidden"
                      style={{
                        clipPath:
                          "polygon(0 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%)",
                      }}
                    >
                      <Chip
                        className="absolute top-2 right-2 bg-[#FF4654] dark:bg-[#DCFF37] text-[#F5F0E1] dark:text-[#34445C] text-xs font-semibold"
                        size="sm"
                        style={{ borderRadius: 0 }}
                      >
                        RECOMMENDED
                      </Chip>
                      <div className="flex items-center gap-2 mb-3">
                        <div
                          className={cn(
                            "w-8 h-8 flex items-center justify-center bg-gradient-to-br",
                            recommendedPlanInfo.gradient,
                          )}
                          style={{
                            clipPath:
                              "polygon(0 0, 100% 0, 100% calc(100% - 4px), calc(100% - 4px) 100%, 0 100%)",
                          }}
                        >
                          <Icon
                            icon={recommendedPlanInfo.icon}
                            width={16}
                            className="text-[#F5F0E1]"
                          />
                        </div>
                        <div>
                          <p className="font-semibold text-sm text-[#34445C] dark:text-[#F5F0E1]">
                            {recommendedPlanInfo.name}
                          </p>
                          <p className="text-xs text-[#FF4654] dark:text-[#DCFF37]">
                            ${recommendedPlanInfo.price.monthly}/mo
                          </p>
                        </div>
                      </div>
                      <p className="text-2xl font-bold text-[#34445C] dark:text-[#F5F0E1]">
                        {recommendedPlanInfo.limits[error.operation] || "∞"}
                        <span className="text-sm font-normal text-[#34445C]/50 dark:text-[#F5F0E1]/50 ml-1">
                          {operationInfo.name.toLowerCase()}
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* Benefits list */}
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-[#34445C] dark:text-[#F5F0E1]">
                      With {recommendedPlanInfo.name}, you also get:
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(recommendedPlanInfo.limits)
                        .filter(([op]) => op !== error.operation)
                        .slice(0, 4)
                        .map(([op, limit]) => {
                          const opInfo = OPERATION_INFO[op];
                          if (!opInfo) return null;
                          return (
                            <div
                              key={op}
                              className="flex items-center gap-2 text-sm"
                            >
                              <Icon
                                icon="solar:check-circle-bold"
                                className="text-[#17C964] flex-shrink-0"
                                width={16}
                              />
                              <span className="text-[#34445C]/70 dark:text-[#F5F0E1]/70">
                                {limit} {opInfo.name.toLowerCase()}
                              </span>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </ModalBody>

            <ModalFooter className="gap-3 px-6 pb-6 pt-4 border-t border-[#34445C]/10 dark:border-[#F5F0E1]/10">
              <Button
                variant="flat"
                onPress={onCloseModal}
                className={cn(
                  "rounded-none font-medium",
                  "bg-[#34445C]/10 dark:bg-[#F5F0E1]/10",
                  "text-[#34445C] dark:text-[#F5F0E1]",
                  "hover:bg-[#34445C]/20 dark:hover:bg-[#F5F0E1]/20",
                )}
                style={{
                  clipPath:
                    "polygon(0 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%)",
                }}
              >
                Maybe Later
              </Button>

              <Button
                onPress={handleUpgrade}
                isLoading={isUpgrading}
                startContent={
                  !isUpgrading && <Icon icon="solar:arrow-up-bold" width={20} />
                }
                className={cn(
                  "rounded-none font-semibold flex-1",
                  "bg-gradient-to-r from-[#FF4654] to-[#FFC700] dark:from-[#DCFF37] dark:to-[#34445C]",
                  "text-[#F5F0E1] dark:text-[#34445C]",
                  "shadow-lg shadow-[#FF4654]/30 dark:shadow-[#DCFF37]/30",
                )}
                style={{
                  clipPath:
                    "polygon(0 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%)",
                }}
              >
                {isUpgrading
                  ? "Redirecting..."
                  : `Upgrade to ${recommendedPlanInfo.name}`}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}

export default PlanLimitModal;

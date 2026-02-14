"use client";

/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║  🎮 LEETGAMING - PLAN LIMIT WARNING BANNER                                   ║
 * ║══════════════════════════════════════════════════════════════════════════════║
 * ║                                                                              ║
 * ║  Inline warning component for when users are approaching limits:             ║
 * ║  • Shows usage progress bar                                                  ║
 * ║  • Different states: near limit, at limit                                    ║
 * ║  • Quick upgrade CTA                                                         ║
 * ║  • Dismissible with local storage persistence                                ║
 * ║                                                                              ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button, Progress, cn } from "@nextui-org/react";
import { Icon } from "@iconify/react";
import { useRouter } from "next/navigation";

interface PlanLimitWarningProps {
  /** Name of the operation (e.g., "Player Profiles") */
  operationName: string;
  /** API operation code (e.g., "CreatePlayerProfile") */
  operationCode?: string;
  /** Current usage count */
  currentUsage: number;
  /** Maximum allowed by current plan */
  limit: number;
  /** Current plan name */
  planName?: string;
  /** Recommended plan to upgrade to */
  recommendedPlan?: string;
  /** Whether this warning can be dismissed */
  dismissible?: boolean;
  /** Storage key for dismissed state (defaults to operation-based key) */
  storageKey?: string;
  /** Compact mode for inline usage */
  compact?: boolean;
  /** Custom upgrade URL */
  upgradeUrl?: string;
  /** Called when upgrade is clicked */
  onUpgrade?: () => void;
  /** Additional CSS classes */
  className?: string;
}

export function PlanLimitWarning({
  operationName,
  operationCode,
  currentUsage,
  limit,
  planName = "current",
  recommendedPlan = "Pro",
  dismissible = true,
  storageKey,
  compact = false,
  upgradeUrl,
  onUpgrade,
  className,
}: PlanLimitWarningProps) {
  const router = useRouter();
  const [isDismissed, setIsDismissed] = useState(false);
  const [_isHovering, setIsHovering] = useState(false);

  const key =
    storageKey || `plan-limit-warning-${operationCode || operationName}`;

  // Check if user has dismissed this warning before
  useEffect(() => {
    if (dismissible) {
      const dismissed = localStorage.getItem(key);
      if (dismissed === "true") {
        setIsDismissed(true);
      }
    }
  }, [key, dismissible]);

  const percentUsed =
    limit > 0 ? Math.min(100, (currentUsage / limit) * 100) : 100;
  const isAtLimit = currentUsage >= limit;
  const _isNearLimit = percentUsed >= 80 && !isAtLimit;
  const remaining = Math.max(0, limit - currentUsage);

  // Don't show if under 80% or already dismissed
  if (percentUsed < 80 || isDismissed) {
    return null;
  }

  const handleDismiss = () => {
    if (dismissible) {
      localStorage.setItem(key, "true");
      setIsDismissed(true);
    }
  };

  const handleUpgrade = () => {
    if (onUpgrade) {
      onUpgrade();
    } else {
      const url =
        upgradeUrl ||
        `/pricing?highlight=${recommendedPlan.toLowerCase()}&operation=${operationCode}`;
      router.push(url);
    }
  };

  if (compact) {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className={cn(
            "flex items-center gap-2 text-xs px-3 py-2",
            isAtLimit
              ? "bg-[#FF4654]/10 text-[#FF4654] dark:bg-[#FF4654]/20"
              : "bg-[#FFC700]/10 text-[#FFC700] dark:bg-[#FFC700]/20",
            className,
          )}
          style={{
            clipPath:
              "polygon(0 0, 100% 0, 100% calc(100% - 4px), calc(100% - 4px) 100%, 0 100%)",
          }}
        >
          <Icon
            icon={
              isAtLimit
                ? "solar:danger-circle-bold"
                : "solar:danger-triangle-bold"
            }
            width={14}
          />
          <span className="flex-1">
            {isAtLimit
              ? `${operationName} limit reached`
              : `${remaining} ${operationName.toLowerCase()} remaining`}
          </span>
          <button
            onClick={handleUpgrade}
            className="underline hover:no-underline font-medium"
          >
            Upgrade
          </button>
          {dismissible && (
            <button
              onClick={handleDismiss}
              className="opacity-60 hover:opacity-100"
            >
              <Icon icon="solar:close-circle-linear" width={14} />
            </button>
          )}
        </motion.div>
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className={cn(
          "relative overflow-hidden",
          isAtLimit
            ? "bg-gradient-to-r from-[#FF4654]/10 to-[#FF4654]/5 border-2 border-[#FF4654]/30"
            : "bg-gradient-to-r from-[#FFC700]/10 to-[#FFC700]/5 border-2 border-[#FFC700]/30",
          "dark:from-[#DCFF37]/10 dark:to-[#DCFF37]/5 dark:border-[#DCFF37]/30",
          "p-4",
          className,
        )}
        style={{
          clipPath:
            "polygon(0 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%)",
        }}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        {/* Top accent line */}
        <div
          className={cn(
            "absolute top-0 left-0 right-0 h-0.5",
            isAtLimit
              ? "bg-[#FF4654]"
              : "bg-gradient-to-r from-[#FFC700] to-[#FF4654]",
            "dark:from-[#DCFF37] dark:to-[#34445C]",
          )}
        />

        <div className="flex items-start gap-4">
          {/* Icon */}
          <div
            className={cn(
              "w-10 h-10 flex items-center justify-center flex-shrink-0",
              isAtLimit ? "bg-[#FF4654]/20" : "bg-[#FFC700]/20",
              "dark:bg-[#DCFF37]/20",
            )}
            style={{
              clipPath:
                "polygon(0 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%)",
            }}
          >
            <Icon
              icon={
                isAtLimit
                  ? "solar:shield-warning-bold-duotone"
                  : "solar:danger-triangle-bold-duotone"
              }
              width={20}
              className={cn(
                isAtLimit ? "text-[#FF4654]" : "text-[#FFC700]",
                "dark:text-[#DCFF37]",
              )}
            />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h4
                  className={cn(
                    "font-semibold text-sm",
                    isAtLimit
                      ? "text-[#FF4654]"
                      : "text-[#34445C] dark:text-[#F5F0E1]",
                  )}
                >
                  {isAtLimit
                    ? `${operationName} Limit Reached`
                    : `${operationName} Running Low`}
                </h4>
                <p className="text-xs text-[#34445C]/70 dark:text-[#F5F0E1]/70 mt-0.5">
                  {isAtLimit
                    ? `You've used all ${limit} ${operationName.toLowerCase()} on your ${planName} plan`
                    : `You have ${remaining} ${operationName.toLowerCase()} left on your ${planName} plan`}
                </p>
              </div>

              {dismissible && (
                <button
                  onClick={handleDismiss}
                  className={cn(
                    "w-8 h-8 flex items-center justify-center flex-shrink-0",
                    "text-[#34445C]/40 dark:text-[#F5F0E1]/40",
                    "hover:text-[#34445C]/70 dark:hover:text-[#F5F0E1]/70",
                    "transition-colors",
                  )}
                  aria-label="Dismiss"
                >
                  <Icon icon="solar:close-circle-linear" width={18} />
                </button>
              )}
            </div>

            {/* Progress bar */}
            <div className="mt-3 space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-[#34445C]/60 dark:text-[#F5F0E1]/60">
                  Usage
                </span>
                <span
                  className={cn(
                    "font-medium",
                    isAtLimit
                      ? "text-[#FF4654]"
                      : "text-[#34445C] dark:text-[#F5F0E1]",
                  )}
                >
                  {currentUsage} / {limit}
                </span>
              </div>
              <Progress
                value={percentUsed}
                classNames={{
                  track: "bg-[#34445C]/10 dark:bg-[#F5F0E1]/10 h-2",
                  indicator: cn(
                    "bg-gradient-to-r",
                    isAtLimit
                      ? "from-[#FF4654] to-[#FF4654]"
                      : "from-[#FFC700] to-[#FF4654]",
                    "dark:from-[#DCFF37] dark:to-[#34445C]",
                  ),
                }}
                style={{ borderRadius: 0 }}
              />
            </div>

            {/* Upgrade CTA */}
            <div className="mt-4 flex items-center gap-3">
              <Button
                size="sm"
                onPress={handleUpgrade}
                startContent={<Icon icon="solar:arrow-up-bold" width={16} />}
                className={cn(
                  "rounded-none font-medium text-xs",
                  "bg-gradient-to-r from-[#FF4654] to-[#FFC700] dark:from-[#DCFF37] dark:to-[#34445C]",
                  "text-[#F5F0E1] dark:text-[#34445C]",
                  "shadow-md",
                )}
                style={{
                  clipPath:
                    "polygon(0 0, 100% 0, 100% calc(100% - 4px), calc(100% - 4px) 100%, 0 100%)",
                }}
              >
                Upgrade to {recommendedPlan}
              </Button>
              <span className="text-xs text-[#34445C]/50 dark:text-[#F5F0E1]/50">
                Get more {operationName.toLowerCase()} instantly
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

export default PlanLimitWarning;

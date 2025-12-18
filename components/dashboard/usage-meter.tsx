/**
 * Usage Meter Component
 * Display remaining uploads/features usage with visual progress
 * Per PRD D.6 - UsageMeter (P1)
 */

"use client";

import React from "react";
import {
  Card,
  CardBody,
  Progress,
  Tooltip,
  Button,
  Chip,
} from "@nextui-org/react";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";

// ============================================================================
// Types
// ============================================================================

export interface UsageItem {
  id: string;
  label: string;
  description?: string;
  icon: string;
  used: number;
  limit: number;
  unit: string;
  resetPeriod?: "daily" | "weekly" | "monthly" | "never";
  resetDate?: Date;
  warningThreshold?: number; // Percentage at which to show warning
  criticalThreshold?: number; // Percentage at which to show critical
}

export interface UsageMeterProps {
  items: UsageItem[];
  variant?: "compact" | "detailed" | "card";
  showUpgradePrompt?: boolean;
  onUpgrade?: () => void;
  className?: string;
}

// ============================================================================
// Helpers
// ============================================================================

const getUsagePercentage = (used: number, limit: number): number => {
  if (limit === 0) return 0;
  return Math.min(100, (used / limit) * 100);
};

const getUsageColor = (
  percentage: number,
  warningThreshold = 70,
  criticalThreshold = 90
): "success" | "warning" | "danger" | "primary" => {
  if (percentage >= criticalThreshold) return "danger";
  if (percentage >= warningThreshold) return "warning";
  return "primary";
};

const formatTimeUntilReset = (resetDate: Date): string => {
  const now = new Date();
  const diff = resetDate.getTime() - now.getTime();

  if (diff < 0) return "Resets soon";

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

  if (days > 0) return `Resets in ${days}d ${hours}h`;
  if (hours > 0) return `Resets in ${hours}h`;
  return "Resets soon";
};

const formatUsageValue = (value: number, unit: string): string => {
  if (unit === "GB" || unit === "MB") {
    if (value >= 1000 && unit === "MB") {
      return `${(value / 1000).toFixed(1)} GB`;
    }
    return `${value.toFixed(1)} ${unit}`;
  }
  return `${value.toLocaleString()} ${unit}`;
};

// ============================================================================
// Components
// ============================================================================

function CompactUsageMeter({ item }: { item: UsageItem }) {
  const percentage = getUsagePercentage(item.used, item.limit);
  const color = getUsageColor(
    percentage,
    item.warningThreshold,
    item.criticalThreshold
  );
  const isUnlimited = item.limit === Infinity;

  return (
    <Tooltip
      content={
        <div className="p-2 max-w-xs">
          <p className="font-semibold">{item.label}</p>
          {item.description && (
            <p className="text-xs text-default-500">{item.description}</p>
          )}
          <p className="text-sm mt-1">
            {formatUsageValue(item.used, item.unit)} /{" "}
            {isUnlimited
              ? "Unlimited"
              : formatUsageValue(item.limit, item.unit)}
          </p>
          {item.resetDate && (
            <p className="text-xs text-default-400 mt-1">
              {formatTimeUntilReset(item.resetDate)}
            </p>
          )}
        </div>
      }
    >
      <div className="flex items-center gap-2 cursor-default">
        <Icon icon={item.icon} className={`w-4 h-4 text-${color}`} />
        <Progress
          size="sm"
          value={isUnlimited ? 0 : percentage}
          color={color}
          className="w-16"
          aria-label={item.label}
        />
        <span className="text-xs text-default-500">
          {isUnlimited ? "∞" : `${Math.round(percentage)}%`}
        </span>
      </div>
    </Tooltip>
  );
}

function DetailedUsageItem({
  item,
  showUpgradePrompt,
  onUpgrade,
}: {
  item: UsageItem;
  showUpgradePrompt?: boolean;
  onUpgrade?: () => void;
}) {
  const percentage = getUsagePercentage(item.used, item.limit);
  const color = getUsageColor(
    percentage,
    item.warningThreshold,
    item.criticalThreshold
  );
  const isUnlimited = item.limit === Infinity;
  const isNearLimit = percentage >= (item.warningThreshold || 70);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-2"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className={`w-8 h-8 rounded-lg bg-${color}/10 flex items-center justify-center`}
          >
            <Icon icon={item.icon} className={`w-4 h-4 text-${color}`} />
          </div>
          <div>
            <p className="font-medium text-sm">{item.label}</p>
            {item.description && (
              <p className="text-xs text-default-500">{item.description}</p>
            )}
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm font-medium">
            {formatUsageValue(item.used, item.unit)}
            <span className="text-default-500">
              {" / "}
              {isUnlimited ? "∞" : formatUsageValue(item.limit, item.unit)}
            </span>
          </p>
          {item.resetDate && (
            <p className="text-xs text-default-400">
              {formatTimeUntilReset(item.resetDate)}
            </p>
          )}
        </div>
      </div>

      <Progress
        size="md"
        value={isUnlimited ? 0 : percentage}
        color={color}
        className="w-full"
        aria-label={item.label}
      />

      {isNearLimit && !isUnlimited && showUpgradePrompt && (
        <div className="flex items-center justify-between bg-warning/10 rounded-lg p-2">
          <div className="flex items-center gap-2">
            <Icon
              icon="solar:danger-triangle-bold"
              className="w-4 h-4 text-warning"
            />
            <span className="text-xs text-warning">Approaching limit</span>
          </div>
          <Button size="sm" color="warning" variant="flat" onClick={onUpgrade}>
            Upgrade
          </Button>
        </div>
      )}
    </motion.div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function UsageMeter({
  items,
  variant = "detailed",
  showUpgradePrompt = true,
  onUpgrade,
  className = "",
}: UsageMeterProps) {
  // Calculate overall usage status
  const criticalItems = items.filter((item) => {
    const pct = getUsagePercentage(item.used, item.limit);
    return pct >= (item.criticalThreshold || 90);
  });

  const warningItems = items.filter((item) => {
    const pct = getUsagePercentage(item.used, item.limit);
    return (
      pct >= (item.warningThreshold || 70) &&
      pct < (item.criticalThreshold || 90)
    );
  });

  if (variant === "compact") {
    return (
      <div className={`flex items-center gap-4 flex-wrap ${className}`}>
        {items.map((item) => (
          <CompactUsageMeter key={item.id} item={item} />
        ))}
      </div>
    );
  }

  if (variant === "card") {
    return (
      <Card className={className}>
        <CardBody className="gap-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Usage Overview</h3>
            <div className="flex items-center gap-2">
              {criticalItems.length > 0 && (
                <Chip size="sm" color="danger" variant="flat">
                  {criticalItems.length} critical
                </Chip>
              )}
              {warningItems.length > 0 && (
                <Chip size="sm" color="warning" variant="flat">
                  {warningItems.length} warning
                </Chip>
              )}
            </div>
          </div>

          <div className="space-y-4">
            {items.map((item) => (
              <DetailedUsageItem
                key={item.id}
                item={item}
                showUpgradePrompt={showUpgradePrompt}
                onUpgrade={onUpgrade}
              />
            ))}
          </div>

          {showUpgradePrompt &&
            (criticalItems.length > 0 || warningItems.length > 0) && (
              <>
                <div className="border-t border-divider pt-4">
                  <Button
                    color="primary"
                    fullWidth
                    onClick={onUpgrade}
                    startContent={
                      <Icon icon="solar:crown-bold" className="w-4 h-4" />
                    }
                  >
                    Upgrade for More
                  </Button>
                </div>
              </>
            )}
        </CardBody>
      </Card>
    );
  }

  // Default: detailed list
  return (
    <div className={`space-y-4 ${className}`}>
      {items.map((item) => (
        <DetailedUsageItem
          key={item.id}
          item={item}
          showUpgradePrompt={showUpgradePrompt}
          onUpgrade={onUpgrade}
        />
      ))}
    </div>
  );
}

// ============================================================================
// Default Usage Items (Example)
// ============================================================================

export const DEFAULT_USAGE_ITEMS: UsageItem[] = [
  {
    id: "replays",
    label: "Replay Uploads",
    description: "Monthly replay uploads",
    icon: "solar:videocamera-record-bold-duotone",
    used: 45,
    limit: 50,
    unit: "replays",
    resetPeriod: "monthly",
    resetDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1),
    warningThreshold: 80,
    criticalThreshold: 95,
  },
  {
    id: "storage",
    label: "Cloud Storage",
    description: "Total storage used",
    icon: "solar:cloud-storage-bold-duotone",
    used: 3.2,
    limit: 5,
    unit: "GB",
    warningThreshold: 70,
    criticalThreshold: 90,
  },
  {
    id: "ai-analysis",
    label: "AI Analysis",
    description: "AI-powered match analysis",
    icon: "solar:cpu-bolt-bold-duotone",
    used: 8,
    limit: 10,
    unit: "analyses",
    resetPeriod: "monthly",
    resetDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1),
    warningThreshold: 70,
    criticalThreshold: 90,
  },
  {
    id: "api-calls",
    label: "API Requests",
    description: "Daily API call limit",
    icon: "solar:programming-bold-duotone",
    used: 750,
    limit: 1000,
    unit: "calls",
    resetPeriod: "daily",
    resetDate: new Date(new Date().setHours(24, 0, 0, 0)),
    warningThreshold: 80,
    criticalThreshold: 95,
  },
];

export default UsageMeter;

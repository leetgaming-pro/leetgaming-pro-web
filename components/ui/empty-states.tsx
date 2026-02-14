"use client";

import React from "react";
import { Card, CardBody, Button } from "@nextui-org/react";
import { Icon } from "@iconify/react";
import clsx from "clsx";
import { electrolize } from "@/config/fonts";

// Empty state with illustration
export function EmptyState({
  icon = "solar:folder-2-bold-duotone",
  title,
  description,
  action,
  actionLabel,
  actionIcon,
  variant = "default",
}: {
  icon?: string;
  title: string;
  description: string;
  action?: () => void;
  actionLabel?: string;
  actionIcon?: string;
  variant?: "default" | "error" | "search" | "upload" | "match";
}) {
  const variantConfig = {
    default: {
      iconColor: "text-default-400",
      bgGradient: "from-default-100/50 to-transparent",
    },
    error: {
      iconColor: "text-danger",
      bgGradient: "from-danger/10 to-transparent",
    },
    search: {
      iconColor: "text-[#DCFF37]",
      bgGradient: "from-[#DCFF37]/10 to-transparent",
    },
    upload: {
      iconColor: "text-[#FF4654]",
      bgGradient: "from-[#FF4654]/10 to-transparent",
    },
    match: {
      iconColor: "text-[#FFC700]",
      bgGradient: "from-[#FFC700]/10 to-transparent",
    },
  };

  const config = variantConfig[variant];

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      {/* Decorative background */}
      <div
        className={clsx(
          "absolute inset-0 bg-gradient-to-b pointer-events-none",
          config.bgGradient,
        )}
        style={{ opacity: 0.5 }}
      />

      {/* Icon container with glow effect */}
      <div className="relative mb-6">
        <div
          className={clsx(
            "absolute inset-0 blur-xl opacity-30",
            config.iconColor,
          )}
        >
          <Icon icon={icon} width={80} />
        </div>
        <div
          className={clsx(
            "relative w-20 h-20 flex items-center justify-center rounded-2xl",
            "bg-gradient-to-br from-default-100/80 to-default-50/50",
            "border border-default-200/50",
          )}
        >
          <Icon icon={icon} width={40} className={config.iconColor} />
        </div>
      </div>

      {/* Content */}
      <div className="text-center space-y-3 max-w-md relative z-10">
        <h3
          className={clsx(
            "text-xl font-bold uppercase tracking-tight",
            electrolize.className,
          )}
        >
          {title}
        </h3>
        <p className="text-sm text-default-500 leading-relaxed">
          {description}
        </p>
      </div>

      {/* Action button */}
      {action && actionLabel && (
        <Button
          className="mt-6 bg-gradient-to-r from-[#FF4654] to-[#FFC700] text-white font-semibold"
          size="lg"
          onClick={action}
          startContent={actionIcon && <Icon icon={actionIcon} width={18} />}
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

// No matches found empty state
export function NoMatchesFound({
  searchTerm,
  onClearSearch,
}: {
  searchTerm?: string;
  onClearSearch?: () => void;
}) {
  return (
    <EmptyState
      icon="solar:magnifer-bold-duotone"
      title="No Matches Found"
      description={
        searchTerm
          ? `No matches found for "${searchTerm}". Try adjusting your search or filters.`
          : "No matches available yet. Upload a replay to see match analytics here!"
      }
      variant="search"
      action={onClearSearch}
      actionLabel={searchTerm ? "Clear Search" : undefined}
      actionIcon="solar:close-circle-bold"
    />
  );
}

// No replays found empty state
export function NoReplaysFound({
  isAuthenticated,
  onUpload,
  hasFilters,
  onClearFilters,
}: {
  isAuthenticated?: boolean;
  onUpload?: () => void;
  hasFilters?: boolean;
  onClearFilters?: () => void;
}) {
  if (hasFilters) {
    return (
      <EmptyState
        icon="solar:filter-bold-duotone"
        title="No Results"
        description="No replays match your current filters. Try adjusting your selection to see more results."
        variant="search"
        action={onClearFilters}
        actionLabel="Clear Filters"
        actionIcon="solar:close-circle-bold"
      />
    );
  }

  return (
    <EmptyState
      icon="solar:videocamera-record-bold-duotone"
      title="No Replays Yet"
      description={
        isAuthenticated
          ? "Be the first to upload a replay! Share your epic moments with the community."
          : "Sign in to upload your first replay and share your gaming highlights."
      }
      variant="upload"
      action={onUpload}
      actionLabel={isAuthenticated ? "Upload Replay" : "Sign In to Upload"}
      actionIcon={
        isAuthenticated ? "solar:cloud-upload-bold" : "solar:login-bold"
      }
    />
  );
}

// No player stats empty state
export function NoPlayerStats({ message }: { message?: string }) {
  return (
    <EmptyState
      icon="solar:user-bold-duotone"
      title="Select a Player"
      description={message || "Choose a match and player from the dropdowns above to view detailed performance statistics and analytics."}
      variant="default"
    />
  );
}

// Processing replay empty state
export function ReplayProcessing({
  progress,
  estimatedTime,
}: {
  progress?: number;
  estimatedTime?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="relative mb-6">
        {/* Animated rings */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-24 h-24 border-4 border-[#DCFF37]/20 rounded-full animate-ping" />
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className="w-20 h-20 border-4 border-t-[#DCFF37] border-r-[#FF4654] border-b-[#FFC700] border-l-transparent rounded-full animate-spin"
            style={{ animationDuration: "1.5s" }}
          />
        </div>
        <div className="w-16 h-16 flex items-center justify-center rounded-full bg-gradient-to-br from-[#DCFF37]/20 to-[#FF4654]/20">
          <Icon
            icon="solar:refresh-circle-bold"
            width={32}
            className="text-[#DCFF37] animate-pulse"
          />
        </div>
      </div>

      <div className="text-center space-y-3 max-w-md">
        <h3
          className={clsx(
            "text-xl font-bold uppercase tracking-tight",
            electrolize.className,
          )}
        >
          Processing Replay
        </h3>
        <p className="text-sm text-default-500">
          Analyzing game data and extracting statistics...
        </p>

        {/* Progress bar */}
        {progress !== undefined && (
          <div className="w-full max-w-xs mx-auto mt-4">
            <div className="flex justify-between text-xs text-default-500 mb-2">
              <span>{progress}% complete</span>
              {estimatedTime && <span>~{estimatedTime} remaining</span>}
            </div>
            <div className="h-2 bg-default-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#FF4654] via-[#FFC700] to-[#DCFF37] rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Error state - LeetGaming branded
export function ErrorState({
  title = "Unexpected Error",
  message,
  onRetry,
  onGoBack,
  retryLabel = "Try Again",
}: {
  title?: string;
  message?: string;
  onRetry?: () => void;
  onGoBack?: () => void;
  retryLabel?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      {/* Animated error icon with clip-path */}
      <div className="relative mb-6">
        <div className="absolute inset-0 blur-xl bg-danger/20 dark:bg-[#FF4654]/20 animate-pulse" />
        <div
          className="relative w-20 h-20 flex items-center justify-center bg-gradient-to-br from-danger/20 to-danger/5 dark:from-[#FF4654]/20 dark:to-[#FF4654]/5 border border-danger/30 dark:border-[#FF4654]/30"
          style={{
            clipPath:
              "polygon(0 0, 100% 0, 100% calc(100% - 16px), calc(100% - 16px) 100%, 0 100%)",
          }}
        >
          <Icon
            icon="solar:bug-bold-duotone"
            width={40}
            className="text-danger dark:text-[#FF4654]"
          />
        </div>
      </div>

      <div className="text-center space-y-3 max-w-md">
        <h3
          className={clsx(
            "text-xl font-bold uppercase tracking-tight",
            electrolize.className,
          )}
        >
          <span className="bg-gradient-to-r from-[#FF4654] to-[#FFC700] dark:from-[#FF4654] dark:to-[#DCFF37] bg-clip-text text-transparent">
            {title}
          </span>
        </h3>
        <p className="text-sm text-default-500">
          {message || "An unexpected error occurred. Please try again."}
        </p>
      </div>

      {/* Actions with clip-path buttons */}
      <div className="flex gap-3 mt-6">
        {onGoBack && (
          <Button
            variant="bordered"
            className="border-[#34445C]/30 dark:border-[#DCFF37]/30 text-[#34445C] dark:text-[#DCFF37] hover:bg-[#34445C]/5 dark:hover:bg-[#DCFF37]/10 rounded-none"
            style={{
              clipPath:
                "polygon(0 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%)",
            }}
            onClick={onGoBack}
            startContent={<Icon icon="solar:arrow-left-bold" width={18} />}
          >
            Go Back
          </Button>
        )}
        {onRetry && (
          <Button
            className="bg-gradient-to-r from-[#FF4654] to-[#FFC700] dark:from-[#FF4654] dark:to-[#DCFF37] text-white dark:text-black font-bold rounded-none"
            style={{
              clipPath:
                "polygon(0 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%)",
            }}
            onClick={onRetry}
            startContent={<Icon icon="solar:refresh-bold" width={18} />}
          >
            {retryLabel}
          </Button>
        )}
      </div>
    </div>
  );
}

// Coming soon placeholder
export function ComingSoon({
  feature,
  description,
}: {
  feature: string;
  description?: string;
}) {
  return (
    <Card className="bg-gradient-to-br from-[#DCFF37]/5 to-[#FF4654]/5 border border-[#DCFF37]/20">
      <CardBody className="py-12">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="w-16 h-16 flex items-center justify-center rounded-2xl bg-gradient-to-br from-[#DCFF37]/20 to-[#FF4654]/10">
            <Icon
              icon="solar:rocket-2-bold-duotone"
              width={32}
              className="text-[#DCFF37]"
            />
          </div>
          <div className="space-y-2">
            <h3
              className={clsx(
                "text-lg font-bold uppercase tracking-tight",
                electrolize.className,
              )}
            >
              {feature}
            </h3>
            <p className="text-sm text-default-500 max-w-md">
              {description ||
                "This feature is coming soon. Stay tuned for updates!"}
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-[#DCFF37]">
            <Icon icon="solar:clock-circle-bold" width={14} />
            <span>Coming Soon</span>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}

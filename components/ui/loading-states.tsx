"use client";

import React from "react";
import { Card, CardBody, Skeleton } from "@nextui-org/react";
import { Icon } from "@iconify/react";
import clsx from "clsx";

// Animated pulse skeleton with esports styling
export function EsportsSkeleton({
  className,
  variant = "default",
}: {
  className?: string;
  variant?: "default" | "card" | "avatar" | "text" | "stat";
}) {
  const baseClasses =
    "animate-pulse bg-gradient-to-r from-[#34445C]/20 via-[#34445C]/40 to-[#34445C]/20 dark:from-[#DCFF37]/5 dark:via-[#DCFF37]/10 dark:to-[#DCFF37]/5";

  if (variant === "card") {
    return (
      <Card className={clsx("overflow-hidden", className)}>
        <div className={clsx(baseClasses, "aspect-video")} />
        <CardBody className="space-y-3">
          <div className={clsx(baseClasses, "h-5 w-3/4 rounded")} />
          <div className={clsx(baseClasses, "h-4 w-1/2 rounded")} />
          <div className="flex gap-2">
            <div className={clsx(baseClasses, "h-8 w-20 rounded")} />
            <div className={clsx(baseClasses, "h-8 w-20 rounded")} />
          </div>
        </CardBody>
      </Card>
    );
  }

  if (variant === "avatar") {
    return <div className={clsx(baseClasses, "rounded-full", className)} />;
  }

  if (variant === "stat") {
    return (
      <Card className={clsx("p-4", className)}>
        <div className="flex items-center gap-3">
          <div className={clsx(baseClasses, "w-12 h-12 rounded-xl")} />
          <div className="flex-1 space-y-2">
            <div className={clsx(baseClasses, "h-6 w-16 rounded")} />
            <div className={clsx(baseClasses, "h-3 w-24 rounded")} />
          </div>
        </div>
      </Card>
    );
  }

  return <div className={clsx(baseClasses, "rounded", className)} />;
}

// Spinning loader with esports branding
export function EsportsSpinner({
  size = "md",
  label,
}: {
  size?: "sm" | "md" | "lg" | "xl";
  label?: string;
}) {
  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-10 h-10",
    lg: "w-16 h-16",
    xl: "w-24 h-24",
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        {/* Outer glow ring */}
        <div
          className={clsx(
            sizeClasses[size],
            "absolute inset-0 rounded-full blur-md bg-gradient-to-r from-[#FF4654] via-[#FFC700] to-[#DCFF37] animate-spin"
          )}
          style={{ animationDuration: "3s" }}
        />
        {/* Main spinner */}
        <div
          className={clsx(
            sizeClasses[size],
            "relative rounded-full border-2 border-transparent",
            "bg-gradient-to-r from-[#FF4654] via-[#FFC700] to-[#DCFF37]",
            "animate-spin"
          )}
          style={{
            backgroundClip: "padding-box",
            WebkitBackgroundClip: "padding-box",
          }}
        >
          <div className="absolute inset-[3px] rounded-full bg-background" />
        </div>
        {/* Inner pulse */}
        <div
          className={clsx(
            "absolute inset-0 flex items-center justify-center",
            "animate-pulse"
          )}
        >
          <Icon
            icon="solar:gamepad-bold"
            className="text-[#DCFF37]"
            width={size === "sm" ? 12 : size === "md" ? 16 : size === "lg" ? 24 : 32}
          />
        </div>
      </div>
      {label && (
        <p className="text-sm text-default-500 animate-pulse">{label}</p>
      )}
    </div>
  );
}

// Full page loading state
export function PageLoadingState({
  title = "Loading...",
  subtitle,
}: {
  title?: string;
  subtitle?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
      <EsportsSpinner size="xl" />
      <div className="text-center space-y-2">
        <h2 className="text-xl font-bold text-default-700">{title}</h2>
        {subtitle && (
          <p className="text-sm text-default-500 max-w-md">{subtitle}</p>
        )}
      </div>
    </div>
  );
}

// Replay card skeleton
export function ReplayCardSkeleton() {
  return (
    <Card className="group overflow-hidden border border-default-200/50 dark:border-default-100/50">
      <CardBody className="p-0">
        <div className="aspect-video relative overflow-hidden">
          <Skeleton className="absolute inset-0" />
          <div className="absolute top-2 left-2 flex gap-1">
            <Skeleton className="h-5 w-12 rounded-full" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
        </div>
        <div className="p-4 space-y-3">
          <Skeleton className="h-5 w-4/5 rounded" />
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-24 rounded" />
            <Skeleton className="h-4 w-20 rounded" />
          </div>
          <div className="flex gap-2 pt-1">
            <Skeleton className="h-8 flex-1 rounded" />
            <Skeleton className="h-8 w-10 rounded" />
          </div>
        </div>
      </CardBody>
    </Card>
  );
}

// Match card skeleton
export function MatchCardSkeleton() {
  return (
    <Card className="overflow-hidden border border-default-200/50">
      <CardBody className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="w-10 h-10 rounded" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-32 rounded" />
              <Skeleton className="h-3 w-20 rounded" />
            </div>
          </div>
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
        <div className="flex items-center justify-center gap-6 py-4">
          <Skeleton className="h-10 w-16 rounded" />
          <Skeleton className="h-6 w-8 rounded" />
          <Skeleton className="h-10 w-16 rounded" />
        </div>
        <div className="flex justify-between pt-2">
          <Skeleton className="h-8 w-24 rounded" />
          <Skeleton className="h-8 w-24 rounded" />
        </div>
      </CardBody>
    </Card>
  );
}

// Stats grid skeleton
export function StatsGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <EsportsSkeleton key={i} variant="stat" />
      ))}
    </div>
  );
}

// Chart skeleton
export function ChartSkeleton({
  height = 320,
}: {
  height?: number;
}) {
  return (
    <Card className="overflow-hidden">
      <CardBody className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-40 rounded" />
          <Skeleton className="h-8 w-24 rounded" />
        </div>
        <div
          className="relative overflow-hidden rounded-lg bg-gradient-to-b from-[#34445C]/5 to-transparent"
          style={{ height }}
        >
          {/* Simulated chart lines */}
          <div className="absolute inset-0 flex items-end justify-around px-4 pb-8">
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className="w-4 bg-gradient-to-t from-[#DCFF37]/20 to-transparent rounded-t animate-pulse"
                style={{
                  height: `${30 + Math.random() * 50}%`,
                  animationDelay: `${i * 100}ms`,
                }}
              />
            ))}
          </div>
          {/* Grid lines */}
          <div className="absolute inset-0 flex flex-col justify-between py-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="border-b border-default-200/20" />
            ))}
          </div>
        </div>
      </CardBody>
    </Card>
  );
}

// Table skeleton
export function TableSkeleton({
  rows = 5,
  columns = 6,
}: {
  rows?: number;
  columns?: number;
}) {
  return (
    <Card className="overflow-hidden">
      <CardBody className="p-0">
        {/* Header */}
        <div className="flex items-center gap-4 p-4 border-b border-default-200/20">
          {Array.from({ length: columns }).map((_, i) => (
            <Skeleton
              key={i}
              className={clsx(
                "h-4 rounded",
                i === 0 ? "w-32" : "w-16",
                i === 0 ? "flex-shrink-0" : "flex-1"
              )}
            />
          ))}
        </div>
        {/* Rows */}
        {Array.from({ length: rows }).map((_, rowIdx) => (
          <div
            key={rowIdx}
            className="flex items-center gap-4 p-4 border-b border-default-200/10 last:border-0"
          >
            <div className="flex items-center gap-3 w-32 flex-shrink-0">
              <Skeleton className="w-8 h-8 rounded-full" />
              <Skeleton className="h-4 w-20 rounded" />
            </div>
            {Array.from({ length: columns - 1 }).map((_, colIdx) => (
              <Skeleton key={colIdx} className="h-4 flex-1 rounded max-w-16" />
            ))}
          </div>
        ))}
      </CardBody>
    </Card>
  );
}

// Animated shimmer effect overlay
export function ShimmerOverlay({ className }: { className?: string }) {
  return (
    <div
      className={clsx(
        "absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite]",
        "bg-gradient-to-r from-transparent via-white/10 to-transparent",
        className
      )}
    />
  );
}

// Processing state indicator
export function ProcessingIndicator({
  status,
  progress,
  message,
}: {
  status: "queued" | "processing" | "analyzing" | "complete" | "error";
  progress?: number;
  message?: string;
}) {
  const statusConfig = {
    queued: {
      icon: "solar:clock-circle-bold",
      color: "#F5A524",
      label: "Queued",
    },
    processing: {
      icon: "solar:refresh-circle-bold",
      color: "#006FEE",
      label: "Processing",
    },
    analyzing: {
      icon: "solar:chart-bold",
      color: "#7828C8",
      label: "Analyzing",
    },
    complete: {
      icon: "solar:check-circle-bold",
      color: "#17C964",
      label: "Complete",
    },
    error: {
      icon: "solar:danger-circle-bold",
      color: "#F31260",
      label: "Error",
    },
  };

  const config = statusConfig[status];

  return (
    <div className="flex flex-col items-center gap-4 p-6">
      <div className="relative">
        {status === "processing" || status === "analyzing" ? (
          <div className="animate-spin">
            <Icon icon={config.icon} width={48} style={{ color: config.color }} />
          </div>
        ) : (
          <Icon icon={config.icon} width={48} style={{ color: config.color }} />
        )}
      </div>
      <div className="text-center space-y-1">
        <p className="font-semibold" style={{ color: config.color }}>
          {config.label}
        </p>
        {message && <p className="text-sm text-default-500">{message}</p>}
      </div>
      {progress !== undefined && status !== "complete" && status !== "error" && (
        <div className="w-full max-w-xs">
          <div className="flex justify-between text-xs text-default-500 mb-1">
            <span>Progress</span>
            <span>{progress}%</span>
          </div>
          <div className="h-2 bg-default-200 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${progress}%`,
                backgroundColor: config.color,
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

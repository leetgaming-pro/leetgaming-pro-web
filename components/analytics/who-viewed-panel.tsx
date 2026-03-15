"use client";

/**
 * WhoViewedPanel — LinkedIn-style "Who viewed your profile" panel.
 * Shows a list of recent viewers with avatars, view counts, and timestamps.
 * Follows the brand system: rounded-none, clip-path corners, glass cards.
 */

import React from "react";
import {
  Card,
  CardHeader,
  CardBody,
  Avatar,
  Chip,
  Skeleton,
  Divider,
} from "@nextui-org/react";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import type { ViewerInsight } from "@/types/replay-api/view-analytics.types";

interface WhoViewedPanelProps {
  viewers: ViewerInsight[];
  totalViewers: number;
  loading?: boolean;
  isOwner?: boolean;
  onViewAll?: () => void;
  className?: string;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks}w ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

export function WhoViewedPanel({
  viewers,
  totalViewers,
  loading = false,
  isOwner = false,
  onViewAll,
  className = "",
}: WhoViewedPanelProps) {
  if (!isOwner) return null;

  return (
    <Card
      className={`rounded-none bg-content1/50 backdrop-blur-sm border border-white/10 ${className}`}
      style={{
        clipPath:
          "polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))",
      }}
    >
      <CardHeader className="flex items-center justify-between px-4 pt-4 pb-2">
        <div className="flex items-center gap-2">
          <Icon
            icon="solar:users-group-rounded-bold"
            width={20}
            className="text-warning"
          />
          <h3 className="text-sm font-semibold text-foreground">
            Who viewed your profile
          </h3>
        </div>
        {totalViewers > 0 && (
          <Chip size="sm" variant="flat" className="rounded-none bg-warning/10 text-warning">
            {totalViewers}
          </Chip>
        )}
      </CardHeader>

      <Divider className="opacity-20" />

      <CardBody className="px-4 py-3 gap-1">
        {loading ? (
          <div className="flex flex-col gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="rounded-full w-8 h-8" />
                <div className="flex-1 space-y-1">
                  <Skeleton className="h-3 w-24 rounded" />
                  <Skeleton className="h-2.5 w-16 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : viewers.length === 0 ? (
          <div className="text-center py-4">
            <Icon
              icon="solar:eye-closed-line-duotone"
              width={32}
              className="text-default-300 mx-auto mb-2"
            />
            <p className="text-xs text-default-400">No profile views yet</p>
          </div>
        ) : (
          <div className="flex flex-col gap-1">
            {viewers.slice(0, 5).map((viewer, index) => (
              <motion.div
                key={viewer.id || index}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center gap-3 py-1.5 px-1 hover:bg-white/5 transition-colors rounded-sm cursor-pointer"
              >
                {viewer.is_anonymous ? (
                  <div className="w-8 h-8 rounded-full bg-default-100 flex items-center justify-center">
                    <Icon
                      icon="solar:user-rounded-bold"
                      width={16}
                      className="text-default-400"
                    />
                  </div>
                ) : (
                  <Avatar
                    src={viewer.viewer_avatar}
                    name={viewer.viewer_nickname}
                    size="sm"
                    className="w-8 h-8"
                  />
                )}

                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-foreground truncate">
                    {viewer.is_anonymous
                      ? "Anonymous viewer"
                      : viewer.viewer_nickname || "Unknown"}
                  </p>
                  <p className="text-[10px] text-default-400">
                    {timeAgo(viewer.last_viewed_at)}
                    {viewer.view_count > 1 && (
                      <span className="ml-1">
                        · {viewer.view_count} views
                      </span>
                    )}
                  </p>
                </div>
              </motion.div>
            ))}

            {totalViewers > 5 && onViewAll && (
              <button
                onClick={onViewAll}
                className="text-xs text-primary hover:text-primary-400 text-center py-2 transition-colors"
              >
                Show all {totalViewers} viewers →
              </button>
            )}
          </div>
        )}
      </CardBody>
    </Card>
  );
}

export default WhoViewedPanel;

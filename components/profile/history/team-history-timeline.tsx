/**
 * Team History Timeline — Vertical timeline showing player's career journey
 * Branded connector line, staggered animations, current team highlight
 */

"use client";

import React from "react";
import { Avatar, Chip, Tooltip } from "@nextui-org/react";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import {
  TeamHistoryEntry,
  isCurrentTeam,
  formatTenure,
  formatDateRange,
} from "@/types/replay-api/player-profile.types";

// ============================================================================
// Types
// ============================================================================

interface TeamHistoryTimelineProps {
  history: TeamHistoryEntry[];
  onTeamClick?: (squadId: string) => void;
  className?: string;
}

// ============================================================================
// Component
// ============================================================================

export function TeamHistoryTimeline({
  history,
  onTeamClick,
  className = "",
}: TeamHistoryTimelineProps) {
  // Sort by joined_at descending (most recent first)
  const sorted = [...history].sort(
    (a, b) => new Date(b.joined_at).getTime() - new Date(a.joined_at).getTime()
  );

  if (sorted.length === 0) {
    return (
      <div className="text-center py-12">
        <div
          className="w-16 h-16 mx-auto mb-4 flex items-center justify-center bg-[#34445C]/10 dark:bg-[#DCFF37]/10"
          style={{
            clipPath:
              "polygon(0 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%)",
          }}
        >
          <Icon
            icon="solar:users-group-rounded-bold"
            width={32}
            className="text-[#34445C] dark:text-[#DCFF37]"
          />
        </div>
        <h3 className="text-lg font-semibold text-[#34445C] dark:text-[#F5F0E1] mb-2">
          No team history yet
        </h3>
        <p className="text-default-500 text-sm">
          Join your first team to start building your career timeline
        </p>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {/* Timeline line */}
      <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[#FF4654]/40 via-[#FFC700]/20 to-transparent dark:from-[#DCFF37]/40 dark:via-[#34445C]/20" />

      {/* Timeline entries */}
      <div className="space-y-0">
        {sorted.map((entry, index) => {
          const current = isCurrentTeam(entry);
          const tenure = formatTenure(entry.joined_at, entry.left_at);
          const dateRange = formatDateRange(entry.joined_at, entry.left_at);

          return (
            <motion.div
              key={`${entry.squad_id}-${entry.joined_at}`}
              className="relative pl-14 pb-8 last:pb-0"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              {/* Timeline dot */}
              <div
                className={`absolute left-4 top-3 w-5 h-5 flex items-center justify-center z-10 ${
                  current
                    ? "bg-gradient-to-br from-[#FF4654] to-[#FFC700] dark:from-[#DCFF37] dark:to-[#34445C]"
                    : "bg-[#34445C]/20 dark:bg-[#DCFF37]/20"
                }`}
                style={{
                  clipPath:
                    "polygon(0 0, 100% 0, 100% calc(100% - 4px), calc(100% - 4px) 100%, 0 100%)",
                }}
              >
                {current ? (
                  <div className="w-2 h-2 bg-[#F5F0E1] dark:bg-[#34445C] rounded-full animate-pulse" />
                ) : (
                  <div className="w-1.5 h-1.5 bg-[#34445C]/40 dark:bg-[#DCFF37]/40 rounded-full" />
                )}
              </div>

              {/* Entry card */}
              <div
                className={`p-4 border transition-all ${
                  current
                    ? "border-[#FF4654]/30 dark:border-[#DCFF37]/30 bg-gradient-to-r from-[#FF4654]/[0.03] to-transparent dark:from-[#DCFF37]/[0.03]"
                    : "border-[#FF4654]/10 dark:border-[#DCFF37]/10 hover:border-[#FF4654]/20 dark:hover:border-[#DCFF37]/20"
                } ${onTeamClick ? "cursor-pointer" : ""}`}
                style={{
                  clipPath:
                    "polygon(0 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%)",
                }}
                onClick={() => onTeamClick?.(entry.squad_id)}
              >
                <div className="flex items-start gap-4">
                  {/* Team logo */}
                  <Avatar
                    src={entry.squad_logo_uri}
                    name={entry.squad_name}
                    className="w-12 h-12 flex-shrink-0"
                    style={{
                      clipPath:
                        "polygon(0 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%)",
                    }}
                  />

                  {/* Entry details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h4 className="text-base font-bold text-[#34445C] dark:text-[#F5F0E1]">
                        {entry.squad_tag ? `[${entry.squad_tag}] ` : ""}
                        {entry.squad_name}
                      </h4>
                      {current && (
                        <Chip
                          size="sm"
                          className="bg-[#FF4654]/10 dark:bg-[#DCFF37]/10 text-[#FF4654] dark:text-[#DCFF37] rounded-none text-[10px] h-5"
                        >
                          Current
                        </Chip>
                      )}
                    </div>

                    <div className="flex items-center gap-3 text-sm text-default-500 mb-2 flex-wrap">
                      <span className="flex items-center gap-1">
                        <Icon icon="solar:user-bold" width={14} />
                        {entry.role}
                      </span>
                      <span className="flex items-center gap-1">
                        <Icon icon="solar:calendar-bold" width={14} />
                        {dateRange}
                      </span>
                      <span className="flex items-center gap-1">
                        <Icon icon="solar:clock-circle-bold" width={14} />
                        {tenure}
                      </span>
                    </div>

                    {/* Stats row */}
                    <div className="flex items-center gap-4 text-xs flex-wrap">
                      <Tooltip content="Matches played with this team">
                        <span className="flex items-center gap-1 text-default-500">
                          <Icon icon="solar:gamepad-bold" width={12} />
                          <span className="font-semibold text-[#34445C] dark:text-[#F5F0E1]">
                            {entry.matches_played}
                          </span>
                          matches
                        </span>
                      </Tooltip>

                      <Tooltip content="Win rate with this team">
                        <span className="flex items-center gap-1 text-default-500">
                          <Icon icon="solar:chart-bold" width={12} />
                          <span
                            className={`font-semibold ${
                              entry.win_rate >= 60
                                ? "text-success"
                                : entry.win_rate >= 50
                                ? "text-warning"
                                : "text-danger"
                            }`}
                          >
                            {entry.win_rate.toFixed(1)}%
                          </span>
                          win rate
                        </span>
                      </Tooltip>

                      {entry.achievements.length > 0 && (
                        <Tooltip
                          content={
                            <div>
                              <p className="font-semibold mb-1">Achievements</p>
                              {entry.achievements.map((a, i) => (
                                <p key={i} className="text-xs">
                                  🏆 {a}
                                </p>
                              ))}
                            </div>
                          }
                        >
                          <span className="flex items-center gap-1 text-[#FFC700]">
                            <Icon icon="solar:cup-star-bold" width={12} />
                            <span className="font-semibold">
                              {entry.achievements.length}
                            </span>
                            {entry.achievements.length === 1
                              ? "title"
                              : "titles"}
                          </span>
                        </Tooltip>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

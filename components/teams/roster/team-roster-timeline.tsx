/**
 * Team Roster Timeline — Historical roster changes for team profiles
 * Shows member tenure, contributions, and role changes over time
 */

"use client";

import React from "react";
import { Avatar, Chip, Tooltip, Divider } from "@nextui-org/react";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import {
  TeamRosterHistoryEntry,
  formatTenure,
  formatDateRange,
} from "@/types/replay-api/player-profile.types";

// ============================================================================
// Types
// ============================================================================

interface TeamRosterTimelineProps {
  roster: TeamRosterHistoryEntry[];
  onPlayerClick?: (playerId: string) => void;
  className?: string;
}

// ============================================================================
// Component
// ============================================================================

export function TeamRosterTimeline({
  roster,
  onPlayerClick,
  className = "",
}: TeamRosterTimelineProps) {
  // Split into active and past members
  const activeMembers = roster
    .filter((m) => !m.left_at)
    .sort(
      (a, b) =>
        new Date(a.joined_at).getTime() - new Date(b.joined_at).getTime()
    );
  const pastMembers = roster
    .filter((m) => m.left_at)
    .sort(
      (a, b) =>
        new Date(b.left_at ?? 0).getTime() - new Date(a.left_at ?? 0).getTime()
    );

  if (roster.length === 0) {
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
          No roster history
        </h3>
        <p className="text-default-500 text-sm">
          Roster changes will appear here as members join and leave
        </p>
      </div>
    );
  }

  const renderMember = (
    member: TeamRosterHistoryEntry,
    index: number,
    isActive: boolean
  ) => {
    const tenure = formatTenure(member.joined_at, member.left_at);
    const dateRange = formatDateRange(member.joined_at, member.left_at);

    // Rating color
    const ratingColor =
      member.contribution_rating >= 1.3
        ? "text-success"
        : member.contribution_rating >= 1.1
        ? "text-primary"
        : member.contribution_rating >= 0.9
        ? "text-warning"
        : "text-danger";

    return (
      <motion.div
        key={`${member.player_id}-${member.joined_at}`}
        className={`relative pl-14 pb-6 last:pb-0`}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3, delay: index * 0.06 }}
      >
        {/* Timeline dot */}
        <div
          className={`absolute left-4 top-3 w-4 h-4 flex items-center justify-center z-10 ${
            isActive
              ? "bg-gradient-to-br from-[#FF4654] to-[#FFC700] dark:from-[#DCFF37] dark:to-[#34445C]"
              : "bg-[#34445C]/15 dark:bg-[#DCFF37]/15"
          }`}
          style={{
            clipPath:
              "polygon(0 0, 100% 0, 100% calc(100% - 3px), calc(100% - 3px) 100%, 0 100%)",
          }}
        >
          {isActive && (
            <div className="w-1.5 h-1.5 bg-[#F5F0E1] dark:bg-[#34445C] rounded-full" />
          )}
        </div>

        {/* Member row */}
        <div
          className={`flex items-center gap-3 p-3 border transition-all ${
            isActive
              ? "border-[#FF4654]/20 dark:border-[#DCFF37]/20 bg-[#FF4654]/[0.02] dark:bg-[#DCFF37]/[0.02]"
              : "border-transparent hover:border-[#FF4654]/10 dark:hover:border-[#DCFF37]/10"
          } ${onPlayerClick ? "cursor-pointer hover:bg-[#34445C]/[0.03] dark:hover:bg-[#DCFF37]/[0.03]" : ""}`}
          style={{
            clipPath:
              "polygon(0 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%)",
          }}
          onClick={() => onPlayerClick?.(member.player_id)}
        >
          <Avatar
            src={member.player_avatar}
            name={member.player_nickname}
            size="sm"
            className="flex-shrink-0"
          />

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-[#34445C] dark:text-[#F5F0E1] truncate">
                {member.player_nickname}
              </span>
              <Chip
                size="sm"
                variant="flat"
                className="rounded-none text-[10px] h-4"
              >
                {member.role}
              </Chip>
              {isActive && (
                <Chip
                  size="sm"
                  className="bg-success/10 text-success rounded-none text-[10px] h-4"
                >
                  Active
                </Chip>
              )}
            </div>
            <div className="text-[11px] text-default-400 mt-0.5">
              {dateRange} · {tenure}
            </div>
          </div>

          <div className="flex items-center gap-4 text-right">
            <Tooltip content="Matches played">
              <span className="text-xs text-default-500">
                <span className="font-semibold text-[#34445C] dark:text-[#F5F0E1]">
                  {member.matches_played}
                </span>{" "}
                <span className="hidden sm:inline">matches</span>
              </span>
            </Tooltip>

            <Tooltip content="Contribution Rating (HLTV 2.0)">
              <span className={`text-sm font-bold ${ratingColor}`}>
                {member.contribution_rating.toFixed(2)}
              </span>
            </Tooltip>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className={`relative ${className}`}>
      {/* Active Roster */}
      {activeMembers.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <div
              className="w-6 h-6 flex items-center justify-center bg-gradient-to-br from-[#FF4654] to-[#FFC700] dark:from-[#DCFF37] dark:to-[#34445C]"
              style={{
                clipPath:
                  "polygon(0 0, 100% 0, 100% calc(100% - 5px), calc(100% - 5px) 100%, 0 100%)",
              }}
            >
              <Icon
                icon="solar:users-group-rounded-bold"
                width={14}
                className="text-[#F5F0E1] dark:text-[#34445C]"
              />
            </div>
            <h3 className="text-sm font-bold uppercase tracking-widest text-[#34445C] dark:text-[#F5F0E1]">
              Active Roster
            </h3>
            <Chip size="sm" variant="flat" className="rounded-none h-5 text-[10px]">
              {activeMembers.length}
            </Chip>
            <div className="flex-1 h-px bg-gradient-to-r from-[#FF4654]/20 to-transparent dark:from-[#DCFF37]/20" />
          </div>

          <div className="relative">
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[#FF4654]/30 to-[#FF4654]/10 dark:from-[#DCFF37]/30 dark:to-[#DCFF37]/10" />
            {activeMembers.map((member, i) =>
              renderMember(member, i, true)
            )}
          </div>
        </div>
      )}

      {/* Past Members */}
      {pastMembers.length > 0 && (
        <div>
          {activeMembers.length > 0 && <Divider className="my-4" />}

          <div className="flex items-center gap-2 mb-4">
            <div
              className="w-6 h-6 flex items-center justify-center bg-[#34445C]/10 dark:bg-[#DCFF37]/10"
              style={{
                clipPath:
                  "polygon(0 0, 100% 0, 100% calc(100% - 5px), calc(100% - 5px) 100%, 0 100%)",
              }}
            >
              <Icon
                icon="solar:history-bold"
                width={14}
                className="text-default-400"
              />
            </div>
            <h3 className="text-sm font-bold uppercase tracking-widest text-default-400">
              Past Members
            </h3>
            <Chip
              size="sm"
              variant="flat"
              className="rounded-none h-5 text-[10px] text-default-400"
            >
              {pastMembers.length}
            </Chip>
            <div className="flex-1 h-px bg-gradient-to-r from-default-200 to-transparent" />
          </div>

          <div className="relative">
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-default-200 to-transparent" />
            {pastMembers.map((member, i) =>
              renderMember(member, i + activeMembers.length, false)
            )}
          </div>
        </div>
      )}
    </div>
  );
}

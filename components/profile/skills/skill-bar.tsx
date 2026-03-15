/**
 * Skill Bar — Individual skill row with animated progress bar
 * Endorsement-enabled, branded clip-path container
 */

"use client";

import React, { useState } from "react";
import { Progress, Tooltip, Button } from "@nextui-org/react";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import {
  PlayerSkill,
  getSkillCategoryIcon,
  getSkillCategoryColor,
  getSkillCategoryLabel,
  getSkillLevelLabel,
} from "@/types/replay-api/player-profile.types";

// ============================================================================
// Types
// ============================================================================

interface SkillBarProps {
  skill: PlayerSkill;
  onEndorse?: (skillId: string) => void;
  canEndorse?: boolean;
  className?: string;
  delay?: number;
}

interface SkillBarListProps {
  skills: PlayerSkill[];
  onEndorse?: (skillId: string) => void;
  canEndorse?: boolean;
  sortBy?: "level" | "endorsements" | "name";
  className?: string;
}

// ============================================================================
// SkillBar
// ============================================================================

export function SkillBar({
  skill,
  onEndorse,
  canEndorse = false,
  className = "",
  delay = 0,
}: SkillBarProps) {
  const [isEndorsing, setIsEndorsing] = useState(false);

  const handleEndorse = async () => {
    if (!onEndorse || isEndorsing) return;
    setIsEndorsing(true);
    try {
      onEndorse(skill.id);
    } finally {
      setTimeout(() => setIsEndorsing(false), 500);
    }
  };

  const color = getSkillCategoryColor(skill.category);

  return (
    <motion.div
      className={`group relative p-3 border border-[#FF4654]/10 dark:border-[#DCFF37]/10 bg-[#34445C]/[0.02] dark:bg-[#DCFF37]/[0.02] hover:bg-[#34445C]/[0.05] dark:hover:bg-[#DCFF37]/[0.05] transition-colors ${className}`}
      style={{
        clipPath:
          "polygon(0 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%)",
      }}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay }}
    >
      <div className="flex items-center gap-3">
        {/* Skill icon container */}
        <div
          className="w-9 h-9 flex-shrink-0 flex items-center justify-center bg-gradient-to-br from-[#FF4654]/10 to-[#FFC700]/10 dark:from-[#DCFF37]/10 dark:to-[#34445C]/10"
          style={{
            clipPath:
              "polygon(0 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%)",
          }}
        >
          <Icon
            icon={getSkillCategoryIcon(skill.category)}
            width={18}
            className="text-[#FF4654] dark:text-[#DCFF37]"
          />
        </div>

        {/* Skill name and progress */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-[#34445C] dark:text-[#F5F0E1] truncate">
                {skill.skill_name}
              </span>
              <span className="text-[10px] text-default-400 uppercase tracking-wider">
                {getSkillCategoryLabel(skill.category)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#FF4654] dark:text-[#DCFF37]">
                {skill.level}
              </span>
              <span className="text-[10px] text-default-400">
                {getSkillLevelLabel(skill.level)}
              </span>
            </div>
          </div>
          <Progress
            value={skill.level}
            color={color}
            size="sm"
            classNames={{
              track: "bg-[#34445C]/10 dark:bg-[#DCFF37]/10",
              indicator: "rounded-none",
            }}
          />
        </div>

        {/* Endorsement button */}
        <div className="flex items-center gap-1.5 ml-2">
          {canEndorse && (
            <Tooltip
              content={
                skill.endorsed_by_viewer
                  ? "Already endorsed"
                  : "Endorse this skill"
              }
            >
              <Button
                isIconOnly
                size="sm"
                variant="light"
                className={`min-w-6 w-6 h-6 ${
                  skill.endorsed_by_viewer
                    ? "text-[#FF4654] dark:text-[#DCFF37]"
                    : "text-default-400 hover:text-[#FF4654] dark:hover:text-[#DCFF37]"
                }`}
                isDisabled={isEndorsing}
                onPress={handleEndorse}
              >
                <Icon
                  icon={
                    skill.endorsed_by_viewer
                      ? "solar:like-bold"
                      : "solar:like-linear"
                  }
                  width={14}
                />
              </Button>
            </Tooltip>
          )}
          <Tooltip content={`${skill.endorsement_count} endorsements`}>
            <span className="text-xs text-default-400 min-w-[20px] text-center">
              {skill.endorsement_count > 0 ? skill.endorsement_count : ""}
            </span>
          </Tooltip>
        </div>
      </div>
    </motion.div>
  );
}

// ============================================================================
// SkillBarList — Sorted list of SkillBar components
// ============================================================================

export function SkillBarList({
  skills,
  onEndorse,
  canEndorse = false,
  sortBy = "level",
  className = "",
}: SkillBarListProps) {
  const sortedSkills = [...skills].sort((a, b) => {
    switch (sortBy) {
      case "level":
        return b.level - a.level;
      case "endorsements":
        return b.endorsement_count - a.endorsement_count;
      case "name":
        return a.skill_name.localeCompare(b.skill_name);
      default:
        return 0;
    }
  });

  return (
    <div className={`space-y-2 ${className}`}>
      {sortedSkills.map((skill, index) => (
        <SkillBar
          key={skill.id}
          skill={skill}
          onEndorse={onEndorse}
          canEndorse={canEndorse}
          delay={index * 0.05}
        />
      ))}
    </div>
  );
}

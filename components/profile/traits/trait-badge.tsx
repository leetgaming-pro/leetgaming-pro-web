/**
 * Trait Badge — Premium trait display with tier-colored glow
 * Hexagonal/corner-cut shape, shimmer animation for diamond tier
 */

"use client";

import React from "react";
import { Tooltip, Button } from "@nextui-org/react";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import {
  PlayerTrait,
  getTraitTierColor,
  getTraitTierLabel,
} from "@/types/replay-api/player-profile.types";

// ============================================================================
// TraitBadge
// ============================================================================

interface TraitBadgeProps {
  trait: PlayerTrait;
  onEndorse?: (traitId: string) => void;
  canEndorse?: boolean;
  size?: "sm" | "md" | "lg";
  showTooltip?: boolean;
  className?: string;
}

export function TraitBadge({
  trait,
  onEndorse,
  canEndorse = false,
  size = "md",
  showTooltip = true,
  className = "",
}: TraitBadgeProps) {
  const tierColors = getTraitTierColor(trait.tier);

  const sizeClasses = {
    sm: { container: "w-16 h-16", icon: 20, text: "text-[9px]" },
    md: { container: "w-24 h-24", icon: 28, text: "text-[10px]" },
    lg: { container: "w-32 h-32", icon: 36, text: "text-xs" },
  };

  const s = sizeClasses[size];

  const badge = (
    <motion.div
      className={`relative flex flex-col items-center justify-center gap-1 ${s.container} ${tierColors.bg} ${tierColors.border} border-2 ${tierColors.glow} transition-all hover:scale-105 cursor-default ${className}`}
      style={{
        clipPath:
          "polygon(0 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%)",
      }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, type: "spring" }}
    >
      {/* Diamond shimmer effect */}
      {trait.tier === "diamond" && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400/20 to-transparent animate-shimmer" />
        </div>
      )}

      {/* Tier ribbon */}
      <div
        className={`absolute top-0 left-0 right-0 h-1 ${
          trait.tier === "diamond"
            ? "bg-gradient-to-r from-cyan-400 to-cyan-300"
            : trait.tier === "gold"
            ? "bg-gradient-to-r from-[#FFC700] to-amber-400"
            : trait.tier === "silver"
            ? "bg-gradient-to-r from-slate-400 to-slate-300"
            : "bg-gradient-to-r from-amber-700 to-amber-600"
        }`}
      />

      <Icon icon={trait.icon} width={s.icon} className={tierColors.text} />
      <span
        className={`${s.text} font-bold text-center leading-tight ${tierColors.text} px-1`}
      >
        {trait.display_name}
      </span>

      {/* Endorsement count */}
      {trait.endorsement_count > 0 && size !== "sm" && (
        <div className="flex items-center gap-0.5">
          <Icon icon="solar:like-bold" width={10} className="text-default-400" />
          <span className="text-[9px] text-default-400">
            {trait.endorsement_count}
          </span>
        </div>
      )}
    </motion.div>
  );

  if (!showTooltip) return badge;

  return (
    <Tooltip
      content={
        <div className="px-3 py-2 max-w-[220px]">
          <div className="flex items-center gap-2 mb-1">
            <Icon icon={trait.icon} width={16} className={tierColors.text} />
            <span className="font-bold text-sm">{trait.display_name}</span>
            <span className={`text-[10px] ${tierColors.text} font-semibold uppercase`}>
              {getTraitTierLabel(trait.tier)}
            </span>
          </div>
          <p className="text-xs text-default-400 mb-1.5">{trait.description}</p>
          <p className="text-[10px] text-default-500 italic">
            {trait.awarded_criteria}
          </p>
          {trait.awarded_at && (
            <p className="text-[10px] text-default-400 mt-1">
              Earned {new Date(trait.awarded_at).toLocaleDateString()}
            </p>
          )}
          {canEndorse && onEndorse && (
            <Button
              size="sm"
              variant="flat"
              className="mt-2 w-full rounded-none text-xs"
              startContent={
                <Icon
                  icon={
                    trait.endorsed_by_viewer
                      ? "solar:like-bold"
                      : "solar:like-linear"
                  }
                  width={12}
                />
              }
              isDisabled={trait.endorsed_by_viewer}
              onPress={() => onEndorse(trait.id)}
            >
              {trait.endorsed_by_viewer
                ? "Endorsed"
                : `Endorse (${trait.endorsement_count})`}
            </Button>
          )}
        </div>
      }
      placement="top"
    >
      {badge}
    </Tooltip>
  );
}

// ============================================================================
// TraitShowcase — Grid of TraitBadges with staggered entrance
// ============================================================================

interface TraitShowcaseProps {
  traits: PlayerTrait[];
  onEndorse?: (traitId: string) => void;
  canEndorse?: boolean;
  className?: string;
}

export function TraitShowcase({
  traits,
  onEndorse,
  canEndorse = false,
  className = "",
}: TraitShowcaseProps) {
  // Group by tier, highest first
  const tierOrder = ["diamond", "gold", "silver", "bronze"] as const;
  const groupedTraits = tierOrder
    .map((tier) => ({
      tier,
      items: traits.filter((t) => t.tier === tier),
    }))
    .filter((g) => g.items.length > 0);

  if (traits.length === 0) {
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
            icon="solar:medal-ribbons-star-bold"
            width={32}
            className="text-[#34445C] dark:text-[#DCFF37]"
          />
        </div>
        <h3 className="text-lg font-semibold text-[#34445C] dark:text-[#F5F0E1] mb-2">
          No traits earned yet
        </h3>
        <p className="text-default-500 text-sm">
          Keep playing and improving to unlock professional traits
        </p>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {groupedTraits.map(({ tier, items }) => {
        const tierColors = getTraitTierColor(tier);
        return (
          <div key={tier}>
            {/* Tier header */}
            <div className="flex items-center gap-2 mb-3">
              <div
                className={`w-5 h-5 flex items-center justify-center ${tierColors.bg} ${tierColors.border} border`}
                style={{
                  clipPath:
                    "polygon(0 0, 100% 0, 100% calc(100% - 4px), calc(100% - 4px) 100%, 0 100%)",
                }}
              >
                <Icon
                  icon="solar:star-bold"
                  width={10}
                  className={tierColors.text}
                />
              </div>
              <span
                className={`text-xs font-bold uppercase tracking-widest ${tierColors.text}`}
              >
                {getTraitTierLabel(tier)} Traits
              </span>
              <div className="flex-1 h-px bg-gradient-to-r from-[#FF4654]/20 to-transparent dark:from-[#DCFF37]/20" />
            </div>

            {/* Trait grid */}
            <div className="flex flex-wrap gap-3">
              {items.map((trait, i) => (
                <motion.div
                  key={trait.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                >
                  <TraitBadge
                    trait={trait}
                    onEndorse={onEndorse}
                    canEndorse={canEndorse}
                  />
                </motion.div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

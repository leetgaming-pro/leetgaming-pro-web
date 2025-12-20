"use client";

/**
 * HighlightCard - Beautiful card component for displaying game event highlights
 * Designed for clutches, aces, multi-kills, and other epic gaming moments
 */

import React, { useState } from "react";
import {
  Card,
  CardBody,
  CardFooter,
  Image,
  Button,
  Chip,
  Avatar,
  Tooltip,
} from "@nextui-org/react";
import { Icon } from "@iconify/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  GameEvent,
  getEventTypeColor,
  getEventTypeIcon,
  formatEventTime,
  formatClutchType,
} from "@/types/replay-api/highlights.types";

interface HighlightCardProps {
  highlight: GameEvent;
  onPlay?: (highlight: GameEvent) => void;
  onLike?: (highlight: GameEvent) => void;
  onShare?: (highlight: GameEvent) => void;
  isLiked?: boolean;
  variant?: "default" | "compact" | "featured";
  className?: string;
}

const weaponIcons: Record<string, string> = {
  ak47: "game-icons:ak47",
  m4a1: "game-icons:m16",
  awp: "game-icons:sniper-rifle",
  deagle: "game-icons:revolver",
  knife: "game-icons:bowie-knife",
  default: "solar:bomb-bold",
};

export function HighlightCard({
  highlight,
  onPlay,
  onLike,
  onShare,
  isLiked = false,
  variant = "default",
  className = "",
}: HighlightCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [liked, setLiked] = useState(isLiked);

  const typeColor = getEventTypeColor(highlight.type);
  const typeIcon = getEventTypeIcon(highlight.type);
  const weaponIcon = weaponIcons[highlight.weapon?.toLowerCase() || "default"] || weaponIcons.default;

  const handleLike = () => {
    setLiked(!liked);
    onLike?.(highlight);
  };

  const handleShare = () => {
    onShare?.(highlight);
  };

  const handlePlay = () => {
    onPlay?.(highlight);
  };

  // Generate a display title
  const displayTitle = highlight.title || (() => {
    if (highlight.type === "Clutch" && highlight.clutch_type) {
      return `${formatClutchType(highlight.clutch_type)} Clutch${highlight.clutch_success ? " WIN" : ""}`;
    }
    if (highlight.type === "Ace") {
      return "ACE!";
    }
    if (highlight.type === "MultiKill" && highlight.kill_count) {
      const names = ["", "", "Double", "Triple", "Quad", "PENTA"];
      return `${names[highlight.kill_count] || highlight.kill_count + "K"} Kill`;
    }
    return highlight.type;
  })();

  // Stats badges
  const badges = [];
  if (highlight.is_headshot) badges.push({ icon: "solar:target-bold", label: "Headshot", color: "#00D9FF" });
  if (highlight.is_wallbang) badges.push({ icon: "solar:shield-minimalistic-bold", label: "Wallbang", color: "#9D4EDD" });
  if (highlight.is_noscope) badges.push({ icon: "solar:eye-closed-bold", label: "No-Scope", color: "#06FFA5" });
  if (highlight.flash_assist) badges.push({ icon: "solar:flash-bold", label: "Flash", color: "#FFFF00" });

  if (variant === "compact") {
    return (
      <Card
        isPressable
        onPress={handlePlay}
        className={`group bg-[#1a1a1a]/90 dark:bg-[#0d0d0d]/90 border border-[#34445C]/30 dark:border-[#DCFF37]/10 hover:border-[${typeColor}]/50 transition-all duration-300 rounded-none ${className}`}
        style={{
          clipPath: "polygon(0 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%)",
        }}
      >
        <CardBody className="p-3 flex flex-row gap-3 items-center">
          <div
            className="w-12 h-12 flex items-center justify-center shrink-0"
            style={{
              background: `linear-gradient(135deg, ${typeColor}30, ${typeColor}10)`,
              clipPath: "polygon(0 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%)",
            }}
          >
            <Icon icon={typeIcon} width={24} style={{ color: typeColor }} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-sm text-[#F5F0E1] truncate">{displayTitle}</p>
            <p className="text-xs text-[#F5F0E1]/50">{highlight.primary_player?.display_name || "Unknown"}</p>
          </div>
          <Chip size="sm" className="rounded-none text-xs" style={{ backgroundColor: `${typeColor}30`, color: typeColor }}>
            {highlight.type}
          </Chip>
        </CardBody>
      </Card>
    );
  }

  if (variant === "featured") {
    return (
      <Card
        isPressable
        onPress={handlePlay}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`group overflow-hidden rounded-none border-2 border-[#FF4654]/30 dark:border-[#DCFF37]/30 hover:border-[${typeColor}] transition-all duration-500 min-h-[400px] ${className}`}
      >
        {/* Background gradient and image */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0a0a0a]/60 to-[#0a0a0a] z-10" />
        <Image
          removeWrapper
          alt={displayTitle}
          className="z-0 w-full h-full object-cover absolute inset-0 transition-transform duration-700 group-hover:scale-110"
          src={highlight.thumbnail_url || `/images/maps/${highlight.map_name || "dust2"}.jpg`}
        />

        {/* Animated border glow */}
        <motion.div
          className="absolute inset-0 z-5 pointer-events-none"
          animate={{
            boxShadow: isHovered
              ? `inset 0 0 60px ${typeColor}40, 0 0 30px ${typeColor}20`
              : "none",
          }}
          transition={{ duration: 0.5 }}
        />

        {/* Top badges */}
        <div className="absolute top-4 left-4 z-20 flex gap-2">
          <Chip
            className="rounded-none font-bold uppercase tracking-wider"
            style={{
              backgroundColor: typeColor,
              color: "#0a0a0a",
              clipPath: "polygon(0 0, 100% 0, 100% calc(100% - 4px), calc(100% - 4px) 100%, 0 100%)",
            }}
            startContent={<Icon icon={typeIcon} width={16} />}
          >
            {highlight.type}
          </Chip>
          {highlight.clutch_type && (
            <Chip className="rounded-none bg-[#0a0a0a]/80 text-[#DCFF37] backdrop-blur-sm">
              {highlight.clutch_type}
            </Chip>
          )}
        </div>

        {/* Play button overlay */}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute inset-0 z-15 flex items-center justify-center"
            >
              <motion.div
                className="w-20 h-20 rounded-full flex items-center justify-center"
                style={{
                  background: `linear-gradient(135deg, ${typeColor}, ${typeColor}99)`,
                  boxShadow: `0 0 40px ${typeColor}80`,
                }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <Icon icon="solar:play-bold" width={40} className="text-[#0a0a0a] ml-1" />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 p-6 z-20">
          <div className="flex items-end justify-between">
            <div className="flex-1">
              {/* Badges */}
              {badges.length > 0 && (
                <div className="flex gap-2 mb-3">
                  {badges.map((badge, i) => (
                    <Tooltip key={i} content={badge.label}>
                      <div
                        className="w-8 h-8 flex items-center justify-center backdrop-blur-sm"
                        style={{
                          backgroundColor: `${badge.color}20`,
                          border: `1px solid ${badge.color}40`,
                        }}
                      >
                        <Icon icon={badge.icon} width={16} style={{ color: badge.color }} />
                      </div>
                    </Tooltip>
                  ))}
                </div>
              )}

              {/* Title */}
              <h3 className="text-3xl font-black text-[#F5F0E1] uppercase tracking-tight mb-2">
                {displayTitle}
              </h3>

              {/* Player info */}
              <div className="flex items-center gap-3 mb-4">
                <Avatar
                  size="sm"
                  src={highlight.primary_player?.avatar_url}
                  name={highlight.primary_player?.display_name?.[0]}
                  className={`ring-2 ring-[${typeColor}]`}
                />
                <div>
                  <p className="text-[#F5F0E1] font-semibold">{highlight.primary_player?.display_name || "Unknown Player"}</p>
                  <p className="text-xs text-[#F5F0E1]/50 flex items-center gap-2">
                    <span>{highlight.map_name || "Unknown Map"}</span>
                    <span>•</span>
                    <span>{formatEventTime(highlight.event_time)}</span>
                  </p>
                </div>
              </div>

              {/* Stats row */}
              <div className="flex items-center gap-4 text-sm text-[#F5F0E1]/70">
                {highlight.views_count !== undefined && (
                  <span className="flex items-center gap-1">
                    <Icon icon="solar:eye-bold" width={16} />
                    {highlight.views_count.toLocaleString()}
                  </span>
                )}
                {highlight.likes_count !== undefined && (
                  <span className="flex items-center gap-1">
                    <Icon icon="solar:heart-bold" width={16} />
                    {highlight.likes_count.toLocaleString()}
                  </span>
                )}
                {highlight.weapon && (
                  <span className="flex items-center gap-1">
                    <Icon icon={weaponIcon} width={16} />
                    {highlight.weapon}
                  </span>
                )}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col gap-2">
              <Button
                isIconOnly
                variant="flat"
                className={`rounded-none ${liked ? "bg-[#FF4654]" : "bg-[#F5F0E1]/10"}`}
                onPress={handleLike}
              >
                <Icon
                  icon={liked ? "solar:heart-bold" : "solar:heart-linear"}
                  width={20}
                  className={liked ? "text-white" : "text-[#F5F0E1]"}
                />
              </Button>
              <Button
                isIconOnly
                variant="flat"
                className="rounded-none bg-[#F5F0E1]/10"
                onPress={handleShare}
              >
                <Icon icon="solar:share-linear" width={20} className="text-[#F5F0E1]" />
              </Button>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  // Default variant
  return (
    <Card
      isPressable
      onPress={handlePlay}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`group overflow-hidden rounded-none border border-[#34445C]/30 dark:border-[#DCFF37]/10 hover:border-[${typeColor}]/50 transition-all duration-300 ${className}`}
      style={{
        clipPath: "polygon(0 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%)",
      }}
    >
      {/* Thumbnail */}
      <div className="relative aspect-video overflow-hidden">
        <Image
          removeWrapper
          alt={displayTitle}
          className="z-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          src={highlight.thumbnail_url || `/images/maps/${highlight.map_name || "dust2"}.jpg`}
        />
        
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent opacity-80" />

        {/* Type badge */}
        <div className="absolute top-3 left-3 z-10">
          <Chip
            size="sm"
            className="rounded-none font-bold uppercase text-xs"
            style={{
              backgroundColor: typeColor,
              color: "#0a0a0a",
            }}
            startContent={<Icon icon={typeIcon} width={14} />}
          >
            {highlight.type}
          </Chip>
        </div>

        {/* Duration/Time badge */}
        <div className="absolute top-3 right-3 z-10">
          <Chip size="sm" className="rounded-none bg-[#0a0a0a]/80 text-[#F5F0E1] backdrop-blur-sm text-xs">
            {formatEventTime(highlight.event_time)}
          </Chip>
        </div>

        {/* Play button */}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute inset-0 z-10 flex items-center justify-center bg-[#0a0a0a]/40"
            >
              <motion.div
                className="w-14 h-14 rounded-full flex items-center justify-center"
                style={{
                  background: `linear-gradient(135deg, ${typeColor}, ${typeColor}99)`,
                  boxShadow: `0 0 30px ${typeColor}60`,
                }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <Icon icon="solar:play-bold" width={28} className="text-[#0a0a0a] ml-0.5" />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Special badges */}
        {badges.length > 0 && (
          <div className="absolute bottom-3 left-3 z-10 flex gap-1">
            {badges.slice(0, 3).map((badge, i) => (
              <Tooltip key={i} content={badge.label}>
                <div
                  className="w-6 h-6 flex items-center justify-center backdrop-blur-sm"
                  style={{
                    backgroundColor: `${badge.color}30`,
                    border: `1px solid ${badge.color}50`,
                  }}
                >
                  <Icon icon={badge.icon} width={12} style={{ color: badge.color }} />
                </div>
              </Tooltip>
            ))}
          </div>
        )}
      </div>

      <CardBody className="p-4 bg-gradient-to-b from-[#0a0a0a] to-[#1a1a1a]">
        {/* Title */}
        <h4 className="font-bold text-lg text-[#F5F0E1] mb-2 line-clamp-1">{displayTitle}</h4>

        {/* Player info */}
        <div className="flex items-center gap-2 mb-3">
          <Avatar
            size="sm"
            src={highlight.primary_player?.avatar_url}
            name={highlight.primary_player?.display_name?.[0]}
            className={`ring-1 ring-[${typeColor}]/50`}
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm text-[#F5F0E1]/80 truncate">{highlight.primary_player?.display_name || "Unknown"}</p>
            <p className="text-xs text-[#F5F0E1]/40">{highlight.map_name || "Unknown Map"}</p>
          </div>
        </div>

        {/* Description if available */}
        {highlight.description && (
          <p className="text-xs text-[#F5F0E1]/60 line-clamp-2 mb-3">{highlight.description}</p>
        )}
      </CardBody>

      <CardFooter className="p-4 pt-0 bg-[#1a1a1a] flex justify-between items-center">
        {/* Stats */}
        <div className="flex items-center gap-3 text-xs text-[#F5F0E1]/50">
          {highlight.views_count !== undefined && (
            <span className="flex items-center gap-1">
              <Icon icon="solar:eye-linear" width={14} />
              {highlight.views_count.toLocaleString()}
            </span>
          )}
          {highlight.likes_count !== undefined && (
            <span className="flex items-center gap-1">
              <Icon icon="solar:heart-linear" width={14} />
              {highlight.likes_count.toLocaleString()}
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-1">
          <Button
            isIconOnly
            size="sm"
            variant="light"
            className={`rounded-none ${liked ? "text-[#FF4654]" : "text-[#F5F0E1]/50"}`}
            onPress={handleLike}
          >
            <Icon icon={liked ? "solar:heart-bold" : "solar:heart-linear"} width={18} />
          </Button>
          <Button
            isIconOnly
            size="sm"
            variant="light"
            className="rounded-none text-[#F5F0E1]/50"
            onPress={handleShare}
          >
            <Icon icon="solar:share-linear" width={18} />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}

export default HighlightCard;


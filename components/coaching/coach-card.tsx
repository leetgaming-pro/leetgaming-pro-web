/**
 * Coach Card Component
 * Premium coach profile card with quick actions and stats
 * Per PRD D.4.3 - Coaching Marketplace
 */

"use client";

import React from "react";
import {
  Card,
  CardBody,
  CardFooter,
  Button,
  Avatar,
  Chip,
  Tooltip,
  Divider,
} from "@nextui-org/react";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import type { Coach } from "@/types/coaching";
import {
  formatCoachPrice,
  getCoachStatusColor,
  isCoachOnline,
  SESSION_TYPE_LABELS,
} from "@/types/coaching";
import { GAME_CONFIGS } from "@/config/games";

interface CoachCardProps {
  coach: Coach;
  variant?: "default" | "compact" | "featured";
  onBook?: (coach: Coach) => void;
  onMessage?: (coach: Coach) => void;
}

export function CoachCard({
  coach,
  variant = "default",
  onBook,
  onMessage,
}: CoachCardProps) {
  const isOnline = isCoachOnline(coach.lastActive);
  const lowestPrice = Math.min(...coach.pricing.map((p) => p.priceUsd));
  const primaryGame = coach.expertise[0];
  const gameConfig = primaryGame ? GAME_CONFIGS[primaryGame.gameId] : null;

  // Featured variant - larger card with more details
  if (variant === "featured") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.2 }}
      >
        <Card className="w-full bg-gradient-to-br from-primary-50/50 to-secondary-50/50 dark:from-primary-900/20 dark:to-secondary-900/20 border-2 border-primary-200 dark:border-primary-800">
          {/* Banner */}
          {coach.banner && (
            <div className="relative h-32 overflow-hidden">
              <Image src={coach.banner} alt="" fill className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
            </div>
          )}

          <CardBody
            className={`gap-4 ${coach.banner ? "-mt-12 relative z-10" : ""}`}
          >
            {/* Header */}
            <div className="flex items-start gap-4">
              <div className="relative">
                <Avatar
                  src={coach.avatar}
                  name={coach.displayName}
                  className="w-20 h-20 ring-4 ring-background"
                  isBordered
                  color={isOnline ? "success" : "default"}
                />
                {coach.verified && (
                  <div className="absolute -bottom-1 -right-1 bg-primary rounded-full p-0.5">
                    <Icon
                      icon="solar:verified-check-bold"
                      className="w-5 h-5 text-white"
                    />
                  </div>
                )}
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-bold">{coach.displayName}</h3>
                  {coach.proVerified && (
                    <Chip size="sm" color="warning" variant="flat">
                      <Icon icon="solar:star-bold" className="w-3 h-3 mr-1" />
                      Pro
                    </Chip>
                  )}
                </div>
                <p className="text-default-600 line-clamp-2">{coach.tagline}</p>

                {/* Quick Stats */}
                <div className="flex items-center gap-4 mt-2">
                  <div className="flex items-center gap-1">
                    <Icon
                      icon="solar:star-bold"
                      className="w-4 h-4 text-warning-500"
                    />
                    <span className="font-semibold">
                      {coach.stats.avgRating.toFixed(1)}
                    </span>
                    <span className="text-default-500 text-sm">
                      ({coach.stats.totalReviews})
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-default-500 text-sm">
                    <Icon
                      icon="solar:users-group-rounded-bold"
                      className="w-4 h-4"
                    />
                    <span>{coach.stats.totalStudents} students</span>
                  </div>
                  <div className="flex items-center gap-1 text-default-500 text-sm">
                    <Icon icon="solar:clock-circle-bold" className="w-4 h-4" />
                    <span>{coach.stats.hoursCoached}h coached</span>
                  </div>
                </div>
              </div>

              <Chip
                size="sm"
                color={
                  getCoachStatusColor(coach.status) as
                    | "success"
                    | "warning"
                    | "primary"
                    | "default"
                }
                variant="dot"
              >
                {coach.status === "available" ? "Available" : coach.status}
              </Chip>
            </div>

            {/* Games & Expertise */}
            <div className="flex flex-wrap gap-2">
              {coach.expertise.map((exp) => {
                const game = GAME_CONFIGS[exp.gameId];
                return (
                  <Chip
                    key={exp.gameId}
                    variant="flat"
                    startContent={
                      <Icon icon="solar:gamepad-bold" className="w-4 h-4" />
                    }
                  >
                    {game?.name} • {exp.rankAchieved}
                  </Chip>
                );
              })}
            </div>

            {/* Session Types */}
            <div className="flex gap-2">
              {coach.pricing.map((price) => (
                <Tooltip
                  key={price.sessionType}
                  content={SESSION_TYPE_LABELS[price.sessionType].description}
                >
                  <Chip
                    size="sm"
                    variant="bordered"
                    startContent={
                      <Icon
                        icon={SESSION_TYPE_LABELS[price.sessionType].icon}
                        className="w-3 h-3"
                      />
                    }
                  >
                    {SESSION_TYPE_LABELS[price.sessionType].label}
                  </Chip>
                </Tooltip>
              ))}
            </div>

            <Divider />

            {/* Featured Review */}
            {coach.featuredReview && (
              <div className="bg-default-100 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Avatar
                    src={coach.featuredReview.studentAvatar}
                    name={coach.featuredReview.studentName}
                    size="sm"
                  />
                  <div>
                    <p className="text-sm font-medium">
                      {coach.featuredReview.studentName}
                    </p>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => {
                        const rating = coach.featuredReview?.rating ?? 0;
                        return (
                          <Icon
                            key={i}
                            icon={
                              i < rating
                                ? "solar:star-bold"
                                : "solar:star-linear"
                            }
                            className={`w-3 h-3 ${
                              i < rating
                                ? "text-warning-500"
                                : "text-default-300"
                            }`}
                          />
                        );
                      })}
                    </div>
                  </div>
                </div>
                <p className="text-sm text-default-600 line-clamp-2">
                  &ldquo;{coach.featuredReview.review}&rdquo;
                </p>
              </div>
            )}
          </CardBody>

          <CardFooter className="flex items-center justify-between pt-0">
            <div>
              <span className="text-2xl font-bold text-primary">
                {formatCoachPrice(lowestPrice)}
              </span>
              <span className="text-default-500 text-sm">/session</span>
            </div>
            <div className="flex gap-2">
              <Button
                variant="flat"
                startContent={<Icon icon="solar:chat-round-line-bold" />}
                onPress={() => onMessage?.(coach)}
              >
                Message
              </Button>
              <Button
                color="primary"
                startContent={<Icon icon="solar:calendar-add-bold" />}
                onPress={() => onBook?.(coach)}
              >
                Book Session
              </Button>
            </div>
          </CardFooter>
        </Card>
      </motion.div>
    );
  }

  // Compact variant
  if (variant === "compact") {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        whileHover={{ scale: 1.02 }}
      >
        <Card
          className="w-full"
          isPressable
          as={Link}
          href={`/coaching/${coach.id}`}
        >
          <CardBody className="flex flex-row items-center gap-3 p-3">
            <Avatar
              src={coach.avatar}
              name={coach.displayName}
              className="w-12 h-12"
              isBordered
              color={isOnline ? "success" : "default"}
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1">
                <h4 className="font-semibold truncate">{coach.displayName}</h4>
                {coach.verified && (
                  <Icon
                    icon="solar:verified-check-bold"
                    className="w-4 h-4 text-primary shrink-0"
                  />
                )}
              </div>
              <div className="flex items-center gap-2 text-sm text-default-500">
                <span className="flex items-center gap-1">
                  <Icon
                    icon="solar:star-bold"
                    className="w-3 h-3 text-warning-500"
                  />
                  {coach.stats.avgRating.toFixed(1)}
                </span>
                <span>•</span>
                <span>{coach.stats.totalSessions} sessions</span>
              </div>
            </div>
            <div className="text-right">
              <p className="font-bold text-primary">
                {formatCoachPrice(lowestPrice)}
              </p>
              <p className="text-xs text-default-500">from</p>
            </div>
          </CardBody>
        </Card>
      </motion.div>
    );
  }

  // Default variant
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="w-full max-w-sm">
        <CardBody className="gap-3 p-4">
          {/* Header */}
          <div className="flex items-start gap-3">
            <div className="relative">
              <Avatar
                src={coach.avatar}
                name={coach.displayName}
                className="w-16 h-16"
                isBordered
                color={isOnline ? "success" : "default"}
              />
              {coach.verified && (
                <div className="absolute -bottom-1 -right-1 bg-primary rounded-full p-0.5">
                  <Icon
                    icon="solar:verified-check-bold"
                    className="w-4 h-4 text-white"
                  />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1">
                <h3 className="font-bold truncate">{coach.displayName}</h3>
                {coach.proVerified && (
                  <Chip
                    size="sm"
                    color="warning"
                    variant="flat"
                    className="h-5"
                  >
                    Pro
                  </Chip>
                )}
              </div>
              <p className="text-sm text-default-600 line-clamp-2">
                {coach.tagline}
              </p>
            </div>
          </div>

          {/* Game Badge */}
          {gameConfig && (
            <Chip
              variant="flat"
              startContent={
                <Icon icon="solar:gamepad-bold" className="w-4 h-4" />
              }
              className="self-start"
            >
              {gameConfig.name} • {primaryGame?.rankAchieved}
            </Chip>
          )}

          {/* Stats Row */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-1">
              <Icon
                icon="solar:star-bold"
                className="w-4 h-4 text-warning-500"
              />
              <span className="font-semibold">
                {coach.stats.avgRating.toFixed(1)}
              </span>
              <span className="text-default-500">
                ({coach.stats.totalReviews})
              </span>
            </div>
            <div className="flex items-center gap-1 text-default-500">
              <Icon icon="solar:users-group-rounded-bold" className="w-4 h-4" />
              <span>{coach.stats.totalStudents}</span>
            </div>
            <div className="flex items-center gap-1 text-default-500">
              <Icon icon="solar:clock-circle-bold" className="w-4 h-4" />
              <span>{coach.stats.hoursCoached}h</span>
            </div>
          </div>

          {/* Languages */}
          <div className="flex items-center gap-2 text-sm text-default-500">
            <Icon icon="solar:global-bold" className="w-4 h-4" />
            <span>{coach.languages.join(", ")}</span>
          </div>

          <Divider />

          {/* Pricing & Actions */}
          <div className="flex items-center justify-between">
            <div>
              <span className="text-lg font-bold text-primary">
                {formatCoachPrice(lowestPrice)}
              </span>
              <span className="text-default-500 text-sm">/session</span>
            </div>
            <div className="flex gap-2">
              <Tooltip content="Message">
                <Button
                  isIconOnly
                  variant="flat"
                  size="sm"
                  onPress={() => onMessage?.(coach)}
                >
                  <Icon icon="solar:chat-round-line-bold" className="w-4 h-4" />
                </Button>
              </Tooltip>
              <Button color="primary" size="sm" onPress={() => onBook?.(coach)}>
                Book
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>
    </motion.div>
  );
}

// Grid display for multiple coaches
export function CoachGrid({
  coaches,
  onBook,
  onMessage,
  emptyMessage = "No coaches found",
}: {
  coaches: Coach[];
  onBook?: (coach: Coach) => void;
  onMessage?: (coach: Coach) => void;
  emptyMessage?: string;
}) {
  if (coaches.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Icon
          icon="solar:user-search-bold-duotone"
          className="w-16 h-16 text-default-300 mb-4"
        />
        <p className="text-default-500">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {coaches.map((coach) => (
        <CoachCard
          key={coach.id}
          coach={coach}
          onBook={onBook}
          onMessage={onMessage}
        />
      ))}
    </div>
  );
}

export default CoachCard;

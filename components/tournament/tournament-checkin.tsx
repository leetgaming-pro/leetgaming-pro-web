/**
 * Tournament Check-in Component
 * Real-time check-in system for tournament participants
 * Per PRD E.3 - Tournament System
 */

"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  CardFooter,
  Button,
  Avatar,
  AvatarGroup,
  Chip,
  Progress,
  Divider,
  Badge,
  Tooltip,
} from "@nextui-org/react";
import { Icon } from "@iconify/react";
import { motion, AnimatePresence } from "framer-motion";
import type {
  TournamentCheckInInfo,
  TournamentTeam,
  CheckInStatus,
  TeamCheckInStatus,
  CheckInResult,
} from "@/types/tournament";
import {
  getCheckInStatusLabel,
  getTeamCheckInStatusLabel,
  getTournamentStatusLabel,
  formatTimeRemaining,
  getCheckInProgress,
  CHECK_IN_WARNING_THRESHOLD,
  CHECK_IN_CRITICAL_THRESHOLD,
} from "@/types/tournament";
import { GAME_CONFIGS } from "@/config/games";

interface TournamentCheckInProps {
  tournament: TournamentCheckInInfo;
  onCheckIn: () => Promise<CheckInResult>;
  onCancelCheckIn?: () => Promise<void>;
  onSubstitute?: (playerId: string) => void;
  isTeamCaptain?: boolean;
}

export function TournamentCheckIn({
  tournament,
  onCheckIn,
  onCancelCheckIn,
  onSubstitute,
  isTeamCaptain = false,
}: TournamentCheckInProps) {
  const [timeRemaining, setTimeRemaining] = useState(
    tournament.checkInWindow.timeRemaining || 0
  );
  const [isChecking, setIsChecking] = useState(false);
  const [checkInResult, setCheckInResult] = useState<CheckInResult | null>(
    null
  );
  const [showSuccess, setShowSuccess] = useState(false);

  const gameConfig = GAME_CONFIGS[tournament.gameId];
  const isTeamMode = !!tournament.userTeam;
  const checkInWindow = tournament.checkInWindow;

  // Countdown timer
  useEffect(() => {
    if (!checkInWindow.isOpen || timeRemaining <= 0) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [checkInWindow.isOpen, timeRemaining]);

  // Urgency level based on time remaining
  const urgencyLevel = useMemo(() => {
    if (timeRemaining <= CHECK_IN_CRITICAL_THRESHOLD) return "critical";
    if (timeRemaining <= CHECK_IN_WARNING_THRESHOLD) return "warning";
    return "normal";
  }, [timeRemaining]);

  const handleCheckIn = useCallback(async () => {
    setIsChecking(true);
    try {
      const result = await onCheckIn();
      setCheckInResult(result);
      if (result.success) {
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      }
    } catch (error) {
      setCheckInResult({
        success: false,
        status: "pending",
        error: {
          code: "UNKNOWN_ERROR",
          message: "Failed to check in. Please try again.",
        },
      });
    } finally {
      setIsChecking(false);
    }
  }, [onCheckIn]);

  const userStatus = tournament.userParticipant?.checkInStatus || "pending";
  const isCheckedIn = userStatus === "checked-in";
  const canCheckIn = checkInWindow.isOpen && userStatus === "pending";

  return (
    <Card className="w-full max-w-lg">
      <CardHeader className="flex-col items-start gap-2 pb-0">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-3">
            {gameConfig && (
              <Avatar
                src={gameConfig.icon}
                alt={gameConfig.name}
                size="sm"
                radius="sm"
              />
            )}
            <div>
              <h3 className="text-lg font-bold">{tournament.name}</h3>
              <p className="text-sm text-default-500">
                {getTournamentStatusLabel(tournament.status)}
              </p>
            </div>
          </div>
          <Chip
            size="sm"
            color={
              tournament.tier === "premier"
                ? "warning"
                : tournament.tier === "professional"
                ? "secondary"
                : "default"
            }
            variant="flat"
            className="capitalize"
          >
            {tournament.tier}
          </Chip>
        </div>
      </CardHeader>

      <CardBody className="gap-4">
        {/* Check-in Timer */}
        <Card
          className={`border-2 ${
            urgencyLevel === "critical"
              ? "border-danger bg-danger/10 animate-pulse"
              : urgencyLevel === "warning"
              ? "border-warning bg-warning/10"
              : "border-primary/20 bg-primary/5"
          }`}
        >
          <CardBody className="p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium">
                {checkInWindow.isOpen
                  ? "Check-in Closes In"
                  : "Check-in Opens In"}
              </span>
              <Chip
                size="sm"
                color={
                  urgencyLevel === "critical"
                    ? "danger"
                    : urgencyLevel === "warning"
                    ? "warning"
                    : "primary"
                }
                variant="flat"
              >
                {checkInWindow.isOpen ? "OPEN" : "WAITING"}
              </Chip>
            </div>

            <div className="text-center">
              <motion.div
                key={timeRemaining}
                initial={{ scale: 1.1, opacity: 0.5 }}
                animate={{ scale: 1, opacity: 1 }}
                className={`text-4xl font-mono font-bold ${
                  urgencyLevel === "critical"
                    ? "text-danger"
                    : urgencyLevel === "warning"
                    ? "text-warning"
                    : "text-primary"
                }`}
              >
                {formatTimeRemaining(timeRemaining)}
              </motion.div>
            </div>

            {urgencyLevel === "critical" && canCheckIn && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center text-sm text-danger mt-2"
              >
                ⚠️ Hurry! Check-in closing soon!
              </motion.p>
            )}
          </CardBody>
        </Card>

        {/* Team Check-in Status (for team tournaments) */}
        {isTeamMode && tournament.userTeam && (
          <TeamCheckInCard
            team={tournament.userTeam}
            isTeamCaptain={isTeamCaptain}
            onSubstitute={onSubstitute}
          />
        )}

        {/* Individual Status */}
        {tournament.userParticipant && (
          <div className="flex items-center justify-between p-3 bg-default-50 rounded-lg">
            <div className="flex items-center gap-3">
              <Badge
                content=""
                color={isCheckedIn ? "success" : "default"}
                placement="bottom-right"
                size="sm"
              >
                <Avatar
                  src={tournament.userParticipant.playerAvatar}
                  name={tournament.userParticipant.playerName}
                  size="sm"
                />
              </Badge>
              <div>
                <p className="font-medium">
                  {tournament.userParticipant.playerName}
                </p>
                <p className="text-xs text-default-500">You</p>
              </div>
            </div>
            <CheckInStatusChip status={userStatus} />
          </div>
        )}

        {/* Success Animation */}
        <AnimatePresence>
          {showSuccess && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: -20 }}
              className="flex items-center justify-center gap-2 p-4 bg-success/20 rounded-lg"
            >
              <Icon
                icon="solar:check-circle-bold"
                className="w-6 h-6 text-success"
              />
              <span className="font-semibold text-success">
                Successfully Checked In!
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error Display */}
        {checkInResult?.error && (
          <div className="flex items-center gap-2 p-3 bg-danger/10 rounded-lg">
            <Icon
              icon="solar:danger-triangle-bold"
              className="w-5 h-5 text-danger"
            />
            <span className="text-sm text-danger">
              {checkInResult.error.message}
            </span>
          </div>
        )}

        {/* Next Match Info */}
        {tournament.nextMatch && (
          <div className="p-3 bg-default-50 rounded-lg">
            <p className="text-xs text-default-500 mb-2">Next Match</p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Icon
                  icon="solar:gamepad-bold"
                  className="w-4 h-4 text-primary"
                />
                <span className="text-sm">
                  Round {tournament.nextMatch.roundNumber}, Match{" "}
                  {tournament.nextMatch.matchNumber}
                </span>
              </div>
              {tournament.nextMatch.scheduledTime && (
                <span className="text-sm text-default-500">
                  {new Date(
                    tournament.nextMatch.scheduledTime
                  ).toLocaleTimeString()}
                </span>
              )}
            </div>
          </div>
        )}
      </CardBody>

      <CardFooter className="flex-col gap-2">
        {canCheckIn && (
          <Button
            color="primary"
            size="lg"
            fullWidth
            onPress={handleCheckIn}
            isLoading={isChecking}
            startContent={
              !isChecking && (
                <Icon icon="solar:check-circle-bold" className="w-5 h-5" />
              )
            }
            className="rounded-none"
          >
            {isChecking ? "Checking In..." : "Check In Now"}
          </Button>
        )}

        {isCheckedIn && onCancelCheckIn && (
          <Button
            variant="flat"
            color="danger"
            fullWidth
            onPress={onCancelCheckIn}
            startContent={
              <Icon icon="solar:close-circle-bold" className="w-4 h-4" />
            }
            className="rounded-none"
          >
            Cancel Check-In
          </Button>
        )}

        {!checkInWindow.isOpen && userStatus === "pending" && (
          <p className="text-sm text-default-500 text-center">
            Check-in will open {tournament.checkInWindow.durationMinutes}{" "}
            minutes before the tournament starts
          </p>
        )}

        {userStatus === "missed" && (
          <div className="text-center">
            <p className="text-sm text-danger mb-2">
              You missed the check-in window
            </p>
            <Button
              variant="flat"
              color="primary"
              size="sm"
              startContent={
                <Icon icon="solar:chat-line-bold" className="w-4 h-4" />
              }
            >
              Contact Support
            </Button>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}

// Team Check-in Card subcomponent
function TeamCheckInCard({
  team,
  isTeamCaptain,
  onSubstitute,
}: {
  team: TournamentTeam;
  isTeamCaptain: boolean;
  onSubstitute?: (playerId: string) => void;
}) {
  const progress = getCheckInProgress(team);
  const allPlayers = [team.captain, ...team.players];

  return (
    <Card className="bg-default-50">
      <CardBody className="gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Avatar src={team.logo} name={team.tag} size="sm" radius="sm" />
            <div>
              <p className="font-semibold">{team.name}</p>
              <p className="text-xs text-default-500">[{team.tag}]</p>
            </div>
          </div>
          <TeamCheckInStatusChip status={team.checkInStatus} />
        </div>

        {/* Progress bar */}
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-default-500">Team Check-in</span>
            <span className="font-medium">
              {team.checkedInCount}/{team.requiredCount}
            </span>
          </div>
          <Progress
            value={progress}
            color={
              progress === 100
                ? "success"
                : progress >= 50
                ? "warning"
                : "danger"
            }
            size="sm"
          />
        </div>

        {/* Player list */}
        <div className="space-y-2">
          {allPlayers.map((player) => (
            <div
              key={player.id}
              className="flex items-center justify-between p-2 bg-background rounded-lg"
            >
              <div className="flex items-center gap-2">
                <Badge
                  content=""
                  color={
                    player.checkInStatus === "checked-in"
                      ? "success"
                      : player.isOnline
                      ? "primary"
                      : "default"
                  }
                  placement="bottom-right"
                  size="sm"
                >
                  <Avatar
                    src={player.playerAvatar}
                    name={player.playerName}
                    size="sm"
                  />
                </Badge>
                <div>
                  <p className="text-sm font-medium">
                    {player.playerName}
                    {player.id === team.captain.id && (
                      <Chip
                        size="sm"
                        variant="flat"
                        className="ml-1 h-4 text-xs"
                      >
                        Captain
                      </Chip>
                    )}
                  </p>
                  <p className="text-xs text-default-500">
                    {player.isOnline ? "Online" : "Offline"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <CheckInStatusChip status={player.checkInStatus} size="sm" />
                {isTeamCaptain &&
                  player.checkInStatus === "pending" &&
                  !player.isOnline &&
                  team.substitutes.length > 0 && (
                    <Tooltip content="Substitute player">
                      <Button
                        isIconOnly
                        size="sm"
                        variant="light"
                        onPress={() => onSubstitute?.(player.id)}
                      >
                        <Icon icon="solar:user-plus-bold" className="w-4 h-4" />
                      </Button>
                    </Tooltip>
                  )}
              </div>
            </div>
          ))}
        </div>

        {/* Substitutes */}
        {team.substitutes.length > 0 && (
          <>
            <Divider />
            <div>
              <p className="text-xs text-default-500 mb-2">Substitutes</p>
              <AvatarGroup max={5} size="sm">
                {team.substitutes.map((sub) => (
                  <Tooltip key={sub.id} content={sub.playerName}>
                    <Avatar src={sub.playerAvatar} name={sub.playerName} />
                  </Tooltip>
                ))}
              </AvatarGroup>
            </div>
          </>
        )}
      </CardBody>
    </Card>
  );
}

// Status chip components
function CheckInStatusChip({
  status,
  size = "md",
}: {
  status: CheckInStatus;
  size?: "sm" | "md";
}) {
  const colorMap: Record<
    CheckInStatus,
    "success" | "warning" | "danger" | "default" | "secondary"
  > = {
    "checked-in": "success",
    pending: "warning",
    missed: "danger",
    substituted: "secondary",
    "not-started": "default",
  };

  const iconMap: Record<CheckInStatus, string> = {
    "checked-in": "solar:check-circle-bold",
    pending: "solar:clock-circle-bold",
    missed: "solar:close-circle-bold",
    substituted: "solar:user-plus-bold",
    "not-started": "solar:minus-circle-bold",
  };

  return (
    <Chip
      size={size === "sm" ? "sm" : "md"}
      color={colorMap[status]}
      variant="flat"
      startContent={
        <Icon
          icon={iconMap[status]}
          className={size === "sm" ? "w-3 h-3" : "w-4 h-4"}
        />
      }
    >
      {getCheckInStatusLabel(status)}
    </Chip>
  );
}

function TeamCheckInStatusChip({ status }: { status: TeamCheckInStatus }) {
  const colorMap: Record<
    TeamCheckInStatus,
    "success" | "warning" | "danger" | "default"
  > = {
    complete: "success",
    partial: "warning",
    incomplete: "danger",
    disqualified: "danger",
    "not-started": "default",
  };

  return (
    <Chip size="sm" color={colorMap[status]} variant="flat">
      {getTeamCheckInStatusLabel(status)}
    </Chip>
  );
}

export default TournamentCheckIn;

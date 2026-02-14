"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Progress,
  Chip,
  Avatar,
  AvatarGroup,
  Divider,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Checkbox,
  RadioGroup,
  Radio,
  Slider,
  Switch,
} from "@nextui-org/react";
import { Icon } from "@iconify/react";
import { useAuth } from "@/hooks";

import {
  GAME_CONFIGS,
  getGameMaps,
  getGameModes,
  getRankTier,
} from "@/config/games";
import type { GameId, QueuePreferences } from "@/types/games";
import { EsportsButton } from "@/components/ui/esports-button";
import { useMatchmaking } from "@/hooks/use-matchmaking";

export interface MatchmakingQueueProps {
  /** Selected game ID */
  gameId: GameId;
  /** Player's current rating for the game */
  playerRating: number;
  /** Player's display name */
  playerName: string;
  /** Player's avatar URL */
  playerAvatar?: string;
  /** Party members (if any) */
  partyMembers?: PartyMember[];
  /** Callback when queue starts */
  onQueueStart?: (preferences: QueuePreferences) => void;
  /** Callback when queue is cancelled */
  onQueueCancel?: () => void;
  /** Callback when match is found */
  onMatchFound?: (match: MatchFoundData) => void;
  /** Custom class name */
  className?: string;
}

interface PartyMember {
  id: string;
  name: string;
  avatar?: string;
  rating: number;
  isReady: boolean;
  isLeader: boolean;
}

interface MatchFoundData {
  matchId: string;
  gameId: GameId;
  mode: string;
  map: string;
  teams: {
    id: string;
    players: {
      id: string;
      name: string;
      avatar?: string;
      rating: number;
    }[];
  }[];
  estimatedDuration: number;
}

type QueueStatus =
  | "idle"
  | "queuing"
  | "match-found"
  | "ready-check"
  | "connecting";

/**
 * Premium matchmaking queue component with full game configuration support.
 * Features:
 * - Game mode selection
 * - Map preferences/veto
 * - Rank-based matching
 * - Party support
 * - Real-time queue status
 * - Animated transitions
 */
export function MatchmakingQueue({
  gameId,
  playerRating,
  playerName,
  playerAvatar,
  partyMembers = [],
  onQueueStart,
  onQueueCancel,
  onMatchFound: _onMatchFound,
  className = "",
}: MatchmakingQueueProps) {
  const game = GAME_CONFIGS[gameId];
  const { user } = useAuth();
  const {
    isOpen: isSettingsOpen,
    onOpen: onSettingsOpen,
    onClose: onSettingsClose,
  } = useDisclosure();

  // Real matchmaking hook integration
  const {
    session: matchmakingSession,
    poolStats,
    isSearching,
    isLoading: _isLoading,
    error: matchmakingError,
    elapsedTime,
    lobbyId,
    matchId,
    joinQueue,
    leaveQueue,
    fetchPoolStats,
    joinLobby: _joinLobby,
    acceptMatch,
    declineMatch,
    clearError,
    retryLastAction,
  } = useMatchmaking();

  // Local UI state for queue status mapping
  const [queueStatus, setQueueStatus] = useState<QueueStatus>("idle");
  const [queueTime, setQueueTime] = useState(0);

  // Map matchmaking state to local queue status
  useEffect(() => {
    if (isSearching) {
      setQueueStatus("queuing");
      setQueueTime(elapsedTime);
    } else if (matchmakingSession?.status === "matched" && lobbyId) {
      setQueueStatus("ready-check");
    } else if (matchmakingSession?.status === "ready" && matchId) {
      setQueueStatus("match-found");
    } else if (matchmakingSession?.status === "matched") {
      // Waiting for lobby assignment
      setQueueStatus("connecting");
    } else {
      setQueueStatus("idle");
    }
  }, [isSearching, matchmakingSession, elapsedTime, lobbyId, matchId]);

  // Fetch pool stats on mount and periodically
  useEffect(() => {
    fetchPoolStats(gameId as string);
    const interval = setInterval(() => {
      fetchPoolStats(gameId as string);
    }, 10000); // Every 10 seconds
    return () => clearInterval(interval);
  }, [gameId, fetchPoolStats]);

  // Derived values from real data
  const estimatedWait =
    matchmakingSession?.estimated_wait ||
    poolStats?.average_wait_time_seconds ||
    120;
  const playersInQueue = poolStats?.total_players || 0;

  // Preferences state
  const [selectedMode, setSelectedMode] = useState<string>(
    game?.matchmaking.modes.find((m) => m.ranked)?.id ||
      game?.matchmaking.modes[0]?.id ||
      ""
  );
  const [selectedMaps, setSelectedMaps] = useState<string[]>(
    game?.matchmaking.maps
      .filter((m) => m.active && m.competitive)
      .map((m) => m.id) || []
  );
  const [selectedRegions, setSelectedRegions] = useState<string[]>(["auto"]);
  const [maxPing, setMaxPing] = useState(100);
  const [acceptCrossPlatform, setAcceptCrossPlatform] = useState(true);

  // Advanced matchmaking state
  const [selectedSquadId, setSelectedSquadId] = useState<string | undefined>();
  const [selectedPlayerRole, setSelectedPlayerRole] = useState<
    string | undefined
  >();
  const [selectedTeamFormat, setSelectedTeamFormat] = useState<
    string | undefined
  >();

  // Ready check state
  const [readyCheckAccepted, setReadyCheckAccepted] = useState(false);
  const [readyCheckTimeout, setReadyCheckTimeout] = useState(30);

  // Match found state
  const [foundMatch, _setFoundMatch] = useState<MatchFoundData | null>(null);

  // Get current rank tier
  const rankTier = getRankTier(gameId, playerRating);

  // Handle queue cancellation with real SDK
  const handleCancelQueue = useCallback(async () => {
    const success = await leaveQueue();
    if (success) {
      setQueueStatus("idle");
      setQueueTime(0);
      onQueueCancel?.();
    }
  }, [leaveQueue, onQueueCancel]);

  // Ready check countdown - tracks time remaining for player to accept
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (queueStatus === "ready-check" && !readyCheckAccepted) {
      interval = setInterval(() => {
        setReadyCheckTimeout((t) => {
          if (t <= 1) {
            // Time expired - decline and leave queue
            handleCancelQueue();
            return 30;
          }
          return t - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [queueStatus, readyCheckAccepted, handleCancelQueue]);

  const handleStartQueue = useCallback(async () => {
    // Validate user is authenticated
    const userId = user?.id;
    if (!userId) {
      console.error("User must be authenticated to join queue");
      return;
    }

    const preferences: QueuePreferences = {
      gameId,
      modes: [selectedMode],
      maps: selectedMaps,
      regions: selectedRegions,
      acceptCrossPlatform,
      maxPingMs: maxPing,
      minRankDiff: -2,
      maxRankDiff: 2,
    };

    // Call the real SDK with enhanced parameters
    const result = await joinQueue({
      player_id: userId,
      squad_id: selectedSquadId, // New: squad support
      preferences: {
        game_id: gameId as string,
        game_mode: selectedMode,
        region: selectedRegions[0] || "auto",
        map_preferences: selectedMaps,
        skill_range: {
          min_mmr: playerRating - 200,
          max_mmr: playerRating + 200,
        },
        max_ping: maxPing,
        allow_cross_platform: acceptCrossPlatform,
        tier: "free",
        priority_boost: false,
        player_role: selectedPlayerRole, // New: role support
        team_format: selectedTeamFormat, // New: team format support
      },
      player_mmr: playerRating,
    });

    if (result) {
      setQueueTime(0);
      onQueueStart?.(preferences);
    }
  }, [
    user,
    gameId,
    selectedMode,
    selectedMaps,
    selectedRegions,
    acceptCrossPlatform,
    maxPing,
    playerRating,
    selectedSquadId,
    selectedPlayerRole,
    selectedTeamFormat,
    joinQueue,
    onQueueStart,
  ]);

  const handleAcceptMatch = useCallback(async () => {
    const userId = user?.id;
    if (!userId) {
      console.error("Cannot accept match: missing user ID");
      return;
    }

    setReadyCheckAccepted(true);

    try {
      // Use the new SDK acceptMatch function
      const success = await acceptMatch();
      if (success) {
        // Match accepted successfully - the hook will handle status updates
      } else {
        console.error("Failed to accept match");
        setReadyCheckAccepted(false);
      }
    } catch (error) {
      console.error("Error accepting match:", error);
      setReadyCheckAccepted(false);
    }
  }, [user, acceptMatch]);

  const handleDeclineMatch = useCallback(async () => {
    try {
      const success = await declineMatch();
      if (success) {
        setQueueStatus("idle");
        setQueueTime(0);
        setReadyCheckAccepted(false);
      } else {
        console.error("Failed to decline match");
      }
    } catch (error) {
      console.error("Error declining match:", error);
    }
  }, [declineMatch]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (!game) {
    return (
      <Card className={className}>
        <CardBody className="text-center py-12">
          <Icon
            icon="solar:gamepad-no-charge-bold"
            className="text-4xl text-default-300 mx-auto mb-2"
          />
          <p className="text-default-500">Game not found</p>
        </CardBody>
      </Card>
    );
  }

  const modes = getGameModes(gameId);
  const maps = getGameMaps(gameId, true);
  const currentMode = modes.find((m) => m.id === selectedMode);

  return (
    <div className={`matchmaking-queue ${className}`}>
      {/* Main queue card */}
      <Card className="overflow-hidden">
        {/* Header with game info */}
        <CardHeader
          className="p-4 flex-col items-start"
          style={{
            background: `linear-gradient(135deg, ${game.color.primary}20, ${game.color.secondary})`,
          }}
        >
          <div className="flex items-center gap-3 w-full">
            <div
              className="w-14 h-14 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: game.color.primary + "30" }}
            >
              <Icon
                icon={game.icon}
                className="text-3xl"
                style={{ color: game.color.primary }}
              />
            </div>
            <div className="flex-1">
              <h2 className="font-gaming font-bold text-xl">{game.name}</h2>
              <div className="flex items-center gap-2">
                {rankTier && (
                  <Chip
                    size="sm"
                    variant="flat"
                    style={{
                      backgroundColor: game.color.primary + "20",
                      color: game.color.primary,
                    }}
                  >
                    {rankTier.icon} {rankTier.name}
                  </Chip>
                )}
                <span className="text-sm text-default-500">
                  {playerRating} MMR
                </span>
              </div>
            </div>
            <Button
              isIconOnly
              variant="light"
              onPress={onSettingsOpen}
              aria-label="Queue settings"
            >
              <Icon icon="solar:settings-bold" className="text-xl" />
            </Button>
          </div>
        </CardHeader>

        <CardBody className="p-4 space-y-4">
          {/* Error display */}
          {matchmakingError && (
            <div className="bg-danger-50 border border-danger-200 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon
                    icon="solar:danger-triangle-bold"
                    className="text-danger-500"
                  />
                  <div>
                    <p className="text-sm font-semibold text-danger-700">
                      {matchmakingError === "NETWORK_ERROR"
                        ? "Connection Error"
                        : matchmakingError === "INVALID_PREFERENCES"
                        ? "Invalid Settings"
                        : matchmakingError === "RATE_LIMITED"
                        ? "Rate Limited"
                        : matchmakingError === "AUTHENTICATION_FAILED"
                        ? "Authentication Error"
                        : "Matchmaking Error"}
                    </p>
                    <p className="text-xs text-danger-600 mt-1">
                      {matchmakingError}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  {[
                    "NETWORK_ERROR",
                    "RATE_LIMITED",
                    "SESSION_EXPIRED",
                  ].includes(matchmakingError) && (
                    <Button
                      size="sm"
                      variant="light"
                      color="danger"
                      onPress={retryLastAction}
                      isLoading={isSearching}
                    >
                      Retry
                    </Button>
                  )}
                  <Button size="sm" variant="light" onPress={clearError}>
                    Dismiss
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Mode selector */}
          <div>
            <p className="text-sm font-semibold text-default-600 mb-2">
              Game Mode
            </p>
            <div className="flex flex-wrap gap-2">
              {modes.map((mode) => (
                <Button
                  key={mode.id}
                  size="sm"
                  variant={selectedMode === mode.id ? "solid" : "bordered"}
                  color={selectedMode === mode.id ? "primary" : "default"}
                  className="font-gaming"
                  onClick={() => setSelectedMode(mode.id)}
                  isDisabled={queueStatus !== "idle"}
                >
                  {mode.name}
                  {mode.ranked && (
                    <Icon
                      icon="solar:ranking-bold"
                      className="ml-1 text-amber-500"
                    />
                  )}
                </Button>
              ))}
            </div>
          </div>

          {/* Map pool */}
          {game.matchmaking.mapVetoEnabled && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-semibold text-default-600">
                  Map Pool
                </p>
                <span className="text-xs text-default-400">
                  {selectedMaps.length}/{maps.length} maps selected
                </span>
              </div>
              <div className="flex flex-wrap gap-1">
                {maps.map((map) => (
                  <Chip
                    key={map.id}
                    variant={
                      selectedMaps.includes(map.id) ? "solid" : "bordered"
                    }
                    color={
                      selectedMaps.includes(map.id) ? "primary" : "default"
                    }
                    className="cursor-pointer text-xs"
                    onClick={() => {
                      if (queueStatus !== "idle") return;
                      setSelectedMaps((prev) =>
                        prev.includes(map.id)
                          ? prev.filter((id) => id !== map.id)
                          : [...prev, map.id]
                      );
                    }}
                  >
                    {map.name}
                  </Chip>
                ))}
              </div>
            </div>
          )}

          <Divider />

          {/* Party members */}
          {partyMembers.length > 0 && (
            <div>
              <p className="text-sm font-semibold text-default-600 mb-2">
                Party ({partyMembers.length + 1}/{currentMode?.teamSize || 5})
              </p>
              <div className="flex items-center gap-2">
                <AvatarGroup max={5}>
                  <Avatar
                    src={playerAvatar}
                    name={playerName}
                    className="ring-2 ring-primary"
                  />
                  {partyMembers.map((member) => (
                    <Avatar
                      key={member.id}
                      src={member.avatar}
                      name={member.name}
                      className={
                        member.isReady
                          ? "ring-2 ring-success"
                          : "ring-2 ring-warning"
                      }
                    />
                  ))}
                </AvatarGroup>
                <Button
                  size="sm"
                  variant="bordered"
                  startContent={<Icon icon="solar:user-plus-bold" />}
                  isDisabled={queueStatus !== "idle"}
                >
                  Invite
                </Button>
              </div>
            </div>
          )}

          {/* Queue status display */}
          <AnimatePresence mode="wait">
            {queueStatus === "queuing" && (
              <motion.div
                key="queuing"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-3"
              >
                <div className="text-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="inline-block"
                  >
                    <Icon
                      icon="solar:loading-bold"
                      className="text-4xl text-primary"
                    />
                  </motion.div>
                  <p className="font-gaming text-2xl mt-2">
                    {formatTime(queueTime)}
                  </p>
                  <p className="text-sm text-default-500">
                    Estimated wait: ~{formatTime(estimatedWait)}
                  </p>
                </div>
                <div className="flex items-center justify-center gap-4 text-sm text-default-500">
                  <span>
                    <Icon
                      icon="solar:users-group-rounded-bold"
                      className="inline mr-1"
                    />
                    {playersInQueue} in queue
                  </span>
                  <span>
                    <Icon icon="solar:gamepad-bold" className="inline mr-1" />
                    {currentMode?.name}
                  </span>
                </div>
                <Progress
                  aria-label="Queue progress"
                  value={(queueTime / estimatedWait) * 100}
                  color="primary"
                  className="max-w-full"
                  isIndeterminate={queueTime > estimatedWait}
                />
              </motion.div>
            )}

            {queueStatus === "ready-check" && (
              <motion.div
                key="ready-check"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="text-center space-y-4 py-4"
              >
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 0.5, repeat: Infinity }}
                >
                  <Icon
                    icon="solar:check-circle-bold"
                    className="text-6xl text-success"
                  />
                </motion.div>
                <div>
                  <h3 className="font-gaming text-xl text-success">
                    MATCH FOUND!
                  </h3>
                  <p className="text-sm text-default-500">
                    Accept within {readyCheckTimeout} seconds
                  </p>
                </div>
                <Progress
                  aria-label="Ready check timeout"
                  value={(readyCheckTimeout / 30) * 100}
                  color={readyCheckTimeout > 10 ? "success" : "warning"}
                  className="max-w-full"
                />
                <div className="flex gap-3 justify-center">
                  <Button
                    color="success"
                    variant="solid"
                    size="lg"
                    className="font-gaming"
                    onClick={handleAcceptMatch}
                    isDisabled={readyCheckAccepted}
                    startContent={<Icon icon="solar:check-circle-bold" />}
                  >
                    {readyCheckAccepted ? "Accepted!" : "Accept"}
                  </Button>
                  <Button
                    color="danger"
                    variant="bordered"
                    size="lg"
                    className="font-gaming"
                    onClick={handleDeclineMatch}
                    isDisabled={readyCheckAccepted}
                  >
                    Decline
                  </Button>
                </div>
              </motion.div>
            )}

            {queueStatus === "match-found" && foundMatch && (
              <motion.div
                key="match-found"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="text-center space-y-4 py-4"
              >
                <Icon
                  icon="solar:gamepad-bold"
                  className="text-5xl text-primary mx-auto"
                />
                <div>
                  <h3 className="font-gaming text-xl">
                    Connecting to Match...
                  </h3>
                  <p className="text-sm text-default-500">
                    {game.matchmaking.maps.find((m) => m.id === foundMatch.map)
                      ?.name || foundMatch.map}
                  </p>
                </div>
                <Progress
                  aria-label="Connecting"
                  isIndeterminate
                  color="primary"
                  className="max-w-full"
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Queue action button */}
          {queueStatus === "idle" && (
            <EsportsButton
              variant="primary"
              size="lg"
              className="w-full"
              onClick={handleStartQueue}
              disabled={selectedMaps.length === 0}
            >
              <Icon icon="solar:play-bold" className="mr-2" />
              Find Match
            </EsportsButton>
          )}

          {queueStatus === "queuing" && (
            <Button
              color="danger"
              variant="bordered"
              size="lg"
              className="w-full font-gaming"
              onClick={handleCancelQueue}
            >
              <Icon icon="solar:close-circle-bold" className="mr-2" />
              Cancel Queue
            </Button>
          )}
        </CardBody>
      </Card>

      {/* Advanced Matchmaking Settings Modal */}
      <Modal
        isOpen={isSettingsOpen}
        onOpenChange={onSettingsClose}
        size="2xl"
        scrollBehavior="inside"
      >
        <ModalContent>
          <ModalHeader>
            <div className="flex items-center gap-2">
              <Icon icon="solar:settings-bold" className="text-xl" />
              Advanced Matchmaking Settings
            </div>
          </ModalHeader>
          <ModalBody className="space-y-6">
            {/* Squad Selection */}
            <div>
              <p className="text-sm font-semibold mb-3">Squad Matchmaking</p>
              <RadioGroup
                value={selectedSquadId || "solo"}
                onValueChange={(value) =>
                  setSelectedSquadId(value === "solo" ? undefined : value)
                }
                orientation="horizontal"
                className="gap-4"
              >
                <Radio value="solo">Solo Queue</Radio>
                <Radio value="squad1" isDisabled>
                  Squad Queue (Coming Soon)
                </Radio>
              </RadioGroup>
            </div>

            {/* Player Role Selection */}
            <div>
              <p className="text-sm font-semibold mb-3">Preferred Role</p>
              <RadioGroup
                value={selectedPlayerRole || "any"}
                onValueChange={(value) =>
                  setSelectedPlayerRole(value === "any" ? undefined : value)
                }
                orientation="horizontal"
                className="gap-4"
              >
                <Radio value="any">Any Role</Radio>
                <Radio value="tank">Tank</Radio>
                <Radio value="dps">DPS</Radio>
                <Radio value="support">Support</Radio>
              </RadioGroup>
            </div>

            {/* Team Format Selection */}
            <div>
              <p className="text-sm font-semibold mb-3">Team Format</p>
              <RadioGroup
                value={selectedTeamFormat || "standard"}
                onValueChange={(value) =>
                  setSelectedTeamFormat(
                    value === "standard" ? undefined : value
                  )
                }
                orientation="horizontal"
                className="gap-4"
              >
                <Radio value="standard">Standard (5v5)</Radio>
                <Radio value="ranked" isDisabled>
                  Ranked (Coming Soon)
                </Radio>
                <Radio value="casual" isDisabled>
                  Casual (Coming Soon)
                </Radio>
              </RadioGroup>
            </div>

            {/* Existing settings */}
            {/* Region selection */}
            <div>
              <p className="text-sm font-semibold mb-2">Region</p>
              <RadioGroup
                value={selectedRegions[0] || "auto"}
                onValueChange={(value) => setSelectedRegions([value])}
                orientation="horizontal"
                className="gap-4"
              >
                <Radio value="auto">Auto (Best ping)</Radio>
                <Radio value="na">North America</Radio>
                <Radio value="eu">Europe</Radio>
                <Radio value="sa">South America</Radio>
                <Radio value="asia">Asia Pacific</Radio>
              </RadioGroup>
            </div>

            {/* Max ping slider */}
            <div>
              <p className="text-sm font-semibold mb-2">
                Maximum Ping: {maxPing}ms
              </p>
              <Slider
                step={10}
                minValue={30}
                maxValue={200}
                value={maxPing}
                onChange={(value) => setMaxPing(value as number)}
                className="max-w-full"
                color="primary"
              />
            </div>

            {/* Cross-platform toggle */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold">Cross-Platform</p>
                <p className="text-xs text-default-500">
                  Match with players on other platforms
                </p>
              </div>
              <Switch
                isSelected={acceptCrossPlatform}
                onValueChange={setAcceptCrossPlatform}
                color="primary"
              />
            </div>

            {/* Map pool configuration */}
            <div>
              <p className="text-sm font-semibold mb-2">Map Pool</p>
              <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                {maps.map((map) => (
                  <Checkbox
                    key={map.id}
                    isSelected={selectedMaps.includes(map.id)}
                    onValueChange={(checked) => {
                      setSelectedMaps((prev) =>
                        checked
                          ? [...prev, map.id]
                          : prev.filter((id) => id !== map.id)
                      );
                    }}
                  >
                    {map.name}
                  </Checkbox>
                ))}
              </div>
              <div className="flex gap-2 mt-2">
                <Button
                  size="sm"
                  variant="flat"
                  onClick={() => setSelectedMaps(maps.map((m) => m.id))}
                >
                  Select All
                </Button>
                <Button
                  size="sm"
                  variant="flat"
                  onClick={() => setSelectedMaps([])}
                >
                  Clear All
                </Button>
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="bordered" onPress={onSettingsClose}>
              Cancel
            </Button>
            <Button color="primary" onPress={onSettingsClose}>
              Save Settings
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}

export default MatchmakingQueue;

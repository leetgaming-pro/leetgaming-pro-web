"use client";

import React, { useState, useEffect } from "react";
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

import { GAME_CONFIGS, getGameMaps, getGameModes, getRankTier } from "@/config/games";
import type { GameId, QueuePreferences } from "@/types/games";
import { EsportsButton } from "@/components/ui/esports-button";

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

type QueueStatus = "idle" | "queuing" | "match-found" | "ready-check" | "connecting";

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
  onMatchFound,
  className = "",
}: MatchmakingQueueProps) {
  const game = GAME_CONFIGS[gameId];
  const { isOpen: isSettingsOpen, onOpen: onSettingsOpen, onClose: onSettingsClose } = useDisclosure();
  
  // Queue state
  const [queueStatus, setQueueStatus] = useState<QueueStatus>("idle");
  const [queueTime, setQueueTime] = useState(0);
  const [estimatedWait] = useState(120); // seconds
  const [playersInQueue, setPlayersInQueue] = useState(0);
  
  // Preferences state
  const [selectedMode, setSelectedMode] = useState<string>(
    game?.matchmaking.modes.find((m) => m.ranked)?.id || game?.matchmaking.modes[0]?.id || ""
  );
  const [selectedMaps, setSelectedMaps] = useState<string[]>(
    game?.matchmaking.maps.filter((m) => m.active && m.competitive).map((m) => m.id) || []
  );
  const [selectedRegions, setSelectedRegions] = useState<string[]>(["auto"]);
  const [maxPing, setMaxPing] = useState(100);
  const [acceptCrossPlatform, setAcceptCrossPlatform] = useState(true);
  
  // Ready check state
  const [readyCheckAccepted, setReadyCheckAccepted] = useState(false);
  const [readyCheckTimeout, setReadyCheckTimeout] = useState(30);
  
  // Match found state
  const [foundMatch, setFoundMatch] = useState<MatchFoundData | null>(null);

  // Get current rank tier
  const rankTier = getRankTier(gameId, playerRating);

  // Queue timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (queueStatus === "queuing") {
      interval = setInterval(() => {
        setQueueTime((t) => t + 1);
        // Simulate players in queue changing
        setPlayersInQueue(Math.floor(Math.random() * 500) + 100);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [queueStatus]);

  const handleCancelQueue = () => {
    setQueueStatus("idle");
    setQueueTime(0);
    onQueueCancel?.();
  };

  // Simulate ready check countdown
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (queueStatus === "ready-check" && !readyCheckAccepted) {
      interval = setInterval(() => {
        setReadyCheckTimeout((t) => {
          if (t <= 1) {
            // Time expired, cancel queue
            setQueueStatus("idle");
            setQueueTime(0);
            onQueueCancel?.();
            return 30;
          }
          return t - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [queueStatus, readyCheckAccepted, onQueueCancel]);

  const handleStartQueue = () => {
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

    setQueueStatus("queuing");
    setQueueTime(0);
    onQueueStart?.(preferences);

    // Simulate match found after random time (demo)
    const waitTime = Math.random() * 30 + 10;
    setTimeout(() => {
      if (queueStatus === "queuing") {
        setQueueStatus("ready-check");
        setReadyCheckTimeout(30);
        setReadyCheckAccepted(false);
      }
    }, waitTime * 1000);
  };

  const handleAcceptMatch = () => {
    setReadyCheckAccepted(true);
    
    // Simulate all players accepting
    setTimeout(() => {
      const mockMatch: MatchFoundData = {
        matchId: `match-${Date.now()}`,
        gameId,
        mode: selectedMode,
        map: selectedMaps[Math.floor(Math.random() * selectedMaps.length)],
        teams: [
          {
            id: "team1",
            players: [
              { id: "p1", name: playerName, avatar: playerAvatar, rating: playerRating },
              { id: "p2", name: "Player2", rating: playerRating + 50 },
              { id: "p3", name: "Player3", rating: playerRating - 30 },
              { id: "p4", name: "Player4", rating: playerRating + 20 },
              { id: "p5", name: "Player5", rating: playerRating - 10 },
            ],
          },
          {
            id: "team2",
            players: [
              { id: "p6", name: "Enemy1", rating: playerRating + 10 },
              { id: "p7", name: "Enemy2", rating: playerRating - 20 },
              { id: "p8", name: "Enemy3", rating: playerRating + 40 },
              { id: "p9", name: "Enemy4", rating: playerRating - 40 },
              { id: "p10", name: "Enemy5", rating: playerRating },
            ],
          },
        ],
        estimatedDuration: 45,
      };
      
      setFoundMatch(mockMatch);
      setQueueStatus("match-found");
      onMatchFound?.(mockMatch);
    }, 2000);
  };

  const handleDeclineMatch = () => {
    setQueueStatus("idle");
    setQueueTime(0);
    setReadyCheckAccepted(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (!game) {
    return (
      <Card className={className}>
        <CardBody className="text-center py-12">
          <Icon icon="solar:gamepad-no-charge-bold" className="text-4xl text-default-300 mx-auto mb-2" />
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
                <span className="text-sm text-default-500">{playerRating} MMR</span>
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
          {/* Mode selector */}
          <div>
            <p className="text-sm font-semibold text-default-600 mb-2">Game Mode</p>
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
                    <Icon icon="solar:ranking-bold" className="ml-1 text-amber-500" />
                  )}
                </Button>
              ))}
            </div>
          </div>

          {/* Map pool */}
          {game.matchmaking.mapVetoEnabled && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-semibold text-default-600">Map Pool</p>
                <span className="text-xs text-default-400">
                  {selectedMaps.length}/{maps.length} maps selected
                </span>
              </div>
              <div className="flex flex-wrap gap-1">
                {maps.map((map) => (
                  <Chip
                    key={map.id}
                    variant={selectedMaps.includes(map.id) ? "solid" : "bordered"}
                    color={selectedMaps.includes(map.id) ? "primary" : "default"}
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
                      className={member.isReady ? "ring-2 ring-success" : "ring-2 ring-warning"}
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
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="inline-block"
                  >
                    <Icon icon="solar:loading-bold" className="text-4xl text-primary" />
                  </motion.div>
                  <p className="font-gaming text-2xl mt-2">{formatTime(queueTime)}</p>
                  <p className="text-sm text-default-500">
                    Estimated wait: ~{formatTime(estimatedWait)}
                  </p>
                </div>
                <div className="flex items-center justify-center gap-4 text-sm text-default-500">
                  <span>
                    <Icon icon="solar:users-group-rounded-bold" className="inline mr-1" />
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
                  <h3 className="font-gaming text-xl text-success">MATCH FOUND!</h3>
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
                  <h3 className="font-gaming text-xl">Connecting to Match...</h3>
                  <p className="text-sm text-default-500">
                    {game.matchmaking.maps.find((m) => m.id === foundMatch.map)?.name || foundMatch.map}
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

      {/* Settings modal */}
      <Modal isOpen={isSettingsOpen} onClose={onSettingsClose} size="lg">
        <ModalContent>
          <ModalHeader className="font-gaming">Queue Settings</ModalHeader>
          <ModalBody className="space-y-4">
            {/* Region selection */}
            <div>
              <p className="text-sm font-semibold mb-2">Region</p>
              <RadioGroup
                value={selectedRegions[0]}
                onValueChange={(value) => setSelectedRegions([value])}
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
              <p className="text-sm font-semibold mb-2">Maximum Ping: {maxPing}ms</p>
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

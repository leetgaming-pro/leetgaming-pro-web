/**
 * CreateLobbyModal - Modal for creating a new lobby
 * Award-winning esports branding with step-by-step flow
 */

"use client";

import React, { useState, useCallback } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Textarea,
  Select,
  SelectItem,
  Slider,
  Switch,
  Chip,
  Card,
  CardBody,
} from "@nextui-org/react";
import { Icon } from "@iconify/react";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import { Electrolize } from "next/font/google";
import { useTheme } from "next-themes";

import { GAME_CONFIGS } from "@/config/games";
import type { GameId } from "@/types/games";
import type { LobbyVisibility, LobbyType, CreateLobbyRequest } from "@/types/replay-api/lobby.types";
import { ReplayAPISDK } from "@/types/replay-api/sdk";
import { ReplayApiSettingsMock } from "@/types/replay-api/settings";
import { logger } from "@/lib/logger";
import { useToast } from "@/components/toast/toast-provider";
import { useAuth } from "@/hooks/use-auth";

const electrolize = Electrolize({
  weight: "400",
  subsets: ["latin"],
});

// Initialize SDK
const sdk = new ReplayAPISDK(ReplayApiSettingsMock, logger);
const lobbyAPI = sdk.lobbies;

// Available games for lobby creation
const SUPPORTED_GAMES: { id: GameId; name: string; icon: string }[] = [
  { id: "cs2", name: "Counter-Strike 2", icon: "simple-icons:counterstrike" },
  { id: "valorant", name: "Valorant", icon: "simple-icons:valorant" },
  { id: "lol", name: "League of Legends", icon: "simple-icons:leagueoflegends" },
  { id: "dota2", name: "Dota 2", icon: "simple-icons:dota2" },
  { id: "r6", name: "Rainbow Six Siege", icon: "simple-icons:ubisoft" },
  { id: "pubg", name: "PUBG", icon: "simple-icons:pubg" },
];

// Lobby type options
const LOBBY_TYPES: { id: LobbyType; name: string; description: string; icon: string }[] = [
  { id: "casual", name: "Casual", description: "Fun games, no pressure", icon: "solar:gamepad-bold" },
  { id: "ranked", name: "Ranked", description: "Competitive skill-based matching", icon: "solar:medal-star-bold" },
  { id: "custom", name: "Custom", description: "Your rules, your game", icon: "solar:settings-bold" },
  { id: "practice", name: "Practice", description: "Warm-up and training", icon: "solar:target-bold" },
  { id: "tournament", name: "Tournament", description: "Official competitive format", icon: "solar:cup-star-bold" },
];

// Visibility options
const VISIBILITY_OPTIONS: { id: LobbyVisibility; name: string; description: string; icon: string }[] = [
  { id: "public", name: "Public", description: "Anyone can join", icon: "solar:globe-bold" },
  { id: "friends", name: "Friends Only", description: "Only friends can join", icon: "solar:users-group-rounded-bold" },
  { id: "private", name: "Private", description: "Invite only", icon: "solar:lock-bold" },
];

// Region options
const REGIONS = [
  { id: "na", name: "North America" },
  { id: "eu", name: "Europe" },
  { id: "br", name: "Brazil" },
  { id: "sea", name: "Southeast Asia" },
  { id: "oce", name: "Oceania" },
  { id: "kr", name: "Korea" },
  { id: "jp", name: "Japan" },
];

interface CreateLobbyModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultGameId?: GameId;
}

type Step = "basics" | "settings" | "review";

export default function CreateLobbyModal({ isOpen, onClose, defaultGameId }: CreateLobbyModalProps) {
  const router = useRouter();
  const { theme } = useTheme();
  const { showToast } = useToast();
  const { isAuthenticated, user } = useAuth();

  // Form state
  const [step, setStep] = useState<Step>("basics");
  const [loading, setLoading] = useState(false);

  // Lobby data
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [gameId, setGameId] = useState<GameId | "">(defaultGameId || "");
  const [gameMode, setGameMode] = useState("");
  const [region, setRegion] = useState("");
  const [lobbyType, setLobbyType] = useState<LobbyType>("casual");
  const [visibility, setVisibility] = useState<LobbyVisibility>("public");
  const [maxPlayers, setMaxPlayers] = useState(10);
  const [minPlayers, setMinPlayers] = useState(2);
  const [enablePrizePool, setEnablePrizePool] = useState(false);
  const [prizeAmount, setPrizeAmount] = useState(100);

  // Game modes based on selected game
  const gameModes = gameId && GAME_CONFIGS[gameId]?.matchmaking?.modes || [];

  // Reset form when modal closes
  const handleClose = useCallback(() => {
    setStep("basics");
    setName("");
    setDescription("");
    setGameId(defaultGameId || "");
    setGameMode("");
    setRegion("");
    setLobbyType("casual");
    setVisibility("public");
    setMaxPlayers(10);
    setMinPlayers(2);
    setEnablePrizePool(false);
    setPrizeAmount(100);
    onClose();
  }, [onClose, defaultGameId]);

  // Create lobby
  const handleCreate = async () => {
    if (!isAuthenticated || !user?.id) {
      showToast("Please sign in to create a lobby", "error");
      return;
    }

    if (!gameId || !name.trim()) {
      showToast("Please fill in all required fields", "error");
      return;
    }

    setLoading(true);

    try {
      const request: CreateLobbyRequest = {
        name: name.trim(),
        description: description.trim() || undefined,
        game_id: gameId,
        game_mode: gameMode || undefined,
        region: region || undefined,
        type: lobbyType,
        visibility: visibility,
        max_players: maxPlayers,
        min_players: minPlayers,
        creator_id: user.id,
      };

      if (enablePrizePool && prizeAmount > 0) {
        request.entry_fee_cents = prizeAmount * 100;
        request.distribution_rule = "winner_takes_all";
      }

      const result = await lobbyAPI.createLobby(request);

      if (result?.lobby?.id) {
        showToast("Lobby created successfully!", "success");
        handleClose();
        router.push(`/match-making/lobby/${result.lobby.id}`);
      } else {
        throw new Error("Failed to create lobby");
      }
    } catch (err) {
      console.error("Failed to create lobby:", err);
      showToast("Failed to create lobby. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  // Step navigation
  const goToNext = () => {
    if (step === "basics") setStep("settings");
    else if (step === "settings") setStep("review");
  };

  const goToPrev = () => {
    if (step === "settings") setStep("basics");
    else if (step === "review") setStep("settings");
  };

  // Validation
  const canProceedFromBasics = name.trim().length > 0 && gameId;
  const canProceedFromSettings = true; // All settings have defaults
  const canCreate = canProceedFromBasics && canProceedFromSettings;

  // Step indicator
  const stepIndex = step === "basics" ? 0 : step === "settings" ? 1 : 2;

  return (
    <Modal
      classNames={{
        base: "bg-background border border-default-200/50",
        header: "border-b border-default-200/50",
        footer: "border-t border-default-200/50",
      }}
      isOpen={isOpen}
      radius="none"
      size="2xl"
      onClose={handleClose}
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <div className="leet-icon-box leet-icon-box-sm">
              <Icon icon="solar:add-circle-bold" width={18} />
            </div>
            <div>
              <h2 className={clsx("text-lg font-black uppercase tracking-wider", electrolize.className)}>
                Create Lobby
              </h2>
              <p className="text-xs text-default-500 font-normal normal-case tracking-normal">
                Set up your game and invite players
              </p>
            </div>
          </div>

          {/* Step indicator */}
          <div className="flex items-center gap-2 mt-4">
            {["Basics", "Settings", "Review"].map((label, i) => (
              <React.Fragment key={label}>
                <div className="flex items-center gap-2">
                  <div
                    className={clsx(
                      "w-6 h-6 flex items-center justify-center text-xs font-bold",
                      i <= stepIndex
                        ? theme === "dark"
                          ? "bg-[#DCFF37] text-[#34445C]"
                          : "bg-[#FF4654] text-white"
                        : "bg-default-200 text-default-500"
                    )}
                    style={{
                      clipPath: "polygon(0 0, 100% 0, 100% calc(100% - 4px), calc(100% - 4px) 100%, 0 100%)",
                    }}
                  >
                    {i + 1}
                  </div>
                  <span
                    className={clsx(
                      "text-xs font-medium",
                      i <= stepIndex ? "text-foreground" : "text-default-400"
                    )}
                  >
                    {label}
                  </span>
                </div>
                {i < 2 && (
                  <div
                    className={clsx(
                      "flex-1 h-0.5",
                      i < stepIndex
                        ? theme === "dark"
                          ? "bg-[#DCFF37]"
                          : "bg-[#FF4654]"
                        : "bg-default-200"
                    )}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </ModalHeader>

        <ModalBody className="py-6">
          {/* Step 1: Basics */}
          {step === "basics" && (
            <div className="space-y-6">
              {/* Lobby Name */}
              <Input
                isRequired
                classNames={{
                  inputWrapper: "border-default-200/50",
                }}
                label="Lobby Name"
                placeholder="e.g., Pro Scrims - EU West"
                radius="none"
                value={name}
                variant="bordered"
                onValueChange={setName}
              />

              {/* Description */}
              <Textarea
                classNames={{
                  inputWrapper: "border-default-200/50",
                }}
                label="Description (Optional)"
                placeholder="Tell players what to expect..."
                radius="none"
                value={description}
                variant="bordered"
                onValueChange={setDescription}
              />

              {/* Game Selection */}
              <div>
                <label className="text-sm font-medium text-foreground mb-3 block">
                  Select Game <span className="text-danger">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {SUPPORTED_GAMES.map((game) => (
                    <Card
                      key={game.id}
                      className={clsx(
                        "border cursor-pointer transition-all",
                        gameId === game.id
                          ? theme === "dark"
                            ? "border-[#DCFF37] bg-[#DCFF37]/10"
                            : "border-[#FF4654] bg-[#FF4654]/10"
                          : "border-default-200/50 hover:border-default-400"
                      )}
                      isPressable
                      radius="none"
                      onPress={() => {
                        setGameId(game.id);
                        setGameMode(""); // Reset mode when game changes
                      }}
                    >
                      <CardBody className="p-3 flex flex-row items-center gap-3">
                        <Icon
                          className={clsx(
                            gameId === game.id
                              ? theme === "dark"
                                ? "text-[#DCFF37]"
                                : "text-[#FF4654]"
                              : "text-default-400"
                          )}
                          icon={game.icon}
                          width={24}
                        />
                        <span className="text-sm font-medium">{game.name}</span>
                      </CardBody>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Game Mode */}
              {gameId && gameModes.length > 0 && (
                <Select
                  classNames={{
                    trigger: "border-default-200/50",
                  }}
                  label="Game Mode"
                  placeholder="Select a game mode"
                  radius="none"
                  selectedKeys={gameMode ? [gameMode] : []}
                  variant="bordered"
                  onSelectionChange={(keys) => {
                    const selected = Array.from(keys)[0] as string;
                    setGameMode(selected || "");
                  }}
                >
                  {gameModes.map((mode) => (
                    <SelectItem key={mode.id} value={mode.id}>
                      {mode.name}
                    </SelectItem>
                  ))}
                </Select>
              )}
            </div>
          )}

          {/* Step 2: Settings */}
          {step === "settings" && (
            <div className="space-y-6">
              {/* Lobby Type */}
              <div>
                <label className="text-sm font-medium text-foreground mb-3 block">
                  Lobby Type
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {LOBBY_TYPES.map((type) => (
                    <Card
                      key={type.id}
                      className={clsx(
                        "border cursor-pointer transition-all",
                        lobbyType === type.id
                          ? theme === "dark"
                            ? "border-[#DCFF37] bg-[#DCFF37]/10"
                            : "border-[#FF4654] bg-[#FF4654]/10"
                          : "border-default-200/50 hover:border-default-400"
                      )}
                      isPressable
                      radius="none"
                      onPress={() => setLobbyType(type.id)}
                    >
                      <CardBody className="p-3 flex flex-row items-center gap-3">
                        <Icon
                          className={clsx(
                            lobbyType === type.id
                              ? theme === "dark"
                                ? "text-[#DCFF37]"
                                : "text-[#FF4654]"
                              : "text-default-400"
                          )}
                          icon={type.icon}
                          width={20}
                        />
                        <div>
                          <span className="text-sm font-medium block">{type.name}</span>
                          <span className="text-xs text-default-400">{type.description}</span>
                        </div>
                      </CardBody>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Visibility */}
              <div>
                <label className="text-sm font-medium text-foreground mb-3 block">
                  Visibility
                </label>
                <div className="flex gap-3">
                  {VISIBILITY_OPTIONS.map((opt) => (
                    <Card
                      key={opt.id}
                      className={clsx(
                        "border cursor-pointer transition-all flex-1",
                        visibility === opt.id
                          ? theme === "dark"
                            ? "border-[#DCFF37] bg-[#DCFF37]/10"
                            : "border-[#FF4654] bg-[#FF4654]/10"
                          : "border-default-200/50 hover:border-default-400"
                      )}
                      isPressable
                      radius="none"
                      onPress={() => setVisibility(opt.id)}
                    >
                      <CardBody className="p-3 text-center">
                        <Icon
                          className={clsx(
                            "mx-auto mb-1",
                            visibility === opt.id
                              ? theme === "dark"
                                ? "text-[#DCFF37]"
                                : "text-[#FF4654]"
                              : "text-default-400"
                          )}
                          icon={opt.icon}
                          width={20}
                        />
                        <span className="text-xs font-medium block">{opt.name}</span>
                      </CardBody>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Region */}
              <Select
                classNames={{
                  trigger: "border-default-200/50",
                }}
                label="Region"
                placeholder="Select a region"
                radius="none"
                selectedKeys={region ? [region] : []}
                variant="bordered"
                onSelectionChange={(keys) => {
                  const selected = Array.from(keys)[0] as string;
                  setRegion(selected || "");
                }}
              >
                {REGIONS.map((r) => (
                  <SelectItem key={r.id} value={r.id}>
                    {r.name}
                  </SelectItem>
                ))}
              </Select>

              {/* Player Limits */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Min Players: {minPlayers}
                  </label>
                  <Slider
                    aria-label="Minimum players"
                    className="max-w-full"
                    maxValue={maxPlayers}
                    minValue={1}
                    size="sm"
                    step={1}
                    value={minPlayers}
                    onChange={(value) => setMinPlayers(value as number)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Max Players: {maxPlayers}
                  </label>
                  <Slider
                    aria-label="Maximum players"
                    className="max-w-full"
                    maxValue={20}
                    minValue={minPlayers}
                    size="sm"
                    step={1}
                    value={maxPlayers}
                    onChange={(value) => setMaxPlayers(value as number)}
                  />
                </div>
              </div>

              {/* Prize Pool Toggle */}
              <div className="border border-default-200/50 p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Icon className="text-warning" icon="solar:cup-star-bold" width={20} />
                    <span className="text-sm font-medium">Enable Prize Pool</span>
                  </div>
                  <Switch
                    isSelected={enablePrizePool}
                    size="sm"
                    onValueChange={setEnablePrizePool}
                  />
                </div>
                {enablePrizePool && (
                  <div className="mt-3">
                    <label className="text-sm text-default-500 mb-2 block">
                      Prize Amount (USD): ${prizeAmount}
                    </label>
                    <Slider
                      aria-label="Prize amount"
                      className="max-w-full"
                      maxValue={10000}
                      minValue={10}
                      size="sm"
                      step={10}
                      value={prizeAmount}
                      onChange={(value) => setPrizeAmount(value as number)}
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Review */}
          {step === "review" && (
            <div className="space-y-4">
              <Card className="border border-default-200/50" radius="none">
                <CardBody className="p-4 space-y-4">
                  {/* Name & Game */}
                  <div>
                    <h3 className={clsx("text-lg font-bold", electrolize.className)}>
                      {name}
                    </h3>
                    {description && (
                      <p className="text-sm text-default-500 mt-1">{description}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {/* Game */}
                    <div>
                      <span className="text-default-400 block text-xs uppercase mb-1">Game</span>
                      <div className="flex items-center gap-2">
                        {gameId && (
                          <>
                            <Icon
                              icon={SUPPORTED_GAMES.find(g => g.id === gameId)?.icon || "solar:gamepad-bold"}
                              width={16}
                            />
                            <span className="font-medium">
                              {SUPPORTED_GAMES.find(g => g.id === gameId)?.name}
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Mode */}
                    {gameMode && (
                      <div>
                        <span className="text-default-400 block text-xs uppercase mb-1">Mode</span>
                        <span className="font-medium">
                          {gameModes.find(m => m.id === gameMode)?.name || gameMode}
                        </span>
                      </div>
                    )}

                    {/* Type */}
                    <div>
                      <span className="text-default-400 block text-xs uppercase mb-1">Type</span>
                      <Chip
                        radius="none"
                        size="sm"
                        startContent={<Icon icon={LOBBY_TYPES.find(t => t.id === lobbyType)?.icon || ""} width={12} />}
                        variant="flat"
                      >
                        {LOBBY_TYPES.find(t => t.id === lobbyType)?.name}
                      </Chip>
                    </div>

                    {/* Visibility */}
                    <div>
                      <span className="text-default-400 block text-xs uppercase mb-1">Visibility</span>
                      <Chip
                        radius="none"
                        size="sm"
                        startContent={<Icon icon={VISIBILITY_OPTIONS.find(v => v.id === visibility)?.icon || ""} width={12} />}
                        variant="flat"
                      >
                        {VISIBILITY_OPTIONS.find(v => v.id === visibility)?.name}
                      </Chip>
                    </div>

                    {/* Region */}
                    {region && (
                      <div>
                        <span className="text-default-400 block text-xs uppercase mb-1">Region</span>
                        <span className="font-medium">
                          {REGIONS.find(r => r.id === region)?.name || region.toUpperCase()}
                        </span>
                      </div>
                    )}

                    {/* Players */}
                    <div>
                      <span className="text-default-400 block text-xs uppercase mb-1">Players</span>
                      <span className="font-medium">{minPlayers} - {maxPlayers}</span>
                    </div>
                  </div>

                  {/* Prize Pool */}
                  {enablePrizePool && (
                    <div className="border-t border-default-200/50 pt-4 mt-4">
                      <div className="flex items-center gap-2">
                        <Icon className="text-warning" icon="solar:cup-star-bold" width={20} />
                        <span className="font-bold text-warning">${prizeAmount} Prize Pool</span>
                      </div>
                    </div>
                  )}
                </CardBody>
              </Card>

              {!isAuthenticated && (
                <div className="p-4 bg-warning/10 border border-warning/30">
                  <div className="flex items-center gap-2 text-warning">
                    <Icon icon="solar:shield-warning-bold" width={20} />
                    <span className="text-sm font-medium">
                      You need to sign in to create a lobby
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </ModalBody>

        <ModalFooter>
          <Button radius="none" variant="flat" onPress={handleClose}>
            Cancel
          </Button>

          {step !== "basics" && (
            <Button radius="none" variant="flat" onPress={goToPrev}>
              Back
            </Button>
          )}

          {step === "review" ? (
            <Button
              className="font-semibold"
              color="primary"
              isDisabled={!canCreate || !isAuthenticated}
              isLoading={loading}
              radius="none"
              style={{
                backgroundColor: theme === "dark" ? "#DCFF37" : "#FF4654",
                color: theme === "dark" ? "#34445C" : "#FFFFFF",
                clipPath: "polygon(0 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%)",
              }}
              onPress={handleCreate}
            >
              Create Lobby
            </Button>
          ) : (
            <Button
              className="font-semibold"
              color="primary"
              isDisabled={step === "basics" && !canProceedFromBasics}
              radius="none"
              style={{
                backgroundColor: theme === "dark" ? "#DCFF37" : "#FF4654",
                color: theme === "dark" ? "#34445C" : "#FFFFFF",
                clipPath: "polygon(0 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%)",
              }}
              onPress={goToNext}
            >
              Continue
            </Button>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

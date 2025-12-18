/**
 * Replay Minimap Component
 * Interactive 2D map visualization for replay analysis
 * Per PRD D.3.3 - Replay Player Canvas
 */

"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import {
  Card,
  CardBody,
  Button,
  Slider,
  Chip,
  Tooltip,
  Switch,
} from "@nextui-org/react";
import { Icon } from "@iconify/react";
import { motion, AnimatePresence } from "framer-motion";
import type { GameId } from "@/types/games";

// Player position data structure
export interface PlayerPosition {
  playerId: string;
  playerName: string;
  team: "team1" | "team2";
  x: number; // 0-100 percentage
  y: number; // 0-100 percentage
  angle: number; // View angle in degrees
  isAlive: boolean;
  health: number;
  weapon?: string;
  isDefusing?: boolean;
  hasC4?: boolean;
}

// Map event types
export interface MapEvent {
  id: string;
  type:
    | "kill"
    | "death"
    | "plant"
    | "defuse"
    | "grenade"
    | "flash"
    | "smoke"
    | "molotov";
  tick: number;
  timestamp: number; // seconds into round
  x: number;
  y: number;
  attackerId?: string;
  victimId?: string;
  weapon?: string;
  isHeadshot?: boolean;
}

// Round state
export interface RoundState {
  roundNumber: number;
  phase: "freezetime" | "live" | "over";
  timeRemaining: number;
  team1Score: number;
  team2Score: number;
  bombPlanted: boolean;
  bombSite?: "A" | "B";
}

interface ReplayMinimapProps {
  gameId: GameId;
  mapName: string;
  players: PlayerPosition[];
  events: MapEvent[];
  roundState: RoundState;
  currentTick: number;
  maxTick: number;
  isPlaying: boolean;
  playbackSpeed: number;
  onSeek?: (tick: number) => void;
  onTogglePlay?: () => void;
  onSpeedChange?: (speed: number) => void;
  onPlayerClick?: (playerId: string) => void;
  focusedPlayer?: string | null;
}

// Map dimensions (CS2 radar images are typically 1024x1024)
const MAP_SIZE = 400;

// Get map image path
const getMapImagePath = (gameId: GameId, mapName: string): string => {
  // Map name normalization (e.g., de_inferno -> de_inferno)
  const normalizedName = mapName.toLowerCase().replace(/[^a-z0-9_]/g, "_");
  return `/${gameId === "cs2" ? "cs2" : gameId}/radar/${normalizedName}.webp`;
};

// Team colors
const TEAM_COLORS = {
  team1: {
    fill: "#4FC3F7", // CT Blue
    stroke: "#0288D1",
    text: "#E1F5FE",
  },
  team2: {
    fill: "#FFB74D", // T Orange
    stroke: "#F57C00",
    text: "#FFF3E0",
  },
};

// Event icons
const EVENT_ICONS: Record<MapEvent["type"], { icon: string; color: string }> = {
  kill: { icon: "solar:skull-bold", color: "#EF5350" },
  death: { icon: "solar:skull-bold", color: "#9E9E9E" },
  plant: { icon: "solar:bomb-bold", color: "#FF9800" },
  defuse: { icon: "solar:shield-check-bold", color: "#4CAF50" },
  grenade: { icon: "solar:bomb-minimalistic-bold", color: "#795548" },
  flash: { icon: "solar:flash-bold", color: "#FFEB3B" },
  smoke: { icon: "solar:cloud-bold", color: "#607D8B" },
  molotov: { icon: "solar:fire-bold", color: "#FF5722" },
};

export function ReplayMinimap({
  gameId,
  mapName,
  players,
  events,
  roundState,
  currentTick,
  maxTick,
  isPlaying,
  playbackSpeed,
  onSeek,
  onTogglePlay,
  onSpeedChange,
  onPlayerClick,
  focusedPlayer,
}: ReplayMinimapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [mapImage, setMapImage] = useState<HTMLImageElement | null>(null);
  const [showPlayerNames, setShowPlayerNames] = useState(true);
  const [showEvents, setShowEvents] = useState(true);
  const [showGrenades, setShowGrenades] = useState(true);
  const [hoveredPlayer, setHoveredPlayer] = useState<string | null>(null);

  // Load map image
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = getMapImagePath(gameId, mapName);
    img.onload = () => setMapImage(img);
    img.onerror = () => {
      // Fallback to placeholder
      const fallback = new Image();
      fallback.src = "/maps/placeholder.png";
      fallback.onload = () => setMapImage(fallback);
    };
  }, [gameId, mapName]);

  // Draw player on canvas
  const drawPlayer = useCallback(
    (ctx: CanvasRenderingContext2D, player: PlayerPosition, scale: number) => {
      const x = (player.x / 100) * MAP_SIZE * scale;
      const y = (player.y / 100) * MAP_SIZE * scale;
      const colors = TEAM_COLORS[player.team];
      const radius = player.isAlive ? 10 * scale : 6 * scale;
      const isHovered = hoveredPlayer === player.playerId;
      const isFocused = focusedPlayer === player.playerId;

      ctx.save();
      ctx.translate(x, y);

      // Glow effect for focused/hovered player
      if (isFocused || isHovered) {
        ctx.shadowColor = colors.fill;
        ctx.shadowBlur = 15;
      }

      // Player circle
      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, Math.PI * 2);
      ctx.fillStyle = player.isAlive ? colors.fill : "#666666";
      ctx.strokeStyle = isFocused ? "#FFFFFF" : colors.stroke;
      ctx.lineWidth = isFocused ? 3 : 2;
      ctx.fill();
      ctx.stroke();

      // View angle indicator (only for alive players)
      if (player.isAlive) {
        const angleRad = (player.angle - 90) * (Math.PI / 180);
        const viewLength = 20 * scale;
        const viewWidth = 15 * scale;

        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(
          Math.cos(angleRad - 0.3) * viewLength,
          Math.sin(angleRad - 0.3) * viewLength
        );
        ctx.lineTo(
          Math.cos(angleRad) * viewWidth,
          Math.sin(angleRad) * viewWidth
        );
        ctx.lineTo(
          Math.cos(angleRad + 0.3) * viewLength,
          Math.sin(angleRad + 0.3) * viewLength
        );
        ctx.closePath();
        ctx.fillStyle = colors.fill + "60";
        ctx.fill();
      }

      // C4 indicator
      if (player.hasC4) {
        ctx.beginPath();
        ctx.arc(radius + 4, -radius - 4, 5 * scale, 0, Math.PI * 2);
        ctx.fillStyle = "#FF5722";
        ctx.fill();
        ctx.strokeStyle = "#FFFFFF";
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // Defusing indicator
      if (player.isDefusing) {
        ctx.beginPath();
        ctx.arc(0, 0, radius + 5, 0, Math.PI * 2);
        ctx.strokeStyle = "#4CAF50";
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Player name
      if (showPlayerNames && player.isAlive) {
        ctx.font = `${10 * scale}px Inter, sans-serif`;
        ctx.textAlign = "center";
        ctx.fillStyle = "#FFFFFF";
        ctx.strokeStyle = "#000000";
        ctx.lineWidth = 2;
        ctx.strokeText(player.playerName, 0, -radius - 5);
        ctx.fillText(player.playerName, 0, -radius - 5);
      }

      // Health bar (only for alive players with less than full health)
      if (player.isAlive && player.health < 100) {
        const barWidth = 20 * scale;
        const barHeight = 3 * scale;
        ctx.fillStyle = "#333333";
        ctx.fillRect(-barWidth / 2, radius + 3, barWidth, barHeight);
        ctx.fillStyle =
          player.health > 50
            ? "#4CAF50"
            : player.health > 25
            ? "#FF9800"
            : "#F44336";
        ctx.fillRect(
          -barWidth / 2,
          radius + 3,
          (player.health / 100) * barWidth,
          barHeight
        );
      }

      ctx.restore();
    },
    [hoveredPlayer, focusedPlayer, showPlayerNames]
  );

  // Draw event on canvas
  const drawEvent = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      event: MapEvent,
      scale: number,
      opacity: number
    ) => {
      const x = (event.x / 100) * MAP_SIZE * scale;
      const y = (event.y / 100) * MAP_SIZE * scale;
      const config = EVENT_ICONS[event.type];

      ctx.save();
      ctx.globalAlpha = opacity;
      ctx.translate(x, y);

      // Event circle
      ctx.beginPath();
      ctx.arc(0, 0, 8 * scale, 0, Math.PI * 2);
      ctx.fillStyle = config.color + "80";
      ctx.strokeStyle = config.color;
      ctx.lineWidth = 2;
      ctx.fill();
      ctx.stroke();

      // Kill icon marker
      if (event.type === "kill" && event.isHeadshot) {
        ctx.beginPath();
        ctx.arc(0, -12 * scale, 5 * scale, 0, Math.PI * 2);
        ctx.fillStyle = "#FFD700";
        ctx.fill();
      }

      ctx.restore();
    },
    []
  );

  // Main draw function
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx || !mapImage) return;

    const scale = canvas.width / MAP_SIZE;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw map background
    ctx.drawImage(mapImage, 0, 0, canvas.width, canvas.height);

    // Draw events (behind players)
    if (showEvents) {
      const visibleEvents = events.filter((e) => {
        // Show events that happened recently
        const tickDiff = currentTick - e.tick;
        return tickDiff >= 0 && tickDiff < 500; // Show for ~500 ticks
      });

      visibleEvents.forEach((event) => {
        // Skip grenades if toggled off
        if (
          !showGrenades &&
          ["grenade", "flash", "smoke", "molotov"].includes(event.type)
        ) {
          return;
        }
        const tickDiff = currentTick - event.tick;
        const opacity = Math.max(0, 1 - tickDiff / 500);
        drawEvent(ctx, event, scale, opacity);
      });
    }

    // Draw players
    players.forEach((player) => {
      drawPlayer(ctx, player, scale);
    });

    // Draw bomb site labels
    if (roundState.bombPlanted && roundState.bombSite) {
      ctx.font = `bold ${16 * scale}px Inter, sans-serif`;
      ctx.textAlign = "center";
      ctx.fillStyle = "#FF5722";
      ctx.strokeStyle = "#000000";
      ctx.lineWidth = 3;
      const siteX = roundState.bombSite === "A" ? 0.3 : 0.7; // Approximate site positions
      const siteY = 0.3;
      ctx.strokeText(
        `💣 ${roundState.bombSite}`,
        siteX * canvas.width,
        siteY * canvas.height
      );
      ctx.fillText(
        `💣 ${roundState.bombSite}`,
        siteX * canvas.width,
        siteY * canvas.height
      );
    }
  }, [
    mapImage,
    players,
    events,
    currentTick,
    showEvents,
    showGrenades,
    drawPlayer,
    drawEvent,
    roundState,
  ]);

  // Redraw on state changes
  useEffect(() => {
    draw();
  }, [draw]);

  // Handle canvas click
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || !onPlayerClick) return;

    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    // Find clicked player
    const clickedPlayer = players.find((player) => {
      const dx = player.x - x;
      const dy = player.y - y;
      return Math.sqrt(dx * dx + dy * dy) < 3; // Click radius
    });

    if (clickedPlayer) {
      onPlayerClick(clickedPlayer.playerId);
    }
  };

  // Handle canvas hover
  const handleCanvasMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    const hovered = players.find((player) => {
      const dx = player.x - x;
      const dy = player.y - y;
      return Math.sqrt(dx * dx + dy * dy) < 3;
    });

    setHoveredPlayer(hovered?.playerId || null);
  };

  // Format time
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <Card className="w-full">
      <CardBody className="gap-4">
        {/* Round Info Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="text-center">
              <p className="text-xs text-default-500">Round</p>
              <p className="text-xl font-bold">{roundState.roundNumber}</p>
            </div>
            <div className="flex items-center gap-2">
              <Chip color="primary" variant="flat" size="sm">
                {roundState.team1Score}
              </Chip>
              <span className="text-default-500">vs</span>
              <Chip color="warning" variant="flat" size="sm">
                {roundState.team2Score}
              </Chip>
            </div>
            {roundState.bombPlanted && (
              <Chip
                color="danger"
                variant="flat"
                startContent={<Icon icon="solar:bomb-bold" />}
              >
                Bomb Planted - Site {roundState.bombSite}
              </Chip>
            )}
          </div>
          <div className="text-right">
            <p className="text-2xl font-mono font-bold">
              {formatTime(roundState.timeRemaining)}
            </p>
            <Chip
              size="sm"
              variant="flat"
              color={
                roundState.phase === "freezetime"
                  ? "default"
                  : roundState.phase === "live"
                  ? "success"
                  : "warning"
              }
            >
              {roundState.phase.toUpperCase()}
            </Chip>
          </div>
        </div>

        {/* Minimap Canvas */}
        <div
          ref={containerRef}
          className="relative aspect-square bg-default-100 rounded-lg overflow-hidden"
        >
          <canvas
            ref={canvasRef}
            width={MAP_SIZE}
            height={MAP_SIZE}
            className="w-full h-full cursor-crosshair"
            onClick={handleCanvasClick}
            onMouseMove={handleCanvasMove}
            onMouseLeave={() => setHoveredPlayer(null)}
          />

          {/* Map Label */}
          <div className="absolute top-2 left-2 bg-black/60 px-2 py-1 rounded text-xs text-white">
            {mapName}
          </div>

          {/* Legend */}
          <div className="absolute bottom-2 right-2 bg-black/60 px-2 py-1 rounded text-xs">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: TEAM_COLORS.team1.fill }}
                />
                CT
              </span>
              <span className="flex items-center gap-1">
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: TEAM_COLORS.team2.fill }}
                />
                T
              </span>
            </div>
          </div>

          {/* Hovered player tooltip */}
          <AnimatePresence>
            {hoveredPlayer && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="absolute top-2 right-2 bg-black/80 px-3 py-2 rounded-lg text-white text-sm"
              >
                {(() => {
                  const player = players.find(
                    (p) => p.playerId === hoveredPlayer
                  );
                  if (!player) return null;
                  return (
                    <div>
                      <p className="font-semibold">{player.playerName}</p>
                      <p className="text-xs text-default-400">
                        {player.isAlive ? `HP: ${player.health}` : "DEAD"}
                        {player.weapon && ` • ${player.weapon}`}
                      </p>
                    </div>
                  );
                })()}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Playback Controls */}
        <div className="space-y-3">
          {/* Timeline */}
          <div className="flex items-center gap-3">
            <span className="text-xs text-default-500 min-w-[40px]">
              {Math.floor(currentTick / 64)}s
            </span>
            <Slider
              size="sm"
              step={1}
              minValue={0}
              maxValue={maxTick}
              value={currentTick}
              onChange={(value) => onSeek?.(value as number)}
              className="flex-1"
              classNames={{
                track: "h-1",
                filler: "bg-gradient-to-r from-primary to-secondary",
              }}
            />
            <span className="text-xs text-default-500 min-w-[40px] text-right">
              {Math.floor(maxTick / 64)}s
            </span>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                isIconOnly
                size="sm"
                variant="flat"
                onPress={() => onSeek?.(Math.max(0, currentTick - 640))}
              >
                <Icon icon="solar:rewind-back-bold" />
              </Button>
              <Button
                isIconOnly
                size="md"
                color="primary"
                onPress={onTogglePlay}
              >
                <Icon
                  icon={isPlaying ? "solar:pause-bold" : "solar:play-bold"}
                  className="w-5 h-5"
                />
              </Button>
              <Button
                isIconOnly
                size="sm"
                variant="flat"
                onPress={() => onSeek?.(Math.min(maxTick, currentTick + 640))}
              >
                <Icon icon="solar:rewind-forward-bold" />
              </Button>
            </div>

            {/* Speed Control */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-default-500">Speed:</span>
              <div className="flex gap-1">
                {[0.25, 0.5, 1, 2, 4].map((speed) => (
                  <Button
                    key={speed}
                    size="sm"
                    variant={playbackSpeed === speed ? "solid" : "flat"}
                    color={playbackSpeed === speed ? "primary" : "default"}
                    onPress={() => onSpeedChange?.(speed)}
                    className="min-w-[40px]"
                  >
                    {speed}x
                  </Button>
                ))}
              </div>
            </div>

            {/* View Options */}
            <div className="flex items-center gap-4">
              <Tooltip content="Show player names">
                <Switch
                  size="sm"
                  isSelected={showPlayerNames}
                  onValueChange={setShowPlayerNames}
                />
              </Tooltip>
              <Tooltip content="Show events">
                <Switch
                  size="sm"
                  isSelected={showEvents}
                  onValueChange={setShowEvents}
                />
              </Tooltip>
              <Tooltip content="Show grenades">
                <Switch
                  size="sm"
                  isSelected={showGrenades}
                  onValueChange={setShowGrenades}
                />
              </Tooltip>
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}

export default ReplayMinimap;

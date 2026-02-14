"use client";

/**
 * Heatmap Visualization Component
 * Renders player position heatmaps on CS2 maps using canvas
 */

import React, { useEffect, useRef, useCallback, useState } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Chip,
  Switch,
  Slider,
  Button,
  ButtonGroup,
  Divider,
} from "@nextui-org/react";
import { Icon } from "@iconify/react";
import {
  HeatmapCell,
  HeatmapZone,
} from "@/types/replay-api/match-analytics.sdk";

// CS2 Map configurations with radar coordinates
const MAP_CONFIGS: Record<
  string,
  {
    name: string;
    radarUrl: string;
    pos_x: number;
    pos_y: number;
    scale: number;
  }
> = {
  de_mirage: {
    name: "Mirage",
    radarUrl: "/maps/cs2/de_mirage_radar.png",
    pos_x: -3230,
    pos_y: 1713,
    scale: 5,
  },
  de_inferno: {
    name: "Inferno",
    radarUrl: "/maps/cs2/de_inferno_radar.png",
    pos_x: -2087,
    pos_y: 3870,
    scale: 4.9,
  },
  de_dust2: {
    name: "Dust II",
    radarUrl: "/maps/cs2/de_dust2_radar.png",
    pos_x: -2476,
    pos_y: 3239,
    scale: 4.4,
  },
  de_nuke: {
    name: "Nuke",
    radarUrl: "/maps/cs2/de_nuke_radar.png",
    pos_x: -3453,
    pos_y: 2887,
    scale: 7,
  },
  de_ancient: {
    name: "Ancient",
    radarUrl: "/maps/cs2/de_ancient_radar.png",
    pos_x: -2953,
    pos_y: 2164,
    scale: 5,
  },
  de_anubis: {
    name: "Anubis",
    radarUrl: "/maps/cs2/de_anubis_radar.png",
    pos_x: -2796,
    pos_y: 3328,
    scale: 5.22,
  },
  de_vertigo: {
    name: "Vertigo",
    radarUrl: "/maps/cs2/de_vertigo_radar.png",
    pos_x: -3168,
    pos_y: 1762,
    scale: 4,
  },
};

interface HeatmapVisualizerProps {
  mapName: string;
  cells: HeatmapCell[];
  zones?: HeatmapZone[];
  gridSize?: number;
  title?: string;
  type?: "position" | "kills" | "deaths";
}

interface HeatmapCanvasProps {
  mapConfig: (typeof MAP_CONFIGS)[string];
  cells: HeatmapCell[];
  gridSize: number;
  opacity: number;
  colorScheme: "heat" | "cool" | "viridis";
  showGrid: boolean;
}

const HeatmapCanvas: React.FC<HeatmapCanvasProps> = ({
  mapConfig,
  cells,
  gridSize,
  opacity,
  colorScheme,
  showGrid,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayRef = useRef<HTMLCanvasElement>(null);
  const [mapImage, setMapImage] = useState<HTMLImageElement | null>(null);
  const [hoveredCell, setHoveredCell] = useState<HeatmapCell | null>(null);

  // Load map image
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => setMapImage(img);
    img.onerror = () => {
      // Fallback to a simple grid if map image fails
      setMapImage(null);
    };
    img.src = mapConfig.radarUrl;
  }, [mapConfig.radarUrl]);

  // Color schemes for heatmap
  const getHeatColor = useCallback(
    (value: number, scheme: string): string => {
      const normalized = Math.min(1, Math.max(0, value));

      if (scheme === "heat") {
        // Classic heat: blue -> cyan -> green -> yellow -> red
        if (normalized < 0.25) {
          const t = normalized / 0.25;
          return `rgba(0, ${Math.round(t * 255)}, 255, ${opacity})`;
        } else if (normalized < 0.5) {
          const t = (normalized - 0.25) / 0.25;
          return `rgba(0, 255, ${Math.round(255 * (1 - t))}, ${opacity})`;
        } else if (normalized < 0.75) {
          const t = (normalized - 0.5) / 0.25;
          return `rgba(${Math.round(t * 255)}, 255, 0, ${opacity})`;
        } else {
          const t = (normalized - 0.75) / 0.25;
          return `rgba(255, ${Math.round(255 * (1 - t))}, 0, ${opacity})`;
        }
      } else if (scheme === "cool") {
        // Cool: dark blue -> light blue -> white
        const r = Math.round(normalized * 200);
        const g = Math.round(100 + normalized * 155);
        const b = Math.round(180 + normalized * 75);
        return `rgba(${r}, ${g}, ${b}, ${opacity})`;
      } else {
        // Viridis-like: purple -> blue -> green -> yellow
        if (normalized < 0.33) {
          const t = normalized / 0.33;
          return `rgba(${Math.round(68 + t * 30)}, ${Math.round(
            1 + t * 84
          )}, ${Math.round(84 + t * 36)}, ${opacity})`;
        } else if (normalized < 0.66) {
          const t = (normalized - 0.33) / 0.33;
          return `rgba(${Math.round(98 - t * 65)}, ${Math.round(
            85 + t * 113
          )}, ${Math.round(120 - t * 55)}, ${opacity})`;
        } else {
          const t = (normalized - 0.66) / 0.34;
          return `rgba(${Math.round(33 + t * 220)}, ${Math.round(
            198 + t * 30
          )}, ${Math.round(65 + t * 40)}, ${opacity})`;
        }
      }
    },
    [opacity]
  );

  // Draw heatmap
  useEffect(() => {
    const canvas = canvasRef.current;
    const overlay = overlayRef.current;
    if (!canvas || !overlay) return;

    const ctx = canvas.getContext("2d");
    const overlayCtx = overlay.getContext("2d");
    if (!ctx || !overlayCtx) return;

    const size = 512;
    canvas.width = size;
    canvas.height = size;
    overlay.width = size;
    overlay.height = size;

    // Draw map background
    ctx.fillStyle = "#1a1a1a";
    ctx.fillRect(0, 0, size, size);

    if (mapImage) {
      ctx.drawImage(mapImage, 0, 0, size, size);
    } else {
      // Draw grid fallback
      ctx.strokeStyle = "#333";
      ctx.lineWidth = 1;
      const step = size / 20;
      for (let i = 0; i <= 20; i++) {
        ctx.beginPath();
        ctx.moveTo(i * step, 0);
        ctx.lineTo(i * step, size);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, i * step);
        ctx.lineTo(size, i * step);
        ctx.stroke();
      }
    }

    // Draw heatmap cells
    if (cells.length > 0) {
      const maxDensity = Math.max(...cells.map((c) => c.density));
      const cellSize = size / gridSize;

      cells.forEach((cell) => {
        const normalizedDensity = cell.density / maxDensity;
        if (normalizedDensity > 0.01) {
          // Only draw visible cells
          overlayCtx.fillStyle = getHeatColor(normalizedDensity, colorScheme);

          // Draw with radial gradient for smoother look
          const gradient = overlayCtx.createRadialGradient(
            cell.x * cellSize + cellSize / 2,
            cell.y * cellSize + cellSize / 2,
            0,
            cell.x * cellSize + cellSize / 2,
            cell.y * cellSize + cellSize / 2,
            cellSize * 1.5
          );
          gradient.addColorStop(
            0,
            getHeatColor(normalizedDensity, colorScheme)
          );
          gradient.addColorStop(1, "transparent");

          overlayCtx.beginPath();
          overlayCtx.arc(
            cell.x * cellSize + cellSize / 2,
            cell.y * cellSize + cellSize / 2,
            cellSize * 1.5,
            0,
            Math.PI * 2
          );
          overlayCtx.fillStyle = gradient;
          overlayCtx.fill();
        }
      });
    }

    // Draw grid overlay if enabled
    if (showGrid) {
      overlayCtx.strokeStyle = "rgba(255, 255, 255, 0.1)";
      overlayCtx.lineWidth = 0.5;
      const step = size / gridSize;
      for (let i = 0; i <= gridSize; i++) {
        overlayCtx.beginPath();
        overlayCtx.moveTo(i * step, 0);
        overlayCtx.lineTo(i * step, size);
        overlayCtx.stroke();
        overlayCtx.beginPath();
        overlayCtx.moveTo(0, i * step);
        overlayCtx.lineTo(size, i * step);
        overlayCtx.stroke();
      }
    }
  }, [mapImage, cells, gridSize, colorScheme, showGrid, getHeatColor]);

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || cells.length === 0) return;

    const rect = canvas.getBoundingClientRect();
    const x = Math.floor(((e.clientX - rect.left) / rect.width) * gridSize);
    const y = Math.floor(((e.clientY - rect.top) / rect.height) * gridSize);

    const cell = cells.find((c) => c.x === x && c.y === y);
    setHoveredCell(cell || null);
  };

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        className="w-full aspect-square rounded-none"
        style={{ background: "#1a1a1a" }}
      />
      <canvas
        ref={overlayRef}
        className="absolute top-0 left-0 w-full aspect-square rounded-none cursor-crosshair"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHoveredCell(null)}
      />
      {hoveredCell && (
        <div className="absolute top-2 right-2 bg-black/80 px-3 py-2 rounded text-sm">
          <p className="text-default-400">
            Grid: ({hoveredCell.x}, {hoveredCell.y})
          </p>
          <p className="text-white font-semibold">
            Density: {hoveredCell.density.toFixed(2)}
          </p>
          {hoveredCell.player_count && (
            <p className="text-default-300">
              Players: {hoveredCell.player_count}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export const HeatmapVisualizer: React.FC<HeatmapVisualizerProps> = ({
  mapName,
  cells,
  zones,
  gridSize = 64,
  title = "Position Heatmap",
  type = "position",
}) => {
  const [opacity, setOpacity] = useState(0.7);
  const [colorScheme, setColorScheme] = useState<"heat" | "cool" | "viridis">(
    "heat"
  );
  const [showGrid, setShowGrid] = useState(false);
  const [_selectedRound, _setSelectedRound] = useState<string>("all");

  const mapKey =
    mapName?.toLowerCase().replace(/[^a-z0-9_]/g, "_") || "de_mirage";
  const mapConfig = MAP_CONFIGS[mapKey] || MAP_CONFIGS.de_mirage;

  const typeConfig = {
    position: {
      icon: "solar:map-point-bold",
      color: "primary" as const,
      label: "Position Heatmap",
    },
    kills: {
      icon: "solar:target-bold",
      color: "danger" as const,
      label: "Kill Locations",
    },
    deaths: {
      icon: "solar:skull-bold",
      color: "warning" as const,
      label: "Death Locations",
    },
  };

  const config = typeConfig[type];

  return (
    <Card className="rounded-none border border-default-200 dark:border-default-100/10">
      <CardHeader className="flex flex-col gap-4">
        <div className="flex justify-between items-center w-full">
          <div className="flex items-center gap-3">
            <Icon
              icon={config.icon}
              width={24}
              className={`text-${config.color}`}
            />
            <div>
              <h3 className="font-bold text-lg">{title || config.label}</h3>
              <p className="text-xs text-default-500">{mapConfig.name}</p>
            </div>
          </div>
          <Chip size="sm" color={config.color} variant="flat">
            {cells.length} data points
          </Chip>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap gap-4 items-center w-full">
          <ButtonGroup size="sm" variant="flat">
            <Button
              color={colorScheme === "heat" ? "primary" : "default"}
              onClick={() => setColorScheme("heat")}
            >
              Heat
            </Button>
            <Button
              color={colorScheme === "cool" ? "primary" : "default"}
              onClick={() => setColorScheme("cool")}
            >
              Cool
            </Button>
            <Button
              color={colorScheme === "viridis" ? "primary" : "default"}
              onClick={() => setColorScheme("viridis")}
            >
              Viridis
            </Button>
          </ButtonGroup>

          <div className="flex items-center gap-2">
            <span className="text-xs text-default-500">Grid</span>
            <Switch
              size="sm"
              isSelected={showGrid}
              onValueChange={setShowGrid}
            />
          </div>

          <div className="flex items-center gap-2 flex-1 max-w-[200px]">
            <span className="text-xs text-default-500">Opacity</span>
            <Slider
              size="sm"
              step={0.1}
              minValue={0.1}
              maxValue={1}
              value={opacity}
              onChange={(val) => setOpacity(val as number)}
              className="flex-1"
            />
          </div>
        </div>
      </CardHeader>
      <Divider />
      <CardBody className="p-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Main Heatmap */}
          <div className="lg:col-span-2">
            <HeatmapCanvas
              mapConfig={mapConfig}
              cells={cells}
              gridSize={gridSize}
              opacity={opacity}
              colorScheme={colorScheme}
              showGrid={showGrid}
            />
          </div>

          {/* Zones Panel */}
          <div className="space-y-4">
            <h4 className="font-semibold text-sm text-default-500 uppercase">
              Zone Activity
            </h4>
            {zones && zones.length > 0 ? (
              <div className="space-y-2">
                {zones
                  .sort((a, b) => b.total_time - a.total_time)
                  .slice(0, 10)
                  .map((zone) => (
                    <div
                      key={zone.zone_code}
                      className="flex justify-between items-center p-2 bg-default-100 dark:bg-default-50/5 rounded"
                    >
                      <div>
                        <p className="font-medium text-sm">
                          {zone.zone_name || zone.zone_code}
                        </p>
                        <p className="text-xs text-default-500">
                          {zone.visit_count} visits
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">
                          {(zone.total_time / 1000).toFixed(1)}s
                        </p>
                        <p className="text-xs text-default-400">
                          avg {(zone.avg_duration / 1000).toFixed(1)}s
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-center py-8 text-default-400">
                <Icon
                  icon="solar:map-bold-duotone"
                  width={48}
                  className="mx-auto mb-2 opacity-50"
                />
                <p className="text-sm">No zone data available</p>
              </div>
            )}

            {/* Legend */}
            <div className="mt-4 pt-4 border-t border-default-200 dark:border-default-100/10">
              <h4 className="font-semibold text-sm text-default-500 uppercase mb-2">
                Density Legend
              </h4>
              <div className="flex items-center gap-2">
                <span className="text-xs text-default-400">Low</span>
                <div
                  className="flex-1 h-3 rounded"
                  style={{
                    background:
                      colorScheme === "heat"
                        ? "linear-gradient(to right, blue, cyan, green, yellow, red)"
                        : colorScheme === "cool"
                        ? "linear-gradient(to right, #0a2463, #3e92cc, #fffaff)"
                        : "linear-gradient(to right, #440154, #3b528b, #21918c, #5ec962, #fde725)",
                  }}
                />
                <span className="text-xs text-default-400">High</span>
              </div>
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  );
};

export default HeatmapVisualizer;

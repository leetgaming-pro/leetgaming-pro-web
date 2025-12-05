"use client";

import React, { useMemo, useState, useRef, useEffect } from 'react';
import { Card, CardBody, CardHeader, Chip, Switch, Select, SelectItem, Slider, Tooltip } from '@nextui-org/react';
import { Icon } from '@iconify/react';
import {
  MatchHeatmapResponse,
  RoundHeatmapResponse,
  HeatmapCell,
  HeatmapZone,
} from '@/types/replay-api/match-analytics.sdk';

/** CS2 Map configuration for coordinate transformation */
interface MapConfig {
  name: string;
  radarImageUrl: string;
  bounds: {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
  };
}

/** Default CS2 map configurations */
const CS2_MAPS: Record<string, MapConfig> = {
  de_dust2: {
    name: 'Dust 2',
    radarImageUrl: '/maps/cs2/de_dust2_radar.png',
    bounds: { minX: -2476, maxX: 2127, minY: -1262, maxY: 3239 },
  },
  de_mirage: {
    name: 'Mirage',
    radarImageUrl: '/maps/cs2/de_mirage_radar.png',
    bounds: { minX: -3230, maxX: 1713, minY: -3472, maxY: 1744 },
  },
  de_inferno: {
    name: 'Inferno',
    radarImageUrl: '/maps/cs2/de_inferno_radar.png',
    bounds: { minX: -2087, maxX: 2919, minY: -1049, maxY: 3870 },
  },
  de_nuke: {
    name: 'Nuke',
    radarImageUrl: '/maps/cs2/de_nuke_radar.png',
    bounds: { minX: -3453, maxX: 3277, minY: -4290, maxY: 2443 },
  },
  de_anubis: {
    name: 'Anubis',
    radarImageUrl: '/maps/cs2/de_anubis_radar.png',
    bounds: { minX: -2800, maxX: 2200, minY: -2100, maxY: 3200 },
  },
  de_ancient: {
    name: 'Ancient',
    radarImageUrl: '/maps/cs2/de_ancient_radar.png',
    bounds: { minX: -2953, maxX: 2164, minY: -2344, maxY: 2773 },
  },
  de_vertigo: {
    name: 'Vertigo',
    radarImageUrl: '/maps/cs2/de_vertigo_radar.png',
    bounds: { minX: -3168, maxX: 400, minY: -2432, maxY: 1536 },
  },
};

const DEFAULT_MAP_CONFIG: MapConfig = {
  name: 'Unknown',
  radarImageUrl: '/maps/cs2/default_radar.png',
  bounds: { minX: -4096, maxX: 4096, minY: -4096, maxY: 4096 },
};

/** Color palette for heatmap */
const HEATMAP_COLORS = [
  'rgba(0, 0, 255, 0)',      // Transparent blue (low)
  'rgba(0, 0, 255, 0.3)',    // Blue
  'rgba(0, 255, 255, 0.4)',  // Cyan
  'rgba(0, 255, 0, 0.5)',    // Green
  'rgba(255, 255, 0, 0.6)',  // Yellow
  'rgba(255, 165, 0, 0.7)',  // Orange
  'rgba(255, 0, 0, 0.85)',   // Red (high)
];

/** Get color for density value */
function getDensityColor(density: number, maxDensity: number): string {
  if (maxDensity === 0) return HEATMAP_COLORS[0];
  const normalizedDensity = density / maxDensity;
  const index = Math.min(
    Math.floor(normalizedDensity * (HEATMAP_COLORS.length - 1)),
    HEATMAP_COLORS.length - 1
  );
  return HEATMAP_COLORS[index];
}

interface HeatmapProps {
  heatmapData: MatchHeatmapResponse | RoundHeatmapResponse | null;
  mapName?: string;
  showZones?: boolean;
  showLegend?: boolean;
  opacity?: number;
  width?: number;
  height?: number;
}

/** Heatmap canvas renderer */
function HeatmapCanvas({
  cells,
  gridSize,
  mapConfig,
  maxDensity,
  opacity,
  width,
  height,
}: {
  cells: HeatmapCell[];
  gridSize: number;
  mapConfig: MapConfig;
  maxDensity: number;
  opacity: number;
  width: number;
  height: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Calculate cell size
    const { bounds } = mapConfig;
    const mapWidth = bounds.maxX - bounds.minX;
    const mapHeight = bounds.maxY - bounds.minY;
    const cellWidth = width / gridSize;
    const cellHeight = height / gridSize;

    // Draw heatmap cells
    cells.forEach(cell => {
      const color = getDensityColor(cell.density, maxDensity);

      // Convert game coordinates to canvas coordinates
      const canvasX = ((cell.x - bounds.minX) / mapWidth) * width;
      const canvasY = height - ((cell.y - bounds.minY) / mapHeight) * height; // Flip Y

      ctx.fillStyle = color;
      ctx.globalAlpha = opacity;

      // Draw with gaussian blur effect for smoother heatmap
      const radius = Math.max(cellWidth, cellHeight) * 1.5;
      const gradient = ctx.createRadialGradient(
        canvasX, canvasY, 0,
        canvasX, canvasY, radius
      );

      const baseColor = color.replace(/[\d.]+\)$/, '');
      gradient.addColorStop(0, `${baseColor}${opacity})`);
      gradient.addColorStop(1, `${baseColor}0)`);

      ctx.beginPath();
      ctx.arc(canvasX, canvasY, radius, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();
    });
  }, [cells, gridSize, mapConfig, maxDensity, opacity, width, height]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="absolute inset-0 pointer-events-none"
      style={{ mixBlendMode: 'screen' }}
    />
  );
}

/** Zone overlay component */
function ZoneOverlay({
  zones,
  width,
  height,
}: {
  zones: HeatmapZone[];
  width: number;
  height: number;
}) {
  // Sort zones by total time for display
  const sortedZones = useMemo(() => {
    return [...zones].sort((a, b) => b.total_time - a.total_time);
  }, [zones]);

  const maxTime = useMemo(() => {
    return Math.max(...zones.map(z => z.total_time), 1);
  }, [zones]);

  return (
    <div className="absolute bottom-2 right-2 bg-black/70 rounded-lg p-3 max-w-[200px]">
      <div className="text-xs text-white font-semibold mb-2">Zone Activity</div>
      <div className="space-y-1">
        {sortedZones.slice(0, 5).map(zone => (
          <div key={zone.zone_code} className="flex items-center gap-2">
            <div className="flex-1 text-xs text-white/80 truncate">
              {zone.zone_name || zone.zone_code}
            </div>
            <div className="w-16 h-2 bg-default-700 rounded overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-red-500"
                style={{ width: `${(zone.total_time / maxTime) * 100}%` }}
              />
            </div>
            <div className="text-xs text-white/60 w-8 text-right">
              {zone.visit_count}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Legend component */
function HeatmapLegend() {
  return (
    <div className="absolute bottom-2 left-2 bg-black/70 rounded-lg p-2">
      <div className="text-xs text-white font-semibold mb-1">Density</div>
      <div className="flex items-center gap-1">
        <span className="text-xs text-white/60">Low</span>
        <div className="flex h-3">
          {HEATMAP_COLORS.map((color, idx) => (
            <div
              key={idx}
              className="w-4 h-full"
              style={{ backgroundColor: color.replace(/[\d.]+\)$/, '1)') }}
            />
          ))}
        </div>
        <span className="text-xs text-white/60">High</span>
      </div>
    </div>
  );
}

/** Main MatchHeatmap component */
export default function MatchHeatmap({
  heatmapData,
  mapName = 'de_dust2',
  showZones: initialShowZones = true,
  showLegend: initialShowLegend = true,
  opacity: initialOpacity = 0.7,
  width = 600,
  height = 600,
}: HeatmapProps) {
  const [opacity, setOpacity] = useState(initialOpacity);
  const [showZones, setShowZones] = useState(initialShowZones);
  const [showLegend, setShowLegend] = useState(initialShowLegend);

  const mapConfig = CS2_MAPS[mapName.toLowerCase()] || DEFAULT_MAP_CONFIG;

  const maxDensity = useMemo(() => {
    if (!heatmapData) return 0;
    return Math.max(...heatmapData.cells.map(c => c.density), 1);
  }, [heatmapData]);

  if (!heatmapData) {
    return (
      <div
        className="flex items-center justify-center bg-default-100 rounded-lg"
        style={{ width, height }}
      >
        <div className="text-center">
          <Icon icon="mdi:fire" className="text-default-400 mx-auto mb-2" width={48} />
          <p className="text-default-500">No heatmap data available</p>
        </div>
      </div>
    );
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex items-center justify-between py-2 px-4 bg-default-100">
        <div className="flex items-center gap-3">
          <Icon icon="mdi:fire" className="text-danger" width={20} />
          <span className="font-semibold">Position Heatmap</span>
          <Chip size="sm" variant="flat">{mapConfig.name}</Chip>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs text-default-500">Opacity</span>
            <Slider
              size="sm"
              step={0.1}
              minValue={0.1}
              maxValue={1}
              value={opacity}
              onChange={(val) => setOpacity(val as number)}
              className="w-24"
            />
          </div>
          <Switch
            size="sm"
            isSelected={showZones}
            onValueChange={setShowZones}
          >
            Zones
          </Switch>
          <Switch
            size="sm"
            isSelected={showLegend}
            onValueChange={setShowLegend}
          >
            Legend
          </Switch>
        </div>
      </CardHeader>
      <CardBody className="p-0">
        <div
          className="relative"
          style={{ width, height }}
        >
          {/* Map background */}
          <img
            src={mapConfig.radarImageUrl}
            alt={mapConfig.name}
            className="absolute inset-0 w-full h-full object-cover"
            style={{ filter: 'brightness(0.7)' }}
          />

          {/* Heatmap overlay */}
          <HeatmapCanvas
            cells={heatmapData.cells}
            gridSize={heatmapData.grid_size}
            mapConfig={mapConfig}
            maxDensity={maxDensity}
            opacity={opacity}
            width={width}
            height={height}
          />

          {/* Zone activity overlay */}
          {showZones && heatmapData.zones && heatmapData.zones.length > 0 && (
            <ZoneOverlay
              zones={heatmapData.zones}
              width={width}
              height={height}
            />
          )}

          {/* Legend */}
          {showLegend && <HeatmapLegend />}

          {/* Stats overlay */}
          <div className="absolute top-2 left-2 bg-black/70 rounded-lg p-2">
            <div className="flex items-center gap-4 text-xs text-white">
              <div>
                <span className="text-white/60">Samples: </span>
                <span className="font-semibold">
                  {heatmapData.total_samples?.toLocaleString() || 'N/A'}
                </span>
              </div>
              <div>
                <span className="text-white/60">Grid: </span>
                <span className="font-semibold">
                  {heatmapData.grid_size}x{heatmapData.grid_size}
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}

/** Compact heatmap for embedding in other components */
export function CompactHeatmap({
  heatmapData,
  mapName = 'de_dust2',
  size = 200,
}: {
  heatmapData: MatchHeatmapResponse | RoundHeatmapResponse | null;
  mapName?: string;
  size?: number;
}) {
  const mapConfig = CS2_MAPS[mapName.toLowerCase()] || DEFAULT_MAP_CONFIG;

  const maxDensity = useMemo(() => {
    if (!heatmapData) return 0;
    return Math.max(...heatmapData.cells.map(c => c.density), 1);
  }, [heatmapData]);

  if (!heatmapData) {
    return (
      <div
        className="flex items-center justify-center bg-default-100 rounded"
        style={{ width: size, height: size }}
      >
        <Icon icon="mdi:fire" className="text-default-400" width={24} />
      </div>
    );
  }

  return (
    <Tooltip content={`${mapConfig.name} - ${heatmapData.total_samples || 0} samples`}>
      <div
        className="relative rounded overflow-hidden cursor-pointer hover:ring-2 ring-primary transition-all"
        style={{ width: size, height: size }}
      >
        <img
          src={mapConfig.radarImageUrl}
          alt={mapConfig.name}
          className="absolute inset-0 w-full h-full object-cover"
          style={{ filter: 'brightness(0.7)' }}
        />
        <HeatmapCanvas
          cells={heatmapData.cells}
          gridSize={heatmapData.grid_size}
          mapConfig={mapConfig}
          maxDensity={maxDensity}
          opacity={0.7}
          width={size}
          height={size}
        />
      </div>
    </Tooltip>
  );
}

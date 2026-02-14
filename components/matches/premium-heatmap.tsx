"use client";

/**
 * Premium Heatmap Component
 * Vector-based heatmap with position dots, kill lines, grenade visualization,
 * movement trails, and tactical insights
 */

import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Chip,
  Skeleton,
  Tooltip,
  Progress,
  Tabs,
  Tab,
  Switch,
  Divider,
} from "@nextui-org/react";
import { Icon } from "@iconify/react";
import clsx from "clsx";
import { electrolize } from "@/config/fonts";
import { 
  MatchHeatmapResponse, 
  HeatmapCell, 
  MatchKillEvent,
  MatchHEGrenadeEvent,
  MatchFlashGrenadeEvent,
  MatchSmokeEvent,
  MatchMolotovEvent,
  PlayerRoundRoute,
  TacticalInsight,
  Position3D
} from "@/types/replay-api/match-analytics.sdk";

interface PremiumHeatmapProps {
  heatmap: MatchHeatmapResponse | null;
  kills?: MatchKillEvent[];
  heGrenades?: MatchHEGrenadeEvent[];
  flashGrenades?: MatchFlashGrenadeEvent[];
  smokes?: MatchSmokeEvent[];
  molotovs?: MatchMolotovEvent[];
  playerRoutes?: PlayerRoundRoute[];
  insights?: TacticalInsight[];
  loading: boolean;
  matchId: string;
  gameId: string;
  mapName?: string;
}

// Layer configuration for grenade types
interface LayerConfig {
  id: string;
  label: string;
  icon: string;
  color: string;
  bgColor: string;
  enabled: boolean;
}

const DEFAULT_LAYERS: LayerConfig[] = [
  { id: "kills", label: "Kills", icon: "solar:target-bold", color: "#FF4654", bgColor: "rgba(255, 70, 84, 0.8)", enabled: true },
  { id: "he", label: "HE Grenades", icon: "solar:bomb-bold", color: "#FF6B35", bgColor: "rgba(255, 107, 53, 0.8)", enabled: true },
  { id: "flash", label: "Flashbangs", icon: "solar:sun-bold", color: "#FFFFFF", bgColor: "rgba(255, 255, 255, 0.9)", enabled: true },
  { id: "smoke", label: "Smokes", icon: "solar:cloud-bold", color: "#A0A0A0", bgColor: "rgba(160, 160, 160, 0.6)", enabled: true },
  { id: "molotov", label: "Molotovs", icon: "solar:fire-bold", color: "#FF9500", bgColor: "rgba(255, 149, 0, 0.8)", enabled: true },
  { id: "routes", label: "Routes", icon: "solar:route-bold", color: "#DCFF37", bgColor: "rgba(220, 255, 55, 0.5)", enabled: false },
];

// CS2 Map configurations with radar dimensions
// Radar images stored in /public/cs2/radar/
const MAP_CONFIG: Record<string, { 
  displayName: string; 
  radarUrl: string;
  scale: number;
  offsetX: number;
  offsetY: number;
  bounds: { minX: number; maxX: number; minY: number; maxY: number };
  callouts: { name: string; x: number; y: number }[];
}> = {
  de_inferno: {
    displayName: "Inferno",
    radarUrl: "/cs2/radar/de_inferno.webp",
    scale: 4.9,
    offsetX: -2087,
    offsetY: -1108,
    bounds: { minX: -2087, maxX: 3870, minY: -1108, maxY: 4870 },
    callouts: [
      { name: "A Site", x: 70, y: 25 },
      { name: "B Site", x: 20, y: 60 },
      { name: "Mid", x: 50, y: 50 },
      { name: "Banana", x: 25, y: 45 },
      { name: "Apartments", x: 65, y: 40 },
      { name: "CT Spawn", x: 60, y: 15 },
      { name: "T Spawn", x: 25, y: 80 },
    ],
  },
  de_dust2: {
    displayName: "Dust 2",
    radarUrl: "/cs2/radar/de_dust2.webp",
    scale: 4.4,
    offsetX: -2476,
    offsetY: -1021,
    bounds: { minX: -2476, maxX: 2235, minY: -1021, maxY: 3232 },
    callouts: [
      { name: "A Site", x: 75, y: 30 },
      { name: "B Site", x: 20, y: 25 },
      { name: "Long A", x: 80, y: 65 },
      { name: "Short A", x: 55, y: 45 },
      { name: "Mid", x: 50, y: 50 },
      { name: "B Tunnels", x: 25, y: 55 },
      { name: "CT Spawn", x: 55, y: 20 },
      { name: "T Spawn", x: 50, y: 85 },
    ],
  },
  de_mirage: {
    displayName: "Mirage",
    radarUrl: "/cs2/radar/de_mirage.webp",
    scale: 5.0,
    offsetX: -3230,
    offsetY: -3407,
    bounds: { minX: -3230, maxX: 1713, minY: -3407, maxY: 1557 },
    callouts: [
      { name: "A Site", x: 75, y: 35 },
      { name: "B Site", x: 20, y: 30 },
      { name: "Mid", x: 55, y: 50 },
      { name: "Palace", x: 85, y: 45 },
      { name: "Connector", x: 50, y: 40 },
      { name: "B Apps", x: 25, y: 55 },
      { name: "CT Spawn", x: 55, y: 20 },
      { name: "T Spawn", x: 45, y: 85 },
    ],
  },
  de_nuke: {
    displayName: "Nuke",
    radarUrl: "/cs2/radar/de_nuke.webp",
    scale: 7.0,
    offsetX: -3453,
    offsetY: -2887,
    bounds: { minX: -3453, maxX: 3500, minY: -2887, maxY: 7000 },
    callouts: [
      { name: "A Site", x: 55, y: 35 },
      { name: "B Site", x: 55, y: 55 },
      { name: "Outside", x: 30, y: 50 },
      { name: "Ramp", x: 55, y: 45 },
      { name: "CT Spawn", x: 75, y: 30 },
      { name: "T Spawn", x: 55, y: 85 },
    ],
  },
  de_overpass: {
    displayName: "Overpass",
    radarUrl: "/cs2/radar/de_overpass.webp",
    scale: 5.2,
    offsetX: -4831,
    offsetY: -3231,
    bounds: { minX: -4831, maxX: 500, minY: -3231, maxY: 1781 },
    callouts: [
      { name: "A Site", x: 75, y: 30 },
      { name: "B Site", x: 25, y: 65 },
      { name: "Connector", x: 55, y: 45 },
      { name: "CT Spawn", x: 80, y: 20 },
      { name: "T Spawn", x: 30, y: 80 },
    ],
  },
  de_ancient: {
    displayName: "Ancient",
    radarUrl: "/cs2/radar/de_ancient.webp",
    scale: 5.0,
    offsetX: -2953,
    offsetY: -2493,
    bounds: { minX: -2953, maxX: 2200, minY: -2493, maxY: 2660 },
    callouts: [
      { name: "A Site", x: 80, y: 30 },
      { name: "B Site", x: 25, y: 35 },
      { name: "Mid", x: 55, y: 50 },
      { name: "CT Spawn", x: 55, y: 15 },
      { name: "T Spawn", x: 50, y: 85 },
    ],
  },
  de_anubis: {
    displayName: "Anubis",
    radarUrl: "/cs2/radar/de_anubis.webp",
    scale: 5.22,
    offsetX: -2796,
    offsetY: -3328,
    bounds: { minX: -2796, maxX: 2435, minY: -3328, maxY: 1825 },
    callouts: [
      { name: "A Site", x: 75, y: 35 },
      { name: "B Site", x: 25, y: 40 },
      { name: "Mid", x: 50, y: 50 },
      { name: "CT Spawn", x: 55, y: 20 },
      { name: "T Spawn", x: 50, y: 85 },
    ],
  },
  de_vertigo: {
    displayName: "Vertigo",
    radarUrl: "/cs2/radar/de_vertigo.webp",
    scale: 4.0,
    offsetX: -3168,
    offsetY: -2464,
    bounds: { minX: -3168, maxX: 768, minY: -2464, maxY: 1536 },
    callouts: [
      { name: "A Site", x: 40, y: 30 },
      { name: "B Site", x: 65, y: 55 },
      { name: "Mid", x: 50, y: 45 },
      { name: "CT Spawn", x: 30, y: 20 },
      { name: "T Spawn", x: 70, y: 80 },
    ],
  },
};

// Heat color interpolation
const getHeatColor = (intensity: number): string => {
  // Blue (cold) -> Cyan -> Green -> Yellow -> Orange -> Red (hot)
  if (intensity < 0.2) return `rgba(0, 168, 255, ${intensity * 3})`; // Blue
  if (intensity < 0.4) return `rgba(0, 255, 200, ${intensity * 2})`; // Cyan
  if (intensity < 0.6) return `rgba(0, 255, 100, ${intensity * 1.5})`; // Green
  if (intensity < 0.8) return `rgba(255, 200, 0, ${intensity * 1.2})`; // Yellow/Orange
  return `rgba(255, 70, 84, ${Math.min(1, intensity)})`; // Red
};

// Generate gradient stop for legend
const HEAT_GRADIENT = "linear-gradient(90deg, rgba(0, 168, 255, 0.3), rgba(0, 255, 200, 0.5), rgba(0, 255, 100, 0.6), rgba(255, 200, 0, 0.75), rgba(255, 70, 84, 0.9))";

export function PremiumHeatmap({
  heatmap,
  kills,
  heGrenades,
  flashGrenades,
  smokes,
  molotovs,
  playerRoutes: _playerRoutes,
  insights,
  loading,
  matchId: _matchId,
  gameId: _gameId,
  mapName,
}: PremiumHeatmapProps) {
  const [showKillLines, setShowKillLines] = useState(true);
  const [showZones, _setShowZones] = useState(true);
  const [showCallouts, setShowCallouts] = useState(true);
  const [showRadar, setShowRadar] = useState(true);
  const [heatOpacity, setHeatOpacity] = useState(70);
  const [viewMode, setViewMode] = useState<"heatmap" | "kills" | "tactical" | "zones">("heatmap");
  const [hoveredCell, setHoveredCell] = useState<HeatmapCell | null>(null);
  const [radarLoaded, setRadarLoaded] = useState(false);
  const [radarError, setRadarError] = useState(false);
  const [layers, setLayers] = useState<LayerConfig[]>(DEFAULT_LAYERS);
  const [selectedRound, setSelectedRound] = useState<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const mapConfig = mapName ? MAP_CONFIG[mapName.toLowerCase()] : null;

  // Toggle layer visibility
  const toggleLayer = (layerId: string) => {
    setLayers(prev => prev.map(layer => 
      layer.id === layerId ? { ...layer, enabled: !layer.enabled } : layer
    ));
  };

  const isLayerEnabled = (layerId: string) => layers.find(l => l.id === layerId)?.enabled ?? false;

  // Check if radar image exists
  useEffect(() => {
    if (mapConfig?.radarUrl) {
      const img = new Image();
      img.onload = () => setRadarLoaded(true);
      img.onerror = () => setRadarError(true);
      img.src = mapConfig.radarUrl;
    }
  }, [mapConfig?.radarUrl]);

  // Normalize and process heatmap data
  const processedCells = useMemo(() => {
    if (!heatmap?.cells?.length) return [];
    const maxDensity = Math.max(...heatmap.cells.map(c => c.density), 1);
    return heatmap.cells.map(cell => ({
      ...cell,
      normalizedDensity: cell.density / maxDensity,
    }));
  }, [heatmap]);

  // Calculate kill positions (mock if no position data)
  const killPositions = useMemo(() => {
    if (!kills?.length) return [];
    // Generate mock positions based on round and weapon if no real positions
    return kills.map((kill, idx) => ({
      ...kill,
      // Mock positions - in real implementation these would come from API
      killerX: 30 + Math.sin(idx * 0.7) * 20 + (kill.round_number || 0) * 2,
      killerY: 30 + Math.cos(idx * 0.5) * 20 + (kill.round_number || 0) * 1.5,
      victimX: 50 + Math.sin(idx * 0.9) * 25 + (kill.round_number || 0) * 1.8,
      victimY: 50 + Math.cos(idx * 0.6) * 25 + (kill.round_number || 0) * 2.2,
    }));
  }, [kills]);

  // Convert game coordinates to map percentage (0-100)
  const gameToMapPercent = (pos: Position3D): { x: number; y: number } => {
    if (!mapConfig) {
      // Fallback: normalize assuming typical CS2 map bounds
      return {
        x: ((pos.x + 3000) / 6000) * 100,
        y: ((pos.y + 3000) / 6000) * 100,
      };
    }
    const { bounds } = mapConfig;
    return {
      x: ((pos.x - bounds.minX) / (bounds.maxX - bounds.minX)) * 100,
      y: 100 - ((pos.y - bounds.minY) / (bounds.maxY - bounds.minY)) * 100, // Y is inverted
    };
  };

  // Process grenade positions for rendering
  const grenadeMarkers = useMemo(() => {
    const markers: Array<{
      type: 'he' | 'flash' | 'smoke' | 'molotov';
      position: { x: number; y: number };
      thrower: string;
      team: string;
      round?: number;
      damage?: number;
      playersHit?: number;
    }> = [];

    if (heGrenades && isLayerEnabled('he')) {
      heGrenades.forEach(nade => {
        if (selectedRound !== null && nade.round_number !== selectedRound) return;
        const pos = gameToMapPercent(nade.grenade_position);
        markers.push({
          type: 'he',
          position: pos,
          thrower: nade.thrower_name || 'Unknown',
          team: nade.thrower_team || '',
          round: nade.round_number,
          damage: nade.damage,
          playersHit: nade.players_hit,
        });
      });
    }

    if (flashGrenades && isLayerEnabled('flash')) {
      flashGrenades.forEach(nade => {
        if (selectedRound !== null && nade.round_number !== selectedRound) return;
        const pos = gameToMapPercent(nade.grenade_position);
        markers.push({
          type: 'flash',
          position: pos,
          thrower: nade.thrower_name || 'Unknown',
          team: nade.thrower_team || '',
          round: nade.round_number,
          playersHit: nade.players_flashed,
        });
      });
    }

    if (smokes && isLayerEnabled('smoke')) {
      smokes.forEach(nade => {
        if (selectedRound !== null && nade.round_number !== selectedRound) return;
        const pos = gameToMapPercent(nade.smoke_position);
        markers.push({
          type: 'smoke',
          position: pos,
          thrower: nade.thrower_name || 'Unknown',
          team: nade.thrower_team || '',
          round: nade.round_number,
        });
      });
    }

    if (molotovs && isLayerEnabled('molotov')) {
      molotovs.forEach(nade => {
        if (selectedRound !== null && nade.round_number !== selectedRound) return;
        const pos = gameToMapPercent(nade.fire_position);
        markers.push({
          type: 'molotov',
          position: pos,
          thrower: nade.thrower_name || 'Unknown',
          team: nade.thrower_team || '',
          round: nade.round_number,
        });
      });
    }

    return markers;
    // eslint-disable-next-line react-hooks/exhaustive-deps -- gameToMapPercent and isLayerEnabled are plain functions whose deps (mapConfig, layers) are already tracked
  }, [heGrenades, flashGrenades, smokes, molotovs, selectedRound, layers, mapConfig]);

  // Get unique rounds from all data
  const availableRounds = useMemo(() => {
    const rounds = new Set<number>();
    kills?.forEach(k => k.round_number && rounds.add(k.round_number));
    heGrenades?.forEach(e => e.round_number && rounds.add(e.round_number));
    flashGrenades?.forEach(e => e.round_number && rounds.add(e.round_number));
    smokes?.forEach(e => e.round_number && rounds.add(e.round_number));
    molotovs?.forEach(e => e.round_number && rounds.add(e.round_number));
    return Array.from(rounds).sort((a, b) => a - b);
  }, [kills, heGrenades, flashGrenades, smokes, molotovs]);

  // Calculate grenade statistics
  const grenadeStats = useMemo(() => {
    return {
      heCount: heGrenades?.length || 0,
      flashCount: flashGrenades?.length || 0,
      smokeCount: smokes?.length || 0,
      molotovCount: molotovs?.length || 0,
      totalDamage: heGrenades?.reduce((sum, e) => sum + (e.damage || 0), 0) || 0,
      enemiesFlashed: flashGrenades?.reduce((sum, e) => sum + (e.enemies_flashed || 0), 0) || 0,
    };
  }, [heGrenades, flashGrenades, smokes, molotovs]);

  // Draw on canvas for better performance
  useEffect(() => {
    if (!canvasRef.current || !processedCells.length) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const gridSize = heatmap?.grid_size || 32;
    const cellWidth = canvas.width / gridSize;
    const cellHeight = canvas.height / gridSize;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Apply heat opacity
    ctx.globalAlpha = heatOpacity / 100;

    // Draw heatmap cells
    processedCells.forEach(cell => {
      const color = getHeatColor(cell.normalizedDensity);
      ctx.fillStyle = color;
      ctx.fillRect(
        cell.x * cellWidth,
        cell.y * cellHeight,
        cellWidth + 1,
        cellHeight + 1
      );
    });

    // Reset alpha for kill lines
    ctx.globalAlpha = 1.0;

    // Draw kill lines if enabled
    if (showKillLines && killPositions.length > 0) {
      killPositions.forEach(kill => {
        ctx.beginPath();
        ctx.strokeStyle = kill.headshot ? "rgba(255, 70, 84, 0.8)" : "rgba(255, 255, 255, 0.3)";
        ctx.lineWidth = kill.headshot ? 2 : 1;
        ctx.setLineDash([5, 3]);
        ctx.moveTo(kill.killerX * canvas.width / 100, kill.killerY * canvas.height / 100);
        ctx.lineTo(kill.victimX * canvas.width / 100, kill.victimY * canvas.height / 100);
        ctx.stroke();

        // Draw killer position (small circle)
        ctx.beginPath();
        ctx.fillStyle = "rgba(0, 168, 255, 0.9)";
        ctx.arc(kill.killerX * canvas.width / 100, kill.killerY * canvas.height / 100, 4, 0, 2 * Math.PI);
        ctx.fill();

        // Draw victim position (X mark)
        const vx = kill.victimX * canvas.width / 100;
        const vy = kill.victimY * canvas.height / 100;
        ctx.beginPath();
        ctx.strokeStyle = "rgba(255, 184, 0, 0.9)";
        ctx.lineWidth = 2;
        ctx.setLineDash([]);
        ctx.moveTo(vx - 4, vy - 4);
        ctx.lineTo(vx + 4, vy + 4);
        ctx.moveTo(vx + 4, vy - 4);
        ctx.lineTo(vx - 4, vy + 4);
        ctx.stroke();
      });
    }
  }, [processedCells, showKillLines, killPositions, heatmap?.grid_size, heatOpacity]);

  if (loading) {
    return (
      <Card className="bg-gradient-to-br from-background/80 to-background/60 backdrop-blur-xl border border-[#FF4654]/20 dark:border-[#DCFF37]/20">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <Icon icon="solar:flame-bold" width={20} className="text-[#FF4654] dark:text-[#DCFF37]" />
            <h2 className={clsx("text-lg font-bold uppercase tracking-wide", electrolize.className)}>
              Loading Heatmap...
            </h2>
          </div>
        </CardHeader>
        <CardBody>
          <Skeleton className="aspect-square max-w-lg mx-auto rounded-none" />
        </CardBody>
      </Card>
    );
  }

  if (!heatmap?.cells?.length && !kills?.length) {
    return (
      <Card className="bg-gradient-to-br from-background/80 to-background/60 backdrop-blur-xl border border-[#FF4654]/20 dark:border-[#DCFF37]/20">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <Icon icon="solar:flame-bold" width={20} className="text-[#FF4654] dark:text-[#DCFF37]" />
            <h2 className={clsx("text-lg font-bold uppercase tracking-wide", electrolize.className)}>
              Position Heatmap
            </h2>
          </div>
        </CardHeader>
        <CardBody>
          <div className="text-center py-16">
            <div className="relative w-32 h-32 mx-auto mb-6">
              <div className="absolute inset-0 bg-gradient-to-br from-[#FF4654]/20 to-[#DCFF37]/20 rounded-full blur-xl animate-pulse" />
              <div className="relative w-32 h-32 bg-gradient-to-br from-[#FF4654]/10 to-[#DCFF37]/10 rounded-full flex items-center justify-center">
                <Icon icon="solar:flame-line-duotone" width={64} className="text-default-300" />
              </div>
            </div>
            <p className={clsx("text-2xl font-black text-default-500 mb-3", electrolize.className)}>
              Heatmap Unavailable
            </p>
            <p className="text-sm text-default-400 max-w-md mx-auto mb-6">
              Position data visualization will appear here once the replay analysis includes trajectory data.
            </p>
            
            {/* Show map info if available */}
            {mapName && (
              <div className="max-w-sm mx-auto p-4 bg-gradient-to-br from-[#FF4654]/5 to-transparent dark:from-[#DCFF37]/5 rounded-none border border-[#FF4654]/20 dark:border-[#DCFF37]/20">
                <div className="flex items-center justify-center gap-3 mb-2">
                  <Icon icon="solar:map-point-bold" width={20} className="text-[#FF4654]" />
                  <span className={clsx("font-bold uppercase", electrolize.className)}>
                    {mapConfig?.displayName || mapName}
                  </span>
                </div>
                <p className="text-xs text-default-400">
                  Map radar overlay will be displayed when heatmap data is available
                </p>
              </div>
            )}
          </div>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-background/80 to-background/60 backdrop-blur-xl border border-[#FF4654]/20 dark:border-[#DCFF37]/20">
      <CardHeader className="pb-4">
        <div className="flex flex-col gap-4 w-full">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <div className="relative">
                <div className="absolute inset-0 bg-[#FF4654] blur-lg opacity-50 animate-pulse" />
                <Icon icon="solar:flame-bold" width={24} className="relative text-[#FF4654] dark:text-[#DCFF37]" />
              </div>
              <h2 className={clsx("text-lg font-bold uppercase tracking-wide", electrolize.className)}>
                Position Heatmap & Zone Analysis
              </h2>
            </div>
            
            {/* Map Badge */}
            <Chip 
              size="md" 
              variant="shadow" 
              color="primary"
              startContent={<Icon icon="solar:map-bold" width={14} />}
              className={electrolize.className}
            >
              {mapConfig?.displayName || mapName || "Unknown Map"}
            </Chip>
          </div>
          
          {/* Controls */}
          <div className="flex items-center justify-between flex-wrap gap-4">
            <Tabs
              selectedKey={viewMode}
              onSelectionChange={(key) => setViewMode(key as typeof viewMode)}
              size="sm"
              variant="bordered"
              classNames={{
                tabList: "gap-2 bg-transparent",
                tab: "px-3",
              }}
            >
              <Tab 
                key="heatmap" 
                title={
                  <div className="flex items-center gap-1">
                    <Icon icon="solar:flame-bold" width={14} />
                    <span>Heat</span>
                  </div>
                } 
              />
              <Tab 
                key="kills" 
                title={
                  <div className="flex items-center gap-1">
                    <Icon icon="solar:target-bold" width={14} />
                    <span>Kills</span>
                  </div>
                } 
              />
              <Tab 
                key="tactical" 
                title={
                  <div className="flex items-center gap-1">
                    <Icon icon="solar:bomb-bold" width={14} />
                    <span>Tactical</span>
                  </div>
                } 
              />
              <Tab 
                key="zones" 
                title={
                  <div className="flex items-center gap-1">
                    <Icon icon="solar:map-point-bold" width={14} />
                    <span>Zones</span>
                  </div>
                } 
              />
            </Tabs>
            
            <div className="flex flex-wrap items-center gap-4">
              <Switch
                size="sm"
                isSelected={showKillLines}
                onValueChange={setShowKillLines}
                classNames={{
                  label: "text-xs text-default-500"
                }}
              >
                Kill Lines
              </Switch>
              <Switch
                size="sm"
                isSelected={showCallouts}
                onValueChange={setShowCallouts}
                classNames={{
                  label: "text-xs text-default-500"
                }}
              >
                Callouts
              </Switch>
              <Switch
                size="sm"
                isSelected={showRadar}
                onValueChange={setShowRadar}
                classNames={{
                  label: "text-xs text-default-500"
                }}
              >
                Radar
              </Switch>
              <div className="flex items-center gap-2">
                <span className="text-xs text-default-500">Heat:</span>
                <input
                  type="range"
                  min="20"
                  max="100"
                  value={heatOpacity}
                  onChange={(e) => setHeatOpacity(Number(e.target.value))}
                  className="w-16 h-1 accent-[#FF4654]"
                />
                <span className="text-xs text-default-400 w-8">{heatOpacity}%</span>
              </div>
            </div>
          </div>

          {/* Layer Controls - Show when in tactical view */}
          {viewMode === "tactical" && (
            <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-default-200/30">
              <span className="text-xs text-default-500 font-semibold uppercase">Layers:</span>
              {layers.map(layer => (
                <button
                  key={layer.id}
                  onClick={() => toggleLayer(layer.id)}
                  className={clsx(
                    "flex items-center gap-1.5 px-2 py-1 text-xs font-medium transition-all",
                    "border rounded-none",
                    layer.enabled 
                      ? "bg-default-100 border-default-300 text-default-800" 
                      : "bg-transparent border-default-200 text-default-400"
                  )}
                  style={layer.enabled ? { borderColor: layer.color, boxShadow: `0 0 8px ${layer.color}40` } : {}}
                >
                  <Icon icon={layer.icon} width={12} style={{ color: layer.enabled ? layer.color : undefined }} />
                  {layer.label}
                </button>
              ))}
            </div>
          )}

          {/* Round Filter */}
          {viewMode === "tactical" && availableRounds.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 pt-2">
              <span className="text-xs text-default-500 font-semibold uppercase">Round:</span>
              <button
                onClick={() => setSelectedRound(null)}
                className={clsx(
                  "px-2 py-0.5 text-xs rounded-none border transition-all",
                  selectedRound === null 
                    ? "bg-[#FF4654] border-[#FF4654] text-white" 
                    : "bg-transparent border-default-300 text-default-500 hover:border-[#FF4654]"
                )}
              >
                All
              </button>
              {availableRounds.slice(0, 12).map(round => (
                <button
                  key={round}
                  onClick={() => setSelectedRound(round)}
                  className={clsx(
                    "px-2 py-0.5 text-xs rounded-none border transition-all",
                    selectedRound === round 
                      ? "bg-[#FF4654] border-[#FF4654] text-white" 
                      : "bg-transparent border-default-300 text-default-500 hover:border-[#FF4654]"
                  )}
                >
                  {round}
                </button>
              ))}
              {availableRounds.length > 12 && (
                <span className="text-xs text-default-400">+{availableRounds.length - 12} more</span>
              )}
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardBody className="pt-0">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Heatmap Display */}
          <div className="lg:col-span-2">
            <div className="relative aspect-square max-w-xl mx-auto">
              {/* Background Map (if available) */}
              {showRadar && mapConfig?.radarUrl && radarLoaded && !radarError && (
                <div 
                  className="absolute inset-0 bg-cover bg-center rounded-none opacity-40 transition-opacity"
                  style={{ backgroundImage: `url(${mapConfig.radarUrl})` }}
                />
              )}
              
              {/* Fallback Grid Pattern (when no radar or radar disabled) */}
              {(!showRadar || !radarLoaded || radarError) && (
                <div className="absolute inset-0 rounded-none overflow-hidden">
                  {/* Grid pattern */}
                  <svg className="absolute inset-0 w-full h-full opacity-20" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                      <pattern id="grid-pattern" width="32" height="32" patternUnits="userSpaceOnUse">
                        <path d="M 32 0 L 0 0 0 32" fill="none" stroke="#34445C" strokeWidth="1"/>
                      </pattern>
                      <pattern id="grid-major" width="128" height="128" patternUnits="userSpaceOnUse">
                        <path d="M 128 0 L 0 0 0 128" fill="none" stroke="#34445C" strokeWidth="2"/>
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grid-pattern)" />
                    <rect width="100%" height="100%" fill="url(#grid-major)" />
                  </svg>
                  {/* Compass indicator */}
                  <div className="absolute top-4 right-4 text-default-400 opacity-50">
                    <Icon icon="solar:compass-bold" width={24} />
                  </div>
                  {/* Map name overlay */}
                  {mapConfig && (
                    <div className="absolute bottom-4 left-4 text-default-400 opacity-50 text-sm font-mono">
                      {mapConfig.displayName}
                    </div>
                  )}
                </div>
              )}
              
              {/* Heatmap Container */}
              <div className={clsx(
                "relative w-full h-full rounded-none overflow-hidden",
                "bg-gradient-to-br from-[#34445C]/30 to-[#FF4654]/10",
                "border-2 border-[#FF4654]/30 dark:border-[#DCFF37]/30"
              )}>
                {/* Canvas for efficient rendering */}
                <canvas
                  ref={canvasRef}
                  width={512}
                  height={512}
                  className="absolute inset-0 w-full h-full"
                />
                
                {/* CSS Heatmap Cells (fallback/hover) */}
                {processedCells.length > 0 && viewMode === "heatmap" && (
                  <div className="absolute inset-0 grid" style={{ 
                    gridTemplateColumns: `repeat(${heatmap?.grid_size || 32}, 1fr)`,
                    gridTemplateRows: `repeat(${heatmap?.grid_size || 32}, 1fr)`,
                  }}>
                    {processedCells.map((cell, idx) => (
                      <Tooltip 
                        key={idx}
                        content={
                          <div className="text-center p-1">
                            <p className="text-xs font-bold">Position ({cell.x}, {cell.y})</p>
                            <p className="text-xs">Density: {(cell.normalizedDensity * 100).toFixed(1)}%</p>
                            {cell.player_count && <p className="text-xs">Players: {cell.player_count}</p>}
                          </div>
                        }
                      >
                        <div
                          className="cursor-pointer hover:scale-150 hover:z-10 transition-transform"
                          style={{
                            gridColumn: cell.x + 1,
                            gridRow: cell.y + 1,
                            backgroundColor: getHeatColor(cell.normalizedDensity),
                          }}
                          onMouseEnter={() => setHoveredCell(cell)}
                          onMouseLeave={() => setHoveredCell(null)}
                        />
                      </Tooltip>
                    ))}
                  </div>
                )}
                
                {/* Kill Markers */}
                {viewMode === "kills" && killPositions.length > 0 && (
                  <div className="absolute inset-0">
                    {killPositions.map((kill, idx) => (
                      <React.Fragment key={idx}>
                        {/* Killer position */}
                        <Tooltip content={`${kill.killer_name} (Killer)`}>
                          <div
                            className="absolute w-3 h-3 rounded-full bg-[#00A8FF] border-2 border-white shadow-lg cursor-pointer hover:scale-150 transition-transform"
                            style={{
                              left: `${kill.killerX}%`,
                              top: `${kill.killerY}%`,
                              transform: "translate(-50%, -50%)",
                            }}
                          />
                        </Tooltip>
                        
                        {/* Victim position */}
                        <Tooltip content={`${kill.victim_name} (Victim)`}>
                          <div
                            className="absolute w-3 h-3 cursor-pointer hover:scale-150 transition-transform"
                            style={{
                              left: `${kill.victimX}%`,
                              top: `${kill.victimY}%`,
                              transform: "translate(-50%, -50%)",
                            }}
                          >
                            <Icon icon="solar:close-circle-bold" width={12} className="text-[#FFB800]" />
                          </div>
                        </Tooltip>
                        
                        {/* Kill line */}
                        {showKillLines && (
                          <svg 
                            className="absolute inset-0 w-full h-full pointer-events-none"
                            style={{ overflow: "visible" }}
                          >
                            <line
                              x1={`${kill.killerX}%`}
                              y1={`${kill.killerY}%`}
                              x2={`${kill.victimX}%`}
                              y2={`${kill.victimY}%`}
                              stroke={kill.headshot ? "#FF4654" : "rgba(255,255,255,0.3)"}
                              strokeWidth={kill.headshot ? 2 : 1}
                              strokeDasharray="5,3"
                            />
                          </svg>
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                )}

                {/* Tactical View - Grenade Markers */}
                {viewMode === "tactical" && grenadeMarkers.length > 0 && (
                  <div className="absolute inset-0">
                    {grenadeMarkers.map((marker, idx) => {
                      const layerConfig = layers.find(l => l.id === marker.type);
                      if (!layerConfig) return null;

                      const getGrenadeIcon = () => {
                        switch (marker.type) {
                          case 'he': return "solar:bomb-bold";
                          case 'flash': return "solar:sun-bold";
                          case 'smoke': return "solar:cloud-bold";
                          case 'molotov': return "solar:fire-bold";
                          default: return "solar:bomb-bold";
                        }
                      };

                      const tooltipContent = (
                        <div className="p-2 text-center">
                          <p className="text-xs font-bold capitalize">{marker.type} Grenade</p>
                          <p className="text-xs">By: {marker.thrower}</p>
                          {marker.round && <p className="text-xs">Round {marker.round}</p>}
                          {marker.damage && <p className="text-xs text-[#FF4654]">Damage: {marker.damage}</p>}
                          {marker.playersHit && <p className="text-xs text-[#DCFF37]">Hit: {marker.playersHit} players</p>}
                        </div>
                      );

                      return (
                        <Tooltip key={idx} content={tooltipContent}>
                          <div
                            className={clsx(
                              "absolute w-5 h-5 flex items-center justify-center cursor-pointer",
                              "transition-all hover:scale-150 hover:z-20",
                              "rounded-full border-2 shadow-lg"
                            )}
                            style={{
                              left: `${marker.position.x}%`,
                              top: `${marker.position.y}%`,
                              transform: "translate(-50%, -50%)",
                              backgroundColor: layerConfig.bgColor,
                              borderColor: layerConfig.color,
                              boxShadow: `0 0 8px ${layerConfig.color}80`,
                            }}
                          >
                            <Icon 
                              icon={getGrenadeIcon()} 
                              width={12} 
                              className="text-white drop-shadow-md" 
                            />
                          </div>
                        </Tooltip>
                      );
                    })}
                  </div>
                )}

                {/* No grenade data message in tactical view */}
                {viewMode === "tactical" && grenadeMarkers.length === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center p-6 bg-background/80 backdrop-blur-sm rounded-none border border-default-200">
                      <Icon icon="solar:bomb-line-duotone" width={48} className="text-default-300 mx-auto mb-3" />
                      <p className={clsx("text-sm font-bold text-default-500", electrolize.className)}>
                        No Grenade Data Available
                      </p>
                      <p className="text-xs text-default-400 mt-1">
                        Reprocess the replay to generate tactical data
                      </p>
                    </div>
                  </div>
                )}
                
                {/* Map Callouts */}
                {showCallouts && mapConfig?.callouts && (
                  <div className="absolute inset-0 pointer-events-none">
                    {mapConfig.callouts.map((callout, idx) => (
                      <div
                        key={idx}
                        className="absolute text-[10px] font-bold text-white/70 bg-black/40 px-1.5 py-0.5 rounded backdrop-blur-sm whitespace-nowrap"
                        style={{
                          left: `${callout.x}%`,
                          top: `${callout.y}%`,
                          transform: "translate(-50%, -50%)",
                          textShadow: "0 1px 2px rgba(0,0,0,0.8)",
                        }}
                      >
                        {callout.name}
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Map Labels */}
                <div className="absolute top-2 left-2 z-10">
                  <Chip size="sm" variant="flat" className="bg-background/80 backdrop-blur-sm">
                    {mapConfig?.displayName || mapName || "Map"}
                  </Chip>
                </div>
                
                {/* Hovered Cell Info */}
                {hoveredCell && (
                  <div className="absolute bottom-2 right-2 z-10">
                    <div className="bg-background/90 backdrop-blur-sm rounded-lg p-2 text-xs">
                      <p>Position: ({hoveredCell.x}, {hoveredCell.y})</p>
                      <p>Density: {hoveredCell.density.toFixed(2)}</p>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Heat Legend */}
              <div className="mt-4 flex items-center justify-center gap-4">
                <span className="text-xs text-default-400">Low</span>
                <div 
                  className="w-48 h-3 rounded-full"
                  style={{ background: HEAT_GRADIENT }}
                />
                <span className="text-xs text-default-400">High</span>
              </div>
            </div>
          </div>
          
          {/* Side Panel - Stats & Zones */}
          <div className="space-y-4">
            {/* Stats Summary */}
            <div className="p-4 bg-gradient-to-br from-background/60 to-background/40 rounded-none border border-[#FF4654]/20 dark:border-[#DCFF37]/20">
              <h3 className={clsx("text-sm font-bold uppercase text-default-500 mb-3", electrolize.className)}>
                {viewMode === "tactical" ? "Tactical Statistics" : "Heat Statistics"}
              </h3>
              <div className="space-y-3">
                {viewMode !== "tactical" && (
                  <>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-default-400">Total Samples</span>
                      <span className={clsx("font-bold text-[#FF4654]", electrolize.className)}>
                        {heatmap?.total_samples?.toLocaleString() || "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-default-400">Grid Resolution</span>
                      <span className={clsx("font-bold", electrolize.className)}>
                        {heatmap?.grid_size || 32}x{heatmap?.grid_size || 32}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-default-400">Active Cells</span>
                      <span className={clsx("font-bold text-[#DCFF37]", electrolize.className)}>
                        {processedCells.length}
                      </span>
                    </div>
                  </>
                )}
                {kills && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-default-400">Total Kills</span>
                    <span className={clsx("font-bold text-[#FF4654]", electrolize.className)}>
                      {kills.length}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Grenade Breakdown - Show in tactical view */}
            {viewMode === "tactical" && (
              <div className="p-4 bg-gradient-to-br from-background/60 to-background/40 rounded-none border border-[#FF4654]/20 dark:border-[#DCFF37]/20">
                <h3 className={clsx("text-sm font-bold uppercase text-default-500 mb-3", electrolize.className)}>
                  Grenade Breakdown
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Icon icon="solar:bomb-bold" width={14} className="text-[#FF6B35]" />
                      <span className="text-sm text-default-400">HE Grenades</span>
                    </div>
                    <span className={clsx("font-bold text-[#FF6B35]", electrolize.className)}>
                      {grenadeStats.heCount}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Icon icon="solar:sun-bold" width={14} className="text-white" />
                      <span className="text-sm text-default-400">Flashbangs</span>
                    </div>
                    <span className={clsx("font-bold", electrolize.className)}>
                      {grenadeStats.flashCount}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Icon icon="solar:cloud-bold" width={14} className="text-gray-400" />
                      <span className="text-sm text-default-400">Smokes</span>
                    </div>
                    <span className={clsx("font-bold text-gray-400", electrolize.className)}>
                      {grenadeStats.smokeCount}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Icon icon="solar:fire-bold" width={14} className="text-[#FF9500]" />
                      <span className="text-sm text-default-400">Molotovs</span>
                    </div>
                    <span className={clsx("font-bold text-[#FF9500]", electrolize.className)}>
                      {grenadeStats.molotovCount}
                    </span>
                  </div>
                  <Divider className="my-2" />
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-default-400">HE Damage</span>
                    <span className={clsx("font-bold text-[#FF4654]", electrolize.className)}>
                      {grenadeStats.totalDamage}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-default-400">Enemies Flashed</span>
                    <span className={clsx("font-bold text-[#DCFF37]", electrolize.className)}>
                      {grenadeStats.enemiesFlashed}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Tactical Insights */}
            {viewMode === "tactical" && insights && insights.length > 0 && (
              <div className="p-4 bg-gradient-to-br from-background/60 to-background/40 rounded-none border border-[#FF4654]/20 dark:border-[#DCFF37]/20">
                <h3 className={clsx("text-sm font-bold uppercase text-default-500 mb-3", electrolize.className)}>
                  <Icon icon="solar:lightbulb-bolt-bold" className="inline mr-2 text-[#DCFF37]" width={14} />
                  Tactical Insights
                </h3>
                <div className="space-y-3">
                  {insights.slice(0, 4).map((insight, idx) => (
                    <div key={idx} className="p-2 bg-background/40 rounded-none border-l-2 border-[#DCFF37]">
                      <p className="text-xs font-bold text-default-600">{insight.title}</p>
                      <p className="text-xs text-default-400 mt-1">{insight.description}</p>
                      {insight.round_number && (
                        <Chip size="sm" variant="flat" className="mt-2 text-[10px]">
                          Round {insight.round_number}
                        </Chip>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Zone Analysis */}
            {showZones && heatmap?.zones && heatmap.zones.length > 0 && viewMode !== "tactical" && (
              <div className="p-4 bg-gradient-to-br from-background/60 to-background/40 rounded-none border border-[#FF4654]/20 dark:border-[#DCFF37]/20">
                <h3 className={clsx("text-sm font-bold uppercase text-default-500 mb-3", electrolize.className)}>
                  Zone Activity
                </h3>
                <div className="space-y-3">
                  {heatmap.zones.slice(0, 6).map((zone, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-semibold">
                          {zone.zone_name || zone.zone_code || `Zone ${idx + 1}`}
                        </span>
                        <span className="text-xs text-default-400">
                          {zone.visit_count} visits
                        </span>
                      </div>
                      <Progress
                        size="sm"
                        value={(zone.visit_count / Math.max(...(heatmap.zones ?? []).map(z => z.visit_count))) * 100}
                        color={idx < 2 ? "danger" : idx < 4 ? "warning" : "primary"}
                        className="h-1.5"
                      />
                      <div className="flex justify-between text-xs text-default-400">
                        <span>{(zone.total_time / 1000).toFixed(1)}s total</span>
                        <span>{(zone.avg_duration / 1000).toFixed(1)}s avg</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Legend */}
            <div className="p-4 bg-gradient-to-br from-background/60 to-background/40 rounded-none border border-[#FF4654]/20 dark:border-[#DCFF37]/20">
              <h3 className={clsx("text-sm font-bold uppercase text-default-500 mb-3", electrolize.className)}>
                Legend
              </h3>
              <div className="space-y-2">
                {viewMode === "kills" && (
                  <>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-[#00A8FF]" />
                      <span className="text-xs text-default-400">Killer Position</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Icon icon="solar:close-circle-bold" width={12} className="text-[#FFB800]" />
                      <span className="text-xs text-default-400">Victim Position</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-0.5 bg-[#FF4654]" style={{ borderTop: "2px dashed" }} />
                      <span className="text-xs text-default-400">Headshot Kill</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-0.5 bg-white/30" style={{ borderTop: "1px dashed" }} />
                      <span className="text-xs text-default-400">Regular Kill</span>
                    </div>
                  </>
                )}
                {viewMode === "tactical" && (
                  <>
                    {layers.filter(l => l.enabled).map(layer => (
                      <div key={layer.id} className="flex items-center gap-2">
                        <div 
                          className="w-4 h-4 rounded-full flex items-center justify-center border-2"
                          style={{ backgroundColor: layer.bgColor, borderColor: layer.color }}
                        >
                          <Icon icon={layer.icon} width={10} className="text-white" />
                        </div>
                        <span className="text-xs text-default-400">{layer.label}</span>
                      </div>
                    ))}
                  </>
                )}
                {viewMode === "heatmap" && (
                  <>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-3 bg-gradient-to-r from-blue-500/30 to-blue-500/80 rounded" />
                      <span className="text-xs text-default-400">Low Activity</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-3 bg-gradient-to-r from-green-500/50 to-yellow-500/80 rounded" />
                      <span className="text-xs text-default-400">Medium Activity</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-3 bg-gradient-to-r from-orange-500/70 to-red-500/90 rounded" />
                      <span className="text-xs text-default-400">High Activity</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}

export default PremiumHeatmap;

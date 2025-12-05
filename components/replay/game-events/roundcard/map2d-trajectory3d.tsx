"use client";

import React, { Suspense, useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls, useTexture, Line, Html, Text } from '@react-three/drei';
import * as THREE from 'three';
import { Spinner, Button, ButtonGroup, Switch, Chip } from '@nextui-org/react';
import { Icon } from '@iconify/react';
import {
  PlayerTrajectory,
  TrajectoryPoint,
  MatchTrajectoryResponse,
  RoundTrajectoryResponse,
} from '@/types/replay-api/match-analytics.sdk';

/** CS2 Map configuration for coordinate transformation */
interface MapConfig {
  name: string;
  radarImageUrl: string;
  /** Map bounds in game coordinates */
  bounds: {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
  };
  /** Scale factor to convert game units to scene units */
  scale: number;
}

/** Default CS2 map configurations */
const CS2_MAPS: Record<string, MapConfig> = {
  de_dust2: {
    name: 'Dust 2',
    radarImageUrl: '/maps/cs2/de_dust2_radar.png',
    bounds: { minX: -2476, maxX: 2127, minY: -1262, maxY: 3239 },
    scale: 0.05,
  },
  de_mirage: {
    name: 'Mirage',
    radarImageUrl: '/maps/cs2/de_mirage_radar.png',
    bounds: { minX: -3230, maxX: 1713, minY: -3472, maxY: 1744 },
    scale: 0.05,
  },
  de_inferno: {
    name: 'Inferno',
    radarImageUrl: '/maps/cs2/de_inferno_radar.png',
    bounds: { minX: -2087, maxX: 2919, minY: -1049, maxY: 3870 },
    scale: 0.05,
  },
  de_nuke: {
    name: 'Nuke',
    radarImageUrl: '/maps/cs2/de_nuke_radar.png',
    bounds: { minX: -3453, maxX: 3277, minY: -4290, maxY: 2443 },
    scale: 0.05,
  },
  de_anubis: {
    name: 'Anubis',
    radarImageUrl: '/maps/cs2/de_anubis_radar.png',
    bounds: { minX: -2800, maxX: 2200, minY: -2100, maxY: 3200 },
    scale: 0.05,
  },
  de_ancient: {
    name: 'Ancient',
    radarImageUrl: '/maps/cs2/de_ancient_radar.png',
    bounds: { minX: -2953, maxX: 2164, minY: -2344, maxY: 2773 },
    scale: 0.05,
  },
  de_vertigo: {
    name: 'Vertigo',
    radarImageUrl: '/maps/cs2/de_vertigo_radar.png',
    bounds: { minX: -3168, maxX: 400, minY: -2432, maxY: 1536 },
    scale: 0.05,
  },
};

/** Default map config for unknown maps */
const DEFAULT_MAP_CONFIG: MapConfig = {
  name: 'Unknown',
  radarImageUrl: '/maps/cs2/default_radar.png',
  bounds: { minX: -4096, maxX: 4096, minY: -4096, maxY: 4096 },
  scale: 0.05,
};

/** Team colors */
const TEAM_COLORS = {
  CT: '#5D79AE',
  T: '#DE9B35',
  unknown: '#888888',
};

interface MapProps {
  trajectoryData: MatchTrajectoryResponse | RoundTrajectoryResponse | null;
  mapName?: string;
  currentTick?: number;
  selectedPlayers?: string[];
  showVisionCones?: boolean;
  isPlaying?: boolean;
  playbackSpeed?: number;
  onTickChange?: (tick: number) => void;
}

/** Convert game coordinates to scene coordinates */
function gameToScene(x: number, y: number, z: number, config: MapConfig): THREE.Vector3 {
  const { bounds, scale } = config;
  const centerX = (bounds.minX + bounds.maxX) / 2;
  const centerY = (bounds.minY + bounds.maxY) / 2;

  return new THREE.Vector3(
    (x - centerX) * scale,
    z * scale * 0.1, // Height (z in game is vertical)
    -(y - centerY) * scale // Flip Y axis
  );
}

/** Get color for a player based on team */
function getPlayerColor(team?: string): string {
  if (team?.toUpperCase() === 'CT') return TEAM_COLORS.CT;
  if (team?.toUpperCase() === 'T') return TEAM_COLORS.T;
  return TEAM_COLORS.unknown;
}

/** Player marker component */
function PlayerMarker({
  position,
  color,
  playerName,
  isAlive,
  angle,
  showVisionCone,
}: {
  position: THREE.Vector3;
  color: string;
  playerName?: string;
  isAlive?: boolean;
  angle?: { x: number; y: number; z: number };
  showVisionCone?: boolean;
}) {
  const meshRef = useRef<THREE.Mesh>(null);

  return (
    <group position={position}>
      {/* Player sphere */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[isAlive ? 2 : 1, 16, 16]} />
        <meshStandardMaterial
          color={color}
          opacity={isAlive ? 1 : 0.4}
          transparent={!isAlive}
        />
      </mesh>

      {/* Vision cone */}
      {showVisionCone && isAlive && angle && (
        <mesh
          rotation={[0, -angle.y * Math.PI / 180, 0]}
          position={[0, 0, 0]}
        >
          <coneGeometry args={[8, 30, 16, 1, true]} />
          <meshBasicMaterial
            color={color}
            transparent
            opacity={0.15}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}

      {/* Player name label */}
      {playerName && (
        <Html
          position={[0, 5, 0]}
          center
          distanceFactor={100}
          style={{ pointerEvents: 'none' }}
        >
          <div className="bg-black/70 text-white px-2 py-1 rounded text-xs whitespace-nowrap">
            {playerName}
          </div>
        </Html>
      )}
    </group>
  );
}

/** Player trajectory line component */
function TrajectoryLine({
  trajectory,
  mapConfig,
  currentTick,
  color,
}: {
  trajectory: PlayerTrajectory;
  mapConfig: MapConfig;
  currentTick?: number;
  color: string;
}) {
  const points = useMemo(() => {
    const filteredPoints = currentTick
      ? trajectory.points.filter(p => p.tick_id <= currentTick)
      : trajectory.points;

    return filteredPoints.map(p =>
      gameToScene(p.position.x, p.position.y, p.position.z, mapConfig)
    );
  }, [trajectory.points, mapConfig, currentTick]);

  if (points.length < 2) return null;

  return (
    <Line
      points={points}
      color={color}
      lineWidth={2}
      transparent
      opacity={0.7}
    />
  );
}

/** Animated playback controller */
function PlaybackController({
  trajectoryData,
  isPlaying,
  currentTick,
  playbackSpeed,
  onTickChange,
}: {
  trajectoryData: MatchTrajectoryResponse | RoundTrajectoryResponse | null;
  isPlaying: boolean;
  currentTick: number;
  playbackSpeed: number;
  onTickChange: (tick: number) => void;
}) {
  const ticksPerFrame = playbackSpeed * 2; // Adjust based on tick rate

  useFrame((_, delta) => {
    if (!isPlaying || !trajectoryData) return;

    // Find max tick
    let maxTick = 0;
    trajectoryData.trajectories.forEach(t => {
      t.points.forEach(p => {
        if (p.tick_id > maxTick) maxTick = p.tick_id;
      });
    });

    const newTick = currentTick + ticksPerFrame;
    if (newTick >= maxTick) {
      onTickChange(0); // Loop back
    } else {
      onTickChange(newTick);
    }
  });

  return null;
}

/** Map radar image plane */
function MapRadar({ mapConfig }: { mapConfig: MapConfig }) {
  const texture = useTexture(mapConfig.radarImageUrl);
  const { bounds, scale } = mapConfig;
  const width = (bounds.maxX - bounds.minX) * scale;
  const height = (bounds.maxY - bounds.minY) * scale;

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]}>
      <planeGeometry args={[width, height]} />
      <meshBasicMaterial map={texture} transparent opacity={0.9} />
    </mesh>
  );
}

/** Main 3D Scene component */
function Scene({
  trajectoryData,
  mapConfig,
  currentTick,
  selectedPlayers,
  showVisionCones,
  isPlaying,
  playbackSpeed,
  onTickChange,
}: {
  trajectoryData: MatchTrajectoryResponse | RoundTrajectoryResponse | null;
  mapConfig: MapConfig;
  currentTick: number;
  selectedPlayers?: string[];
  showVisionCones: boolean;
  isPlaying: boolean;
  playbackSpeed: number;
  onTickChange: (tick: number) => void;
}) {
  const filteredTrajectories = useMemo(() => {
    if (!trajectoryData) return [];
    if (!selectedPlayers || selectedPlayers.length === 0) {
      return trajectoryData.trajectories;
    }
    return trajectoryData.trajectories.filter(t =>
      selectedPlayers.includes(t.player_id)
    );
  }, [trajectoryData, selectedPlayers]);

  // Get current positions for player markers
  const currentPositions = useMemo(() => {
    return filteredTrajectories.map(trajectory => {
      const points = trajectory.points;
      // Find the point closest to current tick
      let closestPoint = points[0];
      for (const point of points) {
        if (point.tick_id <= currentTick) {
          closestPoint = point;
        } else {
          break;
        }
      }
      return {
        trajectory,
        point: closestPoint,
      };
    });
  }, [filteredTrajectories, currentTick]);

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 10, 5]} intensity={0.5} />

      {/* Map radar background */}
      <Suspense fallback={null}>
        <MapRadar mapConfig={mapConfig} />
      </Suspense>

      {/* Trajectory lines */}
      {filteredTrajectories.map(trajectory => (
        <TrajectoryLine
          key={trajectory.player_id}
          trajectory={trajectory}
          mapConfig={mapConfig}
          currentTick={currentTick}
          color={getPlayerColor(trajectory.team)}
        />
      ))}

      {/* Player markers at current positions */}
      {currentPositions.map(({ trajectory, point }) => {
        if (!point) return null;
        const position = gameToScene(
          point.position.x,
          point.position.y,
          point.position.z,
          mapConfig
        );
        return (
          <PlayerMarker
            key={trajectory.player_id}
            position={position}
            color={getPlayerColor(trajectory.team)}
            playerName={trajectory.player_name}
            isAlive={point.is_alive}
            angle={point.angle}
            showVisionCone={showVisionCones}
          />
        );
      })}

      {/* Playback controller */}
      <PlaybackController
        trajectoryData={trajectoryData}
        isPlaying={isPlaying}
        currentTick={currentTick}
        playbackSpeed={playbackSpeed}
        onTickChange={onTickChange}
      />

      {/* Camera controls */}
      <OrbitControls
        enableDamping
        dampingFactor={0.05}
        minDistance={50}
        maxDistance={500}
        maxPolarAngle={Math.PI / 2.1}
      />
    </>
  );
}

/** Main Map2DTrajectory3D component */
export default function Map2DTrajectory3D({
  trajectoryData,
  mapName = 'de_dust2',
  currentTick: externalTick,
  selectedPlayers,
  showVisionCones: initialShowVisionCones = true,
  isPlaying: initialIsPlaying = false,
  playbackSpeed: initialPlaybackSpeed = 1,
  onTickChange: externalOnTickChange,
}: MapProps) {
  const [internalTick, setInternalTick] = useState(0);
  const [isPlaying, setIsPlaying] = useState(initialIsPlaying);
  const [playbackSpeed, setPlaybackSpeed] = useState(initialPlaybackSpeed);
  const [showVisionCones, setShowVisionCones] = useState(initialShowVisionCones);
  const [showTrajectories, setShowTrajectories] = useState(true);

  const currentTick = externalTick ?? internalTick;
  const handleTickChange = externalOnTickChange ?? setInternalTick;

  const mapConfig = CS2_MAPS[mapName.toLowerCase()] || DEFAULT_MAP_CONFIG;

  // Calculate max tick for progress bar
  const maxTick = useMemo(() => {
    if (!trajectoryData) return 0;
    let max = 0;
    trajectoryData.trajectories.forEach(t => {
      t.points.forEach(p => {
        if (p.tick_id > max) max = p.tick_id;
      });
    });
    return max;
  }, [trajectoryData]);

  const progress = maxTick > 0 ? (currentTick / maxTick) * 100 : 0;

  if (!trajectoryData) {
    return (
      <div className="w-full h-[500px] flex items-center justify-center bg-default-100 rounded-lg">
        <div className="text-center">
          <Icon icon="mdi:map-marker-path" className="text-default-400 mx-auto mb-2" width={48} />
          <p className="text-default-500">No trajectory data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full rounded-lg overflow-hidden bg-default-100">
      {/* Controls header */}
      <div className="flex items-center justify-between p-3 bg-default-200/50 border-b border-default-300">
        <div className="flex items-center gap-3">
          <Chip variant="flat" size="sm">
            {mapConfig.name}
          </Chip>
          <span className="text-sm text-default-500">
            {trajectoryData.trajectories.length} players
          </span>
        </div>

        <div className="flex items-center gap-4">
          <Switch
            size="sm"
            isSelected={showTrajectories}
            onValueChange={setShowTrajectories}
          >
            Trajectories
          </Switch>
          <Switch
            size="sm"
            isSelected={showVisionCones}
            onValueChange={setShowVisionCones}
          >
            Vision Cones
          </Switch>
        </div>
      </div>

      {/* 3D Canvas */}
      <div className="h-[500px]">
        <Canvas
          camera={{ position: [0, 200, 200], fov: 50 }}
          gl={{ antialias: true }}
        >
          <Scene
            trajectoryData={trajectoryData}
            mapConfig={mapConfig}
            currentTick={currentTick}
            selectedPlayers={selectedPlayers}
            showVisionCones={showVisionCones}
            isPlaying={isPlaying}
            playbackSpeed={playbackSpeed}
            onTickChange={handleTickChange}
          />
        </Canvas>
      </div>

      {/* Playback controls */}
      <div className="p-3 bg-default-200/50 border-t border-default-300">
        <div className="flex items-center gap-4">
          {/* Play/Pause button */}
          <Button
            isIconOnly
            size="sm"
            variant="flat"
            onPress={() => setIsPlaying(!isPlaying)}
          >
            <Icon icon={isPlaying ? "mdi:pause" : "mdi:play"} width={20} />
          </Button>

          {/* Reset button */}
          <Button
            isIconOnly
            size="sm"
            variant="flat"
            onPress={() => handleTickChange(0)}
          >
            <Icon icon="mdi:skip-backward" width={20} />
          </Button>

          {/* Progress bar */}
          <div className="flex-1 h-2 bg-default-300 rounded-full overflow-hidden cursor-pointer"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const x = e.clientX - rect.left;
              const percentage = x / rect.width;
              handleTickChange(Math.floor(percentage * maxTick));
            }}
          >
            <div
              className="h-full bg-primary transition-all duration-100"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Speed controls */}
          <ButtonGroup size="sm" variant="flat">
            {[0.5, 1, 2, 4].map(speed => (
              <Button
                key={speed}
                className={playbackSpeed === speed ? 'bg-primary text-white' : ''}
                onPress={() => setPlaybackSpeed(speed)}
              >
                {speed}x
              </Button>
            ))}
          </ButtonGroup>

          {/* Tick display */}
          <span className="text-xs text-default-500 min-w-[80px] text-right">
            {currentTick.toLocaleString()} / {maxTick.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
}

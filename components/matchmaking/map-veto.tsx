"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Card,
  CardBody,
  CardHeader,
  Progress,
  Chip,
  Avatar,
  Divider,
  Tooltip,
} from "@nextui-org/react";
import { Icon } from "@iconify/react";

import { GAME_CONFIGS, getGameMaps } from "@/config/games";
import type { GameId, MapVetoAction } from "@/types/games";

export interface MapVetoProps {
  /** Game ID for map pool */
  gameId: GameId;
  /** Match ID */
  matchId: string;
  /** Veto format string (e.g., "ban-ban-ban-ban-pick-pick-remaining") */
  vetoFormat: string;
  /** Current team making the decision */
  currentTeamId: string;
  /** Team 1 info */
  team1: TeamInfo;
  /** Team 2 info */
  team2: TeamInfo;
  /** Time limit per action in seconds */
  actionTimeLimit?: number;
  /** Callback when veto action is made */
  onVetoAction?: (action: MapVetoAction) => void;
  /** Callback when veto is complete */
  onVetoComplete?: (selectedMaps: string[], bannedMaps: string[]) => void;
  /** Custom class name */
  className?: string;
  /** Spectator mode (read-only) */
  isSpectator?: boolean;
  /** Player's team ID (for determining who can act) */
  playerTeamId?: string;
}

interface TeamInfo {
  id: string;
  name: string;
  logo?: string;
  avatar?: string;
  seed?: number;
}

type VetoStep = "ban" | "pick" | "remaining";

interface VetoState {
  steps: VetoStep[];
  currentStep: number;
  currentTeamIndex: number;
  bannedMaps: string[];
  pickedMaps: string[];
  remainingMaps: string[];
  isComplete: boolean;
}

/**
 * Premium map veto component for competitive play.
 * Features:
 * - Support for multiple veto formats
 * - Animated map cards
 * - Team turn indicators
 * - Timer support
 * - Spectator mode
 */
export function MapVetoComponent({
  gameId,
  matchId: _matchId,
  vetoFormat,
  currentTeamId: _currentTeamId,
  team1,
  team2,
  actionTimeLimit = 30,
  onVetoAction,
  onVetoComplete,
  className = "",
  isSpectator = false,
  playerTeamId,
}: MapVetoProps) {
  const game = GAME_CONFIGS[gameId];
  const maps = getGameMaps(gameId, true);
  
  // Parse veto format into steps
  const parseVetoFormat = useCallback((format: string): VetoStep[] => {
    return format.split("-").map((step) => {
      if (step === "ban") return "ban";
      if (step === "pick") return "pick";
      return "remaining";
    });
  }, []);
  
  const [vetoState, setVetoState] = useState<VetoState>(() => ({
    steps: parseVetoFormat(vetoFormat),
    currentStep: 0,
    currentTeamIndex: 0,
    bannedMaps: [],
    pickedMaps: [],
    remainingMaps: maps.map((m) => m.id),
    isComplete: false,
  }));
  
  const [timeRemaining, setTimeRemaining] = useState(actionTimeLimit);
  const [hoveredMap, setHoveredMap] = useState<string | null>(null);
  
  const getCurrentTeam = () => {
    return vetoState.currentTeamIndex === 0 ? team1 : team2;
  };
  
  const getCurrentAction = (): VetoStep => {
    return vetoState.steps[vetoState.currentStep] || "remaining";
  };
  
  const canPlayerAct = () => {
    if (isSpectator) return false;
    if (!playerTeamId) return false;
    return getCurrentTeam().id === playerTeamId;
  };
  
  const handleMapAction = (mapId: string) => {
    if (!canPlayerAct()) return;
    if (vetoState.isComplete) return;
    if (!vetoState.remainingMaps.includes(mapId)) return;
    
    const action = getCurrentAction();
    const currentTeam = getCurrentTeam();
    
    const vetoAction: MapVetoAction = {
      teamId: currentTeam.id,
      action: action === "ban" ? "ban" : "pick",
      mapId,
      timestamp: new Date(),
    };
    
    onVetoAction?.(vetoAction);
    
    setVetoState((prev) => {
      const newState = { ...prev };
      const newRemaining = prev.remainingMaps.filter((id) => id !== mapId);
      
      if (action === "ban") {
        newState.bannedMaps = [...prev.bannedMaps, mapId];
      } else if (action === "pick") {
        newState.pickedMaps = [...prev.pickedMaps, mapId];
      }
      
      newState.remainingMaps = newRemaining;
      newState.currentStep = prev.currentStep + 1;
      
      // Alternate teams for each step (unless it's the final remaining step)
      if (prev.steps[prev.currentStep + 1] !== "remaining") {
        newState.currentTeamIndex = prev.currentTeamIndex === 0 ? 1 : 0;
      }
      
      // Check if veto is complete
      if (prev.currentStep + 1 >= prev.steps.length || newRemaining.length <= 1) {
        newState.isComplete = true;
        
        // Add remaining map(s) as picked if format ends with "remaining"
        if (prev.steps[prev.steps.length - 1] === "remaining" && newRemaining.length > 0) {
          newState.pickedMaps = [...newState.pickedMaps, ...newRemaining];
          newState.remainingMaps = [];
        }
        
        onVetoComplete?.(newState.pickedMaps, newState.bannedMaps);
      }
      
      return newState;
    });
    
    setTimeRemaining(actionTimeLimit);
  };
  
  const handleAutoAction = useCallback(() => {
    const remaining = vetoState.remainingMaps;
    if (remaining.length === 0) return;
    
    // Pick random map
    const randomIndex = Math.floor(Math.random() * remaining.length);
    handleMapAction(remaining[randomIndex]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vetoState.remainingMaps]);
  
  // Timer countdown
  useEffect(() => {
    if (vetoState.isComplete) return;
    
    const interval = setInterval(() => {
      setTimeRemaining((t) => {
        if (t <= 1) {
          // Auto-pick/ban random map when time expires
          handleAutoAction();
          return actionTimeLimit;
        }
        return t - 1;
      });
    }, 1000);
    
    return () => clearInterval(interval);
  }, [vetoState.currentStep, vetoState.isComplete, actionTimeLimit, handleAutoAction]);

  const getMapStatus = (mapId: string): "available" | "banned" | "picked" => {
    if (vetoState.bannedMaps.includes(mapId)) return "banned";
    if (vetoState.pickedMaps.includes(mapId)) return "picked";
    return "available";
  };

  if (!game) {
    return (
      <Card className={className}>
        <CardBody className="text-center py-12">
          <Icon icon="solar:map-bold" className="text-4xl text-default-300 mx-auto mb-2" />
          <p className="text-default-500">Game not found</p>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card className={`map-veto overflow-hidden ${className}`}>
      <CardHeader
        className="flex-col items-start p-4"
        style={{
          background: `linear-gradient(135deg, ${game.color.primary}20, ${game.color.secondary})`,
        }}
      >
        {/* Teams header */}
        <div className="flex items-center justify-between w-full mb-4">
          {/* Team 1 */}
          <div className="flex items-center gap-3">
            <Avatar
              src={team1.logo || team1.avatar}
              name={team1.name}
              size="lg"
              className={`ring-2 ${
                getCurrentTeam().id === team1.id && !vetoState.isComplete
                  ? "ring-primary animate-pulse"
                  : "ring-default-300"
              }`}
            />
            <div>
              <h3 className="font-gaming font-bold">{team1.name}</h3>
              {team1.seed && (
                <Chip size="sm" variant="flat">
                  Seed #{team1.seed}
                </Chip>
              )}
            </div>
          </div>
          
          {/* VS divider */}
          <div className="text-center">
            <p className="font-gaming text-2xl text-default-400">VS</p>
            {!vetoState.isComplete && (
              <Chip
                size="sm"
                color={getCurrentAction() === "ban" ? "danger" : "success"}
                variant="flat"
                className="mt-1"
              >
                {getCurrentAction().toUpperCase()}
              </Chip>
            )}
          </div>
          
          {/* Team 2 */}
          <div className="flex items-center gap-3 flex-row-reverse">
            <Avatar
              src={team2.logo || team2.avatar}
              name={team2.name}
              size="lg"
              className={`ring-2 ${
                getCurrentTeam().id === team2.id && !vetoState.isComplete
                  ? "ring-primary animate-pulse"
                  : "ring-default-300"
              }`}
            />
            <div className="text-right">
              <h3 className="font-gaming font-bold">{team2.name}</h3>
              {team2.seed && (
                <Chip size="sm" variant="flat">
                  Seed #{team2.seed}
                </Chip>
              )}
            </div>
          </div>
        </div>
        
        {/* Timer and status */}
        {!vetoState.isComplete && (
          <div className="w-full space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-default-500">
                <Icon icon="solar:clock-circle-bold" className="inline mr-1" />
                {timeRemaining}s remaining
              </span>
              <span className="text-default-500">
                Step {vetoState.currentStep + 1}/{vetoState.steps.length}
              </span>
            </div>
            <Progress
              aria-label="Veto progress"
              value={(vetoState.currentStep / vetoState.steps.length) * 100}
              color="primary"
              className="max-w-full"
            />
          </div>
        )}
        
        {vetoState.isComplete && (
          <div className="w-full text-center py-2">
            <Chip color="success" variant="solid" size="lg" className="font-gaming">
              <Icon icon="solar:check-circle-bold" className="mr-1" />
              VETO COMPLETE
            </Chip>
          </div>
        )}
      </CardHeader>
      
      <CardBody className="p-4">
        {/* Map grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {maps.map((map) => {
            const status = getMapStatus(map.id);
            const isAvailable = status === "available" && !vetoState.isComplete;
            const canSelect = isAvailable && canPlayerAct();
            
            return (
              <motion.div
                key={map.id}
                whileHover={canSelect ? { scale: 1.03 } : undefined}
                whileTap={canSelect ? { scale: 0.98 } : undefined}
                onMouseEnter={() => setHoveredMap(map.id)}
                onMouseLeave={() => setHoveredMap(null)}
              >
                <Card
                  isPressable={canSelect}
                  onPress={() => canSelect && handleMapAction(map.id)}
                  className={`overflow-hidden transition-all duration-200 ${
                    status === "banned"
                      ? "opacity-50 grayscale"
                      : status === "picked"
                      ? "ring-2 ring-success"
                      : canSelect
                      ? "ring-1 ring-primary/50 cursor-pointer"
                      : ""
                  }`}
                >
                  {/* Map image placeholder */}
                  <div
                    className="h-24 relative flex items-center justify-center"
                    style={{
                      background: `linear-gradient(135deg, ${game.color.primary}30, ${game.color.secondary})`,
                    }}
                  >
                    <Icon
                      icon="solar:map-bold"
                      className="text-4xl opacity-50"
                      style={{ color: game.color.primary }}
                    />
                    
                    {/* Status overlay */}
                    <AnimatePresence>
                      {status === "banned" && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.5 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.5 }}
                          className="absolute inset-0 flex items-center justify-center bg-danger/50"
                        >
                          <Icon icon="solar:close-circle-bold" className="text-4xl text-danger" />
                        </motion.div>
                      )}
                      
                      {status === "picked" && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.5 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.5 }}
                          className="absolute inset-0 flex items-center justify-center bg-success/30"
                        >
                          <Icon icon="solar:check-circle-bold" className="text-4xl text-success" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                    
                    {/* Action hint on hover */}
                    {canSelect && hoveredMap === map.id && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className={`absolute inset-0 flex items-center justify-center ${
                          getCurrentAction() === "ban" ? "bg-danger/30" : "bg-success/30"
                        }`}
                      >
                        <Icon
                          icon={getCurrentAction() === "ban" ? "solar:close-circle-bold" : "solar:check-circle-bold"}
                          className={`text-3xl ${
                            getCurrentAction() === "ban" ? "text-danger" : "text-success"
                          }`}
                        />
                      </motion.div>
                    )}
                  </div>
                  
                  <CardBody className="p-2 text-center">
                    <p className="font-gaming text-sm truncate">{map.name}</p>
                    {status !== "available" && (
                      <Chip
                        size="sm"
                        color={status === "banned" ? "danger" : "success"}
                        variant="flat"
                        className="text-xs mt-1"
                      >
                        {status === "banned" ? "BANNED" : "PICKED"}
                      </Chip>
                    )}
                  </CardBody>
                </Card>
              </motion.div>
            );
          })}
        </div>
        
        <Divider className="my-4" />
        
        {/* Veto history */}
        <div>
          <p className="text-sm font-semibold text-default-600 mb-2">Veto History</p>
          <div className="flex flex-wrap gap-2">
            {vetoState.bannedMaps.map((mapId, index) => {
              const map = maps.find((m) => m.id === mapId);
              const team = index % 2 === 0 ? team1 : team2;
              
              return (
                <Tooltip key={`ban-${mapId}`} content={`${team.name} banned`}>
                  <Chip
                    size="sm"
                    color="danger"
                    variant="flat"
                    startContent={<Icon icon="solar:close-circle-bold" />}
                  >
                    {map?.name || mapId}
                  </Chip>
                </Tooltip>
              );
            })}
            
            {vetoState.pickedMaps.map((mapId, index) => {
              const map = maps.find((m) => m.id === mapId);
              const banCount = vetoState.bannedMaps.length;
              const team = (banCount + index) % 2 === 0 ? team1 : team2;
              
              return (
                <Tooltip key={`pick-${mapId}`} content={`${team.name} picked`}>
                  <Chip
                    size="sm"
                    color="success"
                    variant="solid"
                    startContent={<Icon icon="solar:check-circle-bold" />}
                  >
                    {map?.name || mapId}
                  </Chip>
                </Tooltip>
              );
            })}
            
            {vetoState.bannedMaps.length === 0 && vetoState.pickedMaps.length === 0 && (
              <p className="text-sm text-default-400">No actions yet</p>
            )}
          </div>
        </div>
        
        {/* Final map selection summary */}
        {vetoState.isComplete && vetoState.pickedMaps.length > 0 && (
          <div className="mt-4 p-4 rounded-xl bg-success/10 border border-success/30">
            <p className="font-gaming text-success mb-2">
              <Icon icon="solar:map-arrow-square-bold" className="inline mr-2" />
              SELECTED MAPS
            </p>
            <div className="flex flex-wrap gap-2">
              {vetoState.pickedMaps.map((mapId, index) => {
                const map = maps.find((m) => m.id === mapId);
                return (
                  <Chip
                    key={mapId}
                    size="lg"
                    color="success"
                    variant="solid"
                    className="font-gaming"
                  >
                    Map {index + 1}: {map?.name || mapId}
                  </Chip>
                );
              })}
            </div>
          </div>
        )}
      </CardBody>
    </Card>
  );
}

export default MapVetoComponent;

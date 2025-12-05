"use client"

import React, { useState, useEffect, useMemo } from 'react';
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Select,
  SelectItem,
  Chip,
  Progress,
  Divider,
  Avatar,
  Badge,
  Skeleton,
} from '@nextui-org/react';
import { Icon } from '@iconify/react';
import { useSession } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import { ReplayAPISDK } from '@/types/replay-api/sdk';
import { MatchmakingSDK } from '@/types/replay-api/matchmaking.sdk';
import { ReplayApiSettingsMock } from '@/types/replay-api/settings';
import { logger } from '@/lib/logger';
import {
  TIER_BENEFITS,
  GAME_MODES,
  REGIONS,
  type MatchmakingTier,
  type PoolStatsResponse,
  type MatchmakingUIState,
  type GameModeOption,
  type RegionOption,
} from '@/types/replay-api/matchmaking.types';

const sdk = new ReplayAPISDK(ReplayApiSettingsMock, logger);
const matchmakingSDK = sdk.matchmaking;

/** Extended user type for session */
interface ExtendedUser {
  id?: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

export default function EnhancedMatchmakingPage() {
  const { data: session } = useSession();
  const [selectedTier, setSelectedTier] = useState<MatchmakingTier>('free');
  const [selectedGameMode, setSelectedGameMode] = useState('competitive');
  const [selectedRegion, setSelectedRegion] = useState('na-east');
  const [poolStats, setPoolStats] = useState<PoolStatsResponse | null>(null);
  const [matchmakingState, setMatchmakingState] = useState<MatchmakingUIState>({
    isSearching: false,
    sessionId: null,
    queuePosition: 0,
    estimatedWait: 0,
    elapsedTime: 0,
    poolStats: null,
    error: null,
  });

  const tierBenefits = TIER_BENEFITS[selectedTier];
  const gameMode = GAME_MODES[selectedGameMode];
  const region = REGIONS[selectedRegion];

  // Fetch pool stats in real-time
  useEffect(() => {
    const unsubscribe = matchmakingSDK.subscribeToPoolUpdates(
      'cs2',
      (stats: PoolStatsResponse) => {
        setPoolStats(stats);
      },
      5000 // Update every 5 seconds
    );

    return () => unsubscribe();
  }, [selectedGameMode, selectedRegion]);

  // Track elapsed time while searching
  useEffect(() => {
    if (!matchmakingState.isSearching) return;

    const interval = setInterval(() => {
      setMatchmakingState((prev) => ({
        ...prev,
        elapsedTime: prev.elapsedTime + 1,
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, [matchmakingState.isSearching]);

  const handleStartMatchmaking = async () => {
    if (!session?.user) {
      setMatchmakingState((prev) => ({
        ...prev,
        error: 'Please sign in to use matchmaking',
      }));
      return;
    }

    try {
      const user = session?.user as ExtendedUser | undefined;
      const response = await matchmakingSDK.joinQueue({
        player_id: user?.id || 'mock-player-id',
        preferences: {
          game_id: 'cs2',
          game_mode: selectedGameMode,
          region: selectedRegion,
          skill_range: { min_mmr: 1000, max_mmr: 2000 },
          max_ping: 50,
          allow_cross_platform: false,
          tier: selectedTier,
          priority_boost: selectedTier === 'elite' || selectedTier === 'pro',
        },
        player_mmr: 1500,
      });

      if (!response) {
        setMatchmakingState((prev) => ({
          ...prev,
          error: 'Failed to join queue',
        }));
        return;
      }

      setMatchmakingState({
        isSearching: true,
        sessionId: response.session_id,
        queuePosition: response.queue_position,
        estimatedWait: response.estimated_wait_seconds,
        elapsedTime: 0,
        poolStats: null,
        error: null,
      });

      // Start polling for updates
      matchmakingSDK.startPolling(response.session_id, (status) => {
        setMatchmakingState((prev) => ({
          ...prev,
          queuePosition: status.queue_position || prev.queuePosition,
          estimatedWait: status.estimated_wait,
          elapsedTime: status.elapsed_time,
        }));
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to join matchmaking';
      setMatchmakingState((prev) => ({
        ...prev,
        error: errorMessage,
      }));
    }
  };

  const handleCancelMatchmaking = async () => {
    if (matchmakingState.sessionId) {
      try {
        await matchmakingSDK.leaveQueue(matchmakingState.sessionId);
        setMatchmakingState({
          isSearching: false,
          sessionId: null,
          queuePosition: 0,
          estimatedWait: 0,
          elapsedTime: 0,
          poolStats: null,
          error: null,
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to cancel matchmaking';
        setMatchmakingState((prev) => ({
          ...prev,
          error: errorMessage,
        }));
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen w-full bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-2"
        >
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            Competitive Matchmaking
          </h1>
          <p className="text-foreground/60 text-lg">
            Find skilled teammates and dominate the competition
          </p>
        </motion.div>

        {/* Tier Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-background/60 backdrop-blur-md">
            <CardHeader>
              <h2 className="text-2xl font-bold">Select Your Tier</h2>
            </CardHeader>
            <CardBody>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {Object.values(TIER_BENEFITS).map((tier) => (
                  <Card
                    key={tier.tier}
                    isPressable
                    isHoverable
                    className={`cursor-pointer transition-all ${
                      selectedTier === tier.tier
                        ? 'border-2 border-primary scale-105'
                        : 'border border-foreground/10'
                    }`}
                    onPress={() => setSelectedTier(tier.tier)}
                  >
                    <CardBody className="p-6 space-y-4">
                      <div className="flex items-center justify-between">
                        <Icon icon={tier.icon} width={32} className="text-primary" />
                        {tier.price > 0 && (
                          <Chip size="sm" variant="flat" color={tier.color}>
                            ${tier.price}/mo
                          </Chip>
                        )}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold">{tier.name}</h3>
                        <p className="text-sm text-foreground/60">
                          {tier.waitTimeReduction}% faster queue
                        </p>
                      </div>
                      <ul className="space-y-2">
                        {tier.features.map((feature, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm">
                            <Icon
                              icon="solar:check-circle-bold"
                              className="text-success mt-0.5 flex-shrink-0"
                              width={16}
                            />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </CardBody>
                  </Card>
                ))}
              </div>
            </CardBody>
          </Card>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Configuration */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2 space-y-6"
          >
            {/* Game Mode & Region */}
            <Card className="bg-background/60 backdrop-blur-md">
              <CardHeader>
                <h2 className="text-xl font-bold">Match Preferences</h2>
              </CardHeader>
              <CardBody className="space-y-4">
                <Select
                  label="Game Mode"
                  selectedKeys={[selectedGameMode]}
                  onChange={(e) => setSelectedGameMode(e.target.value)}
                  startContent={<Icon icon={gameMode.icon} width={20} />}
                >
                  {Object.values(GAME_MODES).map((mode) => (
                    <SelectItem key={mode.id} value={mode.id}>
                      {mode.name} - {mode.playerCount}
                    </SelectItem>
                  ))}
                </Select>

                <Select
                  label="Region"
                  selectedKeys={[selectedRegion]}
                  onChange={(e) => setSelectedRegion(e.target.value)}
                  startContent={<span className="text-xl">{region.icon}</span>}
                >
                  {Object.values(REGIONS).map((reg) => (
                    <SelectItem key={reg.id} value={reg.id}>
                      {reg.name} - {reg.avgPing}ms avg
                    </SelectItem>
                  ))}
                </Select>
              </CardBody>
            </Card>

            {/* Queue Status */}
            <AnimatePresence mode="wait">
              {matchmakingState.isSearching ? (
                <motion.div
                  key="searching"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                >
                  <Card className="bg-gradient-to-br from-primary/10 to-secondary/10 backdrop-blur-md border-2 border-primary/30">
                    <CardBody className="p-8 space-y-6">
                      <div className="text-center space-y-2">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                          className="inline-block"
                        >
                          <Icon
                            icon="solar:restart-bold"
                            width={48}
                            className="text-primary"
                          />
                        </motion.div>
                        <h3 className="text-2xl font-bold">Searching for Match...</h3>
                        <p className="text-foreground/60">
                          Queue Position: #{matchmakingState.queuePosition}
                        </p>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Time Elapsed</span>
                          <span className="font-mono font-bold">
                            {formatTime(matchmakingState.elapsedTime)}
                          </span>
                        </div>
                        <Progress
                          value={(matchmakingState.elapsedTime / matchmakingState.estimatedWait) * 100}
                          className="max-w-full"
                          color="primary"
                        />
                        <div className="flex justify-between text-sm text-foreground/60">
                          <span>Estimated Wait</span>
                          <span className="font-mono">
                            {formatTime(matchmakingState.estimatedWait)}
                          </span>
                        </div>
                      </div>

                      <Button
                        color="danger"
                        variant="flat"
                        size="lg"
                        className="w-full"
                        onPress={handleCancelMatchmaking}
                        startContent={<Icon icon="solar:close-circle-bold" width={20} />}
                      >
                        Cancel Search
                      </Button>
                    </CardBody>
                  </Card>
                </motion.div>
              ) : (
                <motion.div
                  key="idle"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                >
                  <Card className="bg-background/60 backdrop-blur-md">
                    <CardBody className="p-8">
                      <Button
                        color="primary"
                        size="lg"
                        className="w-full h-16 text-lg font-semibold"
                        onPress={handleStartMatchmaking}
                        startContent={<Icon icon="solar:play-bold" width={24} />}
                      >
                        Find Match
                      </Button>
                    </CardBody>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Right Column - Pool Stats */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="bg-background/60 backdrop-blur-md sticky top-4">
              <CardHeader className="flex items-center justify-between">
                <h2 className="text-xl font-bold">Queue Status</h2>
                <Badge
                  content={poolStats?.queue_health || 'loading'}
                  color={
                    poolStats?.queue_health === 'healthy'
                      ? 'success'
                      : poolStats?.queue_health === 'moderate'
                      ? 'warning'
                      : 'danger'
                  }
                  variant="flat"
                >
                  <Icon icon="solar:signal-bold" width={20} />
                </Badge>
              </CardHeader>
              <Divider />
              <CardBody className="space-y-6">
                {poolStats ? (
                  <>
                    {/* Total Players */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-foreground/60">Players Online</span>
                        <motion.span
                          key={poolStats.total_players}
                          initial={{ scale: 1.2 }}
                          animate={{ scale: 1 }}
                          className="text-2xl font-bold text-primary"
                        >
                          {poolStats.total_players}
                        </motion.span>
                      </div>
                      <Progress
                        value={(poolStats.total_players / 200) * 100}
                        color="primary"
                        className="max-w-full"
                      />
                    </div>

                    {/* Average Wait Time */}
                    <div className="flex items-center justify-between p-4 rounded-lg bg-foreground/5">
                      <div className="flex items-center gap-2">
                        <Icon icon="solar:clock-circle-bold" width={20} className="text-warning" />
                        <span className="text-sm">Avg Wait Time</span>
                      </div>
                      <span className="font-mono font-bold">
                        {formatTime(poolStats.average_wait_time_seconds)}
                      </span>
                    </div>

                    {/* Players by Tier */}
                    <div className="space-y-3">
                      <p className="text-sm font-semibold">Players by Tier</p>
                      {Object.entries(poolStats.players_by_tier).map(([tier, count]) => {
                        const tierInfo = TIER_BENEFITS[tier as MatchmakingTier];
                        return (
                          <div key={tier} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Icon icon={tierInfo.icon} width={16} className="text-primary" />
                              <span className="text-sm">{tierInfo.name}</span>
                            </div>
                            <Chip size="sm" variant="flat">
                              {count}
                            </Chip>
                          </div>
                        );
                      })}
                    </div>

                    {/* Last Update */}
                    <div className="text-center text-xs text-foreground/40">
                      Last updated: {new Date(poolStats.timestamp).toLocaleTimeString()}
                    </div>
                  </>
                ) : (
                  <div className="space-y-3">
                    <Skeleton className="h-8 rounded-lg" />
                    <Skeleton className="h-16 rounded-lg" />
                    <Skeleton className="h-32 rounded-lg" />
                  </div>
                )}
              </CardBody>
            </Card>
          </motion.div>
        </div>

        {/* Error Display */}
        <AnimatePresence>
          {matchmakingState.error && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card className="bg-danger/10 border border-danger/20">
                <CardBody className="flex flex-row items-center gap-3">
                  <Icon icon="solar:danger-circle-bold" width={24} className="text-danger" />
                  <p className="text-sm">{matchmakingState.error}</p>
                  <Button
                    size="sm"
                    variant="light"
                    onPress={() =>
                      setMatchmakingState((prev) => ({ ...prev, error: null }))
                    }
                  >
                    Dismiss
                  </Button>
                </CardBody>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

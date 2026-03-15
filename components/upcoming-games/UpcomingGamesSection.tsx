/**
 * UpcomingGamesSection Component
 * Landing page showcase section for upcoming and live games
 * Features live stats bar, countdown timers, animated cards, and game filtering
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Button, Chip } from '@nextui-org/react';
import { Icon } from '@iconify/react';
import { AnimatePresence, LazyMotion, domAnimation, m, useMotionValue, useTransform, animate } from 'framer-motion';
import { useRouter } from 'next/navigation';
import clsx from 'clsx';
import { Orbitron } from 'next/font/google';
import { useTheme } from 'next-themes';

import { useUpcomingGames } from '@/hooks/use-upcoming-games';
import { UpcomingGameCard } from './UpcomingGameCard';
import { GAME_CONFIGS } from '@/config/games';

const orbitron = Orbitron({ weight: ['400', '700', '900'], subsets: ['latin'] });

// Game filter tabs
const GAME_FILTERS: { id: string; label: string; icon: string }[] = [
  { id: 'all', label: 'All Games', icon: 'solar:gamepad-bold' },
  ...Object.entries(GAME_CONFIGS).slice(0, 5).map(([id, config]) => ({
    id,
    label: config.shortName,
    icon: config.icon,
  })),
];

// Animated counter component
function AnimatedCounter({ value, duration = 1 }: { value: number; duration?: number }) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.round(latest));
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const controls = animate(count, value, { duration });
    return controls.stop;
  }, [value, count, duration]);

  useEffect(() => {
    const unsubscribe = rounded.on('change', (latest) => setDisplayValue(latest));
    return unsubscribe;
  }, [rounded]);

  return <span>{displayValue}</span>;
}

// Live pulse indicator
function LivePulse({ className }: { className?: string }) {
  return (
    <span className={clsx('relative flex h-2 w-2', className)}>
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
    </span>
  );
}

interface UpcomingGamesSectionProps {
  className?: string;
}

export default function UpcomingGamesSection({ className }: UpcomingGamesSectionProps) {
  const router = useRouter();
  const { theme } = useTheme();
  const [activeFilter, setActiveFilter] = useState('all');
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  const { events, liveEvents, upcomingEvents, loading, stats } = useUpcomingGames({
    limit: 9,
    gameId: activeFilter === 'all' ? undefined : activeFilter,
    includeLive: true,
    refreshInterval: 10000,
  });

  const handleJoin = (lobbyId: string) => {
    router.push(`/match-making/lobby/${lobbyId}`);
  };

  const handleBrowseAll = () => {
    router.push('/match-making/lobbies');
  };

  const handleCreateLobby = () => {
    router.push('/match-making/create');
  };

  return (
    <LazyMotion features={domAnimation}>
      <section className={clsx(
        'relative w-full overflow-hidden',
        'bg-gradient-to-b from-background via-background/95 to-background',
        className
      )}>
        {/* Animated background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Grid */}
          <div
            className="absolute inset-0 opacity-[0.02]"
            style={{
              backgroundImage: `linear-gradient(to right, currentColor 1px, transparent 1px),
                               linear-gradient(to bottom, currentColor 1px, transparent 1px)`,
              backgroundSize: '80px 80px',
            }}
          />
          {/* Ambient glow */}
          <m.div
            animate={{ x: [0, 60, 0], y: [0, -40, 0] }}
            className="absolute top-10 right-1/4 w-96 h-96 bg-emerald-500/8 rounded-full blur-[140px]"
            transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
          />
          <m.div
            animate={{ x: [0, -50, 0], y: [0, 30, 0] }}
            className="absolute bottom-10 left-1/3 w-80 h-80 bg-[#FF4654]/8 dark:bg-[#DCFF37]/8 rounded-full blur-[120px]"
            transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
          />
        </div>

        <div className="relative container mx-auto px-6 py-20 lg:py-28">
          {/* Section Header */}
          <m.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            className="text-center mb-12"
            transition={{ duration: 0.6 }}
          >
            {/* Status indicator */}
            <div className="flex items-center justify-center gap-2 mb-6">
              <LivePulse />
              <span className={clsx(
                'text-xs font-bold uppercase tracking-[0.3em] text-emerald-500',
                orbitron.className
              )}>
                {liveEvents.length > 0 ? `${liveEvents.length} Live Now` : 'Games Available'}
              </span>
            </div>

            {/* Title */}
            <h2 className={clsx(
              'text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-tight mb-4',
              orbitron.className
            )}>
              <span className="text-foreground">Upcoming </span>
              <span className="bg-gradient-to-r from-emerald-400 via-emerald-500 dark:via-[#DCFF37] to-amber-400 bg-clip-text text-transparent">
                Games
              </span>
            </h2>

            <p className="text-lg text-default-500 max-w-2xl mx-auto mb-8">
              Don&apos;t miss the action. Join upcoming matches or spectate live games
              with real-time prize pools.
            </p>

            {/* Stats Bar */}
            <m.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-8 px-8 py-4 rounded-none border border-default-200/30 bg-default-100/30 backdrop-blur-sm"
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <div className="text-center">
                <div className={clsx('text-2xl font-black text-[#FF4654] dark:text-[#DCFF37]', orbitron.className)}>
                  <AnimatedCounter value={stats.totalPlayers} />
                </div>
                <div className="text-xs text-default-400 uppercase tracking-wider">Players In-Game</div>
              </div>
              <div className="w-px h-10 bg-default-200/50" />
              <div className="text-center">
                <div className={clsx('text-2xl font-black text-red-500', orbitron.className)}>
                  <AnimatedCounter value={stats.liveGames} />
                </div>
                <div className="text-xs text-default-400 uppercase tracking-wider">Live Games</div>
              </div>
              <div className="w-px h-10 bg-default-200/50" />
              <div className="text-center">
                <div className={clsx('text-2xl font-black text-emerald-500', orbitron.className)}>
                  <AnimatedCounter value={stats.openLobbies} />
                </div>
                <div className="text-xs text-default-400 uppercase tracking-wider">Open Lobbies</div>
              </div>
            </m.div>
          </m.div>

          {/* Game Filter Tabs */}
          <m.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-center justify-center gap-2 mb-10 flex-wrap"
            transition={{ delay: 0.2, duration: 0.4 }}
          >
            {GAME_FILTERS.map((filter) => (
              <Chip
                key={filter.id}
                className={clsx(
                  'cursor-pointer transition-all duration-200 text-sm',
                  activeFilter === filter.id
                    ? 'font-bold'
                    : 'opacity-60 hover:opacity-100'
                )}
                color={activeFilter === filter.id ? 'primary' : 'default'}
                radius="none"
                size="md"
                startContent={<Icon icon={filter.icon} width={14} />}
                variant={activeFilter === filter.id ? 'solid' : 'bordered'}
                onClick={() => setActiveFilter(filter.id)}
              >
                {filter.label}
              </Chip>
            ))}
          </m.div>

          {/* Live Games Section (if any) */}
          {liveEvents.length > 0 && (
            <m.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-10"
              transition={{ delay: 0.15, duration: 0.5 }}
            >
              <div className="flex items-center gap-2 mb-4">
                <LivePulse />
                <h3 className={clsx('text-lg font-bold uppercase tracking-wider text-red-500', orbitron.className)}>
                  Live Now
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                <AnimatePresence mode="popLayout">
                  {liveEvents.map((event, index) => (
                    <UpcomingGameCard
                      key={event.id}
                      event={event}
                      index={index}
                      isHovered={hoveredCard === event.id}
                      theme={theme}
                      onHover={setHoveredCard}
                      onJoin={handleJoin}
                    />
                  ))}
                </AnimatePresence>
              </div>
            </m.div>
          )}

          {/* Upcoming Games Grid */}
          <div className="mb-12">
            {upcomingEvents.length > 0 && liveEvents.length > 0 && (
              <div className="flex items-center gap-2 mb-4">
                <Icon icon="solar:clock-circle-bold" className="text-emerald-500" width={18} />
                <h3 className={clsx('text-lg font-bold uppercase tracking-wider text-default-600', orbitron.className)}>
                  Coming Up
                </h3>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              <AnimatePresence mode="popLayout">
                {loading ? (
                  // Loading skeletons
                  [...Array(6)].map((_, i) => (
                    <m.div
                      key={`skeleton-${i}`}
                      animate={{ opacity: 1 }}
                      className="h-56 rounded-none bg-default-100/50 animate-pulse"
                      exit={{ opacity: 0 }}
                      initial={{ opacity: 0 }}
                    />
                  ))
                ) : upcomingEvents.length > 0 ? (
                  upcomingEvents.map((event, index) => (
                    <UpcomingGameCard
                      key={event.id}
                      event={event}
                      index={index}
                      isHovered={hoveredCard === event.id}
                      theme={theme}
                      onHover={setHoveredCard}
                      onJoin={handleJoin}
                    />
                  ))
                ) : !loading && liveEvents.length === 0 ? (
                  // Empty state
                  <m.div
                    animate={{ opacity: 1 }}
                    className="col-span-full text-center py-16"
                    initial={{ opacity: 0 }}
                  >
                    <Icon
                      icon="solar:gamepad-no-charge-bold-duotone"
                      className="mx-auto mb-4 text-default-300"
                      width={64}
                    />
                    <h3 className={clsx('text-xl font-bold mb-2', orbitron.className)}>
                      No Games Available
                    </h3>
                    <p className="text-default-400 mb-6">
                      Be the first to create a lobby and start the action
                    </p>
                    <Button
                      className={clsx('font-bold uppercase tracking-wider', orbitron.className)}
                      color="primary"
                      radius="none"
                      size="lg"
                      startContent={<Icon icon="solar:add-circle-bold" width={20} />}
                      style={{
                        backgroundColor: theme === 'dark' ? '#DCFF37' : '#FF4654',
                        color: theme === 'dark' ? '#0a0a0a' : '#ffffff',
                      }}
                      onPress={handleCreateLobby}
                    >
                      Create Lobby
                    </Button>
                  </m.div>
                ) : null}
              </AnimatePresence>
            </div>
          </div>

          {/* CTA Buttons */}
          {(events.length > 0 || !loading) && (
            <m.div
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
              initial={{ opacity: 0, y: 20 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              <Button
                className={clsx(
                  'h-14 px-10 text-base font-black uppercase tracking-wider',
                  orbitron.className
                )}
                color="primary"
                endContent={<Icon icon="solar:add-circle-bold" width={22} />}
                radius="none"
                size="lg"
                style={{
                  backgroundColor: theme === 'dark' ? '#DCFF37' : '#FF4654',
                  color: theme === 'dark' ? '#0a0a0a' : '#ffffff',
                  clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%)',
                }}
                onPress={handleCreateLobby}
              >
                Create Lobby
              </Button>
              <Button
                className={clsx(
                  'h-14 px-10 text-base font-bold uppercase tracking-wider border-2',
                  orbitron.className
                )}
                endContent={<Icon icon="solar:alt-arrow-right-linear" width={22} />}
                radius="none"
                size="lg"
                variant="bordered"
                onPress={handleBrowseAll}
              >
                Browse All Games
              </Button>
            </m.div>
          )}
        </div>
      </section>
    </LazyMotion>
  );
}

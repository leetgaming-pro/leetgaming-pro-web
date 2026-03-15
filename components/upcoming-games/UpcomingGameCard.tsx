/**
 * UpcomingGameCard Component
 * Individual card for an upcoming/live game event
 * Features countdown timer, player slots, prize pool, and game branding
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Chip, Progress, Avatar, AvatarGroup, Button } from '@nextui-org/react';
import { Icon } from '@iconify/react';
import { LazyMotion, domAnimation, m } from 'framer-motion';
import clsx from 'clsx';
import { Orbitron, Electrolize } from 'next/font/google';

import type { UpcomingGameEvent } from '@/types/replay-api/upcoming-games.types';
import { EVENT_STATUS_CONFIG, getGameAccent, getCountdownParts } from '@/types/replay-api/upcoming-games.types';
import { GAME_CONFIGS } from '@/config/games';
import type { GameId } from '@/types/games';

const orbitron = Orbitron({ weight: ['400', '700', '900'], subsets: ['latin'] });
const electrolize = Electrolize({ weight: '400', subsets: ['latin'] });

// Lobby type icons
const LOBBY_TYPE_ICONS: Record<string, string> = {
  ranked: 'solar:medal-star-bold',
  tournament: 'solar:cup-star-bold',
  casual: 'solar:gamepad-bold',
  custom: 'solar:settings-bold',
  practice: 'solar:target-bold',
};

interface UpcomingGameCardProps {
  event: UpcomingGameEvent;
  index: number;
  theme?: string;
  isHovered: boolean;
  onHover: (id: string | null) => void;
  onJoin: (id: string) => void;
}

/** Live pulse indicator */
function LivePulse({ className }: { className?: string }) {
  return (
    <span className={clsx('relative flex h-2 w-2', className)}>
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
      <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
    </span>
  );
}

/** Countdown display with individual digit blocks */
interface CountdownTimerProps {
  targetDate: string;
  compact?: boolean;
  theme?: string;
}

function CountdownTimer({ targetDate, compact = false, theme }: CountdownTimerProps) {
  const [parts, setParts] = useState(getCountdownParts(targetDate));

  useEffect(() => {
    const interval = setInterval(() => {
      setParts(getCountdownParts(targetDate));
    }, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  if (parts.total <= 0) {
    return (
      <div className="flex items-center gap-1.5">
        <LivePulse />
        <span className={clsx('text-xs font-bold text-red-500 uppercase', orbitron.className)}>
          Starting Now
        </span>
      </div>
    );
  }

  if (compact) {
    const display = parts.days > 0
      ? `${parts.days}d ${parts.hours}h`
      : parts.hours > 0
        ? `${parts.hours}h ${parts.minutes}m`
        : `${parts.minutes}m ${parts.seconds}s`;

    return (
      <span className={clsx('text-xs font-bold', theme === 'dark' ? 'text-[#DCFF37]' : 'text-[#FF4654]', orbitron.className)}>
        {display}
      </span>
    );
  }

  return (
    <div className="flex items-center gap-1">
      {parts.days > 0 && (
        <CountdownBlock value={parts.days} label="D" theme={theme} />
      )}
      <CountdownBlock value={parts.hours} label="H" theme={theme} />
      <span className="text-default-400 text-xs font-bold">:</span>
      <CountdownBlock value={parts.minutes} label="M" theme={theme} />
      <span className="text-default-400 text-xs font-bold">:</span>
      <CountdownBlock value={parts.seconds} label="S" theme={theme} />
    </div>
  );
}

function CountdownBlock({ value, label, theme }: { value: number; label: string; theme?: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className={clsx(
        'bg-default-100/80 border border-default-200/30 px-1.5 py-0.5 min-w-[28px] text-center',
        orbitron.className
      )}>
        <span className={clsx('text-sm font-bold', theme === 'dark' ? 'text-[#DCFF37]' : 'text-[#FF4654]')}>
          {String(value).padStart(2, '0')}
        </span>
      </div>
      <span className="text-[8px] text-default-400 uppercase mt-0.5">{label}</span>
    </div>
  );
}

export function UpcomingGameCard({
  event,
  index,
  theme,
  isHovered,
  onHover,
  onJoin,
}: UpcomingGameCardProps) {
  const gameConfig = event.game_id ? GAME_CONFIGS[event.game_id as GameId] : null;
  const accent = getGameAccent(event.game_id);
  const statusConfig = EVENT_STATUS_CONFIG[event.status];
  const fillPercentage = (event.current_players / event.max_players) * 100;
  const isFull = event.current_players >= event.max_players;
  const isLive = event.status === 'live';
  const typeIcon = LOBBY_TYPE_ICONS[event.type] || 'solar:gamepad-bold';

  // Player avatars
  const playerAvatars = event.player_slots?.slice(0, 4).map((slot, i) => ({
    name: slot.player_name || `Player ${i + 1}`,
    src: slot.player_id ? `https://i.pravatar.cc/150?u=${slot.player_id}` : undefined,
  })) || [];

  return (
    <LazyMotion features={domAnimation}>
      <m.div
        animate={{ opacity: 1, y: 0 }}
        className="relative group"
        exit={{ opacity: 0, scale: 0.95 }}
        initial={{ opacity: 0, y: 30 }}
        layout
        transition={{ delay: index * 0.08, duration: 0.4, type: 'spring' }}
        onMouseEnter={() => onHover(event.id)}
        onMouseLeave={() => onHover(null)}
      >
        {/* Hover glow effect */}
        <m.div
          animate={{ opacity: isHovered ? 1 : 0 }}
          className={clsx('absolute -inset-1 rounded-none blur-xl transition-opacity', accent.glow)}
          style={{ backgroundColor: accent.primary + '30' }}
        />

        {/* Live glow for active games */}
        {isLive && (
          <m.div
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            className="absolute -inset-0.5 rounded-none"
            style={{
              background: `linear-gradient(135deg, ${accent.primary}40, transparent, ${accent.secondary}40)`,
            }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />
        )}

        {/* Card */}
        <div
          className={clsx(
            'relative h-full rounded-none overflow-hidden cursor-pointer',
            'border border-default-200/30 hover:border-default-400/50',
            'bg-gradient-to-br from-default-100/80 to-default-50/50 backdrop-blur-sm',
            'transition-all duration-300',
            isHovered && 'transform scale-[1.02]',
            isLive && 'border-red-500/40'
          )}
          onClick={() => onJoin(event.source_id)}
        >
          {/* Game banner with gradient */}
          <div
            className="relative h-16 overflow-hidden"
            style={{
              background: `linear-gradient(135deg, ${accent.primary}90 0%, ${accent.secondary}70 50%, transparent 100%)`,
            }}
          >
            {/* Diagonal stripe pattern */}
            <div
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage: `repeating-linear-gradient(
                  -45deg,
                  transparent,
                  transparent 10px,
                  rgba(255,255,255,0.1) 10px,
                  rgba(255,255,255,0.1) 20px
                )`,
              }}
            />

            {/* Game info overlay */}
            <div className="absolute inset-0 flex items-center justify-between px-4">
              <div className="flex items-center gap-2">
                {gameConfig && (
                  <div className="p-1.5 bg-black/30 backdrop-blur-sm rounded-none">
                    <Icon className="text-white" icon={gameConfig.icon} width={18} />
                  </div>
                )}
                <div>
                  <div className={clsx('text-white font-black uppercase tracking-wider text-sm', orbitron.className)}>
                    {gameConfig?.shortName || event.game_id?.toUpperCase()}
                  </div>
                  <div className="text-white/70 text-[10px] uppercase">
                    {event.game_mode || 'Competitive'}
                  </div>
                </div>
              </div>

              {/* Status badge */}
              <div className="flex items-center gap-1.5">
                {statusConfig.pulse && <LivePulse />}
                <Chip
                  className="text-tiny font-bold uppercase"
                  color={statusConfig.color}
                  radius="none"
                  size="sm"
                  startContent={<Icon icon={statusConfig.icon} width={12} />}
                  variant={isLive ? 'solid' : 'flat'}
                >
                  {statusConfig.label}
                </Chip>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-4">
            {/* Title + countdown row */}
            <div className="flex items-start justify-between gap-2 mb-3">
              <h3 className={clsx('text-base font-bold line-clamp-1 flex-1', electrolize.className)}>
                {event.title}
              </h3>
              {event.expires_at && !isLive && (
                <CountdownTimer targetDate={event.expires_at} compact theme={theme} />
              )}
            </div>

            {/* Tags row */}
            <div className="flex flex-wrap gap-1.5 mb-3">
              <Chip
                className="text-tiny"
                radius="none"
                size="sm"
                startContent={<Icon icon={typeIcon} width={11} />}
                variant="flat"
              >
                {event.type || 'Custom'}
              </Chip>
              <Chip
                className="text-tiny"
                radius="none"
                size="sm"
                startContent={<Icon icon="solar:map-point-bold" width={11} />}
                variant="flat"
              >
                {event.region?.toUpperCase() || 'ANY'}
              </Chip>
              {event.entry_fee_cents && event.entry_fee_cents > 0 && (
                <Chip
                  className="text-tiny"
                  color="warning"
                  radius="none"
                  size="sm"
                  startContent={<Icon icon="solar:wallet-bold" width={11} />}
                  variant="flat"
                >
                  ${(event.entry_fee_cents / 100).toFixed(2)}
                </Chip>
              )}
              {event.is_featured && (
                <Chip
                  className="text-tiny"
                  color="warning"
                  radius="none"
                  size="sm"
                  startContent={<Icon icon="solar:star-bold" width={11} />}
                  variant="solid"
                >
                  Featured
                </Chip>
              )}
            </div>

            {/* Prize pool (if applicable) */}
            {event.total_pot_cents && event.total_pot_cents > 0 && (
              <div className="flex items-center gap-2 mb-3 px-2 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-none">
                <Icon icon="solar:cup-star-bold" className="text-amber-500" width={16} />
                <span className={clsx('text-sm font-bold text-amber-500', orbitron.className)}>
                  ${(event.total_pot_cents / 100).toFixed(2)}
                </span>
                <span className="text-xs text-default-400">Prize Pool</span>
              </div>
            )}

            {/* Player progress */}
            <div className="mb-3">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  {playerAvatars.length > 0 && (
                    <AvatarGroup isBordered max={3} size="sm" total={event.current_players > 3 ? event.current_players - 3 : 0}>
                      {playerAvatars.map((avatar, i) => (
                        <Avatar key={i} className="w-5 h-5" name={avatar.name} src={avatar.src} />
                      ))}
                    </AvatarGroup>
                  )}
                </div>
                <span className={clsx(
                  'text-xs font-bold',
                  isFull ? 'text-red-500' : (theme === 'dark' ? 'text-[#DCFF37]' : 'text-[#FF4654]'),
                  orbitron.className
                )}>
                  {event.current_players}/{event.max_players}
                </span>
              </div>
              <Progress
                aria-label="Player count"
                classNames={{
                  track: 'bg-default-200/30',
                  indicator: isFull
                    ? 'bg-red-500'
                    : theme === 'dark'
                      ? 'bg-gradient-to-r from-[#DCFF37] to-[#FF4654]'
                      : 'bg-gradient-to-r from-[#FF4654] to-[#34445C]',
                }}
                radius="none"
                size="sm"
                value={fillPercentage}
              />
            </div>

            {/* Countdown or Join button */}
            {isLive ? (
              <Button
                className={clsx('w-full font-bold uppercase tracking-wider', orbitron.className)}
                color="danger"
                radius="none"
                size="sm"
                startContent={<LivePulse />}
              >
                Watch Live
              </Button>
            ) : (
              <Button
                className={clsx('w-full font-bold uppercase tracking-wider', orbitron.className)}
                color={isFull ? 'default' : 'primary'}
                isDisabled={isFull}
                radius="none"
                size="sm"
                style={!isFull ? { backgroundColor: accent.primary, color: '#000000' } : undefined}
              >
                {isFull ? 'Lobby Full' : 'Join Now'}
              </Button>
            )}
          </div>

          {/* Hover accent line */}
          <m.div
            animate={{ scaleX: isHovered ? 1 : 0 }}
            className="absolute bottom-0 left-0 right-0 h-1"
            initial={{ scaleX: 0 }}
            style={{ backgroundColor: isLive ? '#FF4654' : accent.primary }}
            transition={{ duration: 0.2 }}
          />
        </div>
      </m.div>
    </LazyMotion>
  );
}

export default UpcomingGameCard;

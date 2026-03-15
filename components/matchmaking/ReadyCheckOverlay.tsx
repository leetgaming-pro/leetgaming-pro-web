'use client';

/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║  🎮 LEETGAMING — READY CHECK OVERLAY                                         ║
 * ║══════════════════════════════════════════════════════════════════════════════║
 * ║                                                                              ║
 * ║  The hero moment of competitive matchmaking — full-screen esports modal      ║
 * ║  with angular clip-path corners, brand gradients, SVG countdown ring,        ║
 * ║  staggered player card reveals, sound design, haptic feedback,               ║
 * ║  and celebration effects on all-ready state.                                 ║
 * ║                                                                              ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */

import React, { useCallback, useMemo, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Icon } from '@iconify/react';
import { cn } from '@nextui-org/react';
import { Avatar } from '@nextui-org/react';
import { useCountdown } from '@/hooks/use-countdown';
import { useSound } from '@/hooks/use-sound';
import { EsportsModal } from '@/components/ui/esports-modal';
import { EsportsButton } from '@/components/ui/esports-button';
import { SuccessConfetti } from '@/components/ui/success-confetti';
import { electrolize } from '@/config/fonts';

/** Player status in the ready check flow */
type ReadyCheckPlayerStatus = 'pending' | 'confirmed' | 'declined' | 'timed_out';

/** Player information for the ready check overlay */
export interface ReadyCheckPlayer {
  id: string;
  displayName: string;
  avatarUrl?: string;
  status: ReadyCheckPlayerStatus;
}

/** Props for the ReadyCheckOverlay component */
export interface ReadyCheckOverlayProps {
  /** Whether the overlay is visible */
  isOpen: boolean;
  /** The lobby ID this ready check belongs to */
  lobbyId: string;
  /** Game name to display */
  gameName: string;
  /** Competitive tier (e.g., "Diamond", "Gold") */
  tier?: string;
  /** Prize pool amount as display string */
  prizePool?: string;
  /** Total timeout in seconds for the ready check */
  timeoutSeconds: number;
  /** Array of all players in the lobby */
  players: ReadyCheckPlayer[];
  /** Current user's player ID */
  currentPlayerId: string;
  /** Called when the current player confirms readiness */
  onConfirm: () => void;
  /** Called when the current player declines */
  onDecline: () => void;
  /** Called when the countdown expires */
  onTimeout: () => void;
}

/**
 * ReadyCheckOverlay renders a full-screen esports-branded modal with:
 * - Angular clip-path corners and scan-line overlays
 * - Circular countdown timer with brand color phases
 * - Staggered player card reveals with status animations
 * - Sound design and haptic feedback
 * - Confetti celebration on all-ready state
 * - Electrolize display font for headings
 *
 * @example
 * ```tsx
 * <ReadyCheckOverlay
 *   isOpen={readyCheckActive}
 *   lobbyId={lobby.id}
 *   gameName="CS2"
 *   timeoutSeconds={30}
 *   players={players}
 *   currentPlayerId={user.id}
 *   onConfirm={handleConfirm}
 *   onDecline={handleDecline}
 *   onTimeout={handleTimeout}
 * />
 * ```
 */
export function ReadyCheckOverlay({
  isOpen,
  lobbyId,
  gameName,
  tier,
  prizePool,
  timeoutSeconds,
  players,
  currentPlayerId,
  onConfirm,
  onDecline,
  onTimeout,
}: ReadyCheckOverlayProps) {
  const sound = useSound();

  const { remaining, progress, isExpired, formattedTime } = useCountdown({
    totalSeconds: timeoutSeconds,
    onComplete: onTimeout,
    autoStart: isOpen,
  });

  // ── Audio cues ────────────────────────────────────────────────────────
  useEffect(() => {
    if (isOpen) {
      sound.preload('match-found', 'ready-confirm', 'ready-decline', 'countdown-urgent', 'all-ready');
      sound.playWithHaptic('match-found');
    }
    return () => {
      sound.stop('match-found');
    };
  }, [isOpen, sound]);

  // Urgent countdown ticks (last 5 seconds)
  useEffect(() => {
    if (isOpen && remaining <= 5 && remaining > 0 && !isExpired) {
      sound.play('countdown-urgent');
    }
  }, [isOpen, remaining, isExpired, sound]);

  const currentPlayer = useMemo(
    () => players.find((p) => p.id === currentPlayerId),
    [players, currentPlayerId],
  );

  const hasResponded = currentPlayer?.status !== 'pending';
  const confirmedCount = players.filter((p) => p.status === 'confirmed').length;
  const allConfirmed = confirmedCount === players.length && players.length > 0;

  // Play sounds on status changes
  useEffect(() => {
    if (allConfirmed && isOpen) {
      sound.playWithHaptic('all-ready');
    }
  }, [allConfirmed, isOpen, sound]);

  const handleConfirm = useCallback(() => {
    sound.playWithHaptic('ready-confirm');
    onConfirm();
  }, [onConfirm, sound]);

  const handleDecline = useCallback(() => {
    sound.playWithHaptic('ready-decline');
    onDecline();
  }, [onDecline, sound]);

  // ── SVG Timer ─────────────────────────────────────────────────────────
  const RADIUS = 54;
  const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

  const getTimerColor = useCallback(() => {
    if (progress > 0.5) return '#DCFF37'; // Lime — comfortable
    if (progress > 0.25) return '#FFC700'; // Gold — warning
    return '#FF4654'; // Orange/red — urgent
  }, [progress]);

  const isUrgent = progress <= 0.25;

  return (
    <>
      {/* Confetti on all-ready */}
      <SuccessConfetti
        trigger={allConfirmed && isOpen}
        duration={3000}
        count={60}
        colors={['#DCFF37', '#FFC700', '#17C964', '#34445C', '#FF4654']}
      />

      <EsportsModal
        isOpen={isOpen}
        isDismissable={false}
        hideCloseButton
        size="lg"
        icon="solar:gameboy-bold"
        aria-label="Match found — ready check"
        headerContent={
          <div className="leet-modal-title w-full">
            <div className="leet-modal-icon">
              <Icon icon="solar:gameboy-bold" width={24} />
            </div>
            <div className="flex-1">
              <h2
                className={cn(
                  'text-lg font-bold uppercase tracking-[0.2em]',
                  electrolize.className,
                )}
              >
                Match Found
              </h2>
              <p className="text-xs text-[#34445C]/60 dark:text-[#F5F0E1]/60 uppercase tracking-wider mt-0.5">
                {gameName}
                {tier && <span className="ml-2 text-[#FFC700]">• {tier}</span>}
              </p>
            </div>
            {prizePool && (
              <div
                className="px-3 py-1 text-xs font-bold uppercase tracking-wide bg-[#17C964]/10 text-[#17C964]"
                style={{
                  clipPath:
                    'polygon(0 0, 100% 0, 100% calc(100% - 4px), calc(100% - 4px) 100%, 0 100%)',
                }}
              >
                <Icon icon="solar:cup-star-bold" width={14} className="inline mr-1 -mt-0.5" />
                {prizePool}
              </div>
            )}
          </div>
        }
      >
        {/* ── Countdown Timer ──────────────────────────────────────────── */}
        <div className="flex justify-center my-6">
          <motion.div
            className="relative w-36 h-36"
            animate={isUrgent ? { scale: [1, 1.03, 1] } : undefined}
            transition={isUrgent ? { repeat: Infinity, duration: 1 } : undefined}
          >
            <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120" role="img" aria-label={`${formattedTime} remaining to accept match`}>
              {/* Background ring */}
              <circle
                cx="60"
                cy="60"
                r={RADIUS}
                fill="none"
                stroke="currentColor"
                strokeWidth="4"
                className="text-[#34445C]/20 dark:text-[#F5F0E1]/10"
              />
              {/* Progress ring */}
              <motion.circle
                cx="60"
                cy="60"
                r={RADIUS}
                fill="none"
                strokeWidth="5"
                strokeLinecap="square"
                strokeDasharray={CIRCUMFERENCE}
                strokeDashoffset={CIRCUMFERENCE * (1 - progress)}
                stroke={getTimerColor()}
                className="transition-colors duration-500"
                style={{
                  filter: isUrgent ? `drop-shadow(0 0 8px ${getTimerColor()})` : undefined,
                }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center" aria-live="polite" aria-atomic="true">
              <span
                className={cn(
                  'text-3xl font-bold font-mono',
                  'text-[#34445C] dark:text-[#F5F0E1]',
                )}
              >
                {formattedTime}
              </span>
              <span className="text-[10px] uppercase tracking-wider text-[#34445C]/40 dark:text-[#F5F0E1]/40 mt-1">
                Remaining
              </span>
            </div>
          </motion.div>
        </div>

        {/* ── Player Grid ──────────────────────────────────────────────── */}
        <motion.div
          className="grid grid-cols-2 gap-2 my-4"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.08, delayChildren: 0.2 } },
          }}
        >
          {players.map((player) => (
            <PlayerCard
              key={player.id}
              player={player}
              isCurrentPlayer={player.id === currentPlayerId}
            />
          ))}
        </motion.div>

        {/* ── Progress Bar ─────────────────────────────────────────────── */}
        <div className="my-3">
          <div className="flex justify-between text-xs uppercase tracking-wider mb-1.5">
            <span className="text-[#34445C]/50 dark:text-[#F5F0E1]/50 font-medium">
              Players Ready
            </span>
            <span className={cn(
              'font-bold font-mono',
              allConfirmed ? 'text-[#17C964]' : 'text-[#34445C] dark:text-[#F5F0E1]',
            )}>
              {confirmedCount}/{players.length}
            </span>
          </div>
          <div
            className="leet-modal-progress"
            role="progressbar"
            aria-valuenow={confirmedCount}
            aria-valuemin={0}
            aria-valuemax={players.length}
            aria-label={`${confirmedCount} of ${players.length} players ready`}
          >
            <motion.div
              className="leet-modal-progress-bar"
              initial={{ width: '0%' }}
              animate={{
                width: `${(confirmedCount / Math.max(players.length, 1)) * 100}%`,
              }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              style={{
                background: allConfirmed
                  ? 'linear-gradient(90deg, #17C964, #DCFF37)'
                  : 'linear-gradient(90deg, #DCFF37, #34445C)',
              }}
            />
          </div>
        </div>

        {/* ── Action Buttons ───────────────────────────────────────────── */}
        {!hasResponded && !isExpired && (
          <motion.div
            className="flex gap-3 mt-5"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, type: 'spring', stiffness: 300, damping: 25 }}
          >
            <EsportsButton
              variant="danger"
              size="lg"
              fullWidth
              onClick={handleDecline}
              startContent={<Icon icon="solar:close-circle-bold" width={20} />}
            >
              Decline
            </EsportsButton>
            <EsportsButton
              variant="matchmaking"
              size="lg"
              fullWidth
              glow
              onClick={handleConfirm}
              startContent={<Icon icon="solar:shield-check-bold" width={20} />}
            >
              Accept Match
            </EsportsButton>
          </motion.div>
        )}

        {/* ── Waiting state ────────────────────────────────────────────── */}
        {hasResponded && !allConfirmed && (
          <motion.div
            className="text-center mt-5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            aria-live="polite"
          >
            <motion.div
              animate={{ scale: [1, 1.08, 1] }}
              transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#34445C]/5 dark:bg-[#DCFF37]/5"
              style={{
                clipPath:
                  'polygon(0 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%)',
              }}
            >
              <Icon
                icon="solar:hourglass-bold-duotone"
                width={16}
                className="text-[#34445C]/50 dark:text-[#DCFF37]/50"
              />
              <span className="text-sm text-[#34445C]/60 dark:text-[#F5F0E1]/60">
                Waiting for other players...
              </span>
            </motion.div>
          </motion.div>
        )}

        {/* ── All Ready state ──────────────────────────────────────────── */}
        {allConfirmed && (
          <motion.div
            className="text-center mt-5 space-y-2"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            aria-live="assertive"
          >
            <div className="inline-flex items-center gap-2">
              <motion.div
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Icon icon="solar:shield-check-bold" width={24} className="text-[#17C964]" />
              </motion.div>
              <span
                className={cn(
                  'text-lg font-bold uppercase tracking-wider text-[#17C964]',
                  electrolize.className,
                )}
              >
                All Players Ready!
              </span>
            </div>
            <p className="text-xs text-[#34445C]/50 dark:text-[#F5F0E1]/50 uppercase tracking-wider">
              Preparing game server...
            </p>
          </motion.div>
        )}
      </EsportsModal>
    </>
  );
}

// ── Player Card Sub-Component ───────────────────────────────────────────────

function PlayerCard({
  player,
  isCurrentPlayer,
}: {
  player: ReadyCheckPlayer;
  isCurrentPlayer: boolean;
}) {
  const statusConfig = {
    pending: {
      borderClass: 'border-[#34445C]/15 dark:border-[#F5F0E1]/10',
      bgClass: 'bg-[#34445C]/5 dark:bg-[#F5F0E1]/5',
      icon: null,
      label: 'Waiting',
      labelClass: 'text-[#34445C]/40 dark:text-[#F5F0E1]/40',
      ringClass: '',
    },
    confirmed: {
      borderClass: 'border-[#17C964]/30',
      bgClass: 'bg-[#17C964]/5',
      icon: 'solar:check-circle-bold',
      label: 'Ready',
      labelClass: 'text-[#17C964]',
      ringClass: 'ring-2 ring-[#17C964] ring-offset-1 ring-offset-transparent',
    },
    declined: {
      borderClass: 'border-[#FF4654]/30',
      bgClass: 'bg-[#FF4654]/5',
      icon: 'solar:close-circle-bold',
      label: 'Declined',
      labelClass: 'text-[#FF4654]',
      ringClass: 'ring-2 ring-[#FF4654] ring-offset-1 ring-offset-transparent',
    },
    timed_out: {
      borderClass: 'border-[#FFC700]/30',
      bgClass: 'bg-[#FFC700]/5',
      icon: 'solar:alarm-bold',
      label: 'Timed Out',
      labelClass: 'text-[#FFC700]',
      ringClass: 'ring-2 ring-[#FFC700] ring-offset-1 ring-offset-transparent',
    },
  };

  const config = statusConfig[player.status];

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 12, scale: 0.95 },
        visible: { opacity: 1, y: 0, scale: 1 },
      }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className={cn(
        'flex items-center gap-2.5 p-2.5 border',
        'transition-all duration-300',
        config.borderClass,
        config.bgClass,
      )}
      style={{
        clipPath:
          'polygon(0 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%)',
      }}
    >
      <Avatar
        src={player.avatarUrl}
        name={player.displayName}
        size="sm"
        className={cn('flex-shrink-0', config.ringClass)}
        style={{
          clipPath:
            'polygon(0 0, 100% 0, 100% calc(100% - 3px), calc(100% - 3px) 100%, 0 100%)',
        }}
      />
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold truncate text-[#34445C] dark:text-[#F5F0E1]">
          {player.displayName}
          {isCurrentPlayer && (
            <span className="text-[10px] text-[#DCFF37] ml-1 uppercase">(You)</span>
          )}
        </p>
        <div className="flex items-center gap-1 mt-0.5">
          {config.icon && (
            <AnimatePresence>
              <motion.div
                initial={{ scale: 0, rotate: -90 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 500, damping: 15 }}
              >
                <Icon icon={config.icon} width={12} className={config.labelClass} />
              </motion.div>
            </AnimatePresence>
          )}
          {player.status === 'pending' && (
            <motion.div
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            >
              <Icon icon="solar:hourglass-line-duotone" width={12} className={config.labelClass} />
            </motion.div>
          )}
          <span className={cn('text-[10px] uppercase tracking-wider font-medium', config.labelClass)}>
            {config.label}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

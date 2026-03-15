'use client';

/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║  🎮 LEETGAMING — ESPORTS NOTIFICATION CARD                                   ║
 * ║══════════════════════════════════════════════════════════════════════════════║
 * ║                                                                              ║
 * ║  Award-winning notification card with angular clip-path aesthetic,           ║
 * ║  type-specific accent glows, compact mode for popover, swipe-to-delete,     ║
 * ║  rich metadata display, and premium hover transitions.                       ║
 * ║                                                                              ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */

import React, { type ReactNode, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon } from '@iconify/react';
import { cn } from '@nextui-org/react';
import { Avatar } from '@nextui-org/react';
import { useTheme } from 'next-themes';

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  Types                                                                     */
/* ═══════════════════════════════════════════════════════════════════════════ */

export type EsportsNotificationType =
  | 'match'
  | 'team'
  | 'friend'
  | 'system'
  | 'achievement'
  | 'message'
  | 'ready-check'
  | 'connection';

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  Type Visual Config                                                        */
/* ═══════════════════════════════════════════════════════════════════════════ */

interface TypeConfig {
  icon: string;
  label: string;
  accentColor: string;       // border-l color class
  accentBg: string;          // subtle bg for unread
  glowColor: string;         // shadow glow
  iconBg: string;            // icon container bg + text
  accentHex: string;         // raw hex for dynamic styles (dark mode)
  lightAccentHex?: string;   // raw hex for light mode (falls back to accentHex)
  gradientFrom: string;      // gradient start
}

const TYPE_CONFIGS: Record<EsportsNotificationType, TypeConfig> = {
  match: {
    icon: 'solar:gameboy-bold',
    label: 'Match',
    accentColor: 'border-l-leet-orange dark:border-l-leet-lime',
    accentBg: 'bg-leet-orange/5 dark:bg-leet-lime/5',
    glowColor: 'shadow-leet-orange/20 dark:shadow-leet-lime/20',
    iconBg: 'bg-leet-orange/10 text-leet-orange dark:bg-leet-lime/10 dark:text-leet-lime',
    accentHex: '#DCFF37',
    lightAccentHex: '#FF4654',
    gradientFrom: 'from-leet-orange dark:from-leet-lime',
  },
  team: {
    icon: 'solar:users-group-rounded-bold',
    label: 'Team',
    accentColor: 'border-l-leet-navy dark:border-l-leet-lime',
    accentBg: 'bg-leet-navy/5 dark:bg-leet-lime/5',
    glowColor: 'shadow-leet-navy/20 dark:shadow-leet-lime/20',
    iconBg: 'bg-leet-navy/10 dark:bg-leet-lime/10 text-leet-navy dark:text-leet-lime',
    accentHex: '#DCFF37',
    lightAccentHex: '#34445C',
    gradientFrom: 'from-leet-navy dark:from-leet-lime',
  },
  friend: {
    icon: 'solar:user-plus-bold',
    label: 'Friend',
    accentColor: 'border-l-[#17C964]',
    accentBg: 'bg-[#17C964]/5',
    glowColor: 'shadow-[#17C964]/20',
    iconBg: 'bg-[#17C964]/10 text-[#17C964]',
    accentHex: '#17C964',
    gradientFrom: 'from-[#17C964]',
  },
  system: {
    icon: 'solar:bell-bold',
    label: 'System',
    accentColor: 'border-l-leet-gold',
    accentBg: 'bg-leet-gold/5',
    glowColor: 'shadow-leet-gold/20',
    iconBg: 'bg-leet-gold/10 text-leet-gold',
    accentHex: '#FFC700',
    gradientFrom: 'from-leet-gold',
  },
  achievement: {
    icon: 'solar:cup-star-bold',
    label: 'Achievement',
    accentColor: 'border-l-leet-gold',
    accentBg: 'bg-leet-gold/5',
    glowColor: 'shadow-leet-gold/20',
    iconBg: 'bg-leet-gold/10 text-leet-gold',
    accentHex: '#FFC700',
    gradientFrom: 'from-leet-gold',
  },
  message: {
    icon: 'solar:chat-round-bold',
    label: 'Message',
    accentColor: 'border-l-leet-navy dark:border-l-leet-cream',
    accentBg: 'bg-leet-navy/5 dark:bg-leet-cream/5',
    glowColor: 'shadow-leet-navy/20',
    iconBg: 'bg-leet-navy/10 dark:bg-leet-cream/10 text-leet-navy dark:text-leet-cream',
    accentHex: '#F5F0E1',
    gradientFrom: 'from-leet-navy dark:from-leet-cream',
  },
  'ready-check': {
    icon: 'solar:shield-check-bold',
    label: 'Ready Check',
    accentColor: 'border-l-leet-orange dark:border-l-leet-lime',
    accentBg: 'bg-leet-orange/5 dark:bg-leet-lime/5',
    glowColor: 'shadow-leet-orange/30 dark:shadow-leet-lime/30',
    iconBg: 'bg-leet-orange/10 text-leet-orange dark:bg-leet-lime/10 dark:text-leet-lime',
    accentHex: '#DCFF37',
    lightAccentHex: '#FF4654',
    gradientFrom: 'from-leet-orange dark:from-leet-lime',
  },
  connection: {
    icon: 'solar:server-bold',
    label: 'Connection',
    accentColor: 'border-l-[#17C964]',
    accentBg: 'bg-[#17C964]/5',
    glowColor: 'shadow-[#17C964]/30',
    iconBg: 'bg-[#17C964]/10 text-[#17C964]',
    accentHex: '#17C964',
    gradientFrom: 'from-[#17C964]',
  },
};

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  Props                                                                     */
/* ═══════════════════════════════════════════════════════════════════════════ */

export interface EsportsNotificationAction {
  label: string;
  variant: 'accept' | 'decline' | 'neutral';
  onClick: () => void;
  loading?: boolean;
}

export interface EsportsNotificationCardProps {
  type: EsportsNotificationType;
  title: string;
  message: string;
  timestamp?: string;
  unread?: boolean;
  icon?: string;
  avatarUrl?: string;
  avatarName?: string;
  actions?: EsportsNotificationAction[];
  onPress?: () => void;
  /** Delete handler — shows delete button on hover */
  onDelete?: () => void;
  /** Compact mode for popover use (reduced padding & font) */
  compact?: boolean;
  children?: ReactNode;
  className?: string;
}

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  Time Formatting                                                           */
/* ═══════════════════════════════════════════════════════════════════════════ */

function formatRelativeTime(timestamp: string): string {
  const now = Date.now();
  const then = new Date(timestamp).getTime();
  const diffMs = now - then;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffSec < 60) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  return new Date(timestamp).toLocaleDateString();
}

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  Component                                                                 */
/* ═══════════════════════════════════════════════════════════════════════════ */

export function EsportsNotificationCard({
  type,
  title,
  message,
  timestamp,
  unread = false,
  icon: iconOverride,
  avatarUrl,
  avatarName,
  actions,
  onPress,
  onDelete,
  compact = false,
  children,
  className,
}: EsportsNotificationCardProps) {
  const config = TYPE_CONFIGS[type];
  const iconName = iconOverride || config.icon;
  const [isHovered, setIsHovered] = useState(false);
  const { theme } = useTheme();
  const resolvedAccentHex = theme === 'dark' ? config.accentHex : (config.lightAccentHex ?? config.accentHex);

  return (
    <motion.div
      whileHover={onPress ? { scale: 1.008, y: -1 } : undefined}
      whileTap={onPress ? { scale: 0.995 } : undefined}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      onClick={onPress}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      role={onPress ? 'button' : 'article'}
      tabIndex={onPress ? 0 : undefined}
      aria-label={`${unread ? 'Unread: ' : ''}${title} — ${message}`}
      onKeyDown={(e) => {
        if (onPress && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onPress();
        }
      }}
      className={cn(
        // Base card
        'group relative overflow-hidden border cursor-default',
        compact ? 'border-l-[2px]' : 'border-l-[3px]',
        'bg-leet-cream/80 dark:bg-leet-black/80',
        'border-leet-navy/8 dark:border-leet-cream/8',
        'backdrop-blur-sm',
        'transition-all duration-200',
        // Type-specific left accent
        config.accentColor,
        // Unread state
        unread && [config.accentBg, 'shadow-lg', config.glowColor],
        // Read/muted
        !unread && 'opacity-70 hover:opacity-90',
        // Pressable
        onPress && 'cursor-pointer hover:border-leet-navy/15 dark:hover:border-leet-cream/15',
        className,
      )}
      style={{
        clipPath: compact
          ? 'polygon(0 0, 100% 0, 100% calc(100% - 5px), calc(100% - 5px) 100%, 0 100%)'
          : 'polygon(0 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%)',
      }}
    >
      {/* ── Unread top accent line ───────────────────────────────────── */}
      {unread && (
        <div
          className={cn(
            'absolute top-0 left-0 right-0 h-[2px]',
            'bg-gradient-to-r to-transparent',
            config.gradientFrom,
          )}
          style={{ opacity: 0.6 }}
        />
      )}

      {/* ── Unread pulse glow (subtle) ───────────────────────────────── */}
      {unread && (
        <motion.div
          animate={{ opacity: [0.02, 0.06, 0.02] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute inset-0 pointer-events-none"
          style={{ backgroundColor: resolvedAccentHex }}
        />
      )}

      <div className={cn('flex items-start gap-3', compact ? 'p-2.5' : 'p-3')}>
        {/* ── Icon / Avatar ──────────────────────────────────────────── */}
        {avatarUrl || avatarName ? (
          <Avatar
            src={avatarUrl}
            name={avatarName}
            size="sm"
            className="flex-shrink-0"
            style={{
              clipPath:
                'polygon(0 0, 100% 0, 100% calc(100% - 4px), calc(100% - 4px) 100%, 0 100%)',
            }}
          />
        ) : (
          <div
            className={cn(
              'flex-shrink-0 flex items-center justify-center',
              config.iconBg,
              compact ? 'w-7 h-7' : 'w-9 h-9',
            )}
            style={{
              clipPath:
                'polygon(0 0, 100% 0, 100% calc(100% - 5px), calc(100% - 5px) 100%, 0 100%)',
            }}
          >
            <Icon icon={iconName} width={compact ? 14 : 18} />
          </div>
        )}

        {/* ── Content ────────────────────────────────────────────────── */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h4
              className={cn(
                'truncate',
                'text-leet-navy dark:text-leet-cream',
                compact
                  ? 'text-xs font-semibold'
                  : 'text-sm font-semibold',
                unread && 'font-bold',
              )}
            >
              {title}
            </h4>

            <div className="flex items-center gap-1.5 flex-shrink-0">
              {/* Delete button (hover reveal) */}
              <AnimatePresence>
                {onDelete && isHovered && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.15 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete();
                    }}
                    aria-label={`Delete notification: ${title}`}
                    className={cn(
                      'p-1 transition-colors',
                      'text-leet-navy/30 dark:text-leet-cream/30',
                      'hover:text-leet-orange hover:bg-leet-orange/10',
                    )}
                    style={{
                      clipPath:
                        'polygon(0 0, 100% 0, 100% calc(100% - 2px), calc(100% - 2px) 100%, 0 100%)',
                    }}
                  >
                    <Icon icon="solar:trash-bin-minimalistic-bold" width={12} />
                  </motion.button>
                )}
              </AnimatePresence>

              {/* Timestamp */}
              {timestamp && (
                <span
                  className={cn(
                    'whitespace-nowrap',
                    'text-leet-navy/40 dark:text-leet-cream/40',
                    compact ? 'text-[10px]' : 'text-xs',
                  )}
                >
                  {formatRelativeTime(timestamp)}
                </span>
              )}

              {/* Unread diamond indicator */}
              {unread && (
                <div
                  className="w-2 h-2 flex-shrink-0"
                  style={{
                    clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
                    backgroundColor: resolvedAccentHex,
                  }}
                />
              )}
            </div>
          </div>

          <p
            className={cn(
              'mt-0.5',
              'text-leet-navy/65 dark:text-leet-cream/65',
              compact ? 'text-[10px] line-clamp-1' : 'text-xs line-clamp-2',
            )}
          >
            {message}
          </p>

          {/* Extra content */}
          {children}

          {/* ── Action buttons ───────────────────────────────────────── */}
          {actions && actions.length > 0 && (
            <div className={cn('flex gap-2', compact ? 'mt-1.5' : 'mt-2')}>
              {actions.map((action, i) => (
                <button
                  key={i}
                  onClick={(e) => {
                    e.stopPropagation();
                    action.onClick();
                  }}
                  disabled={action.loading}
                  aria-label={`${action.label} — ${title}`}
                  className={cn(
                    'text-xs font-semibold uppercase tracking-wide',
                    'transition-all duration-200',
                    compact ? 'px-2 py-0.5' : 'px-3 py-1',
                    action.variant === 'accept' && [
                      'bg-leet-navy text-leet-cream dark:bg-leet-lime dark:text-leet-navy',
                      'hover:bg-leet-navy/80 dark:hover:bg-leet-lime/80',
                    ],
                    action.variant === 'decline' && [
                      'bg-transparent border border-leet-orange/30 text-leet-orange',
                      'hover:bg-leet-orange/10',
                    ],
                    action.variant === 'neutral' && [
                      'bg-leet-navy/10 dark:bg-leet-cream/10',
                      'text-leet-navy dark:text-leet-cream',
                      'hover:bg-leet-navy/20 dark:hover:bg-leet-cream/20',
                    ],
                    action.loading && 'opacity-50 pointer-events-none',
                  )}
                  style={{
                    clipPath:
                      'polygon(0 0, 100% 0, 100% calc(100% - 3px), calc(100% - 3px) 100%, 0 100%)',
                  }}
                >
                  {action.loading ? (
                    <span className="animate-pulse">...</span>
                  ) : (
                    action.label
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

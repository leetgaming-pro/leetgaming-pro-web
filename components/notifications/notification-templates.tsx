'use client';

/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║  🎮 LEETGAMING — NOTIFICATION TYPE VISUAL TEMPLATES                          ║
 * ║══════════════════════════════════════════════════════════════════════════════║
 * ║                                                                              ║
 * ║  Rich, branded React components for each backend notification type.          ║
 * ║  These render inside EsportsNotificationCard or as standalone cards          ║
 * ║  with type-specific visuals, metadata display, and contextual actions.       ║
 * ║                                                                              ║
 * ║  Backed by:                                                                  ║
 * ║   - NotificationTypeReadyCheck (6)                                           ║
 * ║   - NotificationTypeReadinessConfirmed (7)                                   ║
 * ║   - NotificationTypeAllPlayersReady (8)                                      ║
 * ║   - NotificationTypeReadyCheckTimeout (9)                                    ║
 * ║   - NotificationTypeGameConnectionInfo (10)                                  ║
 * ║   - NotificationTypeReadinessDeclined (11)                                   ║
 * ║                                                                              ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Icon } from '@iconify/react';
import { cn } from '@nextui-org/react';
import { electrolize } from '@/config/fonts';

// ── Types ───────────────────────────────────────────────────────────────────

/** Backend notification type enum values (maps to Go iota) */
export type BackendNotificationType =
  | 'ready_check'         // 6 — Ready check initiated
  | 'readiness_confirmed' // 7 — Player confirmed readiness
  | 'all_players_ready'   // 8 — All players confirmed
  | 'ready_check_timeout' // 9 — Ready check expired
  | 'connection_info'     // 10 — Server connection details
  | 'readiness_declined'; // 11 — Player declined

/** Metadata that may be attached to notifications */
export interface NotificationMetadata {
  game_name?: string;
  player_name?: string;
  confirmed?: number;
  total?: number;
  timeout?: number;
  server_address?: string;
  lobby_id?: string;
  tier?: string;
  prize_pool?: string;
  region?: string;
  [key: string]: unknown;
}

export interface NotificationTemplateProps {
  /** The backend notification type */
  type: BackendNotificationType;
  /** Metadata from the notification */
  metadata?: NotificationMetadata;
  /** Optional compact mode for popover list items */
  compact?: boolean;
  /** Extra className */
  className?: string;
}

// ── Template Registry ───────────────────────────────────────────────────────

interface TemplateConfig {
  icon: string;
  accentColor: string;
  bgGradient: string;
  emoji: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
}

const TEMPLATE_CONFIG: Record<BackendNotificationType, TemplateConfig> = {
  ready_check: {
    icon: 'solar:shield-check-bold',
    accentColor: '#DCFF37',
    bgGradient: 'from-[#DCFF37]/5 to-transparent',
    emoji: '⚔️',
    urgency: 'critical',
  },
  readiness_confirmed: {
    icon: 'solar:check-circle-bold',
    accentColor: '#17C964',
    bgGradient: 'from-[#17C964]/5 to-transparent',
    emoji: '✅',
    urgency: 'medium',
  },
  all_players_ready: {
    icon: 'solar:users-group-rounded-bold',
    accentColor: '#17C964',
    bgGradient: 'from-[#17C964]/8 to-[#DCFF37]/3',
    emoji: '🎮',
    urgency: 'high',
  },
  ready_check_timeout: {
    icon: 'solar:alarm-bold',
    accentColor: '#FFC700',
    bgGradient: 'from-[#FFC700]/5 to-transparent',
    emoji: '⏰',
    urgency: 'medium',
  },
  connection_info: {
    icon: 'solar:server-bold',
    accentColor: '#17C964',
    bgGradient: 'from-[#17C964]/5 to-[#34445C]/3',
    emoji: '🌐',
    urgency: 'high',
  },
  readiness_declined: {
    icon: 'solar:close-circle-bold',
    accentColor: '#FF4654',
    bgGradient: 'from-[#FF4654]/5 to-transparent',
    emoji: '❌',
    urgency: 'medium',
  },
};

// ── Main Component ──────────────────────────────────────────────────────────

/**
 * Renders a rich visual template for a specific backend notification type.
 * Use inside EsportsNotificationCard's `children` slot or standalone.
 */
export function NotificationTemplate({
  type,
  metadata = {},
  compact = false,
  className,
}: NotificationTemplateProps) {
  const config = TEMPLATE_CONFIG[type];

  if (compact) {
    return <CompactTemplate type={type} metadata={metadata} config={config} className={className} />;
  }

  switch (type) {
    case 'ready_check':
      return <ReadyCheckTemplate metadata={metadata} config={config} className={className} />;
    case 'readiness_confirmed':
      return <ReadinessConfirmedTemplate metadata={metadata} config={config} className={className} />;
    case 'all_players_ready':
      return <AllPlayersReadyTemplate metadata={metadata} config={config} className={className} />;
    case 'ready_check_timeout':
      return <ReadyCheckTimeoutTemplate metadata={metadata} config={config} className={className} />;
    case 'connection_info':
      return <ConnectionInfoTemplate metadata={metadata} config={config} className={className} />;
    case 'readiness_declined':
      return <ReadinessDeclinedTemplate metadata={metadata} config={config} className={className} />;
    default:
      return null;
  }
}

// ── Compact Template (for lists) ────────────────────────────────────────────

function CompactTemplate({
  type,
  metadata,
  config,
  className,
}: {
  type: BackendNotificationType;
  metadata: NotificationMetadata;
  config: TemplateConfig;
  className?: string;
}) {
  const labels: Record<BackendNotificationType, string> = {
    ready_check: 'Ready Check',
    readiness_confirmed: 'Player Ready',
    all_players_ready: 'All Ready',
    ready_check_timeout: 'Timed Out',
    connection_info: 'Server Ready',
    readiness_declined: 'Declined',
  };

  return (
    <div
      className={cn(
        'flex items-center gap-2 px-2 py-1',
        className,
      )}
    >
      <div
        className="w-5 h-5 flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: `${config.accentColor}15` }}
      >
        <Icon icon={config.icon} width={12} style={{ color: config.accentColor }} />
      </div>
      <span className="text-[10px] uppercase tracking-wider font-medium" style={{ color: config.accentColor }}>
        {labels[type]}
      </span>
      {metadata.game_name && (
        <span className="text-[10px] text-[#34445C]/40 dark:text-[#F5F0E1]/40">
          • {metadata.game_name}
        </span>
      )}
    </div>
  );
}

// ── Individual Templates ────────────────────────────────────────────────────

function TemplateWrapper({
  config,
  className,
  children,
}: {
  config: TemplateConfig;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className={cn(
        'relative p-3 overflow-hidden',
        `bg-gradient-to-b ${config.bgGradient}`,
        className,
      )}
      style={{
        clipPath:
          'polygon(0 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%)',
      }}
    >
      {/* Top accent line */}
      <div
        className="absolute top-0 left-0 right-0 h-0.5"
        style={{ backgroundColor: config.accentColor }}
      />
      {children}
    </motion.div>
  );
}

/** Template: Ready Check Started — "Match found, confirm your readiness!" */
function ReadyCheckTemplate({
  metadata,
  config,
  className,
}: {
  metadata: NotificationMetadata;
  config: TemplateConfig;
  className?: string;
}) {
  return (
    <TemplateWrapper config={config} className={className}>
      <div className="flex items-center gap-2 mb-2">
        <Icon icon={config.icon} width={18} style={{ color: config.accentColor }} />
        <span className={cn('text-xs font-bold uppercase tracking-wider', electrolize.className)} style={{ color: config.accentColor }}>
          Match Found
        </span>
      </div>
      <div className="space-y-1.5">
        {metadata.game_name && (
          <MetadataRow icon="solar:gameboy-bold" label="Game" value={metadata.game_name} />
        )}
        {metadata.timeout && (
          <MetadataRow icon="solar:alarm-bold" label="Timeout" value={`${metadata.timeout}s`} />
        )}
        {metadata.tier && (
          <MetadataRow icon="solar:ranking-bold" label="Tier" value={metadata.tier} color="#FFC700" />
        )}
        {metadata.prize_pool && (
          <MetadataRow icon="solar:cup-star-bold" label="Prize" value={metadata.prize_pool} color="#17C964" />
        )}
      </div>
    </TemplateWrapper>
  );
}

/** Template: Readiness Confirmed — "{player_name} confirmed (2/5)" */
function ReadinessConfirmedTemplate({
  metadata,
  config,
  className,
}: {
  metadata: NotificationMetadata;
  config: TemplateConfig;
  className?: string;
}) {
  const progress =
    metadata.confirmed && metadata.total
      ? (metadata.confirmed / metadata.total) * 100
      : 0;

  return (
    <TemplateWrapper config={config} className={className}>
      <div className="flex items-center gap-2 mb-2">
        <Icon icon={config.icon} width={18} style={{ color: config.accentColor }} />
        <span className="text-xs font-semibold text-[#34445C] dark:text-[#F5F0E1]">
          {metadata.player_name || 'Player'}{' '}
          <span style={{ color: config.accentColor }}>confirmed</span>
        </span>
      </div>
      {metadata.confirmed !== undefined && metadata.total !== undefined && (
        <div className="mt-2">
          <div className="flex justify-between text-[10px] uppercase tracking-wider mb-1">
            <span className="text-[#34445C]/40 dark:text-[#F5F0E1]/40">Progress</span>
            <span className="font-bold font-mono" style={{ color: config.accentColor }}>
              {metadata.confirmed}/{metadata.total}
            </span>
          </div>
          <div className="h-1.5 bg-[#34445C]/10 dark:bg-[#F5F0E1]/10 overflow-hidden"
            style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 2px), calc(100% - 2px) 100%, 0 100%)' }}
          >
            <motion.div
              className="h-full"
              initial={{ width: '0%' }}
              animate={{ width: `${progress}%` }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              style={{ backgroundColor: config.accentColor }}
            />
          </div>
        </div>
      )}
    </TemplateWrapper>
  );
}

/** Template: All Players Ready — "All players ready! Starting game..." */
function AllPlayersReadyTemplate({
  metadata,
  config,
  className,
}: {
  metadata: NotificationMetadata;
  config: TemplateConfig;
  className?: string;
}) {
  return (
    <TemplateWrapper config={config} className={className}>
      <div className="text-center space-y-2">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 500, damping: 15, delay: 0.1 }}
        >
          <Icon icon="solar:shield-check-bold" width={28} style={{ color: config.accentColor }} className="mx-auto" />
        </motion.div>
        <p className={cn('text-sm font-bold uppercase tracking-wider', electrolize.className)} style={{ color: config.accentColor }}>
          All Players Ready!
        </p>
        {metadata.game_name && (
          <p className="text-[10px] text-[#34445C]/50 dark:text-[#F5F0E1]/50 uppercase tracking-wider">
            Preparing {metadata.game_name} server...
          </p>
        )}
      </div>
    </TemplateWrapper>
  );
}

/** Template: Ready Check Timeout — "Time expired. Match cancelled." */
function ReadyCheckTimeoutTemplate({
  metadata,
  config,
  className,
}: {
  metadata: NotificationMetadata;
  config: TemplateConfig;
  className?: string;
}) {
  return (
    <TemplateWrapper config={config} className={className}>
      <div className="flex items-center gap-2">
        <Icon icon={config.icon} width={18} style={{ color: config.accentColor }} />
        <div>
          <p className="text-xs font-semibold text-[#34445C] dark:text-[#F5F0E1]">
            Ready Check <span style={{ color: config.accentColor }}>Expired</span>
          </p>
          {metadata.game_name && (
            <p className="text-[10px] text-[#34445C]/40 dark:text-[#F5F0E1]/40 mt-0.5">
              {metadata.game_name} — Match cancelled
            </p>
          )}
        </div>
      </div>
    </TemplateWrapper>
  );
}

/** Template: Connection Info — "Server ready! Connect to {server}" */
function ConnectionInfoTemplate({
  metadata,
  config,
  className,
}: {
  metadata: NotificationMetadata;
  config: TemplateConfig;
  className?: string;
}) {
  return (
    <TemplateWrapper config={config} className={className}>
      <div className="flex items-center gap-2 mb-2">
        <Icon icon={config.icon} width={18} style={{ color: config.accentColor }} />
        <span className={cn('text-xs font-bold uppercase tracking-wider', electrolize.className)} style={{ color: config.accentColor }}>
          Server Ready
        </span>
      </div>
      <div className="space-y-1.5">
        {metadata.game_name && (
          <MetadataRow icon="solar:gameboy-bold" label="Game" value={metadata.game_name} />
        )}
        {metadata.server_address && (
          <MetadataRow icon="solar:global-bold" label="Server" value={metadata.server_address} mono />
        )}
        {metadata.region && (
          <MetadataRow icon="solar:map-point-bold" label="Region" value={metadata.region} />
        )}
      </div>
    </TemplateWrapper>
  );
}

/** Template: Readiness Declined — "{player_name} declined the match." */
function ReadinessDeclinedTemplate({
  metadata,
  config,
  className,
}: {
  metadata: NotificationMetadata;
  config: TemplateConfig;
  className?: string;
}) {
  return (
    <TemplateWrapper config={config} className={className}>
      <div className="flex items-center gap-2">
        <Icon icon={config.icon} width={18} style={{ color: config.accentColor }} />
        <div>
          <p className="text-xs font-semibold text-[#34445C] dark:text-[#F5F0E1]">
            {metadata.player_name || 'A player'}{' '}
            <span style={{ color: config.accentColor }}>declined</span>
          </p>
          {metadata.game_name && (
            <p className="text-[10px] text-[#34445C]/40 dark:text-[#F5F0E1]/40 mt-0.5">
              {metadata.game_name} — Returning to queue
            </p>
          )}
        </div>
      </div>
    </TemplateWrapper>
  );
}

// ── Metadata Row Helper ─────────────────────────────────────────────────────

function MetadataRow({
  icon,
  label,
  value,
  color,
  mono,
}: {
  icon: string;
  label: string;
  value: string;
  color?: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      <Icon icon={icon} width={12} className="text-[#34445C]/30 dark:text-[#F5F0E1]/30 flex-shrink-0" />
      <span className="text-[10px] uppercase tracking-wider text-[#34445C]/40 dark:text-[#F5F0E1]/40 w-12 flex-shrink-0">
        {label}
      </span>
      <span
        className={cn(
          'text-xs font-medium text-[#34445C] dark:text-[#F5F0E1]',
          mono && 'font-mono',
        )}
        style={color ? { color } : undefined}
      >
        {value}
      </span>
    </div>
  );
}

// ── Utility: Map backend type number to string ──────────────────────────────

export function mapBackendTypeToTemplate(typeNum: number): BackendNotificationType | null {
  const map: Record<number, BackendNotificationType> = {
    6: 'ready_check',
    7: 'readiness_confirmed',
    8: 'all_players_ready',
    9: 'ready_check_timeout',
    10: 'connection_info',
    11: 'readiness_declined',
  };
  return map[typeNum] ?? null;
}

/** Get the template configuration for display purposes */
export function getTemplateConfig(type: BackendNotificationType): TemplateConfig {
  return TEMPLATE_CONFIG[type];
}

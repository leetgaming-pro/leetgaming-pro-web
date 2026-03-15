'use client';

/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║  🔔 LEETGAMING — NOTIFICATION CENTER                                        ║
 * ║══════════════════════════════════════════════════════════════════════════════║
 * ║                                                                              ║
 * ║  Award-winning notification command-hub with angular esports design,         ║
 * ║  real-time WebSocket status, animated tab underlines, compact cards,          ║
 * ║  and premium hover/transition effects. Zero rounded-full — all clip-path.    ║
 * ║                                                                              ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon } from '@iconify/react';
import { cn } from '@nextui-org/react';
import Link from 'next/link';
import {
  useNotifications,
  Notification,
  NotificationType,
} from '@/hooks/use-notifications';
import { useSound } from '@/hooks/use-sound';
import { EsportsButton } from '@/components/ui/esports-button';
import {
  EsportsNotificationCard,
  EsportsNotificationType,
} from '@/components/notifications/esports-notification-card';
import { electrolize } from '@/config/fonts';

// Re-export Notification type for backwards compatibility
export type { Notification };

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  Props                                                                     */
/* ═══════════════════════════════════════════════════════════════════════════ */

export interface NotificationCenterProps {
  onNotificationClick?: (notification: Notification) => void;
  onMarkAsRead?: (notificationId: string) => void;
  onMarkAllAsRead?: () => void;
  enableRealtime?: boolean;
}

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  Tab Configuration                                                         */
/* ═══════════════════════════════════════════════════════════════════════════ */

const TAB_FILTERS = [
  { key: 'all', label: 'All', icon: 'solar:bell-bold' },
  { key: 'match', label: 'Matches', icon: 'solar:gameboy-bold' },
  { key: 'team', label: 'Teams', icon: 'solar:users-group-rounded-bold' },
  { key: 'friend', label: 'Social', icon: 'solar:user-plus-bold' },
  { key: 'achievement', label: 'Rewards', icon: 'solar:cup-star-bold' },
] as const;

function toCardType(type: NotificationType): EsportsNotificationType {
  const map: Record<NotificationType, EsportsNotificationType> = {
    match: 'match',
    team: 'team',
    friend: 'friend',
    system: 'system',
    achievement: 'achievement',
    message: 'message',
    'ready-check': 'ready-check',
    connection: 'connection',
  };
  return map[type] ?? 'system';
}

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  Component                                                                 */
/* ═══════════════════════════════════════════════════════════════════════════ */

export function NotificationCenter({
  onNotificationClick,
  onMarkAsRead,
  onMarkAllAsRead,
  enableRealtime = false,
}: NotificationCenterProps) {
  const { status: sessionStatus } = useSession();
  const sound = useSound();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState<string>('all');
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Only fetch notifications when authenticated to avoid 401 errors
  const isAuthenticated = sessionStatus === 'authenticated';

  const {
    notifications = [],
    unreadCount,
    isRealtimeConnected,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    getByType,
  } = useNotifications(
    isAuthenticated, // autoFetch only when authenticated
    {},
    isAuthenticated && enableRealtime, // polling only when authenticated
    30000,
    isAuthenticated && enableRealtime, // WebSocket only when authenticated
  );

  const filteredNotifications =
    selectedTab === 'all'
      ? notifications || []
      : getByType(selectedTab as NotificationType) || [];

  // Count per tab
  const tabCount = useCallback(
    (key: string) =>
      key === 'all'
        ? (notifications || []).length
        : (getByType(key as NotificationType) || []).length,
    [notifications, getByType],
  );

  /* ── Click-outside / Escape to close ─────────────────────────────────── */
  useEffect(() => {
    if (!isOpen) return;
    function handleClickOutside(e: MouseEvent) {
      if (
        panelRef.current &&
        !panelRef.current.contains(e.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  const handleToggle = useCallback(() => {
    setIsOpen((v) => !v);
    if (!isOpen) sound.play('ready-confirm');
  }, [isOpen, sound]);

  const handleMarkAsRead = useCallback(
    async (notificationId: string) => {
      const success = await markAsRead(notificationId);
      if (success) onMarkAsRead?.(notificationId);
    },
    [markAsRead, onMarkAsRead],
  );

  const handleMarkAllAsRead = useCallback(async () => {
    const success = await markAllAsRead();
    if (success) onMarkAllAsRead?.();
  }, [markAllAsRead, onMarkAllAsRead]);

  const handleNotificationClick = useCallback(
    (notification: Notification) => {
      handleMarkAsRead(notification.id);
      onNotificationClick?.(notification);
      // Using router-style navigation would be better but
      // we keep actionUrl support for backend-driven links
      if (notification.actionUrl) {
        window.location.href = notification.actionUrl;
      }
    },
    [handleMarkAsRead, onNotificationClick],
  );

  const handleDelete = useCallback(
    async (notificationId: string) => {
      await deleteNotification(notificationId);
    },
    [deleteNotification],
  );

  // Don't render anything when not authenticated — placed after all hooks
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="relative">
      {/* ════════════════════════════════════════════════════════════════════ */}
      {/*  BELL TRIGGER                                                       */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      <button
        ref={triggerRef}
        onClick={handleToggle}
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
        aria-expanded={isOpen}
        aria-haspopup="true"
        className={cn(
          'relative p-2 transition-all duration-200 group',
          'hover:bg-leet-navy/10 dark:hover:bg-leet-cream/10',
          isOpen && 'bg-leet-navy/10 dark:bg-leet-cream/10',
        )}
        style={{
          clipPath:
            'polygon(0 0, 100% 0, 100% calc(100% - 4px), calc(100% - 4px) 100%, 0 100%)',
        }}
      >
        {/* Bell icon with glow when unread */}
        <div className="relative">
          <Icon
            icon="solar:bell-bold"
            width={22}
            className={cn(
              'transition-colors duration-200',
              'text-leet-navy dark:text-leet-cream',
              unreadCount > 0 && 'text-leet-orange dark:text-leet-lime',
            )}
          />
          {/* Pulse ring behind bell when unread */}
          {unreadCount > 0 && (
            <motion.div
              animate={{ scale: [1, 1.6, 1], opacity: [0.4, 0, 0.4] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute inset-0 bg-leet-orange/20 dark:bg-leet-lime/20"
              style={{
                clipPath:
                  'polygon(0 0, 100% 0, 100% calc(100% - 3px), calc(100% - 3px) 100%, 0 100%)',
              }}
            />
          )}
        </div>

        {/* Badge */}
        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.div
              initial={{ scale: 0, y: 4 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0, y: 4 }}
              transition={{ type: 'spring', stiffness: 500, damping: 20 }}
              className={cn(
                'absolute -top-0.5 -right-0.5',
                'min-w-[18px] h-[18px] px-1',
                'flex items-center justify-center',
                'text-[10px] font-bold text-black',
                'bg-leet-orange',
              )}
              style={{
                clipPath:
                  'polygon(0 0, 100% 0, 100% calc(100% - 3px), calc(100% - 3px) 100%, 0 100%)',
              }}
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </motion.div>
          )}
        </AnimatePresence>
      </button>

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/*  MOBILE BACKDROP                                                    */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 md:hidden"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/*  POPOVER PANEL                                                      */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-label="Notification center"
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 420, damping: 28 }}
            className={cn(
              // Responsive positioning
              'fixed inset-x-4 top-16 z-50 md:absolute md:inset-auto md:right-0 md:top-full md:mt-2',
              'w-auto md:w-[440px]',
              'max-h-[calc(100vh-5rem)] md:max-h-[620px]',
              // Card styling
              'border border-leet-navy/20 dark:border-leet-cream/10',
              'bg-leet-cream/95 dark:bg-leet-black/95',
              'backdrop-blur-xl',
              'shadow-2xl shadow-black/15 dark:shadow-black/50',
              'flex flex-col overflow-hidden',
            )}
            style={{
              clipPath:
                'polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 14px 100%, 0 calc(100% - 14px))',
            }}
          >
            {/* Scan-line overlay */}
            <div
              className="absolute inset-0 pointer-events-none opacity-[0.015] dark:opacity-[0.03]"
              style={{
                backgroundImage:
                  'repeating-linear-gradient(0deg, transparent, transparent 2px, currentColor 2px, currentColor 3px)',
              }}
            />

            {/* Corner accents */}
            <div className="absolute top-0 left-0 w-2 h-8 bg-leet-orange/50 dark:bg-leet-lime/50" />
            <div className="absolute top-0 left-0 w-8 h-2 bg-leet-orange/50 dark:bg-leet-lime/50" />
            <div className="absolute bottom-0 right-0 w-2 h-8 bg-leet-orange/50 dark:bg-leet-lime/50" />
            <div className="absolute bottom-0 right-0 w-8 h-2 bg-leet-orange/50 dark:bg-leet-lime/50" />

            {/* Top edge accent line */}
            <div className="absolute top-0 left-8 right-14 h-[2px] bg-gradient-to-r from-leet-orange/60 via-leet-orange/20 to-transparent dark:from-leet-lime/60 dark:via-leet-lime/20 dark:to-transparent" />

            {/* ── Header ─────────────────────────────────────────────── */}
            <div className="relative px-4 pt-4 pb-2">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-8 h-8 flex items-center justify-center bg-leet-orange/10 dark:bg-leet-lime/10 border border-leet-orange/20 dark:border-leet-lime/20"
                    style={{
                      clipPath:
                        'polygon(0 0, 100% 0, 100% calc(100% - 5px), calc(100% - 5px) 100%, 0 100%)',
                    }}
                  >
                    <Icon icon="solar:bell-bold" width={16} className="text-leet-orange dark:text-leet-lime" />
                  </div>
                  <div>
                    <h3
                      className={cn(
                        'text-sm font-bold uppercase tracking-[0.15em]',
                        'text-leet-navy dark:text-leet-cream',
                        electrolize.className,
                      )}
                    >
                      Notifications
                    </h3>
                    {/* Real-time status */}
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <div
                        className={cn(
                          'w-1.5 h-1.5',
                          isRealtimeConnected ? 'bg-green-400' : 'bg-leet-navy/30 dark:bg-leet-cream/30',
                        )}
                        style={{
                          clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
                        }}
                      />
                      <span className="text-[9px] uppercase tracking-wider text-leet-navy/40 dark:text-leet-cream/40">
                        {isRealtimeConnected ? 'Live' : 'Polling'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <span
                      className={cn(
                        'px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider',
                        'bg-leet-orange/10 text-leet-orange border border-leet-orange/20 dark:bg-leet-lime/10 dark:text-leet-lime dark:border-leet-lime/20',
                      )}
                      style={{
                        clipPath:
                          'polygon(0 0, 100% 0, 100% calc(100% - 3px), calc(100% - 3px) 100%, 0 100%)',
                      }}
                    >
                      {unreadCount} new
                    </span>
                  )}
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllAsRead}
                      className={cn(
                        'text-[10px] uppercase tracking-wider font-semibold',
                        'text-leet-orange hover:text-leet-orange/80 dark:text-leet-lime dark:hover:text-leet-lime/80 transition-colors',
                      )}
                    >
                      Read all
                    </button>
                  )}
                </div>
              </div>

              {/* ── Tab Filters with animated underline ──────────────── */}
              <div
                className="flex gap-0.5 overflow-x-auto scrollbar-none"
                role="tablist"
                aria-label="Filter notifications by type"
              >
                {TAB_FILTERS.map((tab) => {
                  const isActive = selectedTab === tab.key;
                  const count = tabCount(tab.key);
                  return (
                    <button
                      key={tab.key}
                      onClick={() => setSelectedTab(tab.key)}
                      role="tab"
                      aria-selected={isActive}
                      className={cn(
                        'relative flex items-center gap-1 px-2.5 py-2 text-[10px] uppercase tracking-wider font-medium whitespace-nowrap',
                        'transition-colors duration-200',
                        isActive
                          ? 'text-leet-orange dark:text-leet-lime'
                          : 'text-leet-navy/35 dark:text-leet-cream/35 hover:text-leet-navy/60 dark:hover:text-leet-cream/60',
                      )}
                    >
                      <Icon icon={tab.icon} width={12} />
                      {tab.label}
                      {count > 0 && (
                        <span
                          className={cn(
                            'ml-0.5 px-1 text-[9px] font-bold',
                            isActive
                              ? 'text-leet-orange/80 dark:text-leet-lime/80'
                              : 'text-leet-navy/25 dark:text-leet-cream/25',
                          )}
                        >
                          {count}
                        </span>
                      )}
                      {/* Animated underline */}
                      {isActive && (
                        <motion.div
                          layoutId="notif-tab-underline"
                          className="absolute bottom-0 left-1 right-1 h-[2px] bg-leet-orange dark:bg-leet-lime"
                          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-gradient-to-r from-transparent via-leet-navy/10 dark:via-leet-cream/10 to-transparent" />

            {/* ── Notifications List ─────────────────────────────────── */}
            <div
              className="flex-1 overflow-y-auto p-3 space-y-1.5 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-leet-navy/10 dark:scrollbar-thumb-leet-cream/10"
              aria-live="polite"
              aria-relevant="additions removals"
            >
              <AnimatePresence mode="popLayout">
                {filteredNotifications.length === 0 ? (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-center py-14"
                  >
                    <div
                      className="w-14 h-14 mx-auto mb-3 flex items-center justify-center bg-leet-navy/5 dark:bg-leet-cream/5"
                      style={{
                        clipPath:
                          'polygon(0 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%)',
                      }}
                    >
                      <Icon
                        icon="solar:bell-off-linear"
                        width={28}
                        className="text-leet-navy/20 dark:text-leet-cream/20"
                      />
                    </div>
                    <p
                      className={cn(
                        'text-xs uppercase tracking-wider font-semibold mb-1',
                        'text-leet-navy/25 dark:text-leet-cream/25',
                        electrolize.className,
                      )}
                    >
                      All clear
                    </p>
                    <p className="text-[10px] text-leet-navy/20 dark:text-leet-cream/20">
                      No notifications to show
                    </p>
                  </motion.div>
                ) : (
                  <motion.div
                    key="list"
                    initial="hidden"
                    animate="visible"
                    variants={{
                      hidden: {},
                      visible: { transition: { staggerChildren: 0.035 } },
                    }}
                    className="space-y-1.5"
                  >
                    {filteredNotifications.map((notification) => (
                      <motion.div
                        key={notification.id}
                        variants={{
                          hidden: { opacity: 0, x: -12 },
                          visible: { opacity: 1, x: 0 },
                        }}
                        transition={{ type: 'spring', stiffness: 420, damping: 26 }}
                        layout
                      >
                        <EsportsNotificationCard
                          compact
                          type={toCardType(notification.type)}
                          title={notification.title}
                          message={notification.message}
                          timestamp={notification.timestamp}
                          unread={!notification.read}
                          icon={notification.metadata?.icon}
                          onPress={() => handleNotificationClick(notification)}
                          onDelete={() => handleDelete(notification.id)}
                        />
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Divider */}
            <div className="h-px bg-gradient-to-r from-transparent via-leet-navy/10 dark:via-leet-cream/10 to-transparent" />

            {/* ── Footer ─────────────────────────────────────────────── */}
            <div className="p-3 flex items-center gap-2">
              <Link href="/notifications" className="flex-1">
                <EsportsButton
                  variant="ghost"
                  size="sm"
                  fullWidth
                  onClick={() => setIsOpen(false)}
                  startContent={<Icon icon="solar:widget-2-bold" width={16} />}
                >
                  View All
                </EsportsButton>
              </Link>
              <Link href="/notifications?tab=settings">
                <EsportsButton
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  startContent={<Icon icon="solar:settings-bold" width={16} />}
                >
                  <span className="hidden sm:inline">Settings</span>
                </EsportsButton>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}


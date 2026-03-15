'use client';

/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║  🔔 LEETGAMING — NOTIFICATIONS PAGE                                         ║
 * ║══════════════════════════════════════════════════════════════════════════════║
 * ║                                                                              ║
 * ║  Award-winning full-page notification management with:                       ║
 * ║  • Hero header with live stats dashboard                                     ║
 * ║  • Time-grouped notification sections (Today, Yesterday, Earlier)            ║
 * ║  • Angular esports design system — clip-paths, leet colors, Electrolize      ║
 * ║  • Animated tab underlines, stagger reveals, delete transitions              ║
 * ║  • Action toolbar with bulk operations                                       ║
 * ║                                                                              ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */

import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon } from '@iconify/react';
import { cn } from '@nextui-org/react';
import Link from 'next/link';
import { useRequireAuth } from '@/hooks/use-auth';
import { PageContainer } from '@/components/layouts/centered-content';
import {
  useNotifications,
  Notification,
  NotificationType,
} from '@/hooks/use-notifications';
import {
  EsportsNotificationCard,
  EsportsNotificationType,
} from '@/components/notifications/esports-notification-card';
import { EsportsButton } from '@/components/ui/esports-button';
import { electrolize } from '@/config/fonts';

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  Constants                                                                 */
/* ═══════════════════════════════════════════════════════════════════════════ */

const TAB_FILTERS = [
  { key: 'all', label: 'All', icon: 'solar:list-bold' },
  { key: 'match', label: 'Matches', icon: 'solar:gameboy-bold' },
  { key: 'team', label: 'Teams', icon: 'solar:users-group-rounded-bold' },
  { key: 'friend', label: 'Social', icon: 'solar:user-plus-bold' },
  { key: 'achievement', label: 'Achievements', icon: 'solar:cup-star-bold' },
  { key: 'message', label: 'Messages', icon: 'solar:chat-round-bold' },
  { key: 'system', label: 'System', icon: 'solar:bell-bold' },
] as const;

const STAT_ITEMS = [
  { key: 'match', icon: 'solar:gameboy-bold', label: 'Matches', color: 'text-leet-orange dark:text-leet-lime' },
  { key: 'team', icon: 'solar:users-group-rounded-bold', label: 'Teams', color: 'text-leet-orange dark:text-leet-lime' },
  { key: 'friend', icon: 'solar:user-plus-bold', label: 'Social', color: 'text-[#17C964]' },
  { key: 'achievement', icon: 'solar:cup-star-bold', label: 'Rewards', color: 'text-leet-gold' },
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
/*  Time Grouping                                                             */
/* ═══════════════════════════════════════════════════════════════════════════ */

interface TimeGroup {
  label: string;
  notifications: Notification[];
}

function groupByTime(notifications: Notification[]): TimeGroup[] {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today.getTime() - 86400000);
  const lastWeek = new Date(today.getTime() - 7 * 86400000);

  const groups: Record<string, Notification[]> = {
    Today: [],
    Yesterday: [],
    'This Week': [],
    Earlier: [],
  };

  for (const n of notifications) {
    const ts = new Date(n.timestamp);
    if (ts >= today) {
      groups['Today'].push(n);
    } else if (ts >= yesterday) {
      groups['Yesterday'].push(n);
    } else if (ts >= lastWeek) {
      groups['This Week'].push(n);
    } else {
      groups['Earlier'].push(n);
    }
  }

  return Object.entries(groups)
    .filter(([, items]) => items.length > 0)
    .map(([label, items]) => ({ label, notifications: items }));
}

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  Page Component                                                            */
/* ═══════════════════════════════════════════════════════════════════════════ */

export default function NotificationsPage() {
  const {
    isAuthenticated,
    isLoading: isAuthLoading,
    isRedirecting,
  } = useRequireAuth({ callbackUrl: '/notifications' });

  const [selectedTab, setSelectedTab] = useState<string>('all');
  const [filterUnread, setFilterUnread] = useState(false);

  const {
    notifications,
    isLoading: loading,
    unreadCount,
    totalCount,
    isRealtimeConnected,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAll,
    getByType,
  } = useNotifications(true, {}, false, 30000, true);

  const handleMarkAsRead = useCallback(
    async (notificationId: string) => {
      await markAsRead(notificationId);
    },
    [markAsRead],
  );

  const handleMarkAllAsRead = useCallback(async () => {
    await markAllAsRead();
  }, [markAllAsRead]);

  const handleDeleteNotification = useCallback(
    async (notificationId: string) => {
      await deleteNotification(notificationId);
    },
    [deleteNotification],
  );

  const handleClearAll = useCallback(async () => {
    if (!confirm('Delete all notifications? This cannot be undone.')) return;
    await deleteAll();
  }, [deleteAll]);

  const filteredNotifications = useMemo(() => {
    let filtered =
      selectedTab === 'all'
        ? notifications
        : getByType(selectedTab as NotificationType);
    if (filterUnread) {
      filtered = filtered.filter((n) => !n.read);
    }
    return filtered;
  }, [notifications, selectedTab, filterUnread, getByType]);

  const timeGroups = useMemo(
    () => groupByTime(filteredNotifications),
    [filteredNotifications],
  );

  /* ── Auth guard states ───────────────────────────────────────────────── */
  if (isAuthLoading || isRedirecting || !isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
          className="w-10 h-10 border-2 border-leet-orange dark:border-leet-lime border-t-transparent"
          style={{
            clipPath:
              'polygon(0 0, 100% 0, 100% calc(100% - 4px), calc(100% - 4px) 100%, 0 100%)',
          }}
        />
      </div>
    );
  }

  /* ── Loading skeleton ────────────────────────────────────────────────── */
  if (loading) {
    return (
      <PageContainer maxWidth="5xl">
        {/* Skeleton hero */}
        <div
          className="h-28 mb-6 bg-leet-navy/5 dark:bg-leet-cream/5 animate-pulse"
          style={{
            clipPath:
              'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))',
          }}
        />
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="h-20 bg-leet-navy/5 dark:bg-leet-cream/5 animate-pulse"
              style={{
                clipPath:
                  'polygon(0 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%)',
                animationDelay: `${i * 100}ms`,
              }}
            />
          ))}
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer maxWidth="5xl">
      {/* ════════════════════════════════════════════════════════════════════ */}
      {/*  HERO HEADER WITH STATS                                             */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      <div className="mb-8">
        <div
          className={cn(
            'relative overflow-hidden',
            'border border-leet-navy/10 dark:border-leet-cream/10',
            'bg-gradient-to-br from-leet-navy/5 via-transparent to-leet-orange/5',
            'dark:from-leet-cream/3 dark:via-transparent dark:to-leet-lime/5',
          )}
          style={{
            clipPath:
              'polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 16px 100%, 0 calc(100% - 16px))',
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
          {/* Top accent line */}
          <div className="absolute top-0 left-8 right-16 h-[2px] bg-gradient-to-r from-leet-orange/60 via-leet-orange/20 to-transparent dark:from-leet-lime/60 dark:via-leet-lime/20 dark:to-transparent" />

          <div className="relative px-6 py-6 md:px-8 md:py-7">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              {/* Title area */}
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 flex items-center justify-center bg-leet-orange/10 dark:bg-leet-lime/10 border border-leet-orange/20 dark:border-leet-lime/20"
                  style={{
                    clipPath:
                      'polygon(0 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%)',
                  }}
                >
                  <Icon icon="solar:bell-bold" width={24} className="text-leet-orange dark:text-leet-lime" />
                </div>
                <div>
                  <h1
                    className={cn(
                      'text-2xl md:text-3xl font-bold uppercase tracking-[0.15em]',
                      'text-leet-navy dark:text-leet-cream',
                      electrolize.className,
                    )}
                  >
                    Notifications
                  </h1>
                  <div className="flex items-center gap-2 mt-1">
                    {/* Status */}
                    <div className="flex items-center gap-1.5">
                      <div
                        className={cn(
                          'w-1.5 h-1.5',
                          isRealtimeConnected
                            ? 'bg-[#17C964]'
                            : 'bg-leet-navy/30 dark:bg-leet-cream/30',
                        )}
                        style={{
                          clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
                        }}
                      />
                      <span className="text-[10px] uppercase tracking-wider text-leet-navy/40 dark:text-leet-cream/40">
                        {isRealtimeConnected ? 'Live' : 'Polling'}
                      </span>
                    </div>
                    <span className="text-leet-navy/15 dark:text-leet-cream/15">|</span>
                    <span className="text-[10px] uppercase tracking-wider text-leet-navy/40 dark:text-leet-cream/40">
                      {unreadCount > 0
                        ? `${unreadCount} unread`
                        : 'All caught up'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Stats mini dashboard */}
              <div className="flex gap-3 md:gap-4">
                {/* Total */}
                <div
                  className="px-4 py-2 bg-leet-navy/5 dark:bg-leet-cream/5 border border-leet-navy/8 dark:border-leet-cream/8"
                  style={{
                    clipPath:
                      'polygon(0 0, 100% 0, 100% calc(100% - 4px), calc(100% - 4px) 100%, 0 100%)',
                  }}
                >
                  <div className="text-[10px] uppercase tracking-wider text-leet-navy/40 dark:text-leet-cream/40 mb-0.5">
                    Total
                  </div>
                  <div
                    className={cn(
                      'text-xl font-bold text-leet-navy dark:text-leet-cream',
                      electrolize.className,
                    )}
                  >
                    {totalCount}
                  </div>
                </div>
                {/* Unread */}
                <div
                  className={cn(
                    'px-4 py-2 border',
                    unreadCount > 0
                      ? 'bg-leet-orange/5 dark:bg-leet-lime/5 border-leet-orange/20 dark:border-leet-lime/20'
                      : 'bg-leet-navy/5 dark:bg-leet-cream/5 border-leet-navy/8 dark:border-leet-cream/8',
                  )}
                  style={{
                    clipPath:
                      'polygon(0 0, 100% 0, 100% calc(100% - 4px), calc(100% - 4px) 100%, 0 100%)',
                  }}
                >
                  <div className="text-[10px] uppercase tracking-wider text-leet-navy/40 dark:text-leet-cream/40 mb-0.5">
                    Unread
                  </div>
                  <div
                    className={cn(
                      'text-xl font-bold',
                      unreadCount > 0 ? 'text-leet-orange dark:text-leet-lime' : 'text-leet-navy dark:text-leet-cream',
                      electrolize.className,
                    )}
                  >
                    {unreadCount}
                  </div>
                </div>
                {/* Per-type mini stats */}
                <div className="hidden md:flex gap-2">
                  {STAT_ITEMS.map((stat) => {
                    const count = getByType(stat.key as NotificationType).length;
                    return (
                      <div
                        key={stat.key}
                        className="px-3 py-2 bg-leet-navy/3 dark:bg-leet-cream/3 border border-leet-navy/5 dark:border-leet-cream/5"
                        style={{
                          clipPath:
                            'polygon(0 0, 100% 0, 100% calc(100% - 3px), calc(100% - 3px) 100%, 0 100%)',
                        }}
                      >
                        <Icon icon={stat.icon} width={14} className={cn(stat.color, 'mb-0.5')} />
                        <div
                          className={cn(
                            'text-sm font-bold text-leet-navy dark:text-leet-cream',
                            electrolize.className,
                          )}
                        >
                          {count}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/*  ACTION TOOLBAR                                                     */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      <div
        className="mb-6 p-4 border border-leet-navy/8 dark:border-leet-cream/8 bg-leet-navy/3 dark:bg-leet-cream/3"
        style={{
          clipPath:
            'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))',
        }}
      >
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <EsportsButton
              variant={filterUnread ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setFilterUnread(!filterUnread)}
              startContent={<Icon icon="solar:filter-bold" width={16} />}
            >
              {filterUnread ? 'Showing Unread' : 'Filter Unread'}
            </EsportsButton>

            {/* Settings link */}
            <Link href="/notifications?tab=settings">
              <EsportsButton
                variant="ghost"
                size="sm"
                startContent={<Icon icon="solar:settings-bold" width={16} />}
              >
                Settings
              </EsportsButton>
            </Link>
          </div>

          <div className="flex gap-2">
            {unreadCount > 0 && (
              <EsportsButton
                variant="ghost"
                size="sm"
                onClick={handleMarkAllAsRead}
                startContent={<Icon icon="solar:check-read-bold" width={16} />}
              >
                Mark All Read
              </EsportsButton>
            )}
            {notifications.length > 0 && (
              <EsportsButton
                variant="danger"
                size="sm"
                onClick={handleClearAll}
                startContent={<Icon icon="solar:trash-bin-trash-bold" width={16} />}
              >
                Clear All
              </EsportsButton>
            )}
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/*  TAB FILTERS                                                        */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      <div className="mb-6 flex gap-0.5 overflow-x-auto pb-1">
        {TAB_FILTERS.map((tab) => {
          const isActive = selectedTab === tab.key;
          const count =
            tab.key === 'all'
              ? notifications.length
              : getByType(tab.key as NotificationType).length;

          return (
            <button
              key={tab.key}
              onClick={() => setSelectedTab(tab.key)}
              className={cn(
                'relative flex items-center gap-1.5 px-3 py-2.5 text-xs uppercase tracking-wider font-medium whitespace-nowrap',
                'transition-all duration-200',
                isActive
                  ? 'text-leet-orange dark:text-leet-lime'
                  : 'text-leet-navy/35 dark:text-leet-cream/35 hover:text-leet-navy/60 dark:hover:text-leet-cream/60 hover:bg-leet-navy/5 dark:hover:bg-leet-cream/5',
              )}
              style={{
                clipPath:
                  'polygon(0 0, 100% 0, 100% calc(100% - 3px), calc(100% - 3px) 100%, 0 100%)',
              }}
            >
              <Icon icon={tab.icon} width={14} />
              {tab.label}
              {count > 0 && (
                <span
                  className={cn(
                    'ml-1 px-1.5 py-0.5 text-[10px] font-bold',
                    isActive
                      ? 'bg-leet-orange/15 text-leet-orange dark:bg-leet-lime/15 dark:text-leet-lime'
                      : 'bg-leet-navy/8 dark:bg-leet-cream/8 text-leet-navy/35 dark:text-leet-cream/35',
                  )}
                  style={{
                    clipPath:
                      'polygon(0 0, 100% 0, 100% calc(100% - 2px), calc(100% - 2px) 100%, 0 100%)',
                  }}
                >
                  {count}
                </span>
              )}
              {/* Animated underline */}
              {isActive && (
                <motion.div
                  layoutId="page-tab-underline"
                  className="absolute bottom-0 left-1 right-1 h-[2px] bg-leet-orange dark:bg-leet-lime"
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/*  TIME-GROUPED NOTIFICATIONS LIST                                    */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      <AnimatePresence mode="popLayout">
        {filteredNotifications.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-center py-20"
          >
            <div
              className="w-20 h-20 mx-auto mb-5 flex items-center justify-center bg-leet-navy/5 dark:bg-leet-cream/5 border border-leet-navy/8 dark:border-leet-cream/8"
              style={{
                clipPath:
                  'polygon(0 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%)',
              }}
            >
              <Icon
                icon="solar:bell-off-linear"
                width={36}
                className="text-leet-navy/15 dark:text-leet-cream/15"
              />
            </div>
            <h3
              className={cn(
                'text-lg font-bold uppercase tracking-wider mb-1',
                'text-leet-navy/25 dark:text-leet-cream/25',
                electrolize.className,
              )}
            >
              {filterUnread ? 'All caught up!' : 'No notifications'}
            </h3>
            <p className="text-xs text-leet-navy/25 dark:text-leet-cream/25 max-w-xs mx-auto">
              {filterUnread
                ? 'No unread notifications. Toggle the filter to see all.'
                : selectedTab === 'all'
                  ? 'When you receive notifications, they will appear here.'
                  : `No ${selectedTab} notifications yet.`}
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="groups"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.06 } },
            }}
            className="space-y-6"
          >
            {timeGroups.map((group) => (
              <motion.div
                key={group.label}
                variants={{
                  hidden: { opacity: 0, y: 8 },
                  visible: { opacity: 1, y: 0 },
                }}
              >
                {/* Time group header */}
                <div className="flex items-center gap-3 mb-3">
                  <h2
                    className={cn(
                      'text-xs font-bold uppercase tracking-[0.2em]',
                      'text-leet-navy/40 dark:text-leet-cream/40',
                      electrolize.className,
                    )}
                  >
                    {group.label}
                  </h2>
                  <div className="flex-1 h-px bg-gradient-to-r from-leet-navy/10 dark:from-leet-cream/10 to-transparent" />
                  <span className="text-[10px] font-medium text-leet-navy/25 dark:text-leet-cream/25 uppercase tracking-wider">
                    {group.notifications.length}
                  </span>
                </div>

                {/* Notifications in this group */}
                <motion.div
                  initial="hidden"
                  animate="visible"
                  variants={{
                    hidden: {},
                    visible: { transition: { staggerChildren: 0.03 } },
                  }}
                  className="space-y-2"
                >
                  {group.notifications.map((notification) => (
                    <motion.div
                      key={notification.id}
                      variants={{
                        hidden: { opacity: 0, x: -12 },
                        visible: { opacity: 1, x: 0 },
                      }}
                      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                      layout
                    >
                      <EsportsNotificationCard
                        type={toCardType(notification.type)}
                        title={notification.title}
                        message={notification.message}
                        timestamp={notification.timestamp}
                        unread={!notification.read}
                        icon={notification.metadata?.icon}
                        onPress={() => {
                          handleMarkAsRead(notification.id);
                          if (notification.actionUrl) {
                            window.location.href = notification.actionUrl;
                          }
                        }}
                        onDelete={() => handleDeleteNotification(notification.id)}
                        actions={[
                          ...(!notification.read
                            ? [
                                {
                                  label: 'Mark Read',
                                  onClick: () => handleMarkAsRead(notification.id),
                                  variant: 'neutral' as const,
                                },
                              ]
                            : []),
                          ...(notification.actionUrl
                            ? [
                                {
                                  label: 'View',
                                  onClick: () => {
                                    handleMarkAsRead(notification.id);
                                    window.location.href = notification.actionUrl ?? '';
                                  },
                                  variant: 'accept' as const,
                                },
                              ]
                            : []),
                        ]}
                      />
                    </motion.div>
                  ))}
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom spacer */}
      <div className="h-12" />
    </PageContainer>
  );
}

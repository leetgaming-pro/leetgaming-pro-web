/**
 * useNotifications Hook
 * React hook for notification operations with state management
 * Uses SDK for type-safe API access - DO NOT use direct fetch calls
 */

'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { ReplayAPISDK } from '@/types/replay-api/sdk';
import { ReplayApiSettingsMock } from '@/types/replay-api/settings';
import { logger } from '@/lib/logger';
import type {
  Notification,
  NotificationType,
  NotificationsResult,
  NotificationFilters,
} from '@/types/replay-api/notifications.sdk';
import { NotificationsAPI } from '@/types/replay-api/notifications.sdk';

const getApiBaseUrl = (): string =>
  typeof window !== 'undefined'
    ? process.env.NEXT_PUBLIC_REPLAY_API_URL || 'http://localhost:8080'
    : process.env.NEXT_PUBLIC_REPLAY_API_URL || process.env.REPLAY_API_URL || 'http://localhost:8080';

export interface UseNotificationsResult {
  // State
  notifications: Notification[];
  isLoading: boolean;
  error: string | null;
  unreadCount: number;
  totalCount: number;
  // Actions
  refresh: (filters?: NotificationFilters) => Promise<void>;
  markAsRead: (notificationId: string) => Promise<boolean>;
  markAllAsRead: () => Promise<boolean>;
  deleteNotification: (notificationId: string) => Promise<boolean>;
  deleteAll: () => Promise<boolean>;
  // Helpers
  getByType: (type: NotificationType) => Notification[];
  getUnread: () => Notification[];
}

export function useNotifications(
  autoFetch = true,
  initialFilters: NotificationFilters = {},
  enablePolling = false,
  pollingIntervalMs = 30000
): UseNotificationsResult {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [filters, setFilters] = useState<NotificationFilters>(initialFilters);

  // Create API client - note: NotificationsAPI needs to be added to SDK
  const api = useMemo(() => {
    const baseUrl = getApiBaseUrl();
    const sdk = new ReplayAPISDK({ ...ReplayApiSettingsMock, baseUrl }, logger);
    return new NotificationsAPI(sdk.client);
  }, []);

  const refresh = useCallback(async (newFilters?: NotificationFilters) => {
    setIsLoading(true);
    setError(null);
    const activeFilters = newFilters || filters;
    if (newFilters) setFilters(newFilters);

    try {
      const result = await api.getAll(activeFilters);
      if (result) {
        setNotifications(result.notifications);
        setUnreadCount(result.unread_count);
        setTotalCount(result.total_count);
      } else {
        setError('Failed to fetch notifications');
        setNotifications([]);
      }
    } catch (err: unknown) {
      logger.error('[useNotifications] Error fetching notifications:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      setNotifications([]);
    } finally {
      setIsLoading(false);
    }
  }, [api, filters]);

  const markAsRead = useCallback(async (notificationId: string): Promise<boolean> => {
    try {
      const success = await api.markAsRead(notificationId);
      if (success) {
        setNotifications(prev =>
          prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      return success;
    } catch (err: unknown) {
      logger.error('[useNotifications] Mark as read failed:', err);
      return false;
    }
  }, [api]);

  const markAllAsRead = useCallback(async (): Promise<boolean> => {
    try {
      const success = await api.markAllAsRead();
      if (success) {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        setUnreadCount(0);
      }
      return success;
    } catch (err: unknown) {
      logger.error('[useNotifications] Mark all as read failed:', err);
      return false;
    }
  }, [api]);

  const deleteNotification = useCallback(async (notificationId: string): Promise<boolean> => {
    try {
      const success = await api.delete(notificationId);
      if (success) {
        const deletedNotification = notifications.find(n => n.id === notificationId);
        setNotifications(prev => prev.filter(n => n.id !== notificationId));
        setTotalCount(prev => Math.max(0, prev - 1));
        if (deletedNotification && !deletedNotification.read) {
          setUnreadCount(prev => Math.max(0, prev - 1));
        }
      }
      return success;
    } catch (err: unknown) {
      logger.error('[useNotifications] Delete failed:', err);
      return false;
    }
  }, [api, notifications]);

  const deleteAll = useCallback(async (): Promise<boolean> => {
    try {
      const success = await api.deleteAll();
      if (success) {
        setNotifications([]);
        setUnreadCount(0);
        setTotalCount(0);
      }
      return success;
    } catch (err: unknown) {
      logger.error('[useNotifications] Delete all failed:', err);
      return false;
    }
  }, [api]);

  const getByType = useCallback((type: NotificationType): Notification[] => {
    return notifications.filter(n => n.type === type);
  }, [notifications]);

  const getUnread = useCallback((): Notification[] => {
    return notifications.filter(n => !n.read);
  }, [notifications]);

  // Auto-fetch on mount
  useEffect(() => {
    if (autoFetch) {
      refresh();
    }
  }, [autoFetch, refresh]);

  // Polling for real-time updates
  useEffect(() => {
    if (!enablePolling) return;

    const interval = setInterval(() => {
      refresh();
    }, pollingIntervalMs);

    return () => clearInterval(interval);
  }, [enablePolling, pollingIntervalMs, refresh]);

  return {
    notifications,
    isLoading,
    error,
    unreadCount,
    totalCount,
    refresh,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAll,
    getByType,
    getUnread,
  };
}

// Re-export types for convenience
export type { Notification, NotificationType, NotificationFilters };



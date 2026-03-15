/**
 * useNotifications Hook
 * React hook for notification operations with state management
 * Uses SDK for type-safe API access - DO NOT use direct fetch calls
 * Supports real-time delivery via WebSocket when enableWebSocket is true
 */

"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useSDK } from "@/contexts/sdk-context";
import { logger } from "@/lib/logger";
import type {
  Notification,
  NotificationType,
  NotificationFilters,
} from "@/types/replay-api/notifications.sdk";
import { NotificationsAPI } from "@/types/replay-api/notifications.sdk";
import { useNotificationWebSocket } from "@/hooks/use-notification-websocket";

export interface UseNotificationsResult {
  // State
  notifications: Notification[];
  isLoading: boolean;
  error: string | null;
  unreadCount: number;
  totalCount: number;
  // WebSocket state
  isRealtimeConnected: boolean;
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
  pollingIntervalMs = 30000,
  enableWebSocket = false,
): UseNotificationsResult {
  const { status: sessionStatus } = useSession();
  const isSessionAuthenticated = sessionStatus === "authenticated";
  const { sdk } = useSDK();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [filters, setFilters] = useState<NotificationFilters>(initialFilters);

  // Create API client using centralized SDK
  const api = useMemo(() => new NotificationsAPI(sdk.client), [sdk.client]);

  // ── WebSocket real-time bridge ────────────────────────────────────────
  const ws = useNotificationWebSocket({
    onNotification: useCallback((notification: Notification) => {
      // Prepend the new notification and bump counts
      setNotifications((prev) => {
        // Deduplicate by id
        if (prev.some((n) => n.id === notification.id)) return prev;
        return [notification, ...prev];
      });
      setUnreadCount((prev) => prev + 1);
      setTotalCount((prev) => prev + 1);
      logger.info("[useNotifications] Real-time notification received", notification.id);
    }, []),
    onNotificationRead: useCallback((notificationId: string) => {
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n)),
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    }, []),
    onNotificationDeleted: useCallback((notificationId: string) => {
      setNotifications((prev) => {
        const target = prev.find((n) => n.id === notificationId);
        if (target && !target.read) {
          setUnreadCount((c) => Math.max(0, c - 1));
        }
        return prev.filter((n) => n.id !== notificationId);
      });
      setTotalCount((prev) => Math.max(0, prev - 1));
    }, []),
  });

  // Connect/disconnect WebSocket based on flag
  useEffect(() => {
    if (enableWebSocket) {
      ws.connect();
    } else {
      ws.disconnect();
    }
    return () => {
      ws.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enableWebSocket]);

  const refresh = useCallback(
    async (newFilters?: NotificationFilters) => {
      setIsLoading(true);
      setError(null);
      const activeFilters = newFilters || filters;
      if (newFilters) setFilters(newFilters);

      try {
        const result = await api.getAll(activeFilters);
        if (result) {
          // Ensure notifications is always an array, even if API returns undefined
          setNotifications(result.notifications || []);
          setUnreadCount(result.unread_count || 0);
          setTotalCount(result.total_count || 0);
        } else {
          setError("Failed to fetch notifications");
          setNotifications([]);
        }
      } catch (err: unknown) {
        logger.error("[useNotifications] Error fetching notifications:", err);
        setError(err instanceof Error ? err.message : "Unknown error");
        setNotifications([]);
      } finally {
        setIsLoading(false);
      }
    },
    [api, filters],
  );

  const markAsRead = useCallback(
    async (notificationId: string): Promise<boolean> => {
      try {
        const success = await api.markAsRead(notificationId);
        if (success) {
          setNotifications((prev) =>
            prev.map((n) =>
              n.id === notificationId ? { ...n, read: true } : n,
            ),
          );
          setUnreadCount((prev) => Math.max(0, prev - 1));
        }
        return success;
      } catch (err: unknown) {
        logger.error("[useNotifications] Mark as read failed:", err);
        return false;
      }
    },
    [api],
  );

  const markAllAsRead = useCallback(async (): Promise<boolean> => {
    try {
      const success = await api.markAllAsRead();
      if (success) {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
        setUnreadCount(0);
      }
      return success;
    } catch (err: unknown) {
      logger.error("[useNotifications] Mark all as read failed:", err);
      return false;
    }
  }, [api]);

  const deleteNotification = useCallback(
    async (notificationId: string): Promise<boolean> => {
      try {
        const success = await api.delete(notificationId);
        if (success) {
          const deletedNotification = notifications.find(
            (n) => n.id === notificationId,
          );
          setNotifications((prev) =>
            prev.filter((n) => n.id !== notificationId),
          );
          setTotalCount((prev) => Math.max(0, prev - 1));
          if (deletedNotification && !deletedNotification.read) {
            setUnreadCount((prev) => Math.max(0, prev - 1));
          }
        }
        return success;
      } catch (err: unknown) {
        logger.error("[useNotifications] Delete failed:", err);
        return false;
      }
    },
    [api, notifications],
  );

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
      logger.error("[useNotifications] Delete all failed:", err);
      return false;
    }
  }, [api]);

  const getByType = useCallback(
    (type: NotificationType): Notification[] => {
      return notifications.filter((n) => n.type === type);
    },
    [notifications],
  );

  const getUnread = useCallback((): Notification[] => {
    return notifications.filter((n) => !n.read);
  }, [notifications]);

  // Auto-fetch on mount — only when authenticated to avoid 401 errors
  useEffect(() => {
    if (autoFetch && isSessionAuthenticated) {
      refresh();
    }
  }, [autoFetch, isSessionAuthenticated, refresh]);

  // Polling for real-time updates — only when authenticated
  useEffect(() => {
    if (!enablePolling || !isSessionAuthenticated) return;

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
    isRealtimeConnected: ws.isConnected,
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

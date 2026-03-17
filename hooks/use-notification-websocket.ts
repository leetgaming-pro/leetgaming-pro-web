/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║  🔔 LEETGAMING — NOTIFICATION WEBSOCKET HOOK                                ║
 * ║══════════════════════════════════════════════════════════════════════════════║
 * ║                                                                              ║
 * ║  Real-time notification delivery via WebSocket. Connects to /ws/notifications║
 * ║  and pushes incoming NOTIFICATION events into the notification state and     ║
 * ║  triggers toast/sound feedback. Designed to integrate with useNotifications. ║
 * ║                                                                              ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { logger } from '@/lib/logger';
import type { Notification } from '@/types/replay-api/notifications.sdk';

// ── WebSocket Message Types ─────────────────────────────────────────────────

const NotificationMessageTypes = {
  /** Server → Client: new notification payload */
  NOTIFICATION: 'notification',
  /** Server → Client: a notification was read (synced from another tab/device) */
  NOTIFICATION_READ: 'notification_read',
  /** Server → Client: a notification was deleted */
  NOTIFICATION_DELETED: 'notification_deleted',
  /** Client → Server: subscribe ack (optional, sent on connect) */
  SUBSCRIBE: 'subscribe_notifications',
} as const;

// ── Wire Protocol ───────────────────────────────────────────────────────────

interface NotificationWebSocketMessage {
  type: string;
  user_id?: string;
  payload: unknown;
  timestamp: number;
}

/** Payload for NOTIFICATION events from backend */
export interface NotificationPayload extends Notification {}

/** Payload for NOTIFICATION_READ events */
export interface NotificationReadPayload {
  notification_id: string;
}

/** Payload for NOTIFICATION_DELETED events */
export interface NotificationDeletedPayload {
  notification_id: string;
}

// ── Connection States ───────────────────────────────────────────────────────

export type NotificationConnectionState =
  | 'connecting'
  | 'connected'
  | 'disconnected'
  | 'error';

// ── Hook Options ────────────────────────────────────────────────────────────

export interface UseNotificationWebSocketOptions {
  /** Auto-reconnect on disconnect (default: true) */
  autoReconnect?: boolean;
  /** Delay between reconnection attempts in ms (default: 3000) */
  reconnectInterval?: number;
  /** Maximum reconnection attempts before giving up (default: 10) */
  maxReconnectAttempts?: number;
  /** Called when connection is established */
  onConnect?: () => void;
  /** Called on disconnect */
  onDisconnect?: () => void;
  /** Called on error */
  onError?: (error: Error) => void;
  /** Called when a new notification arrives */
  onNotification?: (notification: Notification) => void;
  /** Called when a notification is marked as read (from another tab/device) */
  onNotificationRead?: (notificationId: string) => void;
  /** Called when a notification is deleted (from another tab/device) */
  onNotificationDeleted?: (notificationId: string) => void;
}

// ── Hook Result ─────────────────────────────────────────────────────────────

export interface UseNotificationWebSocketResult {
  /** Current connection state */
  connectionState: NotificationConnectionState;
  /** Convenience boolean */
  isConnected: boolean;
  /** Latest incoming notifications received via WebSocket (most recent first) */
  incoming: Notification[];
  /** Clear the incoming buffer */
  clearIncoming: () => void;
  /** Manually connect */
  connect: () => void;
  /** Manually disconnect */
  disconnect: () => void;
  /** Manually trigger reconnect */
  reconnect: () => void;
}

// ── URL Builder ─────────────────────────────────────────────────────────────

function getNotificationWebSocketUrl(): string {
  const apiUrl =
    process.env.NEXT_PUBLIC_REPLAY_API_URL || 'https://api.leetgaming.pro';
  const wsUrl = apiUrl.replace(/^http/, 'ws');
  return `${wsUrl}/ws/notifications`;
}

// ── Hook ────────────────────────────────────────────────────────────────────

export function useNotificationWebSocket(
  options: UseNotificationWebSocketOptions = {},
): UseNotificationWebSocketResult {
  const {
    autoReconnect = true,
    reconnectInterval = 5000,
    maxReconnectAttempts = 5,
    onConnect,
    onDisconnect,
    onError,
    onNotification,
    onNotificationRead,
    onNotificationDeleted,
  } = options;

  const [connectionState, setConnectionState] =
    useState<NotificationConnectionState>('disconnected');
  const [incoming, setIncoming] = useState<Notification[]>([]);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const isConnected = connectionState === 'connected';

  // ── Message Handler ───────────────────────────────────────────────────

  const handleMessage = useCallback(
    (message: NotificationWebSocketMessage) => {
      logger.debug('[useNotificationWS] Received:', message.type);

      switch (message.type) {
        case NotificationMessageTypes.NOTIFICATION: {
          const notification = message.payload as Notification;
          if (notification) {
            setIncoming((prev) => [notification, ...prev]);
            onNotification?.(notification);
          }
          break;
        }

        case NotificationMessageTypes.NOTIFICATION_READ: {
          const payload = message.payload as NotificationReadPayload;
          if (payload?.notification_id) {
            onNotificationRead?.(payload.notification_id);
          }
          break;
        }

        case NotificationMessageTypes.NOTIFICATION_DELETED: {
          const payload = message.payload as NotificationDeletedPayload;
          if (payload?.notification_id) {
            setIncoming((prev) =>
              prev.filter((n) => n.id !== payload.notification_id),
            );
            onNotificationDeleted?.(payload.notification_id);
          }
          break;
        }

        default:
          logger.debug(
            '[useNotificationWS] Unknown message type:',
            message.type,
          );
      }
    },
    [onNotification, onNotificationRead, onNotificationDeleted],
  );

  // ── Connect ───────────────────────────────────────────────────────────

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    const wsUrl = getNotificationWebSocketUrl();
    logger.info('[useNotificationWS] Connecting to', wsUrl);
    setConnectionState('connecting');

    try {
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        logger.info('[useNotificationWS] Connected');
        setConnectionState('connected');
        reconnectAttemptsRef.current = 0;
        onConnect?.();

        // Send subscription ack
        ws.send(
          JSON.stringify({
            type: NotificationMessageTypes.SUBSCRIBE,
          }),
        );
      };

      ws.onmessage = (event) => {
        try {
          const message: NotificationWebSocketMessage = JSON.parse(event.data);
          handleMessage(message);
        } catch (err) {
          logger.error('[useNotificationWS] Parse error:', err);
        }
      };

      ws.onerror = () => {
        logger.error('[useNotificationWS] WebSocket error');
        setConnectionState('error');
        onError?.(new Error('Notification WebSocket error'));
      };

      ws.onclose = (event) => {
        logger.info('[useNotificationWS] Disconnected', {
          code: event.code,
          reason: event.reason,
        });
        setConnectionState('disconnected');
        wsRef.current = null;
        onDisconnect?.();

        // Auto-reconnect
        if (
          autoReconnect &&
          reconnectAttemptsRef.current < maxReconnectAttempts
        ) {
          reconnectAttemptsRef.current++;
          const backoff = Math.min(
            reconnectInterval * Math.pow(1.5, reconnectAttemptsRef.current - 1),
            30000,
          );
          logger.info('[useNotificationWS] Reconnecting in', backoff, 'ms', {
            attempt: reconnectAttemptsRef.current,
          });
          reconnectTimeoutRef.current = setTimeout(connect, backoff);
        }
      };

      wsRef.current = ws;
    } catch (err) {
      logger.error('[useNotificationWS] Connection failed:', err);
      setConnectionState('error');
      onError?.(
        err instanceof Error ? err : new Error('Connection failed'),
      );
    }
  }, [
    autoReconnect,
    reconnectInterval,
    maxReconnectAttempts,
    onConnect,
    onDisconnect,
    onError,
    handleMessage,
  ]);

  // ── Disconnect ────────────────────────────────────────────────────────

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    reconnectAttemptsRef.current = maxReconnectAttempts; // prevent auto-reconnect
    setConnectionState('disconnected');
    logger.info('[useNotificationWS] Manually disconnected');
  }, [maxReconnectAttempts]);

  // ── Reconnect ─────────────────────────────────────────────────────────

  const reconnect = useCallback(() => {
    reconnectAttemptsRef.current = 0;
    connect();
  }, [connect]);

  // ── Clear ─────────────────────────────────────────────────────────────

  const clearIncoming = useCallback(() => {
    setIncoming([]);
  }, []);

  // ── Cleanup ───────────────────────────────────────────────────────────

  useEffect(() => {
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  return {
    connectionState,
    isConnected,
    incoming,
    clearIncoming,
    connect,
    disconnect,
    reconnect,
  };
}

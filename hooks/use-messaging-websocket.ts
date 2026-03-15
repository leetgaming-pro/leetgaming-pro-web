/**
 * useMessagingWebSocket Hook
 * Real-time messaging via WebSocket — match comments, DMs, team messages.
 * Connects to /ws/messaging and dispatches events to registered callbacks.
 */

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { logger } from '@/lib/logger';
import type {
  Comment,
  DirectMessage,
  TeamMessage,
  MessagingWebSocketMessage,
} from '@/types/replay-api/messaging.types';
import { MessagingMessageTypes } from '@/types/replay-api/messaging.types';

// ── Connection States ───────────────────────────────────────────────────────

export type MessagingConnectionState =
  | 'connecting'
  | 'connected'
  | 'disconnected'
  | 'error';

// ── Hook Options ────────────────────────────────────────────────────────────

export interface UseMessagingWebSocketOptions {
  /** Auto-reconnect on disconnect (default: true) */
  autoReconnect?: boolean;
  /** Delay between reconnection attempts in ms (default: 3000) */
  reconnectInterval?: number;
  /** Maximum reconnection attempts (default: 10) */
  maxReconnectAttempts?: number;
  /** Callback when a new comment arrives */
  onNewComment?: (comment: Comment) => void;
  /** Callback when a comment is edited */
  onCommentEdited?: (comment: Comment) => void;
  /** Callback when a comment is deleted */
  onCommentDeleted?: (commentId: string) => void;
  /** Callback when a reaction is updated */
  onCommentReaction?: (data: { comment_id: string; emoji: string; user_id: string; remove: boolean }) => void;
  /** Callback when a new DM arrives */
  onNewDirectMessage?: (message: DirectMessage) => void;
  /** Callback when a new team message arrives */
  onNewTeamMessage?: (message: TeamMessage) => void;
  /** Callback for typing indicators */
  onTyping?: (data: { user_id: string; context_type: string; context_id: string }) => void;
  /** General connection callbacks */
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Error) => void;
}

// ── Hook Result ─────────────────────────────────────────────────────────────

export interface UseMessagingWebSocketResult {
  connectionState: MessagingConnectionState;
  isConnected: boolean;
  connect: () => void;
  disconnect: () => void;
  sendTyping: (contextType: string, contextId: string) => void;
}

// ── Hook Implementation ─────────────────────────────────────────────────────

export function useMessagingWebSocket(
  options: UseMessagingWebSocketOptions = {},
): UseMessagingWebSocketResult {
  const {
    autoReconnect = true,
    reconnectInterval = 3000,
    maxReconnectAttempts = 10,
    onNewComment,
    onCommentEdited,
    onCommentDeleted,
    onCommentReaction,
    onNewDirectMessage,
    onNewTeamMessage,
    onTyping,
    onConnect,
    onDisconnect,
    onError,
  } = options;

  const [connectionState, setConnectionState] = useState<MessagingConnectionState>('disconnected');
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const mountedRef = useRef(true);

  // Keep callback refs current to avoid stale closures
  const callbacksRef = useRef({
    onNewComment,
    onCommentEdited,
    onCommentDeleted,
    onCommentReaction,
    onNewDirectMessage,
    onNewTeamMessage,
    onTyping,
    onConnect,
    onDisconnect,
    onError,
  });

  useEffect(() => {
    callbacksRef.current = {
      onNewComment,
      onCommentEdited,
      onCommentDeleted,
      onCommentReaction,
      onNewDirectMessage,
      onNewTeamMessage,
      onTyping,
      onConnect,
      onDisconnect,
      onError,
    };
  });

  // ── Message dispatcher ────────────────────────────────────────────────

  const handleMessage = useCallback((event: MessageEvent) => {
    try {
      const msg: MessagingWebSocketMessage = JSON.parse(event.data);
      const cbs = callbacksRef.current;

      switch (msg.type) {
        case MessagingMessageTypes.NEW_COMMENT:
          cbs.onNewComment?.(msg.payload as Comment);
          break;
        case MessagingMessageTypes.COMMENT_EDITED:
          cbs.onCommentEdited?.(msg.payload as Comment);
          break;
        case MessagingMessageTypes.COMMENT_DELETED:
          cbs.onCommentDeleted?.((msg.payload as { comment_id: string }).comment_id);
          break;
        case MessagingMessageTypes.COMMENT_REACTION:
          cbs.onCommentReaction?.(
            msg.payload as { comment_id: string; emoji: string; user_id: string; remove: boolean },
          );
          break;
        case MessagingMessageTypes.NEW_DIRECT_MESSAGE:
          cbs.onNewDirectMessage?.(msg.payload as DirectMessage);
          break;
        case MessagingMessageTypes.NEW_TEAM_MESSAGE:
          cbs.onNewTeamMessage?.(msg.payload as TeamMessage);
          break;
        case MessagingMessageTypes.TYPING:
          cbs.onTyping?.(
            msg.payload as { user_id: string; context_type: string; context_id: string },
          );
          break;
        default:
          logger.warn('[MessagingWS] Unknown message type:', msg.type);
      }
    } catch (err) {
      logger.error('[MessagingWS] Failed to parse message:', err);
    }
  }, []);

  // ── Connect ───────────────────────────────────────────────────────────

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    // Build WS URL from window location
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/api/ws/messaging`;

    setConnectionState('connecting');
    logger.info('[MessagingWS] Connecting to', wsUrl);

    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      if (!mountedRef.current) return;
      reconnectAttemptsRef.current = 0;
      setConnectionState('connected');
      callbacksRef.current.onConnect?.();
      logger.info('[MessagingWS] Connected');
    };

    ws.onmessage = handleMessage;

    ws.onerror = (event) => {
      if (!mountedRef.current) return;
      setConnectionState('error');
      callbacksRef.current.onError?.(new Error('WebSocket error'));
      logger.error('[MessagingWS] Error:', event);
    };

    ws.onclose = () => {
      if (!mountedRef.current) return;
      setConnectionState('disconnected');
      callbacksRef.current.onDisconnect?.();

      // Auto-reconnect
      if (autoReconnect && reconnectAttemptsRef.current < maxReconnectAttempts) {
        reconnectAttemptsRef.current += 1;
        const delay = reconnectInterval * Math.min(reconnectAttemptsRef.current, 5);
        logger.info(
          `[MessagingWS] Reconnecting in ${delay}ms (attempt ${reconnectAttemptsRef.current})`,
        );
        reconnectTimerRef.current = setTimeout(() => {
          if (mountedRef.current) connect();
        }, delay);
      }
    };

    wsRef.current = ws;
  }, [autoReconnect, reconnectInterval, maxReconnectAttempts, handleMessage]);

  // ── Disconnect ────────────────────────────────────────────────────────

  const disconnect = useCallback(() => {
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
    }
    reconnectAttemptsRef.current = maxReconnectAttempts; // prevent auto-reconnect
    wsRef.current?.close();
    wsRef.current = null;
    setConnectionState('disconnected');
  }, [maxReconnectAttempts]);

  // ── Send typing indicator ─────────────────────────────────────────────

  const sendTyping = useCallback((contextType: string, contextId: string) => {
    if (wsRef.current?.readyState !== WebSocket.OPEN) return;

    const msg: MessagingWebSocketMessage = {
      type: 'typing' as const,
      payload: { context_type: contextType, context_id: contextId },
      timestamp: Date.now(),
    };

    wsRef.current.send(JSON.stringify(msg));
  }, []);

  // ── Cleanup ───────────────────────────────────────────────────────────

  useEffect(() => {
    return () => {
      mountedRef.current = false;
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
      wsRef.current?.close();
    };
  }, []);

  return {
    connectionState,
    isConnected: connectionState === 'connected',
    connect,
    disconnect,
    sendTyping,
  };
}

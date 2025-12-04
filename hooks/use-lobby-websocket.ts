/**
 * useLobbyWebSocket Hook
 * React hook for real-time lobby updates via WebSocket
 * Replaces polling with WebSocket for lower latency and reduced server load
 */

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { logger } from '@/lib/logger';
import type { MatchmakingLobby, PlayerSlot, LobbyStatus } from '@/types/replay-api/lobby.types';

// WebSocket message types (must match backend constants)
const MessageTypes = {
  LOBBY_UPDATE: 'lobby_update',
  PLAYER_JOINED: 'player_joined',
  PLAYER_LEFT: 'player_left',
  READY_STATUS_CHANGED: 'ready_status_changed',
  PRIZE_POOL_UPDATE: 'prize_pool_update',
  MATCH_STARTING: 'match_starting',
  LOBBY_CREATED: 'LOBBY_CREATED',
  LOBBY_UPDATED: 'LOBBY_UPDATED',
  LOBBY_READY: 'LOBBY_READY',
  LOBBY_CANCELLED: 'LOBBY_CANCELLED',
} as const;

// WebSocket message structure
interface WebSocketMessage {
  type: string;
  lobby_id?: string;
  pool_id?: string;
  payload: unknown;
  timestamp: number;
}

// Connection states
type ConnectionState = 'connecting' | 'connected' | 'disconnected' | 'error';

// Hook options
interface UseLobbyWebSocketOptions {
  autoReconnect?: boolean;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Error) => void;
}

// Hook result
interface UseLobbyWebSocketResult {
  // Connection state
  connectionState: ConnectionState;
  isConnected: boolean;
  // Lobby state
  lobby: MatchmakingLobby | null;
  // Actions
  subscribeLobby: (lobbyId: string) => void;
  unsubscribeLobby: () => void;
  disconnect: () => void;
  reconnect: () => void;
}

const getWebSocketUrl = (): string => {
  const apiUrl = process.env.NEXT_PUBLIC_REPLAY_API_URL || 'http://localhost:8080';
  // Convert http(s) to ws(s)
  const wsUrl = apiUrl.replace(/^http/, 'ws');
  return `${wsUrl}/ws`;
};

export function useLobbyWebSocket(options: UseLobbyWebSocketOptions = {}): UseLobbyWebSocketResult {
  const {
    autoReconnect = true,
    reconnectInterval = 3000,
    maxReconnectAttempts = 5,
    onConnect,
    onDisconnect,
    onError,
  } = options;

  const [connectionState, setConnectionState] = useState<ConnectionState>('disconnected');
  const [lobby, setLobby] = useState<MatchmakingLobby | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const subscribedLobbyIdRef = useRef<string | null>(null);

  const isConnected = connectionState === 'connected';

  // Connect to WebSocket
  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    const wsUrl = getWebSocketUrl();
    logger.info('[useLobbyWebSocket] Connecting to', wsUrl);
    setConnectionState('connecting');

    try {
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        logger.info('[useLobbyWebSocket] Connected');
        setConnectionState('connected');
        reconnectAttemptsRef.current = 0;
        onConnect?.();

        // Re-subscribe to lobby if we had one
        if (subscribedLobbyIdRef.current) {
          ws.send(JSON.stringify({
            type: 'subscribe_lobby',
            lobby_id: subscribedLobbyIdRef.current,
          }));
        }
      };

      ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          handleMessage(message);
        } catch (err) {
          logger.error('[useLobbyWebSocket] Failed to parse message:', err);
        }
      };

      ws.onerror = (event) => {
        logger.error('[useLobbyWebSocket] WebSocket error:', event);
        setConnectionState('error');
        onError?.(new Error('WebSocket error'));
      };

      ws.onclose = (event) => {
        logger.info('[useLobbyWebSocket] Disconnected', { code: event.code, reason: event.reason });
        setConnectionState('disconnected');
        wsRef.current = null;
        onDisconnect?.();

        // Auto reconnect if enabled
        if (autoReconnect && reconnectAttemptsRef.current < maxReconnectAttempts) {
          reconnectAttemptsRef.current++;
          logger.info('[useLobbyWebSocket] Scheduling reconnect', {
            attempt: reconnectAttemptsRef.current,
            maxAttempts: maxReconnectAttempts,
          });
          reconnectTimeoutRef.current = setTimeout(connect, reconnectInterval);
        }
      };

      wsRef.current = ws;
    } catch (err) {
      logger.error('[useLobbyWebSocket] Failed to connect:', err);
      setConnectionState('error');
      onError?.(err instanceof Error ? err : new Error('Connection failed'));
    }
  }, [autoReconnect, reconnectInterval, maxReconnectAttempts, onConnect, onDisconnect, onError]);

  // Handle incoming messages
  const handleMessage = useCallback((message: WebSocketMessage) => {
    logger.debug('[useLobbyWebSocket] Received message:', message.type);

    switch (message.type) {
      case MessageTypes.LOBBY_UPDATE:
      case MessageTypes.LOBBY_CREATED:
      case MessageTypes.LOBBY_UPDATED:
        if (message.payload && typeof message.payload === 'object') {
          setLobby(message.payload as MatchmakingLobby);
        }
        break;

      case MessageTypes.PLAYER_JOINED:
      case MessageTypes.PLAYER_LEFT:
      case MessageTypes.READY_STATUS_CHANGED:
        // These events contain the full lobby state
        if (message.payload && typeof message.payload === 'object') {
          const payload = message.payload as { lobby?: MatchmakingLobby };
          if (payload.lobby) {
            setLobby(payload.lobby);
          }
        }
        break;

      case MessageTypes.PRIZE_POOL_UPDATE:
        // Prize pool updates - just log for now, prize pool is fetched separately
        logger.debug('[useLobbyWebSocket] Prize pool update received');
        break;

      case MessageTypes.MATCH_STARTING:
        // Match is starting, update lobby status
        if (message.payload && typeof message.payload === 'object') {
          const payload = message.payload as { lobby?: MatchmakingLobby };
          if (payload.lobby) {
            setLobby(payload.lobby);
          }
        }
        break;

      case MessageTypes.LOBBY_READY:
        // All players ready
        setLobby((prev) => {
          if (!prev) return prev;
          return { ...prev, status: 'ready_check' as LobbyStatus };
        });
        break;

      case MessageTypes.LOBBY_CANCELLED:
        // Lobby was cancelled
        setLobby((prev) => {
          if (!prev) return prev;
          return { ...prev, status: 'cancelled' as LobbyStatus };
        });
        break;

      default:
        logger.warn('[useLobbyWebSocket] Unknown message type:', message.type);
    }
  }, []);

  // Subscribe to a lobby
  const subscribeLobby = useCallback((lobbyId: string) => {
    subscribedLobbyIdRef.current = lobbyId;

    // Connect if not already connected
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      connect();
      return; // Will subscribe after connection
    }

    // Send subscribe message
    wsRef.current.send(JSON.stringify({
      type: 'subscribe_lobby',
      lobby_id: lobbyId,
    }));

    logger.info('[useLobbyWebSocket] Subscribed to lobby', lobbyId);
  }, [connect]);

  // Unsubscribe from lobby
  const unsubscribeLobby = useCallback(() => {
    subscribedLobbyIdRef.current = null;
    setLobby(null);

    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'unsubscribe_lobby',
      }));
    }

    logger.info('[useLobbyWebSocket] Unsubscribed from lobby');
  }, []);

  // Disconnect WebSocket
  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    reconnectAttemptsRef.current = maxReconnectAttempts; // Prevent auto reconnect
    setConnectionState('disconnected');
    logger.info('[useLobbyWebSocket] Manually disconnected');
  }, [maxReconnectAttempts]);

  // Manual reconnect
  const reconnect = useCallback(() => {
    reconnectAttemptsRef.current = 0;
    connect();
  }, [connect]);

  // Cleanup on unmount
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
    lobby,
    subscribeLobby,
    unsubscribeLobby,
    disconnect,
    reconnect,
  };
}

// Re-export types for convenience
export type { WebSocketMessage, ConnectionState, UseLobbyWebSocketOptions, UseLobbyWebSocketResult };

/**
 * useLobbyWebSocket Hook
 * React hook for real-time lobby updates via WebSocket
 * Replaces polling with WebSocket for lower latency and reduced server load
 */

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { logger } from '@/lib/logger';
import type { MatchmakingLobby, LobbyStatus } from '@/types/replay-api/lobby.types';

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
  // Readiness confirmation events
  READY_CHECK_STARTED: 'READY_CHECK_STARTED',
  READINESS_CONFIRMED: 'READINESS_CONFIRMED',
  READINESS_DECLINED: 'READINESS_DECLINED',
  READY_CHECK_TIMEOUT: 'READY_CHECK_TIMEOUT',
  ALL_PLAYERS_READY: 'ALL_PLAYERS_READY',
  GAME_CONNECTION_INFO: 'GAME_CONNECTION_INFO',
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
  /** Called when a ready check is initiated (all players must confirm) */
  onReadyCheckStarted?: (payload: ReadyCheckStartedPayload) => void;
  /** Called when a player confirms readiness */
  onReadinessConfirmed?: (payload: ReadinessUpdatePayload) => void;
  /** Called when a player declines readiness */
  onReadinessDeclined?: (payload: ReadinessUpdatePayload) => void;
  /** Called when the ready check times out */
  onReadyCheckTimeout?: (payload: ReadyCheckTimeoutPayload) => void;
  /** Called when all players are confirmed ready */
  onAllPlayersReady?: (payload: AllPlayersReadyPayload) => void;
  /** Called when game connection info is available */
  onGameConnectionInfo?: (payload: GameConnectionInfoPayload) => void;
}

/** Payload for READY_CHECK_STARTED events */
export interface ReadyCheckStartedPayload {
  lobby_id: string;
  players: Array<{ player_id: string; display_name: string; avatar_url?: string }>;
  timeout_seconds: number;
  started_at: string;
}

/** Payload for READINESS_CONFIRMED / READINESS_DECLINED events */
export interface ReadinessUpdatePayload {
  lobby_id: string;
  player_id: string;
  status: 'confirmed' | 'declined';
  confirmed_count: number;
  total_count: number;
}

/** Payload for READY_CHECK_TIMEOUT events */
export interface ReadyCheckTimeoutPayload {
  lobby_id: string;
  timed_out_players: string[];
}

/** Payload for ALL_PLAYERS_READY events */
export interface AllPlayersReadyPayload {
  lobby_id: string;
  match_id?: string;
}

/** Payload for GAME_CONNECTION_INFO events */
export interface GameConnectionInfoPayload {
  lobby_id: string;
  server_url?: string;
  server_ip?: string;
  port?: number;
  passcode?: string;
  qr_code_data?: string;
  deep_link?: string;
  instructions: string;
  expires_at?: string;
  game_id: string;
  region: string;
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
  const apiUrl = process.env.NEXT_PUBLIC_REPLAY_API_URL || 'https://api.leetgaming.pro';
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
    onReadyCheckStarted,
    onReadinessConfirmed,
    onReadinessDeclined,
    onReadyCheckTimeout,
    onAllPlayersReady,
    onGameConnectionInfo,
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

      // Readiness confirmation events
      case MessageTypes.READY_CHECK_STARTED:
        logger.info('[useLobbyWebSocket] Ready check started');
        onReadyCheckStarted?.(message.payload as ReadyCheckStartedPayload);
        break;

      case MessageTypes.READINESS_CONFIRMED:
        logger.info('[useLobbyWebSocket] Player confirmed readiness');
        onReadinessConfirmed?.(message.payload as ReadinessUpdatePayload);
        break;

      case MessageTypes.READINESS_DECLINED:
        logger.info('[useLobbyWebSocket] Player declined readiness');
        onReadinessDeclined?.(message.payload as ReadinessUpdatePayload);
        break;

      case MessageTypes.READY_CHECK_TIMEOUT:
        logger.info('[useLobbyWebSocket] Ready check timed out');
        onReadyCheckTimeout?.(message.payload as ReadyCheckTimeoutPayload);
        break;

      case MessageTypes.ALL_PLAYERS_READY:
        logger.info('[useLobbyWebSocket] All players ready');
        onAllPlayersReady?.(message.payload as AllPlayersReadyPayload);
        setLobby((prev) => {
          if (!prev) return prev;
          return { ...prev, status: 'starting' as LobbyStatus };
        });
        break;

      case MessageTypes.GAME_CONNECTION_INFO:
        logger.info('[useLobbyWebSocket] Game connection info received');
        onGameConnectionInfo?.(message.payload as GameConnectionInfoPayload);
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
export type {
  WebSocketMessage,
  ConnectionState,
  UseLobbyWebSocketOptions,
  UseLobbyWebSocketResult,
};

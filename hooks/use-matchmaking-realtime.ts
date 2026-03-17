/**
 * useMatchmakingRealtime Hook
 * Bridges useLobbyWebSocket + useNotificationWebSocket into the
 * matchmaking wizard's ready-check flow. Automatically subscribes
 * to the lobby when a ready check becomes active and routes incoming
 * WebSocket events to the wizard context.
 *
 * Usage: call once inside the WizardProvider tree.
 */

'use client';

import { useEffect, useCallback, useRef } from 'react';
import { useLobbyWebSocket } from '@/hooks/use-lobby-websocket';
import { useNotificationWebSocket } from '@/hooks/use-notification-websocket';
import { useToast } from '@/components/toast/toast-provider';
import { logger } from '@/lib/logger';
import type { ReadyCheckStartedPayload, ReadinessUpdatePayload, AllPlayersReadyPayload, GameConnectionInfoPayload } from '@/hooks/use-lobby-websocket';
import type { Notification } from '@/types/replay-api/notifications.sdk';

interface UseMatchmakingRealtimeOptions {
  /** Whether a ready check is currently active */
  readyCheckActive: boolean;
  /** Lobby ID to subscribe to */
  lobbyId: string | undefined;
  /** Current player ID */
  currentPlayerId: string | undefined;
  /** Update a player's status in the ready check */
  updateReadyCheckPlayer: (playerId: string, status: 'confirmed' | 'declined' | 'timed_out') => void;
  /** Navigate after all players confirmed */
  handleAllPlayersReady: (matchId?: string) => void;
}

export function useMatchmakingRealtime({
  readyCheckActive,
  lobbyId,
  currentPlayerId,
  updateReadyCheckPlayer,
  handleAllPlayersReady,
}: UseMatchmakingRealtimeOptions) {
  const { showToast } = useToast();

  // Track whether we've already fired the all-ready handler to prevent double navigation
  const allReadyFiredRef = useRef(false);
  useEffect(() => {
    if (!readyCheckActive) {
      allReadyFiredRef.current = false;
    }
  }, [readyCheckActive]);

  // ── Lobby WebSocket callbacks ─────────────────────────────────────────
  const onReadyCheckStarted = useCallback(
    (payload: ReadyCheckStartedPayload) => {
      logger.info('[useMatchmakingRealtime] Ready check started via WS', payload.lobby_id);
      showToast('Match found! Accept to play.', 'match', 8000, 'Ready Check');
    },
    [showToast],
  );

  const onReadinessConfirmed = useCallback(
    (payload: ReadinessUpdatePayload) => {
      logger.info('[useMatchmakingRealtime] Player confirmed', payload.player_id);
      updateReadyCheckPlayer(payload.player_id, 'confirmed');

      // Don't toast for self — UX already handled by optimistic update
      if (payload.player_id !== currentPlayerId) {
        showToast(
          `Player accepted (${payload.confirmed_count}/${payload.total_count})`,
          'info',
          3000,
        );
      }
    },
    [updateReadyCheckPlayer, currentPlayerId, showToast],
  );

  const onReadinessDeclined = useCallback(
    (payload: ReadinessUpdatePayload) => {
      logger.info('[useMatchmakingRealtime] Player declined', payload.player_id);
      updateReadyCheckPlayer(payload.player_id, 'declined');
      if (payload.player_id !== currentPlayerId) {
        showToast('A player declined the match.', 'warning', 5000);
      }
    },
    [updateReadyCheckPlayer, currentPlayerId, showToast],
  );

  const onReadyCheckTimeout = useCallback(
    () => {
      logger.info('[useMatchmakingRealtime] Ready check timed out');
      showToast('Ready check timed out — returning to queue.', 'warning', 5000);
    },
    [showToast],
  );

  const onAllPlayersReady = useCallback(
    (payload: AllPlayersReadyPayload) => {
      if (allReadyFiredRef.current) return;
      allReadyFiredRef.current = true;

      logger.info('[useMatchmakingRealtime] All players ready!', payload);
      showToast('All players ready! Loading match...', 'match', 4000, 'Match Starting');
      handleAllPlayersReady(payload.match_id);
    },
    [handleAllPlayersReady, showToast],
  );

  const onGameConnectionInfo = useCallback(
    (payload: GameConnectionInfoPayload) => {
      logger.info('[useMatchmakingRealtime] Game connection info received');
      showToast(
        payload.instructions || 'Server is ready! Connect now.',
        'connection',
        15000,
        'Server Ready',
      );
    },
    [showToast],
  );

  // ── Lobby WebSocket hook ──────────────────────────────────────────────
  const lobbyWs = useLobbyWebSocket({
    onReadyCheckStarted,
    onReadinessConfirmed,
    onReadinessDeclined,
    onReadyCheckTimeout,
    onAllPlayersReady,
    onGameConnectionInfo,
  });

  // Subscribe to lobby when ready check becomes active
  useEffect(() => {
    if (readyCheckActive && lobbyId) {
      lobbyWs.subscribeLobby(lobbyId);
    } else {
      lobbyWs.unsubscribeLobby();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [readyCheckActive, lobbyId]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      lobbyWs.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Notification WebSocket (matchmaking-specific toasts) ──────────────
  const onNotification = useCallback(
    (notification: Notification) => {
      // Filter matchmaking-related notification types
      const matchmakingTypes: Array<Notification['type']> = [
        'match',
        'ready-check',
        'connection',
      ];

      if (matchmakingTypes.includes(notification.type)) {
        const toastType: 'match' | 'connection' | 'info' =
          notification.type === 'connection'
            ? 'connection'
            : notification.type === 'match'
              ? 'match'
              : 'info';

        showToast(
          notification.message || notification.title,
          toastType,
          6000,
          notification.title,
        );
      }
    },
    [showToast],
  );

  const notifWs = useNotificationWebSocket({
    onNotification,
  });

  // Connect notification WS when ready check active (for real-time push)
  useEffect(() => {
    if (readyCheckActive) {
      notifWs.connect();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [readyCheckActive]);

  return {
    lobbyConnectionState: lobbyWs.connectionState,
    isLobbyConnected: lobbyWs.isConnected,
    lobby: lobbyWs.lobby,
    isNotificationConnected: notifWs.isConnected,
  };
}

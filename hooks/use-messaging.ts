/**
 * useMessaging Hook
 * React hook for direct messages and team messages
 */

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSDK } from '@/contexts/sdk-context';
import { logger } from '@/lib/logger';
import type {
  Conversation,
  DirectMessage,
  TeamMessage,
  TeamChannelSummary,
  Mention,
  ChannelType,
} from '@/types/replay-api/messaging.types';

// ── Hook Types ──────────────────────────────────────────────────────────────

export interface UseDirectMessagesResult {
  // State
  conversations: Conversation[];
  activeMessages: DirectMessage[];
  activeTotalCount: number;
  isLoading: boolean;
  isSending: boolean;
  error: string | null;
  hasMore: boolean;
  // Actions
  refreshConversations: () => Promise<void>;
  openConversation: (userId: string) => Promise<void>;
  loadMoreMessages: () => Promise<void>;
  sendMessage: (userId: string, content: string, mentions?: Mention[]) => Promise<DirectMessage | null>;
  markRead: (userId: string) => Promise<boolean>;
  deleteMessage: (messageId: string) => Promise<boolean>;
}

export function useDirectMessages(): UseDirectMessagesResult {
  const { sdk } = useSDK();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeMessages, setActiveMessages] = useState<DirectMessage[]>([]);
  const [activeTotalCount, setActiveTotalCount] = useState(0);
  const [activeUserId, setActiveUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [offset, setOffset] = useState(0);

  const mountedRef = useRef(true);
  useEffect(() => () => { mountedRef.current = false; }, []);

  // ── Conversations ─────────────────────────────────────────────────────

  const refreshConversations = useCallback(async () => {
    if (!sdk) return;
    setIsLoading(true);
    setError(null);

    try {
      const result = await sdk.messaging.listConversations({ limit: 50 });
      if (mountedRef.current && result) {
        setConversations(result);
      }
    } catch (err) {
      if (mountedRef.current) {
        setError(err instanceof Error ? err.message : 'Failed to load conversations');
      }
    } finally {
      if (mountedRef.current) setIsLoading(false);
    }
  }, [sdk]);

  useEffect(() => {
    refreshConversations();
  }, [refreshConversations]);

  // ── Conversation Detail ───────────────────────────────────────────────

  const openConversation = useCallback(
    async (userId: string) => {
      if (!sdk) return;
      setActiveUserId(userId);
      setIsLoading(true);
      setError(null);
      setOffset(0);

      try {
        const result = await sdk.messaging.getConversation(userId, { limit: 50 });
        if (mountedRef.current && result) {
          setActiveMessages(result.messages);
          setActiveTotalCount(result.total_count);
          setOffset(result.messages.length);
        }
      } catch (err) {
        if (mountedRef.current) {
          setError(err instanceof Error ? err.message : 'Failed to open conversation');
        }
      } finally {
        if (mountedRef.current) setIsLoading(false);
      }
    },
    [sdk],
  );

  const loadMoreMessages = useCallback(async () => {
    if (!sdk || !activeUserId) return;
    setIsLoading(true);

    try {
      const result = await sdk.messaging.getConversation(activeUserId, {
        limit: 50,
        offset,
      });
      if (mountedRef.current && result) {
        setActiveMessages((prev) => [...prev, ...result.messages]);
        setOffset((prev) => prev + result.messages.length);
      }
    } catch (err) {
      logger.error('[useDirectMessages] loadMoreMessages error:', err);
    } finally {
      if (mountedRef.current) setIsLoading(false);
    }
  }, [sdk, activeUserId, offset]);

  // ── Commands ──────────────────────────────────────────────────────────

  const sendMessage = useCallback(
    async (userId: string, content: string, mentions?: Mention[]): Promise<DirectMessage | null> => {
      if (!sdk) return null;
      setIsSending(true);
      setError(null);

      try {
        const dm = await sdk.messaging.sendDirectMessage(userId, {
          recipient_id: userId,
          content,
          mentions,
        });

        if (dm && mountedRef.current) {
          // Optimistic: append message
          setActiveMessages((prev) => [dm, ...prev]);
          setActiveTotalCount((prev) => prev + 1);
        }

        return dm;
      } catch (err) {
        if (mountedRef.current) {
          setError(err instanceof Error ? err.message : 'Failed to send message');
        }
        return null;
      } finally {
        if (mountedRef.current) setIsSending(false);
      }
    },
    [sdk],
  );

  const markRead = useCallback(
    async (userId: string): Promise<boolean> => {
      if (!sdk) return false;
      try {
        const success = await sdk.messaging.markConversationRead(userId);
        if (success && mountedRef.current) {
          setConversations((prev) =>
            prev.map((c) =>
              c.participant.id === userId ? { ...c, unread_count: 0 } : c,
            ),
          );
        }
        return success;
      } catch (err) {
        logger.error('[useDirectMessages] markRead error:', err);
        return false;
      }
    },
    [sdk],
  );

  const deleteMessage = useCallback(
    async (messageId: string): Promise<boolean> => {
      if (!sdk) return false;
      try {
        const success = await sdk.messaging.deleteDirectMessage(messageId);
        if (success && mountedRef.current) {
          setActiveMessages((prev) => prev.filter((m) => m.id !== messageId));
          setActiveTotalCount((prev) => Math.max(0, prev - 1));
        }
        return success;
      } catch (err) {
        if (mountedRef.current) {
          setError(err instanceof Error ? err.message : 'Failed to delete message');
        }
        return false;
      }
    },
    [sdk],
  );

  return {
    conversations,
    activeMessages,
    activeTotalCount,
    isLoading,
    isSending,
    error,
    hasMore: activeMessages.length < activeTotalCount,
    refreshConversations,
    openConversation,
    loadMoreMessages,
    sendMessage,
    markRead,
    deleteMessage,
  };
}

// ── Team Messages Hook ──────────────────────────────────────────────────────

export interface UseTeamMessagesResult {
  // State
  channels: TeamChannelSummary[];
  messages: TeamMessage[];
  totalCount: number;
  isLoading: boolean;
  isSending: boolean;
  error: string | null;
  hasMore: boolean;
  // Actions
  refreshChannels: () => Promise<void>;
  loadMessages: (channel?: ChannelType) => Promise<void>;
  loadMore: () => Promise<void>;
  sendMessage: (channel: ChannelType, content: string, mentions?: Mention[]) => Promise<TeamMessage | null>;
}

export function useTeamMessages(teamId: string | undefined): UseTeamMessagesResult {
  const { sdk } = useSDK();

  const [channels, setChannels] = useState<TeamChannelSummary[]>([]);
  const [messages, setMessages] = useState<TeamMessage[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [activeChannel, setActiveChannel] = useState<ChannelType | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [offset, setOffset] = useState(0);

  const mountedRef = useRef(true);
  useEffect(() => () => { mountedRef.current = false; }, []);

  // ── Channels ──────────────────────────────────────────────────────────

  const refreshChannels = useCallback(async () => {
    if (!sdk || !teamId) return;

    try {
      const result = await sdk.messaging.listTeamChannels(teamId);
      if (mountedRef.current && result) {
        setChannels(result);
      }
    } catch (err) {
      logger.error('[useTeamMessages] refreshChannels error:', err);
    }
  }, [sdk, teamId]);

  useEffect(() => {
    if (teamId) refreshChannels();
  }, [teamId, refreshChannels]);

  // ── Messages ──────────────────────────────────────────────────────────

  const loadMessages = useCallback(
    async (channel?: ChannelType) => {
      if (!sdk || !teamId) return;
      setActiveChannel(channel);
      setIsLoading(true);
      setError(null);
      setOffset(0);

      try {
        const result = await sdk.messaging.listTeamMessages(teamId, {
          channel,
          limit: 50,
        });
        if (mountedRef.current && result) {
          setMessages(result.messages);
          setTotalCount(result.total_count);
          setOffset(result.messages.length);
        }
      } catch (err) {
        if (mountedRef.current) {
          setError(err instanceof Error ? err.message : 'Failed to load messages');
        }
      } finally {
        if (mountedRef.current) setIsLoading(false);
      }
    },
    [sdk, teamId],
  );

  const loadMore = useCallback(async () => {
    if (!sdk || !teamId) return;
    setIsLoading(true);

    try {
      const result = await sdk.messaging.listTeamMessages(teamId, {
        channel: activeChannel,
        limit: 50,
        offset,
      });
      if (mountedRef.current && result) {
        setMessages((prev) => [...prev, ...result.messages]);
        setOffset((prev) => prev + result.messages.length);
      }
    } catch (err) {
      logger.error('[useTeamMessages] loadMore error:', err);
    } finally {
      if (mountedRef.current) setIsLoading(false);
    }
  }, [sdk, teamId, activeChannel, offset]);

  // ── Send ──────────────────────────────────────────────────────────────

  const sendMessage = useCallback(
    async (channel: ChannelType, content: string, mentions?: Mention[]): Promise<TeamMessage | null> => {
      if (!sdk || !teamId) return null;
      setIsSending(true);
      setError(null);

      try {
        const msg = await sdk.messaging.sendTeamMessage(teamId, {
          team_id: teamId,
          channel,
          content,
          mentions,
        });

        if (msg && mountedRef.current) {
          setMessages((prev) => [msg, ...prev]);
          setTotalCount((prev) => prev + 1);
        }

        return msg;
      } catch (err) {
        if (mountedRef.current) {
          setError(err instanceof Error ? err.message : 'Failed to send message');
        }
        return null;
      } finally {
        if (mountedRef.current) setIsSending(false);
      }
    },
    [sdk, teamId],
  );

  return {
    channels,
    messages,
    totalCount,
    isLoading,
    isSending,
    error,
    hasMore: messages.length < totalCount,
    refreshChannels,
    loadMessages,
    loadMore,
    sendMessage,
  };
}

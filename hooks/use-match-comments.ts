/**
 * useMatchComments Hook
 * React hook for match comments with real-time updates and optimistic UI
 */

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSDK } from '@/contexts/sdk-context';
import { logger } from '@/lib/logger';
import type {
  Comment,
  CommentListResult,
  CreateCommentRequest,
  EditCommentRequest,
  ListCommentsParams,
  Mention,
} from '@/types/replay-api/messaging.types';

// ── Hook Types ──────────────────────────────────────────────────────────────

export interface UseMatchCommentsOptions {
  /** Initial page size (default: 20) */
  pageSize?: number;
  /** Sort order (default: 'newest') */
  sort?: 'newest' | 'oldest' | 'most_reactions';
  /** Auto-fetch on mount (default: true) */
  autoFetch?: boolean;
}

export interface UseMatchCommentsResult {
  // State
  comments: Comment[];
  totalCount: number;
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;
  hasMore: boolean;
  // Actions
  refresh: () => Promise<void>;
  loadMore: () => Promise<void>;
  createComment: (content: string, mentions?: Mention[], parentId?: string) => Promise<Comment | null>;
  editComment: (commentId: string, content: string, mentions?: Mention[]) => Promise<boolean>;
  deleteComment: (commentId: string) => Promise<boolean>;
  reactToComment: (commentId: string, emoji: string, remove?: boolean) => Promise<boolean>;
  getReplies: (commentId: string, limit?: number, offset?: number) => Promise<CommentListResult | null>;
}

export function useMatchComments(
  matchId: string | undefined,
  options: UseMatchCommentsOptions = {},
): UseMatchCommentsResult {
  const { sdk } = useSDK();
  const { pageSize = 20, sort = 'newest', autoFetch = true } = options;

  const [comments, setComments] = useState<Comment[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [offset, setOffset] = useState(0);

  const mountedRef = useRef(true);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // ── Fetch comments ──────────────────────────────────────────────────────

  const fetchComments = useCallback(
    async (params: ListCommentsParams & { append?: boolean } = {}) => {
      if (!matchId || !sdk) return;

      setIsLoading(true);
      setError(null);

      try {
        const result = await sdk.messaging.listMatchComments(matchId, {
          limit: params.limit ?? pageSize,
          offset: params.offset ?? 0,
          sort: params.sort ?? sort,
        });

        if (!mountedRef.current) return;

        if (result) {
          if (params.append) {
            setComments((prev) => [...prev, ...result.comments]);
          } else {
            setComments(result.comments);
          }
          setTotalCount(result.total_count);
          setOffset((params.offset ?? 0) + result.comments.length);
        }
      } catch (err) {
        if (mountedRef.current) {
          const message = err instanceof Error ? err.message : 'Failed to load comments';
          setError(message);
          logger.error('[useMatchComments] fetchComments error:', err);
        }
      } finally {
        if (mountedRef.current) {
          setIsLoading(false);
        }
      }
    },
    [matchId, sdk, pageSize, sort],
  );

  // ── Auto-fetch ────────────────────────────────────────────────────────

  useEffect(() => {
    if (autoFetch && matchId) {
      fetchComments();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matchId, autoFetch]);

  // ── Actions ───────────────────────────────────────────────────────────

  const refresh = useCallback(async () => {
    setOffset(0);
    await fetchComments({ offset: 0 });
  }, [fetchComments]);

  const loadMore = useCallback(async () => {
    await fetchComments({ offset, append: true });
  }, [fetchComments, offset]);

  const createComment = useCallback(
    async (content: string, mentions?: Mention[], parentId?: string): Promise<Comment | null> => {
      if (!matchId || !sdk) return null;

      setIsSubmitting(true);
      setError(null);

      try {
        const request: CreateCommentRequest = {
          match_id: matchId,
          content,
          mentions,
          parent_id: parentId,
        };

        const comment = await sdk.messaging.createComment(matchId, request);

        if (comment && mountedRef.current) {
          // Optimistic: prepend the new comment
          setComments((prev) => [comment, ...prev]);
          setTotalCount((prev) => prev + 1);
        }

        return comment;
      } catch (err) {
        if (mountedRef.current) {
          const message = err instanceof Error ? err.message : 'Failed to create comment';
          setError(message);
        }
        return null;
      } finally {
        if (mountedRef.current) {
          setIsSubmitting(false);
        }
      }
    },
    [matchId, sdk],
  );

  const editComment = useCallback(
    async (commentId: string, content: string, mentions?: Mention[]): Promise<boolean> => {
      if (!matchId || !sdk) return false;

      setError(null);

      try {
        const request: EditCommentRequest = { content, mentions };
        const updated = await sdk.messaging.editComment(matchId, commentId, request);

        if (updated && mountedRef.current) {
          setComments((prev) =>
            prev.map((c) => (c.id === commentId ? { ...c, ...updated } : c)),
          );
        }

        return !!updated;
      } catch (err) {
        if (mountedRef.current) {
          const message = err instanceof Error ? err.message : 'Failed to edit comment';
          setError(message);
        }
        return false;
      }
    },
    [matchId, sdk],
  );

  const deleteComment = useCallback(
    async (commentId: string): Promise<boolean> => {
      if (!matchId || !sdk) return false;

      setError(null);

      try {
        const success = await sdk.messaging.deleteComment(matchId, commentId);

        if (success && mountedRef.current) {
          // Optimistic: mark the comment as deleted in place
          setComments((prev) =>
            prev.map((c) =>
              c.id === commentId ? { ...c, status: 'deleted' as const, content: '[deleted]' } : c,
            ),
          );
        }

        return success;
      } catch (err) {
        if (mountedRef.current) {
          const message = err instanceof Error ? err.message : 'Failed to delete comment';
          setError(message);
        }
        return false;
      }
    },
    [matchId, sdk],
  );

  const reactToComment = useCallback(
    async (commentId: string, emoji: string, remove = false): Promise<boolean> => {
      if (!matchId || !sdk) return false;

      try {
        return await sdk.messaging.reactToComment(matchId, commentId, { emoji, remove });
      } catch (err) {
        logger.error('[useMatchComments] reactToComment error:', err);
        return false;
      }
    },
    [matchId, sdk],
  );

  const getReplies = useCallback(
    async (
      commentId: string,
      limit = 20,
      replyOffset = 0,
    ): Promise<CommentListResult | null> => {
      if (!matchId || !sdk) return null;

      try {
        return await sdk.messaging.getCommentReplies(matchId, commentId, limit, replyOffset);
      } catch (err) {
        logger.error('[useMatchComments] getReplies error:', err);
        return null;
      }
    },
    [matchId, sdk],
  );

  return {
    comments,
    totalCount,
    isLoading,
    isSubmitting,
    error,
    hasMore: comments.length < totalCount,
    refresh,
    loadMore,
    createComment,
    editComment,
    deleteComment,
    reactToComment,
    getReplies,
  };
}

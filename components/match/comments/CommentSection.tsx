'use client';

import React, { useCallback } from 'react';
import { Button, Spinner } from '@nextui-org/react';
import { Icon } from '@iconify/react';
import { cn } from '@nextui-org/react';
import { useMatchComments } from '@/hooks/use-match-comments';
import { useMessagingWebSocket } from '@/hooks/use-messaging-websocket';
import { CommentCard } from './CommentCard';
import { CommentInput } from './CommentInput';
import type { Mention, Comment } from '@/types/replay-api/messaging.types';

interface CommentSectionProps {
  matchId: string;
  /** Current user's ID */
  currentUserId?: string;
  /** Current user's avatar */
  currentUserAvatar?: string;
  /** Navigate to a player profile */
  onAuthorClick?: (authorId: string, slug?: string) => void;
  /** Show real-time updates via WebSocket */
  enableRealtime?: boolean;
  className?: string;
}

export function CommentSection({
  matchId,
  currentUserId,
  currentUserAvatar,
  onAuthorClick,
  enableRealtime = true,
  className,
}: CommentSectionProps) {
  const {
    comments,
    totalCount,
    isLoading,
    isSubmitting,
    error,
    hasMore,
    refresh,
    loadMore,
    createComment,
    editComment,
    deleteComment,
    reactToComment,
  } = useMatchComments(matchId, { sort: 'newest' });

  // ── Real-time WebSocket callbacks (must be unconditional) ─────────────

  const handleWsNewComment = useCallback(
    (comment: Comment) => {
      if (comment.match_id === matchId) {
        refresh();
      }
    },
    [matchId, refresh],
  );

  const handleWsCommentEdited = useCallback(
    (comment: Comment) => {
      if (comment.match_id === matchId) {
        refresh();
      }
    },
    [matchId, refresh],
  );

  const handleWsCommentDeleted = useCallback(() => {
    refresh();
  }, [refresh]);

  useMessagingWebSocket(
    enableRealtime
      ? {
          onNewComment: handleWsNewComment,
          onCommentEdited: handleWsCommentEdited,
          onCommentDeleted: handleWsCommentDeleted,
        }
      : {},
  );

  // ── Handlers ───────────────────────────────────────────────────────────

  const handleSubmit = useCallback(
    async (content: string, mentions: Mention[]) => {
      await createComment(content, mentions);
    },
    [createComment],
  );

  const handleReply = useCallback(
    async (content: string, mentions: Mention[], parentId: string) => {
      await createComment(content, mentions, parentId);
    },
    [createComment],
  );

  const handleEdit = useCallback(
    async (commentId: string, content: string, mentions: Mention[]): Promise<boolean> => {
      return editComment(commentId, content, mentions);
    },
    [editComment],
  );

  const handleDelete = useCallback(
    async (commentId: string): Promise<boolean> => {
      return deleteComment(commentId);
    },
    [deleteComment],
  );

  const handleReact = useCallback(
    async (commentId: string, emoji: string, remove: boolean): Promise<boolean> => {
      return reactToComment(commentId, emoji, remove);
    },
    [reactToComment],
  );

  // ── Render ─────────────────────────────────────────────────────────────

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon icon="solar:chat-round-dots-bold" className="text-primary" width={20} />
          <h3 className="text-lg font-semibold">
            Comments
            {totalCount > 0 && (
              <span className="text-default-400 text-sm font-normal ml-2">
                ({totalCount})
              </span>
            )}
          </h3>
        </div>

        <Button
          size="sm"
          variant="light"
          isIconOnly
          onPress={refresh}
          isLoading={isLoading}
          aria-label="Refresh comments"
        >
          <Icon icon="solar:refresh-bold" width={16} />
        </Button>
      </div>

      {/* Comment input */}
      {currentUserId && (
        <CommentInput
          placeholder="Share your thoughts on this match..."
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          avatarUrl={currentUserAvatar}
        />
      )}

      {/* Error */}
      {error && (
        <div className="rounded-lg bg-danger/10 border border-danger/20 p-3 text-sm text-danger">
          <Icon icon="solar:danger-triangle-bold" className="inline mr-1" width={16} />
          {error}
        </div>
      )}

      {/* Loading */}
      {isLoading && comments.length === 0 && (
        <div className="flex justify-center py-8">
          <Spinner size="lg" />
        </div>
      )}

      {/* Empty state */}
      {!isLoading && comments.length === 0 && (
        <div className="text-center py-12 text-default-400">
          <Icon icon="solar:chat-round-dots-linear" width={48} className="mx-auto mb-3 opacity-50" />
          <p className="text-sm">No comments yet.</p>
          {currentUserId && (
            <p className="text-xs mt-1">Be the first to comment on this match!</p>
          )}
        </div>
      )}

      {/* Comment list */}
      <div className="space-y-4">
        {comments.map((comment) => (
          <CommentCard
            key={comment.id}
            comment={comment}
            currentUserId={currentUserId}
            onReact={handleReact}
            onReply={handleReply}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onAuthorClick={onAuthorClick}
          />
        ))}
      </div>

      {/* Load more */}
      {hasMore && (
        <div className="flex justify-center">
          <Button
            size="sm"
            variant="flat"
            onPress={loadMore}
            isLoading={isLoading}
            startContent={!isLoading && <Icon icon="solar:alt-arrow-down-linear" width={16} />}
          >
            Load more comments
          </Button>
        </div>
      )}
    </div>
  );
}

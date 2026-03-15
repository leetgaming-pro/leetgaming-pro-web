'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { Avatar, Button, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from '@nextui-org/react';
import { Icon } from '@iconify/react';
import { cn } from '@nextui-org/react';
import { formatDistanceToNow } from 'date-fns';
import type { Comment as CommentType } from '@/types/replay-api/messaging.types';
import { CommentInput } from './CommentInput';
import type { Mention } from '@/types/replay-api/messaging.types';

// ── Reaction Emojis ─────────────────────────────────────────────────────────

const QUICK_REACTIONS = ['👍', '❤️', '🔥', '😂', '🎯', '💀'];

// ── Props ────────────────────────────────────────────────────────────────────

interface CommentCardProps {
  comment: CommentType;
  /** Current user's ID for highlighting own comments and reactions */
  currentUserId?: string;
  /** Called when a reaction is toggled */
  onReact?: (commentId: string, emoji: string, remove: boolean) => Promise<boolean>;
  /** Called when reply is submitted */
  onReply?: (content: string, mentions: Mention[], parentId: string) => Promise<void>;
  /** Called when comment is edited */
  onEdit?: (commentId: string, content: string, mentions: Mention[]) => Promise<boolean>;
  /** Called when comment is deleted */
  onDelete?: (commentId: string) => Promise<boolean>;
  /** Click on author to navigate to profile */
  onAuthorClick?: (authorId: string, slug?: string) => void;
  /** Depth for nested replies */
  depth?: number;
  className?: string;
}

export function CommentCard({
  comment,
  currentUserId,
  onReact,
  onReply,
  onEdit,
  onDelete,
  onAuthorClick,
  depth = 0,
  className,
}: CommentCardProps) {
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [_editContent, _setEditContent] = useState(comment.content);

  const isDeleted = comment.status === 'deleted';
  const isOwn = currentUserId && comment.author.id === currentUserId;
  const timeAgo = useMemo(
    () => formatDistanceToNow(new Date(comment.created_at), { addSuffix: true }),
    [comment.created_at],
  );

  // ── Reactions summary ──────────────────────────────────────────────────

  const reactions = useMemo(() => {
    if (!comment.reactions) return [];
    return Object.entries(comment.reactions).map(([emoji, users]) => ({
      emoji,
      count: users.length,
      hasReacted: currentUserId ? users.includes(currentUserId) : false,
    }));
  }, [comment.reactions, currentUserId]);

  // ── Handlers ───────────────────────────────────────────────────────────

  const handleReact = useCallback(
    async (emoji: string) => {
      if (!onReact) return;
      const existing = reactions.find((r) => r.emoji === emoji);
      await onReact(comment.id, emoji, existing?.hasReacted ?? false);
    },
    [onReact, comment.id, reactions],
  );

  const handleReplySubmit = useCallback(
    async (content: string, mentions: Mention[]) => {
      if (!onReply) return;
      await onReply(content, mentions, comment.id);
      setShowReplyInput(false);
    },
    [onReply, comment.id],
  );

  const handleEditSubmit = useCallback(
    async (content: string, mentions: Mention[]) => {
      if (!onEdit) return;
      const success = await onEdit(comment.id, content, mentions);
      if (success) setIsEditing(false);
    },
    [onEdit, comment.id],
  );

  const handleDelete = useCallback(async () => {
    if (!onDelete) return;
    await onDelete(comment.id);
  }, [onDelete, comment.id]);

  // ── Render deleted ─────────────────────────────────────────────────────

  if (isDeleted) {
    return (
      <div
        className={cn(
          'flex items-center gap-2 py-2 text-sm text-default-400 italic',
          depth > 0 && 'ml-8 border-l-2 border-default-100 pl-4',
          className,
        )}
      >
        <Icon icon="solar:trash-bin-minimalistic-linear" width={14} />
        <span>[deleted]</span>
      </div>
    );
  }

  // ── Render ─────────────────────────────────────────────────────────────

  return (
    <div
      className={cn(
        'group relative',
        depth > 0 && 'ml-8 border-l-2 border-default-100 pl-4',
        className,
      )}
    >
      {/* Header */}
      <div className="flex items-start gap-3">
        <Avatar
          src={comment.author.avatar_url}
          size="sm"
          className="mt-0.5 flex-shrink-0 cursor-pointer"
          showFallback
          onClick={() => onAuthorClick?.(comment.author.id, comment.author.slug)}
          fallback={
            <Icon icon="solar:user-rounded-bold" className="text-default-500" width={16} />
          }
        />

        <div className="flex-1 min-w-0">
          {/* Author + timestamp */}
          <div className="flex items-center gap-2 text-sm">
            <button
              onClick={() => onAuthorClick?.(comment.author.id, comment.author.slug)}
              className="font-semibold text-foreground hover:text-primary transition-colors truncate"
            >
              {comment.author.display_name}
            </button>
            <span className="text-default-400 text-xs flex-shrink-0">{timeAgo}</span>
            {comment.status === 'edited' && (
              <span className="text-default-400 text-xs italic">(edited)</span>
            )}
          </div>

          {/* Content */}
          {isEditing ? (
            <div className="mt-2">
              <CommentInput
                placeholder="Edit your comment..."
                onSubmit={handleEditSubmit}
                isReply
                autoFocus
                onCancel={() => setIsEditing(false)}
              />
            </div>
          ) : (
            <p className="text-sm text-foreground mt-1 whitespace-pre-wrap break-words">
              {renderContentWithMentions(comment.content, comment.mentions)}
            </p>
          )}

          {/* Reactions */}
          {reactions.length > 0 && (
            <div className="flex flex-wrap items-center gap-1 mt-2">
              {reactions.map(({ emoji, count, hasReacted }) => (
                <button
                  key={emoji}
                  onClick={() => handleReact(emoji)}
                  className={cn(
                    'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs',
                    'border transition-colors',
                    hasReacted
                      ? 'border-primary/40 bg-primary/10 text-primary'
                      : 'border-default-200 bg-default-50 text-default-600 hover:bg-default-100',
                  )}
                >
                  <span>{emoji}</span>
                  <span>{count}</span>
                </button>
              ))}
            </div>
          )}

          {/* Action bar */}
          <div className="flex items-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
            {/* Quick reactions */}
            <Dropdown>
              <DropdownTrigger>
                <Button isIconOnly size="sm" variant="light" className="text-default-400">
                  <Icon icon="solar:emoji-funny-square-linear" width={16} />
                </Button>
              </DropdownTrigger>
              <DropdownMenu aria-label="Reactions" onAction={(key) => handleReact(key as string)}>
                {QUICK_REACTIONS.map((emoji) => (
                  <DropdownItem key={emoji} textValue={emoji}>
                    <span className="text-lg">{emoji}</span>
                  </DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>

            {/* Reply */}
            {onReply && depth < 3 && (
              <Button
                size="sm"
                variant="light"
                className="text-default-400 text-xs"
                startContent={<Icon icon="solar:reply-bold" width={14} />}
                onPress={() => setShowReplyInput((v) => !v)}
              >
                Reply
              </Button>
            )}

            {/* Owner actions */}
            {isOwn && (
              <>
                <Button
                  size="sm"
                  variant="light"
                  className="text-default-400 text-xs"
                  startContent={<Icon icon="solar:pen-2-linear" width={14} />}
                  onPress={() => setIsEditing(true)}
                >
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="light"
                  className="text-danger text-xs"
                  startContent={<Icon icon="solar:trash-bin-minimalistic-linear" width={14} />}
                  onPress={handleDelete}
                >
                  Delete
                </Button>
              </>
            )}
          </div>

          {/* Reply input */}
          {showReplyInput && (
            <div className="mt-3">
              <CommentInput
                placeholder={`Reply to ${comment.author.display_name}...`}
                onSubmit={handleReplySubmit}
                isReply
                autoFocus
                onCancel={() => setShowReplyInput(false)}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Mention rendering helper ─────────────────────────────────────────────────

function renderContentWithMentions(
  content: string,
  mentions?: { display_name: string; offset: number; length: number }[],
): React.ReactNode {
  if (!mentions || mentions.length === 0) return content;

  // Sort by offset to process in order
  const sorted = [...mentions].sort((a, b) => a.offset - b.offset);
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;

  sorted.forEach((m, i) => {
    if (m.offset > lastIndex) {
      parts.push(content.slice(lastIndex, m.offset));
    }
    parts.push(
      <span key={i} className="text-primary font-medium cursor-pointer hover:underline">
        @{m.display_name}
      </span>,
    );
    lastIndex = m.offset + m.length;
  });

  if (lastIndex < content.length) {
    parts.push(content.slice(lastIndex));
  }

  return <>{parts}</>;
}

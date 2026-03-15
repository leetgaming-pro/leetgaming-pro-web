'use client';

import React, { useRef, useEffect } from 'react';
import { Avatar, Button, Spinner } from '@nextui-org/react';
import { Icon } from '@iconify/react';
import { cn } from '@nextui-org/react';
import { formatDistanceToNow } from 'date-fns';
import type { DirectMessage, Mention } from '@/types/replay-api/messaging.types';
import { CommentInput } from '@/components/match/comments/CommentInput';

interface MessageThreadProps {
  messages: DirectMessage[];
  /** Current user's ID, used to determine sent vs received */
  currentUserId: string;
  /** Participant name displayed in header */
  participantName: string;
  participantAvatar?: string;
  isLoading?: boolean;
  isSending?: boolean;
  hasMore?: boolean;
  onSend: (content: string, mentions: Mention[]) => Promise<void>;
  onLoadMore?: () => void;
  onDelete?: (messageId: string) => void;
  onBack?: () => void;
  className?: string;
}

export function MessageThread({
  messages,
  currentUserId,
  participantName,
  participantAvatar,
  isLoading = false,
  isSending = false,
  hasMore = false,
  onSend,
  onLoadMore,
  onDelete: _onDelete,
  onBack,
  className,
}: MessageThreadProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-default-100">
        {onBack && (
          <Button isIconOnly size="sm" variant="light" onPress={onBack}>
            <Icon icon="solar:arrow-left-linear" width={18} />
          </Button>
        )}
        <Avatar
          src={participantAvatar}
          size="sm"
          showFallback
          fallback={
            <Icon icon="solar:user-rounded-bold" className="text-default-500" width={16} />
          }
        />
        <span className="font-semibold text-sm">{participantName}</span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {/* Load more */}
        {hasMore && (
          <div className="flex justify-center">
            <Button
              size="sm"
              variant="light"
              onPress={onLoadMore}
              isLoading={isLoading}
            >
              Load older messages
            </Button>
          </div>
        )}

        {isLoading && messages.length === 0 && (
          <div className="flex justify-center py-8">
            <Spinner size="lg" />
          </div>
        )}

        {!isLoading && messages.length === 0 && (
          <div className="text-center py-12 text-default-400">
            <Icon
              icon="solar:chat-round-dots-linear"
              width={40}
              className="mx-auto mb-2 opacity-50"
            />
            <p className="text-sm">No messages yet</p>
            <p className="text-xs">Send a message to start the conversation</p>
          </div>
        )}

        {/* Reverse iterate: oldest at top, newest at bottom */}
        {[...messages].reverse().map((msg) => {
          const isSent = msg.sender_id === currentUserId;
          const timeAgo = formatDistanceToNow(new Date(msg.created_at), { addSuffix: true });

          return (
            <div
              key={msg.id}
              className={cn('flex', isSent ? 'justify-end' : 'justify-start')}
            >
              <div
                className={cn(
                  'max-w-[75%] rounded-2xl px-4 py-2 text-sm',
                  isSent
                    ? 'bg-primary text-primary-foreground rounded-br-sm'
                    : 'bg-default-100 text-foreground rounded-bl-sm',
                )}
              >
                <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                <div
                  className={cn(
                    'flex items-center gap-1 mt-1 text-[10px]',
                    isSent ? 'text-primary-foreground/60 justify-end' : 'text-default-400',
                  )}
                >
                  <span>{timeAgo}</span>
                  {isSent && msg.read_at && (
                    <Icon icon="solar:check-read-bold" width={12} />
                  )}
                </div>
              </div>
            </div>
          );
        })}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t border-default-100 px-4 py-3">
        <CommentInput
          placeholder={`Message ${participantName}...`}
          onSubmit={onSend}
          isSubmitting={isSending}
          isReply
        />
      </div>
    </div>
  );
}

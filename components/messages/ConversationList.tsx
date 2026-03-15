'use client';

import React from 'react';
import { Avatar, Badge } from '@nextui-org/react';
import { Icon } from '@iconify/react';
import { cn } from '@nextui-org/react';
import { formatDistanceToNow } from 'date-fns';
import type { Conversation } from '@/types/replay-api/messaging.types';

interface ConversationListProps {
  conversations: Conversation[];
  activeConversationId?: string;
  onSelect: (userId: string) => void;
  isLoading?: boolean;
  className?: string;
}

export function ConversationList({
  conversations,
  activeConversationId,
  onSelect,
  isLoading,
  className,
}: ConversationListProps) {
  if (!isLoading && conversations.length === 0) {
    return (
      <div className={cn('text-center py-12 text-default-400', className)}>
        <Icon icon="solar:chat-line-linear" width={48} className="mx-auto mb-3 opacity-50" />
        <p className="text-sm">No conversations yet</p>
        <p className="text-xs mt-1">Start a conversation with another player</p>
      </div>
    );
  }

  return (
    <div className={cn('divide-y divide-default-100', className)}>
      {conversations.map((convo) => {
        const isActive = activeConversationId === convo.participant.id;
        const timeAgo = formatDistanceToNow(new Date(convo.last_message_at), {
          addSuffix: true,
        });

        return (
          <button
            key={convo.conversation_id}
            onClick={() => onSelect(convo.participant.id)}
            className={cn(
              'w-full flex items-center gap-3 px-4 py-3 text-left',
              'hover:bg-default-50 transition-colors',
              isActive && 'bg-primary/5 border-l-2 border-primary',
            )}
          >
            <Badge
              content={convo.unread_count > 0 ? convo.unread_count : undefined}
              color="primary"
              size="sm"
              isInvisible={convo.unread_count === 0}
            >
              <Avatar
                src={convo.participant.avatar_url}
                size="sm"
                showFallback
                fallback={
                  <Icon
                    icon="solar:user-rounded-bold"
                    className="text-default-500"
                    width={16}
                  />
                }
              />
            </Badge>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span
                  className={cn(
                    'text-sm truncate',
                    convo.unread_count > 0 ? 'font-semibold' : 'font-medium',
                  )}
                >
                  {convo.participant.display_name}
                </span>
                <span className="text-xs text-default-400 flex-shrink-0">{timeAgo}</span>
              </div>
              <p
                className={cn(
                  'text-xs truncate mt-0.5',
                  convo.unread_count > 0 ? 'text-foreground' : 'text-default-400',
                )}
              >
                {convo.last_message}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
}

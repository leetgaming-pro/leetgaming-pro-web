'use client';

import React, { useState, useRef, useCallback, KeyboardEvent } from 'react';
import { Button, Textarea, Avatar } from '@nextui-org/react';
import { Icon } from '@iconify/react';
import { cn } from '@nextui-org/react';
import type { Mention } from '@/types/replay-api/messaging.types';

interface CommentInputProps {
  /** Placeholder text */
  placeholder?: string;
  /** Called when comment is submitted */
  onSubmit: (content: string, mentions: Mention[]) => Promise<void>;
  /** Whether a submit is in progress */
  isSubmitting?: boolean;
  /** Optional author avatar */
  avatarUrl?: string;
  /** Max length */
  maxLength?: number;
  /** Whether replying to a comment */
  isReply?: boolean;
  /** Auto-focus on mount */
  autoFocus?: boolean;
  /** Called when cancelled (only in reply mode) */
  onCancel?: () => void;
  className?: string;
}

export function CommentInput({
  placeholder = 'Write a comment...',
  onSubmit,
  isSubmitting = false,
  avatarUrl,
  maxLength = 2000,
  isReply = false,
  autoFocus = false,
  onCancel,
  className,
}: CommentInputProps) {
  const [content, setContent] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = useCallback(async () => {
    const trimmed = content.trim();
    if (!trimmed || isSubmitting) return;

    // Simple @mention extraction (text-based, not autocomplete for MVP)
    const mentions: Mention[] = [];
    const mentionRegex = /@(\w+)/g;
    let match;
    while ((match = mentionRegex.exec(trimmed)) !== null) {
      mentions.push({
        player_id: '', // resolved server-side for MVP
        display_name: match[1],
        offset: match.index,
        length: match[0].length,
      });
    }

    await onSubmit(trimmed, mentions);
    setContent('');
  }, [content, isSubmitting, onSubmit]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        handleSubmit();
      }
      if (e.key === 'Escape' && isReply && onCancel) {
        onCancel();
      }
    },
    [handleSubmit, isReply, onCancel],
  );

  const charCount = content.length;
  const isOverLimit = charCount > maxLength;
  const canSubmit = content.trim().length > 0 && !isOverLimit && !isSubmitting;

  return (
    <div className={cn('flex gap-3', className)}>
      {!isReply && (
        <Avatar
          src={avatarUrl}
          size="sm"
          className="mt-1 flex-shrink-0"
          showFallback
          fallback={
            <Icon icon="solar:user-rounded-bold" className="text-default-500" width={16} />
          }
        />
      )}

      <div className="flex-1 space-y-2">
        <Textarea
          ref={textareaRef}
          value={content}
          onValueChange={setContent}
          onKeyDown={handleKeyDown as unknown as React.KeyboardEventHandler}
          placeholder={placeholder}
          minRows={isReply ? 1 : 2}
          maxRows={6}
          autoFocus={autoFocus}
          variant="bordered"
          classNames={{
            inputWrapper: cn(
              'border-default-200 dark:border-default-100',
              'hover:border-primary focus-within:border-primary',
              'transition-colors',
            ),
            input: 'text-sm',
          }}
          isDisabled={isSubmitting}
        />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-default-400">
            <span className={cn(isOverLimit && 'text-danger')}>
              {charCount}/{maxLength}
            </span>
            <span className="hidden sm:inline">⌘+Enter to send</span>
          </div>

          <div className="flex items-center gap-2">
            {isReply && onCancel && (
              <Button
                size="sm"
                variant="light"
                onPress={onCancel}
                isDisabled={isSubmitting}
              >
                Cancel
              </Button>
            )}
            <Button
              size="sm"
              color="primary"
              onPress={handleSubmit}
              isDisabled={!canSubmit}
              isLoading={isSubmitting}
              startContent={
                !isSubmitting && (
                  <Icon icon="solar:pen-new-square-bold" width={16} />
                )
              }
            >
              {isReply ? 'Reply' : 'Comment'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

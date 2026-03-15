'use client';

/**
 * Vault Activity Feed Component
 */

import React from 'react';
import { Card, CardBody, Chip, Skeleton, Avatar } from '@nextui-org/react';
import { Icon } from '@iconify/react';
import type { VaultActivity } from '@/types/replay-api/vault.types';
import { getActivityTypeIcon, formatVaultAmount } from '@/types/replay-api/vault.types';

interface ActivityFeedProps {
  activities: VaultActivity[];
  isLoading?: boolean;
  compact?: boolean;
}

export function ActivityFeed({ activities, isLoading, compact = false }: ActivityFeedProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (!activities.length) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-8">
        <Icon icon="solar:clock-circle-bold" className="text-3xl text-default-300" />
        <p className="text-sm text-default-400">No activity yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {activities.map((activity, idx) => (
        <div
          key={activity.id || idx}
          className={`flex items-start gap-3 ${compact ? 'py-2' : 'py-3'} ${
            idx < activities.length - 1 ? 'border-b border-divider' : ''
          }`}
        >
          {/* Timeline dot */}
          <div className="mt-1 flex-shrink-0">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full ${
                activity.activity_type?.includes('DEPOSIT')
                  ? 'bg-success/10'
                  : activity.activity_type?.includes('WITHDRAW')
                  ? 'bg-danger/10'
                  : activity.activity_type?.includes('PROPOSAL')
                  ? 'bg-primary/10'
                  : 'bg-default-100'
              }`}
            >
              <Icon
                icon={getActivityTypeIcon(activity.activity_type)}
                className={`text-sm ${
                  activity.activity_type?.includes('DEPOSIT')
                    ? 'text-success'
                    : activity.activity_type?.includes('WITHDRAW')
                    ? 'text-danger'
                    : activity.activity_type?.includes('PROPOSAL')
                    ? 'text-primary'
                    : 'text-default-500'
                }`}
              />
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <p className={`${compact ? 'text-xs' : 'text-sm'} font-medium`}>
              {formatActivityLabel(activity.activity_type)}
            </p>
            {activity.description && (
              <p className={`${compact ? 'text-[10px]' : 'text-xs'} text-default-400 truncate`}>
                {activity.description}
              </p>
            )}
            {activity.amount != null && activity.currency && (
              <p className="text-xs font-semibold mt-0.5">
                {formatVaultAmount(activity.amount, activity.currency)}
              </p>
            )}
          </div>

          {/* Timestamp */}
          <span className="text-[10px] text-default-400 whitespace-nowrap flex-shrink-0 mt-1">
            {formatRelativeTime(activity.timestamp || activity.created_at || '')}
          </span>
        </div>
      ))}
    </div>
  );
}

function formatActivityLabel(type: string): string {
  const labels: Record<string, string> = {
    VAULT_CREATED: 'Vault created',
    DEPOSIT: 'Deposit received',
    WITHDRAWAL: 'Withdrawal completed',
    PROPOSAL_CREATED: 'New proposal',
    PROPOSAL_APPROVED: 'Proposal approved',
    PROPOSAL_REJECTED: 'Proposal rejected',
    PROPOSAL_EXECUTED: 'Proposal executed',
    PROPOSAL_EXPIRED: 'Proposal expired',
    PROPOSAL_CANCELLED: 'Proposal cancelled',
    SETTINGS_UPDATED: 'Settings updated',
    MEMBER_ADDED: 'Member added',
    MEMBER_REMOVED: 'Member removed',
    VAULT_LOCKED: 'Vault locked',
    VAULT_UNLOCKED: 'Vault unlocked',
    ITEM_DEPOSITED: 'Item deposited',
    ITEM_TRANSFERRED: 'Item transferred',
    ITEM_BURNED: 'Item burned',
  };
  return labels[type] || type?.replace(/_/g, ' ').toLowerCase() || 'Unknown';
}

function formatRelativeTime(dateStr: string): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHour < 24) return `${diffHour}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  return date.toLocaleDateString();
}

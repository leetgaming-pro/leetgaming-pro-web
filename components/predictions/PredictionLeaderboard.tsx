'use client';

import React, { useEffect } from 'react';
import {
  Card,
  CardBody,
  CardHeader,
  Spinner,
  Avatar,
  Chip,
} from '@nextui-org/react';
import { Icon } from '@iconify/react';
import { cn } from '@nextui-org/react';
import { useBetting } from '@/hooks/use-betting';

interface PredictionLeaderboardProps {
  limit?: number;
  autoFetch?: boolean;
  className?: string;
}

export function PredictionLeaderboard({
  limit = 10,
  autoFetch = true,
  className,
}: PredictionLeaderboardProps) {
  const { leaderboard, isLoadingLeaderboard, fetchLeaderboard } = useBetting();

  useEffect(() => {
    if (autoFetch) {
      fetchLeaderboard(limit);
    }
  }, [autoFetch, limit]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Card className={cn('border border-divider', className)}>
      <CardHeader className="flex items-center gap-2 pb-2">
        <Icon icon="solar:cup-star-bold" className="text-xl text-warning" />
        <h3 className="text-sm font-semibold">Prediction Leaderboard</h3>
      </CardHeader>

      <CardBody className="pt-0">
        {isLoadingLeaderboard ? (
          <div className="flex justify-center py-6">
            <Spinner size="sm" />
          </div>
        ) : leaderboard.length === 0 ? (
          <p className="text-center text-xs text-default-400 py-4">
            No leaderboard data yet
          </p>
        ) : (
          <div className="space-y-2">
            {leaderboard.map((entry, index) => (
              <div
                key={entry.user_id}
                className={cn(
                  'flex items-center gap-3 rounded-lg p-2',
                  index < 3 && 'bg-warning/5',
                )}
              >
                {/* Rank */}
                <div className="w-6 text-center">
                  {index === 0 ? (
                    <Icon icon="solar:medal-ribbons-star-bold" className="text-lg text-yellow-500" />
                  ) : index === 1 ? (
                    <Icon icon="solar:medal-ribbons-star-bold" className="text-lg text-gray-400" />
                  ) : index === 2 ? (
                    <Icon icon="solar:medal-ribbons-star-bold" className="text-lg text-amber-700" />
                  ) : (
                    <span className="text-xs text-default-400 font-mono">{index + 1}</span>
                  )}
                </div>

                {/* Avatar & name */}
                <Avatar
                  src={entry.avatar_url}
                  name={entry.display_name?.charAt(0) || '?'}
                  size="sm"
                  className="shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {entry.display_name || 'Anonymous'}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-default-400">
                    <span>{entry.total_bets} bets</span>
                    <span>{(entry.win_rate * 100).toFixed(0)}% win</span>
                  </div>
                </div>

                {/* Profit */}
                <Chip
                  size="sm"
                  variant="flat"
                  color={entry.total_profit >= 0 ? 'success' : 'danger'}
                  className="font-mono"
                >
                  {entry.total_profit >= 0 ? '+' : ''}
                  ${(entry.total_profit / 100).toFixed(2)}
                </Chip>
              </div>
            ))}
          </div>
        )}
      </CardBody>
    </Card>
  );
}

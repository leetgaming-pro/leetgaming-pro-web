'use client';

import React from 'react';
import { Card, CardBody, CardHeader, Chip, Progress } from '@nextui-org/react';
import { Icon } from '@iconify/react';
import { cn } from '@nextui-org/react';
import type {
  PredictionMarket,
  MarketOption,
} from '@/types/replay-api/prediction.types';

const BET_TYPE_DISPLAY: Record<string, string> = {
  match_winner: 'Match Winner',
  map_score: 'Map Score',
  total_rounds: 'Total Rounds',
  first_blood: 'First Blood',
  round_winner: 'Round Winner',
};

const STATUS_COLORS: Record<string, 'success' | 'warning' | 'danger' | 'default' | 'primary'> = {
  open: 'success',
  locked: 'warning',
  resolved: 'primary',
  cancelled: 'danger',
  voided: 'default',
};

interface PredictionCardProps {
  market: PredictionMarket;
  _currentUserId?: string;
  onSelectOption?: (option: MarketOption) => void;
  isSelected?: boolean;
  selectedOptionKey?: string;
  className?: string;
}

export function PredictionCard({
  market,
  _currentUserId,
  onSelectOption,
  isSelected,
  selectedOptionKey,
  className,
}: PredictionCardProps) {
  const totalPool = market.total_pool / 100; // Convert cents to dollars
  const isOpen = market.status === 'open';

  return (
    <Card
      className={cn(
        'border border-divider transition-all',
        isSelected && 'border-warning/50 shadow-warning/10 shadow-lg',
        className,
      )}
    >
      <CardHeader className="flex justify-between items-start gap-2 pb-2">
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold truncate">{market.title}</h4>
          {market.description && (
            <p className="text-xs text-default-400 mt-0.5 line-clamp-2">{market.description}</p>
          )}
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <Chip
            size="sm"
            variant="flat"
            color={STATUS_COLORS[market.status] || 'default'}
          >
            {market.status}
          </Chip>
          <Chip size="sm" variant="flat" color="default">
            {BET_TYPE_DISPLAY[market.bet_type] || market.bet_type}
          </Chip>
        </div>
      </CardHeader>

      <CardBody className="pt-0 space-y-3">
        {/* Pool info */}
        <div className="flex items-center gap-4 text-xs text-default-400">
          <span className="flex items-center gap-1">
            <Icon icon="solar:wallet-money-linear" className="text-sm" />
            ${totalPool.toFixed(2)} pool
          </span>
          <span className="flex items-center gap-1">
            <Icon icon="solar:users-group-rounded-linear" className="text-sm" />
            {market.bet_count} bets
          </span>
          {market.outcome && (
            <span className="flex items-center gap-1 text-success">
              <Icon icon="solar:check-circle-bold" className="text-sm" />
              Winner: {market.options.find((o) => o.key === market.outcome)?.label || market.outcome}
            </span>
          )}
        </div>

        {/* Options */}
        <div className="space-y-2">
          {market.options.map((option) => {
            const percentage =
              market.total_pool > 0
                ? (option.total_staked / market.total_pool) * 100
                : 0;
            const isWinner = market.outcome === option.key;
            const isSelectedOption = selectedOptionKey === option.key;

            return (
              <button
                key={option.key}
                onClick={() => isOpen && onSelectOption?.(option)}
                disabled={!isOpen}
                className={cn(
                  'w-full rounded-lg p-3 text-left transition-all',
                  'border border-divider',
                  isOpen && 'hover:border-warning/50 hover:bg-warning/5 cursor-pointer',
                  !isOpen && 'cursor-default opacity-80',
                  isSelectedOption && 'border-warning bg-warning/10',
                  isWinner && 'border-success bg-success/10',
                )}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    {isWinner && (
                      <Icon
                        icon="solar:check-circle-bold"
                        className="text-success text-lg"
                      />
                    )}
                    <span className="text-sm font-medium">{option.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-default-400">
                      {option.bet_count} bet{option.bet_count !== 1 ? 's' : ''}
                    </span>
                    <Chip
                      size="sm"
                      variant="flat"
                      color={isOpen ? 'warning' : 'default'}
                      className="font-mono"
                    >
                      {option.odds.toFixed(2)}x
                    </Chip>
                  </div>
                </div>
                <Progress
                  size="sm"
                  value={percentage}
                  color={isWinner ? 'success' : isSelectedOption ? 'warning' : 'default'}
                  className="h-1.5"
                />
                <div className="flex justify-between mt-1 text-xs text-default-400">
                  <span>${(option.total_staked / 100).toFixed(2)} staked</span>
                  <span>{percentage.toFixed(1)}%</span>
                </div>
              </button>
            );
          })}
        </div>
      </CardBody>
    </Card>
  );
}

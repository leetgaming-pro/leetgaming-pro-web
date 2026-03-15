'use client';

import React, { useState, useCallback } from 'react';
import { Button, Spinner, Chip } from '@nextui-org/react';
import { Icon } from '@iconify/react';
import { cn } from '@nextui-org/react';
import { usePredictionMarkets } from '@/hooks/use-prediction-markets';
import { PredictionCard } from './PredictionCard';
import { BetSlip } from './BetSlip';
import type { PredictionMarket, MarketOption } from '@/types/replay-api/prediction.types';

interface PredictionSectionProps {
  matchId: string;
  currentUserId?: string;
  className?: string;
}

export function PredictionSection({
  matchId,
  currentUserId,
  className,
}: PredictionSectionProps) {
  const { markets, isLoading, error, refresh } = usePredictionMarkets(matchId);
  const [selectedBet, setSelectedBet] = useState<{
    market: PredictionMarket;
    option: MarketOption;
  } | null>(null);

  const handleSelectOption = useCallback(
    (market: PredictionMarket, option: MarketOption) => {
      if (market.status !== 'open') return;
      setSelectedBet({ market, option });
    },
    [],
  );

  const handleBetPlaced = useCallback(() => {
    setSelectedBet(null);
    refresh();
  }, [refresh]);

  const handleCloseBetSlip = useCallback(() => {
    setSelectedBet(null);
  }, []);

  if (isLoading && markets.length === 0) {
    return (
      <div className={cn('flex items-center justify-center py-12', className)}>
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn('text-center py-8', className)}>
        <p className="text-danger text-sm">{error}</p>
        <Button size="sm" variant="light" onPress={refresh} className="mt-2">
          Try again
        </Button>
      </div>
    );
  }

  if (markets.length === 0) {
    return (
      <div className={cn('text-center py-8', className)}>
        <Icon icon="solar:chart-square-linear" className="mx-auto text-4xl text-default-300 mb-2" />
        <p className="text-default-400 text-sm">No predictions available for this match</p>
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Section header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon icon="solar:chart-square-bold" className="text-xl text-warning" />
          <h3 className="text-lg font-semibold">Predictions</h3>
          <Chip size="sm" variant="flat" color="default">
            {markets.length}
          </Chip>
        </div>
        <Button
          size="sm"
          variant="light"
          isIconOnly
          onPress={refresh}
          aria-label="Refresh predictions"
        >
          <Icon icon="solar:refresh-linear" className="text-lg" />
        </Button>
      </div>

      {/* Market cards */}
      {markets.map((market) => (
        <PredictionCard
          key={market.id}
          market={market}
          _currentUserId={currentUserId}
          onSelectOption={(option: MarketOption) => handleSelectOption(market, option)}
          isSelected={selectedBet?.market.id === market.id}
          selectedOptionKey={
            selectedBet?.market.id === market.id ? selectedBet.option.key : undefined
          }
        />
      ))}

      {/* Bet slip modal */}
      {selectedBet && (
        <BetSlip
          market={selectedBet.market}
          option={selectedBet.option}
          onBetPlaced={handleBetPlaced}
          onClose={handleCloseBetSlip}
        />
      )}
    </div>
  );
}

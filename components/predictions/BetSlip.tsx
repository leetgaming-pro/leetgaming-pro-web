'use client';

import React, { useState, useCallback } from 'react';
import {
  Card,
  CardBody,
  CardHeader,
  CardFooter,
  Button,
  Input,
  Chip,
  Divider,
} from '@nextui-org/react';
import { Icon } from '@iconify/react';
import { cn } from '@nextui-org/react';
import { useBetting } from '@/hooks/use-betting';
import type { PredictionMarket, MarketOption } from '@/types/replay-api/prediction.types';
import { MIN_BET_AMOUNT, MAX_BET_AMOUNT } from '@/types/replay-api/prediction.types';

interface BetSlipProps {
  market: PredictionMarket;
  option: MarketOption;
  onBetPlaced?: () => void;
  onClose?: () => void;
  className?: string;
}

export function BetSlip({
  market,
  option,
  onBetPlaced,
  onClose,
  className,
}: BetSlipProps) {
  const { placeBet, isPlacingBet } = useBetting();
  const [amountStr, setAmountStr] = useState('1.00');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const amountCents = Math.round(parseFloat(amountStr || '0') * 100);
  const potentialPayout = amountCents * option.odds;
  const potentialProfit = potentialPayout - amountCents;

  const isValidAmount =
    !isNaN(amountCents) &&
    amountCents >= MIN_BET_AMOUNT &&
    amountCents <= MAX_BET_AMOUNT;

  const handlePlaceBet = useCallback(async () => {
    if (!isValidAmount) {
      setError(`Amount must be between $${(MIN_BET_AMOUNT / 100).toFixed(2)} and $${(MAX_BET_AMOUNT / 100).toFixed(2)}`);
      return;
    }

    setError(null);

    try {
      await placeBet(market.id, option.key, amountCents);
      setSuccess(true);
      setTimeout(() => {
        onBetPlaced?.();
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to place bet');
    }
  }, [market.id, option.key, amountCents, isValidAmount, placeBet, onBetPlaced]);

  const quickAmounts = [1, 5, 10, 25, 50];

  if (success) {
    return (
      <Card className={cn('border border-success/50 bg-success/5', className)}>
        <CardBody className="flex flex-col items-center py-6">
          <Icon icon="solar:check-circle-bold" className="text-4xl text-success mb-2" />
          <p className="text-success font-semibold">Bet Placed!</p>
          <p className="text-xs text-default-400 mt-1">
            ${(amountCents / 100).toFixed(2)} on {option.label} @ {option.odds.toFixed(2)}x
          </p>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card className={cn('border border-warning/30', className)}>
      <CardHeader className="flex justify-between items-center pb-2">
        <div className="flex items-center gap-2">
          <Icon icon="solar:ticket-bold" className="text-warning text-xl" />
          <span className="text-sm font-semibold">Place Bet</span>
        </div>
        <Button size="sm" variant="light" isIconOnly onPress={onClose} aria-label="Close">
          <Icon icon="solar:close-circle-linear" className="text-lg" />
        </Button>
      </CardHeader>

      <Divider />

      <CardBody className="space-y-3 pt-3">
        {/* Selection summary */}
        <div className="flex items-center justify-between bg-default-100 rounded-lg p-2.5">
          <div>
            <p className="text-xs text-default-400">{market.title}</p>
            <p className="text-sm font-medium">{option.label}</p>
          </div>
          <Chip size="sm" variant="flat" color="warning" className="font-mono">
            {option.odds.toFixed(2)}x
          </Chip>
        </div>

        {/* Amount input */}
        <div>
          <Input
            type="number"
            label="Wager Amount ($)"
            placeholder="1.00"
            value={amountStr}
            onValueChange={setAmountStr}
            min={MIN_BET_AMOUNT / 100}
            max={MAX_BET_AMOUNT / 100}
            step={0.5}
            size="sm"
            startContent={
              <span className="text-default-400 text-sm">$</span>
            }
            classNames={{
              input: 'font-mono',
            }}
          />
        </div>

        {/* Quick amounts */}
        <div className="flex gap-1.5 flex-wrap">
          {quickAmounts.map((amount) => (
            <Button
              key={amount}
              size="sm"
              variant={amountStr === amount.toFixed(2) ? 'flat' : 'bordered'}
              color={amountStr === amount.toFixed(2) ? 'warning' : 'default'}
              onPress={() => setAmountStr(amount.toFixed(2))}
              className="min-w-0 px-3"
            >
              ${amount}
            </Button>
          ))}
        </div>

        {/* Potential payout */}
        <div className="bg-default-50 rounded-lg p-2.5 space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-default-400">Stake</span>
            <span className="font-mono">${(amountCents / 100).toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-default-400">Odds</span>
            <span className="font-mono">{option.odds.toFixed(2)}x</span>
          </div>
          <Divider className="my-1" />
          <div className="flex justify-between text-sm font-semibold">
            <span>Potential Payout</span>
            <span className="text-success font-mono">
              ${(potentialPayout / 100).toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-default-400">Potential Profit</span>
            <span className="text-success font-mono">
              +${(potentialProfit / 100).toFixed(2)}
            </span>
          </div>
        </div>

        {error && (
          <p className="text-danger text-xs text-center">{error}</p>
        )}
      </CardBody>

      <CardFooter className="pt-0">
        <Button
          color="warning"
          variant="solid"
          className="w-full font-semibold"
          onPress={handlePlaceBet}
          isLoading={isPlacingBet}
          isDisabled={!isValidAmount || isPlacingBet}
        >
          {isPlacingBet
            ? 'Placing Bet...'
            : `Place Bet — $${(amountCents / 100).toFixed(2)}`}
        </Button>
      </CardFooter>
    </Card>
  );
}

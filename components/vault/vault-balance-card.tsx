'use client';

/**
 * Vault Balance Card Component
 */

import React from 'react';
import { Card, CardBody, Skeleton } from '@nextui-org/react';
import { Icon } from '@iconify/react';
import type { VaultBalance } from '@/types/replay-api/vault.types';
import { formatVaultAmount } from '@/types/replay-api/vault.types';

interface VaultBalanceCardProps {
  balance?: VaultBalance;
  isLoading?: boolean;
  onDeposit?: (request: any) => Promise<boolean>;
  onRefresh?: () => Promise<void>;
}

export function VaultBalanceCard({ balance, isLoading, onDeposit, onRefresh }: VaultBalanceCardProps) {
  if (isLoading) {
    return (
      <Card>
        <CardBody>
          <Skeleton className="h-24 w-full rounded-lg" />
        </CardBody>
      </Card>
    );
  }

  if (!balance || !balance.balances) {
    return (
      <Card>
        <CardBody className="flex items-center justify-center py-8">
          <p className="text-sm text-default-400">No balance data</p>
        </CardBody>
      </Card>
    );
  }

  const currencies = Object.entries(balance.balances);

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {currencies.map(([currency, amount]) => (
        <Card key={currency}>
          <CardBody className="gap-2">
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-primary/10 p-2">
                <Icon
                  icon={
                    currency === 'BTC'
                      ? 'cryptocurrency:btc'
                      : currency === 'ETH'
                      ? 'cryptocurrency:eth'
                      : 'solar:wallet-bold'
                  }
                  className="text-primary text-xl"
                />
              </div>
              <p className="text-sm text-default-500">{currency}</p>
            </div>
            <p className="text-2xl font-bold">{formatVaultAmount(amount, currency)}</p>
          </CardBody>
        </Card>
      ))}

      {currencies.length === 0 && (
        <Card className="col-span-full">
          <CardBody className="flex flex-col items-center justify-center gap-2 py-8">
            <Icon icon="solar:wallet-bold" className="text-3xl text-default-300" />
            <p className="text-sm text-default-400">No funds in vault yet</p>
          </CardBody>
        </Card>
      )}
    </div>
  );
}

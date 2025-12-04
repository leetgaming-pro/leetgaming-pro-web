'use client';

/**
 * Wallet Card Component
 * Compact wallet display with balance, address, and quick actions
 * Enhanced with integrated modals and animated counters
 */

import React, { useState, useEffect } from 'react';
import { Card, CardBody, Button, Chip, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Tooltip, Skeleton } from '@nextui-org/react';
import { Icon } from '@iconify/react';
import { motion, AnimatePresence } from 'framer-motion';
import type { UserWallet, Currency } from '@/types/replay-api/wallet.types';
import { formatAmount, formatEVMAddress, getAmountValue, getEVMAddressValue } from '@/types/replay-api/wallet.types';
import { AnimatedCounter } from '@/components/ui/animated-counter';
import { DepositModal } from '@/components/wallet/modals/deposit-modal';
import { WithdrawModal } from '@/components/wallet/modals/withdraw-modal';
import { TransactionHistoryModal } from '@/components/wallet/modals/transaction-history-modal';

interface WalletCardProps {
  compact?: boolean;
}

export function WalletCard({
  compact = true,
}: WalletCardProps) {
  const [wallet, setWallet] = useState<UserWallet | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>('USD');
  const [showCopied, setShowCopied] = useState(false);

  // Modal states
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const fetchWallet = async () => {
    try {
      const response = await fetch('/api/wallet/balance');
      if (response.ok) {
        const data = await response.json();
        setWallet(data);
      }
    } catch (error) {
      console.error('Failed to fetch wallet:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWallet();
    const interval = setInterval(fetchWallet, 10000); // Refresh every 10s
    return () => clearInterval(interval);
  }, []);

  // Refresh wallet after successful transactions
  const handleDepositSuccess = () => {
    fetchWallet();
  };

  const handleWithdrawSuccess = () => {
    fetchWallet();
  };

  const copyAddress = async () => {
    if (!wallet) return;

    try {
      await navigator.clipboard.writeText(getEVMAddressValue(wallet.evm_address));
      setShowCopied(true);
      setTimeout(() => setShowCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy address:', error);
    }
  };

  if (isLoading) {
    return (
      <Card className="w-full max-w-sm">
        <CardBody className="gap-3">
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-24 rounded-lg" />
            <Skeleton className="h-8 w-20 rounded-lg" />
          </div>
          <Skeleton className="h-10 w-full rounded-lg" />
          <div className="flex gap-2">
            <Skeleton className="h-9 flex-1 rounded-lg" />
            <Skeleton className="h-9 flex-1 rounded-lg" />
          </div>
        </CardBody>
      </Card>
    );
  }

  if (!wallet) {
    return (
      <Card className="w-full max-w-sm border-2 border-dashed border-default-300">
        <CardBody className="gap-3 items-center justify-center py-6">
          <Icon icon="solar:wallet-bold-duotone" width={48} className="text-default-400" />
          <p className="text-sm text-default-600">No wallet connected</p>
          <Button color="primary" size="sm" startContent={<Icon icon="solar:link-bold" />}>
            Connect Wallet
          </Button>
        </CardBody>
      </Card>
    );
  }

  const currentBalance = wallet.balances[selectedCurrency];
  const currentBalanceDollars = getAmountValue(currentBalance).dollars;
  const totalBalanceUSD = Object.values(wallet.balances).reduce(
    (sum, balance) => sum + getAmountValue(balance).dollars,
    0
  );

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-sm"
    >
      <Card className="bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-primary-900/20 dark:to-secondary-900/20 border-2 border-primary-200 dark:border-primary-800 shadow-lg">
        <CardBody className="gap-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <motion.div
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 5 }}
              >
                <Icon icon="solar:wallet-bold-duotone" width={24} className="text-primary-600" />
              </motion.div>
              <span className="font-semibold text-foreground">My Wallet</span>
            </div>

            {wallet.pending_transactions && wallet.pending_transactions.length > 0 && (
              <Chip
                size="sm"
                variant="flat"
                color="warning"
                startContent={<Icon icon="solar:clock-circle-bold" width={14} />}
                className="animate-pulse"
              >
                {wallet.pending_transactions.length} Pending
              </Chip>
            )}
          </div>

          {/* Balance Display */}
          <div className="space-y-2">
            <div className="flex items-baseline gap-2">
              <Dropdown>
                <DropdownTrigger>
                  <Button
                    size="sm"
                    variant="flat"
                    endContent={<Icon icon="solar:alt-arrow-down-bold" width={14} />}
                  >
                    {selectedCurrency}
                  </Button>
                </DropdownTrigger>
                <DropdownMenu
                  aria-label="Select currency"
                  onAction={(key) => setSelectedCurrency(key as Currency)}
                >
                  {Object.keys(wallet.balances).map((currency) => (
                    <DropdownItem key={currency}>
                      {currency}
                    </DropdownItem>
                  ))}
                </DropdownMenu>
              </Dropdown>

              <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-secondary-600 dark:from-primary-400 dark:to-secondary-400">
                <AnimatedCounter
                  value={currentBalanceDollars}
                  prefix="$"
                  decimals={2}
                />
              </div>
            </div>

            {selectedCurrency !== 'USD' && (
              <p className="text-xs text-default-600">
                ≈ ${totalBalanceUSD.toFixed(2)} USD total
              </p>
            )}
          </div>

          {/* EVM Address */}
          <div className="flex items-center gap-2 p-2 rounded-lg bg-white/60 dark:bg-black/20">
            <Icon icon="solar:shield-keyhole-bold" width={16} className="text-default-500 flex-shrink-0" />
            <code className="text-xs text-default-700 flex-1 truncate">
              {formatEVMAddress(wallet.evm_address)}
            </code>
            <Tooltip content={showCopied ? "Copied!" : "Copy address"}>
              <Button
                isIconOnly
                size="sm"
                variant="light"
                onPress={copyAddress}
                className="min-w-unit-6 w-6 h-6"
              >
                <AnimatePresence mode="wait">
                  {showCopied ? (
                    <motion.div
                      key="check"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                    >
                      <Icon icon="solar:check-circle-bold" width={16} className="text-success-500" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="copy"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                    >
                      <Icon icon="solar:copy-bold" width={14} className="text-default-500" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </Button>
            </Tooltip>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-2">
            <Button
              size="sm"
              color="primary"
              variant="flat"
              startContent={<Icon icon="solar:download-minimalistic-bold" width={16} />}
              onPress={() => setIsDepositOpen(true)}
            >
              Deposit
            </Button>
            <Button
              size="sm"
              color="default"
              variant="flat"
              startContent={<Icon icon="solar:upload-minimalistic-bold" width={16} />}
              onPress={() => setIsWithdrawOpen(true)}
              isDisabled={totalBalanceUSD <= 0}
            >
              Withdraw
            </Button>
          </div>

          {/* Quick Stats */}
          {!compact && (
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-divider">
              <div>
                <p className="text-xs text-default-500">Total Won</p>
                <p className="text-sm font-semibold text-success-600">
                  {formatAmount(wallet.total_prizes_won)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-default-500">Today&apos;s Wins</p>
                <p className="text-sm font-semibold text-warning-600">
                  {formatAmount(wallet.daily_prize_winnings)}
                </p>
              </div>
            </div>
          )}

          {/* View History Link */}
          <Button
            size="sm"
            variant="light"
            className="text-xs"
            endContent={<Icon icon="solar:history-bold" width={14} />}
            onPress={() => setIsHistoryOpen(true)}
          >
            Transaction History
          </Button>
        </CardBody>
      </Card>

      {/* Modals */}
      <DepositModal
        isOpen={isDepositOpen}
        onClose={() => setIsDepositOpen(false)}
        onSuccess={handleDepositSuccess}
      />

      <WithdrawModal
        isOpen={isWithdrawOpen}
        onClose={() => setIsWithdrawOpen(false)}
        onSuccess={handleWithdrawSuccess}
        availableBalance={totalBalanceUSD}
        currency={selectedCurrency}
      />

      <TransactionHistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
      />
    </motion.div>
  );
}

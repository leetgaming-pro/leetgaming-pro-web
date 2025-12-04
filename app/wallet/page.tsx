'use client';

/**
 * Wallet Management Page
 * Full wallet dashboard with balance, transactions, and quick actions
 */

import React, { useState, useEffect } from 'react';
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Chip,
  Divider,
  Skeleton,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Pagination,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Tooltip,
  Link,
} from '@nextui-org/react';
import { Icon } from '@iconify/react';
import { motion } from 'framer-motion';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import type { UserWallet, WalletTransaction, Currency } from '@/types/replay-api/wallet.types';
import { formatAmount, formatEVMAddress, getAmountValue, getEVMAddressValue, getBalanceValue } from '@/types/replay-api/wallet.types';
import { AnimatedCounter } from '@/components/ui/animated-counter';
import { DepositModal } from '@/components/wallet/modals/deposit-modal';
import { WithdrawModal } from '@/components/wallet/modals/withdraw-modal';
import { TransactionHistoryModal } from '@/components/wallet/modals/transaction-history-modal';
import { logger } from '@/lib/logger';

export default function WalletPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [wallet, setWallet] = useState<UserWallet | null>(null);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>('USD');
  const [showCopied, setShowCopied] = useState(false);

  // Modal states
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // Pagination
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/signin?callbackUrl=/wallet');
    }
  }, [status, router]);

  const fetchWallet = async () => {
    try {
      const response = await fetch('/api/wallet/balance');
      if (response.ok) {
        const data = await response.json();
        setWallet(data);
      }
    } catch (error) {
      logger.error('Failed to fetch wallet', error);
    }
  };

  const fetchTransactions = async () => {
    try {
      const response = await fetch('/api/wallet/transactions?limit=50');
      if (response.ok) {
        const data = await response.json();
        setTransactions(data.transactions || []);
      }
    } catch (error) {
      logger.error('Failed to fetch transactions', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (status === 'authenticated') {
      fetchWallet();
      fetchTransactions();
      const interval = setInterval(fetchWallet, 15000); // Refresh every 15s
      return () => clearInterval(interval);
    }
    return undefined;
  }, [status]);

  const handleDepositSuccess = () => {
    fetchWallet();
    fetchTransactions();
  };

  const handleWithdrawSuccess = () => {
    fetchWallet();
    fetchTransactions();
  };

  const copyAddress = async () => {
    if (!wallet) return;
    try {
      await navigator.clipboard.writeText(getEVMAddressValue(wallet.evm_address));
      setShowCopied(true);
      setTimeout(() => setShowCopied(false), 2000);
    } catch (error) {
      logger.error('Failed to copy address', error);
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'deposit':
        return <Icon icon="solar:download-minimalistic-bold" className="text-success" width={20} />;
      case 'withdrawal':
        return <Icon icon="solar:upload-minimalistic-bold" className="text-warning" width={20} />;
      case 'prize_payout':
        return <Icon icon="solar:cup-star-bold" className="text-primary" width={20} />;
      case 'entry_fee':
        return <Icon icon="solar:gamepad-bold" className="text-secondary" width={20} />;
      case 'refund':
        return <Icon icon="solar:refresh-bold" className="text-default" width={20} />;
      default:
        return <Icon icon="solar:wallet-bold" className="text-default" width={20} />;
    }
  };

  const getStatusChip = (status: string) => {
    const statusConfig: Record<string, { color: 'success' | 'warning' | 'danger' | 'default'; icon: string }> = {
      confirmed: { color: 'success', icon: 'solar:check-circle-bold' },
      pending: { color: 'warning', icon: 'solar:clock-circle-bold' },
      failed: { color: 'danger', icon: 'solar:close-circle-bold' },
      cancelled: { color: 'default', icon: 'solar:forbidden-circle-bold' },
    };
    const config = statusConfig[status] || statusConfig.pending;
    return (
      <Chip size="sm" color={config.color} variant="flat" startContent={<Icon icon={config.icon} width={14} />}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Chip>
    );
  };

  // Paginated transactions
  const paginatedTransactions = React.useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    return transactions.slice(start, end);
  }, [page, transactions]);

  const totalPages = Math.ceil(transactions.length / rowsPerPage);

  if (status === 'loading' || isLoading) {
    return (
      <div className="w-full max-w-6xl mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-48 rounded-lg" />
          <div className="flex gap-2">
            <Skeleton className="h-10 w-32 rounded-lg" />
            <Skeleton className="h-10 w-32 rounded-lg" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-48 rounded-xl" />
          <Skeleton className="h-48 rounded-xl" />
          <Skeleton className="h-48 rounded-xl" />
        </div>
        <Skeleton className="h-96 rounded-xl" />
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return null; // Will redirect
  }

  const currentBalance = wallet?.balances[selectedCurrency];
  const currentBalanceDollars = getAmountValue(currentBalance).dollars;
  const totalBalanceUSD = wallet
    ? Object.values(wallet.balances).reduce((sum, balance) => sum + getAmountValue(balance).dollars, 0)
    : 0;

  return (
    <div className="w-full max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Icon icon="solar:wallet-bold-duotone" className="text-primary" width={32} />
            My Wallet
          </h1>
          <p className="text-default-500 text-sm mt-1">Manage your funds and view transaction history</p>
        </div>
        <div className="flex gap-2">
          <Button
            color="primary"
            startContent={<Icon icon="solar:download-minimalistic-bold" width={18} />}
            onPress={() => setIsDepositOpen(true)}
          >
            Deposit
          </Button>
          <Button
            color="default"
            variant="bordered"
            startContent={<Icon icon="solar:upload-minimalistic-bold" width={18} />}
            onPress={() => setIsWithdrawOpen(true)}
            isDisabled={totalBalanceUSD <= 0}
          >
            Withdraw
          </Button>
        </div>
      </motion.div>

      {/* Balance Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        {/* Main Balance Card */}
        <Card className="col-span-1 md:col-span-2 bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-primary-900/20 dark:to-secondary-900/20 border-2 border-primary-200 dark:border-primary-800">
          <CardBody className="gap-4 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Icon icon="solar:wallet-bold-duotone" width={24} className="text-primary-600" />
                <span className="font-semibold">Available Balance</span>
              </div>
              <Dropdown>
                <DropdownTrigger>
                  <Button size="sm" variant="flat" endContent={<Icon icon="solar:alt-arrow-down-bold" width={14} />}>
                    {selectedCurrency}
                  </Button>
                </DropdownTrigger>
                <DropdownMenu onAction={(key) => setSelectedCurrency(key as Currency)}>
                  {wallet ? Object.keys(wallet.balances).map((currency) => (
                    <DropdownItem key={currency}>{currency}</DropdownItem>
                  )) : <DropdownItem key="USD">USD</DropdownItem>}
                </DropdownMenu>
              </Dropdown>
            </div>

            <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-secondary-600 dark:from-primary-400 dark:to-secondary-400">
              {currentBalance ? (
                <AnimatedCounter value={currentBalanceDollars} prefix="$" decimals={2} />
              ) : (
                '$0.00'
              )}
            </div>

            {wallet && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-white/60 dark:bg-black/20">
                <Icon icon="solar:shield-keyhole-bold" width={18} className="text-default-500" />
                <code className="text-sm text-default-700 flex-1 truncate">
                  {formatEVMAddress(wallet.evm_address)}
                </code>
                <Tooltip content={showCopied ? 'Copied!' : 'Copy address'}>
                  <Button isIconOnly size="sm" variant="light" onPress={copyAddress}>
                    <Icon
                      icon={showCopied ? 'solar:check-circle-bold' : 'solar:copy-bold'}
                      width={16}
                      className={showCopied ? 'text-success' : 'text-default-500'}
                    />
                  </Button>
                </Tooltip>
              </div>
            )}

            {wallet?.pending_transactions && wallet.pending_transactions.length > 0 && (
              <Chip size="sm" color="warning" variant="flat" startContent={<Icon icon="solar:clock-circle-bold" width={14} />}>
                {wallet.pending_transactions.length} pending transaction{wallet.pending_transactions.length > 1 ? 's' : ''}
              </Chip>
            )}
          </CardBody>
        </Card>

        {/* Stats Card */}
        <Card>
          <CardBody className="gap-4 p-6">
            <h3 className="font-semibold text-default-700">Quick Stats</h3>
            <Divider />
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon icon="solar:cup-star-bold" className="text-success" width={20} />
                  <span className="text-sm text-default-600">Total Won</span>
                </div>
                <span className="font-semibold text-success">
                  {wallet ? formatAmount(wallet.total_prizes_won) : '$0.00'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon icon="solar:calendar-bold" className="text-warning" width={20} />
                  <span className="text-sm text-default-600">Today&apos;s Wins</span>
                </div>
                <span className="font-semibold text-warning">
                  {wallet ? formatAmount(wallet.daily_prize_winnings) : '$0.00'}
                </span>
              </div>
              <Divider />
              <Button
                as={Link}
                href="/settings?tab=billing"
                size="sm"
                variant="flat"
                fullWidth
                endContent={<Icon icon="solar:arrow-right-bold" width={16} />}
              >
                Billing Settings
              </Button>
            </div>
          </CardBody>
        </Card>
      </motion.div>

      {/* Transaction History */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          <CardHeader className="flex justify-between items-center px-6 py-4">
            <h3 className="font-semibold text-lg">Recent Transactions</h3>
            <Button
              size="sm"
              variant="flat"
              endContent={<Icon icon="solar:history-bold" width={16} />}
              onPress={() => setIsHistoryOpen(true)}
            >
              View All
            </Button>
          </CardHeader>
          <Divider />
          <CardBody className="p-0">
            {transactions.length > 0 ? (
              <>
                <Table
                  aria-label="Transaction history"
                  removeWrapper
                  classNames={{
                    th: 'bg-default-100 text-default-600',
                  }}
                >
                  <TableHeader>
                    <TableColumn>TYPE</TableColumn>
                    <TableColumn>AMOUNT</TableColumn>
                    <TableColumn>STATUS</TableColumn>
                    <TableColumn>DATE</TableColumn>
                    <TableColumn>REFERENCE</TableColumn>
                  </TableHeader>
                  <TableBody>
                    {paginatedTransactions.map((tx) => (
                      <TableRow key={tx.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getTransactionIcon(tx.type)}
                            <span className="capitalize">{tx.type.replace('_', ' ')}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className={tx.type === 'withdrawal' || tx.type === 'entry_fee' ? 'text-danger' : 'text-success'}>
                            {tx.type === 'withdrawal' || tx.type === 'entry_fee' ? '-' : '+'}
                            {formatAmount(tx.amount)}
                          </span>
                        </TableCell>
                        <TableCell>{getStatusChip(tx.status || 'pending')}</TableCell>
                        <TableCell className="text-default-500 text-sm">
                          {new Date(tx.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <code className="text-xs text-default-400">
                            {tx.id.slice(0, 8)}...
                          </code>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {totalPages > 1 && (
                  <div className="flex justify-center py-4">
                    <Pagination
                      total={totalPages}
                      page={page}
                      onChange={setPage}
                      showControls
                      size="sm"
                    />
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Icon icon="solar:history-bold-duotone" width={48} className="text-default-300 mb-4" />
                <p className="text-default-500">No transactions yet</p>
                <p className="text-sm text-default-400 mt-1">Your transaction history will appear here</p>
                <Button
                  color="primary"
                  variant="flat"
                  className="mt-4"
                  startContent={<Icon icon="solar:download-minimalistic-bold" width={18} />}
                  onPress={() => setIsDepositOpen(true)}
                >
                  Make your first deposit
                </Button>
              </div>
            )}
          </CardBody>
        </Card>
      </motion.div>

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
    </div>
  );
}

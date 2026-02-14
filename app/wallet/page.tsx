"use client";

/**
 * Wallet Management Page
 * Full wallet dashboard with balance, transactions, and quick actions
 * Mobile-first responsive design with app-like experience
 */

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardBody,
  CardHeader,
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
  Button,
} from "@nextui-org/react";
import { EsportsButton } from "@/components/ui/esports-button";
import { MobileNavigation } from "@/components/ui";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import { useRequireAuth } from "@/hooks/use-auth";
import type { Currency } from "@/types/replay-api/wallet.types";
import {
  formatAmount,
  formatEVMAddress,
  getAmountValue,
  getEVMAddressValue,
  normalizeTransactionType,
} from "@/types/replay-api/wallet.types";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import { DepositModal } from "@/components/wallet/modals/deposit-modal";
import { WithdrawModal } from "@/components/wallet/modals/withdraw-modal";
import { TransactionHistoryModal } from "@/components/wallet/modals/transaction-history-modal";
import { useWallet } from "@/hooks/use-wallet";
import { logger } from "@/lib/logger";

export default function WalletPage() {
  const router = useRouter();
  const {
    isAuthenticated,
    isLoading: isAuthLoading,
    isRedirecting,
  } = useRequireAuth({
    callbackUrl: "/wallet",
  });

  // Use the SDK-powered wallet hook - only fetch when fully authenticated
  const {
    balance: wallet,
    transactions: transactionsResult,
    isLoadingBalance,
    isLoadingTransactions,
    refreshBalance,
    refreshTransactions,
  } = useWallet(isAuthenticated, { limit: 50, offset: 0 });

  const transactions = React.useMemo(
    () => transactionsResult?.transactions || [],
    [transactionsResult?.transactions],
  );
  const isLoading = isAuthLoading || isLoadingBalance || isLoadingTransactions;

  const [selectedCurrency, setSelectedCurrency] = useState<Currency>("USD");
  const [showCopied, setShowCopied] = useState(false);

  // Modal states
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // Pagination
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;

  // Auto-refresh balance every 15 seconds when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const interval = setInterval(refreshBalance, 15000);
      return () => clearInterval(interval);
    }
    return undefined;
  }, [isAuthenticated, refreshBalance]);

  const handleDepositSuccess = () => {
    refreshBalance();
    refreshTransactions();
  };

  const handleWithdrawSuccess = () => {
    refreshBalance();
    refreshTransactions();
  };

  const copyAddress = async () => {
    if (!wallet) return;
    try {
      await navigator.clipboard.writeText(
        getEVMAddressValue(wallet.evm_address),
      );
      setShowCopied(true);
      setTimeout(() => setShowCopied(false), 2000);
    } catch (error) {
      logger.error("Failed to copy address", error);
    }
  };

  const getTransactionIcon = (type: string) => {
    const normalized = normalizeTransactionType(type);
    switch (normalized) {
      case "deposit":
        return (
          <Icon
            icon="solar:download-minimalistic-bold"
            className="text-success"
            width={20}
          />
        );
      case "withdrawal":
        return (
          <Icon
            icon="solar:upload-minimalistic-bold"
            className="text-warning"
            width={20}
          />
        );
      case "prize_payout":
        return (
          <Icon
            icon="solar:cup-star-bold"
            className="text-primary"
            width={20}
          />
        );
      case "entry_fee":
        return (
          <Icon
            icon="solar:gamepad-bold"
            className="text-secondary"
            width={20}
          />
        );
      case "refund":
        return (
          <Icon icon="solar:refresh-bold" className="text-default" width={20} />
        );
      default:
        return (
          <Icon icon="solar:wallet-bold" className="text-default" width={20} />
        );
    }
  };

  const getStatusChip = (status: string) => {
    const statusConfig: Record<
      string,
      { color: "success" | "warning" | "danger" | "default"; icon: string }
    > = {
      confirmed: { color: "success", icon: "solar:check-circle-bold" },
      pending: { color: "warning", icon: "solar:clock-circle-bold" },
      failed: { color: "danger", icon: "solar:close-circle-bold" },
      cancelled: { color: "default", icon: "solar:forbidden-circle-bold" },
    };
    const config = statusConfig[status] || statusConfig.pending;
    return (
      <Chip
        size="sm"
        color={config.color}
        variant="flat"
        startContent={<Icon icon={config.icon} width={14} />}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Chip>
    );
  };

  /** Determine if a transaction is a debit (money out) */
  const isDebitTransaction = (tx: { type: string; entry_type?: string }) => {
    if (tx.entry_type === "debit") return true;
    const normalized = normalizeTransactionType(tx.type);
    return (
      normalized === "withdrawal" ||
      normalized === "entry_fee" ||
      normalized === "platform_fee"
    );
  };

  /** Format transaction type label for display */
  const formatTxTypeLabel = (type: string) => {
    return normalizeTransactionType(type).replace(/_/g, " ");
  };

  /** Get navigation link for match-related transactions */
  const getTransactionLink = (tx: {
    type: string;
    metadata?: Record<string, unknown>;
    id: string;
  }) => {
    const normalized = normalizeTransactionType(tx.type);
    const matchId = tx.metadata?.match_id as string | undefined;
    const scoreId = tx.metadata?.score_id as string | undefined;
    const gameId = tx.metadata?.game_id as string | undefined;

    if (scoreId) return `/scores/${scoreId}`;
    if (matchId && gameId) return `/matches/${gameId}/${matchId}`;
    if (normalized === "prize_payout" || normalized === "entry_fee") {
      // Even without metadata, indicate this is match-related
      return null;
    }
    return null;
  };

  // Paginated transactions
  const paginatedTransactions = React.useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    return transactions.slice(start, end);
  }, [page, transactions]);

  const totalPages = Math.ceil(transactions.length / rowsPerPage);

  // Show loading state while checking auth or loading data
  if (isLoading || isRedirecting) {
    return (
      <div className="w-full min-h-screen bg-[#F5F0E1] dark:bg-[#0a0a0a]">
        {/* Mobile Loading Skeleton */}
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 max-w-6xl mx-auto pb-24 md:pb-6">
          {/* Header Skeleton */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Skeleton className="w-12 h-12 rounded-xl" />
              <div className="space-y-2">
                <Skeleton className="h-6 w-32 rounded-lg" />
                <Skeleton className="h-4 w-48 rounded-lg hidden sm:block" />
              </div>
            </div>
            <div className="hidden sm:flex gap-2">
              <Skeleton className="h-10 w-28 rounded-lg" />
              <Skeleton className="h-10 w-28 rounded-lg" />
            </div>
          </div>

          {/* Balance Card Skeleton */}
          <Skeleton className="h-48 sm:h-56 rounded-xl" />

          {/* Stats Grid Skeleton - Mobile */}
          <div className="grid grid-cols-2 gap-3 sm:hidden">
            <Skeleton className="h-24 rounded-xl" />
            <Skeleton className="h-24 rounded-xl" />
          </div>

          {/* Stats Card Skeleton - Desktop */}
          <div className="hidden sm:grid sm:grid-cols-3 gap-6">
            <Skeleton className="h-48 rounded-xl col-span-2" />
            <Skeleton className="h-48 rounded-xl" />
          </div>

          {/* Transactions Skeleton */}
          <Skeleton className="h-64 sm:h-96 rounded-xl" />
        </div>

        {/* Mobile Navigation Skeleton */}
        <div className="fixed bottom-0 left-0 right-0 h-16 bg-white/95 dark:bg-[#0a0a0a]/95 border-t md:hidden">
          <div className="flex items-center justify-around h-full px-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="w-12 h-12 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // If not authenticated at this point, useRequireAuth will handle redirect
  if (!isAuthenticated) {
    return null;
  }

  const currentBalance = wallet?.balances[selectedCurrency];
  const currentBalanceDollars = getAmountValue(currentBalance).dollars;
  const totalBalanceUSD = wallet
    ? Object.values(wallet.balances).reduce(
        (sum, balance) => sum + getAmountValue(balance).dollars,
        0,
      )
    : 0;

  return (
    <div className="w-full min-h-screen bg-[#F5F0E1] dark:bg-[#0a0a0a]">
      {/* Main Content */}
      <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-4 sm:space-y-6 pb-24 md:pb-6">
        {/* Header - Responsive */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3 sm:gap-4">
            <div
              className="w-11 h-11 sm:w-12 sm:h-12 flex items-center justify-center bg-gradient-to-br from-[#FF4654] to-[#FFC700] dark:from-[#DCFF37] dark:to-[#34445C]"
              style={{
                clipPath:
                  "polygon(0 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%)",
              }}
            >
              <Icon
                icon="solar:wallet-bold-duotone"
                className="text-white dark:text-[#34445C]"
                width={24}
              />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-[#34445C] dark:text-white">
                My Wallet
              </h1>
              <p className="text-default-500 text-xs sm:text-sm hidden sm:block">
                Manage your funds and view transaction history
              </p>
            </div>
          </div>

          {/* Desktop Action Buttons */}
          <div className="hidden sm:flex gap-2">
            <EsportsButton
              variant="primary"
              glow
              startContent={
                <Icon icon="solar:download-minimalistic-bold" width={18} />
              }
              onClick={() => setIsDepositOpen(true)}
              disabled={wallet?.is_locked}
            >
              Deposit
            </EsportsButton>
            <EsportsButton
              variant="ghost"
              startContent={
                <Icon icon="solar:upload-minimalistic-bold" width={18} />
              }
              onClick={() => setIsWithdrawOpen(true)}
              disabled={totalBalanceUSD <= 0 || wallet?.is_locked}
            >
              Withdraw
            </EsportsButton>
          </div>
        </motion.div>

        {/* Balance Card - Mobile Optimized */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-gradient-to-br from-[#34445C]/5 to-[#FF4654]/5 dark:from-[#DCFF37]/5 dark:to-[#34445C]/10 border-2 border-[#FF4654]/20 dark:border-[#DCFF37]/30 rounded-xl sm:rounded-none">
            <CardBody className="gap-3 sm:gap-4 p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon
                    icon="solar:wallet-bold-duotone"
                    width={20}
                    className="text-[#FF4654] dark:text-[#DCFF37]"
                  />
                  <span className="font-semibold text-sm sm:text-base text-[#34445C] dark:text-white">
                    Available Balance
                  </span>
                </div>
                <Dropdown>
                  <DropdownTrigger>
                    <Button
                      size="sm"
                      variant="flat"
                      endContent={
                        <Icon icon="solar:alt-arrow-down-bold" width={14} />
                      }
                    >
                      {selectedCurrency}
                    </Button>
                  </DropdownTrigger>
                  <DropdownMenu
                    onAction={(key) => setSelectedCurrency(key as Currency)}
                  >
                    {wallet ? (
                      Object.keys(wallet.balances).map((currency) => (
                        <DropdownItem key={currency}>{currency}</DropdownItem>
                      ))
                    ) : (
                      <DropdownItem key="USD">USD</DropdownItem>
                    )}
                  </DropdownMenu>
                </Dropdown>
              </div>

              <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#FF4654] to-[#FFC700] dark:from-[#DCFF37] dark:to-[#34445C]">
                {currentBalance ? (
                  <AnimatedCounter
                    value={currentBalanceDollars}
                    prefix="$"
                    decimals={2}
                  />
                ) : (
                  "$0.00"
                )}
              </div>

              {wallet && (
                <div className="flex items-center gap-2 p-2.5 sm:p-3 rounded-lg bg-white/60 dark:bg-black/20">
                  <Icon
                    icon="solar:shield-keyhole-bold"
                    width={16}
                    className="text-default-500 flex-shrink-0"
                  />
                  <code className="text-xs sm:text-sm text-default-700 flex-1 truncate">
                    {formatEVMAddress(wallet.evm_address)}
                  </code>
                  <Tooltip content={showCopied ? "Copied!" : "Copy address"}>
                    <Button
                      isIconOnly
                      size="sm"
                      variant="light"
                      onPress={copyAddress}
                      className="min-w-8 w-8 h-8"
                    >
                      <Icon
                        icon={
                          showCopied
                            ? "solar:check-circle-bold"
                            : "solar:copy-bold"
                        }
                        width={16}
                        className={
                          showCopied ? "text-success" : "text-default-500"
                        }
                      />
                    </Button>
                  </Tooltip>
                </div>
              )}

              {wallet?.pending_transactions &&
                wallet.pending_transactions.length > 0 && (
                  <Chip
                    size="sm"
                    color="warning"
                    variant="flat"
                    startContent={
                      <Icon icon="solar:clock-circle-bold" width={14} />
                    }
                  >
                    {wallet.pending_transactions.length} pending
                  </Chip>
                )}

              {/* Locked Wallet Indicator */}
              {wallet?.is_locked && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-danger/10 border border-danger/30">
                  <Icon
                    icon="solar:lock-bold"
                    width={18}
                    className="text-danger flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-danger">
                      Wallet Locked
                    </p>
                    <p className="text-xs text-danger/70">
                      {wallet.lock_reason ||
                        "Your wallet has been temporarily locked. Contact support for assistance."}
                    </p>
                  </div>
                </div>
              )}
            </CardBody>
          </Card>
        </motion.div>

        {/* Mobile Quick Actions Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="grid grid-cols-2 gap-3 sm:hidden"
        >
          <button
            onClick={() => setIsDepositOpen(true)}
            disabled={wallet?.is_locked}
            className="mobile-stat-card flex-col gap-2 active:scale-[0.98] transition-transform disabled:opacity-50"
          >
            <div className="w-10 h-10 flex items-center justify-center rounded-full bg-gradient-to-br from-[#FF4654] to-[#FFC700]">
              <Icon
                icon="solar:download-minimalistic-bold"
                className="text-white"
                width={20}
              />
            </div>
            <span className="text-sm font-semibold text-[#34445C] dark:text-[#F5F0E1]">
              Deposit
            </span>
          </button>

          <button
            onClick={() => setIsWithdrawOpen(true)}
            disabled={totalBalanceUSD <= 0 || wallet?.is_locked}
            className="mobile-stat-card flex-col gap-2 active:scale-[0.98] transition-transform disabled:opacity-50"
          >
            <div className="w-10 h-10 flex items-center justify-center rounded-full bg-[#34445C]/10 dark:bg-[#DCFF37]/10">
              <Icon
                icon="solar:upload-minimalistic-bold"
                className="text-[#34445C] dark:text-[#DCFF37]"
                width={20}
              />
            </div>
            <span className="text-sm font-semibold text-[#34445C] dark:text-[#F5F0E1]">
              Withdraw
            </span>
          </button>
        </motion.div>

        {/* Stats Section - Responsive Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4"
        >
          <div className="mobile-stat-card">
            <Icon
              icon="solar:cup-star-bold"
              className="text-success w-5 h-5 sm:w-6 sm:h-6 mb-2"
            />
            <span className="mobile-stat-value text-lg sm:text-xl">
              {wallet ? formatAmount(wallet.total_prizes_won) : "$0"}
            </span>
            <span className="mobile-stat-label">Total Won</span>
          </div>

          <div className="mobile-stat-card">
            <Icon
              icon="solar:calendar-bold"
              className="text-warning w-5 h-5 sm:w-6 sm:h-6 mb-2"
            />
            <span className="mobile-stat-value text-lg sm:text-xl">
              {wallet ? formatAmount(wallet.daily_prize_winnings) : "$0"}
            </span>
            <span className="mobile-stat-label">Today&apos;s Wins</span>
          </div>

          <div className="mobile-stat-card">
            <Icon
              icon="solar:gamepad-bold"
              className="text-[#FF4654] dark:text-[#DCFF37] w-5 h-5 sm:w-6 sm:h-6 mb-2"
            />
            <span className="mobile-stat-value text-lg sm:text-xl">
              {
                transactions.filter(
                  (t) => normalizeTransactionType(t.type) === "entry_fee",
                ).length
              }
            </span>
            <span className="mobile-stat-label">Matches</span>
          </div>

          <div className="mobile-stat-card">
            <Icon
              icon="solar:history-bold"
              className="text-[#34445C] dark:text-[#F5F0E1] w-5 h-5 sm:w-6 sm:h-6 mb-2"
            />
            <span className="mobile-stat-value text-lg sm:text-xl">
              {transactions.length}
            </span>
            <span className="mobile-stat-label">Transactions</span>
          </div>
        </motion.div>

        {/* Transaction History - Mobile Optimized */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <Card className="rounded-xl sm:rounded-none border border-[#FF4654]/20 dark:border-[#DCFF37]/20 overflow-hidden">
            <CardHeader className="flex justify-between items-center px-4 sm:px-6 py-3 sm:py-4 bg-[#34445C]/5 dark:bg-[#DCFF37]/5">
              <h3 className="font-semibold text-base sm:text-lg text-[#34445C] dark:text-white">
                Recent Transactions
              </h3>
              <EsportsButton
                size="sm"
                variant="ghost"
                onClick={() => setIsHistoryOpen(true)}
                className="min-w-0 px-2 sm:px-4"
              >
                <span className="hidden sm:inline">View All</span>
                <Icon icon="solar:history-bold" width={16} />
              </EsportsButton>
            </CardHeader>
            <Divider />
            <CardBody className="p-0">
              {transactions.length > 0 ? (
                <>
                  {/* Mobile Transaction List */}
                  <div className="sm:hidden">
                    {paginatedTransactions.map((tx, index) => (
                      <div
                        key={tx.id}
                        className={`mobile-list-item ${index === paginatedTransactions.length - 1 ? "border-b-0" : ""} ${getTransactionLink(tx) ? "cursor-pointer hover:bg-default-100/50 transition-colors" : ""}`}
                        onClick={() => {
                          const link = getTransactionLink(tx);
                          if (link) router.push(link);
                        }}
                      >
                        <div className="flex-shrink-0">
                          {getTransactionIcon(tx.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm text-[#34445C] dark:text-[#F5F0E1] capitalize truncate">
                            {formatTxTypeLabel(tx.type)}
                          </p>
                          <p className="text-xs text-[#34445C]/60 dark:text-[#F5F0E1]/60">
                            {new Date(tx.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p
                            className={`font-semibold text-sm ${isDebitTransaction(tx) ? "text-danger" : "text-success"}`}
                          >
                            {isDebitTransaction(tx) ? "-" : "+"}
                            {formatAmount(tx.amount)}
                          </p>
                          <div className="mt-1">
                            {getStatusChip(tx.status || "pending")}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Desktop Transaction Table */}
                  <div className="hidden sm:block">
                    <Table
                      aria-label="Transaction history"
                      removeWrapper
                      classNames={{
                        th: "bg-[#34445C]/5 dark:bg-[#DCFF37]/5 text-[#34445C] dark:text-[#DCFF37] rounded-none",
                        td: "rounded-none",
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
                                <span className="capitalize">
                                  {formatTxTypeLabel(tx.type)}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <span
                                className={
                                  isDebitTransaction(tx)
                                    ? "text-danger"
                                    : "text-success"
                                }
                              >
                                {isDebitTransaction(tx) ? "-" : "+"}
                                {formatAmount(tx.amount)}
                              </span>
                            </TableCell>
                            <TableCell>
                              {getStatusChip(tx.status || "pending")}
                            </TableCell>
                            <TableCell className="text-default-500 text-sm">
                              {new Date(tx.created_at).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              {(() => {
                                const link = getTransactionLink(tx);
                                if (link) {
                                  return (
                                    <Link
                                      className="text-xs text-primary cursor-pointer flex items-center gap-1"
                                      onPress={() => router.push(link)}
                                    >
                                      <Icon icon="solar:link-bold" width={12} />
                                      {tx.id.slice(0, 8)}...
                                    </Link>
                                  );
                                }
                                return (
                                  <code className="text-xs text-default-400">
                                    {tx.id.slice(0, 8)}...
                                  </code>
                                );
                              })()}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

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
                <div className="mobile-empty-state">
                  <div className="mobile-empty-icon">
                    <Icon
                      icon="solar:history-bold-duotone"
                      width={32}
                      className="text-[#34445C]/50 dark:text-[#F5F0E1]/50"
                    />
                  </div>
                  <p className="mobile-empty-title">No transactions yet</p>
                  <p className="mobile-empty-text">
                    Your transaction history will appear here
                  </p>
                  <EsportsButton
                    variant="primary"
                    className="mt-4"
                    size="sm"
                    startContent={
                      <Icon
                        icon="solar:download-minimalistic-bold"
                        width={18}
                      />
                    }
                    onClick={() => setIsDepositOpen(true)}
                  >
                    Make your first deposit
                  </EsportsButton>
                </div>
              )}
            </CardBody>
          </Card>
        </motion.div>

        {/* Quick Link to Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="hidden sm:block"
        >
          <EsportsButton
            as={Link}
            href="/settings?tab=billing"
            size="sm"
            variant="ghost"
            className="w-full sm:w-auto"
          >
            <Icon icon="solar:settings-bold" width={16} />
            Billing Settings
            <Icon icon="solar:arrow-right-bold" width={16} />
          </EsportsButton>
        </motion.div>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNavigation />

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

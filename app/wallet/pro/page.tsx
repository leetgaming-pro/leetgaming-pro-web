"use client";

/**
 * Pro Wallet Dashboard Page
 * Comprehensive wallet management with escrow matches, multi-chain support,
 * MPC security, and award-winning LeetGaming branding
 */

import React, { useState, useCallback } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Chip,
  Tabs,
  Tab,
  Badge,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Skeleton,
  Tooltip,
} from "@nextui-org/react";
import { EsportsButton } from "@/components/ui/esports-button";
import { Icon } from "@iconify/react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@nextui-org/react";
import { useRequireAuth } from "@/hooks/use-auth";
import { useEscrowWallet } from "@/hooks/use-escrow-wallet";
import { EscrowMatchCard } from "@/components/wallet/escrow/escrow-match-card";
import { WalletSecurityCard } from "@/components/wallet/escrow/wallet-security-card";
import { ChainSelector } from "@/components/wallet/escrow/chain-selector";
import { EscrowHistoryPanel } from "@/components/wallet/escrow/escrow-history-panel";
import { DepositModal } from "@/components/wallet/modals/deposit-modal";
import { WithdrawModal } from "@/components/wallet/modals/withdraw-modal";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import Link from "next/link";
import type {
  WalletViewMode,
  MPCSigningRequest,
} from "@/types/replay-api/escrow-wallet.types";

// MPC Signing Modal Component
function MPCSigningModal({
  request,
  isOpen,
  onClose,
  onApprove,
  onReject,
}: {
  request: MPCSigningRequest | null;
  isOpen: boolean;
  onClose: () => void;
  onApprove: () => void;
  onReject: () => void;
}) {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleApprove = async () => {
    setIsProcessing(true);
    await onApprove();
    setIsProcessing(false);
    onClose();
  };

  if (!request) return null;

  const txTypeLabels: Record<
    string,
    { label: string; icon: string; color: string }
  > = {
    match_entry: {
      label: "Enter Match",
      icon: "solar:login-3-bold",
      color: "primary",
    },
    prize_claim: {
      label: "Claim Prize",
      icon: "solar:hand-money-bold",
      color: "success",
    },
    withdrawal: {
      label: "Withdrawal",
      icon: "solar:upload-minimalistic-bold",
      color: "warning",
    },
    transfer: {
      label: "Transfer",
      icon: "solar:transfer-horizontal-bold",
      color: "secondary",
    },
  };

  const txInfo =
    txTypeLabels[request.transaction_type] || txTypeLabels.transfer;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalContent className="rounded-none">
        <ModalHeader className="flex items-center gap-3 bg-[#34445C]/5 dark:bg-[#DCFF37]/5">
          <div
            className={cn(
              "w-10 h-10 rounded-lg flex items-center justify-center bg-gradient-to-br from-[#FF4654] to-[#FFC700] dark:from-[#DCFF37] dark:to-[#34445C]",
            )}
          >
            <Icon
              icon="solar:key-bold"
              className="w-5 h-5 text-white dark:text-[#34445C]"
            />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-[#34445C] dark:text-white">
              Approve Transaction
            </h3>
            <p className="text-sm text-default-500">MPC signing required</p>
          </div>
        </ModalHeader>

        <ModalBody className="py-6">
          {/* Transaction Type */}
          <div className="flex items-center justify-between p-4 rounded-lg bg-[#34445C]/5 dark:bg-[#DCFF37]/5">
            <div className="flex items-center gap-3">
              <Icon
                icon={txInfo.icon}
                className="w-6 h-6 text-[#FF4654] dark:text-[#DCFF37]"
              />
              <div>
                <p className="font-semibold text-[#34445C] dark:text-white">
                  {txInfo.label}
                </p>
                <p className="text-xs text-default-500">
                  Chain: {request.chain_id.replace(":", " - ")}
                </p>
              </div>
            </div>
            <Chip
              color={
                txInfo.color as
                  | "primary"
                  | "secondary"
                  | "success"
                  | "warning"
                  | "danger"
                  | "default"
              }
              variant="flat"
              className="rounded-none"
            >
              {request.status}
            </Chip>
          </div>

          {/* MPC Progress */}
          <div className="space-y-3 mt-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-default-600">MPC Signatures</span>
              <span className="text-sm font-semibold text-[#34445C] dark:text-white">
                {request.shards_collected} / {request.threshold_required}{" "}
                required
              </span>
            </div>

            <div className="flex items-center gap-2">
              {Array.from({ length: request.threshold_required }).map(
                (_, i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: i * 0.1 }}
                    className={cn(
                      "flex-1 h-3 rounded-full transition-colors",
                      i < request.shards_collected
                        ? "bg-gradient-to-r from-[#DCFF37] to-[#34445C]"
                        : "bg-default-200",
                    )}
                  />
                ),
              )}
            </div>

            <p className="text-xs text-center text-default-500">
              Your device signature + platform co-signature
            </p>
          </div>

          {/* Security Notice */}
          <div className="mt-4 p-3 rounded-lg bg-warning/10 border border-warning/20">
            <div className="flex items-start gap-2">
              <Icon
                icon="solar:shield-warning-bold"
                className="w-5 h-5 text-warning mt-0.5"
              />
              <div>
                <p className="text-sm font-medium text-warning-700 dark:text-warning">
                  Verify this transaction
                </p>
                <p className="text-xs text-warning-600 dark:text-warning-400 mt-1">
                  Only approve if you initiated this action. This cannot be
                  reversed.
                </p>
              </div>
            </div>
          </div>

          {/* Expiry */}
          <div className="flex items-center justify-center gap-2 mt-4 text-sm text-default-500">
            <Icon icon="solar:clock-circle-bold" width={16} />
            <span>
              Expires in{" "}
              {Math.max(
                0,
                Math.round(
                  (new Date(request.expires_at).getTime() - Date.now()) / 60000,
                ),
              )}{" "}
              minutes
            </span>
          </div>
        </ModalBody>

        <ModalFooter className="gap-2">
          <EsportsButton
            variant="danger"
            onClick={onReject}
            disabled={isProcessing}
          >
            Reject
          </EsportsButton>
          <EsportsButton
            variant="primary"
            glow
            loading={isProcessing}
            startContent={
              !isProcessing && (
                <Icon icon="solar:check-circle-bold" width={18} />
              )
            }
            onClick={handleApprove}
          >
            {isProcessing ? "Signing..." : "Approve & Sign"}
          </EsportsButton>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

// Quick Actions Card
function QuickActionsCard({
  onDeposit,
  onWithdraw,
  onFindMatch,
  balance,
}: {
  onDeposit: () => void;
  onWithdraw: () => void;
  onFindMatch: () => void;
  balance: number;
}) {
  return (
    <Card className="rounded-none border-2 border-[#34445C]/20 dark:border-[#DCFF37]/20 bg-gradient-to-br from-[#34445C]/5 to-[#FF4654]/5 dark:from-[#DCFF37]/5 dark:to-[#34445C]/10">
      <CardBody className="gap-3 p-4">
        <h3 className="font-semibold text-[#34445C] dark:text-white flex items-center gap-2">
          <Icon
            icon="solar:bolt-bold-duotone"
            className="text-[#FFC700]"
            width={20}
          />
          Quick Actions
        </h3>
        <div className="grid grid-cols-3 gap-2">
          <EsportsButton
            variant="primary"
            glow
            className="flex-col h-auto py-3"
            onClick={onDeposit}
          >
            <Icon icon="solar:download-minimalistic-bold" width={24} />
            <span className="text-xs mt-1">Deposit</span>
          </EsportsButton>
          <EsportsButton
            variant="ghost"
            className="flex-col h-auto py-3"
            onClick={onWithdraw}
            disabled={balance <= 0}
          >
            <Icon icon="solar:upload-minimalistic-bold" width={24} />
            <span className="text-xs mt-1">Withdraw</span>
          </EsportsButton>
          <EsportsButton
            variant="matchmaking"
            className="flex-col h-auto py-3"
            onClick={onFindMatch}
          >
            <Icon icon="solar:gamepad-bold" width={24} />
            <span className="text-xs mt-1">Find Match</span>
          </EsportsButton>
        </div>
      </CardBody>
    </Card>
  );
}

// Wallet Navigation Card - Access to all wallet features
function WalletNavigationCard() {
  const navItems = [
    {
      href: "/wallet/pro/transactions",
      icon: "solar:transfer-horizontal-bold",
      label: "Transactions",
      description: "History, pending, batch signing",
      badge: null,
      color: "text-[#FF4654]",
    },
    {
      href: "/wallet/pro/security",
      icon: "solar:shield-keyhole-bold",
      label: "Security Center",
      description: "MPC keys, devices, 2FA settings",
      badge: "PRO",
      color: "text-[#DCFF37]",
    },
    {
      href: "/wallet/pro/analytics",
      icon: "solar:chart-2-bold",
      label: "Analytics",
      description: "Earnings, ROI, tax export",
      badge: null,
      color: "text-[#FFC700]",
    },
    {
      href: "/wallet/pro/settings",
      icon: "solar:settings-bold",
      label: "Wallet Settings",
      description: "Limits, notifications, chains",
      badge: null,
      color: "text-default-500",
    },
  ];

  return (
    <Card className="rounded-none">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <Icon
            icon="solar:widget-5-bold"
            className="text-[#FF4654] dark:text-[#DCFF37]"
            width={20}
          />
          <span className="font-semibold text-[#34445C] dark:text-white">
            Wallet Features
          </span>
        </div>
      </CardHeader>
      <CardBody className="pt-0 gap-2">
        {navItems.map((item) => (
          <Link key={item.href} href={item.href} className="block">
            <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-[#34445C]/5 dark:hover:bg-[#DCFF37]/5 transition-colors cursor-pointer group">
              <div
                className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center bg-default-100 group-hover:bg-[#34445C]/10 dark:group-hover:bg-[#DCFF37]/10 transition-colors",
                )}
              >
                <Icon icon={item.icon} width={20} className={item.color} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-[#34445C] dark:text-white text-sm">
                    {item.label}
                  </span>
                  {item.badge && (
                    <Chip
                      size="sm"
                      color="warning"
                      variant="flat"
                      className="rounded-none h-5"
                    >
                      {item.badge}
                    </Chip>
                  )}
                </div>
                <p className="text-xs text-default-500 truncate">
                  {item.description}
                </p>
              </div>
              <Icon
                icon="solar:alt-arrow-right-linear"
                width={16}
                className="text-default-300 group-hover:text-[#FF4654] dark:group-hover:text-[#DCFF37] transition-colors"
              />
            </div>
          </Link>
        ))}
      </CardBody>
    </Card>
  );
}

export default function ProWalletDashboard() {
  const {
    isAuthenticated,
    isLoading: isAuthLoading,
    isRedirecting,
  } = useRequireAuth({
    callbackUrl: "/wallet/pro",
  });

  const {
    wallet,
    isLoadingWallet,
    walletError,
    activeMatches,
    isLoadingMatches: _isLoadingMatches,
    history,
    stats,
    isLoadingHistory,
    selectedChain,
    setSelectedChain,
    pendingSigningRequests,
    notifications: _notifications,
    unreadCount,
    enterMatch: _enterMatch,
    claimPrize: _claimPrize,
    approveSigning,
    rejectSigning,
    refreshWallet,
    refreshMatches: _refreshMatches,
    refreshHistory,
    getChainBalance: _getChainBalance,
  } = useEscrowWallet(isAuthenticated);

  const [viewMode, setViewMode] = useState<WalletViewMode>("overview");
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [activeSigningRequest, setActiveSigningRequest] =
    useState<MPCSigningRequest | null>(null);
  const {
    isOpen: isSigningOpen,
    onOpen: openSigning,
    onClose: closeSigning,
  } = useDisclosure();

  const isLoading = isAuthLoading || isLoadingWallet;

  // Calculate total balance
  const totalBalance =
    wallet?.addresses.reduce((sum, addr) => {
      if (!addr.balance) return sum;
      const native = addr.balance.native.dollars || 0;
      const tokens =
        addr.balance.tokens?.reduce(
          (t, tok) => t + (tok.usd_value?.dollars || 0),
          0,
        ) || 0;
      return sum + native + tokens;
    }, 0) || 0;

  // Handle signing request
  const handleSigningRequest = useCallback(
    (request: MPCSigningRequest) => {
      setActiveSigningRequest(request);
      openSigning();
    },
    [openSigning],
  );

  // Check for pending signing requests
  React.useEffect(() => {
    const pending = pendingSigningRequests.find((r) => r.status === "pending");
    if (pending && !isSigningOpen) {
      handleSigningRequest(pending);
    }
  }, [pendingSigningRequests, isSigningOpen, handleSigningRequest]);

  if (isLoading || isRedirecting) {
    return (
      <div className="w-full max-w-7xl mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-12 w-64 rounded-lg" />
          <div className="flex gap-2">
            <Skeleton className="h-10 w-32 rounded-lg" />
            <Skeleton className="h-10 w-32 rounded-lg" />
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-48 rounded-xl" />
            <Skeleton className="h-64 rounded-xl" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-48 rounded-xl" />
            <Skeleton className="h-64 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  // Show error state when wallet fails to load
  if (walletError) {
    return (
      <div className="w-full max-w-7xl mx-auto p-6">
        <Card className="rounded-none border-2 border-danger/30 bg-danger/5">
          <CardBody className="py-12 text-center">
            <div className="w-16 h-16 mx-auto rounded-full bg-danger/10 flex items-center justify-center mb-4">
              <Icon icon="solar:danger-triangle-bold" width={32} className="text-danger" />
            </div>
            <h3 className="text-lg font-semibold text-[#34445C] dark:text-white mb-2">
              Unable to Load Wallet
            </h3>
            <p className="text-default-500 mb-1">
              The wallet service is temporarily unavailable.
            </p>
            <p className="text-xs text-default-400 mb-6">
              {walletError}
            </p>
            <EsportsButton
              variant="primary"
              onClick={() => refreshWallet()}
              startContent={<Icon icon="solar:refresh-bold" width={18} />}
            >
              Try Again
            </EsportsButton>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4"
      >
        <div className="flex items-center gap-4">
          <div
            className="w-14 h-14 flex items-center justify-center bg-gradient-to-br from-[#FF4654] to-[#FFC700] dark:from-[#DCFF37] dark:to-[#34445C]"
            style={{
              clipPath:
                "polygon(0 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%)",
            }}
          >
            <Icon
              icon="solar:wallet-bold-duotone"
              className="text-white dark:text-[#34445C]"
              width={32}
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-[#34445C] dark:text-white">
                Pro Wallet
              </h1>
              {wallet?.wallet_type === "semi_custodial" && (
                <Tooltip content="MPC-secured wallet with multi-party signing">
                  <Chip
                    size="sm"
                    variant="flat"
                    color="secondary"
                    className="rounded-none"
                    startContent={
                      <Icon icon="solar:shield-check-bold" width={14} />
                    }
                  >
                    MPC Secured
                  </Chip>
                </Tooltip>
              )}
            </div>
            <p className="text-default-500 text-sm">
              Escrow-powered competitive gaming wallet
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Notifications */}
          <Badge
            content={unreadCount}
            color="danger"
            isInvisible={unreadCount === 0}
          >
            <EsportsButton variant="ghost" size="sm">
              <Icon icon="solar:bell-bold" width={20} />
            </EsportsButton>
          </Badge>

          {/* Total Balance */}
          <div className="text-right">
            <p className="text-xs text-default-500">Total Balance</p>
            <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#FF4654] to-[#FFC700] dark:from-[#DCFF37] dark:to-white">
              <AnimatedCounter value={totalBalance} prefix="$" decimals={2} />
            </p>
          </div>
        </div>
      </motion.div>

      {/* Navigation Tabs */}
      <Tabs
        selectedKey={viewMode}
        onSelectionChange={(key) => setViewMode(key as WalletViewMode)}
        classNames={{
          tabList: "gap-2 bg-[#34445C]/5 dark:bg-[#DCFF37]/5 p-1 rounded-none",
          cursor:
            "rounded-none bg-gradient-to-r from-[#FF4654] to-[#FFC700] dark:from-[#DCFF37] dark:to-[#34445C]",
          tab: "rounded-none",
          tabContent:
            "group-data-[selected=true]:text-white dark:group-data-[selected=true]:text-[#34445C]",
        }}
      >
        <Tab
          key="overview"
          title={
            <div className="flex items-center gap-2">
              <Icon icon="solar:home-bold" width={18} />
              <span>Overview</span>
            </div>
          }
        />
        <Tab
          key="escrow"
          title={
            <div className="flex items-center gap-2">
              <Icon icon="solar:gamepad-bold" width={18} />
              <span>Active Matches</span>
              {activeMatches.length > 0 && (
                <Chip
                  size="sm"
                  variant="flat"
                  color="primary"
                  className="rounded-full h-5 min-w-5"
                >
                  {activeMatches.length}
                </Chip>
              )}
            </div>
          }
        />
        <Tab
          key="history"
          title={
            <div className="flex items-center gap-2">
              <Icon icon="solar:history-bold" width={18} />
              <span>History</span>
            </div>
          }
        />
        <Tab
          key="security"
          title={
            <div className="flex items-center gap-2">
              <Icon icon="solar:shield-keyhole-bold" width={18} />
              <span>Security</span>
            </div>
          }
        />
      </Tabs>

      {/* Main Content */}
      <AnimatePresence mode="wait">
        {viewMode === "overview" && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            {/* Left Column - Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Chain Selector */}
              <ChainSelector
                addresses={wallet?.addresses || []}
                selectedChain={selectedChain || undefined}
                onSelectChain={setSelectedChain}
                onCopyAddress={(_addr) => {
                  // Show toast notification
                }}
              />

              {/* Active Matches Preview */}
              {activeMatches.length > 0 && (
                <Card className="rounded-none border-2 border-[#DCFF37]/30 bg-[#DCFF37]/5">
                  <CardHeader className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon
                        icon="solar:gamepad-bold-duotone"
                        className="text-[#DCFF37]"
                        width={20}
                      />
                      <span className="font-semibold text-[#34445C] dark:text-white">
                        Active Matches
                      </span>
                      <Chip
                        size="sm"
                        color="secondary"
                        variant="flat"
                        className="rounded-none"
                      >
                        {activeMatches.length}
                      </Chip>
                    </div>
                    <EsportsButton
                      size="sm"
                      variant="ghost"
                      onClick={() => setViewMode("escrow")}
                    >
                      View All
                      <Icon icon="solar:arrow-right-bold" width={16} />
                    </EsportsButton>
                  </CardHeader>
                  <CardBody className="pt-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {activeMatches.slice(0, 2).map((match) => (
                        <EscrowMatchCard
                          key={match.match_id}
                          match={match}
                          isUserParticipant={!!match.user_participation}
                          compact
                          onViewDetails={() => setViewMode("escrow")}
                        />
                      ))}
                    </div>
                  </CardBody>
                </Card>
              )}

              {/* Stats Preview */}
              {stats && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card className="rounded-none bg-success/10 border border-success/20">
                    <CardBody className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Icon
                          icon="solar:cup-star-bold"
                          className="text-success"
                          width={20}
                        />
                        <span className="text-xs text-default-500">
                          Total Won
                        </span>
                      </div>
                      <p className="text-xl font-bold text-success">
                        <AnimatedCounter
                          value={stats.total_prizes_won.dollars}
                          prefix="$"
                          decimals={2}
                        />
                      </p>
                    </CardBody>
                  </Card>
                  <Card className="rounded-none bg-primary/10 border border-primary/20">
                    <CardBody className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Icon
                          icon="solar:chart-2-bold"
                          className="text-primary"
                          width={20}
                        />
                        <span className="text-xs text-default-500">
                          Win Rate
                        </span>
                      </div>
                      <p className="text-xl font-bold text-primary">
                        {(stats.win_rate * 100).toFixed(1)}%
                      </p>
                    </CardBody>
                  </Card>
                  <Card className="rounded-none bg-warning/10 border border-warning/20">
                    <CardBody className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Icon
                          icon="solar:fire-bold"
                          className="text-warning"
                          width={20}
                        />
                        <span className="text-xs text-default-500">Streak</span>
                      </div>
                      <p className="text-xl font-bold text-warning">
                        {stats.current_streak} 🔥
                      </p>
                    </CardBody>
                  </Card>
                  <Card className="rounded-none bg-secondary/10 border border-secondary/20">
                    <CardBody className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Icon
                          icon="solar:gamepad-bold"
                          className="text-secondary"
                          width={20}
                        />
                        <span className="text-xs text-default-500">
                          Matches
                        </span>
                      </div>
                      <p className="text-xl font-bold text-secondary">
                        {stats.total_matches_entered}
                      </p>
                    </CardBody>
                  </Card>
                </div>
              )}
            </div>

            {/* Right Column - Sidebar */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <QuickActionsCard
                onDeposit={() => setIsDepositOpen(true)}
                onWithdraw={() => setIsWithdrawOpen(true)}
                onFindMatch={() => {
                  // Navigate to matchmaking
                }}
                balance={totalBalance}
              />

              {/* Wallet Navigation */}
              <WalletNavigationCard />

              {/* Security Card */}
              {wallet && (
                <WalletSecurityCard
                  wallet={wallet}
                  compact
                  onViewActivity={() => setViewMode("security")}
                />
              )}
            </div>
          </motion.div>
        )}

        {viewMode === "escrow" && (
          <motion.div
            key="escrow"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Active Matches Grid */}
            {activeMatches.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeMatches.map((match) => (
                  <EscrowMatchCard
                    key={match.match_id}
                    match={match}
                    isUserParticipant={!!match.user_participation}
                    onEnterMatch={() => {
                      // Handle enter match
                    }}
                    onClaimPrize={() => {
                      // Handle claim prize
                    }}
                  />
                ))}
              </div>
            ) : (
              <Card className="rounded-none border-2 border-dashed border-[#34445C]/30 dark:border-[#DCFF37]/30">
                <CardBody className="py-16 text-center">
                  <div
                    className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-[#34445C]/10 to-[#FF4654]/10 dark:from-[#DCFF37]/10 dark:to-[#34445C]/10 flex items-center justify-center mb-4"
                    style={{
                      clipPath:
                        "polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)",
                    }}
                  >
                    <Icon
                      icon="solar:gamepad-bold-duotone"
                      width={40}
                      className="text-default-300"
                    />
                  </div>
                  <h3 className="text-lg font-semibold text-[#34445C] dark:text-white mb-2">
                    No Active Matches
                  </h3>
                  <p className="text-default-500 mb-4">
                    You haven&apos;t joined any escrow matches yet
                  </p>
                  <EsportsButton
                    variant="matchmaking"
                    glow
                    startContent={
                      <Icon icon="solar:magnifer-bold" width={18} />
                    }
                  >
                    Find a Match
                  </EsportsButton>
                </CardBody>
              </Card>
            )}
          </motion.div>
        )}

        {viewMode === "history" && (
          <motion.div
            key="history"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <EscrowHistoryPanel
              history={history}
              stats={
                stats || {
                  total_matches_entered: 0,
                  total_matches_won: 0,
                  win_rate: 0,
                  total_entry_fees_paid: { cents: 0, dollars: 0 },
                  total_prizes_won: { cents: 0, dollars: 0 },
                  net_profit: { cents: 0, dollars: 0 },
                  biggest_win: { cents: 0, dollars: 0 },
                  current_streak: 0,
                  best_streak: 0,
                  stats_by_game: {},
                  last_30_days: {
                    matches: 0,
                    wins: 0,
                    profit: { cents: 0, dollars: 0 },
                  },
                }
              }
              isLoading={isLoadingHistory}
              onLoadMore={() => refreshHistory()}
            />
          </motion.div>
        )}

        {viewMode === "security" && (
          <motion.div
            key="security"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          >
            {wallet && (
              <>
                <WalletSecurityCard
                  wallet={wallet}
                  onSetupRecovery={() => {
                    // Navigate to recovery setup
                  }}
                  onRotateKeys={() => {
                    // Handle key rotation
                  }}
                  onViewActivity={() => {
                    // Show activity modal
                  }}
                />
                <ChainSelector
                  addresses={wallet.addresses}
                  selectedChain={selectedChain || undefined}
                  onSelectChain={setSelectedChain}
                />
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modals */}
      <DepositModal
        isOpen={isDepositOpen}
        onClose={() => setIsDepositOpen(false)}
        onSuccess={() => {
          refreshWallet();
          setIsDepositOpen(false);
        }}
      />

      <WithdrawModal
        isOpen={isWithdrawOpen}
        onClose={() => setIsWithdrawOpen(false)}
        onSuccess={() => {
          refreshWallet();
          setIsWithdrawOpen(false);
        }}
        availableBalance={totalBalance}
        currency="USD"
      />

      <MPCSigningModal
        request={activeSigningRequest}
        isOpen={isSigningOpen}
        onClose={closeSigning}
        onApprove={() => {
          if (activeSigningRequest) {
            approveSigning(activeSigningRequest.request_id);
          }
        }}
        onReject={() => {
          if (activeSigningRequest) {
            rejectSigning(activeSigningRequest.request_id);
            closeSigning();
          }
        }}
      />
    </div>
  );
}

"use client";

/**
 * Transaction Center
 * Comprehensive transaction management with queue, history, gas estimation, and batch operations
 * Supports EVM and Solana chains with real-time status updates
 */

import React, { useState, useMemo } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Chip,
  Tabs,
  Tab,
  Input,
  Select,
  SelectItem,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Checkbox,
  Skeleton,
  Pagination,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Spinner,
  Button,
} from "@nextui-org/react";
import { Icon } from "@iconify/react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@nextui-org/react";
import type {
  Transaction,
  SupportedChain,
  ExtendedTransactionStatus,
} from "@/types/replay-api/escrow-wallet.types";

interface TransactionCenterProps {
  transactions: Transaction[];
  pendingCount: number;
  selectedChain: SupportedChain;
  isLoading?: boolean;
  onSignTransaction?: (tx: Transaction) => Promise<void>;
  onCancelTransaction?: (txId: string) => Promise<void>;
  onRetryTransaction?: (txId: string) => Promise<void>;
  onSpeedUpTransaction?: (txId: string, newGas: number) => Promise<void>;
  onExportHistory?: (format: "csv" | "json" | "pdf") => Promise<void>;
}

// Chain configs with icons and explorer URLs
const CHAIN_CONFIG: Record<
  SupportedChain,
  {
    name: string;
    icon: string;
    explorer: string;
    gasUnit: string;
    avgConfirmTime: string;
  }
> = {
  ethereum: {
    name: "Ethereum",
    icon: "token:eth",
    explorer: "https://etherscan.io/tx/",
    gasUnit: "Gwei",
    avgConfirmTime: "~12s",
  },
  polygon: {
    name: "Polygon",
    icon: "token:matic",
    explorer: "https://polygonscan.com/tx/",
    gasUnit: "Gwei",
    avgConfirmTime: "~2s",
  },
  base: {
    name: "Base",
    icon: "simple-icons:coinbase",
    explorer: "https://basescan.org/tx/",
    gasUnit: "Gwei",
    avgConfirmTime: "~2s",
  },
  arbitrum: {
    name: "Arbitrum",
    icon: "simple-icons:arbitrum",
    explorer: "https://arbiscan.io/tx/",
    gasUnit: "Gwei",
    avgConfirmTime: "~1s",
  },
  optimism: {
    name: "Optimism",
    icon: "token:op",
    explorer: "https://optimistic.etherscan.io/tx/",
    gasUnit: "Gwei",
    avgConfirmTime: "~2s",
  },
  solana: {
    name: "Solana",
    icon: "token:sol",
    explorer: "https://solscan.io/tx/",
    gasUnit: "SOL",
    avgConfirmTime: "~400ms",
  },
};

// Transaction type display config
const TX_TYPE_CONFIG: Record<
  string,
  { label: string; icon: string; color: string }
> = {
  deposit: { label: "Deposit", icon: "solar:download-bold", color: "success" },
  withdrawal: {
    label: "Withdrawal",
    icon: "solar:upload-bold",
    color: "warning",
  },
  escrow_lock: {
    label: "Escrow Lock",
    icon: "solar:lock-bold",
    color: "primary",
  },
  escrow_release: {
    label: "Prize Release",
    icon: "solar:gift-bold",
    color: "success",
  },
  escrow_refund: {
    label: "Refund",
    icon: "solar:undo-left-bold",
    color: "secondary",
  },
  transfer: {
    label: "Transfer",
    icon: "solar:transfer-horizontal-bold",
    color: "default",
  },
  swap: { label: "Swap", icon: "solar:repeat-bold", color: "secondary" },
  approve: {
    label: "Approve",
    icon: "solar:check-circle-bold",
    color: "primary",
  },
};

// Status display config
const STATUS_CONFIG: Record<
  ExtendedTransactionStatus,
  {
    label: string;
    color:
      | "default"
      | "warning"
      | "success"
      | "danger"
      | "primary"
      | "secondary";
    icon: string;
  }
> = {
  pending: {
    label: "Pending",
    color: "warning",
    icon: "solar:clock-circle-bold",
  },
  submitted: {
    label: "Submitted",
    color: "primary",
    icon: "solar:clock-circle-bold",
  },
  confirming: {
    label: "Confirming",
    color: "secondary",
    icon: "solar:refresh-bold",
  },
  confirmed: {
    label: "Confirmed",
    color: "success",
    icon: "solar:check-circle-bold",
  },
  failed: { label: "Failed", color: "danger", icon: "solar:close-circle-bold" },
  cancelled: {
    label: "Cancelled",
    color: "default",
    icon: "solar:close-circle-bold",
  },
};

// Gas preset options
const GAS_PRESETS = [
  { key: "slow", label: "Slow", multiplier: 0.8, time: "~5 min" },
  { key: "standard", label: "Standard", multiplier: 1.0, time: "~1 min" },
  { key: "fast", label: "Fast", multiplier: 1.3, time: "~30s" },
  { key: "instant", label: "Instant", multiplier: 1.8, time: "~10s" },
];

// Transaction row component
function TransactionRow({
  transaction,
  onSign,
  onCancel,
  onRetry,
  onSpeedUp,
  isExpanded,
  onToggleExpand,
}: {
  transaction: Transaction;
  onSign?: () => void;
  onCancel?: () => void;
  onRetry?: () => void;
  onSpeedUp?: () => void;
  isExpanded: boolean;
  onToggleExpand: () => void;
}) {
  const typeConfig =
    TX_TYPE_CONFIG[transaction.type] || TX_TYPE_CONFIG.transfer;
  const statusConfig = STATUS_CONFIG[transaction.status];
  const chainConfig = CHAIN_CONFIG[transaction.chain];

  const formatAddress = (addr: string) =>
    `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  const formatDate = (date: Date) => new Date(date).toLocaleString();

  return (
    <div className="border-b border-default-100 last:border-0">
      {/* Main Row */}
      <div
        className="flex items-center gap-4 p-4 hover:bg-default-50 cursor-pointer transition-colors"
        onClick={onToggleExpand}
      >
        {/* Type Icon */}
        <div className="w-10 h-10 rounded-lg bg-default-100 flex items-center justify-center">
          <Icon
            icon={typeConfig.icon}
            width={20}
            className="text-[#FF4654] dark:text-[#DCFF37]"
          />
        </div>

        {/* Type & Chain */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-[#34445C] dark:text-white">
              {typeConfig.label}
            </span>
            <Chip size="sm" variant="flat" className="rounded-none">
              <div className="flex items-center gap-1">
                <Icon icon={chainConfig.icon} width={12} />
                {chainConfig.name}
              </div>
            </Chip>
          </div>
          <div className="flex items-center gap-2 text-xs text-default-500 mt-1">
            <span>{formatDate(transaction.timestamp)}</span>
            {transaction.hash && (
              <>
                <span>•</span>
                <a
                  href={`${chainConfig.explorer}${transaction.hash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#FF4654] dark:text-[#DCFF37] hover:underline"
                  onClick={(e) => e.stopPropagation()}
                >
                  {formatAddress(transaction.hash)}
                </a>
              </>
            )}
          </div>
        </div>

        {/* Amount */}
        <div className="text-right">
          <p
            className={cn(
              "font-bold",
              transaction.type === "withdrawal"
                ? "text-danger"
                : "text-success",
            )}
          >
            {transaction.type === "withdrawal" ? "-" : "+"}
            {transaction.amount} {transaction.token}
          </p>
          {transaction.fiatValue && (
            <p className="text-xs text-default-500">
              ${transaction.fiatValue.toFixed(2)} USD
            </p>
          )}
        </div>

        {/* Status */}
        <Chip
          size="sm"
          color={statusConfig.color}
          variant="flat"
          className="rounded-none min-w-[100px] justify-center"
          startContent={<Icon icon={statusConfig.icon} width={14} />}
        >
          {statusConfig.label}
        </Chip>

        {/* Actions */}
        <div
          className="flex items-center gap-2"
          onClick={(e) => e.stopPropagation()}
        >
          {transaction.status === "pending" &&
            transaction.requiresSignature && (
              <Button
                size="sm"
                className="rounded-none bg-gradient-to-r from-[#FF4654] to-[#FFC700] dark:from-[#DCFF37] dark:to-[#34445C] text-white dark:text-[#34445C]"
                onPress={() => onSign?.()}
              >
                Sign
              </Button>
            )}
          {(transaction.status === "pending" ||
            transaction.status === "submitted") && (
            <Dropdown>
              <DropdownTrigger>
                <Button
                  size="sm"
                  variant="flat"
                  isIconOnly
                  className="rounded-none"
                >
                  <Icon icon="solar:menu-dots-bold" width={16} />
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                aria-label="Transaction actions"
                items={[
                  ...(transaction.status === "submitted"
                    ? [
                        {
                          key: "speedup",
                          label: "Speed Up",
                          icon: "solar:rocket-bold",
                          action: onSpeedUp,
                          className: "",
                        },
                      ]
                    : []),
                  {
                    key: "cancel",
                    label: "Cancel",
                    icon: "solar:close-circle-bold",
                    action: onCancel,
                    className: "text-danger",
                  },
                ]}
              >
                {(item) => (
                  <DropdownItem
                    key={item.key}
                    startContent={<Icon icon={item.icon} width={16} />}
                    className={item.className}
                    onPress={item.action}
                  >
                    {item.label}
                  </DropdownItem>
                )}
              </DropdownMenu>
            </Dropdown>
          )}
          {transaction.status === "failed" && (
            <Button
              size="sm"
              variant="flat"
              className="rounded-none"
              startContent={<Icon icon="solar:refresh-bold" width={14} />}
              onPress={() => onRetry?.()}
            >
              Retry
            </Button>
          )}
          <Icon
            icon={
              isExpanded
                ? "solar:alt-arrow-up-bold"
                : "solar:alt-arrow-down-bold"
            }
            width={16}
            className="text-default-400"
          />
        </div>
      </div>

      {/* Expanded Details */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-0">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-lg bg-default-50">
                <div>
                  <p className="text-xs text-default-500">From</p>
                  <p className="text-sm font-mono">
                    {formatAddress(transaction.from)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-default-500">To</p>
                  <p className="text-sm font-mono">
                    {formatAddress(transaction.to)}
                  </p>
                </div>
                {transaction.gasUsed && (
                  <div>
                    <p className="text-xs text-default-500">Gas Used</p>
                    <p className="text-sm">
                      {transaction.gasUsed.toLocaleString()}
                    </p>
                  </div>
                )}
                {transaction.gasPrice && (
                  <div>
                    <p className="text-xs text-default-500">Gas Price</p>
                    <p className="text-sm">
                      {transaction.gasPrice} {chainConfig.gasUnit}
                    </p>
                  </div>
                )}
                {transaction.nonce !== undefined && (
                  <div>
                    <p className="text-xs text-default-500">Nonce</p>
                    <p className="text-sm">{transaction.nonce}</p>
                  </div>
                )}
                {transaction.confirmations !== undefined && (
                  <div>
                    <p className="text-xs text-default-500">Confirmations</p>
                    <p className="text-sm">{transaction.confirmations}</p>
                  </div>
                )}
                {transaction.blockNumber && (
                  <div>
                    <p className="text-xs text-default-500">Block</p>
                    <p className="text-sm">
                      {transaction.blockNumber.toLocaleString()}
                    </p>
                  </div>
                )}
                {transaction.error && (
                  <div className="col-span-2">
                    <p className="text-xs text-danger">Error</p>
                    <p className="text-sm text-danger">{transaction.error}</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Pending transaction queue item
function PendingQueueItem({
  transaction,
  isSelected,
  onSelect,
  onSign,
}: {
  transaction: Transaction;
  isSelected: boolean;
  onSelect: (selected: boolean) => void;
  onSign: () => void;
}) {
  const typeConfig =
    TX_TYPE_CONFIG[transaction.type] || TX_TYPE_CONFIG.transfer;
  const chainConfig = CHAIN_CONFIG[transaction.chain];

  return (
    <div
      className={cn(
        "flex items-center gap-3 p-3 rounded-lg border-2 transition-all",
        isSelected
          ? "border-[#FF4654] dark:border-[#DCFF37] bg-[#FF4654]/5 dark:bg-[#DCFF37]/5"
          : "border-default-200 hover:border-default-300",
      )}
    >
      <Checkbox
        isSelected={isSelected}
        onValueChange={onSelect}
        classNames={{ wrapper: "rounded-none" }}
      />
      <div className="w-8 h-8 rounded bg-default-100 flex items-center justify-center">
        <Icon
          icon={typeConfig.icon}
          width={16}
          className="text-[#FF4654] dark:text-[#DCFF37]"
        />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[#34445C] dark:text-white truncate">
          {typeConfig.label}
        </p>
        <div className="flex items-center gap-1 text-xs text-default-500">
          <Icon icon={chainConfig.icon} width={10} />
          {chainConfig.name}
        </div>
      </div>
      <div className="text-right">
        <p className="text-sm font-bold text-[#34445C] dark:text-white">
          {transaction.amount} {transaction.token}
        </p>
      </div>
      <Button
        size="sm"
        className="rounded-none bg-gradient-to-r from-[#FF4654] to-[#FFC700] dark:from-[#DCFF37] dark:to-[#34445C] text-white dark:text-[#34445C]"
        onPress={onSign}
      >
        Sign
      </Button>
    </div>
  );
}

// Gas estimator component
function GasEstimator({
  chain,
  estimatedGas,
  onGasChange,
}: {
  chain: SupportedChain;
  estimatedGas: number;
  onGasChange: (gas: number, preset: string) => void;
}) {
  const [selectedPreset, setSelectedPreset] = useState("standard");
  const chainConfig = CHAIN_CONFIG[chain];

  return (
    <Card className="rounded-none">
      <CardBody className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Icon
              icon="solar:gas-station-bold"
              width={20}
              className="text-[#FF4654] dark:text-[#DCFF37]"
            />
            <span className="font-semibold text-[#34445C] dark:text-white">
              Gas Settings
            </span>
          </div>
          <Chip size="sm" variant="flat" className="rounded-none">
            {chainConfig.name}
          </Chip>
        </div>

        <div className="grid grid-cols-4 gap-2 mb-4">
          {GAS_PRESETS.map((preset) => {
            const gasPrice = Math.round(estimatedGas * preset.multiplier);
            return (
              <div
                key={preset.key}
                className={cn(
                  "p-3 rounded-lg border-2 cursor-pointer transition-all text-center",
                  selectedPreset === preset.key
                    ? "border-[#FF4654] dark:border-[#DCFF37] bg-[#FF4654]/5 dark:bg-[#DCFF37]/5"
                    : "border-default-200 hover:border-default-300",
                )}
                onClick={() => {
                  setSelectedPreset(preset.key);
                  onGasChange(gasPrice, preset.key);
                }}
              >
                <p className="text-xs font-medium text-[#34445C] dark:text-white">
                  {preset.label}
                </p>
                <p className="text-lg font-bold text-[#FF4654] dark:text-[#DCFF37]">
                  {gasPrice}
                </p>
                <p className="text-xs text-default-500">
                  {chainConfig.gasUnit}
                </p>
                <p className="text-xs text-default-400 mt-1">{preset.time}</p>
              </div>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          <Input
            type="number"
            label="Custom Gas Price"
            placeholder="Enter custom gas"
            size="sm"
            classNames={{ inputWrapper: "rounded-none" }}
            endContent={
              <span className="text-xs text-default-400">
                {chainConfig.gasUnit}
              </span>
            }
            onValueChange={(v) => {
              const gas = parseInt(v);
              if (!isNaN(gas)) {
                setSelectedPreset("custom");
                onGasChange(gas, "custom");
              }
            }}
          />
        </div>
      </CardBody>
    </Card>
  );
}

export function TransactionCenter({
  transactions,
  pendingCount,
  selectedChain,
  isLoading = false,
  onSignTransaction,
  onCancelTransaction,
  onRetryTransaction,
  onSpeedUpTransaction,
  onExportHistory,
}: TransactionCenterProps) {
  const [selectedTab, setSelectedTab] = useState("all");
  const [expandedTx, setExpandedTx] = useState<string | null>(null);
  const [selectedPending, setSelectedPending] = useState<Set<string>>(
    new Set(),
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [filterChain, setFilterChain] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [isBatchSigning, setIsBatchSigning] = useState(false);

  const {
    isOpen: isSpeedUpOpen,
    onOpen: onSpeedUpOpen,
    onClose: onSpeedUpClose,
  } = useDisclosure();
  const [speedUpTxId, setSpeedUpTxId] = useState<string | null>(null);

  const ITEMS_PER_PAGE = 10;

  // Filter and sort transactions
  const filteredTransactions = useMemo(() => {
    let filtered = [...transactions];

    // Tab filter
    if (selectedTab === "pending") {
      filtered = filtered.filter(
        (tx) => tx.status === "pending" || tx.status === "submitted",
      );
    } else if (selectedTab === "escrow") {
      filtered = filtered.filter(
        (tx) =>
          tx.type === "escrow_lock" ||
          tx.type === "escrow_release" ||
          tx.type === "escrow_refund",
      );
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (tx) =>
          tx.hash?.toLowerCase().includes(query) ||
          tx.from.toLowerCase().includes(query) ||
          tx.to.toLowerCase().includes(query),
      );
    }

    // Chain filter
    if (filterChain !== "all") {
      filtered = filtered.filter((tx) => tx.chain === filterChain);
    }

    // Type filter
    if (filterType !== "all") {
      filtered = filtered.filter((tx) => tx.type === filterType);
    }

    // Status filter
    if (filterStatus !== "all") {
      filtered = filtered.filter((tx) => tx.status === filterStatus);
    }

    // Sort by timestamp descending
    filtered.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );

    return filtered;
  }, [
    transactions,
    selectedTab,
    searchQuery,
    filterChain,
    filterType,
    filterStatus,
  ]);

  // Paginate
  const totalPages = Math.ceil(filteredTransactions.length / ITEMS_PER_PAGE);
  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  // Pending transactions requiring signature
  const pendingSignatures = transactions.filter(
    (tx) => tx.status === "pending" && tx.requiresSignature,
  );

  const handleBatchSign = async () => {
    if (selectedPending.size === 0) return;

    setIsBatchSigning(true);
    try {
      const txIds = Array.from(selectedPending);
      for (const txId of txIds) {
        const tx = transactions.find((t) => t.id === txId);
        if (tx) {
          await onSignTransaction?.(tx);
        }
      }
      setSelectedPending(new Set());
    } finally {
      setIsBatchSigning(false);
    }
  };

  const handleSpeedUp = (txId: string) => {
    setSpeedUpTxId(txId);
    onSpeedUpOpen();
  };

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="rounded-none">
          <CardBody className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
                <Icon
                  icon="solar:clock-circle-bold"
                  className="text-warning"
                  width={20}
                />
              </div>
              <div>
                <p className="text-xs text-default-500">Pending</p>
                <p className="text-xl font-bold text-[#34445C] dark:text-white">
                  {pendingCount}
                </p>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="rounded-none">
          <CardBody className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                <Icon
                  icon="solar:check-circle-bold"
                  className="text-success"
                  width={20}
                />
              </div>
              <div>
                <p className="text-xs text-default-500">Confirmed Today</p>
                <p className="text-xl font-bold text-[#34445C] dark:text-white">
                  {
                    transactions.filter((tx) => {
                      const today = new Date();
                      const txDate = new Date(tx.timestamp);
                      return (
                        tx.status === "confirmed" &&
                        txDate.toDateString() === today.toDateString()
                      );
                    }).length
                  }
                </p>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="rounded-none">
          <CardBody className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Icon
                  icon="solar:lock-bold"
                  className="text-primary"
                  width={20}
                />
              </div>
              <div>
                <p className="text-xs text-default-500">Active Escrows</p>
                <p className="text-xl font-bold text-[#34445C] dark:text-white">
                  {
                    transactions.filter(
                      (tx) =>
                        tx.type === "escrow_lock" && tx.status === "confirmed",
                    ).length
                  }
                </p>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="rounded-none">
          <CardBody className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-danger/10 flex items-center justify-center">
                <Icon
                  icon="solar:close-circle-bold"
                  className="text-danger"
                  width={20}
                />
              </div>
              <div>
                <p className="text-xs text-default-500">Failed Today</p>
                <p className="text-xl font-bold text-[#34445C] dark:text-white">
                  {
                    transactions.filter((tx) => {
                      const today = new Date();
                      const txDate = new Date(tx.timestamp);
                      return (
                        tx.status === "failed" &&
                        txDate.toDateString() === today.toDateString()
                      );
                    }).length
                  }
                </p>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Pending Signatures Queue */}
      {pendingSignatures.length > 0 && (
        <Card className="rounded-none border-2 border-warning/50">
          <CardHeader className="flex items-center justify-between bg-warning/5">
            <div className="flex items-center gap-2">
              <Icon
                icon="solar:pen-new-round-bold"
                className="text-warning"
                width={20}
              />
              <span className="font-semibold text-[#34445C] dark:text-white">
                Awaiting Signature ({pendingSignatures.length})
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="flat"
                className="rounded-none"
                onPress={() => {
                  if (selectedPending.size === pendingSignatures.length) {
                    setSelectedPending(new Set());
                  } else {
                    setSelectedPending(
                      new Set(pendingSignatures.map((tx) => tx.id)),
                    );
                  }
                }}
              >
                {selectedPending.size === pendingSignatures.length
                  ? "Deselect All"
                  : "Select All"}
              </Button>
              <Button
                size="sm"
                className="rounded-none bg-gradient-to-r from-[#FF4654] to-[#FFC700] dark:from-[#DCFF37] dark:to-[#34445C] text-white dark:text-[#34445C]"
                startContent={
                  isBatchSigning ? (
                    <Spinner size="sm" />
                  ) : (
                    <Icon icon="solar:pen-bold" width={14} />
                  )
                }
                isDisabled={selectedPending.size === 0 || isBatchSigning}
                onPress={handleBatchSign}
              >
                Sign Selected ({selectedPending.size})
              </Button>
            </div>
          </CardHeader>
          <CardBody className="p-4">
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {pendingSignatures.map((tx) => (
                <PendingQueueItem
                  key={tx.id}
                  transaction={tx}
                  isSelected={selectedPending.has(tx.id)}
                  onSelect={(selected) => {
                    const newSet = new Set(selectedPending);
                    if (selected) {
                      newSet.add(tx.id);
                    } else {
                      newSet.delete(tx.id);
                    }
                    setSelectedPending(newSet);
                  }}
                  onSign={() => onSignTransaction?.(tx)}
                />
              ))}
            </div>
          </CardBody>
        </Card>
      )}

      {/* Transaction History */}
      <Card className="rounded-none">
        <CardHeader className="flex flex-col gap-4">
          <div className="flex items-center justify-between w-full">
            <Tabs
              selectedKey={selectedTab}
              onSelectionChange={(key) => setSelectedTab(key as string)}
              classNames={{
                tab: "rounded-none",
                cursor: "rounded-none",
              }}
            >
              <Tab key="all" title="All Transactions" />
              <Tab
                key="pending"
                title={
                  <div className="flex items-center gap-2">
                    Pending
                    {pendingCount > 0 && (
                      <Chip
                        size="sm"
                        color="warning"
                        variant="flat"
                        className="rounded-none"
                      >
                        {pendingCount}
                      </Chip>
                    )}
                  </div>
                }
              />
              <Tab key="escrow" title="Escrow" />
            </Tabs>

            <Dropdown>
              <DropdownTrigger>
                <Button
                  variant="flat"
                  className="rounded-none"
                  startContent={<Icon icon="solar:download-bold" width={16} />}
                >
                  Export
                </Button>
              </DropdownTrigger>
              <DropdownMenu aria-label="Export options">
                <DropdownItem
                  key="csv"
                  onPress={() => onExportHistory?.("csv")}
                >
                  Export as CSV
                </DropdownItem>
                <DropdownItem
                  key="json"
                  onPress={() => onExportHistory?.("json")}
                >
                  Export as JSON
                </DropdownItem>
                <DropdownItem
                  key="pdf"
                  onPress={() => onExportHistory?.("pdf")}
                >
                  Export as PDF
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3 w-full">
            <Input
              placeholder="Search by hash or address..."
              size="sm"
              className="max-w-xs"
              classNames={{ inputWrapper: "rounded-none" }}
              startContent={<Icon icon="solar:magnifer-linear" width={16} />}
              value={searchQuery}
              onValueChange={setSearchQuery}
            />
            <Select
              size="sm"
              label="Chain"
              selectedKeys={[filterChain]}
              onChange={(e) => setFilterChain(e.target.value)}
              className="max-w-[140px]"
              classNames={{ trigger: "rounded-none" }}
              items={[
                { key: "all", label: "All Chains" },
                ...Object.entries(CHAIN_CONFIG).map(([key, config]) => ({
                  key,
                  label: config.name,
                })),
              ]}
            >
              {(item) => <SelectItem key={item.key}>{item.label}</SelectItem>}
            </Select>
            <Select
              size="sm"
              label="Type"
              selectedKeys={[filterType]}
              onChange={(e) => setFilterType(e.target.value)}
              className="max-w-[140px]"
              classNames={{ trigger: "rounded-none" }}
              items={[
                { key: "all", label: "All Types" },
                ...Object.entries(TX_TYPE_CONFIG).map(([key, config]) => ({
                  key,
                  label: config.label,
                })),
              ]}
            >
              {(item) => <SelectItem key={item.key}>{item.label}</SelectItem>}
            </Select>
            <Select
              size="sm"
              label="Status"
              selectedKeys={[filterStatus]}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="max-w-[140px]"
              classNames={{ trigger: "rounded-none" }}
              items={[
                { key: "all", label: "All Status" },
                ...Object.entries(STATUS_CONFIG).map(([key, config]) => ({
                  key,
                  label: config.label,
                })),
              ]}
            >
              {(item) => <SelectItem key={item.key}>{item.label}</SelectItem>}
            </Select>
          </div>
        </CardHeader>

        <CardBody className="p-0">
          {isLoading ? (
            <div className="p-4 space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="w-10 h-10 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="w-32 h-4 rounded" />
                    <Skeleton className="w-48 h-3 rounded" />
                  </div>
                  <Skeleton className="w-20 h-6 rounded" />
                  <Skeleton className="w-24 h-6 rounded" />
                </div>
              ))}
            </div>
          ) : paginatedTransactions.length === 0 ? (
            <div className="p-12 text-center">
              <Icon
                icon="solar:inbox-bold"
                width={48}
                className="mx-auto text-default-300 mb-4"
              />
              <p className="text-default-500">No transactions found</p>
            </div>
          ) : (
            <>
              <div className="divide-y divide-default-100">
                {paginatedTransactions.map((tx) => (
                  <TransactionRow
                    key={tx.id}
                    transaction={tx}
                    isExpanded={expandedTx === tx.id}
                    onToggleExpand={() =>
                      setExpandedTx(expandedTx === tx.id ? null : tx.id)
                    }
                    onSign={() => onSignTransaction?.(tx)}
                    onCancel={() => onCancelTransaction?.(tx.id)}
                    onRetry={() => onRetryTransaction?.(tx.id)}
                    onSpeedUp={() => handleSpeedUp(tx.id)}
                  />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center p-4 border-t border-default-200">
                  <Pagination
                    total={totalPages}
                    page={currentPage}
                    onChange={setCurrentPage}
                    classNames={{
                      item: "rounded-none",
                      cursor:
                        "rounded-none bg-gradient-to-r from-[#FF4654] to-[#FFC700] dark:from-[#DCFF37] dark:to-[#34445C]",
                    }}
                  />
                </div>
              )}
            </>
          )}
        </CardBody>
      </Card>

      {/* Speed Up Modal */}
      <Modal isOpen={isSpeedUpOpen} onClose={onSpeedUpClose} size="md">
        <ModalContent className="rounded-none">
          <ModalHeader className="bg-[#34445C]/5 dark:bg-[#DCFF37]/5">
            <div className="flex items-center gap-2">
              <Icon
                icon="solar:rocket-bold"
                width={20}
                className="text-[#FF4654] dark:text-[#DCFF37]"
              />
              Speed Up Transaction
            </div>
          </ModalHeader>
          <ModalBody className="py-6">
            <p className="text-sm text-default-500 mb-4">
              Increase the gas price to prioritize this transaction. The new
              transaction will replace the existing one.
            </p>
            <GasEstimator
              chain={selectedChain}
              estimatedGas={50}
              onGasChange={(_gas, _preset) => {
              }}
            />
          </ModalBody>
          <ModalFooter>
            <Button
              variant="flat"
              className="rounded-none"
              onPress={onSpeedUpClose}
            >
              Cancel
            </Button>
            <Button
              className="rounded-none bg-gradient-to-r from-[#FF4654] to-[#FFC700] dark:from-[#DCFF37] dark:to-[#34445C] text-white dark:text-[#34445C]"
              onPress={() => {
                if (speedUpTxId) {
                  onSpeedUpTransaction?.(speedUpTxId, 75);
                }
                onSpeedUpClose();
              }}
            >
              Speed Up
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}

export default TransactionCenter;

/**
 * Transaction History Modal Component
 * Premium transaction list with filtering, search, and infinite scroll
 */

"use client";

import React, { useState, useEffect } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Select,
  SelectItem,
  Card,
  CardBody,
  Chip,
  Divider,
  Skeleton,
} from "@nextui-org/react";
import { motion, AnimatePresence } from "framer-motion";
import { Icon } from "@iconify/react";
import { useReplayApi } from "@/hooks/use-replay-api";
import { modalAnimations, springs } from "@/lib/design/animations";
import type {
  WalletTransaction,
  TransactionType,
  TransactionStatus,
  Currency,
} from "@/types/replay-api/wallet.types";
import { formatAmount } from "@/types/replay-api/wallet.types";

interface TransactionHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TransactionHistoryModal({
  isOpen,
  onClose,
}: TransactionHistoryModalProps) {
  const { sdk } = useReplayApi();
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [offset, setOffset] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<TransactionType | "all">("all");
  const [statusFilter, setStatusFilter] = useState<TransactionStatus | "all">(
    "all"
  );

  // Load transactions
  useEffect(() => {
    if (isOpen) {
      loadTransactions(true);
    }
  }, [isOpen, typeFilter, statusFilter]);

  const loadTransactions = async (reset = false) => {
    setIsLoading(true);
    try {
      const currentOffset = reset ? 0 : offset;
      const result = await sdk.wallet.getTransactions({
        limit: 20,
        offset: currentOffset,
        type: typeFilter === "all" ? undefined : typeFilter,
        status: statusFilter === "all" ? undefined : statusFilter,
      });

      if (result) {
        setTransactions(
          reset
            ? result.transactions
            : [...transactions, ...result.transactions]
        );
        setHasMore(result.has_more ?? false);
        setOffset(currentOffset + result.transactions.length);
      }
    } catch (error) {
      console.error("Failed to load transactions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMore = () => {
    if (!isLoading && hasMore) {
      loadTransactions(false);
    }
  };

  // Filter by search query
  const filteredTransactions = transactions.filter((tx) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      tx.id.toLowerCase().includes(query) ||
      tx.description?.toLowerCase().includes(query) ||
      tx.blockchain_tx_hash?.toLowerCase().includes(query)
    );
  });

  // Export transactions to CSV
  const exportToCSV = (transactions: WalletTransaction[]) => {
    const headers = [
      "Date",
      "Type",
      "Amount",
      "Currency",
      "Status",
      "Description",
      "Transaction ID",
      "Blockchain Hash",
    ];
    const rows = transactions.map((tx) => [
      new Date(tx.created_at).toISOString(),
      tx.type,
      tx.amount.toString(),
      tx.currency,
      tx.status,
      tx.description || "",
      tx.id,
      tx.blockchain_tx_hash || "",
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `transactions_${
      new Date().toISOString().split("T")[0]
    }.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="3xl"
      scrollBehavior="inside"
      placement="center"
      classNames={{
        base: "bg-background",
        backdrop: "bg-black/80 backdrop-blur-sm",
      }}
      motionProps={{
        variants: modalAnimations.center,
      }}
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-3 pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-primary-100 p-2 dark:bg-primary-900/30">
                <Icon
                  icon="solar:receipt-bold-duotone"
                  className="h-5 w-5 text-primary-600 dark:text-primary-400"
                />
              </div>
              <div>
                <h2 className="text-xl font-semibold">Transaction History</h2>
                <p className="text-sm text-default-500">
                  View all your wallet transactions
                </p>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input
              placeholder="Search transactions..."
              value={searchQuery}
              onValueChange={setSearchQuery}
              startContent={
                <Icon
                  icon="solar:magnifer-bold"
                  className="h-4 w-4 text-default-400"
                />
              }
              classNames={{
                base: "flex-1",
              }}
            />
            <div className="flex gap-2">
              <Select
                placeholder="Type"
                selectedKeys={typeFilter ? [typeFilter] : []}
                onChange={(e) =>
                  setTypeFilter(e.target.value as TransactionType | "all")
                }
                startContent={
                  <Icon icon="solar:filter-bold" className="h-4 w-4" />
                }
                classNames={{
                  base: "w-32",
                }}
                size="sm"
              >
                <SelectItem key="all" value="all">
                  All Types
                </SelectItem>
                <SelectItem key="deposit" value="deposit">
                  Deposits
                </SelectItem>
                <SelectItem key="withdrawal" value="withdrawal">
                  Withdrawals
                </SelectItem>
                <SelectItem key="prize" value="prize">
                  Prizes
                </SelectItem>
                <SelectItem key="entry_fee" value="entry_fee">
                  Entry Fees
                </SelectItem>
                <SelectItem key="refund" value="refund">
                  Refunds
                </SelectItem>
              </Select>

              <Select
                placeholder="Status"
                selectedKeys={statusFilter ? [statusFilter] : []}
                onChange={(e) =>
                  setStatusFilter(e.target.value as TransactionStatus | "all")
                }
                classNames={{
                  base: "w-32",
                }}
                size="sm"
              >
                <SelectItem key="all" value="all">
                  All Status
                </SelectItem>
                <SelectItem key="pending" value="pending">
                  Pending
                </SelectItem>
                <SelectItem key="confirmed" value="confirmed">
                  Confirmed
                </SelectItem>
                <SelectItem key="failed" value="failed">
                  Failed
                </SelectItem>
                <SelectItem key="cancelled" value="cancelled">
                  Cancelled
                </SelectItem>
              </Select>
            </div>
          </div>
        </ModalHeader>

        <ModalBody className="gap-3 py-4">
          {isLoading && transactions.length === 0 ? (
            // Loading skeleton
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <TransactionSkeleton key={i} />
              ))}
            </div>
          ) : filteredTransactions.length === 0 ? (
            // Empty state
            <EmptyState
              hasFilters={
                searchQuery !== "" ||
                typeFilter !== "all" ||
                statusFilter !== "all"
              }
            />
          ) : (
            // Transaction list
            <div className="space-y-2">
              <AnimatePresence mode="popLayout">
                {filteredTransactions.map((transaction) => (
                  <TransactionItem
                    key={transaction.id}
                    transaction={transaction}
                  />
                ))}
              </AnimatePresence>

              {/* Load More Button */}
              {hasMore && (
                <Button
                  variant="flat"
                  onPress={loadMore}
                  isLoading={isLoading}
                  className="w-full"
                >
                  Load More
                </Button>
              )}
            </div>
          )}
        </ModalBody>

        <ModalFooter className="pt-2">
          <Button variant="light" onPress={onClose}>
            Close
          </Button>
          <Button
            color="primary"
            startContent={
              <Icon
                icon="solar:download-minimalistic-bold"
                className="h-4 w-4"
              />
            }
            onPress={() => exportToCSV(filteredTransactions)}
            isDisabled={filteredTransactions.length === 0}
          >
            Export CSV
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

// Transaction Item Component
function TransactionItem({ transaction }: { transaction: WalletTransaction }) {
  const isCredit =
    transaction.type === "deposit" ||
    transaction.type === "prize_payout" ||
    transaction.type === "refund";
  const isDebit =
    transaction.type === "withdrawal" || transaction.type === "entry_fee";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={springs.gentle}
    >
      <Card className="hover:bg-default-50 dark:hover:bg-default-100">
        <CardBody className="gap-3 p-4">
          <div className="flex items-start justify-between gap-4">
            {/* Icon & Details */}
            <div className="flex gap-3">
              <div
                className={`rounded-lg p-2 ${
                  isCredit
                    ? "bg-success-100 dark:bg-success-900/30"
                    : "bg-warning-100 dark:bg-warning-900/30"
                }`}
              >
                {isCredit ? (
                  <Icon
                    icon="solar:alt-arrow-down-bold"
                    className={`h-5 w-5 ${
                      isCredit
                        ? "text-success-600 dark:text-success-400"
                        : "text-warning-600 dark:text-warning-400"
                    }`}
                  />
                ) : (
                  <Icon
                    icon="solar:alt-arrow-up-bold"
                    className={`h-5 w-5 ${
                      isDebit
                        ? "text-warning-600 dark:text-warning-400"
                        : "text-default-600"
                    }`}
                  />
                )}
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-semibold capitalize">
                    {transaction.type.replace("_", " ")}
                  </p>
                  {transaction.status && (
                    <TransactionStatusBadge status={transaction.status} />
                  )}
                </div>
                {transaction.description && (
                  <p className="text-sm text-default-600">
                    {transaction.description}
                  </p>
                )}
                <div className="mt-1 flex items-center gap-2 text-xs text-default-500">
                  <Icon icon="solar:calendar-bold" className="h-3 w-3" />
                  <span>
                    {new Date(transaction.created_at).toLocaleString()}
                  </span>
                </div>
                {transaction.blockchain_tx_hash && (
                  <p className="mt-1 font-mono text-xs text-default-400">
                    Tx: {transaction.blockchain_tx_hash}
                  </p>
                )}
              </div>
            </div>

            {/* Amount */}
            <div className="text-right">
              <p
                className={`text-xl font-bold ${
                  isCredit ? "text-success-600" : "text-warning-600"
                }`}
              >
                {isCredit ? "+" : "-"}
                {formatAmount(transaction.amount)}
              </p>
              <p className="text-xs text-default-500">{transaction.currency}</p>
            </div>
          </div>

          {/* Metadata (if exists) */}
          {transaction.metadata &&
            Object.keys(transaction.metadata).length > 0 && (
              <>
                <Divider />
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {Object.entries(transaction.metadata).map(([key, value]) => (
                    <div key={key}>
                      <span className="text-default-500">
                        {key.replace(/_/g, " ")}:{" "}
                      </span>
                      <span className="font-medium">{String(value)}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
        </CardBody>
      </Card>
    </motion.div>
  );
}

// Transaction Status Badge
function TransactionStatusBadge({ status }: { status: TransactionStatus }) {
  const config = {
    pending: {
      color: "warning" as const,
      icon: "solar:clock-circle-bold",
      label: "Pending",
    },
    confirmed: {
      color: "success" as const,
      icon: "solar:check-circle-bold",
      label: "Confirmed",
    },
    failed: {
      color: "danger" as const,
      icon: "solar:close-circle-bold",
      label: "Failed",
    },
    cancelled: {
      color: "default" as const,
      icon: "solar:danger-circle-bold",
      label: "Cancelled",
    },
  }[status];

  return (
    <Chip
      size="sm"
      variant="flat"
      color={config.color}
      startContent={<Icon icon={config.icon} className="h-3 w-3" />}
    >
      {config.label}
    </Chip>
  );
}

// Transaction Skeleton Loader
function TransactionSkeleton() {
  return (
    <Card>
      <CardBody className="gap-3 p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex gap-3">
            <Skeleton className="h-12 w-12 rounded-lg" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-32 rounded" />
              <Skeleton className="h-4 w-48 rounded" />
              <Skeleton className="h-3 w-24 rounded" />
            </div>
          </div>
          <div className="space-y-2 text-right">
            <Skeleton className="h-6 w-20 rounded" />
            <Skeleton className="h-3 w-12 rounded" />
          </div>
        </div>
      </CardBody>
    </Card>
  );
}

// Empty State
function EmptyState({ hasFilters }: { hasFilters: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={springs.gentle}
      className="flex flex-col items-center justify-center gap-4 py-12"
    >
      <div className="rounded-full bg-default-100 p-6 dark:bg-default-50">
        <Icon
          icon="solar:receipt-bold-duotone"
          className="h-12 w-12 text-default-400"
        />
      </div>
      <div className="text-center">
        <h3 className="text-lg font-semibold">
          {hasFilters ? "No Matching Transactions" : "No Transactions Yet"}
        </h3>
        <p className="text-sm text-default-500">
          {hasFilters
            ? "Try adjusting your filters or search query"
            : "Your transaction history will appear here"}
        </p>
      </div>
    </motion.div>
  );
}

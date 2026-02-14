"use client";

/**
 * Pro Wallet - Transaction Center Page
 * Comprehensive transaction management with queue, history, and gas estimation
 */

import React, { useMemo } from "react";
import { useRequireAuth } from "@/hooks/use-auth";
import { useToast } from "@/components/toast/toast-provider";
import { useWallet } from "@/hooks/use-wallet";
import { TransactionCenter } from "@/components/wallet/transactions/transaction-center";
import { EsportsButton } from "@/components/ui/esports-button";
import { Icon } from "@iconify/react";
import Link from "next/link";
import type {
  Transaction as EscrowTransaction,
  ExtendedTransactionStatus,
} from "@/types/replay-api/escrow-wallet.types";
import type { Transaction as WalletTransaction } from "@/types/replay-api/wallet.types";
import { getAmountValue } from "@/types/replay-api/wallet.types";

/**
 * Maps a ledger transaction from the wallet API to the escrow-wallet Transaction shape
 * used by the TransactionCenter component.
 */
function mapToEscrowTransaction(tx: WalletTransaction): EscrowTransaction {
  const statusMap: Record<string, ExtendedTransactionStatus> = {
    completed: "confirmed",
    pending: "pending",
    processing: "submitted",
    failed: "failed",
    reversed: "failed",
    cancelled: "failed",
  };

  const amount = parseFloat(tx.amount || "0");

  return {
    id: tx.id || tx.transaction_id,
    type: (tx.type || tx.entry_type || "transfer") as EscrowTransaction["type"],
    status: statusMap[tx.status || "completed"] || "confirmed",
    chain: "polygon",
    token: tx.currency || "USD",
    amount: Math.abs(amount),
    fiatValue: Math.abs(amount),
    from: tx.wallet_id || "",
    to: "",
    hash: tx.blockchain_tx_hash,
    timestamp: new Date(tx.created_at),
    gasUsed: tx.gas_fee ? getAmountValue(tx.gas_fee).cents : undefined,
    nonce: 0,
    confirmations: tx.confirmed_at ? 1 : 0,
    requiresSignature: false,
  };
}

export default function TransactionsPage() {
  const { isAuthenticated, isLoading: isAuthLoading, isRedirecting } = useRequireAuth({
    callbackUrl: '/wallet/pro/transactions'
  });
  const { showToast } = useToast();

  const { transactions: txResult, isLoadingTransactions } = useWallet(true, { limit: 50, offset: 0 });

  const transactions = useMemo<EscrowTransaction[]>(() => {
    if (!txResult?.transactions) return [];
    return txResult.transactions.map(mapToEscrowTransaction);
  }, [txResult]);

  const pendingCount = useMemo(() =>
    transactions.filter(
      (tx) => tx.status === "pending" || tx.status === "submitted",
    ).length,
  [transactions]);

  if (isAuthLoading || isRedirecting || !isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-default-500 mb-6">
        <Link
          href="/wallet/pro"
          className="hover:text-[#FF4654] dark:hover:text-[#DCFF37] transition-colors"
        >
          Pro Wallet
        </Link>
        <Icon icon="solar:alt-arrow-right-linear" width={16} />
        <span className="text-[#34445C] dark:text-white">Transactions</span>
      </div>

      {/* Back Button */}
      <div className="mb-6">
        <EsportsButton
          as={Link}
          href="/wallet/pro"
          variant="ghost"
          startContent={<Icon icon="solar:arrow-left-bold" width={16} />}
        >
          Back to Wallet
        </EsportsButton>
      </div>

      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#34445C] dark:text-white mb-2">
          Transaction Center
        </h1>
        <p className="text-default-500">
          Manage pending transactions, view history, and track escrow activity
        </p>
      </div>

      {/* Transaction Center Component */}
      <TransactionCenter
        transactions={transactions}
        pendingCount={pendingCount}
        selectedChain="polygon"
        isLoading={isLoadingTransactions}
        onSignTransaction={async (_tx) => {
          showToast("Transaction signing coming soon", "info");
        }}
        onCancelTransaction={async (_txId) => {
          showToast("Transaction cancellation coming soon", "info");
        }}
        onRetryTransaction={async (_txId) => {
          showToast("Transaction retry coming soon", "info");
        }}
        onSpeedUpTransaction={async (_txId, _newGas) => {
          showToast("Transaction speed-up coming soon", "info");
        }}
        onExportHistory={async (_format) => {
          showToast("Transaction export coming soon", "info");
        }}
      />
    </div>
  );
}

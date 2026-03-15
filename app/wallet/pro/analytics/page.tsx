"use client";

/**
 * Pro Wallet - Analytics Page
 * Performance analytics dashboard derived from real wallet transaction history
 */

import React, { useMemo } from "react";
import { useRequireAuth } from "@/hooks/use-auth";
import { useWallet } from "@/hooks/use-wallet";
import { AnalyticsDashboard } from "@/components/wallet/analytics/analytics-dashboard";
import { Chip, Spinner } from "@nextui-org/react";
import { EsportsButton } from "@/components/ui/esports-button";
import { Icon } from "@iconify/react";
import Link from "next/link";
import { motion } from "framer-motion";
import type { Amount, Transaction } from "@/types/replay-api/wallet.types";

/** Creates an Amount from a dollar value */
const createAmount = (dollars: number): Amount => ({
  cents: Math.round(dollars * 100),
  dollars: Math.round(dollars * 100) / 100,
});

/**
 * Derives analytics data from real wallet transactions.
 * Aggregates entry fees, prizes, and net profit by month.
 */
function deriveAnalytics(transactions: Transaction[]) {
  const now = new Date();
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  let totalPrizes = 0;
  let totalEntryFees = 0;

  // Aggregate by month
  const monthlyMap = new Map<string, { entryFees: number; prizes: number; deposits: number; matches: number; wins: number }>();
  for (let i = 11; i >= 0; i--) {
    const monthIndex = (now.getMonth() - i + 12) % 12;
    monthlyMap.set(months[monthIndex], { entryFees: 0, prizes: 0, deposits: 0, matches: 0, wins: 0 });
  }

  for (const tx of transactions) {
    const txDate = new Date(tx.created_at);
    const monthKey = months[txDate.getMonth()];
    const amount = Math.abs(parseFloat(tx.amount || "0"));
    const bucket = monthlyMap.get(monthKey);

    if (tx.type === "entry_fee" || tx.entry_type === "debit") {
      totalEntryFees += amount;
      if (bucket) bucket.entryFees += amount;
    }
    if (tx.type === "prize" || tx.type === "prize_payout") {
      totalPrizes += amount;
      if (bucket) {
        bucket.prizes += amount;
        bucket.wins += 1;
      }
    }
    if (bucket) bucket.matches += 1;
  }

  const earningsHistory = Array.from(monthlyMap.entries()).map(([period, data]) => ({
    period,
    entry_fees: createAmount(data.entryFees),
    prizes_won: createAmount(data.prizes),
    net_profit: createAmount(data.prizes - data.entryFees),
    matches_played: data.matches,
    wins: data.wins,
  }));

  // Derive taxable events from transactions
  const taxableEvents = transactions
    .filter((tx) => tx.type === "prize" || tx.type === "prize_payout" || tx.type === "withdrawal" || tx.type === "deposit")
    .slice(0, 50)
    .map((tx) => {
      const amount = Math.abs(parseFloat(tx.amount || "0"));
      const typeMap: Record<string, "prize_won" | "withdrawal" | "deposit"> = {
        prize: "prize_won",
        prize_payout: "prize_won",
        withdrawal: "withdrawal",
        deposit: "deposit",
      };
      return {
        date: tx.created_at,
        type: typeMap[tx.type] || "deposit" as const,
        amount: createAmount(amount),
        asset: tx.currency || "USD",
        chain: String(tx.chain_id || "polygon"),
        tx_hash: tx.blockchain_tx_hash || tx.transaction_id || tx.id || "",
        cost_basis: tx.type !== "prize" && tx.type !== "prize_payout" ? createAmount(amount * 0.98) : undefined,
        gain_loss: (tx.type === "prize" || tx.type === "prize_payout") ? createAmount(amount) : undefined,
      };
    });

  const netProfit = totalPrizes - totalEntryFees;

  return {
    totalEarnings: createAmount(totalPrizes),
    totalSpent: createAmount(totalEntryFees),
    netProfit: createAmount(netProfit),
    earningsHistory,
    gamePerformance: [] as Array<{
      game_id: string;
      game_name: string;
      matches: number;
      wins: number;
      win_rate: number;
      total_entry: Amount;
      total_prize: Amount;
      net_profit: Amount;
      avg_roi: number;
    }>,
    taxableEvents,
    walletCreatedAt: transactions.length > 0 ? transactions[transactions.length - 1].created_at : now.toISOString(),
  };
}

export default function AnalyticsPage() {
  const { isAuthenticated, isLoading: isAuthLoading, isRedirecting } = useRequireAuth({
    callbackUrl: '/wallet/pro/analytics'
  });

  const { transactions: txResult, isLoadingTransactions } = useWallet(isAuthenticated, { limit: 200, offset: 0 });

  const analyticsData = useMemo(() => {
    return deriveAnalytics(txResult?.transactions || []);
  }, [txResult]);

  if (isAuthLoading || isRedirecting || !isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (isLoadingTransactions) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <Spinner size="lg" color="primary" />
        <p className="text-default-500">Loading analytics...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-default-50 to-white dark:from-default-100/20 dark:to-[#0a0a0a]">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Premium Navigation Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6"
        >
          <div className="flex items-center gap-3">
            <EsportsButton
              as={Link}
              href="/wallet/pro"
              variant="ghost"
              size="sm"
              startContent={<Icon icon="solar:arrow-left-bold" width={16} />}
            >
              Back to Wallet
            </EsportsButton>

            {/* Breadcrumb */}
            <div className="hidden sm:flex items-center gap-2 text-sm">
              <Link
                href="/wallet/pro"
                className="text-default-500 hover:text-[#FF4654] dark:hover:text-[#DCFF37] transition-colors"
              >
                Pro Wallet
              </Link>
              <Icon
                icon="solar:alt-arrow-right-linear"
                width={14}
                className="text-default-400"
              />
              <span className="text-[#34445C] dark:text-white font-medium flex items-center gap-1">
                <Icon
                  icon="solar:chart-2-bold"
                  width={14}
                  className="text-[#FF4654] dark:text-[#DCFF37]"
                />
                Analytics
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Chip
              size="sm"
              className="rounded-none bg-gradient-to-r from-[#FF4654] to-[#FFC700] text-white font-semibold"
              startContent={<Icon icon="solar:star-bold" width={12} />}
            >
              PRO FEATURE
            </Chip>
          </div>
        </motion.div>

        {/* Analytics Dashboard Component */}
        <AnalyticsDashboard
          totalEarnings={analyticsData.totalEarnings}
          totalSpent={analyticsData.totalSpent}
          netProfit={analyticsData.netProfit}
          earningsHistory={analyticsData.earningsHistory}
          gamePerformance={analyticsData.gamePerformance}
          taxableEvents={analyticsData.taxableEvents}
          walletCreatedAt={analyticsData.walletCreatedAt}
          onExportTaxReport={(_year: number, _format: "csv" | "pdf") => {
            // intentionally empty
          }}
          onExportTransactions={(_format: "csv" | "json") => {
            // intentionally empty
          }}
        />
      </div>
    </div>
  );
}

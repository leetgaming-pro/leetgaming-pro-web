"use client";

/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║  🏆 LEETGAMING WALLET - FIAT BALANCE CENTER                                  ║
 * ║══════════════════════════════════════════════════════════════════════════════║
 * ║                                                                              ║
 * ║  💰 Fiat Credits Account with Currency Conversion                            ║
 * ║  Manage your fiat balance and convert between currencies                     ║
 * ║                                                                              ║
 * ║  Features:                                                                   ║
 * ║  • Multi-currency fiat balance display (USD, BRL, EUR, GBP)                 ║
 * ║  • Real-time currency conversion rates                                       ║
 * ║  • Quick deposit shortcuts                                                   ║
 * ║  • Transaction history preview                                               ║
 * ║  • Match funding calculator                                                  ║
 * ║                                                                              ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */

import React, { useState, useMemo } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Chip,
  Input,
  Select,
  SelectItem,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@nextui-org/react";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import { cn } from "@nextui-org/react";

// EsportsButton - Award-Winning Branded Button Component
import { EsportsButton } from "@/components/ui/esports-button";

import type { CustodialWalletType } from "@/types/replay-api/escrow-wallet.types";

// ============================================================================
// 🎯 TYPES
// ============================================================================

export type FiatCurrency = "USD" | "BRL" | "EUR" | "GBP";

export interface FiatBalance {
  currency: FiatCurrency;
  amount: number;
  pending: number;
  locked: number; // Locked in active matches
}

export interface CurrencyRate {
  from: FiatCurrency;
  to: FiatCurrency;
  rate: number;
  lastUpdated: Date;
}

export interface RecentTransaction {
  id: string;
  type:
    | "deposit"
    | "withdrawal"
    | "match_entry"
    | "match_win"
    | "match_loss"
    | "conversion";
  amount: number;
  currency: FiatCurrency;
  status: "pending" | "completed" | "failed";
  timestamp: Date;
  description: string;
}

interface FiatBalanceCenterProps {
  walletType: CustodialWalletType;
  balances: FiatBalance[];
  primaryCurrency: FiatCurrency;
  rates: CurrencyRate[];
  recentTransactions?: RecentTransaction[];
  onDeposit: () => void;
  onWithdraw: () => void;
  onConvert?: (
    from: FiatCurrency,
    to: FiatCurrency,
    amount: number,
  ) => Promise<void>;
  onSetPrimaryCurrency?: (currency: FiatCurrency) => void;
}

// ============================================================================
// 🎨 CONFIGURATION
// ============================================================================

const CURRENCY_CONFIG: Record<
  FiatCurrency,
  {
    symbol: string;
    name: string;
    icon: string;
    flag: string;
    color: string;
  }
> = {
  USD: {
    symbol: "$",
    name: "US Dollar",
    icon: "emojione-v1:flag-for-united-states",
    flag: "🇺🇸",
    color: "from-green-500 to-emerald-600",
  },
  BRL: {
    symbol: "R$",
    name: "Brazilian Real",
    icon: "emojione-v1:flag-for-brazil",
    flag: "🇧🇷",
    color: "from-yellow-500 to-green-600",
  },
  EUR: {
    symbol: "€",
    name: "Euro",
    icon: "emojione-v1:flag-for-european-union",
    flag: "🇪🇺",
    color: "from-blue-500 to-indigo-600",
  },
  GBP: {
    symbol: "£",
    name: "British Pound",
    icon: "emojione-v1:flag-for-united-kingdom",
    flag: "🇬🇧",
    color: "from-red-500 to-blue-600",
  },
};

const TRANSACTION_ICONS: Record<
  RecentTransaction["type"],
  { icon: string; color: string }
> = {
  deposit: { icon: "solar:download-bold", color: "text-success" },
  withdrawal: { icon: "solar:upload-bold", color: "text-danger" },
  match_entry: { icon: "solar:gamepad-bold", color: "text-warning" },
  match_win: { icon: "solar:trophy-bold", color: "text-success" },
  match_loss: { icon: "solar:sad-circle-bold", color: "text-danger" },
  conversion: { icon: "solar:refresh-bold", color: "text-primary" },
};

// ============================================================================
// 📦 SUB-COMPONENTS
// ============================================================================

function BalanceCard({
  balance,
  isPrimary,
  rates,
  primaryCurrency,
  onSetPrimary,
}: {
  balance: FiatBalance;
  isPrimary: boolean;
  rates: CurrencyRate[];
  primaryCurrency: FiatCurrency;
  onSetPrimary?: () => void;
}) {
  const config = CURRENCY_CONFIG[balance.currency] ?? {
    symbol: '$', name: balance.currency, icon: 'solar:dollar-circle-bold', flag: '💰', color: 'from-gray-500 to-gray-600',
  };
  const totalBalance = balance.amount + balance.pending;

  // Convert to primary currency for comparison
  const toPrimaryRate =
    rates.find((r) => r.from === balance.currency && r.to === primaryCurrency)
      ?.rate || 1;
  const inPrimaryCurrency = totalBalance * toPrimaryRate;

  return (
    <motion.div whileHover={{ scale: 1.02 }} className="relative">
      <Card
        className={cn(
          "rounded-none border-2 transition-all overflow-hidden",
          isPrimary
            ? "border-[#FF4654] dark:border-[#DCFF37]"
            : "border-transparent hover:border-default-300",
        )}
      >
        {/* Gradient Background */}
        <div
          className={cn(
            "absolute inset-0 opacity-10",
            `bg-gradient-to-br ${config.color}`,
          )}
        />

        <CardBody className="p-4 relative z-10">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="text-3xl">{config.flag}</div>
              <div>
                <p className="text-xs text-default-500">{config.name}</p>
                <p className="text-2xl font-bold text-[#34445C] dark:text-white">
                  {config.symbol}
                  {balance.amount.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                  })}
                </p>
              </div>
            </div>

            {isPrimary ? (
              <Chip
                size="sm"
                className="rounded-none bg-[#FF4654] dark:bg-[#DCFF37] text-white dark:text-[#34445C] font-semibold"
              >
                PRIMARY
              </Chip>
            ) : (
              <EsportsButton size="sm" variant="ghost" onClick={onSetPrimary}>
                Set Primary
              </EsportsButton>
            )}
          </div>

          {/* Sub-balances */}
          <div className="grid grid-cols-2 gap-2 mt-4">
            {balance.pending > 0 && (
              <div className="bg-warning/10 rounded-lg p-2">
                <p className="text-[10px] text-warning uppercase">Pending</p>
                <p className="text-sm font-semibold text-warning">
                  {config.symbol}
                  {balance.pending.toFixed(2)}
                </p>
              </div>
            )}
            {balance.locked > 0 && (
              <div className="bg-primary/10 rounded-lg p-2">
                <p className="text-[10px] text-primary uppercase">In Matches</p>
                <p className="text-sm font-semibold text-primary">
                  {config.symbol}
                  {balance.locked.toFixed(2)}
                </p>
              </div>
            )}
          </div>

          {/* Conversion to primary */}
          {!isPrimary && inPrimaryCurrency > 0 && (
            <p className="text-xs text-default-400 mt-2">
              ≈ {CURRENCY_CONFIG[primaryCurrency].symbol}
              {inPrimaryCurrency.toFixed(2)} {primaryCurrency}
            </p>
          )}
        </CardBody>
      </Card>
    </motion.div>
  );
}

function CurrencyConverter({
  balances,
  rates,
  onConvert,
}: {
  balances: FiatBalance[];
  rates: CurrencyRate[];
  onConvert: (
    from: FiatCurrency,
    to: FiatCurrency,
    amount: number,
  ) => Promise<void>;
}) {
  const [fromCurrency, setFromCurrency] = useState<FiatCurrency>("USD");
  const [toCurrency, setToCurrency] = useState<FiatCurrency>("BRL");
  const [amount, setAmount] = useState(0);
  const [isConverting, setIsConverting] = useState(false);

  const rate =
    rates.find((r) => r.from === fromCurrency && r.to === toCurrency)?.rate ||
    1;
  const convertedAmount = amount * rate;
  const fromBalance =
    balances.find((b) => b.currency === fromCurrency)?.amount || 0;

  const handleConvert = async () => {
    if (amount <= 0 || amount > fromBalance) return;
    setIsConverting(true);
    try {
      await onConvert(fromCurrency, toCurrency, amount);
      setAmount(0);
    } finally {
      setIsConverting(false);
    }
  };

  const swapCurrencies = () => {
    const temp = fromCurrency;
    setFromCurrency(toCurrency);
    setToCurrency(temp);
    setAmount(0);
  };

  return (
    <Card className="rounded-none border border-default-200">
      <CardHeader className="pb-0">
        <div className="flex items-center gap-2">
          <Icon
            icon="solar:refresh-circle-bold-duotone"
            className="text-primary"
            width={24}
          />
          <h3 className="font-bold text-[#34445C] dark:text-white">
            Currency Converter
          </h3>
        </div>
      </CardHeader>
      <CardBody className="space-y-4">
        {/* From */}
        <div className="space-y-2">
          <label className="text-xs text-default-500">From</label>
          <div className="flex gap-2">
            <Select
              selectedKeys={[fromCurrency]}
              onSelectionChange={(keys) =>
                setFromCurrency(Array.from(keys)[0] as FiatCurrency)
              }
              classNames={{ trigger: "rounded-none w-[140px]" }}
              startContent={
                <span className="text-lg">
                  {CURRENCY_CONFIG[fromCurrency].flag}
                </span>
              }
            >
              {Object.entries(CURRENCY_CONFIG).map(([code, config]) => (
                <SelectItem
                  key={code}
                  value={code}
                  startContent={<span>{config.flag}</span>}
                >
                  {code}
                </SelectItem>
              ))}
            </Select>
            <Input
              type="number"
              placeholder="0.00"
              value={amount > 0 ? amount.toString() : ""}
              onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
              startContent={
                <span className="text-default-400">
                  {CURRENCY_CONFIG[fromCurrency].symbol}
                </span>
              }
              classNames={{ inputWrapper: "rounded-none flex-1" }}
            />
          </div>
          <p className="text-xs text-default-400">
            Available: {CURRENCY_CONFIG[fromCurrency].symbol}
            {fromBalance.toFixed(2)}
          </p>
        </div>

        {/* Swap Button */}
        <div className="flex justify-center">
          <EsportsButton
            variant="ghost"
            size="sm"
            onClick={swapCurrencies}
            startContent={
              <Icon icon="solar:transfer-vertical-bold" width={20} />
            }
          >
            Swap
          </EsportsButton>
        </div>

        {/* To */}
        <div className="space-y-2">
          <label className="text-xs text-default-500">To</label>
          <div className="flex gap-2">
            <Select
              selectedKeys={[toCurrency]}
              onSelectionChange={(keys) =>
                setToCurrency(Array.from(keys)[0] as FiatCurrency)
              }
              classNames={{ trigger: "rounded-none w-[140px]" }}
              startContent={
                <span className="text-lg">
                  {CURRENCY_CONFIG[toCurrency].flag}
                </span>
              }
            >
              {Object.entries(CURRENCY_CONFIG).map(([code, config]) => (
                <SelectItem
                  key={code}
                  value={code}
                  startContent={<span>{config.flag}</span>}
                >
                  {code}
                </SelectItem>
              ))}
            </Select>
            <Input
              type="number"
              placeholder="0.00"
              value={convertedAmount > 0 ? convertedAmount.toFixed(2) : ""}
              readOnly
              startContent={
                <span className="text-default-400">
                  {CURRENCY_CONFIG[toCurrency].symbol}
                </span>
              }
              classNames={{
                inputWrapper: "rounded-none flex-1 bg-default-100",
              }}
            />
          </div>
        </div>

        {/* Rate Display */}
        {amount > 0 && (
          <div className="bg-default-50 dark:bg-default-100/10 rounded-lg p-3 text-center">
            <p className="text-xs text-default-500">Exchange Rate</p>
            <p className="font-semibold text-[#34445C] dark:text-white">
              1 {fromCurrency} = {rate.toFixed(4)} {toCurrency}
            </p>
            <p className="text-[10px] text-default-400 mt-1">
              Fee: 0.5% • No hidden charges
            </p>
          </div>
        )}

        <EsportsButton
          variant="primary"
          fullWidth
          glow
          loading={isConverting}
          disabled={
            amount <= 0 || amount > fromBalance || fromCurrency === toCurrency
          }
          onClick={handleConvert}
        >
          {isConverting ? "Converting..." : "Convert Currency"}
        </EsportsButton>
      </CardBody>
    </Card>
  );
}

function MatchFundingCalculator({
  balances,
  rates,
  primaryCurrency,
}: {
  balances: FiatBalance[];
  rates: CurrencyRate[];
  primaryCurrency: FiatCurrency;
}) {
  const [entryFee, setEntryFee] = useState(50);
  const [matchCurrency, setMatchCurrency] = useState<FiatCurrency>("USD");

  const primaryConfig = CURRENCY_CONFIG[primaryCurrency];
  const matchConfig = CURRENCY_CONFIG[matchCurrency];

  // Get total available in primary currency
  const totalAvailable = useMemo(() => {
    return balances.reduce((sum, balance) => {
      const rate =
        rates.find(
          (r) => r.from === balance.currency && r.to === primaryCurrency,
        )?.rate || 1;
      return sum + balance.amount * rate;
    }, 0);
  }, [balances, rates, primaryCurrency]);

  // Calculate if user can afford the match
  const matchRate =
    rates.find((r) => r.from === matchCurrency && r.to === primaryCurrency)
      ?.rate || 1;
  const entryInPrimary = entryFee * matchRate;
  const canAfford = totalAvailable >= entryInPrimary;

  // Best currency to use
  const bestCurrencyToUse = useMemo(() => {
    // If user has balance in match currency, use that first
    const directBalance = balances.find((b) => b.currency === matchCurrency);
    if (directBalance && directBalance.amount >= entryFee) {
      return { currency: matchCurrency, amount: entryFee, conversion: false };
    }

    // Otherwise find the balance with best conversion
    let best: {
      currency: FiatCurrency;
      amount: number;
      conversion: boolean;
    } | null = null;

    for (const balance of balances) {
      if (balance.amount <= 0) continue;

      const rate =
        rates.find((r) => r.from === balance.currency && r.to === matchCurrency)
          ?.rate || 1;
      const neededInCurrency = entryFee / rate;

      if (balance.amount >= neededInCurrency) {
        if (!best || neededInCurrency < best.amount) {
          best = {
            currency: balance.currency,
            amount: neededInCurrency,
            conversion: balance.currency !== matchCurrency,
          };
        }
      }
    }

    return best;
  }, [balances, rates, matchCurrency, entryFee]);

  return (
    <Card className="rounded-none border border-default-200">
      <CardHeader className="pb-0">
        <div className="flex items-center gap-2">
          <Icon
            icon="solar:calculator-bold-duotone"
            className="text-warning"
            width={24}
          />
          <h3 className="font-bold text-[#34445C] dark:text-white">
            Match Funding Calculator
          </h3>
        </div>
      </CardHeader>
      <CardBody className="space-y-4">
        <p className="text-sm text-default-500">
          Calculate if you have enough balance to enter a match
        </p>

        <div className="flex gap-2">
          <Input
            type="number"
            label="Entry Fee"
            placeholder="50"
            value={entryFee.toString()}
            onChange={(e) => setEntryFee(parseFloat(e.target.value) || 0)}
            classNames={{ inputWrapper: "rounded-none flex-1" }}
          />
          <Select
            label="Currency"
            selectedKeys={[matchCurrency]}
            onSelectionChange={(keys) =>
              setMatchCurrency(Array.from(keys)[0] as FiatCurrency)
            }
            classNames={{ trigger: "rounded-none w-[120px]" }}
          >
            {Object.entries(CURRENCY_CONFIG).map(([code, config]) => (
              <SelectItem
                key={code}
                value={code}
                startContent={<span>{config.flag}</span>}
              >
                {code}
              </SelectItem>
            ))}
          </Select>
        </div>

        {/* Result */}
        {entryFee > 0 && (
          <div
            className={cn(
              "rounded-lg p-4 text-center",
              canAfford ? "bg-success/10" : "bg-danger/10",
            )}
          >
            <div className="flex items-center justify-center gap-2 mb-2">
              <Icon
                icon={
                  canAfford
                    ? "solar:check-circle-bold"
                    : "solar:close-circle-bold"
                }
                className={canAfford ? "text-success" : "text-danger"}
                width={24}
              />
              <p
                className={cn(
                  "font-bold",
                  canAfford ? "text-success" : "text-danger",
                )}
              >
                {canAfford
                  ? "You can enter this match!"
                  : "Insufficient balance"}
              </p>
            </div>

            {canAfford && bestCurrencyToUse && (
              <div className="text-sm">
                <p className="text-default-500">
                  {bestCurrencyToUse.conversion
                    ? `Pay ${CURRENCY_CONFIG[bestCurrencyToUse.currency].symbol}${bestCurrencyToUse.amount.toFixed(2)} ${bestCurrencyToUse.currency} (with conversion)`
                    : `Pay directly with ${matchCurrency}`}
                </p>
              </div>
            )}

            {!canAfford && (
              <p className="text-sm text-danger">
                You need {matchConfig.symbol}
                {(entryFee - totalAvailable / matchRate).toFixed(2)} more
              </p>
            )}
          </div>
        )}

        {/* Total Balance Summary */}
        <div className="bg-default-50 dark:bg-default-100/10 rounded-lg p-3">
          <p className="text-xs text-default-500">Total Available Balance</p>
          <p className="text-lg font-bold text-[#34445C] dark:text-white">
            {primaryConfig.symbol}
            {totalAvailable.toFixed(2)} {primaryCurrency}
          </p>
        </div>
      </CardBody>
    </Card>
  );
}

function TransactionsList({
  transactions,
}: {
  transactions: RecentTransaction[];
}) {
  return (
    <Card className="rounded-none border border-default-200">
      <CardHeader className="pb-0">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <Icon
              icon="solar:history-bold-duotone"
              className="text-default-500"
              width={24}
            />
            <h3 className="font-bold text-[#34445C] dark:text-white">
              Recent Activity
            </h3>
          </div>
          <EsportsButton size="sm" variant="ghost">
            View All
          </EsportsButton>
        </div>
      </CardHeader>
      <CardBody className="space-y-2">
        {transactions.slice(0, 5).map((tx) => {
          const config = TRANSACTION_ICONS[tx.type] ?? { icon: 'solar:transfer-horizontal-bold', color: 'text-default' };
          const currencyConfig = CURRENCY_CONFIG[tx.currency] ?? { symbol: '$', name: tx.currency, icon: '', flag: '💰', color: 'from-gray-500 to-gray-600' };
          const isPositive = ["deposit", "match_win"].includes(tx.type);

          return (
            <div
              key={tx.id}
              className="flex items-center justify-between py-2 border-b border-default-100 last:border-0"
            >
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center bg-default-100",
                    config.color,
                  )}
                >
                  <Icon icon={config.icon} width={16} />
                </div>
                <div>
                  <p className="text-sm font-medium text-[#34445C] dark:text-white">
                    {tx.description}
                  </p>
                  <p className="text-xs text-default-400">
                    {tx.timestamp.toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p
                  className={cn(
                    "font-semibold",
                    isPositive ? "text-success" : "text-danger",
                  )}
                >
                  {isPositive ? "+" : "-"}
                  {currencyConfig.symbol}
                  {Math.abs(tx.amount).toFixed(2)}
                </p>
                <Chip
                  size="sm"
                  variant="flat"
                  className="rounded-none text-[10px] h-4"
                  color={
                    tx.status === "completed"
                      ? "success"
                      : tx.status === "pending"
                        ? "warning"
                        : "danger"
                  }
                >
                  {tx.status}
                </Chip>
              </div>
            </div>
          );
        })}

        {transactions.length === 0 && (
          <div className="text-center py-8 text-default-400">
            <Icon
              icon="solar:history-2-bold"
              width={40}
              className="mx-auto mb-2 opacity-50"
            />
            <p>No transactions yet</p>
          </div>
        )}
      </CardBody>
    </Card>
  );
}

// ============================================================================
// 🎯 MAIN COMPONENT
// ============================================================================

export function FiatBalanceCenter({
  walletType,
  balances,
  primaryCurrency,
  rates,
  recentTransactions = [],
  onDeposit,
  onWithdraw,
  onConvert,
  onSetPrimaryCurrency,
}: FiatBalanceCenterProps) {
  const primaryConfig = CURRENCY_CONFIG[primaryCurrency] ?? CURRENCY_CONFIG['USD'];

  // Calculate total balance in primary currency
  const totalBalance = useMemo(() => {
    return balances.reduce((sum, balance) => {
      const rate =
        rates.find(
          (r) => r.from === balance.currency && r.to === primaryCurrency,
        )?.rate || 1;
      return sum + balance.amount * rate;
    }, 0);
  }, [balances, rates, primaryCurrency]);

  const totalPending = useMemo(() => {
    return balances.reduce((sum, balance) => {
      const rate =
        rates.find(
          (r) => r.from === balance.currency && r.to === primaryCurrency,
        )?.rate || 1;
      return sum + balance.pending * rate;
    }, 0);
  }, [balances, rates, primaryCurrency]);

  const walletTypeLabels: Record<CustodialWalletType, string> = {
    full_custodial: "Leet Wallet",
    semi_custodial: "Leet Wallet Pro",
    non_custodial: "DeFi Wallet",
  };

  return (
    <div className="space-y-6">
      {/* Hero Balance Card */}
      <Card className="rounded-none bg-gradient-to-br from-[#34445C] via-[#34445C] to-[#1a2436] overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-[#DCFF37]/10 to-transparent rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-[#FF4654]/10 to-transparent rounded-full translate-y-1/2 -translate-x-1/2" />

        <CardBody className="p-6 relative z-10">
          <div className="flex items-start justify-between mb-6">
            <div>
              <p className="text-sm text-white/60 flex items-center gap-2">
                <Icon icon="solar:wallet-money-bold" width={18} />
                {walletTypeLabels[walletType]} • Fiat Balance
              </p>
              <div className="flex items-baseline gap-3 mt-2">
                <span className="text-4xl font-bold text-white">
                  {primaryConfig.symbol}
                  {totalBalance.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
                <span className="text-lg text-white/60">{primaryCurrency}</span>
              </div>
              {totalPending > 0 && (
                <p className="text-sm text-[#DCFF37] mt-1">
                  +{primaryConfig.symbol}
                  {totalPending.toFixed(2)} pending
                </p>
              )}
            </div>

            <Dropdown>
              <DropdownTrigger>
                <EsportsButton
                  variant="ghost"
                  className="bg-white/10 text-white hover:bg-white/20"
                >
                  {primaryConfig.flag} {primaryCurrency}
                  <Icon icon="solar:alt-arrow-down-linear" width={16} />
                </EsportsButton>
              </DropdownTrigger>
              <DropdownMenu
                onAction={(key) => onSetPrimaryCurrency?.(key as FiatCurrency)}
              >
                {Object.entries(CURRENCY_CONFIG).map(([code, config]) => (
                  <DropdownItem
                    key={code}
                    startContent={<span>{config.flag}</span>}
                  >
                    {config.name} ({code})
                  </DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>
          </div>

          {/* Quick Actions */}
          <div className="flex gap-3">
            <EsportsButton
              variant="primary"
              className="flex-1"
              glow
              startContent={<Icon icon="solar:download-bold" width={18} />}
              onClick={onDeposit}
            >
              Add Funds
            </EsportsButton>
            <EsportsButton
              variant="ghost"
              className="flex-1 bg-white/10 text-white hover:bg-white/20"
              startContent={<Icon icon="solar:upload-bold" width={18} />}
              onClick={onWithdraw}
            >
              Withdraw
            </EsportsButton>
          </div>
        </CardBody>
      </Card>

      {/* Currency Balances */}
      <div>
        <h3 className="font-bold text-[#34445C] dark:text-white mb-4 flex items-center gap-2">
          <Icon icon="solar:wallet-bold" width={20} />
          Currency Balances
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {balances.map((balance) => (
            <BalanceCard
              key={balance.currency}
              balance={balance}
              isPrimary={balance.currency === primaryCurrency}
              rates={rates}
              primaryCurrency={primaryCurrency}
              onSetPrimary={() => onSetPrimaryCurrency?.(balance.currency)}
            />
          ))}
        </div>
      </div>

      {/* Tools Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Currency Converter */}
        {onConvert && (
          <CurrencyConverter
            balances={balances}
            rates={rates}
            onConvert={onConvert}
          />
        )}

        {/* Match Funding Calculator */}
        <MatchFundingCalculator
          balances={balances}
          rates={rates}
          primaryCurrency={primaryCurrency}
        />
      </div>

      {/* Recent Transactions */}
      <TransactionsList transactions={recentTransactions} />

      {/* Quick Deposit Suggestions */}
      <Card className="rounded-none bg-gradient-to-r from-[#FF4654]/10 to-[#FFC700]/10 border border-[#FF4654]/20">
        <CardBody className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#FF4654] flex items-center justify-center">
                <Icon
                  icon="solar:gamepad-bold"
                  className="text-white"
                  width={24}
                />
              </div>
              <div>
                <p className="font-semibold text-[#34445C] dark:text-white">
                  Ready to compete?
                </p>
                <p className="text-sm text-default-500">
                  Add funds and join matches instantly
                </p>
              </div>
            </div>
            <EsportsButton
              variant="action"
              glow
              startContent={<Icon icon="solar:download-bold" width={18} />}
              onClick={onDeposit}
            >
              Quick Deposit
            </EsportsButton>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

export default FiatBalanceCenter;

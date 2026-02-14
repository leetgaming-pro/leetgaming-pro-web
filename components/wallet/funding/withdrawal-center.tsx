"use client";

/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║  🏆 LEETGAMING WALLET - WITHDRAWAL CENTER                                    ║
 * ║══════════════════════════════════════════════════════════════════════════════║
 * ║                                                                              ║
 * ║  💸 Award-Winning Withdrawal Experience                                      ║
 * ║  Seamless cash-out for competitive gamers                                    ║
 * ║                                                                              ║
 * ║  🎯 LEET WALLET (Custodial):                                                 ║
 * ║     • Bank Transfer (ACH, Wire, SEPA)                                        ║
 * ║     • Brazilian PIX (Instant)                                                ║
 * ║     • PayPal                                                                 ║
 * ║                                                                              ║
 * ║  💎 LEET WALLET PRO (MPC Semi-Custodial):                                    ║
 * ║     • All fiat methods above                                                 ║
 * ║     • Crypto withdrawals (requires MPC signing)                              ║
 * ║                                                                              ║
 * ║  🦊 DEFI WALLET (Non-Custodial):                                             ║
 * ║     • Crypto withdrawals only                                                ║
 * ║     • Direct wallet transfers                                                ║
 * ║                                                                              ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */

import React, { useState, useMemo } from "react";
import {
  Card,
  CardBody,
  Chip,
  Input,
  Divider,
  Tooltip,
  Button,
} from "@nextui-org/react";
import { Icon } from "@iconify/react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@nextui-org/react";

// EsportsButton - Award-Winning Branded Button Component
import { EsportsButton } from "@/components/ui/esports-button";

import type {
  CustodialWalletType,
  SupportedChain,
} from "@/types/replay-api/escrow-wallet.types";

// ============================================================================
// 🎯 TYPES
// ============================================================================

export type WithdrawalMethod = "bank_transfer" | "pix" | "paypal" | "crypto";

export type FiatCurrency = "USD" | "BRL" | "EUR" | "GBP";
export type CryptoCurrency = "USDC" | "USDT" | "ETH" | "MATIC" | "SOL";

export interface WithdrawalMethodConfig {
  id: WithdrawalMethod;
  name: string;
  description: string;
  icon: string;
  color: string;
  fees: {
    fixed: number;
    percentage: number;
  };
  minAmount: number;
  maxAmount: number;
  processingTime: string;
  available: boolean;
  walletTypes: CustodialWalletType[];
  requiresVerification?: boolean;
}

export interface SavedWithdrawalAccount {
  id: string;
  type: WithdrawalMethod;
  label: string;
  accountInfo: string;
  isVerified: boolean;
  isDefault: boolean;
  icon: string;
}

export interface BankAccountDetails {
  accountHolder: string;
  bankName: string;
  accountNumber: string;
  routingNumber?: string;
  iban?: string;
  swiftCode?: string;
  accountType: "checking" | "savings";
}

export interface PIXKeyDetails {
  keyType: "cpf" | "phone" | "email" | "random";
  keyValue: string;
  holderName: string;
}

export interface CryptoWithdrawalDetails {
  address: string;
  chain: SupportedChain;
  token: CryptoCurrency;
  memo?: string;
}

interface WithdrawalCenterProps {
  walletType: CustodialWalletType;
  availableBalance: number;
  pendingBalance?: number;
  currency?: FiatCurrency;
  savedAccounts?: SavedWithdrawalAccount[];
  onWithdraw: (params: WithdrawalParams) => Promise<WithdrawalResult>;
  onMPCSign?: () => Promise<boolean>;
  onClose?: () => void;
}

export interface WithdrawalParams {
  amount: number;
  currency: FiatCurrency | CryptoCurrency;
  method: WithdrawalMethod;
  savedAccountId?: string;
  bankDetails?: BankAccountDetails;
  pixDetails?: PIXKeyDetails;
  cryptoDetails?: CryptoWithdrawalDetails;
}

export interface WithdrawalResult {
  success: boolean;
  transactionId?: string;
  status: "pending" | "processing" | "completed" | "failed";
  estimatedArrival?: Date;
  message?: string;
}

// ============================================================================
// 🎨 CONFIGURATION
// ============================================================================

const WITHDRAWAL_METHODS: WithdrawalMethodConfig[] = [
  {
    id: "bank_transfer",
    name: "Bank Transfer",
    description: "ACH, Wire, SEPA • Direct to your bank",
    icon: "solar:bank-bold-duotone",
    color: "from-emerald-500 to-teal-500",
    fees: { fixed: 1.5, percentage: 0 },
    minAmount: 25,
    maxAmount: 50000,
    processingTime: "1-3 business days",
    available: true,
    walletTypes: ["full_custodial", "semi_custodial"],
    requiresVerification: true,
  },
  {
    id: "pix",
    name: "PIX",
    description: "Brazilian instant transfer • Free",
    icon: "simple-icons:pix",
    color: "from-[#32BCAD] to-[#00A7B5]",
    fees: { fixed: 0, percentage: 0 },
    minAmount: 10,
    maxAmount: 50000,
    processingTime: "Instant",
    available: true,
    walletTypes: ["full_custodial", "semi_custodial"],
  },
  {
    id: "paypal",
    name: "PayPal",
    description: "Fast & convenient",
    icon: "logos:paypal",
    color: "from-[#003087] to-[#009CDE]",
    fees: { fixed: 0, percentage: 2 },
    minAmount: 10,
    maxAmount: 10000,
    processingTime: "Instant",
    available: true,
    walletTypes: ["full_custodial", "semi_custodial"],
  },
  {
    id: "crypto",
    name: "Cryptocurrency",
    description: "USDC, USDT, ETH • Multi-chain",
    icon: "solar:bitcoin-bold-duotone",
    color: "from-[#F7931A] to-[#627EEA]",
    fees: { fixed: 0, percentage: 0 },
    minAmount: 1,
    maxAmount: 1000000,
    processingTime: "Network dependent",
    available: true,
    walletTypes: ["semi_custodial", "non_custodial"],
  },
];

const WITHDRAWAL_LIMITS = {
  daily: 10000,
  weekly: 50000,
  monthly: 200000,
};

const CRYPTO_TOKENS = [
  {
    id: "USDC",
    name: "USD Coin",
    icon: "cryptocurrency-color:usdc",
    chains: ["polygon", "ethereum", "base", "arbitrum"],
  },
  {
    id: "USDT",
    name: "Tether",
    icon: "cryptocurrency-color:usdt",
    chains: ["polygon", "ethereum", "arbitrum"],
  },
  {
    id: "ETH",
    name: "Ethereum",
    icon: "cryptocurrency-color:eth",
    chains: ["ethereum", "polygon", "base", "arbitrum"],
  },
  {
    id: "MATIC",
    name: "Polygon",
    icon: "cryptocurrency-color:matic",
    chains: ["polygon"],
  },
];

const CHAIN_CONFIG: Record<
  SupportedChain,
  { name: string; icon: string; color: string; fee: string }
> = {
  polygon: {
    name: "Polygon",
    icon: "cryptocurrency-color:matic",
    color: "#8247E5",
    fee: "~$0.01",
  },
  ethereum: {
    name: "Ethereum",
    icon: "cryptocurrency-color:eth",
    color: "#627EEA",
    fee: "~$5-20",
  },
  base: {
    name: "Base",
    icon: "simple-icons:coinbase",
    color: "#0052FF",
    fee: "~$0.01",
  },
  arbitrum: {
    name: "Arbitrum",
    icon: "token-branded:arb",
    color: "#28A0F0",
    fee: "~$0.10",
  },
  optimism: {
    name: "Optimism",
    icon: "token-branded:op",
    color: "#FF0420",
    fee: "~$0.10",
  },
  solana: {
    name: "Solana",
    icon: "cryptocurrency-color:sol",
    color: "#14F195",
    fee: "~$0.001",
  },
};

// ============================================================================
// 📦 SUB-COMPONENTS
// ============================================================================

function MethodCard({
  method,
  selected,
  onSelect,
  disabled,
}: {
  method: WithdrawalMethodConfig;
  selected: boolean;
  onSelect: () => void;
  disabled?: boolean;
}) {
  return (
    <motion.div
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
    >
      <Card
        isPressable={!disabled}
        onPress={onSelect}
        className={cn(
          "rounded-none border-2 transition-all cursor-pointer",
          selected
            ? "border-[#FF4654] dark:border-[#DCFF37] bg-[#FF4654]/5 dark:bg-[#DCFF37]/5"
            : "border-default-200 hover:border-[#FF4654]/50 dark:hover:border-[#DCFF37]/50",
          disabled && "opacity-50 cursor-not-allowed",
        )}
      >
        <CardBody className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center",
                  `bg-gradient-to-br ${method.color}`,
                )}
              >
                <Icon icon={method.icon} width={24} className="text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-[#34445C] dark:text-white">
                    {method.name}
                  </h4>
                  {method.requiresVerification && (
                    <Tooltip content="Bank account verification required">
                      <Chip
                        size="sm"
                        variant="flat"
                        className="rounded-none text-[10px] h-5"
                      >
                        <Icon
                          icon="solar:shield-check-bold"
                          width={12}
                          className="mr-1"
                        />
                        Verified
                      </Chip>
                    </Tooltip>
                  )}
                </div>
                <p className="text-xs text-default-500 mt-0.5">
                  {method.description}
                </p>
              </div>
            </div>

            <div className="text-right">
              <p className="text-xs text-default-500">Fees</p>
              <p className="font-semibold text-sm text-[#34445C] dark:text-white">
                {method.fees.percentage === 0 && method.fees.fixed === 0
                  ? "FREE"
                  : method.fees.fixed > 0
                    ? `$${method.fees.fixed}`
                    : `${method.fees.percentage}%`}
              </p>
            </div>
          </div>

          {selected && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mt-3 pt-3 border-t border-default-200"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="text-default-500">
                  <Icon
                    icon="solar:clock-circle-bold"
                    className="inline mr-1"
                    width={14}
                  />
                  {method.processingTime}
                </span>
                <span className="text-default-500">
                  Min: ${method.minAmount} • Max: $
                  {method.maxAmount.toLocaleString()}
                </span>
              </div>
            </motion.div>
          )}
        </CardBody>
      </Card>
    </motion.div>
  );
}

function WithdrawalAmountInput({
  amount,
  onChange,
  availableBalance,
  _minAmount,
  maxAmount,
  fee,
  currency = "USD",
}: {
  amount: number;
  onChange: (amount: number) => void;
  availableBalance: number;
  _minAmount: number;
  maxAmount: number;
  fee: number;
  currency?: FiatCurrency;
}) {
  const currencySymbol =
    currency === "BRL"
      ? "R$"
      : currency === "EUR"
        ? "€"
        : currency === "GBP"
          ? "£"
          : "$";
  const maxWithdrawable = Math.min(availableBalance, maxAmount);
  const netAmount = Math.max(0, amount - fee);

  const quickAmounts = [25, 50, 100, 250, 500].filter(
    (a) => a <= maxWithdrawable,
  );

  return (
    <div className="space-y-4">
      {/* Available Balance Card */}
      <Card className="rounded-none bg-gradient-to-r from-[#34445C] to-[#1a2436]">
        <CardBody className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-white/60">Available Balance</p>
              <p className="text-2xl font-bold text-white">
                {currencySymbol}
                {availableBalance.toFixed(2)}
              </p>
            </div>
            <EsportsButton
              size="sm"
              variant="ghost"
              className="bg-white/10 text-white hover:bg-white/20"
              onClick={() => onChange(maxWithdrawable)}
            >
              Withdraw All
            </EsportsButton>
          </div>
        </CardBody>
      </Card>

      {/* Amount Input */}
      <div className="relative">
        <Input
          type="number"
          label="Withdrawal Amount"
          placeholder="0.00"
          value={amount > 0 ? amount.toString() : ""}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          startContent={
            <span className="text-default-500 text-lg font-semibold">
              {currencySymbol}
            </span>
          }
          classNames={{
            input: "text-3xl font-bold text-center",
            inputWrapper: "rounded-none h-20",
          }}
          isInvalid={amount > availableBalance}
          errorMessage={
            amount > availableBalance ? "Insufficient balance" : undefined
          }
        />
      </div>

      {/* Quick Amounts */}
      <div className="flex flex-wrap gap-2">
        {quickAmounts.map((quickAmount) => (
          <EsportsButton
            key={quickAmount}
            size="sm"
            variant={amount === quickAmount ? "primary" : "ghost"}
            className="flex-1 min-w-[60px]"
            onClick={() => onChange(quickAmount)}
          >
            {currencySymbol}
            {quickAmount}
          </EsportsButton>
        ))}
      </div>

      {/* Summary */}
      {amount > 0 && amount <= availableBalance && (
        <Card className="rounded-none bg-success/10 border border-success/20">
          <CardBody className="p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-default-500">Withdrawal Amount</span>
              <span className="text-[#34445C] dark:text-white">
                {currencySymbol}
                {amount.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-default-500">Processing Fee</span>
              <span className="text-default-500">
                -{currencySymbol}
                {fee.toFixed(2)}
              </span>
            </div>
            <Divider />
            <div className="flex justify-between font-bold">
              <span className="text-[#34445C] dark:text-white">
                You&apos;ll Receive
              </span>
              <span className="text-success text-lg">
                {currencySymbol}
                {netAmount.toFixed(2)}
              </span>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Limits Info */}
      <div className="grid grid-cols-3 gap-2 text-center text-xs">
        <div className="bg-default-50 dark:bg-default-100/10 p-2 rounded-lg">
          <p className="text-default-400">Daily</p>
          <p className="font-semibold text-[#34445C] dark:text-white">
            ${WITHDRAWAL_LIMITS.daily.toLocaleString()}
          </p>
        </div>
        <div className="bg-default-50 dark:bg-default-100/10 p-2 rounded-lg">
          <p className="text-default-400">Weekly</p>
          <p className="font-semibold text-[#34445C] dark:text-white">
            ${WITHDRAWAL_LIMITS.weekly.toLocaleString()}
          </p>
        </div>
        <div className="bg-default-50 dark:bg-default-100/10 p-2 rounded-lg">
          <p className="text-default-400">Monthly</p>
          <p className="font-semibold text-[#34445C] dark:text-white">
            ${WITHDRAWAL_LIMITS.monthly.toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
}

function BankTransferForm({
  onSubmit,
  savedAccounts,
}: {
  onSubmit: (details: BankAccountDetails) => void;
  savedAccounts?: SavedWithdrawalAccount[];
}) {
  const [useSaved, setUseSaved] = useState(
    savedAccounts && savedAccounts.length > 0,
  );
  const [selectedAccountId, setSelectedAccountId] = useState(
    savedAccounts?.find((a) => a.isDefault)?.id || "",
  );

  const [accountHolder, setAccountHolder] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [routingNumber, setRoutingNumber] = useState("");
  const [accountType, setAccountType] = useState<"checking" | "savings">(
    "checking",
  );

  const handleSubmit = () => {
    if (useSaved && selectedAccountId) {
      // In real implementation, this would use the saved account
      onSubmit({
        accountHolder: "Saved Account",
        bankName: "Saved Bank",
        accountNumber: "****1234",
        routingNumber: "****5678",
        accountType: "checking",
      });
    } else {
      onSubmit({
        accountHolder,
        bankName,
        accountNumber,
        routingNumber,
        accountType,
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Saved Accounts */}
      {savedAccounts && savedAccounts.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 mb-3">
            <EsportsButton
              size="sm"
              variant={useSaved ? "primary" : "ghost"}
              onClick={() => setUseSaved(true)}
            >
              Saved Accounts
            </EsportsButton>
            <EsportsButton
              size="sm"
              variant={!useSaved ? "primary" : "ghost"}
              onClick={() => setUseSaved(false)}
            >
              New Account
            </EsportsButton>
          </div>

          {useSaved && (
            <div className="space-y-2">
              {savedAccounts
                .filter((a) => a.type === "bank_transfer")
                .map((account) => (
                  <Card
                    key={account.id}
                    isPressable
                    onPress={() => setSelectedAccountId(account.id)}
                    className={cn(
                      "rounded-none border-2 cursor-pointer",
                      selectedAccountId === account.id
                        ? "border-[#FF4654] dark:border-[#DCFF37]"
                        : "border-default-200",
                    )}
                  >
                    <CardBody className="p-3 flex flex-row items-center gap-3">
                      <Icon
                        icon="solar:bank-bold"
                        width={24}
                        className="text-emerald-500"
                      />
                      <div className="flex-1">
                        <p className="font-semibold text-sm">{account.label}</p>
                        <p className="text-xs text-default-500">
                          {account.accountInfo}
                        </p>
                      </div>
                      {account.isVerified && (
                        <Chip
                          size="sm"
                          color="success"
                          variant="flat"
                          className="rounded-none"
                        >
                          <Icon
                            icon="solar:check-circle-bold"
                            width={12}
                            className="mr-1"
                          />
                          Verified
                        </Chip>
                      )}
                    </CardBody>
                  </Card>
                ))}
            </div>
          )}
        </div>
      )}

      {/* New Account Form */}
      {!useSaved && (
        <>
          <Input
            label="Account Holder Name"
            placeholder="John Doe"
            value={accountHolder}
            onChange={(e) => setAccountHolder(e.target.value)}
            classNames={{ inputWrapper: "rounded-none" }}
          />

          <Input
            label="Bank Name"
            placeholder="Chase, Bank of America, etc."
            value={bankName}
            onChange={(e) => setBankName(e.target.value)}
            classNames={{ inputWrapper: "rounded-none" }}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Account Number"
              placeholder="1234567890"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              classNames={{ inputWrapper: "rounded-none" }}
            />
            <Input
              label="Routing Number"
              placeholder="021000021"
              value={routingNumber}
              onChange={(e) => setRoutingNumber(e.target.value)}
              classNames={{ inputWrapper: "rounded-none" }}
            />
          </div>

          <div className="flex gap-2">
            <EsportsButton
              variant={accountType === "checking" ? "primary" : "ghost"}
              className="flex-1"
              onClick={() => setAccountType("checking")}
            >
              Checking
            </EsportsButton>
            <EsportsButton
              variant={accountType === "savings" ? "primary" : "ghost"}
              className="flex-1"
              onClick={() => setAccountType("savings")}
            >
              Savings
            </EsportsButton>
          </div>
        </>
      )}

      <EsportsButton
        variant="primary"
        size="lg"
        fullWidth
        glow
        className="mt-4"
        onClick={handleSubmit}
        disabled={
          !useSaved &&
          (!accountHolder || !bankName || !accountNumber || !routingNumber)
        }
      >
        Continue
      </EsportsButton>
    </motion.div>
  );
}

function PIXWithdrawalForm({
  onSubmit,
}: {
  onSubmit: (details: PIXKeyDetails) => void;
}) {
  const [keyType, setKeyType] = useState<"cpf" | "phone" | "email" | "random">(
    "cpf",
  );
  const [keyValue, setKeyValue] = useState("");
  const [holderName, setHolderName] = useState("");

  const keyTypeConfig = {
    cpf: {
      label: "CPF",
      placeholder: "000.000.000-00",
      icon: "solar:card-bold",
    },
    phone: {
      label: "Telefone",
      placeholder: "+55 11 99999-9999",
      icon: "solar:phone-bold",
    },
    email: {
      label: "E-mail",
      placeholder: "seu@email.com",
      icon: "solar:letter-bold",
    },
    random: {
      label: "Chave Aleatória",
      placeholder: "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
      icon: "solar:key-bold",
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* PIX Logo Header */}
      <div className="flex items-center justify-center gap-2 py-4">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#32BCAD] to-[#00A7B5] flex items-center justify-center">
          <Icon icon="simple-icons:pix" width={24} className="text-white" />
        </div>
        <span className="text-lg font-bold text-[#34445C] dark:text-white">
          Transferência PIX
        </span>
      </div>

      {/* Key Type Selection */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-[#34445C] dark:text-white">
          Tipo de Chave PIX
        </label>
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(keyTypeConfig).map(([type, config]) => (
            <EsportsButton
              key={type}
              variant={keyType === type ? "primary" : "ghost"}
              className="justify-start"
              startContent={<Icon icon={config.icon} width={16} />}
              onClick={() => setKeyType(type as typeof keyType)}
            >
              {config.label}
            </EsportsButton>
          ))}
        </div>
      </div>

      <Input
        label={keyTypeConfig[keyType].label}
        placeholder={keyTypeConfig[keyType].placeholder}
        value={keyValue}
        onChange={(e) => setKeyValue(e.target.value)}
        startContent={
          <Icon
            icon={keyTypeConfig[keyType].icon}
            className="text-default-400"
            width={18}
          />
        }
        classNames={{ inputWrapper: "rounded-none" }}
      />

      <Input
        label="Nome do Titular"
        placeholder="Como aparece no banco"
        value={holderName}
        onChange={(e) => setHolderName(e.target.value)}
        classNames={{ inputWrapper: "rounded-none" }}
      />

      <div className="bg-[#32BCAD]/10 border border-[#32BCAD]/30 rounded-lg p-4">
        <div className="flex items-start gap-2">
          <Icon
            icon="solar:info-circle-bold"
            className="text-[#32BCAD] mt-0.5"
            width={18}
          />
          <p className="text-xs text-[#32BCAD]">
            A transferência será processada instantaneamente após a confirmação.
            Verifique se os dados estão corretos.
          </p>
        </div>
      </div>

      <EsportsButton
        variant="primary"
        size="lg"
        fullWidth
        glow
        onClick={() => onSubmit({ keyType, keyValue, holderName })}
        disabled={!keyValue || !holderName}
      >
        Confirmar Dados PIX
      </EsportsButton>
    </motion.div>
  );
}

function CryptoWithdrawalForm({
  onSubmit,
  requiresMPC,
  onMPCSign,
}: {
  onSubmit: (details: CryptoWithdrawalDetails) => void;
  requiresMPC: boolean;
  onMPCSign?: () => Promise<boolean>;
}) {
  const [selectedToken, setSelectedToken] = useState("USDC");
  const [selectedChain, setSelectedChain] = useState<SupportedChain>("polygon");
  const [address, setAddress] = useState("");
  const [memo, _setMemo] = useState("");
  const [isMPCSigning, setIsMPCSigning] = useState(false);

  const token = CRYPTO_TOKENS.find((t) => t.id === selectedToken);
  const chain = CHAIN_CONFIG[selectedChain];

  const handleSubmit = async () => {
    if (requiresMPC && onMPCSign) {
      setIsMPCSigning(true);
      const success = await onMPCSign();
      setIsMPCSigning(false);
      if (!success) return;
    }

    onSubmit({
      address,
      chain: selectedChain,
      token: selectedToken as CryptoCurrency,
      memo: memo || undefined,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Token Selection */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-[#34445C] dark:text-white">
          Select Token
        </label>
        <div className="flex flex-wrap gap-2">
          {CRYPTO_TOKENS.map((t) => (
            <EsportsButton
              key={t.id}
              size="sm"
              variant={selectedToken === t.id ? "primary" : "ghost"}
              startContent={<Icon icon={t.icon} width={16} />}
              onClick={() => setSelectedToken(t.id)}
            >
              {t.id}
            </EsportsButton>
          ))}
        </div>
      </div>

      {/* Chain Selection */}
      {token && (
        <div className="space-y-2">
          <label className="text-sm font-medium text-[#34445C] dark:text-white">
            Select Network
          </label>
          <div className="grid grid-cols-2 gap-2">
            {token.chains.map((chainId) => {
              const chainInfo = CHAIN_CONFIG[chainId as SupportedChain];
              return (
                <Card
                  key={chainId}
                  isPressable
                  onPress={() => setSelectedChain(chainId as SupportedChain)}
                  className={cn(
                    "rounded-none border-2 cursor-pointer",
                    selectedChain === chainId
                      ? "border-[#FF4654] dark:border-[#DCFF37]"
                      : "border-default-200",
                  )}
                >
                  <CardBody className="p-3 flex flex-row items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon icon={chainInfo.icon} width={20} />
                      <span className="font-medium text-sm">
                        {chainInfo.name}
                      </span>
                    </div>
                    <span className="text-xs text-default-400">
                      {chainInfo.fee}
                    </span>
                  </CardBody>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Destination Address */}
      <Input
        label="Destination Address"
        placeholder="0x..."
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        classNames={{
          inputWrapper: "rounded-none",
          input: "font-mono text-sm",
        }}
        endContent={
          <Tooltip content="Paste from clipboard">
            <Button
              isIconOnly
              size="sm"
              variant="light"
              onPress={async () => {
                const text = await navigator.clipboard.readText();
                setAddress(text);
              }}
            >
              <Icon icon="solar:clipboard-bold" width={18} />
            </Button>
          </Tooltip>
        }
      />

      {/* Warning */}
      <div className="bg-warning/10 border border-warning/30 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Icon
            icon="solar:danger-triangle-bold"
            className="text-warning mt-0.5"
            width={20}
          />
          <div>
            <p className="text-sm font-semibold text-warning-700 dark:text-warning">
              ⚠️ Double-check the address and network
            </p>
            <p className="text-xs text-warning-600 dark:text-warning-400 mt-1">
              Sending to the wrong address or network will result in permanent
              loss of funds.
            </p>
          </div>
        </div>
      </div>

      {/* Network Fee Info */}
      <div className="bg-default-50 dark:bg-default-100/10 rounded-lg p-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-default-500">Estimated Network Fee</span>
          <span className="font-semibold text-[#34445C] dark:text-white">
            {chain?.fee}
          </span>
        </div>
      </div>

      {/* MPC Notice for Semi-Custodial */}
      {requiresMPC && (
        <div className="bg-primary/10 border border-primary/30 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Icon
              icon="solar:shield-keyhole-bold"
              className="text-primary mt-0.5"
              width={20}
            />
            <div>
              <p className="text-sm font-semibold text-primary">
                MPC Signing Required
              </p>
              <p className="text-xs text-default-500 mt-1">
                This transaction requires your biometric approval via our secure
                MPC protocol.
              </p>
            </div>
          </div>
        </div>
      )}

      <EsportsButton
        variant="primary"
        size="lg"
        fullWidth
        glow
        loading={isMPCSigning}
        startContent={
          !isMPCSigning &&
          (requiresMPC ? (
            <Icon icon="solar:fingerprint-scan-bold" width={20} />
          ) : (
            <Icon icon="solar:send-bold" width={20} />
          ))
        }
        onClick={handleSubmit}
        disabled={!address || !selectedToken || !selectedChain}
      >
        {isMPCSigning
          ? "Waiting for MPC Approval..."
          : requiresMPC
            ? "Sign & Withdraw"
            : "Withdraw"}
      </EsportsButton>
    </motion.div>
  );
}

// ============================================================================
// 🎯 MAIN COMPONENT
// ============================================================================

export function WithdrawalCenter({
  walletType,
  availableBalance,
  pendingBalance = 0,
  currency = "USD",
  savedAccounts = [],
  onWithdraw,
  onMPCSign,
  onClose,
}: WithdrawalCenterProps) {
  const [selectedMethod, setSelectedMethod] = useState<WithdrawalMethod | null>(
    null,
  );
  const [amount, setAmount] = useState(0);
  const [step, setStep] = useState<
    "method" | "amount" | "details" | "confirm" | "processing" | "success"
  >("method");
  const [isProcessing, setIsProcessing] = useState(false);
  const [withdrawalResult, setWithdrawalResult] =
    useState<WithdrawalResult | null>(null);
  const [withdrawalDetails, setWithdrawalDetails] = useState<
    BankAccountDetails | PIXKeyDetails | CryptoWithdrawalDetails | null
  >(null);

  // Filter methods based on wallet type
  const availableMethods = useMemo(
    () =>
      WITHDRAWAL_METHODS.filter(
        (m) => m.available && m.walletTypes.includes(walletType),
      ),
    [walletType],
  );

  const selectedMethodConfig = useMemo(
    () => WITHDRAWAL_METHODS.find((m) => m.id === selectedMethod),
    [selectedMethod],
  );

  // Calculate fees
  const fees = useMemo(() => {
    if (!selectedMethodConfig || amount <= 0) return 0;
    const { fixed, percentage } = selectedMethodConfig.fees;
    return fixed + (amount * percentage) / 100;
  }, [selectedMethodConfig, amount]);

  const netAmount = amount - fees;

  const handleMethodSelect = (method: WithdrawalMethod) => {
    setSelectedMethod(method);
    setStep("amount");
  };

  const handleAmountConfirm = () => {
    if (
      amount >= (selectedMethodConfig?.minAmount || 0) &&
      amount <= availableBalance
    ) {
      setStep("details");
    }
  };

  const handleDetailsSubmit = (
    details: BankAccountDetails | PIXKeyDetails | CryptoWithdrawalDetails,
  ) => {
    setWithdrawalDetails(details);
    setStep("confirm");
  };

  const handleConfirmWithdrawal = async () => {
    setIsProcessing(true);
    setStep("processing");

    try {
      const result = await onWithdraw({
        amount,
        currency:
          selectedMethod === "crypto"
            ? (withdrawalDetails as CryptoWithdrawalDetails).token
            : currency,
        method: selectedMethod ?? 'pix',
        bankDetails:
          selectedMethod === "bank_transfer"
            ? (withdrawalDetails as BankAccountDetails)
            : undefined,
        pixDetails:
          selectedMethod === "pix"
            ? (withdrawalDetails as PIXKeyDetails)
            : undefined,
        cryptoDetails:
          selectedMethod === "crypto"
            ? (withdrawalDetails as CryptoWithdrawalDetails)
            : undefined,
      });

      setWithdrawalResult(result);
      if (result.success) {
        setStep("success");
      }
    } catch (error) {
      console.error("Withdrawal failed:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const walletTypeLabels: Record<
    CustodialWalletType,
    { name: string; icon: string; color: string }
  > = {
    full_custodial: {
      name: "Leet Wallet",
      icon: "solar:wallet-bold",
      color: "text-success",
    },
    semi_custodial: {
      name: "Leet Wallet Pro",
      icon: "solar:shield-keyhole-bold",
      color: "text-primary",
    },
    non_custodial: {
      name: "DeFi Wallet",
      icon: "solar:wallet-2-bold",
      color: "text-warning",
    },
  };

  const walletInfo = walletTypeLabels[walletType];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {step !== "method" && step !== "success" && (
            <EsportsButton
              variant="ghost"
              size="sm"
              className="!p-2"
              onClick={() => {
                const prevStep = {
                  amount: "method",
                  details: "amount",
                  confirm: "details",
                  processing: "confirm",
                  success: "method",
                } as const;
                setStep(prevStep[step as keyof typeof prevStep] || "method");
              }}
            >
              <Icon icon="solar:arrow-left-bold" width={18} />
            </EsportsButton>
          )}
          <div>
            <h2 className="text-xl font-bold text-[#34445C] dark:text-white flex items-center gap-2">
              <Icon
                icon="solar:cash-out-bold-duotone"
                className="text-[#FF4654] dark:text-[#DCFF37]"
                width={24}
              />
              Withdraw Funds
            </h2>
            <p className="text-sm text-default-500">
              from your{" "}
              <span className={walletInfo.color}>{walletInfo.name}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      {step !== "success" && (
        <div className="flex items-center gap-2">
          {["method", "amount", "details", "confirm"].map((s, i) => (
            <React.Fragment key={s}>
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all",
                  [
                    "method",
                    "amount",
                    "details",
                    "confirm",
                    "processing",
                    "success",
                  ].indexOf(step) >= i
                    ? "bg-[#FF4654] dark:bg-[#DCFF37] text-white dark:text-[#34445C]"
                    : "bg-default-200 text-default-500",
                )}
              >
                {i + 1}
              </div>
              {i < 3 && (
                <div
                  className={cn(
                    "flex-1 h-1 transition-all",
                    [
                      "method",
                      "amount",
                      "details",
                      "confirm",
                      "processing",
                      "success",
                    ].indexOf(step) > i
                      ? "bg-[#FF4654] dark:bg-[#DCFF37]"
                      : "bg-default-200",
                  )}
                />
              )}
            </React.Fragment>
          ))}
        </div>
      )}

      <AnimatePresence mode="wait">
        {/* Step 1: Method Selection */}
        {step === "method" && (
          <motion.div
            key="method"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-4"
          >
            <h3 className="font-semibold text-[#34445C] dark:text-white">
              Choose withdrawal method
            </h3>

            {/* Pending Balance Warning */}
            {pendingBalance > 0 && (
              <div className="bg-warning/10 border border-warning/30 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <Icon
                    icon="solar:clock-circle-bold"
                    className="text-warning"
                    width={18}
                  />
                  <span className="text-sm text-warning">
                    ${pendingBalance.toFixed(2)} pending from recent matches
                  </span>
                </div>
              </div>
            )}

            {/* Fiat Methods */}
            {walletType !== "non_custodial" && (
              <>
                <p className="text-sm text-default-500 flex items-center gap-2">
                  <Icon icon="solar:dollar-bold" width={16} />
                  Bank & Fiat
                </p>
                <div className="space-y-3">
                  {availableMethods
                    .filter((m) => m.id !== "crypto")
                    .map((method) => (
                      <MethodCard
                        key={method.id}
                        method={method}
                        selected={selectedMethod === method.id}
                        onSelect={() => handleMethodSelect(method.id)}
                      />
                    ))}
                </div>
              </>
            )}

            {/* Crypto Methods */}
            {(walletType === "semi_custodial" ||
              walletType === "non_custodial") && (
              <>
                <Divider className="my-4" />
                <p className="text-sm text-default-500 flex items-center gap-2">
                  <Icon icon="solar:bitcoin-bold" width={16} />
                  Cryptocurrency
                </p>
                <div className="space-y-3">
                  {availableMethods
                    .filter((m) => m.id === "crypto")
                    .map((method) => (
                      <MethodCard
                        key={method.id}
                        method={method}
                        selected={selectedMethod === method.id}
                        onSelect={() => handleMethodSelect(method.id)}
                      />
                    ))}
                </div>
              </>
            )}
          </motion.div>
        )}

        {/* Step 2: Amount */}
        {step === "amount" && selectedMethodConfig && (
          <motion.div
            key="amount"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-6"
          >
            <WithdrawalAmountInput
              amount={amount}
              onChange={setAmount}
              availableBalance={availableBalance}
              _minAmount={selectedMethodConfig.minAmount}
              maxAmount={selectedMethodConfig.maxAmount}
              fee={fees}
              currency={currency}
            />

            <EsportsButton
              variant="primary"
              size="lg"
              fullWidth
              glow
              onClick={handleAmountConfirm}
              disabled={
                amount < selectedMethodConfig.minAmount ||
                amount > availableBalance
              }
            >
              Continue
            </EsportsButton>
          </motion.div>
        )}

        {/* Step 3: Details */}
        {step === "details" && (
          <motion.div
            key="details"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            {selectedMethod === "bank_transfer" && (
              <BankTransferForm
                onSubmit={handleDetailsSubmit}
                savedAccounts={savedAccounts}
              />
            )}
            {selectedMethod === "pix" && (
              <PIXWithdrawalForm onSubmit={handleDetailsSubmit} />
            )}
            {selectedMethod === "crypto" && (
              <CryptoWithdrawalForm
                onSubmit={handleDetailsSubmit}
                requiresMPC={walletType === "semi_custodial"}
                onMPCSign={onMPCSign}
              />
            )}
            {selectedMethod === "paypal" && (
              <div className="space-y-4">
                <Input
                  label="PayPal Email"
                  placeholder="your@email.com"
                  classNames={{ inputWrapper: "rounded-none" }}
                />
                <EsportsButton
                  variant="primary"
                  size="lg"
                  fullWidth
                  onClick={() =>
                    handleDetailsSubmit({
                      keyType: "email",
                      keyValue: "",
                      holderName: "",
                    })
                  }
                >
                  Continue with PayPal
                </EsportsButton>
              </div>
            )}
          </motion.div>
        )}

        {/* Step 4: Confirm */}
        {step === "confirm" && selectedMethodConfig && (
          <motion.div
            key="confirm"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-6"
          >
            <div className="text-center">
              <h3 className="text-lg font-bold text-[#34445C] dark:text-white">
                Confirm Withdrawal
              </h3>
              <p className="text-sm text-default-500">
                Please review the details before confirming
              </p>
            </div>

            <Card className="rounded-none bg-default-50 dark:bg-default-100/10">
              <CardBody className="p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center",
                      `bg-gradient-to-br ${selectedMethodConfig.color}`,
                    )}
                  >
                    <Icon
                      icon={selectedMethodConfig.icon}
                      width={24}
                      className="text-white"
                    />
                  </div>
                  <div>
                    <p className="font-semibold text-[#34445C] dark:text-white">
                      {selectedMethodConfig.name}
                    </p>
                    <p className="text-xs text-default-500">
                      {selectedMethodConfig.processingTime}
                    </p>
                  </div>
                </div>

                <Divider />

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-default-500">Amount</span>
                    <span className="font-semibold">${amount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-default-500">Fee</span>
                    <span className="text-default-500">
                      -${fees.toFixed(2)}
                    </span>
                  </div>
                  <Divider />
                  <div className="flex justify-between text-lg">
                    <span className="font-bold text-[#34445C] dark:text-white">
                      You&apos;ll Receive
                    </span>
                    <span className="font-bold text-success">
                      ${netAmount.toFixed(2)}
                    </span>
                  </div>
                </div>
              </CardBody>
            </Card>

            <EsportsButton
              variant="primary"
              size="lg"
              fullWidth
              glow
              loading={isProcessing}
              startContent={
                !isProcessing && (
                  <Icon icon="solar:check-circle-bold" width={20} />
                )
              }
              onClick={handleConfirmWithdrawal}
            >
              {isProcessing ? "Processing..." : "Confirm Withdrawal"}
            </EsportsButton>
          </motion.div>
        )}

        {/* Processing */}
        {step === "processing" && (
          <motion.div
            key="processing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="w-20 h-20 mx-auto rounded-full bg-primary/20 flex items-center justify-center mb-6">
              <Icon
                icon="solar:refresh-bold"
                width={40}
                className="text-primary animate-spin"
              />
            </div>
            <h3 className="text-lg font-bold text-[#34445C] dark:text-white">
              Processing Withdrawal...
            </h3>
            <p className="text-sm text-default-500 mt-2">
              Please wait while we process your request
            </p>
          </motion.div>
        )}

        {/* Success */}
        {step === "success" && (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-8 space-y-6"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", damping: 15 }}
              className="w-24 h-24 mx-auto rounded-full bg-success/20 flex items-center justify-center"
            >
              <Icon
                icon="solar:check-circle-bold"
                width={48}
                className="text-success"
              />
            </motion.div>

            <div>
              <h3 className="text-2xl font-bold text-[#34445C] dark:text-white">
                Withdrawal Submitted! 🎉
              </h3>
              <p className="text-default-500 mt-2">
                {selectedMethodConfig?.processingTime === "Instant"
                  ? "Your funds will arrive shortly"
                  : `Expected arrival: ${selectedMethodConfig?.processingTime}`}
              </p>
            </div>

            <div className="bg-success/10 rounded-lg p-6 inline-block">
              <p className="text-sm text-default-500">Amount Withdrawn</p>
              <p className="text-4xl font-bold text-success">
                ${netAmount.toFixed(2)}
              </p>
            </div>

            {withdrawalResult?.transactionId && (
              <p className="text-xs text-default-400">
                Transaction ID: {withdrawalResult.transactionId}
              </p>
            )}

            <EsportsButton variant="primary" onClick={onClose}>
              Done
            </EsportsButton>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default WithdrawalCenter;

"use client";

/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║  🏆 LEETGAMING WALLET - FUNDING CENTER                                       ║
 * ║══════════════════════════════════════════════════════════════════════════════║
 * ║                                                                              ║
 * ║  💳 Award-Winning Deposit & Funding Experience                               ║
 * ║  The ultimate funding experience for competitive gamers                      ║
 * ║                                                                              ║
 * ║  🎯 LEET WALLET (Custodial):                                                 ║
 * ║     • Credit/Debit Cards (Visa, Mastercard, Amex)                           ║
 * ║     • Brazilian PIX (Instant transfers)                                      ║
 * ║     • Bank Transfer (ACH, Wire)                                              ║
 * ║     • PayPal                                                                 ║
 * ║                                                                              ║
 * ║  💎 LEET WALLET PRO (MPC Semi-Custodial):                                    ║
 * ║     • All fiat methods above                                                 ║
 * ║     • Crypto deposits (USDC, ETH, etc.)                                      ║
 * ║     • Cross-chain bridges                                                    ║
 * ║                                                                              ║
 * ║  🦊 DEFI WALLET (Non-Custodial):                                             ║
 * ║     • Crypto deposits only                                                   ║
 * ║     • Connect external wallets                                               ║
 * ║     • Multi-chain support                                                    ║
 * ║                                                                              ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */

import React, { useState, useMemo } from "react";
import { Card, CardBody, Chip, Input, Divider } from "@nextui-org/react";
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

export type FundingMethod =
  | "card"
  | "pix"
  | "bank_transfer"
  | "paypal"
  | "crypto"
  | "apple_pay"
  | "google_pay";

export type FiatCurrency = "USD" | "BRL" | "EUR" | "GBP";
export type CryptoCurrency = "USDC" | "USDT" | "ETH" | "MATIC" | "SOL" | "BTC";

export interface FundingMethodConfig {
  id: FundingMethod;
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
  badge?: string;
  recommended?: boolean;
}

export interface SavedPaymentMethod {
  id: string;
  type: FundingMethod;
  label: string;
  lastFour?: string;
  expiryDate?: string;
  isDefault: boolean;
  icon: string;
}

interface FundingCenterProps {
  walletType: CustodialWalletType;
  walletAddress?: string;
  currentBalance: number;
  currency?: FiatCurrency;
  savedMethods?: SavedPaymentMethod[];
  onDeposit: (params: DepositParams) => Promise<DepositResult>;
  onClose?: () => void;
}

export interface DepositParams {
  amount: number;
  currency: FiatCurrency | CryptoCurrency;
  method: FundingMethod;
  savedMethodId?: string;
  cryptoChain?: SupportedChain;
  metadata?: Record<string, unknown>;
}

export interface DepositResult {
  success: boolean;
  transactionId?: string;
  status: "pending" | "processing" | "completed" | "failed";
  message?: string;
  pixCode?: string;
  cryptoAddress?: string;
  expiresAt?: Date;
}

// ============================================================================
// 🎨 CONFIGURATION
// ============================================================================

const FUNDING_METHODS: FundingMethodConfig[] = [
  {
    id: "card",
    name: "Credit/Debit Card",
    description: "Visa, Mastercard, Amex • Instant",
    icon: "solar:card-bold-duotone",
    color: "from-blue-500 to-purple-500",
    fees: { fixed: 0, percentage: 2.9 },
    minAmount: 5,
    maxAmount: 5000,
    processingTime: "Instant",
    available: true,
    walletTypes: ["full_custodial", "semi_custodial"],
    recommended: true,
  },
  {
    id: "pix",
    name: "PIX",
    description: "Brazilian instant transfer • Zero fees",
    icon: "simple-icons:pix",
    color: "from-[#32BCAD] to-[#00A7B5]",
    fees: { fixed: 0, percentage: 0 },
    minAmount: 10,
    maxAmount: 50000,
    processingTime: "Instant",
    available: true,
    walletTypes: ["full_custodial", "semi_custodial"],
    badge: "🇧🇷 Brazil",
  },
  {
    id: "bank_transfer",
    name: "Bank Transfer",
    description: "ACH, Wire, SEPA • Lower fees",
    icon: "solar:bank-bold-duotone",
    color: "from-emerald-500 to-teal-500",
    fees: { fixed: 1.5, percentage: 0.5 },
    minAmount: 50,
    maxAmount: 100000,
    processingTime: "1-3 business days",
    available: true,
    walletTypes: ["full_custodial", "semi_custodial"],
  },
  {
    id: "paypal",
    name: "PayPal",
    description: "Fast & secure",
    icon: "logos:paypal",
    color: "from-[#003087] to-[#009CDE]",
    fees: { fixed: 0.3, percentage: 2.9 },
    minAmount: 5,
    maxAmount: 10000,
    processingTime: "Instant",
    available: true,
    walletTypes: ["full_custodial", "semi_custodial"],
  },
  {
    id: "apple_pay",
    name: "Apple Pay",
    description: "One-tap payment",
    icon: "simple-icons:applepay",
    color: "from-gray-800 to-black",
    fees: { fixed: 0, percentage: 2.9 },
    minAmount: 5,
    maxAmount: 5000,
    processingTime: "Instant",
    available: true,
    walletTypes: ["full_custodial", "semi_custodial"],
  },
  {
    id: "google_pay",
    name: "Google Pay",
    description: "Fast checkout",
    icon: "logos:google-pay",
    color: "from-[#4285F4] to-[#34A853]",
    fees: { fixed: 0, percentage: 2.9 },
    minAmount: 5,
    maxAmount: 5000,
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
    processingTime: "Network confirmation",
    available: true,
    walletTypes: ["semi_custodial", "non_custodial"],
    badge: "MULTI-CHAIN",
  },
];

const QUICK_AMOUNTS = [25, 50, 100, 250, 500, 1000];

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
  {
    id: "SOL",
    name: "Solana",
    icon: "cryptocurrency-color:sol",
    chains: ["solana"],
  },
];

const CHAIN_CONFIG: Record<
  SupportedChain,
  { name: string; icon: string; color: string }
> = {
  polygon: {
    name: "Polygon",
    icon: "cryptocurrency-color:matic",
    color: "#8247E5",
  },
  ethereum: {
    name: "Ethereum",
    icon: "cryptocurrency-color:eth",
    color: "#627EEA",
  },
  base: { name: "Base", icon: "simple-icons:coinbase", color: "#0052FF" },
  arbitrum: { name: "Arbitrum", icon: "token-branded:arb", color: "#28A0F0" },
  optimism: { name: "Optimism", icon: "token-branded:op", color: "#FF0420" },
  solana: {
    name: "Solana",
    icon: "cryptocurrency-color:sol",
    color: "#14F195",
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
  method: FundingMethodConfig;
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
                  {method.recommended && (
                    <Chip
                      size="sm"
                      className="rounded-none bg-[#DCFF37] text-[#34445C] font-semibold text-[10px] h-5"
                    >
                      RECOMMENDED
                    </Chip>
                  )}
                  {method.badge && (
                    <Chip
                      size="sm"
                      variant="flat"
                      className="rounded-none text-[10px] h-5"
                    >
                      {method.badge}
                    </Chip>
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
                    ? `$${method.fees.fixed} + ${method.fees.percentage}%`
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

function AmountSelector({
  amount,
  onChange,
  currency,
  minAmount,
  maxAmount,
}: {
  amount: number;
  onChange: (amount: number) => void;
  currency: FiatCurrency;
  minAmount: number;
  maxAmount: number;
}) {
  const currencySymbol =
    currency === "BRL"
      ? "R$"
      : currency === "EUR"
        ? "€"
        : currency === "GBP"
          ? "£"
          : "$";

  return (
    <div className="space-y-4">
      <div className="relative">
        <Input
          type="number"
          label="Amount to deposit"
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
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {QUICK_AMOUNTS.filter((a) => a >= minAmount && a <= maxAmount).map(
          (quickAmount) => (
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
          ),
        )}
      </div>

      <div className="flex items-center justify-between text-xs text-default-500">
        <span>
          Min: {currencySymbol}
          {minAmount}
        </span>
        <span>
          Max: {currencySymbol}
          {maxAmount.toLocaleString()}
        </span>
      </div>
    </div>
  );
}

function PIXPayment({
  pixCode,
  amount,
  expiresAt,
  onCopyCode,
}: {
  pixCode: string;
  amount: number;
  expiresAt?: Date;
  onCopyCode: () => void;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(pixCode);
    setCopied(true);
    onCopyCode();
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* PIX Header */}
      <div className="text-center">
        <div className="w-16 h-16 mx-auto rounded-xl bg-gradient-to-br from-[#32BCAD] to-[#00A7B5] flex items-center justify-center mb-4">
          <Icon icon="simple-icons:pix" width={32} className="text-white" />
        </div>
        <h3 className="text-xl font-bold text-[#34445C] dark:text-white">
          Escaneie o QR Code PIX
        </h3>
        <p className="text-default-500 text-sm mt-1">
          ou copie o código para pagar no seu banco
        </p>
      </div>

      {/* QR Code Placeholder */}
      <div className="bg-white p-4 rounded-xl mx-auto w-fit">
        <div className="w-48 h-48 bg-[#34445C] rounded-lg flex items-center justify-center">
          <Icon icon="solar:qr-code-bold" width={120} className="text-white" />
        </div>
      </div>

      {/* Amount */}
      <div className="text-center bg-success/10 rounded-lg p-4">
        <p className="text-sm text-default-500">Valor a pagar</p>
        <p className="text-3xl font-bold text-success">
          R$ {amount.toFixed(2)}
        </p>
      </div>

      {/* PIX Code */}
      <div className="space-y-2">
        <p className="text-sm font-medium text-[#34445C] dark:text-white">
          Código PIX Copia e Cola:
        </p>
        <div className="flex gap-2">
          <Input
            value={pixCode}
            readOnly
            classNames={{ inputWrapper: "rounded-none bg-default-100" }}
          />
          <EsportsButton
            variant={copied ? "action" : "primary"}
            className="min-w-[120px]"
            startContent={
              <Icon
                icon={copied ? "solar:check-bold" : "solar:copy-bold"}
                width={18}
              />
            }
            onClick={handleCopy}
          >
            {copied ? "Copiado!" : "Copiar"}
          </EsportsButton>
        </div>
      </div>

      {/* Expiry */}
      {expiresAt && (
        <div className="flex items-center justify-center gap-2 text-sm text-warning">
          <Icon icon="solar:clock-circle-bold" width={16} />
          <span>
            Expira em{" "}
            {Math.max(
              0,
              Math.round((expiresAt.getTime() - Date.now()) / 60000),
            )}{" "}
            minutos
          </span>
        </div>
      )}

      {/* Instructions */}
      <div className="bg-default-50 dark:bg-default-100/10 rounded-lg p-4">
        <h4 className="font-semibold text-sm text-[#34445C] dark:text-white mb-2">
          Como pagar:
        </h4>
        <ol className="text-xs text-default-600 space-y-1">
          <li>1. Abra o app do seu banco</li>
          <li>2. Vá em PIX → Pagar com QR Code ou Copia e Cola</li>
          <li>3. Escaneie o QR Code ou cole o código</li>
          <li>4. Confirme o pagamento</li>
        </ol>
      </div>
    </motion.div>
  );
}

function CryptoDeposit({
  address,
  selectedToken,
  selectedChain,
  onTokenChange,
  onChainChange,
  _walletType,
}: {
  address: string;
  selectedToken: string;
  selectedChain: SupportedChain;
  onTokenChange: (token: string) => void;
  onChainChange: (chain: SupportedChain) => void;
  _walletType: CustodialWalletType;
}) {
  const [copied, setCopied] = useState(false);

  const token = CRYPTO_TOKENS.find((t) => t.id === selectedToken);
  const chain = CHAIN_CONFIG[selectedChain];

  const handleCopy = () => {
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
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
              onClick={() => onTokenChange(t.id)}
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
          <div className="flex flex-wrap gap-2">
            {token.chains.map((chainId) => {
              const chainInfo = CHAIN_CONFIG[chainId as SupportedChain];
              return (
                <EsportsButton
                  key={chainId}
                  size="sm"
                  variant={selectedChain === chainId ? "primary" : "ghost"}
                  startContent={<Icon icon={chainInfo.icon} width={16} />}
                  onClick={() => onChainChange(chainId as SupportedChain)}
                >
                  {chainInfo.name}
                </EsportsButton>
              );
            })}
          </div>
        </div>
      )}

      {/* Warning for wrong network */}
      <div className="bg-warning/10 border border-warning/30 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Icon
            icon="solar:danger-triangle-bold"
            className="text-warning mt-0.5"
            width={20}
          />
          <div>
            <p className="text-sm font-semibold text-warning-700 dark:text-warning">
              ⚠️ Only send {selectedToken} on {chain?.name}
            </p>
            <p className="text-xs text-warning-600 dark:text-warning-400 mt-1">
              Sending tokens on the wrong network will result in permanent loss
              of funds.
            </p>
          </div>
        </div>
      </div>

      {/* Deposit Address */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-[#34445C] dark:text-white">
            Deposit Address
          </label>
          <Chip
            size="sm"
            variant="flat"
            className="rounded-none"
            startContent={<Icon icon={chain?.icon || ""} width={12} />}
          >
            {chain?.name}
          </Chip>
        </div>

        {/* QR Code */}
        <div className="bg-white p-4 rounded-xl mx-auto w-fit">
          <div className="w-40 h-40 bg-[#34445C] rounded-lg flex items-center justify-center">
            <Icon
              icon="solar:qr-code-bold"
              width={100}
              className="text-white"
            />
          </div>
        </div>

        {/* Address Input */}
        <div className="flex gap-2">
          <Input
            value={address}
            readOnly
            classNames={{
              inputWrapper: "rounded-none bg-default-100",
              input: "font-mono text-xs",
            }}
          />
          <EsportsButton
            variant={copied ? "action" : "primary"}
            className="min-w-[100px]"
            startContent={
              <Icon
                icon={copied ? "solar:check-bold" : "solar:copy-bold"}
                width={18}
              />
            }
            onClick={handleCopy}
          >
            {copied ? "Copied!" : "Copy"}
          </EsportsButton>
        </div>
      </div>

      {/* Minimum deposit info */}
      <div className="bg-default-50 dark:bg-default-100/10 rounded-lg p-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-default-500">Minimum deposit</span>
          <span className="font-semibold text-[#34445C] dark:text-white">
            {selectedToken === "ETH"
              ? "0.001"
              : selectedToken === "SOL"
                ? "0.01"
                : "1"}{" "}
            {selectedToken}
          </span>
        </div>
        <div className="flex items-center justify-between text-sm mt-2">
          <span className="text-default-500">Confirmations required</span>
          <span className="font-semibold text-[#34445C] dark:text-white">
            {selectedChain === "ethereum"
              ? "12"
              : selectedChain === "polygon"
                ? "30"
                : "10"}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

function CardPaymentForm({
  amount,
  currency,
  onSubmit,
  isProcessing,
}: {
  amount: number;
  currency: FiatCurrency;
  onSubmit: () => void;
  isProcessing: boolean;
}) {
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  const [name, setName] = useState("");
  const [saveCard, setSaveCard] = useState(true);

  const currencySymbol =
    currency === "BRL"
      ? "R$"
      : currency === "EUR"
        ? "€"
        : currency === "GBP"
          ? "£"
          : "$";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Card Preview */}
      <div className="relative h-48 bg-gradient-to-br from-[#34445C] via-[#34445C] to-[#1a2436] rounded-xl p-6 overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#DCFF37]/20 to-transparent rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-[#FF4654]/20 to-transparent rounded-full translate-y-1/2 -translate-x-1/2" />

        <div className="relative z-10 h-full flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <Icon
              icon="solar:wifi-router-bold"
              width={32}
              className="text-white/60 rotate-90"
            />
            <Icon
              icon={
                cardNumber.startsWith("4")
                  ? "logos:visa"
                  : cardNumber.startsWith("5")
                    ? "logos:mastercard"
                    : "solar:card-bold"
              }
              width={40}
              className={cardNumber.length < 1 ? "text-white/40" : ""}
            />
          </div>
          <div>
            <p className="font-mono text-xl text-white tracking-widest">
              {cardNumber || "•••• •••• •••• ••••"}
            </p>
            <div className="flex justify-between mt-4">
              <div>
                <p className="text-[10px] text-white/60 uppercase">
                  Card Holder
                </p>
                <p className="text-sm text-white font-medium">
                  {name || "YOUR NAME"}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-white/60 uppercase">Expires</p>
                <p className="text-sm text-white font-medium">
                  {expiry || "MM/YY"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Card Form */}
      <Input
        label="Card Number"
        placeholder="1234 5678 9012 3456"
        value={cardNumber}
        onChange={(e) =>
          setCardNumber(e.target.value.replace(/\D/g, "").slice(0, 16))
        }
        classNames={{ inputWrapper: "rounded-none" }}
        startContent={
          <Icon
            icon="solar:card-bold"
            className="text-default-400"
            width={20}
          />
        }
      />

      <Input
        label="Cardholder Name"
        placeholder="JOHN DOE"
        value={name}
        onChange={(e) => setName(e.target.value.toUpperCase())}
        classNames={{ inputWrapper: "rounded-none" }}
      />

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Expiry Date"
          placeholder="MM/YY"
          value={expiry}
          onChange={(e) => setExpiry(e.target.value)}
          classNames={{ inputWrapper: "rounded-none" }}
        />
        <Input
          label="CVC"
          placeholder="123"
          type="password"
          value={cvc}
          onChange={(e) => setCvc(e.target.value.slice(0, 4))}
          classNames={{ inputWrapper: "rounded-none" }}
          endContent={
            <Icon
              icon="solar:shield-check-bold"
              className="text-default-400"
              width={20}
            />
          }
        />
      </div>

      {/* Save card checkbox */}
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={saveCard}
          onChange={(e) => setSaveCard(e.target.checked)}
          className="w-4 h-4 rounded border-default-300 text-[#FF4654]"
        />
        <span className="text-sm text-default-600">
          Save card for future payments
        </span>
      </label>

      {/* Submit */}
      <EsportsButton
        variant="primary"
        size="lg"
        fullWidth
        glow
        loading={isProcessing}
        startContent={
          !isProcessing && <Icon icon="solar:lock-bold" width={20} />
        }
        onClick={onSubmit}
        disabled={!cardNumber || !name || !expiry || !cvc}
      >
        {isProcessing
          ? "Processing..."
          : `Pay ${currencySymbol}${amount.toFixed(2)}`}
      </EsportsButton>

      {/* Security badges */}
      <div className="flex items-center justify-center gap-4 pt-2">
        <div className="flex items-center gap-1 text-xs text-default-400">
          <Icon icon="solar:lock-bold" width={14} />
          <span>256-bit SSL</span>
        </div>
        <div className="flex items-center gap-1 text-xs text-default-400">
          <Icon icon="solar:shield-check-bold" width={14} />
          <span>PCI DSS</span>
        </div>
        <div className="flex items-center gap-1 text-xs text-default-400">
          <Icon icon="logos:stripe" width={32} />
        </div>
      </div>
    </motion.div>
  );
}

// ============================================================================
// 🎯 MAIN COMPONENT
// ============================================================================

export function FundingCenter({
  walletType,
  walletAddress = "0x1234...5678",
  currentBalance,
  currency = "USD",
  savedMethods: _savedMethods = [],
  onDeposit,
  onClose,
}: FundingCenterProps) {
  const [selectedMethod, setSelectedMethod] = useState<FundingMethod | null>(
    null,
  );
  const [amount, setAmount] = useState(0);
  const [step, setStep] = useState<
    "method" | "amount" | "payment" | "processing" | "success"
  >("method");
  const [isProcessing, setIsProcessing] = useState(false);
  const [depositResult, setDepositResult] = useState<DepositResult | null>(
    null,
  );

  // Crypto states
  const [selectedToken, setSelectedToken] = useState("USDC");
  const [selectedChain, setSelectedChain] = useState<SupportedChain>("polygon");

  // Filter methods based on wallet type
  const availableMethods = useMemo(
    () =>
      FUNDING_METHODS.filter(
        (m) => m.available && m.walletTypes.includes(walletType),
      ),
    [walletType],
  );

  const selectedMethodConfig = useMemo(
    () => FUNDING_METHODS.find((m) => m.id === selectedMethod),
    [selectedMethod],
  );

  // Calculate fees
  const fees = useMemo(() => {
    if (!selectedMethodConfig || amount <= 0) return 0;
    const { fixed, percentage } = selectedMethodConfig.fees;
    return fixed + (amount * percentage) / 100;
  }, [selectedMethodConfig, amount]);

  const totalAmount = amount + fees;

  const handleMethodSelect = (method: FundingMethod) => {
    setSelectedMethod(method);
    setStep("amount");
  };

  const handleAmountConfirm = () => {
    if (amount >= (selectedMethodConfig?.minAmount || 0)) {
      setStep("payment");
    }
  };

  const handlePayment = async () => {
    setIsProcessing(true);

    try {
      const result = await onDeposit({
        amount,
        currency:
          selectedMethod === "crypto"
            ? (selectedToken as CryptoCurrency)
            : currency,
        method: selectedMethod ?? "pix",
        cryptoChain: selectedMethod === "crypto" ? selectedChain : undefined,
      });

      setDepositResult(result);
      if (result.success) {
        setStep("success");
      }
    } catch (error) {
      console.error("Deposit failed:", error);
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
          {step !== "method" && (
            <EsportsButton
              variant="ghost"
              size="sm"
              className="!p-2"
              onClick={() =>
                setStep(
                  step === "amount"
                    ? "method"
                    : step === "payment"
                      ? "amount"
                      : "method",
                )
              }
            >
              <Icon icon="solar:arrow-left-bold" width={18} />
            </EsportsButton>
          )}
          <div>
            <h2 className="text-xl font-bold text-[#34445C] dark:text-white flex items-center gap-2">
              <Icon
                icon="solar:wallet-money-bold-duotone"
                className="text-[#FF4654] dark:text-[#DCFF37]"
                width={24}
              />
              Add Funds
            </h2>
            <p className="text-sm text-default-500">
              to your{" "}
              <span className={walletInfo.color}>{walletInfo.name}</span>
            </p>
          </div>
        </div>

        <div className="text-right">
          <p className="text-xs text-default-500">Current Balance</p>
          <p className="text-lg font-bold text-[#34445C] dark:text-white">
            ${currentBalance.toFixed(2)}
          </p>
        </div>
      </div>

      <Card className="rounded-none border border-warning/30 bg-warning/10">
        <CardBody className="py-3 px-4">
          <div className="flex items-start gap-3">
            <Icon
              icon="solar:shield-warning-bold"
              className="text-warning mt-0.5"
              width={18}
            />
            <p className="text-sm text-default-700 dark:text-default-300 leading-relaxed">
              Deposits are available only to eligible users 18+ and may require
              identity, payment, sanctions, or jurisdiction verification before
              funds are credited.
            </p>
          </div>
        </CardBody>
      </Card>

      {/* Progress Steps */}
      <div className="flex items-center gap-2">
        {["method", "amount", "payment"].map((s, i) => (
          <React.Fragment key={s}>
            <div
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all",
                step === s || ["amount", "payment", "success"].indexOf(step) > i
                  ? "bg-[#FF4654] dark:bg-[#DCFF37] text-white dark:text-[#34445C]"
                  : "bg-default-200 text-default-500",
              )}
            >
              {i + 1}
            </div>
            {i < 2 && (
              <div
                className={cn(
                  "flex-1 h-1 transition-all",
                  ["amount", "payment", "success"].indexOf(step) > i
                    ? "bg-[#FF4654] dark:bg-[#DCFF37]"
                    : "bg-default-200",
                )}
              />
            )}
          </React.Fragment>
        ))}
      </div>

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
              Choose payment method
            </h3>

            {/* Fiat Methods */}
            {walletType !== "non_custodial" && (
              <>
                <p className="text-sm text-default-500 flex items-center gap-2">
                  <Icon icon="solar:dollar-bold" width={16} />
                  Fiat Currency
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

        {/* Step 2: Amount Selection */}
        {step === "amount" && selectedMethodConfig && (
          <motion.div
            key="amount"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-6"
          >
            <div className="flex items-center gap-3 p-3 bg-default-50 dark:bg-default-100/10 rounded-lg">
              <div
                className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center",
                  `bg-gradient-to-br ${selectedMethodConfig.color}`,
                )}
              >
                <Icon
                  icon={selectedMethodConfig.icon}
                  width={20}
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

            {selectedMethod !== "crypto" ? (
              <>
                <AmountSelector
                  amount={amount}
                  onChange={setAmount}
                  currency={currency}
                  minAmount={selectedMethodConfig.minAmount}
                  maxAmount={selectedMethodConfig.maxAmount}
                />

                {/* Fee Summary */}
                {amount > 0 && (
                  <Card className="rounded-none bg-default-50 dark:bg-default-100/10">
                    <CardBody className="p-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-default-500">Deposit Amount</span>
                        <span className="text-[#34445C] dark:text-white">
                          ${amount.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-default-500">Processing Fee</span>
                        <span className="text-default-500">
                          ${fees.toFixed(2)}
                        </span>
                      </div>
                      <Divider />
                      <div className="flex justify-between font-bold">
                        <span className="text-[#34445C] dark:text-white">
                          Total
                        </span>
                        <span className="text-[#FF4654] dark:text-[#DCFF37]">
                          ${totalAmount.toFixed(2)}
                        </span>
                      </div>
                    </CardBody>
                  </Card>
                )}

                <EsportsButton
                  variant="primary"
                  size="lg"
                  fullWidth
                  glow
                  onClick={handleAmountConfirm}
                  disabled={amount < selectedMethodConfig.minAmount}
                >
                  Continue to Payment
                </EsportsButton>
              </>
            ) : (
              <CryptoDeposit
                address={walletAddress}
                selectedToken={selectedToken}
                selectedChain={selectedChain}
                onTokenChange={setSelectedToken}
                onChainChange={setSelectedChain}
                _walletType={walletType}
              />
            )}
          </motion.div>
        )}

        {/* Step 3: Payment */}
        {step === "payment" && selectedMethodConfig && (
          <motion.div
            key="payment"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            {selectedMethod === "pix" ? (
              <PIXPayment
                pixCode={
                  depositResult?.pixCode ||
                  "PIX123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ"
                }
                amount={amount}
                expiresAt={depositResult?.expiresAt}
                onCopyCode={() => {}}
              />
            ) : selectedMethod === "card" ||
              selectedMethod === "apple_pay" ||
              selectedMethod === "google_pay" ? (
              <CardPaymentForm
                amount={totalAmount}
                currency={currency}
                onSubmit={handlePayment}
                isProcessing={isProcessing}
              />
            ) : (
              <div className="text-center py-8">
                <Icon
                  icon={selectedMethodConfig.icon}
                  width={64}
                  className="mx-auto text-default-300 mb-4"
                />
                <p className="text-default-500">
                  Payment flow for {selectedMethodConfig.name} coming soon...
                </p>
              </div>
            )}
          </motion.div>
        )}

        {/* Success State */}
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
                Deposit Successful! 🎉
              </h3>
              <p className="text-default-500 mt-2">
                Your funds have been added to your wallet
              </p>
            </div>

            <div className="bg-success/10 rounded-lg p-6 inline-block">
              <p className="text-sm text-default-500">Amount Added</p>
              <p className="text-4xl font-bold text-success">
                ${amount.toFixed(2)}
              </p>
            </div>

            <div className="flex gap-3 justify-center">
              <EsportsButton
                variant="ghost"
                onClick={() => {
                  setStep("method");
                  setAmount(0);
                  setSelectedMethod(null);
                }}
              >
                Add More Funds
              </EsportsButton>
              <EsportsButton variant="primary" onClick={onClose}>
                Done
              </EsportsButton>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default FundingCenter;

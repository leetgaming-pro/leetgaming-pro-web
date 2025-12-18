/**
 * Withdrawal Form Component
 * Complete withdrawal request flow with verification
 * Per PRD D.6 (P0) - WithdrawalForm
 */

"use client";

import React, { useState, useMemo } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Input,
  Button,
  Select,
  SelectItem,
  Divider,
  RadioGroup,
  Radio,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Tooltip,
  Progress,
} from "@nextui-org/react";
import { Icon } from "@iconify/react";
import { motion, AnimatePresence } from "framer-motion";

// ============================================================================
// Types
// ============================================================================

export type WithdrawalMethod = "bank" | "paypal" | "crypto" | "pix";
export type CryptoCurrency = "BTC" | "ETH" | "USDC" | "USDT";
export type CryptoNetwork =
  | "ethereum"
  | "polygon"
  | "arbitrum"
  | "base"
  | "bitcoin";

export interface BankAccount {
  id: string;
  bankName: string;
  accountType: "checking" | "savings";
  last4: string;
  routingNumber?: string;
  verified: boolean;
}

export interface PayPalAccount {
  id: string;
  email: string;
  verified: boolean;
}

export interface CryptoWallet {
  id: string;
  address: string;
  currency: CryptoCurrency;
  network: CryptoNetwork;
  label?: string;
  verified: boolean;
}

export interface PixKey {
  id: string;
  keyType: "cpf" | "email" | "phone" | "random";
  keyValue: string;
  verified: boolean;
}

export interface WithdrawalLimits {
  minAmount: number;
  maxAmount: number;
  dailyLimit: number;
  dailyUsed: number;
  weeklyLimit: number;
  weeklyUsed: number;
  monthlyLimit: number;
  monthlyUsed: number;
}

export interface WithdrawalFees {
  bank: { fixed: number; percentage: number };
  paypal: { fixed: number; percentage: number };
  crypto: { fixed: number; percentage: number };
  pix: { fixed: number; percentage: number };
}

export interface WithdrawalRequest {
  amount: number;
  currency: string;
  method: WithdrawalMethod;
  destination: BankAccount | PayPalAccount | CryptoWallet | PixKey;
  twoFactorCode?: string;
}

interface WithdrawalFormProps {
  balance: number;
  currency: string;
  limits: WithdrawalLimits;
  fees: WithdrawalFees;
  bankAccounts?: BankAccount[];
  paypalAccounts?: PayPalAccount[];
  cryptoWallets?: CryptoWallet[];
  pixKeys?: PixKey[];
  requires2FA?: boolean;
  kycLevel?: "none" | "basic" | "standard" | "enhanced" | "full";
  onSubmit?: (request: WithdrawalRequest) => Promise<void>;
  onAddAccount?: (method: WithdrawalMethod) => void;
}

// ============================================================================
// Constants
// ============================================================================

const METHOD_INFO: Record<
  WithdrawalMethod,
  { label: string; icon: string; description: string }
> = {
  bank: {
    label: "Bank Transfer",
    icon: "solar:bank-bold-duotone",
    description: "2-5 business days",
  },
  paypal: {
    label: "PayPal",
    icon: "logos:paypal",
    description: "1-2 business days",
  },
  crypto: {
    label: "Cryptocurrency",
    icon: "cryptocurrency:eth",
    description: "10-30 minutes",
  },
  pix: {
    label: "PIX (Brazil)",
    icon: "arcticons:pix",
    description: "Instant",
  },
};

const _NETWORK_LABELS: Record<CryptoNetwork, string> = {
  ethereum: "Ethereum Mainnet",
  polygon: "Polygon",
  arbitrum: "Arbitrum One",
  base: "Base",
  bitcoin: "Bitcoin",
};

// ============================================================================
// Component
// ============================================================================

export function WithdrawalForm({
  balance,
  currency,
  limits,
  fees,
  bankAccounts = [],
  paypalAccounts = [],
  cryptoWallets = [],
  pixKeys = [],
  requires2FA = true,
  kycLevel = "basic",
  onSubmit,
  onAddAccount,
}: WithdrawalFormProps) {
  const [step, setStep] = useState<
    "amount" | "method" | "confirm" | "2fa" | "success"
  >("amount");
  const [amount, setAmount] = useState<string>("");
  const [method, setMethod] = useState<WithdrawalMethod | null>(null);
  const [selectedDestination, setSelectedDestination] = useState<string | null>(
    null
  );
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    isOpen: isLimitOpen,
    onOpen: onLimitOpen,
    onClose: onLimitClose,
  } = useDisclosure();

  // Computed values
  const numericAmount = useMemo(() => parseFloat(amount) || 0, [amount]);

  const selectedFee = useMemo(() => {
    if (!method) return { fixed: 0, percentage: 0 };
    return fees[method];
  }, [method, fees]);

  const feeAmount = useMemo(() => {
    return selectedFee.fixed + (numericAmount * selectedFee.percentage) / 100;
  }, [numericAmount, selectedFee]);

  const netAmount = useMemo(() => {
    return Math.max(0, numericAmount - feeAmount);
  }, [numericAmount, feeAmount]);

  const availableBalance = useMemo(() => {
    return Math.min(balance, limits.dailyLimit - limits.dailyUsed);
  }, [balance, limits]);

  const canProceed = useMemo(() => {
    if (numericAmount < limits.minAmount) return false;
    if (numericAmount > availableBalance) return false;
    if (numericAmount > limits.maxAmount) return false;
    return true;
  }, [numericAmount, limits, availableBalance]);

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
    }).format(value);
  };

  const getDestinations = (m: WithdrawalMethod) => {
    switch (m) {
      case "bank":
        return bankAccounts;
      case "paypal":
        return paypalAccounts;
      case "crypto":
        return cryptoWallets;
      case "pix":
        return pixKeys;
      default:
        return [];
    }
  };

  const getDestinationLabel = (
    dest: BankAccount | PayPalAccount | CryptoWallet | PixKey
  ): string => {
    if ("bankName" in dest) return `${dest.bankName} ****${dest.last4}`;
    if ("email" in dest) return dest.email;
    if ("address" in dest)
      return `${dest.label || dest.currency} - ${dest.address.slice(0, 8)}...`;
    if ("keyType" in dest)
      return `${dest.keyType.toUpperCase()}: ${dest.keyValue}`;
    return "Unknown";
  };

  const handleAmountChange = (value: string) => {
    // Only allow numbers and one decimal point
    const cleaned = value.replace(/[^0-9.]/g, "");
    const parts = cleaned.split(".");
    if (parts.length > 2) return;
    if (parts[1] && parts[1].length > 2) return;
    setAmount(cleaned);
    setError(null);
  };

  const handleQuickAmount = (percentage: number) => {
    const quickAmount = ((availableBalance * percentage) / 100).toFixed(2);
    setAmount(quickAmount);
    setError(null);
  };

  const handleMethodSelect = (m: WithdrawalMethod) => {
    setMethod(m);
    setSelectedDestination(null);
    const destinations = getDestinations(m);
    if (destinations.length === 1) {
      setSelectedDestination(destinations[0].id);
    }
  };

  const handleNext = () => {
    if (step === "amount") {
      if (!canProceed) {
        if (numericAmount < limits.minAmount) {
          setError(`Minimum withdrawal is ${formatCurrency(limits.minAmount)}`);
        } else if (numericAmount > availableBalance) {
          setError("Insufficient balance");
        } else if (numericAmount > limits.maxAmount) {
          setError(`Maximum withdrawal is ${formatCurrency(limits.maxAmount)}`);
        }
        return;
      }
      setStep("method");
    } else if (step === "method") {
      if (!method || !selectedDestination) {
        setError("Please select a withdrawal method and destination");
        return;
      }
      setStep("confirm");
    } else if (step === "confirm") {
      if (requires2FA) {
        setStep("2fa");
      } else {
        handleSubmit();
      }
    } else if (step === "2fa") {
      if (twoFactorCode.length !== 6) {
        setError("Please enter a valid 6-digit code");
        return;
      }
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    if (!method || !selectedDestination) return;

    const destinations = getDestinations(method);
    const destination = destinations.find((d) => d.id === selectedDestination);
    if (!destination) return;

    setIsProcessing(true);
    setError(null);

    try {
      await onSubmit?.({
        amount: numericAmount,
        currency,
        method,
        destination,
        twoFactorCode: requires2FA ? twoFactorCode : undefined,
      });
      setStep("success");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Withdrawal failed");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBack = () => {
    setError(null);
    if (step === "method") setStep("amount");
    else if (step === "confirm") setStep("method");
    else if (step === "2fa") setStep("confirm");
  };

  // KYC requirement check
  const kycRequired = kycLevel === "none" || kycLevel === "basic";
  if (kycRequired) {
    return (
      <Card className="max-w-md mx-auto">
        <CardBody className="flex flex-col items-center text-center gap-4 py-8">
          <div className="w-16 h-16 rounded-full bg-warning/20 flex items-center justify-center">
            <Icon
              icon="solar:shield-warning-bold-duotone"
              className="w-8 h-8 text-warning"
            />
          </div>
          <h3 className="text-lg font-semibold">Verification Required</h3>
          <p className="text-default-500">
            To withdraw funds, you need to complete identity verification (KYC
            Level 2 or higher).
          </p>
          <Button
            color="primary"
            onClick={() => (window.location.href = "/settings?tab=security")}
          >
            Complete Verification
          </Button>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card className="max-w-xl mx-auto">
      <CardHeader className="flex flex-col items-start gap-2 pb-0">
        <div className="flex justify-between items-center w-full">
          <h2 className="text-xl font-bold">Withdraw Funds</h2>
          <Tooltip content="View limits">
            <Button isIconOnly variant="light" size="sm" onClick={onLimitOpen}>
              <Icon icon="solar:info-circle-linear" className="w-5 h-5" />
            </Button>
          </Tooltip>
        </div>
        {/* Progress indicator */}
        <div className="flex items-center gap-2 w-full mt-2">
          {[
            "amount",
            "method",
            "confirm",
            requires2FA ? "2fa" : null,
            "success",
          ]
            .filter(Boolean)
            .map((s, i, arr) => (
              <React.Fragment key={s}>
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step === s
                      ? "bg-primary text-primary-foreground"
                      : arr.indexOf(step) > i
                      ? "bg-success text-success-foreground"
                      : "bg-default-200 text-default-500"
                  }`}
                >
                  {arr.indexOf(step) > i ? (
                    <Icon icon="solar:check-circle-bold" className="w-5 h-5" />
                  ) : (
                    i + 1
                  )}
                </div>
                {i < arr.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 ${
                      arr.indexOf(step) > i ? "bg-success" : "bg-default-200"
                    }`}
                  />
                )}
              </React.Fragment>
            ))}
        </div>
      </CardHeader>

      <CardBody className="gap-6">
        <AnimatePresence mode="wait">
          {/* Step 1: Amount */}
          {step === "amount" && (
            <motion.div
              key="amount"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div className="text-center mb-6">
                <p className="text-sm text-default-500">Available Balance</p>
                <p className="text-3xl font-bold">{formatCurrency(balance)}</p>
              </div>

              <Input
                type="text"
                label="Withdrawal Amount"
                placeholder="0.00"
                value={amount}
                onValueChange={handleAmountChange}
                startContent={
                  <span className="text-default-500">{currency}</span>
                }
                size="lg"
                variant="bordered"
                isInvalid={!!error}
                errorMessage={error}
              />

              {/* Quick amounts */}
              <div className="flex gap-2 justify-center">
                {[25, 50, 75, 100].map((pct) => (
                  <Button
                    key={pct}
                    size="sm"
                    variant="flat"
                    onClick={() => handleQuickAmount(pct)}
                  >
                    {pct}%
                  </Button>
                ))}
              </div>

              {/* Limits info */}
              <div className="bg-default-100 rounded-lg p-3 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-default-500">Minimum</span>
                  <span>{formatCurrency(limits.minAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-default-500">Maximum</span>
                  <span>{formatCurrency(limits.maxAmount)}</span>
                </div>
                <Divider />
                <div className="flex justify-between">
                  <span className="text-default-500">Daily remaining</span>
                  <span>
                    {formatCurrency(limits.dailyLimit - limits.dailyUsed)}
                  </span>
                </div>
              </div>

              <Button
                color="primary"
                fullWidth
                size="lg"
                onClick={handleNext}
                isDisabled={!numericAmount || !canProceed}
              >
                Continue
              </Button>
            </motion.div>
          )}

          {/* Step 2: Method Selection */}
          {step === "method" && (
            <motion.div
              key="method"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div className="text-center mb-4">
                <p className="text-sm text-default-500">Withdrawing</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(numericAmount)}
                </p>
              </div>

              <RadioGroup
                value={method || ""}
                onValueChange={(v) => handleMethodSelect(v as WithdrawalMethod)}
              >
                {(Object.keys(METHOD_INFO) as WithdrawalMethod[]).map((m) => {
                  const info = METHOD_INFO[m];
                  const destinations = getDestinations(m);
                  const fee = fees[m];

                  return (
                    <Radio
                      key={m}
                      value={m}
                      classNames={{
                        base: "max-w-full m-0 p-4 border-2 border-default-200 rounded-lg data-[selected=true]:border-primary",
                      }}
                    >
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-3">
                          <Icon icon={info.icon} className="w-6 h-6" />
                          <div>
                            <p className="font-medium">{info.label}</p>
                            <p className="text-xs text-default-500">
                              {info.description}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm">
                            {fee.percentage > 0 ? `${fee.percentage}%` : ""}
                            {fee.fixed > 0
                              ? ` + ${formatCurrency(fee.fixed)}`
                              : ""}
                            {fee.fixed === 0 && fee.percentage === 0
                              ? "Free"
                              : ""}
                          </p>
                          <p className="text-xs text-default-500">
                            {destinations.length} account
                            {destinations.length !== 1 ? "s" : ""}
                          </p>
                        </div>
                      </div>
                    </Radio>
                  );
                })}
              </RadioGroup>

              {/* Destination selection */}
              {method && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Select Destination</p>
                  {getDestinations(method).length > 0 ? (
                    <Select
                      placeholder="Select account"
                      selectedKeys={
                        selectedDestination ? [selectedDestination] : []
                      }
                      onSelectionChange={(keys) => {
                        const selected = Array.from(keys)[0] as string;
                        setSelectedDestination(selected);
                      }}
                    >
                      {getDestinations(method).map((dest) => (
                        <SelectItem key={dest.id} value={dest.id}>
                          <div className="flex items-center gap-2">
                            {dest.verified && (
                              <Icon
                                icon="solar:verified-check-bold"
                                className="w-4 h-4 text-success"
                              />
                            )}
                            {getDestinationLabel(dest)}
                          </div>
                        </SelectItem>
                      ))}
                    </Select>
                  ) : (
                    <Button
                      variant="bordered"
                      fullWidth
                      startContent={
                        <Icon
                          icon="solar:add-circle-linear"
                          className="w-5 h-5"
                        />
                      }
                      onClick={() => onAddAccount?.(method)}
                    >
                      Add {METHOD_INFO[method].label} Account
                    </Button>
                  )}
                </div>
              )}

              {error && (
                <p className="text-danger text-sm text-center">{error}</p>
              )}

              <div className="flex gap-2">
                <Button variant="flat" onClick={handleBack}>
                  Back
                </Button>
                <Button
                  color="primary"
                  className="flex-1"
                  onClick={handleNext}
                  isDisabled={!method || !selectedDestination}
                >
                  Continue
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Confirmation */}
          {step === "confirm" && (
            <motion.div
              key="confirm"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div className="text-center mb-4">
                <p className="text-sm text-default-500">Confirm Withdrawal</p>
              </div>

              <div className="bg-default-100 rounded-lg p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-default-500">Amount</span>
                  <span className="font-medium">
                    {formatCurrency(numericAmount)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-default-500">Method</span>
                  <span className="font-medium">
                    {method && METHOD_INFO[method].label}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-default-500">Fee</span>
                  <span className="font-medium text-warning">
                    -{formatCurrency(feeAmount)}
                  </span>
                </div>
                <Divider />
                <div className="flex justify-between text-lg">
                  <span className="font-semibold">You&apos;ll receive</span>
                  <span className="font-bold text-success">
                    {formatCurrency(netAmount)}
                  </span>
                </div>
              </div>

              {/* Destination details */}
              <div className="bg-default-50 rounded-lg p-3">
                <p className="text-xs text-default-500 mb-1">Destination</p>
                <p className="font-medium">
                  {selectedDestination &&
                    method &&
                    (() => {
                      const dest = getDestinations(method).find(
                        (d) => d.id === selectedDestination
                      );
                      return dest ? getDestinationLabel(dest) : "";
                    })()}
                </p>
              </div>

              <p className="text-xs text-default-500 text-center">
                Processing time: {method && METHOD_INFO[method].description}
              </p>

              {error && (
                <p className="text-danger text-sm text-center">{error}</p>
              )}

              <div className="flex gap-2">
                <Button variant="flat" onClick={handleBack}>
                  Back
                </Button>
                <Button
                  color="primary"
                  className="flex-1"
                  onClick={handleNext}
                  isLoading={isProcessing}
                >
                  {requires2FA ? "Continue to 2FA" : "Confirm Withdrawal"}
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 4: 2FA */}
          {step === "2fa" && (
            <motion.div
              key="2fa"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div className="text-center mb-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Icon
                    icon="solar:shield-keyhole-bold-duotone"
                    className="w-8 h-8 text-primary"
                  />
                </div>
                <p className="text-lg font-semibold">
                  Two-Factor Authentication
                </p>
                <p className="text-sm text-default-500">
                  Enter the 6-digit code from your authenticator app
                </p>
              </div>

              <Input
                type="text"
                placeholder="000000"
                value={twoFactorCode}
                onValueChange={(v) =>
                  setTwoFactorCode(v.replace(/\D/g, "").slice(0, 6))
                }
                maxLength={6}
                size="lg"
                className="text-center"
                classNames={{
                  input: "text-center text-2xl tracking-[0.5em] font-mono",
                }}
                isInvalid={!!error}
                errorMessage={error}
              />

              <div className="flex gap-2">
                <Button variant="flat" onClick={handleBack}>
                  Back
                </Button>
                <Button
                  color="primary"
                  className="flex-1"
                  onClick={handleNext}
                  isLoading={isProcessing}
                  isDisabled={twoFactorCode.length !== 6}
                >
                  Confirm Withdrawal
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 5: Success */}
          {step === "success" && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-8 space-y-4"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.2 }}
                className="w-20 h-20 rounded-full bg-success/20 flex items-center justify-center mx-auto"
              >
                <Icon
                  icon="solar:check-circle-bold"
                  className="w-10 h-10 text-success"
                />
              </motion.div>
              <h3 className="text-xl font-semibold">Withdrawal Submitted!</h3>
              <p className="text-default-500">
                Your withdrawal of {formatCurrency(netAmount)} has been
                submitted.
              </p>
              <p className="text-sm text-default-500">
                Expected arrival: {method && METHOD_INFO[method].description}
              </p>
              <Button
                color="primary"
                variant="flat"
                onClick={() => (window.location.href = "/wallet")}
              >
                View Transaction History
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </CardBody>

      {/* Limits Modal */}
      <Modal isOpen={isLimitOpen} onClose={onLimitClose}>
        <ModalContent>
          <ModalHeader>Withdrawal Limits</ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Daily Limit</span>
                  <span>
                    {formatCurrency(limits.dailyUsed)} /{" "}
                    {formatCurrency(limits.dailyLimit)}
                  </span>
                </div>
                <Progress
                  value={(limits.dailyUsed / limits.dailyLimit) * 100}
                  color="primary"
                  size="sm"
                />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Weekly Limit</span>
                  <span>
                    {formatCurrency(limits.weeklyUsed)} /{" "}
                    {formatCurrency(limits.weeklyLimit)}
                  </span>
                </div>
                <Progress
                  value={(limits.weeklyUsed / limits.weeklyLimit) * 100}
                  color="primary"
                  size="sm"
                />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Monthly Limit</span>
                  <span>
                    {formatCurrency(limits.monthlyUsed)} /{" "}
                    {formatCurrency(limits.monthlyLimit)}
                  </span>
                </div>
                <Progress
                  value={(limits.monthlyUsed / limits.monthlyLimit) * 100}
                  color="primary"
                  size="sm"
                />
              </div>
              <Divider />
              <p className="text-xs text-default-500">
                Limits reset at midnight UTC. To increase your limits, complete
                additional verification.
              </p>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onClick={onLimitClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Card>
  );
}

export default WithdrawalForm;

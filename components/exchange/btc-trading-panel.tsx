"use client";

/**
 * BTC Trading Panel Component
 *
 * Full-featured Buy/Sell Bitcoin panel with:
 * - Tab-based Buy/Sell toggle
 * - USD amount input (buy) / BTC amount input (sell)
 * - Live BTC price display with auto-refresh
 * - Quote with countdown timer
 * - Fee breakdown display
 * - Stripe payment integration (for buy)
 * - Confirmation modal
 */

import React, { useState, useMemo, useCallback } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Input,
  Divider,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Chip,
  Spinner,
  Progress,
  Tabs,
  Tab,
} from "@nextui-org/react";
import { Icon } from "@iconify/react";
import { motion, AnimatePresence } from "framer-motion";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";

import { EsportsButton } from "@/components/ui/esports-button";
import { BtcPriceTicker } from "./btc-price-ticker";
import {
  useExchangeRates,
  useQuote,
  useBuyBitcoin,
  useSellBitcoin,
  useFeeSchedule,
} from "@/hooks/useExchange";

// ─── Stripe Init ────────────────────────────────────────────────────────

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "",
);

// ─── Types ──────────────────────────────────────────────────────────────

type TradeSide = "BUY" | "SELL";

interface BtcTradingPanelProps {
  walletId: string;
  btcBalance?: number;
  onOrderComplete?: (orderId: string, side: TradeSide) => void;
  className?: string;
}

// ─── Helpers ────────────────────────────────────────────────────────────

function formatUSD(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

function formatBTC(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 8,
  }).format(amount);
}

function formatCountdown(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

// ─── Stripe Payment Form (inner) ────────────────────────────────────────

interface StripePaymentFormProps {
  onSuccess: () => void;
  onError: (msg: string) => void;
  isProcessing: boolean;
  setIsProcessing: (v: boolean) => void;
}

function StripePaymentForm({
  onSuccess,
  onError,
  isProcessing,
  setIsProcessing,
}: StripePaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsProcessing(true);
    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/wallet`,
        },
        redirect: "if_required",
      });

      if (error) {
        onError(error.message || "Payment failed");
      } else if (paymentIntent?.status === "succeeded") {
        onSuccess();
      }
    } catch (err: unknown) {
      onError(err instanceof Error ? err.message : "Payment failed");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement
        options={{
          layout: "tabs",
        }}
      />
      <EsportsButton
        type="submit"
        variant="primary"
        fullWidth
        loading={isProcessing}
        disabled={!stripe || !elements || isProcessing}
      >
        {isProcessing ? "Processing..." : "Confirm Payment"}
      </EsportsButton>
    </form>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────

export function BtcTradingPanel({
  walletId,
  btcBalance = 0,
  onOrderComplete,
  className,
}: BtcTradingPanelProps) {
  // ── State ─────────────────────────────────────────────────────────────
  const [side, setSide] = useState<TradeSide>("BUY");
  const [amountInput, setAmountInput] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showStripeModal, setShowStripeModal] = useState(false);
  const [stripeClientSecret, setStripeClientSecret] = useState<string | null>(null);
  const [isStripeProcessing, setIsStripeProcessing] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<string | null>(null);

  // ── Hooks ─────────────────────────────────────────────────────────────
  const { rates } = useExchangeRates();
  const { fees } = useFeeSchedule();

  const parsedAmount = useMemo(() => {
    const n = parseFloat(amountInput);
    return Number.isFinite(n) && n > 0 ? n : undefined;
  }, [amountInput]);

  const {
    quote,
    isLoading: isQuoteLoading,
    error: quoteError,
    remainingSeconds,
    isExpired,
    requestQuote,
    clearQuote,
  } = useQuote(side, parsedAmount);

  const {
    buy,
    isLoading: isBuying,
    error: buyError,
    clearError: clearBuyError,
  } = useBuyBitcoin();

  const {
    sell,
    isLoading: isSelling,
    error: sellError,
    clearError: clearSellError,
  } = useSellBitcoin();

  // ── Derived ───────────────────────────────────────────────────────────
  const isLoading = isBuying || isSelling;
  const error = buyError || sellError || quoteError;
  const btcPrice = rates?.btc_usd ?? 0;

  const estimatedBtc = useMemo(() => {
    if (side === "BUY" && parsedAmount && btcPrice > 0) {
      return parsedAmount / btcPrice;
    }
    return 0;
  }, [side, parsedAmount, btcPrice]);

  const estimatedUsd = useMemo(() => {
    if (side === "SELL" && parsedAmount && btcPrice > 0) {
      return parsedAmount * btcPrice;
    }
    return 0;
  }, [side, parsedAmount, btcPrice]);

  const feePercent = side === "BUY" ? (fees?.buy_fee_percent ?? 1.5) : (fees?.sell_fee_percent ?? 1.5);
  const feeAmount = useMemo(() => {
    if (side === "BUY" && parsedAmount) {
      return parsedAmount * (feePercent / 100);
    }
    if (side === "SELL" && estimatedUsd) {
      return estimatedUsd * (feePercent / 100);
    }
    return 0;
  }, [side, parsedAmount, estimatedUsd, feePercent]);

  // ── Handlers ──────────────────────────────────────────────────────────
  const handleSideChange = useCallback(
    (key: React.Key) => {
      setSide(key as TradeSide);
      clearQuote();
      clearBuyError();
      clearSellError();
      setAmountInput("");
      setOrderSuccess(null);
    },
    [clearQuote, clearBuyError, clearSellError],
  );

  const handleGetQuote = useCallback(async () => {
    clearQuote();
    await requestQuote();
  }, [clearQuote, requestQuote]);

  const handleConfirmOrder = useCallback(async () => {
    if (side === "BUY") {
      // For buy: initiate Stripe payment flow
      const result = await buy({
        amount_usd: parsedAmount!,
        wallet_id: walletId,
        stripe_payment_method: "pm_pending", // Will be filled by Stripe Elements
        quote_id: quote?.quote_id,
      });

      if (result?.stripe_client_secret) {
        setStripeClientSecret(result.stripe_client_secret);
        setShowConfirmModal(false);
        setShowStripeModal(true);
      } else if (result?.order_id) {
        setOrderSuccess(result.order_id);
        setShowConfirmModal(false);
        onOrderComplete?.(result.order_id, "BUY");
      }
    } else {
      // For sell: direct execution
      const result = await sell({
        amount_btc: parsedAmount!,
        wallet_id: walletId,
        quote_id: quote?.quote_id,
      });

      if (result?.order_id) {
        setOrderSuccess(result.order_id);
        setShowConfirmModal(false);
        onOrderComplete?.(result.order_id, "SELL");
      }
    }
  }, [side, parsedAmount, walletId, quote, buy, sell, onOrderComplete]);

  const handleStripeSuccess = useCallback(() => {
    setShowStripeModal(false);
    setStripeClientSecret(null);
    setOrderSuccess("Payment confirmed");
  }, []);

  const handleStripeError = useCallback((msg: string) => {
    // Error displayed in form; user can retry
    console.error("[BtcTradingPanel] Stripe error:", msg);
  }, []);

  // ── Render ────────────────────────────────────────────────────────────
  return (
    <>
      <Card
        className={`bg-content1 border border-content3 ${className || ""}`}
      >
        <CardHeader className="flex flex-col gap-2 pb-0">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <Icon
                icon="cryptocurrency:btc"
                className="w-6 h-6 text-warning"
              />
              <h3 className="text-lg font-semibold">Trade Bitcoin</h3>
            </div>
            <BtcPriceTicker compact />
          </div>

          <Tabs
            selectedKey={side}
            onSelectionChange={handleSideChange}
            variant="solid"
            fullWidth
            classNames={{
              tabList: "bg-content2 p-1",
              tab: "h-9",
              cursor: side === "BUY" ? "bg-success" : "bg-danger",
            }}
          >
            <Tab
              key="BUY"
              title={
                <div className="flex items-center gap-1.5">
                  <Icon icon="solar:arrow-down-bold" className="w-4 h-4" />
                  <span>Buy</span>
                </div>
              }
            />
            <Tab
              key="SELL"
              title={
                <div className="flex items-center gap-1.5">
                  <Icon icon="solar:arrow-up-bold" className="w-4 h-4" />
                  <span>Sell</span>
                </div>
              }
            />
          </Tabs>
        </CardHeader>

        <CardBody className="gap-4 pt-4">
          {/* Success state */}
          <AnimatePresence>
            {orderSuccess && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-success/10 border border-success/20 rounded-xl p-4 text-center"
              >
                <Icon
                  icon="solar:check-circle-bold"
                  className="w-8 h-8 text-success mx-auto mb-2"
                />
                <p className="font-semibold text-success">Order Submitted!</p>
                <p className="text-sm text-default-500 mt-1">
                  Order ID: {orderSuccess}
                </p>
                <EsportsButton
                  variant="ghost"
                  size="sm"
                  className="mt-3"
                  onClick={() => {
                    setOrderSuccess(null);
                    setAmountInput("");
                    clearQuote();
                  }}
                >
                  New Order
                </EsportsButton>
              </motion.div>
            )}
          </AnimatePresence>

          {!orderSuccess && (
            <>
              {/* Amount Input */}
              <div>
                <Input
                  type="number"
                  label={side === "BUY" ? "Amount (USD)" : "Amount (BTC)"}
                  placeholder={side === "BUY" ? "100.00" : "0.001"}
                  value={amountInput}
                  onValueChange={setAmountInput}
                  startContent={
                    side === "BUY" ? (
                      <span className="text-default-400 text-sm">$</span>
                    ) : (
                      <Icon
                        icon="cryptocurrency:btc"
                        className="w-4 h-4 text-warning"
                      />
                    )
                  }
                  classNames={{
                    input: "text-lg font-semibold",
                    inputWrapper: "bg-content2 border-content3",
                  }}
                />

                {/* Quick amount buttons (buy only) */}
                {side === "BUY" && (
                  <div className="flex gap-2 mt-2">
                    {[25, 50, 100, 250, 500].map((amt) => (
                      <button
                        key={amt}
                        onClick={() => setAmountInput(amt.toString())}
                        className="flex-1 py-1.5 rounded-lg text-xs font-medium bg-content2 hover:bg-content3 text-default-500 hover:text-default-700 transition-colors border border-content3"
                      >
                        ${amt}
                      </button>
                    ))}
                  </div>
                )}

                {/* BTC balance (sell only) */}
                {side === "SELL" && (
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-default-400">
                      Available: {formatBTC(btcBalance)} BTC
                    </span>
                    <button
                      onClick={() => setAmountInput(btcBalance.toString())}
                      className="text-xs text-primary hover:text-primary-400 transition-colors"
                    >
                      Max
                    </button>
                  </div>
                )}
              </div>

              {/* Estimated conversion */}
              {parsedAmount && btcPrice > 0 && (
                <div className="bg-content2/50 rounded-lg p-3 border border-content3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-default-400">
                      {side === "BUY" ? "You receive (est.)" : "You receive (est.)"}
                    </span>
                    <span className="font-semibold">
                      {side === "BUY"
                        ? `≈ ${formatBTC(estimatedBtc)} BTC`
                        : `≈ ${formatUSD(estimatedUsd)}`}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs mt-1">
                    <span className="text-default-400">Fee ({feePercent}%)</span>
                    <span className="text-default-500">
                      ≈ {formatUSD(feeAmount)}
                    </span>
                  </div>
                </div>
              )}

              {/* Error */}
              {error && (
                <div className="bg-danger/10 border border-danger/20 rounded-lg p-3">
                  <p className="text-sm text-danger">{error}</p>
                </div>
              )}

              {/* Quote section */}
              {quote && !isExpired && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-content2 rounded-xl p-4 border border-content3 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon
                        icon="solar:tag-price-bold"
                        className="w-4 h-4 text-primary"
                      />
                      <span className="text-sm font-medium">Locked Quote</span>
                    </div>
                    <Chip
                      size="sm"
                      variant="flat"
                      color={remainingSeconds > 10 ? "success" : "warning"}
                      startContent={
                        <Icon icon="solar:clock-circle-bold" className="w-3 h-3" />
                      }
                    >
                      {formatCountdown(remainingSeconds)}
                    </Chip>
                  </div>

                  <Progress
                    value={(remainingSeconds / (quote.remaining_seconds || 30)) * 100}
                    size="sm"
                    color={remainingSeconds > 10 ? "success" : "warning"}
                    className="max-w-full"
                  />

                  <Divider />

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-default-400">BTC Price</span>
                      <span className="font-semibold">
                        {formatUSD(quote.btc_price_usd)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-default-400">Amount</span>
                      <span>
                        {side === "BUY"
                          ? formatUSD(quote.amount_usd)
                          : `${formatBTC(quote.btc_amount)} BTC`}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-default-400">
                        {side === "BUY" ? "You receive" : "You receive"}
                      </span>
                      <span className="font-semibold text-primary">
                        {side === "BUY"
                          ? `${formatBTC(quote.btc_amount)} BTC`
                          : formatUSD(quote.net_proceeds_usd ?? quote.amount_usd)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-default-400">
                        Fee ({quote.fee_percent}%)
                      </span>
                      <span className="text-default-500">
                        {formatUSD(quote.fee_amount_usd)}
                      </span>
                    </div>
                    {side === "BUY" && quote.total_cost_usd && (
                      <div className="flex justify-between font-semibold">
                        <span>Total Cost</span>
                        <span>{formatUSD(quote.total_cost_usd)}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1 text-xs text-default-400 mt-1">
                      <Icon icon="solar:shield-check-bold" className="w-3 h-3" />
                      <span>
                        Source: {quote.price_source} • Confidence:{" "}
                        {(quote.confidence * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Expired quote message */}
              {isExpired && (
                <div className="bg-warning/10 border border-warning/20 rounded-lg p-3 text-center">
                  <p className="text-sm text-warning font-medium">
                    Quote expired
                  </p>
                  <EsportsButton
                    variant="ghost"
                    size="sm"
                    className="mt-2"
                    onClick={handleGetQuote}
                  >
                    Get New Quote
                  </EsportsButton>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex flex-col gap-2">
                {!quote || isExpired ? (
                  <EsportsButton
                    variant="primary"
                    fullWidth
                    loading={isQuoteLoading}
                    disabled={!parsedAmount || isQuoteLoading}
                    onClick={handleGetQuote}
                  >
                    {isQuoteLoading ? (
                      "Getting Quote..."
                    ) : (
                      <>
                        <Icon
                          icon="solar:tag-price-bold"
                          className="w-4 h-4 mr-1.5"
                        />
                        Get Quote
                      </>
                    )}
                  </EsportsButton>
                ) : (
                  <EsportsButton
                    variant={side === "BUY" ? "action" : "danger"}
                    fullWidth
                    loading={isLoading}
                    disabled={isLoading || isExpired}
                    onClick={() => setShowConfirmModal(true)}
                  >
                    {isLoading ? (
                      "Processing..."
                    ) : (
                      <>
                        <Icon
                          icon={
                            side === "BUY"
                              ? "solar:arrow-down-bold"
                              : "solar:arrow-up-bold"
                          }
                          className="w-4 h-4 mr-1.5"
                        />
                        {side === "BUY"
                          ? `Buy ${formatBTC(quote.btc_amount)} BTC`
                          : `Sell ${formatBTC(quote.btc_amount)} BTC`}
                      </>
                    )}
                  </EsportsButton>
                )}
              </div>

              {/* Fee tier info */}
              {fees && (
                <div className="flex items-center justify-center gap-2 text-xs text-default-400">
                  <Icon icon="solar:medal-star-bold" className="w-3.5 h-3.5" />
                  <span>
                    {fees.plan_tier} tier • Buy {fees.buy_fee_percent}% • Sell{" "}
                    {fees.sell_fee_percent}%
                  </span>
                </div>
              )}
            </>
          )}
        </CardBody>
      </Card>

      {/* ── Confirmation Modal ─────────────────────────────────────────── */}
      <Modal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        classNames={{
          base: "bg-content1 border border-content3",
          header: "border-b border-content3",
          footer: "border-t border-content3",
        }}
      >
        <ModalContent>
          <ModalHeader>
            <div className="flex items-center gap-2">
              <Icon
                icon={
                  side === "BUY"
                    ? "solar:arrow-down-bold"
                    : "solar:arrow-up-bold"
                }
                className={`w-5 h-5 ${side === "BUY" ? "text-success" : "text-danger"}`}
              />
              <span>Confirm {side === "BUY" ? "Purchase" : "Sale"}</span>
            </div>
          </ModalHeader>
          <ModalBody>
            {quote && (
              <div className="space-y-4">
                <div className="bg-content2 rounded-xl p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-default-400">
                      {side === "BUY" ? "You pay" : "You sell"}
                    </span>
                    <span className="font-semibold">
                      {side === "BUY"
                        ? formatUSD(quote.total_cost_usd ?? quote.amount_usd)
                        : `${formatBTC(quote.btc_amount)} BTC`}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-default-400">You receive</span>
                    <span className="font-semibold text-primary">
                      {side === "BUY"
                        ? `${formatBTC(quote.btc_amount)} BTC`
                        : formatUSD(quote.net_proceeds_usd ?? quote.amount_usd)}
                    </span>
                  </div>
                  <Divider />
                  <div className="flex justify-between text-xs">
                    <span className="text-default-400">BTC Price</span>
                    <span>{formatUSD(quote.btc_price_usd)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-default-400">
                      Fee ({quote.fee_percent}%)
                    </span>
                    <span>{formatUSD(quote.fee_amount_usd)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-default-400">
                  <Icon
                    icon="solar:shield-check-bold"
                    className="w-4 h-4 text-success"
                  />
                  <span>
                    This transaction is secured and irreversible once confirmed.
                  </span>
                </div>

                {/* Countdown reminder */}
                <div className="flex items-center justify-center gap-2">
                  <Chip
                    size="sm"
                    variant="flat"
                    color={remainingSeconds > 10 ? "success" : "warning"}
                  >
                    Quote expires in {formatCountdown(remainingSeconds)}
                  </Chip>
                </div>
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            <EsportsButton
              variant="ghost"
              onClick={() => setShowConfirmModal(false)}
            >
              Cancel
            </EsportsButton>
            <EsportsButton
              variant={side === "BUY" ? "action" : "danger"}
              loading={isLoading}
              disabled={isLoading || isExpired}
              onClick={handleConfirmOrder}
            >
              {side === "BUY" ? "Confirm Purchase" : "Confirm Sale"}
            </EsportsButton>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* ── Stripe Payment Modal (Buy only) ──────────────────────────── */}
      <Modal
        isOpen={showStripeModal}
        onClose={() => {
          setShowStripeModal(false);
          setStripeClientSecret(null);
        }}
        size="lg"
        classNames={{
          base: "bg-content1 border border-content3",
          header: "border-b border-content3",
        }}
      >
        <ModalContent>
          <ModalHeader>
            <div className="flex items-center gap-2">
              <Icon
                icon="solar:shield-check-bold"
                className="w-5 h-5 text-success"
              />
              <span>Secure Payment</span>
            </div>
          </ModalHeader>
          <ModalBody className="py-6">
            {stripeClientSecret && (
              <Elements
                stripe={stripePromise}
                options={{
                  clientSecret: stripeClientSecret,
                  appearance: {
                    theme: "night",
                    labels: "floating",
                    variables: {
                      colorPrimary: "#0ea5e9",
                      colorBackground: "#18181b",
                      colorText: "#fafafa",
                      colorDanger: "#dc2626",
                      fontFamily: "system-ui, -apple-system, sans-serif",
                      borderRadius: "12px",
                    },
                    rules: {
                      ".Input": {
                        backgroundColor: "#27272a",
                        border: "1px solid #3f3f46",
                        boxShadow: "none",
                      },
                      ".Input:focus": {
                        border: "1px solid #0ea5e9",
                        boxShadow: "0 0 0 1px #0ea5e9",
                      },
                    },
                  },
                }}
              >
                <StripePaymentForm
                  onSuccess={handleStripeSuccess}
                  onError={handleStripeError}
                  isProcessing={isStripeProcessing}
                  setIsProcessing={setIsStripeProcessing}
                />
              </Elements>
            )}

            {!stripeClientSecret && (
              <div className="flex items-center justify-center py-8">
                <Spinner size="lg" />
              </div>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}

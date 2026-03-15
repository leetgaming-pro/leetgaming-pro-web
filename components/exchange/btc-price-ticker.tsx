"use client";

/**
 * BTC Price Ticker Component
 *
 * Small component showing live BTC/USD price with auto-refresh.
 * Displays price, 24h change, and a subtle pulse animation on updates.
 */

import React from "react";
import { Chip, Skeleton } from "@nextui-org/react";
import { Icon } from "@iconify/react";
import { motion, AnimatePresence } from "framer-motion";
import { useExchangeRates } from "@/hooks/useExchange";

interface BtcPriceTickerProps {
  /** Show compact version (price only) */
  compact?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Custom poll interval in ms (default: 10000) */
  pollInterval?: number;
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price);
}

export function BtcPriceTicker({
  compact = false,
  className = "",
  pollInterval = 10000,
}: BtcPriceTickerProps) {
  const { rates, isLoading, error, lastUpdatedAgo } =
    useExchangeRates(pollInterval);

  if (isLoading && !rates) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Skeleton className="h-5 w-20 rounded-md" />
      </div>
    );
  }

  if (error && !rates) {
    return (
      <div className={`flex items-center gap-1 text-xs text-default-400 ${className}`}>
        <Icon icon="solar:danger-triangle-bold" className="w-3.5 h-3.5 text-warning" />
        <span>Price unavailable</span>
      </div>
    );
  }

  if (!rates) return null;

  const change = rates.change_24h_percent ?? 0;
  const isPositive = change >= 0;

  if (compact) {
    return (
      <div className={`flex items-center gap-1.5 ${className}`}>
        <AnimatePresence mode="wait">
          <motion.span
            key={rates.btc_usd}
            initial={{ opacity: 0.5, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-sm font-semibold tabular-nums"
          >
            {formatPrice(rates.btc_usd)}
          </motion.span>
        </AnimatePresence>
        <Chip
          size="sm"
          variant="flat"
          color={isPositive ? "success" : "danger"}
          className="h-5 text-[10px]"
        >
          {isPositive ? "+" : ""}
          {change.toFixed(2)}%
        </Chip>
      </div>
    );
  }

  return (
    <div
      className={`flex items-center gap-3 bg-content2/50 border border-content3 rounded-xl px-4 py-2.5 ${className}`}
    >
      {/* BTC Icon */}
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-warning/10 flex items-center justify-center">
          <Icon icon="cryptocurrency:btc" className="w-5 h-5 text-warning" />
        </div>
        <div>
          <div className="text-xs text-default-400">Bitcoin</div>
          <div className="text-xs text-default-500">BTC/USD</div>
        </div>
      </div>

      {/* Price */}
      <div className="flex flex-col items-end ml-auto">
        <AnimatePresence mode="wait">
          <motion.span
            key={rates.btc_usd}
            initial={{ opacity: 0.5, y: -2 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-base font-bold tabular-nums"
          >
            {formatPrice(rates.btc_usd)}
          </motion.span>
        </AnimatePresence>

        <div className="flex items-center gap-1">
          <Chip
            size="sm"
            variant="flat"
            color={isPositive ? "success" : "danger"}
            startContent={
              <Icon
                icon={
                  isPositive
                    ? "solar:arrow-up-bold"
                    : "solar:arrow-down-bold"
                }
                className="w-3 h-3"
              />
            }
            className="h-5 text-[10px]"
          >
            {isPositive ? "+" : ""}
            {change.toFixed(2)}%
          </Chip>
        </div>
      </div>

      {/* 24h High/Low */}
      {(rates.high_24h || rates.low_24h) && (
        <>
          <div className="w-px h-8 bg-content3" />
          <div className="flex flex-col gap-0.5 text-xs">
            {rates.high_24h && (
              <div className="flex items-center gap-1">
                <span className="text-default-400">H:</span>
                <span className="text-success tabular-nums">
                  {formatPrice(rates.high_24h)}
                </span>
              </div>
            )}
            {rates.low_24h && (
              <div className="flex items-center gap-1">
                <span className="text-default-400">L:</span>
                <span className="text-danger tabular-nums">
                  {formatPrice(rates.low_24h)}
                </span>
              </div>
            )}
          </div>
        </>
      )}

      {/* Last updated indicator */}
      <div className="flex items-center gap-1 text-[10px] text-default-400">
        <div
          className={`w-1.5 h-1.5 rounded-full ${
            lastUpdatedAgo < 15 ? "bg-success" : "bg-warning"
          }`}
        />
        <span>{lastUpdatedAgo}s ago</span>
      </div>
    </div>
  );
}

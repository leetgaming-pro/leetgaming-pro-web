"use client";

/**
 * Order History Component
 *
 * Table-based display of BTC exchange order history with:
 * - Paginated results
 * - Status chips with color coding
 * - Side indicators (Buy/Sell)
 * - Date formatting
 * - Load more pagination
 */

import React from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Chip,
  Skeleton,
  Divider,
} from "@nextui-org/react";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";

import { EsportsButton } from "@/components/ui/esports-button";
import { useOrderHistory } from "@/hooks/useExchange";
import type { OrderSummary } from "@/lib/api/exchange";

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

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function getStatusColor(
  status: string,
): "success" | "warning" | "danger" | "default" | "primary" {
  switch (status.toLowerCase()) {
    case "completed":
    case "settled":
      return "success";
    case "pending":
    case "processing":
      return "warning";
    case "failed":
    case "cancelled":
    case "canceled":
      return "danger";
    case "confirming":
      return "primary";
    default:
      return "default";
  }
}

function getStatusIcon(status: string): string {
  switch (status.toLowerCase()) {
    case "completed":
    case "settled":
      return "solar:check-circle-bold";
    case "pending":
    case "processing":
      return "solar:clock-circle-bold";
    case "failed":
      return "solar:close-circle-bold";
    case "cancelled":
    case "canceled":
      return "solar:forbidden-circle-bold";
    case "confirming":
      return "solar:refresh-circle-bold";
    default:
      return "solar:question-circle-bold";
  }
}

// ─── Props ──────────────────────────────────────────────────────────────

interface OrderHistoryProps {
  /** Number of orders per page */
  pageSize?: number;
  /** Additional CSS classes */
  className?: string;
  /** Show card wrapper */
  showCard?: boolean;
}

// ─── Order Row ──────────────────────────────────────────────────────────

function OrderRow({ order, index }: { order: OrderSummary; index: number }) {
  const isBuy = order.side.toUpperCase() === "BUY";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="flex items-center gap-3 py-3 px-2 hover:bg-content2/50 rounded-lg transition-colors"
    >
      {/* Side indicator */}
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center ${
          isBuy ? "bg-success/10" : "bg-danger/10"
        }`}
      >
        <Icon
          icon={isBuy ? "solar:arrow-down-bold" : "solar:arrow-up-bold"}
          className={`w-4 h-4 ${isBuy ? "text-success" : "text-danger"}`}
        />
      </div>

      {/* Order details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">
            {isBuy ? "Buy" : "Sell"} Bitcoin
          </span>
          <Chip
            size="sm"
            variant="flat"
            color={getStatusColor(order.status)}
            startContent={
              <Icon icon={getStatusIcon(order.status)} className="w-3 h-3" />
            }
            className="h-5 text-[10px]"
          >
            {order.status}
          </Chip>
        </div>
        <div className="flex items-center gap-2 text-xs text-default-400 mt-0.5">
          <span>{formatDate(order.created_at)}</span>
          <span>•</span>
          <span className="tabular-nums">
            @ {formatUSD(order.btc_price_usd)}/BTC
          </span>
        </div>
      </div>

      {/* Amounts */}
      <div className="text-right">
        <div className="text-sm font-semibold tabular-nums">
          {isBuy ? (
            <span className="text-success">
              +{formatBTC(order.amount_btc)} BTC
            </span>
          ) : (
            <span className="text-danger">
              -{formatBTC(order.amount_btc)} BTC
            </span>
          )}
        </div>
        <div className="text-xs text-default-400 tabular-nums">
          {isBuy
            ? `-${formatUSD(order.amount_usd)}`
            : `+${formatUSD(order.amount_usd)}`}
        </div>
        {order.fee_usd > 0 && (
          <div className="text-[10px] text-default-500 tabular-nums">
            Fee: {formatUSD(order.fee_usd)}
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ─── Loading Skeleton ───────────────────────────────────────────────────

function OrderSkeleton() {
  return (
    <div className="flex items-center gap-3 py-3 px-2">
      <Skeleton className="w-8 h-8 rounded-full" />
      <div className="flex-1 space-y-1.5">
        <Skeleton className="h-4 w-28 rounded-md" />
        <Skeleton className="h-3 w-40 rounded-md" />
      </div>
      <div className="space-y-1.5 text-right">
        <Skeleton className="h-4 w-24 rounded-md ml-auto" />
        <Skeleton className="h-3 w-16 rounded-md ml-auto" />
      </div>
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────

export function OrderHistory({
  pageSize = 20,
  className = "",
  showCard = true,
}: OrderHistoryProps) {
  const { orders, isLoading, error, refresh, loadMore, canLoadMore } =
    useOrderHistory(pageSize, 0, true);

  const content = (
    <div className="space-y-1">
      {/* Loading state */}
      {isLoading && !orders && (
        <div className="space-y-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <OrderSkeleton key={i} />
          ))}
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="bg-danger/10 border border-danger/20 rounded-lg p-4 text-center">
          <Icon
            icon="solar:danger-triangle-bold"
            className="w-8 h-8 text-danger mx-auto mb-2"
          />
          <p className="text-sm text-danger">{error}</p>
          <EsportsButton
            variant="ghost"
            size="sm"
            className="mt-3"
            onClick={refresh}
          >
            Retry
          </EsportsButton>
        </div>
      )}

      {/* Empty state */}
      {orders && orders.orders.length === 0 && !isLoading && (
        <div className="text-center py-8">
          <Icon
            icon="solar:history-bold-duotone"
            className="w-12 h-12 text-default-300 mx-auto mb-3"
          />
          <p className="text-sm text-default-400">No orders yet</p>
          <p className="text-xs text-default-500 mt-1">
            Your Bitcoin buy/sell orders will appear here
          </p>
        </div>
      )}

      {/* Order list */}
      {orders && orders.orders.length > 0 && (
        <>
          <div className="divide-y divide-content3">
            {orders.orders.map((order, index) => (
              <OrderRow key={order.order_id} order={order} index={index} />
            ))}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between pt-3">
            <span className="text-xs text-default-400">
              Showing {orders.orders.length} of {orders.total_count} orders
            </span>
            {canLoadMore && (
              <EsportsButton
                variant="ghost"
                size="sm"
                loading={isLoading}
                onClick={loadMore}
              >
                Load More
              </EsportsButton>
            )}
          </div>
        </>
      )}
    </div>
  );

  if (!showCard) return <div className={className}>{content}</div>;

  return (
    <Card className={`bg-content1 border border-content3 ${className}`}>
      <CardHeader className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon
            icon="solar:history-bold-duotone"
            className="w-5 h-5 text-primary"
          />
          <h3 className="text-lg font-semibold">Order History</h3>
          {orders && (
            <Chip size="sm" variant="flat" className="h-5 text-[10px]">
              {orders.total_count}
            </Chip>
          )}
        </div>
        <EsportsButton
          variant="ghost"
          size="sm"
          loading={isLoading}
          onClick={refresh}
          startContent={
            <Icon icon="solar:refresh-bold" className="w-3.5 h-3.5" />
          }
        >
          Refresh
        </EsportsButton>
      </CardHeader>
      <Divider />
      <CardBody>{content}</CardBody>
    </Card>
  );
}

/**
 * Exchange API Client
 * Server-side API client for BTC exchange operations
 * Used by Next.js API routes to proxy requests to replay-api backend
 */

import { getBackendUrl, SERVER_USER_AGENT } from "./backend-url";

// ─── Request Types ──────────────────────────────────────────────────────

export interface BuyBitcoinRequest {
  amount_usd: number;
  wallet_id: string;
  stripe_payment_method: string;
  quote_id?: string;
  idempotency_key: string;
}

export interface SellBitcoinRequest {
  amount_btc: number;
  wallet_id: string;
  quote_id?: string;
  idempotency_key: string;
}

export interface QuoteRequest {
  side: "BUY" | "SELL";
  amount_usd?: number;
  amount_btc?: number;
}

// ─── Response Types ─────────────────────────────────────────────────────

export interface BuyBitcoinResponse {
  order_id: string;
  status: string;
  amount_usd: number;
  estimated_btc: number;
  fee_usd: number;
  fee_percent: number;
  stripe_client_secret?: string;
  stripe_payment_intent_id?: string;
}

export interface SellBitcoinResponse {
  order_id: string;
  status: string;
  amount_btc: number;
  estimated_usd: number;
  fee_usd: number;
  fee_percent: number;
  net_proceeds_usd: number;
}

export interface QuoteResponse {
  quote_id: string;
  side: string;
  btc_price_usd: number;
  amount_usd: number;
  btc_amount: number;
  fee_percent: number;
  fee_amount_usd: number;
  total_cost_usd?: number;
  net_proceeds_usd?: number;
  expires_at: string;
  remaining_seconds: number;
  price_source: string;
  confidence: number;
}

export interface ExchangeRates {
  btc_usd: number;
  change_24h_percent?: number;
  high_24h?: number;
  low_24h?: number;
  volume_24h?: number;
  last_updated: string;
  sources: PriceSource[];
}

export interface PriceSource {
  provider: string;
  price: number;
  timestamp: string;
}

export interface OrderSummary {
  order_id: string;
  side: string;
  status: string;
  amount_usd: number;
  amount_btc: number;
  fee_usd: number;
  btc_price_usd: number;
  created_at: string;
  completed_at?: string;
}

export interface OrderHistory {
  orders: OrderSummary[];
  total_count: number;
  limit: number;
  offset: number;
}

export interface FeeSchedule {
  plan_tier: string;
  buy_fee_percent: number;
  sell_fee_percent: number;
  min_fee_usd: number;
  max_fee_usd: number;
}

// ─── API Client Functions ───────────────────────────────────────────────

/**
 * Buy Bitcoin with fiat via Stripe
 */
export async function buyBitcoin(
  token: string,
  req: BuyBitcoinRequest,
): Promise<BuyBitcoinResponse> {
  const response = await fetch(`${getBackendUrl()}/exchange/buy`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "User-Agent": SERVER_USER_AGENT,
      "X-Resource-Owner-ID": token,
    },
    body: JSON.stringify(req),
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ message: "Failed to buy Bitcoin" }));
    throw new Error(error.message || error.error || "Failed to buy Bitcoin");
  }

  return response.json();
}

/**
 * Sell Bitcoin for fiat
 */
export async function sellBitcoin(
  token: string,
  req: SellBitcoinRequest,
): Promise<SellBitcoinResponse> {
  const response = await fetch(`${getBackendUrl()}/exchange/sell`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "User-Agent": SERVER_USER_AGENT,
      "X-Resource-Owner-ID": token,
    },
    body: JSON.stringify(req),
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ message: "Failed to sell Bitcoin" }));
    throw new Error(error.message || error.error || "Failed to sell Bitcoin");
  }

  return response.json();
}

/**
 * Get a price quote for buying or selling BTC
 */
export async function getQuote(
  token: string,
  req: QuoteRequest,
): Promise<QuoteResponse> {
  const response = await fetch(`${getBackendUrl()}/exchange/quote`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "User-Agent": SERVER_USER_AGENT,
      "X-Resource-Owner-ID": token,
    },
    body: JSON.stringify(req),
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ message: "Failed to get quote" }));
    throw new Error(error.message || error.error || "Failed to get quote");
  }

  return response.json();
}

/**
 * Get current BTC/USD exchange rates (no auth required)
 */
export async function getExchangeRates(): Promise<ExchangeRates> {
  const response = await fetch(`${getBackendUrl()}/exchange/rates`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "User-Agent": SERVER_USER_AGENT,
    },
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ message: "Failed to get exchange rates" }));
    throw new Error(
      error.message || error.error || "Failed to get exchange rates",
    );
  }

  return response.json();
}

/**
 * Get user's exchange order history
 */
export async function getOrderHistory(
  token: string,
  limit: number = 20,
  offset: number = 0,
): Promise<OrderHistory> {
  const params = new URLSearchParams({
    limit: limit.toString(),
    offset: offset.toString(),
  });

  const response = await fetch(
    `${getBackendUrl()}/exchange/orders?${params.toString()}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": SERVER_USER_AGENT,
        "X-Resource-Owner-ID": token,
      },
    },
  );

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ message: "Failed to get order history" }));
    throw new Error(
      error.message || error.error || "Failed to get order history",
    );
  }

  return response.json();
}

/**
 * Cancel a pending exchange order
 */
export async function cancelOrder(
  token: string,
  orderId: string,
): Promise<void> {
  const response = await fetch(
    `${getBackendUrl()}/exchange/orders/${orderId}/cancel`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": SERVER_USER_AGENT,
        "X-Resource-Owner-ID": token,
      },
    },
  );

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ message: "Failed to cancel order" }));
    throw new Error(error.message || error.error || "Failed to cancel order");
  }
}

/**
 * Get fee schedule for the authenticated user's plan tier
 */
export async function getFeeSchedule(token: string): Promise<FeeSchedule> {
  const response = await fetch(`${getBackendUrl()}/exchange/fees`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "User-Agent": SERVER_USER_AGENT,
      "X-Resource-Owner-ID": token,
    },
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ message: "Failed to get fee schedule" }));
    throw new Error(
      error.message || error.error || "Failed to get fee schedule",
    );
  }

  return response.json();
}

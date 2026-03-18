/**
 * Wallet Withdraw API Route
 * POST - Withdraw funds from user's wallet
 *
 * Financial-grade security:
 * - Server-side auth header injection from verified session cookies
 * - Input validation (amount, currency, destination address, idempotency key)
 * - EVM address format validation
 * - Amount bounds checking (min/max)
 * - Rate limiting via global middleware
 * - Request signing via RequestSigningMiddleware on backend
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { logger } from "@/lib/logger";
import { getBackendUrl } from "@/lib/api/backend-url";
import { getAuthHeadersFromCookies } from "@/lib/auth/server-auth";
import { validateAmount, checkRateLimit, RATE_LIMITS } from "@/lib/security/validation";

export const dynamic = "force-dynamic";

/** Maximum single withdrawal amount in dollars */
const MAX_WITHDRAWAL_AMOUNT = 10000;
/** Minimum withdrawal amount in dollars */
const MIN_WITHDRAWAL_AMOUNT = 10;
/** Allowed currencies */
const ALLOWED_CURRENCIES = ["USD", "USDC", "USDT"];
/** EVM address regex for crypto withdrawals */
const EVM_ADDRESS_REGEX = /^0x[a-fA-F0-9]{40}$/;

/**
 * POST /api/wallet/withdraw - Withdraw funds from wallet
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 },
      );
    }

    const body = await request.json();

    // Rate limiting
    const rateLimited = checkRateLimit(session.user.email, RATE_LIMITS.withdraw);
    if (rateLimited) return rateLimited;

    let authHeaders = getAuthHeadersFromCookies();

    // Fallback to session RID/UID if cookies are missing
    if (!authHeaders["X-Resource-Owner-ID"] && session.user.rid) {
      authHeaders = {
        ...authHeaders,
        "X-Resource-Owner-ID": session.user.rid,
      };
    }


    // --- Input Validation (hardened) ---
    const amountCheck = validateAmount(body.amount, {
      min: MIN_WITHDRAWAL_AMOUNT,
      max: MAX_WITHDRAWAL_AMOUNT,
      fieldName: 'Withdrawal amount',
    });
    if (!amountCheck.valid) {
      return NextResponse.json(
        { success: false, error: amountCheck.error },
        { status: 400 },
      );
    }

    const currency = (body.currency || "USD").toUpperCase();
    if (!ALLOWED_CURRENCIES.includes(currency)) {
      return NextResponse.json(
        {
          success: false,
          error: `Currency must be one of: ${ALLOWED_CURRENCIES.join(", ")}`,
        },
        { status: 400 },
      );
    }

    // Validate destination address for crypto withdrawals
    if (body.to_address && !EVM_ADDRESS_REGEX.test(body.to_address)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid EVM address format. Must be 0x followed by 40 hex characters.",
        },
        { status: 400 },
      );
    }

    // Idempotency key is required for financial operations
    if (!body.idempotency_key) {
      return NextResponse.json(
        {
          success: false,
          error: "idempotency_key is required for withdrawals",
        },
        { status: 400 },
      );
    }

    logger.info("[API /api/wallet/withdraw] Processing withdrawal", {
      amount: body.amount,
      currency,
      hasIdempotencyKey: !!body.idempotency_key,
      hasToAddress: !!body.to_address,
      paymentMethod: body.payment_method,
      chainId: body.chain_id,
    });

    const response = await fetch(
      `${getBackendUrl()}/wallet/withdraw`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders,
        },
        body: JSON.stringify({
          amount: body.amount,
          currency,
          to_address: body.to_address,
          payment_method: body.payment_method,
          chain_id: body.chain_id,
          idempotency_key: body.idempotency_key,
          metadata: body.metadata,
          source_ip:
            request.headers.get("x-forwarded-for") ||
            request.headers.get("x-real-ip") ||
            "unknown",
          user_agent: request.headers.get("user-agent") || "unknown",
        }),
      },
    );

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ message: "Failed to process withdrawal" }));
      logger.error("[API /api/wallet/withdraw] Backend error", {
        status: response.status,
        error: errorData,
      });
      return NextResponse.json(
        {
          success: false,
          error: errorData.message || "Failed to process withdrawal",
        },
        { status: response.status },
      );
    }

    const data = await response.json();
    logger.info("[API /api/wallet/withdraw] Withdrawal processed", {
      transactionId: data.transaction_id || data.id,
    });

    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (error) {
    logger.error(
      "[API /api/wallet/withdraw] Error processing withdrawal",
      error,
    );
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to process withdrawal",
      },
      { status: 500 },
    );
  }
}

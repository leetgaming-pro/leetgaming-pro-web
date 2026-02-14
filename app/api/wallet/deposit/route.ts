/**
 * Wallet Deposit API Route
 * POST - Deposit funds into user's wallet
 *
 * Financial-grade security:
 * - Server-side auth header injection from verified session cookies
 * - Input validation (amount, currency, idempotency key)
 * - Rate limiting via global middleware
 * - Request signing via RequestSigningMiddleware on backend
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { logger } from "@/lib/logger";
import { ReplayApiSettingsMock } from "@/types/replay-api/settings";
import { getAuthHeadersFromCookies } from "@/lib/auth/server-auth";
import { validateAmount, checkRateLimit, RATE_LIMITS } from "@/lib/security/validation";

export const dynamic = "force-dynamic";

/** Maximum single deposit amount in dollars */
const MAX_DEPOSIT_AMOUNT = 10000;
/** Minimum deposit amount in dollars */
const MIN_DEPOSIT_AMOUNT = 1;
/** Allowed currencies */
const ALLOWED_CURRENCIES = ["USD", "USDC", "USDT"];

/**
 * POST /api/wallet/deposit - Deposit funds into wallet
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
    const rateLimited = checkRateLimit(session.user.email, RATE_LIMITS.deposit);
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
      min: MIN_DEPOSIT_AMOUNT,
      max: MAX_DEPOSIT_AMOUNT,
      fieldName: 'Deposit amount',
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

    // Idempotency key is required for financial operations to prevent duplicates
    if (!body.idempotency_key) {
      return NextResponse.json(
        { success: false, error: "idempotency_key is required for deposits" },
        { status: 400 },
      );
    }

    logger.info("[API /api/wallet/deposit] Processing deposit", {
      amount: body.amount,
      currency,
      hasIdempotencyKey: !!body.idempotency_key,
      paymentMethod: body.payment_method,
      chainId: body.chain_id,
    });

    const response = await fetch(
      `${ReplayApiSettingsMock.baseUrl}/wallet/deposit`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders,
        },
        body: JSON.stringify({
          amount: body.amount,
          currency,
          payment_method: body.payment_method,
          chain_id: body.chain_id,
          tx_hash: body.tx_hash,
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
        .catch(() => ({ message: "Failed to process deposit" }));
      logger.error("[API /api/wallet/deposit] Backend error", {
        status: response.status,
        error: errorData,
      });
      return NextResponse.json(
        {
          success: false,
          error: errorData.message || "Failed to process deposit",
        },
        { status: response.status },
      );
    }

    const data = await response.json();
    logger.info("[API /api/wallet/deposit] Deposit processed", {
      transactionId: data.transaction_id || data.id,
    });

    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (error) {
    logger.error("[API /api/wallet/deposit] Error processing deposit", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to process deposit",
      },
      { status: 500 },
    );
  }
}

/**
 * Exchange Buy API Route
 * POST - Buy Bitcoin with fiat via Stripe (authenticated)
 *
 * Financial-grade security:
 * - Server-side auth header injection from verified session cookies
 * - Input validation (amount, wallet_id, payment method, idempotency key)
 * - Rate limiting
 * - Request signing via RequestSigningMiddleware on backend
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { logger } from "@/lib/logger";
import { getBackendUrl } from "@/lib/api/backend-url";
import { getAuthHeadersFromCookies } from "@/lib/auth/server-auth";
import { validateAmount, checkRateLimit } from "@/lib/security/validation";

export const dynamic = "force-dynamic";

/** Maximum single buy amount in USD */
const MAX_BUY_AMOUNT = 100000;
/** Minimum buy amount in USD */
const MIN_BUY_AMOUNT = 1;

/**
 * POST /api/exchange/buy - Buy Bitcoin
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

    // Rate limiting: 5 buys per minute
    const rateLimited = checkRateLimit(session.user.email, {
      maxRequests: 5,
      windowMs: 60 * 1000,
      category: "exchange-buy",
    });
    if (rateLimited) return rateLimited;

    let authHeaders = getAuthHeadersFromCookies();

    // Fallback to session RID if cookies are missing
    if (!authHeaders["X-Resource-Owner-ID"] && session.user.rid) {
      authHeaders = {
        ...authHeaders,
        "X-Resource-Owner-ID": session.user.rid,
      };
    }

    // --- Input Validation ---
    const amountCheck = validateAmount(body.amount_usd, {
      min: MIN_BUY_AMOUNT,
      max: MAX_BUY_AMOUNT,
      fieldName: "Buy amount (USD)",
    });
    if (!amountCheck.valid) {
      return NextResponse.json(
        { success: false, error: amountCheck.error },
        { status: 400 },
      );
    }

    if (!body.wallet_id) {
      return NextResponse.json(
        { success: false, error: "wallet_id is required" },
        { status: 400 },
      );
    }

    if (!body.stripe_payment_method) {
      return NextResponse.json(
        { success: false, error: "stripe_payment_method is required" },
        { status: 400 },
      );
    }

    if (!body.idempotency_key) {
      return NextResponse.json(
        {
          success: false,
          error: "idempotency_key is required for buy orders",
        },
        { status: 400 },
      );
    }

    logger.info("[API /api/exchange/buy] Processing buy order", {
      amount_usd: body.amount_usd,
      hasQuoteId: !!body.quote_id,
      hasIdempotencyKey: !!body.idempotency_key,
    });

    const response = await fetch(`${getBackendUrl()}/exchange/buy`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders,
      },
      body: JSON.stringify({
        amount_usd: body.amount_usd,
        wallet_id: body.wallet_id,
        stripe_payment_method: body.stripe_payment_method,
        quote_id: body.quote_id,
        idempotency_key: body.idempotency_key,
        source_ip:
          request.headers.get("x-forwarded-for") ||
          request.headers.get("x-real-ip") ||
          "unknown",
        user_agent: request.headers.get("user-agent") || "unknown",
      }),
    });

    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ message: "Failed to buy Bitcoin" }));
      logger.error("[API /api/exchange/buy] Backend error", {
        status: response.status,
        error,
      });
      return NextResponse.json(
        {
          success: false,
          error: error.message || error.error || "Failed to buy Bitcoin",
        },
        { status: response.status },
      );
    }

    const data = await response.json();
    logger.info("[API /api/exchange/buy] Buy order created", {
      order_id: data.order_id,
      status: data.status,
    });

    return NextResponse.json(
      {
        success: true,
        data,
      },
      { status: 201 },
    );
  } catch (error) {
    logger.error("[API /api/exchange/buy] Error", error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to buy Bitcoin";
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 },
    );
  }
}

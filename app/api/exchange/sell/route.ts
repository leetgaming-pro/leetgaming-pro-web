/**
 * Exchange Sell API Route
 * POST - Sell Bitcoin for fiat (authenticated)
 *
 * Financial-grade security:
 * - Server-side auth header injection from verified session cookies
 * - Input validation (amount, wallet_id, idempotency key)
 * - Rate limiting
 * - Request signing via RequestSigningMiddleware on backend
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { logger } from "@/lib/logger";
import { getBackendUrl } from "@/lib/api/backend-url";
import { getAuthHeadersFromCookies } from "@/lib/auth/server-auth";
import { checkRateLimit } from "@/lib/security/validation";

export const dynamic = "force-dynamic";

/**
 * POST /api/exchange/sell - Sell Bitcoin
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

    // Rate limiting: 5 sells per minute
    const rateLimited = checkRateLimit(session.user.email, {
      maxRequests: 5,
      windowMs: 60 * 1000,
      category: "exchange-sell",
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
    if (
      body.amount_btc === undefined ||
      body.amount_btc === null ||
      typeof body.amount_btc !== "number" ||
      !Number.isFinite(body.amount_btc) ||
      body.amount_btc <= 0
    ) {
      return NextResponse.json(
        { success: false, error: "amount_btc must be a positive number" },
        { status: 400 },
      );
    }

    if (!body.wallet_id) {
      return NextResponse.json(
        { success: false, error: "wallet_id is required" },
        { status: 400 },
      );
    }

    if (!body.idempotency_key) {
      return NextResponse.json(
        {
          success: false,
          error: "idempotency_key is required for sell orders",
        },
        { status: 400 },
      );
    }

    logger.info("[API /api/exchange/sell] Processing sell order", {
      amount_btc: body.amount_btc,
      hasQuoteId: !!body.quote_id,
      hasIdempotencyKey: !!body.idempotency_key,
    });

    const response = await fetch(`${getBackendUrl()}/exchange/sell`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders,
      },
      body: JSON.stringify({
        amount_btc: body.amount_btc,
        wallet_id: body.wallet_id,
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
        .catch(() => ({ message: "Failed to sell Bitcoin" }));
      logger.error("[API /api/exchange/sell] Backend error", {
        status: response.status,
        error,
      });
      return NextResponse.json(
        {
          success: false,
          error: error.message || error.error || "Failed to sell Bitcoin",
        },
        { status: response.status },
      );
    }

    const data = await response.json();
    logger.info("[API /api/exchange/sell] Sell order created", {
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
    logger.error("[API /api/exchange/sell] Error", error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to sell Bitcoin";
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 },
    );
  }
}

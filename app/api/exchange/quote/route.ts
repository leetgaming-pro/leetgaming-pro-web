/**
 * Exchange Quote API Route
 * POST - Get a BTC exchange quote (authenticated)
 *
 * Security:
 * - Server-side auth header injection from verified session cookies
 * - Input validation (side, amount)
 * - Rate limiting via preconfigured limits
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { logger } from "@/lib/logger";
import { getBackendUrl } from "@/lib/api/backend-url";
import { getAuthHeadersFromCookies } from "@/lib/auth/server-auth";
import { validateAmount, checkRateLimit } from "@/lib/security/validation";

export const dynamic = "force-dynamic";

const VALID_SIDES = ["BUY", "SELL"];

/**
 * POST /api/exchange/quote - Get a BTC price quote
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

    // Rate limiting: 20 quotes per minute
    const rateLimited = checkRateLimit(session.user.email, {
      maxRequests: 20,
      windowMs: 60 * 1000,
      category: "exchange-quote",
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
    if (!body.side || !VALID_SIDES.includes(body.side)) {
      return NextResponse.json(
        { success: false, error: "side must be 'BUY' or 'SELL'" },
        { status: 400 },
      );
    }

    if (body.side === "BUY") {
      const amountCheck = validateAmount(body.amount_usd, {
        min: 1,
        max: 100000,
        fieldName: "Amount (USD)",
      });
      if (!amountCheck.valid) {
        return NextResponse.json(
          { success: false, error: amountCheck.error },
          { status: 400 },
        );
      }
    } else {
      if (
        body.amount_btc === undefined ||
        body.amount_btc === null ||
        typeof body.amount_btc !== "number" ||
        body.amount_btc <= 0
      ) {
        return NextResponse.json(
          { success: false, error: "amount_btc must be a positive number" },
          { status: 400 },
        );
      }
    }

    logger.info("[API /api/exchange/quote] Requesting quote", {
      side: body.side,
      amount_usd: body.amount_usd,
      amount_btc: body.amount_btc,
    });

    const response = await fetch(`${getBackendUrl()}/exchange/quote`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders,
      },
      body: JSON.stringify({
        side: body.side,
        amount_usd: body.amount_usd,
        amount_btc: body.amount_btc,
      }),
    });

    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ message: "Failed to get quote" }));
      logger.error("[API /api/exchange/quote] Backend error", {
        status: response.status,
        error,
      });
      return NextResponse.json(
        {
          success: false,
          error: error.message || error.error || "Failed to get quote",
        },
        { status: response.status },
      );
    }

    const data = await response.json();
    logger.info("[API /api/exchange/quote] Quote received", {
      quote_id: data.quote_id,
      side: data.side,
    });

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    logger.error("[API /api/exchange/quote] Error", error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to get quote";
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 },
    );
  }
}

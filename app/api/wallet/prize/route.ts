/**
 * Wallet Prize API Route
 * POST - Add prize winnings to user's wallet
 *
 * Financial-grade security:
 * - Server-side auth header injection
 * - Input validation (amount, match_id, placement, idempotency key)
 * - Escrow flow: releases funds from Prize Pool Escrow (ledger 2002)
 * - $50/day max daily prize winnings enforcement on backend
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { logger } from "@/lib/logger";
import { ReplayApiSettingsMock } from "@/types/replay-api/settings";
import { getAuthHeadersFromCookies } from "@/lib/auth/server-auth";
import { validateAmount, checkRateLimit, RATE_LIMITS } from "@/lib/security/validation";

export const dynamic = "force-dynamic";

/** Maximum single prize amount (defense-in-depth, backend also enforces $50/day) */
const MAX_PRIZE_AMOUNT = 5000;

/**
 * POST /api/wallet/prize - Add prize winnings to wallet
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
    const rateLimited = checkRateLimit(session.user.email, RATE_LIMITS.prize);
    if (rateLimited) return rateLimited;

    let authHeaders = getAuthHeadersFromCookies();

    if (!authHeaders["X-Resource-Owner-ID"] && session.user.rid) {
      authHeaders = {
        ...authHeaders,
        "X-Resource-Owner-ID": session.user.rid,
      };
    }


    // --- Input Validation (hardened) ---
    const amountCheck = validateAmount(body.amount, {
      min: 0.01,
      max: MAX_PRIZE_AMOUNT,
      fieldName: 'Prize amount',
    });
    if (!amountCheck.valid) {
      return NextResponse.json(
        { success: false, error: amountCheck.error },
        { status: 400 },
      );
    }

    if (!body.match_id) {
      return NextResponse.json(
        { success: false, error: "match_id is required" },
        { status: 400 },
      );
    }

    if (!body.idempotency_key) {
      return NextResponse.json(
        {
          success: false,
          error: "idempotency_key is required for prize distributions",
        },
        { status: 400 },
      );
    }

    logger.info("[API /api/wallet/prize] Processing prize distribution", {
      amount: body.amount,
      matchId: body.match_id,
      placement: body.placement,
      currency: body.currency,
    });

    const response = await fetch(
      `${ReplayApiSettingsMock.baseUrl}/wallet/prize`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders,
        },
        body: JSON.stringify({
          amount: body.amount,
          currency: body.currency || "USD",
          match_id: body.match_id,
          placement: body.placement,
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
        .catch(() => ({ message: "Failed to process prize distribution" }));
      logger.error("[API /api/wallet/prize] Backend error", {
        status: response.status,
        error: errorData,
      });
      return NextResponse.json(
        {
          success: false,
          error: errorData.message || "Failed to process prize distribution",
        },
        { status: response.status },
      );
    }

    const data = await response.json();
    logger.info("[API /api/wallet/prize] Prize distributed", {
      transactionId: data.transaction_id || data.id,
    });

    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (error) {
    logger.error(
      "[API /api/wallet/prize] Error processing prize distribution",
      error,
    );
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to process prize distribution",
      },
      { status: 500 },
    );
  }
}

/**
 * Wallet Entry Fee API Route
 * POST - Deduct entry fee from user's wallet for match participation
 *
 * Financial-grade security:
 * - Server-side auth header injection
 * - Input validation (amount, match_id, idempotency key)
 * - Escrow flow: entry fee is held in Prize Pool Escrow (ledger 2002)
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { logger } from "@/lib/logger";
import { ReplayApiSettingsMock } from "@/types/replay-api/settings";
import { getAuthHeadersFromCookies } from "@/lib/auth/server-auth";
import { validateAmount, checkRateLimit, RATE_LIMITS } from "@/lib/security/validation";

export const dynamic = "force-dynamic";

/** Maximum single entry fee (defense-in-depth) */
const MAX_ENTRY_FEE = 1000;

/**
 * POST /api/wallet/entry-fee - Deduct entry fee for match participation
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
    const rateLimited = checkRateLimit(session.user.email, RATE_LIMITS.entryFee);
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
      max: MAX_ENTRY_FEE,
      fieldName: 'Entry fee',
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
          error: "idempotency_key is required for entry fee deductions",
        },
        { status: 400 },
      );
    }

    logger.info("[API /api/wallet/entry-fee] Processing entry fee", {
      amount: body.amount,
      matchId: body.match_id,
      currency: body.currency,
    });

    const response = await fetch(
      `${ReplayApiSettingsMock.baseUrl}/wallet/entry-fee`,
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
        .catch(() => ({ message: "Failed to deduct entry fee" }));
      logger.error("[API /api/wallet/entry-fee] Backend error", {
        status: response.status,
        error: errorData,
      });
      return NextResponse.json(
        {
          success: false,
          error: errorData.message || "Failed to deduct entry fee",
        },
        { status: response.status },
      );
    }

    const data = await response.json();
    logger.info("[API /api/wallet/entry-fee] Entry fee deducted", {
      transactionId: data.transaction_id || data.id,
    });

    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (error) {
    logger.error(
      "[API /api/wallet/entry-fee] Error deducting entry fee",
      error,
    );
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to deduct entry fee",
      },
      { status: 500 },
    );
  }
}

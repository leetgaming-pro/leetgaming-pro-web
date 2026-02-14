/**
 * Refund Payment API Route
 * POST - Refund a payment (full or partial)
 *
 * Financial-grade security:
 * - Server-side auth header injection
 * - Refund amount validation
 * - Idempotent via backend TransactionCoordinator
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { logger } from "@/lib/logger";
import { ReplayApiSettingsMock } from "@/types/replay-api/settings";
import { getAuthHeadersFromCookies } from "@/lib/auth/server-auth";
import {
  validateAmount,
  checkRateLimit,
  RATE_LIMITS,
} from "@/lib/security/validation";

export const dynamic = "force-dynamic";

export async function POST(
  request: NextRequest,
  { params }: { params: { payment_id: string } },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 },
      );
    }

    const { payment_id } = params;
    const body = await request.json().catch(() => ({}));
    const authHeaders = getAuthHeadersFromCookies();

    // Rate limiting
    const rateLimited = checkRateLimit(session.user.email, RATE_LIMITS.refund);
    if (rateLimited) return rateLimited;

    // Validate refund amount if provided (partial refund)
    if (body.amount !== undefined) {
      const amountCheck = validateAmount(body.amount, {
        min: 0.01,
        max: 10000,
        fieldName: "Refund amount",
      });
      if (!amountCheck.valid) {
        return NextResponse.json(
          { success: false, error: amountCheck.error },
          { status: 400 },
        );
      }
    }

    logger.info("[API /api/payments/:id/refund] Processing refund", {
      payment_id,
      amount: body.amount,
      reason: body.reason,
    });

    const response = await fetch(
      `${ReplayApiSettingsMock.baseUrl}/payments/${payment_id}/refund`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders,
        },
        body: JSON.stringify({
          amount: body.amount,
          reason: body.reason,
        }),
      },
    );

    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ message: "Failed to refund payment" }));
      logger.error("[API /api/payments/:id/refund] Backend error", {
        status: response.status,
        error,
        payment_id,
      });
      return NextResponse.json(
        {
          success: false,
          error: error.message || error.error || "Failed to refund payment",
        },
        { status: response.status },
      );
    }

    const data = await response.json();
    logger.info("[API /api/payments/:id/refund] Payment refunded", {
      payment_id,
    });

    return NextResponse.json({ success: true, data });
  } catch (error) {
    logger.error(
      `[API /api/payments/${params.payment_id}/refund] Error refunding payment`,
      error,
    );
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to refund payment",
      },
      { status: 500 },
    );
  }
}

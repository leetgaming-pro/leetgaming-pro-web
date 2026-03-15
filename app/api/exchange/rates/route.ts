/**
 * Exchange Rates API Route
 * GET - Get current BTC/USD exchange rates (unauthenticated)
 *
 * This is a public endpoint - no session required.
 * Proxies to replay-api /exchange/rates
 */

import { NextRequest, NextResponse } from "next/server";
import { logger } from "@/lib/logger";
import { getBackendUrl } from "@/lib/api/backend-url";

export const dynamic = "force-dynamic";

/**
 * GET /api/exchange/rates - Get current BTC/USD exchange rates
 */
export async function GET(_request: NextRequest) {
  try {
    const response = await fetch(`${getBackendUrl()}/exchange/rates`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      // Cache for 5 seconds to avoid hammering the backend
      next: { revalidate: 5 },
    });

    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ message: "Failed to get exchange rates" }));
      logger.error("[API /api/exchange/rates] Backend error", {
        status: response.status,
        error,
      });
      return NextResponse.json(
        {
          success: false,
          error:
            error.message || error.error || "Failed to get exchange rates",
        },
        { status: response.status },
      );
    }

    const data = await response.json();

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    logger.error("[API /api/exchange/rates] Error", error);
    const errorMessage =
      error instanceof Error
        ? error.message
        : "Failed to get exchange rates";
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 },
    );
  }
}

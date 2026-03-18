/**
 * Wallet Balance API Route
 * GET - Get user's wallet balance
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { logger } from "@/lib/logger";
import { getBackendUrl } from "@/lib/api/backend-url";
import { getAuthHeadersFromCookies } from "@/lib/auth/server-auth";
import type { UserWallet } from "@/types/replay-api/wallet.types";

export const dynamic = "force-dynamic";

/**
 * GET /api/wallet/balance - Get user's wallet balance
 */
export async function GET(_request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 },
      );
    }

    // Get auth headers from cookies first, then fallback to session
    let authHeaders = getAuthHeadersFromCookies();

    // If no RID in cookies, use session RID (set by NextAuth callback)
    if (!authHeaders["X-Resource-Owner-ID"] && session.user.rid) {
      authHeaders = {
        ...authHeaders,
        "X-Resource-Owner-ID": session.user.rid,
      };
      logger.info(
        "[API /api/wallet/balance] Using session RID instead of cookie",
      );
    }

    const backendUrl = getBackendUrl();
    logger.info("[API /api/wallet/balance] Fetching wallet balance", {
      hasRID: !!authHeaders["X-Resource-Owner-ID"],
      backendUrl,
    });

    // Forward request to replay-api backend with timeout
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    let response: Response;
    try {
      response = await fetch(
        `${backendUrl}/wallet/balance`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            ...authHeaders,
          },
          signal: controller.signal,
        },
      );
    } catch (fetchErr) {
      clearTimeout(timeout);
      const isTimeout = fetchErr instanceof Error && fetchErr.name === "AbortError";
      const errMsg = isTimeout
        ? `Backend timeout after 10s (${backendUrl})`
        : `Backend unreachable: ${fetchErr instanceof Error ? fetchErr.message : String(fetchErr)} (${backendUrl})`;
      logger.error("[API /api/wallet/balance] " + errMsg);
      return NextResponse.json(
        { success: false, error: errMsg },
        { status: 502 },
      );
    } finally {
      clearTimeout(timeout);
    }

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ message: "Failed to get wallet balance" }));
      logger.error("[API /api/wallet/balance] Backend error", {
        status: response.status,
        error: errorData,
      });

      return NextResponse.json(
        {
          success: false,
          error: errorData.message || "Failed to get wallet balance",
        },
        { status: response.status },
      );
    }

    const data: UserWallet = await response.json();

    logger.info("[API /api/wallet/balance] Wallet balance retrieved", {
      wallet_id: data.wallet_id || data.id,
    });

    return NextResponse.json(data);
  } catch (error) {
    logger.error(
      "[API /api/wallet/balance] Error getting wallet balance",
      error,
    );
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to get wallet balance",
      },
      { status: 500 },
    );
  }
}

/**
 * Exchange Fees API Route
 * GET - Get fee schedule for the authenticated user (authenticated)
 *
 * Returns the user's fee tier based on their subscription plan.
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { logger } from "@/lib/logger";
import { getBackendUrl } from "@/lib/api/backend-url";
import { getAuthHeadersFromCookies } from "@/lib/auth/server-auth";

export const dynamic = "force-dynamic";

/**
 * GET /api/exchange/fees - Get user's fee schedule
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

    let authHeaders = getAuthHeadersFromCookies();

    // Fallback to session RID if cookies are missing
    if (!authHeaders["X-Resource-Owner-ID"] && session.user.rid) {
      authHeaders = {
        ...authHeaders,
        "X-Resource-Owner-ID": session.user.rid,
      };
    }

    const response = await fetch(`${getBackendUrl()}/exchange/fees`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders,
      },
    });

    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ message: "Failed to get fee schedule" }));
      logger.error("[API /api/exchange/fees] Backend error", {
        status: response.status,
        error,
      });
      return NextResponse.json(
        {
          success: false,
          error:
            error.message || error.error || "Failed to get fee schedule",
        },
        { status: response.status },
      );
    }

    const data = await response.json();
    logger.info("[API /api/exchange/fees] Retrieved fee schedule");

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    logger.error("[API /api/exchange/fees] Error", error);
    const errorMessage =
      error instanceof Error
        ? error.message
        : "Failed to get fee schedule";
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 },
    );
  }
}

/**
 * Exchange Orders API Route
 * GET - Get user's exchange order history (authenticated)
 *
 * Security:
 * - Server-side auth header injection from verified session cookies
 * - Pagination validation
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { logger } from "@/lib/logger";
import { getBackendUrl } from "@/lib/api/backend-url";
import { getAuthHeadersFromCookies } from "@/lib/auth/server-auth";

export const dynamic = "force-dynamic";

/**
 * GET /api/exchange/orders - Get exchange order history
 */
export async function GET(request: NextRequest) {
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

    // Parse pagination params
    const { searchParams } = new URL(request.url);
    const limit = Math.min(
      Math.max(parseInt(searchParams.get("limit") || "20", 10), 1),
      100,
    );
    const offset = Math.max(
      parseInt(searchParams.get("offset") || "0", 10),
      0,
    );

    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
    });

    const response = await fetch(
      `${getBackendUrl()}/exchange/orders?${params.toString()}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders,
        },
      },
    );

    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ message: "Failed to get order history" }));
      logger.error("[API /api/exchange/orders] Backend error", {
        status: response.status,
        error,
      });
      return NextResponse.json(
        {
          success: false,
          error:
            error.message || error.error || "Failed to get order history",
        },
        { status: response.status },
      );
    }

    const data = await response.json();
    logger.info("[API /api/exchange/orders] Retrieved order history");

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    logger.error("[API /api/exchange/orders] Error", error);
    const errorMessage =
      error instanceof Error
        ? error.message
        : "Failed to get order history";
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 },
    );
  }
}

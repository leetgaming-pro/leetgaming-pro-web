/**
 * Wallet Create API Route
 * POST - Create a new wallet for the authenticated user
 *
 * Financial-grade security: Server-side proxy ensures auth headers
 * are derived from verified session cookies, not client-supplied values.
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { logger } from "@/lib/logger";
import { getBackendUrl } from "@/lib/api/backend-url";
import { getAuthHeadersFromCookies } from "@/lib/auth/server-auth";

export const dynamic = "force-dynamic";

/**
 * POST /api/wallet/create - Create a new wallet
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

    const body = await request.json().catch(() => ({}));
    let authHeaders = getAuthHeadersFromCookies();

    // Fallback to session RID/UID if cookies are missing
    if (!authHeaders["X-Resource-Owner-ID"] && session.user.rid) {
      authHeaders = {
        ...authHeaders,
        "X-Resource-Owner-ID": session.user.rid,
      };
    }


    logger.info("[API /api/wallet/create] Creating wallet", {
      hasRID: !!authHeaders["X-Resource-Owner-ID"],
    });

    const response = await fetch(`${getBackendUrl()}/wallet`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders,
      },
      body: JSON.stringify({
        currency: body.currency || "USD",
        chain_id: body.chain_id,
      }),
    });

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ message: "Failed to create wallet" }));
      logger.error("[API /api/wallet/create] Backend error", {
        status: response.status,
        error: errorData,
      });
      return NextResponse.json(
        {
          success: false,
          error: errorData.message || "Failed to create wallet",
        },
        { status: response.status },
      );
    }

    const data = await response.json();
    logger.info("[API /api/wallet/create] Wallet created", {
      wallet_id: data.wallet_id || data.id,
    });

    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (error) {
    logger.error("[API /api/wallet/create] Error creating wallet", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to create wallet",
      },
      { status: 500 },
    );
  }
}

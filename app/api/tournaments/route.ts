/**
 * Tournaments API Route (List + Create)
 * GET  - List tournaments with optional filters
 * POST - Create a new tournament (auth required)
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { logger } from "@/lib/logger";
import { ReplayApiSettingsMock } from "@/types/replay-api/settings";
import { getAuthHeadersFromCookies } from "@/lib/auth/server-auth";

export const dynamic = "force-dynamic";

async function getAuthHeaders() {
  const session = await getServerSession(authOptions);
  let authHeaders = getAuthHeadersFromCookies();

  if (!authHeaders["X-Resource-Owner-ID"] && session?.user?.rid) {
    authHeaders = { ...authHeaders, "X-Resource-Owner-ID": session.user.rid };
  }

  return { session, authHeaders };
}

/**
 * GET /api/tournaments - List tournaments
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const queryString = searchParams.toString();
    const url = queryString
      ? `${ReplayApiSettingsMock.baseUrl}/tournaments?${queryString}`
      : `${ReplayApiSettingsMock.baseUrl}/tournaments`;

    const { authHeaders } = await getAuthHeaders();

    const response = await fetch(url, {
      method: "GET",
      headers: { "Content-Type": "application/json", ...authHeaders },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: "Failed to list tournaments" }));
      return NextResponse.json(
        { success: false, error: errorData.message || "Failed to list tournaments" },
        { status: response.status },
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    logger.error("[API /api/tournaments] Error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}

/**
 * POST /api/tournaments - Create tournament (auth required)
 */
export async function POST(request: NextRequest) {
  try {
    const { session, authHeaders } = await getAuthHeaders();

    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 },
      );
    }

    const body = await request.json();

    logger.info("[API /api/tournaments] Creating tournament", {
      name: body.name,
      hasRID: !!authHeaders["X-Resource-Owner-ID"],
    });

    const response = await fetch(`${ReplayApiSettingsMock.baseUrl}/tournaments`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: "Failed to create tournament" }));
      return NextResponse.json(
        { success: false, error: errorData.message || "Failed to create tournament" },
        { status: response.status },
      );
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    logger.error("[API /api/tournaments] Create error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}

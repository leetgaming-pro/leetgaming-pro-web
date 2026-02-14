/**
 * Tournament Detail API Route
 * GET    - Get tournament by ID
 * PUT    - Update tournament (auth required)
 * DELETE - Delete tournament (auth required)
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
 * GET /api/tournaments/[id]
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const { authHeaders } = await getAuthHeaders();

    const response = await fetch(
      `${ReplayApiSettingsMock.baseUrl}/tournaments/${params.id}`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json", ...authHeaders },
      },
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: "Tournament not found" }));
      return NextResponse.json(
        { success: false, error: errorData.message || "Tournament not found" },
        { status: response.status },
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    logger.error(`[API /api/tournaments/${params.id}] Error:`, error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}

/**
 * PUT /api/tournaments/[id] - Update tournament (auth required)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const { session, authHeaders } = await getAuthHeaders();

    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 },
      );
    }

    const body = await request.json();

    const response = await fetch(
      `${ReplayApiSettingsMock.baseUrl}/tournaments/${params.id}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...authHeaders },
        body: JSON.stringify(body),
      },
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: "Failed to update tournament" }));
      return NextResponse.json(
        { success: false, error: errorData.message || "Failed to update tournament" },
        { status: response.status },
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    logger.error(`[API /api/tournaments/${params.id}] Update error:`, error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/tournaments/[id] - Delete tournament (auth required)
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const { session, authHeaders } = await getAuthHeaders();

    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 },
      );
    }

    const response = await fetch(
      `${ReplayApiSettingsMock.baseUrl}/tournaments/${params.id}`,
      {
        method: "DELETE",
        headers: { "Content-Type": "application/json", ...authHeaders },
      },
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: "Failed to delete tournament" }));
      return NextResponse.json(
        { success: false, error: errorData.message || "Failed to delete tournament" },
        { status: response.status },
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    logger.error(`[API /api/tournaments/${params.id}] Delete error:`, error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}

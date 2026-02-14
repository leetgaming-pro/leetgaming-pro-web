/**
 * Tournament Cancel API Route
 * POST - Cancel a tournament with reason (auth required, organizer only)
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { logger } from "@/lib/logger";
import { ReplayApiSettingsMock } from "@/types/replay-api/settings";
import { getAuthHeadersFromCookies } from "@/lib/auth/server-auth";

export const dynamic = "force-dynamic";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 });
    }

    let authHeaders = getAuthHeadersFromCookies();
    if (!authHeaders["X-Resource-Owner-ID"] && session.user.rid) {
      authHeaders = { ...authHeaders, "X-Resource-Owner-ID": session.user.rid };
    }

    const body = await request.json();

    const response = await fetch(
      `${ReplayApiSettingsMock.baseUrl}/tournaments/${params.id}/cancel`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders },
        body: JSON.stringify(body),
      },
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: "Failed to cancel tournament" }));
      return NextResponse.json(
        { success: false, error: errorData.message || "Failed to cancel tournament" },
        { status: response.status },
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    logger.error(`[API /api/tournaments/${params.id}/cancel] Error:`, error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

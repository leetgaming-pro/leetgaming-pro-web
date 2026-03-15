/**
 * Game Connection Info API Route
 * GET - Get game server connection details (available after all players confirm readiness)
 */

import { NextRequest, NextResponse } from "next/server";
import { createAuthenticatedSDK } from "@/lib/api/sdk-factory";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { logger } from "@/lib/logger";
import { getAuthContextFromRequest } from "@/lib/auth/server-auth";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: { lobby_id: string } },
) {
  try {
    const session = await getServerSession(authOptions);
    const { isAuthenticated } = getAuthContextFromRequest(session);
    if (!isAuthenticated) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 },
      );
    }

    const { lobby_id } = params;

    const sdk = createAuthenticatedSDK(session);
    const result = await sdk.lobbies.getGameConnectionInfo(lobby_id);

    if (!result) {
      return NextResponse.json(
        { success: false, error: "Connection info not available" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    logger.error(
      `[API /api/match-making/lobbies/${params.lobby_id}/connection-info] Error`,
      error,
    );
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to get connection info",
      },
      { status: 500 },
    );
  }
}

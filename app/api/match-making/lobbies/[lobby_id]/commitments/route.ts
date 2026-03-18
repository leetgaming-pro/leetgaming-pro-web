/**
 * Lobby Commitments API Route
 * GET - Get commitment/readiness summary for a lobby
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
    const result = await sdk.lobbies.getCommitmentSummary(lobby_id);

    if (!result) {
      return NextResponse.json(
        { success: false, error: "Commitment summary not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    logger.error(
      `[API /api/match-making/lobbies/${params.lobby_id}/commitments] Error`,
      error,
    );
    const status = (error as Record<string, unknown>)?.status;
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to get commitment summary",
      },
      { status: typeof status === "number" && status >= 400 ? status : 500 },
    );
  }
}

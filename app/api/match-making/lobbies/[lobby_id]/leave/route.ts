/**
 * Leave Lobby API Route
 * DELETE - Leave a lobby
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { createAuthenticatedSDK } from "@/lib/api/sdk-factory";
import { logger } from "@/lib/logger";
import { getAuthContextFromRequest } from "@/lib/auth/server-auth";

export const dynamic = "force-dynamic";

export async function DELETE(
  request: NextRequest,
  { params }: { params: { lobby_id: string } },
) {
  try {
    const session = await getServerSession(authOptions);
    const { isAuthenticated } = getAuthContextFromRequest(session);
    if (!isAuthenticated) {
      return NextResponse.json(
        {
          success: false,
          error: "Authentication required",
        },
        { status: 401 },
      );
    }

    const { lobby_id } = params;
    const body = await request.json().catch(() => ({}));

    const sdk = createAuthenticatedSDK(session);
    await sdk.lobbies.leaveLobby(lobby_id, body);

    return NextResponse.json({
      success: true,
      message: "Left lobby successfully",
    });
  } catch (error) {
    logger.error(
      `[API /api/matchmaking/lobbies/${params.lobby_id}/leave] Error leaving lobby`,
      error,
    );
    const status = (error as Record<string, unknown>)?.status;
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to leave lobby",
      },
      { status: typeof status === "number" && status >= 400 ? status : 500 },
    );
  }
}

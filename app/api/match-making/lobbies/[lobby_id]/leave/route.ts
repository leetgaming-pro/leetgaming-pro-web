/**
 * Leave Lobby API Route
 * DELETE - Leave a lobby
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { createAuthenticatedSDK } from "@/lib/api/sdk-factory";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

export async function DELETE(
  request: NextRequest,
  { params }: { params: { lobby_id: string } },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
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

    const sdk = createAuthenticatedSDK();
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
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to leave lobby",
      },
      { status: 500 },
    );
  }
}

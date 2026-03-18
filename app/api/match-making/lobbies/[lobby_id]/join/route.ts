/**
 * Join Lobby API Route
 * POST - Join an existing lobby
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { createAuthenticatedSDK } from "@/lib/api/sdk-factory";
import { logger } from "@/lib/logger";
import { getAuthContextFromRequest } from "@/lib/auth/server-auth";

export const dynamic = "force-dynamic";

export async function POST(
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
    const body = await request.json();

    const sdk = createAuthenticatedSDK(session);
    const result = await sdk.lobbies.joinLobby(lobby_id, body);

    if (!result) {
      return NextResponse.json(
        {
          success: false,
          error: "Failed to join lobby",
        },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    logger.error(
      `[API /api/matchmaking/lobbies/${params.lobby_id}/join] Error joining lobby`,
      error,
    );
    const status = (error as Record<string, unknown>)?.status;
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to join lobby",
      },
      { status: typeof status === "number" && status >= 400 ? status : 500 },
    );
  }
}

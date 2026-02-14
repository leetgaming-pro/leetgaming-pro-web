/**
 * Matchmaking Lobbies API Routes
 * GET - List available lobbies
 * POST - Create a new lobby
 *
 * Supports multi-region with region filtering
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { createAuthenticatedSDK, createPublicSDK } from "@/lib/api/sdk-factory";
import { logger } from "@/lib/logger";
import type { LobbyStatus } from "@/types/replay-api/lobby.types";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Use public SDK for listing (visibility filtering happens on backend)
    const sdk = createPublicSDK();
    const result = await sdk.lobbies.listLobbies({
      game_id: searchParams.get("game_id") || undefined,
      game_mode: searchParams.get("game_mode") || undefined,
      region: searchParams.get("region") || undefined,
      status: (searchParams.get("status") as LobbyStatus) || undefined,
      limit: parseInt(searchParams.get("limit") || "20"),
      offset: parseInt(searchParams.get("offset") || "0"),
    });

    return NextResponse.json(
      {
        success: true,
        data: result?.lobbies || [],
        pagination: {
          total: result?.total || 0,
          hasMore: result?.has_more || false,
        },
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=10, stale-while-revalidate=20",
        },
      },
    );
  } catch (error) {
    logger.error("[API /api/matchmaking/lobbies] Error listing lobbies", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to list lobbies",
      },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
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

    const body = await request.json();

    // Use authenticated SDK for creating lobbies (requires user context)
    const sdk = createAuthenticatedSDK();
    const result = await sdk.lobbies.createLobby(body);

    if (!result) {
      return NextResponse.json(
        {
          success: false,
          error: "Failed to create lobby",
        },
        { status: 500 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: result,
      },
      { status: 201 },
    );
  } catch (error) {
    logger.error("[API /api/matchmaking/lobbies] Error creating lobby", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to create lobby",
      },
      { status: 500 },
    );
  }
}

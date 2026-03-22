/**
 * Players API Route Handler
 * GET /api/players - Search players
 * POST /api/players - Create player profile
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import { logger } from "@/lib/logger";
import { createAuthenticatedSDK } from "@/lib/api/sdk-factory";

/**
 * GET /api/players
 * Search/list players with filters
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const sdk = createAuthenticatedSDK(session);
    const { searchParams } = new URL(request.url);

    const filters: {
      game_id?: string;
      nickname?: string;
    } = {};

    const gameId = searchParams.get("game_id");
    const nickname = searchParams.get("nickname") || searchParams.get("q");

    if (gameId) filters.game_id = gameId;
    if (nickname) filters.nickname = nickname;

    const players = await sdk.playerProfiles.searchPlayerProfiles(filters);

    return NextResponse.json({ success: true, data: players }, { status: 200 });
  } catch (error) {
    logger.error("[API /api/players] Players search error:", error);
    const status = (error as Record<string, unknown>)?.status;
    return NextResponse.json(
      { success: false, error: "Failed to search players" },
      { status: typeof status === "number" && status >= 400 ? status : 500 },
    );
  }
}

/**
 * POST /api/players
 * Create a new player profile (requires authentication)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 },
      );
    }

    const sdk = createAuthenticatedSDK(session);
    const body = await request.json();

    const profile = await sdk.playerProfiles.createPlayerProfile({
      game_id: body.game_id,
      nickname: body.nickname,
      slug_uri: body.slug_uri,
      avatar_uri: body.avatar_uri,
      roles: body.roles,
      description: body.description,
    });

    if (!profile) {
      return NextResponse.json(
        { success: false, error: "Failed to create player profile" },
        { status: 400 },
      );
    }

    return NextResponse.json({ success: true, data: profile }, { status: 201 });
  } catch (error) {
    logger.error("[API /api/players] Create player error:", error);
    const status = (error as Record<string, unknown>)?.status;
    const apiError = (error as Record<string, unknown>)?.apiError;
    const message = error instanceof Error ? error.message : "Failed to create player profile";

    // Map "already exists" errors to user-friendly responses
    if (message.toLowerCase().includes("already exists") || status === 409) {
      return NextResponse.json(
        {
          success: false,
          error: message,
          ...(apiError ? { apiError } : {}),
        },
        { status: 409 },
      );
    }

    if (status === 401 || message.toLowerCase().includes("unauthorized")) {
      return NextResponse.json(
        { success: false, error: "Your session has expired. Please sign in again." },
        { status: 401 },
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: message,
        ...(apiError ? { apiError } : {}),
      },
      { status: typeof status === "number" && status >= 400 ? status : 500 },
    );
  }
}

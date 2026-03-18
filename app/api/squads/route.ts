/**
 * Squads API Routes
 * GET - Search/list squads (public)
 * POST - Create a new squad (authenticated)
 *
 * Properly forwards auth context to backend SDK
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { createAuthenticatedSDK } from "@/lib/api/sdk-factory";
import { hasValidRIDToken } from "@/lib/auth/server-auth";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const session = await getServerSession(authOptions);
    const sdk = createAuthenticatedSDK(session);

    const filters: { game_id?: string; name?: string; page?: number; limit?: number } = {
      page: parseInt(searchParams.get("page") || "1"),
      limit: parseInt(searchParams.get("limit") || "20"),
    };

    const gameId = searchParams.get("game_id");
    if (gameId) filters.game_id = gameId;

    const name = searchParams.get("name") || searchParams.get("q");
    if (name) filters.name = name;

    const squads = await sdk.squads.searchSquads(filters);

    return NextResponse.json(
      {
        success: true,
        data: squads || [],
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
        },
      },
    );
  } catch (error) {
    logger.error("[API /api/squads] Error searching squads", error);
    const status = (error as Record<string, unknown>)?.status;
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to search squads",
      },
      { status: typeof status === "number" && status >= 400 ? status : 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user has valid (non-expired) token
    if (!hasValidRIDToken()) {
      return NextResponse.json(
        {
          success: false,
          error: "Authentication required",
        },
        { status: 401 },
      );
    }

    const sdk = createAuthenticatedSDK(session);
    const body = await request.json();

    // Validate required fields
    if (!body.name || body.name.trim() === "") {
      return NextResponse.json(
        {
          success: false,
          error: "Squad name is required",
        },
        { status: 400 },
      );
    }

    const squad = await sdk.squads.createSquad({
      game_id: body.game_id || "cs2",
      name: body.name,
      symbol: body.symbol || "",
      description: body.description || "",
      slug_uri: body.slug_uri || "",
      logo_uri: body.logo_uri || "",
      visibility_type: body.visibility_type || "public",
    });

    if (!squad) {
      return NextResponse.json(
        {
          success: false,
          error: "Failed to create squad",
        },
        { status: 500 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: squad,
      },
      { status: 201 },
    );
  } catch (error) {
    logger.error("[API /api/squads] Error creating squad", error);
    const status = (error as Record<string, unknown>)?.status;
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to create squad",
      },
      { status: typeof status === "number" && status >= 400 ? status : 500 },
    );
  }
}

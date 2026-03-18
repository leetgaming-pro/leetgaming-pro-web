/**
 * Current User Player Profile API Route
 * GET /api/players/me - Get current user's player profile(s)
 *
 * Supports multi-profile system where a user can have one profile per game.
 * Query params:
 *   - game_id: Filter to specific game profile (returns single profile)
 *   - all: Return all profiles for the user (array)
 *
 * Without params: Returns the first/primary profile (backwards compatible)
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";
import {
  forwardAuthenticatedRequest,
  getUserIdFromToken,
} from "@/lib/auth/server-auth";
import { getBackendUrl } from "@/lib/api/backend-url";

export const dynamic = "force-dynamic";

const BACKEND_URL = getBackendUrl();

/**
 * GET /api/players/me
 * Get current user's player profile(s)
 *
 * Query params:
 *   - game_id: Get profile for specific game (e.g., cs2, valorant)
 *   - all=true: Return all profiles for the user
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 },
      );
    }

    // Get user ID from token for user-specific query
    let userId = getUserIdFromToken();

    // Fallback to session UID when RID cookie is expired/missing
    if (!userId && session.user.uid) {
      userId = session.user.uid;
      console.info("[API /api/players/me] Using session UID instead of cookie");
    }

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "User ID not found in token" },
        { status: 401 },
      );
    }

    // Parse query params
    const { searchParams } = new URL(request.url);
    const gameId = searchParams.get("game_id");
    const returnAll = searchParams.get("all") === "true";

    // Build backend query URL with user filter
    // Use ResourceOwner.UserID to filter profiles for current user
    const params = new URLSearchParams();
    params.append("ResourceOwner.UserID", userId);

    if (gameId) {
      params.append("GameID", gameId);
    }

    // Get all profiles for the user
    const response = await forwardAuthenticatedRequest(
      `${BACKEND_URL}/players?${params.toString()}`,
      {
        method: "GET",
      },
      session,
    );

    if (!response.ok && response.status !== 404) {
      const errorText = await response.text();
      console.error("[API] Backend error:", errorText);
      return NextResponse.json(
        { success: false, error: "Failed to fetch profiles" },
        { status: response.status },
      );
    }

    let profiles = [];
    if (response.ok) {
      const data = await response.json();
      profiles = Array.isArray(data) ? data : data?.data || [];
    }

    // Return all profiles or just the first one (backwards compatible)
    if (returnAll) {
      return NextResponse.json(
        { success: true, data: profiles },
        { status: 200 },
      );
    }

    // Return single profile (first match or null)
    const profile = profiles.length > 0 ? profiles[0] : null;

    return NextResponse.json({ success: true, data: profile }, { status: 200 });
  } catch (error) {
    console.error("[API] Get my player profile error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to get player profile" },
      { status: 500 },
    );
  }
}

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
import { getAuthContextFromRequest } from "@/lib/auth/server-auth";
import { logger } from "@/lib/logger";
import crypto from "crypto";
import { getBackendUrl } from "@/lib/api/backend-url";

/**
 * Attempt to get a fresh RID token by re-authenticating with the backend.
 * This handles the case where the RID token has expired (1-hour lifetime)
 * but the NextAuth session is still valid (7-day lifetime).
 */
async function refreshRIDFromSession(
  session: { user?: { email?: string | null; name?: string | null; rid?: string; uid?: string; google?: { sub?: string; email?: string }; steam?: { steamid?: string; personaname?: string } } } | null
): Promise<string | null> {
  if (!session?.user) return null;

  const backendUrl = getBackendUrl();
  const salt = process.env.STEAM_VHASH_SOURCE || "";

  try {
    // Try Google onboarding
    const googleEmail = (session.user as any).google?.email || session.user?.email;
    if (googleEmail) {
      const vHash = crypto.createHash("sha256").update(`${googleEmail}${salt}`).digest("hex");
      const resp = await fetch(`${backendUrl}/onboarding/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: googleEmail, name: session.user.name, v_hash: vHash }),
      });
      if (resp.ok) {
        const rid = resp.headers.get("X-Resource-Owner-ID");
        if (rid) return rid;
      }
    }

    // Try Steam onboarding
    const steamId = (session.user as any).steam?.steamid;
    if (steamId) {
      const vHash = crypto.createHash("sha256").update(`${steamId}${salt}`).digest("hex");
      const resp = await fetch(`${backendUrl}/onboarding/steam`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ steam: { id: steamId }, v_hash: vHash }),
      });
      if (resp.ok) {
        const rid = resp.headers.get("X-Resource-Owner-ID");
        if (rid) return rid;
      }
    }
  } catch (err) {
    logger.warn("[API /api/squads] RID refresh attempt failed", err);
  }

  return null;
}

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

    // Check if user is authenticated via RID token cookie OR valid NextAuth session
    const { isAuthenticated } = getAuthContextFromRequest(session);
    if (!isAuthenticated) {
      return NextResponse.json(
        {
          success: false,
          error: "Authentication required. Please sign in and try again.",
        },
        { status: 401 },
      );
    }

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

    // Ensure slug_uri is not empty (backend requires >= 3 chars)
    if (!body.slug_uri || body.slug_uri.trim().length < 3) {
      const autoSlug = body.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
      if (autoSlug.length < 3) {
        return NextResponse.json(
          {
            success: false,
            error: "Squad URL slug must be at least 3 characters. Please use a longer squad name.",
          },
          { status: 400 },
        );
      }
      body.slug_uri = autoSlug;
    }

    const squadPayload = {
      game_id: body.game_id || "cs2",
      name: body.name,
      symbol: body.symbol || "",
      description: body.description || "",
      slug_uri: body.slug_uri || "",
      logo_uri: body.logo_uri || "",
      visibility_type: body.visibility_type || "public",
    };

    let sdk = createAuthenticatedSDK(session);
    let squad = null;

    try {
      squad = await sdk.squads.createSquad(squadPayload);
    } catch (firstErr) {
      const errStatus = (firstErr as Record<string, unknown>)?.status;
      // If backend returned 401 (expired/invalid RID), try to refresh the token and retry once
      if (errStatus === 401) {
        logger.warn("[API /api/squads] Backend returned 401, attempting RID refresh");
        const freshRid = await refreshRIDFromSession(session);
        if (freshRid) {
          const { ReplayAPISDK } = await import("@/types/replay-api/sdk");
          const { ReplayApiSettingsMock } = await import("@/types/replay-api/settings");
          sdk = new ReplayAPISDK({ ...ReplayApiSettingsMock, authToken: freshRid }, logger as any);
          try {
            squad = await sdk.squads.createSquad(squadPayload);
          } catch (retryErr) {
            throw retryErr;
          }
        } else {
          // Could not refresh — user must re-login
          return NextResponse.json(
            {
              success: false,
              error: "Your session has expired. Please sign in again to create a squad.",
            },
            { status: 401 },
          );
        }
      } else {
        throw firstErr;
      }
    }

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
    const message = error instanceof Error ? error.message : "Failed to create squad";

    // Map specific backend error messages to user-friendly responses
    if (status === 401 || message.toLowerCase().includes("unauthorized") || message.toLowerCase().includes("sign in")) {
      return NextResponse.json(
        { success: false, error: "Your session has expired. Please sign in again." },
        { status: 401 },
      );
    }

    if (message.toLowerCase().includes("already exists") || status === 409) {
      return NextResponse.json(
        { success: false, error: "A squad with this name or URL already exists. Please choose a different name." },
        { status: 409 },
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: typeof status === "number" && status >= 400 ? status : 500 },
    );
  }
}

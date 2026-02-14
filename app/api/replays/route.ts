/**
 * Replays API Route
 * Server-side replay fetching with caching and authentication
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { logger } from "@/lib/logger";
import { getBackendUrl } from "@/lib/api/backend-url";
import { getAuthHeadersFromCookies } from "@/lib/auth/server-auth";

export const dynamic = "force-dynamic";

// Map frontend game IDs to backend format
function normalizeGameId(gameId: string): string {
  const gameIdMap: Record<string, string> = {
    cs2: "cs",
    csgo: "csgo",
    valorant: "valorant",
    lol: "lol",
    dota2: "dota2",
  };
  return gameIdMap[gameId] || gameId;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Extract query parameters
    const gameId = searchParams.get("gameId") || "cs2";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    // Get backend URL
    const backendUrl = getBackendUrl();
    const normalizedGameId = normalizeGameId(gameId);

    const offset = (page - 1) * limit;
    const apiUrl = `${backendUrl}/games/${normalizedGameId}/replays?limit=${limit}&offset=${offset}`;

    logger.info("[API /api/replays] Fetching replays", {
      gameId,
      normalizedGameId,
      backendUrl,
      apiUrl,
      limit,
      offset,
    });

    // Direct fetch to backend API
    const response = await fetch(apiUrl, {
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      logger.error("[API /api/replays] Backend request failed", {
        status: response.status,
        statusText: response.statusText,
      });
      return NextResponse.json(
        {
          success: false,
          error: `Backend request failed: ${response.statusText}`,
        },
        {
          status: response.status,
        }
      );
    }

    const replays = await response.json();

    logger.info("[API /api/replays] Got replays", {
      count: Array.isArray(replays) ? replays.length : 0,
    });

    // Return response with caching headers
    return NextResponse.json(
      {
        success: true,
        data: Array.isArray(replays) ? replays : [],
        pagination: {
          page,
          limit,
          hasMore: Array.isArray(replays) && replays.length === limit,
        },
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
        },
      }
    );
  } catch (error) {
    logger.error("[API /api/replays] Error fetching replays", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to fetch replays",
      },
      {
        status: 500,
      }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get user session - auth required for creating replays
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        {
          success: false,
          error: "Authentication required",
        },
        {
          status: 401,
        }
      );
    }

    // Get form data with file
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const gameId = (formData.get("gameId") as string) || "cs2";
    const visibility = (formData.get("visibility") as string) || "private";

    // Validate required fields
    if (!file) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required field: file",
        },
        {
          status: 400,
        }
      );
    }

    // Validate file type
    const validExtensions = [".dem", ".replay"];
    const fileName = file.name.toLowerCase();
    if (!validExtensions.some((ext) => fileName.endsWith(ext))) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid file type. Accepted: .dem, .replay",
        },
        {
          status: 400,
        }
      );
    }

    // Proxy to backend API
    const backendUrl = getBackendUrl();
    const normalizedGameId = normalizeGameId(gameId);
    const uploadUrl = `${backendUrl}/games/${normalizedGameId}/replays`;

    // Create new FormData for backend
    const backendFormData = new FormData();
    backendFormData.append("file", file);
    backendFormData.append("visibility", visibility);

    const authHeaders = getAuthHeadersFromCookies();

    const backendResponse = await fetch(uploadUrl, {
      method: "POST",
      headers: { ...authHeaders },
      body: backendFormData,
    });

    if (!backendResponse.ok) {
      const errorText = await backendResponse.text();
      logger.error("[API /api/replays] Backend upload failed", {
        status: backendResponse.status,
        error: errorText,
      });
      return NextResponse.json(
        {
          success: false,
          error: `Upload failed: ${backendResponse.statusText}`,
        },
        {
          status: backendResponse.status,
        }
      );
    }

    const result = await backendResponse.json();

    return NextResponse.json({
      success: true,
      data: result,
      message: "Replay uploaded successfully",
    });
  } catch (error) {
    logger.error("[API /api/replays] Error creating replay", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to create replay",
      },
      {
        status: 500,
      }
    );
  }
}

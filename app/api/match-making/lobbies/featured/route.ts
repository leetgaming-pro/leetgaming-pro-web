/**
 * Featured Lobbies API Route
 * GET - Get featured lobbies for homepage display
 *
 * Proxies to the match-making API service
 */

import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Get match-making API URL
function getMatchMakingApiUrl(): string {
  // Server-side: prefer internal K8s URL
  if (process.env.MATCH_MAKING_API_URL) {
    return process.env.MATCH_MAKING_API_URL;
  }
  // K8s internal service URL
  if (process.env.NODE_ENV === "production") {
    return "http://match-making-api-service:4991";
  }
  // Local development
  return "http://localhost:4991";
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const gameId = searchParams.get("game_id");
    const limit = searchParams.get("limit") || "8";

    const baseUrl = getMatchMakingApiUrl();
    const params = new URLSearchParams();
    if (gameId) params.append("game_id", gameId);
    params.append("limit", limit);

    const url = `${baseUrl}/api/lobbies/featured${params.toString() ? `?${params.toString()}` : ""}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      // Don't cache featured lobbies - they change frequently
      cache: "no-store",
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[API /api/match-making/lobbies/featured] Backend error:", errorText);
      return NextResponse.json(
        {
          success: false,
          error: `Backend returned ${response.status}`,
          lobbies: [],
          total: 0,
          has_more: false,
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "public, s-maxage=10, stale-while-revalidate=30",
      },
    });
  } catch (error) {
    console.error("[API /api/match-making/lobbies/featured] Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch featured lobbies",
        lobbies: [],
        total: 0,
        has_more: false,
      },
      { status: 500 }
    );
  }
}

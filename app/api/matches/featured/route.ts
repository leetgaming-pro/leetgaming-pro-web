/**
 * Featured Matches API Route
 * GET - Get featured/recent matches for homepage display
 * Proxies to the Replay API backend
 */

import { NextRequest, NextResponse } from "next/server";
import { logger } from "@/lib/logger";
import { getBackendUrl } from "@/lib/api/backend-url";

export const dynamic = "force-dynamic";

// Map frontend game IDs to backend format
function normalizeGameId(gameId: string): string {
  const gameIdMap: Record<string, string> = {
    cs2: "cs2",
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
    const limit = parseInt(searchParams.get("limit") || "6");
    const gameId = searchParams.get("game") || "cs2";
    
    const baseUrl = getBackendUrl();
    const normalizedGameId = normalizeGameId(gameId);
    
    // Fetch matches from the matches endpoint
    const url = `${baseUrl}/games/${normalizedGameId}/matches?limit=${limit}&offset=0`;
    
    logger.info("[API /api/matches/featured] Fetching featured matches", {
      url,
      limit,
      gameId: normalizedGameId,
    });

    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      const errorText = await response.text();
      logger.error("[API /api/matches/featured] Backend error:", errorText);
      
      // Return empty array for graceful degradation
      return NextResponse.json({
        success: true,
        data: [],
        total: 0,
        message: "No matches available",
      });
    }

    const data = await response.json();
    
    // Handle different response formats
    const matches = Array.isArray(data) ? data : (data.data || data.matches || []);
    const total = data.total || matches.length;

    logger.info("[API /api/matches/featured] Successfully fetched matches", {
      count: matches.length,
      total,
    });

    return NextResponse.json({
      success: true,
      data: matches,
      total,
      pagination: {
        limit,
        offset: 0,
        hasMore: matches.length === limit,
      },
    });
  } catch (error) {
    logger.error("[API /api/matches/featured] Error:", error);
    
    // Return empty array for graceful degradation (don't break the homepage)
    return NextResponse.json({
      success: true,
      data: [],
      total: 0,
      error: error instanceof Error ? error.message : "Failed to fetch featured matches",
    });
  }
}

/**
 * Seed Demo Lobbies API Route (Development Only)
 * POST - Seed demo lobbies into the database
 *
 * Proxies to the match-making API service
 */

import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Get match-making API URL
function getMatchMakingApiUrl(): string {
  if (process.env.MATCH_MAKING_API_URL) {
    return process.env.MATCH_MAKING_API_URL;
  }
  if (process.env.NODE_ENV === "production") {
    return "http://match-making-api-service:4991";
  }
  return "http://localhost:4991";
}

export async function POST(_request: NextRequest) {
  try {
    // Only allow in development
    if (process.env.NODE_ENV === "production") {
      return NextResponse.json(
        {
          success: false,
          error: "Seed endpoint is disabled in production",
        },
        { status: 403 }
      );
    }

    const baseUrl = getMatchMakingApiUrl();
    const url = `${baseUrl}/api/lobbies/seed`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[API /api/match-making/lobbies/seed] Backend error:", errorText);
      return NextResponse.json(
        {
          success: false,
          error: `Backend returned ${response.status}`,
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json({
      success: true,
      ...data,
    });
  } catch (error) {
    console.error("[API /api/match-making/lobbies/seed] Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to seed lobbies",
      },
      { status: 500 }
    );
  }
}

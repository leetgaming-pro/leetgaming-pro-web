/**
 * Games Catch-All Proxy Route
 *
 * Proxies all /api/games/* requests to the backend replay-api.
 * This covers the ~20 /games/{game_id}/* backend endpoints:
 *   - /games/{game_id}/matches
 *   - /games/{game_id}/matches/{match_id}
 *   - /games/{game_id}/matches/{match_id}/scoreboard
 *   - /games/{game_id}/matches/{match_id}/events
 *   - /games/{game_id}/matches/{match_id}/trajectory
 *   - /games/{game_id}/matches/{match_id}/heatmap
 *   - /games/{game_id}/matches/{match_id}/rounds/{n}/trajectory
 *   - /games/{game_id}/replays
 *   - /games/{game_id}/replays/{id}
 *   - /games/{game_id}/events
 *   - /games/{game_id}/match (legacy singular)
 *   - /games/{game_id}/match/{match_id}
 *   - etc.
 *
 * The SDK on the client side calls /api/games/... and this route
 * strips /api and forwards to the backend server-side, avoiding CORS.
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { getBackendUrl } from "@/lib/api/backend-url";

export const dynamic = "force-dynamic";

const REPLAY_API_BASE = getBackendUrl();

async function proxyRequest(
  request: NextRequest,
  { params }: { params: { path: string[] } },
) {
  const backendPath = `/games/${params.path.join("/")}`;
  const queryString = request.nextUrl.search; // includes the leading '?'
  const backendUrl = `${REPLAY_API_BASE}${backendPath}${queryString}`;

  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  // Forward auth if available
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.rid) {
      headers["Authorization"] = `Bearer ${session.user.rid}`;
    }
  } catch {
    // No auth — continue as anonymous
  }

  // Forward RID headers from the browser if present
  const ridHeaders = [
    "x-resource-owner-id",
    "x-resource-owner-aud-type",
  ];
  for (const h of ridHeaders) {
    const val = request.headers.get(h);
    if (val) headers[h] = val;
  }

  try {
    const fetchOptions: RequestInit = {
      method: request.method,
      headers,
      cache: "no-store",
    };

    // Forward body for non-GET requests
    if (request.method !== "GET" && request.method !== "HEAD") {
      try {
        fetchOptions.body = await request.text();
      } catch {
        // No body — that's fine
      }
    }

    const response = await fetch(backendUrl, fetchOptions);

    // Stream the response back
    const data = await response.text();
    const nextResponse = new NextResponse(data, {
      status: response.status,
      statusText: response.statusText,
    });

    // Forward content-type and relevant headers
    const forwardHeaders = [
      "content-type",
      "x-resource-owner-id",
      "x-resource-owner-aud-type",
      "x-total-count",
      "x-request-id",
    ];
    for (const h of forwardHeaders) {
      const val = response.headers.get(h);
      if (val) nextResponse.headers.set(h, val);
    }

    return nextResponse;
  } catch (error) {
    console.error(`[api/games proxy] Failed to proxy ${request.method} ${backendPath}:`, error);
    return NextResponse.json(
      { error: "Backend unavailable", path: backendPath },
      { status: 502 },
    );
  }
}

export async function GET(
  request: NextRequest,
  context: { params: { path: string[] } },
) {
  return proxyRequest(request, context);
}

export async function POST(
  request: NextRequest,
  context: { params: { path: string[] } },
) {
  return proxyRequest(request, context);
}

export async function PUT(
  request: NextRequest,
  context: { params: { path: string[] } },
) {
  return proxyRequest(request, context);
}

export async function PATCH(
  request: NextRequest,
  context: { params: { path: string[] } },
) {
  return proxyRequest(request, context);
}

export async function DELETE(
  request: NextRequest,
  context: { params: { path: string[] } },
) {
  return proxyRequest(request, context);
}

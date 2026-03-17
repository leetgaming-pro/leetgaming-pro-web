/**
 * Search Schema Proxy API Route
 * GET /api/search/schema - Get search schema from backend
 *
 * Proxies to the Go backend's /api/search/schema endpoint.
 * The search schema describes queryable fields and entity types
 * for building dynamic search UIs.
 */

import { NextResponse } from "next/server";
import { getBackendUrl } from "@/lib/api/backend-url";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const backendUrl = getBackendUrl();
    const response = await fetch(`${backendUrl}/api/search/schema`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "Unknown error");
      console.error(
        "[API /api/search/schema] Backend error:",
        response.status,
        errorText,
      );

      return NextResponse.json(
        { error: "Failed to fetch search schema" },
        { status: response.status },
      );
    }

    const data = await response.json();

    return NextResponse.json(data, {
      headers: {
        // Cache schema for 5 minutes — it rarely changes
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    });
  } catch (error) {
    console.error("[API /api/search/schema] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch search schema" },
      { status: 502 },
    );
  }
}

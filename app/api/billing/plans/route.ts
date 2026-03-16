/**
 * Plans API Route
 * Proxies plan requests to the replay-api backend
 * Public endpoint - no authentication required
 */

import { NextRequest, NextResponse } from "next/server";
import { getBackendUrl } from "@/lib/api/backend-url";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const REPLAY_API_URL = getBackendUrl();

/**
 * GET /api/billing/plans
 * Returns available subscription plans from the backend
 */
export async function GET(_request: NextRequest) {
  try {
    const response = await fetch(`${REPLAY_API_URL}/plans`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      // Allow caching for 5 minutes
      next: { revalidate: 300 },
    });

    if (!response.ok) {
      console.error(
        "[Plans API] Backend error:",
        response.status,
        response.statusText,
      );
      return NextResponse.json(
        { success: false, error: "Failed to fetch plans" },
        { status: response.status },
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("[Plans API] Error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}

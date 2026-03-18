/**
 * Subscription Plans API Route Handler
 * GET /api/subscriptions/plans - Get available subscription plans
 */

import { NextResponse } from "next/server";
import { logger } from "@/lib/logger";
import { getBackendUrl } from "@/lib/api/backend-url";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * GET /api/subscriptions/plans
 * Get available subscription plans (public endpoint, no auth required)
 */
export async function GET() {
  try {
    const backendUrl = getBackendUrl();

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    let response: Response;
    try {
      response = await fetch(`${backendUrl}/subscriptions/plans`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
      });
    } catch (fetchErr) {
      clearTimeout(timeout);
      const isTimeout = fetchErr instanceof Error && fetchErr.name === "AbortError";
      const errMsg = isTimeout
        ? `Backend timeout after 10s (${backendUrl})`
        : `Backend unreachable: ${fetchErr instanceof Error ? fetchErr.message : String(fetchErr)} (${backendUrl})`;
      logger.error("[API /api/subscriptions/plans] " + errMsg);
      return NextResponse.json(
        { success: false, error: errMsg },
        { status: 502 },
      );
    } finally {
      clearTimeout(timeout);
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: "Failed to get plans" }));
      logger.error("[API /api/subscriptions/plans] Backend error", {
        status: response.status,
        error: errorData,
      });
      return NextResponse.json(
        { success: false, error: errorData.message || "Failed to fetch subscription plans" },
        { status: response.status },
      );
    }

    const data = await response.json();

    return NextResponse.json(
      { success: true, data },
      { status: 200 },
    );
  } catch (error) {
    logger.error("[API /api/subscriptions/plans] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch subscription plans" },
      { status: 500 },
    );
  }
}

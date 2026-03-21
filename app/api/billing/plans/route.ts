/**
 * Plans API Route
 * Proxies plan requests to the replay-api backend
 * Public endpoint - no authentication required
 */

import { NextRequest, NextResponse } from "next/server";
import { getBackendUrl } from "@/lib/api/backend-url";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * GET /api/billing/plans
 * Returns available subscription plans from the backend
 * Supports query params: ?region=XX or ?currency=YYY for regional pricing
 */
export async function GET(request: NextRequest) {
  const backendBaseUrl = getBackendUrl();

  try {
    // Forward region/currency query params to the backend
    const { searchParams } = new URL(request.url);
    const backendParams = new URLSearchParams();
    const region = searchParams.get("region");
    const currency = searchParams.get("currency");
    if (region) backendParams.set("region", region);
    if (currency) backendParams.set("currency", currency);

    const queryString = backendParams.toString();
    const backendUrl = `${backendBaseUrl}/plans${queryString ? `?${queryString}` : ""}`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    let response: Response;
    try {
      response = await fetch(backendUrl, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
      });
    } catch (fetchErr) {
      clearTimeout(timeout);
      const isTimeout = fetchErr instanceof Error && fetchErr.name === "AbortError";
      const errMsg = isTimeout
        ? `Backend timeout after 10s (${backendBaseUrl})`
        : `Backend unreachable: ${fetchErr instanceof Error ? fetchErr.message : String(fetchErr)} (${backendBaseUrl})`;
      console.error("[Plans API] " + errMsg);
      return NextResponse.json({ success: false, error: errMsg }, { status: 502 });
    } finally {
      clearTimeout(timeout);
    }

    if (!response.ok) {
      console.error("[Plans API] Backend error:", response.status, response.statusText);
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

/**
 * Guest Auth Proxy Route
 * Proxies guest token creation to the Replay API backend.
 * This avoids CORS issues by keeping browser → Next.js → backend flow.
 */

import { NextResponse } from "next/server";
import { getBackendUrl } from "@/lib/api/backend-url";

export const dynamic = "force-dynamic";

const REPLAY_API_BASE = getBackendUrl();

export async function POST() {
  try {
    const response = await fetch(`${REPLAY_API_BASE}/auth/guest`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    // Forward all backend headers relevant to RID tokens
    const nextResponse = NextResponse.json(data, { status: response.status });

    const ridHeaders = [
      "x-resource-owner-id",
      "x-resource-owner-aud-type",
    ];

    for (const header of ridHeaders) {
      const value = response.headers.get(header);
      if (value) {
        nextResponse.headers.set(header, value);
      }
    }

    return nextResponse;
  } catch (error) {
    console.error("[api/auth/guest] Failed to create guest token:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create guest token" },
      { status: 502 },
    );
  }
}

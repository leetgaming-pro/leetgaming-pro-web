/**
 * Authentication headers API route
 * Reads httpOnly cookies server-side and returns auth headers
 * Used by SERVER-SIDE SDK factory to get headers for replay-api requests
 * 
 * SECURITY: Requires NextAuth session to prevent XSS from extracting RID tokens.
 * Client-side code should use the SDK factory which calls this endpoint.
 */

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

export const dynamic = "force-dynamic";

const RID_TOKEN_COOKIE = "rid_token";
const RID_METADATA_COOKIE = "rid_metadata";
const CSRF_TOKEN_COOKIE = "csrf_token";

/**
 * GET /api/auth/headers
 * Returns authentication headers for replay-api requests
 * Reads httpOnly cookie server-side (secure from XSS)
 * Returns empty headers (not 401) for unauthenticated users to allow public API access
 *
 * IMPORTANT: When token is expired, this endpoint clears the httpOnly cookies
 * to prevent stale tokens from being sent on subsequent requests.
 */
export async function GET(_request: NextRequest) {
  try {
    // SECURITY: Require NextAuth session to prevent XSS from extracting RID tokens.
    // We check session?.user (not email) to support Steam users who have no email.
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ headers: {} });
    }

    const cookieStore = cookies();
    const ridToken = cookieStore.get(RID_TOKEN_COOKIE)?.value;
    const ridMetadata = cookieStore.get(RID_METADATA_COOKIE)?.value;

    // Return empty headers for unauthenticated users (allows public API access)
    if (!ridToken || !ridMetadata) {
      return NextResponse.json({ headers: {} });
    }

    let metadata;
    try {
      metadata = JSON.parse(ridMetadata);
    } catch {
      // Invalid metadata, return empty headers
      return NextResponse.json({ headers: {} });
    }

    // Check if token is expired - clear cookies and return empty headers
    const expiresAt = new Date(metadata.expiresAt);
    if (expiresAt <= new Date()) {
      console.warn("[Auth Headers] Token expired, clearing cookies");

      // Clear the expired cookies by setting them with maxAge: 0
      // cookies().delete() doesn't work in Route Handlers, so we set with expired maxAge
      const _cookieStore = cookies();

      // For some reason cookies().set with maxAge:0 doesn't work in Route Handlers either
      // We need to return a NextResponse with Set-Cookie headers explicitly
      const response = NextResponse.json({ headers: {}, expired: true });

      // Set cookies with expires in the past to delete them
      const pastDate = new Date(0).toUTCString();
      response.headers.append(
        "Set-Cookie",
        `${RID_TOKEN_COOKIE}=; Path=/; Expires=${pastDate}; HttpOnly; SameSite=Lax`,
      );
      response.headers.append(
        "Set-Cookie",
        `${RID_METADATA_COOKIE}=; Path=/; Expires=${pastDate}; HttpOnly; SameSite=Lax`,
      );
      response.headers.append(
        "Set-Cookie",
        `${CSRF_TOKEN_COOKIE}=; Path=/; Expires=${pastDate}; SameSite=Lax`,
      );

      return response;
    }

    // Return headers for replay-api
    // SECURITY: Only X-Resource-Owner-ID and X-Intended-Audience are sent.
    // All identity fields (user_id, tenant_id, etc.) are resolved server-side
    // from the RID token — never trust client-provided identity headers.
    const headers: Record<string, string> = {
      "X-Resource-Owner-ID": ridToken,
      "X-Intended-Audience": metadata.intendedAudience?.toString() || "1",
    };

    return NextResponse.json({ headers, authenticated: true });
  } catch (error) {
    console.error("Failed to get auth headers:", error);
    // Return empty headers on error, not 500
    return NextResponse.json({ headers: {} });
  }
}

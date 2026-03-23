/**
 * Server-side authentication utilities
 * For use in Next.js API routes to forward auth headers to replay-api
 */

import { cookies } from "next/headers";
import { SERVER_USER_AGENT } from "@/lib/api/backend-url";

const RID_TOKEN_COOKIE = "rid_token";
const RID_METADATA_COOKIE = "rid_metadata";

export interface AuthHeaders {
  "X-Resource-Owner-ID"?: string;
  "X-Intended-Audience"?: string;
}

/**
 * Get authentication headers from httpOnly cookies (server-side only)
 * Use this in API routes to forward auth context to replay-api
 *
 * IMPORTANT: This function checks token expiration and returns empty headers
 * for expired tokens to prevent 401 errors from the backend.
 */
export function getAuthHeadersFromCookies(): AuthHeaders {
  const cookieStore = cookies();
  const ridToken = cookieStore.get(RID_TOKEN_COOKIE)?.value;
  const ridMetadataRaw = cookieStore.get(RID_METADATA_COOKIE)?.value;

  if (!ridToken || !ridMetadataRaw) {
    return {};
  }

  try {
    const metadata = JSON.parse(ridMetadataRaw);

    // Check if token is expired - return empty headers to avoid 401 errors
    const expiresAt = new Date(metadata.expiresAt);
    if (expiresAt <= new Date()) {
      console.warn("[Auth] RID token expired, returning empty headers");
      return {};
    }

    const headers: AuthHeaders = {
      "X-Resource-Owner-ID": ridToken,
      "X-Intended-Audience": metadata.intendedAudience?.toString() || "",
    };

    return headers;
  } catch (error) {
    console.error("[Auth] Failed to parse RID metadata:", error);
    return {};
  }
}

/**
 * Check if user has valid RID token (server-side)
 */
export function hasValidRIDToken(): boolean {
  const cookieStore = cookies();
  const ridToken = cookieStore.get(RID_TOKEN_COOKIE)?.value;
  const ridMetadataRaw = cookieStore.get(RID_METADATA_COOKIE)?.value;

  if (!ridToken || !ridMetadataRaw) {
    return false;
  }

  try {
    const metadata = JSON.parse(ridMetadataRaw);
    const expiresAt = new Date(metadata.expiresAt);
    return expiresAt > new Date();
  } catch {
    return false;
  }
}

/**
 * Get user ID from RID token metadata (server-side)
 */
export function getUserIdFromToken(): string | null {
  const cookieStore = cookies();
  const ridMetadataRaw = cookieStore.get(RID_METADATA_COOKIE)?.value;

  if (!ridMetadataRaw) {
    return null;
  }

  try {
    const metadata = JSON.parse(ridMetadataRaw);
    return metadata.resourceOwner?.user_id || null;
  } catch {
    return null;
  }
}

/**
 * Validate that the request has a valid auth context.
 * Accepts EITHER a valid NextAuth session OR a valid RID token cookie.
 * Returns auth headers for forwarding to the backend, or null if unauthenticated.
 *
 * Use this instead of manually checking getServerSession + getAuthHeadersFromCookies
 * to support both logged-in users and guest/RID-token users consistently.
 */
export function getAuthContextFromRequest(
  session: { user?: { email?: string | null; rid?: string; uid?: string } } | null,
): { headers: AuthHeaders; isAuthenticated: boolean } {
  const authHeaders = getAuthHeadersFromCookies();

  // Fallback: use session RID/UID if cookies are missing
  if (!authHeaders["X-Resource-Owner-ID"] && session?.user?.rid) {
    authHeaders["X-Resource-Owner-ID"] = session.user.rid;
  }

  // Accept either: any valid NextAuth session (email OR Steam/OAuth without email), or valid RID token
  const hasSession = !!session?.user;
  const hasRIDToken = !!authHeaders["X-Resource-Owner-ID"];
  const isAuthenticated = hasSession || hasRIDToken;

  return { headers: authHeaders, isAuthenticated };
}

/**
 * Forward an authenticated request to the backend API
 * Automatically includes auth headers from cookies and session
 */
export async function forwardAuthenticatedRequest(
  url: string,
  options: RequestInit = {},
  session?: { user?: { rid?: string; uid?: string } },
): Promise<Response> {
  const authHeaders = getAuthHeadersFromCookies();

  // Add session-based RID only if cookie was missing (avoid overwriting valid cookie)
  if (!authHeaders["X-Resource-Owner-ID"] && session?.user?.rid) {
    authHeaders["X-Resource-Owner-ID"] = session.user.rid;
  }

  const headers = new Headers(options.headers);

  // Add auth headers
  Object.entries(authHeaders).forEach(([key, value]) => {
    if (value) {
      headers.set(key, value);
    }
  });

  // Ensure content type is set for JSON requests
  if (options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  // Server-side requests need a browser-like User-Agent to pass
  // Cloudflare Browser Integrity Check (error 1010)
  if (!headers.has("User-Agent")) {
    headers.set(
      "User-Agent",
      SERVER_USER_AGENT,
    );
  }

  return fetch(url, {
    ...options,
    headers,
  });
}

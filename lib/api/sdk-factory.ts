/**
 * SDK Factory for Server-Side API Routes
 * Creates authenticated SDK instances using httpOnly cookies
 */

import { ReplayAPISDK } from "@/types/replay-api/sdk";
import { ReplayApiSettingsMock } from "@/types/replay-api/settings";
import { logger } from "@/lib/logger";
import { getAuthHeadersFromCookies } from "@/lib/auth/server-auth";

/**
 * Create SDK with server-side auth headers
 * Forwards RID token from httpOnly cookies to backend.
 *
 * Optionally accepts a NextAuth session to use session.user.rid as a
 * fallback when RID cookies are missing (e.g. fresh OAuth sign-in
 * before the RID cookie has been set).
 *
 * @param session - Optional NextAuth session for RID fallback
 * @returns ReplayAPISDK instance with auth context if available
 */
export function createAuthenticatedSDK(
  session?: { user?: { rid?: string; uid?: string } } | null,
): ReplayAPISDK {
  const authHeaders = getAuthHeadersFromCookies();
  let ridToken = authHeaders["X-Resource-Owner-ID"];

  // Fallback: use session-based RID when cookies are missing
  if (!ridToken && session?.user?.rid) {
    ridToken = session.user.rid;
  }

  // Create SDK with RID token if available for server-side auth
  return new ReplayAPISDK(
    {
      ...ReplayApiSettingsMock,
      authToken: ridToken,
    },
    logger,
  );
}

/**
 * Create SDK without authentication
 * Use this for public endpoints that don't require auth context
 *
 * @returns ReplayAPISDK instance without auth
 */
export function createPublicSDK(): ReplayAPISDK {
  return new ReplayAPISDK(ReplayApiSettingsMock, logger);
}

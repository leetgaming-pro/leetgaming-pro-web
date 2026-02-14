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
 * Forwards RID token from httpOnly cookies to backend
 *
 * Use this in all API routes that need to forward user authentication
 * to the replay-api backend.
 *
 * @returns ReplayAPISDK instance with auth context if available
 */
export function createAuthenticatedSDK(): ReplayAPISDK {
  const authHeaders = getAuthHeadersFromCookies();
  const ridToken = authHeaders["X-Resource-Owner-ID"];

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

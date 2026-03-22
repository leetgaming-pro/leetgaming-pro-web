/**
 * RID Token Refresh Utility
 *
 * Handles re-authentication when RID tokens expire (1-hour lifetime)
 * while NextAuth sessions remain valid (7-day lifetime).
 *
 * Used by API routes to transparently retry failed requests after
 * obtaining a fresh RID token from the backend.
 */

import crypto from "crypto";
import { getBackendUrl } from "@/lib/api/backend-url";
import { ReplayAPISDK } from "@/types/replay-api/sdk";
import { ReplayApiSettingsMock } from "@/types/replay-api/settings";
import { logger } from "@/lib/logger";

type SessionWithProviders = {
  user?: {
    email?: string | null;
    name?: string | null;
    rid?: string;
    uid?: string;
    google?: { sub?: string; email?: string };
    steam?: { steamid?: string; personaname?: string };
  };
} | null;

/**
 * Attempt to get a fresh RID token by re-authenticating with the backend.
 * Tries Google onboarding first, then Steam onboarding, based on session data.
 */
export async function refreshRIDFromSession(
  session: SessionWithProviders,
): Promise<string | null> {
  if (!session?.user) return null;

  const backendUrl = getBackendUrl();
  const salt = process.env.STEAM_VHASH_SOURCE || "";

  try {
    // Try Google onboarding
    const googleEmail =
      (session.user as Record<string, unknown>).google &&
      typeof (session.user as Record<string, unknown>).google === "object"
        ? ((session.user as Record<string, unknown>).google as { email?: string })?.email
        : session.user?.email;
    if (googleEmail) {
      const vHash = crypto
        .createHash("sha256")
        .update(`${googleEmail}${salt}`)
        .digest("hex");
      const resp = await fetch(`${backendUrl}/onboarding/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: googleEmail,
          name: session.user.name,
          v_hash: vHash,
        }),
      });
      if (resp.ok) {
        const rid = resp.headers.get("X-Resource-Owner-ID");
        if (rid) return rid;
      }
    }

    // Try Steam onboarding
    const steamId =
      (session.user as Record<string, unknown>).steam &&
      typeof (session.user as Record<string, unknown>).steam === "object"
        ? ((session.user as Record<string, unknown>).steam as { steamid?: string })?.steamid
        : undefined;
    if (steamId) {
      const vHash = crypto
        .createHash("sha256")
        .update(`${steamId}${salt}`)
        .digest("hex");
      const resp = await fetch(`${backendUrl}/onboarding/steam`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ steam: { id: steamId }, v_hash: vHash }),
      });
      if (resp.ok) {
        const rid = resp.headers.get("X-Resource-Owner-ID");
        if (rid) return rid;
      }
    }
  } catch (err) {
    logger.warn("[RID Refresh] Refresh attempt failed", err);
  }

  return null;
}

/**
 * Create a fresh SDK with a new RID token.
 * Returns null if refresh fails.
 */
export function createRefreshedSDK(freshRid: string): ReplayAPISDK {
  return new ReplayAPISDK(
    { ...ReplayApiSettingsMock, authToken: freshRid },
    logger,
  );
}

/**
 * Execute an SDK operation with automatic RID refresh on 401.
 *
 * Usage:
 * ```ts
 * const result = await executeWithRIDRefresh(session, sdk, async (activeSDK) => {
 *   return activeSDK.squads.createSquad(payload);
 * });
 * ```
 */
export async function executeWithRIDRefresh<T>(
  session: SessionWithProviders,
  sdk: ReplayAPISDK,
  operation: (sdk: ReplayAPISDK) => Promise<T>,
): Promise<{ result: T; refreshedRid?: string } | { error: "auth_expired" }> {
  try {
    const result = await operation(sdk);
    return { result };
  } catch (firstErr) {
    const errStatus = (firstErr as Record<string, unknown>)?.status;
    if (errStatus !== 401) throw firstErr;

    // Backend returned 401 — try to refresh RID
    logger.warn("[RID Refresh] Backend returned 401, attempting RID refresh");
    const freshRid = await refreshRIDFromSession(session);

    if (!freshRid) {
      return { error: "auth_expired" };
    }

    // Retry with fresh SDK
    const freshSDK = createRefreshedSDK(freshRid);
    const result = await operation(freshSDK);
    return { result, refreshedRid: freshRid };
  }
}

/**
 * AuthSync Component
 * Synchronizes NextAuth session with RIDTokenManager on app load
 */

"use client";

import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import {
  getRIDTokenManager,
  isAuthenticatedSync,
} from "@/types/replay-api/auth";
import { IdentifierSourceType } from "@/types/replay-api/entities.types";
import { logger as _logger } from "@/lib/logger";

/** Extended session user type with RID and provider data */
interface SessionUserExtended {
  id?: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  rid?: string;
  uid?: string;
  steam?: {
    steamid: string;
    personaname: string;
  };
  google?: {
    sub: string;
    email: string;
  };
}

interface AuthSyncProps {
  children: React.ReactNode;
}

/**
 * Component that syncs NextAuth session with RIDTokenManager
 * Place this inside SessionProvider to ensure session is available
 */
export function AuthSync({ children }: AuthSyncProps) {
  const { data: session, status } = useSession();
  const lastSyncedRid = useRef<string | null>(null);
  const syncInProgress = useRef(false);
  const ridRefreshFailed = useRef(false);

  useEffect(() => {
    const syncRIDToken = async () => {
      // Don't sync while still loading or if sync is in progress
      if (status === "loading" || syncInProgress.current) {
        return;
      }

      const sessionUser = session?.user as SessionUserExtended | undefined;
      const sessionRid = sessionUser?.rid;
      const sessionUid = sessionUser?.uid;

      // If no session, clear the RID token
      if (!session?.user) {
        if (isAuthenticatedSync()) {
          try {
            syncInProgress.current = true;
            await getRIDTokenManager().clearToken();
            lastSyncedRid.current = null;
            ridRefreshFailed.current = false;
          } catch (error) {
            console.warn("[AuthSync] Failed to clear RID token:", error);
          } finally {
            syncInProgress.current = false;
          }
        }
        return;
      }

      // If session has no RID, try to refresh it from backend (once)
      if (!sessionRid) {
        // Don't retry if we already failed — prevents infinite re-render loop
        if (ridRefreshFailed.current) {
          return;
        }

        // Try to get RID from refresh endpoint
        try {
          syncInProgress.current = true;
          const response = await fetch("/api/auth/rid-refresh", {
            method: "POST",
            credentials: "include",
          });

          if (response.ok) {
            const data = await response.json();
            if (data.rid) {
              // Use the refreshed RID to set up auth
              await getRIDTokenManager().setFromOnboarding({
                profile: {
                  id: data.uid || "",
                  rid_source: IdentifierSourceType.Google,
                  source_key: sessionUser?.email || "",
                },
                rid: data.rid,
                user_id: data.uid || "",
              });
              lastSyncedRid.current = data.rid;
              ridRefreshFailed.current = false;
            }
          } else {
            console.warn("[AuthSync] RID refresh failed with status:", response.status);
            ridRefreshFailed.current = true;
          }
        } catch (error) {
          console.error("[AuthSync] Error refreshing RID:", error);
          ridRefreshFailed.current = true;
        } finally {
          syncInProgress.current = false;
        }
        return;
      }

      // Check if we already synced this RID AND local token is still valid
      if (lastSyncedRid.current === sessionRid && isAuthenticatedSync()) {
        return;
      }

      // If we have a sessionRid but the local token is expired (or never set),
      // try to get a fresh RID from the backend before syncing the (potentially expired) one.
      // The session JWT stores the original RID from login (1-hour expiry on backend),
      // but NextAuth sessions last 7 days — so we need to refresh proactively.
      const localTokenExpired = !isAuthenticatedSync();
      if (localTokenExpired && !ridRefreshFailed.current) {
        try {
          syncInProgress.current = true;
          const refreshResp = await fetch("/api/auth/rid-refresh", {
            method: "POST",
            credentials: "include",
          });

          if (refreshResp.ok) {
            const data = await refreshResp.json();
            const freshRid = data.rid;
            if (freshRid && freshRid !== sessionRid) {
              // Got a genuinely fresh RID — use it
              await getRIDTokenManager().setFromOnboarding({
                profile: {
                  id: data.uid || sessionUid || "",
                  rid_source: IdentifierSourceType.Google,
                  source_key: sessionUser?.email || sessionUser?.steam?.steamid || "",
                },
                rid: freshRid,
                user_id: data.uid || sessionUid || "",
              });
              lastSyncedRid.current = freshRid;
              ridRefreshFailed.current = false;
              syncInProgress.current = false;
              return;
            }
            // If the refresh returned the same RID, fall through to sync it
          } else {
            console.warn("[AuthSync] Proactive RID refresh failed, will use session RID");
            ridRefreshFailed.current = true;
          }
        } catch (error) {
          console.warn("[AuthSync] Proactive RID refresh error:", error);
          ridRefreshFailed.current = true;
        } finally {
          syncInProgress.current = false;
        }
      }

      // Need to sync the RID token
      try {
        syncInProgress.current = true;

        // Determine the source type based on session data
        let sourceType = IdentifierSourceType.Google;
        let sourceKey = session.user.email || "";

        // Check if user logged in via Steam
        if (sessionUser?.steam?.steamid) {
          sourceType = IdentifierSourceType.Steam;
          sourceKey = sessionUser.steam.steamid;
        }
        // Check if user logged in via Google
        else if (sessionUser?.google?.sub) {
          sourceType = IdentifierSourceType.Google;
          sourceKey = sessionUser.google.email || session.user.email || "";
        }
        // Email-password login defaults to Google type (email-based)

        await getRIDTokenManager().setFromOnboarding({
          profile: {
            id: sessionUid || "",
            rid_source: sourceType,
            source_key: sourceKey,
          },
          rid: sessionRid,
          user_id: sessionUid || "",
        });

        lastSyncedRid.current = sessionRid;
      } catch (error) {
        console.error("[AuthSync] Failed to sync RID token:", error);
        // Reset to allow retry
        lastSyncedRid.current = null;
      } finally {
        syncInProgress.current = false;
      }
    };

    syncRIDToken();
  }, [session, status]);

  return <>{children}</>;
}

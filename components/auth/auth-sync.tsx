/**
 * AuthSync Component
 * Synchronizes NextAuth session with RIDTokenManager on app load
 */

"use client";

import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { getRIDTokenManager, isAuthenticatedSync } from "@/types/replay-api/auth";
import { IdentifierSourceType } from "@/types/replay-api/entities.types";
import { logger } from "@/lib/logger";

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

  useEffect(() => {
    const syncRIDToken = async () => {
      // Don't sync while still loading or if sync is in progress
      if (status === "loading" || syncInProgress.current) {
        return;
      }

      const sessionRid = (session?.user as any)?.rid;
      const sessionUid = (session?.user as any)?.uid;

      // If no session, clear the RID token
      if (!session?.user) {
        if (isAuthenticatedSync()) {
          try {
            syncInProgress.current = true;
            await getRIDTokenManager().clearToken();
            lastSyncedRid.current = null;
            logger.debug("[AuthSync] Cleared RID token - no session");
          } catch (error) {
            logger.warn("[AuthSync] Failed to clear RID token:", error);
          } finally {
            syncInProgress.current = false;
          }
        }
        return;
      }

      // If session has no RID, backend onboarding may have failed
      if (!sessionRid) {
        logger.debug("[AuthSync] Session has no RID - backend onboarding may have failed");
        return;
      }

      // Check if we already synced this RID
      if (lastSyncedRid.current === sessionRid && isAuthenticatedSync()) {
        logger.debug("[AuthSync] RID token already synced for this session");
        return;
      }

      // Need to sync the RID token
      try {
        syncInProgress.current = true;

        // Determine the source type based on session data
        let sourceType = IdentifierSourceType.Google;
        let sourceKey = session.user.email || "";

        // Check if user logged in via Steam
        if ((session.user as any).steam?.steamid) {
          sourceType = IdentifierSourceType.Steam;
          sourceKey = (session.user as any).steam.steamid;
        }
        // Check if user logged in via Google
        else if ((session.user as any).google?.sub) {
          sourceType = IdentifierSourceType.Google;
          sourceKey =
            (session.user as any).google.email || session.user.email || "";
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
        logger.info("[AuthSync] Synced RID token from session", {
          sourceType,
          hasRid: !!sessionRid,
        });
      } catch (error) {
        logger.error("[AuthSync] Failed to sync RID token:", error);
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

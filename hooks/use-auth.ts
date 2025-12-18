/**
 * Authentication Hook
 * Provides unified authentication state from NextAuth session
 * Note: RID token sync is handled by AuthSync component
 */

"use client";

import { useSession } from "next-auth/react";
import { useMemo, useCallback } from "react";
import { getRIDTokenManager, isAuthenticatedSync } from "@/types/replay-api/auth";
import { logger } from "@/lib/logger";

export interface AuthState {
  /** Whether the user is authenticated (has valid session with RID) */
  isAuthenticated: boolean;
  /** Whether authentication status is still being determined */
  isLoading: boolean;
  /** User information from the session */
  user: {
    id?: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    rid?: string;
    uid?: string;
  } | null;
  /** Sign out function that clears both NextAuth and RID tokens */
  signOut: () => Promise<void>;
}

/**
 * React hook that provides unified authentication state
 * 
 * This hook provides access to the NextAuth session and authentication status.
 * The RID token synchronization is handled by the AuthSync component.
 * 
 * @example
 * ```tsx
 * const { isAuthenticated, isLoading, user } = useAuth();
 * 
 * if (isLoading) return <Loading />;
 * if (!isAuthenticated) return <SignInPrompt />;
 * 
 * return <UserDashboard user={user} />;
 * ```
 */
export function useAuth(): AuthState {
  const { data: session, status } = useSession();
  const isLoading = status === "loading";

  const signOut = useCallback(async () => {
    const { signOut: nextAuthSignOut } = await import("next-auth/react");
    
    // Clear RID token first
    try {
      await getRIDTokenManager().clearToken();
    } catch (error) {
      logger.warn("[useAuth] Failed to clear RID token on sign out:", error);
    }
    
    // Then sign out from NextAuth
    await nextAuthSignOut({ callbackUrl: "/" });
  }, []);

  const user = useMemo(() => {
    if (!session?.user) return null;
    
    return {
      id: (session.user as any).uid || session.user.id,
      name: session.user.name,
      email: session.user.email,
      image: session.user.image,
      rid: (session.user as any).rid,
      uid: (session.user as any).uid,
    };
  }, [session]);

  // User is authenticated if:
  // 1. Has NextAuth session with user data AND
  // 2. Either has RID in session OR RIDTokenManager is authenticated
  const isAuthenticated = useMemo(() => {
    if (!session?.user) return false;
    
    const hasRid = !!(session.user as any).rid;
    const hasRidToken = isAuthenticatedSync();
    
    return hasRid || hasRidToken;
  }, [session]);

  return {
    isAuthenticated,
    isLoading,
    user,
    signOut,
  };
}

/**
 * Check if user is authenticated (can be used outside of React components)
 * Uses local RIDTokenManager metadata only, doesn't validate with server
 */
export { isAuthenticatedSync };

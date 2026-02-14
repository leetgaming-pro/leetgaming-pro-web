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

/** Extended session user with RID fields */
interface SessionUserWithRID {
  id?: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  rid?: string;
  uid?: string;
  role?: string;
  isAdmin?: boolean;
}

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
    role?: string;
    isAdmin?: boolean;
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

    const sessionUser = session.user as SessionUserWithRID;
    return {
      id: sessionUser.uid || sessionUser.id,
      name: session.user.name,
      email: session.user.email,
      image: session.user.image,
      rid: sessionUser.rid,
      uid: sessionUser.uid,
      role: sessionUser.role,
      isAdmin: sessionUser.isAdmin,
    };
  }, [session]);

  // User is authenticated if:
  // 1. Has NextAuth session with user data AND
  // 2. Either has RID in session OR RIDTokenManager is authenticated
  const isAuthenticated = useMemo(() => {
    if (!session?.user) return false;

    const sessionUser = session.user as SessionUserWithRID;
    const hasRid = !!sessionUser.rid;
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

/**
 * React hook for protected routes that requires authentication
 * Automatically redirects to sign-in if user is not authenticated
 * 
 * @param options Configuration options
 * @param options.callbackUrl URL to redirect to after successful sign-in
 * @returns AuthState with redirecting status
 * 
 * @example
 * ```tsx
 * const { isAuthenticated, isLoading, isRedirecting } = useRequireAuth({
 *   callbackUrl: '/protected-page'
 * });
 * 
 * if (isLoading || isRedirecting) return <Loading />;
 * if (!isAuthenticated) return null; // Should not reach here due to redirect
 * 
 * return <ProtectedContent />;
 * ```
 */
export function useRequireAuth(options: { callbackUrl?: string } = {}): AuthState & { isRedirecting: boolean } {
  const auth = useAuth();
  // Import useRouter at module level - hooks must be called unconditionally
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { useRouter } = require('next/navigation') as { useRouter: () => { push: (url: string) => void } | null };
  const router = useRouter();

  const isRedirecting = useMemo(() => {
    if (auth.isLoading) return false;
    if (auth.isAuthenticated) return false;

    // Redirect to sign-in if not authenticated
    if (router) {
      const signInUrl = `/signin${options.callbackUrl ? `?callbackUrl=${encodeURIComponent(options.callbackUrl)}` : ''}`;
      router.push(signInUrl);
      return true;
    }

    return false;
  }, [auth.isLoading, auth.isAuthenticated, router, options.callbackUrl]);

  return {
    ...auth,
    isRedirecting,
  };
}

/**
 * React hook for pages that support optional authentication
 * Provides authentication state without automatic redirects
 * Includes helper function for requiring auth on specific actions
 * 
 * @returns AuthState with requireAuthForAction helper
 * 
 * @example
 * ```tsx
 * const { isAuthenticated, user, requireAuthForAction } = useOptionalAuth();
 * 
 * const handleAction = () => {
 *   if (!requireAuthForAction("perform this action")) {
 *     return; // User was redirected to sign-in
 *   }
 *   
 *   // Perform authenticated action
 * };
 * ```
 */
export function useOptionalAuth(): AuthState & {
  requireAuthForAction: (action: string) => boolean
} {
  const auth = useAuth();
  // Import useRouter at module level - hooks must be called unconditionally
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { useRouter } = require('next/navigation') as { useRouter: () => { push: (url: string) => void } | null };
  const router = useRouter();

  const requireAuthForAction = useCallback((action: string): boolean => {
    if (auth.isAuthenticated) return true;

    if (router) {
      const signInUrl = `/signin?action=${encodeURIComponent(action)}`;
      router.push(signInUrl);
    }

    return false;
  }, [auth.isAuthenticated, router]);

  return {
    ...auth,
    requireAuthForAction,
  };
}

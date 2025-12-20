/**
 * Authentication Hook
 * Provides unified authentication state from NextAuth session
 * Note: RID token sync is handled by AuthSync component
 */

"use client";

import { useSession } from "next-auth/react";
import { useMemo, useCallback, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
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
      id: session.user.uid || session.user.id,
      name: session.user.name,
      email: session.user.email,
      image: session.user.image,
      rid: session.user.rid,
      uid: session.user.uid,
    };
  }, [session]);

  // User is authenticated if:
  // 1. Has NextAuth session with user data AND
  // 2. Has RID in session (from backend onboarding)
  // Note: We require RID in session, not just RIDTokenManager cookies which can be stale
  const isAuthenticated = useMemo(() => {
    if (!session?.user) return false;
    
    // Require session to have RID - this confirms backend onboarding completed
    return !!session.user.rid;
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
 * Options for useRequireAuth hook
 */
export interface RequireAuthOptions {
  /** Path to redirect to when unauthenticated (default: '/signin') */
  redirectTo?: string;
  /** Whether to include callback URL for post-login redirect (default: true) */
  includeCallback?: boolean;
  /** Custom callback URL (defaults to current path) */
  callbackUrl?: string;
}

/**
 * Hook for pages that require authentication
 * Automatically redirects unauthenticated users to sign-in page
 * 
 * @example
 * ```tsx
 * export default function ProtectedPage() {
 *   const { isAuthenticated, isLoading, user } = useRequireAuth();
 *   
 *   if (isLoading) return <PageLoader />;
 *   // At this point, user is guaranteed to be authenticated
 *   // (or being redirected to sign-in)
 *   
 *   return <ProtectedContent user={user} />;
 * }
 * ```
 */
export function useRequireAuth(options: RequireAuthOptions = {}): AuthState & { isRedirecting: boolean } {
  const { redirectTo = '/signin', includeCallback = true, callbackUrl } = options;
  const auth = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const isRedirecting = !auth.isLoading && !auth.isAuthenticated;

  useEffect(() => {
    if (auth.isLoading) return;
    
    if (!auth.isAuthenticated) {
      const targetCallback = callbackUrl || pathname;
      const redirectPath = includeCallback 
        ? `${redirectTo}?callbackUrl=${encodeURIComponent(targetCallback)}`
        : redirectTo;
      
      logger.info('[useRequireAuth] Redirecting unauthenticated user', { 
        from: pathname, 
        to: redirectPath 
      });
      
      router.push(redirectPath);
    }
  }, [auth.isLoading, auth.isAuthenticated, router, pathname, redirectTo, includeCallback, callbackUrl]);

  return {
    ...auth,
    isRedirecting,
  };
}

/**
 * Hook that provides auth state for pages with mixed access
 * (public viewing but authenticated actions)
 * 
 * @example
 * ```tsx
 * const { isAuthenticated, user, requireAuthForAction } = useOptionalAuth();
 * 
 * const handleCreate = () => {
 *   if (!requireAuthForAction('create a team')) return;
 *   // User is authenticated, proceed
 * };
 * ```
 */
export function useOptionalAuth(): AuthState & { 
  requireAuthForAction: (actionDescription: string) => boolean;
  redirectToSignIn: (callbackPath?: string) => void;
} {
  const auth = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const redirectToSignIn = useCallback((callbackPath?: string) => {
    const callback = callbackPath || pathname;
    router.push(`/signin?callbackUrl=${encodeURIComponent(callback)}`);
  }, [router, pathname]);

  const requireAuthForAction = useCallback((actionDescription: string): boolean => {
    if (auth.isAuthenticated) return true;
    
    logger.info('[useOptionalAuth] Action requires authentication', { 
      action: actionDescription,
      path: pathname 
    });
    
    redirectToSignIn();
    return false;
  }, [auth.isAuthenticated, pathname, redirectToSignIn]);

  return {
    ...auth,
    requireAuthForAction,
    redirectToSignIn,
  };
}

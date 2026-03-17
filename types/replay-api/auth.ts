/**
 * Authentication module for Replay API
 * Handles RID (Resource Identity) token lifecycle and management
 * Based on replay-api/pkg/domain/rid_token.go
 */

import { ResourceOwner } from "./replay-file";
import {
  IntendedAudienceKey,
  GrantType,
  RID_TOKEN_EXPIRATION_MS,
} from "./settings";
import { RIDToken, IdentifierSourceType } from "./entities.types";

/**
 * Session API endpoints for secure cookie-based authentication
 * Note: Using /rid-session to avoid conflict with NextAuth's /session endpoint
 */
const SESSION_API_BASE = "/api/auth";
const SESSION_ENDPOINT = `${SESSION_API_BASE}/rid-session`;
const HEADERS_ENDPOINT = `${SESSION_API_BASE}/headers`;

/**
 * Cookie name for CSRF token (readable by client)
 */
const CSRF_TOKEN_COOKIE = "csrf_token";

/**
 * Cookie name for metadata (readable by client)
 */
const RID_METADATA_COOKIE = "rid_metadata";

/**
 * RID Token metadata for client-side management
 */
interface RIDTokenMetadata {
  tokenId: string;
  expiresAt: string;
  resourceOwner: {
    tenant_id: string;
    client_id: string;
    group_id: string | null;
    user_id: string | null;
  };
  intendedAudience: IntendedAudienceKey;
}

/**
 * Response from onboarding endpoints
 */
export interface OnboardingResponse {
  profile: {
    id: string;
    rid_source: IdentifierSourceType;
    source_key: string;
  };
  rid: string;
  user_id: string;
}

/**
 * Manages RID token lifecycle with secure httpOnly cookies
 * Singleton pattern for application-wide token management
 *
 * Security improvements:
 * - Tokens stored in httpOnly cookies (prevents XSS attacks)
 * - CSRF protection for state-changing operations
 * - Automatic token refresh before expiration
 * - Server-side session validation
 */
export class RIDTokenManager {
  private static instance: RIDTokenManager;
  private metadata: RIDTokenMetadata | null = null;
  private csrfToken: string | null = null;
  private refreshTimer: ReturnType<typeof setTimeout> | null = null;

  private constructor() {
    this.loadMetadataFromCookie();
  }

  /**
   * Get singleton instance
   */
  static getInstance(): RIDTokenManager {
    if (!RIDTokenManager.instance) {
      RIDTokenManager.instance = new RIDTokenManager();
    }
    return RIDTokenManager.instance;
  }

  /**
   * Initialize with a new RID token from onboarding
   * Stores token in secure httpOnly cookie via API
   */
  async setToken(
    tokenId: string,
    resourceOwner:
      | ResourceOwner
      | {
          tenant_id: string;
          client_id: string;
          group_id: string | null;
          user_id: string | null;
        },
    intendedAudience: IntendedAudienceKey = IntendedAudienceKey.UserAudienceIDKey,
  ): Promise<void> {
    console.log(
      "[RIDTokenManager] setToken starting, endpoint:",
      SESSION_ENDPOINT,
    );
    try {
      // Handle both ResourceOwner class instance and plain object
      const resourceOwnerData =
        resourceOwner instanceof ResourceOwner
          ? resourceOwner.toJSON()
          : {
              tenant_id:
                (resourceOwner as any).tenant_id ||
                (resourceOwner as any).tenantId,
              client_id:
                (resourceOwner as any).client_id ||
                (resourceOwner as any).clientId,
              group_id:
                (resourceOwner as any).group_id ??
                (resourceOwner as any).groupId ??
                null,
              user_id:
                (resourceOwner as any).user_id ??
                (resourceOwner as any).userId ??
                null,
            };

      console.log(
        "[RIDTokenManager] setToken posting to:",
        SESSION_ENDPOINT,
        "with resourceOwner:",
        resourceOwnerData,
      );
      const response = await fetch(SESSION_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tokenId,
          resourceOwner: resourceOwnerData,
          intendedAudience,
        }),
        credentials: "include", // Include cookies in request
      });

      if (!response.ok) {
        throw new Error(`Failed to set session: ${response.statusText}`);
      }

      const data = await response.json();

      // Store CSRF token and metadata locally
      this.csrfToken = data.csrfToken;
      this.metadata = {
        tokenId,
        expiresAt: data.expiresAt,
        resourceOwner: resourceOwnerData,
        intendedAudience,
      };

      this.scheduleRefresh();
    } catch (error) {
      console.error("Failed to set token:", error);
      throw error;
    }
  }

  /**
   * Set token from onboarding response
   */
  async setFromOnboarding(response: OnboardingResponse): Promise<void> {
    console.log("[RIDTokenManager] setFromOnboarding called with:", {
      hasRid: !!response.rid,
      ridPrefix: response.rid?.substring(0, 8),
      userId: response.user_id,
    });
    const resourceOwner = ResourceOwner.fromUser(response.user_id);
    await this.setToken(response.rid, resourceOwner);
    console.log("[RIDTokenManager] setFromOnboarding completed successfully");
  }

  /**
   * Get current RID token from session
   * NOTE: Token is stored in httpOnly cookie, not accessible via JavaScript
   * Use getAuthHeaders() to get headers for API requests
   */
  async getToken(): Promise<string | null> {
    if (this.isExpired()) {
      await this.clearToken();
      return null;
    }

    // Token is in httpOnly cookie, return tokenId from metadata
    return this.metadata?.tokenId || null;
  }

  /**
   * Get token metadata
   */
  getMetadata(): RIDTokenMetadata | null {
    return this.metadata;
  }

  /**
   * Get ResourceOwner from current token
   */
  getResourceOwner(): ResourceOwner | null {
    if (!this.metadata) return null;
    return ResourceOwner.fromJSON(this.metadata.resourceOwner);
  }

  /**
   * Check if token is expired
   */
  isExpired(): boolean {
    if (!this.metadata) return true;
    return new Date(this.metadata.expiresAt) <= new Date();
  }

  /**
   * Check if token exists and is valid
   */
  async isAuthenticated(): Promise<boolean> {
    try {
      const response = await fetch(SESSION_ENDPOINT, {
        method: "GET",
        credentials: "include",
      });

      if (!response.ok) {
        return false;
      }

      const data = await response.json();
      return data.authenticated === true;
    } catch (error) {
      console.error("Failed to check authentication:", error);
      return false;
    }
  }

  /**
   * Check authentication status synchronously using metadata
   * Use isAuthenticated() for server validation
   */
  isAuthenticatedSync(): boolean {
    return !!this.metadata && !this.isExpired();
  }

  /**
   * Clear token and metadata
   */
  async clearToken(): Promise<void> {
    try {
      // Call API to clear httpOnly cookies (always try, server handles missing CSRF)
      await fetch(SESSION_ENDPOINT, {
        method: "DELETE",
        headers: this.csrfToken
          ? {
              "X-CSRF-Token": this.csrfToken,
            }
          : {},
        credentials: "include",
      });
    } catch (error) {
      console.error("Failed to clear session:", error);
    } finally {
      // Clear local state
      this.metadata = null;
      this.csrfToken = null;

      // Clear metadata cookie client-side as backup
      if (typeof document !== "undefined") {
        document.cookie = `${RID_METADATA_COOKIE}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
        document.cookie = `${CSRF_TOKEN_COOKIE}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
      }

      if (this.refreshTimer) {
        clearTimeout(this.refreshTimer);
        this.refreshTimer = null;
      }
    }
  }

  /**
   * Get authentication headers for API requests
   * Calls server-side endpoint to read httpOnly cookie
   *
   * IMPORTANT: Handles expired tokens by clearing local state and
   * returning empty headers to prevent 401 errors from backend.
   */
  async getAuthHeaders(): Promise<Record<string, string>> {
    try {
      const response = await fetch(HEADERS_ENDPOINT, {
        method: "GET",
        credentials: "include",
      });

      if (!response.ok) {
        return {};
      }

      const data = await response.json();

      // If token is expired, clear local state and return empty headers
      // This prevents stale tokens from being sent to the backend
      if (data.expired) {
        console.warn("[RIDTokenManager] Token expired, clearing local state");
        this.metadata = null;
        this.csrfToken = null;
        if (this.refreshTimer) {
          clearTimeout(this.refreshTimer);
          this.refreshTimer = null;
        }
        // Clear metadata cookie client-side as backup
        if (typeof document !== "undefined") {
          document.cookie = `rid_metadata=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
          document.cookie = `csrf_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
        }
        return {};
      }

      return data.headers || {};
    } catch (error) {
      console.error("Failed to get auth headers:", error);
      return {};
    }
  }

  /**
   * Get CSRF token for state-changing requests
   */
  getCSRFToken(): string | null {
    return this.csrfToken;
  }

  /**
   * Create fetch options with auth headers
   */
  async createAuthFetchOptions(
    options: RequestInit = {},
  ): Promise<RequestInit> {
    const authHeaders = await this.getAuthHeaders();

    return {
      ...options,
      credentials: "include", // Always include cookies
      headers: {
        ...options.headers,
        ...authHeaders,
      },
    };
  }

  /**
   * Refresh token by extending session expiration
   * Calls PATCH /api/auth/session with CSRF token
   */
  async refreshToken(): Promise<boolean> {
    try {
      if (!this.csrfToken) {
        console.error("No CSRF token available for refresh");
        return false;
      }

      const response = await fetch(SESSION_ENDPOINT, {
        method: "PATCH",
        headers: {
          "X-CSRF-Token": this.csrfToken,
        },
        credentials: "include",
      });

      if (!response.ok) {
        console.error("Token refresh failed:", response.statusText);
        return false;
      }

      const data = await response.json();

      // Update local metadata with new expiration
      if (this.metadata) {
        this.metadata.expiresAt = data.expiresAt;
        this.scheduleRefresh();
      }

      return true;
    } catch (error) {
      console.error("Token refresh error:", error);
      return false;
    }
  }

  /**
   * Load metadata from readable cookie
   * Note: Token is in httpOnly cookie and not accessible
   */
  private loadMetadataFromCookie(): void {
    if (typeof window === "undefined") return;

    try {
      // Read metadata from non-httpOnly cookie
      const cookies = document.cookie.split(";");
      const metaCookie = cookies.find((c) =>
        c.trim().startsWith(`${RID_METADATA_COOKIE}=`),
      );
      const csrfCookie = cookies.find((c) =>
        c.trim().startsWith(`${CSRF_TOKEN_COOKIE}=`),
      );

      if (metaCookie) {
        const metaValue = metaCookie.split("=")[1];
        this.metadata = JSON.parse(decodeURIComponent(metaValue));

        // Clear if expired
        if (this.isExpired()) {
          this.clearToken();
        } else {
          this.scheduleRefresh();
        }
      }

      if (csrfCookie) {
        this.csrfToken = csrfCookie.split("=")[1];
      }
    } catch (error) {
      console.error("Failed to load metadata from cookie:", error);
    }
  }

  /**
   * Helper to get a cookie value by name
   */
  private getCookie(name: string): string | null {
    if (typeof window === "undefined") return null;

    const cookies = document.cookie.split(";");
    const cookie = cookies.find((c) => c.trim().startsWith(`${name}=`));
    return cookie ? cookie.split("=")[1] : null;
  }

  /**
   * Schedule automatic token refresh before expiration
   */
  private scheduleRefresh(): void {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
    }

    if (!this.metadata) return;

    const expiresAt = new Date(this.metadata.expiresAt).getTime();
    const now = Date.now();
    const timeUntilExpiry = expiresAt - now;

    // Refresh 5 minutes before expiration
    const refreshTime = Math.max(0, timeUntilExpiry - 5 * 60 * 1000);

    this.refreshTimer = setTimeout(async () => {
      const refreshed = await this.refreshToken();
      if (!refreshed) {
        // Token could not be refreshed, clear it
        this.clearToken();
      }
    }, refreshTime);
  }
}

/**
 * Get the global RID token manager instance
 */
export function getRIDTokenManager(): RIDTokenManager {
  return RIDTokenManager.getInstance();
}

/**
 * Helper function to get auth headers for fetch requests
 */
export async function getAuthHeaders(): Promise<Record<string, string>> {
  return await getRIDTokenManager().getAuthHeaders();
}

/**
 * Helper function to check if user is authenticated (async)
 */
export async function isAuthenticated(): Promise<boolean> {
  return await getRIDTokenManager().isAuthenticated();
}

/**
 * Helper function to check if user is authenticated (sync)
 * Uses local metadata only, doesn't validate with server
 */
export function isAuthenticatedSync(): boolean {
  return getRIDTokenManager().isAuthenticatedSync();
}

/**
 * Guest token response from the API
 */
interface GuestTokenResponse {
  success: boolean;
  token_id?: string;
  user_id?: string;
  expires_at?: string;
  message?: string;
}

/**
 * Create a guest token for unauthenticated users
 * This allows guests to have a session and potentially convert to full accounts later
 */
export async function createGuestToken(): Promise<GuestTokenResponse | null> {
  try {
    // Use the Next.js API proxy to avoid CORS issues in production.
    // The proxy route at /api/auth/guest forwards to the backend server-side.
    const response = await fetch(`/api/auth/guest`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      console.error("Failed to create guest token:", response.statusText);
      return null;
    }

    const data: GuestTokenResponse = await response.json();

    if (data.success && data.token_id) {
      // Store the guest token in the session
      const manager = getRIDTokenManager();
      const resourceOwner = ResourceOwner.fromUser(data.user_id || "");
      await manager.setToken(
        data.token_id,
        resourceOwner,
        IntendedAudienceKey.UserAudienceIDKey,
      );
    }

    return data;
  } catch (error) {
    console.error("Error creating guest token:", error);
    return null;
  }
}

/**
 * Ensure user has a session token (either authenticated or guest)
 * Call this before making API requests that need a token
 */
export async function ensureSession(): Promise<boolean> {
  // Check if already authenticated
  if (isAuthenticatedSync()) {
    return true;
  }

  // Try to create a guest token
  const guestToken = await createGuestToken();
  return guestToken?.success === true;
}

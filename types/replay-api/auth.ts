/**
 * Authentication module for Replay API
 * Handles RID (Resource Identity) token lifecycle and management
 * Based on replay-api/pkg/domain/rid_token.go
 */

import { ResourceOwner } from './replay-file';
import { IntendedAudienceKey, GrantType, RID_TOKEN_EXPIRATION_MS } from './settings';
import { RIDToken, IdentifierSourceType } from './entities.types';

/**
 * Session API endpoints for secure cookie-based authentication
 */
const SESSION_API_BASE = '/api/auth';
const SESSION_ENDPOINT = `${SESSION_API_BASE}/session`;
const HEADERS_ENDPOINT = `${SESSION_API_BASE}/headers`;

/**
 * Cookie name for CSRF token (readable by client)
 */
const CSRF_TOKEN_COOKIE = 'csrf_token';

/**
 * Cookie name for metadata (readable by client)
 */
const RID_METADATA_COOKIE = 'rid_metadata';

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
    resourceOwner: ResourceOwner,
    intendedAudience: IntendedAudienceKey = IntendedAudienceKey.UserAudienceIDKey
  ): Promise<void> {
    try {
      const response = await fetch(SESSION_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tokenId,
          resourceOwner: resourceOwner.toJSON(),
          intendedAudience,
        }),
        credentials: 'include', // Include cookies in request
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
        resourceOwner: resourceOwner.toJSON(),
        intendedAudience,
      };

      this.scheduleRefresh();
    } catch (error) {
      console.error('Failed to set token:', error);
      throw error;
    }
  }

  /**
   * Set token from onboarding response
   */
  async setFromOnboarding(response: OnboardingResponse): Promise<void> {
    const resourceOwner = ResourceOwner.fromUser(response.user_id);
    await this.setToken(response.rid, resourceOwner);
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
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        return false;
      }

      const data = await response.json();
      return data.authenticated === true;
    } catch (error) {
      console.error('Failed to check authentication:', error);
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
      // Call API to clear httpOnly cookies
      if (this.csrfToken) {
        await fetch(SESSION_ENDPOINT, {
          method: 'DELETE',
          headers: {
            'X-CSRF-Token': this.csrfToken,
          },
          credentials: 'include',
        });
      }
    } catch (error) {
      console.error('Failed to clear session:', error);
    } finally {
      // Clear local state
      this.metadata = null;
      this.csrfToken = null;

      if (this.refreshTimer) {
        clearTimeout(this.refreshTimer);
        this.refreshTimer = null;
      }
    }
  }

  /**
   * Get authentication headers for API requests
   * Calls server-side endpoint to read httpOnly cookie
   */
  async getAuthHeaders(): Promise<Record<string, string>> {
    try {
      const response = await fetch(HEADERS_ENDPOINT, {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        return {};
      }

      const data = await response.json();
      return data.headers || {};
    } catch (error) {
      console.error('Failed to get auth headers:', error);
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
  async createAuthFetchOptions(options: RequestInit = {}): Promise<RequestInit> {
    const authHeaders = await this.getAuthHeaders();

    return {
      ...options,
      credentials: 'include', // Always include cookies
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
        console.error('No CSRF token available for refresh');
        return false;
      }

      const response = await fetch(SESSION_ENDPOINT, {
        method: 'PATCH',
        headers: {
          'X-CSRF-Token': this.csrfToken,
        },
        credentials: 'include',
      });

      if (!response.ok) {
        console.error('Token refresh failed:', response.statusText);
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
      console.error('Token refresh error:', error);
      return false;
    }
  }

  /**
   * Load metadata from readable cookie
   * Note: Token is in httpOnly cookie and not accessible
   */
  private loadMetadataFromCookie(): void {
    if (typeof window === 'undefined') return;

    try {
      // Read metadata from non-httpOnly cookie
      const cookies = document.cookie.split(';');
      const metaCookie = cookies.find(c => c.trim().startsWith(`${RID_METADATA_COOKIE}=`));
      const csrfCookie = cookies.find(c => c.trim().startsWith(`${CSRF_TOKEN_COOKIE}=`));

      if (metaCookie) {
        const metaValue = metaCookie.split('=')[1];
        this.metadata = JSON.parse(decodeURIComponent(metaValue));

        // Clear if expired
        if (this.isExpired()) {
          this.clearToken();
        } else {
          this.scheduleRefresh();
        }
      }

      if (csrfCookie) {
        this.csrfToken = csrfCookie.split('=')[1];
      }
    } catch (error) {
      console.error('Failed to load metadata from cookie:', error);
    }
  }

  /**
   * Helper to get a cookie value by name
   */
  private getCookie(name: string): string | null {
    if (typeof window === 'undefined') return null;

    const cookies = document.cookie.split(';');
    const cookie = cookies.find(c => c.trim().startsWith(`${name}=`));
    return cookie ? cookie.split('=')[1] : null;
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

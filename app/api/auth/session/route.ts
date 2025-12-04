/**
 * Session management API route
 * Handles secure httpOnly cookie-based authentication
 * Replaces localStorage token storage to prevent XSS attacks
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { RID_TOKEN_EXPIRATION_MS } from '@/types/replay-api/settings';

// Cookie names
const RID_TOKEN_COOKIE = 'rid_token';
const RID_METADATA_COOKIE = 'rid_metadata';
const CSRF_TOKEN_COOKIE = 'csrf_token';

// Security headers
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  maxAge: RID_TOKEN_EXPIRATION_MS / 1000, // Convert to seconds
};

/**
 * Generate CSRF token
 */
function generateCSRFToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Validate CSRF token
 */
function validateCSRFToken(request: NextRequest): boolean {
  const cookieStore = cookies();
  const storedToken = cookieStore.get(CSRF_TOKEN_COOKIE)?.value;
  const headerToken = request.headers.get('X-CSRF-Token');

  return storedToken === headerToken && !!storedToken;
}

/**
 * GET /api/auth/session
 * Retrieve current session status and metadata
 */
export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const ridToken = cookieStore.get(RID_TOKEN_COOKIE)?.value;
    const ridMetadata = cookieStore.get(RID_METADATA_COOKIE)?.value;

    if (!ridToken || !ridMetadata) {
      return NextResponse.json(
        { authenticated: false, error: 'No active session' },
        { status: 401 }
      );
    }

    const metadata = JSON.parse(ridMetadata);

    // Check if token is expired
    const expiresAt = new Date(metadata.expiresAt);
    if (expiresAt <= new Date()) {
      // Clear expired cookies
      const response = NextResponse.json(
        { authenticated: false, error: 'Session expired' },
        { status: 401 }
      );

      response.cookies.delete(RID_TOKEN_COOKIE);
      response.cookies.delete(RID_METADATA_COOKIE);

      return response;
    }

    // Return session info (exclude actual token for security)
    return NextResponse.json({
      authenticated: true,
      metadata: {
        tokenId: metadata.tokenId,
        expiresAt: metadata.expiresAt,
        resourceOwner: metadata.resourceOwner,
        intendedAudience: metadata.intendedAudience,
      },
    });
  } catch (error) {
    console.error('Session retrieval error:', error);
    return NextResponse.json(
      { authenticated: false, error: 'Invalid session data' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/auth/session
 * Create new session with httpOnly cookies
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tokenId, resourceOwner, intendedAudience } = body;

    if (!tokenId || !resourceOwner) {
      return NextResponse.json(
        { error: 'Missing required fields: tokenId, resourceOwner' },
        { status: 400 }
      );
    }

    // Calculate expiration
    const expiresAt = new Date(Date.now() + RID_TOKEN_EXPIRATION_MS);

    const metadata = {
      tokenId,
      expiresAt: expiresAt.toISOString(),
      resourceOwner,
      intendedAudience: intendedAudience || 'user',
    };

    // Generate CSRF token
    const csrfToken = generateCSRFToken();

    const response = NextResponse.json({
      success: true,
      csrfToken, // Return CSRF token to client for subsequent requests
      expiresAt: expiresAt.toISOString(),
    });

    // Set httpOnly cookies
    response.cookies.set(RID_TOKEN_COOKIE, tokenId, COOKIE_OPTIONS);
    response.cookies.set(RID_METADATA_COOKIE, JSON.stringify(metadata), {
      ...COOKIE_OPTIONS,
      httpOnly: false, // Allow client to read metadata (not the token)
    });
    response.cookies.set(CSRF_TOKEN_COOKIE, csrfToken, {
      ...COOKIE_OPTIONS,
      httpOnly: false, // Client needs to read this for X-CSRF-Token header
    });

    return response;
  } catch (error) {
    console.error('Session creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create session' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/auth/session
 * Clear session and remove cookies
 */
export async function DELETE(request: NextRequest) {
  try {
    // CSRF validation for state-changing operation
    if (!validateCSRFToken(request)) {
      return NextResponse.json(
        { error: 'Invalid CSRF token' },
        { status: 403 }
      );
    }

    const response = NextResponse.json({ success: true });

    // Clear all auth cookies
    response.cookies.delete(RID_TOKEN_COOKIE);
    response.cookies.delete(RID_METADATA_COOKIE);
    response.cookies.delete(CSRF_TOKEN_COOKIE);

    return response;
  } catch (error) {
    console.error('Session deletion error:', error);
    return NextResponse.json(
      { error: 'Failed to delete session' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/auth/session
 * Refresh session token (extend expiration)
 */
export async function PATCH(request: NextRequest) {
  try {
    // CSRF validation
    if (!validateCSRFToken(request)) {
      return NextResponse.json(
        { error: 'Invalid CSRF token' },
        { status: 403 }
      );
    }

    const cookieStore = cookies();
    const ridToken = cookieStore.get(RID_TOKEN_COOKIE)?.value;
    const ridMetadata = cookieStore.get(RID_METADATA_COOKIE)?.value;

    if (!ridToken || !ridMetadata) {
      return NextResponse.json(
        { error: 'No active session to refresh' },
        { status: 401 }
      );
    }

    const metadata = JSON.parse(ridMetadata);

    // Extend expiration
    const newExpiresAt = new Date(Date.now() + RID_TOKEN_EXPIRATION_MS);
    metadata.expiresAt = newExpiresAt.toISOString();

    const response = NextResponse.json({
      success: true,
      expiresAt: newExpiresAt.toISOString(),
    });

    // Update cookies with new expiration
    response.cookies.set(RID_TOKEN_COOKIE, ridToken, COOKIE_OPTIONS);
    response.cookies.set(RID_METADATA_COOKIE, JSON.stringify(metadata), {
      ...COOKIE_OPTIONS,
      httpOnly: false,
    });

    return response;
  } catch (error) {
    console.error('Session refresh error:', error);
    return NextResponse.json(
      { error: 'Failed to refresh session' },
      { status: 500 }
    );
  }
}

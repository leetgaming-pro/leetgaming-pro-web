/**
 * Authentication headers API route
 * Reads httpOnly cookies server-side and returns auth headers
 * Used by client to get headers for replay-api requests
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

const RID_TOKEN_COOKIE = 'rid_token';
const RID_METADATA_COOKIE = 'rid_metadata';

/**
 * GET /api/auth/headers
 * Returns authentication headers for replay-api requests
 * Reads httpOnly cookie server-side (secure from XSS)
 * Returns empty headers (not 401) for unauthenticated users to allow public API access
 */
export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const ridToken = cookieStore.get(RID_TOKEN_COOKIE)?.value;
    const ridMetadata = cookieStore.get(RID_METADATA_COOKIE)?.value;

    // Return empty headers for unauthenticated users (allows public API access)
    if (!ridToken || !ridMetadata) {
      return NextResponse.json({ headers: {} });
    }

    let metadata;
    try {
      metadata = JSON.parse(ridMetadata);
    } catch {
      // Invalid metadata, return empty headers
      return NextResponse.json({ headers: {} });
    }

    // Check if token is expired - return empty headers (not error)
    const expiresAt = new Date(metadata.expiresAt);
    if (expiresAt <= new Date()) {
      return NextResponse.json({ headers: {}, expired: true });
    }

    // Return headers for replay-api
    const headers: Record<string, string> = {
      'X-Resource-Owner-ID': ridToken,
      'X-Intended-Audience': metadata.intendedAudience?.toString() || '1',
    };

    // Add resource owner context headers
    if (metadata.resourceOwner) {
      if (metadata.resourceOwner.tenant_id) {
        headers['X-Tenant-ID'] = metadata.resourceOwner.tenant_id;
      }
      if (metadata.resourceOwner.client_id) {
        headers['X-Client-ID'] = metadata.resourceOwner.client_id;
      }
      if (metadata.resourceOwner.group_id) {
        headers['X-Group-ID'] = metadata.resourceOwner.group_id;
      }
      if (metadata.resourceOwner.user_id) {
        headers['X-User-ID'] = metadata.resourceOwner.user_id;
      }
    }

    return NextResponse.json({ headers, authenticated: true });
  } catch (error) {
    console.error('Failed to get auth headers:', error);
    // Return empty headers on error, not 500
    return NextResponse.json({ headers: {} });
  }
}

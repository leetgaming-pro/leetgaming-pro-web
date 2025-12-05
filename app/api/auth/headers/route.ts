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
 */
export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const ridToken = cookieStore.get(RID_TOKEN_COOKIE)?.value;
    const ridMetadata = cookieStore.get(RID_METADATA_COOKIE)?.value;

    if (!ridToken || !ridMetadata) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const metadata = JSON.parse(ridMetadata);

    // Check if token is expired
    const expiresAt = new Date(metadata.expiresAt);
    if (expiresAt <= new Date()) {
      return NextResponse.json(
        { error: 'Session expired' },
        { status: 401 }
      );
    }

    // Return headers for replay-api
    const headers: Record<string, string> = {
      'X-Resource-Owner-ID': ridToken,
      'X-Intended-Audience': metadata.intendedAudience.toString(),
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

    return NextResponse.json({ headers });
  } catch (error) {
    console.error('Failed to get auth headers:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve authentication headers' },
      { status: 500 }
    );
  }
}

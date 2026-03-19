/**
 * Single notification API
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { getBackendUrl } from '@/lib/api/backend-url';
import {
  forwardAuthenticatedRequest,
  getAuthContextFromRequest,
} from '@/lib/auth/server-auth';

export const dynamic = 'force-dynamic';

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const { isAuthenticated } = getAuthContextFromRequest(session);

    if (!isAuthenticated) {
      return NextResponse.json({
        success: false,
        error: 'Authentication required',
      }, { status: 401 });
    }

    const backendUrl = getBackendUrl();
    const response = await forwardAuthenticatedRequest(
      `${backendUrl}/notifications/${params.id}`,
      {
        cache: 'no-store',
        headers: {
          'Content-Type': 'application/json',
        },
      },
      session ?? undefined,
    );

    const body = await response.text();

    return new NextResponse(body, {
      status: response.status,
      headers: {
        'Content-Type': response.headers.get('content-type') || 'application/json',
      },
    });
  } catch (error) {
    console.error('[API /api/notifications/[id]] GET error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch notification',
    }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const { isAuthenticated } = getAuthContextFromRequest(session);

    if (!isAuthenticated) {
      return NextResponse.json({
        success: false,
        error: 'Authentication required',
      }, { status: 401 });
    }

    const notificationId = params.id;
    const backendUrl = getBackendUrl();
    const response = await forwardAuthenticatedRequest(
      `${backendUrl}/notifications/${notificationId}`,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      },
      session ?? undefined,
    );

    const body = await response.text();

    return new NextResponse(body || JSON.stringify({ success: response.ok }), {
      status: response.status,
      headers: {
        'Content-Type': response.headers.get('content-type') || 'application/json',
      },
    });
  } catch (error) {
    console.error('[API /api/notifications/[id]] Error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to delete notification',
    }, { status: 500 });
  }
}


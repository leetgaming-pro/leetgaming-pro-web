/**
 * Mark notification as read API
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

export async function PUT(
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
      `${backendUrl}/notifications/${notificationId}/read`,
      {
        method: 'PUT',
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
    console.error('[API /api/notifications/[id]/read] Error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to mark notification as read',
    }, { status: 500 });
  }
}


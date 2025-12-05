/**
 * Account Deletion API Route
 * POST /api/account/delete - Request account deletion (GDPR right to erasure)
 * DELETE /api/account/delete - Cancel deletion request
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/options';
import { forwardAuthenticatedRequest } from '@/lib/auth/server-auth';

const BACKEND_URL = process.env.REPLAY_API_URL || 'http://localhost:30800';

/**
 * POST /api/account/delete
 * Request account deletion
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Validate deletion reason
    if (!body.reason) {
      return NextResponse.json(
        { success: false, error: 'Deletion reason is required' },
        { status: 400 }
      );
    }

    const response = await forwardAuthenticatedRequest(
      `${BACKEND_URL}/account/delete`,
      {
        method: 'POST',
        body: JSON.stringify({
          reason: body.reason,
          ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
          user_agent: request.headers.get('user-agent'),
        }),
      },
      session
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: data.error || 'Failed to request account deletion' },
        { status: response.status }
      );
    }

    return NextResponse.json(
      { success: true, data },
      { status: 201 }
    );
  } catch (error) {
    console.error('[API] Account deletion request error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to request account deletion' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/account/delete
 * Cancel pending account deletion request
 */
export async function DELETE(_request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const response = await forwardAuthenticatedRequest(
      `${BACKEND_URL}/account/delete`,
      { method: 'DELETE' },
      session
    );

    if (!response.ok) {
      const data = await response.json();
      return NextResponse.json(
        { success: false, error: data.error || 'Failed to cancel deletion request' },
        { status: response.status }
      );
    }

    return NextResponse.json(
      { success: true },
      { status: 200 }
    );
  } catch (error) {
    console.error('[API] Cancel deletion error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to cancel deletion request' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/account/delete
 * Get deletion request status
 */
export async function GET(_request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const response = await forwardAuthenticatedRequest(
      `${BACKEND_URL}/account/delete`,
      { method: 'GET' },
      session
    );

    if (response.status === 404) {
      return NextResponse.json(
        { success: true, data: null },
        { status: 200 }
      );
    }

    const data = await response.json();

    return NextResponse.json(
      { success: response.ok, data },
      { status: response.status }
    );
  } catch (error) {
    console.error('[API] Get deletion status error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get deletion status' },
      { status: 500 }
    );
  }
}

/**
 * Data Export API Route
 * POST /api/account/data-export - Request data export (GDPR/CCPA/LGPD)
 * GET /api/account/data-export - Get data export status
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/options';
import { forwardAuthenticatedRequest } from '@/lib/auth/server-auth';

const BACKEND_URL = process.env.REPLAY_API_URL || 'http://localhost:30800';

/**
 * POST /api/account/data-export
 * Request a new data export
 */
export async function POST(_request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const response = await forwardAuthenticatedRequest(
      `${BACKEND_URL}/account/data-export`,
      { method: 'POST' },
      session
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: data.error || 'Failed to request data export' },
        { status: response.status }
      );
    }

    return NextResponse.json(
      { success: true, data },
      { status: 201 }
    );
  } catch (error) {
    console.error('[API] Data export request error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to request data export' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/account/data-export
 * Get current data export request status
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
      `${BACKEND_URL}/account/data-export`,
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
    console.error('[API] Get data export status error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get data export status' },
      { status: 500 }
    );
  }
}

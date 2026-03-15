/**
 * Delete Direct Message API
 * DELETE /api/messages/[messageId]/delete
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { getBackendUrl } from '@/lib/api/backend-url';
import { getAuthHeadersFromCookies } from '@/lib/auth/server-auth';

export const dynamic = 'force-dynamic';

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { messageId: string } },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const authHeaders = getAuthHeadersFromCookies();
    const backendUrl = getBackendUrl();

    const response = await fetch(
      `${backendUrl}/messages/${params.messageId}/delete`,
      {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
      },
    );

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[API delete message] DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete message' }, { status: 500 });
  }
}

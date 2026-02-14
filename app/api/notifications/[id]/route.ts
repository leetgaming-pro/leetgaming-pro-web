/**
 * Single notification API
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({
        success: false,
        error: 'Authentication required',
      }, { status: 401 });
    }
    
    const notificationId = params.id;
    
    // In production, delete notification from database
    return NextResponse.json({
      success: true,
      message: `Notification ${notificationId} deleted`,
    });
    
  } catch (error) {
    console.error('[API /api/notifications/[id]] Error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to delete notification',
    }, { status: 500 });
  }
}


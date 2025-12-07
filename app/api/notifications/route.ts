/**
 * Notifications API
 * Handles fetching, creating, and managing user notifications
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

export const dynamic = 'force-dynamic';

// Mock notifications for now - in production, fetch from database
const getMockNotifications = (userId: string) => [
  {
    id: '1',
    type: 'match',
    title: 'Match Found!',
    message: 'Your ranked match is ready. Join now!',
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 min ago
    actionUrl: '/match-making',
  },
  {
    id: '2',
    type: 'team',
    title: 'Team Invite',
    message: 'You have been invited to join "Elite Squad"',
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 min ago
    actionUrl: '/teams',
  },
  {
    id: '3',
    type: 'replay',
    title: 'Replay Analyzed',
    message: 'Your latest replay has been processed. View your stats!',
    read: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    actionUrl: '/replays',
  },
];

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    // Return empty array for unauthenticated users (no error)
    if (!session?.user) {
      return NextResponse.json({
        success: true,
        data: [],
        unreadCount: 0,
      });
    }
    
    const userId = session.user.id || session.user.email || 'anonymous';
    const notifications = getMockNotifications(userId);
    const unreadCount = notifications.filter(n => !n.read).length;
    
    return NextResponse.json({
      success: true,
      data: notifications,
      unreadCount,
    });
    
  } catch (error) {
    console.error('[API /api/notifications] Error:', error);
    return NextResponse.json({
      success: true,
      data: [],
      unreadCount: 0,
    });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session?.user) {
      return NextResponse.json({
        success: false,
        error: 'Authentication required',
      }, { status: 401 });
    }
    
    // In production, delete all notifications for user
    return NextResponse.json({
      success: true,
      message: 'All notifications cleared',
    });
    
  } catch (error) {
    console.error('[API /api/notifications] Delete error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to delete notifications',
    }, { status: 500 });
  }
}


/**
 * Notifications API
 * Proxies to the replay-api backend notification system
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { getBackendUrl } from "@/lib/api/backend-url";
import { getAuthHeadersFromCookies } from "@/lib/auth/server-auth";

export const dynamic = "force-dynamic";

export async function GET(_request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({
        success: true,
        data: [],
        unreadCount: 0,
      });
    }

    const authHeaders = getAuthHeadersFromCookies();
    const backendUrl = getBackendUrl();

    const response = await fetch(`${backendUrl}/notifications`, {
      headers: {
        "Content-Type": "application/json",
        ...authHeaders,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return NextResponse.json({
        success: true,
        data: [],
        unreadCount: 0,
      });
    }

    const data = await response.json();

    return NextResponse.json({
      success: true,
      data: data.notifications || [],
      unreadCount: data.unread_count || 0,
    });
  } catch (error) {
    console.error("[API /api/notifications] Error:", error);
    return NextResponse.json({
      success: true,
      data: [],
      unreadCount: 0,
    });
  }
}

export async function DELETE(_request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        {
          success: false,
          error: "Authentication required",
        },
        { status: 401 }
      );
    }

    // In production, delete all notifications for user
    const authHeaders = getAuthHeadersFromCookies();
    const backendUrl = getBackendUrl();

    await fetch(`${backendUrl}/notifications`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders,
      },
    });

    return NextResponse.json({
      success: true,
      message: "All notifications cleared",
    });
  } catch (error) {
    console.error("[API /api/notifications] Delete error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete notifications",
      },
      { status: 500 }
    );
  }
}

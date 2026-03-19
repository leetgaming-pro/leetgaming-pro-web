/**
 * Notifications API
 * Proxies to the replay-api backend notification system
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { getBackendUrl } from "@/lib/api/backend-url";
import {
  forwardAuthenticatedRequest,
  getAuthContextFromRequest,
} from "@/lib/auth/server-auth";

export const dynamic = "force-dynamic";

export async function GET(_request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const { isAuthenticated } = getAuthContextFromRequest(session);

    if (!isAuthenticated) {
      return NextResponse.json({
        success: true,
        data: [],
        unreadCount: 0,
      });
    }

    const backendUrl = getBackendUrl();

    const response = await forwardAuthenticatedRequest(
      `${backendUrl}/notifications`,
      {
        cache: "no-store",
        headers: {
          "Content-Type": "application/json",
        },
      },
      session ?? undefined,
    );

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
    const { isAuthenticated } = getAuthContextFromRequest(session);

    if (!isAuthenticated) {
      return NextResponse.json(
        {
          success: false,
          error: "Authentication required",
        },
        { status: 401 }
      );
    }

    const backendUrl = getBackendUrl();

    const response = await forwardAuthenticatedRequest(
      `${backendUrl}/notifications`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      },
      session ?? undefined,
    );

    if (!response.ok) {
      const message = await response.text();

      return NextResponse.json(
        {
          success: false,
          error: message || "Failed to delete notifications",
        },
        { status: response.status },
      );
    }

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

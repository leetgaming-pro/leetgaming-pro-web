/**
 * Password Reset Confirmation API Route
 * POST - Confirm password reset with new password
 */

import { NextRequest, NextResponse } from "next/server";
import { logger } from "@/lib/logger";

const BACKEND_URL = process.env.REPLAY_API_URL || "http://localhost:8080";

/**
 * POST /api/auth/password-reset/confirm
 * Confirm password reset with token and new password
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, new_password } = body;

    if (!token) {
      return NextResponse.json(
        { success: false, error: "Token is required" },
        { status: 400 }
      );
    }

    if (!new_password) {
      return NextResponse.json(
        { success: false, error: "New password is required" },
        { status: 400 }
      );
    }

    if (new_password.length < 8) {
      return NextResponse.json(
        { success: false, error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    // Forward to backend
    const response = await fetch(`${BACKEND_URL}/auth/password-reset/confirm`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Forwarded-For":
          request.headers.get("x-forwarded-for") ||
          request.headers.get("x-real-ip") ||
          "",
        "User-Agent": request.headers.get("user-agent") || "",
      },
      body: JSON.stringify({
        token,
        new_password,
      }),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      logger.error("[API /api/auth/password-reset/confirm] Failed", {
        status: response.status,
        error: data,
      });
      return NextResponse.json(
        {
          success: false,
          message: data.message || data.error || "Failed to reset password",
        },
        { status: response.status >= 400 ? response.status : 400 }
      );
    }

    logger.info("[API /api/auth/password-reset/confirm] Password reset successful");

    return NextResponse.json({
      success: true,
      message: data.message || "Password reset successfully",
    });
  } catch (error) {
    logger.error("[API /api/auth/password-reset/confirm] Error", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to reset password",
      },
      { status: 500 }
    );
  }
}


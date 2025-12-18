/**
 * Password Reset API Route
 * POST - Request password reset email
 */

import { NextRequest, NextResponse } from "next/server";
import { logger } from "@/lib/logger";

const BACKEND_URL = process.env.REPLAY_API_URL || "http://localhost:8080";

/**
 * POST /api/auth/password-reset
 * Request a password reset email
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { success: false, error: "Email is required" },
        { status: 400 }
      );
    }

    // Forward to backend
    const response = await fetch(`${BACKEND_URL}/auth/password-reset`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Forwarded-For":
          request.headers.get("x-forwarded-for") ||
          request.headers.get("x-real-ip") ||
          "",
        "User-Agent": request.headers.get("user-agent") || "",
      },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();

    // Always return success to prevent email enumeration
    logger.info("[API /api/auth/password-reset] Reset request processed", {
      email,
      backendStatus: response.status,
    });

    return NextResponse.json({
      success: true,
      message:
        "If an account exists with this email, a password reset link will be sent",
      expiresAt: data.expires_at,
    });
  } catch (error) {
    logger.error("[API /api/auth/password-reset] Error", error);
    // Still return success to prevent enumeration
    return NextResponse.json({
      success: true,
      message:
        "If an account exists with this email, a password reset link will be sent",
    });
  }
}


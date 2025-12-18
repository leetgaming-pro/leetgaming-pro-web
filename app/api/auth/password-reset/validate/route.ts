/**
 * Password Reset Token Validation API Route
 * GET - Validate a password reset token
 */

import { NextRequest, NextResponse } from "next/server";
import { logger } from "@/lib/logger";

const BACKEND_URL = process.env.REPLAY_API_URL || "http://localhost:8080";

/**
 * GET /api/auth/password-reset/validate?token=xxx
 * Validate a password reset token
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json(
        { valid: false, error: "Token is required" },
        { status: 400 }
      );
    }

    // Forward to backend
    const response = await fetch(
      `${BACKEND_URL}/auth/password-reset/validate?token=${encodeURIComponent(token)}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        {
          valid: false,
          message: data.message || data.error || "Invalid or expired token",
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      valid: true,
      email: data.email,
      expiresAt: data.expires_at,
    });
  } catch (error) {
    logger.error("[API /api/auth/password-reset/validate] Error", error);
    return NextResponse.json(
      { valid: false, error: "Failed to validate token" },
      { status: 500 }
    );
  }
}


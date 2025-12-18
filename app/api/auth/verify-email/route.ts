/**
 * Email Verification API Routes
 * GET - Verify email with token (from email link)
 * POST - Send verification code
 * PUT - Verify code
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../[...nextauth]/options";
import { forwardAuthenticatedRequest } from "@/lib/auth/server-auth";
import { logger } from "@/lib/logger";

const BACKEND_URL = process.env.REPLAY_API_URL || "http://localhost:8080";

/**
 * GET /api/auth/verify-email?token=xxx
 * Verify email using the token from the verification email link
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          verified: false,
          error: "Verification token is required",
        },
        { status: 400 }
      );
    }

    // Forward to backend to verify email token
    // This endpoint doesn't require authentication as user clicks from email
    const response = await fetch(
      `${BACKEND_URL}/auth/verify-email?token=${encodeURIComponent(token)}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "X-Forwarded-For":
            request.headers.get("x-forwarded-for") ||
            request.headers.get("x-real-ip") ||
            "",
          "User-Agent": request.headers.get("user-agent") || "",
        },
      }
    );

    const data = await response.json();

    if (!response.ok && response.status !== 400) {
      logger.error("[API /api/auth/verify-email GET] Backend error", {
        status: response.status,
        error: data,
      });
      return NextResponse.json(
        {
          success: false,
          verified: false,
          error: data.error || data.message || "Verification failed",
        },
        { status: response.status }
      );
    }

    // Return the backend response
    if (data.verified || data.success) {
      logger.info(
        "[API /api/auth/verify-email GET] Email verified successfully via token"
      );
      return NextResponse.json({
        success: true,
        verified: true,
        message: data.message || "Email verified successfully",
      });
    }

    return NextResponse.json(
      {
        success: false,
        verified: false,
        message: data.message || "Verification failed",
        remainingAttempts: data.remaining_attempts,
      },
      { status: 400 }
    );
  } catch (error) {
    logger.error(
      "[API /api/auth/verify-email GET] Error verifying email token",
      error
    );
    return NextResponse.json(
      {
        success: false,
        verified: false,
        error:
          error instanceof Error ? error.message : "Failed to verify email",
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/auth/verify-email
 * Request a new verification code to be sent
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { success: false, error: "Email is required" },
        { status: 400 }
      );
    }

    // Forward to backend to send verification email
    const response = await forwardAuthenticatedRequest(
      `${BACKEND_URL}/auth/verification/send`,
      {
        method: "POST",
        body: JSON.stringify({ email }),
      },
      session
    );

    const data = await response.json();

    if (!response.ok) {
      logger.error("[API /api/auth/verify-email] Backend error", {
        status: response.status,
        error: data,
      });
      return NextResponse.json(
        {
          success: false,
          error:
            data.error || data.message || "Failed to send verification email",
        },
        { status: response.status }
      );
    }

    logger.info("[API /api/auth/verify-email] Verification email sent", {
      email,
    });

    return NextResponse.json({
      success: true,
      message: "Verification email sent",
      expiresAt: data.expires_at,
    });
  } catch (error) {
    logger.error(
      "[API /api/auth/verify-email] Error sending verification email",
      error
    );
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to send verification email",
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/auth/verify-email
 * Verify the email with the provided code
 */
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { email, code } = body;

    if (!email || !code) {
      return NextResponse.json(
        { success: false, error: "Email and verification code are required" },
        { status: 400 }
      );
    }

    // Forward to backend to verify email
    const response = await forwardAuthenticatedRequest(
      `${BACKEND_URL}/auth/verify-email`,
      {
        method: "POST",
        body: JSON.stringify({ code }),
      },
      session
    );

    const data = await response.json();

    if (!response.ok) {
      logger.error("[API /api/auth/verify-email] Verification failed", {
        status: response.status,
        error: data,
      });
      return NextResponse.json(
        {
          success: false,
          error:
            data.error ||
            data.message ||
            "Invalid or expired verification code",
        },
        { status: response.status }
      );
    }

    logger.info("[API /api/auth/verify-email] Email verified successfully", {
      email,
    });

    return NextResponse.json({
      success: true,
      message: "Email verified successfully",
      verified: true,
    });
  } catch (error) {
    logger.error("[API /api/auth/verify-email] Error verifying email", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to verify email",
      },
      { status: 500 }
    );
  }
}

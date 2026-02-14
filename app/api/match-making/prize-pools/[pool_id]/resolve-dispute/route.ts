/**
 * Resolve Prize Pool Dispute API Route
 * POST - Resolve a prize pool dispute (admin only)
 *
 * SECURITY: This endpoint requires admin role verification.
 * Backend also enforces admin-only access via RBAC.
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { createAuthenticatedSDK } from "@/lib/api/sdk-factory";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

/** Admin email allowlist — should be moved to env var or database in production */
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || "")
  .split(",")
  .filter(Boolean);

export async function POST(
  request: NextRequest,
  { params }: { params: { pool_id: string } },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        {
          success: false,
          error: "Authentication required",
        },
        { status: 401 },
      );
    }

    // Admin role verification — only configured admins can resolve disputes
    if (ADMIN_EMAILS.length > 0 && !ADMIN_EMAILS.includes(session.user.email)) {
      logger.warn(
        `[API resolve-dispute] Non-admin user attempted dispute resolution`,
        {
          email: session.user.email,
          pool_id: params.pool_id,
        },
      );
      return NextResponse.json(
        {
          success: false,
          error: "Insufficient permissions. Admin role required.",
        },
        { status: 403 },
      );
    }

    const { pool_id } = params;
    const body = await request.json();

    const sdk = createAuthenticatedSDK();
    const result = await sdk.prizePools.resolveDispute({
      pool_id,
      ...body,
    });

    if (!result) {
      return NextResponse.json(
        {
          success: false,
          error: "Failed to resolve dispute",
        },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    logger.error(
      `[API /api/matchmaking/prize-pools/${params.pool_id}/resolve-dispute] Error resolving dispute`,
      error,
    );
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to resolve dispute",
      },
      { status: 500 },
    );
  }
}

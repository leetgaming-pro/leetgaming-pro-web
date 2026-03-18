/**
 * Refund Prize Pool API Route
 * POST - Refund prize pool when match is cancelled
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { createAuthenticatedSDK } from "@/lib/api/sdk-factory";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

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

    const { pool_id } = params;
    const body = await request.json();

    const sdk = createAuthenticatedSDK(session);
    const result = await sdk.prizePools.refundPrizePool({
      pool_id,
      ...body,
    });

    if (!result) {
      return NextResponse.json(
        {
          success: false,
          error: "Failed to refund prize pool",
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
      `[API /api/matchmaking/prize-pools/${params.pool_id}/refund] Error refunding prize pool`,
      error,
    );
    const status = (error as Record<string, unknown>)?.status;
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to refund prize pool",
      },
      { status: typeof status === "number" && status >= 400 ? status : 500 },
    );
  }
}

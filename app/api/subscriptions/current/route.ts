/**
 * Current Subscription API Route Handler
 * GET /api/subscriptions/current - Get current user's subscription
 */

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";
import { logger } from "@/lib/logger";
import { createAuthenticatedSDK } from "@/lib/api/sdk-factory";
import { SubscriptionsAPI } from "@/types/replay-api/subscriptions.sdk";

/**
 * GET /api/subscriptions/current
 * Get the current user's subscription
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 },
      );
    }

    const sdk = createAuthenticatedSDK();
    const subscriptionsApi = new SubscriptionsAPI(sdk.client);
    const subscription = await subscriptionsApi.getCurrentSubscription();

    return NextResponse.json(
      { success: true, data: subscription },
      { status: 200 },
    );
  } catch (error) {
    logger.error("[API /api/subscriptions/current] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch subscription" },
      { status: 500 },
    );
  }
}

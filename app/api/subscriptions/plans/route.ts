/**
 * Subscription Plans API Route Handler
 * GET /api/subscriptions/plans - Get available subscription plans
 */

import { NextResponse } from "next/server";
import { logger } from "@/lib/logger";
import { createPublicSDK } from "@/lib/api/sdk-factory";
import { SubscriptionsAPI } from "@/types/replay-api/subscriptions.sdk";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * GET /api/subscriptions/plans
 * Get available subscription plans (public endpoint, no auth required)
 */
export async function GET() {
  try {
    const sdk = createPublicSDK();
    const subscriptionsApi = new SubscriptionsAPI(sdk.client);
    const plans = await subscriptionsApi.getPlans();

    if (!plans) {
      return NextResponse.json(
        { success: false, error: "Failed to fetch subscription plans" },
        { status: 500 },
      );
    }

    return NextResponse.json(
      { success: true, data: plans.data },
      { status: 200 },
    );
  } catch (error) {
    logger.error("[API /api/subscriptions/plans] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch subscription plans" },
      { status: 500 },
    );
  }
}

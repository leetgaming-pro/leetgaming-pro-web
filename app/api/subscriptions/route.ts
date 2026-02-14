/**
 * Subscriptions API Route Handler
 * Provides CRUD operations for user subscriptions
 *
 * Endpoints:
 * GET /api/subscriptions - Get user's subscription
 * POST /api/subscriptions - Create subscription
 * PUT /api/subscriptions - Update subscription
 * DELETE /api/subscriptions - Cancel subscription
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import { logger } from "@/lib/logger";
import { createAuthenticatedSDK } from "@/lib/api/sdk-factory";
import { SubscriptionsAPI } from "@/types/replay-api/subscriptions.sdk";

/**
 * GET /api/subscriptions
 * Get the current user's subscription
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    const sdk = createAuthenticatedSDK();
    const subscriptionsApi = new SubscriptionsAPI(sdk.client);
    const subscription = await subscriptionsApi.getCurrentSubscription();

    return NextResponse.json(
      { success: true, data: subscription },
      { status: 200 }
    );
  } catch (error) {
    logger.error("[API /api/subscriptions] GET Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch subscription" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/subscriptions
 * Create a new subscription
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
    const sdk = createAuthenticatedSDK();
    const subscriptionsApi = new SubscriptionsAPI(sdk.client);
    const subscription = await subscriptionsApi.create(body);

    if (!subscription) {
      return NextResponse.json(
        { success: false, error: "Failed to create subscription" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, data: subscription },
      { status: 201 }
    );
  } catch (error) {
    logger.error("[API /api/subscriptions] POST Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create subscription" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/subscriptions
 * Update the current subscription
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
    const sdk = createAuthenticatedSDK();
    const subscriptionsApi = new SubscriptionsAPI(sdk.client);
    const subscription = await subscriptionsApi.update(body.subscription_id, body);

    if (!subscription) {
      return NextResponse.json(
        { success: false, error: "Failed to update subscription" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, data: subscription },
      { status: 200 }
    );
  } catch (error) {
    logger.error("[API /api/subscriptions] PUT Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update subscription" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/subscriptions
 * Cancel the current subscription
 */
export async function DELETE() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    const sdk = createAuthenticatedSDK();
    const subscriptionsApi = new SubscriptionsAPI(sdk.client);
    const result = await subscriptionsApi.cancel("current");

    if (!result) {
      return NextResponse.json(
        { success: false, error: "Failed to cancel subscription" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, message: "Subscription canceled" },
      { status: 200 }
    );
  } catch (error) {
    logger.error("[API /api/subscriptions] DELETE Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to cancel subscription" },
      { status: 500 }
    );
  }
}

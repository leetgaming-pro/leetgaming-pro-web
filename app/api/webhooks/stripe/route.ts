/**
 * Stripe Webhook Handler
 * POST - Handle Stripe webhook events
 *
 * This endpoint receives webhooks from Stripe and forwards them to the backend.
 * Note: Webhook signature verification is done by the backend.
 */

import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { ReplayApiSettingsMock } from '@/types/replay-api/settings';

export const dynamic = 'force-dynamic';

// Note: In App Router, request.text() automatically gives us the raw body
// No need for bodyParser config as in Pages Router

export async function POST(request: NextRequest) {
  try {
    // Get raw body
    const body = await request.text();

    // Get Stripe signature header
    const signature = request.headers.get('stripe-signature');
    if (!signature) {
      logger.error('[Stripe Webhook] Missing Stripe-Signature header');
      return NextResponse.json({
        error: 'Missing Stripe-Signature header',
      }, { status: 400 });
    }

    // Forward to backend
    const response = await fetch(`${ReplayApiSettingsMock.baseUrl}/webhooks/stripe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Stripe-Signature': signature,
      },
      body,
    });

    if (!response.ok) {
      const error = await response.text().catch(() => 'Failed to process webhook');
      logger.error('[Stripe Webhook] Backend error', { status: response.status, error });
      // Return 200 to Stripe to prevent retries - we log the error
      return NextResponse.json({ received: true }, { status: 200 });
    }

    logger.info('[Stripe Webhook] Processed successfully');
    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    logger.error('[Stripe Webhook] Error processing webhook', error);
    // Return 200 to Stripe to prevent retries
    return NextResponse.json({ received: true }, { status: 200 });
  }
}

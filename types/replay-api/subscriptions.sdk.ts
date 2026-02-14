/**
 * Subscriptions API SDK
 * Clean, minimal API wrapper for subscription operations
 */

import { ReplayApiClient } from "./replay-api.client";

/**
 * Billing period options
 */
export type BillingPeriod = "monthly" | "quarterly" | "yearly";

/**
 * Subscription status
 */
export type SubscriptionStatus =
  | "active"
  | "trialing"
  | "past_due"
  | "canceled"
  | "paused"
  | "incomplete";

/**
 * Pricing plan structure
 */
export interface Plan {
  id: string;
  key: string;
  name: string;
  description: string;
  price: {
    monthly: number;
    quarterly: number;
    yearly: number;
    currency: string;
  };
  features: string[];
  highlighted?: boolean;
  badge?: string;
  stripePriceId?: string;
}

/**
 * Subscription entity
 */
export interface Subscription {
  id: string;
  plan_id: string;
  plan: Plan;
  status: SubscriptionStatus;
  billing_period: BillingPeriod;
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  canceled_at?: string;
  trial_start?: string;
  trial_end?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Plans list response
 */
export interface PlansResult {
  data: Plan[];
  total_count: number;
}

/**
 * Create subscription request
 */
export interface CreateSubscriptionRequest {
  plan_id: string;
  billing_period: BillingPeriod;
  payment_method_id?: string;
  promo_code?: string;
}

/**
 * Update subscription request
 */
export interface UpdateSubscriptionRequest {
  plan_id?: string;
  billing_period?: BillingPeriod;
  promo_code?: string;
}

/**
 * SubscriptionsAPI provides type-safe access to subscription endpoints
 */
export class SubscriptionsAPI {
  constructor(private client: ReplayApiClient) {}

  /**
   * Get available subscription plans
   */
  async getPlans(): Promise<PlansResult | null> {
    const response = await this.client.get<PlansResult>("/subscriptions/plans");
    if (response.error) {
      console.error("Failed to fetch plans:", response.error);
      return null;
    }
    return response.data || null;
  }

  /**
   * Get a single plan by ID
   */
  async getPlan(planId: string): Promise<Plan | null> {
    const response = await this.client.get<Plan>(
      `/subscriptions/plans/${planId}`,
    );
    if (response.error) {
      console.error("Failed to fetch plan:", response.error);
      return null;
    }
    return response.data || null;
  }

  /**
   * Get the current user's subscription
   * Returns null if user has no subscription (handles "Invalid subscription ID" gracefully)
   */
  async getCurrentSubscription(): Promise<Subscription | null> {
    try {
      const response = await this.client.get<Subscription>(
        "/subscriptions/current",
      );
      if (response.error) {
        // Not found or invalid is expected when user has no subscription
        return null;
      }
      return response.data || null;
    } catch (err: unknown) {
      // Handle "Invalid subscription ID" or similar errors gracefully
      // These are expected when user has no active subscription
      const errorMessage = err instanceof Error ? err.message : String(err);
      if (
        errorMessage.includes("Invalid subscription") ||
        errorMessage.includes("not found") ||
        errorMessage.includes("no subscription")
      ) {
        // Silently return null - this is expected behavior
        return null;
      }
      // Log unexpected errors but don't throw
      console.error("Failed to fetch current subscription:", err);
      return null;
    }
  }

  /**
   * Create a new subscription
   */
  async create(
    request: CreateSubscriptionRequest,
  ): Promise<Subscription | null> {
    const response = await this.client.post<Subscription>(
      "/subscriptions",
      request,
    );
    if (response.error) {
      console.error("Failed to create subscription:", response.error);
      return null;
    }
    return response.data || null;
  }

  /**
   * Update subscription (change plan or billing period)
   */
  async update(
    subscriptionId: string,
    request: UpdateSubscriptionRequest,
  ): Promise<Subscription | null> {
    const response = await this.client.put<Subscription>(
      `/subscriptions/${subscriptionId}`,
      request,
    );
    if (response.error) {
      console.error("Failed to update subscription:", response.error);
      return null;
    }
    return response.data || null;
  }

  /**
   * Cancel a subscription at the end of the current period
   */
  async cancel(subscriptionId: string): Promise<Subscription | null> {
    const response = await this.client.post<Subscription>(
      `/subscriptions/${subscriptionId}/cancel`,
      {},
    );
    if (response.error) {
      console.error("Failed to cancel subscription:", response.error);
      return null;
    }
    return response.data || null;
  }

  /**
   * Reactivate a canceled subscription (before period end)
   */
  async reactivate(subscriptionId: string): Promise<Subscription | null> {
    const response = await this.client.post<Subscription>(
      `/subscriptions/${subscriptionId}/reactivate`,
      {},
    );
    if (response.error) {
      console.error("Failed to reactivate subscription:", response.error);
      return null;
    }
    return response.data || null;
  }

  /**
   * Pause a subscription
   */
  async pause(subscriptionId: string): Promise<Subscription | null> {
    const response = await this.client.post<Subscription>(
      `/subscriptions/${subscriptionId}/pause`,
      {},
    );
    if (response.error) {
      console.error("Failed to pause subscription:", response.error);
      return null;
    }
    return response.data || null;
  }

  /**
   * Resume a paused subscription
   */
  async resume(subscriptionId: string): Promise<Subscription | null> {
    const response = await this.client.post<Subscription>(
      `/subscriptions/${subscriptionId}/resume`,
      {},
    );
    if (response.error) {
      console.error("Failed to resume subscription:", response.error);
      return null;
    }
    return response.data || null;
  }

  /**
   * Preview an upgrade/downgrade
   */
  async previewChange(
    subscriptionId: string,
    newPlanId: string,
  ): Promise<{
    proration_amount: number;
    new_amount: number;
    currency: string;
  } | null> {
    const response = await this.client.get<{
      proration_amount: number;
      new_amount: number;
      currency: string;
    }>(`/subscriptions/${subscriptionId}/preview-change?plan_id=${newPlanId}`);
    if (response.error) {
      console.error("Failed to preview subscription change:", response.error);
      return null;
    }
    return response.data || null;
  }

  /**
   * Upgrade subscription to a higher plan
   */
  async upgrade(request: {
    plan_id: string;
    billing_period?: BillingPeriod;
    payment_method?: string;
    args?: Record<string, unknown>;
  }): Promise<{ success: boolean; message: string } | null> {
    const response = await this.client.post<{
      success: boolean;
      message: string;
    }>("/subscriptions/upgrade", request);
    if (response.error) {
      console.error("Failed to upgrade subscription:", response.error);
      return null;
    }
    return response.data || null;
  }

  /**
   * Downgrade subscription to a lower plan
   */
  async downgrade(request: {
    plan_id: string;
    args?: Record<string, unknown>;
  }): Promise<{ success: boolean; message: string } | null> {
    const response = await this.client.post<{
      success: boolean;
      message: string;
    }>("/subscriptions/downgrade", request);
    if (response.error) {
      console.error("Failed to downgrade subscription:", response.error);
      return null;
    }
    return response.data || null;
  }

  /**
   * Checkout: Create/upgrade subscription after payment
   * This orchestrates payment → subscription activation
   */
  async checkout(request: CheckoutRequest): Promise<CheckoutResult | null> {
    const response = await this.client.post<CheckoutResult>(
      "/checkout",
      request,
    );
    if (response.error) {
      console.error("Failed to process checkout:", response.error);
      return null;
    }
    return response.data || null;
  }
}

/**
 * Checkout request for payment → subscription activation
 */
export interface CheckoutRequest {
  plan_id: string;
  payment_id?: string;
  billing_period: BillingPeriod;
  args?: Record<string, unknown>;
}

/**
 * Checkout result after successful subscription activation
 */
export interface CheckoutResult {
  success: boolean;
  subscription_id: string;
  plan_id: string;
  status: string;
  message: string;
}

// Types are exported inline above with their declarations
// Additional type aliases for convenience
export type SubscriptionBillingPeriod = BillingPeriod;
export type SubscriptionPlan = Plan;

/**
 * Subscriptions API SDK
 * Clean, minimal API wrapper for subscription operations
 */

import { ReplayApiClient } from './replay-api.client';

/**
 * Billing period options
 */
export type BillingPeriod = 'monthly' | 'quarterly' | 'yearly';

/**
 * Subscription status
 */
export type SubscriptionStatus = 
  | 'active' 
  | 'trialing' 
  | 'past_due' 
  | 'canceled' 
  | 'paused' 
  | 'incomplete';

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
    const response = await this.client.get<PlansResult>('/subscriptions/plans');
    if (response.error) {
      console.error('Failed to fetch plans:', response.error);
      return null;
    }
    return response.data || null;
  }

  /**
   * Get a single plan by ID
   */
  async getPlan(planId: string): Promise<Plan | null> {
    const response = await this.client.get<Plan>(`/subscriptions/plans/${planId}`);
    if (response.error) {
      console.error('Failed to fetch plan:', response.error);
      return null;
    }
    return response.data || null;
  }

  /**
   * Get the current user's subscription
   */
  async getCurrentSubscription(): Promise<Subscription | null> {
    const response = await this.client.get<Subscription>('/subscriptions/current');
    if (response.error) {
      console.error('Failed to fetch current subscription:', response.error);
      return null;
    }
    return response.data || null;
  }

  /**
   * Create a new subscription
   */
  async create(request: CreateSubscriptionRequest): Promise<Subscription | null> {
    const response = await this.client.post<Subscription>('/subscriptions', request);
    if (response.error) {
      console.error('Failed to create subscription:', response.error);
      return null;
    }
    return response.data || null;
  }

  /**
   * Update subscription (change plan or billing period)
   */
  async update(subscriptionId: string, request: UpdateSubscriptionRequest): Promise<Subscription | null> {
    const response = await this.client.put<Subscription>(`/subscriptions/${subscriptionId}`, request);
    if (response.error) {
      console.error('Failed to update subscription:', response.error);
      return null;
    }
    return response.data || null;
  }

  /**
   * Cancel a subscription at the end of the current period
   */
  async cancel(subscriptionId: string): Promise<Subscription | null> {
    const response = await this.client.post<Subscription>(`/subscriptions/${subscriptionId}/cancel`, {});
    if (response.error) {
      console.error('Failed to cancel subscription:', response.error);
      return null;
    }
    return response.data || null;
  }

  /**
   * Reactivate a canceled subscription (before period end)
   */
  async reactivate(subscriptionId: string): Promise<Subscription | null> {
    const response = await this.client.post<Subscription>(`/subscriptions/${subscriptionId}/reactivate`, {});
    if (response.error) {
      console.error('Failed to reactivate subscription:', response.error);
      return null;
    }
    return response.data || null;
  }

  /**
   * Pause a subscription
   */
  async pause(subscriptionId: string): Promise<Subscription | null> {
    const response = await this.client.post<Subscription>(`/subscriptions/${subscriptionId}/pause`, {});
    if (response.error) {
      console.error('Failed to pause subscription:', response.error);
      return null;
    }
    return response.data || null;
  }

  /**
   * Resume a paused subscription
   */
  async resume(subscriptionId: string): Promise<Subscription | null> {
    const response = await this.client.post<Subscription>(`/subscriptions/${subscriptionId}/resume`, {});
    if (response.error) {
      console.error('Failed to resume subscription:', response.error);
      return null;
    }
    return response.data || null;
  }

  /**
   * Preview an upgrade/downgrade
   */
  async previewChange(subscriptionId: string, newPlanId: string): Promise<{
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
      console.error('Failed to preview subscription change:', response.error);
      return null;
    }
    return response.data || null;
  }
}

// Types are exported inline above with their declarations
// Additional type aliases for convenience
export type SubscriptionBillingPeriod = BillingPeriod;
export type SubscriptionPlan = Plan;



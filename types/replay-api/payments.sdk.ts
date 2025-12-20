/**
 * @deprecated Use `ReplayAPISDK.payment` from `@/types/replay-api/sdk` instead.
 * This file is kept for backwards compatibility but will be removed in a future version.
 *
 * Migration:
 * ```typescript
 * // OLD (deprecated)
 * import { paymentsSDK } from '@/types/replay-api/payments.sdk';
 * await paymentsSDK.createPaymentIntent(request);
 *
 * // NEW (recommended)
 * import { ReplayAPISDK } from '@/types/replay-api/sdk';
 * import { ReplayApiSettingsMock } from '@/types/replay-api/settings';
 * import { logger } from '@/lib/logger';
 * const sdk = new ReplayAPISDK({ ...ReplayApiSettingsMock, baseUrl: '/api' }, logger);
 * await sdk.payment.createPaymentIntent(request);
 * ```
 */

import { Loggable } from "@/lib/logger";

export type PaymentProvider = "stripe" | "paypal" | "crypto" | "bank";
export type PaymentType = "deposit" | "withdrawal" | "subscription";
export type PaymentStatus =
  | "pending"
  | "processing"
  | "succeeded"
  | "failed"
  | "canceled"
  | "refunded";

export interface CreatePaymentIntentRequest {
  wallet_id: string;
  amount: number; // in cents
  currency?: string;
  payment_type?: PaymentType;
  provider?: PaymentProvider;
  metadata?: Record<string, unknown>;
}

export interface CreatePaymentIntentResponse {
  payment_id: string;
  client_secret?: string; // For Stripe Elements
  redirect_url?: string; // For PayPal
  crypto_address?: string; // For Crypto
  status: PaymentStatus;
}

export interface Payment {
  id: string;
  user_id: string;
  wallet_id: string;
  type: PaymentType;
  provider: PaymentProvider;
  status: PaymentStatus;
  amount: number;
  currency: string;
  fee: number;
  net_amount: number;
  provider_payment_id?: string;
  created_at: string;
  updated_at: string;
  completed_at?: string;
  failure_reason?: string;
}

export interface ConfirmPaymentRequest {
  payment_method_id?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export class PaymentsSDK {
  private baseUrl: string;
  private logger: Loggable;

  constructor(baseUrl: string, logger: Loggable) {
    this.baseUrl = baseUrl;
    this.logger = logger;
  }

  /**
   * Create a payment intent
   */
  async createPaymentIntent(
    request: CreatePaymentIntentRequest
  ): Promise<CreatePaymentIntentResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/payments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
        credentials: "include",
      });

      const result: ApiResponse<CreatePaymentIntentResponse> =
        await response.json();

      if (!result.success || !result.data) {
        throw new Error(result.error || "Failed to create payment intent");
      }

      this.logger.info("[PaymentsSDK] Payment intent created", {
        payment_id: result.data.payment_id,
      });
      return result.data;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Unknown error";
      this.logger.error("[PaymentsSDK] Failed to create payment intent", {
        error: message,
      });
      throw error;
    }
  }

  /**
   * Get a specific payment
   */
  async getPayment(paymentId: string): Promise<Payment> {
    try {
      const response = await fetch(`${this.baseUrl}/payments/${paymentId}`, {
        method: "GET",
        credentials: "include",
      });

      const result: ApiResponse<Payment> = await response.json();

      if (!result.success || !result.data) {
        throw new Error(result.error || "Failed to get payment");
      }

      return result.data;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Unknown error";
      this.logger.error("[PaymentsSDK] Failed to get payment", {
        error: message,
        paymentId,
      });
      throw error;
    }
  }

  /**
   * Get user's payments
   */
  async getUserPayments(): Promise<Payment[]> {
    try {
      const response = await fetch(`${this.baseUrl}/payments`, {
        method: "GET",
        credentials: "include",
      });

      const result: ApiResponse<Payment[]> = await response.json();

      if (!result.success || !result.data) {
        throw new Error(result.error || "Failed to get payments");
      }

      return result.data;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Unknown error";
      this.logger.error("[PaymentsSDK] Failed to get payments", {
        error: message,
      });
      throw error;
    }
  }

  /**
   * Confirm a payment
   */
  async confirmPayment(
    paymentId: string,
    request?: ConfirmPaymentRequest
  ): Promise<Payment> {
    try {
      const response = await fetch(
        `${this.baseUrl}/payments/${paymentId}/confirm`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(request || {}),
          credentials: "include",
        }
      );

      const result: ApiResponse<Payment> = await response.json();

      if (!result.success || !result.data) {
        throw new Error(result.error || "Failed to confirm payment");
      }

      this.logger.info("[PaymentsSDK] Payment confirmed", {
        payment_id: paymentId,
      });
      return result.data;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Unknown error";
      this.logger.error("[PaymentsSDK] Failed to confirm payment", {
        error: message,
        paymentId,
      });
      throw error;
    }
  }

  /**
   * Cancel a payment
   */
  async cancelPayment(paymentId: string): Promise<Payment> {
    try {
      const response = await fetch(
        `${this.baseUrl}/payments/${paymentId}/cancel`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );

      const result: ApiResponse<Payment> = await response.json();

      if (!result.success || !result.data) {
        throw new Error(result.error || "Failed to cancel payment");
      }

      this.logger.info("[PaymentsSDK] Payment cancelled", {
        payment_id: paymentId,
      });
      return result.data;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Unknown error";
      this.logger.error("[PaymentsSDK] Failed to cancel payment", {
        error: message,
        paymentId,
      });
      throw error;
    }
  }
}

// Export singleton instance
import { logger } from "@/lib/logger";
export const paymentsSDK = new PaymentsSDK("/api", logger);

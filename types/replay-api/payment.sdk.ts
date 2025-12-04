/**
 * Payment API SDK
 * Clean, minimal API wrapper for payment operations
 */

import { ReplayApiClient } from './replay-api.client';
import type {
  Payment,
  PaymentsResult,
  PaymentIntentResult,
  PaymentFilters,
  CreatePaymentIntentRequest,
  ConfirmPaymentRequest,
  RefundPaymentRequest,
  CancelPaymentRequest,
} from './payment.types';

export class PaymentAPI {
  constructor(private client: ReplayApiClient) {}

  /**
   * Get a single payment by ID
   */
  async getPayment(paymentId: string): Promise<Payment | null> {
    const response = await this.client.get<Payment>(`/payments/${paymentId}`);
    if (response.error) {
      console.error('Failed to fetch payment:', response.error);
      return null;
    }
    return response.data || null;
  }

  /**
   * Get payments for the current user
   */
  async getPayments(filters: PaymentFilters = {}): Promise<PaymentsResult | null> {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, String(value));
      }
    });

    const queryString = params.toString();
    const url = queryString ? `/payments?${queryString}` : '/payments';

    const response = await this.client.get<PaymentsResult>(url);
    if (response.error) {
      console.error('Failed to fetch payments:', response.error);
      return null;
    }
    return response.data || null;
  }

  /**
   * Create a payment intent
   */
  async createPaymentIntent(request: CreatePaymentIntentRequest): Promise<PaymentIntentResult | null> {
    const response = await this.client.post<PaymentIntentResult>('/payments/intent', request);
    if (response.error) {
      console.error('Failed to create payment intent:', response.error);
      return null;
    }
    return response.data || null;
  }

  /**
   * Confirm a payment with a payment method
   */
  async confirmPayment(request: ConfirmPaymentRequest): Promise<Payment | null> {
    const response = await this.client.post<Payment>(`/payments/${request.payment_id}/confirm`, {
      payment_method_id: request.payment_method_id,
    });
    if (response.error) {
      console.error('Failed to confirm payment:', response.error);
      return null;
    }
    return response.data || null;
  }

  /**
   * Refund a payment
   */
  async refundPayment(request: RefundPaymentRequest): Promise<Payment | null> {
    const response = await this.client.post<Payment>(`/payments/${request.payment_id}/refund`, {
      amount: request.amount,
      reason: request.reason,
    });
    if (response.error) {
      console.error('Failed to refund payment:', response.error);
      return null;
    }
    return response.data || null;
  }

  /**
   * Cancel a pending payment
   */
  async cancelPayment(request: CancelPaymentRequest): Promise<Payment | null> {
    const response = await this.client.post<Payment>(`/payments/${request.payment_id}/cancel`, {
      reason: request.reason,
    });
    if (response.error) {
      console.error('Failed to cancel payment:', response.error);
      return null;
    }
    return response.data || null;
  }
}

// Re-export types for convenience
export type {
  CreatePaymentIntentRequest,
  ConfirmPaymentRequest,
  RefundPaymentRequest,
  CancelPaymentRequest,
} from './payment.types';

/**
 * Payment Domain Types
 * Clean types with helpers following ARCHITECTURE_STANDARDS.md
 */

// Payment Status
export type PaymentStatus = 'pending' | 'processing' | 'succeeded' | 'failed' | 'canceled' | 'refunded';

// Payment Type
export type PaymentType = 'deposit' | 'withdrawal' | 'subscription';

// Payment Provider
export type PaymentProvider = 'stripe' | 'paypal' | 'crypto' | 'bank';

// Currency (reuse from wallet if exists, define here for payment context)
export type PaymentCurrency = 'USD' | 'USDC' | 'USDT' | 'EUR' | 'BRL';

// Payment DTO - matches Go PaymentDTO
export interface Payment {
  id: string;
  user_id: string;
  wallet_id: string;
  type: PaymentType;
  provider: PaymentProvider;
  status: PaymentStatus;
  amount: number; // in cents
  currency: string;
  fee: number;
  provider_fee: number;
  net_amount: number;
  description?: string;
  failure_reason?: string;
  provider_payment_id?: string;
  created_at: string;
  updated_at: string;
  completed_at?: string;
}

// Payments Result (paginated)
export interface PaymentsResult {
  payments: Payment[];
  total_count: number;
  limit: number;
  offset: number;
}

// Payment Intent Result
export interface PaymentIntentResult {
  payment: Payment;
  client_secret?: string;  // For Stripe
  redirect_url?: string;   // For PayPal
  crypto_address?: string; // For Crypto
}

// Query Filters
export interface PaymentFilters {
  provider?: PaymentProvider;
  status?: PaymentStatus;
  type?: PaymentType;
  currency?: string;
  from_date?: string;
  to_date?: string;
  limit?: number;
  offset?: number;
  sort_by?: 'created_at' | 'amount' | 'updated_at';
  sort_order?: 'asc' | 'desc';
}

// Create Payment Intent Request
export interface CreatePaymentIntentRequest {
  wallet_id: string;
  amount: number; // in cents
  currency: string;
  payment_type: PaymentType;
  provider: PaymentProvider;
  metadata?: Record<string, unknown>;
}

// Confirm Payment Request
export interface ConfirmPaymentRequest {
  payment_id: string;
  payment_method_id: string;
}

// Refund Payment Request
export interface RefundPaymentRequest {
  payment_id: string;
  amount?: number; // optional for partial refund, 0 = full refund
  reason: string;
}

// Cancel Payment Request
export interface CancelPaymentRequest {
  payment_id: string;
  reason?: string;
}

// --- Helper Functions (reduce code bloat in components) ---

/**
 * Format payment amount from cents to dollars
 */
export const formatPaymentAmount = (amountInCents: number, currency = 'USD'): string => {
  const dollars = amountInCents / 100;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(dollars);
};

/**
 * Get payment status display info
 */
export const getPaymentStatusConfig = (status: PaymentStatus): { color: 'success' | 'warning' | 'danger' | 'default' | 'primary'; label: string; icon: string } => {
  const config: Record<PaymentStatus, { color: 'success' | 'warning' | 'danger' | 'default' | 'primary'; label: string; icon: string }> = {
    pending: { color: 'warning', label: 'Pending', icon: 'solar:clock-circle-bold' },
    processing: { color: 'primary', label: 'Processing', icon: 'solar:refresh-bold' },
    succeeded: { color: 'success', label: 'Succeeded', icon: 'solar:check-circle-bold' },
    failed: { color: 'danger', label: 'Failed', icon: 'solar:close-circle-bold' },
    canceled: { color: 'default', label: 'Canceled', icon: 'solar:forbidden-circle-bold' },
    refunded: { color: 'default', label: 'Refunded', icon: 'solar:undo-left-bold' },
  };
  return config[status] ?? config.pending;
};

/**
 * Get payment type display info
 */
export const getPaymentTypeIcon = (type: PaymentType): string => {
  const icons: Record<PaymentType, string> = {
    deposit: 'solar:download-minimalistic-bold',
    withdrawal: 'solar:upload-minimalistic-bold',
    subscription: 'solar:calendar-mark-bold',
  };
  return icons[type] ?? 'solar:dollar-bold';
};

/**
 * Get provider display info
 */
export const getProviderConfig = (provider: PaymentProvider): { label: string; icon: string } => {
  const config: Record<PaymentProvider, { label: string; icon: string }> = {
    stripe: { label: 'Credit Card', icon: 'logos:stripe' },
    paypal: { label: 'PayPal', icon: 'logos:paypal' },
    crypto: { label: 'Cryptocurrency', icon: 'solar:bitcoin-bold' },
    bank: { label: 'Bank Transfer', icon: 'solar:bank-bold' },
  };
  return config[provider] ?? { label: provider, icon: 'solar:card-bold' };
};

/**
 * Check if payment is in a final state
 */
export const isPaymentFinal = (payment: Payment): boolean => {
  return ['succeeded', 'failed', 'canceled', 'refunded'].includes(payment.status);
};

/**
 * Check if payment can be refunded
 */
export const canRefundPayment = (payment: Payment): boolean => {
  return payment.status === 'succeeded' && payment.type === 'deposit';
};

/**
 * Check if payment can be canceled
 */
export const canCancelPayment = (payment: Payment): boolean => {
  return payment.status === 'pending' || payment.status === 'processing';
};

// Type aliases for backwards compatibility
export type PaymentDTO = Payment;
export type PaymentResult = Payment;

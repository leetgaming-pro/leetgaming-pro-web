/**
 * Checkout Types and Enums
 * Award-winning, financial-grade type definitions
 */

// ============================================================================
// Enums
// ============================================================================

export enum PaymentProvider {
  STRIPE = 'stripe',
  PAYPAL = 'paypal',
  CRYPTO = 'crypto',
}

export enum PaymentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  SUCCEEDED = 'succeeded',
  FAILED = 'failed',
  CANCELED = 'canceled',
  REFUNDED = 'refunded',
}

export enum PaymentType {
  DEPOSIT = 'deposit',
  WITHDRAWAL = 'withdrawal',
  SUBSCRIPTION = 'subscription',
}

export enum SubscriptionStatus {
  ACTIVE = 'active',
  CANCELED = 'canceled',
  PAST_DUE = 'past_due',
  TRIALING = 'trialing',
  PAUSED = 'paused',
}

export enum CheckoutStep {
  SELECT_PLAN = 'select_plan',
  SELECT_PAYMENT = 'select_payment',
  PAYMENT_DETAILS = 'payment_details',
  CONFIRMATION = 'confirmation',
  SUCCESS = 'success',
}

export enum CryptoCurrency {
  ETH = 'ETH',
  USDC = 'USDC',
  USDT = 'USDT',
}

export enum CryptoNetwork {
  ETHEREUM = 'ethereum',
  POLYGON = 'polygon',
  ARBITRUM = 'arbitrum',
  BASE = 'base',
}

// ============================================================================
// Types
// ============================================================================

export interface PricingPlan {
  id: string;
  key: string;
  name: string;
  description: string;
  price: PlanPrice;
  features: string[];
  highlighted?: boolean;
  badge?: string;
  stripePriceId?: string;
}

export interface PlanPrice {
  monthly: number;
  quarterly: number;
  yearly: number;
  currency: string;
}

export interface CheckoutState {
  step: CheckoutStep;
  selectedPlan: PricingPlan | null;
  billingPeriod: BillingPeriod;
  paymentProvider: PaymentProvider | null;
  isProcessing: boolean;
  error: string | null;
}

export type BillingPeriod = 'monthly' | 'quarterly' | 'yearly';

export interface PaymentIntent {
  paymentId: string;
  clientSecret?: string;
  redirectUrl?: string;
  cryptoAddress?: string;
  cryptoNetwork?: CryptoNetwork;
  cryptoCurrency?: CryptoCurrency;
  status: PaymentStatus;
  amount: number;
  currency: string;
}

export interface PaymentMethodInfo {
  id: string;
  provider: PaymentProvider;
  last4?: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
  email?: string; // For PayPal
  walletAddress?: string; // For crypto
}

export interface Subscription {
  id: string;
  planId: string;
  planName: string;
  status: SubscriptionStatus;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  amount: number;
  currency: string;
  billingPeriod: BillingPeriod;
  paymentMethod?: PaymentMethodInfo;
}

export interface PaymentHistoryItem {
  id: string;
  type: PaymentType;
  provider: PaymentProvider;
  status: PaymentStatus;
  amount: number;
  fee: number;
  netAmount: number;
  currency: string;
  description: string;
  createdAt: string;
  completedAt?: string;
}

export interface Payment {
  id: string;
  status: PaymentStatus;
  amount: number;
  currency: string;
  fee: number;
  provider: PaymentProvider;
  created_at: string;
  completed_at?: string;
}

// ============================================================================
// Constants
// ============================================================================

export const PAYMENT_PROVIDER_LABELS: Record<PaymentProvider, string> = {
  [PaymentProvider.STRIPE]: 'Credit / Debit Card',
  [PaymentProvider.PAYPAL]: 'PayPal',
  [PaymentProvider.CRYPTO]: 'Cryptocurrency',
};

export const PAYMENT_PROVIDER_ICONS: Record<PaymentProvider, string> = {
  [PaymentProvider.STRIPE]: 'logos:stripe',
  [PaymentProvider.PAYPAL]: 'logos:paypal',
  [PaymentProvider.CRYPTO]: 'cryptocurrency:eth',
};

export const CRYPTO_NETWORK_LABELS: Record<CryptoNetwork, string> = {
  [CryptoNetwork.ETHEREUM]: 'Ethereum Mainnet',
  [CryptoNetwork.POLYGON]: 'Polygon',
  [CryptoNetwork.ARBITRUM]: 'Arbitrum One',
  [CryptoNetwork.BASE]: 'Base',
};

export const PAYMENT_STATUS_COLORS: Record<PaymentStatus, 'success' | 'warning' | 'danger' | 'default' | 'primary'> = {
  [PaymentStatus.PENDING]: 'warning',
  [PaymentStatus.PROCESSING]: 'primary',
  [PaymentStatus.SUCCEEDED]: 'success',
  [PaymentStatus.FAILED]: 'danger',
  [PaymentStatus.CANCELED]: 'default',
  [PaymentStatus.REFUNDED]: 'default',
};

export const BILLING_PERIOD_LABELS: Record<BillingPeriod, string> = {
  monthly: 'Monthly',
  quarterly: 'Quarterly',
  yearly: 'Yearly',
};

export const BILLING_PERIOD_MONTHS: Record<BillingPeriod, number> = {
  monthly: 1,
  quarterly: 3,
  yearly: 12,
};

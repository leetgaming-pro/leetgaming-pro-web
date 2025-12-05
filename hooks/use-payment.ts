/**
 * usePayment Hook
 * React hook for payment operations with state management
 */

'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { ReplayAPISDK } from '@/types/replay-api/sdk';
import { ReplayApiSettingsMock } from '@/types/replay-api/settings';
import { logger } from '@/lib/logger';
import type {
  Payment,
  PaymentsResult,
  PaymentIntentResult,
  PaymentFilters,
  CreatePaymentIntentRequest,
  ConfirmPaymentRequest,
  RefundPaymentRequest,
  CancelPaymentRequest,
} from '@/types/replay-api/payment.types';

const getApiBaseUrl = (): string =>
  typeof window !== 'undefined'
    ? process.env.NEXT_PUBLIC_REPLAY_API_URL || 'http://localhost:8080'
    : process.env.NEXT_PUBLIC_REPLAY_API_URL || process.env.REPLAY_API_URL || 'http://localhost:8080';

export interface UsePaymentResult {
  // State
  payments: PaymentsResult | null;
  currentPayment: Payment | null;
  isLoading: boolean;
  error: string | null;
  // Actions
  fetchPayments: (filters?: PaymentFilters) => Promise<void>;
  fetchPayment: (paymentId: string) => Promise<Payment | null>;
  createPaymentIntent: (request: CreatePaymentIntentRequest) => Promise<PaymentIntentResult | null>;
  confirmPayment: (request: ConfirmPaymentRequest) => Promise<Payment | null>;
  refundPayment: (request: RefundPaymentRequest) => Promise<Payment | null>;
  cancelPayment: (request: CancelPaymentRequest) => Promise<Payment | null>;
  loadMore: () => Promise<void>;
  // Helpers
  canLoadMore: boolean;
  clearError: () => void;
}

export function usePayment(
  autoFetch = false,
  initialFilters: PaymentFilters = { limit: 20, offset: 0 }
): UsePaymentResult {
  const [payments, setPayments] = useState<PaymentsResult | null>(null);
  const [currentPayment, setCurrentPayment] = useState<Payment | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<PaymentFilters>(initialFilters);

  const sdk = useMemo(() => {
    const baseUrl = getApiBaseUrl();
    logger.info('[usePayment] Initializing SDK', { baseUrl });
    return new ReplayAPISDK({ ...ReplayApiSettingsMock, baseUrl }, logger);
  }, []);

  const fetchPayments = useCallback(async (newFilters?: PaymentFilters) => {
    setIsLoading(true);
    setError(null);
    const activeFilters = newFilters ?? filters;
    if (newFilters) setFilters(newFilters);

    try {
      const result = await sdk.payment.getPayments(activeFilters);
      setPayments(result);
      if (!result) setError('Failed to fetch payments');
    } catch (err: unknown) {
      logger.error('[usePayment] Error fetching payments:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, [sdk, filters]);

  const fetchPayment = useCallback(async (paymentId: string): Promise<Payment | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await sdk.payment.getPayment(paymentId);
      setCurrentPayment(result);
      if (!result) setError('Payment not found');
      return result;
    } catch (err: unknown) {
      logger.error('[usePayment] Error fetching payment:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [sdk]);

  const createPaymentIntent = useCallback(async (request: CreatePaymentIntentRequest): Promise<PaymentIntentResult | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await sdk.payment.createPaymentIntent(request);
      if (result) {
        setCurrentPayment(result.payment);
        // Refresh payments list
        await fetchPayments();
      } else {
        setError('Failed to create payment intent');
      }
      return result;
    } catch (err: unknown) {
      logger.error('[usePayment] Error creating payment intent:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [sdk, fetchPayments]);

  const confirmPayment = useCallback(async (request: ConfirmPaymentRequest): Promise<Payment | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await sdk.payment.confirmPayment(request);
      if (result) {
        setCurrentPayment(result);
        // Refresh payments list
        await fetchPayments();
      } else {
        setError('Failed to confirm payment');
      }
      return result;
    } catch (err: unknown) {
      logger.error('[usePayment] Error confirming payment:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [sdk, fetchPayments]);

  const refundPayment = useCallback(async (request: RefundPaymentRequest): Promise<Payment | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await sdk.payment.refundPayment(request);
      if (result) {
        setCurrentPayment(result);
        // Refresh payments list
        await fetchPayments();
      } else {
        setError('Failed to refund payment');
      }
      return result;
    } catch (err: unknown) {
      logger.error('[usePayment] Error refunding payment:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [sdk, fetchPayments]);

  const cancelPayment = useCallback(async (request: CancelPaymentRequest): Promise<Payment | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await sdk.payment.cancelPayment(request);
      if (result) {
        setCurrentPayment(result);
        // Refresh payments list
        await fetchPayments();
      } else {
        setError('Failed to cancel payment');
      }
      return result;
    } catch (err: unknown) {
      logger.error('[usePayment] Error canceling payment:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [sdk, fetchPayments]);

  const loadMore = useCallback(async () => {
    if (!payments || isLoading) return;
    const newOffset = (filters.offset || 0) + (filters.limit || 20);
    if (newOffset >= payments.total_count) return;

    setIsLoading(true);
    try {
      const newFilters = { ...filters, offset: newOffset };
      const result = await sdk.payment.getPayments(newFilters);
      if (result) {
        setPayments({
          ...result,
          payments: [...payments.payments, ...result.payments],
        });
        setFilters(newFilters);
      }
    } catch (err: unknown) {
      logger.error('[usePayment] Error loading more:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, [sdk, payments, filters, isLoading]);

  const canLoadMore = useMemo(() => {
    if (!payments) return false;
    return (filters.offset || 0) + payments.payments.length < payments.total_count;
  }, [payments, filters]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  useEffect(() => {
    if (autoFetch) {
      fetchPayments();
    }
  }, [autoFetch, fetchPayments]);

  return {
    payments,
    currentPayment,
    isLoading,
    error,
    fetchPayments,
    fetchPayment,
    createPaymentIntent,
    confirmPayment,
    refundPayment,
    cancelPayment,
    loadMore,
    canLoadMore,
    clearError,
  };
}

// Re-export types
export type { Payment, PaymentsResult, PaymentFilters };

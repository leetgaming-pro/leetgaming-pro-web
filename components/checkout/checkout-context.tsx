'use client';

import React, { createContext, useContext, useReducer, useCallback, ReactNode } from 'react';
import {
  CheckoutState,
  CheckoutStep,
  PricingPlan,
  BillingPeriod,
  PaymentProvider,
  PaymentIntent,
} from './types';
import { paymentsSDK, CreatePaymentIntentRequest } from '@/types/replay-api/payments.sdk';

// ============================================================================
// Actions
// ============================================================================

type CheckoutAction =
  | { type: 'SET_STEP'; payload: CheckoutStep }
  | { type: 'SELECT_PLAN'; payload: PricingPlan }
  | { type: 'SET_BILLING_PERIOD'; payload: BillingPeriod }
  | { type: 'SELECT_PAYMENT_PROVIDER'; payload: PaymentProvider }
  | { type: 'SET_PROCESSING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'RESET' };

// ============================================================================
// Initial State
// ============================================================================

const initialState: CheckoutState = {
  step: CheckoutStep.SELECT_PLAN,
  selectedPlan: null,
  billingPeriod: 'yearly',
  paymentProvider: null,
  isProcessing: false,
  error: null,
};

// ============================================================================
// Reducer
// ============================================================================

function checkoutReducer(state: CheckoutState, action: CheckoutAction): CheckoutState {
  switch (action.type) {
    case 'SET_STEP':
      return { ...state, step: action.payload, error: null };

    case 'SELECT_PLAN':
      return {
        ...state,
        selectedPlan: action.payload,
        step: CheckoutStep.SELECT_PAYMENT,
        error: null,
      };

    case 'SET_BILLING_PERIOD':
      return { ...state, billingPeriod: action.payload };

    case 'SELECT_PAYMENT_PROVIDER':
      return {
        ...state,
        paymentProvider: action.payload,
        step: CheckoutStep.PAYMENT_DETAILS,
        error: null,
      };

    case 'SET_PROCESSING':
      return { ...state, isProcessing: action.payload };

    case 'SET_ERROR':
      return { ...state, error: action.payload, isProcessing: false };

    case 'RESET':
      return initialState;

    default:
      return state;
  }
}

// ============================================================================
// Context
// ============================================================================

interface CheckoutContextValue {
  state: CheckoutState;
  selectPlan: (plan: PricingPlan) => void;
  setBillingPeriod: (period: BillingPeriod) => void;
  selectPaymentProvider: (provider: PaymentProvider) => void;
  goToStep: (step: CheckoutStep) => void;
  goBack: () => void;
  createPaymentIntent: (walletId: string) => Promise<PaymentIntent | null>;
  reset: () => void;
  getPriceForPeriod: (plan: PricingPlan) => number;
  getSavingsPercentage: (plan: PricingPlan) => number;
}

const CheckoutContext = createContext<CheckoutContextValue | undefined>(undefined);

// ============================================================================
// Provider
// ============================================================================

interface CheckoutProviderProps {
  children: ReactNode;
}

export function CheckoutProvider({ children }: CheckoutProviderProps) {
  const [state, dispatch] = useReducer(checkoutReducer, initialState);

  const selectPlan = useCallback((plan: PricingPlan) => {
    dispatch({ type: 'SELECT_PLAN', payload: plan });
  }, []);

  const setBillingPeriod = useCallback((period: BillingPeriod) => {
    dispatch({ type: 'SET_BILLING_PERIOD', payload: period });
  }, []);

  const selectPaymentProvider = useCallback((provider: PaymentProvider) => {
    dispatch({ type: 'SELECT_PAYMENT_PROVIDER', payload: provider });
  }, []);

  const goToStep = useCallback((step: CheckoutStep) => {
    dispatch({ type: 'SET_STEP', payload: step });
  }, []);

  const goBack = useCallback(() => {
    const stepOrder = [
      CheckoutStep.SELECT_PLAN,
      CheckoutStep.SELECT_PAYMENT,
      CheckoutStep.PAYMENT_DETAILS,
      CheckoutStep.CONFIRMATION,
    ];
    const currentIndex = stepOrder.indexOf(state.step);
    if (currentIndex > 0) {
      dispatch({ type: 'SET_STEP', payload: stepOrder[currentIndex - 1] });
    }
  }, [state.step]);

  const getPriceForPeriod = useCallback(
    (plan: PricingPlan): number => {
      return plan.price[state.billingPeriod];
    },
    [state.billingPeriod]
  );

  const getSavingsPercentage = useCallback(
    (plan: PricingPlan): number => {
      const monthlyTotal = plan.price.monthly * 12;
      const yearlyPrice = plan.price.yearly;
      if (state.billingPeriod === 'yearly' && monthlyTotal > 0) {
        return Math.round(((monthlyTotal - yearlyPrice) / monthlyTotal) * 100);
      }
      const quarterlyTotal = plan.price.quarterly * 4;
      if (state.billingPeriod === 'quarterly' && monthlyTotal > 0) {
        return Math.round(((monthlyTotal - quarterlyTotal) / monthlyTotal) * 100);
      }
      return 0;
    },
    [state.billingPeriod]
  );

  const createPaymentIntent = useCallback(
    async (walletId: string): Promise<PaymentIntent | null> => {
      if (!state.selectedPlan || !state.paymentProvider) {
        dispatch({ type: 'SET_ERROR', payload: 'Please select a plan and payment method' });
        return null;
      }

      dispatch({ type: 'SET_PROCESSING', payload: true });

      try {
        const amount = getPriceForPeriod(state.selectedPlan) * 100; // Convert to cents

        const request: CreatePaymentIntentRequest = {
          wallet_id: walletId,
          amount,
          currency: state.selectedPlan.price.currency,
          payment_type: 'subscription',
          provider: state.paymentProvider,
          metadata: {
            plan_id: state.selectedPlan.id,
            plan_name: state.selectedPlan.name,
            billing_period: state.billingPeriod,
          },
        };

        const response = await paymentsSDK.createPaymentIntent(request);

        dispatch({ type: 'SET_PROCESSING', payload: false });

        return {
          paymentId: response.payment_id,
          clientSecret: response.client_secret,
          redirectUrl: response.redirect_url,
          cryptoAddress: response.crypto_address,
          status: response.status as any,
          amount,
          currency: state.selectedPlan.price.currency,
        };
      } catch (error: any) {
        dispatch({ type: 'SET_ERROR', payload: error.message || 'Failed to create payment' });
        return null;
      }
    },
    [state.selectedPlan, state.paymentProvider, state.billingPeriod, getPriceForPeriod]
  );

  const reset = useCallback(() => {
    dispatch({ type: 'RESET' });
  }, []);

  const value: CheckoutContextValue = {
    state,
    selectPlan,
    setBillingPeriod,
    selectPaymentProvider,
    goToStep,
    goBack,
    createPaymentIntent,
    reset,
    getPriceForPeriod,
    getSavingsPercentage,
  };

  return (
    <CheckoutContext.Provider value={value}>
      {children}
    </CheckoutContext.Provider>
  );
}

// ============================================================================
// Hook
// ============================================================================

export function useCheckout(): CheckoutContextValue {
  const context = useContext(CheckoutContext);
  if (context === undefined) {
    throw new Error('useCheckout must be used within a CheckoutProvider');
  }
  return context;
}

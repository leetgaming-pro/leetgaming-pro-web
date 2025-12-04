'use client';

import React from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe, Stripe, StripeElementsOptions } from '@stripe/stripe-js';

// Initialize Stripe with publishable key
const stripePromise: Promise<Stripe | null> = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ''
);

interface StripeProviderProps {
  children: React.ReactNode;
  clientSecret?: string;
  amount?: number;
  currency?: string;
}

/**
 * StripeProvider - Wrapper component for Stripe Elements
 * Provides Stripe context to child components
 */
export function StripeProvider({
  children,
  clientSecret,
  amount,
  currency = 'usd',
}: StripeProviderProps) {
  const options: StripeElementsOptions = {
    clientSecret,
    appearance: {
      theme: 'night',
      labels: 'floating',
      variables: {
        colorPrimary: '#0ea5e9',
        colorBackground: '#18181b',
        colorText: '#fafafa',
        colorDanger: '#dc2626',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        borderRadius: '12px',
        spacingUnit: '4px',
      },
      rules: {
        '.Input': {
          backgroundColor: '#27272a',
          border: '1px solid #3f3f46',
          boxShadow: 'none',
        },
        '.Input:focus': {
          border: '1px solid #0ea5e9',
          boxShadow: '0 0 0 1px #0ea5e9',
        },
        '.Input--invalid': {
          border: '1px solid #dc2626',
        },
        '.Label': {
          color: '#a1a1aa',
        },
        '.Tab': {
          backgroundColor: '#27272a',
          border: '1px solid #3f3f46',
        },
        '.Tab--selected': {
          backgroundColor: '#0ea5e9',
          border: '1px solid #0ea5e9',
        },
        '.TabIcon': {
          fill: '#a1a1aa',
        },
        '.TabIcon--selected': {
          fill: '#ffffff',
        },
      },
    },
  };

  if (!clientSecret) {
    return <>{children}</>;
  }

  return (
    <Elements stripe={stripePromise} options={options}>
      {children}
    </Elements>
  );
}

export { stripePromise };

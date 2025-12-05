'use client';

import React, { useState, useEffect } from 'react';
import {
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { Button, Card, CardBody, Spinner } from '@nextui-org/react';
import { Icon } from '@iconify/react';
import { useCheckout } from './checkout-context';
import { PaymentStatus } from './types';

interface StripeCheckoutFormProps {
  clientSecret: string;
  paymentId: string;
  onSuccess: () => void;
  onError: (message: string) => void;
}

/**
 * StripeCheckoutForm - Secure card payment form using Stripe Elements
 * PCI DSS compliant - card data never touches our servers
 */
export function StripeCheckoutForm({
  clientSecret,
  paymentId,
  onSuccess,
  onError,
}: StripeCheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const { state } = useCheckout();

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!stripe || !elements) {
      return;
    }
    setIsReady(true);
  }, [stripe, elements]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/checkout/success?payment_id=${paymentId}`,
        },
        redirect: 'if_required',
      });

      if (error) {
        if (error.type === 'card_error' || error.type === 'validation_error') {
          setErrorMessage(error.message || 'Payment failed');
          onError(error.message || 'Payment failed');
        } else {
          setErrorMessage('An unexpected error occurred');
          onError('An unexpected error occurred');
        }
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        onSuccess();
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Payment failed');
      onError(err.message || 'Payment failed');
    } finally {
      setIsLoading(false);
    }
  };

  const formatAmount = (amount: number, currency: string): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card className="bg-content2/50 border border-content3">
        <CardBody className="p-6">
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Icon icon="solar:shield-check-bold" className="text-success w-5 h-5" />
              <span className="text-sm text-default-500">
                Secure payment powered by Stripe
              </span>
            </div>

            {state.selectedPlan && (
              <div className="bg-content1 rounded-lg p-4 mb-6">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{state.selectedPlan.name}</p>
                    <p className="text-sm text-default-500">
                      {state.billingPeriod} billing
                    </p>
                  </div>
                  <p className="text-xl font-semibold">
                    {formatAmount(
                      state.selectedPlan.price[state.billingPeriod] * 100,
                      state.selectedPlan.price.currency
                    )}
                  </p>
                </div>
              </div>
            )}

            <PaymentElement
              id="payment-element"
              options={{
                layout: 'tabs',
                defaultValues: {
                  billingDetails: {
                    name: '',
                    email: '',
                  },
                },
              }}
              onReady={() => setIsReady(true)}
            />
          </div>

          {errorMessage && (
            <div className="flex items-center gap-2 p-3 bg-danger/10 border border-danger/20 rounded-lg mb-4">
              <Icon icon="solar:danger-triangle-bold" className="text-danger w-5 h-5" />
              <p className="text-sm text-danger">{errorMessage}</p>
            </div>
          )}

          <Button
            type="submit"
            color="primary"
            size="lg"
            fullWidth
            isLoading={isLoading}
            isDisabled={!stripe || !elements || !isReady}
            startContent={
              !isLoading && <Icon icon="solar:lock-keyhole-bold" className="w-5 h-5" />
            }
          >
            {isLoading ? 'Processing...' : 'Pay securely'}
          </Button>

          <div className="flex items-center justify-center gap-4 mt-4 text-xs text-default-400">
            <div className="flex items-center gap-1">
              <Icon icon="logos:visa" className="w-8 h-5" />
            </div>
            <div className="flex items-center gap-1">
              <Icon icon="logos:mastercard" className="w-8 h-5" />
            </div>
            <div className="flex items-center gap-1">
              <Icon icon="logos:amex" className="w-8 h-5" />
            </div>
            <div className="flex items-center gap-1">
              <Icon icon="simple-icons:applepay" className="w-8 h-5" />
            </div>
            <div className="flex items-center gap-1">
              <Icon icon="simple-icons:googlepay" className="w-8 h-5" />
            </div>
          </div>
        </CardBody>
      </Card>

      <div className="flex items-center justify-center gap-2 text-xs text-default-400">
        <Icon icon="solar:lock-bold" className="w-4 h-4" />
        <span>256-bit SSL encrypted payment</span>
      </div>
    </form>
  );
}

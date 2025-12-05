'use client';

import React, { useState } from 'react';
import { Button, Card, CardBody, Spinner } from '@nextui-org/react';
import { Icon } from '@iconify/react';
import { useCheckout } from './checkout-context';

interface PayPalCheckoutProps {
  redirectUrl: string;
  paymentId: string;
  onError: (message: string) => void;
}

/**
 * PayPalCheckout - Redirects user to PayPal for payment
 */
export function PayPalCheckout({
  redirectUrl,
  paymentId,
  onError,
}: PayPalCheckoutProps) {
  const { state } = useCheckout();
  const [isRedirecting, setIsRedirecting] = useState(false);

  const formatAmount = (amount: number, currency: string): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount);
  };

  const handlePayPalRedirect = () => {
    if (!redirectUrl) {
      onError('PayPal redirect URL not available');
      return;
    }

    setIsRedirecting(true);

    // Store payment ID for return handling
    sessionStorage.setItem('pending_payment_id', paymentId);

    // Redirect to PayPal
    window.location.href = redirectUrl;
  };

  return (
    <div className="space-y-6">
      <Card className="bg-content2/50 border border-content3">
        <CardBody className="p-6">
          <div className="text-center mb-6">
            <Icon
              icon="logos:paypal"
              className="w-32 h-8 mx-auto mb-4"
            />
            <p className="text-default-500">
              You will be redirected to PayPal to complete your payment securely.
            </p>
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
                    state.selectedPlan.price[state.billingPeriod],
                    state.selectedPlan.price.currency
                  )}
                </p>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div className="flex items-start gap-3 p-3 bg-primary/10 rounded-lg">
              <Icon icon="solar:shield-check-bold" className="text-primary w-5 h-5 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-primary">PayPal Buyer Protection</p>
                <p className="text-default-500">
                  Your purchase is protected by PayPal&apos;s secure payment system.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-content1 rounded-lg">
              <Icon icon="solar:wallet-bold" className="text-default-500 w-5 h-5 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium">Pay with PayPal balance or linked accounts</p>
                <p className="text-default-500">
                  Use your PayPal balance, bank account, or saved cards.
                </p>
              </div>
            </div>
          </div>

          <Button
            color="warning"
            size="lg"
            fullWidth
            className="mt-6 bg-[#0070BA] text-white font-semibold"
            isLoading={isRedirecting}
            onPress={handlePayPalRedirect}
            startContent={
              !isRedirecting && (
                <Icon icon="logos:paypal" className="w-5 h-5" />
              )
            }
          >
            {isRedirecting ? 'Redirecting to PayPal...' : 'Continue with PayPal'}
          </Button>
        </CardBody>
      </Card>

      <div className="flex items-center justify-center gap-2 text-xs text-default-400">
        <Icon icon="solar:lock-bold" className="w-4 h-4" />
        <span>Secure payment via PayPal</span>
      </div>
    </div>
  );
}

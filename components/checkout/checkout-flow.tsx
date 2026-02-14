'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardBody, Progress, Spinner } from '@nextui-org/react';
import { Icon } from '@iconify/react';
import { useRouter } from 'next/navigation';

import { CheckoutProvider, useCheckout } from './checkout-context';
import { StripeProvider } from './stripe-provider';
import { PlanSelection } from './plan-selection';
import { PaymentMethodSelection } from './payment-method-selection';
import { StripeCheckoutForm } from './stripe-checkout-form';
import { PayPalCheckout } from './paypal-checkout';
import { CryptoCheckout } from './crypto-checkout';
import {
  CheckoutStep,
  PaymentProvider,
  PaymentIntent,
} from './types';
import { ReplayAPISDK } from '@/types/replay-api/sdk';
import { ReplayApiSettingsMock } from '@/types/replay-api/settings';
import { logger } from '@/lib/logger';

// SDK for checkout API calls
const sdk = new ReplayAPISDK(
  { ...ReplayApiSettingsMock, baseUrl: '/api' },
  logger,
);

// ============================================================================
// Step Indicator
// ============================================================================

interface StepIndicatorProps {
  currentStep: CheckoutStep;
}

const STEPS = [
  { key: CheckoutStep.SELECT_PLAN, label: 'Select Plan', icon: 'solar:document-bold' },
  { key: CheckoutStep.SELECT_PAYMENT, label: 'Payment Method', icon: 'solar:wallet-bold' },
  { key: CheckoutStep.PAYMENT_DETAILS, label: 'Payment', icon: 'solar:card-bold' },
  { key: CheckoutStep.SUCCESS, label: 'Complete', icon: 'solar:check-circle-bold' },
];

function StepIndicator({ currentStep }: StepIndicatorProps) {
  const currentIndex = STEPS.findIndex((s) => s.key === currentStep);

  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {STEPS.map((step, index) => {
        const isActive = index === currentIndex;
        const isCompleted = index < currentIndex;

        return (
          <React.Fragment key={step.key}>
            <div className="flex items-center gap-2">
              <div
                className={`
                  w-10 h-10 rounded-none flex items-center justify-center
                  transition-all duration-300
                  ${isCompleted ? 'bg-[#DCFF37] text-[#34445C]' : ''}
                  ${isActive ? 'bg-[#FF4654] text-white' : ''}
                  ${!isActive && !isCompleted ? 'bg-[#34445C] text-[#F5F0E1]/50' : ''}
                `}
              >
                {isCompleted ? (
                  <Icon icon="solar:check-bold" className="w-5 h-5" />
                ) : (
                  <Icon icon={step.icon} className="w-5 h-5" />
                )}
              </div>
              <span
                className={`
                  hidden sm:inline text-sm font-medium font-[Inter]
                  ${isActive ? 'text-[#FF4654]' : ''}
                  ${isCompleted ? 'text-[#DCFF37]' : ''}
                  ${!isActive && !isCompleted ? 'text-[#F5F0E1]/40' : ''}
                `}
              >
                {step.label}
              </span>
            </div>
            {index < STEPS.length - 1 && (
              <div
                className={`
                  w-8 sm:w-16 h-0.5
                  ${index < currentIndex ? 'bg-[#DCFF37]' : 'bg-[#34445C]'}
                `}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ============================================================================
// Checkout Content
// ============================================================================

interface CheckoutContentProps {
  walletId: string;
  initialPlanId?: string;
}

function CheckoutContent({ walletId, initialPlanId }: CheckoutContentProps) {
  const router = useRouter();
  const { state, goToStep } = useCheckout();
  const [paymentIntent, setPaymentIntent] = useState<PaymentIntent | null>(null);
  const [isCreatingIntent, setIsCreatingIntent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { createPaymentIntent } = useCheckout();

  // Create payment intent when reaching payment details step
  useEffect(() => {
    if (
      state.step === CheckoutStep.PAYMENT_DETAILS &&
      state.paymentProvider &&
      !paymentIntent &&
      !isCreatingIntent
    ) {
      const initPayment = async () => {
        setIsCreatingIntent(true);
        setError(null);

        const intent = await createPaymentIntent(walletId);
        if (intent) {
          setPaymentIntent(intent);
        } else {
          setError('Failed to initialize payment. Please try again.');
        }
        setIsCreatingIntent(false);
      };

      initPayment();
    }
  }, [state.step, state.paymentProvider, paymentIntent, isCreatingIntent, createPaymentIntent, walletId]);

  const handlePaymentSuccess = async () => {
    // Activate subscription via checkout API
    if (state.selectedPlan && paymentIntent) {
      try {
        const result = await sdk.subscriptions.checkout({
          plan_id: state.selectedPlan.id,
          payment_id: paymentIntent.paymentId,
          billing_period: state.billingPeriod,
        });
        if (!result?.success) {
          console.error('Failed to activate subscription:', result);
        }
      } catch (err) {
        console.error('Failed to activate subscription after payment:', err);
      }
    }
    goToStep(CheckoutStep.SUCCESS);
    // Redirect to success page after short delay
    setTimeout(() => {
      router.push(`/checkout/success?payment_id=${paymentIntent?.paymentId}`);
    }, 1500);
  };

  const handlePaymentError = (message: string) => {
    setError(message);
  };

  const renderPaymentForm = () => {
    if (isCreatingIntent) {
      return (
        <Card className="bg-content2/50 border border-content3">
          <CardBody className="p-8 flex flex-col items-center justify-center min-h-[300px]">
            <Spinner size="lg" color="primary" />
            <p className="text-default-500 mt-4">Initializing secure payment...</p>
          </CardBody>
        </Card>
      );
    }

    if (error) {
      return (
        <Card className="bg-danger/10 border border-danger/20">
          <CardBody className="p-6">
            <div className="flex items-center gap-3">
              <Icon icon="solar:danger-triangle-bold" className="text-danger w-6 h-6" />
              <div>
                <p className="font-medium text-danger">Payment Error</p>
                <p className="text-sm text-default-500">{error}</p>
              </div>
            </div>
          </CardBody>
        </Card>
      );
    }

    if (!paymentIntent) return null;

    switch (state.paymentProvider) {
      case PaymentProvider.STRIPE:
        return paymentIntent.clientSecret ? (
          <StripeProvider clientSecret={paymentIntent.clientSecret}>
            <StripeCheckoutForm
              clientSecret={paymentIntent.clientSecret}
              paymentId={paymentIntent.paymentId}
              onSuccess={handlePaymentSuccess}
              onError={handlePaymentError}
            />
          </StripeProvider>
        ) : null;

      case PaymentProvider.PAYPAL:
        return paymentIntent.redirectUrl ? (
          <PayPalCheckout
            redirectUrl={paymentIntent.redirectUrl}
            paymentId={paymentIntent.paymentId}
            onError={handlePaymentError}
          />
        ) : null;

      case PaymentProvider.CRYPTO:
        return paymentIntent.cryptoAddress ? (
          <CryptoCheckout
            cryptoAddress={paymentIntent.cryptoAddress}
            cryptoNetwork={paymentIntent.cryptoNetwork}
            cryptoCurrency={paymentIntent.cryptoCurrency}
            amount={paymentIntent.amount}
            paymentId={paymentIntent.paymentId}
            onSuccess={handlePaymentSuccess}
            onError={handlePaymentError}
          />
        ) : null;

      default:
        return null;
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <StepIndicator currentStep={state.step} />

      {state.step === CheckoutStep.SELECT_PLAN && <PlanSelection initialPlanId={initialPlanId} />}

      {state.step === CheckoutStep.SELECT_PAYMENT && <PaymentMethodSelection />}

      {state.step === CheckoutStep.PAYMENT_DETAILS && renderPaymentForm()}

      {state.step === CheckoutStep.SUCCESS && (
        <Card className="bg-[#DCFF37]/10 border border-[#DCFF37]/30 rounded-none">
          <CardBody className="p-8 flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-none bg-[#DCFF37]/20 flex items-center justify-center mb-4">
              <Icon icon="solar:check-circle-bold" className="text-[#DCFF37] w-10 h-10" />
            </div>
            <h2 className="text-2xl font-bold text-[#DCFF37] mb-2 font-[Electrolize]">Payment Successful!</h2>
            <p className="text-[#F5F0E1]/70 mb-4">
              Thank you for your purchase. Redirecting to your dashboard...
            </p>
            <Progress
              size="sm"
              isIndeterminate
              aria-label="Redirecting..."
              classNames={{
                indicator: 'bg-[#DCFF37]',
              }}
              className="max-w-xs"
            />
          </CardBody>
        </Card>
      )}
    </div>
  );
}

// ============================================================================
// Main Export
// ============================================================================

interface CheckoutFlowProps {
  walletId: string;
  initialPlanId?: string;
}

export function CheckoutFlow({ walletId, initialPlanId }: CheckoutFlowProps) {
  return (
    <CheckoutProvider>
      <CheckoutContent walletId={walletId} initialPlanId={initialPlanId} />
    </CheckoutProvider>
  );
}

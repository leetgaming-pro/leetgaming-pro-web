'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Button,
  Card,
  CardBody,
  Chip,
  Divider,
  Spinner,
} from '@nextui-org/react';
import { Icon } from '@iconify/react';
import { Payment, PaymentStatus } from '@/components/checkout/types';

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const paymentId = searchParams.get('payment_id');

  const [payment, setPayment] = useState<Payment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPayment = async () => {
      if (!paymentId) {
        setError('No payment ID provided');
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/payments/${paymentId}`);
        const result = await response.json();

        if (result.success && result.data) {
          setPayment(result.data);
        } else {
          setError(result.error || 'Failed to load payment details');
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load payment details';
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPayment();
  }, [paymentId]);

  const formatAmount = (amount: number, currency: string): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner size="lg" color="primary" />
      </div>
    );
  }

  if (error || !payment) {
    return (
      <div className="max-w-md mx-auto">
        <Card className="bg-danger/10 border border-danger/20">
          <CardBody className="p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-danger/20 flex items-center justify-center mx-auto mb-4">
              <Icon icon="solar:danger-triangle-bold" className="text-danger w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold mb-2">Something went wrong</h2>
            <p className="text-default-500 mb-6">
              {error || 'Unable to load payment details'}
            </p>
            <Button
              color="primary"
              onPress={() => router.push('/checkout')}
            >
              Return to checkout
            </Button>
          </CardBody>
        </Card>
      </div>
    );
  }

  const isSuccess = payment.status === PaymentStatus.SUCCEEDED;

  return (
    <div className="max-w-2xl mx-auto py-12">
      {/* Success/Failure Banner */}
      <Card
        className={`mb-8 ${
          isSuccess
            ? 'bg-success/10 border border-success/20'
            : 'bg-warning/10 border border-warning/20'
        }`}
      >
        <CardBody className="p-8 text-center">
          <div
            className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${
              isSuccess ? 'bg-success/20' : 'bg-warning/20'
            }`}
          >
            <Icon
              icon={isSuccess ? 'solar:check-circle-bold' : 'solar:clock-circle-bold'}
              className={`w-12 h-12 ${isSuccess ? 'text-success' : 'text-warning'}`}
            />
          </div>
          <h1 className={`text-3xl font-bold mb-2 ${isSuccess ? 'text-success' : 'text-warning'}`}>
            {isSuccess ? 'Payment Successful!' : 'Payment Processing'}
          </h1>
          <p className="text-default-500">
            {isSuccess
              ? 'Thank you for your purchase. Your subscription is now active.'
              : 'Your payment is being processed. This may take a few minutes.'}
          </p>
        </CardBody>
      </Card>

      {/* Payment Details */}
      <Card className="mb-8">
        <CardBody className="p-6">
          <h2 className="text-lg font-semibold mb-4">Payment Details</h2>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-default-500">Transaction ID</span>
              <span className="font-mono text-sm">{payment.id}</span>
            </div>

            <Divider />

            <div className="flex justify-between items-center">
              <span className="text-default-500">Status</span>
              <Chip
                color={
                  payment.status === PaymentStatus.SUCCEEDED
                    ? 'success'
                    : payment.status === PaymentStatus.PROCESSING
                    ? 'primary'
                    : 'warning'
                }
                variant="flat"
                size="sm"
              >
                {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
              </Chip>
            </div>

            <Divider />

            <div className="flex justify-between items-center">
              <span className="text-default-500">Amount</span>
              <span className="font-semibold">
                {formatAmount(payment.amount, payment.currency)}
              </span>
            </div>

            {payment.fee > 0 && (
              <>
                <Divider />
                <div className="flex justify-between items-center">
                  <span className="text-default-500">Processing Fee</span>
                  <span className="text-sm">
                    {formatAmount(payment.fee, payment.currency)}
                  </span>
                </div>
              </>
            )}

            <Divider />

            <div className="flex justify-between items-center">
              <span className="text-default-500">Date</span>
              <span>{formatDate(payment.created_at)}</span>
            </div>

            <Divider />

            <div className="flex justify-between items-center">
              <span className="text-default-500">Payment Method</span>
              <span className="capitalize">{payment.provider}</span>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* What's Next */}
      {isSuccess && (
        <Card className="mb-8">
          <CardBody className="p-6">
            <h2 className="text-lg font-semibold mb-4">What&apos;s Next?</h2>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <Icon icon="solar:letter-bold" className="text-primary w-4 h-4" />
                </div>
                <div>
                  <p className="font-medium">Check your email</p>
                  <p className="text-sm text-default-500">
                    We&apos;ve sent a confirmation email with your receipt.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <Icon icon="solar:gamepad-bold" className="text-primary w-4 h-4" />
                </div>
                <div>
                  <p className="font-medium">Start using Pro features</p>
                  <p className="text-sm text-default-500">
                    Your Pro subscription is now active. Enjoy all premium features!
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <Icon icon="solar:settings-bold" className="text-primary w-4 h-4" />
                </div>
                <div>
                  <p className="font-medium">Manage your subscription</p>
                  <p className="text-sm text-default-500">
                    View billing history and manage your plan in settings.
                  </p>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Button
          color="primary"
          size="lg"
          fullWidth
          onPress={() => router.push('/home')}
          startContent={<Icon icon="solar:home-2-bold" className="w-5 h-5" />}
        >
          Go to Dashboard
        </Button>
        <Button
          variant="bordered"
          size="lg"
          fullWidth
          onPress={() => router.push('/settings')}
          startContent={<Icon icon="solar:settings-bold" className="w-5 h-5" />}
        >
          Manage Subscription
        </Button>
      </div>

      {/* Support Link */}
      <div className="text-center mt-8">
        <p className="text-default-500 text-sm">
          Need help?{' '}
          <Button
            variant="light"
            size="sm"
            className="text-primary"
            onPress={() => router.push('/support')}
          >
            Contact Support
          </Button>
        </p>
      </div>
    </div>
  );
}

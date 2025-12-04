'use client';

import React, { useState } from 'react';
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Chip,
  Divider,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Progress,
  useDisclosure,
} from '@nextui-org/react';
import { Icon } from '@iconify/react';
import { useRouter } from 'next/navigation';
import {
  Subscription,
  SubscriptionStatus,
  BILLING_PERIOD_LABELS,
} from './types';

// ============================================================================
// Types
// ============================================================================

interface SubscriptionManagementProps {
  subscription?: Subscription | null;
  onUpgrade?: () => void;
  onCancel?: () => void;
}

// ============================================================================
// Helpers
// ============================================================================

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
  });
};

const getStatusColor = (status: SubscriptionStatus): 'success' | 'warning' | 'danger' | 'default' => {
  switch (status) {
    case SubscriptionStatus.ACTIVE:
      return 'success';
    case SubscriptionStatus.TRIALING:
      return 'primary' as any;
    case SubscriptionStatus.PAST_DUE:
      return 'danger';
    case SubscriptionStatus.CANCELED:
      return 'default';
    case SubscriptionStatus.PAUSED:
      return 'warning';
    default:
      return 'default';
  }
};

const getDaysRemaining = (endDate: string): number => {
  const end = new Date(endDate);
  const now = new Date();
  const diff = end.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

// ============================================================================
// Component
// ============================================================================

export function SubscriptionManagement({
  subscription,
  onUpgrade,
  onCancel,
}: SubscriptionManagementProps) {
  const router = useRouter();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isCanceling, setIsCanceling] = useState(false);

  const handleCancel = async () => {
    setIsCanceling(true);
    try {
      // Call cancel API
      await fetch('/api/subscriptions/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscription_id: subscription?.id }),
      });
      onCancel?.();
      onClose();
    } catch (error) {
      console.error('Failed to cancel subscription:', error);
    } finally {
      setIsCanceling(false);
    }
  };

  // No subscription - show upgrade CTA
  if (!subscription) {
    return (
      <Card className="bg-gradient-to-br from-primary/10 to-secondary/10 border border-primary/20">
        <CardBody className="p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
            <Icon icon="solar:crown-bold" className="text-primary w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold mb-2">Upgrade to Pro</h3>
          <p className="text-default-500 mb-6 max-w-md mx-auto">
            Unlock unlimited replays, advanced analytics, and premium features.
            Join thousands of competitive gamers.
          </p>
          <Button
            color="primary"
            size="lg"
            onPress={() => router.push('/checkout')}
            startContent={<Icon icon="solar:star-bold" className="w-5 h-5" />}
          >
            Upgrade Now
          </Button>
        </CardBody>
      </Card>
    );
  }

  const daysRemaining = getDaysRemaining(subscription.currentPeriodEnd);
  const progressPercent = Math.max(
    0,
    Math.min(100, ((30 - daysRemaining) / 30) * 100)
  );

  return (
    <>
      <Card>
        <CardHeader className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
              <Icon icon="solar:crown-bold" className="text-primary w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold">{subscription.planName} Plan</h3>
              <p className="text-sm text-default-500">
                {BILLING_PERIOD_LABELS[subscription.billingPeriod]} billing
              </p>
            </div>
          </div>
          <Chip color={getStatusColor(subscription.status)} variant="flat">
            {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
          </Chip>
        </CardHeader>

        <Divider />

        <CardBody className="space-y-6">
          {/* Billing Cycle Progress */}
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-default-500">Current billing period</span>
              <span className="font-medium">
                {daysRemaining > 0 ? `${daysRemaining} days left` : 'Expires today'}
              </span>
            </div>
            <Progress
              value={progressPercent}
              color={daysRemaining <= 5 ? 'warning' : 'primary'}
              size="sm"
              className="mb-2"
            />
            <div className="flex justify-between text-xs text-default-400">
              <span>{formatDate(subscription.currentPeriodStart)}</span>
              <span>{formatDate(subscription.currentPeriodEnd)}</span>
            </div>
          </div>

          {/* Subscription Details */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-content2 rounded-lg">
              <p className="text-sm text-default-500 mb-1">Next payment</p>
              <p className="font-semibold">
                {formatAmount(subscription.amount, subscription.currency)}
              </p>
            </div>
            <div className="p-4 bg-content2 rounded-lg">
              <p className="text-sm text-default-500 mb-1">Renewal date</p>
              <p className="font-semibold">
                {subscription.cancelAtPeriodEnd
                  ? 'Not renewing'
                  : formatDate(subscription.currentPeriodEnd)}
              </p>
            </div>
          </div>

          {/* Payment Method */}
          {subscription.paymentMethod && (
            <div className="flex items-center justify-between p-4 bg-content2 rounded-lg">
              <div className="flex items-center gap-3">
                <Icon icon="solar:card-bold" className="w-5 h-5 text-default-500" />
                <div>
                  <p className="font-medium">
                    {subscription.paymentMethod.brand
                      ? `${subscription.paymentMethod.brand} ****${subscription.paymentMethod.last4}`
                      : subscription.paymentMethod.email || 'Payment method'}
                  </p>
                  {subscription.paymentMethod.expiryMonth && (
                    <p className="text-sm text-default-500">
                      Expires {subscription.paymentMethod.expiryMonth}/
                      {subscription.paymentMethod.expiryYear}
                    </p>
                  )}
                </div>
              </div>
              <Button variant="light" size="sm">
                Update
              </Button>
            </div>
          )}

          {/* Cancel Notice */}
          {subscription.cancelAtPeriodEnd && (
            <div className="flex items-start gap-3 p-4 bg-warning/10 border border-warning/20 rounded-lg">
              <Icon
                icon="solar:info-circle-bold"
                className="text-warning w-5 h-5 mt-0.5 flex-shrink-0"
              />
              <div>
                <p className="font-medium text-warning">Subscription ending</p>
                <p className="text-sm text-default-500">
                  Your subscription will end on {formatDate(subscription.currentPeriodEnd)}.
                  You can reactivate anytime before then.
                </p>
              </div>
            </div>
          )}
        </CardBody>

        <Divider />

        <CardFooter className="flex justify-between">
          <Button
            variant="light"
            color="danger"
            onPress={onOpen}
            isDisabled={subscription.cancelAtPeriodEnd}
          >
            {subscription.cancelAtPeriodEnd ? 'Already cancelled' : 'Cancel subscription'}
          </Button>
          <div className="flex gap-2">
            <Button
              variant="bordered"
              onPress={() => router.push('/checkout')}
            >
              Change plan
            </Button>
            {subscription.cancelAtPeriodEnd && (
              <Button color="primary">Reactivate</Button>
            )}
          </div>
        </CardFooter>
      </Card>

      {/* Cancel Confirmation Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalContent>
          <ModalHeader>
            <div className="flex items-center gap-2">
              <Icon icon="solar:danger-triangle-bold" className="text-danger w-5 h-5" />
              Cancel Subscription
            </div>
          </ModalHeader>
          <ModalBody>
            <p>Are you sure you want to cancel your subscription?</p>
            <div className="bg-content2 rounded-lg p-4 mt-4">
              <p className="text-sm text-default-500">When you cancel:</p>
              <ul className="text-sm mt-2 space-y-1">
                <li className="flex items-center gap-2">
                  <Icon icon="solar:check-circle-bold" className="text-success w-4 h-4" />
                  You&apos;ll keep access until {formatDate(subscription.currentPeriodEnd)}
                </li>
                <li className="flex items-center gap-2">
                  <Icon icon="solar:check-circle-bold" className="text-success w-4 h-4" />
                  You won&apos;t be charged again
                </li>
                <li className="flex items-center gap-2">
                  <Icon icon="solar:check-circle-bold" className="text-success w-4 h-4" />
                  You can reactivate anytime
                </li>
              </ul>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={onClose}>
              Keep subscription
            </Button>
            <Button
              color="danger"
              onPress={handleCancel}
              isLoading={isCanceling}
            >
              Yes, cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}

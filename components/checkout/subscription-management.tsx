"use client";

/**
 * Subscription Management Component
 * Uses SDK via useSubscription hook - DO NOT use direct fetch calls
 */

import React, { useState, useMemo } from "react";
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
  Spinner,
  useDisclosure,
} from "@nextui-org/react";
import { Icon } from "@iconify/react";
import { useRouter } from "next/navigation";
import { Subscription, SubscriptionStatus } from "./types";
import { useSubscription } from "@/hooks/use-subscription";
import { useTranslation } from "@/lib/i18n/useTranslation";
import type { Subscription as SDKSubscription } from "@/types/replay-api/subscriptions.sdk";

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

/** Map SDK subscription to checkout Subscription format */
function mapSDKSubscription(sub: SDKSubscription): Subscription {
  return {
    id: sub.id,
    planId: sub.plan_id,
    planName: sub.plan?.name || "Unknown",
    status: sub.status as Subscription["status"],
    currentPeriodStart: sub.current_period_start,
    currentPeriodEnd: sub.current_period_end,
    cancelAtPeriodEnd: sub.cancel_at_period_end,
    amount: sub.plan?.price?.monthly || 0,
    currency: sub.plan?.price?.currency || "usd",
    billingPeriod: sub.billing_period as Subscription["billingPeriod"],
  };
}

const formatAmount = (
  amount: number,
  currency: string,
  locale: string,
): string => {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(amount / 100);
};

const formatDate = (dateString: string, locale: string): string => {
  return new Date(dateString).toLocaleDateString(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const getStatusColor = (
  status: SubscriptionStatus,
): "success" | "warning" | "danger" | "default" | "primary" => {
  switch (status) {
    case SubscriptionStatus.ACTIVE:
      return "success";
    case SubscriptionStatus.TRIALING:
      return "primary";
    case SubscriptionStatus.PAST_DUE:
      return "danger";
    case SubscriptionStatus.CANCELED:
      return "default";
    case SubscriptionStatus.PAUSED:
      return "warning";
    default:
      return "default";
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
  subscription: subscriptionProp,
  onUpgrade: _onUpgrade,
  onCancel,
}: SubscriptionManagementProps) {
  const { t, locale } = useTranslation();
  const router = useRouter();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isCanceling, setIsCanceling] = useState(false);

  // Auto-fetch subscription when no prop is provided (e.g. from settings page)
  const shouldAutoFetch = subscriptionProp === undefined;
  const { cancelSubscription, currentSubscription, isLoadingSubscription } =
    useSubscription(shouldAutoFetch);

  // Use prop if provided, otherwise map from auto-fetched SDK subscription
  const subscription = useMemo(() => {
    if (subscriptionProp !== undefined) return subscriptionProp;
    if (!currentSubscription) return null;
    return mapSDKSubscription(currentSubscription);
  }, [subscriptionProp, currentSubscription]);

  const handleCancel = async () => {
    setIsCanceling(true);
    try {
      // Use SDK hook instead of direct fetch
      const success = await cancelSubscription();
      if (success) {
        onCancel?.();
        onClose();
      }
    } catch (error) {
      console.error("Failed to cancel subscription:", error);
    } finally {
      setIsCanceling(false);
    }
  };

  // Show loading state when auto-fetching
  if (shouldAutoFetch && isLoadingSubscription) {
    return (
      <Card className="border border-default-200">
        <CardBody className="p-8 flex items-center justify-center">
          <Spinner
            size="lg"
            color="primary"
            label={t("checkout.subscription.loading")}
          />
        </CardBody>
      </Card>
    );
  }

  // No subscription - show upgrade CTA
  if (!subscription) {
    return (
      <Card className="bg-gradient-to-br from-primary/10 to-secondary/10 border border-primary/20">
        <CardBody className="p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
            <Icon icon="solar:crown-bold" className="text-primary w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold mb-2">
            {t("checkout.subscription.upgradeTitle")}
          </h3>
          <p className="text-default-500 mb-6 max-w-md mx-auto">
            {t("checkout.subscription.upgradeDescription")}
          </p>
          <Button
            color="primary"
            size="lg"
            onPress={() => router.push("/checkout")}
            startContent={<Icon icon="solar:star-bold" className="w-5 h-5" />}
          >
            {t("checkout.subscription.upgradeNow")}
          </Button>
        </CardBody>
      </Card>
    );
  }

  const daysRemaining = getDaysRemaining(subscription.currentPeriodEnd);
  const progressPercent = Math.max(
    0,
    Math.min(100, ((30 - daysRemaining) / 30) * 100),
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
              <h3 className="font-semibold">
                {t("checkout.subscription.planTitle", {
                  plan: subscription.planName,
                })}
              </h3>
              <p className="text-sm text-default-500">
                {t(
                  `checkout.subscription.billingPeriod.${subscription.billingPeriod}`,
                )}{" "}
                {t("checkout.subscription.billingSuffix")}
              </p>
            </div>
          </div>
          <Chip color={getStatusColor(subscription.status)} variant="flat">
            {t(`checkout.subscription.status.${subscription.status}`)}
          </Chip>
        </CardHeader>

        <Divider />

        <CardBody className="space-y-6">
          {/* Billing Cycle Progress */}
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-default-500">
                {t("checkout.subscription.currentBillingPeriod")}
              </span>
              <span className="font-medium">
                {daysRemaining > 0
                  ? t("checkout.subscription.daysLeft", {
                      count: daysRemaining,
                    })
                  : t("checkout.subscription.expiresToday")}
              </span>
            </div>
            <Progress
              value={progressPercent}
              color={daysRemaining <= 5 ? "warning" : "primary"}
              size="sm"
              className="mb-2"
            />
            <div className="flex justify-between text-xs text-default-400">
              <span>{formatDate(subscription.currentPeriodStart, locale)}</span>
              <span>{formatDate(subscription.currentPeriodEnd, locale)}</span>
            </div>
          </div>

          {/* Subscription Details */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-content2 rounded-lg">
              <p className="text-sm text-default-500 mb-1">
                {t("checkout.subscription.nextPayment")}
              </p>
              <p className="font-semibold">
                {formatAmount(
                  subscription.amount,
                  subscription.currency,
                  locale,
                )}
              </p>
            </div>
            <div className="p-4 bg-content2 rounded-lg">
              <p className="text-sm text-default-500 mb-1">
                {t("checkout.subscription.renewalDate")}
              </p>
              <p className="font-semibold">
                {subscription.cancelAtPeriodEnd
                  ? t("checkout.subscription.notRenewing")
                  : formatDate(subscription.currentPeriodEnd, locale)}
              </p>
            </div>
          </div>

          {/* Payment Method */}
          {subscription.paymentMethod && (
            <div className="flex items-center justify-between p-4 bg-content2 rounded-lg">
              <div className="flex items-center gap-3">
                <Icon
                  icon="solar:card-bold"
                  className="w-5 h-5 text-default-500"
                />
                <div>
                  <p className="font-medium">
                    {subscription.paymentMethod.brand
                      ? `${subscription.paymentMethod.brand} ****${subscription.paymentMethod.last4}`
                      : subscription.paymentMethod.email ||
                        t("checkout.subscription.paymentMethodFallback")}
                  </p>
                  {subscription.paymentMethod.expiryMonth && (
                    <p className="text-sm text-default-500">
                      {t("checkout.subscription.expiresLabel")}{" "}
                      {subscription.paymentMethod.expiryMonth}/
                      {subscription.paymentMethod.expiryYear}
                    </p>
                  )}
                </div>
              </div>
              <Button variant="light" size="sm">
                {t("checkout.subscription.update")}
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
                <p className="font-medium text-warning">
                  {t("checkout.subscription.endingTitle")}
                </p>
                <p className="text-sm text-default-500">
                  {t("checkout.subscription.endingDescription", {
                    date: formatDate(subscription.currentPeriodEnd, locale),
                  })}
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
            {subscription.cancelAtPeriodEnd
              ? t("checkout.subscription.alreadyCancelled")
              : t("checkout.subscription.cancel")}
          </Button>
          <div className="flex gap-2">
            <Button variant="bordered" onPress={() => router.push("/checkout")}>
              {t("checkout.subscription.changePlan")}
            </Button>
            {subscription.cancelAtPeriodEnd && (
              <Button color="primary">
                {t("checkout.subscription.reactivate")}
              </Button>
            )}
          </div>
        </CardFooter>
      </Card>

      {/* Cancel Confirmation Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalContent>
          <ModalHeader>
            <div className="flex items-center gap-2">
              <Icon
                icon="solar:danger-triangle-bold"
                className="text-danger w-5 h-5"
              />
              {t("checkout.subscription.cancelModalTitle")}
            </div>
          </ModalHeader>
          <ModalBody>
            <p>{t("checkout.subscription.cancelConfirm")}</p>
            <div className="bg-content2 rounded-lg p-4 mt-4">
              <p className="text-sm text-default-500">
                {t("checkout.subscription.whenCancel")}
              </p>
              <ul className="text-sm mt-2 space-y-1">
                <li className="flex items-center gap-2">
                  <Icon
                    icon="solar:check-circle-bold"
                    className="text-success w-4 h-4"
                  />
                  {t("checkout.subscription.cancelBenefitAccess", {
                    date: formatDate(subscription.currentPeriodEnd, locale),
                  })}
                </li>
                <li className="flex items-center gap-2">
                  <Icon
                    icon="solar:check-circle-bold"
                    className="text-success w-4 h-4"
                  />
                  {t("checkout.subscription.cancelBenefitNoCharge")}
                </li>
                <li className="flex items-center gap-2">
                  <Icon
                    icon="solar:check-circle-bold"
                    className="text-success w-4 h-4"
                  />
                  {t("checkout.subscription.cancelBenefitReactivate")}
                </li>
              </ul>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={onClose}>
              {t("checkout.subscription.keepSubscription")}
            </Button>
            <Button
              color="danger"
              onPress={handleCancel}
              isLoading={isCanceling}
            >
              {t("checkout.subscription.confirmCancel")}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}

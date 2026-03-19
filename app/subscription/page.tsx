"use client";

import React from "react";
import { useRequireAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { Button, Card, CardBody, Divider, Spinner } from "@nextui-org/react";
import { Icon } from "@iconify/react";
import { SubscriptionManagement } from "@/components/checkout/subscription-management";
import { PaymentHistory } from "@/components/checkout/payment-history";
import { useSubscription } from "@/hooks/use-subscription";
import type { Subscription as SDKSubscription } from "@/types/replay-api/subscriptions.sdk";
import type { Subscription as CheckoutSubscription } from "@/components/checkout/types";

// Map SDK subscription format (snake_case) to checkout component format (camelCase)
function mapSubscription(sub: SDKSubscription): CheckoutSubscription {
  return {
    id: sub.id,
    planId: sub.plan_id,
    planName: sub.plan?.name || "Unknown Plan",
    status: sub.status as CheckoutSubscription["status"],
    currentPeriodStart: sub.current_period_start,
    currentPeriodEnd: sub.current_period_end,
    cancelAtPeriodEnd: sub.cancel_at_period_end,
    amount: sub.plan?.price?.monthly || 0,
    currency: sub.plan?.price?.currency || "usd",
    billingPeriod: sub.billing_period as CheckoutSubscription["billingPeriod"],
  };
}

export default function SubscriptionPage() {
  const {
    isAuthenticated,
    isLoading: isAuthLoading,
    isRedirecting,
  } = useRequireAuth({
    callbackUrl: "/subscription",
  });
  const router = useRouter();
  const { currentSubscription, isLoadingSubscription } = useSubscription();

  if (isAuthLoading || isRedirecting) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner size="lg" color="primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="py-8 lg:py-12 xl:py-16 px-4 sm:px-6 lg:px-8 xl:px-12 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8 lg:mb-12">
        <h1 className="text-3xl lg:text-4xl font-bold mb-2 font-[Electrolize] text-[#F5F0E1]">
          Subscription
        </h1>
        <p className="text-[#F5F0E1]/60 text-base lg:text-lg">
          Manage your plan, billing, and payment history
        </p>
        <p className="text-[#F5F0E1]/50 text-sm lg:text-base mt-3 max-w-2xl">
          Subscription billing is limited to users 18+ and may be subject to
          additional legal eligibility checks in some jurisdictions.
        </p>
      </div>

      {isLoadingSubscription ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <Spinner size="lg" color="primary" label="Loading subscription..." />
        </div>
      ) : (
        <div className="space-y-8">
          {/* Current Subscription */}
          <section>
            <h2 className="text-xl font-semibold text-[#F5F0E1] mb-4 flex items-center gap-2">
              <Icon
                icon="solar:crown-bold"
                className="text-[#FFC700] w-6 h-6"
              />
              Current Plan
            </h2>
            {currentSubscription ? (
              <SubscriptionManagement
                subscription={mapSubscription(currentSubscription)}
              />
            ) : (
              <Card className="rounded-none border border-[#34445C]">
                <CardBody className="p-8 text-center">
                  <div className="w-16 h-16 rounded-none bg-[#34445C] flex items-center justify-center mx-auto mb-4">
                    <Icon
                      icon="solar:star-bold"
                      className="text-[#FFC700] w-8 h-8"
                    />
                  </div>
                  <h3 className="text-lg font-semibold text-[#F5F0E1] mb-2">
                    No Active Subscription
                  </h3>
                  <p className="text-[#F5F0E1]/60 mb-6">
                    You&apos;re on the free plan. Upgrade to unlock advanced
                    features.
                  </p>
                  <Button
                    size="lg"
                    radius="none"
                    className="bg-[#DCFF37] text-[#34445C] font-bold hover:bg-[#DCFF37]/90"
                    onPress={() => router.push("/pricing")}
                    startContent={
                      <Icon icon="solar:rocket-bold" className="w-5 h-5" />
                    }
                  >
                    View Plans
                  </Button>
                </CardBody>
              </Card>
            )}
          </section>

          <Divider className="bg-[#34445C]" />

          {/* Payment History */}
          <section>
            <h2 className="text-xl font-semibold text-[#F5F0E1] mb-4 flex items-center gap-2">
              <Icon
                icon="solar:document-text-bold"
                className="text-[#DCFF37] w-6 h-6"
              />
              Payment History
            </h2>
            <PaymentHistory />
          </section>

          {/* Quick Actions */}
          <Divider className="bg-[#34445C]" />
          <section>
            <h2 className="text-xl font-semibold text-[#F5F0E1] mb-4 flex items-center gap-2">
              <Icon
                icon="solar:settings-bold"
                className="text-[#FF4654] w-6 h-6"
              />
              Quick Actions
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card
                isPressable
                className="rounded-none border border-[#34445C] hover:border-[#DCFF37]/50 transition-colors"
                onPress={() => router.push("/pricing")}
              >
                <CardBody className="p-4 flex flex-row items-center gap-3">
                  <div className="w-10 h-10 rounded-none bg-[#FF4654]/20 flex items-center justify-center">
                    <Icon
                      icon="solar:arrow-up-bold"
                      className="text-[#FF4654] w-5 h-5"
                    />
                  </div>
                  <div>
                    <p className="font-medium text-[#F5F0E1]">Upgrade Plan</p>
                    <p className="text-xs text-[#F5F0E1]/50">
                      Get more features
                    </p>
                  </div>
                </CardBody>
              </Card>
              <Card
                isPressable
                className="rounded-none border border-[#34445C] hover:border-[#DCFF37]/50 transition-colors"
                onPress={() => router.push("/wallet")}
              >
                <CardBody className="p-4 flex flex-row items-center gap-3">
                  <div className="w-10 h-10 rounded-none bg-[#DCFF37]/20 flex items-center justify-center">
                    <Icon
                      icon="solar:wallet-bold"
                      className="text-[#DCFF37] w-5 h-5"
                    />
                  </div>
                  <div>
                    <p className="font-medium text-[#F5F0E1]">Wallet</p>
                    <p className="text-xs text-[#F5F0E1]/50">
                      Manage your funds
                    </p>
                  </div>
                </CardBody>
              </Card>
              <Card
                isPressable
                className="rounded-none border border-[#34445C] hover:border-[#DCFF37]/50 transition-colors"
                onPress={() => router.push("/settings?tab=billing")}
              >
                <CardBody className="p-4 flex flex-row items-center gap-3">
                  <div className="w-10 h-10 rounded-none bg-[#FFC700]/20 flex items-center justify-center">
                    <Icon
                      icon="solar:card-bold"
                      className="text-[#FFC700] w-5 h-5"
                    />
                  </div>
                  <div>
                    <p className="font-medium text-[#F5F0E1]">
                      Payment Methods
                    </p>
                    <p className="text-xs text-[#F5F0E1]/50">
                      Update billing info
                    </p>
                  </div>
                </CardBody>
              </Card>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

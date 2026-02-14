"use client";

/**
 * Plan Selection Component
 * Uses SDK via useSubscription hook - DO NOT use direct fetch calls
 */

import React, { useEffect, useState } from "react";
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Chip,
  Divider,
  Tab,
  Tabs,
} from "@nextui-org/react";
import { Icon } from "@iconify/react";
import { cn } from "@nextui-org/react";
import { useCheckout } from "./checkout-context";
import { PricingPlan, BillingPeriod } from "./types";
import { useSubscription } from "@/hooks/use-subscription";

// ============================================================================
// Plan Data (Fallback if API fails)
// ============================================================================

export const DEFAULT_PRICING_PLANS: PricingPlan[] = [
  {
    id: "free",
    key: "free",
    name: "Free",
    description: "Perfect for casual gamers getting started.",
    price: {
      monthly: 0,
      quarterly: 0,
      yearly: 0,
      currency: "usd",
    },
    features: [
      "5 replay uploads per month",
      "1 GB cloud storage",
      "Basic match statistics",
      "Community access",
      "Help center access",
    ],
    stripePriceId: undefined,
  },
  {
    id: "pro",
    key: "pro",
    name: "Pro",
    description: "For competitive players who want an edge.",
    price: {
      monthly: 9.99,
      quarterly: 24.99,
      yearly: 79.99,
      currency: "usd",
    },
    features: [
      "Unlimited replay uploads",
      "50 GB cloud storage",
      "Advanced analytics & heatmaps",
      "Priority matchmaking",
      "Custom highlights generator",
      "Priority email support",
    ],
    highlighted: true,
    badge: "Most Popular",
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID,
  },
  {
    id: "team",
    key: "team",
    name: "Team",
    description: "For esports teams and organizations.",
    price: {
      monthly: 29.99,
      quarterly: 79.99,
      yearly: 249.99,
      currency: "usd",
    },
    features: [
      "Everything in Pro",
      "500 GB team storage",
      "Team management dashboard",
      "Scrim scheduling & tracking",
      "API access & webhooks",
      "Custom branding",
      "Dedicated account manager",
      "Phone & email support",
    ],
    badge: "Best Value",
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_TEAM_PRICE_ID,
  },
];

// Legacy export for backward compatibility
export const PRICING_PLANS = DEFAULT_PRICING_PLANS;

// ============================================================================
// Component
// ============================================================================

interface PlanSelectionProps {
  onSelectPlan?: (plan: PricingPlan) => void;
  initialPlanId?: string;
}

export function PlanSelection({ onSelectPlan, initialPlanId }: PlanSelectionProps) {
  const {
    state,
    selectPlan,
    setBillingPeriod,
    getPriceForPeriod,
    getSavingsPercentage,
  } = useCheckout();

  // Use SDK-powered subscription hook instead of direct fetch
  const {
    plans: apiPlans,
    isLoadingPlans: _loading,
    plansError: _error,
  } = useSubscription(true);

  // Transform API plans to match PricingPlan interface, fallback to defaults
  const [plans, setPlans] = useState<PricingPlan[]>(DEFAULT_PRICING_PLANS);

  useEffect(() => {
    if (apiPlans.length > 0) {
      const transformedPlans = apiPlans.map((plan) => ({
        id: plan.id,
        key: plan.key || plan.id,
        name: plan.name,
        description: plan.description,
        price: {
          monthly: plan.price?.monthly || 0,
          quarterly: plan.price?.quarterly || 0,
          yearly: plan.price?.yearly || 0,
          currency: plan.price?.currency || "usd",
        },
        features: plan.features || [],
        highlighted: plan.highlighted,
        badge: plan.badge,
        stripePriceId: plan.stripePriceId,
      }));
      setPlans(transformedPlans);

      // Auto-select plan from URL query param if provided
      if (initialPlanId && !state.selectedPlan) {
        const matchingPlan = transformedPlans.find((p) => p.id === initialPlanId);
        if (matchingPlan) {
          handleSelectPlan(matchingPlan);
        }
      }
    }
  }, [apiPlans]);

  const handleSelectPlan = (plan: PricingPlan) => {
    selectPlan(plan);
    onSelectPlan?.(plan);
  };

  const formatPrice = (plan: PricingPlan): string => {
    const price = getPriceForPeriod(plan);
    if (price === 0) return "Free";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: plan.price.currency.toUpperCase(),
    }).format(price);
  };

  const getPriceSuffix = (): string => {
    switch (state.billingPeriod) {
      case "monthly":
        return "/month";
      case "quarterly":
        return "/quarter";
      case "yearly":
        return "/year";
    }
  };

  return (
    <div className="space-y-8">
      {/* Billing Period Selector */}
      <div className="flex justify-center">
        <Tabs
          aria-label="Billing period"
          selectedKey={state.billingPeriod}
          onSelectionChange={(key) => setBillingPeriod(key as BillingPeriod)}
          classNames={{
            tabList: "gap-2 bg-[#34445C]/50 p-1 rounded-none",
            tab: "px-4 h-10 rounded-none",
            cursor: "bg-[#FF4654] rounded-none",
          }}
          radius="none"
          size="lg"
        >
          <Tab
            key="yearly"
            title={
              <div className="flex items-center gap-2">
                <span>Yearly</span>
                <Chip size="sm" variant="flat" className="bg-[#DCFF37]/20 text-[#DCFF37]">
                  Save 33%
                </Chip>
              </div>
            }
          />
          <Tab key="quarterly" title="Quarterly" />
          <Tab key="monthly" title="Monthly" />
        </Tabs>
      </div>

      {/* Plan Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const isHighlighted = plan.highlighted;
          const savings = getSavingsPercentage(plan);

          return (
            <Card
              key={plan.id}
              className={cn(
                "relative transition-all duration-300 rounded-none",
                isHighlighted
                  ? "border-2 border-[#DCFF37] shadow-lg shadow-[#DCFF37]/20 scale-105 z-10"
                  : "border border-[#34445C] hover:border-[#FF4654]/50"
              )}
              shadow={isHighlighted ? "lg" : "sm"}
            >
              {plan.badge && (
                <Chip
                  variant="flat"
                  className={cn(
                    "absolute top-3 right-3 z-20 rounded-none",
                    isHighlighted ? "bg-[#DCFF37]/20 text-[#DCFF37]" : "bg-[#34445C]/50 text-[#F5F0E1]/70"
                  )}
                  size="sm"
                >
                  {plan.badge}
                </Chip>
              )}

              <CardHeader className="flex flex-col items-start gap-2 pt-6 px-6">
                <h3 className="text-xl font-semibold">{plan.name}</h3>
                <p className="text-sm text-default-500">{plan.description}</p>
              </CardHeader>

              <CardBody className="px-6">
                <div className="mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold">
                      {formatPrice(plan)}
                    </span>
                    {plan.price.monthly > 0 && (
                      <span className="text-default-500">
                        {getPriceSuffix()}
                      </span>
                    )}
                  </div>
                  {savings > 0 && state.billingPeriod !== "monthly" && (
                    <p className="text-sm text-[#DCFF37] mt-1">
                      Save {savings}% compared to monthly
                    </p>
                  )}
                </div>

                <Divider className="my-4" />

                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Icon
                        icon="solar:check-circle-bold"
                        className={cn(
                          "w-5 h-5 mt-0.5 flex-shrink-0",
                          isHighlighted ? "text-[#DCFF37]" : "text-[#FFC700]"
                        )}
                      />
                      <span className="text-sm text-[#F5F0E1]/70">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardBody>

              <CardFooter className="px-6 pb-6">
                <Button
                  fullWidth
                  variant={isHighlighted ? "solid" : "bordered"}
                  size="lg"
                  radius="none"
                  onPress={() => handleSelectPlan(plan)}
                  className={cn(
                    isHighlighted
                      ? "bg-[#DCFF37] text-[#34445C] font-bold shadow-lg shadow-[#DCFF37]/25 hover:bg-[#DCFF37]/90"
                      : "border-[#34445C] text-[#F5F0E1] hover:border-[#FF4654]"
                  )}
                >
                  {plan.price.monthly === 0
                    ? "Get Started Free"
                    : "Select Plan"}
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>

      {/* Trust Badges */}
      <div className="flex flex-wrap justify-center gap-6 pt-8">
        <div className="flex items-center gap-2 text-[#F5F0E1]/60">
          <Icon
            icon="solar:shield-check-bold"
            className="w-5 h-5 text-[#DCFF37]"
          />
          <span className="text-sm">Secure payments</span>
        </div>
        <div className="flex items-center gap-2 text-[#F5F0E1]/60">
          <Icon
            icon="solar:refresh-circle-bold"
            className="w-5 h-5 text-[#FF4654]"
          />
          <span className="text-sm">Cancel anytime</span>
        </div>
        <div className="flex items-center gap-2 text-[#F5F0E1]/60">
          <Icon
            icon="solar:clock-circle-bold"
            className="w-5 h-5 text-[#FFC700]"
          />
          <span className="text-sm">30-day money back</span>
        </div>
      </div>
    </div>
  );
}

/**
 * Subscription Plan Comparison Component
 * Feature matrix and tier comparison for subscription upgrades
 * Per PRD E.4 - Subscription Management
 */

"use client";

import React, { useState, useMemo } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Chip,
  Switch,
  Tooltip,
  Divider,
  ScrollShadow,
} from "@nextui-org/react";
import { Icon } from "@iconify/react";
import { motion, AnimatePresence } from "framer-motion";
import type { BillingPeriod } from "./types";

// ============================================================================
// Types
// ============================================================================

export interface PlanFeature {
  id: string;
  name: string;
  description?: string;
  category: FeatureCategory;
}

export type FeatureCategory =
  | "analytics"
  | "storage"
  | "matchmaking"
  | "coaching"
  | "tournaments"
  | "support"
  | "api";

export interface PlanFeatureValue {
  featureId: string;
  value: boolean | string | number;
  tooltip?: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  tier: "free" | "pro" | "team" | "enterprise";
  prices: {
    monthly: number;
    quarterly: number;
    yearly: number;
  };
  currency: string;
  features: PlanFeatureValue[];
  badge?: string;
  highlighted?: boolean;
  maxTeamMembers?: number;
  trialDays?: number;
}

interface PlanComparisonProps {
  plans: SubscriptionPlan[];
  features: PlanFeature[];
  currentPlanId?: string;
  onSelectPlan?: (plan: SubscriptionPlan, billingPeriod: BillingPeriod) => void;
  isLoading?: boolean;
}

// ============================================================================
// Feature Categories
// ============================================================================

const CATEGORY_INFO: Record<FeatureCategory, { label: string; icon: string }> =
  {
    analytics: {
      label: "Analytics & Insights",
      icon: "solar:chart-2-bold-duotone",
    },
    storage: {
      label: "Cloud Storage",
      icon: "solar:cloud-storage-bold-duotone",
    },
    matchmaking: { label: "Matchmaking", icon: "solar:gamepad-bold-duotone" },
    coaching: {
      label: "Coaching",
      icon: "solar:square-academic-cap-bold-duotone",
    },
    tournaments: { label: "Tournaments", icon: "solar:cup-star-bold-duotone" },
    support: {
      label: "Support",
      icon: "solar:headphones-round-sound-bold-duotone",
    },
    api: {
      label: "API & Integrations",
      icon: "solar:programming-bold-duotone",
    },
  };

// ============================================================================
// Default Plans & Features
// ============================================================================

export const DEFAULT_FEATURES: PlanFeature[] = [
  // Analytics
  { id: "basic-stats", name: "Basic Match Statistics", category: "analytics" },
  {
    id: "advanced-stats",
    name: "Advanced Performance Analytics",
    category: "analytics",
  },
  {
    id: "ai-insights",
    name: "AI-Powered Insights",
    category: "analytics",
    description: "Personalized improvement recommendations",
  },
  {
    id: "team-analytics",
    name: "Team Analytics Dashboard",
    category: "analytics",
  },
  {
    id: "historical-data",
    name: "Historical Data Access",
    category: "analytics",
  },
  // Storage
  { id: "replay-storage", name: "Replay Storage", category: "storage" },
  { id: "cloud-configs", name: "Cloud Config Storage", category: "storage" },
  {
    id: "priority-processing",
    name: "Priority Replay Processing",
    category: "storage",
  },
  // Matchmaking
  {
    id: "basic-matchmaking",
    name: "Basic Matchmaking",
    category: "matchmaking",
  },
  { id: "priority-queue", name: "Priority Queue", category: "matchmaking" },
  { id: "custom-lobbies", name: "Custom Lobbies", category: "matchmaking" },
  {
    id: "private-servers",
    name: "Private Match Servers",
    category: "matchmaking",
  },
  // Coaching
  {
    id: "coaching-access",
    name: "Coaching Marketplace Access",
    category: "coaching",
  },
  { id: "coach-discounts", name: "Coaching Discounts", category: "coaching" },
  { id: "vod-reviews", name: "Monthly VOD Reviews", category: "coaching" },
  // Tournaments
  { id: "tournament-entry", name: "Tournament Entry", category: "tournaments" },
  {
    id: "premium-tournaments",
    name: "Premium Tournaments",
    category: "tournaments",
  },
  {
    id: "create-tournaments",
    name: "Create Tournaments",
    category: "tournaments",
  },
  // Support
  { id: "community-support", name: "Community Support", category: "support" },
  { id: "email-support", name: "Email Support", category: "support" },
  { id: "priority-support", name: "Priority Support", category: "support" },
  {
    id: "dedicated-support",
    name: "Dedicated Account Manager",
    category: "support",
  },
  // API
  { id: "api-access", name: "API Access", category: "api" },
  { id: "api-rate-limit", name: "API Rate Limit", category: "api" },
  { id: "webhooks", name: "Webhooks", category: "api" },
];

export const DEFAULT_PLANS: SubscriptionPlan[] = [
  {
    id: "free",
    name: "Free",
    description: "Get started with basic features",
    tier: "free",
    prices: { monthly: 0, quarterly: 0, yearly: 0 },
    currency: "USD",
    features: [
      { featureId: "basic-stats", value: true },
      { featureId: "advanced-stats", value: false },
      { featureId: "ai-insights", value: false },
      { featureId: "team-analytics", value: false },
      { featureId: "historical-data", value: "30 days" },
      { featureId: "replay-storage", value: "5 GB" },
      { featureId: "cloud-configs", value: false },
      { featureId: "priority-processing", value: false },
      { featureId: "basic-matchmaking", value: true },
      { featureId: "priority-queue", value: false },
      { featureId: "custom-lobbies", value: false },
      { featureId: "private-servers", value: false },
      { featureId: "coaching-access", value: true },
      { featureId: "coach-discounts", value: false },
      { featureId: "vod-reviews", value: false },
      { featureId: "tournament-entry", value: true },
      { featureId: "premium-tournaments", value: false },
      { featureId: "create-tournaments", value: false },
      { featureId: "community-support", value: true },
      { featureId: "email-support", value: false },
      { featureId: "priority-support", value: false },
      { featureId: "dedicated-support", value: false },
      { featureId: "api-access", value: false },
      { featureId: "api-rate-limit", value: false },
      { featureId: "webhooks", value: false },
    ],
  },
  {
    id: "pro",
    name: "Pro",
    description: "For serious competitors",
    tier: "pro",
    prices: { monthly: 999, quarterly: 2499, yearly: 7999 },
    currency: "USD",
    badge: "Most Popular",
    highlighted: true,
    trialDays: 7,
    features: [
      { featureId: "basic-stats", value: true },
      { featureId: "advanced-stats", value: true },
      { featureId: "ai-insights", value: true },
      { featureId: "team-analytics", value: false },
      { featureId: "historical-data", value: "1 year" },
      { featureId: "replay-storage", value: "50 GB" },
      { featureId: "cloud-configs", value: true },
      { featureId: "priority-processing", value: true },
      { featureId: "basic-matchmaking", value: true },
      { featureId: "priority-queue", value: true },
      { featureId: "custom-lobbies", value: true },
      { featureId: "private-servers", value: false },
      { featureId: "coaching-access", value: true },
      { featureId: "coach-discounts", value: "10%" },
      { featureId: "vod-reviews", value: "2/month" },
      { featureId: "tournament-entry", value: true },
      { featureId: "premium-tournaments", value: true },
      { featureId: "create-tournaments", value: false },
      { featureId: "community-support", value: true },
      { featureId: "email-support", value: true },
      { featureId: "priority-support", value: false },
      { featureId: "dedicated-support", value: false },
      { featureId: "api-access", value: true },
      { featureId: "api-rate-limit", value: "1000/day" },
      { featureId: "webhooks", value: false },
    ],
  },
  {
    id: "team",
    name: "Team",
    description: "For competitive teams",
    tier: "team",
    prices: { monthly: 2999, quarterly: 7499, yearly: 23999 },
    currency: "USD",
    maxTeamMembers: 10,
    trialDays: 14,
    features: [
      { featureId: "basic-stats", value: true },
      { featureId: "advanced-stats", value: true },
      { featureId: "ai-insights", value: true },
      { featureId: "team-analytics", value: true },
      { featureId: "historical-data", value: "Unlimited" },
      { featureId: "replay-storage", value: "500 GB" },
      { featureId: "cloud-configs", value: true },
      { featureId: "priority-processing", value: true },
      { featureId: "basic-matchmaking", value: true },
      { featureId: "priority-queue", value: true },
      { featureId: "custom-lobbies", value: true },
      { featureId: "private-servers", value: true },
      { featureId: "coaching-access", value: true },
      { featureId: "coach-discounts", value: "20%" },
      { featureId: "vod-reviews", value: "5/month" },
      { featureId: "tournament-entry", value: true },
      { featureId: "premium-tournaments", value: true },
      { featureId: "create-tournaments", value: true },
      { featureId: "community-support", value: true },
      { featureId: "email-support", value: true },
      { featureId: "priority-support", value: true },
      { featureId: "dedicated-support", value: false },
      { featureId: "api-access", value: true },
      { featureId: "api-rate-limit", value: "10000/day" },
      { featureId: "webhooks", value: true },
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    description: "Custom solutions for organizations",
    tier: "enterprise",
    prices: { monthly: 0, quarterly: 0, yearly: 0 }, // Custom pricing
    currency: "USD",
    badge: "Contact Sales",
    features: [
      { featureId: "basic-stats", value: true },
      { featureId: "advanced-stats", value: true },
      { featureId: "ai-insights", value: true },
      { featureId: "team-analytics", value: true },
      { featureId: "historical-data", value: "Unlimited" },
      { featureId: "replay-storage", value: "Unlimited" },
      { featureId: "cloud-configs", value: true },
      { featureId: "priority-processing", value: true },
      { featureId: "basic-matchmaking", value: true },
      { featureId: "priority-queue", value: true },
      { featureId: "custom-lobbies", value: true },
      { featureId: "private-servers", value: true },
      { featureId: "coaching-access", value: true },
      { featureId: "coach-discounts", value: "Custom" },
      { featureId: "vod-reviews", value: "Unlimited" },
      { featureId: "tournament-entry", value: true },
      { featureId: "premium-tournaments", value: true },
      { featureId: "create-tournaments", value: true },
      { featureId: "community-support", value: true },
      { featureId: "email-support", value: true },
      { featureId: "priority-support", value: true },
      { featureId: "dedicated-support", value: true },
      { featureId: "api-access", value: true },
      { featureId: "api-rate-limit", value: "Unlimited" },
      { featureId: "webhooks", value: true },
    ],
  },
];

// ============================================================================
// Component
// ============================================================================

export function PlanComparison({
  plans = DEFAULT_PLANS,
  features = DEFAULT_FEATURES,
  currentPlanId,
  onSelectPlan,
  isLoading = false,
}: PlanComparisonProps) {
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>("yearly");
  const [showFullComparison, setShowFullComparison] = useState(false);

  // Group features by category
  const featuresByCategory = useMemo(() => {
    const grouped: Record<FeatureCategory, PlanFeature[]> = {
      analytics: [],
      storage: [],
      matchmaking: [],
      coaching: [],
      tournaments: [],
      support: [],
      api: [],
    };
    features.forEach((feature) => {
      grouped[feature.category].push(feature);
    });
    return grouped;
  }, [features]);

  // Calculate savings for yearly billing
  const getSavingsPercent = (plan: SubscriptionPlan): number => {
    if (plan.prices.monthly === 0) return 0;
    const monthlyTotal = plan.prices.monthly * 12;
    const yearlyTotal = plan.prices.yearly;
    return Math.round(((monthlyTotal - yearlyTotal) / monthlyTotal) * 100);
  };

  const formatPrice = (amount: number, currency: string): string => {
    if (amount === 0) return "Free";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
    }).format(amount / 100);
  };

  const getFeatureValue = (
    plan: SubscriptionPlan,
    featureId: string
  ): PlanFeatureValue | undefined => {
    return plan.features.find((f) => f.featureId === featureId);
  };

  const renderFeatureValue = (
    value: boolean | string | number
  ): React.ReactNode => {
    if (typeof value === "boolean") {
      return value ? (
        <Icon icon="solar:check-circle-bold" className="w-5 h-5 text-success" />
      ) : (
        <Icon
          icon="solar:close-circle-bold"
          className="w-5 h-5 text-default-300"
        />
      );
    }
    return <span className="text-sm font-medium">{value}</span>;
  };

  return (
    <div className="space-y-6">
      {/* Billing Period Toggle */}
      <div className="flex justify-center items-center gap-4">
        <span
          className={`text-sm ${
            billingPeriod === "monthly" ? "font-semibold" : "text-default-500"
          }`}
        >
          Monthly
        </span>
        <Switch
          isSelected={billingPeriod === "yearly"}
          onValueChange={(checked) =>
            setBillingPeriod(checked ? "yearly" : "monthly")
          }
          classNames={{
            wrapper: "group-data-[selected=true]:bg-success",
          }}
        />
        <span
          className={`text-sm ${
            billingPeriod === "yearly" ? "font-semibold" : "text-default-500"
          }`}
        >
          Yearly
          <Chip size="sm" color="success" variant="flat" className="ml-2">
            Save up to 33%
          </Chip>
        </span>
      </div>

      {/* Plan Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {plans.map((plan) => {
          const isCurrentPlan = plan.id === currentPlanId;
          const savings = getSavingsPercent(plan);
          const price = plan.prices[billingPeriod];

          return (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card
                className={`h-full ${
                  plan.highlighted
                    ? "border-2 border-primary shadow-lg"
                    : isCurrentPlan
                    ? "border-2 border-success"
                    : ""
                }`}
              >
                <CardHeader className="flex flex-col items-start gap-2 pb-0">
                  <div className="flex justify-between items-start w-full">
                    <div>
                      <h3 className="text-xl font-bold">{plan.name}</h3>
                      <p className="text-sm text-default-500">
                        {plan.description}
                      </p>
                    </div>
                    {plan.badge && (
                      <Chip
                        size="sm"
                        color={plan.highlighted ? "primary" : "default"}
                        variant="flat"
                      >
                        {plan.badge}
                      </Chip>
                    )}
                  </div>
                </CardHeader>

                <CardBody className="gap-4">
                  {/* Price */}
                  <div className="text-center py-4">
                    {plan.tier === "enterprise" ? (
                      <div className="text-2xl font-bold">Custom Pricing</div>
                    ) : (
                      <>
                        <div className="text-4xl font-bold">
                          {formatPrice(price, plan.currency)}
                        </div>
                        {price > 0 && (
                          <div className="text-sm text-default-500">
                            per {billingPeriod === "yearly" ? "year" : "month"}
                          </div>
                        )}
                        {billingPeriod === "yearly" && savings > 0 && (
                          <Chip
                            size="sm"
                            color="success"
                            variant="flat"
                            className="mt-2"
                          >
                            Save {savings}%
                          </Chip>
                        )}
                      </>
                    )}
                  </div>

                  {/* Trial info */}
                  {plan.trialDays && (
                    <div className="text-center text-sm text-primary">
                      {plan.trialDays}-day free trial
                    </div>
                  )}

                  {/* Team members */}
                  {plan.maxTeamMembers && (
                    <div className="flex items-center justify-center gap-2 text-sm text-default-500">
                      <Icon
                        icon="solar:users-group-rounded-bold-duotone"
                        className="w-4 h-4"
                      />
                      Up to {plan.maxTeamMembers} team members
                    </div>
                  )}

                  <Divider />

                  {/* Key Features */}
                  <div className="space-y-2">
                    {plan.features.slice(0, 6).map((featureValue) => {
                      const feature = features.find(
                        (f) => f.id === featureValue.featureId
                      );
                      if (!feature || !featureValue.value) return null;
                      return (
                        <div
                          key={featureValue.featureId}
                          className="flex items-center gap-2"
                        >
                          <Icon
                            icon="solar:check-circle-bold"
                            className="w-4 h-4 text-success flex-shrink-0"
                          />
                          <span className="text-sm">
                            {feature.name}
                            {typeof featureValue.value === "string" && (
                              <span className="text-default-500 ml-1">
                                ({featureValue.value})
                              </span>
                            )}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* CTA Button */}
                  <div className="mt-auto pt-4">
                    {isCurrentPlan ? (
                      <Button
                        fullWidth
                        isDisabled
                        variant="flat"
                        color="success"
                      >
                        Current Plan
                      </Button>
                    ) : plan.tier === "enterprise" ? (
                      <Button
                        fullWidth
                        variant="bordered"
                        onClick={() => window.open("/contact-sales", "_blank")}
                      >
                        Contact Sales
                      </Button>
                    ) : (
                      <Button
                        fullWidth
                        color={plan.highlighted ? "primary" : "default"}
                        variant={plan.highlighted ? "solid" : "bordered"}
                        isLoading={isLoading}
                        onClick={() => onSelectPlan?.(plan, billingPeriod)}
                      >
                        {plan.trialDays ? "Start Free Trial" : "Get Started"}
                      </Button>
                    )}
                  </div>
                </CardBody>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Full Feature Comparison Toggle */}
      <div className="text-center">
        <Button
          variant="light"
          onClick={() => setShowFullComparison(!showFullComparison)}
          endContent={
            <Icon
              icon={
                showFullComparison
                  ? "solar:alt-arrow-up-linear"
                  : "solar:alt-arrow-down-linear"
              }
              className="w-4 h-4"
            />
          }
        >
          {showFullComparison ? "Hide" : "Show"} Full Feature Comparison
        </Button>
      </div>

      {/* Full Feature Comparison Table */}
      <AnimatePresence>
        {showFullComparison && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card>
              <CardBody className="p-0">
                <ScrollShadow className="max-h-[600px]" hideScrollBar>
                  <table className="w-full min-w-[800px]">
                    <thead className="sticky top-0 bg-content1 z-10">
                      <tr>
                        <th className="text-left p-4 font-semibold">
                          Features
                        </th>
                        {plans.map((plan) => (
                          <th
                            key={plan.id}
                            className="text-center p-4 font-semibold"
                          >
                            {plan.name}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(featuresByCategory).map(
                        ([category, categoryFeatures]) => (
                          <React.Fragment key={category}>
                            {/* Category Header */}
                            <tr className="bg-default-100">
                              <td colSpan={plans.length + 1} className="p-3">
                                <div className="flex items-center gap-2">
                                  <Icon
                                    icon={
                                      CATEGORY_INFO[category as FeatureCategory]
                                        .icon
                                    }
                                    className="w-5 h-5 text-primary"
                                  />
                                  <span className="font-semibold">
                                    {
                                      CATEGORY_INFO[category as FeatureCategory]
                                        .label
                                    }
                                  </span>
                                </div>
                              </td>
                            </tr>
                            {/* Features */}
                            {categoryFeatures.map((feature) => (
                              <tr
                                key={feature.id}
                                className="border-b border-divider"
                              >
                                <td className="p-4">
                                  <div className="flex items-center gap-2">
                                    <span>{feature.name}</span>
                                    {feature.description && (
                                      <Tooltip content={feature.description}>
                                        <Icon
                                          icon="solar:info-circle-linear"
                                          className="w-4 h-4 text-default-400 cursor-help"
                                        />
                                      </Tooltip>
                                    )}
                                  </div>
                                </td>
                                {plans.map((plan) => {
                                  const featureValue = getFeatureValue(
                                    plan,
                                    feature.id
                                  );
                                  return (
                                    <td
                                      key={plan.id}
                                      className="text-center p-4"
                                    >
                                      {featureValue ? (
                                        renderFeatureValue(featureValue.value)
                                      ) : (
                                        <Icon
                                          icon="solar:minus-circle-linear"
                                          className="w-5 h-5 text-default-300 mx-auto"
                                        />
                                      )}
                                    </td>
                                  );
                                })}
                              </tr>
                            ))}
                          </React.Fragment>
                        )
                      )}
                    </tbody>
                  </table>
                </ScrollShadow>
              </CardBody>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default PlanComparison;

"use client";

/**
 * Subscription Step
 * Choose a subscription plan
 */

import React from "react";
import { Chip, Divider, Link } from "@nextui-org/react";
import { EsportsButton } from "@/components/ui/esports-button";
import { Icon } from "@iconify/react";
import { useOnboarding } from "../onboarding-context";

const PLANS = [
  {
    id: "free" as const,
    name: "Free",
    price: "$0",
    period: "forever",
    description: "For casual players exploring competitive gaming",
    features: [
      "5 replay uploads/month",
      "500 MB cloud storage",
      "Basic analytics (K/D, ADR, Rating)",
      "Casual matchmaking queue",
      "Community forums & chat",
    ],
    color: "default",
    icon: "solar:gamepad-bold",
    gradient: "from-[#34445C] to-[#2a3749]",
    accent: "text-[#34445C] dark:text-[#F5F0E1]/70",
  },
  {
    id: "pro" as const,
    name: "Pro",
    price: "$9.99",
    period: "/month",
    description: "For competitive players serious about improving",
    features: [
      "Unlimited replay uploads",
      "25 GB cloud storage",
      "Advanced analytics & AI insights",
      "Priority matchmaking queue",
      "Skill-based wager matches",
      "Ad-free experience",
    ],
    popular: true,
    color: "primary",
    icon: "solar:crown-bold",
    gradient: "from-[#FF4654] to-[#FF6B7A]",
    accent: "text-[#FF4654]",
  },
  {
    id: "team" as const,
    name: "Team",
    price: "$29.99",
    period: "/month",
    description: "For esports teams with 10 included seats",
    features: [
      "Everything in Pro, plus:",
      "100 GB shared team storage",
      "Team analytics dashboard",
      "Opponent research & scouting",
      "Scrim scheduling calendar",
      "API access & webhooks",
    ],
    color: "secondary",
    icon: "solar:users-group-rounded-bold",
    gradient: "from-[#DCFF37] to-[#34445C]",
    accent: "text-[#DCFF37] dark:text-[#DCFF37]",
  },
];

export function SubscriptionStep() {
  const { state, selectPlan, completeOnboarding } = useOnboarding();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleContinue = async () => {
    setIsSubmitting(true);
    try {
      await completeOnboarding();
    } catch (error) {
      console.error("Failed to complete onboarding:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold mb-2">Choose Your Plan</h2>
        <p className="text-default-500">
          Start free, upgrade anytime. Save 20% with yearly billing.
        </p>
      </div>

      {/* Plan Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {PLANS.map((plan) => {
          const isSelected = state.selectedPlan === plan.id;

          return (
            <button
              key={plan.id}
              onClick={() => selectPlan(plan.id)}
              className={`
                relative p-4 rounded-xl border-2 text-left transition-all
                ${
                  isSelected
                    ? plan.color === "primary"
                      ? "border-[#FF4654] bg-[#FF4654]/5 shadow-lg shadow-[#FF4654]/10"
                      : plan.color === "secondary"
                      ? "border-[#DCFF37] bg-[#DCFF37]/5 shadow-lg shadow-[#DCFF37]/10"
                      : "border-primary bg-primary/5 shadow-lg"
                    : "border-default-200 hover:border-default-400 hover:shadow-md"
                }
              `}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <Chip
                  size="sm"
                  className="absolute -top-2 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#FF4654] to-[#FFC700] text-[#F5F0E1] font-semibold"
                >
                  Most Popular
                </Chip>
              )}

              {/* Header */}
              <div className="pt-2">
                <div
                  className={`
                  w-10 h-10 rounded-lg flex items-center justify-center mb-3
                  bg-gradient-to-br ${plan.gradient}
                `}
                >
                  <Icon
                    icon={plan.icon}
                    width={24}
                    className="text-[#F5F0E1]"
                  />
                </div>

                <h3 className="text-lg font-bold">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-2xl font-bold">{plan.price}</span>
                  <span className="text-sm text-default-500">
                    {plan.period}
                  </span>
                </div>
                <p className="text-xs text-default-500 mb-4">
                  {plan.description}
                </p>
              </div>

              <Divider className="my-3" />

              {/* Features */}
              <ul className="space-y-2">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm">
                    <Icon
                      icon="solar:check-circle-bold"
                      className={`w-4 h-4 mt-0.5 flex-shrink-0 ${plan.accent}`}
                    />
                    <span className="text-default-600">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* Selection Indicator */}
              {isSelected && (
                <div className="absolute top-3 right-3">
                  <Icon
                    icon="solar:check-circle-bold"
                    className={`w-6 h-6 ${plan.accent}`}
                  />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Organizer CTA */}
      <div className="text-center py-2">
        <p className="text-sm text-default-400">
          Running tournaments?{" "}
          <Link
            href="/contact?plan=organizer"
            className="text-[#F59E0B] font-medium"
          >
            Check out our Organizer plan at $99.99/month
          </Link>
        </p>
      </div>

      {/* Trust Badges */}
      <div className="flex items-center justify-center gap-6 py-4 text-default-400">
        <div className="flex items-center gap-1 text-xs">
          <Icon icon="solar:shield-check-bold" width={16} />
          <span>Secure Payment</span>
        </div>
        <div className="flex items-center gap-1 text-xs">
          <Icon icon="solar:refresh-bold" width={16} />
          <span>Cancel Anytime</span>
        </div>
        <div className="flex items-center gap-1 text-xs">
          <Icon icon="solar:lock-bold" width={16} />
          <span>No Hidden Fees</span>
        </div>
      </div>

      {/* Actions */}
      <div className="pt-4">
        <EsportsButton
          variant="matchmaking"
          size="lg"
          fullWidth
          onClick={handleContinue}
          loading={isSubmitting}
          disabled={!state.selectedPlan}
        >
          {state.selectedPlan === "free" ? "Start Free" : "Continue to Payment"}
          <Icon icon="solar:arrow-right-linear" width={20} />
        </EsportsButton>
        {state.selectedPlan !== "free" && (
          <p className="text-center text-xs text-default-400 mt-2">
            You can change your plan at any time
          </p>
        )}
      </div>
    </div>
  );
}

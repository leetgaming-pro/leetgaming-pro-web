'use client';

import React from 'react';
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
} from '@nextui-org/react';
import { Icon } from '@iconify/react';
import { cn } from '@nextui-org/react';
import { useCheckout } from './checkout-context';
import {
  PricingPlan,
  BillingPeriod,
  BILLING_PERIOD_LABELS,
} from './types';

// ============================================================================
// Plan Data
// ============================================================================

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: 'free',
    key: 'free',
    name: 'Free',
    description: 'Perfect for casual gamers getting started.',
    price: {
      monthly: 0,
      quarterly: 0,
      yearly: 0,
      currency: 'usd',
    },
    features: [
      '5 replay uploads per month',
      '1 GB cloud storage',
      'Basic match statistics',
      'Community access',
      'Help center access',
    ],
    stripePriceId: undefined,
  },
  {
    id: 'pro',
    key: 'pro',
    name: 'Pro',
    description: 'For competitive players who want an edge.',
    price: {
      monthly: 9.99,
      quarterly: 24.99,
      yearly: 79.99,
      currency: 'usd',
    },
    features: [
      'Unlimited replay uploads',
      '50 GB cloud storage',
      'Advanced analytics & heatmaps',
      'Priority matchmaking',
      'Custom highlights generator',
      'Priority email support',
    ],
    highlighted: true,
    badge: 'Most Popular',
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID,
  },
  {
    id: 'team',
    key: 'team',
    name: 'Team',
    description: 'For esports teams and organizations.',
    price: {
      monthly: 29.99,
      quarterly: 79.99,
      yearly: 249.99,
      currency: 'usd',
    },
    features: [
      'Everything in Pro',
      '500 GB team storage',
      'Team management dashboard',
      'Scrim scheduling & tracking',
      'API access & webhooks',
      'Custom branding',
      'Dedicated account manager',
      'Phone & email support',
    ],
    badge: 'Best Value',
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_TEAM_PRICE_ID,
  },
];

// ============================================================================
// Component
// ============================================================================

interface PlanSelectionProps {
  onSelectPlan?: (plan: PricingPlan) => void;
}

export function PlanSelection({ onSelectPlan }: PlanSelectionProps) {
  const {
    state,
    selectPlan,
    setBillingPeriod,
    getPriceForPeriod,
    getSavingsPercentage,
  } = useCheckout();

  const handleSelectPlan = (plan: PricingPlan) => {
    selectPlan(plan);
    onSelectPlan?.(plan);
  };

  const formatPrice = (plan: PricingPlan): string => {
    const price = getPriceForPeriod(plan);
    if (price === 0) return 'Free';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: plan.price.currency.toUpperCase(),
    }).format(price);
  };

  const getPriceSuffix = (): string => {
    switch (state.billingPeriod) {
      case 'monthly':
        return '/month';
      case 'quarterly':
        return '/quarter';
      case 'yearly':
        return '/year';
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
            tabList: 'gap-2 bg-content2 p-1 rounded-full',
            tab: 'px-4 h-10',
            cursor: 'bg-primary',
          }}
          radius="full"
          size="lg"
        >
          <Tab
            key="yearly"
            title={
              <div className="flex items-center gap-2">
                <span>Yearly</span>
                <Chip color="success" size="sm" variant="flat">
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
        {PRICING_PLANS.map((plan) => {
          const isHighlighted = plan.highlighted;
          const savings = getSavingsPercentage(plan);

          return (
            <Card
              key={plan.id}
              className={cn(
                'relative transition-all duration-300',
                isHighlighted
                  ? 'border-2 border-primary shadow-lg shadow-primary/20 scale-105 z-10'
                  : 'border border-content3 hover:border-primary/50'
              )}
              shadow={isHighlighted ? 'lg' : 'sm'}
            >
              {plan.badge && (
                <Chip
                  color={isHighlighted ? 'primary' : 'default'}
                  variant="flat"
                  className="absolute top-3 right-3 z-20"
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
                    <span className="text-4xl font-bold">{formatPrice(plan)}</span>
                    {plan.price.monthly > 0 && (
                      <span className="text-default-500">{getPriceSuffix()}</span>
                    )}
                  </div>
                  {savings > 0 && state.billingPeriod !== 'monthly' && (
                    <p className="text-sm text-success mt-1">
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
                          'w-5 h-5 mt-0.5 flex-shrink-0',
                          isHighlighted ? 'text-primary' : 'text-success'
                        )}
                      />
                      <span className="text-sm text-default-600">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardBody>

              <CardFooter className="px-6 pb-6">
                <Button
                  fullWidth
                  color={isHighlighted ? 'primary' : 'default'}
                  variant={isHighlighted ? 'solid' : 'bordered'}
                  size="lg"
                  onPress={() => handleSelectPlan(plan)}
                  className={cn(
                    isHighlighted && 'shadow-lg shadow-primary/25'
                  )}
                >
                  {plan.price.monthly === 0 ? 'Get Started Free' : 'Select Plan'}
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>

      {/* Trust Badges */}
      <div className="flex flex-wrap justify-center gap-6 pt-8">
        <div className="flex items-center gap-2 text-default-500">
          <Icon icon="solar:shield-check-bold" className="w-5 h-5 text-success" />
          <span className="text-sm">Secure payments</span>
        </div>
        <div className="flex items-center gap-2 text-default-500">
          <Icon icon="solar:refresh-circle-bold" className="w-5 h-5 text-primary" />
          <span className="text-sm">Cancel anytime</span>
        </div>
        <div className="flex items-center gap-2 text-default-500">
          <Icon icon="solar:clock-circle-bold" className="w-5 h-5 text-warning" />
          <span className="text-sm">30-day money back</span>
        </div>
      </div>
    </div>
  );
}

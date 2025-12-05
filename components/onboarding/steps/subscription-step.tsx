'use client';

/**
 * Subscription Step
 * Choose a subscription plan
 */

import React from 'react';
import { Button, Chip, Divider } from '@nextui-org/react';
import { Icon } from '@iconify/react';
import { useOnboarding } from '../onboarding-context';

const PLANS = [
  {
    id: 'free' as const,
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'Perfect for getting started',
    features: [
      '5 replay uploads/month',
      'Basic statistics',
      'Community features',
      '7-day file retention',
    ],
    color: 'default',
    icon: 'solar:gamepad-bold',
  },
  {
    id: 'pro' as const,
    name: 'Pro',
    price: '$9.99',
    period: '/month',
    description: 'For serious competitors',
    features: [
      'Unlimited replay uploads',
      'Advanced AI analysis',
      'Priority matchmaking',
      'Unlimited file retention',
      'Custom team profiles',
      'Tournament access',
    ],
    popular: true,
    color: 'primary',
    icon: 'solar:crown-bold',
  },
  {
    id: 'team' as const,
    name: 'Team',
    price: '$29.99',
    period: '/month',
    description: 'For esports teams',
    features: [
      'Everything in Pro',
      'Up to 10 team members',
      'Team analytics dashboard',
      'Scrim management',
      'Coach accounts',
      'API access',
    ],
    color: 'secondary',
    icon: 'solar:users-group-rounded-bold',
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
      console.error('Failed to complete onboarding:', error);
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
          Start free, upgrade anytime
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
                ${isSelected
                  ? 'border-primary bg-primary/5 shadow-lg'
                  : 'border-default-200 hover:border-default-400'}
              `}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <Chip
                  size="sm"
                  color="primary"
                  className="absolute -top-2 left-1/2 -translate-x-1/2"
                >
                  Most Popular
                </Chip>
              )}

              {/* Header */}
              <div className="pt-2">
                <div className={`
                  w-10 h-10 rounded-lg flex items-center justify-center mb-3
                  ${plan.color === 'primary'
                    ? 'bg-primary/20 text-primary'
                    : plan.color === 'secondary'
                    ? 'bg-secondary/20 text-secondary'
                    : 'bg-default-100 text-default-500'}
                `}>
                  <Icon icon={plan.icon} width={24} />
                </div>

                <h3 className="text-lg font-bold">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-2xl font-bold">{plan.price}</span>
                  <span className="text-sm text-default-500">{plan.period}</span>
                </div>
                <p className="text-xs text-default-500 mb-4">{plan.description}</p>
              </div>

              <Divider className="my-3" />

              {/* Features */}
              <ul className="space-y-2">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm">
                    <Icon
                      icon="solar:check-circle-bold"
                      className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                        plan.color === 'primary'
                          ? 'text-primary'
                          : plan.color === 'secondary'
                          ? 'text-secondary'
                          : 'text-success'
                      }`}
                    />
                    <span className="text-default-600">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* Selection Indicator */}
              {isSelected && (
                <div className="absolute top-3 right-3">
                  <Icon icon="solar:check-circle-bold" className="w-6 h-6 text-primary" />
                </div>
              )}
            </button>
          );
        })}
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
        <Button
          color="primary"
          size="lg"
          className="w-full"
          endContent={<Icon icon="solar:arrow-right-linear" width={20} />}
          onPress={handleContinue}
          isLoading={isSubmitting}
          isDisabled={!state.selectedPlan}
        >
          {state.selectedPlan === 'free' ? 'Start Free' : 'Continue to Payment'}
        </Button>
        {state.selectedPlan !== 'free' && (
          <p className="text-center text-xs text-default-400 mt-2">
            You can change your plan at any time
          </p>
        )}
      </div>
    </div>
  );
}

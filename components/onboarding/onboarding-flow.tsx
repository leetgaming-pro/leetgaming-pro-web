'use client';

/**
 * Onboarding Flow Component
 * Multi-step onboarding experience for new users
 */

import React from 'react';
import {
  Card,
  CardBody,
  CardHeader,
  Progress,
  Button,
} from '@nextui-org/react';
import { Icon } from '@iconify/react';
import { useOnboarding } from './onboarding-context';
import { OnboardingStep } from './types';
import { WelcomeStep } from './steps/welcome-step';
import { ProfileStep } from './steps/profile-step';
import { GamingPreferencesStep } from './steps/gaming-preferences-step';
import { ConnectAccountsStep } from './steps/connect-accounts-step';
import { SubscriptionStep } from './steps/subscription-step';
import { CompleteStep } from './steps/complete-step';

// ============================================================================
// Step Configuration
// ============================================================================

const STEP_CONFIG: Record<OnboardingStep, { title: string; icon: string }> = {
  [OnboardingStep.WELCOME]: { title: 'Welcome', icon: 'solar:hand-shake-bold' },
  [OnboardingStep.PROFILE]: { title: 'Profile', icon: 'solar:user-bold' },
  [OnboardingStep.GAMING_PREFERENCES]: { title: 'Gaming', icon: 'solar:gamepad-bold' },
  [OnboardingStep.CONNECT_ACCOUNTS]: { title: 'Connect', icon: 'solar:link-bold' },
  [OnboardingStep.SUBSCRIPTION]: { title: 'Plan', icon: 'solar:crown-bold' },
  [OnboardingStep.COMPLETE]: { title: 'Complete', icon: 'solar:check-circle-bold' },
};

// ============================================================================
// Component
// ============================================================================

export function OnboardingFlow() {
  const {
    currentStep,
    progress,
    isFirstStep,
    goToPreviousStep,
  } = useOnboarding();

  const renderStep = () => {
    switch (currentStep) {
      case OnboardingStep.WELCOME:
        return <WelcomeStep />;
      case OnboardingStep.PROFILE:
        return <ProfileStep />;
      case OnboardingStep.GAMING_PREFERENCES:
        return <GamingPreferencesStep />;
      case OnboardingStep.CONNECT_ACCOUNTS:
        return <ConnectAccountsStep />;
      case OnboardingStep.SUBSCRIPTION:
        return <SubscriptionStep />;
      case OnboardingStep.COMPLETE:
        return <CompleteStep />;
      default:
        return <WelcomeStep />;
    }
  };

  const stepConfig = STEP_CONFIG[currentStep];

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-primary/5">
      <Card className="w-full max-w-3xl">
        {/* Header with Progress */}
        <CardHeader className="flex flex-col gap-4 pb-0">
          {currentStep !== OnboardingStep.COMPLETE && (
            <>
              {/* Progress Bar */}
              <div className="w-full">
                <Progress
                  value={progress}
                  size="sm"
                  color="primary"
                  className="w-full"
                  classNames={{
                    indicator: 'bg-gradient-to-r from-primary to-secondary',
                  }}
                />
              </div>

              {/* Step Indicators */}
              <div className="flex items-center justify-between w-full px-2">
                {Object.entries(STEP_CONFIG).map(([step, config], index) => {
                  const stepOrder = Object.keys(STEP_CONFIG);
                  const currentIndex = stepOrder.indexOf(currentStep);
                  const thisIndex = index;
                  const isCompleted = thisIndex < currentIndex;
                  const isCurrent = step === currentStep;

                  if (step === OnboardingStep.COMPLETE) return null;

                  return (
                    <div
                      key={step}
                      className={`flex flex-col items-center gap-1 ${
                        isCurrent
                          ? 'text-primary'
                          : isCompleted
                          ? 'text-success'
                          : 'text-default-400'
                      }`}
                    >
                      <div
                        className={`
                          w-10 h-10 rounded-full flex items-center justify-center
                          ${isCurrent ? 'bg-primary/20' : isCompleted ? 'bg-success/20' : 'bg-default-100'}
                        `}
                      >
                        {isCompleted ? (
                          <Icon icon="solar:check-circle-bold" width={24} />
                        ) : (
                          <Icon icon={config.icon} width={20} />
                        )}
                      </div>
                      <span className="text-xs font-medium hidden sm:block">{config.title}</span>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* Back Button */}
          {!isFirstStep && currentStep !== OnboardingStep.COMPLETE && (
            <Button
              variant="light"
              size="sm"
              startContent={<Icon icon="solar:arrow-left-linear" width={18} />}
              onPress={goToPreviousStep}
              className="self-start"
            >
              Back
            </Button>
          )}
        </CardHeader>

        <CardBody className="p-6 md:p-8">
          {renderStep()}
        </CardBody>
      </Card>
    </div>
  );
}

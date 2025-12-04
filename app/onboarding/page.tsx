'use client';

/**
 * Onboarding Page
 * Multi-step onboarding flow for new users
 */

import React from 'react';
import { OnboardingProvider, OnboardingFlow } from '@/components/onboarding';

export default function OnboardingPage() {
  return (
    <OnboardingProvider>
      <OnboardingFlow />
    </OnboardingProvider>
  );
}

'use client';

/**
 * Onboarding Context
 * Manages onboarding state and step progression
 */

import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import {
  OnboardingStep,
  OnboardingState,
  OnboardingProfile,
  GamingPreferences,
  ConnectedAccounts,
  GameTitle,
} from './types';

// ============================================================================
// Context Types
// ============================================================================

interface OnboardingContextValue {
  state: OnboardingState;
  currentStep: OnboardingStep;
  progress: number;
  totalSteps: number;
  isFirstStep: boolean;
  isLastStep: boolean;
  goToNextStep: () => void;
  goToPreviousStep: () => void;
  goToStep: (step: OnboardingStep) => void;
  updateProfile: (profile: Partial<OnboardingProfile>) => void;
  updateGamingPreferences: (prefs: Partial<GamingPreferences>) => void;
  updateConnectedAccounts: (accounts: Partial<ConnectedAccounts>) => void;
  selectPlan: (plan: 'free' | 'pro' | 'team' | null) => void;
  markStepComplete: (step: OnboardingStep) => void;
  skipStep: () => void;
  completeOnboarding: () => Promise<void>;
  resetOnboarding: () => void;
}

const OnboardingContext = createContext<OnboardingContextValue | null>(null);

// ============================================================================
// Step Order
// ============================================================================

const STEP_ORDER: OnboardingStep[] = [
  OnboardingStep.WELCOME,
  OnboardingStep.PROFILE,
  OnboardingStep.GAMING_PREFERENCES,
  OnboardingStep.CONNECT_ACCOUNTS,
  OnboardingStep.SUBSCRIPTION,
  OnboardingStep.COMPLETE,
];

// ============================================================================
// Initial State
// ============================================================================

const INITIAL_STATE: OnboardingState = {
  currentStep: OnboardingStep.WELCOME,
  profile: {
    displayName: '',
    bio: '',
    avatarUrl: undefined,
    country: '',
  },
  gamingPreferences: {
    games: [],
    primaryGame: null,
    region: null,
    skillLevel: null,
    playStyle: null,
    lookingForTeam: false,
  },
  connectedAccounts: {},
  selectedPlan: null,
  completedSteps: [],
};

// ============================================================================
// Provider
// ============================================================================

interface OnboardingProviderProps {
  children: React.ReactNode;
  initialState?: Partial<OnboardingState>;
}

export function OnboardingProvider({ children, initialState }: OnboardingProviderProps) {
  const [state, setState] = useState<OnboardingState>({
    ...INITIAL_STATE,
    ...initialState,
  });

  const currentStepIndex = useMemo(
    () => STEP_ORDER.indexOf(state.currentStep),
    [state.currentStep]
  );

  const progress = useMemo(
    () => Math.round((currentStepIndex / (STEP_ORDER.length - 1)) * 100),
    [currentStepIndex]
  );

  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === STEP_ORDER.length - 1;

  const goToNextStep = useCallback(() => {
    setState((prev) => {
      const currentIndex = STEP_ORDER.indexOf(prev.currentStep);
      if (currentIndex < STEP_ORDER.length - 1) {
        const newCompletedSteps = prev.completedSteps.includes(prev.currentStep)
          ? prev.completedSteps
          : [...prev.completedSteps, prev.currentStep];
        return {
          ...prev,
          currentStep: STEP_ORDER[currentIndex + 1],
          completedSteps: newCompletedSteps,
        };
      }
      return prev;
    });
  }, []);

  const goToPreviousStep = useCallback(() => {
    setState((prev) => {
      const currentIndex = STEP_ORDER.indexOf(prev.currentStep);
      if (currentIndex > 0) {
        return {
          ...prev,
          currentStep: STEP_ORDER[currentIndex - 1],
        };
      }
      return prev;
    });
  }, []);

  const goToStep = useCallback((step: OnboardingStep) => {
    setState((prev) => ({
      ...prev,
      currentStep: step,
    }));
  }, []);

  const updateProfile = useCallback((profile: Partial<OnboardingProfile>) => {
    setState((prev) => ({
      ...prev,
      profile: { ...prev.profile, ...profile },
    }));
  }, []);

  const updateGamingPreferences = useCallback((prefs: Partial<GamingPreferences>) => {
    setState((prev) => ({
      ...prev,
      gamingPreferences: { ...prev.gamingPreferences, ...prefs },
    }));
  }, []);

  const updateConnectedAccounts = useCallback((accounts: Partial<ConnectedAccounts>) => {
    setState((prev) => ({
      ...prev,
      connectedAccounts: { ...prev.connectedAccounts, ...accounts },
    }));
  }, []);

  const selectPlan = useCallback((plan: 'free' | 'pro' | 'team' | null) => {
    setState((prev) => ({
      ...prev,
      selectedPlan: plan,
    }));
  }, []);

  const markStepComplete = useCallback((step: OnboardingStep) => {
    setState((prev) => ({
      ...prev,
      completedSteps: prev.completedSteps.includes(step)
        ? prev.completedSteps
        : [...prev.completedSteps, step],
    }));
  }, []);

  const skipStep = useCallback(() => {
    goToNextStep();
  }, [goToNextStep]);

  const completeOnboarding = useCallback(async () => {
    // Save onboarding data to backend
    try {
      await fetch('/api/onboarding/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile: state.profile,
          gamingPreferences: state.gamingPreferences,
          selectedPlan: state.selectedPlan,
        }),
      });

      setState((prev) => ({
        ...prev,
        currentStep: OnboardingStep.COMPLETE,
        completedSteps: [...STEP_ORDER],
      }));
    } catch (error) {
      console.error('Failed to complete onboarding:', error);
      throw error;
    }
  }, [state]);

  const resetOnboarding = useCallback(() => {
    setState(INITIAL_STATE);
  }, []);

  const value: OnboardingContextValue = {
    state,
    currentStep: state.currentStep,
    progress,
    totalSteps: STEP_ORDER.length,
    isFirstStep,
    isLastStep,
    goToNextStep,
    goToPreviousStep,
    goToStep,
    updateProfile,
    updateGamingPreferences,
    updateConnectedAccounts,
    selectPlan,
    markStepComplete,
    skipStep,
    completeOnboarding,
    resetOnboarding,
  };

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  );
}

// ============================================================================
// Hook
// ============================================================================

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
}

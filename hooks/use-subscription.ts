/**
 * useSubscription Hook
 * React hook for subscription operations with state management
 * Uses SDK for type-safe API access - DO NOT use direct fetch calls
 */

'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { ReplayAPISDK } from '@/types/replay-api/sdk';
import { ReplayApiSettingsMock } from '@/types/replay-api/settings';
import { logger } from '@/lib/logger';
import {
  SubscriptionsAPI,
  Plan,
  Subscription,
  BillingPeriod,
  CreateSubscriptionRequest,
  UpdateSubscriptionRequest,
} from '@/types/replay-api/subscriptions.sdk';

const getApiBaseUrl = (): string =>
  typeof window !== 'undefined'
    ? process.env.NEXT_PUBLIC_REPLAY_API_URL || 'http://localhost:8080'
    : process.env.NEXT_PUBLIC_REPLAY_API_URL || process.env.REPLAY_API_URL || 'http://localhost:8080';

export interface UseSubscriptionResult {
  // State
  plans: Plan[];
  currentSubscription: Subscription | null;
  isLoadingPlans: boolean;
  isLoadingSubscription: boolean;
  plansError: string | null;
  subscriptionError: string | null;
  // Actions
  refreshPlans: () => Promise<void>;
  refreshSubscription: () => Promise<void>;
  subscribe: (request: CreateSubscriptionRequest) => Promise<Subscription | null>;
  updateSubscription: (request: UpdateSubscriptionRequest) => Promise<Subscription | null>;
  cancelSubscription: () => Promise<boolean>;
  reactivateSubscription: () => Promise<boolean>;
  pauseSubscription: () => Promise<boolean>;
  resumeSubscription: () => Promise<boolean>;
  // Helpers
  getPlanById: (planId: string) => Plan | undefined;
  isSubscribed: boolean;
  isActive: boolean;
  isPaused: boolean;
  isCanceled: boolean;
  daysUntilRenewal: number | null;
}

export function useSubscription(autoFetch = true): UseSubscriptionResult {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [currentSubscription, setCurrentSubscription] = useState<Subscription | null>(null);
  const [isLoadingPlans, setIsLoadingPlans] = useState(false);
  const [isLoadingSubscription, setIsLoadingSubscription] = useState(false);
  const [plansError, setPlansError] = useState<string | null>(null);
  const [subscriptionError, setSubscriptionError] = useState<string | null>(null);

  // Create API client
  const api = useMemo(() => {
    const baseUrl = getApiBaseUrl();
    const sdk = new ReplayAPISDK({ ...ReplayApiSettingsMock, baseUrl }, logger);
    return new SubscriptionsAPI(sdk.client);
  }, []);

  const refreshPlans = useCallback(async () => {
    setIsLoadingPlans(true);
    setPlansError(null);
    try {
      const result = await api.getPlans();
      if (result) {
        setPlans(result.data);
      } else {
        setPlansError('Failed to fetch plans');
      }
    } catch (err: unknown) {
      logger.error('[useSubscription] Error fetching plans:', err);
      setPlansError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoadingPlans(false);
    }
  }, [api]);

  const refreshSubscription = useCallback(async () => {
    setIsLoadingSubscription(true);
    setSubscriptionError(null);
    try {
      const result = await api.getCurrentSubscription();
      setCurrentSubscription(result);
      // No error if null - user might not have a subscription
    } catch (err: unknown) {
      logger.error('[useSubscription] Error fetching subscription:', err);
      setSubscriptionError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoadingSubscription(false);
    }
  }, [api]);

  const subscribe = useCallback(async (request: CreateSubscriptionRequest): Promise<Subscription | null> => {
    try {
      const result = await api.create(request);
      if (result) {
        setCurrentSubscription(result);
      }
      return result;
    } catch (err: unknown) {
      logger.error('[useSubscription] Subscribe failed:', err);
      return null;
    }
  }, [api]);

  const updateSubscription = useCallback(async (request: UpdateSubscriptionRequest): Promise<Subscription | null> => {
    if (!currentSubscription) return null;
    try {
      const result = await api.update(currentSubscription.id, request);
      if (result) {
        setCurrentSubscription(result);
      }
      return result;
    } catch (err: unknown) {
      logger.error('[useSubscription] Update failed:', err);
      return null;
    }
  }, [api, currentSubscription]);

  const cancelSubscription = useCallback(async (): Promise<boolean> => {
    if (!currentSubscription) return false;
    try {
      const result = await api.cancel(currentSubscription.id);
      if (result) {
        setCurrentSubscription(result);
        return true;
      }
      return false;
    } catch (err: unknown) {
      logger.error('[useSubscription] Cancel failed:', err);
      return false;
    }
  }, [api, currentSubscription]);

  const reactivateSubscription = useCallback(async (): Promise<boolean> => {
    if (!currentSubscription) return false;
    try {
      const result = await api.reactivate(currentSubscription.id);
      if (result) {
        setCurrentSubscription(result);
        return true;
      }
      return false;
    } catch (err: unknown) {
      logger.error('[useSubscription] Reactivate failed:', err);
      return false;
    }
  }, [api, currentSubscription]);

  const pauseSubscription = useCallback(async (): Promise<boolean> => {
    if (!currentSubscription) return false;
    try {
      const result = await api.pause(currentSubscription.id);
      if (result) {
        setCurrentSubscription(result);
        return true;
      }
      return false;
    } catch (err: unknown) {
      logger.error('[useSubscription] Pause failed:', err);
      return false;
    }
  }, [api, currentSubscription]);

  const resumeSubscription = useCallback(async (): Promise<boolean> => {
    if (!currentSubscription) return false;
    try {
      const result = await api.resume(currentSubscription.id);
      if (result) {
        setCurrentSubscription(result);
        return true;
      }
      return false;
    } catch (err: unknown) {
      logger.error('[useSubscription] Resume failed:', err);
      return false;
    }
  }, [api, currentSubscription]);

  const getPlanById = useCallback((planId: string): Plan | undefined => {
    return plans.find(p => p.id === planId);
  }, [plans]);

  // Computed properties
  const isSubscribed = useMemo(() => currentSubscription !== null, [currentSubscription]);
  
  const isActive = useMemo(() => 
    currentSubscription?.status === 'active' || currentSubscription?.status === 'trialing',
    [currentSubscription]
  );
  
  const isPaused = useMemo(() => 
    currentSubscription?.status === 'paused',
    [currentSubscription]
  );
  
  const isCanceled = useMemo(() => 
    currentSubscription?.status === 'canceled' || currentSubscription?.cancel_at_period_end === true,
    [currentSubscription]
  );

  const daysUntilRenewal = useMemo(() => {
    if (!currentSubscription?.current_period_end) return null;
    const end = new Date(currentSubscription.current_period_end);
    const now = new Date();
    const diff = end.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }, [currentSubscription]);

  // Auto-fetch on mount
  useEffect(() => {
    if (autoFetch) {
      refreshPlans();
      refreshSubscription();
    }
  }, [autoFetch, refreshPlans, refreshSubscription]);

  return {
    plans,
    currentSubscription,
    isLoadingPlans,
    isLoadingSubscription,
    plansError,
    subscriptionError,
    refreshPlans,
    refreshSubscription,
    subscribe,
    updateSubscription,
    cancelSubscription,
    reactivateSubscription,
    pauseSubscription,
    resumeSubscription,
    getPlanById,
    isSubscribed,
    isActive,
    isPaused,
    isCanceled,
    daysUntilRenewal,
  };
}

// Re-export types for convenience
export type { Plan, Subscription, BillingPeriod, CreateSubscriptionRequest, UpdateSubscriptionRequest };



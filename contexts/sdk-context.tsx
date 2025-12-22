"use client";

/**
 * SDK Context Provider
 * Provides a consistent, centralized access to the ReplayAPISDK across the application
 *
 * Usage:
 * ```tsx
 * // In your component
 * const { sdk, isReady } = useSDK();
 *
 * // SDK is memoized and consistent across the app
 * const players = await sdk.playerProfiles.searchPlayerProfiles({ game_id: "cs2" });
 * ```
 */

import React, { createContext, useContext, useMemo, ReactNode } from "react";
import { ReplayAPISDK } from "@/types/replay-api/sdk";
import { ReplayApiSettingsMock } from "@/types/replay-api/settings";
import { logger } from "@/lib/logger";

/**
 * Get the API base URL from environment variables
 * Priority: NEXT_PUBLIC_REPLAY_API_URL > REPLAY_API_URL > default localhost
 */
function getApiBaseUrl(): string {
  if (typeof window !== "undefined") {
    // Client-side: use NEXT_PUBLIC_ prefixed env var
    return process.env.NEXT_PUBLIC_REPLAY_API_URL || "http://localhost:8080";
  }
  // Server-side: can access both
  return (
    process.env.NEXT_PUBLIC_REPLAY_API_URL ||
    process.env.REPLAY_API_URL ||
    "http://localhost:8080"
  );
}

interface SDKContextValue {
  sdk: ReplayAPISDK;
  isReady: boolean;
}

const SDKContext = createContext<SDKContextValue | null>(null);

interface SDKProviderProps {
  children: ReactNode;
}

/**
 * SDK Provider Component
 * Wrap your app with this to provide SDK access throughout the component tree
 */
export function SDKProvider({ children }: SDKProviderProps) {
  const sdk = useMemo(() => {
    const baseUrl = getApiBaseUrl();
    logger.info("[SDKProvider] Initializing SDK", { baseUrl });
    return new ReplayAPISDK(
      {
        ...ReplayApiSettingsMock,
        baseUrl,
      },
      logger
    );
  }, []);

  const value = useMemo(
    () => ({
      sdk,
      isReady: true,
    }),
    [sdk]
  );

  return <SDKContext.Provider value={value}>{children}</SDKContext.Provider>;
}

/**
 * Hook to access the SDK from any component
 * @throws Error if used outside of SDKProvider
 */
export function useSDK(): SDKContextValue {
  const context = useContext(SDKContext);
  if (!context) {
    throw new Error("useSDK must be used within an SDKProvider");
  }
  return context;
}

/**
 * Hook for optional SDK access (returns null if outside provider)
 */
export function useSDKOptional(): SDKContextValue | null {
  return useContext(SDKContext);
}

/**
 * Singleton SDK instance for module-level usage (server components, API routes)
 * This is a fallback for cases where React context isn't available
 */
let serverSDKInstance: ReplayAPISDK | null = null;

export function getServerSDK(): ReplayAPISDK {
  if (!serverSDKInstance) {
    const baseUrl = getApiBaseUrl();
    logger.info("[getServerSDK] Initializing server SDK", { baseUrl });
    serverSDKInstance = new ReplayAPISDK(
      {
        ...ReplayApiSettingsMock,
        baseUrl,
      },
      logger
    );
  }
  return serverSDKInstance;
}


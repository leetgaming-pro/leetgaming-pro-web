/**
 * Replay API Hook
 * Production-ready React hook for accessing Replay API SDK
 */

"use client";

import { useMemo } from "react";
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

/**
 * React hook for accessing the Replay API SDK
 *
 * Provides access to all API endpoints including:
 * - Wallet operations (balance, transactions, deposit, withdraw)
 * - Player profiles and squads
 * - Match and replay file management
 * - Onboarding flows
 * - Share tokens
 *
 * @example
 * ```tsx
 * const { sdk } = useReplayApi();
 *
 * // Get wallet balance
 * const balance = await sdk.wallet.getBalance();
 *
 * // Create withdrawal
 * const tx = await sdk.wallet.withdraw({
 *   currency: 'USDC',
 *   amount: 100,
 *   destination_address: '0x...'
 * });
 *
 * // Get transaction history
 * const history = await sdk.wallet.getTransactions({
 *   limit: 20,
 *   offset: 0
 * });
 * ```
 */
export function useReplayApi() {
  const sdk = useMemo(() => {
    const baseUrl = getApiBaseUrl();

    logger.info("[useReplayApi] Initializing SDK", { baseUrl });

    return new ReplayAPISDK(
      {
        ...ReplayApiSettingsMock,
        baseUrl,
      },
      logger
    );
  }, []);

  return {
    sdk,
  };
}

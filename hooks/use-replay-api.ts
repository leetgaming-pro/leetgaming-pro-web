/**
 * Replay API Hook
 * Production-ready React hook for accessing Replay API SDK
 *
 * RECOMMENDED: Use useSDK() from '@/contexts/sdk-context' for new code.
 * This hook is maintained for backward compatibility.
 */

"use client";

import { useSDK, useSDKOptional } from "@/contexts/sdk-context";

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
  const { sdk } = useSDK();
  return { sdk };
}

/**
 * Optional version that returns null if SDK provider is not available
 */
export function useReplayApiOptional() {
  const context = useSDKOptional();
  return { sdk: context?.sdk ?? null };
}

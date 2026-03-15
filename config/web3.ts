/**
 * Web3 / wagmi configuration for LeetGaming.PRO
 *
 * Configures supported EVM chains for wallet connectivity:
 *  - Polygon (primary: low fees, fast finality)
 *  - Base (L2: low fees, Coinbase ecosystem)
 *  - Polygon Amoy (testnet)
 *
 * Uses RainbowKit for wallet connection UI (MetaMask, WalletConnect, Coinbase, etc.)
 */

import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { polygon, polygonAmoy, base } from "wagmi/chains";
import type { Config } from "wagmi";

const LOCALHOST_HOSTNAMES = new Set(["localhost", "127.0.0.1", "::1"]);
const INVALID_WALLETCONNECT_PROJECT_IDS = new Set([
  "",
  "leetgaming-dev",
  "your_walletconnect_project_id",
]);

/**
 * WalletConnect project ID — required for WalletConnect v2 relay.
 * Set via NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID environment variable.
 * Get one at https://cloud.walletconnect.com
 */
const walletConnectProjectId =
  process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "";

export function isWeb3Enabled(): boolean {
  if (INVALID_WALLETCONNECT_PROJECT_IDS.has(walletConnectProjectId)) {
    return false;
  }

  if (typeof window === "undefined") {
    return true;
  }

  return !LOCALHOST_HOSTNAMES.has(window.location.hostname.toLowerCase());
}

/**
 * Wagmi + RainbowKit config
 *
 * Chains priority:
 *  1. Polygon — production (LeetVault, ScoreOracle deployed here)
 *  2. Base — future expansion (P3-03)
 *  3. Polygon Amoy — testnet for development
 */
let wagmiConfig: Config | null = null;

export function getWagmiConfig(): Config {
  if (!wagmiConfig) {
    wagmiConfig = getDefaultConfig({
      appName: "LeetGaming.PRO",
      projectId: walletConnectProjectId,
      chains: [polygon, base, polygonAmoy],
      ssr: true,
    });
  }

  return wagmiConfig;
}

/**
 * Contract addresses by chain ID.
 * Addresses are set via environment variables; defaults are Amoy testnet values.
 */
export const CONTRACT_ADDRESSES = {
  // Polygon Mainnet (137)
  [polygon.id]: {
    scoreOracle:
      (process.env.NEXT_PUBLIC_SCORE_ORACLE_POLYGON as `0x${string}`) ||
      ("0x0000000000000000000000000000000000000000" as const),
    leetVault:
      (process.env.NEXT_PUBLIC_LEET_VAULT_POLYGON as `0x${string}`) ||
      ("0x0000000000000000000000000000000000000000" as const),
  },
  // Base (8453)
  [base.id]: {
    scoreOracle:
      (process.env.NEXT_PUBLIC_SCORE_ORACLE_BASE as `0x${string}`) ||
      ("0x0000000000000000000000000000000000000000" as const),
    leetVault:
      (process.env.NEXT_PUBLIC_LEET_VAULT_BASE as `0x${string}`) ||
      ("0x0000000000000000000000000000000000000000" as const),
  },
  // Polygon Amoy Testnet (80002)
  [polygonAmoy.id]: {
    scoreOracle:
      (process.env.NEXT_PUBLIC_SCORE_ORACLE_AMOY as `0x${string}`) ||
      ("0x0000000000000000000000000000000000000000" as const),
    leetVault:
      (process.env.NEXT_PUBLIC_LEET_VAULT_AMOY as `0x${string}`) ||
      ("0x0000000000000000000000000000000000000000" as const),
  },
} as const;

/**
 * Active chain — determines which chain is used by default.
 * In production, this is Polygon; in development, Polygon Amoy.
 */
export const DEFAULT_CHAIN =
  process.env.NODE_ENV === "production" ? polygon : polygonAmoy;

/**
 * Get contract addresses for a given chain ID.
 * Returns undefined if the chain is not supported.
 */
export function getContractAddresses(chainId: number) {
  return CONTRACT_ADDRESSES[chainId as keyof typeof CONTRACT_ADDRESSES];
}

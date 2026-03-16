"use client";

/**
 * Web3Provider — wagmi + RainbowKit provider wrapper
 *
 * Wraps the application in:
 *  1. WagmiProvider (EVM chain client)
 *  2. QueryClientProvider (@tanstack/react-query, required by wagmi v2)
 *  3. RainbowKitProvider (wallet connection modal UI)
 *
 * Uses a custom dark theme to match LeetGaming.PRO branding.
 */

import * as React from "react";
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  RainbowKitProvider,
  darkTheme,
  type Theme,
} from "@rainbow-me/rainbowkit";
import { getWagmiConfig, isWeb3Enabled } from "@/config/web3";

import "@rainbow-me/rainbowkit/styles.css";

/**
 * Singleton QueryClient — reused across renders.
 * Using a ref pattern to avoid recreating on hot reload.
 */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Wallet balance queries can be stale for 30s
      staleTime: 30_000,
      // Retry once on failure (RPC can be flaky)
      retry: 1,
    },
  },
});

/**
 * Custom RainbowKit theme matching LeetGaming.PRO dark UI
 */
const leetTheme: Theme = {
  ...darkTheme({
    accentColor: "#a855f7", // purple-500 — matches LeetGaming brand
    accentColorForeground: "#ffffff",
    borderRadius: "medium",
  }),
  colors: {
    ...darkTheme().colors,
    modalBackground: "#18181b", // zinc-900
    modalBorder: "#27272a", // zinc-800
    profileForeground: "#18181b",
    connectButtonBackground: "#27272a",
    connectButtonInnerBackground: "#3f3f46",
  },
  fonts: {
    body: "Inter, system-ui, -apple-system, sans-serif",
  },
};

export function Web3Provider({ children }: { children: React.ReactNode }) {
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted || !isWeb3Enabled()) {
    return <>{children}</>;
  }

  const wagmiConfig = getWagmiConfig();
  const learnMoreUrl = `${window.location.origin}/docs/leetscores`;

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={leetTheme}
          modalSize="compact"
          appInfo={{
            appName: "LeetGaming.PRO",
            learnMoreUrl,
          }}
        >
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

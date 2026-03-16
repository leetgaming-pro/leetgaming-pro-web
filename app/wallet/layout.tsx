"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useSubscription } from "@/hooks/use-subscription";
import { useAuth } from "@/hooks/use-auth";
import { getWalletRoute, isProWalletSubscription } from "@/lib/wallet-routing";

/**
 * Wallet Layout with Tier-Based Routing
 * Routes users to the appropriate wallet view based on their subscription tier:
 * - Elite: /wallet/pro (full features including escrow, multi-chain)
 * - Pro: /wallet/pro (escrow and advanced features)
 * - Free: /wallet (basic wallet view)
 */
export default function WalletLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  // Use useAuth (not useRequireAuth) — auth enforcement is handled by each
  // child page. The layout only needs auth state for tier-based routing.
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();

  const { currentSubscription, isLoadingSubscription } =
    useSubscription(isAuthenticated);

  useEffect(() => {
    // Don't redirect while loading or not authenticated
    if (isAuthLoading || isLoadingSubscription || !isAuthenticated) {
      return;
    }

    const shouldUseProWallet = isProWalletSubscription(currentSubscription);
    const targetWalletRoute = getWalletRoute(currentSubscription);

    // If on base /wallet path, redirect based on subscription
    if (pathname === "/wallet" && targetWalletRoute !== pathname) {
      router.replace(targetWalletRoute);
      return;
    }

    // If on /wallet/pro without proper subscription, redirect to basic wallet
    if (pathname.startsWith("/wallet/pro") && !shouldUseProWallet) {
      router.replace("/wallet");
    }
  }, [
    pathname,
    currentSubscription,
    isAuthLoading,
    isLoadingSubscription,
    isAuthenticated,
    router,
  ]);

  return <div>{children}</div>;
}

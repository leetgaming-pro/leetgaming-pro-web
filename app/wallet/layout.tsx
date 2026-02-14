"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useSubscription } from "@/hooks/use-subscription";
import { useRequireAuth } from "@/hooks/use-auth";

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
  const { isAuthenticated, isLoading: isAuthLoading } = useRequireAuth({
    callbackUrl: pathname,
  });

  const { currentSubscription, isLoadingSubscription } =
    useSubscription(isAuthenticated);

  useEffect(() => {
    // Don't redirect while loading or not authenticated
    if (isAuthLoading || isLoadingSubscription || !isAuthenticated) {
      return;
    }

    // Determine the correct wallet route based on subscription tier
    const planName = currentSubscription?.plan?.name?.toLowerCase() || "free";
    const isElite = planName.includes("elite");
    const isPro = planName.includes("pro");

    // If on base /wallet path, redirect based on subscription
    if (pathname === "/wallet") {
      if (isElite || isPro) {
        // Elite and Pro users go to pro wallet
        router.replace("/wallet/pro");
        return;
      }
      // Free users stay on /wallet
    }

    // If on /wallet/pro without proper subscription, redirect to basic wallet
    if (pathname.startsWith("/wallet/pro") && !isElite && !isPro) {
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

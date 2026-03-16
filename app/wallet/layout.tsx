"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";

/**
 * Wallet Layout with Auth-Based Routing
 * All authenticated users are routed to /wallet/pro (the full-featured wallet).
 * Unauthenticated users stay on /wallet (basic/marketing view).
 */
export default function WalletLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();

  useEffect(() => {
    if (isAuthLoading) return;

    // Authenticated users on base /wallet should be redirected to /wallet/pro
    if (isAuthenticated && pathname === "/wallet") {
      router.replace("/wallet/pro");
    }
  }, [pathname, isAuthLoading, isAuthenticated, router]);

  return <div>{children}</div>;
}

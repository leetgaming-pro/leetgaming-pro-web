"use client";
import { useEffect, useState, useRef } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { BrandedSignIn } from "@/components/auth";
import { Progress } from "@nextui-org/react";
import { logger } from "@/lib/logger";
import Image from "next/image";

export default function SignInPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const [isMounted, setIsMounted] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const clearedStaleSession = useRef(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Check if session has complete authentication (RID from backend)
  const isFullyAuthenticated = Boolean(
    session?.user && session.user.rid
  );

  // Handle redirect after full authentication
  useEffect(() => {
    if (isMounted && status === "authenticated" && isFullyAuthenticated) {
      const callbackUrl = searchParams.get("callbackUrl") || "/match-making";
      logger.info("[SignIn] Fully authenticated, redirecting", { callbackUrl });
      router.push(callbackUrl);
    }
  }, [isMounted, status, isFullyAuthenticated, router, searchParams]);

  // Reset the cleared flag when user becomes unauthenticated (allows fresh sign-in attempts)
  useEffect(() => {
    if (status === "unauthenticated") {
      clearedStaleSession.current = false;
    }
  }, [status]);

  // Handle stale session (session exists but no RID) - auto-clear and let user sign in fresh
  useEffect(() => {
    if (isMounted && status === "authenticated" && !isFullyAuthenticated && !isClearing && !clearedStaleSession.current) {
      // Session exists but RID is missing - this is a stale session
      // Auto-clear it so user can sign in fresh and get a proper RID
      logger.warn("[SignIn] Detected stale session without RID, clearing...", {
        hasSession: !!session,
        hasRid: !!session?.user?.rid,
        hasUid: !!session?.user?.uid,
      });
      
      clearedStaleSession.current = true;
      setIsClearing(true);
      
      signOut({ redirect: false }).then(() => {
        logger.info("[SignIn] Stale session cleared, ready for fresh sign-in");
        setIsClearing(false);
      });
    }
  }, [isMounted, status, isFullyAuthenticated, isClearing, session]);

  if (status === "loading" || isClearing) {
    return (
      <div className="flex flex-col justify-center items-center w-full h-screen bg-white dark:bg-black">
        <Image
          src="/logo-red-only-text.png"
          alt="LeetGaming"
          width={200}
          height={40}
          className="mb-6"
          style={{ objectFit: "contain" }}
          priority
        />
        <Progress
          color="warning"
          isIndeterminate
          aria-label="Loading..."
          className="max-w-md"
          size="sm"
        />
        <span className="text-[#34445C]/50 dark:text-white/50 mt-4">
          {isClearing ? "Preparing sign-in..." : "Loading..."}
        </span>
      </div>
    );
  }

  if (status === "authenticated" && isFullyAuthenticated) {
    // Fully authenticated - redirecting
    return (
      <div className="flex flex-col justify-center items-center w-full h-screen bg-white dark:bg-black">
        <Image
          src="/logo-red-only-text.png"
          alt="LeetGaming"
          width={200}
          height={40}
          className="mb-6"
          style={{ objectFit: "contain" }}
          priority
        />
        <Progress
          color="success"
          isIndeterminate
          aria-label="Redirecting..."
          className="max-w-md"
          size="sm"
        />
        <span className="text-[#34445C]/50 dark:text-white/50 mt-4">Redirecting...</span>
      </div>
    );
  }

  // Show sign-in form (either not authenticated, or stale session was just cleared)
  return <BrandedSignIn />;
}

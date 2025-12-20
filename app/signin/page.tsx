"use client";
import { useEffect, useState, useCallback } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { BrandedSignIn } from "@/components/auth";
import { Progress, Button } from "@nextui-org/react";
import { logger } from "@/lib/logger";

export default function SignInPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status, update: updateSession } = useSession();
  const [isMounted, setIsMounted] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 3;

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

  // Handle incomplete authentication (session exists but no RID)
  useEffect(() => {
    if (isMounted && status === "authenticated" && !isFullyAuthenticated) {
      // Session exists but RID is missing - backend onboarding may have failed
      if (retryCount < MAX_RETRIES) {
        // Try refreshing the session to see if RID is now available
        const timer = setTimeout(async () => {
          logger.info("[SignIn] Session missing RID, refreshing...", { retryCount });
          await updateSession();
          setRetryCount((prev) => prev + 1);
        }, 1000 * (retryCount + 1)); // Exponential backoff: 1s, 2s, 3s

        return () => clearTimeout(timer);
      } else {
        // Max retries reached - show error
        logger.error("[SignIn] Backend onboarding failed after retries", {
          hasSession: !!session,
          hasRid: !!session?.user?.rid,
        });
        setAuthError(
          "Unable to complete authentication. The backend service may be unavailable. Please try again."
        );
      }
    }
  }, [isMounted, status, isFullyAuthenticated, retryCount, session, updateSession]);

  const handleRetry = useCallback(async () => {
    setAuthError(null);
    setRetryCount(0);
    // Sign out and let user try again
    await signOut({ redirect: false });
  }, []);

  if (status === "loading") {
    return (
      <div className="flex flex-col justify-center items-center w-full h-screen bg-black">
        <div className="text-2xl font-bold text-white mb-4">
          LeetGaming<span className="text-[#FF4654]">.PRO</span>
        </div>
        <Progress
          color="warning"
          isIndeterminate
          aria-label="Loading..."
          className="max-w-md"
          size="sm"
        />
        <span className="text-white/50 mt-4">Loading...</span>
      </div>
    );
  }

  // Show error state if authentication is incomplete
  if (authError) {
    return (
      <div className="flex flex-col justify-center items-center w-full h-screen bg-black">
        <div className="text-2xl font-bold text-white mb-4">
          LeetGaming<span className="text-[#FF4654]">.PRO</span>
        </div>
        <div className="max-w-md text-center">
          <p className="text-red-400 mb-4">{authError}</p>
          <Button
            color="warning"
            variant="solid"
            onPress={handleRetry}
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (status === "authenticated") {
    // Waiting for RID to be available or retrying
    return (
      <div className="flex flex-col justify-center items-center w-full h-screen bg-black">
        <div className="text-2xl font-bold text-white mb-4">
          LeetGaming<span className="text-[#DCFF37]">.PRO</span>
        </div>
        <Progress
          color="success"
          isIndeterminate
          aria-label="Completing authentication..."
          className="max-w-md"
          size="sm"
        />
        <span className="text-white/50 mt-4">
          {isFullyAuthenticated
            ? "Redirecting..."
            : "Completing authentication..."}
        </span>
      </div>
    );
  }

  return <BrandedSignIn />;
}

"use client";
import { Suspense, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { BrandedSignIn } from "@/components/auth";
import { Progress } from "@nextui-org/react";
import { logger } from "@/lib/logger";
import Image from "next/image";

// Force dynamic rendering since this page uses session management and client-side features
export const dynamic = 'force-dynamic';

// Wrap in Suspense to prevent hydration errors from useSearchParams
export default function SignInPage() {
  return (
    <Suspense fallback={
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
      </div>
    }>
      <SignInContent />
    </Suspense>
  );
}

function SignInContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // User has a valid NextAuth session (may or may not have RID from backend)
  const hasSession = Boolean(session?.user);
  const hasRid = Boolean(session?.user?.rid);

  // Handle redirect when user already has a valid session
  // A user with a session (even without RID) is considered authenticated.
  // RID sync is handled by AuthSync in the background — don't block here.
  useEffect(() => {
    if (isMounted && status === "authenticated" && hasSession) {
      // Normalize callbackUrl: strip origin if it matches current host to avoid redirect issues
      let callbackUrl = searchParams.get("callbackUrl") || "/match-making";
      try {
        const parsed = new URL(callbackUrl, window.location.origin);
        if (parsed.origin === window.location.origin) {
          callbackUrl = parsed.pathname + parsed.search + parsed.hash;
        }
      } catch {
        // Not a valid URL — use as-is
      }
      if (!hasRid) {
        // Session exists but missing RID — log but still redirect.
        // AuthSync will attempt RID refresh in the background.
        logger.warn("[SignIn] Session without RID, redirecting anyway (AuthSync will handle RID)", {
          hasSession,
          hasRid,
        });
      } else {
        logger.info("[SignIn] Fully authenticated, redirecting", { callbackUrl });
      }
      router.push(callbackUrl);
    }
  }, [isMounted, status, hasSession, hasRid, router, searchParams]);

  if (status === "loading") {
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
          Loading...
        </span>
      </div>
    );
  }

  if (status === "authenticated" && hasSession) {
    // Session exists - redirecting (effect above handles navigation)
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

  // Show sign-in form (not authenticated)
  return <BrandedSignIn />;
}

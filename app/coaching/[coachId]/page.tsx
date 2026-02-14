"use client";

/**
 * Coach Profile Page
 * Individual coach profile with booking functionality
 * Per PRD D.4.3 - Coaching Marketplace
 *
 * Note: The coaching API is not yet available.
 * This page redirects to the coaching landing page.
 */

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Spinner } from "@nextui-org/react";

export default function CoachProfilePage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/coaching");
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <Spinner size="lg" />
      <p className="text-default-500">Coaching profiles are coming soon...</p>
    </div>
  );
}

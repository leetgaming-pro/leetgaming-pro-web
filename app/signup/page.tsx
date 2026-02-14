"use client";

import { Suspense } from "react";
import { BrandedSignUp } from "@/components/auth";
import { Progress } from "@nextui-org/react";
import Image from "next/image";

// Force dynamic rendering since this page uses useSearchParams
export const dynamic = 'force-dynamic';

function SignUpContent() {
  return <BrandedSignUp />;
}

function LoadingFallback() {
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
      <span className="text-[#34445C]/50 dark:text-white/50 mt-4">Loading...</span>
    </div>
  );
}

export default function SignUpPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <SignUpContent />
    </Suspense>
  );
}

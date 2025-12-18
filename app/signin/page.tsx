"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { BrandedSignIn } from "@/components/auth";
import { Progress } from "@nextui-org/react";

export default function SignInPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted && status === "authenticated") {
      router.push("/match-making");
    }
  }, [isMounted, status, router]);

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

  if (status === "authenticated") {
    return (
      <div className="flex flex-col justify-center items-center w-full h-screen bg-black">
        <div className="text-2xl font-bold text-white mb-4">
          LeetGaming<span className="text-[#DCFF37]">.PRO</span>
        </div>
        <Progress
          color="success"
          isIndeterminate
          aria-label="Redirecting..."
          className="max-w-md"
          size="sm"
        />
        <span className="text-white/50 mt-4">
          Authenticated. Redirecting...
        </span>
      </div>
    );
  }

  return <BrandedSignIn />;
}

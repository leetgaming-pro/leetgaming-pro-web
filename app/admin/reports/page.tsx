"use client";

import { useEffect } from "react";
import { useRequireAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { Spinner } from "@nextui-org/react";

/**
 * Admin Reports Page
 *
 * Displays platform analytics and reports.
 * Redirects non-admin users to dashboard.
 */
export default function AdminReportsPage() {
  const { isAuthenticated, isLoading, user, isRedirecting } = useRequireAuth({
    callbackUrl: '/admin/reports'
  });
  const router = useRouter();

  useEffect(() => {
    if (isLoading || isRedirecting) return;
    
    if (isAuthenticated) {
      // Check if user is admin
      // @ts-expect-error - role may not be in user type
      const isAdmin = user?.role === "admin" || user?.isAdmin;

      if (!isAdmin) {
        router.replace("/dashboard");
      }
    }
  }, [isAuthenticated, isLoading, isRedirecting, user, router]);

  if (isLoading || isRedirecting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-900 to-gray-950">
        <Spinner size="lg" color="primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-950">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-white mb-8">
          Reports & Analytics
        </h1>

        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-8 text-center">
          <p className="text-gray-400">
            Platform analytics and reports coming soon. Statistical insights
            will appear here.
          </p>
        </div>
      </div>
    </div>
  );
}

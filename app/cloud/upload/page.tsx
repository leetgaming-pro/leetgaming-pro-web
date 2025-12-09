'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Redirect page for legacy /cloud/upload URL
 * Redirects to the new /upload path for backward compatibility
 */
export default function CloudUploadRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/upload');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-900 to-gray-950">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
        <p className="text-gray-400">Redirecting to upload...</p>
      </div>
    </div>
  );
}

'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Spinner } from '@nextui-org/react';

/**
 * Admin Members Management Page
 * 
 * Allows admins to manage platform members.
 * Redirects non-admin users to dashboard.
 */
export default function AdminMembersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/signin?callbackUrl=/admin/members');
      return;
    }

    // Check if user is admin (you may need to adjust this based on your auth setup)
    // @ts-expect-error - role may not be in session type
    const isAdmin = session?.user?.role === 'admin' || session?.user?.isAdmin;
    
    if (status === 'authenticated' && !isAdmin) {
      router.replace('/dashboard');
    }
  }, [session, status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-900 to-gray-950">
        <Spinner size="lg" color="primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-950">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-white mb-8">Member Management</h1>
        
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-8 text-center">
          <p className="text-gray-400">
            Member management dashboard coming soon. User administration tools will appear here.
          </p>
        </div>
      </div>
    </div>
  );
}

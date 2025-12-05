'use client';

import React from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button, Card, CardBody, Spinner } from '@nextui-org/react';
import { Icon } from '@iconify/react';
import { CheckoutFlow } from '@/components/checkout';

export default function CheckoutPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Loading state
  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner size="lg" color="primary" />
      </div>
    );
  }

  // Not authenticated
  if (status === 'unauthenticated') {
    return (
      <div className="max-w-md mx-auto">
        <Card className="bg-content2/50 border border-content3">
          <CardBody className="p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-warning/20 flex items-center justify-center mx-auto mb-4">
              <Icon icon="solar:lock-bold" className="text-warning w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold mb-2">Sign in required</h2>
            <p className="text-default-500 mb-6">
              Please sign in to your account to continue with checkout.
            </p>
            <Button
              color="primary"
              size="lg"
              fullWidth
              onPress={() => router.push('/signin?callbackUrl=/checkout')}
              startContent={<Icon icon="solar:login-bold" className="w-5 h-5" />}
            >
              Sign in to continue
            </Button>
          </CardBody>
        </Card>
      </div>
    );
  }

  // Get wallet ID from session or use placeholder
  // In production, this would come from the user's profile
  interface ExtendedUser {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    walletId?: string;
  }
  const user = session?.user as ExtendedUser | undefined;
  const walletId = user?.walletId || 'default-wallet';

  return (
    <div className="py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold mb-2">Choose your plan</h1>
        <p className="text-default-500">
          Unlock powerful features and take your gaming to the next level
        </p>
      </div>

      {/* Checkout Flow */}
      <CheckoutFlow walletId={walletId} />

      {/* Help Section */}
      <div className="mt-16 text-center">
        <p className="text-default-500 mb-4">Need help with your purchase?</p>
        <div className="flex justify-center gap-4">
          <Button
            variant="light"
            startContent={<Icon icon="solar:chat-round-dots-bold" className="w-5 h-5" />}
          >
            Live Chat
          </Button>
          <Button
            variant="light"
            startContent={<Icon icon="solar:letter-bold" className="w-5 h-5" />}
          >
            Email Support
          </Button>
        </div>
      </div>
    </div>
  );
}

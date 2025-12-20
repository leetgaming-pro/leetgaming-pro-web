'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button, Card, CardBody, Spinner } from '@nextui-org/react';
import { Icon } from '@iconify/react';
import { CheckoutFlow } from '@/components/checkout';
import { ReplayAPISDK } from '@/types/replay-api/sdk';
import { ReplayApiSettingsMock } from '@/types/replay-api/settings';
import { logger } from '@/lib/logger';

export default function CheckoutPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const sdkRef = useRef<ReplayAPISDK>();
  const [walletId, setWalletId] = useState<string | null>(null);
  const [walletLoading, setWalletLoading] = useState(true);
  const [walletError, setWalletError] = useState<string | null>(null);

  // Initialize SDK once
  if (!sdkRef.current) {
    sdkRef.current = new ReplayAPISDK(ReplayApiSettingsMock, logger);
  }

  // Fetch wallet from API
  const fetchWallet = useCallback(async () => {
    if (!session?.user) return;

    setWalletLoading(true);
    setWalletError(null);
    try {
      const balance = await sdkRef.current!.wallet.getBalance();
      if (balance?.wallet_id) {
        setWalletId(balance.wallet_id);
      } else {
        // Try to get wallet from player profile
        const profile = await sdkRef.current!.playerProfiles.getMyProfile();
        if (profile?.wallet_id) {
          setWalletId(profile.wallet_id);
        } else {
          setWalletError('No wallet found. Please set up your wallet first.');
        }
      }
    } catch (error) {
      logger.error('Failed to fetch wallet', error);
      setWalletError('Failed to load wallet information. Please try again.');
    } finally {
      setWalletLoading(false);
    }
  }, [session]);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchWallet();
    }
  }, [status, fetchWallet]);

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
        <Card className="rounded-none border border-[#FF4654]/20 dark:border-[#DCFF37]/20">
          <CardBody className="p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center bg-gradient-to-br from-[#FF4654]/20 to-[#FFC700]/20 dark:from-[#DCFF37]/20 dark:to-[#34445C]/20"
              style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%)' }}>
              <Icon icon="solar:lock-bold" className="text-[#FF4654] dark:text-[#DCFF37] w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold mb-2 text-[#34445C] dark:text-[#F5F0E1]">Sign in required</h2>
            <p className="text-default-500 mb-6">
              Please sign in to your account to continue with checkout.
            </p>
            <Button
              className="bg-gradient-to-r from-[#FF4654] to-[#FFC700] dark:from-[#DCFF37] dark:to-[#34445C] text-[#F5F0E1] dark:text-[#34445C] rounded-none"
              style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%)' }}
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

  // Wallet loading state
  if (walletLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner size="lg" color="primary" label="Loading wallet..." />
      </div>
    );
  }

  // Wallet error state
  if (walletError || !walletId) {
    return (
      <div className="max-w-md mx-auto">
        <Card className="bg-content2/50 border border-content3">
          <CardBody className="p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-danger/20 flex items-center justify-center mx-auto mb-4">
              <Icon icon="solar:wallet-bold" className="text-danger w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold mb-2">Wallet not found</h2>
            <p className="text-default-500 mb-6">
              {walletError || 'Please set up your wallet to continue with checkout.'}
            </p>
            <div className="flex gap-3">
              <Button
                variant="flat"
                size="lg"
                className="flex-1"
                onPress={() => fetchWallet()}
                startContent={<Icon icon="solar:refresh-bold" className="w-5 h-5" />}
              >
                Retry
              </Button>
              <Button
                color="primary"
                size="lg"
                className="flex-1"
                onPress={() => router.push('/settings?tab=billing')}
                startContent={<Icon icon="solar:settings-bold" className="w-5 h-5" />}
              >
                Set up wallet
              </Button>
            </div>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="py-8 lg:py-12 xl:py-16 px-4 sm:px-6 lg:px-8 xl:px-12 max-w-7xl mx-auto">
      {/* Header */}
      <div className="text-center mb-12 lg:mb-16">
        <h1 className="text-3xl lg:text-4xl xl:text-5xl font-bold mb-2 lg:mb-4">Choose your plan</h1>
        <p className="text-default-500 text-base lg:text-lg max-w-xl mx-auto">
          Unlock powerful features and take your gaming to the next level
        </p>
      </div>

      {/* Checkout Flow */}
      <CheckoutFlow walletId={walletId} />

      {/* Help Section */}
      <div className="mt-16 lg:mt-24 text-center">
        <p className="text-default-500 mb-4 lg:mb-6 text-base lg:text-lg">Need help with your purchase?</p>
        <div className="flex justify-center gap-4 lg:gap-6">
          <Button
            variant="light"
            size="lg"
            startContent={<Icon icon="solar:chat-round-dots-bold" className="w-5 h-5" />}
          >
            Live Chat
          </Button>
          <Button
            variant="light"
            size="lg"
            startContent={<Icon icon="solar:letter-bold" className="w-5 h-5" />}
          >
            Email Support
          </Button>
        </div>
      </div>
    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import {
  Button,
  Card,
  CardBody,
  Chip,
  Progress,
  Snippet,
  Tab,
  Tabs,
  Tooltip,
} from '@nextui-org/react';
import { Icon } from '@iconify/react';
import { useCheckout } from './checkout-context';
import {
  CryptoNetwork,
  CryptoCurrency,
  CRYPTO_NETWORK_LABELS,
} from './types';

interface CryptoCheckoutProps {
  cryptoAddress: string;
  cryptoNetwork?: CryptoNetwork;
  cryptoCurrency?: CryptoCurrency;
  amount: number;
  paymentId: string;
  onSuccess: () => void;
  onError: (message: string) => void;
}

const NETWORK_ICONS: Record<CryptoNetwork, string> = {
  [CryptoNetwork.ETHEREUM]: 'cryptocurrency:eth',
  [CryptoNetwork.POLYGON]: 'cryptocurrency:matic',
  [CryptoNetwork.ARBITRUM]: 'simple-icons:arbitrum',
  [CryptoNetwork.BASE]: 'simple-icons:coinbase',
};

const CURRENCY_ICONS: Record<CryptoCurrency, string> = {
  [CryptoCurrency.ETH]: 'cryptocurrency:eth',
  [CryptoCurrency.USDC]: 'cryptocurrency:usdc',
  [CryptoCurrency.USDT]: 'cryptocurrency:usdt',
};

/**
 * CryptoCheckout - Cryptocurrency payment interface
 * Supports USDC/USDT on multiple EVM chains
 */
export function CryptoCheckout({
  cryptoAddress,
  cryptoNetwork = CryptoNetwork.ETHEREUM,
  cryptoCurrency = CryptoCurrency.USDC,
  amount,
  paymentId,
  onSuccess,
  onError,
}: CryptoCheckoutProps) {
  const { state } = useCheckout();
  const [selectedNetwork, setSelectedNetwork] = useState<CryptoNetwork>(cryptoNetwork);
  const [selectedCurrency, setSelectedCurrency] = useState<CryptoCurrency>(cryptoCurrency);
  const [isPolling, setIsPolling] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(30 * 60); // 30 minutes
  const [pollAttempts, setPollAttempts] = useState(0);

  // Timer countdown
  useEffect(() => {
    if (timeRemaining <= 0) {
      onError('Payment session expired. Please try again.');
      return;
    }

    const timer = setInterval(() => {
      setTimeRemaining((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining, onError]);

  // Poll for payment confirmation
  useEffect(() => {
    if (!isPolling) return;

    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`/api/payments/${paymentId}`);
        const result = await response.json();

        if (result.success && result.data.status === 'succeeded') {
          setIsPolling(false);
          onSuccess();
        } else if (result.data.status === 'failed') {
          setIsPolling(false);
          onError('Payment verification failed');
        }

        setPollAttempts((prev) => prev + 1);

        // Stop polling after 60 attempts (10 minutes with 10s interval)
        if (pollAttempts >= 60) {
          setIsPolling(false);
        }
      } catch (error) {
        console.error('Poll error:', error);
      }
    }, 10000); // Poll every 10 seconds

    return () => clearInterval(pollInterval);
  }, [isPolling, paymentId, pollAttempts, onSuccess, onError]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatAmount = (amount: number, currency: string): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  };

  const handleConfirmPayment = () => {
    setIsPolling(true);
  };

  const copyAddress = () => {
    navigator.clipboard.writeText(cryptoAddress);
  };

  return (
    <div className="space-y-6">
      <Card className="bg-content2/50 border border-content3">
        <CardBody className="p-6">
          {/* Network Selection */}
          <div className="mb-6">
            <label className="text-sm font-medium text-default-700 mb-2 block">
              Select Network
            </label>
            <Tabs
              aria-label="Network selection"
              selectedKey={selectedNetwork}
              onSelectionChange={(key) => setSelectedNetwork(key as CryptoNetwork)}
              classNames={{
                tabList: 'gap-2 w-full bg-content1 p-1 rounded-lg',
                tab: 'h-10',
                cursor: 'bg-primary',
              }}
            >
              {Object.entries(CRYPTO_NETWORK_LABELS).map(([key, label]) => (
                <Tab
                  key={key}
                  title={
                    <div className="flex items-center gap-2">
                      <Icon
                        icon={NETWORK_ICONS[key as CryptoNetwork]}
                        className="w-4 h-4"
                      />
                      <span className="hidden sm:inline">{label.split(' ')[0]}</span>
                    </div>
                  }
                />
              ))}
            </Tabs>
          </div>

          {/* Currency Selection */}
          <div className="mb-6">
            <label className="text-sm font-medium text-default-700 mb-2 block">
              Select Currency
            </label>
            <div className="flex gap-2">
              {Object.values(CryptoCurrency).map((currency) => (
                <Button
                  key={currency}
                  variant={selectedCurrency === currency ? 'solid' : 'bordered'}
                  color={selectedCurrency === currency ? 'primary' : 'default'}
                  onPress={() => setSelectedCurrency(currency)}
                  startContent={
                    <Icon icon={CURRENCY_ICONS[currency]} className="w-5 h-5" />
                  }
                >
                  {currency}
                </Button>
              ))}
            </div>
          </div>

          {/* Payment Details */}
          <div className="bg-content1 rounded-lg p-4 mb-6">
            <div className="flex justify-between items-center mb-4">
              <span className="text-default-500">Amount to send</span>
              <div className="flex items-center gap-2">
                <Icon icon={CURRENCY_ICONS[selectedCurrency]} className="w-5 h-5" />
                <span className="text-xl font-bold">
                  {(amount / 100).toFixed(2)} {selectedCurrency}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 mb-4">
              <Chip
                color="warning"
                variant="flat"
                size="sm"
                startContent={<Icon icon="solar:clock-circle-bold" className="w-4 h-4" />}
              >
                {formatTime(timeRemaining)} remaining
              </Chip>
            </div>

            <div className="mb-4">
              <label className="text-sm text-default-500 mb-2 block">
                Send to this address on {CRYPTO_NETWORK_LABELS[selectedNetwork]}
              </label>
              <Snippet
                symbol=""
                variant="bordered"
                classNames={{
                  base: 'w-full bg-content2',
                  pre: 'text-xs break-all whitespace-pre-wrap',
                }}
              >
                {cryptoAddress}
              </Snippet>
            </div>

            <div className="flex items-start gap-2 p-3 bg-warning/10 border border-warning/20 rounded-lg">
              <Icon icon="solar:danger-triangle-bold" className="text-warning w-5 h-5 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-medium text-warning">Important</p>
                <ul className="text-default-500 list-disc list-inside space-y-1 mt-1">
                  <li>Only send {selectedCurrency} on {CRYPTO_NETWORK_LABELS[selectedNetwork]}</li>
                  <li>Minimum confirmations required: 12</li>
                  <li>Sending other tokens may result in permanent loss</li>
                </ul>
              </div>
            </div>
          </div>

          {/* QR Code Placeholder */}
          <div className="flex justify-center mb-6">
            <div className="bg-white p-4 rounded-lg">
              <div className="w-48 h-48 bg-neutral-200 flex items-center justify-center">
                <Icon icon="solar:qr-code-bold" className="w-32 h-32 text-neutral-400" />
              </div>
            </div>
          </div>

          {/* Confirm Button */}
          <Button
            color="primary"
            size="lg"
            fullWidth
            isLoading={isPolling}
            onPress={handleConfirmPayment}
            startContent={
              !isPolling && <Icon icon="solar:check-circle-bold" className="w-5 h-5" />
            }
          >
            {isPolling ? 'Waiting for confirmation...' : "I've sent the payment"}
          </Button>

          {isPolling && (
            <div className="mt-4">
              <Progress
                size="sm"
                isIndeterminate
                aria-label="Waiting for blockchain confirmation"
                classNames={{
                  indicator: 'bg-primary',
                }}
              />
              <p className="text-center text-sm text-default-500 mt-2">
                Monitoring blockchain for your transaction...
              </p>
            </div>
          )}
        </CardBody>
      </Card>

      <div className="flex items-center justify-center gap-2 text-xs text-default-400">
        <Icon icon="solar:shield-check-bold" className="w-4 h-4" />
        <span>Transactions verified on-chain</span>
      </div>
    </div>
  );
}

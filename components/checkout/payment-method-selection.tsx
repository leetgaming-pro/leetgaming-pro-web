'use client';

import React from 'react';
import {
  Button,
  Card,
  CardBody,
  RadioGroup,
  Radio,
} from '@nextui-org/react';
import { Icon } from '@iconify/react';
import { cn } from '@nextui-org/react';
import { useCheckout } from './checkout-context';
import {
  PaymentProvider,
  PAYMENT_PROVIDER_LABELS,
} from './types';

// ============================================================================
// Types
// ============================================================================

interface PaymentMethodOption {
  provider: PaymentProvider;
  label: string;
  description: string;
  icon: string;
  badges?: string[];
  disabled?: boolean;
}

// ============================================================================
// Data
// ============================================================================

const PAYMENT_METHODS: PaymentMethodOption[] = [
  {
    provider: PaymentProvider.STRIPE,
    label: 'Credit / Debit Card',
    description: 'Visa, Mastercard, American Express, and more',
    icon: 'solar:card-bold',
    badges: ['Instant', 'Most Popular'],
  },
  {
    provider: PaymentProvider.PAYPAL,
    label: 'PayPal',
    description: 'Pay with your PayPal account or linked cards',
    icon: 'logos:paypal',
    badges: ['Buyer Protection'],
  },
  {
    provider: PaymentProvider.CRYPTO,
    label: 'Cryptocurrency',
    description: 'Pay with USDC or USDT on Ethereum, Polygon, Base, or Arbitrum',
    icon: 'cryptocurrency:usdc',
    badges: ['Web3'],
  },
];

// ============================================================================
// Component
// ============================================================================

interface PaymentMethodSelectionProps {
  onSelectMethod?: (provider: PaymentProvider) => void;
}

export function PaymentMethodSelection({ onSelectMethod }: PaymentMethodSelectionProps) {
  const {
    state,
    selectPaymentProvider,
    goBack,
    getPriceForPeriod,
  } = useCheckout();

  const [selectedProvider, setSelectedProvider] = React.useState<PaymentProvider | null>(
    state.paymentProvider
  );

  const handleSelectProvider = (provider: PaymentProvider) => {
    setSelectedProvider(provider);
  };

  const handleContinue = () => {
    if (selectedProvider) {
      selectPaymentProvider(selectedProvider);
      onSelectMethod?.(selectedProvider);
    }
  };

  const formatPrice = (): string => {
    if (!state.selectedPlan) return '';
    const price = getPriceForPeriod(state.selectedPlan);
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: state.selectedPlan.price.currency.toUpperCase(),
    }).format(price);
  };

  return (
    <div className="space-y-6">
      {/* Order Summary */}
      {state.selectedPlan && (
        <Card className="bg-content2/50 border border-content3">
          <CardBody className="p-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">{state.selectedPlan.name} Plan</p>
                <p className="text-sm text-default-500 capitalize">
                  {state.billingPeriod} billing
                </p>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold">{formatPrice()}</p>
                <Button
                  variant="light"
                  size="sm"
                  onPress={goBack}
                  className="text-primary"
                >
                  Change plan
                </Button>
              </div>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Payment Method Options */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold">Select payment method</h3>

        <RadioGroup
          value={selectedProvider || ''}
          onValueChange={(value) => handleSelectProvider(value as PaymentProvider)}
          classNames={{
            wrapper: 'gap-3',
          }}
        >
          {PAYMENT_METHODS.map((method) => (
            <Radio
              key={method.provider}
              value={method.provider}
              isDisabled={method.disabled}
              classNames={{
                base: cn(
                  'flex-row-reverse justify-between max-w-full',
                  'cursor-pointer rounded-xl p-4',
                  'border-2 border-transparent',
                  'bg-content2 hover:bg-content3',
                  'data-[selected=true]:border-primary data-[selected=true]:bg-primary/10'
                ),
                wrapper: 'hidden',
                labelWrapper: 'ml-0',
              }}
            >
              <div className="flex items-center gap-4 w-full">
                <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-content1 flex items-center justify-center">
                  <Icon
                    icon={method.icon}
                    className={cn(
                      'w-7 h-7',
                      method.provider === PaymentProvider.PAYPAL ? '' : 'text-default-600'
                    )}
                  />
                </div>
                <div className="flex-grow">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{method.label}</span>
                    {method.badges?.map((badge) => (
                      <span
                        key={badge}
                        className="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary"
                      >
                        {badge}
                      </span>
                    ))}
                  </div>
                  <p className="text-sm text-default-500">{method.description}</p>
                </div>
                <div className="flex-shrink-0">
                  <div
                    className={cn(
                      'w-5 h-5 rounded-full border-2 flex items-center justify-center',
                      selectedProvider === method.provider
                        ? 'border-primary bg-primary'
                        : 'border-default-300'
                    )}
                  >
                    {selectedProvider === method.provider && (
                      <Icon icon="solar:check-bold" className="w-3 h-3 text-white" />
                    )}
                  </div>
                </div>
              </div>
            </Radio>
          ))}
        </RadioGroup>
      </div>

      {/* Card Brand Icons */}
      {selectedProvider === PaymentProvider.STRIPE && (
        <div className="flex items-center justify-center gap-3 py-2">
          <Icon icon="logos:visa" className="h-6 w-auto" />
          <Icon icon="logos:mastercard" className="h-6 w-auto" />
          <Icon icon="logos:amex" className="h-6 w-auto" />
          <Icon icon="simple-icons:applepay" className="h-6 w-auto text-default-600" />
          <Icon icon="simple-icons:googlepay" className="h-6 w-auto text-default-600" />
        </div>
      )}

      {/* Crypto Network Icons */}
      {selectedProvider === PaymentProvider.CRYPTO && (
        <div className="flex items-center justify-center gap-3 py-2">
          <Icon icon="cryptocurrency:eth" className="h-6 w-6" />
          <Icon icon="cryptocurrency:matic" className="h-6 w-6" />
          <Icon icon="simple-icons:arbitrum" className="h-6 w-6" />
          <Icon icon="simple-icons:coinbase" className="h-6 w-6" />
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4">
        <Button
          variant="bordered"
          size="lg"
          onPress={goBack}
          startContent={<Icon icon="solar:arrow-left-linear" className="w-5 h-5" />}
        >
          Back
        </Button>
        <Button
          color="primary"
          size="lg"
          fullWidth
          isDisabled={!selectedProvider}
          onPress={handleContinue}
          endContent={<Icon icon="solar:arrow-right-linear" className="w-5 h-5" />}
        >
          Continue to payment
        </Button>
      </div>

      {/* Security Badge */}
      <div className="flex items-center justify-center gap-2 text-sm text-default-400 pt-4">
        <Icon icon="solar:lock-bold" className="w-4 h-4" />
        <span>Secured with 256-bit SSL encryption</span>
      </div>
    </div>
  );
}

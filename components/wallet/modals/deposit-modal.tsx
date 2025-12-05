/**
 * Deposit Modal - Premium Implementation
 * Multi-step deposit flow with payment methods, QR codes, and animations
 * Connected to real /api/payments endpoint
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Card,
  CardBody,
  Tabs,
  Tab,
  Chip,
  Progress,
} from '@nextui-org/react';
import { Icon } from '@iconify/react';
import { motion, AnimatePresence } from 'framer-motion';
import { modalAnimations, springs, staggerAnimations } from '@/lib/design/animations';
import { AnimatedCounter } from '@/components/ui/animated-counter';
import { SuccessCelebration } from '@/components/ui/success-confetti';
import type { UserWallet } from '@/types/replay-api/wallet.types';

type PaymentMethod = 'crypto' | 'credit_card' | 'paypal' | 'bank_transfer';
type PaymentProvider = 'stripe' | 'paypal' | 'crypto' | 'bank_transfer';
type DepositStep = 'amount' | 'method' | 'payment' | 'confirmation' | 'success';

interface PaymentIntentResponse {
  payment_id: string;
  client_secret?: string;
  status: string;
  amount: number;
  currency: string;
}

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (amount: number, method: PaymentMethod) => void;
}

export function DepositModal({ isOpen, onClose, onSuccess }: DepositModalProps) {
  const [step, setStep] = useState<DepositStep>('amount');
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('crypto');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [wallet, setWallet] = useState<UserWallet | null>(null);
  const [paymentIntent, setPaymentIntent] = useState<PaymentIntentResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch wallet when modal opens
  const fetchWallet = useCallback(async () => {
    try {
      const response = await fetch('/api/wallet/balance');
      if (response.ok) {
        const data = await response.json();
        setWallet(data);
      }
    } catch (err) {
      console.error('Failed to fetch wallet:', err);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchWallet();
    }
  }, [isOpen, fetchWallet]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setStep('amount');
        setAmount('');
        setPaymentMethod('crypto');
        setIsProcessing(false);
        setShowSuccess(false);
        setPaymentIntent(null);
        setError(null);
      }, 300);
    }
  }, [isOpen]);

  // Map payment method to provider
  const getProvider = (method: PaymentMethod): PaymentProvider => {
    switch (method) {
      case 'credit_card':
        return 'stripe';
      case 'paypal':
        return 'paypal';
      case 'crypto':
        return 'crypto';
      case 'bank_transfer':
        return 'bank_transfer';
      default:
        return 'stripe';
    }
  };

  const handleNext = () => {
    const steps: DepositStep[] = ['amount', 'method', 'payment', 'confirmation', 'success'];
    const currentIndex = steps.indexOf(step);
    if (currentIndex < steps.length - 1) {
      setStep(steps[currentIndex + 1]);
    }
  };

  const handleBack = () => {
    const steps: DepositStep[] = ['amount', 'method', 'payment', 'confirmation'];
    const currentIndex = steps.indexOf(step);
    if (currentIndex > 0) {
      setStep(steps[currentIndex - 1]);
    }
  };

  const handleConfirm = async () => {
    if (!wallet?.id) {
      setError('Wallet not found. Please try again.');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Step 1: Create payment intent
      const createResponse = await fetch('/api/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          wallet_id: wallet.id,
          amount: parseFloat(amount),
          currency: 'usd',
          payment_type: 'deposit',
          provider: getProvider(paymentMethod),
          metadata: {
            payment_method: paymentMethod,
            source: 'deposit_modal',
          },
        }),
      });

      if (!createResponse.ok) {
        const errorData = await createResponse.json();
        throw new Error(errorData.error || 'Failed to create payment');
      }

      const { data: intentData } = await createResponse.json();
      setPaymentIntent(intentData);

      // Step 2: Confirm payment (in production, this would handle Stripe/PayPal SDK flows)
      const confirmResponse = await fetch(`/api/payments/${intentData.payment_id}/confirm`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          payment_method_id: paymentMethod,
        }),
      });

      if (!confirmResponse.ok) {
        const errorData = await confirmResponse.json();
        throw new Error(errorData.error || 'Failed to confirm payment');
      }

      // Success!
      setIsProcessing(false);
      setStep('success');
      setShowSuccess(true);

      // Call success callback
      onSuccess?.(parseFloat(amount), paymentMethod);

      // Auto-close after celebration
      setTimeout(() => {
        onClose();
      }, 3500);
    } catch (err: any) {
      setIsProcessing(false);
      setError(err.message || 'Payment failed. Please try again.');
      console.error('Payment failed:', err.message);
    }
  };

  const progress = {
    amount: 25,
    method: 50,
    payment: 75,
    confirmation: 90,
    success: 100,
  }[step];

  const amountValue = parseFloat(amount) || 0;
  const feePercentage = paymentMethod === 'crypto' ? 1 : paymentMethod === 'credit_card' ? 2.9 : 1.5;
  const fee = (amountValue * feePercentage) / 100;
  const total = amountValue + fee;

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        size="2xl"
        classNames={{
          base: 'bg-background',
          backdrop: 'bg-black/50 backdrop-blur-sm',
        }}
        motionProps={{
          variants: modalAnimations.center,
        }}
        isDismissable={!isProcessing}
        hideCloseButton={isProcessing}
      >
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Deposit Funds</h2>
              <Chip color="primary" variant="flat" size="sm">
                Step {['amount', 'method', 'payment', 'confirmation', 'success'].indexOf(step) + 1} of 5
              </Chip>
            </div>
            <Progress value={progress} className="mt-2" color="primary" size="sm" />
          </ModalHeader>

          <ModalBody className="gap-6 py-6">
            <AnimatePresence mode="wait">
              {step === 'amount' && (
                <AmountStep
                  key="amount"
                  amount={amount}
                  setAmount={setAmount}
                  onNext={handleNext}
                />
              )}

              {step === 'method' && (
                <MethodStep
                  key="method"
                  selected={paymentMethod}
                  onSelect={setPaymentMethod}
                  onNext={handleNext}
                  onBack={handleBack}
                />
              )}

              {step === 'payment' && (
                <PaymentStep
                  key="payment"
                  method={paymentMethod}
                  amount={amountValue}
                  onNext={handleNext}
                  onBack={handleBack}
                />
              )}

              {step === 'confirmation' && (
                <ConfirmationStep
                  key="confirmation"
                  amount={amountValue}
                  fee={fee}
                  total={total}
                  method={paymentMethod}
                  isProcessing={isProcessing}
                  error={error}
                  onConfirm={handleConfirm}
                  onBack={handleBack}
                />
              )}

              {step === 'success' && (
                <SuccessStep
                  key="success"
                  amount={total}
                  method={paymentMethod}
                />
              )}
            </AnimatePresence>
          </ModalBody>

          {step !== 'success' && (
            <ModalFooter>
              <Button
                variant="light"
                onPress={onClose}
                isDisabled={isProcessing}
              >
                Cancel
              </Button>
            </ModalFooter>
          )}
        </ModalContent>
      </Modal>

      <SuccessCelebration show={showSuccess} message={`Deposited $${total.toFixed(2)}!`} />
    </>
  );
}

// Step 1: Amount Selection
function AmountStep({
  amount,
  setAmount,
  onNext,
}: {
  amount: string;
  setAmount: (amount: string) => void;
  onNext: () => void;
}) {
  const presets = [10, 25, 50, 100, 250, 500];

  return (
    <motion.div
      variants={staggerAnimations.container}
      initial="initial"
      animate="animate"
      exit="exit"
      className="space-y-6"
    >
      <motion.div variants={staggerAnimations.item}>
        <Input
          label="Amount"
          placeholder="Enter amount"
          value={amount}
          onValueChange={setAmount}
          type="number"
          startContent={<span className="text-default-400">$</span>}
          size="lg"
          classNames={{
            input: 'text-2xl font-bold',
          }}
          autoFocus
        />
      </motion.div>

      <motion.div variants={staggerAnimations.item}>
        <p className="mb-2 text-sm text-default-600">Quick select:</p>
        <div className="grid grid-cols-3 gap-2">
          {presets.map((preset) => (
            <motion.div
              key={preset}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Card
                isPressable
                onPress={() => setAmount(preset.toString())}
                className={`border-2 ${
                  amount === preset.toString()
                    ? 'border-primary bg-primary/10'
                    : 'border-transparent'
                }`}
              >
                <CardBody className="py-3 text-center">
                  <p className="font-semibold">${preset}</p>
                </CardBody>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <motion.div variants={staggerAnimations.item}>
        <Button
          color="primary"
          size="lg"
          className="w-full"
          onPress={onNext}
          isDisabled={!amount || parseFloat(amount) <= 0}
          endContent={<Icon icon="solar:arrow-right-bold" width={20} />}
        >
          Continue
        </Button>
      </motion.div>
    </motion.div>
  );
}

// Step 2: Payment Method Selection
function MethodStep({
  selected,
  onSelect,
  onNext,
  onBack,
}: {
  selected: PaymentMethod;
  onSelect: (method: PaymentMethod) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const methods = [
    {
      id: 'crypto' as PaymentMethod,
      name: 'Cryptocurrency',
      icon: 'cryptocurrency:btc',
      fee: '1%',
      time: 'Instant',
      description: 'Bitcoin, Ethereum, USDT',
    },
    {
      id: 'credit_card' as PaymentMethod,
      name: 'Credit/Debit Card',
      icon: 'solar:card-bold',
      fee: '2.9%',
      time: 'Instant',
      description: 'Visa, Mastercard, Amex',
    },
    {
      id: 'paypal' as PaymentMethod,
      name: 'PayPal',
      icon: 'logos:paypal',
      fee: '1.5%',
      time: '1-2 minutes',
      description: 'Pay with your PayPal balance',
    },
    {
      id: 'bank_transfer' as PaymentMethod,
      name: 'Bank Transfer',
      icon: 'solar:bank-bold',
      fee: '0%',
      time: '1-3 business days',
      description: 'Direct bank deposit',
    },
  ];

  return (
    <motion.div
      variants={staggerAnimations.container}
      initial="initial"
      animate="animate"
      exit="exit"
      className="space-y-4"
    >
      {methods.map((method, index) => (
        <motion.div key={method.id} variants={staggerAnimations.item}>
          <Card
            isPressable
            onPress={() => onSelect(method.id)}
            className={`border-2 transition-all ${
              selected === method.id
                ? 'border-primary bg-primary/5 shadow-lg'
                : 'border-transparent hover:border-default-300'
            }`}
          >
            <CardBody className="p-4">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-default-100">
                  <Icon icon={method.icon} width={24} />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold">{method.name}</h4>
                  <p className="text-xs text-default-500">{method.description}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-success">{method.fee} fee</p>
                  <p className="text-xs text-default-500">{method.time}</p>
                </div>
                {selected === method.id && (
                  <Icon icon="solar:check-circle-bold" width={24} className="text-primary" />
                )}
              </div>
            </CardBody>
          </Card>
        </motion.div>
      ))}

      <motion.div variants={staggerAnimations.item} className="flex gap-2 pt-4">
        <Button variant="flat" onPress={onBack} className="flex-1">
          Back
        </Button>
        <Button color="primary" onPress={onNext} className="flex-1" endContent={<Icon icon="solar:arrow-right-bold" />}>
          Continue
        </Button>
      </motion.div>
    </motion.div>
  );
}

// Step 3: Payment Details
function PaymentStep({
  method,
  amount,
  onNext,
  onBack,
}: {
  method: PaymentMethod;
  amount: number;
  onNext: () => void;
  onBack: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={springs.gentle}
      className="space-y-6"
    >
      {method === 'crypto' && <CryptoPayment amount={amount} />}
      {method === 'credit_card' && <CreditCardPayment />}
      {method === 'paypal' && <PayPalPayment amount={amount} />}
      {method === 'bank_transfer' && <BankTransferPayment />}

      <div className="flex gap-2 pt-4">
        <Button variant="flat" onPress={onBack} className="flex-1">
          Back
        </Button>
        <Button color="primary" onPress={onNext} className="flex-1" endContent={<Icon icon="solar:arrow-right-bold" />}>
          Continue
        </Button>
      </div>
    </motion.div>
  );
}

// Crypto Payment UI
function CryptoPayment({ amount }: { amount: number }) {
  const address = '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa'; // Example BTC address

  return (
    <div className="space-y-4">
      <div className="rounded-lg bg-gradient-to-br from-primary/10 to-secondary/10 p-6 text-center">
        {/* QR Code Placeholder */}
        <div className="mx-auto mb-4 flex h-48 w-48 items-center justify-center rounded-lg bg-white">
          <Icon icon="solar:qr-code-bold" width={160} className="text-default-300" />
        </div>
        <p className="mb-2 text-sm text-default-600">Scan QR code or copy address</p>
        <div className="flex items-center gap-2 rounded-lg bg-background/50 p-3">
          <code className="flex-1 truncate text-xs">{address}</code>
          <Button
            size="sm"
            variant="flat"
            isIconOnly
            startContent={<Icon icon="solar:copy-bold" />}
          />
        </div>
      </div>

      <Card>
        <CardBody className="gap-2">
          <div className="flex justify-between">
            <span className="text-sm text-default-600">Amount</span>
            <span className="font-semibold">${amount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-default-600">Network</span>
            <Chip size="sm" variant="flat">Bitcoin (BTC)</Chip>
          </div>
          <div className="flex justify-between text-xs text-warning">
            <span>⚠️ Waiting for confirmation</span>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

// Credit Card Payment UI
function CreditCardPayment() {
  return (
    <div className="space-y-4">
      <Input label="Card Number" placeholder="1234 5678 9012 3456" />
      <div className="grid grid-cols-2 gap-4">
        <Input label="Expiry Date" placeholder="MM/YY" />
        <Input label="CVV" placeholder="123" type="password" />
      </div>
      <Input label="Cardholder Name" placeholder="John Doe" />
    </div>
  );
}

// PayPal Payment UI
function PayPalPayment({ amount }: { amount: number }) {
  return (
    <div className="space-y-4 text-center">
      <div className="rounded-lg bg-[#0070ba]/10 p-8">
        <Icon icon="logos:paypal" width={80} className="mx-auto mb-4" />
        <p className="mb-4 text-lg font-semibold">Continue to PayPal</p>
        <p className="text-sm text-default-600">
          You will be redirected to PayPal to complete your ${amount.toFixed(2)} deposit
        </p>
      </div>
    </div>
  );
}

// Bank Transfer UI
function BankTransferPayment() {
  return (
    <div className="space-y-4">
      <Card>
        <CardBody className="gap-2">
          <h4 className="font-semibold">Bank Details</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-default-600">Account Name</span>
              <span className="font-mono">LeetGaming Pro Inc.</span>
            </div>
            <div className="flex justify-between">
              <span className="text-default-600">Account Number</span>
              <span className="font-mono">1234567890</span>
            </div>
            <div className="flex justify-between">
              <span className="text-default-600">Routing Number</span>
              <span className="font-mono">021000021</span>
            </div>
            <div className="flex justify-between">
              <span className="text-default-600">SWIFT/BIC</span>
              <span className="font-mono">CHASUS33</span>
            </div>
          </div>
        </CardBody>
      </Card>
      <p className="text-xs text-default-500">
        Please include your user ID in the transfer reference
      </p>
    </div>
  );
}

// Step 4: Confirmation
function ConfirmationStep({
  amount,
  fee,
  total,
  method,
  isProcessing,
  error,
  onConfirm,
  onBack,
}: {
  amount: number;
  fee: number;
  total: number;
  method: PaymentMethod;
  isProcessing: boolean;
  error: string | null;
  onConfirm: () => void;
  onBack: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={springs.smooth}
      className="space-y-6"
    >
      <Card className="border-2 border-primary/20">
        <CardBody className="gap-4 p-6">
          <h3 className="text-lg font-semibold">Payment Summary</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-default-600">Amount</span>
              <span className="font-semibold">${amount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-default-600">Processing Fee</span>
              <span className="font-semibold">${fee.toFixed(2)}</span>
            </div>
            <div className="border-t border-divider pt-3">
              <div className="flex justify-between">
                <span className="text-lg font-semibold">Total</span>
                <span className="text-2xl font-bold text-primary">
                  <AnimatedCounter value={total} decimals={2} prefix="$" />
                </span>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      {error && (
        <Card className="border-2 border-danger/50 bg-danger/10">
          <CardBody className="p-4">
            <div className="flex items-center gap-3">
              <Icon icon="solar:danger-triangle-bold" className="text-danger" width={24} />
              <div>
                <p className="font-semibold text-danger">Payment Error</p>
                <p className="text-sm text-danger/80">{error}</p>
              </div>
            </div>
          </CardBody>
        </Card>
      )}

      <div className="flex gap-2">
        <Button variant="flat" onPress={onBack} className="flex-1" isDisabled={isProcessing}>
          Back
        </Button>
        <Button
          color="primary"
          size="lg"
          className="flex-1"
          onPress={onConfirm}
          isLoading={isProcessing}
          endContent={!isProcessing && <Icon icon="solar:check-circle-bold" />}
        >
          {isProcessing ? 'Processing...' : 'Confirm Deposit'}
        </Button>
      </div>
    </motion.div>
  );
}

// Step 5: Success
function SuccessStep({ amount, method }: { amount: number; method: PaymentMethod }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={springs.bouncy}
      className="py-8 text-center"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, ...springs.elastic }}
        className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-success"
      >
        <Icon icon="solar:check-circle-bold" width={48} className="text-white" />
      </motion.div>

      <h3 className="mb-2 text-2xl font-bold">Deposit Successful!</h3>
      <p className="mb-6 text-default-600">
        ${amount.toFixed(2)} has been added to your wallet
      </p>

      <Card>
        <CardBody>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-default-600">Transaction ID</span>
              <span className="font-mono">#TXN-{Date.now()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-default-600">Method</span>
              <span className="capitalize">{method.replace('_', ' ')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-default-600">Status</span>
              <Chip color="success" size="sm" variant="flat">Completed</Chip>
            </div>
          </div>
        </CardBody>
      </Card>
    </motion.div>
  );
}

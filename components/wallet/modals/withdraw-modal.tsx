/**
 * Withdraw Modal Component
 * Premium 4-step withdrawal flow with security confirmations
 */

'use client';

import React, { useState, useEffect } from 'react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Progress,
  Card,
  CardBody,
  Chip,
  Divider,
} from '@nextui-org/react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon } from '@iconify/react';
import { useReplayApi } from '@/hooks/use-replay-api';
import { AnimatedCounter } from '@/components/ui/animated-counter';
import { SuccessCelebration } from '@/components/ui/success-confetti';
import { modalAnimations, springs } from '@/lib/design/animations';
import { designTokens } from '@/lib/design/tokens';
import type { Currency } from '@/types/replay-api/wallet.types';

type WithdrawStep = 'amount' | 'destination' | 'confirmation' | 'processing' | 'success';

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  availableBalance: number;
  currency?: Currency;
}

export function WithdrawModal({
  isOpen,
  onClose,
  onSuccess,
  availableBalance,
  currency = 'USDC',
}: WithdrawModalProps) {
  const { sdk } = useReplayApi();
  const [step, setStep] = useState<WithdrawStep>('amount');
  const [amount, setAmount] = useState('');
  const [destination, setDestination] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [transactionId, setTransactionId] = useState('');

  // Reset on close
  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setStep('amount');
        setAmount('');
        setDestination('');
        setError('');
        setTransactionId('');
      }, 300);
    }
  }, [isOpen]);

  const progress = {
    amount: 25,
    destination: 50,
    confirmation: 75,
    processing: 90,
    success: 100,
  }[step];

  const amountValue = parseFloat(amount) || 0;
  const fee = amountValue * 0.02; // 2% withdrawal fee
  const netAmount = amountValue - fee;

  const validateAmount = () => {
    if (amountValue <= 0) {
      setError('Amount must be greater than 0');
      return false;
    }
    if (amountValue > availableBalance) {
      setError('Insufficient balance');
      return false;
    }
    if (amountValue < 10) {
      setError('Minimum withdrawal is $10');
      return false;
    }
    setError('');
    return true;
  };

  const validateDestination = () => {
    if (!destination.trim()) {
      setError('Destination address is required');
      return false;
    }
    // Basic EVM address validation
    if (!/^0x[a-fA-F0-9]{40}$/.test(destination.trim())) {
      setError('Invalid EVM address format');
      return false;
    }
    setError('');
    return true;
  };

  const handleAmountNext = () => {
    if (validateAmount()) {
      setStep('destination');
    }
  };

  const handleDestinationNext = () => {
    if (validateDestination()) {
      setStep('confirmation');
    }
  };

  const handleWithdraw = async () => {
    setIsProcessing(true);
    setStep('processing');
    setError('');

    try {
      const result = await sdk.wallet.withdraw({
        currency,
        amount: amountValue,
        destination_address: destination.trim(),
        metadata: {
          net_amount: netAmount,
          fee: fee,
        },
      });

      if (result) {
        setTransactionId(result.id);
        setStep('success');
        onSuccess?.();
      } else {
        throw new Error('Withdrawal request failed');
      }
    } catch (err) {
      console.error('Withdrawal error:', err);
      setError(err instanceof Error ? err.message : 'Withdrawal failed. Please try again.');
      setStep('confirmation');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    if (step === 'success') {
      onClose();
    } else if (!isProcessing) {
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size="2xl"
      placement="center"
      classNames={{
        base: 'bg-background',
        backdrop: 'bg-black/80 backdrop-blur-sm',
      }}
      motionProps={{
        variants: modalAnimations.center,
      }}
      isDismissable={!isProcessing}
      hideCloseButton={isProcessing}
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-2 pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-warning-100 p-2 dark:bg-warning-900/30">
                <Icon icon="solar:alt-arrow-right-bold" className="h-5 w-5 text-warning-600 dark:text-warning-400" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">Withdraw Funds</h2>
                <p className="text-sm text-default-500">
                  Transfer funds to your external wallet
                </p>
              </div>
            </div>
          </div>
          <Progress
            value={progress}
            color="warning"
            className="mt-2"
            classNames={{
              indicator: 'transition-all duration-500 ease-out',
            }}
          />
        </ModalHeader>

        <ModalBody className="gap-4 py-4">
          <AnimatePresence mode="wait">
            {step === 'amount' && (
              <AmountStep
                key="amount"
                amount={amount}
                setAmount={setAmount}
                availableBalance={availableBalance}
                currency={currency}
                error={error}
                fee={fee}
                netAmount={netAmount}
              />
            )}

            {step === 'destination' && (
              <DestinationStep
                key="destination"
                destination={destination}
                setDestination={setDestination}
                error={error}
              />
            )}

            {step === 'confirmation' && (
              <ConfirmationStep
                key="confirmation"
                amount={amountValue}
                destination={destination}
                currency={currency}
                fee={fee}
                netAmount={netAmount}
                error={error}
              />
            )}

            {step === 'processing' && (
              <ProcessingStep key="processing" />
            )}

            {step === 'success' && (
              <SuccessStep
                key="success"
                amount={netAmount}
                currency={currency}
                transactionId={transactionId}
              />
            )}
          </AnimatePresence>
        </ModalBody>

        <ModalFooter className="pt-2">
          {step === 'amount' && (
            <>
              <Button variant="light" onPress={handleClose}>
                Cancel
              </Button>
              <Button
                color="warning"
                onPress={handleAmountNext}
                startContent={<Icon icon="solar:alt-arrow-right-bold" className="h-4 w-4" />}
              >
                Continue
              </Button>
            </>
          )}

          {step === 'destination' && (
            <>
              <Button variant="light" onPress={() => setStep('amount')}>
                Back
              </Button>
              <Button
                color="warning"
                onPress={handleDestinationNext}
                startContent={<Icon icon="solar:shield-keyhole-bold" className="h-4 w-4" />}
              >
                Review Withdrawal
              </Button>
            </>
          )}

          {step === 'confirmation' && (
            <>
              <Button variant="light" onPress={() => setStep('destination')} isDisabled={isProcessing}>
                Back
              </Button>
              <Button
                color="warning"
                onPress={handleWithdraw}
                isLoading={isProcessing}
                startContent={!isProcessing ? <Icon icon="solar:check-circle-bold" className="h-4 w-4" /> : null}
              >
                {isProcessing ? 'Processing...' : 'Confirm Withdrawal'}
              </Button>
            </>
          )}

          {step === 'success' && (
            <Button color="success" onPress={handleClose} className="w-full">
              Done
            </Button>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

// Amount Step
function AmountStep({
  amount,
  setAmount,
  availableBalance,
  currency,
  error,
  fee,
  netAmount,
}: {
  amount: string;
  setAmount: (v: string) => void;
  availableBalance: number;
  currency: Currency;
  error: string;
  fee: number;
  netAmount: number;
}) {
  const quickAmounts = [25, 50, 100, 250];

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={springs.gentle}
      className="space-y-4"
    >
      {/* Available Balance */}
      <Card className="bg-warning-50 dark:bg-warning-900/20">
        <CardBody className="flex-row items-center justify-between py-3">
          <div className="flex items-center gap-2">
            <Icon icon="solar:wallet-bold-duotone" className="h-4 w-4 text-warning-600 dark:text-warning-400" />
            <span className="text-sm text-warning-700 dark:text-warning-300">
              Available Balance
            </span>
          </div>
          <div className="font-semibold text-warning-700 dark:text-warning-300">
            <AnimatedCounter value={availableBalance} prefix="$" decimals={2} />
          </div>
        </CardBody>
      </Card>

      {/* Amount Input */}
      <Input
        type="number"
        label="Withdrawal Amount"
        placeholder="0.00"
        value={amount}
        onValueChange={setAmount}
        startContent={<span className="text-default-500">$</span>}
        endContent={<span className="text-default-500">{currency}</span>}
        isInvalid={!!error}
        errorMessage={error}
        classNames={{
          input: 'text-2xl font-semibold',
          inputWrapper: 'h-14',
        }}
        autoFocus
      />

      {/* Quick Amounts */}
      <div className="grid grid-cols-4 gap-2">
        {quickAmounts.map((quickAmount) => (
          <Button
            key={quickAmount}
            size="sm"
            variant={amount === quickAmount.toString() ? 'solid' : 'bordered'}
            color="warning"
            onPress={() => setAmount(quickAmount.toString())}
            isDisabled={quickAmount > availableBalance}
          >
            ${quickAmount}
          </Button>
        ))}
      </div>

      {/* Fee Breakdown */}
      {parseFloat(amount) > 0 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="space-y-2 rounded-lg bg-default-100 p-3 dark:bg-default-50"
        >
          <div className="flex items-center justify-between text-sm">
            <span className="text-default-600">Withdrawal Amount</span>
            <span className="font-medium">${parseFloat(amount).toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-default-600">Network Fee (2%)</span>
            <span className="font-medium text-warning-600">-${fee.toFixed(2)}</span>
          </div>
          <Divider />
          <div className="flex items-center justify-between text-sm font-semibold">
            <span>You Will Receive</span>
            <span className="text-lg text-success-600">${netAmount.toFixed(2)}</span>
          </div>
        </motion.div>
      )}

      {/* Info */}
      <Card className="border-l-4 border-warning-500 bg-warning-50/50 dark:bg-warning-900/10">
        <CardBody className="gap-2 py-3">
          <div className="flex items-start gap-2">
            <Icon icon="solar:info-circle-bold" className="mt-0.5 h-4 w-4 flex-shrink-0 text-warning-600" />
            <div className="space-y-1 text-xs text-warning-700 dark:text-warning-400">
              <p>• Minimum withdrawal: $10</p>
              <p>• Processing time: 1-3 business days</p>
              <p>• Network fee: 2% of withdrawal amount</p>
            </div>
          </div>
        </CardBody>
      </Card>
    </motion.div>
  );
}

// Destination Step
function DestinationStep({
  destination,
  setDestination,
  error,
}: {
  destination: string;
  setDestination: (v: string) => void;
  error: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={springs.gentle}
      className="space-y-4"
    >
      {/* Security Notice */}
      <Card className="border-l-4 border-warning-500 bg-warning-50 dark:bg-warning-900/20">
        <CardBody className="gap-2 py-3">
          <div className="flex items-start gap-2">
            <Icon icon="solar:shield-keyhole-bold" className="mt-0.5 h-5 w-5 flex-shrink-0 text-warning-600" />
            <div className="space-y-1">
              <p className="font-semibold text-warning-700 dark:text-warning-300">
                Security Reminder
              </p>
              <p className="text-sm text-warning-600 dark:text-warning-400">
                Double-check the destination address. Cryptocurrency transactions are irreversible.
              </p>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Destination Address */}
      <Input
        label="Destination Wallet Address"
        placeholder="0x..."
        value={destination}
        onValueChange={setDestination}
        description="Enter your EVM-compatible wallet address (Polygon network)"
        isInvalid={!!error}
        errorMessage={error}
        classNames={{
          input: 'font-mono text-sm',
        }}
        autoFocus
      />

      {/* Network Info */}
      <Card className="bg-default-50 dark:bg-default-100">
        <CardBody className="gap-3 py-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-default-600">Network</span>
            <Chip size="sm" variant="flat" color="secondary">
              Polygon (MATIC)
            </Chip>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-default-600">Token Standard</span>
            <span className="text-sm font-medium">ERC-20</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-default-600">Estimated Time</span>
            <div className="flex items-center gap-1 text-sm font-medium">
              <Icon icon="solar:clock-circle-bold" className="h-3 w-3" />
              1-3 days
            </div>
          </div>
        </CardBody>
      </Card>
    </motion.div>
  );
}

// Confirmation Step
function ConfirmationStep({
  amount,
  destination,
  currency,
  fee,
  netAmount,
  error,
}: {
  amount: number;
  destination: string;
  currency: Currency;
  fee: number;
  netAmount: number;
  error: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={springs.gentle}
      className="space-y-4"
    >
      {/* Error Display */}
      {error && (
        <Card className="border-l-4 border-danger-500 bg-danger-50 dark:bg-danger-900/20">
          <CardBody className="gap-2 py-3">
            <div className="flex items-start gap-2">
              <Icon icon="solar:danger-circle-bold" className="mt-0.5 h-5 w-5 flex-shrink-0 text-danger-600" />
              <p className="text-sm text-danger-600 dark:text-danger-400">{error}</p>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Review Details */}
      <Card>
        <CardBody className="gap-4 p-4">
          <div className="space-y-3">
            <div>
              <p className="text-xs text-default-500">Withdrawal Amount</p>
              <p className="text-2xl font-bold">
                ${amount.toFixed(2)} <span className="text-base text-default-500">{currency}</span>
              </p>
            </div>

            <Divider />

            <div>
              <p className="text-xs text-default-500">Destination Address</p>
              <p className="break-all font-mono text-sm font-medium">{destination}</p>
            </div>

            <Divider />

            <div className="space-y-2 rounded-lg bg-default-100 p-3 dark:bg-default-50">
              <div className="flex justify-between text-sm">
                <span className="text-default-600">Amount</span>
                <span className="font-medium">${amount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-default-600">Network Fee</span>
                <span className="font-medium text-warning-600">-${fee.toFixed(2)}</span>
              </div>
              <Divider />
              <div className="flex justify-between font-semibold">
                <span>Total to Receive</span>
                <span className="text-lg text-success-600">${netAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Final Warning */}
      <Card className="border-l-4 border-danger-500 bg-danger-50 dark:bg-danger-900/20">
        <CardBody className="gap-2 py-3">
          <div className="flex items-start gap-2">
            <Icon icon="solar:danger-circle-bold" className="mt-0.5 h-5 w-5 flex-shrink-0 text-danger-600" />
            <div className="space-y-1">
              <p className="font-semibold text-danger-700 dark:text-danger-300">
                Final Confirmation
              </p>
              <p className="text-sm text-danger-600 dark:text-danger-400">
                This action cannot be undone. Verify all details before proceeding.
              </p>
            </div>
          </div>
        </CardBody>
      </Card>
    </motion.div>
  );
}

// Processing Step
function ProcessingStep() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={springs.gentle}
      className="flex flex-col items-center justify-center gap-4 py-12"
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        className="rounded-full bg-warning-100 p-4 dark:bg-warning-900/30"
      >
        <Icon icon="solar:alt-arrow-right-bold" className="h-8 w-8 text-warning-600 dark:text-warning-400" />
      </motion.div>
      <div className="text-center">
        <h3 className="text-xl font-semibold">Processing Withdrawal</h3>
        <p className="text-sm text-default-500">Please wait while we process your request...</p>
      </div>
    </motion.div>
  );
}

// Success Step
function SuccessStep({
  amount,
  currency,
  transactionId,
}: {
  amount: number;
  currency: Currency;
  transactionId: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={springs.gentle}
      className="space-y-6 py-8"
    >
      <SuccessCelebration
        show={true}
        message="Withdrawal Initiated!"
        onComplete={() => {}}
      />

      <div className="text-center">
        <h3 className="text-2xl font-bold">Withdrawal Initiated!</h3>
        <p className="mt-2 text-default-600">
          Your withdrawal of{' '}
          <span className="font-semibold text-success-600">
            ${amount.toFixed(2)} {currency}
          </span>{' '}
          is being processed
        </p>
      </div>

      <Card>
        <CardBody className="gap-3 p-4">
          <div>
            <p className="text-xs text-default-500">Transaction ID</p>
            <p className="break-all font-mono text-sm font-medium">{transactionId}</p>
          </div>
          <Divider />
          <div className="flex items-start gap-2 text-sm text-default-600">
            <Icon icon="solar:clock-circle-bold" className="mt-0.5 h-4 w-4 flex-shrink-0" />
            <p>Expected arrival: 1-3 business days</p>
          </div>
        </CardBody>
      </Card>
    </motion.div>
  );
}

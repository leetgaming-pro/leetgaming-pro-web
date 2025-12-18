/**
 * Deposit Success Modal Component
 * Post-deposit confirmation with transaction details
 * Per PRD D.6 - DepositSuccessModal (P2)
 */

"use client";

import React from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Divider,
} from "@nextui-org/react";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";

// ============================================================================
// Types
// ============================================================================

export interface DepositDetails {
  transactionId: string;
  amount: number;
  fee: number;
  netAmount: number;
  currency: string;
  method: "card" | "paypal" | "crypto" | "pix" | "bank";
  timestamp: Date;
  bonusAmount?: number;
  bonusDescription?: string;
}

interface DepositSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  deposit: DepositDetails;
  onViewWallet?: () => void;
  onMakeAnotherDeposit?: () => void;
  showConfetti?: boolean;
}

// ============================================================================
// Constants
// ============================================================================

const METHOD_LABELS: Record<string, { label: string; icon: string }> = {
  card: { label: "Credit/Debit Card", icon: "solar:card-bold-duotone" },
  paypal: { label: "PayPal", icon: "logos:paypal" },
  crypto: { label: "Cryptocurrency", icon: "cryptocurrency:eth" },
  pix: { label: "PIX", icon: "arcticons:pix" },
  bank: { label: "Bank Transfer", icon: "solar:bank-bold-duotone" },
};

// ============================================================================
// Component
// ============================================================================

export function DepositSuccessModal({
  isOpen,
  onClose,
  deposit,
  onViewWallet,
  onMakeAnotherDeposit,
  showConfetti = true,
}: DepositSuccessModalProps) {
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: deposit.currency,
      minimumFractionDigits: 2,
    }).format(value);
  };

  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(date);
  };

  const methodInfo = METHOD_LABELS[deposit.method] || METHOD_LABELS.card;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="md"
      classNames={{
        backdrop: "bg-black/50 backdrop-blur-sm",
      }}
    >
      <ModalContent>
        {(onCloseModal) => (
          <>
            {/* Celebration animation (simple confetti-like effect) */}
            {showConfetti && isOpen && (
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {[...Array(20)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-2 h-2 rounded-full"
                    style={{
                      left: `${Math.random() * 100}%`,
                      backgroundColor: [
                        "#22c55e",
                        "#eab308",
                        "#3b82f6",
                        "#ec4899",
                        "#8b5cf6",
                      ][i % 5],
                    }}
                    initial={{ top: "-10%", opacity: 1 }}
                    animate={{
                      top: "110%",
                      opacity: 0,
                      rotate: Math.random() * 360,
                    }}
                    transition={{
                      duration: 2 + Math.random(),
                      delay: Math.random() * 0.5,
                      ease: "easeOut",
                    }}
                  />
                ))}
              </div>
            )}

            <ModalHeader className="flex flex-col items-center pt-8 pb-0">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", duration: 0.5 }}
                className="w-20 h-20 rounded-full bg-success/20 flex items-center justify-center mb-4"
              >
                <Icon
                  icon="solar:check-circle-bold"
                  className="w-10 h-10 text-success"
                />
              </motion.div>
              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-2xl font-bold text-center"
              >
                Deposit Successful!
              </motion.h2>
            </ModalHeader>

            <ModalBody className="py-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="space-y-4"
              >
                {/* Amount display */}
                <div className="text-center py-4 bg-success/10 rounded-xl">
                  <p className="text-sm text-default-500 mb-1">Amount Added</p>
                  <p className="text-4xl font-bold text-success">
                    {formatCurrency(deposit.netAmount)}
                  </p>
                  {deposit.bonusAmount && deposit.bonusAmount > 0 && (
                    <div className="mt-2 flex items-center justify-center gap-1 text-warning">
                      <Icon icon="solar:gift-bold" className="w-4 h-4" />
                      <span className="text-sm font-medium">
                        +{formatCurrency(deposit.bonusAmount)} Bonus
                      </span>
                    </div>
                  )}
                </div>

                {/* Transaction details */}
                <div className="bg-default-100 rounded-lg p-4 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-default-500">Transaction ID</span>
                    <span className="font-mono text-xs">
                      {deposit.transactionId}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-default-500">Payment Method</span>
                    <div className="flex items-center gap-2">
                      <Icon icon={methodInfo.icon} className="w-4 h-4" />
                      <span>{methodInfo.label}</span>
                    </div>
                  </div>
                  <Divider />
                  <div className="flex justify-between text-sm">
                    <span className="text-default-500">Deposit Amount</span>
                    <span>{formatCurrency(deposit.amount)}</span>
                  </div>
                  {deposit.fee > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-default-500">Processing Fee</span>
                      <span className="text-warning">
                        -{formatCurrency(deposit.fee)}
                      </span>
                    </div>
                  )}
                  {deposit.bonusAmount && deposit.bonusAmount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-default-500">Bonus</span>
                      <span className="text-success">
                        +{formatCurrency(deposit.bonusAmount)}
                      </span>
                    </div>
                  )}
                  <Divider />
                  <div className="flex justify-between font-semibold">
                    <span>Total Added</span>
                    <span className="text-success">
                      {formatCurrency(
                        deposit.netAmount + (deposit.bonusAmount || 0)
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-default-400">
                    <span>Date</span>
                    <span>{formatDate(deposit.timestamp)}</span>
                  </div>
                </div>

                {/* Bonus description */}
                {deposit.bonusDescription && (
                  <div className="flex items-start gap-2 bg-warning/10 rounded-lg p-3">
                    <Icon
                      icon="solar:gift-bold"
                      className="w-5 h-5 text-warning flex-shrink-0 mt-0.5"
                    />
                    <p className="text-sm text-warning-700 dark:text-warning-400">
                      {deposit.bonusDescription}
                    </p>
                  </div>
                )}
              </motion.div>
            </ModalBody>

            <ModalFooter className="flex-col gap-2 pb-6">
              <Button
                color="success"
                fullWidth
                size="lg"
                onClick={() => {
                  onViewWallet?.();
                  onCloseModal();
                }}
              >
                View Wallet
              </Button>
              <Button
                variant="flat"
                fullWidth
                onClick={() => {
                  onMakeAnotherDeposit?.();
                  onCloseModal();
                }}
              >
                Make Another Deposit
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}

export default DepositSuccessModal;
